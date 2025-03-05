import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Регистрация компонентов Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Personnel {
    id: number;
    name: string;
}

interface DutyScheduleItem {
    id: number;
    date_of_dutySchedule: string; // Формат: YYYY-MM-DD
    plannedPersonnelId: number;
    actualPersonnelId: number;
}

const DutyHistogram = ({
                           selectedYear,
                           personnel,
                           schedule,
                       }: {
    selectedYear: number;
    personnel: Personnel[];
    schedule: DutyScheduleItem[];
}) => {
    // Фильтруем расписание за выбранный год
    const filteredSchedule = schedule.filter((item) =>
        item.date_of_dutySchedule.startsWith(`${selectedYear}-`)
    );

    // Подготовка данных для графика
    const chartData = {
        labels: personnel.map((p) => p.name), // ФИО сотрудников
        datasets: [
            {
                label: 'Запланировано',
                data: personnel.map((p) =>
                    filteredSchedule.filter((s) => s.plannedPersonnelId === p.id).length
                ),
                backgroundColor: 'rgba(0,0,255,0.5)', // Синий цвет
            },
            {
                label: 'Действительно',
                data: personnel.map((p) =>
                    filteredSchedule.filter((s) => s.actualPersonnelId === p.id).length
                ),
                backgroundColor: 'rgba(255,0,0,0.5)', // Красный цвет
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: `Дежурства за ${selectedYear} год`,
            },
        },
        scales: {
            x: {
                stacked: false,
                title: {
                    display: true,
                    text: 'ФИО сотрудников',
                },
            },
            y: {
                stacked: false,
                title: {
                    display: true,
                    text: 'Количество дежурств',
                },
            },
        },
    };

    return <Bar data={chartData} options={chartOptions} />;
};

export default DutyHistogram;