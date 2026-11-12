import { expect, test } from "bun:test"
import { cliChannel, desktopChannel, verifyCliChannel } from "./cli-channel"

const channels = [
  { desktop: "dev", expected: "dev" },
  { desktop: "beta", expected: "beta" },
  { desktop: "prod", expected: "latest" },
] as const

const versions = [
  { version: "0.0.0-dev-17403", channel: "dev" },
  { version: "0.0.0-dev-17403.2", channel: "dev" },
  { version: "0.0.0-beta-17404", channel: "beta" },
  { version: "0.0.0-next-17403", channel: "next" },
  { version: "0.0.0-oc-nano-hotpaths-17403", channel: "oc-nano-hotpaths" },
  { version: "2.3.4", channel: "latest" },
] as const

const mismatches = [
  { desktop: "dev", version: "0.0.0-oc-nano-hotpaths-17403", expected: "dev" },
  { desktop: "dev", version: "0.0.0-beta-17404", expected: "dev" },
  { desktop: "beta", version: "0.0.0-dev-17403", expected: "beta" },
  { desktop: "prod", version: "0.0.0-dev-17403", expected: "latest" },
] as const

test.each(channels)("the $desktop desktop needs the $expected CLI channel", ({ desktop, expected }) => {
  expect(desktopChannel(desktop)).toBe(expected)
})

test.each(versions)("$version belongs to the $channel channel", ({ version, channel }) => {
  expect(cliChannel(version)).toBe(channel)
})

test.each(channels)("a $expected CLI satisfies the $desktop desktop", ({ desktop, expected }) => {
  expect(() => verifyCliChannel({ desktop, version: `0.0.0-${expected}-17403` })).not.toThrow()
})

test.each(mismatches)(
  "the $desktop desktop rejects a CLI built for another channel",
  ({ desktop, version, expected }) => {
    expect(() => verifyCliChannel({ desktop, version })).toThrow(`Build the CLI with OCNANO_CHANNEL=${expected}`)
  },
)
