/**
 * 执行器：把 PlanItem[] 落地为安装/更新/同步动作，并维护状态机迁移。
 *
 * 薄编排原则：
 *  - 插件安装复用 dsh-market（MarketAdapter）；不可用时写 failed，不自行下载。
 *  - Skill 同步复用 dsh-skills-console（SkillsConsoleAdapter）；不可用时降级
 *    为“生成可消费清单 + 提示”，状态标 manual_sync_required。
 *  - 预检（precheck）不通过 → 阻断该项，写 failed 或返回退出码 2。
 *
 * 退出码：0 全成功；1 部分失败；2 预检阻断/必需依赖缺失。
 */
import { computeEntryHash, computeSkillHash, StateManager } from './state';
import {
  ExitCode,
  PlanItem,
  PluginEntry,
  SkillEntry,
  SkillsManifest,
} from './types';

/** dsh-market 适配器。available=false 表示软依赖缺失。 */
export interface MarketAdapter {
  available: boolean;
  install(
    id: string,
    opts?: { version?: string; config?: Record<string, unknown> },
  ): Promise<{ version?: string }>;
  update(
    id: string,
    opts?: { version?: string; config?: Record<string, unknown> },
  ): Promise<{ version?: string }>;
}

/** dsh-skills-console 适配器。 */
export interface SkillsConsoleAdapter {
  available: boolean;
  sync(skill: SkillEntry): Promise<void>;
}

/** 预检运行器：运行 entry.precheck 指定的预检。 */
export interface PrecheckRunner {
  run(name: string, pluginId: string): Promise<boolean>;
}

/** 宿主能力集合（由 index.ts 根据真实运行时组装）。 */
export interface DshHost {
  ui: {
    print(text: string): void;
    info(text: string): void;
    warn(text: string): void;
  };
  fs: {
    readFile(path: string): Promise<string>;
    writeFile(path: string, content: string): Promise<void>;
    exists(path: string): Promise<boolean>;
  };
  plugins: {
    isInstalled(id: string): Promise<boolean>;
    getInstalledVersion?(id: string): Promise<string | undefined>;
  };
  market: MarketAdapter;
  skillsConsole: SkillsConsoleAdapter;
  precheck: PrecheckRunner;
}

/** 安装阶段统计。 */
export interface InstallResult {
  exitCode: number;
  succeeded: string[];
  failed: string[];
  skipped: string[];
  manual: string[];
}

/** 安全：序列化 config 时剥离疑似明文密钥（双保险，避免落盘）。 */
function sanitizeConfig(
  config: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!config) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(config)) {
    if (typeof v === 'string' && /(secret|password|token|api[_-]?key)/i.test(k)) {
      // 只保留引用形式
      out[k] = v.startsWith('keychain:') || v.startsWith('env:') ? v : '<redacted>';
    } else if (v && typeof v === 'object') {
      out[k] = sanitizeConfig(v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out;
}

/** 运行预检；返回是否通过。预检运行器不可用视为不通过（阻断）。 */
async function runPrecheck(
  host: DshHost,
  entry: PluginEntry,
): Promise<{ ok: boolean; reason?: string }> {
  if (!entry.precheck) return { ok: true };
  try {
    const ok = await host.precheck.run(entry.precheck, entry.id);
    return ok
      ? { ok: true }
      : { ok: false, reason: `预检 ${entry.precheck} 未通过` };
  } catch (e) {
    return { ok: false, reason: `预检 ${entry.precheck} 异常：${(e as Error).message}` };
  }
}

/**
 * 执行 install：遍历计划项，应用状态迁移并安装/更新。
 * @param continueOnError true 时某项失败不中断后续。
 */
export async function executeInstall(
  host: DshHost,
  mgr: StateManager,
  items: PlanItem[],
  continueOnError: boolean,
): Promise<InstallResult> {
  const result: InstallResult = {
    exitCode: ExitCode.Ok,
    succeeded: [],
    failed: [],
    skipped: [],
    manual: [],
  };

  let blocked = false;

  for (const item of items) {
    // Skill 在 install 阶段不安装，只确保 dsh-skills-console 存在（由依赖声明保证）。
    if (item.resource === 'skill') continue;

    const entry = item.entry as PluginEntry;
    const id = item.id;

    // 手动项：只提示，记录 manual 状态，不安装
    if (item.action === 'manual' || item.manual) {
      mgr.markManual(id);
      result.manual.push(id);
      host.ui.info(`• ${id}：手动项，只提示（不自动安装）`);
      continue;
    }

    // 跳过项：仍需应用状态机迁移（墓碑写入 / 纳入受管 / 清墓碑）
    if (item.action === 'skip') {
      await applyTransition(host, mgr, item, entry);
      result.skipped.push(id);
      continue;
    }

    // install / update / retry：先应用迁移（如清墓碑），再预检与安装
    await applyTransition(host, mgr, item, entry);

    // 预检
    const pre = await runPrecheck(host, entry);
    if (!pre.ok) {
      mgr.markFailed(id, pre.reason ?? '预检未通过');
      result.failed.push(id);
      host.ui.warn(`✗ ${id}：${pre.reason}`);
      if (entry.required) {
        // 必需项预检阻断 → 退出码 2
        blocked = true;
        if (!continueOnError) break;
      }
      continue;
    }

    // dsh-market 软依赖缺失
    if (!host.market.available) {
      mgr.markFailed(id, 'dsh-market 不可用，请先安装 dsh-market');
      result.failed.push(id);
      host.ui.warn(`✗ ${id}：dsh-market 不可用`);
      if (entry.required && !continueOnError) break;
      continue;
    }

    try {
      const opts = {
        version: entry.version,
        config: sanitizeConfig(entry.config),
      };
      const res =
        item.action === 'update'
          ? await host.market.update(id, opts)
          : await host.market.install(id, opts);
      const version = res?.version ?? entry.version;
      mgr.markInstalled(id, version, computeEntryHash(entry));
      result.succeeded.push(id);
      host.ui.info(`✓ ${id}：${item.action === 'update' ? '已更新' : '已安装'}${version ? ` (${version})` : ''}`);
    } catch (e) {
      const reason = (e as Error).message;
      mgr.markFailed(id, reason);
      result.failed.push(id);
      host.ui.warn(`✗ ${id}：安装失败 — ${reason}`);
      if (entry.required && !continueOnError) break;
    }
  }

  if (blocked) result.exitCode = ExitCode.PrecheckBlocked;
  else if (result.failed.length > 0) result.exitCode = ExitCode.PartialFailure;
  return result;
}

/** 应用 plan 解析出的状态机迁移（墓碑写入 / 清除 / 纳入受管）。 */
async function applyTransition(
  host: DshHost,
  mgr: StateManager,
  item: PlanItem,
  entry: PluginEntry,
): Promise<void> {
  const id = item.id;
  const hash = computeEntryHash(entry);
  switch (item.transition) {
    case 'mark-tombstone': {
      const prev = mgr.getPlugin(id);
      mgr.markRemovedByUser(
        id,
        prev?.version,
        'local_missing',
      );
      host.ui.warn(`• ${id}：检测到本地已移除，已标记墓碑`);
      break;
    }
    case 'clear-tombstone': {
      const version = host.plugins.getInstalledVersion
        ? await host.plugins.getInstalledVersion(id).catch(() => undefined)
        : undefined;
      mgr.clearTombstone(id, version, hash);
      host.ui.info(`• ${id}：检测到本地重新存在，已清除墓碑并恢复管理`);
      break;
    }
    case 'adopt-installed': {
      const version = host.plugins.getInstalledVersion
        ? await host.plugins.getInstalledVersion(id).catch(() => undefined)
        : undefined;
      mgr.adoptInstalled(id, version, hash);
      host.ui.info(`• ${id}：本地已存在，已纳入受管`);
      break;
    }
    default:
      break;
  }
}

/**
 * resume：只重试 failed 项，不碰墓碑。
 * 需要传入清单以便重建 entry（precheck/config/hash）。
 */
export async function executeResume(
  host: DshHost,
  mgr: StateManager,
  entries: Map<string, PluginEntry>,
  continueOnError: boolean,
): Promise<InstallResult> {
  const result: InstallResult = {
    exitCode: ExitCode.Ok,
    succeeded: [],
    failed: [],
    skipped: [],
    manual: [],
  };

  const failed = mgr.getFailedPlugins();
  if (failed.length === 0) {
    host.ui.info('没有 failed 项需要重试。');
    return result;
  }

  for (const { id } of failed) {
    const entry = entries.get(id);
    if (!entry) {
      host.ui.warn(`✗ ${id}：清单中已无该项，跳过（不碰墓碑）`);
      result.skipped.push(id);
      continue;
    }

    // resume 不碰墓碑：若该项已变为 removed_by_user，跳过
    const st = mgr.getPlugin(id);
    if (st?.status === 'removed_by_user') {
      result.skipped.push(id);
      continue;
    }

    const pre = await runPrecheck(host, entry);
    if (!pre.ok) {
      mgr.markFailed(id, pre.reason ?? '预检未通过');
      result.failed.push(id);
      host.ui.warn(`✗ ${id}：${pre.reason}`);
      if (entry.required && !continueOnError) {
        result.exitCode = ExitCode.PrecheckBlocked;
        break;
      }
      continue;
    }

    if (!host.market.available) {
      mgr.markFailed(id, 'dsh-market 不可用');
      result.failed.push(id);
      if (entry.required && !continueOnError) break;
      continue;
    }

    try {
      const opts = {
        version: entry.version,
        config: sanitizeConfig(entry.config),
      };
      const res = await host.market.install(id, opts);
      mgr.markInstalled(id, res?.version ?? entry.version, computeEntryHash(entry));
      result.succeeded.push(id);
      host.ui.info(`✓ ${id}：重试成功`);
    } catch (e) {
      mgr.markFailed(id, (e as Error).message);
      result.failed.push(id);
      host.ui.warn(`✗ ${id}：重试失败 — ${(e as Error).message}`);
      if (entry.required && !continueOnError) break;
    }
  }

  if (result.failed.length > 0 && result.exitCode === ExitCode.Ok) {
    result.exitCode = ExitCode.PartialFailure;
  }
  return result;
}

/**
 * sync-skills：优先调用 dsh-skills-console；不可用时降级生成清单 + 提示。
 * 不直接写 Skill 文件到扫描目录。
 */
export async function executeSyncSkills(
  host: DshHost,
  mgr: StateManager,
  manifest: SkillsManifest,
  fallbackPath: string,
): Promise<number> {
  const enabled = manifest.skills.filter((s) => s.enabled);
  if (enabled.length === 0) {
    host.ui.info('没有启用的 Skill 需要同步。');
    return ExitCode.Ok;
  }

  // 软依赖缺失 → 降级
  if (!host.skillsConsole.available) {
    host.ui.warn('dsh-skills-console 不可用，降级为生成清单 + 提示手动同步。');
    const consumable = JSON.stringify(
      { version: 1, manager: 'dsh-skills-console', skills: enabled },
      null,
      2,
    );
    try {
      await host.fs.writeFile(fallbackPath, consumable);
      host.ui.info(`已生成可消费清单：${fallbackPath}`);
      host.ui.info('请手动执行 dsh-skills-console 同步该清单。');
    } catch (e) {
      host.ui.warn(`生成降级清单失败：${(e as Error).message}`);
    }
    for (const s of enabled) {
      mgr.markSkillManualSync(s.id);
    }
    return ExitCode.PartialFailure;
  }

  let failed = 0;
  for (const skill of enabled) {
    try {
      await host.skillsConsole.sync(skill);
      mgr.markSkillSynced(skill.id, computeSkillHash(skill));
      host.ui.info(`✓ ${skill.id}：已同步`);
    } catch (e) {
      mgr.markSkillFailed(skill.id, (e as Error).message);
      host.ui.warn(`✗ ${skill.id}：同步失败 — ${(e as Error).message}`);
      failed++;
    }
  }
  return failed > 0 ? ExitCode.PartialFailure : ExitCode.Ok;
}
