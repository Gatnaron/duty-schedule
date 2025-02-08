import { useState, useEffect } from 'react';
import styles from './ScheduleEditor.module.css';
import saveIcon from '../../img/icon-save.png';

interface ScheduleItem {
    id: number;
    time: string;
    event: string;
}

const ScheduleEditor = () => {
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
    const [newEvent, setNewEvent] = useState({ time: '', event: '' });
    const [isLoading, setIsLoading] = useState(true);

    // Загрузка данных с сервера
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('http://localhost:3001/api/schedule');
                if (!response.ok) {
                    throw new Error(`Ошибка HTTP: ${response.status}`);
                }
                const data: ScheduleItem[] = await response.json();
                setSchedule(sortSchedule(data));
            } catch (error) {
                console.error('Ошибка загрузки расписания:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Функция для сортировки расписания по времени
    const sortSchedule = (data: ScheduleItem[]) => {
        return data.sort((a, b) => {
            const timeA = a.time.split(':').map(Number);
            const timeB = b.time.split(':').map(Number);
            return timeA[0] - timeB[0] || timeA[1] - timeB[1];
        });
    };

    // Добавление нового мероприятия
    const addEvent = async () => {
        if (!newEvent.time || !newEvent.event) return;
        try {
            const response = await fetch('http://localhost:3001/api/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newEvent)
            });
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            const createdEvent: ScheduleItem = await response.json();
            setSchedule(sortSchedule([...schedule, createdEvent]));
            setNewEvent({ time: '', event: '' });
        } catch (error) {
            console.error('Ошибка добавления мероприятия:', error);
        }
    };

    // Обновление существующего мероприятия
    const updateEvent = async (id: number, updatedData: Partial<ScheduleItem>) => {
        try {
            const response = await fetch(`http://localhost:3001/api/schedule/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            const updatedEvent: ScheduleItem = await response.json();
            setSchedule(sortSchedule(
                schedule.map(item => item.id === id ? { ...item, ...updatedEvent } : item)
            ));
        } catch (error) {
            console.error('Ошибка обновления мероприятия:', error);
        }
    };

    return (
        <div className={styles.container}>
            {/* Форма добавления нового мероприятия */}
            <div className={styles.formContainer}>
                <input
                    type="text"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    placeholder="Время (ЧЧ:ММ)"
                />
                <input
                    type="text"
                    value={newEvent.event}
                    onChange={(e) => setNewEvent({ ...newEvent, event: e.target.value })}
                    placeholder="Название мероприятия"
                />
                <button className={styles.saveButton} onClick={addEvent}>
                    <img src={saveIcon} alt="Сохранить" />
                </button>
            </div>

            {/* Таблица расписания */}
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                    <tr>
                        <th>Время</th>
                        <th>Мероприятие</th>
                    </tr>
                    </thead>
                    <tbody>
                    {schedule.map((item) => (
                        <tr key={item.id}>
                            <td>
                                <input
                                    type="text"
                                    value={item.time}
                                    onChange={(e) =>
                                        updateEvent(item.id, { ...item, time: e.target.value })
                                    }
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    value={item.event}
                                    onChange={(e) =>
                                        updateEvent(item.id, { ...item, event: e.target.value })
                                    }
                                />
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ScheduleEditor;