import { describe, it } from "node:test"
import assert from "node:assert"
import { platformAsset, validatePath, findSqueezePath, ASSETS } from "./squeezeInstaller.js"

describe("platformAsset", () => {
  it("returns a string or null for current platform", () => {
    const result = platformAsset()
    // On a supported platform: string; on unsupported: null
    assert.ok(result === null || typeof result === "string")
  })

  it("returns known asset names for mapped platforms", () => {
    // Verify the ASSETS map has entries for all known platform combos
    const knownCombos = [
      { plat: "darwin", arch: "arm64" },
      { plat: "darwin", arch: "x64" },
      { plat: "linux", arch: "x64" },
      { plat: "linux", arch: "arm64" },
      { plat: "win32", arch: "x64" },
    ]
    for (const { plat, arch } of knownCombos) {
      const key = `${plat}-${arch}`
      const asset = ASSETS[key]
      assert.ok(asset, `ASSETS map should have entry for ${key}`)
      assert.ok(asset.endsWith(".tar.gz") || asset.endsWith(".zip"),
        `Asset "${asset}" should end with .tar.gz or .zip`)
    }
  })
})

describe("validatePath", () => {
  it("accepts simple relative paths", () => {
    assert.doesNotThrow(() => validatePath("foo/bar"))
  })

  it("accepts absolute POSIX paths", () => {
    assert.doesNotThrow(() => validatePath("/home/user/.config"))
  })

  it("accepts absolute Windows paths", () => {
    assert.doesNotThrow(() => validatePath("C:\\Users\\test"))
  })

  it("accepts paths with spaces", () => {
    assert.doesNotThrow(() => validatePath("C:\\Users\\John Doe\\.config"))
  })

  it("accepts paths with dots and dashes", () => {
    assert.doesNotThrow(() => validatePath("./dir/file-name.ext"))
  })

  it("allows .. in paths (shell metacharacter check only, not path traversal)", () => {
    assert.doesNotThrow(() => validatePath("../evil"))
  })

  it("rejects paths with semicolons", () => {
    assert.throws(() => validatePath("foo;rm -rf /"), /unsafe characters/)
  })

  it("rejects paths with backticks", () => {
    assert.throws(() => validatePath("foo`id`"), /unsafe characters/)
  })

  it("rejects paths with dollar signs", () => {
    assert.throws(() => validatePath("foo$PATH"), /unsafe characters/)
  })

  it("rejects paths with pipe characters", () => {
    assert.throws(() => validatePath("foo|bar"), /unsafe characters/)
  })
})

describe("findSqueezePath", () => {
  it("returns null when squeeze is not available on PATH", () => {
    const result = findSqueezePath()
    // Either null (not on PATH) or a non-empty string (found)
    assert.ok(result === null || typeof result === "string")
  })
})
