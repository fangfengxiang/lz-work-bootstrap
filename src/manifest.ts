/**
 * 清单解析：从 Markdown 中提取 ```yaml dsh-plugins / ```yaml dsh-skills
 * 代码块，解析 YAML 并做结构校验与安全检查。
 *
 * 安全底线（见需求文档 §7）：
 *  - 来源白名单：只允许 market 与 allow_github_orgs 中的 GitHub 来源。
 *  - 密钥不落盘：config 只接受 keychain: / env: 引用，拒绝明文。
 *  - 预编译二进制项目默认排除。
 */
import yaml from 'js-yaml';

import {
  ALLOWED_SECRET_PREFIXES,
  EXCLUDED_BINARY_PROJECTS,
  PLUGINS_FENCE,
  RESTRICTED_SOURCES,
  SKILLS_FENCE,
} from './config';
import {
  PluginEntry,
  PluginSource,
  PluginsManifest,
  SkillEntry,
  SkillsManifest,
} from './types';

/** 清单解析错误。 */
export class ManifestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ManifestError';
  }
}

/** 转义正则元字符。 */
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 从 Markdown 文本中提取指定围栏内的 YAML 正文。
 * 围栏形如：```yaml dsh-plugins  ...  ```
 * 支持围栏标识后带有额外修饰（如 ```yaml dsh-plugins title="..."）。
 * 找不到返回 null。
 */
export function extractFence(md: string, fence: string): string | null {
  // 匹配 ```` 后跟围栏标识（允许后面到行尾有任意修饰），直到下一个 ```
  // 围栏必须位于行首（^ 配合 m 标志），避免误匹配散文或行内代码中的字面量
  const openRe = new RegExp(
    '^```' + escapeRegex(fence) + '[^\\n]*\\n([\\s\\S]*?)\\n```',
    'm',
  );
  const m = md.match(openRe);
  return m ? m[1] : null;
}

const VALID_SOURCES: readonly PluginSource[] = [
  'market',
  'github',
  'github-release',
  'local',
];

function asString(v: unknown, field: string): string {
  if (typeof v !== 'string' || v.length === 0) {
    throw new ManifestError(`字段 ${field} 必须是非空字符串`);
  }
  return v;
}

function asBool(v: unknown, field: string): boolean | undefined {
  if (v === undefined || v === null) return undefined;
  if (typeof v !== 'boolean') {
    throw new ManifestError(`字段 ${field} 必须是布尔值`);
  }
  return v;
}

function asStringArray(v: unknown, field: string): string[] | undefined {
  if (v === undefined || v === null) return undefined;
  if (!Array.isArray(v)) {
    throw new ManifestError(`字段 ${field} 必须是字符串数组`);
  }
  return v.map((x, i) => asString(x, `${field}[${i}]`));
}

/**
 * 校验 config 中是否存在明文密钥。
 * 只允许 keychain: / env: 引用；其余视为明文，拒绝。
 */
function assertNoPlaintextSecrets(config: unknown, path: string): void {
  if (config === null || config === undefined) return;
  if (typeof config === 'string') {
    const looksLikeSecret = /(secret|password|token|api[_-]?key|apikey)/i.test(
      path,
    );
    const isAllowedRef = ALLOWED_SECRET_PREFIXES.some((p) =>
      config.startsWith(p),
    );
    if (looksLikeSecret && !isAllowedRef) {
      throw new ManifestError(
        `字段 ${path} 疑似密钥，必须使用 keychain: / env: 引用，不得明文`,
      );
    }
    return;
  }
  if (typeof config === 'object') {
    for (const [k, v] of Object.entries(config as Record<string, unknown>)) {
      assertNoPlaintextSecrets(v, path ? `${path}.${k}` : k);
    }
  }
}

/** 解析 plugins.md（接受完整 Markdown 或已提取的 YAML 正文均可）。 */
export function parsePluginsManifest(md: string): PluginsManifest {
  const body = extractFence(md, PLUGINS_FENCE) ?? md;
  let raw: unknown;
  try {
    raw = yaml.load(body);
  } catch (e) {
    throw new ManifestError(
      `plugins.md YAML 解析失败：${(e as Error).message}`,
    );
  }
  if (!raw || typeof raw !== 'object') {
    throw new ManifestError('plugins.md 顶层必须是一个对象');
  }
  const obj = raw as Record<string, unknown>;

  const version = typeof obj.version === 'number' ? obj.version : 1;
  const profile =
    typeof obj.profile === 'string' ? (obj.profile as string) : undefined;

  const sourcesRaw = (obj.sources ?? {}) as Record<string, unknown>;
  const market = asString(sourcesRaw.market ?? 'dsh-market', 'sources.market');
  const allow_github_orgs = asStringArray(
    sourcesRaw.allow_github_orgs,
    'sources.allow_github_orgs',
  );

  const pluginsRaw = obj.plugins;
  if (!Array.isArray(pluginsRaw)) {
    throw new ManifestError('plugins 必须是数组');
  }

  const plugins: PluginEntry[] = pluginsRaw.map((p, i) => {
    const item = p as Record<string, unknown>;
    const id = asString(item.id, `plugins[${i}].id`);
    const sourceStr = asString(item.source, `plugins[${i}].source`);
    if (!VALID_SOURCES.includes(sourceStr as PluginSource)) {
      throw new ManifestError(
        `plugins[${i}].source "${sourceStr}" 非法，允许：${VALID_SOURCES.join(', ')}`,
      );
    }
    const source = sourceStr as PluginSource;

    // 预编译二进制项目默认排除
    if (EXCLUDED_BINARY_PROJECTS.includes(id as never)) {
      throw new ManifestError(
        `plugins[${i}].id "${id}" 属于预编译二进制项目，默认排除，不得纳入清单`,
      );
    }

    // GitHub 来源必须在 allow_github_orgs 白名单内
    if (source === 'github' || source === 'github-release') {
      const org = id.includes('/') ? id.split('/')[0] : id;
      if (!allow_github_orgs || !allow_github_orgs.includes(org)) {
        // 未在白名单的 github 来源：强制 manual（只提示，不自动安装）
        // 不抛错，交给 plan 阶段标 manual，保证清单可被解析
      }
    }

    const config = item.config as Record<string, unknown> | undefined;
    if (config !== undefined) {
      assertNoPlaintextSecrets(config, 'config');
    }

    return {
      id,
      source,
      required: asBool(item.required, `plugins[${i}].required`),
      manual: asBool(item.manual, `plugins[${i}].manual`),
      precheck:
        typeof item.precheck === 'string' ? item.precheck : undefined,
      profile: typeof item.profile === 'string' ? item.profile : undefined,
      config,
      notes: typeof item.notes === 'string' ? item.notes : undefined,
      version:
        typeof item.version === 'string' ? item.version : undefined,
    };
  });

  return { version, profile, sources: { market, allow_github_orgs }, plugins };
}

/** 解析 skills.md。 */
export function parseSkillsManifest(md: string): SkillsManifest {
  const body = extractFence(md, SKILLS_FENCE) ?? md;
  let raw: unknown;
  try {
    raw = yaml.load(body);
  } catch (e) {
    throw new ManifestError(
      `skills.md YAML 解析失败：${(e as Error).message}`,
    );
  }
  if (!raw || typeof raw !== 'object') {
    throw new ManifestError('skills.md 顶层必须是一个对象');
  }
  const obj = raw as Record<string, unknown>;

  const version = typeof obj.version === 'number' ? obj.version : 1;
  const manager =
    typeof obj.manager === 'string' ? (obj.manager as string) : undefined;

  const skillsRaw = obj.skills;
  if (!Array.isArray(skillsRaw)) {
    throw new ManifestError('skills 必须是数组');
  }

  const skills: SkillEntry[] = skillsRaw.map((s, i) => {
    const item = s as Record<string, unknown>;
    return {
      id: asString(item.id, `skills[${i}].id`),
      source: asString(item.source, `skills[${i}].source`),
      enabled:
        asBool(item.enabled, `skills[${i}].enabled`) ?? false,
      scope: (item.scope === 'project' || item.scope === 'global'
        ? item.scope
        : undefined) as SkillEntry['scope'],
    };
  });

  return { version, manager, skills };
}

/** 判断来源是否受限（默认 manual）。 */
export function isRestrictedSource(source: PluginSource): boolean {
  return (RESTRICTED_SOURCES as readonly string[]).includes(source);
}
