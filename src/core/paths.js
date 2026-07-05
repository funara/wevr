import { homedir } from "node:os"
import { join } from "node:path"

const BASE = join(homedir(), ".config", "opencode")

export const getConfigDir = () => BASE
export const getConfigPath = () => join(BASE, "opencode.jsonc")
export const getTuiConfigPath = () => join(BASE, "tui.json")
export const getPromptsDir = () => join(BASE, "prompts")
export const getThemesDir = () => join(BASE, "themes")
export const getSkillsDir = () => join(BASE, "skills")
export const getCommandsDir = () => join(BASE, "commands")
// ponytail: getBackupPath removed (YAGNI)
