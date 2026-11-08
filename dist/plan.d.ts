import { StateManager } from './state';
import { PlanItem, PluginEntry, PluginsManifest, SkillsManifest } from './types';
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
export declare function matchesProfile(entry: PluginEntry, profile: string): boolean;
/**
 * 解析“有效 manual”：
 *  - 显式 manual:true → manual
 *  - 受限来源（github / github-release）默认 manual，除非显式 manual:false
 *    且来源在 allow_github_orgs 白名单内
 */
export declare function effectiveManual(entry: PluginEntry, allowGithubOrgs: string[] | undefined): boolean;
/**
 * 构建计划。只读，不修改 state。
 */
export declare function buildPlan(mgr: StateManager, input: PlanInput, probe: LocalProbe): Promise<PlanItem[]>;
//# sourceMappingURL=plan.d.ts.map