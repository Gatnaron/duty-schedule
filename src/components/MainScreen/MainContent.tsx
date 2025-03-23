import React, { useEffect, useState } from 'react';
import styles from './MainContent.module.css';
import addPlus from '../../img/add-plus.png';
import editIcon from '../../img/edit_icon.png';
import saveIcon from '../../img/icon-save.png';
import sortIcon from '../../img/sort.png';

interface ScheduleItem {
    id: number;
    time: string;
    event: string;
}

interface Note {
    id: number;
    date_of_notes: string;
    content: string;
}


interface ZvksItem {
    id: number;
    whoPosition: string;
    whoName: string;
    withPosition: string;
    withName: string;
    communicatorTime: string;
    commanderTime: string;
}

interface Rank {
    id: number;
    name: string;
}

const MainContent = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
    const [zvksList, setZvksList] = useState<ZvksItem[]>([]);
    const [ranks, setRanks] = useState<Rank[]>([]);
    const [currentEvent, setCurrentEvent] = useState('Нет данных');
    const [nextEvent, setNextEvent] = useState('Нет данных');
    const [nextEventTime, setNextEventTime] = useState('');
    const [notes, setNotes] = useState('');
    const [selectedZvksId, setSelectedZvksId] = useState<number | null>(null);
    const [whoPosition, setWhoPosition] = useState('');
    const [whoName, setWhoName] = useState('');
    const [withPosition, setWithPosition] = useState('');
    const [withName, setWithName] = useState('');
    const [communicatorTime, setCommunicatorTime] = useState('');
    const [commanderTime, setCommanderTime] = useState('');
    const [isZvksFormVisible, setIsZvksFormVisible] = useState(false);
    const [sortMode, setSortMode] = useState<'nearest' | 'inDevelopment'>('nearest');
    const [isSortButtonRotated, setIsSortButtonRotated] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080');

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            switch (data.type) {
                case 'schedule-update':
                    setSchedule((prev) => [...prev, data.data]);
                    break;
                case 'zvks-update':
                    setZvksList((prev) => [...prev, data.data]);
                    break;
                case 'zvks-delete':
                    setZvksList((prev) => prev.filter((item) => item.id !== data.data.id));
                    break;
                case 'notes-update':
                    setNotes(data.data.content);
                    break;
                default:
                    console.log('Неизвестный тип события:', data.type);
            }
        };

        ws.onopen = () => {
            console.log('WebSocket соединение установлено');
        };

        ws.onerror = (error) => {
            console.error('WebSocket ошибка:', error);
        };

        ws.onclose = () => {
            console.log('WebSocket соединение закрыто');
        };

        return () => {
            ws.close();
        };
    }, []);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/schedule-event');
                if (!response.ok) throw new Error('Ошибка загрузки расписания');
                const data: ScheduleItem[] = await response.json();
                setSchedule(data);
            } catch (error) {
                console.error('Ошибка загрузки расписания:', error);
            }
        };
        fetchSchedule();
    }, []);

    useEffect(() => {
        fetchZvks();

        const intervalId = setInterval(fetchZvks, 60000); // Каждую минуту

        fetchZvks();

        return () => clearInterval(intervalId);
    }, [sortMode]);

    useEffect(() => {
        const fetchRanks = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/ranks');
                if (!response.ok) throw new Error('Ошибка загрузки званий');
                const data: Rank[] = await response.json();
                setRanks(data);
            } catch (error) {
                console.error('Ошибка загрузки званий:', error);
            }
        };
        fetchRanks();
    }, []);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/notes');
                if (!response.ok) throw new Error('Ошибка загрузки заметок');
                const data: Note[] = await response.json(); // Явное указание типа данных

                // Сортировка заметок по дате (от самой новой к самой старой)
                const latestNote = data.sort((a: Note, b: Note) => {
                    const dateA = new Date(a.date_of_notes).getTime();
                    const dateB = new Date(b.date_of_notes).getTime();
                    return dateB - dateA; // Сортировка по убыванию
                })[0];

                if (latestNote) {
                    setNotes(latestNote.content);
                }
            } catch (error) {
                console.error('Ошибка загрузки заметок:', error);
            }
        };
        fetchNotes();
    }, []);

    useEffect(() => {
        const now = currentTime;
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        let current = 'Нет данных';
        let next = 'Нет данных';
        let nextTime = '';

        for (let i = 0; i < schedule.length; i++) {
            const [hours, minutes] = schedule[i].time.split(':').map(Number);
            const eventMinutes = hours * 60 + minutes;

            if (eventMinutes > nowMinutes) {
                next = schedule[i].event;
                nextTime = schedule[i].time;
                break;
            } else {
                current = schedule[i].event;
            }
        }

        setCurrentEvent(current);
        setNextEvent(next);
        setNextEventTime(nextTime);
    }, [currentTime, schedule]);

    const handleNotesChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newNotes = e.target.value;
        setNotes(newNotes); // Обновляем состояние локально

        try {
            const today = new Date().toISOString().split('T')[0]; // Текущая дата
            const response = await fetch('http://localhost:3001/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date_of_notes: today, content: newNotes }),
            });
            if (!response.ok) throw new Error('Ошибка сохранения заметок');
            console.log('Заметки успешно сохранены');
        } catch (error) {
            console.error('Ошибка сохранения заметок:', error);
        }
    };

    const handleAddZvks = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/zvks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    whoPosition,
                    whoName,
                    withPosition,
                    withName,
                    communicatorTime,
                    commanderTime,
                }),
            });
            if (!response.ok) throw new Error('Ошибка добавления ЗВКС');

            clearInputs();

            fetchZvks();
        } catch (error) {
            console.error('Ошибка добавления ЗВКС:', error);
        }
    };

    const fetchZvks = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/zvks?sortMode=${sortMode}`);
            if (!response.ok) throw new Error('Ошибка загрузки ЗВКС');
            const data: ZvksItem[] = await response.json();
            setZvksList(data);
        } catch (error) {
            console.error('Ошибка загрузки ЗВКС:', error);
        }
    };

    const isDotActive = (communicatorTime: string, commanderTime: string) => {
        const now = currentTime;
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        // Преобразуем время связиста и командира в минуты
        const [commH, commM] = communicatorTime.split(':').map(Number);
        const [cmdH, cmdM] = commanderTime.split(':').map(Number);

        const communicatorMinutes = commH * 60 + commM;
        const commanderMinutes = cmdH * 60 + cmdM;

        // Проверяем, находится ли текущее время в диапазоне
        return currentMinutes >= communicatorMinutes && currentMinutes < commanderMinutes;
    };

    const handleEditZvks = async () => {
        if (!selectedZvksId) return; // Проверяем, выбран ли элемент
        try {
            const response = await fetch(`http://localhost:3001/api/zvks/${selectedZvksId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    whoPosition,
                    whoName,
                    withPosition,
                    withName,
                    communicatorTime,
                    commanderTime,
                }),
            });
            if (!response.ok) throw new Error('Ошибка редактирования ЗВКС');
            const updatedItem = await response.json();

            const ws = new WebSocket('ws://localhost:8080');
            ws.onopen = () => {
                ws.send(JSON.stringify({ type: 'zvks-edit', data: updatedItem }));
            };

            // Обновляем список ЗВКС
            setZvksList((prev) =>
                prev.map((item) => (item.id === selectedZvksId ? updatedItem : item))
            );

            // Очищаем поля ввода и снимаем выделение
            clearInputs();
        } catch (error) {
            console.error('Ошибка редактирования ЗВКС:', error);
        }
    };

    const clearInputs = () => {
        setWhoPosition('');
        setWhoName('');
        setWithPosition('');
        setWithName('');
        setCommunicatorTime('');
        setCommanderTime('');
    };

    const handleSelectZvks = (item: ZvksItem) => {
        if (selectedZvksId === item.id) {
            // Если элемент уже выбран, снимаем выделение
            setSelectedZvksId(null);
            clearInputs();
        } else {
            // Выбираем новый элемент
            setSelectedZvksId(item.id);
            setWhoPosition(item.whoPosition);
            setWhoName(item.whoName);
            setWithPosition(item.withPosition);
            setWithName(item.withName);
            setCommunicatorTime(item.communicatorTime);
            setCommanderTime(item.commanderTime);
        }
    };

    const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedDate = currentTime.toLocaleDateString();

    return (
        <div className={styles.container}>
            <div className={styles.timeSection}>
                <div className={styles.time}>{formattedTime}</div>
                <div className={styles.date}>{formattedDate}</div>
                <div className={styles.divider}></div>
            </div>

            <div className={styles.contentWrapper}>
                <div className={styles.leftColumn}>
                    <div className={styles.eventBlock}>
                        <div className={styles.eventTop}>
                            <div className={styles.eventTitle}>
                                <h2>ТЕКУЩЕЕ МЕРОПРИЯТИЕ</h2>
                            </div>
                            <div className={styles.divider}></div>
                            <div className={styles.currentEvent}>{currentEvent}</div>
                        </div>
                        <div className={styles.fullDivider}></div>
                        <div className={styles.eventBottom}>
                            <div className={styles.eventTitle}>
                                <h2>СЛЕДУЮЩЕЕ МЕРОПРИЯТИЕ</h2>
                            </div>
                            <div className={styles.divider}></div>
                            <div className={styles.nextEvent}>
                                {nextEvent}
                                {nextEventTime && <span className={styles.eventTime}> ({nextEventTime})</span>}
                            </div>
                        </div>
                    </div>

                    <div className={styles.notesBlock}>
                        <div className={styles.tasksHeader}>
                            <div className={styles.tasksTitle}>
                                <h2>ЗАМЕТКА</h2>
                            </div>
                        </div>
                        <textarea
                            className={styles.notesInput}
                            value={notes}
                            onChange={handleNotesChange}
                            placeholder="Введите задачи..."
                        />
                    </div>
                </div>

                <div className={styles.zvksBlock} style={{ flexGrow: 1 }}>
                    <div className={styles.zvksHeader}>
                        <h3 onClick={() => setIsZvksFormVisible(!isZvksFormVisible)}>
                            Защищенная видеоконференцсвязь{' '}
                            <span>{isZvksFormVisible ? '▲' : '▼'}</span>
                        </h3>
                        <button
                            className={styles.addButton}
                            onClick={selectedZvksId ? handleEditZvks : handleAddZvks}
                        >
                            <img
                                src={selectedZvksId ? editIcon : addPlus}
                                alt={selectedZvksId ? 'Изменить' : 'Добавить'}
                            />
                        </button>
                        <button
                            className={styles.sortButton}
                            onClick={() => {
                                setSortMode(prev => (prev === 'nearest' ? 'inDevelopment' : 'nearest'));
                                setIsSortButtonRotated(prev => !prev);
                            }}
                        >
                            <img
                                src={sortIcon} // Укажите путь к изображению
                                alt="Сортировка"
                                style={{
                                    transform: isSortButtonRotated ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.3s ease',
                                }}
                            />
                        </button>
                    </div>

                    {isZvksFormVisible && (
                        <div className={styles.zvksInputs}>
                            <select
                                value={whoPosition}
                                onChange={(e) => setWhoPosition(e.target.value)}
                            >
                                <option value="">Выберите должность "кто"</option>
                                {ranks.map((rank) => (
                                    <option key={rank.id} value={rank.name}>
                                        {rank.name}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="text"
                                value={whoName}
                                onChange={(e) => setWhoName(e.target.value)}
                                placeholder="ФИО кто"
                            />
                            <select
                                value={withPosition}
                                onChange={(e) => setWithPosition(e.target.value)}
                            >
                                <option value="">Выберите должность "с кем"</option>
                                {ranks.map((rank) => (
                                    <option key={rank.id} value={rank.name}>
                                        {rank.name}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="text"
                                value={withName}
                                onChange={(e) => setWithName(e.target.value)}
                                placeholder="ФИО с кем"
                            />
                            <input
                                type="time"
                                value={communicatorTime}
                                onChange={(e) => setCommunicatorTime(e.target.value)}
                            />
                            <input
                                type="time"
                                value={commanderTime}
                                onChange={(e) => setCommanderTime(e.target.value)}
                            />
                        </div>
                    )}

                    <div className={styles.zvksList}>
                        {zvksList.map((item) => (
                            <div
                                key={item.id}
                                className={`${styles.zvksItem} ${selectedZvksId === item.id ? styles.selected : ''}`}
                                onClick={() => handleSelectZvks(item)}
                            >
                                <div className={styles.zvksGrid}>
                                    <div className={styles.zvksGridRow}>
                                        <span>{item.whoPosition}</span>
                                        <strong>{item.whoName}</strong>
                                        <span className={styles.zvksDash}>-</span>
                                        <span>{item.withPosition}</span>
                                        <strong>{item.withName}</strong>
                                    </div>

                                    <div className={styles.zvksGridRow}>
                                        <span>
                                            {isDotActive(item.communicatorTime, item.commanderTime) && (
                                                <span className={styles.blinkingDot}></span>
                                            )}
                                            время связиста:
                                        </span>
                                        <span>{item.communicatorTime}</span>
                                        <span className={styles.zvksDash}>-</span>
                                        <span>время командира:</span>
                                        <span>{item.commanderTime}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainContent;