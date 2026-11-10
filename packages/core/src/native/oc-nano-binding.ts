import { existsSync } from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"

// Lazy: on workerd import.meta.url is undefined and the addon is never
// loaded, so createRequire must not run at module scope.
export default function load() {
  const require = createRequire(import.meta.url)
  const candidates = [
    process.env.OPENCODE_OC_NANO_PATH,
    process.env.OPENCODE_NODE_ASSETS_DIR
      ? path.join(process.env.OPENCODE_NODE_ASSETS_DIR, "oc-nano/oc_nano_native.node")
      : undefined,
    path.join(path.dirname(process.execPath), "oc_nano_native.node"),
    path.join(path.dirname(process.execPath), "..", "resources", "oc-nano", "oc_nano_native.node"),
    new URL("./oc_nano_native.node", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"),
  ]
  for (const candidate of candidates) {
    if (!candidate) continue
    if (!existsSync(candidate)) continue
    return require(candidate)
  }
  return undefined
}
