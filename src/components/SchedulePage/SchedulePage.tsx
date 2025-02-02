import { useState } from 'react';
import styles from './SchedulePage.module.css';
import addPlus from "../../img/add-plus.png";

const SchedulePage = () => {
    const [mode, setMode] = useState<'create' | 'edit'>('create');
    const [date, setDate] = useState('');
    const [schedule, setSchedule] = useState([
        { id: 1, ndr: 'НДР-1', name: 'Иванов И.И.' },
        { id: 2, ndr: 'НДР-2', name: 'Петров П.П.' }
    ]);

    // Моковые данные для НДР
    const ndrOptions = ['НДР-1', 'НДР-2', 'НДР-3', 'НДР-4'];

    return (
        <div className={styles.container}>
            {/* Центральная часть */}
            <div className={styles.content}>
                {/* Поле ввода даты */}
                <div className={styles.dateInput}>
                    <label>Дата:</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className={styles.datePicker}
                    />
                </div>

                {/* Таблица графика */}
                <table className={styles.table}>
                    <thead>
                    <tr>
                        <th>НДР</th>
                        <th>ФИО</th>
                    </tr>
                    </thead>
                    <tbody>
                    {schedule.map((item) => (
                        <tr key={item.id}>
                            <td>
                                <select
                                    value={item.ndr}
                                    onChange={(e) => {
                                        const newSchedule = [...schedule];
                                        newSchedule[item.id - 1].ndr = e.target.value;
                                        setSchedule(newSchedule);
                                    }}
                                    className={styles.select}
                                >
                                    {ndrOptions.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </td>
                            <td>
                                <select className={styles.select}>
                                    <option value={item.name}>{item.name}</option>
                                    <option value="Сидоров С.С.">Сидоров С.С.</option>
                                    <option value="Козлов К.К.">Козлов К.К.</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                    <tfoot>
                    <tr>
                        <td colSpan={2} style={{textAlign: 'center'}}>
                            <button
                                className={styles.addButton}
                                onClick={() => {
                                    setSchedule([...schedule, {id: schedule.length + 1, ndr: '', name: ''}]);
                                }}
                            >
                                <img src={addPlus} alt="Добавить"/>
                            </button>
                        </td>
                    </tr>
                    </tfoot>
                </table>
            </div>

            {/* Правое меню */}
            <div className={styles.sideMenu}>
                <button
                    className={`${styles.menuButton} ${mode === 'create' ? styles.active : ''}`}
                    onClick={() => setMode('create')}
                >
                    Создать
                </button>
                <button
                    className={`${styles.menuButton} ${mode === 'edit' ? styles.active : ''}`}
                    onClick={() => setMode('edit')}
                >
                    Изменить
                </button>
                <div className={styles.controls}>
                    <button className={styles.saveButton}>
                        Сохранить изменения
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SchedulePage;