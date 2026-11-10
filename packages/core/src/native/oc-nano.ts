export * as OcNano from "./oc-nano.js"

import load from "./oc-nano-binding.js"

/**
 * Native addon surface exposed by `oc_nano_native.node`.
 *
 * Every binding is synchronous. `promptGetAttachment` throws when the
 * attachment is unknown; the wrappers below translate that into `undefined`.
 */
export interface Native {
  readonly binaryName: () => string
  readonly configDirName: () => string
  readonly dataDirName: () => string
  readonly historyInit: (dbPath: string, cacheSizeKb: number) => number
  readonly historyClose: (handle: number) => boolean
  readonly historyStoreMessage: (handle: number, messageJson: string) => void
  readonly historyLoadConversation: (handle: number, conversationId: string) => string
  readonly historySpillConversation: (handle: number, conversationId: string, messagesJson: string) => number
  readonly historyPruneBefore: (handle: number, cutoff: string) => number
  readonly historyPruneOld: (handle: number, ttlSeconds: number) => number
  readonly schemaCacheHash: (toolsJson: string) => number
  readonly schemaCacheGet: (model: string, toolSetHash: number) => string | null
  readonly schemaCachePut: (model: string, toolSetHash: number, schemaJson: string, ttlSecs: number) => void
  readonly schemaCacheEvictExpired: () => number
  readonly statePoolInit: (capacity: number, defaultTtlSecs: number) => number
  readonly statePoolAcquire: (poolId: number, instanceId: string, configJson: string, ttlSecs: number) => string
  readonly statePoolRelease: (poolId: number, instanceId: string) => void
  readonly statePoolPrune: (poolId: number) => number
  readonly statePoolLen: (poolId: number) => number
  readonly promptInit: () => void
  readonly promptAddMessage: (conversationId: number, role: string, content: string) => number
  readonly promptMaterialize: (conversationId: number) => string
  /**
   * The bytes cross as a plain array of numbers; only a build that takes a typed array accepts one, and it
   * rejects the other shape.
   */
  readonly promptAddAttachment: (conversationId: number, attachmentId: string, bytes: Uint8Array | number[]) => void
  readonly promptGetAttachment: (attachmentId: string) => Uint8Array | number[]
  readonly compactSpill: (messagesJson: string, targetBytes: number) => string
  readonly compactPruneOld: (messagesJson: string, targetBytes: number) => string
  readonly instructionsLoad: (path: string) => string
  readonly instructionsEvict: (path: string) => boolean
}

let cached: Native | undefined
let resolved = false

/**
 * Returns the native addon, or `undefined` when it is unavailable.
 *
 * The addon is an optimisation: every call site must keep working when it is
 * missing, so failures are swallowed and the caller falls back to the plain
 * TypeScript implementation.
 */
export function native(): Native | undefined {
  if (resolved) return cached
  resolved = true
  try {
    const loaded = load() as Native | undefined
    cached = loaded && typeof loaded.binaryName === "function" ? loaded : undefined
  } catch {
    cached = undefined
  }
  return cached
}

/** True when the native addon is present and usable. */
export function available(): boolean {
  return native() !== undefined
}

const DEFAULT_POOL_ID = 1

/**
 * Registers an attachment payload with the native arena so repeated reads of
 * the same attachment do not re-encode the bytes.
 *
 * The bytes are handed over as they are: a build that only takes a plain array of numbers rejects them, and the
 * rejection is swallowed so the caller keeps its own copy.
 */
export function putAttachment(conversationId: number, attachmentId: string, bytes: Uint8Array): boolean {
  const api = native()
  if (!api) return false
  try {
    api.promptAddAttachment(conversationId, attachmentId, bytes)
    return true
  } catch {
    return false
  }
}

/** Reads attachment bytes previously registered with {@link putAttachment}. */
export function getAttachment(attachmentId: string): Uint8Array | undefined {
  const api = native()
  if (!api) return undefined
  try {
    const bytes = api.promptGetAttachment(attachmentId)
    return bytes instanceof Uint8Array ? bytes : Uint8Array.from(bytes)
  } catch {
    return undefined
  }
}

/** Materialises a conversation from the native prompt arena. */
export function materializePrompt(conversationId: number): string | undefined {
  const api = native()
  if (!api) return undefined
  api.promptInit()
  return api.promptMaterialize(conversationId)
}

/** Appends a message to the native prompt arena. */
export function addPromptMessage(conversationId: number, role: string, content: string): number | undefined {
  const api = native()
  if (!api) return undefined
  api.promptInit()
  return api.promptAddMessage(conversationId, role, content)
}

/** Stable hash of a tool set, used as the schema cache key. */
export function hashToolSet(toolsJson: string): number | undefined {
  const api = native()
  if (!api) return undefined
  return api.schemaCacheHash(toolsJson)
}

/** Reads a cached tool schema bundle, or `undefined` on a miss. */
export function getCachedSchema(model: string, toolSetHash: number): string | undefined {
  const api = native()
  if (!api) return undefined
  return api.schemaCacheGet(model, toolSetHash) ?? undefined
}

/** Stores a tool schema bundle with a time to live. */
export function putCachedSchema(model: string, toolSetHash: number, schemaJson: string, ttlSecs: number): boolean {
  const api = native()
  if (!api) return false
  api.schemaCachePut(model, toolSetHash, schemaJson, ttlSecs)
  return true
}

/** Drops expired schema cache entries and returns how many were removed. */
export function evictExpiredSchemas(): number {
  const api = native()
  if (!api) return 0
  return api.schemaCacheEvictExpired()
}

/** Initialises the default instance pool and returns its identifier. */
export function initPool(capacity: number, defaultTtlSecs: number): number {
  const api = native()
  if (!api) return DEFAULT_POOL_ID
  return api.statePoolInit(capacity, defaultTtlSecs)
}

/** Acquires or refreshes a pooled instance. */
export function acquireInstance(poolId: number, instanceId: string, configJson: string, ttlSecs: number): string | undefined {
  const api = native()
  if (!api) return undefined
  return api.statePoolAcquire(poolId, instanceId, configJson, ttlSecs)
}

/** Releases a pooled instance. */
export function releaseInstance(poolId: number, instanceId: string): boolean {
  const api = native()
  if (!api) return false
  api.statePoolRelease(poolId, instanceId)
  return true
}

/** Removes expired entries from a pool and returns how many were removed. */
export function prunePool(poolId: number): number {
  const api = native()
  if (!api) return 0
  return api.statePoolPrune(poolId)
}

/** Number of live entries in a pool. */
export function poolSize(poolId: number): number {
  const api = native()
  if (!api) return 0
  return api.statePoolLen(poolId)
}

/** Reads a file through the native path-interned cache. */
export function loadInstruction(path: string): string | undefined {
  const api = native()
  if (!api) return undefined
  try {
    return api.instructionsLoad(path)
  } catch {
    return undefined
  }
}

/** Evicts a path from the native instruction cache. */
export function evictInstruction(path: string): boolean {
  const api = native()
  if (!api) return false
  return api.instructionsEvict(path)
}

/** Compacts a message list down to a byte budget, summarising older turns. */
export function compactMessages(messagesJson: string, targetBytes: number): string | undefined {
  const api = native()
  if (!api) return undefined
  return api.compactSpill(messagesJson, targetBytes)
}

/** Compacts a message list down to a byte budget, dropping older turns. */
export function pruneMessages(messagesJson: string, targetBytes: number): string | undefined {
  const api = native()
  if (!api) return undefined
  return api.compactPruneOld(messagesJson, targetBytes)
}
