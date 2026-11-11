import { Plugin } from "@ocnano/plugin/tui"
import { createMermaidCodeBlockRenderer } from "./markdown.js"
import { resolveOcNanoDiagramPalette } from "./palette.js"

export default Plugin.define({
  id: "ocnano.merman",
  setup(context) {
    context.markdown.registerCodeBlockRenderer(
      "mermaid",
      createMermaidCodeBlockRenderer(context.renderer, () => ({
        colors: resolveOcNanoDiagramPalette(context.theme, context.themeMode),
      })),
    )
  },
})
