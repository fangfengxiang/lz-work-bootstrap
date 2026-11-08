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
export interface DshContext {
    get<T = unknown>(name: string): T | undefined;
    commands: {
        register(name: string, handler: (argv: string[]) => void | Promise<void>): void;
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
export declare function buildHost(ctx: DshContext, cwd: string): DshHost;
/** 注册命令并分发子命令。 */
export declare function activate(ctx: DshContext): void;
export default activate;
//# sourceMappingURL=index.d.ts.map