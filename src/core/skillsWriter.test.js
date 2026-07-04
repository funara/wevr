import { describe, it, after } from "node:test"
import assert from "node:assert"
import { existsSync, mkdtempSync, readFileSync, rmSync, mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { writeSkills } from "./skillsWriter.js"

describe("skillsWriter", () => {
  const destDir = mkdtempSync(join(tmpdir(), "wevr-skills-dest-"))

  after(() => {
    if (existsSync(destDir)) rmSync(destDir, { recursive: true })
  })

  it("copies skills directories recursively to destination directory", () => {
    const tmpSrcDir = mkdtempSync(join(tmpdir(), "wevr-skills-src-"))
    const srcSkillsDir = join(tmpSrcDir, "skills")
    const testSkillDir = join(srcSkillsDir, "test-skill")
    mkdirSync(testSkillDir, { recursive: true })
    writeFileSync(join(testSkillDir, "SKILL.md"), "mock-skill-content", "utf-8")

    writeSkills(tmpSrcDir, destDir)

    const destPath = join(destDir, "test-skill", "SKILL.md")
    assert.ok(existsSync(destPath), "SKILL.md should be copied recursively")
    assert.strictEqual(readFileSync(destPath, "utf-8"), "mock-skill-content")

    rmSync(tmpSrcDir, { recursive: true })
  })
})
