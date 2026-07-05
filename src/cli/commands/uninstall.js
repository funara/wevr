import { existsSync, copyFileSync, rmSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { getConfigDir, getConfigPath } from "../../core/paths.js"

function findLatestBackup() {
  const dir = getConfigDir()
  let backups = []
  try {
    backups = readdirSync(dir)
      .filter((f) => f.startsWith("opencode.jsonc.bak."))
      .sort()
      .reverse()
  } catch {
    return null
  }
  return backups.length > 0 ? join(dir, backups[0]) : null
}

function findLatestTuiBackup() {
  const dir = getConfigDir()
  let backups = []
  try {
    backups = readdirSync(dir)
      .filter((f) => f.startsWith("tui.json.bak."))
      .sort()
      .reverse()
  } catch {
    return null
  }
  return backups.length > 0 ? join(dir, backups[0]) : null
}

export async function runUninstall() {
  const configDir = getConfigDir()
  const configPath = getConfigPath()
  const promptsDir = join(configDir, "prompts")
  const pluginsDir = join(configDir, "plugins")
  const binDir = join(configDir, "bin")
  const commandsDir = join(configDir, "commands")

  const summary = { restored: null, removed: [] }

  // Restore latest backup
  const latestBackup = findLatestBackup()
  if (latestBackup) {
    copyFileSync(latestBackup, configPath)
    summary.restored = latestBackup
  }

  const latestTuiBackup = findLatestTuiBackup()
  const tuiConfigPath = join(configDir, "tui.json")
  if (latestTuiBackup) {
    copyFileSync(latestTuiBackup, tuiConfigPath)
  }

  const themesDir = join(configDir, "themes")
  const skillsDir = join(configDir, "skills")

  // Remove Wevr-installed artifacts
  if (existsSync(promptsDir)) {
    rmSync(promptsDir, { recursive: true, force: true })
    summary.removed.push("prompts/")
  }
  if (existsSync(skillsDir)) {
    rmSync(skillsDir, { recursive: true, force: true })
    summary.removed.push("skills/")
  }
  if (existsSync(pluginsDir)) {
    rmSync(pluginsDir, { recursive: true, force: true })
    summary.removed.push("plugins/")
  }
  if (existsSync(binDir)) {
    rmSync(binDir, { recursive: true, force: true })
    summary.removed.push("bin/")
  }
  if (existsSync(commandsDir)) {
    rmSync(commandsDir, { recursive: true, force: true })
    summary.removed.push("commands/")
  }
  const wevrThemes = ["wevr-colorful.json", "wevr-dark.json", "wevr-light.json"]
  for (const theme of wevrThemes) {
    const customThemePath = join(themesDir, theme)
    if (existsSync(customThemePath)) {
      rmSync(customThemePath, { force: true })
      summary.removed.push(`themes/${theme}`)
    }
  }

  // Print summary
  console.log("Uninstall complete:")
  if (summary.restored) {
    console.log(`  ✓ Restored ${summary.restored}`)
  } else {
    console.log("  - No backup found to restore")
  }
  if (summary.removed.length > 0) {
    console.log(`  ✓ Removed: ${summary.removed.join(", ")}`)
  } else {
    console.log("  - No Wevr artifacts found to remove")
  }
  console.log("  - Kept opencode.jsonc (preserves user customizations)")
  console.log("  - Kept package.json (may be used by other plugins)")
}
