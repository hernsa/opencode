import { Agent } from "@ocnano/core/agent"
import { App } from "@ocnano/core/app"
import { Artifact } from "@ocnano/core/artifact"
import { AISDK } from "@ocnano/core/aisdk"
import { Command } from "@ocnano/core/command"
import { Config } from "@ocnano/core/config"
import { Credential } from "@ocnano/core/credential"
import { Database } from "@ocnano/core/database/database"
import { Environment } from "@ocnano/core/environment/index"
import { FileAccess } from "@ocnano/core/file-access"
import { Flag } from "@ocnano/core/flag"
import { LayerNodePlatform } from "@ocnano/util/effect/app-node-platform"
import { AppProcess } from "@ocnano/util/process"
import { LayerNode } from "@ocnano/util/effect/layer-node"
import { Bus } from "@ocnano/core/bus"
import { FileSystem } from "@ocnano/core/filesystem"
import { FSUtil } from "@ocnano/util/fs-util"
import { Global } from "@ocnano/util/global"
import { Form } from "@ocnano/core/form"
import { Generate } from "@ocnano/core/generate"
import { InstructionDiscovery } from "@ocnano/core/instruction-discovery"
import { Integration } from "@ocnano/core/integration"
import { Job } from "@ocnano/core/job"
import { KV } from "@ocnano/core/kv"
import { Location } from "@ocnano/core/location"
import { Mcp } from "@ocnano/core/mcp/index"
import { Model } from "@ocnano/core/model"
import { Npm } from "@ocnano/util/npm"
import { Plugin } from "@ocnano/core/plugin"
import { PluginHooks } from "@ocnano/core/plugin/hooks"
import { Provider } from "@ocnano/core/provider"
import { Session } from "@ocnano/core/session"
import { SharedCache } from "@ocnano/core/shared-cache"
import { InstructionEntry } from "@ocnano/core/session/instruction-entry"
import { PersistentPty } from "@ocnano/core/persistent-pty"
import { LocationServiceMap } from "@ocnano/core/location-service-map"
import { AppNodeBuilder } from "@ocnano/core/effect/app-node-builder"
import { Permission } from "@ocnano/core/permission"
import { Reference } from "@ocnano/core/reference"
import { Rpc } from "@ocnano/core/rpc"
import { Skill } from "@ocnano/core/skill"
import { SkillDiscovery } from "@ocnano/core/skill/discovery"
import { Watcher } from "@ocnano/core/filesystem/watcher"
import { Tool } from "@ocnano/core/tool"
import { Vcs } from "@ocnano/core/vcs"
import { WebSearch } from "@ocnano/core/websearch"
import { Worktree } from "@ocnano/core/worktree"
import { WorktreeStrategies } from "@ocnano/core/worktree/strategies"
import { Effect, Layer } from "effect"
import { tempLocationLayer } from "../fixture/location"
import { emptyMcpLayer } from "../fixture/mcp"
import { offlineModels } from "../fixture/models"

const npmLayer = Layer.succeed(
  Npm.Service,
  Npm.Service.of({
    add: (name) => Effect.succeed({ directory: "", name }),
    resolve: (name) => Effect.succeed({ directory: "", name }),
    check: () => Effect.succeed(false),
    update: (name) => Effect.succeed({ directory: "", name }),
    which: () => Effect.undefined,
  }),
)

const generateLayer = Layer.succeed(
  Generate.Service,
  Generate.Service.of({
    text: () => Effect.succeed(""),
    image: () => Effect.die("unused"),
    decisions: () => Effect.die("unused"),
  }),
)

const configLayer = Config.testLayer()

const permissionLayer = Layer.succeed(
  Permission.Service,
  Permission.Service.of({
    close: Effect.void,
    ask: (input) => Effect.succeed({ id: input.id ?? Permission.ID.create(), effect: "ask" }),
    assert: () => Effect.void,
    assertNotDenied: () => Effect.void,
    allows: () => Effect.succeed(false),
    reply: () => Effect.void,
    get: () => Effect.succeed(undefined),
    forSession: () => Effect.succeed([]),
    list: () => Effect.succeed([]),
  }),
)

export const makePluginTestLayer = (permission = permissionLayer, generate = generateLayer) =>
  AppNodeBuilder.build(
    LayerNode.group([
      App.node,
      AppProcess.node,
      FileSystem.node,
      FSUtil.node,
      Location.node,
      Npm.node,
      Credential.node,
      Config.node,
      Flag.node,
      Database.node,
      Environment.node,
      FileAccess.node,
      Global.node,
      Bus.node,
      Form.node,
      Generate.node,
      LayerNodePlatform.httpClient,
      Plugin.node,
      Agent.node,
      Artifact.node,
      AISDK.node,
      Provider.node,
      Model.node,
      Command.node,
      InstructionDiscovery.node,
      Integration.node,
      Job.node,
      KV.node,
      Mcp.node,
      Session.node,
      SharedCache.node,
      InstructionEntry.node,
      PersistentPty.node,
      LocationServiceMap.node,
      Permission.node,
      PluginHooks.node,
      Reference.node,
      Rpc.node,
      Skill.node,
      SkillDiscovery.node,
      Tool.node,
      Vcs.node,
      Watcher.node,
      WebSearch.node,
      Worktree.node,
      WorktreeStrategies.node,
    ]),
    [
      Location.node.replace(tempLocationLayer),
      Npm.node.replace(npmLayer),
      Config.node.replace(configLayer),
      Mcp.node.replace(emptyMcpLayer),
      Generate.node.replace(generate),
      Permission.node.replace(permission),
      offlineModels,
    ],
  ).pipe(Layer.provideMerge(configLayer))

export const PluginTestLayer = makePluginTestLayer()
