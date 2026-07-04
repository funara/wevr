import { describe, it, after } from "node:test"
import assert from "node:assert"
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { writeConfig } from "./configWriter.js"

describe("configWriter", () => {
  const tempDir = mkdtempSync(join(tmpdir(), "wevr-configwriter-"))

  after(() => {
    if (existsSync(tempDir)) rmSync(tempDir, { recursive: true })
  })

  it("writes config as formatted JSON to the correct path", () => {
    const configObj = { agent: { compose: { model: "test/model" } } }
    const expected = JSON.stringify(configObj, null, 2)

    writeConfig(configObj, tempDir)

    const configPath = join(tempDir, "opencode.jsonc")
    assert.ok(existsSync(configPath), "config file should exist")
    const written = readFileSync(configPath, "utf-8")
    assert.strictEqual(written, expected)
  })
})
