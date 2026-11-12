import { copyFile, readdir, stat } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { Arch, type Configuration } from "electron-builder"
import { NativeArch } from "../../script/native-arch"
import { DESKTOP_NATIVE_ENGLISH } from "@ocnano/app/i18n/desktop-native"
import { CLI_BINARIES, getCurrentCli, nodePtyPackage } from "./script/utils"

const packageDir = path.dirname(fileURLToPath(import.meta.url))

// The Electron 42 packaging update briefly installed Linux launchers/icons under
// "ocnano-desktop". Keep that hidden desktop entry around so existing GNOME/KDE
// pins still resolve after the canonical app id changes back to ai.ocnano.desktop.
const legacyDesktopEntry = path.join(packageDir, "resources", "linux", "ocnano-desktop.desktop")

const legacyDesktopEntryFpm = `${legacyDesktopEntry}=/usr/share/applications/ocnano-desktop.desktop`

// rpmbuild adds /usr/lib/.build-id links for every ELF file. The bundled Electron
// binaries are byte-identical across apps on the same Electron version, so those
// links collide with other Electron RPMs (Slack, Unity Hub, ...) and rpm/zypper
// refuse to install or update. They only serve debuginfo lookup, so skip them.
// fpm only accepts flags before the first src=dest mapping, so keep this first.
const rpmNoBuildIdLinksFpm = "--rpm-rpmbuild-define=_build_id_links none"

const metainfoFpm = (appId: string) =>
  `${path.join(packageDir, "resources", `${appId}.metainfo.xml`)}=/usr/share/metainfo/${appId}.metainfo.xml`

// The oc-nano native addon lives in packages/core and is loaded from disk by
// packages/core/src/native/oc-nano-binding.ts, which looks for it next to the running binary
// under <resources>/oc-nano/oc_nano_native.node. A native module cannot be loaded from inside
// the asar archive, so it ships as an extra resource instead of an app file.
const ocNanoResource = {
  from: "../core/src/native",
  to: "oc-nano",
  filter: ["oc_nano_native.node"],
}

// packages/core checks in a win32-x64 build of the addon only, and the CLI gates it the same
// way (packages/cli/src/node/target.ts), so the other targets keep the loader's fallback.
function shipsOcNano(target: { os: string; cpu: string }) {
  return target.os === "win32" && target.cpu === "x64"
}

// Dev and beta package every commit, so they trade about 5% (deb) and 17% (rpm) larger files for xz -1, which
// compresses the payload about 3x faster than the deb default (-3) and 5x faster than the rpm default (-9).
const previewCompressionFpm = (target: "deb" | "rpm") => [`--${target}-compression-level`, "1"]

function resolveChannel() {
  const raw = process.env.OCNANO_CHANNEL

  if (raw === "dev" || raw === "beta" || raw === "prod") return raw

  if (raw === "latest") return "prod"

  return "dev"
}

const APP_IDS = {
  dev: "ai.ocnano.desktop.dev",
  beta: "ai.ocnano.desktop.beta",
  prod: "ai.ocnano.desktop",
} as const

// libappimage (used by AppImageLauncher) resolves the .desktop entry inside an
// AppImage by globbing `*.desktop` at the squashfs root. If the main
// executable itself ends in `.desktop` (prod appId `ai.ocnano.desktop`), the
// ELF binary matches the glob and is parsed as a desktop entry, so
// integration fails with `Malformed desktop entry: Unexpected char '\x7f' at 0`
// (0x7F is the first byte of the ELF magic).
// https://github.com/anomalyco/opencode/issues/51867
// Strip a trailing `.desktop` so the executable can never collide with the
// desktop-entry glob. Beta/dev appIds end in `.beta`/`.dev` and are unaffected.
function linuxExecutableName(appId: string): string {
  return appId.replace(/\.desktop$/, "")
}

const getBase = (appId: string): Configuration => {
  const target = getCurrentCli()
  const desktopName = `${appId}.desktop`

  return {
    artifactName: "ocnano-desktop-${os}-${arch}.${ext}",
    directories: {
      output: "dist",
      buildResources: "resources",
    },
    // Linux launchers are .desktop files, so this is the desktop file name,
    // not just the app id. For prod, app id "ai.ocnano.desktop" becomes
    // "ai.ocnano.desktop.desktop".
    // https://developer.gnome.org/documentation/guidelines/maintainer/integrating.html
    // https://www.electron.build/docs/linux/
    // Release builds take their version from OCNANO_VERSION instead of rewriting package.json.
    extraMetadata: process.env.OCNANO_VERSION
      ? { desktopName, version: process.env.OCNANO_VERSION }
      : { desktopName },
    files: [
      "out/**/*",
      "resources/**/*",
      "!resources/ocnano-cli*",
      // The rename left the upstream CLI binary and its version file in the resources. They are
      // not part of an OC Nano build, and shipping them would put an upstream artifact in the app.
      "!resources/opencode-cli*",
      // Keep only the target platform's node-pty prebuild when cross-packaging with --cpu=*.
      ...CLI_BINARIES.filter((item) => item.os !== target.os || item.cpu !== target.cpu).map(
        (item) => `!**/node_modules/@lydell/node-pty-${item.os}-${item.cpu}{,/**/*}`,
      ),
      // Log export imports Zip.js as ESM. Keep index.js and lib, including its inline worker.
      "!**/node_modules/@zip.js/zip.js/dist{,/**/*}",
      "!**/node_modules/@zip.js/zip.js/{index.cjs,index.min.js,index-fflate.js,deno.json,eslint.config.mjs}",
      // Nothing executes type declarations or source maps, and every entry costs startup time: the
      // main process parses the whole asar header before it runs any JavaScript.
      "!**/node_modules/**/*.d.{ts,cts,mts}",
      "!**/node_modules/**/*.d.{ts,cts,mts}.map",
      "!**/node_modules/**/*.{js,cjs,mjs}.map",
      // These packages execute compiled JavaScript, not their sources.
      "!**/node_modules/ajv/lib{,/**/*}",
      "!**/node_modules/ajv-formats/src{,/**/*}",
      // Keep js-yaml's CommonJS sources and dist/js-yaml.mjs ESM entry, not browser bundles or its CLI.
      "!**/node_modules/js-yaml/dist/{js-yaml.js,js-yaml.min.js,*.map}",
      "!**/node_modules/js-yaml/bin{,/**/*}",
    ],
    extraResources: [
      {
        from: "resources/",
        to: "",
        filter: ["ocnano-cli", "ocnano-cli.exe", "ocnano-cli.version"],
      },
      ...(shipsOcNano(target) ? [ocNanoResource] : []),
    ],
    afterPack: async (context) => {
      const arch = Arch[context.arch]

      // The --arm64 flag picks Electron while OCNANO_TARGET picks the CLI and node-pty, so they can disagree.
      if (arch !== "x64" && arch !== "arm64") throw new Error(`Unsupported desktop architecture: ${arch}`)

      if (arch !== target.cpu) throw new Error(`Packaging ${arch} Electron with the ${target.target} CLI`)
      const resources = context.packager.getResourcesDir(context.appOutDir)
      const cli = path.join(resources, context.electronPlatformName === "win32" ? "ocnano-cli.exe" : "ocnano-cli")

      const file = await stat(cli)

      if (!file.isFile() || file.size === 0) throw new Error(`Bundled CLI must be a non-empty file: ${cli}`)
      await NativeArch.verify(cli, arch)
      const version = path.join(path.dirname(cli), "ocnano-cli.version")

      if ((await stat(version)).size === 0) throw new Error(`Bundled CLI version must be a non-empty file: ${version}`)

      // With an Icon Composer mac.icon, electron-builder bundles the ICNS that actool generates as the pre-macOS 26
      // fallback. That one tops out at 256px and draws a light ring around the squircle, so ship ours instead.
      if (context.electronPlatformName === "darwin")
        await copyFile(path.join(packageDir, "resources/icons/icon.icns"), path.join(resources, "icon.icns"))

      if (context.electronPlatformName !== "win32") return

      // The oc-nano addon ships as an extra resource rather than an app file, so it sits next to
      // the app instead of inside the asar archive. The sidecar loads it from <resources>/oc-nano,
      // which is where the loader in packages/core looks for it.
      if (shipsOcNano(target)) {
        const ocNano = path.join(resources, "oc-nano", "oc_nano_native.node")

        if ((await stat(ocNano)).size === 0) throw new Error(`Bundled oc-nano addon must be a non-empty file: ${ocNano}`)
        await NativeArch.verify(ocNano, arch)
      }

      const prebuilds = path.join(
        resources,
        "app.asar.unpacked/node_modules",
        nodePtyPackage(target.target),
        "prebuilds",
        `${target.os}-${target.cpu}`,
      )

      const addon = path.join(prebuilds, "conpty.node")

      if ((await stat(addon)).size === 0) throw new Error(`Bundled node-pty must be a non-empty file: ${addon}`)
      const entries = await readdir(prebuilds, { recursive: true, withFileTypes: true })

      await Promise.all(
        entries
          .filter((entry) => entry.isFile())
          .map(async (entry) => {
            const file = path.join(entry.parentPath, entry.name)

            if (await NativeArch.isNative(file)) await NativeArch.verify(file, arch)
          }),
      )
    },
    mac: {
      category: "public.app-category.developer-tools",
      icon: `resources/icons/icon.icns`,
      extendInfo: {
        NSMicrophoneUsageDescription: DESKTOP_NATIVE_ENGLISH["desktop.microphoneUsage"],
        // The CLI server and its terminals run as children of the app, so macOS asks for their access to
        // these protected locations in the app's name. The prompt shows the description (#56479).
        NSDocumentsFolderUsageDescription: DESKTOP_NATIVE_ENGLISH["desktop.documentsFolderUsage"],
        NSDesktopFolderUsageDescription: DESKTOP_NATIVE_ENGLISH["desktop.desktopFolderUsage"],
        NSDownloadsFolderUsageDescription: DESKTOP_NATIVE_ENGLISH["desktop.downloadsFolderUsage"],
        NSNetworkVolumesUsageDescription: DESKTOP_NATIVE_ENGLISH["desktop.networkVolumesUsage"],
        NSRemovableVolumesUsageDescription: DESKTOP_NATIVE_ENGLISH["desktop.removableVolumesUsage"],
        NSAutoFillRequiresTextContentTypeForOneTimeCodeOnMac: true,
      },
      target: ["dmg", "zip"],
    },
    protocols: {
      name: "OC Nano",
      schemes: ["ocnano"],
    },
    win: {
      icon: `resources/icons/icon.ico`,
      target: ["nsis"],
      verifyUpdateCodeSignature: false,
    },
    nsis: {
      include: path.join(packageDir, "resources", "windows", "installer.nsh"),
      oneClick: true,
      perMachine: false,
      installerIcon: `resources/icons/icon.ico`,
      installerHeaderIcon: `resources/icons/icon.ico`,
    },
    linux: {
      icon: `resources/icons`,
      category: "Development",
      executableName: linuxExecutableName(appId),
      // Derive the installed `.desktop` filename from `desktopName`
      // (`ai.ocnano.desktop.desktop` for prod) instead of `executableName`,
      // so window association is unaffected by the executable rename above.
      syncDesktopName: true,
      desktop: {
        entry: {
          // Match the installed .desktop file and hicolor icon basename so
          // Linux shells can associate the running Electron window with its launcher.
          StartupWMClass: appId,
        },
      },
      target: ["AppImage", "deb", "rpm"],
    },
  }
}

// OC Nano publishes no releases, so no channel advertises a publish target. The upstream release
// service ignores the product segment of its paths and answers with UPSTREAM OpenCode releases,
// which would replace an OC Nano build with a different product.
export function getConfig() {
  const channel = resolveChannel()
  const appId = APP_IDS[channel]
  const base = getBase(appId)

  switch (channel) {
    case "dev": {
      return {
        ...base,
        appId,
        productName: "OC Nano Dev",
        deb: { fpm: [...previewCompressionFpm("deb"), metainfoFpm(appId)] },
        rpm: {
          packageName: "ocnano-dev",
          fpm: [rpmNoBuildIdLinksFpm, ...previewCompressionFpm("rpm"), metainfoFpm(appId)],
        },
      }
    }

    case "beta": {
      return {
        ...base,
        appId,
        productName: "OC Nano Beta",
        protocols: { name: "OC Nano Beta", schemes: ["ocnano"] },
        deb: { fpm: [...previewCompressionFpm("deb"), metainfoFpm(appId)] },
        rpm: {
          packageName: "ocnano-beta",
          fpm: [rpmNoBuildIdLinksFpm, ...previewCompressionFpm("rpm"), metainfoFpm(appId)],
        },
      }
    }

    case "prod": {
      return {
        ...base,
        appId,
        productName: "OC Nano",
        protocols: { name: "OC Nano", schemes: ["ocnano"] },
        // An Icon Composer package compiles to Assets.car, which macOS 26 and later draw the app icon from
        // (Dock, Finder, system dialogs and the system icon styles). Older macOS keeps using the ICNS.
        mac: { ...base.mac, icon: "resources/icons/icon.icon" },
        // The DMG volume icon would otherwise use the same actool-generated ICNS.
        dmg: { icon: "resources/icons/icon.icns" },
        deb: { fpm: [metainfoFpm(appId), legacyDesktopEntryFpm] },
        rpm: { packageName: "ocnano", fpm: [rpmNoBuildIdLinksFpm, metainfoFpm(appId), legacyDesktopEntryFpm] },
      }
    }
  }
}

export default getConfig()
