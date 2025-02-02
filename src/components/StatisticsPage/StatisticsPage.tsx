import { useState } from 'react';
import styles from './StatisticsPage.module.css';

// Интерфейсы для типизации данных
interface ChangeData {
    id: number;
    date: string;
    ndr: string;
    planned: string;
    actual: string;
}

interface DutyCount {
    id: number;
    name: string;
    count: number;
}

interface DutyDetail {
    id: number;
    date: string;
    order: string;
    personId: number;
}

const StatisticsPage = () => {
    const [mode, setMode] = useState<'changes' | 'count'>('changes');
    const [selectedPerson, setSelectedPerson] = useState<number | null>(null);

    // Состояния для данных
    const [editableChanges, setEditableChanges] = useState<ChangeData[]>([
        { id: 1, date: '01.05.2024', ndr: 'НДР-1', planned: 'Иванов И.И.', actual: 'Петров П.П.' },
        { id: 2, date: '02.05.2024', ndr: 'НДР-2', planned: 'Сидоров С.С.', actual: 'Сидоров С.С.' },
    ]);

    const [editableCounts, setEditableCounts] = useState<DutyCount[]>([
        { id: 1, name: 'Иванов И.И.', count: 5 },
        { id: 2, name: 'Петров П.П.', count: 3 },
    ]);

    const [dutyDetails, setDutyDetails] = useState<DutyDetail[]>([
        { id: 1, date: '01.05.2024', order: '123', personId: 1 },
        { id: 2, date: '05.05.2024', order: '124', personId: 2 },
    ]);

    return (
        <div className={styles.container}>
            {/* Центральная часть */}
            <div className={styles.content}>
                {mode === 'changes' ? (
                    // Таблица изменений
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                            <tr>
                                <th>Дата</th>
                                <th>НДР</th>
                                <th>Запланированное ФИО</th>
                                <th>Действительное ФИО</th>
                            </tr>
                            </thead>
                            <tbody>
                            {editableChanges.map((item) => (
                                <tr
                                    key={item.id}
                                    className={item.planned !== item.actual ? styles.highlighted : ''}
                                >
                                    <td>
                                        <input
                                            type="text"
                                            value={item.date}
                                            onChange={(e) => {
                                                const newData = editableChanges.map(change =>
                                                    change.id === item.id ? {...change, date: e.target.value} : change
                                                );
                                                setEditableChanges(newData);
                                            }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={item.ndr}
                                            onChange={(e) => {
                                                const newData = editableChanges.map(change =>
                                                    change.id === item.id ? {...change, ndr: e.target.value} : change
                                                );
                                                setEditableChanges(newData);
                                            }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={item.planned}
                                            onChange={(e) => {
                                                const newData = editableChanges.map(change =>
                                                    change.id === item.id ? {...change, planned: e.target.value} : change
                                                );
                                                setEditableChanges(newData);
                                            }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={item.actual}
                                            onChange={(e) => {
                                                const newData = editableChanges.map(change =>
                                                    change.id === item.id ? {...change, actual: e.target.value} : change
                                                );
                                                setEditableChanges(newData);
                                            }}
                                        />
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    // Таблицы количества дежурств
                    <div className={styles.countContainer}>
                        <div className={styles.mainTable}>
                            <table className={styles.table}>
                                <thead>
                                <tr>
                                    <th>ФИО</th>
                                    <th>Дежурств в месяц</th>
                                </tr>
                                </thead>
                                <tbody>
                                {editableCounts.map((item) => (
                                    <tr
                                        key={item.id}
                                        onClick={() => setSelectedPerson(item.id)}
                                        className={selectedPerson === item.id ? styles.selectedRow : ''}
                                    >
                                        <td>
                                            <input
                                                type="text"
                                                value={item.name}
                                                onChange={(e) => {
                                                    const newData = editableCounts.map(count =>
                                                        count.id === item.id ? {...count, name: e.target.value} : count
                                                    );
                                                    setEditableCounts(newData);
                                                }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                value={item.count}
                                                onChange={(e) => {
                                                    const newData = editableCounts.map(count =>
                                                        count.id === item.id ? {...count, count: Number(e.target.value)} : count
                                                    );
                                                    setEditableCounts(newData);
                                                }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {selectedPerson && (
                            <div className={styles.detailsTable}>
                                <table className={styles.table}>
                                    <thead>
                                    <tr>
                                        <th>№</th>
                                        <th>Дата</th>
                                        <th>№ приказа</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {dutyDetails
                                        .filter(d => d.personId === selectedPerson)
                                        .map((item) => (
                                            <tr key={item.id}>
                                                <td>{item.id}</td>
                                                <td>{item.date}</td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        value={item.order}
                                                        onChange={(e) => {
                                                            const newData = dutyDetails.map(detail =>
                                                                detail.id === item.id ? {...detail, order: e.target.value} : detail
                                                            );
                                                            setDutyDetails(newData);
                                                        }}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Правое меню */}
            <div className={styles.sideMenu}>
                <button
                    className={`${styles.menuButton} ${mode === 'changes' ? styles.active : ''}`}
                    onClick={() => {
                        setMode('changes');
                        setSelectedPerson(null);
                    }}
                >
                    Изменения/Замены
                </button>
                <button
                    className={`${styles.menuButton} ${mode === 'count' ? styles.active : ''}`}
                    onClick={() => {
                        setMode('count');
                        setSelectedPerson(null);
                    }}
                >
                    Кол-во дежурств
                </button>
                <button
                    className={styles.saveButton}
                    onClick={() => alert('Функционал сохранения пока не реализован')}
                >
                    Сохранить изменения
                </button>
            </div>
        </div>
    );
};

export default StatisticsPage;