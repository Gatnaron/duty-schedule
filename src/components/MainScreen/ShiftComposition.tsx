import { FC, useEffect, useState } from 'react';
import styles from './ShiftComposition.module.css';
import { formatInTimeZone } from 'date-fns-tz';

interface DutyScheduleItem {
    id: number;
    date_of_dutySchedule: string;
    dutyTeamName: string; // Название НДР
    actualPersonnelName: string; // ФИО действительного сотрудника
}

interface ShiftCompositionProps {
    isCollapsed: boolean;
}

// Вспомогательная функция для преобразования ФИО в формат "Фамилия И. И."
const formatFullName = (fullName: string): string => {
    const parts = fullName.split(' ');
    if (parts.length < 2) return fullName; // Если ФИО некорректно, возвращаем как есть

    const lastName = parts[0]; // Фамилия
    const firstNameInitial = parts[1]?.charAt(0); // Первая буква имени
    const middleNameInitial = parts[2]?.charAt(0); // Первая буква отчества

    return `${lastName} ${firstNameInitial || ''}${firstNameInitial ? '.' : ''} ${
        middleNameInitial || ''
    }${middleNameInitial ? '.' : ''}`;
};

const ShiftComposition: FC<ShiftCompositionProps> = ({ isCollapsed }) => {
    const [dutySchedule, setDutySchedule] = useState<DutyScheduleItem[]>([]);

    // Загрузка данных о текущем дежурстве
    useEffect(() => {
        const fetchDutySchedule = async () => {
            try {
                const now = new Date();
                const moscowTime = formatInTimeZone(now, 'Europe/Moscow', 'yyyy-MM-dd HH:mm');

                const currentHour = now.getHours();
                const currentMinute = now.getMinutes();

                let dutyDate;

                if (currentHour < 9 || (currentHour === 9 && currentMinute < 30)) {
                    // До 9:30 - используем вчерашнюю дату
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    dutyDate = formatInTimeZone(yesterday, 'Europe/Moscow', 'yyyy-MM-dd');
                } else {
                    // После 9:30 - используем текущую дату
                    dutyDate = formatInTimeZone(now, 'Europe/Moscow', 'yyyy-MM-dd');
                }

                console.log('Дата для запроса:', dutyDate);

                const response = await fetch(`http://localhost:3001/api/shift-composition?date=${dutyDate}`);
                if (!response.ok) throw new Error('Ошибка загрузки данных');

                const data = await response.json();
                console.log('Данные с сервера:', data);

                setDutySchedule(data);
            } catch (error) {
                console.error('Ошибка загрузки данных:', error);
            }
        };
        fetchDutySchedule();
    }, []);

    return (
        <div className={`${styles.container} ${isCollapsed ? styles.collapsed : ''}`}>
            <h3 className={styles.title}>Состав смены</h3>
            <table className={styles.table}>
                <thead>
                <tr>
                    <th>НДР</th>
                    <th>ФИО</th>
                </tr>
                </thead>
                <tbody>
                {dutySchedule.length > 0 ? (
                    dutySchedule.map((item, index) => (
                        <tr key={index}>
                            <td className={styles.ndr}>{item.dutyTeamName}</td>
                            <td className={styles.name}>
                                {item.actualPersonnelName
                                    ? formatFullName(item.actualPersonnelName)
                                    : 'Не назначен'}
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={2}>Нет данных о дежурстве</td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
};

export default ShiftComposition;