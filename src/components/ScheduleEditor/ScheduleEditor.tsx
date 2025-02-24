import { useState, useEffect } from 'react';
import styles from './ScheduleEditor.module.css';
import saveIcon from '../../img/icon-save.png';
import deleteIcon from '../../img/icon-delete.png';

interface ScheduleItem {
    id: number;
    time: string;
    event: string;
}

const ScheduleEditor = () => {
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
    const [newEvent, setNewEvent] = useState({ time: '', event: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

    const handleRowClick = (item: ScheduleItem) => {
        if (selectedItemId === item.id) {
            setSelectedItemId(null);
            setNewEvent({ time: '', event: '' });
        } else {
            setSelectedItemId(item.id);
            setNewEvent({ time: item.time, event: item.event });
        }
    };

    // Загрузка данных с сервера
    useEffect(() => {
        fetchAndSortSchedule();
    }, []);

    const fetchAndSortSchedule = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/schedule');
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            const data: ScheduleItem[] = await response.json();
            setSchedule(sortSchedule(data)); // Сортируем данные перед обновлением состояния
        } catch (error) {
            console.error('Ошибка загрузки расписания:', error);
        }
    };

    // Функция для сортировки расписания по времени
    const sortSchedule = (data: ScheduleItem[]) => {
        return data
            .sort((a, b) => {
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
                body: JSON.stringify(newEvent),
            });

            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }

            const createdEvent: ScheduleItem = await response.json();

            // После успешного добавления обновляем данные
            fetchAndSortSchedule();

            // Очищаем поля ввода
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

    const deleteEvent = async (id: number) => {
        try {
            const response = await fetch(`http://localhost:3001/api/schedule/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            setSchedule(schedule.filter(item => item.id !== id));
            setSelectedItemId(null);
            setNewEvent({ time: '', event: '' });
        } catch (error) {
            console.error('Ошибка удаления мероприятия:', error);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formContainer}>
                <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                />
                <input
                    type="text"
                    value={newEvent.event}
                    onChange={(e) => setNewEvent({ ...newEvent, event: e.target.value })}
                    placeholder="Название мероприятия"
                />
                <button
                    className={styles.saveButton}
                    onClick={selectedItemId ? () => deleteEvent(selectedItemId) : addEvent}
                >
                    <img
                        src={selectedItemId ? deleteIcon : saveIcon}
                        alt={selectedItemId ? "Удалить" : "Сохранить"}
                    />
                </button>
            </div>

            <div>
                <table className={styles.table}>
                    <thead>
                    <tr>
                        <th>Время</th>
                        <th>Мероприятие</th>
                    </tr>
                    </thead>
                    <tbody>
                    {schedule.map((item) => (
                        <tr key={item.id}
                            onClick={() => handleRowClick(item)}
                            className={selectedItemId === item.id ? styles.selectedRow : ''}
                        >
                            <td>
                                <input
                                    type="time"
                                    value={item.time}
                                    onChange={(e) =>
                                        updateEvent(item.id, {...item, time: e.target.value})
                                    }
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    value={item.event}
                                    onChange={(e) =>
                                        updateEvent(item.id, {...item, event: e.target.value})
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