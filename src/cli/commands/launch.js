import { spawn } from "node:child_process"
import { confirm, isCancel } from "@clack/prompts"
import { checkAndPromptUpdate } from "../../core/versionCheck.js"
import { version } from "../../core/version.js"
import { collectChecks } from "./doctor.js"
import { runInit } from "./init.js"

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

const getLogoFrame = (frame) => {
  return ASCII_LOGO_LINES.map((line, r) => {
    // Math.sin(frame / 3.5 - r * 0.8) propagates the wave downwards, creating a rolling ocean wave shape
    const offset = Math.round(3 + 2 * Math.sin(frame / 3.5 - r * 0.8));
    return " ".repeat(offset) + line;
  });
};

export async function runLaunch() {
  // 1. Start loading animation
  for (let i = 0; i < 9; i++) console.log("");
  
  let frame = 0;
  let statusMessage = "Loading Wevr...";
  
  const animInterval = setInterval(() => {
    // Clear logo lines (9 rows)
    process.stdout.write("\x1b[9A\x1b[0J");
    
    const logo = getLogoFrame(frame);
    for (let r = 0; r < 5; r++) {
      console.log(COLORS[(frame + r) % COLORS.length] + logo[r] + "\x1b[0m");
    }
    console.log("");
    console.log(`  Weave engineering workflows. • v${version} (Stable)`);
    console.log("");
    
    // Draw spinning wave indicator
    const spinner = ["∿", "≋", "≁", "≋"][frame % 4];
    console.log(`  ${spinner} [ \x1b[36m🌊\x1b[0m ] ${statusMessage}\r`);
    
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

  // 3. Handle checks outcomes
  if (allPass) {
    // Overwrite the spinner line with the success checkmark in place
    process.stdout.write("\x1b[1A\r  \x1b[32m✓\x1b[0m All checks passed! Spawning OpenCode...\x1b[0K\n\n");
  } else {
    // Overwrite the spinner line with the failure message in place
    process.stdout.write("\x1b[1A\r  \x1b[31m✗\x1b[0m Diagnostics check failed.\x1b[0K\n\n");
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
