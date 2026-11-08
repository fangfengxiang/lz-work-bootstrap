"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatPlanTable = formatPlanTable;
exports.formatInstallSummary = formatInstallSummary;
/** 动作 → 中文标签。 */
const ACTION_LABEL = {
    install: '安装',
    update: '更新',
    sync: '同步',
    skip: '跳过',
    manual: '手动安装',
    retry: '重试',
    fail: '阻断',
};
/** 资源 → 中文标签。 */
const RESOURCE_LABEL = {
    plugin: '插件',
    skill: 'Skill',
};
/** 把 PlanItem[] 渲染为 Markdown 表格字符串。 */
function formatPlanTable(items) {
    const header = '| 资源 | ID | 类型 | 状态 | 动作 | 原因 |\n|---|---|---|---|---|---|';
    const rows = items.map((it) => {
        const reason = it.hasConfigUpdate ? `${it.reason}【有配置更新但因已移除未应用】` : it.reason;
        return `| ${RESOURCE_LABEL[it.resource] ?? it.resource} | \`${it.id}\` | ${it.type} | ${it.status} | ${ACTION_LABEL[it.action] ?? it.action} | ${reason} |`;
    });
    return [header, ...rows].join('\n');
}
/** 渲染安装结果摘要。 */
function formatInstallSummary(result) {
    const parts = [];
    parts.push(`成功 ${result.succeeded.length}：${result.succeeded.join(', ') || '（无）'}`);
    parts.push(`失败 ${result.failed.length}：${result.failed.join(', ') || '（无）'}`);
    parts.push(`跳过 ${result.skipped.length}：${result.skipped.join(', ') || '（无）'}`);
    parts.push(`手动 ${result.manual.length}：${result.manual.join(', ') || '（无）'}`);
    parts.push(`退出码：${result.exitCode}`);
    return parts.join('\n');
}
//# sourceMappingURL=ui.js.map