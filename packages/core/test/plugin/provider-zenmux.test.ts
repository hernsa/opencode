import { describe, expect, test } from "bun:test"
import { Effect } from "effect"
import { Plugin } from "@ocnano/core/plugin"
import { PluginHost } from "@ocnano/core/plugin/host"
import { ProviderPlugins } from "@ocnano/core/plugin/provider"
import { ZenmuxPlugin } from "@ocnano/core/plugin/provider/zenmux"
import { Provider } from "@ocnano/core/provider"
import { testEffect } from "../lib/effect"
import { PluginTestLayer } from "./fixture"

const it = testEffect(PluginTestLayer)

const addPlugin = Effect.fn(function* () {
  const plugin = yield* Plugin.Service
  const host = yield* PluginHost.make(plugin, "test")
  yield* ZenmuxPlugin.effect(host)
})

function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Expected value")
  return value
}

describe("ZenmuxPlugin", () => {
  test("is registered so legacy referer headers can be applied", () => {
    expect(ProviderPlugins.map((item) => item.id)).toContain("ocnano.provider.zenmux")
  })

  it.effect("applies the exact legacy Zenmux headers", () =>
    Effect.gen(function* () {
      const catalog = yield* Provider.Service
      yield* catalog.transform((catalog) => {
        catalog.update(Provider.ID.make("zenmux"), (provider) => {
          provider.package = "@ocnano/ai/providers/openai-compatible"
          provider.settings = { ...provider.settings, baseURL: "https://zenmux.ai/api/v1" }
        })
      })
      yield* addPlugin()
      const result = required(yield* catalog.get(Provider.ID.make("zenmux")))
      expect(result.headers).toEqual({ "HTTP-Referer": "https://opencode.ai/", "X-Title": "ocnano" })
      expect(Object.keys(required(result.headers)).sort()).toEqual(["HTTP-Referer", "X-Title"])
    }),
  )

  it.effect("merges legacy Zenmux headers with existing headers", () =>
    Effect.gen(function* () {
      const catalog = yield* Provider.Service
      yield* catalog.transform((catalog) => {
        catalog.update(Provider.ID.make("zenmux"), (provider) => {
          provider.package = "@ocnano/ai/providers/openai-compatible"
          provider.settings = { ...provider.settings, baseURL: "https://zenmux.ai/api/v1" }
          provider.headers = { ...provider.headers, Existing: "value" }
        })
      })
      yield* addPlugin()

      expect(required(yield* catalog.get(Provider.ID.make("zenmux"))).headers).toEqual({
        Existing: "value",
        "HTTP-Referer": "https://opencode.ai/",
        "X-Title": "ocnano",
      })
    }),
  )

  it.effect("lets configured Zenmux legacy headers override defaults", () =>
    Effect.gen(function* () {
      const catalog = yield* Provider.Service
      yield* catalog.transform((catalog) => {
        catalog.update(Provider.ID.make("zenmux"), (provider) => {
          provider.package = "@ocnano/ai/providers/openai-compatible"
          provider.settings = { ...provider.settings, baseURL: "https://zenmux.ai/api/v1" }
          provider.headers = { "HTTP-Referer": "https://example.com/", "X-Title": "custom-title" }
        })
      })
      yield* addPlugin()

      expect(required(yield* catalog.get(Provider.ID.make("zenmux"))).headers).toEqual({
        "HTTP-Referer": "https://example.com/",
        "X-Title": "custom-title",
      })
    }),
  )

  it.effect("guards legacy Zenmux headers to the exact zenmux provider id", () =>
    Effect.gen(function* () {
      const catalog = yield* Provider.Service
      yield* catalog.transform((catalog) => {
        catalog.update(Provider.ID.openrouter, (provider) => {
          provider.headers = { "HTTP-Referer": "https://example.com/", "X-Title": "custom-title" }
        })
      })
      yield* addPlugin()

      expect(required(yield* catalog.get(Provider.ID.openrouter)).headers).toEqual({
        "HTTP-Referer": "https://example.com/",
        "X-Title": "custom-title",
      })
    }),
  )
})
