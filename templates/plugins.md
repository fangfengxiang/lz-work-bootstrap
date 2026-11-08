# lz-work-bootstrap · 插件清单模板

> 本文件是 `lz-work install/plan` 的输入。只解析其中 `yaml dsh-plugins` 围栏代码块，
> 其余 Markdown 内容会被忽略。复制到你的工作台根目录后按需编辑。
>
> 实现原则：DSH 只解析清单，**不在代码中硬编码插件列表**。下列 ID 与来源以实际仓库、
> 市场可用性为准。

```yaml dsh-plugins
version: 1
profile: dev-workbench

sources:
  market: dsh-market
  allow_github_orgs:
    - oxmumu3
    - KYCOMING

plugins:
  # ── 基础设施 ──
  - id: dsh-market
    source: market
    required: true

  - id: dsh-plugin-compat-check
    source: market
    required: true

  - id: DSH-better-sidebar
    source: market
    required: true

  # ── Skill 管理 ──
  - id: dsh-skills-console
    source: market
    required: true

  # ── 子代理接入 ──
  - id: dsh-harness-pilot
    source: market
    required: true

  # ── 任务编排 ──
  - id: dsh-agent-teams
    source: market
    required: true
    precheck: dsh-plugin-compat-check

  # ── 开发增强 ──
  - id: dsh-at-file
    source: market
    required: false

  - id: modlens
    source: market
    required: false

  - id: skyrocks/dsh-plugins
    source: github
    required: false
    manual: true

  # ── 产品侧翼 ──
  - id: dsh-ai-pm
    source: market
    required: false

  - id: dsh-product-design
    source: github
    required: false
    manual: true
    notes: |
      使用画布版 KYCOMING/dsh-product-design；
      不安装 Kayungko/dsh-plugin-product-design 工作流套件版。

  # ── 发现 / 知识 / 微信 ──
  - id: dsh-plugin-finder
    source: market
    required: false

  - id: ai-twin-starter
    source: github-release
    required: false
    manual: true

  - id: dsh-project-companion
    source: github-release
    required: false
    manual: true

  # ── 可选 ──
  - id: dsh-subagent-library
    source: market
    required: false
```

<!--
  明确排除（不要加入上面的 plugins 列表）：
  dsh-aio-agent、oh-my-coharness、dsh-leader-agent、dsh-agent-crew、
  dsh-memery、dsh-cost-meter、DeepSeek-Harness-Token-Free、
  dsh-virtual-product-team、Kayungko/dsh-plugin-product-design（工作流套件版）。

  免费 Token 单独 profile：dsh-opencode-zen-free / dsh-multi-agent-gateway
  请放在 free-token 清单，不要混入 dev-workbench。
-->
