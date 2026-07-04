import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { getConfigDir } from "./paths.js"

const __dirname = dirname(fileURLToPath(import.meta.url))
const PLUGINS = ["wevr-flow.js", "wevr-squeeze.js"]
const PACKAGE_JSON = {
  type: "module",
  dependencies: { "@opencode-ai/plugin": "^1.17.9" },
}

export function writePluginBundle(targetDir) {
  const baseDir = targetDir || getConfigDir()
  const pluginsDir = join(baseDir, "plugins")
  mkdirSync(pluginsDir, { recursive: true })

  for (const name of PLUGINS) {
    const sourcePath = resolve(__dirname, "../plugins", name)
    copyFileSync(sourcePath, join(pluginsDir, name))
  }
}

export function writePluginPackageJson(targetDir) {
  const baseDir = targetDir || getConfigDir()
  const packageJsonPath = join(baseDir, "package.json")

  writeFileSync(packageJsonPath, JSON.stringify(PACKAGE_JSON, null, 2), "utf-8")
}
