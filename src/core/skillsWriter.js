import { mkdirSync, cpSync, existsSync } from "node:fs"
import { resolve } from "node:path"
import { getSkillsDir } from "./paths.js"

export function writeSkills(templatesDir, destDir) {
  const sourcePath = resolve(templatesDir, "skills")
  const targetDir = destDir || getSkillsDir()

  mkdirSync(targetDir, { recursive: true })
  if (existsSync(sourcePath)) {
    cpSync(sourcePath, targetDir, { recursive: true })
  }
}
