/**
 * 计划构建：把清单 + 状态 + 本地存在性探测，融合为一份 PlanItem[]。
 *
 * 关键约束（验收 #1）：plan 只输出计划表，**不写状态**。本模块全程只读：
 *  - resolvePlugin 是纯函数；
 *  - LocalProbe 只做存在性/版本探测；
 *  - 不调用 StateManager 的任何写方法。
 *
 * 墓碑项与手动项必须显式出现在计划表中，不得静默跳过（验收 #4、#8）。
 */
import { isRestrictedSource } from './manifest';
import {
  computeEntryHash,
  computeSkillHash,
  LocalInfo,
  resolvePlugin,
  StateManager,
} from './state';
import {
  PlanItem,
  PluginEntry,
  PluginsManifest,
  SkillEntry,
  SkillsManifest,
} from './types';

/** 本地存在性探测接口（由宿主或测试注入）。 */
export interface LocalProbe {
  isInstalled(id: string): Promise<boolean>;
  getInstalledVersion?(id: string): Promise<string | undefined>;
}

/** plan 构建输入。 */
export interface PlanInput {
  plugins: PluginsManifest;
  skills?: SkillsManifest;
  profile: string;
}

/**
 * 判断某插件条目在当前 profile 下是否应被处理。
 * profile 过滤：条目未指定 profile → 始终处理；指定了 → 仅当与当前 profile 一致。
 * 免费 Token（free-token）清单不得混入主工作台（验收 #15）。
 */
export function matchesProfile(entry: PluginEntry, profile: string): boolean {
  if (entry.profile === undefined) return true;
  return entry.profile === profile;
}

/**
 * 解析“有效 manual”：
 *  - 显式 manual:true → manual
 *  - 受限来源（github / github-release）默认 manual，除非显式 manual:false
 *    且来源在 allow_github_orgs 白名单内
 */
export function effectiveManual(
  entry: PluginEntry,
  allowGithubOrgs: string[] | undefined,
): boolean {
  if (entry.manual === true) return true;
  if (!isRestrictedSource(entry.source)) return false;
  if (entry.manual === false) {
    // 受限来源但显式要求自动安装：必须在白名单内
    const org = entry.id.includes('/') ? entry.id.split('/')[0] : entry.id;
    return !(allowGithubOrgs && allowGithubOrgs.includes(org));
  }
  // 受限来源且未显式 manual:false → 默认 manual
  return true;
}

async function probeLocal(
  probe: LocalProbe,
  id: string,
): Promise<LocalInfo> {
  const exists = await probe.isInstalled(id);
  let version: string | undefined;
  if (exists && probe.getInstalledVersion) {
    try {
      version = await probe.getInstalledVersion(id);
    } catch {
      version = undefined;
    }
  }
  return { exists, version };
}

function pluginPlanItem(
  entry: PluginEntry,
  resolved: ReturnType<typeof resolvePlugin>,
): PlanItem {
  return {
    resource: 'plugin',
    id: entry.id,
    type: 'plugin',
    status: resolved.displayStatus,
    action: resolved.action,
    reason: resolved.reason,
    entry,
    required: entry.required,
    manual: entry.manual,
    hasConfigUpdate: resolved.hasConfigUpdate,
    transition: resolved.transition,
  };
}

function skillPlanItem(
  skill: SkillEntry,
  status: string,
  action: PlanItem['action'],
  reason: string,
): PlanItem {
  return {
    resource: 'skill',
    id: skill.id,
    type: 'skill',
    status,
    action,
    reason,
    entry: skill,
  };
}

/**
 * 构建计划。只读，不修改 state。
 */
export async function buildPlan(
  mgr: StateManager,
  input: PlanInput,
  probe: LocalProbe,
): Promise<PlanItem[]> {
  const items: PlanItem[] = [];
  const allowOrgs = input.plugins.sources.allow_github_orgs;

  for (const entry of input.plugins.plugins) {
    if (!matchesProfile(entry, input.profile)) continue;

    if (effectiveManual(entry, allowOrgs)) {
      items.push({
        resource: 'plugin',
        id: entry.id,
        type: 'plugin',
        status: 'manual',
        action: 'manual',
        reason: entry.notes?.trim()
          ? `手动安装：${entry.notes.trim().split('\n')[0]}`
          : '手动项，只提示不自动安装',
        entry,
        required: entry.required,
        manual: true,
      });
      continue;
    }

    const st = mgr.getPlugin(entry.id);
    const local = await probeLocal(probe, entry.id);
    const newHash = computeEntryHash(entry);
    const resolved = resolvePlugin(entry, st, local, newHash);
    items.push(pluginPlanItem(entry, resolved));
  }

  if (input.skills) {
    for (const skill of input.skills.skills) {
      const newHash = computeSkillHash(skill);
      const st = mgr.getSkill(skill.id);
      if (!skill.enabled) {
        items.push(
          skillPlanItem(skill, 'disabled', 'skip', '清单已禁用（enabled:false）'),
        );
        continue;
      }
      if (st?.status === 'synced' && st.hash === newHash) {
        items.push(skillPlanItem(skill, 'synced', 'skip', '已同步且未变化'));
      } else {
        items.push(
          skillPlanItem(
            skill,
            st?.status ?? 'pending',
            'sync',
            st?.status === 'synced' ? 'Skill 内容变化，需重新同步' : '未同步',
          ),
        );
      }
    }
  }

  return items;
}
