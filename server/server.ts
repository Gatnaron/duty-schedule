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

app.get('/api/schedule-event', async (req, res) => {
    try {
        const db = await initializeDB();
        const schedule = await db.all('SELECT * FROM Schedule ORDER BY time');
        res.json(schedule);
    } catch (error) {
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

app.get('/api/statistics', async (req, res) => {
    try {
        const { year, month } = req.query;
        const db = await initializeDB();
        // Формируем SQL-запрос с фильтрацией по месяцу и году
        const query = `
            SELECT * FROM DutySchedule
            WHERE strftime("%Y", date_of_dutySchedule) = ?
            AND strftime("%m", date_of_dutySchedule) = ?
        `;
        const stats = await db.all(query, [year, String(month).padStart(2, '0')]);
        res.json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Маршруты для работы с графиком дежурств
app.get('/api/duty-schedule', async (req, res) => {
    try {
        const { date } = req.query; // Получаем дату из параметров запроса
        console.log('Полученная дата:', date); // Выводим дату в консоль
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

app.get('/api/shift-composition', async (req, res) => {
    try {
        const { date } = req.query;
        const db = await initializeDB();
        const query = `
            SELECT 
                ds.id,
                ds.date_of_dutySchedule,
                dt.name AS dutyTeamName,
                p.name AS actualPersonnelName
            FROM DutySchedule ds
            LEFT JOIN DutyTeams dt ON ds.dutyTeamId = dt.id
            LEFT JOIN Personnel p ON ds.actualPersonnelId = p.id
            WHERE ds.date_of_dutySchedule = ?
        `;
        const schedule = await db.all(query, date);
        console.log('Данные для отправки:', schedule); // Логирование данных
        res.json(schedule);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/duty-schedule', async (req, res) => {
    try {
        const { date_of_dutySchedule, dutyTeamId, plannedPersonnelId } = req.body;
        const db = await initializeDB();
        const result = await db.run(
            'INSERT INTO DutySchedule (date_of_dutySchedule, dutyTeamId, plannedPersonnelId, actualPersonnelId) VALUES (?, ?, ?, ?)',
            date_of_dutySchedule,
            dutyTeamId,
            plannedPersonnelId,
            plannedPersonnelId // При создании actualPersonnelId = plannedPersonnelId
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
        const { date_of_dutySchedule, dutyTeamId, plannedPersonnelId, actualPersonnelId } = req.body;
        const db = await initializeDB();

        // Формируем динамический SQL-запрос
        const updates = [];
        const params = [];

        if (date_of_dutySchedule !== undefined) {
            updates.push('date_of_dutySchedule = ?');
            params.push(date_of_dutySchedule);
        }
        if (dutyTeamId !== undefined) {
            updates.push('dutyTeamId = ?');
            params.push(dutyTeamId);
        }
        if (plannedPersonnelId !== undefined) {
            updates.push('plannedPersonnelId = ?');
            params.push(plannedPersonnelId);
        }
        if (actualPersonnelId !== undefined) {
            updates.push('actualPersonnelId = ?');
            params.push(actualPersonnelId);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        params.push(id); // Добавляем ID записи

        const query = `UPDATE DutySchedule SET ${updates.join(', ')} WHERE id = ?`;
        await db.run(query, params);

        // Получаем обновленную запись
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

app.post('/api/orders', async (req, res) => {
    try {
        const { dutyScheduleId, orderNumber } = req.body;
        if (!dutyScheduleId || !orderNumber) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const db = await initializeDB();
        const result = await db.run(
            'INSERT INTO Orders (dutyScheduleId, orderNumber) VALUES (?, ?)',
            dutyScheduleId, orderNumber
        );
        res.json({ id: result.lastID, ...req.body });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/orders', async (req, res) => {
    try {
        const { dutyScheduleId } = req.query;
        const db = await initializeDB();
        if (!dutyScheduleId) {
            return res.status(400).json({ error: 'Missing dutyScheduleId parameter' });
        }
        // Преобразуем dutyScheduleId в массив, если передано несколько значений
        const ids = Array.isArray(dutyScheduleId) ? dutyScheduleId : [dutyScheduleId];
        const placeholders = ids.map(() => '?').join(',');
        const query = `SELECT * FROM Orders WHERE dutyScheduleId IN (${placeholders})`;
        const orders = await db.all(query, ids);
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

app.put('/api/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { orderNumber } = req.body;
        if (!orderNumber) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const db = await initializeDB();
        await db.run('UPDATE Orders SET orderNumber = ? WHERE id = ?', orderNumber, id);
        const updatedOrder = await db.get('SELECT * FROM Orders WHERE id = ?', id);
        res.json(updatedOrder);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

app.delete('/api/orders', async (req, res) => {
    try {
        const db = await initializeDB();
        await db.run('DELETE FROM Orders');
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Маршруты для работы с ЗВКС
// Получение актуальных записей ЗВКС
app.get('/api/zvks', async (req, res) => {
    try {
        const db = await initializeDB();
        const currentTime = new Date(); // Текущее время для фильтрации
        const query = `
            SELECT * FROM ZVKS 
            WHERE commanderTime > time('now') 
            ORDER BY communicatorTime ASC
        `;
        const zvks = await db.all(query);
        res.json(zvks);
    } catch (error) {
        console.error('Ошибка загрузки ЗВКС:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Добавление новой записи ЗВКС
app.post('/api/zvks', async (req, res) => {
    try {
        const { whoPosition, whoName, withPosition, withName, communicatorTime, commanderTime } = req.body;

        // Проверка обязательных полей
        if (!whoPosition || !whoName || !withPosition || !withName || !communicatorTime || !commanderTime) {
            return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
        }

        const db = await initializeDB();
        const result = await db.run(
            'INSERT INTO ZVKS (whoPosition, whoName, withPosition, withName, communicatorTime, commanderTime) VALUES (?, ?, ?, ?, ?, ?)',
            [whoPosition, whoName, withPosition, withName, communicatorTime, commanderTime]
        );
        res.json({ id: result.lastID });
    } catch (error) {
        console.error('Ошибка добавления ЗВКС:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Обновление существующей записи ЗВКС
app.put('/api/zvks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { whoPosition, whoName, withPosition, withName, communicatorTime, commanderTime } = req.body;

        // Проверка обязательных полей
        if (!whoPosition || !whoName || !withPosition || !withName || !communicatorTime || !commanderTime) {
            return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
        }

        const db = await initializeDB();
        await db.run(
            'UPDATE ZVKS SET whoPosition = ?, whoName = ?, withPosition = ?, withName = ?, communicatorTime = ?, commanderTime = ? WHERE id = ?',
            [whoPosition, whoName, withPosition, withName, communicatorTime, commanderTime, id]
        );
        const updatedItem = await db.get('SELECT * FROM ZVKS WHERE id = ?', id);
        res.json(updatedItem);
    } catch (error) {
        console.error('Ошибка обновления ЗВКС:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Удаление записи ЗВКС
app.delete('/api/zvks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const db = await initializeDB();
        await db.run('DELETE FROM ZVKS WHERE id = ?', id);
        res.json({ success: true });
    } catch (error) {
        console.error('Ошибка удаления ЗВКС:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Маршруты для работы с заметками
app.get('/api/notes', async (req, res) => {
    const db = await initializeDB();
    const notes = await db.all('SELECT * FROM Notes');
    res.json(notes);
});

app.post('/api/notes', async (req, res) => {
    try {
        const { date_of_notes, content } = req.body;
        const db = await initializeDB();

        // Проверяем, существует ли запись в таблице Notes
        const existingNote = await db.get('SELECT * FROM Notes LIMIT 1');

        if (existingNote) {
            // Обновляем существующую запись
            await db.run(
                'UPDATE Notes SET date_of_notes = ?, content = ? WHERE id = ?',
                date_of_notes,
                content,
                existingNote.id
            );
        } else {
            // Создаем новую запись
            await db.run(
                'INSERT INTO Notes (date_of_notes, content) VALUES (?, ?)',
                date_of_notes,
                content
            );
        }

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
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