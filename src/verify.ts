/**
 * verify：只报告健康状态，不直接改状态（验收 #12）。
 *
 * 读取 state + 本地存在性，输出每项的健康判定：
 *  - installed 但本地缺失 → 只报告，不改状态（区别于 install 的墓碑写入）
 *  - removed_by_user → 墓碑
 *  - failed → 待 resume
 *  - manual → 手动项
 *  - Skill manual_sync_required → 需手动同步
 */
import { pluginsByStatus, StateManager } from './state';
import { DshHost } from './executor';

export interface VerifyReport {
  healthy: boolean;
  lines: string[];
  summary: string;
}

/**
 * 执行 verify。不改状态。
 */
export async function verifyAll(
  host: DshHost,
  mgr: StateManager,
): Promise<VerifyReport> {
  const lines: string[] = [];
  let problems = 0;
  const ps = mgr.profileState();

  lines.push(`Profile: ${mgr.profile}`);
  lines.push('');

  // 插件
  lines.push('== 插件 ==');
  const pluginIds = Object.keys(ps.plugins);
  if (pluginIds.length === 0) {
    lines.push('  （无受管插件记录）');
  }
  for (const id of pluginIds) {
    const st = ps.plugins[id];
    switch (st.status) {
      case 'installed': {
        const exists = await safeProbe(host, id);
        if (exists) {
          lines.push(`  ✓ ${id} — installed${st.version ? ` (${st.version})` : ''}`);
        } else {
          lines.push(
            `  ⚠ ${id} — state=installed 但本地缺失（只报告，未改状态；下次 install 将写墓碑）`,
          );
          problems++;
        }
        break;
      }
      case 'removed_by_user':
        lines.push(
          `  ✗ ${id} — 墓碑（removed_by_user，已于 ${st.removedDetectedAt ?? '?'} 检测到移除）`,
        );
        break;
      case 'failed':
        lines.push(
          `  ✗ ${id} — failed${st.failureReason ? `：${st.failureReason}` : ''}（待 resume 重试）`,
        );
        problems++;
        break;
      case 'manual':
        lines.push(`  • ${id} — manual（手动项）`);
        break;
      default:
        lines.push(`  ? ${id} — ${st.status}`);
        break;
    }
  }

  // 墓碑清单汇总
  const tombstoned = pluginsByStatus(mgr, 'removed_by_user');
  if (tombstoned.length > 0) {
    lines.push('');
    lines.push(`== 墓碑 (${tombstoned.length}) ==`);
    for (const e of ps.removalLog) {
      lines.push(
        `  - ${e.id} @ ${e.detectedAt}（最后已知版本 ${e.lastKnownVersion ?? '?'}）：${e.note}`,
      );
    }
  }

  // Skill
  lines.push('');
  lines.push('== Skill ==');
  const skillIds = Object.keys(ps.skills);
  if (skillIds.length === 0) {
    lines.push('  （无受管 Skill 记录）');
  }
  for (const id of skillIds) {
    const st = ps.skills[id];
    switch (st.status) {
      case 'synced':
        lines.push(`  ✓ ${id} — synced`);
        break;
      case 'manual_sync_required':
        lines.push(`  ⚠ ${id} — manual_sync_required（需手动执行 dsh-skills-console）`);
        problems++;
        break;
      case 'failed':
        lines.push(`  ✗ ${id} — failed${st.failureReason ? `：${st.failureReason}` : ''}`);
        problems++;
        break;
      default:
        lines.push(`  ? ${id} — ${st.status}`);
    }
  }

  const summary = problems === 0
    ? '健康检查通过：所有受管项状态正常。'
    : `健康检查发现 ${problems} 个问题（见上方 ⚠/✗ 标记）。`;

  lines.push('');
  lines.push(summary);

  return { healthy: problems === 0, lines, summary };
}

async function safeProbe(host: DshHost, id: string): Promise<boolean> {
  try {
    return await host.plugins.isInstalled(id);
  } catch {
    return false;
  }
}
