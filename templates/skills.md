# lz-work-bootstrap · Skill 清单模板

> 本文件是 `lz-work sync-skills` 的输入。只解析其中 `yaml dsh-skills` 围栏代码块，
> 其余 Markdown 内容会被忽略。Skill 不走插件安装通道，由 `dsh-skills-console` 同步
> （npm 实名 `@morehao/dsh-skills-console`）。
>
> 本版条目为 **2026-11-08 核实的真实来源**：
> - `openspec` 来自 SkillHub（本机 `_skillhub_meta.json` 的 source: skillhub）；
> - `remote-shell` 为本地自管技能（`~/.dsh/skills/remote-shell`，无上游仓库）；
> - `gst-code-migrate` 来自内部 GitLab（git.gstzy.cn，分组 `gst-dev-skills`）。
>
> 内部分组的两种写法：
> - 填具体分组（如本版的 `gst-dev-skills`）→ 直接解析并代入内部技能源；
> - 填 `__ask__` → `sync-skills` 启动时交互式询问用户输入分组，
>   prompt 不可用或用户留空时，内部技能降级为 `manual_sync_required`。
>
> `version: 1` 的扁平 `skills:` 列表仍向后兼容（不区分分类）。

```yaml dsh-skills
version: 2
manager: dsh-skills-console

categories:
  # ── 通用技能 ──
  general:
    skills: []

  # ── 开发技能 ──
  dev:
    skills:
      - id: openspec
        source: skillhub:openspec
        enabled: true
        scope: project
      - id: remote-shell
        source: local:~/.dsh/skills/remote-shell
        enabled: true
        scope: project

  # ── 内部技能（内部 GitLab 仓库）──
  internal:
    gitlab_group: gst-dev-skills
    skills:
      - id: gst-code-migrate
        source: gitlab:gst-dev-skills/gst-code-migrate
        enabled: true
        scope: project
```

<!-- 模板前一版此处为通用占位技能（browse/use/cr/review，来源 your-org/skills/*）：
     2026-11-08 核实无法确认真实仓库，已移除，换成本机实际在用的三个技能。
     需要通用技能时，从 SkillHub 或你自己的技能仓库补回，并核实来源地址。 -->