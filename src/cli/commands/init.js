import { readFileSync, writeFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { select, isCancel } from "@clack/prompts"
import { selectModelTier } from "../wizard/selectModelTier.js"
import { backupExistingConfig } from "../../core/backup.js"
import { buildConfig } from "../../core/configBuilder.js"
import { writeConfig } from "../../core/configWriter.js"
import { writeAgentPrompts } from "../../core/agentPromptWriter.js"
import { writePluginBundle, writePluginPackageJson } from "../../core/pluginWriter.js"
import { writeThemes } from "../../core/themeWriter.js"
import { writeTuiConfig } from "../../core/tuiConfigWriter.js"
import { writeSkills } from "../../core/skillsWriter.js"
import { installSqueeze } from "../../core/squeezeInstaller.js"
import { getConfigPath, getConfigDir } from "../../core/paths.js"

const __dirname = dirname(fileURLToPath(import.meta.url))
const TEMPLATES_DIR = resolve(__dirname, "../../templates")

const ASCII_LOGO_LINES = [
  " ██   ██ ███████ █▌    ▐█ ███████▄",
  " ██   ██ ██      ██    ██ ██    ██",
  " ██ █ ██ █████   ▐█▌  ▐█▌ ███████▀",
  " ███████ ██       ▐█▌▐█▌  ██   ▀██",
  " ██   ██ ███████   ▐██▌   ██    ██"
];

const COLORS = [
  "\x1b[38;2;0;220;255m", // Cyan
  "\x1b[38;2;0;190;225m", // Teal-Cyan
  "\x1b[38;2;0;160;195m", // Teal
  "\x1b[38;2;0;130;165m", // Green-Teal
  "\x1b[38;2;0;100;135m"  // Mint Green
];

export async function runInit() {
  console.log("\x1b[1;36m┌  wevr init\x1b[0m")
  
  // Print initial blank lines so the animation loop can safely clear them
  for (let i = 0; i < 6; i++) console.log("│")

  let frame = 0
  const animInterval = setInterval(() => {
    // Clear logo lines (5 rows + 1 blank line)
    process.stdout.write("\x1b[6A\x1b[0J")
    
    for (let r = 0; r < 5; r++) {
      const offset = Math.round(2 + 2 * Math.sin(frame / 2 + r))
      const padding = " ".repeat(offset)
      const color = COLORS[(frame + r) % COLORS.length]
      console.log("│" + padding + color + ASCII_LOGO_LINES[r] + "\x1b[0m")
    }
    console.log("│")
    frame++
  }, 100)

  // Play animation for 1.5 seconds
  await new Promise((resolve) => setTimeout(resolve, 1500))
  clearInterval(animInterval)

  // Clear animation space and print stationary colorful final frame
  process.stdout.write("\x1b[6A\x1b[0J")
  for (let r = 0; r < 5; r++) {
    const color = COLORS[r % COLORS.length]
    console.log("│   " + color + ASCII_LOGO_LINES[r] + "\x1b[0m")
  }
  console.log("│")

  const defaultsPath = resolve(TEMPLATES_DIR, "model-defaults.json")
  const modelDefaults = JSON.parse(readFileSync(defaultsPath, "utf-8"))

  // 1. Model Tier Selection Prompts (Directly separated by reasoning, precision, fast)
  const tierChoices = await selectModelTier(modelDefaults)

  // 2. Theme Selection Prompt
  const selectedTheme = await select({
    message: "Select a Default Theme:",
    options: [
      { value: "wevr-dark", label: "wevr-dark     - Dark High Contrast (Recommended)" },
      { value: "wevr-light", label: "wevr-light    - Light High Contrast" },
      { value: "wevr-colorful", label: "wevr-colorful - Pastel Palette" }
    ]
  })

  if (isCancel(selectedTheme)) {
    console.log("Operation cancelled.")
    process.exit(0)
  }

  // 3. Execution steps
  backupExistingConfig()

  const configObject = buildConfig(tierChoices, TEMPLATES_DIR)
  writeConfig(configObject)
  writeAgentPrompts(TEMPLATES_DIR)
  console.log("│  Writing agent prompts...  \x1b[32m✓\x1b[0m Wrote 8 files to ~/.config/opencode/prompts/")

  writeThemes(TEMPLATES_DIR)
  console.log("│  Writing themes...         \x1b[32m✓\x1b[0m Installed 3 themes")

  writeSkills(TEMPLATES_DIR)
  console.log("│  Writing skills...         \x1b[32m✓\x1b[0m Installed 17 developer skill playbooks")

  writeTuiConfig(selectedTheme)
  console.log("│  Writing configuration...  \x1b[32m✓\x1b[0m Configured opencode.jsonc and tui.json")

  writePluginBundle()
  writePluginPackageJson()
  
  // Dynamic loading spinner during plugin installation
  const spinner = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let spinFrame = 0;
  const spinInterval = setInterval(() => {
    process.stdout.write(`\r│  Installing plugins...     \x1b[36m${spinner[spinFrame % spinner.length]}\x1b[0m Installing wevr-squeeze...`);
    spinFrame++;
  }, 80);
  
  try {
    await installSqueeze();
  } finally {
    clearInterval(spinInterval);
    process.stdout.write("\r\x1b[K"); // clear the spinner line
  }
  console.log("│  Installing plugins...     \x1b[32m✓\x1b[0m wevr-squeeze installed and enabled");

  const path = getConfigPath().replace(/\\/g, "/").replace(/^\//, "")
  console.log(`
======================================================
  🚀 Wevr Setup Complete!
======================================================

You can view the full list of available commands using:
  $ wevr --help

To customize your agent model settings, open your config:
  👉 \x1b]8;;file:///${path}\x1b\\opencode.jsonc\x1b]8;;\x1b\\

To launch OpenCode with your Wevr pipeline, simply run:
  $ wevr
======================================================
`)
  console.log("\x1b[1;36m└  Setup finished!\x1b[0m")
}
