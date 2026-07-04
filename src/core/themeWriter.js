import { mkdirSync, cpSync, existsSync, readdirSync, unlinkSync } from "node:fs"
import { resolve } from "node:path"
import { getThemesDir } from "./paths.js"

export function writeThemes(templatesDir, destDir) {
  const sourcePath = resolve(templatesDir, "themes")
  const targetDir = destDir || getThemesDir()

  // Clear any existing .json files in targetDir to prevent stale themes
  if (existsSync(targetDir)) {
    try {
      for (const file of readdirSync(targetDir)) {
        if (file.endsWith(".json")) {
          unlinkSync(resolve(targetDir, file))
        }
      }
    } catch {
      // Ignore
    }
  }

  mkdirSync(targetDir, { recursive: true })
  if (existsSync(sourcePath)) {
    cpSync(sourcePath, targetDir, { recursive: true })
  }
}
