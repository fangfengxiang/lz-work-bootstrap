import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import {
  DshHost,
  executeInstall,
  executeResume,
  executeSyncSkills,
} from '../src/executor';
import { buildPlan } from '../src/plan';
import { StateManager, emptyState, computeEntryHash } from '../src/state';
import {
  ExitCode,
  PluginEntry,
  PluginsManifest,
  SkillEntry,
  SkillsManifest,
} from '../src/types';

interface FakeHostOpts {
  installed?: Set<string>;
  versions?: Map<string, string>;
  installThrow?: string;
  precheckPass?: boolean | ((name: string) => boolean);
  marketAvailable?: boolean;
  consoleAvailable?: boolean;
  consoleThrow?: string;
}

function makeHost(opts: FakeHostOpts = {}): DshHost {
  const installed = opts.installed ?? new Set<string>();
  const versions = opts.versions ?? new Map<string, string>();
  const files = new Map<string, string>();
  const logs: string[] = [];

  return {
    ui: {
      print: (t: string) => logs.push(t),
      info: (t: string) => logs.push(t),
      warn: (t: string) => logs.push(t),
    },
    fs: {
      async readFile(p: string) {
        const v = files.get(p);
        if (v === undefined) throw new Error('ENOENT: ' + p);
        return v;
      },
      async writeFile(p: string, c: string) {
        files.set(p, c);
      },
      async exists(p: string) {
        return files.has(p);
      },
    },
    plugins: {
      async isInstalled(id: string) {
        return installed.has(id);
      },
      async getInstalledVersion(id: string) {
        return versions.get(id);
      },
    },
    market: {
      available: opts.marketAvailable !== false,
      async install(id: string) {
        if (opts.installThrow) throw new Error(opts.installThrow);
        installed.add(id);
        versions.set(id, '1.0.0');
        return { version: '1.0.0' };
      },
      async update(id: string) {
        if (opts.installThrow) throw new Error(opts.installThrow);
        installed.add(id);
        versions.set(id, '1.0.0');
        return { version: '1.0.0' };
      },
    },
    skillsConsole: {
      available: opts.consoleAvailable !== false,
      async sync(_skill: SkillEntry) {
        if (opts.consoleThrow) throw new Error(opts.consoleThrow);
      },
    },
    precheck: {
      async run(name: string, _pluginId: string) {
        if (typeof opts.precheckPass === 'function') return opts.precheckPass(name);
        return opts.precheckPass ?? true;
      },
    },
    // 暴露内部以便断言
    _logs: logs,
    _files: files,
    _installed: installed,
  } as unknown as DshHost;
}

function manifest(plugins: PluginEntry[]): PluginsManifest {
  return {
    version: 1,
    profile: 'dev-workbench',
    sources: { market: 'dsh-market', allow_github_orgs: ['oxmumu3'] },
    plugins,
  };
}

async function planFor(
  mgr: StateManager,
  plugins: PluginEntry[],
  host: DshHost,
) {
  return buildPlan(mgr, { plugins: manifest(plugins), profile: 'dev-workbench' }, host.plugins);
}

test('install: 首次安装 pending 项 → installed', async () => {
  const host = makeHost();
  const mgr = new StateManager(emptyState(), 'dev-workbench');
  const items = await planFor(mgr, [{ id: 'a', source: 'market', required: true }], host);
  const r = await executeInstall(host, mgr, items, false);
  assert.equal(mgr.getPlugin('a')?.status, 'installed');
  assert.deepEqual(r.succeeded, ['a']);
  assert.equal(r.exitCode, ExitCode.Ok);
});

test('install: 幂等，重复运行不重复安装', async () => {
  const host = makeHost();
  const e: PluginEntry = { id: 'a', source: 'market' };
  const mgr = new StateManager(emptyState(), 'dev-workbench');
  let calls = 0;
  (host.market as { install: (x: string) => Promise<unknown> }).install = async () => {
    calls++;
    return { version: '1.0.0' };
  };
  // 第一次安装
  const items1 = await planFor(mgr, [e], host);
  await executeInstall(host, mgr, items1, false);
  // 模拟安装后本地存在
  (host.plugins as { isInstalled: (x: string) => Promise<boolean> }).isInstalled = async () => true;
  (host.plugins as { getInstalledVersion: (x: string) => Promise<string | undefined> }).getInstalledVersion = async () => '1.0.0';
  const items2 = await planFor(mgr, [e], host);
  const r2 = await executeInstall(host, mgr, items2, false);
  assert.equal(calls, 1); // 只调用一次
  assert.deepEqual(r2.succeeded, []);
  assert.deepEqual(r2.skipped, ['a']);
});

test('install: 检测到本地移除 → 写墓碑并跳过，不安装', async () => {
  const host = makeHost();
  const e: PluginEntry = { id: 'a', source: 'market' };
  const mgr = new StateManager(emptyState(), 'dev-workbench');
  mgr.markInstalled('a', '1.0.0', computeEntryHash(e));
  // 本地不存在
  const items = await planFor(mgr, [e], host);
  const r = await executeInstall(host, mgr, items, false);
  assert.equal(mgr.getPlugin('a')?.status, 'removed_by_user');
  assert.equal(mgr.profileState().removalLog.length, 1);
  assert.deepEqual(r.succeeded, []);
});

test('install: 手动重新装回墓碑项 → 自动清墓碑恢复 installed', async () => {
  const host = makeHost({ installed: new Set(['a']) });
  const e: PluginEntry = { id: 'a', source: 'market' };
  const h = computeEntryHash(e);
  const mgr = new StateManager(emptyState(), 'dev-workbench');
  mgr.profileState().plugins['a'] = { status: 'removed_by_user', hash: 'old', lastKnownVersion: '0.9.0' };
  const items = await planFor(mgr, [e], host);
  const r = await executeInstall(host, mgr, items, false);
  assert.equal(mgr.getPlugin('a')?.status, 'installed');
  assert.equal(r.exitCode, ExitCode.Ok);
});

test('install: manual 项只提示不安装', async () => {
  const host = makeHost();
  let calls = 0;
  (host.market as { install: (x: string) => Promise<unknown> }).install = async () => {
    calls++;
    return {};
  };
  const mgr = new StateManager(emptyState(), 'dev-workbench');
  const items = await planFor(
    mgr,
    [{ id: 'skyrocks/dsh-plugins', source: 'github', manual: true }],
    host,
  );
  const r = await executeInstall(host, mgr, items, false);
  assert.equal(calls, 0);
  assert.deepEqual(r.manual, ['skyrocks/dsh-plugins']);
  assert.equal(mgr.getPlugin('skyrocks/dsh-plugins')?.status, 'manual');
});

test('install: 必需项 precheck 不通过 → 退出码 2', async () => {
  const host = makeHost({ precheckPass: false });
  const mgr = new StateManager(emptyState(), 'dev-workbench');
  const items = await planFor(
    mgr,
    [{ id: 'a', source: 'market', required: true, precheck: 'dsh-plugin-compat-check' }],
    host,
  );
  const r = await executeInstall(host, mgr, items, false);
  assert.equal(r.exitCode, ExitCode.PrecheckBlocked);
  assert.equal(mgr.getPlugin('a')?.status, 'failed');
});

test('install: dsh-market 不可用 → failed', async () => {
  const host = makeHost({ marketAvailable: false });
  const mgr = new StateManager(emptyState(), 'dev-workbench');
  const items = await planFor(mgr, [{ id: 'a', source: 'market', required: true }], host);
  const r = await executeInstall(host, mgr, items, false);
  assert.equal(r.exitCode, ExitCode.PartialFailure);
  assert.equal(mgr.getPlugin('a')?.status, 'failed');
  assert.match(mgr.getPlugin('a')?.failureReason ?? '', /dsh-market 不可用/);
});

test('install: continueOnError 时后续项仍尝试', async () => {
  // 第一个必需项安装抛错，第二个正常
  const host = makeHost();
  const mgr = new StateManager(emptyState(), 'dev-workbench');
  let firstCall = false;
  (host.market as { install: (x: string) => Promise<unknown> }).install = async (id) => {
    if (id === 'a') {
      firstCall = true;
      throw new Error('boom');
    }
    return { version: '1.0.0' };
  };
  const items = await planFor(
    mgr,
    [
      { id: 'a', source: 'market', required: true },
      { id: 'b', source: 'market' },
    ],
    host,
  );
  const r = await executeInstall(host, mgr, items, true);
  assert.ok(firstCall);
  assert.equal(mgr.getPlugin('a')?.status, 'failed');
  assert.equal(mgr.getPlugin('b')?.status, 'installed');
  assert.equal(r.exitCode, ExitCode.PartialFailure);
});

test('resume: 重试 failed，不碰墓碑', async () => {
  const host = makeHost();
  const mgr = new StateManager(emptyState(), 'dev-workbench');
  const eA: PluginEntry = { id: 'a', source: 'market' };
  const eB: PluginEntry = { id: 'b', source: 'market' };
  mgr.markFailed('a', '之前失败');
  // b 是墓碑
  mgr.markRemovedByUser('b', '1.0.0', 'local_missing');
  const entries = new Map<string, PluginEntry>([
    ['a', eA],
    ['b', eB],
  ]);
  const r = await executeResume(host, mgr, entries, false);
  assert.equal(mgr.getPlugin('a')?.status, 'installed');
  // b 仍是墓碑
  assert.equal(mgr.getPlugin('b')?.status, 'removed_by_user');
  assert.deepEqual(r.succeeded, ['a']);
});

test('sync-skills: console 可用 → 同步并标记 synced', async () => {
  const host = makeHost();
  const mgr = new StateManager(emptyState(), 'dev-workbench');
  const sm: SkillsManifest = {
    version: 1,
    manager: 'dsh-skills-console',
    skills: [{ id: 'code-review', source: 'github:o/s', enabled: true, scope: 'project' }],
  };
  const code = await executeSyncSkills(host, mgr, sm, '.dsh/fallback.json');
  assert.equal(code, ExitCode.Ok);
  assert.equal(mgr.getSkill('code-review')?.status, 'synced');
});

test('sync-skills: console 不可用 → 降级生成清单 + manual_sync_required', async () => {
  const host = makeHost({ consoleAvailable: false });
  const mgr = new StateManager(emptyState(), 'dev-workbench');
  const sm: SkillsManifest = {
    version: 1,
    manager: 'dsh-skills-console',
    skills: [{ id: 'code-review', source: 'github:o/s', enabled: true, scope: 'project' }],
  };
  const code = await executeSyncSkills(host, mgr, sm, '.dsh/fallback.json');
  assert.equal(code, ExitCode.PartialFailure);
  assert.equal(mgr.getSkill('code-review')?.status, 'manual_sync_required');
  // 降级清单已写入
  const files = (host as unknown as { _files: Map<string, string> })._files;
  assert.ok(files.has('.dsh/fallback.json'));
});

test('install: 密钥不出现在日志/state（sanitize）', async () => {
  const host = makeHost();
  const logs = (host as unknown as { _logs: string[] })._logs;
  const mgr = new StateManager(emptyState(), 'dev-workbench');
  const items = await planFor(
    mgr,
    [{ id: 'a', source: 'market', config: { apiKey: 'env:MY_KEY', normal: 'x' } }],
    host,
  );
  await executeInstall(host, mgr, items, false);
  const dumped = logs.join('\n') + JSON.stringify(mgr.state);
  assert.doesNotMatch(dumped, /MY_KEY/);
});
