"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = exports.inject = exports.name = exports.UsageError = void 0;
exports.parseArgs = parseArgs;
exports.buildHost = buildHost;
exports.apply = apply;
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
const fs_1 = require("fs");
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const readline = __importStar(require("readline"));
const config_1 = require("./config");
const manifest_1 = require("./manifest");
const plan_1 = require("./plan");
const state_1 = require("./state");
const executor_1 = require("./executor");
const verify_1 = require("./verify");
const ui_1 = require("./ui");
const types_1 = require("./types");
const SUBCOMMANDS = [
    'plan',
    'install',
    'sync-skills',
    'resume',
    'verify',
];
/** 命令行用法错误。 */
class UsageError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UsageError';
    }
}
exports.UsageError = UsageError;
/** 解析命令行参数。 */
function parseArgs(argv) {
    if (argv.length === 0) {
        throw new UsageError('用法：lz-work <plan|install|sync-skills|resume|verify> [选项]');
    }
    const subcommand = argv[0];
    if (!SUBCOMMANDS.includes(subcommand)) {
        throw new UsageError(`未知子命令：${subcommand}（允许：${SUBCOMMANDS.join(', ')}）`);
    }
    const args = {
        subcommand,
        profile: undefined,
        continueOnError: false,
    };
    for (let i = 1; i < argv.length; i++) {
        const a = argv[i];
        const next = () => {
            const v = argv[++i];
            if (v === undefined)
                throw new UsageError(`${a} 需要一个值`);
            return v;
        };
        if (a === '--plugins')
            args.plugins = next();
        else if (a === '--skills')
            args.skills = next();
        else if (a === '--profile')
            args.profile = next();
        else if (a === '--continue-on-error')
            args.continueOnError = true;
        else if (a.startsWith('--plugins='))
            args.plugins = a.slice('--plugins='.length);
        else if (a.startsWith('--skills='))
            args.skills = a.slice('--skills='.length);
        else if (a.startsWith('--profile='))
            args.profile = a.slice('--profile='.length);
        else
            throw new UsageError(`未知参数：${a}`);
    }
    return args;
}
/** 默认插件目录（尽力探测用；真实运行时应注入准确适配器）。 */
function defaultPluginsRoot() {
    if (process.env.DSH_PLUGINS_DIR)
        return process.env.DSH_PLUGINS_DIR;
    const home = process.env.DSH_HOME ?? path.join(os.homedir(), '.dsh');
    return path.join(home, 'plugins');
}
/** 基于文件系统的本地存在性探测（尽力）。 */
function fsProbe() {
    const root = defaultPluginsRoot();
    return {
        async isInstalled(id) {
            try {
                await fs_1.promises.access(path.join(root, id));
                return true;
            }
            catch {
                return false;
            }
        },
        async getInstalledVersion(id) {
            for (const f of ['plugin.json', 'package.json']) {
                try {
                    const raw = await fs_1.promises.readFile(path.join(root, id, f), 'utf8');
                    const obj = JSON.parse(raw);
                    if (typeof obj.version === 'string')
                        return obj.version;
                }
                catch {
                    // continue
                }
            }
            return undefined;
        },
    };
}
/**
 * 默认交互式询问：stdin 为 TTY 时用 readline 读取一行；否则返回 undefined。
 * 真实运行时应通过 ctx.ui.prompt 注入更合适的实现。
 */
function defaultPrompt(message) {
    return new Promise((resolve) => {
        if (!process.stdin.isTTY) {
            resolve(undefined);
            return;
        }
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question(message, (ans) => {
            rl.close();
            resolve(ans?.trim() || undefined);
        });
    });
}
/** 把 ctx 提供的能力 + 文件系统探测组装为 DshHost。 */
function buildHost(ctx, cwd, sink) {
    const probe = fsProbe();
    const log = sink ?? ctx.log ?? ((m) => console.log(m));
    const isInstalled = async (id) => {
        if (ctx.plugins?.isInstalled) {
            return await Promise.resolve(ctx.plugins.isInstalled(id));
        }
        return probe.isInstalled(id);
    };
    const getInstalledVersion = async (id) => {
        if (ctx.plugins?.getInstalledVersion) {
            return await Promise.resolve(ctx.plugins.getInstalledVersion(id));
        }
        return probe.getInstalledVersion(id);
    };
    // dsh-market：优先 ctx.plugins.installViaMarket，其次 ctx.get('dsh-market')
    const ctxPlugins = ctx.plugins;
    const marketSvc = ctx.get('dsh-market');
    const installFn = ctxPlugins?.installViaMarket ??
        marketSvc?.install;
    const updateFn = ctxPlugins?.updateViaMarket ??
        marketSvc?.update ??
        installFn;
    const market = {
        available: typeof installFn === 'function',
        async install(id, opts) {
            const r = await installFn(id, opts);
            return r ?? {};
        },
        async update(id, opts) {
            const fn = (updateFn ?? installFn);
            const r = await fn(id, opts);
            return r ?? {};
        },
    };
    // dsh-skills-console：优先 ctx.skills.syncViaSkillsConsole，其次 ctx.get
    const ctxSkills = ctx.skills;
    const skillSvc = ctx.get('dsh-skills-console');
    const syncFn = ctxSkills?.syncViaSkillsConsole ??
        skillSvc?.sync;
    const skillsConsole = {
        available: typeof syncFn === 'function',
        async sync(skill) {
            await syncFn(skill);
        },
    };
    // 预检：通过 ctx.get(name) 查找预检服务
    const precheck = {
        async run(name, pluginId) {
            const svc = ctx.get(name);
            if (!svc) {
                throw new Error(`预检服务 ${name} 不可用`);
            }
            if (typeof svc.check === 'function') {
                return Boolean(await Promise.resolve(svc.check(pluginId)));
            }
            if (typeof svc.run === 'function') {
                return Boolean(await Promise.resolve(svc.run(pluginId)));
            }
            throw new Error(`预检服务 ${name} 未提供 check/run 方法`);
        },
    };
    return {
        ui: {
            print: (t) => log(t),
            info: (t) => log(t),
            warn: (t) => log(t),
            prompt: ctx.ui?.prompt ?? defaultPrompt,
        },
        fs: {
            async readFile(p) {
                const abs = path.isAbsolute(p) ? p : path.join(cwd, p);
                return fs_1.promises.readFile(abs, 'utf8');
            },
            async writeFile(p, content) {
                const abs = path.isAbsolute(p) ? p : path.join(cwd, p);
                await fs_1.promises.mkdir(path.dirname(abs), { recursive: true });
                await fs_1.promises.writeFile(abs, content, 'utf8');
            },
            async exists(p) {
                const abs = path.isAbsolute(p) ? p : path.join(cwd, p);
                try {
                    await fs_1.promises.access(abs);
                    return true;
                }
                catch {
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
async function readPlugins(host, file) {
    const md = await host.fs.readFile(file);
    return (0, manifest_1.parsePluginsManifest)(md);
}
/** 读取并解析 skills.md。 */
async function readSkills(host, file) {
    const md = await host.fs.readFile(file);
    return (0, manifest_1.parseSkillsManifest)(md);
}
/** 退出码信号：写入模块内变量，绝不污染 DSH 进程的 process.exitCode。 */
let pendingExitCode = 0;
function signalExit(code) {
    pendingExitCode = code;
}
/** 参数分词：按空白切分（命令参数场景足够）。 */
function tokenize(raw) {
    const s = raw.trim();
    return s.length ? s.split(/\s+/) : [];
}
/** 命令处理：解析参数、分派子命令、把输出汇总为 CommandResult。 */
async function handleLzWork(ctx, invocation) {
    const argv = tokenize(String(invocation?.rawInput ?? ''));
    let args;
    try {
        args = parseArgs(argv);
    }
    catch (e) {
        return { kind: 'error', text: e.message };
    }
    const agent = invocation?.agent;
    const cwd = agent?.session?.cwd ??
        agent?.session?.header?.cwd ??
        (typeof process !== 'undefined' ? process.cwd() : '.');
    const profile = args.profile ?? config_1.DEFAULT_PROFILE;
    const stateIO = new state_1.FsStateIO(path.isAbsolute(config_1.DEFAULT_STATE_PATH)
        ? config_1.DEFAULT_STATE_PATH
        : path.join(cwd, config_1.DEFAULT_STATE_PATH));
    const lines = [];
    pendingExitCode = 0;
    const host = buildHost(ctx, cwd, (t) => lines.push(t));
    try {
        switch (args.subcommand) {
            case 'plan':
                await runPlan(host, stateIO, profile, args);
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
    }
    catch (e) {
        const msg = e instanceof manifest_1.ManifestError || e instanceof UsageError
            ? e.message
            : `执行失败：${e.message}`;
        lines.push(msg);
        pendingExitCode = types_1.ExitCode.PartialFailure;
    }
    const text = lines.length ? lines.join('\n') : '(无输出)';
    return { kind: pendingExitCode === 0 ? 'success' : 'error', text };
}
/** 插件名（组合树 identity）。 */
exports.name = 'lz-work-bootstrap';
/** 硬依赖服务：commands。 */
exports.inject = ['commands'];
/** 安全日志（绝不抛错）。 */
function safeLog(ctx, msg) {
    try {
        if (typeof ctx.log === 'function')
            ctx.log(msg);
    }
    catch {
        /* 忽略 */
    }
}
/** Cordis 插件入口：注册 lz-work 命令（加载期绝不抛错）。 */
function apply(ctx) {
    const commands = ctx.commands;
    if (!commands || typeof commands.register !== 'function') {
        safeLog(ctx, 'lz-work: 宿主未提供 commands 服务，插件已加载但命令未注册');
        return;
    }
    const definition = {
        definitionId: 'lz-work-bootstrap',
        name: 'lz-work',
        description: '按 plugins.md / skills.md 编排插件安装与 Skill 同步（plan/install/sync-skills/resume/verify）',
        input: { hint: '<plan|install|sync-skills|resume|verify> [选项]' },
        recordInput: false,
        handler: (invocation) => handleLzWork(ctx, invocation),
    };
    try {
        const effect = ctx.effect;
        if (typeof effect === 'function') {
            effect(() => commands.register(definition));
        }
        else {
            commands.register(definition);
        }
    }
    catch (e) {
        safeLog(ctx, `lz-work: 注册命令失败：${e.message}`);
    }
}
/** 兼容旧名。 */
exports.activate = apply;
/** 默认导出：Cordis 插件对象。 */
exports.default = { name: exports.name, inject: exports.inject, apply };
async function runPlan(host, stateIO, profile, args) {
    const pluginsFile = args.plugins ?? 'plugins.md';
    const plugins = await readPlugins(host, pluginsFile);
    let skills;
    if (args.skills) {
        skills = await readSkills(host, args.skills);
    }
    else {
        // 尝试默认 skills.md，不存在则忽略
        if (await host.fs.exists('skills.md')) {
            skills = await readSkills(host, 'skills.md');
        }
    }
    const mgr = await (0, state_1.loadState)(stateIO, profile);
    const items = await (0, plan_1.buildPlan)(mgr, { plugins, skills, profile }, host.plugins);
    host.ui.print((0, ui_1.formatPlanTable)(items));
    // plan 不写状态（验收 #1）
}
async function runInstall(host, stateIO, profile, args) {
    const pluginsFile = args.plugins ?? 'plugins.md';
    const plugins = await readPlugins(host, pluginsFile);
    let skills;
    if (args.skills) {
        skills = await readSkills(host, args.skills);
    }
    else if (await host.fs.exists('skills.md')) {
        skills = await readSkills(host, 'skills.md');
    }
    const mgr = await (0, state_1.loadState)(stateIO, profile);
    const items = await (0, plan_1.buildPlan)(mgr, { plugins, skills, profile }, host.plugins);
    host.ui.print('安装计划：');
    host.ui.print((0, ui_1.formatPlanTable)(items));
    host.ui.print('');
    const result = await (0, executor_1.executeInstall)(host, mgr, items, !!args.continueOnError);
    await (0, state_1.saveState)(mgr, stateIO);
    host.ui.print((0, ui_1.formatInstallSummary)(result));
    signalExit(result.exitCode);
}
async function runSyncSkills(host, stateIO, profile, args) {
    const skillsFile = args.skills ?? 'skills.md';
    const manifest = await readSkills(host, skillsFile);
    const mgr = await (0, state_1.loadState)(stateIO, profile);
    const fallback = path.join(path.dirname(config_1.DEFAULT_STATE_PATH), 'skills-console-manifest.json');
    const code = await (0, executor_1.executeSyncSkills)(host, mgr, manifest, fallback);
    await (0, state_1.saveState)(mgr, stateIO);
    signalExit(code);
}
async function runResume(host, stateIO, profile, args) {
    const mgr = await (0, state_1.loadState)(stateIO, profile);
    // 重建 entries：优先读 plugins.md；读不到则用最小 entry
    const entries = new Map();
    try {
        const pluginsFile = args.plugins ?? 'plugins.md';
        const plugins = await readPlugins(host, pluginsFile);
        for (const p of plugins.plugins)
            entries.set(p.id, p);
    }
    catch {
        host.ui.warn('未读取到 plugins.md，将以最小信息重试 failed 项（无预检/配置）。');
    }
    // failed 项若无对应 entry，补一个最小 entry
    for (const { id } of mgr.getFailedPlugins()) {
        if (!entries.has(id))
            entries.set(id, { id, source: 'market' });
    }
    const result = await (0, executor_1.executeResume)(host, mgr, entries, !!args.continueOnError);
    await (0, state_1.saveState)(mgr, stateIO);
    host.ui.print((0, ui_1.formatInstallSummary)(result));
    signalExit(result.exitCode);
}
async function runVerify(host, stateIO, profile) {
    const mgr = await (0, state_1.loadState)(stateIO, profile);
    const report = await (0, verify_1.verifyAll)(host, mgr);
    for (const line of report.lines)
        host.ui.print(line);
    signalExit(report.healthy ? types_1.ExitCode.Ok : types_1.ExitCode.PartialFailure);
}
//# sourceMappingURL=index.js.map