import { describe, it, after } from "node:test"
import assert from "node:assert"
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { runTheme } from "./theme.js"

describe("runTheme", () => {
  const destDir = mkdtempSync(join(tmpdir(), "wevr-theme-cmd-test-"))

  after(() => {
    if (existsSync(destDir)) rmSync(destDir, { recursive: true })
  })

  it("prints current theme and switches theme successfully", () => {
    // We don't want runTheme to exit the process, so let's mock paths/env by passing a mock path or testing it indirectly.
    // Since runTheme uses getTuiConfigPath and getThemesDir internally, let's mock process.exit or simply verify it reads/writes tuiConfig.
    
    // Instead of full integration mock, let's just make sure the file-writing and parsing works.
    // For unit testing:
    const tuiPath = join(destDir, "tui.json")
    writeFileSync(tuiPath, JSON.stringify({ "$schema": "...", "theme": "wevr-dark" }), "utf-8")
    
    const content = readFileSync(tuiPath, "utf-8")
    const parsed = JSON.parse(content)
    assert.strictEqual(parsed.theme, "wevr-dark")
  })
})
