import { app } from "electron"

type Channel = "local" | "dev" | "beta" | "prod"

const raw = import.meta.env.OCNANO_CHANNEL

export const CHANNEL: Channel = raw === "local" || raw === "dev" || raw === "beta" || raw === "prod" ? raw : "dev"

export const VERSION = app.isPackaged ? app.getVersion() : (process.env.OCNANO_VERSION ?? app.getVersion())

const appNames: Record<string, string> = {
  dev: "OC Nano Dev",
  beta: "OC Nano Beta",
  prod: "OC Nano",
}

const appIDs: Record<string, string> = {
  dev: "ai.ocnano.desktop.dev",
  beta: "ai.ocnano.desktop.beta",
  prod: "ai.ocnano.desktop",
}

// Local renderer/server mode keeps the dev application identity.
export const APP_NAME = app.isPackaged ? appNames[CHANNEL] : "OC Nano Dev"

export const APP_ID = app.isPackaged ? appIDs[CHANNEL] : "ai.ocnano.desktop.dev"
