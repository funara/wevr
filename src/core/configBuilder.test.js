import { describe, it } from "node:test"
import assert from "node:assert"
import { mkdtempSync, writeFileSync, rmSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { buildConfig } from "./configBuilder.js"

describe("configBuilder", () => {
  it("injects models into agent config per tier", () => {
    const tmpDir = mkdtempSync(join(tmpdir(), "configbuilder-test-"))

    const configJson = {
      agent: {
        compose: {},
        verifier: {},
        builder: {},
      },
    }
    const defaultsJson = {
      reasoning: {
        provider: "test",
        model: "big-model",
        agents: ["compose"],
      },
      precision: {
        provider: "test",
        model: "mid-model",
        agents: ["verifier"],
      },
      fast: {
        provider: "test",
        model: "small-model",
        agents: ["builder"],
      },
    }

    writeFileSync(join(tmpDir, "opencode.config.json"), JSON.stringify(configJson), "utf-8")
    writeFileSync(join(tmpDir, "model-defaults.json"), JSON.stringify(defaultsJson), "utf-8")

    const result = buildConfig(
      {
        reasoning: "test/big-model",
        precision: "test/mid-model",
        fast: "test/small-model",
      },
      tmpDir,
    )

    assert.strictEqual(result.agent.compose.model, "test/big-model")
    assert.strictEqual(result.agent.verifier.model, "test/mid-model")
    assert.strictEqual(result.agent.builder.model, "test/small-model")

    rmSync(tmpDir, { recursive: true })
  })

  it("throws an error if a defaulted agent is missing from config template", () => {
    const tmpDir = mkdtempSync(join(tmpdir(), "configbuilder-test-err-"))

    const configJson = {
      agent: {
        // missing 'compose'
        builder: {},
      },
    }
    const defaultsJson = {
      reasoning: {
        provider: "test",
        model: "big-model",
        agents: ["compose"],
      },
      fast: {
        provider: "test",
        model: "small-model",
        agents: ["builder"],
      },
    }

    writeFileSync(join(tmpDir, "opencode.config.json"), JSON.stringify(configJson), "utf-8")
    writeFileSync(join(tmpDir, "model-defaults.json"), JSON.stringify(defaultsJson), "utf-8")

    assert.throws(() => {
      buildConfig(
        {
          reasoning: "test/big-model",
          fast: "test/small-model",
        },
        tmpDir,
      )
    }, /Template validation failed: agent\(s\) not found/)

    rmSync(tmpDir, { recursive: true })
  })
})
