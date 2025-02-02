import { FC, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/MainScreen/Sidebar';
import styles from './MainLayout.module.css';

interface MainLayoutProps {
    children?: React.ReactNode; // Добавляем поддержку children
}

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
    const [isMenuExpanded, setIsMenuExpanded] = useState(false);

    return (
        <div className={styles.container}>
            <Sidebar
                isExpanded={isMenuExpanded}
                onToggle={setIsMenuExpanded}
            />
            <div className={`${styles.content} ${isMenuExpanded ? styles.expanded : ''}`}>
                {children || <Outlet />} {/* Поддержка children и Outlet */}
            </div>
        </div>
    );
};

export default MainLayout;