// Launcher script — dipakai oleh pkg untuk buat exe
const { spawn, exec } = require("child_process");
const path = require("path");
const net = require("net");

const PROJECT_DIR = path.join(__dirname);
const PORT = 3000;
const URL = `http://localhost:${PORT}`;

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(true));   // port in use
    server.once("listening", () => { server.close(); resolve(false); });
    server.listen(port);
  });
}

function openBrowser(url) {
  const cmd = process.platform === "win32"
    ? `start "" "${url}"`
    : process.platform === "darwin"
    ? `open "${url}"`
    : `xdg-open "${url}"`;
  exec(cmd);
}

function waitForPort(port, retries = 20, delay = 2000) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    function attempt() {
      checkPort(port).then((inUse) => {
        if (inUse) {
          resolve();
        } else if (attempts < retries) {
          attempts++;
          setTimeout(attempt, delay);
        } else {
          reject(new Error("Server timeout"));
        }
      });
    }
    attempt();
  });
}

async function main() {
  console.log("╔══════════════════════════════════╗");
  console.log("║     SK Motor POS — Launcher      ║");
  console.log("╚══════════════════════════════════╝\n");

  const alreadyRunning = await checkPort(PORT);
  if (alreadyRunning) {
    console.log("✓ Server sudah berjalan di port 3000");
    console.log("→ Membuka browser...\n");
    openBrowser(URL);
    return;
  }

  console.log("→ Memulai server Next.js...");
  console.log("  Harap tunggu 10-15 detik...\n");

  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  const server = spawn(npmCmd, ["run", "dev"], {
    cwd: PROJECT_DIR,
    detached: false,
    stdio: "inherit",
  });

  server.on("error", (err) => {
    console.error("Error memulai server:", err.message);
  });

  try {
    console.log("  Menunggu server siap...");
    await waitForPort(PORT);
    console.log("\n✓ Server berhasil berjalan!");
    console.log("→ Membuka SK Motor POS di browser...\n");
    setTimeout(() => openBrowser(URL), 1000);
  } catch (e) {
    console.error("✗ Server gagal dimulai. Coba jalankan: npm run dev");
  }
}

main();
