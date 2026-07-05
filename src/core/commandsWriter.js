import { mkdirSync, cpSync, existsSync, readdirSync, unlinkSync } from "node:fs"
import { resolve } from "node:path"
import { getCommandsDir } from "./paths.js"

export function writeCommands(templatesDir, destDir) {
  const sourcePath = resolve(templatesDir, "commands")
  const targetDir = destDir || getCommandsDir()

  // Clear any existing .md files in targetDir to prevent stale commands
  if (existsSync(targetDir)) {
    try {
      for (const file of readdirSync(targetDir)) {
        if (file.endsWith(".md")) {
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
