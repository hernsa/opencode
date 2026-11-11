// TODO: Keep additional network capabilities inside Schema and Protocol as the client grows; /effect must never import
// Core or Server. Preserve these datatype exports so internal model reorganizations do not require caller migrations.
import type { Effect } from "effect"
import type { OcNano } from "./client.js"

export * from "./generated/index"
export { OcNano } from "./client.js"
export type {
  AgentApi,
  AppApi,
  CommandApi,
  ConfigApi,
  EventApi,
  IntegrationApi,
  ModelApi,
  PluginApi,
  ProviderApi,
  ReferenceApi,
  RpcApi,
  RpcClient,
  WebSearchApi,
  SessionApi,
  SkillApi,
} from "./api.js"
export { Agent } from "@ocnano/schema/agent"
export { Command } from "@ocnano/schema/command"
export { Config } from "@ocnano/schema/config"
export { Credential } from "@ocnano/schema/credential"
export { Event } from "@ocnano/schema/event"
export { EventLog } from "@ocnano/schema/event-log"
export { FileSystem } from "@ocnano/schema/filesystem"
export { Form } from "@ocnano/schema/form"
export { Integration } from "@ocnano/schema/integration"
export { Location } from "@ocnano/schema/location"
export { Model } from "@ocnano/schema/model"
export { Permission } from "@ocnano/schema/permission"
export { PermissionSaved } from "@ocnano/schema/permission-saved"
export { Project } from "@ocnano/schema/project"
export { Worktree } from "@ocnano/schema/worktree"
export { Vcs } from "@ocnano/schema/vcs"
export { Provider } from "@ocnano/schema/provider"
export { Pty } from "@ocnano/schema/pty"
export { Question } from "@ocnano/schema/question"
export { Reference } from "@ocnano/schema/reference"
export { WebSearch } from "@ocnano/schema/websearch"
export { AbsolutePath, RelativePath } from "@ocnano/schema/schema"
export { Session } from "@ocnano/schema/session"
export { SessionInbox } from "@ocnano/schema/session-inbox"
export { SessionMessage } from "@ocnano/schema/session-message"
export { Skill } from "@ocnano/schema/skill"
export { Prompt } from "@ocnano/schema/prompt"
export { PromptInput } from "@ocnano/schema/prompt-input"
export type { OcNanoEvent } from "@ocnano/protocol/groups/event"
export type OcNanoClient = Effect.Success<ReturnType<typeof OcNano.make>>
