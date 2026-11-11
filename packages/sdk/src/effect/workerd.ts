export * as OcNanoWorkerd from "./workerd"

import { Layer } from "effect"
import type { Config, Scope } from "effect"
import { WorkerdProfile } from "../internal/workerd"
import { OcNano } from "./ocnano"

export type Configuration = WorkerdProfile.Configuration

export interface CreateOptions<R = never> extends WorkerdProfile.Options {
  readonly log?: OcNano.CreateOptions["log"]
  readonly plugins?: OcNano.CreateOptions["plugins"]
  readonly workspaceProviders?: OcNano.CreateOptions["workspaceProviders"]
  readonly instances?: OcNano.CreateOptions<R>["instances"]
}

export const create = <R = never>({ log, plugins, workspaceProviders, instances, ...options }: CreateOptions<R>) => {
  const profile = WorkerdProfile.make(options)
  return OcNano.create(
    { ...profile.options, log, plugins, workspaceProviders, instances },
    { overrides: profile.replacements },
  )
}

export const layer = <R = never>(
  options: CreateOptions<R>,
): Layer.Layer<OcNano.Service, Config.ConfigError | Error, Exclude<R, Scope.Scope>> =>
  Layer.effect(OcNano.Service, create(options))

export type Interface = OcNano.Interface
export type Requirements = Scope.Scope
