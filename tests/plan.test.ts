import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { buildPlan, effectiveManual, matchesProfile, LocalProbe } from '../src/plan';
import { StateManager, emptyState, computeEntryHash } from '../src/state';
import { PluginEntry, PluginsManifest, SkillsManifest } from '../src/types';

function fakeProbe(installed: Record<string, boolean>): LocalProbe {
  return {
    isInstalled: async (id) => !!installed[id],
  };
}

function manifest(plugins: PluginEntry[], allowOrgs?: string[]): PluginsManifest {
  return {
    version: 1,
    profile: 'dev-workbench',
    sources: { market: 'dsh-market', allow_github_orgs: allowOrgs },
    plugins,
  };
}

test('effectiveManual: market → false', () => {
  assert.equal(effectiveManual({ id: 'a', source: 'market' }, undefined), false);
});

test('effectiveManual: github 默认 manual', () => {
  assert.equal(effectiveManual({ id: 'o/p', source: 'github' }, ['o']), true);
});

test('effectiveManual: github manual:false + 白名单 → false', () => {
  assert.equal(
    effectiveManual({ id: 'oxmumu3/p', source: 'github', manual: false }, ['oxmumu3']),
    false,
  );
});

test('effectiveManual: github manual:false + 非白名单 → manual', () => {
  assert.equal(
    effectiveManual({ id: 'other/p', source: 'github', manual: false }, ['oxmumu3']),
    true,
  );
});

test('effectiveManual: manual:true 强制 manual', () => {
  assert.equal(effectiveManual({ id: 'a', source: 'market', manual: true }, undefined), true);
});

test('matchesProfile: 无 profile 始终处理', () => {
  assert.equal(matchesProfile({ id: 'a', source: 'market' }, 'dev-workbench'), true);
});

test('matchesProfile: free-token 不混入 dev-workbench', () => {
  assert.equal(
    matchesProfile({ id: 'a', source: 'market', profile: 'free-token' }, 'dev-workbench'),
    false,
  );
  assert.equal(
    matchesProfile({ id: 'a', source: 'market', profile: 'free-token' }, 'free-token'),
    true,
  );
});

test('buildPlan: 手动项显式可见', async () => {
  const mgr = new StateManager(emptyState(), 'dev-workbench');
  const m = manifest([
    { id: 'skyrocks/dsh-plugins', source: 'github', required: false, manual: true },
    { id: 'a', source: 'market' },
  ], ['skyrocks']);
  const items = await buildPlan(mgr, { plugins: m, profile: 'dev-workbench' }, fakeProbe({}));
  const manual = items.find((i) => i.id === 'skyrocks/dsh-plugins');
  assert.ok(manual);
  assert.equal(manual!.action, 'manual');
  assert.equal(manual!.status, 'manual');
});

test('buildPlan: 墓碑项显式可见且 hasConfigUpdate', async () => {
  const mgr = new StateManager(emptyState(), 'dev-workbench');
  const e: PluginEntry = { id: 'modlens', source: 'market', version: '1.0.0' };
  const h = computeEntryHash(e);
  // 已装但被改成墓碑，且清单 hash 变化
  mgr.profileState().plugins['modlens'] = {
    status: 'removed_by_user',
    hash: 'different-old-hash',
    lastKnownVersion: '0.9.0',
  };
  const items = await buildPlan(
    mgr,
    { plugins: manifest([e]), profile: 'dev-workbench' },
    fakeProbe({}), // 本地不存在
  );
  const tb = items.find((i) => i.id === 'modlens');
  assert.ok(tb);
  assert.equal(tb!.action, 'skip');
  assert.equal(tb!.status, 'removed_by_user');
  assert.equal(tb!.hasConfigUpdate, true);
});

test('buildPlan: profile 过滤排除 free-token 项', async () => {
  const mgr = new StateManager(emptyState(), 'dev-workbench');
  const m = manifest([
    { id: 'a', source: 'market' },
    { id: 'free-thing', source: 'market', profile: 'free-token' },
  ]);
  const items = await buildPlan(mgr, { plugins: m, profile: 'dev-workbench' }, fakeProbe({}));
  assert.equal(items.length, 1);
  assert.equal(items[0].id, 'a');
});

test('buildPlan: installed + 本地缺失 → 计划显示 removed_by_user + mark-tombstone 迁移', async () => {
  const mgr = new StateManager(emptyState(), 'dev-workbench');
  const e: PluginEntry = { id: 'a', source: 'market' };
  const h = computeEntryHash(e);
  mgr.markInstalled('a', '1.0.0', h);
  const items = await buildPlan(mgr, { plugins: manifest([e]), profile: 'dev-workbench' }, fakeProbe({}));
  const it = items[0];
  assert.equal(it.status, 'removed_by_user');
  assert.equal(it.transition, 'mark-tombstone');
});

test('buildPlan: 不修改 state（只读）', async () => {
  const mgr = new StateManager(emptyState(), 'dev-workbench');
  const e: PluginEntry = { id: 'a', source: 'market' };
  mgr.markInstalled('a', '1', computeEntryHash(e));
  const snap = JSON.stringify(mgr.state);
  await buildPlan(mgr, { plugins: manifest([e]), profile: 'dev-workbench' }, fakeProbe({ a: true }));
  assert.equal(JSON.stringify(mgr.state), snap);
});

test('buildPlan: Skill 未同步 → action sync；已同步 → skip', async () => {
  const mgr = new StateManager(emptyState(), 'dev-workbench');
  const skills: SkillsManifest = {
    version: 1,
    manager: 'dsh-skills-console',
    skills: [
      { id: 'code-review', source: 'github:o/s', enabled: true, scope: 'project' },
      { id: 'prd', source: 'github:o/p', enabled: false, scope: 'global' },
    ],
  };
  const items = await buildPlan(
    mgr,
    { plugins: manifest([]), skills, profile: 'dev-workbench' },
    fakeProbe({}),
  );
  const cr = items.find((i) => i.id === 'code-review');
  assert.equal(cr!.action, 'sync');
  const prd = items.find((i) => i.id === 'prd');
  assert.equal(prd!.action, 'skip'); // 禁用
});
