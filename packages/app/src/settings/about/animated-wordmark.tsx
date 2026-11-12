import { createEffect, For, on, onCleanup } from "solid-js"
import { createStore } from "solid-js/store"
import { prefersReducedMotion } from "@ocnano/ui/motion"

// The wordmark settles letter by letter. Each slot holds one glyph of the OC Nano wordmark while it settles.
const target = ["O", "C", "N", "A", "N", "O"] as const

// The glyphs a slot cycles through while it is still scrambling.
const choices = ["O", "C", "N", "A", "D"] as const

// The glyph positions, in the logo's 234x42 viewBox. They line up with the wordmark in @ocnano/ui/logo.
const positions: readonly number[] = [15, 54, 102, 141, 180, 219]

export function AnimatedWordmark(props: { active: boolean }) {
  const [state, setState] = createStore<{ letters: string[] }>({ letters: [...target] })
  const timers = new Set<ReturnType<typeof setTimeout>>()

  createEffect(
    on(
      () => props.active,
      (active) => {
        timers.forEach(clearTimeout)
        timers.clear()

        if (!active || prefersReducedMotion()) {
          setState("letters", [...target])

          return
        }

        const starts = target.map(() => choices[Math.floor(Math.random() * choices.length)])
        const settles = target.map(() => 6 + Math.floor(Math.random() * 8))
        const last = Math.max(...settles)
        setState("letters", starts)

        Array.from({ length: last }, (_, index) => index + 1).forEach((tick) => {
          const timer = setTimeout(() => {
            setState(
              "letters",
              target.map((letter, index) =>
                tick >= settles[index] ? letter : choices[Math.floor(Math.random() * choices.length)],
              ),
            )
            timers.delete(timer)
          }, tick * 75)

          timers.add(timer)
        })
      },
    ),
  )

  onCleanup(() => timers.forEach(clearTimeout))

  return (
    <svg class="settings-about-wordmark" viewBox="0 0 234 42" aria-hidden="true">
      <For each={state.letters}>
        {(letter, index) => (
          <>
            <text
              class="settings-about-letter-shadow"
              x={positions[index()]}
              y="35"
              transform="translate(0 1.5)"
              text-anchor="middle"
              font-family="var(--font-family-sans)"
              font-size="40"
              font-weight="600"
            >
              {letter}
            </text>
            <text
              x={positions[index()]}
              y="35"
              text-anchor="middle"
              font-family="var(--font-family-sans)"
              font-size="40"
              font-weight="600"
            >
              {letter}
            </text>
          </>
        )}
      </For>
    </svg>
  )
}
