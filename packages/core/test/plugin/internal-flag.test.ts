import { describe, expect } from "bun:test"
import { Duration, Effect, Layer, LayerMap, Stream } from "effect"
import { App } from "@ocnano/core/app"
import { ConfigPluginSource } from "@ocnano/core/config/plugin/source"
import { AppNodeBuilder } from "@ocnano/core/effect/app-node-builder"
import { Instance } from "@ocnano/core/instance"
import { Location } from "@ocnano/core/location"
import { LocationServiceMap } from "@ocnano/core/location-services"
import { Plugin } from "@ocnano/core/plugin"
import { SdkPlugins } from "@ocnano/core/plugin/sdk"
import { AbsolutePath } from "@ocnano/core/schema"
import { Tool } from "@ocnano/core/tool"
import { TodoTool } from "@ocnano/core/tool/plugin/todo"
import { LayerNode } from "@ocnano/util/effect/layer-node"
import { Global } from "@ocnano/util/global"
import { Npm } from "@ocnano/util/npm"
import { Bus } from "../../src/bus"
import { Database } from "../../src/database/database"
import { tempGlobalLayer } from "../fixture/global"
import { offlineModels } from "../fixture/models"
import { tmpdirScoped } from "../fixture/tmpdir"
import { testEffect } from "../lib/effect"
import { toolDefinitions } from "../lib/tool"

const unexpected = (pkg: string) =>
  Effect.fail(new Npm.InstallFailedError({ add: [pkg], dir: "", cause: new Error(`Unexpected Npm call: ${pkg}`) }))

const instances = Layer.effect(
  LocationServiceMap.Service,
  Effect.gen(function* () {
    const map = yield* LayerMap.make(
      (ref: Location.Ref) => Instance.layer(ref, { discovery: false, replacements: bindings }),
      { idleTimeToLive: Duration.infinity },
    )
    const bindings: LayerNode.Replacements = [
      App.node.replace(App.configured({ channel: "dev" })),
      Global.node.replace(tempGlobalLayer),
      offlineModels,
      ConfigPluginSource.node.replace(
        Layer.succeed(
          ConfigPluginSource.Service,
          ConfigPluginSource.Service.of({ operations: () => Effect.succeed([]), changes: () => Stream.never }),
        ),
      ),
      Npm.node.replace(
        Layer.succeed(
          Npm.Service,
          Npm.Service.of({
            add: unexpected,
            resolve: (name) => Effect.succeed({ directory: "", name }),
            check: () => Effect.succeed(false),
            update: unexpected,
            which: () => Effect.undefined,
          }),
        ),
      ),
      LocationServiceMap.node.replace(Layer.succeed(LocationServiceMap.Service, map)),
      Instance.node.replace(
        Layer.succeed(Instance.Service, { provide: (session) => Effect.provide(map.get(session.location)) }),
      ),
    ]
    return map
  }),
)

const it = testEffect(
  AppNodeBuilder.build(LayerNode.group([Database.node, Bus.node, SdkPlugins.node, LocationServiceMap.node]), [
    Global.node.replace(tempGlobalLayer),
    offlineModels,
    LocationServiceMap.node.replace(instances),
  ]),
)

describe("PluginInternal flags", () => {
  it.live("turns a flagged built-in tool on for a dev-channel server with no config", () =>
    Effect.gen(function* () {
      const directory = yield* tmpdirScoped()
      const locations = yield* LocationServiceMap.Service
      const names = yield* Effect.gen(function* () {
        yield* (yield* Plugin.Service).awaitActivation
        return (yield* toolDefinitions(yield* Tool.Service)).map((definition) => definition.name)
      }).pipe(
        Effect.scoped,
        Effect.provide(locations.get(Location.Ref.make({ directory: AbsolutePath.make(directory.path) }))),
      )

      expect(names).toContain(TodoTool.name)
    }),
  )
})
