import { describe, it, after } from "node:test"
import assert from "node:assert"
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs"
import { join, resolve, dirname } from "node:path"
import { tmpdir } from "node:os"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))

describe("pluginWriter", () => {
  const tempDir = mkdtempSync(join(tmpdir(), "wevr-pluginwriter-"))

  after(() => {
    if (existsSync(tempDir)) rmSync(tempDir, { recursive: true })
  })

  it("copies plugin files and writes package.json", async () => {
    const { writePluginBundle, writePluginPackageJson } = await import("./pluginWriter.js")

    // Use temp dir as target — sandboxed, no real ~/.config/opencode writes
    writePluginBundle(tempDir)

    const pluginsDestDir = join(tempDir, "plugins")
    const pluginFiles = ["wevr-flow.js", "wevr-squeeze.js"]
    for (const f of pluginFiles) {
      assert.ok(existsSync(join(pluginsDestDir, f)),
        `plugin ${f} should be copied to plugins dir`)
    }

    // Clean plugins dir to test package.json separately
    rmSync(pluginsDestDir, { recursive: true })

    writePluginPackageJson(tempDir)

    const pkgPath = join(tempDir, "package.json")
    assert.ok(existsSync(pkgPath), "package.json should exist in temp dir")
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"))
    assert.strictEqual(pkg.type, "module")
    assert.ok(pkg.dependencies["@opencode-ai/plugin"])
  })
})
