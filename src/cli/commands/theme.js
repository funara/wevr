import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join, basename } from "node:path"
import { select, isCancel } from "@clack/prompts"
import { getThemesDir, getTuiConfigPath } from "../../core/paths.js"
import { writeTuiConfig } from "../../core/tuiConfigWriter.js"

export async function runTheme() {
  const themesDir = getThemesDir()
  const tuiPath = getTuiConfigPath()

  // 1. Get installed themes
  let installedThemes = []
  if (existsSync(themesDir)) {
    try {
      installedThemes = readdirSync(themesDir)
        .filter(f => f.endsWith(".json"))
        .map(f => basename(f, ".json"))
    } catch {
      // Ignore
    }
  }

  if (installedThemes.length === 0) {
    console.error("Error: No installed themes found.")
    process.exit(1)
  }

  // 2. Get current theme
  let currentTheme = "none"
  if (existsSync(tuiPath)) {
    try {
      const content = readFileSync(tuiPath, "utf-8")
      const config = JSON.parse(content)
      if (config.theme) currentTheme = config.theme
    } catch {
      // Ignore
    }
  }

  // 3. Construct select options
  const options = installedThemes.map(theme => {
    // Format a nice human-readable label
    const formattedLabel = theme
      .replace(/-/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase())
    
    return {
      value: theme,
      label: theme === currentTheme ? `${formattedLabel} (active)` : formattedLabel
    }
  })

  // 4. Prompt user to select a theme
  const selectedTheme = await select({
    message: "Select a theme to apply:",
    options,
    initialValue: currentTheme !== "none" ? currentTheme : undefined
  })

  if (isCancel(selectedTheme)) {
    console.log("Operation cancelled.")
    process.exit(0)
  }

  writeTuiConfig(selectedTheme)
  console.log(`Theme successfully applied: ${selectedTheme}`)
}
