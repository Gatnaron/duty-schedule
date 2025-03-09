const { app, BrowserWindow } = require("electron");
const { exec } = require("child_process");
const path = require("path");
const http = require("http");

let mainWindow;
let serverProcess;

function waitForClient(port, callback) {
    const checkServer = () => {
        http.get(`http://localhost:${port}`, (res) => {
            if (res.statusCode === 200) {
                console.log(`Client server port: ${port}`);
                callback();
            } else {
                console.log(`Waiting starting client...`);
                setTimeout(checkServer, 1000);
            }
        }).on("error", () => {
            console.log(`Waiting starting client...`);
            setTimeout(checkServer, 1000);
        });
    };
    checkServer();
}

app.on("ready", () => {
    console.log("Electron starting!");

    // Запуск сервера
    console.log("Starting server...");
    serverProcess = exec("npm run start-server", (error, stdout, stderr) => {
        if (error) {
            console.error(`Error start server: ${error}`);
        }
        console.log(`STDOUT: ${stdout}`);
        console.error(`STDERR: ${stderr}`);
    });

    // Ожидание, пока клиентский сервер запустится
    waitForClient(3000, () => {
        console.log("Создание окна Electron...");
        mainWindow = new BrowserWindow({
            width: 1920,
            height: 1080,
            fullscreen: false,
            title: "График дежурств",
            icon: path.join(__dirname, "build", "logo.png"),
            autoHideMenuBar: true,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
            },
        });

        mainWindow.setMenu(null);

        mainWindow.loadURL(`file://${path.resolve(__dirname, "build", "index.html")}`);

        mainWindow.on("closed", () => {
            console.log("Window close.");
            mainWindow = null;
            if (serverProcess) serverProcess.kill();
        });
    });
});

app.on("window-all-closed", () => {
    console.log("All Window close. Exit...");
    if (process.platform !== "darwin") {
        app.quit();
    }
});
