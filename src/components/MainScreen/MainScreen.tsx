import { useState } from 'react';
import styles from './MainScreen.module.css';
import Sidebar from './Sidebar';
import ShiftComposition from './ShiftComposition';
import MainContent from './MainContent';

const MainScreen = () => {
    const [isMenuExpanded, setIsMenuExpanded] = useState(false);

    return (
        <div className={styles.container}>
            <Sidebar
                isExpanded={isMenuExpanded}
                onToggle={setIsMenuExpanded}
            />

            <div className={`${styles.mainContent} ${isMenuExpanded ? styles.expanded : ''}`}>
                <MainContent />
            </div>

            <ShiftComposition isCollapsed={isMenuExpanded} />
        </div>
    );
};

export default MainScreen;