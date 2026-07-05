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
import { writeCommands } from "../../core/commandsWriter.js"
import { version } from "../../core/version.js"
import { getConfigPath } from "../../core/paths.js"

const COLORS = [
  "\x1b[38;2;0;225;255m",  // Bright Cyan
  "\x1b[38;2;0;200;250m",  // Ocean Blue
  "\x1b[38;2;50;150;250m",  // Soft Blue-Purple
  "\x1b[38;2;120;120;255m", // Indigo-Purple
  "\x1b[38;2;180;90;255m"   // Purple
];

const ASCII_LOGO_LINES = [
  " ██   ██ ███████ █▌    ▐█ ███████▄",
  " ██   ██ ██      ██    ██ ██    ██",
  " ██ █ ██ █████   ▐█▌  ▐█▌ ███████▀",
  " ███████ ██       ▐█▌▐█▌  ██   ▀██",
  " ██   ██ ███████   ▐██▌   ██    ██"
];

const __dirname = dirname(fileURLToPath(import.meta.url))
const TEMPLATES_DIR = resolve(__dirname, "../../templates")

const getLogoFrame = (frame) => {
  return ASCII_LOGO_LINES.map((line, r) => {
    // Math.sin(frame / 3.5 - r * 0.8) propagates the wave downwards, creating a rolling ocean wave shape
    const offset = Math.round(3 + 2 * Math.sin(frame / 3.5 - r * 0.8));
    return " ".repeat(offset) + line;
  });
};

export async function runInit() {
  console.log("\x1b[1;36m┌  wevr init\x1b[0m")
  
  // Print initial blank lines so the animation loop can safely clear them
  for (let i = 0; i < 9; i++) console.log("│")

  let frame = 0
  const animInterval = setInterval(() => {
    // Clear logo lines (9 rows)
    process.stdout.write("\x1b[9A\x1b[0J")
    
    const logo = getLogoFrame(frame);
    for (let r = 0; r < 5; r++) {
      console.log("│  " + COLORS[(frame + r) % COLORS.length] + logo[r] + "\x1b[0m");
    }
    console.log("│");
    console.log(`│  Weave engineering workflows. • v${version} (Stable)`);
    console.log("│  \x1b[90mPress any key to begin setup...\x1b[0m");
    console.log("│");
    
    frame++
  }, 100)

  // Loop until user presses any key (or resolve immediately if not running in TTY)
  if (process.stdin.isTTY) {
    await new Promise((resolve) => {
      const onData = (key) => {
        if (key === "\u0003") {
          process.exit(0);
        }
        clearInterval(animInterval);
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.off("data", onData);
        resolve();
      };

      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.setEncoding("utf8");
      process.stdin.on("data", onData);
    });
  } else {
    clearInterval(animInterval);
  }

  // Overwrite "Press any key to begin setup..." with "Starting setup wizard..." in place
  process.stdout.write("\x1b[2A\r│  \x1b[32m✓\x1b[0m Starting setup wizard...\x1b[0K\n│\n\n");

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

  writeCommands(TEMPLATES_DIR)
  console.log("│  Writing commands...       \x1b[32m✓\x1b[0m Installed 3 custom slash commands")

  writeTuiConfig(selectedTheme)
  console.log("│  Writing configuration...  \x1b[32m✓\x1b[0m Configured opencode.jsonc and tui.json")

  writePluginBundle()
  writePluginPackageJson()
  console.log("│  Installing plugins...     \x1b[32m✓\x1b[0m Installed bundled plugins (wevr-flow, wevr-squeeze)");

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
