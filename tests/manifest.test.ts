import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import {
  extractFence,
  ManifestError,
  parsePluginsManifest,
  parseSkillsManifest,
  isRestrictedSource,
} from '../src/manifest';
import { PLUGINS_FENCE, SKILLS_FENCE } from '../src/config';

const PLUGINS_MD = `
# some doc

ignore this prose.

\`\`\`${PLUGINS_FENCE}
version: 1
profile: dev-workbench
sources:
  market: dsh-market
  allow_github_orgs:
    - oxmumu3
    - KYCOMING
plugins:
  - id: dsh-market
    source: market
    required: true
  - id: dsh-agent-teams
    source: market
    required: true
    precheck: dsh-plugin-compat-check
    version: "1.2.0"
\`\`\`

more prose.
`;

test('extractFence 找到 dsh-plugins 代码块', () => {
  const body = extractFence(PLUGINS_MD, PLUGINS_FENCE);
  assert.ok(body);
  assert.match(body!, /profile: dev-workbench/);
});

test('extractFence 找不到时返回 null', () => {
  assert.equal(extractFence('no fences here', PLUGINS_FENCE), null);
});

test('parsePluginsManifest 解析字段', () => {
  const m = parsePluginsManifest(PLUGINS_MD);
  assert.equal(m.profile, 'dev-workbench');
  assert.equal(m.sources.market, 'dsh-market');
  assert.deepEqual(m.sources.allow_github_orgs, ['oxmumu3', 'KYCOMING']);
  assert.equal(m.plugins.length, 2);
  const at = m.plugins[1];
  assert.equal(at.id, 'dsh-agent-teams');
  assert.equal(at.required, true);
  assert.equal(at.precheck, 'dsh-plugin-compat-check');
  assert.equal(at.version, '1.2.0');
});

test('parsePluginsManifest 拒绝非法 source', () => {
  const md = `\`\`\`${PLUGINS_FENCE}\nsources: {market: dsh-market}\nplugins:\n  - id: x\n    source: ftp\n\`\`\``;
  assert.throws(() => parsePluginsManifest(md), ManifestError);
});

test('parsePluginsManifest 拒绝明文密钥', () => {
  const md = `\`\`\`${PLUGINS_FENCE}\nsources: {market: dsh-market}\nplugins:\n  - id: x\n    source: market\n    config:\n      apiKey: abc123\n\`\`\``;
  assert.throws(() => parsePluginsManifest(md), /密钥/);
});

test('parsePluginsManifest 接受 env:/keychain: 密钥引用', () => {
  const md = `\`\`\`${PLUGINS_FENCE}\nsources: {market: dsh-market}\nplugins:\n  - id: x\n    source: market\n    config:\n      apiKey: env:MY_KEY\n      token: keychain:token-ref\n\`\`\``;
  const m = parsePluginsManifest(md);
  assert.equal((m.plugins[0].config as { apiKey: string }).apiKey, 'env:MY_KEY');
});

test('parsePluginsManifest 拒绝预编译二进制项目', () => {
  const md = `\`\`\`${PLUGINS_FENCE}\nsources: {market: dsh-market}\nplugins:\n  - id: DeepSeek-Harness-Token-Free\n    source: market\n\`\`\``;
  assert.throws(() => parsePluginsManifest(md), /预编译二进制/);
});

test('parseSkillsManifest 解析', () => {
  const md = `\`\`\`${SKILLS_FENCE}\nversion: 1\nmanager: dsh-skills-console\nskills:\n  - id: code-review\n    source: github:o/skills/code-review\n    enabled: true\n    scope: project\n  - id: prd-template\n    source: github:o/skills/prd\n    enabled: false\n    scope: global\n\`\`\``;
  const s = parseSkillsManifest(md);
  assert.equal(s.manager, 'dsh-skills-console');
  assert.equal(s.skills.length, 2);
  assert.equal(s.skills[0].enabled, true);
  assert.equal(s.skills[1].enabled, false);
});

test('isRestrictedSource', () => {
  assert.equal(isRestrictedSource('github'), true);
  assert.equal(isRestrictedSource('github-release'), true);
  assert.equal(isRestrictedSource('market'), false);
  assert.equal(isRestrictedSource('local'), false);
});

test('extractFence 忽略散文中的行内围栏字面量，只取行首围栏', () => {
  const md = [
    '# doc',
    '',
    '提及 yaml dsh-plugins 但这不是真围栏。',
    '还有 ```yaml dsh-plugins``` 行内也算噪声。',
    '',
    '```yaml dsh-plugins',
    'version: 1',
    'plugins: []',
    '```',
  ].join('\n');
  const body = extractFence(md, PLUGINS_FENCE);
  assert.ok(body, '应找到行首围栏');
  assert.match(body!, /version: 1/);
  assert.doesNotMatch(body!, /行内也算噪声/);
});
