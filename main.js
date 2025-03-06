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
                console.log(`Клиентский сервер доступен на порту ${port}`);
                callback();
            } else {
                console.log(`Ожидание запуска клиента...`);
                setTimeout(checkServer, 1000);
            }
        }).on("error", () => {
            console.log(`Ожидание запуска клиента...`);
            setTimeout(checkServer, 1000);
        });
    };
    checkServer();
}

app.on("ready", () => {
    console.log("Electron запущен!");

    // Запуск сервера
    console.log("Запуск сервера...");
    serverProcess = exec("npm run start-server", (error, stdout, stderr) => {
        if (error) {
            console.error(`Ошибка запуска сервера: ${error}`);
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

        console.log("Загрузка http://localhost:3000...");
        mainWindow.loadURL("http://localhost:3000").catch(err => {
            console.error("Ошибка загрузки URL:", err);
        });

        mainWindow.on("closed", () => {
            console.log("Окно закрыто.");
            mainWindow = null;
            if (serverProcess) serverProcess.kill();
        });
    });
});

app.on("window-all-closed", () => {
    console.log("Все окна закрыты. Выход...");
    if (process.platform !== "darwin") {
        app.quit();
    }
});
