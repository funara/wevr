import { describe, it, before, after } from "node:test"
import assert from "node:assert"
import { existsSync, writeFileSync, readFileSync, rmSync, readdirSync, mkdirSync, mkdtempSync } from "node:fs"
import { join, dirname } from "node:path"
import { tmpdir } from "node:os"
import { backupExistingConfig } from "./backup.js"

describe("backup", () => {
  const tempDir = mkdtempSync(join(tmpdir(), "wevr-backup-"))
  const configPath = join(tempDir, "opencode.jsonc")
  const TEST_CONTENT = JSON.stringify({ test: true })

  function findBackups() {
    try {
      return readdirSync(tempDir).filter((f) => f.startsWith("opencode.jsonc.bak."))
    } catch { return [] }
  }

  before(() => {
    mkdirSync(tempDir, { recursive: true })
  })

  after(() => {
    if (existsSync(tempDir)) rmSync(tempDir, { recursive: true })
  })

  it("skips if no config exists (no throw)", () => {
    // Ensure no config file exists in temp dir
    if (existsSync(configPath)) rmSync(configPath)
    for (const bak of findBackups()) {
      rmSync(join(tempDir, bak))
    }
    backupExistingConfig(configPath)
    assert.ok(true)
  })

  it("copies existing config to backup with timestamped name", () => {
    // Write test config
    writeFileSync(configPath, TEST_CONTENT, "utf-8")

    backupExistingConfig(configPath)

    const backups = findBackups()
    assert.ok(backups.length > 0, "timestamped backup file should exist")
    const newest = backups.sort().reverse()[0]
    const newestPath = join(tempDir, newest)
    assert.ok(newestPath.includes("opencode.jsonc.bak."), "backup should be timestamped")
    const backupContent = JSON.parse(readFileSync(newestPath, "utf-8"))
    assert.deepStrictEqual(backupContent, { test: true })
  })
})
