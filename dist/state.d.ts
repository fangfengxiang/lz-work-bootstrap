import { PluginEntry, PluginState, PluginStatus, ProfileState, RemovalLogEntry, SkillEntry, SkillState, StateFile } from './types';
/** 状态 IO 抽象：read 返回文件原文，不存在返回 null。 */
export interface StateIO {
    read(): Promise<string | null>;
    write(content: string): Promise<void>;
}
/** 基于文件系统的 StateIO 实现。 */
export declare class FsStateIO implements StateIO {
    private readonly filePath;
    constructor(filePath: string);
    read(): Promise<string | null>;
    write(content: string): Promise<void>;
}
/** 内存 StateIO，用于测试。 */
export declare class MemoryStateIO implements StateIO {
    private buf;
    constructor(initial?: string);
    read(): Promise<string | null>;
    write(content: string): Promise<void>;
}
/** 创建空状态文件。 */
export declare function emptyState(): StateFile;
/** 规范化对象为稳定字符串（键排序），用于 hash。 */
export declare function canonicalize(value: unknown): string;
/** djb2 哈希，返回十六进制字符串。无外部依赖，便于测试。 */
export declare function djb2(input: string): string;
/** 计算清单条目的配置 hash（source + version + config）。 */
export declare function computeEntryHash(entry: PluginEntry): string;
/** 计算 Skill 条目 hash。 */
export declare function computeSkillHash(entry: SkillEntry): string;
/** 本地存在性 + 版本探测结果。 */
export interface LocalInfo {
    exists: boolean;
    version?: string;
}
/** 解析后的插件计划判定（纯函数，不修改状态）。 */
export interface ResolvedPlugin {
    /** 用于 plan 表显示的状态。 */
    displayStatus: string;
    /** 计划动作。 */
    action: 'install' | 'update' | 'skip' | 'retry';
    reason: string;
    /** 墓碑期间清单配置发生变化。 */
    hasConfigUpdate?: boolean;
    /**
     * install 阶段需要对 state 应用的迁移；plan 阶段忽略。
     * - mark-tombstone：检测到本地缺失，标记 removed_by_user
     * - clear-tombstone：本地重新存在，清除墓碑
     * - adopt-installed：本地已存在但无记录，纳入受管
     */
    transition?: 'mark-tombstone' | 'clear-tombstone' | 'adopt-installed';
}
/**
 * 核心：按“本地是否存在 × state 状态”检测矩阵解析单个插件。
 * 纯函数：读取 st（当前状态）与 local（探测结果）、newHash（清单 hash），
 * 返回解析判定。不修改入参。
 *
 * 注意：manual 项由 plan 阶段在调用前过滤，本函数只处理非 manual 项。
 */
export declare function resolvePlugin(entry: PluginEntry, st: PluginState | undefined, local: LocalInfo, newHash: string): ResolvedPlugin;
/**
 * 状态管理器：在内存 StateFile 上提供状态机操作。
 * 不直接做 IO；由调用方 load/save。
 */
export declare class StateManager {
    state: StateFile;
    readonly profile: string;
    constructor(state: StateFile, profile: string);
    /** 取得（必要时创建）当前 profile 的状态分区。 */
    profileState(): ProfileState;
    getPlugin(id: string): PluginState | undefined;
    private setPlugin;
    /** 标记安装成功。 */
    markInstalled(id: string, version: string | undefined, hash: string): void;
    /** 标记安装失败。 */
    markFailed(id: string, reason: string): void;
    /** 标记为墓碑，并追加 removalLog（只追加）。 */
    markRemovedByUser(id: string, lastKnownVersion: string | undefined, reason: string): void;
    /** 清除墓碑：仅把状态改回 installed，不动 removalLog 历史。 */
    clearTombstone(id: string, version: string | undefined, hash: string): void;
    /** 纳入受管：本地已存在但无记录。 */
    adoptInstalled(id: string, version: string | undefined, hash: string): void;
    /** 标记为手动项（持久化以便 verify 报告；不影响安装）。 */
    markManual(id: string): void;
    /** 追加 removalLog 记录（只追加，永不修改历史）。 */
    appendRemovalLog(entry: RemovalLogEntry): void;
    /** 取得所有 failed 插件（用于 resume）。 */
    getFailedPlugins(): Array<{
        id: string;
        st: PluginState;
    }>;
    getSkill(id: string): SkillState | undefined;
    markSkillSynced(id: string, hash: string): void;
    markSkillFailed(id: string, reason: string): void;
    markSkillManualSync(id: string): void;
}
/** 从 IO 加载状态并包装为 StateManager。文件不存在则新建空状态。 */
export declare function loadState(io: StateIO, profile: string): Promise<StateManager>;
/** 将任意已解析对象规范化为合法 StateFile（补全缺失字段）。 */
export declare function normalizeState(parsed: unknown): StateFile;
/** 保存状态到 IO。 */
export declare function saveState(mgr: StateManager, io: StateIO): Promise<void>;
/** 列出某状态下的插件 id（辅助 verify）。 */
export declare function pluginsByStatus(mgr: StateManager, status: PluginStatus): string[];
//# sourceMappingURL=state.d.ts.map