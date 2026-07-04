import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { getTuiConfigPath } from "./paths.js"

export function writeTuiConfig(themeName, customPath) {
  const path = customPath || getTuiConfigPath()
  let config = {
    "$schema": "https://opencode.ai/tui.json"
  }

  if (existsSync(path)) {
    try {
      const content = readFileSync(path, "utf-8")
      config = JSON.parse(content)
    } catch {
      // If parsing fails, fall back to default structure
    }
  }

  config.theme = themeName

  writeFileSync(path, JSON.stringify(config, null, 2), "utf-8")
}
