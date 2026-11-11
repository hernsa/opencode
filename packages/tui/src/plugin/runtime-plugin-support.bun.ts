import { ensurePluginRuntime, provides } from "@ocnano/plugin/runtime"
import { Plugin, PluginContextProvider, usePlugin } from "@ocnano/plugin/tui"
import { ensureRuntimePluginSupport } from "@opentui/solid/runtime-plugin-support/configure"

ensurePluginRuntime()
ensureRuntimePluginSupport({
  additional: {
    "@ocnano/plugin/tui": { Plugin, PluginContextProvider, usePlugin },
  },
  preserve: provides,
})
