import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { getConfigDir, getConfigPath, getPromptsDir, getThemesDir, getTuiConfigPath } from "../../core/paths.js"
import { findSqueezePath } from "../../core/squeezeInstaller.js"

const EXPECTED_PROMPT_COUNT = 18
const PLUGIN_FILES = ["wevr-flow.js", "wevr-squeeze.js"]

export function cleanJsonc(content) {
  return content.replace(
    /\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)|(,\s*(?=[\]}]))/g,
    (m, g1, g2) => g1 ? "" : g2 ? "" : m
  )
}

export function collectChecks() {
  const configDir = getConfigDir()
  const configPath = getConfigPath()
  const promptsDir = getPromptsDir()
  const pluginsDir = join(configDir, "plugins")
  const packageJsonPath = join(configDir, "package.json")
  const binDir = join(configDir, "bin")
  const themesDir = getThemesDir()

  const checks = []

  // 1. opencode.jsonc exists
  const configExists = existsSync(configPath)
  checks.push({ component: "opencode.jsonc", pass: configExists })

  // 2. All 18 prompt files exist
  let promptCount = 0
  if (existsSync(promptsDir)) {
    try {
      const files = readdirSync(promptsDir).filter((f) => f.endsWith(".txt"))
      promptCount = files.length
    } catch {
      promptCount = 0
    }
  }
  checks.push({ component: "18 prompt files", pass: promptCount === EXPECTED_PROMPT_COUNT, detail: `${promptCount}/${EXPECTED_PROMPT_COUNT}` })

  // 3. Both plugin files exist
  let pluginsFound = 0
  for (const f of PLUGIN_FILES) {
    if (existsSync(join(pluginsDir, f))) pluginsFound++
  }
  checks.push({ component: "plugin files", pass: pluginsFound === PLUGIN_FILES.length, detail: `${pluginsFound}/${PLUGIN_FILES.length}` })

  // 3b. Theme configuration verification
  const themeExists = existsSync(join(themesDir, "wevr-contrast.json"))
  const tuiConfigPath = getTuiConfigPath()
  let tuiConfigValid = false
  let tuiDetail = "missing mapping"
  if (existsSync(tuiConfigPath)) {
    try {
      const content = readFileSync(tuiConfigPath, "utf-8")
      const parsed = JSON.parse(content)
      if (parsed.theme === "wevr-contrast") {
        tuiConfigValid = true
        tuiDetail = ""
      } else {
        tuiDetail = `theme: ${parsed.theme || "none"}`
      }
    } catch {
      tuiDetail = "corrupted tui.json"
    }
  }
  checks.push({
    component: themeExists && tuiConfigValid ? "wevr-contrast theme configured" : "wevr-contrast theme not configured",
    pass: themeExists && tuiConfigValid,
    detail: !themeExists ? "missing theme file" : tuiDetail
  })

  // 4. package.json with @opencode-ai/plugin dependency
  let pkgValid = false
  if (existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(readFileSync(packageJsonPath, "utf-8"))
      pkgValid = !!(pkg.dependencies && pkg.dependencies["@opencode-ai/plugin"])
    } catch {
      pkgValid = false
    }
  }
  checks.push({ component: "package.json + plugin dep", pass: pkgValid })

  // 5. Squeeze binary exists
  let squeezeFound = false
  const squeezeOnPath = findSqueezePath()
  if (squeezeOnPath) {
    squeezeFound = true
  } else {
    const binName = process.platform === "win32" ? "squeeze.exe" : "squeeze"
    squeezeFound = existsSync(join(binDir, binName))
  }
  checks.push({ component: "squeeze binary tested", pass: squeezeFound })

  // 6. Config is valid JSON/JSONC
  let configValid = false
  if (configExists) {
    try {
      const content = readFileSync(configPath, "utf-8")
      const cleaned = cleanJsonc(content)
      JSON.parse(cleaned)
      configValid = true
    } catch {
      configValid = false
    }
  }
  checks.push({ component: "config JSON validity", pass: configValid })

  return checks
}

export async function runDoctor() {
  const checks = collectChecks()
  const allPass = checks.every((c) => c.pass)

  console.log("\nWevr Doctor — Installation Health Check\n")
  for (const c of checks) {
    const icon = c.pass ? "\u2713" : "\u2717"
    const detail = c.detail ? ` (${c.detail})` : ""
    console.log(`  ${icon} ${c.component}${detail}`)
  }
  console.log("")

  if (allPass) {
    console.log("All checks passed.")
  } else {
    console.log("Some checks failed. Re-run `wevr init` to repair.")
  }

  process.exit(allPass ? 0 : 1)
}
