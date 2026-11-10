export * as SessionPrompt from "./prompt.js"

import { Base64, FileAttachment } from "@opencode/schema/prompt"
import { PromptInput } from "@opencode/schema/prompt-input"
import { SessionInbox } from "@opencode/schema/session-inbox"
import type { Session } from "@opencode/schema/session"
import type { SessionMessage } from "@opencode/schema/session-message"
import { FSUtil } from "@opencode/util/fs-util"
import { Effect, Option, Result, Schema } from "effect"
import path from "path"
import { fileURLToPath } from "url"
import { Database } from "../database/database.js"
import { Image } from "../image.js"
import { Mime } from "../mime.js"
import { OcNano } from "../native/oc-nano.js"
import { Plugin } from "../plugin/service.js"
import { PluginHooks } from "../plugin/hooks.js"
import { Skill } from "../skill.js"
import { SessionBlob } from "./blob.js"
import { AttachmentError, SkillNotFoundError } from "./error.js"
import { SessionStored } from "./stored.js"

// Image types the resizer can decode; others such as HEIC and AVIF go to the provider unchanged.
const RESIZABLE_IMAGE_MIMES = new Set(["image/png", "image/jpeg", "image/gif", "image/webp", "image/bmp"])

export type Input = {
  text: string
  files?: PromptInput.Prompt["files"]
  agents?: PromptInput.Prompt["agents"]
  skills?: PromptInput.Prompt["skills"]
  metadata?: Record<string, unknown>
  delivery?: SessionInbox.Delivery
}

export const prepare = Effect.fn("SessionPrompt.prepare")(function* (request: {
  session: Session.Info
  messageID: SessionMessage.ID
  input: Input
}) {
  const fs = yield* FSUtil.Service
  yield* Plugin.awaitActivation
  const hooks = yield* PluginHooks.Service
  const event = yield* hooks.trigger("session", "prompt", {
    sessionID: request.session.id,
    messageID: request.messageID,
    prompt: structuredClone({
      text: request.input.text,
      files: request.input.files?.slice(),
      agents: request.input.agents?.slice(),
      skills: request.input.skills?.slice(),
    }),
    metadata: structuredClone(request.input.metadata),
    delivery: request.input.delivery ?? "steer",
  })
  const input = event.prompt
  const conversation = conversationHandle(request.session.id)
  const files = input.files
    ? yield* Effect.forEach(input.files, (file) => materializeAttachment(file, conversation), { concurrency: 8 })
    : undefined
  const requested = input.skills
  const selected = yield* Effect.gen(function* () {
    if (!requested?.length) return undefined
    const skillService = yield* Skill.Service
    const prepared = new Map<Skill.ID, Skill.Name>()
    return yield* Effect.forEach(requested, (attachment) =>
      Effect.gen(function* () {
        const name = prepared.get(attachment.id)
        if (name !== undefined) return { id: attachment.id, name, mention: attachment.mention }
        const skill = yield* skillService.get(attachment.id)
        if (!skill) return yield* new SkillNotFoundError({ skill: attachment.id })
        prepared.set(skill.id, skill.name)
        const files = yield* skillService.files(skill.id)
        return {
          id: skill.id,
          name: skill.name,
          text: (yield* Skill.prepare(fs, skill, files).pipe(Effect.orDie)).output,
          mention: attachment.mention,
        }
      }),
    )
  })
  return {
    type: "user",
    payload: SessionInbox.UserPayload.make({
      text: input.text,
      agents: input.agents,
      files,
      skills: selected?.length ? selected : undefined,
      metadata: event.metadata,
    }),
    delivery: event.delivery,
  } satisfies SessionInbox.Item
})

const materializeAttachment = Effect.fn("SessionPrompt.materializeAttachment")(function* (
  input: PromptInput.FileAttachment,
  conversation: number,
) {
  // Stored blob bytes were normalized when first admitted, so a `media:` ref re-admits them unchanged.
  const ref = Schema.decodeUnknownOption(SessionStored.Ref)(input.uri)
  if (Option.isSome(ref)) {
    const blob = yield* readBlobAttachment(ref.value)
    // A blob is named by the hash of its bytes, so the arena holds the same
    // bytes the row holds and either copy encodes the same attachment.
    const id = attachmentId(input.uri, undefined, undefined, "")
    const cached = nativeCall(() => OcNano.getAttachment(id))
    const bytes = cached ?? blob.data
    if (cached === undefined) keepAttachment(conversation, id, bytes)
    return FileAttachment.create({
      data: Base64.make(encodeBase64(bytes)),
      mime: blob.mime,
      source: input.source ?? { type: "inline" },
      name: input.name,
      description: input.description,
      mention: input.mention,
    })
  }
  const label = attachmentLabel(input)
  const resolved = input.uri.startsWith("data:")
    ? {
        bytes: yield* decodeDataURL(input.uri, label),
        source: input.source ?? { type: "inline" as const },
        start: undefined,
        end: undefined,
        name: undefined,
        mime: undefined,
      }
    : yield* readFileAttachment(input.uri, conversation)
  if (resolved.bytes.byteLength > MAX_ATTACHMENT_BYTES)
    return yield* new AttachmentError({
      uri: label,
      message: `Attachment exceeds the ${MAX_ATTACHMENT_BYTES} byte limit: ${label}`,
    })

  const mime = resolved.mime ?? Mime.detect(resolved.bytes)
  const content =
    mime === "text/plain" && resolved.start !== undefined
      ? Buffer.from(
          Buffer.from(resolved.bytes.buffer, resolved.bytes.byteOffset, resolved.bytes.byteLength)
            .toString("utf8")
            .split("\n")
            .slice(resolved.start - 1, resolved.end)
            .join("\n"),
        )
      : resolved.bytes
  const normalized = yield* normalizeImageAttachment(input, encodeBase64(content), mime)
  return FileAttachment.create({
    data: normalized.data,
    mime: normalized.mime,
    source: resolved.source,
    name: input.name ?? resolved.name,
    description: input.description,
    mention: input.mention,
  })
})

const normalizeImageAttachment = Effect.fn("SessionPrompt.normalizeImageAttachment")(function* (
  input: PromptInput.FileAttachment,
  data: string,
  mime: string,
) {
  if (!RESIZABLE_IMAGE_MIMES.has(mime)) return { data: Base64.make(data), mime }
  const image = yield* Image.Service
  const label = attachmentLabel(input)
  const content = { uri: label, content: data, encoding: "base64" as const, mime }
  const normalized = yield* image.normalize(label, content).pipe(
    Effect.catchTag("Image.ResizerUnavailableError", () => Effect.succeed(content)),
    Effect.mapError((error) => new AttachmentError({ uri: label, message: error.message })),
  )
  return { data: Base64.make(normalized.content), mime: normalized.mime }
})

/** A `media:` ref a client received from an experimental `experimental-media-uri` read, sent back as an attachment. */
const readBlobAttachment = Effect.fn("SessionPrompt.readBlobAttachment")(function* (uri: SessionStored.Ref) {
  const { db } = yield* Database.Service
  const blob = yield* SessionBlob.read(db, SessionStored.refHash(uri))
  if (!blob) return yield* new AttachmentError({ uri, message: `Attachment is no longer stored: ${uri}` })
  return blob
})

const readFileAttachment = Effect.fn("SessionPrompt.readFileAttachment")(function* (
  uri: string,
  conversation: number,
) {
  const fs = yield* FSUtil.Service
  const url = yield* Effect.try({
    try: () => new URL(uri),
    catch: () => new AttachmentError({ uri, message: `Invalid attachment URI: ${uri}` }),
  })
  if (url.protocol !== "file:")
    return yield* new AttachmentError({ uri, message: `Unsupported attachment URI: ${uri}` })
  const start = positiveInt(url.searchParams.get("start"))
  const end = positiveInt(url.searchParams.get("end"))
  const target = yield* Effect.try({
    try: () => {
      url.search = ""
      url.hash = ""
      return fileURLToPath(url)
    },
    catch: () => new AttachmentError({ uri, message: `Invalid file URI: ${uri}` }),
  })
  const info = yield* fs
    .stat(target)
    .pipe(Effect.mapError(() => new AttachmentError({ uri, message: `Unable to read attachment: ${uri}` })))
  if (info.type === "Directory") {
    const entries = yield* fs
      .readDirectoryEntries(target)
      .pipe(Effect.mapError(() => new AttachmentError({ uri, message: `Unable to read attachment: ${uri}` })))
    return {
      bytes: Buffer.from(
        entries
          .filter((entry) => entry.type === "File" || entry.type === "Directory")
          .sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === "Directory" ? -1 : 1))
          .map((entry) => entry.name + (entry.type === "Directory" ? path.sep : ""))
          .join("\n"),
      ),
      source: { type: "uri" as const, uri },
      start: undefined,
      end: undefined,
      name: path.basename(target),
      mime: "application/x-directory",
    }
  }
  if (info.type !== "File") return yield* new AttachmentError({ uri, message: `Attachment is not a file: ${uri}` })
  if (Number(info.size) > MAX_ATTACHMENT_BYTES)
    return yield* new AttachmentError({
      uri,
      message: `Attachment exceeds the ${MAX_ATTACHMENT_BYTES} byte limit: ${uri}`,
    })
  // The arena holds the bytes of an unchanged file, so a file attached again is
  // read once. The size and modification time are part of the id, so a file
  // edited since it was read is read again rather than served with its old
  // contents.
  const id = attachmentId(uri, start, end, `${info.size}:${Option.getOrUndefined(info.mtime)?.getTime() ?? ""}`)
  const cached = nativeCall(() => OcNano.getAttachment(id))
  if (cached)
    return { bytes: cached, source: { type: "uri" as const, uri }, start, end, name: path.basename(target), mime: undefined }
  const bytes = yield* fs
    .readFile(target)
    .pipe(Effect.mapError(() => new AttachmentError({ uri, message: `Unable to read attachment: ${uri}` })))
  keepAttachment(conversation, id, bytes)
  return { bytes, source: { type: "uri" as const, uri }, start, end, name: path.basename(target), mime: undefined }
})

const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024

// A data URL is the whole file; errors and logs must name the attachment, not echo its bytes.
function attachmentLabel(input: PromptInput.FileAttachment) {
  return input.name ?? (input.uri.startsWith("data:") ? "inline attachment" : input.uri)
}

function decodeDataURL(uri: string, label: string) {
  return Effect.try({
    try: () => {
      const comma = uri.indexOf(",")
      if (comma === -1) throw new Error("Invalid data URL")
      const metadata = uri.slice(5, comma)
      const payload = uri.slice(comma + 1)
      if (!metadata.split(";").some((part) => part.toLowerCase() === "base64"))
        return Buffer.from(decodeURIComponent(payload))
      const bytes = Buffer.from(payload, "base64")
      if (bytes.toString("base64") !== payload) throw new Error("Non-canonical base64")
      return bytes
    },
    catch: () => new AttachmentError({ uri: label, message: `Invalid attachment data URL: ${label}` }),
  })
}

function positiveInt(value: string | null) {
  if (value === null) return
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
}

/**
 * A stable id for one set of attachment bytes. The URI and the range it covers
 * name the attachment, and `stamp` tells one revision of a file from another.
 */
function attachmentId(uri: string, start: number | undefined, end: number | undefined, stamp: string) {
  return `${uri}|${start ?? ""}|${end ?? ""}|${stamp}`
}

/** A stable handle for a Session, so the native arena groups its attachments under one conversation. */
function conversationHandle(sessionID: string) {
  let hash = 0
  for (let index = 0; index < sessionID.length; index++)
    hash = (Math.imul(hash, 31) + sessionID.charCodeAt(index)) | 0
  return hash >>> 0
}

/**
 * The arena keeps every attachment it is given for the life of the process and
 * cannot evict one, so registrations are capped: past the budget the plain
 * filesystem path is used and nothing more is held.
 */
const NATIVE_ATTACHMENT_BUDGET = 64 * 1024 * 1024
const NATIVE_ATTACHMENT_LIMIT = 512
const nativeAttachments = new Map<string, number>()
let nativeAttachmentBytes = 0

/** Keeps the bytes in the native arena, so the same attachment is read once. */
function keepAttachment(conversation: number, id: string, bytes: Uint8Array) {
  if (!OcNano.available()) return
  if (nativeAttachments.has(id)) return
  if (nativeAttachments.size >= NATIVE_ATTACHMENT_LIMIT) return
  if (nativeAttachmentBytes + bytes.byteLength > NATIVE_ATTACHMENT_BUDGET) return
  if (!nativeCall(() => OcNano.putAttachment(conversation, id, bytes))) return
  nativeAttachments.set(id, bytes.byteLength)
  nativeAttachmentBytes += bytes.byteLength
}

/**
 * A native call that never changes what the caller does: a missing addon or a
 * native failure yields no result and the plain TypeScript path continues.
 */
function nativeCall<A>(run: () => A) {
  return Result.try(run).pipe(Result.getOrUndefined)
}

/** Base64 of the bytes without copying them again: they already sit in a buffer. */
function encodeBase64(bytes: Uint8Array) {
  return Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).toString("base64")
}
