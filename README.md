# lz-work-bootstrap

> 按 `plugins.md` / `skills.md` 编排插件安装、Skill 同步、失败续跑、验证与移除墓碑的**薄编排插件**。

`lz-work-bootstrap` 是一个薄编排层：它只解析清单、维护状态机、调度外部能力，
**不重复实现插件下载和 Skill 落盘**。

- 插件安装 / 更新 → 复用 `dsh-market`（软依赖）
- Skill 同步 → 复用 `dsh-skills-console`（软依赖，不可用时降级）
- 状态记录 / 墓碑 / 续跑 → 本插件维护 `.dsh/lz-work-bootstrap-state.json`

## 安装

```bash
npm install
npm run build      # 产出 dist/
npm test           # 运行单元测试
```

把编译产物 `dist/` 与 `plugin.json` 注册到 DSH 即可用 `lz-work` 命令。

## 命令

```bash
lz-workplan         --plugins plugins.md --skills skills.md [--profile dev-workbench]
lz-workinstall      --plugins plugins.md --skills skills.md [--profile dev-workbench] [--continue-on-error]
lz-workinstall      --plugins plugins.md
lz-worksync-skills  --skills skills.md
lz-workresume       [--plugins plugins.md] [--continue-on-error]
lz-workverify
```

| 子命令 | 读取 | 写状态 | 行为 |
|---|---|---|---|
| `plan` | 清单 + state + 本地存在性 | 否 | 只输出计划表，不安装、不改状态 |
| `install` | 清单 + state + 本地存在性 | 是 | 安装/更新非墓碑、非手动项；失败写 `failed` |
| `sync-skills` | `skills.md` + state | 是 | 调 `dsh-skills-console` 同步 Skill |
| `resume` | state（可选清单） | 是 | 只重试 `failed` 项，不碰墓碑 |
| `verify` | state + 本地存在性 | 否 | 只报告健康状态，不直接改状态 |

退出码：`0` 全部成功；`1` 部分失败；`2` 预检阻断 / 必需依赖缺失。

## 清单格式

只解析 Markdown 中的围栏代码块，其余内容忽略。

### `plugins.md`

````md
```yaml dsh-plugins
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
    notes: |
      安装前必须通过宿主版本兼容性预检。

  - id: dsh-project-companion
    source: github-release
    required: false
    manual: true
```
````

字段约定：

| 字段 | 说明 |
|---|---|
| `id` | 插件 ID，必填 |
| `source` | `market` / `github` / `github-release` / `local` |
| `required` | `true` 时安装失败阻断后续必需项；不代表必须自动安装 |
| `manual` | `true` 时 `install` 只提示，不执行安装 |
| `precheck` | 安装前需运行的预检插件或命令名 |
| `profile` | 过滤：仅当当前 `--profile` 匹配或未指定时处理 |
| `config` | 普通配置；密钥只允许 `keychain:` / `env:` 引用 |
| `notes` | 人类可读说明，不参与执行 |

### `skills.md`

````md
```yaml dsh-skills
version: 1
manager: dsh-skills-console

skills:
  - id: code-review
    source: github:your-org/skills/code-review
    enabled: true
    scope: project
```
````

Skill 不走插件安装通道。`install` 只确保 `dsh-skills-console` 已安装；`sync-skills` 把清单交给 `dsh-skills-console`。

## 状态机与墓碑

状态文件：`.dsh/lz-work-bootstrap-state.json`（schema version 2）。

| 状态 | 含义 | 下次 `plan/install` 行为 |
|---|---|---|
| `pending` | 清单内有，从未装过 | 安装 |
| `installed` | 已装且受管 | 比对版本/hash，决定是否更新 |
| `failed` | 安装失败 | `resume` 时重试 |
| `removed_by_user` | 墓碑：检测到用户本地移除 | 跳过，不安装、不更新 |
| `manual` | 清单标记手动安装 | 只提示，不自动装 |

**墓碑规则：**

- 墓碑是**用户意图**，优先级高于清单配置变更。
- 即使清单配置 hash 变化，只要 state 是 `removed_by_user`，仍跳过；`plan` 提示“有配置更新但因已移除未应用”。
- 清除墓碑的唯一自动路径：检测到本地重新存在该插件。不需要额外 `unblock` 命令。
- `removalLog` 只追加，不修改历史。

检测矩阵（本地是否存在 × state 状态）：

| 本地存在 | state 状态 | 动作 |
|---|---|---|
| 是 | `installed` | 比对版本/hash，按需更新 |
| 是 | `removed_by_user` | 清除墓碑 → `installed`，正常管理 |
| 是 | 无记录 | 记录为 `installed` |
| 否 | `installed` | 标记 `removed_by_user`，写 `removalLog`，跳过 |
| 否 | `removed_by_user` | 跳过 |
| 否 | `pending` | 安装 |
| 否 | `failed` | `resume` 时重试 |
| 任意 | `manual` | 只提示 |

## 安全底线

1. **来源白名单**：只允许 `market` 与 `allow_github_orgs` 中的 GitHub 来源。
2. **不执行任意 shell**：不自动运行 `postinstall`，需要执行的项标 `manual`。
3. **密钥不落盘**：只接受 `keychain:` / `env:` 引用，拒绝明文；state、日志、plan 输出中不出现密钥。
4. **不自动接受条款**：数据条款、地区限制、OAuth/扫码授权必须交互确认。
5. **免费 Token 单独 profile**：`free-token` 清单不混入 `dev-workbench` 自动安装。
6. **预编译二进制项目**：如 `DeepSeek-Harness-Token-Free` 默认排除。
7. **墓碑优先**：`removed_by_user` 不被配置更新覆盖。
8. **幂等**：重复运行不重复安装；hash 未变则跳过。

## 目录结构

```
lz-work-bootstrap/
├── plugin.json          # 插件声明：命令 + 软依赖
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts         # activate()：命令注册、参数解析、宿主组装、子命令分发
│   ├── types.ts         # 共享类型
│   ├── config.ts        # 常量与默认值
│   ├── manifest.ts      # 解析 plugins.md / skills.md（围栏提取 + YAML + 校验）
│   ├── plan.ts          # buildPlan：清单 + state + 本地探测 → 计划表（只读）
│   ├── state.ts         # 状态文件 + 状态机 + 墓碑 + removalLog
│   ├── executor.ts      # 执行安装/更新/同步，软依赖降级
│   ├── verify.ts        # 健康报告（只读）
│   └── ui.ts            # 计划表与摘要格式化
├── templates/
│   ├── plugins.md       # 插件清单模板（dev-workbench）
│   └── skills.md        # Skill 清单模板
├── tests/               # 单元测试（node:test）
└── README.md
```

## 与 `dsh-market` / `dsh-skills-console` 的协作

`plugin.json` 把二者声明为软依赖：

- 缺 `dsh-market`：`install` 把该项标 `failed`，提示先装 market；不自行 git clone 或下载。
- 缺 `dsh-skills-console`：`sync-skills` 降级为“生成可消费清单 + 提示手动同步”，状态标 `manual_sync_required`。
- `precheck` 指定的预检不通过：阻断该项，写 `failed` 或返回退出码 `2`。

宿主能力优先取自 `ctx.plugins` / `ctx.skills` / `ctx.get(name)`；若运行时未提供，
降级为基于文件系统的尽力探测（检查 `DSH_PLUGINS_DIR` 或 `~/.dsh/plugins/<id>`），
真实运行时应注入准确的本地存在性适配器。

## 验收标准

详见需求文档 §10。单元测试覆盖：

- `plan` 解析两份清单、输出计划表、不写状态；
- 首次 `install` 安装非手动项、写 `installed`；重复运行幂等；
- 本地删除已装插件 → `removed_by_user`，`install` 跳过；手动装回 → 自动清墓碑；
- 墓碑期间配置变化 → `plan` 提示、`install` 仍跳过；
- `failed` 经 `resume` 重试，`resume` 不碰墓碑；
- `manual: true` 只提示；`precheck` 不通过退出码 2；
- `sync-skills` 优先 console，不可用降级；密钥不落盘。

## 命名说明

- 包/插件名：`lz-work-bootstrap`（`lz` 取自「靓仔」liangzai 的缩写）。
- 命令：`lz-work`。
- 状态文件：`.dsh/lz-work-bootstrap-state.json`。
- 仓库：`lz-work-bootstrap`（GitHub 仓库已与包名统一）。

## License

MIT
