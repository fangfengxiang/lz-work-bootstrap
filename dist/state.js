"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateManager = exports.MemoryStateIO = exports.FsStateIO = void 0;
exports.emptyState = emptyState;
exports.canonicalize = canonicalize;
exports.djb2 = djb2;
exports.computeEntryHash = computeEntryHash;
exports.computeSkillHash = computeSkillHash;
exports.resolvePlugin = resolvePlugin;
exports.loadState = loadState;
exports.normalizeState = normalizeState;
exports.saveState = saveState;
exports.pluginsByStatus = pluginsByStatus;
/**
 * 状态文件与状态机。
 *
 * 职责：
 *  - 加载/保存 `.dsh/lz-work-bootstrap-state.json`（schema version 2）。
 *  - 维护插件/Skill 状态与状态机迁移。
 *  - 墓碑（removed_by_user）逻辑：检测、清除、removalLog 只追加。
 *  - 配置 hash 计算，用于判断是否需要更新。
 *
 * 设计：StateManager 只持有内存中的 StateFile，IO 通过 StateIO 注入，
 * 便于单元测试用内存存储替换真实文件系统。
 */
const fs_1 = require("fs");
const path = __importStar(require("path"));
const config_1 = require("./config");
/** 基于文件系统的 StateIO 实现。 */
class FsStateIO {
    constructor(filePath) {
        this.filePath = filePath;
    }
    async read() {
        try {
            return await fs_1.promises.readFile(this.filePath, 'utf8');
        }
        catch (e) {
            if (e.code === 'ENOENT')
                return null;
            throw e;
        }
    }
    async write(content) {
        await fs_1.promises.mkdir(path.dirname(this.filePath), { recursive: true });
        await fs_1.promises.writeFile(this.filePath, content, 'utf8');
    }
}
exports.FsStateIO = FsStateIO;
/** 内存 StateIO，用于测试。 */
class MemoryStateIO {
    constructor(initial) {
        this.buf = null;
        this.buf = initial ?? null;
    }
    async read() {
        return this.buf;
    }
    async write(content) {
        this.buf = content;
    }
}
exports.MemoryStateIO = MemoryStateIO;
/** 创建空状态文件。 */
function emptyState() {
    return { version: config_1.STATE_SCHEMA_VERSION, profiles: {} };
}
/** 规范化对象为稳定字符串（键排序），用于 hash。 */
function canonicalize(value) {
    if (value === null || typeof value !== 'object')
        return JSON.stringify(value);
    if (Array.isArray(value)) {
        return '[' + value.map(canonicalize).join(',') + ']';
    }
    const obj = value;
    const keys = Object.keys(obj).sort();
    return ('{' +
        keys.map((k) => JSON.stringify(k) + ':' + canonicalize(obj[k])).join(',') +
        '}');
}
/** djb2 哈希，返回十六进制字符串。无外部依赖，便于测试。 */
function djb2(input) {
    let h = 5381;
    for (let i = 0; i < input.length; i++) {
        h = ((h << 5) + h + input.charCodeAt(i)) >>> 0;
    }
    return h.toString(16);
}
/** 计算清单条目的配置 hash（source + version + config）。 */
function computeEntryHash(entry) {
    return djb2(canonicalize({
        id: entry.id,
        source: entry.source,
        version: entry.version ?? null,
        config: entry.config ?? null,
    }));
}
/** 计算 Skill 条目 hash。 */
function computeSkillHash(entry) {
    return djb2(canonicalize({
        id: entry.id,
        source: entry.source,
        scope: entry.scope ?? null,
    }));
}
/**
 * 核心：按“本地是否存在 × state 状态”检测矩阵解析单个插件。
 * 纯函数：读取 st（当前状态）与 local（探测结果）、newHash（清单 hash），
 * 返回解析判定。不修改入参。
 *
 * 注意：manual 项由 plan 阶段在调用前过滤，本函数只处理非 manual 项。
 */
function resolvePlugin(entry, st, local, newHash) {
    const id = entry.id;
    // 1) 墓碑状态
    if (st?.status === 'removed_by_user') {
        if (local.exists) {
            // 用户手动装回来了 → 清除墓碑，恢复管理
            const hashChanged = st.hash !== undefined && st.hash !== newHash;
            return {
                displayStatus: 'installed',
                action: hashChanged ? 'update' : 'skip',
                reason: '你手动装回了该插件，已自动恢复管理'
                    + (hashChanged ? '；清单配置已变化，将按需更新' : ''),
                transition: 'clear-tombstone',
            };
        }
        // 仍处于墓碑：跳过，不安装不更新
        const configChanged = st.hash !== undefined && st.hash !== newHash;
        return {
            displayStatus: 'removed_by_user',
            action: 'skip',
            reason: '你已本地移除；手动装回后自动恢复管理'
                + (configChanged ? '（有配置更新但因已移除未应用）' : ''),
            hasConfigUpdate: configChanged,
        };
    }
    // 2) 已安装
    if (st?.status === 'installed') {
        if (local.exists) {
            const manifestNewer = entry.version !== undefined &&
                st.version !== undefined &&
                entry.version > st.version;
            const hashChanged = st.hash !== newHash;
            if (manifestNewer || hashChanged) {
                return {
                    displayStatus: 'installed',
                    action: 'update',
                    reason: manifestNewer
                        ? '清单版本更高'
                        : '清单配置 hash 已变化',
                };
            }
            return {
                displayStatus: 'installed',
                action: 'skip',
                reason: '已安装且版本一致',
            };
        }
        // 本地缺失但 state 记 installed → 检测到被移除，写墓碑
        return {
            displayStatus: 'removed_by_user',
            action: 'skip',
            reason: '检测到本地已移除，已标记墓碑（install 时写入）',
            transition: 'mark-tombstone',
        };
    }
    // 3) 失败
    if (st?.status === 'failed') {
        return {
            displayStatus: 'failed',
            action: 'retry',
            reason: '上次安装失败，待重试'
                + (st.failureReason ? `：${st.failureReason}` : ''),
        };
    }
    // 4) pending 或无记录
    if (st?.status === 'pending' || st === undefined) {
        if (local.exists) {
            // 手动安装的清单内插件 → 纳入受管
            return {
                displayStatus: 'installed',
                action: 'skip',
                reason: '本地已存在，纳入受管（install 时记录）',
                transition: 'adopt-installed',
            };
        }
        return {
            displayStatus: 'pending',
            action: 'install',
            reason: '从未安装',
        };
    }
    // 5) state.manual（清单曾标记 manual 落库）—— 由 plan 过滤，兜底
    return {
        displayStatus: 'manual',
        action: 'skip',
        reason: '手动项，只提示',
    };
}
/**
 * 状态管理器：在内存 StateFile 上提供状态机操作。
 * 不直接做 IO；由调用方 load/save。
 */
class StateManager {
    constructor(state, profile) {
        this.state = state;
        this.profile = profile;
    }
    /** 取得（必要时创建）当前 profile 的状态分区。 */
    profileState() {
        let p = this.state.profiles[this.profile];
        if (!p) {
            p = { plugins: {}, skills: {}, removalLog: [] };
            this.state.profiles[this.profile] = p;
        }
        return p;
    }
    getPlugin(id) {
        return this.profileState().plugins[id];
    }
    setPlugin(id, st) {
        this.profileState().plugins[id] = st;
    }
    /** 标记安装成功。 */
    markInstalled(id, version, hash) {
        this.setPlugin(id, {
            status: 'installed',
            version,
            hash,
            lastInstalledAt: new Date().toISOString(),
        });
    }
    /** 标记安装失败。 */
    markFailed(id, reason) {
        const prev = this.getPlugin(id);
        this.setPlugin(id, {
            status: 'failed',
            version: prev?.version,
            hash: prev?.hash,
            lastInstalledAt: prev?.lastInstalledAt,
            failureReason: reason,
            failedAttempts: (prev?.failedAttempts ?? 0) + 1,
        });
    }
    /** 标记为墓碑，并追加 removalLog（只追加）。 */
    markRemovedByUser(id, lastKnownVersion, reason) {
        const prev = this.getPlugin(id);
        const now = new Date().toISOString();
        this.setPlugin(id, {
            status: 'removed_by_user',
            lastKnownVersion: lastKnownVersion ?? prev?.version,
            version: undefined,
            hash: prev?.hash,
            lastInstalledAt: prev?.lastInstalledAt,
            removedDetectedAt: now,
            removalReason: reason,
        });
        this.appendRemovalLog({
            id,
            detectedAt: now,
            lastKnownVersion: lastKnownVersion ?? prev?.version,
            note: `${reason} → tombstoned`,
        });
    }
    /** 清除墓碑：仅把状态改回 installed，不动 removalLog 历史。 */
    clearTombstone(id, version, hash) {
        const prev = this.getPlugin(id);
        this.setPlugin(id, {
            status: 'installed',
            version,
            hash,
            lastInstalledAt: new Date().toISOString(),
            // 保留历史线索（不影响状态机）
            removedDetectedAt: prev?.removedDetectedAt,
        });
    }
    /** 纳入受管：本地已存在但无记录。 */
    adoptInstalled(id, version, hash) {
        this.setPlugin(id, {
            status: 'installed',
            version,
            hash,
            lastInstalledAt: new Date().toISOString(),
        });
    }
    /** 标记为手动项（持久化以便 verify 报告；不影响安装）。 */
    markManual(id) {
        const prev = this.getPlugin(id);
        this.setPlugin(id, {
            status: 'manual',
            version: prev?.version,
            hash: prev?.hash,
            lastInstalledAt: prev?.lastInstalledAt,
        });
    }
    /** 追加 removalLog 记录（只追加，永不修改历史）。 */
    appendRemovalLog(entry) {
        this.profileState().removalLog.push(entry);
    }
    /** 取得所有 failed 插件（用于 resume）。 */
    getFailedPlugins() {
        const ps = this.profileState();
        return Object.entries(ps.plugins)
            .filter(([, st]) => st.status === 'failed')
            .map(([id, st]) => ({ id, st }));
    }
    // ── Skill 状态 ──
    getSkill(id) {
        return this.profileState().skills[id];
    }
    markSkillSynced(id, hash) {
        this.profileState().skills[id] = {
            status: 'synced',
            hash,
            lastSyncedAt: new Date().toISOString(),
        };
    }
    markSkillFailed(id, reason) {
        const prev = this.getSkill(id);
        this.profileState().skills[id] = {
            status: 'failed',
            source: prev?.source,
            hash: prev?.hash,
            failureReason: reason,
        };
    }
    markSkillManualSync(id) {
        this.profileState().skills[id] = {
            status: 'manual_sync_required',
            ...this.getSkill(id),
        };
    }
}
exports.StateManager = StateManager;
/** 从 IO 加载状态并包装为 StateManager。文件不存在则新建空状态。 */
async function loadState(io, profile) {
    const raw = await io.read();
    if (raw === null) {
        return new StateManager(emptyState(), profile);
    }
    let parsed;
    try {
        parsed = JSON.parse(raw);
    }
    catch (e) {
        throw new Error(`状态文件解析失败：${e.message}`);
    }
    const state = normalizeState(parsed);
    return new StateManager(state, profile);
}
/** 将任意已解析对象规范化为合法 StateFile（补全缺失字段）。 */
function normalizeState(parsed) {
    if (!parsed || typeof parsed !== 'object') {
        return emptyState();
    }
    const obj = parsed;
    const version = obj.version === 2 ? 2 : config_1.STATE_SCHEMA_VERSION;
    const profilesRaw = (obj.profiles ?? {});
    const profiles = {};
    for (const [name, pv] of Object.entries(profilesRaw)) {
        const p = (pv ?? {});
        profiles[name] = {
            plugins: (p.plugins ?? {}),
            skills: (p.skills ?? {}),
            removalLog: Array.isArray(p.removalLog)
                ? p.removalLog
                : [],
        };
    }
    return { version, profiles };
}
/** 保存状态到 IO。 */
async function saveState(mgr, io) {
    const content = JSON.stringify(mgr.state, null, 2);
    await io.write(content);
}
/** 列出某状态下的插件 id（辅助 verify）。 */
function pluginsByStatus(mgr, status) {
    const ps = mgr.profileState();
    return Object.entries(ps.plugins)
        .filter(([, st]) => st.status === status)
        .map(([id]) => id);
}
//# sourceMappingURL=state.js.map