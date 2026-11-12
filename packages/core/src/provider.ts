export * as Provider from "./provider.js"

import { Context, Effect, Layer, Option, Schema, Stream, Struct } from "effect"
import { Provider } from "@ocnano/schema/provider"
import { Model } from "@ocnano/schema/model"
import { makeLocationNode } from "@ocnano/util/effect/app-node"
import { HttpTimeout, type ProviderPackage } from "@ocnano/ai/effect"
import { Npm } from "@ocnano/util/npm"
import type { DeepMutable } from "./schema.js"
import { importModule, resolveModule } from "@ocnano/util/runtime-import"
import { Bus } from "./bus.js"
import { Integration } from "./integration.js"
import { State } from "./state.js"
import { IntegrationConnection } from "./integration/connection.js"
import { Credential } from "@ocnano/schema/credential"
import { Location } from "./location.js"
import { freeze } from "immer"
import { AISDKNative } from "./aisdk-native.js"

export { AISDK_PREFIX, aisdk, isAISDK, mergeHeaders, mergeOverlay, packageName } from "./aisdk-native.js"

export const ID = Provider.ID
export type ID = typeof ID.Type

export class LoadError extends Schema.TaggedError<LoadError>()("Provider.LoadError", {
  package: Schema.String,
  cause: Schema.Defect(),
}) {}

const packages = new Map<string, Promise<unknown>>()
const builtins = new Map<string, () => Promise<unknown>>([
  ["@ocnano/ai/providers/alibaba", () => import("@ocnano/ai/providers/alibaba")],
  ["@ocnano/ai/providers/alibaba/chat", () => import("@ocnano/ai/providers/alibaba/chat")],
  ["@ocnano/ai/providers/alibaba/messages", () => import("@ocnano/ai/providers/alibaba/messages")],
  ["@ocnano/ai/providers/alibaba/responses", () => import("@ocnano/ai/providers/alibaba/responses")],
  ["@ocnano/ai/providers/alibaba/images", () => import("@ocnano/ai/providers/alibaba/images")],
  ["@ocnano/ai/providers/alibaba/embeddings", () => import("@ocnano/ai/providers/alibaba/embeddings")],
  ["@ocnano/ai/providers/amazon-bedrock", () => import("@ocnano/ai/providers/amazon-bedrock")],
  ["@ocnano/ai/providers/amazon-bedrock/mantle", () => import("@ocnano/ai/providers/amazon-bedrock/mantle")],
  [
    "@ocnano/ai/providers/amazon-bedrock/mantle/chat",
    () => import("@ocnano/ai/providers/amazon-bedrock/mantle/chat"),
  ],
  [
    "@ocnano/ai/providers/amazon-bedrock/mantle/messages",
    () => import("@ocnano/ai/providers/amazon-bedrock/mantle/messages"),
  ],
  [
    "@ocnano/ai/providers/amazon-bedrock/mantle/responses",
    () => import("@ocnano/ai/providers/amazon-bedrock/mantle/responses"),
  ],
  ["@ocnano/ai/providers/anthropic", () => import("@ocnano/ai/providers/anthropic")],
  ["@ocnano/ai/providers/anthropic-compatible", () => import("@ocnano/ai/providers/anthropic-compatible")],
  ["@ocnano/ai/providers/azure", () => import("@ocnano/ai/providers/azure")],
  ["@ocnano/ai/providers/azure/chat", () => import("@ocnano/ai/providers/azure/chat")],
  ["@ocnano/ai/providers/azure/responses", () => import("@ocnano/ai/providers/azure/responses")],
  ["@ocnano/ai/providers/azure/images", () => import("@ocnano/ai/providers/azure/images")],
  ["@ocnano/ai/providers/azure/embeddings", () => import("@ocnano/ai/providers/azure/embeddings")],
  ["@ocnano/ai/providers/azure/messages", () => import("@ocnano/ai/providers/azure/messages")],
  ["@ocnano/ai/providers/baseten", () => import("@ocnano/ai/providers/baseten")],
  ["@ocnano/ai/providers/baseten/decisions", () => import("@ocnano/ai/providers/baseten/decisions")],
  ["@ocnano/ai/providers/cerebras", () => import("@ocnano/ai/providers/cerebras")],
  ["@ocnano/ai/providers/cloudflare-ai-gateway", () => import("@ocnano/ai/providers/cloudflare-ai-gateway")],
  [
    "@ocnano/ai/providers/cloudflare-ai-gateway/decisions",
    () => import("@ocnano/ai/providers/cloudflare-ai-gateway/decisions"),
  ],
  ["@ocnano/ai/providers/cloudflare-workers-ai", () => import("@ocnano/ai/providers/cloudflare-workers-ai")],
  [
    "@ocnano/ai/providers/cloudflare-workers-ai/decisions",
    () => import("@ocnano/ai/providers/cloudflare-workers-ai/decisions"),
  ],
  [
    "@ocnano/ai/providers/cloudflare-workers-ai/images",
    () => import("@ocnano/ai/providers/cloudflare-workers-ai/images"),
  ],
  ["@ocnano/ai/providers/cohere", () => import("@ocnano/ai/providers/cohere")],
  ["@ocnano/ai/providers/cohere/chat", () => import("@ocnano/ai/providers/cohere/chat")],
  ["@ocnano/ai/providers/cohere/embeddings", () => import("@ocnano/ai/providers/cohere/embeddings")],
  ["@ocnano/ai/providers/deepinfra", () => import("@ocnano/ai/providers/deepinfra")],
  ["@ocnano/ai/providers/deepinfra/embeddings", () => import("@ocnano/ai/providers/deepinfra/embeddings")],
  ["@ocnano/ai/providers/deepseek", () => import("@ocnano/ai/providers/deepseek")],
  ["@ocnano/ai/providers/digitalocean", () => import("@ocnano/ai/providers/digitalocean")],
  ["@ocnano/ai/providers/digitalocean/decisions", () => import("@ocnano/ai/providers/digitalocean/decisions")],
  ["@ocnano/ai/providers/digitalocean/embeddings", () => import("@ocnano/ai/providers/digitalocean/embeddings")],
  ["@ocnano/ai/providers/digitalocean/images", () => import("@ocnano/ai/providers/digitalocean/images")],
  ["@ocnano/ai/providers/digitalocean/responses", () => import("@ocnano/ai/providers/digitalocean/responses")],
  ["@ocnano/ai/providers/fireworks", () => import("@ocnano/ai/providers/fireworks")],
  ["@ocnano/ai/providers/fireworks/embeddings", () => import("@ocnano/ai/providers/fireworks/embeddings")],
  ["@ocnano/ai/providers/google", () => import("@ocnano/ai/providers/google")],
  ["@ocnano/ai/providers/google/interactions", () => import("@ocnano/ai/providers/google/interactions")],
  ["@ocnano/ai/providers/google/embeddings", () => import("@ocnano/ai/providers/google/embeddings")],
  ["@ocnano/ai/providers/google/images", () => import("@ocnano/ai/providers/google/images")],
  ["@ocnano/ai/providers/google-vertex", () => import("@ocnano/ai/providers/google-vertex")],
  ["@ocnano/ai/providers/google-vertex/chat", () => import("@ocnano/ai/providers/google-vertex/chat")],
  ["@ocnano/ai/providers/google-vertex/gemini", () => import("@ocnano/ai/providers/google-vertex/gemini")],
  [
    "@ocnano/ai/providers/google-vertex/interactions",
    () => import("@ocnano/ai/providers/google-vertex/interactions"),
  ],
  ["@ocnano/ai/providers/google-vertex/messages", () => import("@ocnano/ai/providers/google-vertex/messages")],
  ["@ocnano/ai/providers/google-vertex/mistral", () => import("@ocnano/ai/providers/google-vertex/mistral")],
  ["@ocnano/ai/providers/google-vertex/responses", () => import("@ocnano/ai/providers/google-vertex/responses")],
  ["@ocnano/ai/providers/google-vertex/embeddings", () => import("@ocnano/ai/providers/google-vertex/embeddings")],
  ["@ocnano/ai/providers/google-vertex/images", () => import("@ocnano/ai/providers/google-vertex/images")],
  ["@ocnano/ai/providers/google-vertex-messages", () => import("@ocnano/ai/providers/google-vertex-messages")],
  ["@ocnano/ai/providers/groq", () => import("@ocnano/ai/providers/groq")],
  ["@ocnano/ai/providers/meta", () => import("@ocnano/ai/providers/meta")],
  ["@ocnano/ai/providers/meta/chat", () => import("@ocnano/ai/providers/meta/chat")],
  ["@ocnano/ai/providers/meta/images", () => import("@ocnano/ai/providers/meta/images")],
  ["@ocnano/ai/providers/meta/messages", () => import("@ocnano/ai/providers/meta/messages")],
  ["@ocnano/ai/providers/meta/responses", () => import("@ocnano/ai/providers/meta/responses")],
  ["@ocnano/ai/providers/minimax", () => import("@ocnano/ai/providers/minimax")],
  ["@ocnano/ai/providers/minimax/chat", () => import("@ocnano/ai/providers/minimax/chat")],
  ["@ocnano/ai/providers/minimax/images", () => import("@ocnano/ai/providers/minimax/images")],
  ["@ocnano/ai/providers/minimax/messages", () => import("@ocnano/ai/providers/minimax/messages")],
  ["@ocnano/ai/providers/minimax/responses", () => import("@ocnano/ai/providers/minimax/responses")],
  ["@ocnano/ai/providers/mistral", () => import("@ocnano/ai/providers/mistral")],
  ["@ocnano/ai/providers/moonshot", () => import("@ocnano/ai/providers/moonshot")],
  ["@ocnano/ai/providers/moonshot/chat", () => import("@ocnano/ai/providers/moonshot/chat")],
  ["@ocnano/ai/providers/moonshot/messages", () => import("@ocnano/ai/providers/moonshot/messages")],
  ["@ocnano/ai/providers/moonshot/responses", () => import("@ocnano/ai/providers/moonshot/responses")],
  ["@ocnano/ai/providers/openai", () => import("@ocnano/ai/providers/openai")],
  ["@ocnano/ai/providers/openai/chat", () => import("@ocnano/ai/providers/openai/chat")],
  ["@ocnano/ai/providers/openai/responses", () => import("@ocnano/ai/providers/openai/responses")],
  ["@ocnano/ai/providers/openai/images", () => import("@ocnano/ai/providers/openai/images")],
  ["@ocnano/ai/providers/openai/embeddings", () => import("@ocnano/ai/providers/openai/embeddings")],
  ["@ocnano/ai/providers/openai-compatible", () => import("@ocnano/ai/providers/openai-compatible")],
  [
    "@ocnano/ai/providers/openai-compatible/responses",
    () => import("@ocnano/ai/providers/openai-compatible/responses"),
  ],
  ["@ocnano/ai/providers/openai-compatible/images", () => import("@ocnano/ai/providers/openai-compatible/images")],
  [
    "@ocnano/ai/providers/openai-compatible/embeddings",
    () => import("@ocnano/ai/providers/openai-compatible/embeddings"),
  ],
  [
    "@ocnano/ai/providers/openai-compatible-responses",
    () => import("@ocnano/ai/providers/openai-compatible-responses"),
  ],
  ["@ocnano/ai/providers/ocnano/decisions", () => import("@ocnano/ai/providers/ocnano/decisions")],
  ["@ocnano/ai/providers/openrouter", () => import("@ocnano/ai/providers/openrouter")],
  ["@ocnano/ai/providers/openrouter/decisions", () => import("@ocnano/ai/providers/openrouter/decisions")],
  ["@ocnano/ai/providers/openrouter/embeddings", () => import("@ocnano/ai/providers/openrouter/embeddings")],
  ["@ocnano/ai/providers/openrouter/images", () => import("@ocnano/ai/providers/openrouter/images")],
  ["@ocnano/ai/providers/openrouter/responses", () => import("@ocnano/ai/providers/openrouter/responses")],
  ["@ocnano/ai/providers/togetherai", () => import("@ocnano/ai/providers/togetherai")],
  ["@ocnano/ai/providers/typesafe-ai/decisions", () => import("@ocnano/ai/providers/typesafe-ai/decisions")],
  ["@ocnano/ai/providers/venice", () => import("@ocnano/ai/providers/venice")],
  ["@ocnano/ai/providers/venice/responses", () => import("@ocnano/ai/providers/venice/responses")],
  ["@ocnano/ai/providers/vercel-ai-gateway", () => import("@ocnano/ai/providers/vercel-ai-gateway")],
  ["@ocnano/ai/providers/vercel-ai-gateway/chat", () => import("@ocnano/ai/providers/vercel-ai-gateway/chat")],
  [
    "@ocnano/ai/providers/vercel-ai-gateway/messages",
    () => import("@ocnano/ai/providers/vercel-ai-gateway/messages"),
  ],
  [
    "@ocnano/ai/providers/vercel-ai-gateway/responses",
    () => import("@ocnano/ai/providers/vercel-ai-gateway/responses"),
  ],
  [
    "@ocnano/ai/providers/vercel-ai-gateway/decisions",
    () => import("@ocnano/ai/providers/vercel-ai-gateway/decisions"),
  ],
  ["@ocnano/ai/providers/vercel-ai-gateway/images", () => import("@ocnano/ai/providers/vercel-ai-gateway/images")],
  [
    "@ocnano/ai/providers/vercel-ai-gateway/embeddings",
    () => import("@ocnano/ai/providers/vercel-ai-gateway/embeddings"),
  ],
  ["@ocnano/ai/providers/xai", () => import("@ocnano/ai/providers/xai")],
  ["@ocnano/ai/providers/xai/images", () => import("@ocnano/ai/providers/xai/images")],
  ["@ocnano/ai/providers/zai", () => import("@ocnano/ai/providers/zai")],
  ["@ocnano/ai/providers/zai/chat", () => import("@ocnano/ai/providers/zai/chat")],
  ["@ocnano/ai/providers/zai/images", () => import("@ocnano/ai/providers/zai/images")],
  ["@ocnano/ai/providers/zai-coding-plan", () => import("@ocnano/ai/providers/zai-coding-plan")],
  ["@ocnano/ai/providers/zai-coding-plan/chat", () => import("@ocnano/ai/providers/zai-coding-plan/chat")],
  ["@ocnano/ai/providers/zai-coding-plan/messages", () => import("@ocnano/ai/providers/zai-coding-plan/messages")],
  [
    "@ocnano/ai/providers/zai-coding-plan/responses",
    () => import("@ocnano/ai/providers/zai-coding-plan/responses"),
  ],
])

/** Native `@ocnano/ai/providers/*` entrypoints bundled with Core and loadable by name from config. */
export const builtinPackages: ReadonlySet<string> = new Set(builtins.keys())

export const loadPackage = Effect.fn("Provider.loadPackage")(function* (input: string, npm?: Npm.Interface) {
  const specifier = AISDKNative.packageName(input)
  const builtin = builtins.get(specifier)
  if (builtin) return yield* importPackage(specifier, specifier, builtin)
  const resolved = yield* Effect.sync(() => {
    if (specifier.startsWith("file://") || specifier.startsWith("@ocnano/ai/")) return specifier
    try {
      return import.meta.resolve(specifier)
    } catch {
      return undefined
    }
  })
  if (resolved) return yield* importPackage(specifier, resolved)
  if (!npm) {
    return yield* new LoadError({
      package: specifier,
      cause: new Error(`Provider package ${specifier} is not installed`),
    })
  }
  const parts = specifier.split("/")
  const root = specifier.startsWith("@") ? parts.slice(0, 2).join("/") : (parts[0] ?? specifier)
  const installed = yield* npm.add(root).pipe(Effect.mapError((cause) => new LoadError({ package: specifier, cause })))
  const entrypoint = yield* Effect.try({
    try: () => resolveModule(specifier, installed.directory),
    catch: (cause) => new LoadError({ package: specifier, cause }),
  })
  return yield* importPackage(specifier, entrypoint)
})

const settingsKeys = Struct.keys(Provider.Settings.schema.fields)
const providerOnlyKeys = settingsKeys.filter((key) => !(key in Model.Settings.schema.fields))

/** The provider options: every settings key OC Nano doesn't read itself. */
export function nativeSettings(settings: Settings) {
  return Struct.omit(settings, settingsKeys)
}

/** Settings a model inherits from its provider. */
export function modelSettings(settings: Settings | undefined) {
  return settings && Struct.omit(settings, providerOnlyKeys)
}

const decodeTimeout = Schema.decodeUnknownOption(HttpTimeout)

/** Applied to `headerTimeout` when provider settings leave it unset or invalid. */
export const DEFAULT_TIMEOUT_MS = 300_000

/**
 * Applied to `chunkTimeout` when provider settings leave it unset or invalid. Some providers, such as DeepSeek, have
 * specifically asked clients to allow at least 15 minutes, because their models can stream nothing for minutes while
 * they reason.
 */
export const DEFAULT_CHUNK_TIMEOUT_MS = 900_000

/** One timeout setting without a default; invalid values are dropped. */
export function timeout(value: unknown) {
  return Option.getOrUndefined(decodeTimeout(value))
}

/** Request timeouts from provider settings, resolved for every route. `timeout` has no default. */
export function timeouts(settings: Readonly<Record<string, unknown>>) {
  return {
    timeout: timeout(settings.timeout),
    headerTimeout: timeout(settings.headerTimeout) ?? DEFAULT_TIMEOUT_MS,
    chunkTimeout: timeout(settings.chunkTimeout) ?? DEFAULT_CHUNK_TIMEOUT_MS,
  }
}

const decodeEncoding = Schema.decodeUnknownOption(Provider.Encoding)

/** Request body encoding from provider or model settings; invalid values are dropped. */
export function encoding(settings: Readonly<Record<string, unknown>>) {
  return Option.getOrUndefined(decodeEncoding(settings.encoding))
}

export const Request = Provider.Request
export type Request = Provider.Request

export const Compaction = Provider.Compaction
export type Compaction = Provider.Compaction

export const Cache = Provider.Cache
export type Cache = Provider.Cache

export const Transport = Provider.Transport
export type Transport = Provider.Transport

export const Settings = Provider.Settings
export type Settings = Provider.Settings

export const Info = Provider.Info
export type Info = Provider.Info

export type MutableInfo = DeepMutable<Info>

export { Event } from "@ocnano/schema/provider"

/** Provider metadata owns its drafts; model definitions remain immutable inputs. */
export type Definition = {
  readonly provider: Info
  readonly models: ReadonlyMap<Model.ID, Model.Info>
  readonly sourceConnection?: IntegrationConnection.Info
}

export interface Editor {
  readonly list: () => readonly Definition[]
  readonly get: (providerID: ID) => Definition | undefined
  readonly add: (definition: {
    readonly info: Info
    readonly models: readonly Model.Info[]
    readonly sourceConnection?: IntegrationConnection.Info
  }) => void
  readonly update: (providerID: ID, update: (provider: MutableInfo) => void) => void
  readonly remove: (providerID: ID) => void
  readonly models: {
    readonly set: (providerID: ID, models: readonly Model.Info[]) => void
    readonly update: (providerID: ID, modelID: Model.ID, update: (model: DeepMutable<Model.Info>) => void) => void
    readonly remove: (providerID: ID, modelID: Model.ID) => void
  }
}

export interface Snapshot {
  readonly records: ReadonlyMap<ID, Definition>
  readonly available: readonly Definition[]
  readonly providers: readonly Info[]
}

export interface Interface extends State.Transformable<Editor> {
  readonly get: (providerID: ID) => Effect.Effect<Info | undefined>
  readonly all: () => Effect.Effect<readonly Info[]>
  readonly available: () => Effect.Effect<readonly Info[]>
  /** Internal definition/access snapshot; raw model inventories never cross the HTTP API. */
  readonly snapshot: () => Effect.Effect<Snapshot>
}

export class Service extends Context.Service<Service, Interface>()("@ocnano/Provider") {}

// Every location references the same index for a shared immutable definition array.
const definitions = new WeakMap<readonly Model.Info[], Map<ID, ReadonlyMap<Model.ID, Model.Info>>>()
function index(providerID: ID, models: readonly Model.Info[]) {
  const indexes = definitions.get(models) ?? new Map<ID, ReadonlyMap<Model.ID, Model.Info>>()
  const cached = indexes.get(providerID)
  if (cached) return cached
  // Model shares these definitions without copying, so a foreign definition takes this provider's identity here.
  const result = freeze(
    new Map(models.map((model) => [model.id, model.providerID === providerID ? model : { ...model, providerID }])),
    true,
  )
  indexes.set(providerID, result)
  definitions.set(models, indexes)
  return result
}

const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const bus = yield* Bus.Service
    const integrations = yield* Integration.Service
    const location = yield* Location.Service
    const state = State.create<
      Map<
        ID,
        {
          provider: MutableInfo
          models: ReadonlyMap<Model.ID, Model.Info>
          sourceConnection?: IntegrationConnection.Info
        }
      >,
      Editor
    >({
      name: "provider",
      initial: () => new Map(),
      editor: (records) => {
        const maps = new WeakSet<ReadonlyMap<Model.ID, Model.Info>>()
        const models = new WeakSet<Model.Info>()
        const entry = (id: ID) => {
          const current = records.get(id)
          if (current) return current
          const added = { provider: Info.empty(id) as MutableInfo, models: new Map<Model.ID, Model.Info>() }
          records.set(id, added)
          maps.add(added.models)
          return added
        }
        const writable = (id: ID) => {
          const record = entry(id)
          if (maps.has(record.models)) return record.models as Map<Model.ID, Model.Info>
          const owned = new Map(record.models)
          record.models = owned
          maps.add(owned)
          return owned
        }
        return {
          list: () => Array.from(records.values()),
          get: (id) => records.get(id),
          add: (definition) => {
            records.set(definition.info.id, {
              provider: structuredClone(definition.info) as MutableInfo,
              models: index(definition.info.id, definition.models),
              sourceConnection: definition.sourceConnection,
            })
          },
          update: (id, update) => {
            const record = entry(id)
            update(record.provider)
            record.provider.id = id
            AISDKNative.rewrite(record.provider, {
              builtins: builtinPackages,
              specifier: record.provider.package,
              providerID: id,
              canonical: record.provider.canonical,
            })
          },
          remove: (id) => {
            records.delete(id)
          },
          models: {
            set: (id, values) => {
              entry(id).models = index(id, values)
            },
            update: (providerID, modelID, update) => {
              const record = entry(providerID)
              const target = writable(providerID)
              const current = target.get(modelID)
              const model = // An earlier add/set can publish and freeze an owned model within this fold.
                (
                  current && models.has(current) && !Object.isFrozen(current)
                    ? current
                    : current
                      ? structuredClone(current)
                      : Model.Info.default(providerID, modelID)
                ) as DeepMutable<Model.Info>
              update(model)
              model.id = modelID
              model.providerID = providerID
              AISDKNative.rewrite(model, {
                builtins: builtinPackages,
                specifier: model.package ?? record.provider.package,
                providerID,
                canonical: model.canonical ?? record.provider.canonical,
                modelID: model.modelID ?? modelID,
              })
              models.add(model)
              target.set(modelID, model)
            },
            remove: (providerID, modelID) => {
              if (!records.has(providerID)) return
              writable(providerID).delete(modelID)
            },
          },
        }
      },
      notify: () => notify,
    })
    // Registrations may outlive a borrowed service layer; their later disposal must
    // not query dependencies that have already closed.
    yield* Effect.addFinalizer(() => State.shutdown(state.reload()))
    let cached: { records: Snapshot["records"]; value: Snapshot } | undefined
    const snapshot = Effect.fn("Provider.snapshot")(function* () {
      while (true) {
        const revision = integrations.revision()
        const records = state.get()
        // Connection presence decides availability; resolving OAuth tokens belongs to execution.
        const connections = yield* integrations.list()
        // Either fold can disable a plugin that also contributed to the other domain.
        if (revision !== integrations.revision() || records !== state.get()) continue
        const byID = new Map(connections.map((integration) => [integration.id, integration]))
        const available = Array.from(records.values()).filter((record) => {
          if (record.provider.activation === "disabled") return false
          const integration = byID.get(record.provider.integrationID ?? Integration.ID.make(record.provider.id))
          // Never combine the previous account's discovered endpoints/models with a new connection.
          if (
            record.sourceConnection &&
            IntegrationConnection.key(record.sourceConnection) !==
              IntegrationConnection.key(integration?.connections[0])
          )
            return false
          if (record.provider.activation === "enabled") return true
          if (integration?.connections.length) return true
          return record.provider.integrationID === undefined && !integration
        })
        // A credential change that leaves the same definitions available is not a catalog change.
        if (
          cached?.records === records &&
          cached.value.available.length === available.length &&
          cached.value.available.every((record, index) => record === available[index])
        )
          return cached.value
        const value = freeze({ records, available, providers: available.map((record) => record.provider) }, true)
        cached = { records, value }
        return value
      }
    })
    let published: Snapshot | undefined
    const notify: Effect.Effect<void> = Effect.gen(function* () {
      const value = yield* snapshot()
      if (value === published) return
      published = value
      yield* bus.publish(
        Provider.Event.Updated,
        {},
        {
          location: { directory: location.directory, workspaceID: location.workspaceID },
        },
      )
    })
    yield* bus.subscribe([Integration.Event.Updated, Credential.Event.Switched]).pipe(
      Stream.runForEach(() => notify),
      Effect.forkScoped({ startImmediately: true }),
    )
    return Service.of({
      transform: state.transform,
      reload: state.reload,
      get: Effect.fn("Provider.get")((id) => Effect.sync(() => freeze(state.get().get(id)?.provider, true))),
      all: Effect.fn("Provider.all")(() =>
        Effect.sync(() => Array.from(state.get().values(), (record) => freeze(record.provider, true))),
      ),
      available: Effect.fn("Provider.available")(() => snapshot().pipe(Effect.map((value) => value.providers))),
      snapshot,
    })
  }),
)

export const node = makeLocationNode({ service: Service, layer, deps: [Bus.node, Integration.node, Location.node] })

const importPackage = Effect.fn("Provider.importPackage")(function* (
  specifier: string,
  entrypoint: string,
  load = () => importModule(entrypoint),
) {
  const module = yield* Effect.tryPromise({
    try: () => {
      const existing = packages.get(entrypoint)
      if (existing) return existing
      const loaded = load()
      packages.set(entrypoint, loaded)
      return loaded
    },
    catch: (cause) => new LoadError({ package: specifier, cause }),
  })
  if (typeof module !== "object" || module === null || typeof (module as { model?: unknown }).model !== "function") {
    return yield* new LoadError({
      package: specifier,
      cause: new Error(`Provider package ${specifier} does not export model(modelID, settings)`),
    })
  }
  return module as ProviderPackage.Definition
})
