import { spawn } from "node:child_process"
import { confirm, isCancel } from "@clack/prompts"
import { checkAndPromptUpdate } from "../../core/versionCheck.js"
import { version } from "../../core/version.js"
import { collectChecks } from "./doctor.js"
import { runInit } from "./init.js"

export async function runLaunch() {
  // 1. Update check
  const updated = await checkAndPromptUpdate(version)
  if (updated) {
    console.log("Update successful. Please run wevr again to start the new version.")
    process.exit(0)
  }

  // 2. Doctor check
  process.stdout.write("Running doctor...         ")
  const checks = collectChecks()
  const allPass = checks.every((c) => c.pass)

  if (allPass) {
    console.log("✓ All checks passed")
  } else {
    const failed = checks.filter((c) => !c.pass)
    console.log(`✗ ${failed.length} check${failed.length > 1 ? "s" : ""} failed`)
    for (const c of failed) {
      const detail = c.detail ? ` (${c.detail})` : ""
      console.log(`  ✗ ${c.component}${detail}`)
    }

    const answer = await confirm({ message: "Repair with wevr init?", initialValue: true })
    if (!isCancel(answer) && answer) {
      await runInit()
    }
  }

  // 3. Launch opencode
  console.log("Launching wevr...")
  const child = process.platform === "win32"
    ? spawn("opencode", { stdio: "inherit", shell: true })
    : spawn("opencode", [], { stdio: "inherit" })
  child.on("error", (err) => {
    if (err.code === "ENOENT") {
      console.error("Error: opencode not found on PATH. Install it from https://opencode.ai")
    } else {
      console.error(`Error launching opencode: ${err.message}`)
    }
    process.exit(1)
  })
}
