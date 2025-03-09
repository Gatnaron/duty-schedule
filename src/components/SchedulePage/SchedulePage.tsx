import { useState, useEffect } from 'react';
import styles from './SchedulePage.module.css';
import addPlus from '../../img/add-plus.png';
import saveIcon from '../../img/icon-save.png';
import deleteIcon from '../../img/icon-delete.png';

// Интерфейсы типов
interface ScheduleItem {
    id: number;
    date_of_dutySchedule: string; // Формат: YYYY-MM-DD
    dutyTeamId: number;
    plannedPersonnelId: number; // Запланированный сотрудник
}

interface DutyTeam {
    id: number;
    name: string;
}

interface Personnel {
    id: number;
    name: string;
    dutyTeamIds: number[];
}

const SchedulePage = () => {
    const [mode, setMode] = useState<'create' | 'edit'>('create');
    const [date, setDate] = useState('');
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
    const [dutyTeams, setDutyTeams] = useState<DutyTeam[]>([]);
    const [personnel, setPersonnel] = useState<Personnel[]>([]);
    const [selectedDutyTeamId, setSelectedDutyTeamId] = useState<number | null>(null);
    const [selectedPersonnelId, setSelectedPersonnelId] = useState<number | null>(null);
    const [editingItemId, setEditingItemId] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');

    // Загрузка данных с сервера
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [teamsResponse, personnelResponse] = await Promise.all([
                    fetch('http://localhost:3001/api/duty-teams').then(res => res.json()),
                    fetch('http://localhost:3001/api/personnel').then(res => res.json())
                ]);
                setDutyTeams(teamsResponse || []);
                setPersonnel(personnelResponse || []);
            } catch (error) {
                console.error('Ошибка загрузки данных:', error);
            }
        };
        fetchData();
    }, []);

    // Загрузка расписания по выбранной дате
    useEffect(() => {
        if (!date) return;
        const fetchSchedule = async () => {
            try {
                const response = await fetch(`http://localhost:3001/api/duty-schedule?date=${date}`);
                if (!response.ok) {
                    throw new Error(`Ошибка HTTP: ${response.status}`);
                }
                const data: ScheduleItem[] = await response.json();
                setSchedule(data);
            } catch (error) {
                console.error('Ошибка загрузки расписания:', error);
            }
        };
        fetchSchedule();
    }, [date]);

    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => {
                setErrorMessage('');
            }, 3000); // 3 секунды

            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    const filteredPersonnel = selectedDutyTeamId
        ? personnel.filter(p => p.dutyTeamIds.includes(selectedDutyTeamId))
        : [];

    const isDuplicate = (date: string, personnelId: number): boolean => {
        return schedule.some(
            item =>
                item.date_of_dutySchedule === date &&
                item.plannedPersonnelId === personnelId
        );
    };

    // Добавление или обновление записи
    const handleSave = async () => {
        if (!selectedDutyTeamId || !selectedPersonnelId) return;
        if (isDuplicate(date, selectedPersonnelId)) {
            setErrorMessage('Сотрудник уже дежурит в эту дату под другим НДР');
            return;
        }
        try {
            const body = {
                date_of_dutySchedule: date,
                dutyTeamId: selectedDutyTeamId,
                plannedPersonnelId: selectedPersonnelId // Используем plannedPersonnelId
            };
            let response;
            if (mode === 'create') {
                response = await fetch('http://localhost:3001/api/duty-schedule', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
            } else {
                response = await fetch(`http://localhost:3001/api/duty-schedule/${editingItemId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...body, id: editingItemId })
                });
            }
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            const updatedItem = await response.json();
            setSchedule(prev =>
                mode === 'create'
                    ? [...prev, updatedItem]
                    : prev.map(item => (item.id === editingItemId ? updatedItem : item))
            );
            // Сброс формы
            setSelectedDutyTeamId(null);
            setSelectedPersonnelId(null);
            setEditingItemId(null);
            setMode('create');
        } catch (error) {
            console.error('Ошибка сохранения записи:', error);
            setErrorMessage('Ошибка при сохранении записи');
        }
    };

    // Редактирование строки
    const handleEdit = (item: ScheduleItem) => {
        setSelectedDutyTeamId(item.dutyTeamId);
        setSelectedPersonnelId(item.plannedPersonnelId); // Используем plannedPersonnelId
        setEditingItemId(item.id);
        setMode('edit');
    };

    // Удаление строки
    const handleDelete = async (id: number) => {
        try {
            const response = await fetch(`http://localhost:3001/api/duty-schedule/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            setSchedule(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error('Ошибка удаления записи:', error);
        }
    };

    return (
        <>
            {errorMessage && (
                <div className={styles.errorMessage}>{errorMessage}</div>
            )}
            <div className={styles.container}>
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

                {/* Блок выбора НДР и сотрудника */}
                <div className={styles.formContainer}>
                    <select
                        value={selectedDutyTeamId || ''}
                        onChange={(e) => setSelectedDutyTeamId(Number(e.target.value))}
                        className={styles.select}
                    >
                        <option value="">Выберите НДР</option>
                        {dutyTeams.map(team => (
                            <option key={team.id} value={team.id}>
                                {team.name}
                            </option>
                        ))}
                    </select>
                    <select
                        value={selectedPersonnelId || ''}
                        onChange={(e) => setSelectedPersonnelId(Number(e.target.value))}
                        className={styles.select}
                    >
                        <option value="">Выберите сотрудника</option>
                        {filteredPersonnel.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                    <button className={styles.addButton} onClick={handleSave}>
                        <img src={mode === 'create' ? addPlus : saveIcon} alt="Сохранить" />
                    </button>
                    {mode === 'edit' && (
                        <button className={styles.deleteButton} onClick={() => handleDelete(editingItemId!)}>
                            <img src={deleteIcon} alt="Удалить" />
                        </button>
                    )}
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
                    {schedule.map(item => {
                        const team = dutyTeams.find(t => t.id === item.dutyTeamId);
                        const plannedPerson = personnel.find(p => p.id === item.plannedPersonnelId);

                        return (
                            <tr key={item.id} onClick={() => handleEdit(item)}>
                                <td>{team?.name}</td>
                                <td>{plannedPerson?.name || 'Неизвестный сотрудник'}</td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default SchedulePage;