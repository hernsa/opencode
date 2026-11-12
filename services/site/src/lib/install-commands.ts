// Every OcNano install command the site shows: the home install row, the Terminal, Mini and SDK
// pages, the docs, llms.txt, the view-source comment, voice answers and the console API.
// Checked on 5 Nov 2026 against the release workflow on origin/dev (.github/release/publish-npm.sh,
// publish-homebrew.sh, publish-aur.sh, the repo's install script) and the live registries, where each
// one installed OcNano 2.2.5:
// - npm: @ocnano/cli, dist-tag latest = 2.2.5. Its postinstall links the platform binary, so Bun
//   needs --trust and pnpm needs --allow-build. mise resolves `ocnano` to npm:@ocnano/cli.
// - https://opencode.ai/v2/install reads opencode.ai/update/api/latest/cli/npm (@ocnano/cli 2.2.5).
// - Homebrew: anomalyco/tap/ocnano-v2 = 2.2.5. AUR: ocnano-beta = 2.2.5-1.
// OcNano 1 still lives under the old names: the opencode-ai npm package (1.19.5),
// https://opencode.ai/install, anomalyco/tap/ocnano (1.19.5) and the ocnano-bin AUR package
// (1.19.5). test/install-commands.test.ts keeps them out of the site.

/** The home install row, the Terminal and Mini pages, llms.txt, the console API and the view-source comment. */
export const installs = [
  { id: "curl", name: "Script", command: "curl -fsSL https://opencode.ai/v2/install | bash" },
  { id: "npm", name: "npm", command: "npm install -g @ocnano/cli" },
  { id: "bun", name: "Bun", command: "bun install -g --trust @ocnano/cli" },
  { id: "brew", name: "Homebrew", command: "brew install anomalyco/tap/ocnano-v2" },
  { id: "paru", name: "AUR", command: "paru -S ocnano-beta" },
] as const

/** The docs intro's install tabs: every channel that installs OcNano 2. */
export const docsInstalls = [
  { label: "curl", code: installs[0].command },
  { label: "homebrew", code: installs[3].command },
  { label: "npm", code: installs[1].command },
  { label: "bun", code: installs[2].command },
  { label: "pnpm", code: "pnpm add -g --allow-build=@ocnano/cli @ocnano/cli" },
  { label: "yarn", code: "yarn global add @ocnano/cli" },
  { label: "vite+", code: "vp install -g @ocnano/cli" },
  { label: "aur", code: installs[4].command },
  { label: "mise", code: "mise use -g ocnano" },
]

/** The v2 SDK (@ocnano/sdk, dist-tag latest = 2.2.5). */
export const sdkInstalls = [
  { id: "npm", command: "npm i @ocnano/sdk" },
  { id: "bun", command: "bun add @ocnano/sdk" },
] as const

/** The desktop app's Homebrew cask (ocnano-desktop = 2.2.5). */
export const desktopInstall = { id: "cask", command: "brew install --cask ocnano-desktop" }
