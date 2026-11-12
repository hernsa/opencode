import { createUniqueId, type ComponentProps } from "solid-js"

// The glyphs of the OC Nano wordmark and where they sit in the 720x129 viewBox. They scale the
// positions used by the logo in components/logo.tsx, so both wordmarks line up.
const GLYPHS = [
  { x: 46.2, char: "O" },
  { x: 166.2, char: "C" },
  { x: 313.8, char: "N" },
  { x: 433.8, char: "A" },
  { x: 553.8, char: "N" },
  { x: 673.8, char: "O" },
] as const

export function Wordmark(
  props: Pick<ComponentProps<"svg">, "class"> & { fade?: boolean; muted?: boolean; outline?: boolean },
) {
  const mask = createUniqueId()
  const maskGradient = createUniqueId()

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 720 129"
      fill="none"
      classList={{
        [props.class ?? ""]: !!props.class,
        "overflow-visible [&_path]:[vector-effect:non-scaling-stroke] [&_text]:[vector-effect:non-scaling-stroke]":
          props.outline,
      }}
    >
      <g opacity={props.muted === false ? 1 : 0.6} class="[[data-color-scheme=dark]_&]:opacity-100">
        <g mask={props.fade === false ? undefined : `url(#${mask})`}>
          <g
            opacity={props.muted === false ? 1 : 0.16 * 0.7}
            fill={props.outline ? "none" : "currentColor"}
            stroke={props.outline ? "currentColor" : undefined}
            stroke-width={props.outline ? 1 : undefined}
          >
            {GLYPHS.map((glyph) => (
              <text
                x={glyph.x}
                y="107.7"
                text-anchor="middle"
                font-family="var(--font-family-sans)"
                font-size="123.1"
                font-weight="600"
              >
                {glyph.char}
              </text>
            ))}
          </g>
        </g>
      </g>
      <defs>
        <mask id={mask} style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="720" height="129">
          <rect width="720" height="129" fill={`url(#${maskGradient})`} />
        </mask>
        <linearGradient id={maskGradient} x1="360" y1="68" x2="360" y2="129" gradientUnits="userSpaceOnUse">
          <stop stop-color="white" stop-opacity="0.7" />
          <stop offset="1" stop-color="white" stop-opacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}
