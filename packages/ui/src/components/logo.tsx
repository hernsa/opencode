import { type ComponentProps } from "solid-js"

// The wordmark's glyphs. A constant so the run never picks up JSX whitespace around it.
const WORDMARK = "OC NANO"

export const Mark = (props: { class?: string }) => {
  return (
    <svg
      data-component="logo-mark"
      classList={{ [props.class ?? ""]: !!props.class }}
      viewBox="0 0 16 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path data-slot="logo-logo-mark-shadow" d="M6 8H10V12H6V8Z" fill="var(--icon-weak-base)" />
      <path data-slot="logo-logo-mark-o" d="M12 4H4V16H12V4ZM16 20H0V0H16V20Z" fill="var(--icon-strong-base)" />
    </svg>
  )
}

export const Splash = (props: Pick<ComponentProps<"svg">, "ref" | "class">) => {
  return (
    <svg
      ref={props.ref}
      data-component="logo-splash"
      classList={{ [props.class ?? ""]: !!props.class }}
      viewBox="0 0 80 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M30 40H50V60H30V40Z" fill="var(--icon-base)" />
      <path d="M60 20H20V80H60V20ZM80 100H0V0H80V100Z" fill="var(--icon-strong-base)" />
    </svg>
  )
}

export const Logo = (props: { class?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 234 42"
      fill="none"
      role="img"
      aria-label="OC Nano"
      classList={{ [props.class ?? ""]: !!props.class }}
    >
      {/* The weak ink: the same glyphs dropped a unit and a half, the wordmark's shadow. */}
      <text
        aria-hidden="true"
        x="0"
        y="35"
        font-family="var(--font-family-sans)"
        font-size="40"
        font-weight="600"
        letter-spacing="0.08em"
        textLength="234"
        lengthAdjust="spacingAndGlyphs"
        fill="var(--icon-weak-base)"
        transform="translate(0 1.5)"
      >
        {WORDMARK}
      </text>
      <text
        x="0"
        y="35"
        font-family="var(--font-family-sans)"
        font-size="40"
        font-weight="600"
        letter-spacing="0.08em"
        textLength="234"
        lengthAdjust="spacingAndGlyphs"
        fill="var(--icon-strong-base)"
      >
        {WORDMARK}
      </text>
    </svg>
  )
}
