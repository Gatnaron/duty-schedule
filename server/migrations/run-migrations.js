const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, '../db/database.db');
const sqlPath = path.resolve(__dirname, 'init.sql');

// Создаем соединение с базой данных
const db = new sqlite3.Database(dbPath);

// Читаем SQL-скрипт
const sql = fs.readFileSync(sqlPath, 'utf-8');

// Выполняем миграции
db.exec(sql, (err) => {
    if (err) {
        console.error('Ошибка миграции:', err);
        process.exit(1);
    }
    console.log('Миграции успешно выполнены!');
    db.close();
});