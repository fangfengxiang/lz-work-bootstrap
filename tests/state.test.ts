import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import {
  StateManager,
  MemoryStateIO,
  emptyState,
  loadState,
  saveState,
  resolvePlugin,
  computeEntryHash,
  normalizeState,
} from '../src/state';
import { PluginEntry, PluginState } from '../src/types';

function entry(id: string, extra: Partial<PluginEntry> = {}): PluginEntry {
  return { id, source: 'market', ...extra };
}

function st(status: PluginState['status'], extra: Partial<PluginState> = {}): PluginState {
  return { status, ...extra };
}

const LOCAL_NO = { exists: false };
const LOCAL_YES = { exists: true, version: '1.0.0' };

test('resolvePlugin: pending + 本地缺失 → install', () => {
  const r = resolvePlugin(entry('a'), st('pending'), LOCAL_NO, 'h1');
  assert.equal(r.action, 'install');
  assert.equal(r.displayStatus, 'pending');
});

test('resolvePlugin: 无记录 + 本地存在 → adopt-installed', () => {
  const r = resolvePlugin(entry('a'), undefined, LOCAL_YES, 'h1');
  assert.equal(r.action, 'skip');
  assert.equal(r.transition, 'adopt-installed');
});

test('resolvePlugin: installed + 本地存在 + hash 一致 → skip', () => {
  const h = computeEntryHash(entry('a'));
  const r = resolvePlugin(entry('a'), st('installed', { version: '1.0.0', hash: h }), LOCAL_YES, h);
  assert.equal(r.action, 'skip');
  assert.equal(r.reason, '已安装且版本一致');
});

test('resolvePlugin: installed + 本地存在 + hash 变化 → update', () => {
  const r = resolvePlugin(
    entry('a'),
    st('installed', { version: '1.0.0', hash: 'old' }),
    LOCAL_YES,
    'new',
  );
  assert.equal(r.action, 'update');
});

test('resolvePlugin: installed + 本地缺失 → 标记墓碑', () => {
  const r = resolvePlugin(
    entry('a'),
    st('installed', { version: '1.0.0', hash: 'h' }),
    LOCAL_NO,
    'h',
  );
  assert.equal(r.action, 'skip');
  assert.equal(r.transition, 'mark-tombstone');
  assert.equal(r.displayStatus, 'removed_by_user');
});

test('resolvePlugin: 墓碑 + 本地仍缺失 + 配置变化 → hasConfigUpdate', () => {
  const r = resolvePlugin(
    entry('a'),
    st('removed_by_user', { hash: 'old' }),
    LOCAL_NO,
    'new',
  );
  assert.equal(r.action, 'skip');
  assert.equal(r.hasConfigUpdate, true);
  assert.match(r.reason, /有配置更新但因已移除未应用/);
});

test('resolvePlugin: 墓碑 + 本地重新存在 → clear-tombstone', () => {
  const r = resolvePlugin(
    entry('a'),
    st('removed_by_user', { hash: 'old' }),
    LOCAL_YES,
    'new',
  );
  assert.equal(r.transition, 'clear-tombstone');
  assert.equal(r.action, 'update'); // hash 变化
});

test('resolvePlugin: 墓碑 + 本地重新存在 + hash 一致 → skip', () => {
  const r = resolvePlugin(
    entry('a'),
    st('removed_by_user', { hash: 'h' }),
    LOCAL_YES,
    'h',
  );
  assert.equal(r.transition, 'clear-tombstone');
  assert.equal(r.action, 'skip');
});

test('resolvePlugin: failed → retry', () => {
  const r = resolvePlugin(entry('a'), st('failed', { failureReason: 'boom' }), LOCAL_NO, 'h');
  assert.equal(r.action, 'retry');
  assert.match(r.reason, /boom/);
});

test('StateManager: markRemovedByUser 追加 removalLog，clearTombstone 不删历史', () => {
  const mgr = new StateManager(emptyState(), 'dev-workbench');
  mgr.markInstalled('a', '1.0.0', 'h');
  mgr.markRemovedByUser('a', '1.0.0', 'local_missing');
  assert.equal(mgr.getPlugin('a')?.status, 'removed_by_user');
  assert.equal(mgr.profileState().removalLog.length, 1);

  // 清墓碑
  mgr.clearTombstone('a', '1.0.0', 'h');
  assert.equal(mgr.getPlugin('a')?.status, 'installed');
  // removalLog 历史仍在
  assert.equal(mgr.profileState().removalLog.length, 1);
});

test('StateManager: getFailedPlugins 只返回 failed', () => {
  const mgr = new StateManager(emptyState(), 'dev-workbench');
  mgr.markInstalled('a', '1', 'h');
  mgr.markFailed('b', 'err');
  const failed = mgr.getFailedPlugins();
  assert.deepEqual(failed.map((f) => f.id), ['b']);
});

test('StateManager: markFailed 累加 failedAttempts', () => {
  const mgr = new StateManager(emptyState(), 'dev-workbench');
  mgr.markFailed('a', 'e1');
  mgr.markFailed('a', 'e2');
  assert.equal(mgr.getPlugin('a')?.failedAttempts, 2);
});

test('removalLog 只追加：多次 markRemovedByUser 不覆盖', () => {
  const mgr = new StateManager(emptyState(), 'dev-workbench');
  mgr.markInstalled('a', '1', 'h');
  mgr.markRemovedByUser('a', '1', 'r1');
  mgr.markRemovedByUser('a', '1', 'r2');
  assert.equal(mgr.profileState().removalLog.length, 2);
  assert.equal(mgr.profileState().removalLog[0].note, 'r1 → tombstoned');
});

test('loadState/saveState 往返 + normalizeState 补全', () => {
  const io = new MemoryStateIO();
  const mgr = new StateManager(emptyState(), 'dev-workbench');
  mgr.markInstalled('a', '1', 'h');
  mgr.markSkillSynced('s', 'sh');
  saveState(mgr, io);

  const mgr2 = loadState(io, 'dev-workbench'); // returns Promise
  return mgr2.then((m) => {
    assert.equal(m.getPlugin('a')?.status, 'installed');
    assert.equal(m.getSkill('s')?.status, 'synced');
  });
});

test('normalizeState 容错缺失字段', () => {
  const s = normalizeState({ version: 2, profiles: { p: { plugins: { a: { status: 'installed' } } } } });
  assert.deepEqual(s.profiles.p.removalLog, []);
  assert.deepEqual(s.profiles.p.skills, {});
});

test('计划纯函数不修改入参 state', () => {
  const mgr = new StateManager(emptyState(), 'dev-workbench');
  mgr.markInstalled('a', '1', computeEntryHash(entry('a')));
  const snap = JSON.stringify(mgr.state);
  resolvePlugin(entry('a'), mgr.getPlugin('a'), LOCAL_YES, computeEntryHash(entry('a')));
  assert.equal(JSON.stringify(mgr.state), snap);
});
