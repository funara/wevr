import { mkdirSync, copyFileSync } from "node:fs"
import { resolve } from "node:path"
import { getThemesDir } from "./paths.js"

export function writeThemes(templatesDir, destDir) {
  const sourcePath = resolve(templatesDir, "themes", "wevr-contrast.json")
  const targetDir = destDir || getThemesDir()
  const destPath = resolve(targetDir, "wevr-contrast.json")

  mkdirSync(targetDir, { recursive: true })
  copyFileSync(sourcePath, destPath)
}
