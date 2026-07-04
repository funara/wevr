import { describe, it } from "node:test"
import assert from "node:assert"
import { existsSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"
import { resolveRewritten, shellQuote, WevrSqueezePlugin } from "../src/plugins/wevr-squeeze.js"

const squeezeBin = join(homedir(), ".config", "opencode", "bin", process.platform === "win32" ? "squeeze.exe" : "squeeze")
const squeezeInstalled = existsSync(squeezeBin)

describe("resolveRewritten", () => {
  // --- squeeze on PATH (binPath === "squeeze") ---

  it("normalises 'rtk' prefix to 'squeeze' when squeeze is on PATH", () => {
    const result = resolveRewritten("rtk pytest tests/ -v", "squeeze")
    assert.strictEqual(result, "squeeze pytest tests/ -v")
  })

  it("keeps 'squeeze' prefix unchanged when squeeze is on PATH", () => {
    const result = resolveRewritten("squeeze npm test", "squeeze")
    assert.strictEqual(result, "squeeze npm test")
  })

  // --- managed path (binPath === full path) ---

  it("replaces 'rtk' prefix with full managed path on POSIX", () => {
    const bin = "/home/user/.config/opencode/bin/squeeze"
    const result = resolveRewritten("rtk pytest tests/ -v", bin)
    assert.strictEqual(result, `${bin} pytest tests/ -v`)
  })

  it("replaces 'squeeze' prefix with full managed path when binary outputs its renamed name", () => {
    const bin = "/home/user/.config/opencode/bin/squeeze"
    const result = resolveRewritten("squeeze npm test", bin)
    assert.strictEqual(result, `${bin} npm test`)
  })

  it("replaces 'rtk' prefix with full managed path on Windows", () => {
    const bin = "C:/Users/user/.config/opencode/bin/squeeze.exe"
    const result = resolveRewritten("rtk npm test", bin)
    assert.strictEqual(result, `${bin} npm test`)
  })

  it("handles rewritten output that is exactly 'rtk' with no args", () => {
    const bin = "/home/user/.config/opencode/bin/squeeze"
    const result = resolveRewritten("rtk", bin)
    assert.strictEqual(result, bin)
  })

  // --- passthrough cases ---

  it("does not modify commands that do not start with 'rtk' or 'squeeze'", () => {
    const bin = "/home/user/.config/opencode/bin/squeeze"
    const result = resolveRewritten("npm test --quiet", bin)
    assert.strictEqual(result, "npm test --quiet")
  })

  it("does not replace 'rtk' appearing mid-command (not prefix)", () => {
    const bin = "/home/user/.config/opencode/bin/squeeze"
    const result = resolveRewritten("npm run rtk-check", bin)
    assert.strictEqual(result, "npm run rtk-check")
  })

  it("quotes path when managed path contains spaces (Windows username with space)", () => {
    const bin = "C:/Users/John Doe/.config/opencode/bin/squeeze.exe"
    const result = resolveRewritten("rtk node --test", bin)
    assert.strictEqual(result, `"${bin}" node --test`)
  })

  it("does not double-quote path that already has no spaces", () => {
    const bin = "C:/Users/adhir/.config/opencode/bin/squeeze.exe"
    const result = resolveRewritten("rtk node --test", bin)
    assert.strictEqual(result, `${bin} node --test`)
  })
})

describe("shellQuote", () => {
  it("wraps path in double quotes when it contains spaces", () => {
    assert.strictEqual(shellQuote("C:/Users/John Doe/bin/squeeze.exe"), '"C:/Users/John Doe/bin/squeeze.exe"')
  })

  it("returns path unchanged when no spaces", () => {
    assert.strictEqual(shellQuote("C:/Users/adhir/bin/squeeze.exe"), "C:/Users/adhir/bin/squeeze.exe")
  })
})

describe("WevrSqueezePlugin", () => {
  const mockShell = (stdoutVal, shouldFail = false) => {
    const fn = (strings, ...values) => {
      fn.calls.push({ strings, values })
      const chain = {
        quiet: () => chain,
        nothrow: () => chain,
        then: (resolve, reject) => {
          if (shouldFail) {
            reject(new Error("mock shell execution failed"))
          } else {
            resolve({ stdout: stdoutVal })
          }
        }
      }
      return chain
    }
    fn.calls = []
    return fn
  }

  it("gracefully disables plugin if findBinary fails", { skip: squeezeInstalled ? "squeeze binary present locally — fallback path activates" : false }, async () => {
    // mock shell throws on "where squeeze" / "which squeeze"
    const mock$ = mockShell("", true)
    const plugin = await WevrSqueezePlugin({ $: mock$ })
    assert.deepStrictEqual(plugin, {})
  })

  it("returns tool.execute.before hook if binary is found", async () => {
    // mock shell passes on "where squeeze" / "which squeeze" (representing findBinary success)
    const mock$ = mockShell("squeeze", false)
    const plugin = await WevrSqueezePlugin({ $: mock$ })
    assert.ok(plugin["tool.execute.before"])
  })

  it("ignores non-bash / non-shell tools", async () => {
    const mock$ = mockShell("squeeze", false)
    const plugin = await WevrSqueezePlugin({ $: mock$ })
    const hook = plugin["tool.execute.before"]

    const input = { tool: "read_file" }
    const output = { args: { command: "node --test" } }
    await hook(input, output)

    // command is untouched because it is not a bash/shell tool
    assert.strictEqual(output.args.command, "node --test")
  })

  it("rewrites command successfully when tool is bash", async () => {
    // 1st call findBinary checks "where/which squeeze" -> returns "squeeze"
    // 2nd call executes squeeze rewrite -> returns "rtk node --test --quiet"
    let callIndex = 0
    const mock$ = (strings, ...values) => {
      callIndex++
      const stdout = callIndex === 1 ? "squeeze" : "rtk node --test --quiet"
      const chain = {
        quiet: () => chain,
        nothrow: () => chain,
        then: (resolve) => resolve({ stdout })
      }
      return chain
    }

    const plugin = await WevrSqueezePlugin({ $: mock$ })
    const hook = plugin["tool.execute.before"]

    const input = { tool: "bash" }
    const output = { args: { command: "node --test" } }
    await hook(input, output)

    // output should be rewritten using resolveRewritten ("squeeze" on PATH)
    assert.strictEqual(output.args.command, "squeeze node --test --quiet")
  })

  it("keeps command unchanged if rewrite fails or throws", async () => {
    let callIndex = 0
    const mock$ = (strings, ...values) => {
      callIndex++
      const chain = {
        quiet: () => chain,
        nothrow: () => chain,
        then: (resolve, reject) => {
          if (callIndex === 1) {
            resolve({ stdout: "squeeze" }) // findBinary success
          } else {
            reject(new Error("rewrite error")) // rewrite fail
          }
        }
      }
      return chain
    }

    const plugin = await WevrSqueezePlugin({ $: mock$ })
    const hook = plugin["tool.execute.before"]

    const input = { tool: "bash" }
    const output = { args: { command: "node --test" } }
    await hook(input, output)

    // command remains original on fail
    assert.strictEqual(output.args.command, "node --test")
  })
})

