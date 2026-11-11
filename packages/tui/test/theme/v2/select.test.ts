import { expect, test } from "bun:test"
import { selectTheme, selectThemeMode, supportsThemeMode, themeModes } from "@ocnano/theme/tui"
import { getOcNanoTheme } from "../../../src/theme"

test("selects complete light and dark themes independently", () => {
  const light = selectTheme(getOcNanoTheme(), "light")
  const dark = selectTheme(getOcNanoTheme(), "dark")
  expect(selectTheme(getOcNanoTheme())).toEqual(light)
  expect(light.hue).toEqual(getOcNanoTheme().light.hue)
  expect(dark.text).toEqual(getOcNanoTheme().base.text)
  expect(dark.hue).toEqual(getOcNanoTheme().dark.hue)
  expect(selectThemeMode(getOcNanoTheme(), "dark")).toEqual({ theme: dark, mode: "dark" })
})

test("selects the available mode when the requested mode is missing", () => {
  const lightOnly = { base: getOcNanoTheme().base, light: getOcNanoTheme().light } as const
  const darkOnly = { base: getOcNanoTheme().base, dark: getOcNanoTheme().dark } as const

  expect(themeModes(lightOnly)).toEqual(["light"])
  expect(themeModes(darkOnly)).toEqual(["dark"])
  expect(supportsThemeMode(lightOnly, "light")).toBeTrue()
  expect(supportsThemeMode(lightOnly, "dark")).toBeFalse()
  expect(selectThemeMode(lightOnly, "dark")).toEqual({ theme: selectTheme(getOcNanoTheme(), "light"), mode: "light" })
  expect(selectThemeMode(darkOnly, "light")).toEqual({ theme: selectTheme(getOcNanoTheme(), "dark"), mode: "dark" })
})
