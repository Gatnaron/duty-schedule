import express from 'express';
import Database from 'better-sqlite3';

const router = express.Router();
const db = Database('duty.db');

// Получение текущего расписания
router.get('/timetable', (req, res) => {
    const stmt = db.prepare('SELECT * FROM timetable ORDER BY time');
    res.json(stmt.all());
});

// Добавление ЗВКС
router.post('/zvks', (req, res) => {
    const { initiator_position, initiator_name, contact_position, contact_name, comms_time, commander_time } = req.body;

    const stmt = db.prepare(`
    INSERT INTO zvks 
    (initiator_position, initiator_name, contact_position, contact_name, comms_time, commander_time)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

    const result = stmt.run(
        initiator_position,
        initiator_name,
        contact_position,
        contact_name,
        comms_time,
        commander_time
    );

    res.json({ id: result.lastInsertRowid });
});

// Получение актуальных ЗВКС
router.get('/zvks/active', (req, res) => {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
    SELECT * FROM zvks 
    WHERE commander_time > ?
    ORDER BY commander_time
  `);
    res.json(stmt.all(now));
});