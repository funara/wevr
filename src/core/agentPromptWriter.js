import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { basename, extname, resolve } from "node:path"
import { getPromptsDir } from "./paths.js"
import IDENTITY_HEADER from "./identityHeader.js"

// hierarchy.txt is a global reference document (referenced from
// opencode.config.json's `instructions`), not an agent prompt. It must be
// copied verbatim — no agent-identity header.
const REFERENCE_FILES = new Set(["hierarchy"])

export function writeAgentPrompts(templatesDir, destDir) {
  const sourceDir = resolve(templatesDir, "agent-prompts")
  if (!destDir) destDir = getPromptsDir()

  mkdirSync(destDir, { recursive: true })

  for (const file of readdirSync(sourceDir)) {
    if (extname(file) !== ".txt") continue

    const sourcePath = resolve(sourceDir, file)
    const destPath = resolve(destDir, file)
    const content = readFileSync(sourcePath, "utf-8")

    const agentName = basename(file, ".txt")
    if (REFERENCE_FILES.has(agentName)) {
      writeFileSync(destPath, content, "utf-8")
      continue
    }

    writeFileSync(destPath, IDENTITY_HEADER(agentName) + content, "utf-8")
  }
}
