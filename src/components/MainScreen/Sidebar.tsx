import { FC } from 'react';
import styles from './Sidebar.module.css';
import logo from '../../img/logo.png';
import logoExpanded from '../../img/logo2.png';
import img1 from '../../img/img-1.png';
import img2 from '../../img/img-2.png';
import img3 from '../../img/img-3.png';
import img4 from '../../img/img-4.png';


interface MenuItem {
    id: number;
    icon: string;
    label: string;
}

interface SidebarProps {
    isExpanded: boolean;
    onToggle: (expanded: boolean) => void;
}

const menuItems: MenuItem[] = [
    { id: 1, icon: img1, label: "Создать график" },
    { id: 2, icon: img2, label: "Посмотреть статистику" },
    { id: 3, icon: img3, label: "Изменить расписание" },
    { id: 4, icon: img4, label: "Создать базу" }
];

const Sidebar: FC<SidebarProps> = ({ isExpanded, onToggle }) => {
    return (
        <div
            className={`${styles.sidebar} ${isExpanded ? styles.expanded : ''}`}
            onMouseEnter={() => onToggle(true)}
            onMouseLeave={() => onToggle(false)}
            style={{
                width: isExpanded ? "380px" : "102px",
                transition: 'width 0.3s ease'
            }}
        >
            <div className={styles.logoContainer}>
                <img src={logo} alt="Логотип" className={styles.logo}/>
                {isExpanded && (
                    <img src={logoExpanded} alt="Логотип" className={styles.logoExpanded}/>
                )}
            </div>

            <nav className={styles.nav}>
                {menuItems.map((item) => (
                    <button key={item.id} className={styles.menuItem}>
                        <img src={item.icon} alt={item.label} className={styles.icon} />
                        {isExpanded && <span className={styles.label}>{item.label}</span>}
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;