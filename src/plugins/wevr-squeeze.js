import { existsSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"

const BIN_NAME = process.platform === "win32" ? "squeeze.exe" : "squeeze"
const SQUEEZE_BIN = join(homedir(), ".config", "opencode", "bin", BIN_NAME)

function normalise(p) {
  return p.replace(/\\/g, "/")
}

// Quote a path if it contains spaces so the shell treats it as one token.
export function shellQuote(p) {
  return p.includes(" ") ? `"${p}"` : p
}

// Exported for testing. When binPath is the managed full path (not "squeeze"
// on PATH), the binary may output "rtk <cmd>" or "squeeze <cmd>" depending on
// how it resolves its own name. Replace the leading token with the actual
// binPath (quoted if it contains spaces) so the shell can find it. When
// squeeze is on PATH, normalise any "rtk" prefix to "squeeze".
export function resolveRewritten(rewritten, binPath) {
  const m = rewritten.match(/^(rtk|squeeze)(\s|$)/)
  if (!m) return rewritten
  if (binPath === "squeeze") {
    // squeeze is on PATH — normalise any leading binary name to "squeeze"
    return "squeeze" + rewritten.slice(m[1].length)
  }
  // managed path — replace leading binary name with (quoted) full path
  return shellQuote(binPath) + rewritten.slice(m[1].length)
}

async function findBinary($) {
  try {
    if (process.platform === "win32") {
      await $`where squeeze`.quiet()
    } else {
      await $`which squeeze`.quiet()
    }
    return "squeeze"
  } catch {
    if (existsSync(SQUEEZE_BIN)) {
      return normalise(SQUEEZE_BIN)
    }
    return null
  }
}

export const WevrSqueezePlugin = async ({ $ }) => {
  const binPath = await findBinary($)
  if (!binPath) {
    console.warn("[squeeze] squeeze binary not found — plugin disabled")
    return {}
  }

  return {
    "tool.execute.before": async (input, output) => {
      const tool = String(input?.tool ?? "").toLowerCase()
      if (tool !== "bash" && tool !== "shell") return
      const args = output?.args
      if (!args || typeof args !== "object") return

      const command = args.command
      if (typeof command !== "string" || !command) return

      try {
        const result = await $`${binPath} rewrite ${command}`.quiet().nothrow()
        const rewritten = String(result.stdout).trim()
        if (rewritten && rewritten !== command) {
          args.command = resolveRewritten(rewritten, binPath)
        }
      } catch {
        // rewrite failed — pass through unchanged
      }
    },
  }
}
