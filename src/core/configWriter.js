import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { getConfigDir } from "./paths.js"

export function writeConfig(configObject, targetDir) {
  const baseDir = targetDir || getConfigDir()
  const configPath = join(baseDir, "opencode.jsonc")
  mkdirSync(baseDir, { recursive: true })
  writeFileSync(configPath, JSON.stringify(configObject, null, 2), "utf-8")
}
