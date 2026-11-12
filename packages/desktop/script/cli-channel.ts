import { readFile } from "node:fs/promises"
import type { Channel } from "./utils"

// The desktop reads the bundled CLI's registration from ~/.local/state/ocnano/service.json. The
// CLI writes that file only for the channels below (packages/cli/src/services/service-config.ts)
// and writes service-<channel>.json for every other one. A CLI built for such a channel leaves
// the desktop waiting for a registration that never arrives, and the app shows a blank window.
const registrationChannels = ["latest", "dev", "beta", "next"] as const

// The channel a CLI was built for, read from its version. A preview build carries it in the
// version (0.0.0-<channel>-<buildNumber>); a release build carries no channel and belongs to
// the latest channel.
export function cliChannel(version: string) {
  const preview = /^0\.0\.0-(.+)-([0-9][0-9.]*)$/.exec(version.trim())
  if (!preview) return "latest"
  return preview[1]
}

// The channel the bundled CLI has to be built for, so the desktop finds its registration.
export function desktopChannel(channel: Channel) {
  if (channel === "prod") return "latest"
  return channel
}

export function verifyCliChannel(input: { readonly desktop: Channel; readonly version: string }) {
  const channel = cliChannel(input.version)
  const expected = desktopChannel(input.desktop)
  if (channel === expected) return
  throw new Error(
    `The bundled CLI was built for channel ${channel}, but the desktop channel is ${input.desktop}. ` +
      `The desktop reads the CLI registration from service.json, which the CLI only writes for the ${registrationChannels.join(", ")} channels. ` +
      `Build the CLI with OCNANO_CHANNEL=${expected}: cd packages/cli && OCNANO_CHANNEL=${expected} bun run script/build.ts`,
  )
}

export async function verifyBundledCli(input: { readonly desktop: Channel; readonly versionFile: string }) {
  const version = await readFile(input.versionFile, "utf8").catch(() => "")
  if (!version.trim())
    throw new Error(`The bundled CLI has no version file: ${input.versionFile}. Build the CLI before the desktop app.`)
  verifyCliChannel({ desktop: input.desktop, version })
}
