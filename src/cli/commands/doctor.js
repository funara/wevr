import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { getConfigDir, getConfigPath, getPromptsDir, getThemesDir, getTuiConfigPath, getCommandsDir } from "../../core/paths.js"

const EXPECTED_PROMPT_COUNT = 8
const PLUGIN_FILES = ["wevr-flow.js", "wevr-squeeze.js"]
const EXPECTED_COMMAND_FILES = ["squeeze-quick.md", "squeeze-health.md", "squeeze-dashboard.md"]

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

  // 2. All 8 prompt files exist
  let promptCount = 0
  if (existsSync(promptsDir)) {
    try {
      const files = readdirSync(promptsDir).filter((f) => f.endsWith(".txt"))
      promptCount = files.length
    } catch {
      promptCount = 0
    }
  }
  checks.push({ component: "8 prompt files", pass: promptCount === EXPECTED_PROMPT_COUNT, detail: `${promptCount}/${EXPECTED_PROMPT_COUNT}` })

  // 3. Both plugin files exist
  let pluginsFound = 0
  for (const f of PLUGIN_FILES) {
    if (existsSync(join(pluginsDir, f))) pluginsFound++
  }
  checks.push({ component: "plugin files", pass: pluginsFound === PLUGIN_FILES.length, detail: `${pluginsFound}/${PLUGIN_FILES.length}` })

  // 3a. Slash command files exist
  let commandsFound = 0
  const commandsDir = getCommandsDir()
  for (const f of EXPECTED_COMMAND_FILES) {
    if (existsSync(join(commandsDir, f))) commandsFound++
  }
  checks.push({ component: "slash command files", pass: commandsFound === EXPECTED_COMMAND_FILES.length, detail: `${commandsFound}/${EXPECTED_COMMAND_FILES.length}` })

  // 3b. Theme configuration verification (accepts any valid wevr theme)
  const ALLOWED_THEMES = new Set(["wevr-dark", "wevr-light", "wevr-colorful"])
  const tuiConfigPath = getTuiConfigPath()
  let activeTheme = "wevr-dark" // default fallback
  let tuiConfigValid = false
  let tuiDetail = "missing mapping"
  
  if (existsSync(tuiConfigPath)) {
    try {
      const content = readFileSync(tuiConfigPath, "utf-8")
      const parsed = JSON.parse(content)
      if (parsed.theme && ALLOWED_THEMES.has(parsed.theme)) {
        activeTheme = parsed.theme
        tuiConfigValid = true
        tuiDetail = ""
      } else {
        tuiDetail = `theme: ${parsed.theme || "none"}`
      }
    } catch {
      tuiDetail = "corrupted tui.json"
    }
  }

  const themeExists = existsSync(join(themesDir, `${activeTheme}.json`))
  checks.push({
    component: themeExists && tuiConfigValid ? `${activeTheme} theme configured` : "theme not configured",
    pass: themeExists && tuiConfigValid,
    detail: !themeExists ? `missing theme file ${activeTheme}.json` : tuiDetail
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
