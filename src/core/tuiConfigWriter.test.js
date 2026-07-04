import { describe, it, after } from "node:test"
import assert from "node:assert"
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { writeTuiConfig } from "./tuiConfigWriter.js"

describe("tuiConfigWriter", () => {
  const destDir = mkdtempSync(join(tmpdir(), "wevr-tui-dest-"))
  const tuiPath = join(destDir, "tui.json")

  after(() => {
    if (existsSync(destDir)) rmSync(destDir, { recursive: true })
  })

  it("writes new tui.json with theme name if it does not exist", () => {
    writeTuiConfig("wevr-contrast", tuiPath)

    assert.ok(existsSync(tuiPath))
    const parsed = JSON.parse(readFileSync(tuiPath, "utf-8"))
    assert.strictEqual(parsed.theme, "wevr-contrast")
    assert.strictEqual(parsed["$schema"], "https://opencode.ai/tui.json")
  })

  it("updates existing tui.json theme name while preserving other fields", () => {
    writeFileSync(tuiPath, JSON.stringify({
      "$schema": "https://opencode.ai/tui.json",
      "theme": "ayu-dark",
      "font": "monolisa"
    }, null, 2), "utf-8")

    writeTuiConfig("wevr-contrast", tuiPath)

    const parsed = JSON.parse(readFileSync(tuiPath, "utf-8"))
    assert.strictEqual(parsed.theme, "wevr-contrast")
    assert.strictEqual(parsed.font, "monolisa")
  })
})
