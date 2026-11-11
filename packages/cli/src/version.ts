import { Option, Schema } from "effect"

declare const OCNANO_VERSION: string
declare const OCNANO_CHANNEL: string
declare const OCNANO_ARTIFACT: string
declare const OCNANO_RELEASE_HIGHLIGHTS: string

const version = typeof OCNANO_VERSION === "string" ? OCNANO_VERSION : "local"
const channel = typeof OCNANO_CHANNEL === "string" ? OCNANO_CHANNEL : "local"
const artifact = typeof OCNANO_ARTIFACT === "string" ? OCNANO_ARTIFACT : "cli"
// Stable release builds embed the release notes' Highlights; every other build has none.
const highlights =
  typeof OCNANO_RELEASE_HIGHLIGHTS === "string"
    ? Option.getOrElse(
        Schema.decodeUnknownOption(
          Schema.fromJsonString(Schema.Array(Schema.Struct({ title: Schema.String, body: Schema.String }))),
        )(OCNANO_RELEASE_HIGHLIGHTS),
        () => [],
      )
    : []

export {
  version as OCNANO_VERSION,
  channel as OCNANO_CHANNEL,
  artifact as OCNANO_ARTIFACT,
  highlights as OCNANO_HIGHLIGHTS,
}
export const OCNANO_LOCAL = channel === "local"
