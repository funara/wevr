import { describe, it, after } from "node:test"
import assert from "node:assert"
import { existsSync, mkdtempSync, writeFileSync, readFileSync, rmSync, mkdirSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { writeAgentPrompts } from "./agentPromptWriter.js"

describe("agentPromptWriter", () => {
  const destDir = mkdtempSync(join(tmpdir(), "wevr-apw-dest-"))

  after(() => {
    // Clean up any files written during tests
    if (existsSync(destDir)) rmSync(destDir, { recursive: true })
  })

  it("prepends identity header to agent prompts", () => {
    const tmpDir = mkdtempSync(join(tmpdir(), "apw-source-"))
    const agentPromptsDir = join(tmpDir, "agent-prompts")
    mkdirSync(agentPromptsDir, { recursive: true })

    writeFileSync(join(agentPromptsDir, "builder.txt"), "test instructions", "utf-8")
    writeFileSync(join(agentPromptsDir, "reporter.txt"), "write docs", "utf-8")

    writeAgentPrompts(tmpDir, destDir)

    const coderContent = readFileSync(join(destDir, "builder.txt"), "utf-8")
    const composeReporterContent = readFileSync(join(destDir, "reporter.txt"), "utf-8")

    assert.ok(coderContent.startsWith('You are the "builder" agent.\n\n'),
      "builder should have identity header")
    assert.ok(composeReporterContent.startsWith('You are the "reporter" agent.\n\n'),
      "reporter should have identity header")
    assert.ok(coderContent.includes("test instructions"),
      "original content preserved in builder")
    assert.ok(composeReporterContent.includes("write docs"),
      "original content preserved in reporter")

    rmSync(tmpDir, { recursive: true })
  })

  it("copies hierarchy.txt verbatim without identity header", () => {
    const tmpDir = mkdtempSync(join(tmpdir(), "apw-source2-"))
    const agentPromptsDir = join(tmpDir, "agent-prompts")
    mkdirSync(agentPromptsDir, { recursive: true })

    writeFileSync(join(agentPromptsDir, "hierarchy.txt"), "global reference rules", "utf-8")

    writeAgentPrompts(tmpDir, destDir)

    const hierarchyContent = readFileSync(join(destDir, "hierarchy.txt"), "utf-8")
    assert.strictEqual(hierarchyContent, "global reference rules",
      "hierarchy.txt should be copied verbatim without header")

    rmSync(tmpDir, { recursive: true })
  })
})
