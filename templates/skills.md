# lz-work-bootstrap · Skill 清单模板

> 本文件是 `lz-work sync-skills` 的输入。只解析其中 `yaml dsh-skills` 围栏代码块，
> 其余 Markdown 内容会被忽略。Skill 不走插件安装通道，由 `dsh-skills-console` 同步。

```yaml dsh-skills
version: 1
manager: dsh-skills-console

skills:
  - id: code-review
    source: github:your-org/skills/code-review
    enabled: true
    scope: project

  - id: prd-template
    source: github:your-org/skills/prd-template
    enabled: false
    scope: global
```
