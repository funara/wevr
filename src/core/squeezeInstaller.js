import { execFileSync } from "node:child_process"
import { chmodSync, mkdirSync, existsSync, writeFileSync, unlinkSync, readFileSync, renameSync } from "node:fs"
import { extname, join, resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { createHash } from "node:crypto"
import { getConfigDir } from "./paths.js"

const __dirname = dirname(fileURLToPath(import.meta.url))

// Local binary name — friendlier than the upstream "rtk" name
const BIN_NAME = process.platform === "win32" ? "squeeze.exe" : "squeeze"
// Name of the binary inside the downloaded archive (upstream uses "rtk")
const RTK_BIN_NAME = process.platform === "win32" ? "rtk.exe" : "rtk"
export const ASSETS = {
  "darwin-arm64": "rtk-aarch64-apple-darwin.tar.gz",
  "darwin-x64": "rtk-x86_64-apple-darwin.tar.gz",
  "linux-x64": "rtk-x86_64-unknown-linux-musl.tar.gz",
  "linux-arm64": "rtk-aarch64-unknown-linux-gnu.tar.gz",
  "win32-x64": "rtk-x86_64-pc-windows-msvc.zip",
}
const RTK_RELEASE_BASE = "https://github.com/rtk-ai/rtk/releases/latest/download"

export function platformAsset() {
  const key = `${process.platform}-${process.arch}`
  return ASSETS[key] ?? null
}

export function validatePath(path) {
  if (!/^[a-zA-Z0-9_\-\.\:\/\\ ]+$/.test(path)) {
    throw new Error(`Invalid path: "${path}" contains unsafe characters`)
  }
}

export function findSqueezePath() {
  try {
    const [cmd, ...args] =
      process.platform === "win32" ? ["where", "squeeze"] : ["which", "squeeze"]
    return execFileSync(cmd, args, { stdio: "pipe" })
      .toString()
      .trim()
      .split(/\r?\n/)[0]
  } catch {
    return null
  }
}

function extract(archivePath, destDir) {
  validatePath(archivePath)
  validatePath(destDir)
  const isZip = extname(archivePath) === ".zip"

  if (isZip && process.platform === "win32") {
    execFileSync("powershell", [
      "-NoProfile",
      "-Command",
      `Expand-Archive -LiteralPath '${archivePath}' -DestinationPath '${destDir}' -Force`
    ], { stdio: "ignore" })
  } else {
    execFileSync("tar", ["-xzf", archivePath, "-C", destDir], { stdio: "ignore" })
  }
}

function verifyChecksum(buffer, assetName) {
  const checksumsPath = resolve(__dirname, "../templates/rtk-checksums.json")
  let checksums
  try {
    checksums = JSON.parse(readFileSync(checksumsPath, "utf-8"))
  } catch {
    // No checksums file — skip verification
    return
  }

  const expectedHash = checksums[assetName]
  if (expectedHash === null || expectedHash === undefined) {
    // Hash not yet populated for this platform — silently skip
    return
  }

  const computed = createHash("sha256").update(buffer).digest("hex")
  if (computed !== expectedHash) {
    throw new Error(
      `SHA256 mismatch for ${assetName}\n  expected: ${expectedHash}\n  computed: ${computed}`
    )
  }
}

export async function installSqueeze() {
  let rtkPath = findSqueezePath()

  if (!rtkPath) {
    // Not on PATH — download it to the managed location
    const asset = platformAsset()
    if (!asset) {
      console.warn("⚠ Squeeze: unsupported platform — squeeze binary unavailable")
      return
    }

    const binDir = join(getConfigDir(), "bin")
    mkdirSync(binDir, { recursive: true })

    const url = `${RTK_RELEASE_BASE}/${asset}`
    const archivePath = join(binDir, asset)

    try {
      let response
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          response = await fetch(url)
          if (!response.ok) throw new Error(`HTTP ${response.status}`)
          break
        } catch (err) {
          if (attempt < 3) {
            // Retry on any error (network, HTTP, etc.) with exponential backoff
            const delay = Math.pow(2, attempt - 1) * 1000
            await new Promise(r => setTimeout(r, delay))
            continue
          }
          throw err
        }
      }

      const buffer = Buffer.from(await response.arrayBuffer())
      verifyChecksum(buffer, asset)
      writeFileSync(archivePath, buffer)

      extract(archivePath, binDir)

      try { unlinkSync(archivePath) } catch {}

      // Archive contains "rtk"/"rtk.exe" — rename to local BIN_NAME ("squeeze")
      const extracted = join(binDir, RTK_BIN_NAME)
      rtkPath = join(binDir, BIN_NAME)
      if (existsSync(extracted) && extracted !== rtkPath) {
        renameSync(extracted, rtkPath)
      }

      if (process.platform !== "win32" && existsSync(rtkPath)) {
        chmodSync(rtkPath, 0o755)
      }

      // Verify that the downloaded binary is executable and runs on this platform
      try {
        execFileSync(rtkPath, ["--help"], { stdio: "ignore" })
      } catch (err) {
        // If it throws because of execution format or permissions (e.g. ENOEXEC, EACCES, ENOENT)
        if (err.code === "ENOEXEC" || err.code === "EACCES" || err.code === "ENOENT") {
          try { unlinkSync(rtkPath) } catch {}
          throw new Error(`Downloaded binary is not executable on this platform: ${err.message}`)
        }
        // If it ran but exited with non-zero (like returning exit code 1 for --help), that's fine, it means it is executable!
      }
    } catch (err) {
      try { unlinkSync(archivePath) } catch {}
      console.warn(`⚠ Squeeze: installation failed (${err.message}) — squeeze plugin disabled`)
      return
    }
  }
}
