import { useState, useEffect } from 'react';
import styles from './StatisticsPage.module.css';
import saveIcon from '../../img/icon-save.png';
import DutyHistogram from './DutyHistogram';

// Интерфейсы типов
interface DutyScheduleItem {
    id: number;
    date_of_dutySchedule: string;
    dutyTeamId: number;
    plannedPersonnelId: number;
    actualPersonnelId: number;
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

interface Order {
    id: number;
    dutyScheduleId: number;
    orderNumber: string;
}

const StatisticsPage = () => {
    const [mode, setMode] = useState<'changes' | 'count' | 'year'>('changes');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [schedule, setSchedule] = useState<DutyScheduleItem[]>([]);
    const [dutyTeams, setDutyTeams] = useState<DutyTeam[]>([]);
    const [personnel, setPersonnel] = useState<Personnel[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [tempOrderNumbers, setTempOrderNumbers] = useState<Record<number, string>>({});
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Состояния для отслеживания изменений
    const [editedRows, setEditedRows] = useState<Record<number, boolean>>({});
    const [selectedPerson, setSelectedPerson] = useState<number | null>(null);

    // Загрузка данных с сервера
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [teamsResponse, personnelResponse] = await Promise.all([
                    fetch('http://localhost:3001/api/duty-teams').then(res => res.json()),
                    fetch('http://localhost:3001/api/personnel').then(res => res.json())
                ]);

                const transformedPersonnel = personnelResponse.map((p: any) => ({
                    ...p,
                    dutyTeamIds: Array.isArray(p.dutyTeamIds) ? p.dutyTeamIds : [p.dutyTeamId]
                }));

                setDutyTeams(teamsResponse || []);
                setPersonnel(transformedPersonnel || []);

                if (mode === 'year') {
                    loadScheduleForYear(selectedYear);
                } else {
                    loadSchedule(selectedMonth);
                }
            } catch (error) {
                console.error('Ошибка загрузки данных:', error);
            }
        };
        fetchData();
    }, [mode, selectedMonth, selectedYear]);

    const loadScheduleForYear = async (year: number) => {
        try {
            const response = await fetch(`http://localhost:3001/api/statistics/yearly?year=${year}`);
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            const data: DutyScheduleItem[] = await response.json();
            setSchedule(data);
        } catch (error) {
            console.error('Ошибка загрузки расписания за год:', error);
        }
    };

    // Загрузка расписания за выбранный месяц
    const loadSchedule = async (month: number) => {
        try {
            const currentYear = new Date().getFullYear(); // Текущий год
            const response = await fetch(
                `http://localhost:3001/api/statistics?year=${currentYear}&month=${month}`
            );
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            const data: DutyScheduleItem[] = await response.json();
            setSchedule(data);

            // Загружаем приказы для всех записей расписания
            const scheduleIds = data.map(item => item.id);
            const ordersResponse = await fetch(
                `http://localhost:3001/api/orders?${scheduleIds.map(id => `dutyScheduleId=${id}`).join('&')}`
            );
            if (!ordersResponse.ok) {
                throw new Error(`Ошибка HTTP: ${ordersResponse.status}`);
            }
            const ordersData: Order[] = await ordersResponse.json();
            setOrders(ordersData);
        } catch (error) {
            console.error('Ошибка загрузки расписания:', error);
        }
    };

    // Обновление действительного сотрудника
    const updateActualPersonnel = async (id: number, actualPersonnelId: number) => {
        try {
            const response = await fetch(`http://localhost:3001/api/duty-schedule/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ actualPersonnelId })
            });
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            const updatedItem = await response.json();
            setSchedule(prev =>
                prev.map(item => (item.id === id ? updatedItem : item))
            );
            setEditedRows(prev => ({ ...prev, [id]: false })); // Убираем иконку сохранения
        } catch (error) {
            console.error('Ошибка обновления действительного сотрудника:', error);
        }
    };

    const loadOrders = async (scheduleIds: number[]) => {
        try {
            const ordersResponse = await fetch(
                `http://localhost:3001/api/orders?${scheduleIds.map(id => `dutyScheduleId=${id}`).join('&')}`
            );
            if (!ordersResponse.ok) {
                throw new Error(`Ошибка HTTP: ${ordersResponse.status}`);
            }
            const ordersData: Order[] = await ordersResponse.json();
            setOrders(ordersData); // Обновляем состояние orders
        } catch (error) {
            console.error('Ошибка загрузки приказов:', error);
        }
    };

    // Сохранение номера приказа
    const saveOrder = async (dutyScheduleId: number, orderNumber: string) => {
        try {
            const existingOrder = orders.find((order) => order.dutyScheduleId === dutyScheduleId);

            if (existingOrder) {
                // Обновляем существующий приказ
                await fetch(`http://localhost:3001/api/orders/${existingOrder.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderNumber }),
                });
            } else {
                // Создаем новый приказ
                await fetch('http://localhost:3001/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ dutyScheduleId, orderNumber }),
                });
            }

            // Загружаем актуальные данные с сервера
            const scheduleIds = schedule.map(item => item.id);
            await loadOrders(scheduleIds);
        } catch (error) {
            console.error('Ошибка сохранения номера приказа:', error);
        }
    };

    const YearlyDutyChart = ({
                                 selectedYear,
                                 setSelectedYear,
                                 personnel,
                                 schedule,
                             }: {
        selectedYear: number;
        setSelectedYear: (year: number) => void;
        personnel: Personnel[];
        schedule: DutyScheduleItem[];
    }) => {
        const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

        return (
            <div>
                {/* Гистограмма */}
                <DutyHistogram
                    selectedYear={selectedYear}
                    personnel={personnel}
                    schedule={schedule}
                />
            </div>
        );
    };

    return (
        <div className={styles.container}>
            {mode !== 'year' ? (
                <div className={styles.dateInput}>
                    <label>Месяц:</label>
                    <select
                        value={selectedMonth}
                        onChange={(e) => {
                            const month = Number(e.target.value);
                            setSelectedMonth(month);
                            loadSchedule(month);
                        }}
                        className={styles.datePicker}
                    >
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                                {new Date(0, i).toLocaleString('default', { month: 'long' })}
                            </option>
                        ))}
                    </select>
                </div>
            ) : (
                <div className={styles.dateInput}>
                    <label>Год:</label>
                    <select
                        value={selectedYear}
                        onChange={(e) => {
                            const year = Number(e.target.value);
                            setSelectedYear(year);
                            loadScheduleForYear(year);
                        }}
                        className={styles.datePicker}
                    >
                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Основная часть */}
            <div className={styles.content}>
                {mode === 'changes' ? (
                    // Таблица изменений
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>Дата</th>
                            <th>НДР</th>
                            <th>Запланированное ФИО</th>
                            <th>Действительное ФИО</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {schedule.map(item => {
                            const team = dutyTeams.find(t => t.id === item.dutyTeamId);
                            const plannedPerson = personnel.find(p => p.id === item.plannedPersonnelId);
                            const actualPerson = personnel.find(p => p.id === item.actualPersonnelId);

                            // Проверяем, отличаются ли запланированный и действительный сотрудники
                            const isDifferent = item.plannedPersonnelId !== item.actualPersonnelId;

                            return (
                                <tr
                                    key={item.id}
                                    className={isDifferent ? styles.highlightedRow : ''}
                                >
                                    <td>{item.date_of_dutySchedule}</td>
                                    <td>{team?.name || 'Неизвестный НДР'}</td>
                                    <td>{plannedPerson?.name || 'Неизвестный сотрудник'}</td>
                                    <td>
                                        <select
                                            value={item.actualPersonnelId}
                                            onChange={(e) => {
                                                const personnelId = Number(e.target.value);
                                                setSchedule(prev =>
                                                    prev.map(i =>
                                                        i.id === item.id
                                                            ? { ...i, actualPersonnelId: personnelId }
                                                            : i
                                                    )
                                                );
                                                setEditedRows(prev => ({ ...prev, [item.id]: true }));
                                            }}
                                        >
                                            {personnel
                                                .filter(p => p.dutyTeamIds.includes(item.dutyTeamId))
                                                .map(p => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.name}
                                                    </option>
                                                ))}
                                        </select>
                                    </td>
                                    <td>
                                        {editedRows[item.id] && (
                                            <button
                                                className={styles.saveButton}
                                                onClick={() => updateActualPersonnel(item.id, item.actualPersonnelId)}
                                            >
                                                <img src={saveIcon} alt="Сохранить" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                ) : mode === 'count' ? (
                    // Режим "Количество дежурств"
                    <div className={styles.countContainer}>
                        {/* Главная таблица */}
                        <div className={styles.mainTable}>
                            <table className={styles.table}>
                                <thead>
                                <tr>
                                    <th>ФИО</th>
                                    <th>Дежурств в месяц</th>
                                </tr>
                                </thead>
                                <tbody>
                                {personnel.map((person) => {
                                    const count = schedule.filter(item => item.actualPersonnelId === person.id).length;
                                    return (
                                        <tr
                                            key={person.id}
                                            onClick={() => setSelectedPerson(person.id)}
                                            className={selectedPerson === person.id ? styles.selectedRow : ''}
                                        >
                                            <td>{person.name}</td>
                                            <td>{count}</td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>

                        {/* Таблица деталей */}
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
                                    {schedule
                                        .filter(item => item.actualPersonnelId === selectedPerson)
                                        .map((item, index) => {
                                            const order = orders.find(o => o.dutyScheduleId === item.id);
                                            return (
                                                <tr key={item.id}>
                                                    <td>{index + 1}</td>
                                                    <td>{item.date_of_dutySchedule}</td>
                                                    <td style={{alignItems: 'center', gap: '10px'}}>
                                                        <input
                                                            value={
                                                                tempOrderNumbers[item.id] || // Используем временное состояние
                                                                orders.find((o) => o.dutyScheduleId === item.id)?.orderNumber || // Или значение из orders
                                                                ''
                                                            }
                                                            onChange={(e) => {
                                                                const newOrderNumber = e.target.value;
                                                                setTempOrderNumbers((prev) => ({
                                                                    ...prev,
                                                                    [item.id]: newOrderNumber, // Обновляем временное состояние
                                                                }));
                                                            }}
                                                            onBlur={() => {
                                                                const newOrderNumber = tempOrderNumbers[item.id];
                                                                if (newOrderNumber !== undefined) {
                                                                    saveOrder(item.id, newOrderNumber); // Отправляем запрос на сервер
                                                                    setTempOrderNumbers((prev) => {
                                                                        const updated = {...prev};
                                                                        delete updated[item.id]; // Очищаем временное состояние
                                                                        return updated;
                                                                    });
                                                                }
                                                            }}
                                                            placeholder="Введите номер приказа"
                                                            style={{flex: 1}}
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ) : mode === 'year' ? (
                    // Режим "Дежурств за год"
                    <YearlyDutyChart
                        selectedYear={selectedYear}
                        setSelectedYear={setSelectedYear}
                        personnel={personnel}
                        schedule={schedule}
                    />
                ) : null}
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
                    Количество дежурств за мес
                </button>
                <button
                    className={`${styles.menuButton} ${mode === 'year' ? styles.active : ''}`}
                    onClick={() => {
                        setMode('year');
                        setSelectedPerson(null);
                    }}
                >
                    Количество дежурств за год
                </button>
                {/*<button
                    className={styles.clearOrdersButton}
                    onClick={clearOrders}
                    title="Очистить приказы"
                >
                    <img src={deleteIcon} alt="Очистить приказы"/>
                </button>*/}
            </div>
        </div>
    );
};

export default StatisticsPage;