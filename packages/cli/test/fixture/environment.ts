import os from "node:os"
import path from "node:path"

// Each isolated home gets its own XDG_CACHE_HOME, where Bun would otherwise keep its transpiler cache,
// so every spawned CLI process would transpile the source from scratch. Share one cache instead.
export const transpilerCache = path.join(os.tmpdir(), "ocnano-test-transpiler-cache")

export function isolatedEnv(root: string, overrides: Record<string, string | undefined> = {}) {
  return {
    ...process.env,
    BUN_RUNTIME_TRANSPILER_CACHE_PATH: transpilerCache,
    HOME: root,
    OCNANO_CLI_CONFIG_CONTENT: undefined,
    OCNANO_CONFIG_CONTENT: "{}",
    OCNANO_CONFIG_DIR: path.join(root, "config"),
    OCNANO_DB: path.join(root, "ocnano.db"),
    OCNANO_DISABLE_FILEWATCHER: "true",
    OCNANO_DISABLE_MODELS_FETCH: "true",
    OCNANO_TEST_HOME: root,
    XDG_CACHE_HOME: path.join(root, "cache"),
    XDG_CONFIG_HOME: path.join(root, "xdg-config"),
    XDG_DATA_HOME: path.join(root, "data"),
    XDG_STATE_HOME: path.join(root, "state"),
    ...overrides,
  }
}
