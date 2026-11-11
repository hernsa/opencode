import type { OcNanoEvent } from "@ocnano/client"
import { useClient } from "./client"

type EventMetadata = {
  directory: string | undefined
}
type OcNanoEventMap = { [Type in OcNanoEvent["type"]]: Extract<OcNanoEvent, { type: Type }> }

export function useEvent() {
  const client = useClient()

  function subscribe(handler: (event: OcNanoEvent, metadata: EventMetadata) => void) {
    return client.event.listen(({ details }) => {
      if (details.type === "server.connected") return
      handler(details, { directory: details.location?.directory })
    })
  }

  function on<T extends OcNanoEvent["type"]>(
    type: T,
    handler: (event: OcNanoEventMap[T], metadata: EventMetadata) => void,
  ) {
    return client.event.on(type, (event) => {
      handler(event, { directory: event.location?.directory })
    })
  }

  return {
    subscribe,
    on,
  }
}
