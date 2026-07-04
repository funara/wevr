import { readFileSync, writeFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { confirm, isCancel } from "@clack/prompts"
import { selectModelTier } from "../wizard/selectModelTier.js"
import { backupExistingConfig } from "../../core/backup.js"
import { buildConfig } from "../../core/configBuilder.js"
import { writeConfig } from "../../core/configWriter.js"
import { writeAgentPrompts } from "../../core/agentPromptWriter.js"
import { writePluginBundle, writePluginPackageJson } from "../../core/pluginWriter.js"
import { writeThemes } from "../../core/themeWriter.js"
import { writeTuiConfig } from "../../core/tuiConfigWriter.js"
import { installSqueeze } from "../../core/squeezeInstaller.js"
import { getConfigPath, getConfigDir } from "../../core/paths.js"

const __dirname = dirname(fileURLToPath(import.meta.url))
const TEMPLATES_DIR = resolve(__dirname, "../../templates")

export async function runInit() {
  const defaultsPath = resolve(TEMPLATES_DIR, "model-defaults.json")
  const modelDefaults = JSON.parse(readFileSync(defaultsPath, "utf-8"))

  const tierChoices = await selectModelTier(modelDefaults)

  const squeezeAnswer = await confirm({
    message: "Install wevr-squeeze plugin? Reduces bash output tokens by 60-90%.",
    initialValue: true,
  })

  const installSqueezePlugin = isCancel(squeezeAnswer) ? false : squeezeAnswer

  backupExistingConfig()

  const configObject = buildConfig(tierChoices, TEMPLATES_DIR)
  writeConfig(configObject)
  writeAgentPrompts(TEMPLATES_DIR)
  writeThemes(TEMPLATES_DIR)
  writeTuiConfig("wevr-contrast")
  writePluginBundle()
  writePluginPackageJson()
  if (installSqueezePlugin) {
    await installSqueeze()
  }

  const path = getConfigPath().replace(/\\/g, "/").replace(/^\//, "")
  console.log(`Wevr setup complete!\nYou can update your agent model settings later in \x1b]8;;file:///${path}\x1b\\opencode.jsonc\x1b]8;;\x1b\\`)
}
