import { NodeFileSystem } from "@effect/platform-node"
import { compile, emitEffectImported, emitEffectShape, emitPromise, write } from "@ocnano/httpapi-codegen"
import {
  ClientApi,
  clientNamespace,
  effectOmitEndpoints,
  groupNames,
  promiseOmitEndpoints,
} from "@ocnano/protocol/client"
import { Agent } from "@ocnano/schema/agent"
import { Artifact } from "@ocnano/schema/artifact"
import { Command } from "@ocnano/schema/command"
import { Config } from "@ocnano/schema/config"
import { Credential } from "@ocnano/schema/credential"
import { Event } from "@ocnano/schema/event"
import { EventLog } from "@ocnano/schema/event-log"
import { FileDiff } from "@ocnano/schema/file-diff"
import { FileSystem } from "@ocnano/schema/filesystem"
import { Form } from "@ocnano/schema/form"
import { Generate } from "@ocnano/schema/generate"
import { Instruction } from "@ocnano/schema/instruction"
import { InstructionEntry } from "@ocnano/schema/instruction-entry"
import { Integration } from "@ocnano/schema/integration"
import { Job } from "@ocnano/schema/job"
import { Location } from "@ocnano/schema/location"
import { Mcp } from "@ocnano/schema/mcp"
import { Model } from "@ocnano/schema/model"
import { Money } from "@ocnano/schema/money"
import { Permission } from "@ocnano/schema/permission"
import { PermissionSaved } from "@ocnano/schema/permission-saved"
import { Plugin } from "@ocnano/schema/plugin"
import { Project } from "@ocnano/schema/project"
import { Worktree } from "@ocnano/schema/worktree"
import { AgentAttachment, FileAttachment, Prompt, PromptMention } from "@ocnano/schema/prompt"
import { PromptInput } from "@ocnano/schema/prompt-input"
import { Provider } from "@ocnano/schema/provider"
import { Pty } from "@ocnano/schema/pty"
import { PtyTicket } from "@ocnano/schema/pty-ticket"
import { Question } from "@ocnano/schema/question"
import { Reference } from "@ocnano/schema/reference"
import { AbsolutePath, RelativePath } from "@ocnano/schema/schema"
import { Schedule } from "@ocnano/schema/schedule"
import { Session } from "@ocnano/schema/session"
import { SessionMessage } from "@ocnano/schema/session-message"
import { SessionInbox } from "@ocnano/schema/session-inbox"
import { Shell } from "@ocnano/schema/shell"
import { Skill } from "@ocnano/schema/skill"
import { Snapshot } from "@ocnano/schema/snapshot"
import { UsageLimits } from "@ocnano/schema/usage-limits"
import { Vcs } from "@ocnano/schema/vcs"
import { WebSearch } from "@ocnano/schema/websearch"
import { Workspace } from "@ocnano/schema/workspace"
import { Effect, Schema } from "effect"
import { fileURLToPath } from "url"

const promiseContract = compile(ClientApi, {
  groupNames,
  omitEndpoints: promiseOmitEndpoints,
  namespace: clientNamespace,
  aliases: true,
})
const effectContract = compile(ClientApi, {
  groupNames,
  omitEndpoints: effectOmitEndpoints,
  namespace: clientNamespace,
  aliases: true,
})
const effectTypeReferences = [
  ...namespaceTypes("Agent", "@ocnano/schema/agent", Agent),
  ...namespaceTypes("Artifact", "@ocnano/schema/artifact", Artifact),
  ...namespaceTypes("Command", "@ocnano/schema/command", Command),
  ...namespaceTypes("Config", "@ocnano/schema/config", Config),
  ...namespaceTypes("Credential", "@ocnano/schema/credential", Credential),
  ...namespaceTypes("Event", "@ocnano/schema/event", Event),
  ...namespaceTypes("EventLog", "@ocnano/schema/event-log", EventLog),
  ...namespaceTypes("FileDiff", "@ocnano/schema/file-diff", FileDiff),
  ...namespaceTypes("FileSystem", "@ocnano/schema/filesystem", FileSystem),
  ...namespaceTypes("Form", "@ocnano/schema/form", Form),
  ...namespaceTypes("Generate", "@ocnano/schema/generate", Generate),
  ...namespaceTypes("Instruction", "@ocnano/schema/instruction", Instruction),
  ...namespaceTypes("InstructionEntry", "@ocnano/schema/instruction-entry", InstructionEntry),
  ...namespaceTypes("Integration", "@ocnano/schema/integration", Integration),
  ...namespaceTypes("Job", "@ocnano/schema/job", Job),
  typeReference("Location.PublicRef", "@ocnano/schema/location", Location.PublicRef),
  typeReference("Location.PublicInfo", "@ocnano/schema/location", Location.PublicInfo),
  ...namespaceTypes("Mcp", "@ocnano/schema/mcp", Mcp),
  ...namespaceTypes("Model", "@ocnano/schema/model", Model),
  ...namespaceTypes("Money", "@ocnano/schema/money", Money),
  ...namespaceTypes("Permission", "@ocnano/schema/permission", Permission),
  ...namespaceTypes("PermissionSaved", "@ocnano/schema/permission-saved", PermissionSaved),
  ...namespaceTypes("Plugin", "@ocnano/schema/plugin", Plugin),
  ...namespaceTypes("Project", "@ocnano/schema/project", Project),
  ...namespaceTypes("Worktree", "@ocnano/schema/worktree", Worktree),
  ...namespaceTypes("PromptInput", "@ocnano/schema/prompt-input", PromptInput),
  ...namespaceTypes("Provider", "@ocnano/schema/provider", Provider),
  ...namespaceTypes("Pty", "@ocnano/schema/pty", Pty),
  ...namespaceTypes("PtyTicket", "@ocnano/schema/pty-ticket", PtyTicket),
  ...namespaceTypes("Question", "@ocnano/schema/question", Question),
  ...namespaceTypes("Reference", "@ocnano/schema/reference", Reference),
  ...namespaceTypes("Schedule", "@ocnano/schema/schedule", Schedule),
  ...namespaceTypes("Session", "@ocnano/schema/session", Session),
  ...namespaceTypes("SessionMessage", "@ocnano/schema/session-message", SessionMessage),
  ...namespaceTypes("SessionInbox", "@ocnano/schema/session-inbox", SessionInbox),
  ...namespaceTypes("Shell", "@ocnano/schema/shell", Shell),
  ...namespaceTypes("Skill", "@ocnano/schema/skill", Skill),
  ...namespaceTypes("Snapshot", "@ocnano/schema/snapshot", Snapshot),
  ...namespaceTypes("UsageLimits", "@ocnano/schema/usage-limits", UsageLimits),
  ...namespaceTypes("Vcs", "@ocnano/schema/vcs", Vcs),
  ...namespaceTypes("WebSearch", "@ocnano/schema/websearch", WebSearch),
  ...namespaceTypes("Workspace", "@ocnano/schema/workspace", Workspace),
  typeReference("Prompt", "@ocnano/schema/prompt", Prompt),
  typeReference("PromptMention", "@ocnano/schema/prompt", PromptMention),
  typeReference("FileAttachment", "@ocnano/schema/prompt", FileAttachment),
  typeReference("AgentAttachment", "@ocnano/schema/prompt", AgentAttachment),
  typeReference("AbsolutePath", "@ocnano/schema/schema", AbsolutePath),
  typeReference("RelativePath", "@ocnano/schema/schema", RelativePath),
]

await Effect.runPromise(
  Effect.all(
    [
      write(
        emitPromise(promiseContract, {
          mutableOutputs: true,
        }),
        fileURLToPath(new URL("../src/promise/generated", import.meta.url)),
      ),
      write(
        emitEffectImported(effectContract, {
          module: "../../contract",
          api: "ClientApi",
          shapeModule: "../api/api.js",
        }),
        fileURLToPath(new URL("../src/effect/generated", import.meta.url)),
      ),
      write(
        emitEffectShape(effectContract, {
          typeReferences: effectTypeReferences,
          outputTypes: {
            "event.subscribe": {
              name: "OC NanoEvent",
              import: 'import type { OC NanoEvent } from "@ocnano/protocol/groups/event"',
            },
          },
        }),
        fileURLToPath(new URL("../src/effect/api", import.meta.url)),
      ),
    ],
    { concurrency: 3, discard: true },
  ).pipe(Effect.provide(NodeFileSystem.layer)),
)

function namespaceTypes(namespace: string, module: string, values: object) {
  return Object.entries(values).flatMap(([name, schema]) =>
    Schema.isSchema(schema) ? [typeReference(`${namespace}.${name}`, module, schema)] : [],
  )
}

function typeReference(name: string, module: string, schema: Schema.Top) {
  return {
    schema,
    name,
    import: `import type { ${name.split(".")[0]} } from ${JSON.stringify(module)}`,
  }
}
