import { useState } from 'react';
import styles from './DatabaseManager.module.css';

const DatabaseManager = () => {
    const [combatPosts, setCombatPosts] = useState([
        { id: 1, name: 'БП-1' },
        { id: 2, name: 'БП-2' }
    ]);

    const [dutyTeams, setDutyTeams] = useState([
        { id: 1, name: 'НДР-1', postId: 1 },
        { id: 2, name: 'НДР-2', postId: 2 }
    ]);

    const [personnel, setPersonnel] = useState([
        { id: 1, teamId: 1, rank: 'Сержант', name: 'Иванов И.И.' }
    ]);

    return (
        <div className={styles.container}>
            <div className={styles.tablesContainer}>
                {/* Таблица БП */}
                <div className={styles.tableSection}>
                    <h3>БП</h3>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>№</th>
                            <th>Название</th>
                        </tr>
                        </thead>
                        <tbody>
                        {combatPosts.map(post => (
                            <tr key={post.id}>
                                <td>{post.id}</td>
                                <td>
                                    <input
                                        type="text"
                                        value={post.name}
                                        onChange={(e) => {
                                            const newPosts = [...combatPosts];
                                            newPosts[post.id - 1].name = e.target.value;
                                            setCombatPosts(newPosts);
                                        }}
                                    />
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Таблица НДР */}
                <div className={styles.tableSection}>
                    <h3>НДР</h3>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>№</th>
                            <th>Название</th>
                            <th>БП</th>
                        </tr>
                        </thead>
                        <tbody>
                        {dutyTeams.map(team => (
                            <tr key={team.id}>
                                <td>{team.id}</td>
                                <td>
                                    <input
                                        type="text"
                                        value={team.name}
                                        onChange={(e) => {
                                            const newTeams = [...dutyTeams];
                                            newTeams[team.id - 1].name = e.target.value;
                                            setDutyTeams(newTeams);
                                        }}
                                    />
                                </td>
                                <td>
                                    <select
                                        value={team.postId}
                                        onChange={(e) => {
                                            const newTeams = [...dutyTeams];
                                            newTeams[team.id - 1].postId = Number(e.target.value);
                                            setDutyTeams(newTeams);
                                        }}
                                    >
                                        {combatPosts.map(post => (
                                            <option key={post.id} value={post.id}>
                                                {post.name}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Таблица Состав */}
                <div className={styles.tableSection}>
                    <h3>Состав</h3>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>№</th>
                            <th>НДР</th>
                            <th>Звание</th>
                            <th>ФИО</th>
                        </tr>
                        </thead>
                        <tbody>
                        {personnel.map(employee => (
                            <tr key={employee.id}>
                                <td>{employee.id}</td>
                                <td>
                                    <select
                                        value={employee.teamId}
                                        onChange={(e) => {
                                            const newPersonnel = [...personnel];
                                            newPersonnel[employee.id - 1].teamId = Number(e.target.value);
                                            setPersonnel(newPersonnel);
                                        }}
                                    >
                                        {dutyTeams.map(team => (
                                            <option key={team.id} value={team.id}>
                                                {team.name}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={employee.rank}
                                        onChange={(e) => {
                                            const newPersonnel = [...personnel];
                                            newPersonnel[employee.id - 1].rank = e.target.value;
                                            setPersonnel(newPersonnel);
                                        }}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={employee.name}
                                        onChange={(e) => {
                                            const newPersonnel = [...personnel];
                                            newPersonnel[employee.id - 1].name = e.target.value;
                                            setPersonnel(newPersonnel);
                                        }}
                                    />
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Кнопка сохранения */}
            <div className={styles.controls}>
                <button className={styles.saveButton}>
                    Сохранить изменения
                </button>
            </div>
        </div>
    );
};

export default DatabaseManager;