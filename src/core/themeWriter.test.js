import { describe, it, after } from "node:test"
import assert from "node:assert"
import { existsSync, mkdtempSync, readFileSync, rmSync, mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { writeThemes } from "./themeWriter.js"

describe("themeWriter", () => {
  const destDir = mkdtempSync(join(tmpdir(), "wevr-theme-dest-"))

  after(() => {
    if (existsSync(destDir)) rmSync(destDir, { recursive: true })
  })

  it("copies theme file to destination directory", () => {
    const tmpSrcDir = mkdtempSync(join(tmpdir(), "wevr-theme-src-"))
    const srcThemesDir = join(tmpSrcDir, "themes")
    mkdirSync(srcThemesDir, { recursive: true })
    writeFileSync(join(srcThemesDir, "wevr-dark.json"), "mock-theme-content", "utf-8")

    writeThemes(tmpSrcDir, destDir)

    const destPath = join(destDir, "wevr-dark.json")
    assert.ok(existsSync(destPath), "theme file should be copied")
    assert.strictEqual(readFileSync(destPath, "utf-8"), "mock-theme-content")

    rmSync(tmpSrcDir, { recursive: true })
  })
})
