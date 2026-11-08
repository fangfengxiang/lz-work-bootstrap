/**
 * verify：只报告健康状态，不直接改状态（验收 #12）。
 *
 * 读取 state + 本地存在性，输出每项的健康判定：
 *  - installed 但本地缺失 → 只报告，不改状态（区别于 install 的墓碑写入）
 *  - removed_by_user → 墓碑
 *  - failed → 待 resume
 *  - manual → 手动项
 *  - Skill manual_sync_required → 需手动同步
 */
import { StateManager } from './state';
import { DshHost } from './executor';
export interface VerifyReport {
    healthy: boolean;
    lines: string[];
    summary: string;
}
/**
 * 执行 verify。不改状态。
 */
export declare function verifyAll(host: DshHost, mgr: StateManager): Promise<VerifyReport>;
//# sourceMappingURL=verify.d.ts.map