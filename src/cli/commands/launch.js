import { spawn } from "node:child_process"
import { confirm, isCancel } from "@clack/prompts"
import { checkAndPromptUpdate } from "../../core/versionCheck.js"
import { version } from "../../core/version.js"
import { collectChecks } from "./doctor.js"
import { runInit } from "./init.js"

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

export async function runLaunch() {
  // 1. Start loading animation
  for (let i = 0; i < 7; i++) console.log("");
  
  let frame = 0;
  let statusMessage = "Loading Wevr...";
  
  const animInterval = setInterval(() => {
    // Clear logo lines (5 rows + 2 status lines)
    process.stdout.write("\x1b[7A\x1b[0J");
    
    // Draw logo
    for (let r = 0; r < 5; r++) {
      const offset = Math.round(2 + 2 * Math.sin(frame / 2 + r));
      const padding = " ".repeat(offset);
      const color = COLORS[(frame + r) % COLORS.length];
      console.log(padding + color + ASCII_LOGO_LINES[r] + "\x1b[0m");
    }
    
    // Draw spinning indicator
    const spinner = ["∿", "≋", "∿", "≋"][frame % 4];
    console.log(`\n  ${spinner} [ \x1b[36m🌊\x1b[0m ] ${statusMessage}\r`);
    
    frame++;
  }, 100);

  // 2. Perform async checks (enforce minimum 1.5s animation duration for visual quality)
  const startTime = Date.now();
  
  statusMessage = "Checking environment and version...";
  const updated = await checkAndPromptUpdate(version);
  if (updated) {
    clearInterval(animInterval);
    console.log("Update successful. Please run wevr again to start the new version.");
    process.exit(0);
  }

  statusMessage = "Diagnosing installation integrity...";
  const checks = collectChecks();
  const allPass = checks.every((c) => c.pass);

  // Wait for remainder of minimum duration
  const elapsed = Date.now() - startTime;
  if (elapsed < 1500) {
    await new Promise(resolve => setTimeout(resolve, 1500 - elapsed));
  }

  clearInterval(animInterval);
  // Clear animation space
  process.stdout.write("\x1b[7A\x1b[0J");

  // 3. Handle checks outcomes
  if (allPass) {
    console.log("✓ All checks passed! Spawning OpenCode...\n");
  } else {
    const failed = checks.filter((c) => !c.pass);
    console.log(`✗ Wevr diagnostics found ${failed.length} failure${failed.length > 1 ? "s" : ""}:`);
    for (const c of failed) {
      const detail = c.detail ? ` (${c.detail})` : "";
      console.log(`  ✗ ${c.component}${detail}`);
    }

    console.log("\nIt looks like Wevr is not fully initialized yet.");
    console.log("We highly recommend running the initialization command to set up templates, themes, and configs:");
    console.log("  $ wevr init");
    console.log("\nYou can view all available commands using:");
    console.log("  $ wevr --help\n");

    const answer = await confirm({ message: "Run wevr init now to complete setup?", initialValue: true });
    if (!isCancel(answer) && answer) {
      await runInit();
    } else {
      process.exit(1);
    }
  }

  // 4. Launch opencode
  console.log("Launching wevr...");
  const child = process.platform === "win32"
    ? spawn("opencode", { stdio: "inherit", shell: true })
    : spawn("opencode", [], { stdio: "inherit" })
  child.on("error", (err) => {
    if (err.code === "ENOENT") {
      console.error("Error: opencode not found on PATH. Install it from https://opencode.ai");
    } else {
      console.error(`Error launching opencode: ${err.message}`);
    }
    process.exit(1);
  })
}
