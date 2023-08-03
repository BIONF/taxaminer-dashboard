const electron = require("electron");
var fs = require('fs');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require("path");
const isDev = require("electron-is-dev");
let mainWindow;

// Create a window to host the dashboard and load it
function createWindow() {
  mainWindow = new BrowserWindow({ width: 900, height: 680 });
  mainWindow.loadURL( isDev
  ? "http://localhost:3000"
  : `file://${path.join(__dirname, "../build/index.html")}`
  );
  mainWindow.maximize();
  mainWindow.on("closed", () => (mainWindow = null));
}

app.on("ready", () => {
  // Create working directories for the backend API - if they do not exist yet.
  const work_dir = app.getPath("userData")
  if (!fs.existsSync(`${work_dir}/api`)) fs.mkdirSync(`${work_dir}/api`);
  if (!fs.existsSync(`${work_dir}/api/datasets`)) fs.mkdirSync(`${work_dir}/api/datasets`);
  if (!fs.existsSync(`${work_dir}/api/temp`)) fs.mkdirSync(`${work_dir}/api/temp`);

  // The AppPath is the location of our unpacked bundle and contains the compiled backend executable
  let backend = app.getAppPath();
  backend = path.join(backend.substring(0, backend.lastIndexOf("/")), "api_dist/main");

  // Spawn the backend API as a child process
  var execfile = require('child_process').execFile;
  execfile(
    backend,
    {
      windowsHide: true,
      cwd: `${work_dir}/api`
    },
    (err, stdout, stderr) => {
      if (err) {
      console.log(err);
    }
    if (stdout) {
      console.log(stdout);
    }
    if (stderr) {
      console.log(stderr);
    }
  })
  // Now that the backend is running: Move on to the frontend
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    console.log("Shutting down")
    // We require the PID of the backend to terminate it. Thankfully we have an API route for that :D
    fetch("http://127.0.0.1:5500/pid")
    .then((response) => response.json())
    .then(data => {
      // SIGTERM
      process.kill(parseInt(data.pid))
      // Good night
      app.quit();
    })
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});