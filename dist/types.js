"use strict";
/**
 * lz-work-bootstrap 共享类型定义。
 *
 * 本插件是“薄编排层”：只解析清单、维护状态机、调度外部能力（dsh-market /
 * dsh-skills-console），不重复实现下载与落盘。本文件定义贯穿各模块的数据契约。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExitCode = void 0;
/** 退出码约定。 */
exports.ExitCode = {
    Ok: 0,
    PartialFailure: 1,
    PrecheckBlocked: 2,
};
//# sourceMappingURL=types.js.map