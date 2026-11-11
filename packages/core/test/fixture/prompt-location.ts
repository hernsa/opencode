import type { FileSystem } from "@ocnano/core/filesystem"
import { Bus } from "@ocnano/core/bus"
import { Image } from "@ocnano/core/image"
import { LocationServiceMap } from "@ocnano/core/location-service-map"
import type { LocationServices } from "@ocnano/core/location-services"
import { Plugin } from "@ocnano/core/plugin"
import { PluginHooks } from "@ocnano/core/plugin/hooks"
import { Skill } from "@ocnano/core/skill"
import type { Location } from "@ocnano/schema/location"
import { makeGlobalNode } from "@ocnano/util/effect/app-node"
import { LayerNode } from "@ocnano/util/effect/layer-node"
import { Effect, Layer, LayerMap } from "effect"

// Plain-prompt unit fixtures use virtual directories.
export const promptLocationNode = makeGlobalNode({
  service: LocationServiceMap.Service,
  layer: Layer.effect(
    LocationServiceMap.Service,
    Effect.gen(function* () {
      const bus = yield* Bus.Service
      return yield* LayerMap.make(
        (_ref: Location.Ref) =>
          LayerNode.compile(LayerNode.group([PluginHooks.node, Image.node, Skill.node, Plugin.node]), {
            replacements: [
              Bus.node.replace(Layer.succeed(Bus.Service, bus)),
              Plugin.node.replace(Layer.mock(Plugin.Service, { awaitActivation: Effect.void })),
            ],
          }) as unknown as Layer.Layer<LocationServices, FileSystem.DirectoryNotFoundError>,
      )
    }),
  ),
  deps: [Bus.node],
})
