/**
 * 全局常量与默认值。
 */

/** 状态文件 schema 版本。 */
export const STATE_SCHEMA_VERSION = 2 as const;

/**
 * 默认状态文件路径。
 * `lz` 取自「靓仔」(liangzai) 的缩写；插件 `lz-work-bootstrap`、命令 `lz-work`。
 */
export const DEFAULT_STATE_PATH = '.dsh/lz-work-bootstrap-state.json';

/** 默认 profile。 */
export const DEFAULT_PROFILE = 'dev-workbench';

/** 免费 Token 单独 profile，不得混入主工作台自动安装。 */
export const FREE_TOKEN_PROFILE = 'free-token';

/** plugins.md 中要解析的代码围栏标识。 */
export const PLUGINS_FENCE = 'yaml dsh-plugins';

/** skills.md 中要解析的代码围栏标识。 */
export const SKILLS_FENCE = 'yaml dsh-skills';

/** 允许的明文密钥引用前缀；其余一律拒绝落盘。 */
export const ALLOWED_SECRET_PREFIXES = ['keychain:', 'env:'] as const;

/** 受限来源：github / github-release 默认按 manual 处理，除非显式 manual:false 且在白名单。 */
export const RESTRICTED_SOURCES = ['github', 'github-release'] as const;

/**
 * 预编译二进制项目默认排除名单（不纳入自动清单）。
 * 实现只读取该名单用于校验提示，不硬编码安装逻辑。
 */
export const EXCLUDED_BINARY_PROJECTS = [
  'DeepSeek-Harness-Token-Free',
] as const;

/** Skill 分类：通用 / 开发 / 内部。 */
export const SKILL_CATEGORIES = ['general', 'dev', 'internal'] as const;

/** 内部技能市场 GitLab 分组的“启动时询问用户”占位符。 */
export const GITLAB_GROUP_ASK = '__ask__' as const;

/** 内部技能源中待替换的 GitLab 分组占位变量。 */
export const GITLAB_GROUP_VAR = '${gitlab_group}' as const;
