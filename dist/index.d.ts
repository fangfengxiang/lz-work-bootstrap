import { DshHost } from './executor';
import { ParsedArgs } from './types';
/** 命令行用法错误。 */
export declare class UsageError extends Error {
    constructor(message: string);
}
/**
 * DSH 宿主上下文。字段尽量可选，以兼容不同运行时形态：
 *  - ctx.get(name)：Cordis 风格软依赖服务查找。
 *  - ctx.plugins / ctx.skills：若运行时直接提供能力，优先使用。
 */
/** DSH 命令执行结果。 */
export type CommandResult = {
    kind: 'success';
    text?: string;
} | {
    kind: 'error';
    text: string;
};
/** DSH 命令调用信息（由 commands 服务传入）。 */
export interface CommandInvocation {
    readonly rawInput: string;
    readonly agent?: unknown;
    readonly signal?: unknown;
    readonly commandId?: unknown;
    readonly attachments?: unknown;
}
/** DSH 命令定义（commands.register 的入参）。 */
export interface CommandDefinition {
    readonly definitionId?: string;
    readonly name: string;
    readonly description: string;
    readonly input?: {
        hint: string;
        attachments?: boolean;
    };
    readonly recordInput?: boolean;
    readonly handler: (invocation: CommandInvocation) => CommandResult | Promise<CommandResult>;
}
export interface DshContext {
    get<T = unknown>(name: string): T | undefined;
    commands: {
        register(definition: CommandDefinition): () => void;
    };
    log?: (msg: string) => void;
    plugins?: {
        isInstalled?(id: string): Promise<boolean> | boolean;
        getInstalledVersion?(id: string): Promise<string | undefined> | string | undefined;
        installViaMarket?(id: string, opts?: {
            version?: string;
            config?: Record<string, unknown>;
        }): Promise<{
            version?: string;
        } | void>;
        updateViaMarket?(id: string, opts?: {
            version?: string;
            config?: Record<string, unknown>;
        }): Promise<{
            version?: string;
        } | void>;
    };
    skills?: {
        syncViaSkillsConsole?(skill: unknown): Promise<void>;
    };
    ui?: {
        print?(text: string): void;
        /** 交互式询问用户；运行时可注入优于默认 readline 的实现。 */
        prompt?(message: string): Promise<string | undefined>;
    };
}
/** 解析命令行参数。 */
export declare function parseArgs(argv: string[]): ParsedArgs;
/** 把 ctx 提供的能力 + 文件系统探测组装为 DshHost。 */
export declare function buildHost(ctx: DshContext, cwd: string, sink?: (t: string) => void): DshHost;
/** 插件名（组合树 identity）。 */
export declare const name = "lz-work-bootstrap";
/** 硬依赖服务：commands。 */
export declare const inject: string[];
/** Cordis 插件入口：注册 lz-work 命令（加载期绝不抛错）。 */
export declare function apply(ctx: DshContext): void;
/** 兼容旧名。 */
export declare const activate: typeof apply;
/** 默认导出：Cordis 插件对象。 */
declare const _default: {
    name: string;
    inject: string[];
    apply: typeof apply;
};
export default _default;
//# sourceMappingURL=index.d.ts.map