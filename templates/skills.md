# lz-work-bootstrap · Skill 清单模板

> 本文件是 `lz-work sync-skills` 的输入。只解析其中 `yaml dsh-skills` 围栏代码块，
> 其余 Markdown 内容会被忽略。Skill 不走插件安装通道，由 `dsh-skills-console` 同步。
>
> Skill 分三类（清单 `version: 2` 用 `categories` 组织）：
>
> - **通用技能（general）**：通用辅助能力，通常 `scope: global`。
> - **开发技能（dev）**：面向开发流程的能力，通常 `scope: project`。
> - **内部技能（internal）**：来自内部 GitLab 仓库。其 `gitlab_group`：
>   - 填具体分组（如 `my-org/skills`）→ 直接解析；
>   - 填 `__ask__` → `sync-skills` 启动时交互式询问用户输入分组，
>     再代入内部技能源中的 `${gitlab_group}`。prompt 不可用或用户留空时，
>     内部技能降级为 `manual_sync_required`。
>
> `version: 1` 的扁平 `skills:` 列表仍向后兼容（不区分分类）。

```yaml dsh-skills
version: 2
manager: dsh-skills-console

categories:
  # ── 通用技能 ──
  general:
    skills:
      - id: browse
        source: github:your-org/skills/browse
        enabled: true
        scope: global
      - id: use
        source: github:your-org/skills/use
        enabled: true
        scope: global

  # ── 开发技能 ──
  dev:
    skills:
      - id: openspec
        source: github:your-org/skills/openspec
        enabled: true
        scope: project
      - id: cr
        source: github:your-org/skills/cr
        enabled: true
        scope: project
      - id: review
        source: github:your-org/skills/review
        enabled: true
        scope: project

  # ── 内部技能（内部 GitLab 仓库）──
  internal:
    gitlab_group: __ask__   # 启动时询问用户；也可填具体分组，如 my-org/skills
    skills:
      - id: example-internal-skill
        source: gitlab:${gitlab_group}/skills/example-internal-skill
        enabled: true
        scope: project
```
