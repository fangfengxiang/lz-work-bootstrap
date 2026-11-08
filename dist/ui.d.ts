/**
 * plan 表格格式化：按需求文档 §5 输出计划表。
 * 墓碑项与手动项必须显式可见。
 */
import { PlanItem } from './types';
/** 把 PlanItem[] 渲染为 Markdown 表格字符串。 */
export declare function formatPlanTable(items: PlanItem[]): string;
/** 渲染安装结果摘要。 */
export declare function formatInstallSummary(result: {
    succeeded: string[];
    failed: string[];
    skipped: string[];
    manual: string[];
    exitCode: number;
}): string;
//# sourceMappingURL=ui.d.ts.map