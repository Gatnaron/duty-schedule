import { useState } from 'react';
import styles from './ScheduleEditor.module.css';

const ScheduleEditor = () => {
    const [schedule, setSchedule] = useState([
        { time: '08:00', event: 'Построение' },
        { time: '09:00', event: 'Инструктаж' }
    ]);

    return (
        <div className={styles.container}>
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                    <tr>
                        <th>Время</th>
                        <th>Мероприятие</th>
                    </tr>
                    </thead>
                    <tbody>
                    {schedule.map((item, index) => (
                        <tr key={index}>
                            <td>
                                <input
                                    type="text"
                                    value={item.time}
                                    onChange={(e) => {
                                        const newData = [...schedule];
                                        newData[index].time = e.target.value;
                                        setSchedule(newData);
                                    }}
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    value={item.event}
                                    onChange={(e) => {
                                        const newData = [...schedule];
                                        newData[index].event = e.target.value;
                                        setSchedule(newData);
                                    }}
                                />
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Кнопка сохранения */}
            <div className={styles.controls}>
                <button className={styles.saveButton}>
                    Сохранить изменения
                </button>
            </div>
        </div>
    );
};

export default ScheduleEditor;