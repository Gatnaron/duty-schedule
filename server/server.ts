import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import cors from 'cors';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Инициализация БД
async function initializeDB() {
    return open({
        filename: './server/db/database.db',
        driver: sqlite3.Database
    });
}

// Маршруты для работы с БП
app.get('/api/combat-posts', async (req, res) => {
    try {
        const db = await initializeDB();
        const posts = await db.all('SELECT * FROM CombatPosts');
        res.json(posts);
    }
    catch (error){
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/combat-posts', async (req, res) => {
    try {
        const {name} = req.body;
        const db = await initializeDB();
        const result = await db.run('INSERT INTO CombatPosts (name) VALUES (?)', name);
        res.json({id: result.lastID});
    }
    catch (error){
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Маршруты для работы с НДР
app.get('/api/duty-teams', async (req, res) => {
    try {
        const db = await initializeDB();
        const teams = await db.all('SELECT * FROM DutyTeams');
        res.json(teams);
    }
    catch (error){
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/duty-teams', async (req, res) => {
    try {
        const {name, postId} = req.body;
        const db = await initializeDB();
        const result = await db.run('INSERT INTO DutyTeams (name, postId) VALUES (?, ?)', name, postId);
        res.json({id: result.lastID});
    }
    catch (error){
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Маршруты для работы с персоналом
app.get('/api/personnel', async (req, res) => {
    try {
        const db = await initializeDB();
        const personnel = await db.all('SELECT * FROM Personnel');
        res.json(personnel);
    }
    catch (error){
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Добавление сотрудника с одним НДР
app.post('/api/personnel', async (req, res) => {
    try {
        const { name, rankId, dutyTeamId } = req.body;
        const db = await initializeDB();
        const result = await db.run(
            'INSERT INTO Personnel (name, rankId, dutyTeamId) VALUES (?, ?, ?)',
            name, rankId, dutyTeamId
        );
        res.json({ id: result.lastID });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Маршруты для работы с расписанием
app.get('/api/schedule', async (req, res) => {
    try {
        const db = await initializeDB();
        const schedule = await db.all('SELECT * FROM Schedule');
        res.json(schedule);
    }
    catch (error){
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/schedule', async (req, res) => {
    try {
        const {time, event} = req.body;
        const db = await initializeDB();
        const result = await db.run('INSERT INTO Schedule (time, event) VALUES (?, ?)', time, event);
        res.json({id: result.lastID});
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

app.put('/api/schedule/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { time, event } = req.body;
        const db = await initializeDB();
        await db.run(
            'UPDATE Schedule SET time = ?, event = ? WHERE id = ?',
            time, event, id
        );
        const updatedEvent = await db.get('SELECT * FROM Schedule WHERE id = ?', id);
        res.json(updatedEvent);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Маршруты для работы с графиком дежурств
app.get('/api/duty-schedule', async (req, res) => {
    try {
        const { date } = req.query;
        const db = await initializeDB();
        const schedule = await db.all(
            'SELECT * FROM DutySchedule WHERE date_of_dutySchedule = ?',
            date
        );
        res.json(schedule);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/duty-schedule', async (req, res) => {
    try {
        const { date_of_dutySchedule, dutyTeamId, personnelId } = req.body;
        const db = await initializeDB();
        const result = await db.run(
            'INSERT INTO DutySchedule (date_of_dutySchedule, dutyTeamId, personnelId) VALUES (?, ?, ?)',
            date_of_dutySchedule, dutyTeamId, personnelId
        );
        res.json({ id: result.lastID, ...req.body });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

app.put('/api/duty-schedule/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { date_of_dutySchedule, dutyTeamId, personnelId } = req.body;
        const db = await initializeDB();
        await db.run(
            'UPDATE DutySchedule SET date_of_dutySchedule = ?, dutyTeamId = ?, personnelId = ? WHERE id = ?',
            date_of_dutySchedule, dutyTeamId, personnelId, id
        );
        const updatedItem = await db.get('SELECT * FROM DutySchedule WHERE id = ?', id);
        res.json(updatedItem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

app.delete('/api/duty-schedule/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const db = await initializeDB();
        await db.run('DELETE FROM DutySchedule WHERE id = ?', id);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Маршруты для работы с ЗВКС
app.get('/api/zvks', async (req, res) => {
    const db = await initializeDB();
    const zvks = await db.all('SELECT * FROM ZVKS');
    res.json(zvks);
});

app.post('/api/zvks', async (req, res) => {
    const { whoPosition, whoName, withPosition, withName, communicatorTime, commanderTime } = req.body;
    const db = await initializeDB();
    const result = await db.run(
        'INSERT INTO ZVKS (whoPosition, whoName, withPosition, withName, communicatorTime, commanderTime) VALUES (?, ?, ?, ?, ?, ?)',
        whoPosition, whoName, withPosition, withName, communicatorTime, commanderTime
    );
    res.json({ id: result.lastID });
});

// Маршруты для работы со статистикой
app.get('/api/statistics', async (req, res) => {
    const db = await initializeDB();
    const statistics = await db.all('SELECT * FROM Statistics');
    res.json(statistics);
});

app.post('/api/statistics', async (req, res) => {
    const { date_of_statistics, dutyTeamId, plannedPersonnelId, actualPersonnelId } = req.body;
    const db = await initializeDB();
    const result = await db.run(
        'INSERT INTO Statistics (date_of_statistics, dutyTeamId, plannedPersonnelId, actualPersonnelId) VALUES (?, ?, ?, ?)',
        date_of_statistics, dutyTeamId, plannedPersonnelId, actualPersonnelId
    );
    res.json({ id: result.lastID });
});

// Маршруты для работы с заметками
app.get('/api/notes', async (req, res) => {
    const db = await initializeDB();
    const notes = await db.all('SELECT * FROM Notes');
    res.json(notes);
});

app.post('/api/notes', async (req, res) => {
    const { date_of_notes, content } = req.body;
    const db = await initializeDB();
    const result = await db.run(
        'INSERT INTO Notes (date_of_notes, content) VALUES (?, ?)',
        date_of_notes, content
    );
    res.json({ id: result.lastID });
});

// Получение званий
app.get('/api/ranks', async (req, res) => {
    try {
        const db = await initializeDB();
        const ranks = await db.all('SELECT * FROM Ranks');
        res.json(ranks);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});