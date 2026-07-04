import { readFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { runInit } from "./commands/init.js"
import { runUninstall } from "./commands/uninstall.js"
import { runUpdate } from "./commands/update.js"
import { runDoctor } from "./commands/doctor.js"
import { runLaunch } from "./commands/launch.js"
import { runTheme } from "./commands/theme.js"
import { version } from "../core/version.js"

const HELP = `Usage: wevr [command]

  wevr              Launch OpenCode powered by Wevr agents
  wevr init         Install and configure the Wevr agent pipeline
  wevr update       Check and update the Wevr system
  wevr doctor       Diagnose the integrity of the current installation
  wevr theme        List themes or switch the active theme
  wevr uninstall    Remove Wevr artifacts and restore the previous config
  --version, -v       Print the current version number
  --help, -h          Show this help message`

export async function run(argv) {
  const cmd = argv[2]

  if (!cmd) {
    return await runLaunch()
  }

  if (cmd === "--help" || cmd === "-h") {
    console.log(HELP)
    return
  }

  if (cmd === "--version" || cmd === "-v") {
    console.log(version)
    return
  }

  if (cmd === "init") {
    return await runInit()
  }

  if (cmd === "uninstall") {
    return await runUninstall()
  }

  if (cmd === "update") {
    return await runUpdate()
  }

  if (cmd === "doctor") {
    return await runDoctor()
  }

  if (cmd === "theme") {
    return await runTheme()
  }

  console.error(`Unknown command: ${cmd}\n`)
  console.log(HELP)
  process.exit(1)
}
