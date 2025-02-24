import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import cors from 'cors';
import { Server as WebSocketServer } from 'ws';

const app = express();
const port = 3001;
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        console.log('Received:', message);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

interface BroadcastData {
    type: string;
    data: any;
}

function broadcastUpdate(data: BroadcastData) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

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
        const newItem = { id: result.lastID, name };
        broadcastUpdate({ type: 'combat-posts-update', data: newItem });
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
        const newItem = { id: result.lastID, name, postId };
        broadcastUpdate({ type: 'duty-teams-update', data: newItem });
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
        const newItem = { id: result.lastID, name, rankId, dutyTeamId };
        broadcastUpdate({ type: 'personnel-update', data: newItem });
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
        const newItem = { id: result.lastID, time, event };
        broadcastUpdate({ type: 'schedule-update', data: newItem });
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
        broadcastUpdate({ type: 'schedule-update', data: updatedEvent });
        res.json(updatedEvent);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

app.delete('/api/schedule/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const db = await initializeDB();

        // Проверяем, существует ли запись с указанным ID
        const existingEvent = await db.get('SELECT * FROM Schedule WHERE id = ?', id);
        if (!existingEvent) {
            return res.status(404).json({ error: 'Мероприятие не найдено' });
        }

        // Удаляем запись
        await db.run('DELETE FROM Schedule WHERE id = ?', id);
        res.json({ success: true });
    } catch (error) {
        console.error('Ошибка удаления мероприятия:', error);
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
            plannedPersonnelId
        );
        const newItem = { id: result.lastID, ...req.body };
        broadcastUpdate({ type: 'duty-schedule-update', data: newItem });
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

        params.push(id);

        const query = `UPDATE DutySchedule SET ${updates.join(', ')} WHERE id = ?`;
        await db.run(query, params);

        const updatedItem = await db.get('SELECT * FROM DutySchedule WHERE id = ?', id);
        broadcastUpdate({ type: 'duty-schedule-update', data: updatedItem });
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
        broadcastUpdate({ type: 'duty-schedule-delete', data: { id } });
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
        const newItem = { id: result.lastID, ...req.body };
        broadcastUpdate({ type: 'orders-update', data: newItem });
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
        broadcastUpdate({ type: 'orders-update', data: updatedOrder });
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
        broadcastUpdate({ type: 'orders-delete', data: {} });
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Маршруты для работы с ЗВКС
// Маршруты для работы с ЗВКС
app.get('/api/zvks', async (req, res) => {
    try {
        const db = await initializeDB();
        const currentTime = new Date(); // Текущее время для фильтрации
        const sortMode = req.query.sortMode || 'nearest'; // Режим сортировки: 'nearest' или 'inDevelopment'

        // Формируем SQL-запрос для получения всех записей
        const query = `
            SELECT * FROM ZVKS
        `;
        const zvks = await db.all(query);

        // Преобразуем текущее время в минуты для удобства сравнения
        const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

        let sortedZvks;

        if (sortMode === 'nearest') {
            // Сортировка "ближайшие связиста"
            sortedZvks = zvks.sort((a, b) => {
                const timeA = a.communicatorTime.split(':').map(Number);
                const timeB = b.communicatorTime.split(':').map(Number);

                const minutesA = timeA[0] * 60 + timeA[1];
                const minutesB = timeB[0] * 60 + timeB[1];

                // Если время A или B меньше текущего времени, добавляем 24 часа (1440 минут)
                const adjustedA = minutesA >= currentMinutes ? minutesA : minutesA + 1440;
                const adjustedB = minutesB >= currentMinutes ? minutesB : minutesB + 1440;

                return adjustedA - adjustedB;
            });
        } else if (sortMode === 'inDevelopment') {
            // Сортировка "в разработке"
            sortedZvks = zvks.map(item => {
                const communicatorTime = item.communicatorTime.split(':').map(Number);
                const commanderTime = item.commanderTime.split(':').map(Number);

                const communicatorMinutes = communicatorTime[0] * 60 + communicatorTime[1];
                const commanderMinutes = commanderTime[0] * 60 + commanderTime[1];

                const isInRange =
                    currentMinutes >= communicatorMinutes && currentMinutes <= commanderMinutes;

                return { ...item, isInRange };
            });

            // Сначала идут записи, где текущее время в промежутке
            sortedZvks.sort((a, b) => {
                if (a.isInRange && !b.isInRange) return -1;
                if (!a.isInRange && b.isInRange) return 1;
                return 0;
            });
        }

        res.json(sortedZvks);
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
        const newItem = await db.get('SELECT * FROM ZVKS WHERE id = ?', result.lastID);
        res.json(newItem);
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
        broadcastUpdate({ type: 'zvks-update', data: updatedItem });
        res.json(updatedItem);
    } catch (error) {
        console.error('Ошибка обновления ЗВКС:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

async function deleteExpiredZvks() {
    try {
        const db = await initializeDB();

        // Получаем текущее локальное время в формате HH:mm
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const currentTime = `${hours}:${minutes}`;

        console.log(`Текущее локальное время: ${currentTime}`);

        const query = `
            DELETE FROM ZVKS 
            WHERE commanderTime = ?
        `;
        await db.run(query, currentTime);
        console.log(`Удалены записи ZVKS с commanderTime = ${currentTime}`);
    } catch (error) {
        console.error('Ошибка при удалении записей ZVKS:', error);
    }
}

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
        broadcastUpdate({ type: 'notes-update', data: { date_of_notes, content } });
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
    setInterval(deleteExpiredZvks, 60000);
});