import { encodeFilePath } from "@ocnano/util/path"
import type { Files } from "@ocnano/plugin/gui"

/** The file:// URL of a workspace-relative path. */
export function workspaceFileURL(files: Files, path: string) {
  return `file://${encodeFilePath(`${files.root.replaceAll("\\", "/").replace(/\/+$/, "")}/${path}`)}`
}
