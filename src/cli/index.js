import { readFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { runInit } from "./commands/init.js"
import { runUninstall } from "./commands/uninstall.js"
import { runUpdate } from "./commands/update.js"
import { runDoctor } from "./commands/doctor.js"
import { runLaunch } from "./commands/launch.js"
import { version } from "../core/version.js"

const HELP = `Usage: wevr [command]

  wevr              Launch OpenCode powered by Wevr agents
  wevr init         Install and configure the Wevr agent pipeline
  wevr update       Check and update the Wevr system
  wevr doctor       Diagnose the integrity of the current installation
  wevr uninstall    Remove Wevr artifacts and restore the previous config
  --version, -v       Print the current version number
  --help, -h          Show this help message`

export function run(argv) {
  const cmd = argv[2]

  if (!cmd) {
    return runLaunch()
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
    return runInit()
  }

  if (cmd === "uninstall") {
    return runUninstall()
  }

  if (cmd === "update") {
    return runUpdate()
  }

  if (cmd === "doctor") {
    return runDoctor()
  }

  console.error(`Unknown command: ${cmd}\n`)
  console.log(HELP)
  process.exit(1)
}
