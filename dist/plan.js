"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchesProfile = matchesProfile;
exports.effectiveManual = effectiveManual;
exports.buildPlan = buildPlan;
/**
 * 计划构建：把清单 + 状态 + 本地存在性探测，融合为一份 PlanItem[]。
 *
 * 关键约束（验收 #1）：plan 只输出计划表，**不写状态**。本模块全程只读：
 *  - resolvePlugin 是纯函数；
 *  - LocalProbe 只做存在性/版本探测；
 *  - 不调用 StateManager 的任何写方法。
 *
 * 墓碑项与手动项必须显式出现在计划表中，不得静默跳过（验收 #4、#8）。
 */
const config_1 = require("./config");
const manifest_1 = require("./manifest");
const state_1 = require("./state");
/**
 * 判断某插件条目在当前 profile 下是否应被处理。
 * profile 过滤：条目未指定 profile → 始终处理；指定了 → 仅当与当前 profile 一致。
 * 免费 Token（free-token）清单不得混入主工作台（验收 #15）。
 */
function matchesProfile(entry, profile) {
    if (entry.profile === undefined)
        return true;
    return entry.profile === profile;
}
/**
 * 解析“有效 manual”：
 *  - 显式 manual:true → manual
 *  - 受限来源（github / github-release）默认 manual，除非显式 manual:false
 *    且来源在 allow_github_orgs 白名单内
 */
function effectiveManual(entry, allowGithubOrgs) {
    if (entry.manual === true)
        return true;
    if (!(0, manifest_1.isRestrictedSource)(entry.source))
        return false;
    if (entry.manual === false) {
        // 受限来源但显式要求自动安装：必须在白名单内
        const org = entry.id.includes('/') ? entry.id.split('/')[0] : entry.id;
        return !(allowGithubOrgs && allowGithubOrgs.includes(org));
    }
    // 受限来源且未显式 manual:false → 默认 manual
    return true;
}
async function probeLocal(probe, id) {
    const exists = await probe.isInstalled(id);
    let version;
    if (exists && probe.getInstalledVersion) {
        try {
            version = await probe.getInstalledVersion(id);
        }
        catch {
            version = undefined;
        }
    }
    return { exists, version };
}
function pluginPlanItem(entry, resolved) {
    return {
        resource: 'plugin',
        id: entry.id,
        type: 'plugin',
        status: resolved.displayStatus,
        action: resolved.action,
        reason: resolved.reason,
        entry,
        required: entry.required,
        manual: entry.manual,
        hasConfigUpdate: resolved.hasConfigUpdate,
        transition: resolved.transition,
    };
}
function skillPlanItem(skill, status, action, reason) {
    return {
        resource: 'skill',
        id: skill.id,
        type: 'skill',
        status,
        action,
        reason,
        entry: skill,
    };
}
/**
 * 构建计划。只读，不修改 state。
 */
async function buildPlan(mgr, input, probe) {
    const items = [];
    const allowOrgs = input.plugins.sources.allow_github_orgs;
    for (const entry of input.plugins.plugins) {
        if (!matchesProfile(entry, input.profile))
            continue;
        if (effectiveManual(entry, allowOrgs)) {
            items.push({
                resource: 'plugin',
                id: entry.id,
                type: 'plugin',
                status: 'manual',
                action: 'manual',
                reason: entry.notes?.trim()
                    ? `手动安装：${entry.notes.trim().split('\n')[0]}`
                    : '手动项，只提示不自动安装',
                entry,
                required: entry.required,
                manual: true,
            });
            continue;
        }
        const st = mgr.getPlugin(entry.id);
        const local = await probeLocal(probe, entry.id);
        const newHash = (0, state_1.computeEntryHash)(entry);
        const resolved = (0, state_1.resolvePlugin)(entry, st, local, newHash);
        items.push(pluginPlanItem(entry, resolved));
    }
    if (input.skills) {
        for (const skill of input.skills.skills) {
            const newHash = (0, state_1.computeSkillHash)(skill);
            const st = mgr.getSkill(skill.id);
            const tag = skill.category === 'internal' ? '【内部技能】' : '';
            if (!skill.enabled) {
                items.push(skillPlanItem(skill, 'disabled', 'skip', `${tag}清单已禁用（enabled:false）`));
                continue;
            }
            const needAsk = skill.category === 'internal' &&
                input.skills.internalGitlabGroup === config_1.GITLAB_GROUP_ASK;
            if (st?.status === 'synced' && st.hash === newHash) {
                items.push(skillPlanItem(skill, 'synced', 'skip', `${tag}已同步且未变化`));
            }
            else {
                const base = st?.status === 'synced' ? 'Skill 内容变化，需重新同步' : '未同步';
                const suffix = needAsk ? '（sync-skills 时询问 GitLab 分组）' : '';
                items.push(skillPlanItem(skill, st?.status ?? 'pending', 'sync', `${tag}${base}${suffix}`));
            }
        }
    }
    return items;
}
//# sourceMappingURL=plan.js.map