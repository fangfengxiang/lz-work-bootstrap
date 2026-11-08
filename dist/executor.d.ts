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
import { StateManager } from './state';
import { PlanItem, PluginEntry, SkillEntry, SkillsManifest } from './types';
/** dsh-market 适配器。available=false 表示软依赖缺失。 */
export interface MarketAdapter {
    available: boolean;
    install(id: string, opts?: {
        version?: string;
        config?: Record<string, unknown>;
    }): Promise<{
        version?: string;
    }>;
    update(id: string, opts?: {
        version?: string;
        config?: Record<string, unknown>;
    }): Promise<{
        version?: string;
    }>;
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
        /** 交互式询问用户输入；不可用时返回 undefined。 */
        prompt?(message: string): Promise<string | undefined>;
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
/**
 * 执行 install：遍历计划项，应用状态迁移并安装/更新。
 * @param continueOnError true 时某项失败不中断后续。
 */
export declare function executeInstall(host: DshHost, mgr: StateManager, items: PlanItem[], continueOnError: boolean): Promise<InstallResult>;
/**
 * resume：只重试 failed 项，不碰墓碑。
 * 需要传入清单以便重建 entry（precheck/config/hash）。
 */
export declare function executeResume(host: DshHost, mgr: StateManager, entries: Map<string, PluginEntry>, continueOnError: boolean): Promise<InstallResult>;
/**
 * sync-skills：优先调用 dsh-skills-console；不可用时降级生成清单 + 提示。
 * 不直接写 Skill 文件到扫描目录。
 */
export declare function executeSyncSkills(host: DshHost, mgr: StateManager, manifest: SkillsManifest, fallbackPath: string): Promise<number>;
//# sourceMappingURL=executor.d.ts.map