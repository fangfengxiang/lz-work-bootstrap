/**
 * lz-work-bootstrap 共享类型定义。
 *
 * 本插件是“薄编排层”：只解析清单、维护状态机、调度外部能力（dsh-market /
 * dsh-skills-console），不重复实现下载与落盘。本文件定义贯穿各模块的数据契约。
 */

/** 插件来源类型。 */
export type PluginSource = 'market' | 'github' | 'github-release' | 'local';

/** plugins.md 中单条插件声明。 */
export interface PluginEntry {
  /** 插件 ID，必填。 */
  id: string;
  /** 来源通道。 */
  source: PluginSource;
  /** true 时安装失败会阻断后续必需项；不代表必须自动安装。 */
  required?: boolean;
  /** true 时 install 只提示，不执行安装。 */
  manual?: boolean;
  /** 安装前需运行的预检插件或命令名。 */
  precheck?: string;
  /** profile 过滤：仅当当前 --profile 匹配或未指定时处理该项。 */
  profile?: string;
  /** 普通配置；密钥只允许 keychain: / env: 引用。 */
  config?: Record<string, unknown>;
  /** 人类可读说明，不参与执行。 */
  notes?: string;
  /** 清单中声明的目标版本（可选，用于更新比对）。 */
  version?: string;
}

/** Skill 分类：通用 / 开发 / 内部。 */
export type SkillCategory = 'general' | 'dev' | 'internal';

/** skills.md 中单条 Skill 声明。 */
export interface SkillEntry {
  id: string;
  source: string;
  enabled: boolean;
  scope?: 'project' | 'global';
  /** 所属分类：通用 / 开发 / 内部。 */
  category?: SkillCategory;
}

/** plugins.md 解析结果。 */
export interface PluginsManifest {
  version: number;
  profile?: string;
  sources: {
    market: string;
    allow_github_orgs?: string[];
  };
  plugins: PluginEntry[];
}

/** skills.md 解析结果。 */
export interface SkillsManifest {
  version: number;
  manager?: string;
  /** 扁平化的全部 Skill（含 category）。 */
  skills: SkillEntry[];
  /**
   * 内部技能市场的 GitLab 分组。
   * `__ask__` 表示 sync-skills 启动时询问用户；也可填具体分组。
   */
  internalGitlabGroup?: string;
}

/** 插件生命周期状态。 */
export type PluginStatus =
  | 'pending' // 清单内有，从未装过
  | 'installed' // 已装且受管
  | 'failed' // 安装失败
  | 'removed_by_user' // 墓碑：检测到用户本地移除
  | 'manual'; // 清单标记手动安装

/** 单个插件的受管状态记录。 */
export interface PluginState {
  status: PluginStatus;
  /** 当前已安装版本。 */
  version?: string;
  /** 墓碑场景下记录的最后一次已知版本。 */
  lastKnownVersion?: string;
  /** 配置/清单 hash，用于判断是否需要更新。 */
  hash?: string;
  lastInstalledAt?: string;
  /** 检测到被移除的时间。 */
  removedDetectedAt?: string;
  removalReason?: string;
  failureReason?: string;
  failedAttempts?: number;
}

/** Skill 同步状态。 */
export type SkillStatus =
  | 'pending'
  | 'synced'
  | 'failed'
  | 'manual_sync_required';

export interface SkillState {
  status: SkillStatus;
  source?: string;
  hash?: string;
  lastSyncedAt?: string;
  failureReason?: string;
}

/** removalLog 单条记录（只追加，不修改历史）。 */
export interface RemovalLogEntry {
  id: string;
  detectedAt: string;
  lastKnownVersion?: string;
  note: string;
}

/** 单个 profile 下的全部受管状态。 */
export interface ProfileState {
  plugins: Record<string, PluginState>;
  skills: Record<string, SkillState>;
  removalLog: RemovalLogEntry[];
}

/** 状态文件根结构（schema version 2）。 */
export interface StateFile {
  version: 2;
  profiles: Record<string, ProfileState>;
}

/** 计划项资源类型。 */
export type ResourceType = 'plugin' | 'skill';

/**
 * 计划项动作。
 * - install：首次安装
 * - update：版本/hash 变化，需更新
 * - sync：Skill 同步
 * - skip：已就绪或被墓碑跳过
 * - manual：手动项，只提示
 * - retry：失败项待 resume 重试
 * - fail：预检阻断等，需写 failed
 */
export type PlanAction =
  | 'install'
  | 'update'
  | 'sync'
  | 'skip'
  | 'manual'
  | 'retry'
  | 'fail';

/** 单条计划项（plan 输出表的一行）。 */
export interface PlanItem {
  resource: ResourceType;
  id: string;
  /** 显示用类型标签：plugin / skill。 */
  type: string;
  /** 解析后用于显示的状态。 */
  status: string;
  action: PlanAction;
  reason: string;
  /** 关联的清单条目。 */
  entry?: PluginEntry | SkillEntry;
  required?: boolean;
  manual?: boolean;
  /**
   * 墓碑期间清单配置发生变化：plan 会提示“有配置更新但因已移除未应用”，
   * install 仍跳过。
   */
  hasConfigUpdate?: boolean;
  /**
   * install 阶段应对 state 应用的状态机迁移（plan 只读不写，executor 应用）。
   * - mark-tombstone：检测到本地缺失，标记 removed_by_user
   * - clear-tombstone：本地重新存在，清除墓碑
   * - adopt-installed：本地已存在但无记录，纳入受管
   */
  transition?: 'mark-tombstone' | 'clear-tombstone' | 'adopt-installed';
}

/** 命令行解析结果。 */
export interface ParsedArgs {
  subcommand: 'plan' | 'install' | 'sync-skills' | 'resume' | 'verify';
  plugins?: string;
  skills?: string;
  profile?: string;
  continueOnError?: boolean;
}

/** 退出码约定。 */
export const ExitCode = {
  Ok: 0,
  PartialFailure: 1,
  PrecheckBlocked: 2,
} as const;
