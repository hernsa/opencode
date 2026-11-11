#!/usr/bin/env bun
import path from "node:path"
import { pack } from "@ocnano/script/pack"

await pack(path.resolve(import.meta.dir, ".."), { source: true })
