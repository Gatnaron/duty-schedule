import React from 'react';
import styles from './MainContent.module.css';
import editIcon from '../../img/edit_icon.png';
import addPlus from '../../img/add-plus.png';

const MainContent = () => {
    return (
        <div className={styles.container}>
            {/* Блок времени */}
            <div className={styles.timeSection}>
                <div className={styles.time}>14:30</div>
                <div className={styles.date}>29.01.2025</div>
                <div className={styles.divider}></div>
            </div>

            {/* Основной контент */}
            <div className={styles.contentWrapper}>
                {/* Левая колонка */}
                <div className={styles.leftColumn}>
                    <div className={styles.eventBlock}>
                        <div className={styles.eventTop}>
                            <div className={styles.eventTitle}>
                                <h2>ТЕКУЩЕЕ МЕРОПРИЯТИЕ</h2>
                            </div>
                            <div className={styles.divider}></div>
                            <div className={styles.currentEvent}>Проверка связи</div>
                        </div>

                        <div className={styles.fullDivider}></div>

                        <div className={styles.eventBottom}>
                            <div className={styles.eventTitle}>
                                <h2>СЛЕДУЮЩЕЕ МЕРОПРИЯТИЕ</h2>
                            </div>
                            <div className={styles.divider}></div>
                            <div className={styles.nextEvent}>
                                Совещание
                                <span className={styles.eventTime}>15:00</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.notesBlock}>
                        <div className={styles.tasksTitle}>
                            <h2>ЗАДАЧИ НА СЕГОДНЯ</h2>
                        </div>
                        <textarea
                            className={styles.notesInput}
                            placeholder="Введите задачи..."
                        />
                    </div>
                </div>

                {/* Правая колонка (ЗВКС) */}
                <div className={styles.zvksBlock}>
                    <div className={styles.zvksHeader}>
                    <h3>ЗВКС</h3>
                        <button className={styles.addButton}>
                            <img src={addPlus} alt="Добавить"/>
                        </button>
                    </div>
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className={styles.zvksItem}>
                            <div className={styles.zvksContent}>
                                <div className={styles.zvksRow}>
                                    <span>кто:</span>
                                    <strong>Командир Иванов А.А.</strong>
                                    <span>- с кем:</span>
                                    <strong>Связист Петров В.В.</strong>
                                </div>
                                <div className={styles.zvksRow}>
                                    <span>время связиста: 14:3{i}</span>
                                    <span>- время командира: 15:0{i}</span>
                                </div>
                            </div>
                            <button className={styles.editButton}>
                                <img src={editIcon} alt="Редактировать"/>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
export default MainContent; // Корректный экспорт