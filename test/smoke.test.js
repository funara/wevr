/**
 * Smoke tests — live integration checks, no mocks.
 *
 * These verify the two bugs that were fixed:
 *   1. npm registry check works on Windows (npm.cmd instead of npm)
 *   2. opencode is discoverable on PATH (shell: true on Windows)
 *
 * Run: node --test test/smoke.test.js
 */

import { describe, it } from "node:test"
import assert from "node:assert"
import { execFileSync, execSync, spawnSync } from "node:child_process"

// ─── helpers ──────────────────────────────────────────────────────────────────

const isWin = process.platform === "win32"

// ─── 1. npm registry check ────────────────────────────────────────────────────

describe("npm registry check (smoke)", () => {
  it("npm.cmd is callable and returns express version from registry", () => {
    let result
    try {
      if (isWin) {
        result = execSync("npm view express version", {
          stdio: "pipe",
          encoding: "utf-8",
        }).trim()
      } else {
        result = execFileSync("npm", ["view", "express", "version"], {
          stdio: "pipe",
          encoding: "utf-8",
        }).trim()
      }
    } catch (err) {
      assert.fail(
        `npm registry call failed — ${err.message}\n` +
        `This is the bug that was fixed: npm.cmd must be used on Windows.`
      )
    }

    assert.match(
      result,
      /^\d+\.\d+\.\d+/,
      `Expected a semver string from registry, got: "${result}"`
    )
    console.log(`  ✓ npm registry returned express@${result}`)
  })
})

// ─── 2. opencode on PATH ──────────────────────────────────────────────────────

describe("opencode on PATH (smoke)", () => {
  it("opencode binary is discoverable via shell resolution", () => {
    // Mirrors the fix in launch.js: shell: true on Windows lets the OS find opencode.cmd
    const result = isWin
      ? spawnSync("opencode --version", {
          shell: true,
          stdio: "pipe",
          encoding: "utf-8",
          timeout: 5000,
        })
      : spawnSync("opencode", ["--version"], {
          stdio: "pipe",
          encoding: "utf-8",
          timeout: 5000,
        })

    // ENOENT → binary genuinely not installed, not our bug
    if (result.error?.code === "ENOENT") {
      assert.fail(
        "opencode not found on PATH.\n" +
        "Install it from https://opencode.ai and re-run the smoke test."
      )
    }

    // Any other spawn error
    if (result.error) {
      assert.fail(`opencode spawn error: ${result.error.message}`)
    }

    // opencode launched (exit code 0 or non-zero is both fine — it ran)
    const launched = result.status !== null
    assert.ok(
      launched,
      "opencode process did not start (status is null — likely a spawn failure)"
    )

    const output = (result.stdout + result.stderr).trim()
    console.log(`  ✓ opencode launched (exit ${result.status})${output ? `: ${output.split("\n")[0]}` : ""}`)
  })
})
