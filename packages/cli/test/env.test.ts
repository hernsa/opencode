import { expect, test } from "bun:test"
import { Env } from "../src/env"

test("session environment omits server credentials", () => {
  const previousPassword = process.env.OCNANO_PASSWORD
  const previousLegacyPassword = process.env.OCNANO_SERVER_PASSWORD
  const previousValue = process.env.OCNANO_SESSION_ENV_TEST
  process.env.OCNANO_PASSWORD = "password"
  process.env.OCNANO_SERVER_PASSWORD = "legacy"
  process.env.OCNANO_SESSION_ENV_TEST = "included"

  const environment = Env.session()

  if (previousPassword === undefined) delete process.env.OCNANO_PASSWORD
  else process.env.OCNANO_PASSWORD = previousPassword
  if (previousLegacyPassword === undefined) delete process.env.OCNANO_SERVER_PASSWORD
  else process.env.OCNANO_SERVER_PASSWORD = previousLegacyPassword
  if (previousValue === undefined) delete process.env.OCNANO_SESSION_ENV_TEST
  else process.env.OCNANO_SESSION_ENV_TEST = previousValue

  expect(environment.OCNANO_PASSWORD).toBeUndefined()
  expect(environment.OCNANO_SERVER_PASSWORD).toBeUndefined()
  expect(environment.OCNANO_SESSION_ENV_TEST).toBe("included")
})
