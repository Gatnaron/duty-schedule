import { useState, useEffect } from 'react';
import styles from './DatabaseManager.module.css';
import saveIcon from '../../img/icon-save.png';

// Интерфейсы типов
interface CombatPost {
    id: number;
    name: string;
}

interface DutyTeam {
    id: number;
    name: string;
    postId: number;
}

interface Rank {
    id: number;
    name: string;
}

interface Personnel {
    id?: number;
    name: string;
    rankId: number;
    dutyTeamId: number;
}

const DatabaseManager = () => {
    const [combatPosts, setCombatPosts] = useState<CombatPost[]>([]);
    const [dutyTeams, setDutyTeams] = useState<DutyTeam[]>([]);
    const [ranks, setRanks] = useState<Rank[]>([]);
    const [personnel, setPersonnel] = useState<Personnel[]>([]);
    // Формы для добавления новых записей
    const [newCombatPost, setNewCombatPost] = useState('');
    const [newDutyTeam, setNewDutyTeam] = useState({ name: '', postId: 1 });
    const [newPersonnel, setNewPersonnel] = useState({
        name: '',
        rankId: 1,
        dutyTeamId: 1
    });

    // Загрузка данных
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [posts, teams, ranksData, personnelData] = await Promise.all([
                    fetch('http://localhost:3001/api/combat-posts').then(res => res.json()),
                    fetch('http://localhost:3001/api/duty-teams').then(res => res.json()),
                    fetch('http://localhost:3001/api/ranks').then(res => res.json()),
                    fetch('http://localhost:3001/api/personnel').then(res => res.json())
                ]);

                setCombatPosts(posts || []);
                setDutyTeams(teams || []);
                setRanks(ranksData || []);
                setPersonnel(personnelData || []);
            } catch (error) {
                console.error('Ошибка загрузки данных:', error);
            }
        };

        fetchData();
    }, []);

    // Обработчики добавления
    const addCombatPost = async () => {
        if (!newCombatPost) return;

        try {
            const response = await fetch('http://localhost:3001/api/combat-posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCombatPost })
            });

            const createdPost = await response.json();
            setCombatPosts([...combatPosts, createdPost]);
            setNewCombatPost('');
        } catch (error) {
            console.error('Ошибка добавления БП:', error);
        }
    };

    const addDutyTeam = async () => {
        if (!newDutyTeam.name) return;

        try {
            const response = await fetch('http://localhost:3001/api/duty-teams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newDutyTeam)
            });

            const createdTeam = await response.json();
            setDutyTeams([...dutyTeams, createdTeam]);
            setNewDutyTeam({ name: '', postId: 1 });
        } catch (error) {
            console.error('Ошибка добавления НДР:', error);
        }
    };

    const addPersonnel = async () => {
        if (!newPersonnel.name || !newPersonnel.rankId || !newPersonnel.dutyTeamId) return;
        try {
            const response = await fetch('http://localhost:3001/api/personnel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPersonnel)
            });
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            const createdPerson = await response.json();
            setPersonnel([...personnel, createdPerson]);
            setNewPersonnel({ name: '', rankId: 1, dutyTeamId: 1 }); // Обновляем состояние
        } catch (error) {
            console.error('Ошибка добавления сотрудника:', error);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.tablesContainer}>
                {/* Блок БП */}
                <div className={styles.tableSection}>
                    <div className={styles.tableHeader}>
                        <h3>БП</h3>
                        <div className={styles.addForm}>
                            <input
                                type="text"
                                value={newCombatPost}
                                onChange={e => setNewCombatPost(e.target.value)}
                                placeholder="Название БП"
                            />
                            <button onClick={addCombatPost}>
                                <img src={saveIcon} alt="Добавить"/>
                            </button>
                        </div>
                    </div>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>№</th>
                            <th>Название</th>
                        </tr>
                        </thead>
                        <tbody>
                        {combatPosts?.map(post => (
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
                    <div className={styles.tableHeader}>
                        <h3>НДР</h3>
                        <div className={styles.addForm}>
                            <input
                                type="text"
                                value={newDutyTeam.name}
                                onChange={e => setNewDutyTeam({...newDutyTeam, name: e.target.value})}
                                placeholder="Название НДР"
                            />
                            <select
                                value={newDutyTeam.postId}
                                onChange={e => setNewDutyTeam({...newDutyTeam, postId: Number(e.target.value)})}
                            >
                                {combatPosts?.map(post => (
                                    <option key={post.id} value={post.id}>
                                        {post.name}
                                    </option>
                                ))}
                            </select>
                            <button onClick={addDutyTeam}>
                                <img src={saveIcon} alt="Добавить"/>
                            </button>
                        </div>
                    </div>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>№</th>
                            <th>Название</th>
                            <th>БП</th>
                        </tr>
                        </thead>
                        <tbody>
                        {dutyTeams?.map(team => (
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
                                        {combatPosts?.map(post => (
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
                    <div className={styles.tableHeader}>
                        <h3>Состав</h3>
                        <div className={styles.addForm}>
                            <input
                                type="text"
                                value={newPersonnel.name}
                                onChange={e => setNewPersonnel({...newPersonnel, name: e.target.value})}
                                placeholder="ФИО"
                            />
                            <select
                                value={newPersonnel.rankId}
                                onChange={e => setNewPersonnel({...newPersonnel, rankId: Number(e.target.value)})}
                            >
                                {ranks?.map(rank => (
                                    <option key={rank.id} value={rank.id}>
                                        {rank.name}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={newPersonnel.dutyTeamId}
                                onChange={(e) =>
                                    setNewPersonnel({
                                        ...newPersonnel,
                                        dutyTeamId: Number(e.target.value) // Преобразуем значение в число
                                    })
                                }
                            >
                                {dutyTeams?.map(team => (
                                    <option key={team.id} value={team.id}>
                                        {team.name}
                                    </option>
                                ))}
                            </select>
                            <button onClick={addPersonnel}>
                                <img src={saveIcon} alt="Добавить"/>
                            </button>
                        </div>
                    </div>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                        <th>№</th>
                            <th>ФИО</th>
                            <th>Звание</th>
                            <th>НДР</th>
                        </tr>
                        </thead>
                        <tbody>
                        {personnel?.map(employee => (
                            <tr key={employee.id}>
                                <td>{employee.id}</td>

                                {/* ФИО */}
                                <td>
                                    <input
                                        type="text"
                                        value={employee.name}
                                        onChange={(e) => {
                                            const updatedPersonnel = personnel?.map(p =>
                                                p.id === employee.id ? {...p, name: e.target.value} : p
                                            );
                                            setPersonnel(updatedPersonnel);
                                        }}
                                    />
                                </td>

                                {/* Звание */}
                                <td>
                                    <select
                                        value={employee.rankId}
                                        onChange={(e) => {
                                            const updatedPersonnel = personnel?.map(p =>
                                                p.id === employee.id ? {...p, rankId: Number(e.target.value)} : p
                                            );
                                            setPersonnel(updatedPersonnel);
                                        }}
                                    >
                                        {ranks?.map(rank => (
                                            <option key={rank.id} value={rank.id}>
                                                {rank.name}
                                            </option>
                                        ))}
                                    </select>
                                </td>

                                {/* НДР */}
                                <td>
                                    <select
                                        value={employee.dutyTeamId}
                                        onChange={(e) => {
                                            const updatedPersonnel = personnel?.map(p =>
                                                p.id === employee.id ? {...p, dutyTeamId: Number(e.target.value)} : p
                                            );
                                            setPersonnel(updatedPersonnel);
                                        }}
                                    >
                                        {dutyTeams?.map(team => (
                                            <option key={team.id} value={team.id}>
                                                {team.name}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DatabaseManager;