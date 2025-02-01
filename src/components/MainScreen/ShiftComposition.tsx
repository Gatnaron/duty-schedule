import { FC } from 'react';
import styles from './ShiftComposition.module.css';

interface ShiftCompositionProps {
    isCollapsed: boolean;
}

const ShiftComposition: FC<ShiftCompositionProps> = ({ isCollapsed }) => {
    // Моковые данные
    const shiftData = [
        { ndr: "НДР-12", name: "Иванов А.А." },
        { ndr: "НДР-15", name: "Петров В.В." }
    ];

    return (
        <div className={`${styles.container} ${isCollapsed ? styles.collapsed : ''}`}>
            <h3 className={styles.title}>Состав смены</h3>
            <table className={styles.table}>
                <tbody>
                {shiftData.map((item, index) => (
                    <tr key={index}>
                        <td className={styles.ndr}>{item.ndr}</td>
                        <td className={styles.name}>{item.name}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default ShiftComposition;