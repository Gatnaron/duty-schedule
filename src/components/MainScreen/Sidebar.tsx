import { FC } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
    path: string;
}

interface SidebarProps {
    isExpanded: boolean;
    onToggle: (expanded: boolean) => void;
}

const menuItems: MenuItem[] = [
    { id: 1, icon: img1, label: "График", path: "/graph" },
    { id: 2, icon: img2, label: "Статистика", path: "/stats" },
    { id: 3, icon: img3, label: "Расписание", path: "/schedule" },
    { id: 4, icon: img4, label: "База", path: "/database" }
];

const Sidebar: FC<SidebarProps> = ({ isExpanded, onToggle }) => {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <div
            className={`${styles.sidebar} ${isExpanded ? styles.expanded : ''}`}
            onMouseEnter={() => onToggle(true)}
            onMouseLeave={() => onToggle(false)}
            style={{
                width: isExpanded ? "380px" : "112px",
                transition: 'width 0.3s ease'
            }}
        >
            <div
                className={styles.logoContainer}
                onClick={() => navigate('/')}
                style={{ cursor: 'pointer' }}
            >
                <img src={logo} alt="Логотип" className={styles.logo} />
                {isExpanded && (
                    <img src={logoExpanded} alt="Логотип" className={styles.logoExpanded}/>
                )}
            </div>

            <nav className={styles.nav}>
                {menuItems.map((item) => (
                    <NavLink
                        key={item.id}
                        to={item.path}
                        className={`${styles.menuItem} ${
                            location.pathname === item.path ? styles.active : ''
                        }`}
                        style={{ textDecoration: 'none' }}
                    >
                        <img src={item.icon} alt={item.label} className={styles.icon} />
                        {isExpanded && <span className={styles.label}>{item.label}</span>}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;