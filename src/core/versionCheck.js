import { execFileSync, execSync } from "node:child_process"
import { confirm, isCancel } from "@clack/prompts"

export function fetchLatestVersion() {
  try {
    if (process.platform === "win32") {
      return execSync("npm view wevr version", { stdio: "pipe", timeout: 1500 })
        .toString()
        .trim()
    }
    return execFileSync("npm", ["view", "wevr", "version"], { stdio: "pipe", timeout: 1500 })
      .toString()
      .trim()
  } catch {
    return null
  }
}

export async function checkAndPromptUpdate(currentVersion) {
  process.stdout.write("Checking for updates...   ")

  const latest = fetchLatestVersion()
  if (!latest) {
    console.log("⚠ Could not reach npm registry — skipping")
    return false
  }

  if (latest === currentVersion) {
    console.log(`✓ Up to date (${currentVersion})`)
    return false
  }

  console.log(`⚠ wevr ${latest} available  (you have ${currentVersion})`)

  const answer = await confirm({ message: "Update now?", initialValue: true })
  if (isCancel(answer) || !answer) return false

  if (process.platform === "win32") {
    execSync("npm install -g wevr", { stdio: "inherit" })
  } else {
    execFileSync("npm", ["install", "-g", "wevr"], { stdio: "inherit" })
  }
  return true
}
