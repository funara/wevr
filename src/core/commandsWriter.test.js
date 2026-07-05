import { describe, it, after } from "node:test"
import assert from "node:assert"
import { existsSync, mkdtempSync, readFileSync, rmSync, mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { writeCommands } from "./commandsWriter.js"

describe("commandsWriter", () => {
  const destDir = mkdtempSync(join(tmpdir(), "wevr-command-dest-"))

  after(() => {
    if (existsSync(destDir)) rmSync(destDir, { recursive: true })
  })

  it("copies command files to destination directory", () => {
    const tmpSrcDir = mkdtempSync(join(tmpdir(), "wevr-command-src-"))
    const srcCommandsDir = join(tmpSrcDir, "commands")
    mkdirSync(srcCommandsDir, { recursive: true })
    writeFileSync(join(srcCommandsDir, "squeeze-quick.md"), "mock-command-content", "utf-8")

    writeCommands(tmpSrcDir, destDir)

    const destPath = join(destDir, "squeeze-quick.md")
    assert.ok(existsSync(destPath), "command file should be copied")
    assert.strictEqual(readFileSync(destPath, "utf-8"), "mock-command-content")

    rmSync(tmpSrcDir, { recursive: true })
  })
})
