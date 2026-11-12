#!/usr/bin/env bun
import { $ } from "bun"
import { exists } from "node:fs/promises"
import path from "node:path"
import { verifyBundledCli } from "./cli-channel"
import {
  copyBuiltCliToResources,
  downloadCliToResources,
  getCurrentCli,
  packageDirectory,
  resolveChannel,
} from "./utils"
import { verifyBundles } from "./verify-bundles"

// Prepares resources/ (icons, metainfo, the bundled CLI) for OCNANO_CHANNEL and builds the app into out/.
// The CLI comes from ../cli/dist when it holds the target; otherwise dev downloads the published dev CLI,
// beta the beta CLI, and prod fails.
const dir = path.resolve(import.meta.dir, "..")

const cli = path.resolve(dir, "../cli/dist")

const channel = resolveChannel()

process.chdir(dir)

await $`bun ./script/copy-icons.ts ${channel}`

await $`bun ./script/copy-metainfo.ts ${channel}`

const built = await exists(path.join(cli, packageDirectory(getCurrentCli().package)))

if (channel === "prod" && !built)
  throw new Error(`Production desktop builds bundle the CLI from ${cli}; build it first`)

if (built) await copyBuiltCliToResources(cli)

if (!built) await downloadCliToResources(channel === "beta" ? "beta" : undefined)

// The desktop reads the CLI registration from service.json, which the CLI only writes for the
// channels it knows. A CLI built for another channel leaves the app waiting for a registration
// that never arrives, so the build stops here instead of shipping a blank window.
await verifyBundledCli({ desktop: channel, versionFile: path.join(dir, "resources", "ocnano-cli.version") })

await $`bunx electron-vite build`

await verifyBundles(path.join(dir, "out"))
