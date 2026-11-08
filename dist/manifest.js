"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManifestError = void 0;
exports.extractFence = extractFence;
exports.parsePluginsManifest = parsePluginsManifest;
exports.parseSkillsManifest = parseSkillsManifest;
exports.isRestrictedSource = isRestrictedSource;
/**
 * 清单解析：从 Markdown 中提取 ```yaml dsh-plugins / ```yaml dsh-skills
 * 代码块，解析 YAML 并做结构校验与安全检查。
 *
 * 安全底线（见需求文档 §7）：
 *  - 来源白名单：只允许 market 与 allow_github_orgs 中的 GitHub 来源。
 *  - 密钥不落盘：config 只接受 keychain: / env: 引用，拒绝明文。
 *  - 预编译二进制项目默认排除。
 */
const js_yaml_1 = __importDefault(require("js-yaml"));
const config_1 = require("./config");
/** 清单解析错误。 */
class ManifestError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ManifestError';
    }
}
exports.ManifestError = ManifestError;
/** 转义正则元字符。 */
function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
/**
 * 从 Markdown 文本中提取指定围栏内的 YAML 正文。
 * 围栏形如：```yaml dsh-plugins  ...  ```
 * 支持围栏标识后带有额外修饰（如 ```yaml dsh-plugins title="..."）。
 * 找不到返回 null。
 */
function extractFence(md, fence) {
    // 匹配 ```` 后跟围栏标识（允许后面到行尾有任意修饰），直到下一个 ```
    // 围栏必须位于行首（^ 配合 m 标志），避免误匹配散文或行内代码中的字面量
    const openRe = new RegExp('^```' + escapeRegex(fence) + '[^\\n]*\\n([\\s\\S]*?)\\n```', 'm');
    const m = md.match(openRe);
    return m ? m[1] : null;
}
const VALID_SOURCES = [
    'market',
    'github',
    'github-release',
    'local',
];
function asString(v, field) {
    if (typeof v !== 'string' || v.length === 0) {
        throw new ManifestError(`字段 ${field} 必须是非空字符串`);
    }
    return v;
}
function asBool(v, field) {
    if (v === undefined || v === null)
        return undefined;
    if (typeof v !== 'boolean') {
        throw new ManifestError(`字段 ${field} 必须是布尔值`);
    }
    return v;
}
function asStringArray(v, field) {
    if (v === undefined || v === null)
        return undefined;
    if (!Array.isArray(v)) {
        throw new ManifestError(`字段 ${field} 必须是字符串数组`);
    }
    return v.map((x, i) => asString(x, `${field}[${i}]`));
}
/**
 * 校验 config 中是否存在明文密钥。
 * 只允许 keychain: / env: 引用；其余视为明文，拒绝。
 */
function assertNoPlaintextSecrets(config, path) {
    if (config === null || config === undefined)
        return;
    if (typeof config === 'string') {
        const looksLikeSecret = /(secret|password|token|api[_-]?key|apikey)/i.test(path);
        const isAllowedRef = config_1.ALLOWED_SECRET_PREFIXES.some((p) => config.startsWith(p));
        if (looksLikeSecret && !isAllowedRef) {
            throw new ManifestError(`字段 ${path} 疑似密钥，必须使用 keychain: / env: 引用，不得明文`);
        }
        return;
    }
    if (typeof config === 'object') {
        for (const [k, v] of Object.entries(config)) {
            assertNoPlaintextSecrets(v, path ? `${path}.${k}` : k);
        }
    }
}
/** 解析 plugins.md（接受完整 Markdown 或已提取的 YAML 正文均可）。 */
function parsePluginsManifest(md) {
    const body = extractFence(md, config_1.PLUGINS_FENCE) ?? md;
    let raw;
    try {
        raw = js_yaml_1.default.load(body);
    }
    catch (e) {
        throw new ManifestError(`plugins.md YAML 解析失败：${e.message}`);
    }
    if (!raw || typeof raw !== 'object') {
        throw new ManifestError('plugins.md 顶层必须是一个对象');
    }
    const obj = raw;
    const version = typeof obj.version === 'number' ? obj.version : 1;
    const profile = typeof obj.profile === 'string' ? obj.profile : undefined;
    const sourcesRaw = (obj.sources ?? {});
    const market = asString(sourcesRaw.market ?? 'dsh-market', 'sources.market');
    const allow_github_orgs = asStringArray(sourcesRaw.allow_github_orgs, 'sources.allow_github_orgs');
    const pluginsRaw = obj.plugins;
    if (!Array.isArray(pluginsRaw)) {
        throw new ManifestError('plugins 必须是数组');
    }
    const plugins = pluginsRaw.map((p, i) => {
        const item = p;
        const id = asString(item.id, `plugins[${i}].id`);
        const sourceStr = asString(item.source, `plugins[${i}].source`);
        if (!VALID_SOURCES.includes(sourceStr)) {
            throw new ManifestError(`plugins[${i}].source "${sourceStr}" 非法，允许：${VALID_SOURCES.join(', ')}`);
        }
        const source = sourceStr;
        // 预编译二进制项目默认排除
        if (config_1.EXCLUDED_BINARY_PROJECTS.includes(id)) {
            throw new ManifestError(`plugins[${i}].id "${id}" 属于预编译二进制项目，默认排除，不得纳入清单`);
        }
        // GitHub 来源必须在 allow_github_orgs 白名单内
        if (source === 'github' || source === 'github-release') {
            const org = id.includes('/') ? id.split('/')[0] : id;
            if (!allow_github_orgs || !allow_github_orgs.includes(org)) {
                // 未在白名单的 github 来源：强制 manual（只提示，不自动安装）
                // 不抛错，交给 plan 阶段标 manual，保证清单可被解析
            }
        }
        const config = item.config;
        if (config !== undefined) {
            assertNoPlaintextSecrets(config, 'config');
        }
        return {
            id,
            source,
            required: asBool(item.required, `plugins[${i}].required`),
            manual: asBool(item.manual, `plugins[${i}].manual`),
            precheck: typeof item.precheck === 'string' ? item.precheck : undefined,
            profile: typeof item.profile === 'string' ? item.profile : undefined,
            config,
            notes: typeof item.notes === 'string' ? item.notes : undefined,
            version: typeof item.version === 'string' ? item.version : undefined,
        };
    });
    return { version, profile, sources: { market, allow_github_orgs }, plugins };
}
/** 解析单条 Skill 条目。 */
function parseSkillEntry(s, path) {
    const item = s;
    return {
        id: asString(item.id, `${path}.id`),
        source: asString(item.source, `${path}.source`),
        enabled: asBool(item.enabled, `${path}.enabled`) ?? false,
        scope: (item.scope === 'project' || item.scope === 'global'
            ? item.scope
            : undefined),
    };
}
/** 解析 skills.md。 */
function parseSkillsManifest(md) {
    const body = extractFence(md, config_1.SKILLS_FENCE) ?? md;
    let raw;
    try {
        raw = js_yaml_1.default.load(body);
    }
    catch (e) {
        throw new ManifestError(`skills.md YAML 解析失败：${e.message}`);
    }
    if (!raw || typeof raw !== 'object') {
        throw new ManifestError('skills.md 顶层必须是一个对象');
    }
    const obj = raw;
    const version = typeof obj.version === 'number' ? obj.version : 1;
    const manager = typeof obj.manager === 'string' ? obj.manager : undefined;
    const skills = [];
    let internalGitlabGroup;
    const categoriesRaw = obj.categories;
    if (categoriesRaw && typeof categoriesRaw === 'object') {
        // v2：分类结构 categories.<name> = { skills: [...], gitlab_group?: string }
        const cats = categoriesRaw;
        for (const catName of Object.keys(cats)) {
            if (!config_1.SKILL_CATEGORIES.includes(catName)) {
                throw new ManifestError(`未知技能分类：${catName}（允许：${config_1.SKILL_CATEGORIES.join(', ')}）`);
            }
            const catVal = cats[catName];
            let catSkills;
            let gitlabGroup;
            if (Array.isArray(catVal)) {
                catSkills = catVal;
            }
            else if (catVal && typeof catVal === 'object') {
                const co = catVal;
                catSkills = co.skills;
                if (typeof co.gitlab_group === 'string')
                    gitlabGroup = co.gitlab_group;
            }
            else {
                throw new ManifestError(`分类 ${catName} 必须是数组或含 skills 的对象`);
            }
            if (!Array.isArray(catSkills)) {
                throw new ManifestError(`分类 ${catName} 缺少 skills 数组`);
            }
            if (catName === 'internal')
                internalGitlabGroup = gitlabGroup;
            catSkills.forEach((s, i) => {
                const entry = parseSkillEntry(s, `${catName}[${i}]`);
                entry.category = catName;
                skills.push(entry);
            });
        }
    }
    else if (Array.isArray(obj.skills)) {
        // v1：扁平 skills 列表（无分类）
        obj.skills.forEach((s, i) => {
            skills.push(parseSkillEntry(s, `skills[${i}]`));
        });
    }
    else {
        throw new ManifestError('skills.md 必须包含 categories 或 skills');
    }
    return { version, manager, skills, internalGitlabGroup };
}
/** 判断来源是否受限（默认 manual）。 */
function isRestrictedSource(source) {
    return config_1.RESTRICTED_SOURCES.includes(source);
}
//# sourceMappingURL=manifest.js.map