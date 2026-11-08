/**
 * lz-work-bootstrap 插件入口。
 *
 * 注册单个命令 `lz-work`，含子命令 plan / install / sync-skills / resume / verify。
 * 本插件是薄编排层：解析清单 → 构建计划 → 调度 dsh-market / dsh-skills-console →
 * 维护状态机与墓碑。不自行下载、不写明文密钥、不自动执行手动项与预编译二进制项。
 *
 * 宿主能力优先取自 ctx（ctx.plugins / ctx.skills / ctx.get）；若运行时未提供，
 * 降级为基于文件系统的尽力探测，并提示真实运行时应注入准确适配器。
 */
import { promises as fs } from 'fs';
import * as os from 'os';
import * as path from 'path';

import { DEFAULT_PROFILE, DEFAULT_STATE_PATH } from './config';
import {
  parsePluginsManifest,
  parseSkillsManifest,
  ManifestError,
} from './manifest';
import { buildPlan, LocalProbe } from './plan';
import {
  FsStateIO,
  loadState,
  saveState,
  StateManager,
} from './state';
import {
  DshHost,
  executeInstall,
  executeResume,
  executeSyncSkills,
} from './executor';
import { verifyAll } from './verify';
import { formatInstallSummary, formatPlanTable } from './ui';
import {
  ExitCode,
  ParsedArgs,
  PluginEntry,
  PlanItem,
} from './types';

const SUBCOMMANDS = [
  'plan',
  'install',
  'sync-skills',
  'resume',
  'verify',
] as const;

/** 命令行用法错误。 */
export class UsageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UsageError';
  }
}

/**
 * DSH 宿主上下文。字段尽量可选，以兼容不同运行时形态：
 *  - ctx.get(name)：Cordis 风格软依赖服务查找。
 *  - ctx.plugins / ctx.skills：若运行时直接提供能力，优先使用。
 */
export interface DshContext {
  get<T = unknown>(name: string): T | undefined;
  commands: {
    register(
      name: string,
      handler: (argv: string[]) => void | Promise<void>,
    ): void;
  };
  log?: (msg: string) => void;
  plugins?: {
    isInstalled?(id: string): Promise<boolean> | boolean;
    getInstalledVersion?(
      id: string,
    ): Promise<string | undefined> | string | undefined;
    installViaMarket?(
      id: string,
      opts?: { version?: string; config?: Record<string, unknown> },
    ): Promise<{ version?: string } | void>;
    updateViaMarket?(
      id: string,
      opts?: { version?: string; config?: Record<string, unknown> },
    ): Promise<{ version?: string } | void>;
  };
  skills?: {
    syncViaSkillsConsole?(skill: unknown): Promise<void>;
  };
}

/** 解析命令行参数。 */
export function parseArgs(argv: string[]): ParsedArgs {
  if (argv.length === 0) {
    throw new UsageError(
      '用法：lz-work <plan|install|sync-skills|resume|verify> [选项]',
    );
  }
  const subcommand = argv[0] as ParsedArgs['subcommand'];
  if (!SUBCOMMANDS.includes(subcommand)) {
    throw new UsageError(`未知子命令：${subcommand}（允许：${SUBCOMMANDS.join(', ')}）`);
  }

  const args: ParsedArgs = {
    subcommand,
    profile: undefined,
    continueOnError: false,
  };

  for (let i = 1; i < argv.length; i++) {
    const a = argv[i];
    const next = (): string => {
      const v = argv[++i];
      if (v === undefined) throw new UsageError(`${a} 需要一个值`);
      return v;
    };
    if (a === '--plugins') args.plugins = next();
    else if (a === '--skills') args.skills = next();
    else if (a === '--profile') args.profile = next();
    else if (a === '--continue-on-error') args.continueOnError = true;
    else if (a.startsWith('--plugins=')) args.plugins = a.slice('--plugins='.length);
    else if (a.startsWith('--skills=')) args.skills = a.slice('--skills='.length);
    else if (a.startsWith('--profile=')) args.profile = a.slice('--profile='.length);
    else throw new UsageError(`未知参数：${a}`);
  }

  return args;
}

/** 默认插件目录（尽力探测用；真实运行时应注入准确适配器）。 */
function defaultPluginsRoot(): string {
  if (process.env.DSH_PLUGINS_DIR) return process.env.DSH_PLUGINS_DIR;
  const home = process.env.DSH_HOME ?? path.join(os.homedir(), '.dsh');
  return path.join(home, 'plugins');
}

/** 基于文件系统的本地存在性探测（尽力）。 */
function fsProbe(): LocalProbe & {
  getInstalledVersion(id: string): Promise<string | undefined>;
} {
  const root = defaultPluginsRoot();
  return {
    async isInstalled(id: string): Promise<boolean> {
      try {
        await fs.access(path.join(root, id));
        return true;
      } catch {
        return false;
      }
    },
    async getInstalledVersion(id: string): Promise<string | undefined> {
      for (const f of ['plugin.json', 'package.json']) {
        try {
          const raw = await fs.readFile(path.join(root, id, f), 'utf8');
          const obj = JSON.parse(raw) as { version?: string };
          if (typeof obj.version === 'string') return obj.version;
        } catch {
          // continue
        }
      }
      return undefined;
    },
  };
}

/** 把 ctx 提供的能力 + 文件系统探测组装为 DshHost。 */
export function buildHost(ctx: DshContext, cwd: string): DshHost {
  const probe = fsProbe();
  const log = ctx.log ?? ((m: string) => console.log(m));

  const isInstalled = async (id: string): Promise<boolean> => {
    if (ctx.plugins?.isInstalled) {
      return await Promise.resolve(ctx.plugins.isInstalled(id));
    }
    return probe.isInstalled(id);
  };
  const getInstalledVersion = async (
    id: string,
  ): Promise<string | undefined> => {
    if (ctx.plugins?.getInstalledVersion) {
      return await Promise.resolve(ctx.plugins.getInstalledVersion(id));
    }
    return probe.getInstalledVersion(id);
  };

  // dsh-market：优先 ctx.plugins.installViaMarket，其次 ctx.get('dsh-market')
  const ctxPlugins = ctx.plugins;
  const marketSvc = ctx.get<Record<string, unknown>>('dsh-market');
  const installFn =
    (ctxPlugins?.installViaMarket as unknown) ??
    ((marketSvc as { install?: unknown })?.install as unknown);
  const updateFn =
    (ctxPlugins?.updateViaMarket as unknown) ??
    ((marketSvc as { update?: unknown })?.update as unknown) ??
    installFn;

  const market = {
    available: typeof installFn === 'function',
    async install(id: string, opts?: { version?: string; config?: Record<string, unknown> }) {
      const r = await (installFn as (x: string, o?: unknown) => Promise<unknown>)(id, opts);
      return (r as { version?: string }) ?? {};
    },
    async update(id: string, opts?: { version?: string; config?: Record<string, unknown> }) {
      const fn = (updateFn ?? installFn) as (x: string, o?: unknown) => Promise<unknown>;
      const r = await fn(id, opts);
      return (r as { version?: string }) ?? {};
    },
  };

  // dsh-skills-console：优先 ctx.skills.syncViaSkillsConsole，其次 ctx.get
  const ctxSkills = ctx.skills;
  const skillSvc = ctx.get<Record<string, unknown>>('dsh-skills-console');
  const syncFn =
    (ctxSkills?.syncViaSkillsConsole as unknown) ??
    ((skillSvc as { sync?: unknown })?.sync as unknown);

  const skillsConsole = {
    available: typeof syncFn === 'function',
    async sync(skill: unknown) {
      await (syncFn as (s: unknown) => Promise<void>)(skill);
    },
  };

  // 预检：通过 ctx.get(name) 查找预检服务
  const precheck = {
    async run(name: string, pluginId: string): Promise<boolean> {
      const svc = ctx.get<Record<string, unknown>>(name);
      if (!svc) {
        throw new Error(`预检服务 ${name} 不可用`);
      }
      if (typeof svc.check === 'function') {
        return Boolean(await Promise.resolve((svc.check as (x: string) => unknown)(pluginId)));
      }
      if (typeof svc.run === 'function') {
        return Boolean(await Promise.resolve((svc.run as (x: string) => unknown)(pluginId)));
      }
      throw new Error(`预检服务 ${name} 未提供 check/run 方法`);
    },
  };

  return {
    ui: {
      print: (t: string) => log(t),
      info: (t: string) => log(t),
      warn: (t: string) => log(t),
    },
    fs: {
      async readFile(p: string): Promise<string> {
        const abs = path.isAbsolute(p) ? p : path.join(cwd, p);
        return fs.readFile(abs, 'utf8');
      },
      async writeFile(p: string, content: string): Promise<void> {
        const abs = path.isAbsolute(p) ? p : path.join(cwd, p);
        await fs.mkdir(path.dirname(abs), { recursive: true });
        await fs.writeFile(abs, content, 'utf8');
      },
      async exists(p: string): Promise<boolean> {
        const abs = path.isAbsolute(p) ? p : path.join(cwd, p);
        try {
          await fs.access(abs);
          return true;
        } catch {
          return false;
        }
      },
    },
    plugins: { isInstalled, getInstalledVersion },
    market,
    skillsConsole,
    precheck,
  };
}

/** 读取并解析 plugins.md。 */
async function readPlugins(
  host: DshHost,
  file: string,
): Promise<ReturnType<typeof parsePluginsManifest>> {
  const md = await host.fs.readFile(file);
  return parsePluginsManifest(md);
}

/** 读取并解析 skills.md。 */
async function readSkills(
  host: DshHost,
  file: string,
): Promise<ReturnType<typeof parseSkillsManifest>> {
  const md = await host.fs.readFile(file);
  return parseSkillsManifest(md);
}

/** 退出码信号：优先设置 process.exitCode。 */
function signalExit(code: number): void {
  if (typeof process !== 'undefined' && process && 'exitCode' in process) {
    process.exitCode = code;
  }
}

/** 注册命令并分发子命令。 */
export function activate(ctx: DshContext): void {
  ctx.commands.register('lz-work', async (argv: string[]) => {
    let args: ParsedArgs;
    try {
      args = parseArgs(argv);
    } catch (e) {
      ctx.log?.((e as Error).message);
      signalExit(ExitCode.PartialFailure);
      return;
    }

    const cwd = process.cwd();
    const host = buildHost(ctx, cwd);
    const profile = args.profile ?? DEFAULT_PROFILE;
    const stateIO = new FsStateIO(
      path.isAbsolute(DEFAULT_STATE_PATH)
        ? DEFAULT_STATE_PATH
        : path.join(cwd, DEFAULT_STATE_PATH),
    );

    try {
      switch (args.subcommand) {
        case 'plan':
          await runPlan(host, stateIO, profile, args);
          signalExit(ExitCode.Ok);
          break;
        case 'install':
          await runInstall(host, stateIO, profile, args);
          break;
        case 'sync-skills':
          await runSyncSkills(host, stateIO, profile, args);
          break;
        case 'resume':
          await runResume(host, stateIO, profile, args);
          break;
        case 'verify':
          await runVerify(host, stateIO, profile);
          break;
      }
    } catch (e) {
      const msg = e instanceof ManifestError || e instanceof UsageError
        ? (e as Error).message
        : `执行失败：${(e as Error).message}`;
      host.ui.warn(msg);
      signalExit(ExitCode.PartialFailure);
    }
  });
}

async function runPlan(
  host: DshHost,
  stateIO: FsStateIO,
  profile: string,
  args: ParsedArgs,
): Promise<void> {
  const pluginsFile = args.plugins ?? 'plugins.md';
  const plugins = await readPlugins(host, pluginsFile);
  let skills;
  if (args.skills) {
    skills = await readSkills(host, args.skills);
  } else {
    // 尝试默认 skills.md，不存在则忽略
    if (await host.fs.exists('skills.md')) {
      skills = await readSkills(host, 'skills.md');
    }
  }

  const mgr = await loadState(stateIO, profile);
  const items = await buildPlan(mgr, { plugins, skills, profile }, host.plugins);

  host.ui.print(formatPlanTable(items));
  // plan 不写状态（验收 #1）
}

async function runInstall(
  host: DshHost,
  stateIO: FsStateIO,
  profile: string,
  args: ParsedArgs,
): Promise<void> {
  const pluginsFile = args.plugins ?? 'plugins.md';
  const plugins = await readPlugins(host, pluginsFile);
  let skills;
  if (args.skills) {
    skills = await readSkills(host, args.skills);
  } else if (await host.fs.exists('skills.md')) {
    skills = await readSkills(host, 'skills.md');
  }

  const mgr = await loadState(stateIO, profile);
  const items = await buildPlan(mgr, { plugins, skills, profile }, host.plugins);

  host.ui.print('安装计划：');
  host.ui.print(formatPlanTable(items));
  host.ui.print('');

  const result = await executeInstall(host, mgr, items, !!args.continueOnError);
  await saveState(mgr, stateIO);

  host.ui.print(formatInstallSummary(result));
  signalExit(result.exitCode);
}

async function runSyncSkills(
  host: DshHost,
  stateIO: FsStateIO,
  profile: string,
  args: ParsedArgs,
): Promise<void> {
  const skillsFile = args.skills ?? 'skills.md';
  const manifest = await readSkills(host, skillsFile);
  const mgr = await loadState(stateIO, profile);
  const fallback = path.join(path.dirname(DEFAULT_STATE_PATH), 'skills-console-manifest.json');
  const code = await executeSyncSkills(host, mgr, manifest, fallback);
  await saveState(mgr, stateIO);
  signalExit(code);
}

async function runResume(
  host: DshHost,
  stateIO: FsStateIO,
  profile: string,
  args: ParsedArgs,
): Promise<void> {
  const mgr = await loadState(stateIO, profile);

  // 重建 entries：优先读 plugins.md；读不到则用最小 entry
  const entries = new Map<string, PluginEntry>();
  try {
    const pluginsFile = args.plugins ?? 'plugins.md';
    const plugins = await readPlugins(host, pluginsFile);
    for (const p of plugins.plugins) entries.set(p.id, p);
  } catch {
    host.ui.warn('未读取到 plugins.md，将以最小信息重试 failed 项（无预检/配置）。');
  }

  // failed 项若无对应 entry，补一个最小 entry
  for (const { id } of mgr.getFailedPlugins()) {
    if (!entries.has(id)) entries.set(id, { id, source: 'market' });
  }

  const result = await executeResume(host, mgr, entries, !!args.continueOnError);
  await saveState(mgr, stateIO);
  host.ui.print(formatInstallSummary(result));
  signalExit(result.exitCode);
}

async function runVerify(
  host: DshHost,
  stateIO: FsStateIO,
  profile: string,
): Promise<void> {
  const mgr = await loadState(stateIO, profile);
  const report = await verifyAll(host, mgr);
  for (const line of report.lines) host.ui.print(line);
  signalExit(report.healthy ? ExitCode.Ok : ExitCode.PartialFailure);
}

export default activate;
