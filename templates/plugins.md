# lz-work-bootstrap · 插件清单模板

> 本文件是 `lz-work install/plan` 的输入。只解析其中 `yaml dsh-plugins` 围栏代码块，
> 其余 Markdown 内容会被忽略。复制到你的工作台根目录后按需编辑。
>
> 实现原则：DSH 只解析清单，**不在代码中硬编码插件列表**。
> 下列包源均为 **2026-11-08 逐一核实过的真实地址**：
> - `source: market`：`id` 即真实 **npm 包名**（含 scope），经 dshmarket 市场安装；
>   格式一市场索引源：`https://cdn.jsdelivr.net/npm/dsh-plugin-catalog/index.json`
> - `source: github` / `github-release`：npm 未发布的 **github-only** 项目，
>   `id` 为 `org/repo`，用宿主 CLI 安装（命令写在各条 notes）。

```yaml dsh-plugins
version: 1
profile: dev-workbench

sources:
  market: dsh-market
  allow_github_orgs:
    - oxmumu3
    - KYCOMING
    - skyrocks
    - FSMargoo
    - Lawrence7y
    - konwait12

plugins:
  # ── 基础设施 ──
  - id: dshmarket
    source: market
    required: true
    manual: true
    notes: |
      市场本体（npm: dshmarket，仓库 github.com/dsh-market/dsh-market）。
      无法经 market 自举，先手动执行一次：
      dsh plugin --profile web add dshmarket
      市场索引源（可选，Discover → Index sources）：
      https://cdn.jsdelivr.net/npm/dsh-plugin-catalog/index.json

  - id: dsh-plugin-compat-check
    source: market
    required: true
    notes: |
      宿主版本兼容性预检。npm: dsh-plugin-compat-check，
      仓库 github.com/lcy0121/dsh-plugin-compat-check。

  - id: dsh-better-sidebar
    source: market
    required: true
    notes: |
      侧边栏增强。npm: dsh-better-sidebar，
      仓库 github.com/omdsh-dev/DSH-better-sidebar。

  # ── Skill 管理 ──
  - id: '@morehao/dsh-skills-console'
    source: market
    required: true
    notes: |
      Skill 管理控制台（sync-skills 的执行方）。
      npm: @morehao/dsh-skills-console，仓库 github.com/morehao/dsh-skills-console。

  # ── 子代理接入 ──
  - id: Lawrence7y/dsh-harness-pilot
    source: github
    required: true
    manual: true
    notes: |
      驾驭其他 agent harness（opencode / claude / codex / Cursor 等）。
      github-only（npm 未发布）。手动安装：
      dsh plugin --profile web add github:Lawrence7y/dsh-harness-pilot

  # ── 任务编排 ──
  - id: '@chenxu233/dsh-agent-teams'
    source: market
    required: true
    precheck: dsh-plugin-compat-check
    notes: |
      AgentTeams 多智能体协作（队长/成员、任务依赖、消息传递、树状监视）。
      npm: @chenxu233/dsh-agent-teams，仓库 github.com/ChenXu233/dsh-agent-teams。
      注意：与 @nanmicoder/dsh-agent-teams 注册同一 agent-teams 行，二选一，不得同装。

  # ── 开发增强 ──
  - id: FSMargoo/dsh-at-file
    source: github
    required: false
    manual: true
    notes: |
      Codex 风格 @file 引用（composer 内检索并引用工作区文件）。
      github-only。手动安装：
      dsh plugin --profile web add github:FSMargoo/dsh-at-file
      （npm 上另有近似功能包：dsh-at-file-everything）

  - id: '@liustack/modlens'
    source: market
    required: false
    notes: |
      纯文本模型的视觉桥梁（贴图 → OCR/版面/语义结构化 JSON）。
      npm: @liustack/modlens，仓库 github.com/liustack/modlens。

  - id: skyrocks/dsh-plugins
    source: github
    required: false
    manual: true
    notes: |
      skyrocks 插件合集（DeepSeek 余额/花费、OpenCode GO 额度等）。
      github-only。手动安装：
      dsh plugin --profile web add github:skyrocks/dsh-plugins

  # ── 产品侧翼 ──
  - id: konwait12/dsh-ai-pm
    source: github
    required: false
    manual: true
    notes: |
      pm-scaffold 的 PRD 工作流接入（ai_pm_* 模型工具）。
      github-only。手动安装：
      dsh plugin --profile web add github:konwait12/dsh-ai-pm

  - id: KYCOMING/dsh-product-design
    source: github
    required: false
    manual: true
    notes: |
      使用画布版 KYCOMING/dsh-product-design；
      不安装 Kayungko/dsh-plugin-product-design 工作流套件版。
      手动安装：dsh plugin --profile web add github:KYCOMING/dsh-product-design

  # ── 发现 / 知识 / 微信 ──
  - id: '@oxmumu3/dsh-plugin-finder'
    source: market
    required: false
    notes: |
      插件发现。npm: @oxmumu3/dsh-plugin-finder，
      仓库 github.com/oxmumu3/dsh-plugin-finder。

  - id: oxmumu3/ai-twin-starter
    source: github-release
    required: false
    manual: true
    notes: |
      AI 分身工作台（preview）。npm 名 @oxmumu3/dsh-agent-twin（v0.4.0-preview.6），
      仓库 github.com/oxmumu3/ai-twin-starter。
      dsh plugin --profile web add @oxmumu3/dsh-agent-twin

  - id: '@oxmumu3/dsh-project-companion'
    source: market
    required: false
    manual: true
    notes: |
      个人助理（项目/对话/记忆/回顾/资讯）。npm: @oxmumu3/dsh-project-companion，
      仓库 github.com/oxmumu3/dsh-project-companion。
      内置微信扫码授权：按安全底线须交互确认，故保持 manual。

  # ── 可选 ──
  - id: dsh-subagent-library
    source: market
    required: false
    notes: |
      子代理库。npm: dsh-subagent-library，
      仓库 github.com/MaRi23333/dsh-subagent-library。
```

<!--
  明确排除（不要加入上面的 plugins 列表）：
  dsh-aio-agent、oh-my-coharness、dsh-leader-agent、dsh-agent-crew、
  dsh-memery、dsh-cost-meter、DeepSeek-Harness-Token-Free、
  dsh-virtual-product-team、Kayungko/dsh-plugin-product-design（工作流套件版）。

  免费 Token 单独 profile：dsh-opencode-zen-free / dsh-multi-agent-gateway
  请放在 free-token 清单，不要混入 dev-workbench。

  包源核实记录（2026-11-08，awesome-dsh-plugin 索引 + GitHub API）：
  - 原 DSH-better-sidebar → npm 实名 dsh-better-sidebar（omdsh-dev/DSH-better-sidebar）
  - 原 dsh-skills-console → npm 实名 @morehao/dsh-skills-console（morehao/dsh-skills-console）
  - 原 modlens → npm 实名 @liustack/modlens（liustack/modlens）
  - 原 dsh-plugin-finder → npm 实名 @oxmumu3/dsh-plugin-finder（oxmumu3/dsh-plugin-finder）
  - 原 ai-twin-starter → npm 实名 @oxmumu3/dsh-agent-twin（仓库 oxmumu3/ai-twin-starter）
  - 原 dsh-project-companion → npm 实名 @oxmumu3/dsh-project-companion（oxmumu3/dsh-project-companion）
  - 原 dsh-at-file → github-only：FSMargoo/dsh-at-file（npm 近似包 dsh-at-file-everything）
  - 原 dsh-harness-pilot → github-only：Lawrence7y/dsh-harness-pilot
  - 原 dsh-ai-pm → github-only：konwait12/dsh-ai-pm
  - 原 dsh-agent-teams → @chenxu233/dsh-agent-teams（与 @nanmicoder 同名行互斥）
  - dsh-market 本体 → npm: dshmarket（github.com/dsh-market/dsh-market）
-->