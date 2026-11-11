import type { OcNanoEvent } from "@ocnano/client"
import type { SelectedEvent, SubscribeOptions } from "@ocnano/client/promise/api"

type EventType = Exclude<OcNanoEvent["type"], "server.connected">

export interface EventDomain {
  readonly subscribe: <Type extends EventType = EventType>(
    options?: SubscribeOptions<Type>,
  ) => AsyncIterable<SelectedEvent<OcNanoEvent, Type>>
}
