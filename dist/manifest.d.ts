import { PluginSource, PluginsManifest, SkillsManifest } from './types';
/** 清单解析错误。 */
export declare class ManifestError extends Error {
    constructor(message: string);
}
/**
 * 从 Markdown 文本中提取指定围栏内的 YAML 正文。
 * 围栏形如：```yaml dsh-plugins  ...  ```
 * 支持围栏标识后带有额外修饰（如 ```yaml dsh-plugins title="..."）。
 * 找不到返回 null。
 */
export declare function extractFence(md: string, fence: string): string | null;
/** 解析 plugins.md（接受完整 Markdown 或已提取的 YAML 正文均可）。 */
export declare function parsePluginsManifest(md: string): PluginsManifest;
/** 解析 skills.md。 */
export declare function parseSkillsManifest(md: string): SkillsManifest;
/** 判断来源是否受限（默认 manual）。 */
export declare function isRestrictedSource(source: PluginSource): boolean;
//# sourceMappingURL=manifest.d.ts.map