import { EOL } from "os"
import { Effect } from "effect"
import { OcNano } from "@ocnano/client"
import { Service } from "@ocnano/client/effect/service"
import { Commands } from "../../commands"
import { Runtime } from "../../../framework/runtime"
import { ServerConnection } from "../../../services/server-connection"
import { redactConfig } from "./redact"

export default Runtime.handler(
  Commands.commands.debug.commands.config,
  Effect.fn("cli.debug.config")(function* () {
    const { endpoint } = yield* ServerConnection.resolve()
    const client = OcNano.make({ baseUrl: endpoint.url, headers: Service.headers(endpoint) })
    const entries = yield* Effect.promise(() => client.config.get({ location: { directory: process.cwd() } }))
    process.stdout.write(JSON.stringify(redactConfig(entries), null, 2) + EOL)
  }),
)
