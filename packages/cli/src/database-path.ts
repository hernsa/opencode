import path from "node:path"
import { OCNANO_CHANNEL } from "./version"

export function databasePath(data: string) {
  const filename =
    process.env.OCNANO_DB ??
    (["latest", "dev", "beta", "next", "prod"].includes(OCNANO_CHANNEL) ||
    process.env.OCNANO_DISABLE_CHANNEL_DB === "1" ||
    process.env.OCNANO_DISABLE_CHANNEL_DB === "true"
      ? "ocnano.db"
      : `ocnano-${OCNANO_CHANNEL.replace(/[^a-zA-Z0-9._-]/g, "-")}.db`)
  return filename === ":memory:" ? filename : path.resolve(data, filename)
}
