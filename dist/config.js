"use strict";
/**
 * 全局常量与默认值。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GITLAB_GROUP_VAR = exports.GITLAB_GROUP_ASK = exports.SKILL_CATEGORIES = exports.EXCLUDED_BINARY_PROJECTS = exports.RESTRICTED_SOURCES = exports.ALLOWED_SECRET_PREFIXES = exports.SKILLS_FENCE = exports.PLUGINS_FENCE = exports.FREE_TOKEN_PROFILE = exports.DEFAULT_PROFILE = exports.DEFAULT_STATE_PATH = exports.STATE_SCHEMA_VERSION = void 0;
/** 状态文件 schema 版本。 */
exports.STATE_SCHEMA_VERSION = 2;
/**
 * 默认状态文件路径。
 * `lz` 取自「靓仔」(liangzai) 的缩写；插件 `lz-work-bootstrap`、命令 `lz-work`。
 */
exports.DEFAULT_STATE_PATH = '.dsh/lz-work-bootstrap-state.json';
/** 默认 profile。 */
exports.DEFAULT_PROFILE = 'dev-workbench';
/** 免费 Token 单独 profile，不得混入主工作台自动安装。 */
exports.FREE_TOKEN_PROFILE = 'free-token';
/** plugins.md 中要解析的代码围栏标识。 */
exports.PLUGINS_FENCE = 'yaml dsh-plugins';
/** skills.md 中要解析的代码围栏标识。 */
exports.SKILLS_FENCE = 'yaml dsh-skills';
/** 允许的明文密钥引用前缀；其余一律拒绝落盘。 */
exports.ALLOWED_SECRET_PREFIXES = ['keychain:', 'env:'];
/** 受限来源：github / github-release 默认按 manual 处理，除非显式 manual:false 且在白名单。 */
exports.RESTRICTED_SOURCES = ['github', 'github-release'];
/**
 * 预编译二进制项目默认排除名单（不纳入自动清单）。
 * 实现只读取该名单用于校验提示，不硬编码安装逻辑。
 */
exports.EXCLUDED_BINARY_PROJECTS = [
    'DeepSeek-Harness-Token-Free',
];
/** Skill 分类：通用 / 开发 / 内部。 */
exports.SKILL_CATEGORIES = ['general', 'dev', 'internal'];
/** 内部技能市场 GitLab 分组的“启动时询问用户”占位符。 */
exports.GITLAB_GROUP_ASK = '__ask__';
/** 内部技能源中待替换的 GitLab 分组占位变量。 */
exports.GITLAB_GROUP_VAR = '${gitlab_group}';
//# sourceMappingURL=config.js.map