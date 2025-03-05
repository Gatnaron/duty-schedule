import { useState, useEffect } from 'react';
import styles from './DatabaseManager.module.css';
import saveIcon from '../../img/icon-save.png';
import addPlus from '../../img/add-plus.png'
import deleteIcon from '../../img/icon-delete.png'

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

    const [selectedCombatPost, setSelectedCombatPost] = useState<CombatPost | null>(null);
    const [selectedDutyTeam, setSelectedDutyTeam] = useState<DutyTeam | null>(null);
    const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null);

    const [newCombatPost, setNewCombatPost] = useState('');
    const [newDutyTeam, setNewDutyTeam] = useState({ name: '', postId: 1 });
    const [newPersonnel, setNewPersonnel] = useState({
        name: '',
        rankId: 1,
        dutyTeamId: 1,
    });

    // Загрузка данных
    useEffect(() => {
        reloadAllData();
    }, []);

    const reloadAllData = async () => {
        try {
            const [posts, teams, ranksData, personnelData] = await Promise.all([
                fetch('http://localhost:3001/api/combat-posts').then((res) => res.json()),
                fetch('http://localhost:3001/api/duty-teams').then((res) => res.json()),
                fetch('http://localhost:3001/api/ranks').then((res) => res.json()),
                fetch('http://localhost:3001/api/personnel').then((res) => res.json()),
            ]);

            setCombatPosts(posts || []);
            setDutyTeams(teams || []);
            setRanks(ranksData || []);
            setPersonnel(personnelData || []);
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        }
    };

    // Обработчики добавления
    const addCombatPost = async () => {
        if (!newCombatPost) return;

        try {
            await fetch('http://localhost:3001/api/combat-posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCombatPost }),
            });

            reloadAllData();
            setNewCombatPost('');
        } catch (error) {
            console.error('Ошибка добавления БП:', error);
        }
    };

    const addDutyTeam = async () => {
        if (!newDutyTeam.name) return;

        try {
            await fetch('http://localhost:3001/api/duty-teams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newDutyTeam),
            });

            reloadAllData();
            setNewDutyTeam({ name: '', postId: 1 });
        } catch (error) {
            console.error('Ошибка добавления НДР:', error);
        }
    };

    const addPersonnel = async () => {
        if (!newPersonnel.name || !newPersonnel.rankId || !newPersonnel.dutyTeamId) return;

        try {
            await fetch('http://localhost:3001/api/personnel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPersonnel),
            });

            reloadAllData();
            setNewPersonnel({ name: '', rankId: 1, dutyTeamId: 1 });
        } catch (error) {
            console.error('Ошибка добавления сотрудника:', error);
        }
    };

    // Обработчики редактирования
    const updateCombatPost = async () => {
        if (!selectedCombatPost || !newCombatPost) return;

        try {
            await fetch(`http://localhost:3001/api/combat-posts/${selectedCombatPost.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCombatPost }),
            });

            reloadAllData();
            setSelectedCombatPost(null);
            setNewCombatPost('');
        } catch (error) {
            console.error('Ошибка редактирования БП:', error);
        }
    };

    const updateDutyTeam = async () => {
        if (!selectedDutyTeam || !newDutyTeam.name) return;

        try {
            await fetch(`http://localhost:3001/api/duty-teams/${selectedDutyTeam.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newDutyTeam),
            });

            reloadAllData();
            setSelectedDutyTeam(null);
            setNewDutyTeam({ name: '', postId: 1 });
        } catch (error) {
            console.error('Ошибка редактирования НДР:', error);
        }
    };

    const updatePersonnel = async () => {
        if (!selectedPersonnel || !newPersonnel.name || !newPersonnel.rankId || !newPersonnel.dutyTeamId) return;

        try {
            await fetch(`http://localhost:3001/api/personnel/${selectedPersonnel.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPersonnel),
            });

            reloadAllData();
            setSelectedPersonnel(null);
            setNewPersonnel({ name: '', rankId: 1, dutyTeamId: 1 });
        } catch (error) {
            console.error('Ошибка редактирования сотрудника:', error);
        }
    };

    // Обработчики удаления
    const deleteCombatPost = async () => {
        if (!selectedCombatPost) return;

        try {
            await fetch(`http://localhost:3001/api/combat-posts/${selectedCombatPost.id}`, {
                method: 'DELETE',
            });

            reloadAllData();
            setSelectedCombatPost(null);
            setNewCombatPost('');
        } catch (error) {
            console.error('Ошибка удаления БП:', error);
        }
    };

    const deleteDutyTeam = async () => {
        if (!selectedDutyTeam) return;

        try {
            await fetch(`http://localhost:3001/api/duty-teams/${selectedDutyTeam.id}`, {
                method: 'DELETE',
            });

            reloadAllData();
            setSelectedDutyTeam(null);
            setNewDutyTeam({ name: '', postId: 1 });
        } catch (error) {
            console.error('Ошибка удаления НДР:', error);
        }
    };

    const deletePersonnel = async () => {
        if (!selectedPersonnel) return;

        try {
            await fetch(`http://localhost:3001/api/personnel/${selectedPersonnel.id}`, {
                method: 'DELETE',
            });

            reloadAllData();
            setSelectedPersonnel(null);
            setNewPersonnel({ name: '', rankId: 1, dutyTeamId: 1 });
        } catch (error) {
            console.error('Ошибка удаления сотрудника:', error);
        }
    };

    // Обработчики выбора строки
    const handleSelectCombatPost = (post: CombatPost) => {
        if (selectedCombatPost?.id === post.id) {
            setSelectedCombatPost(null);
            setNewCombatPost('');
        } else {
            setSelectedCombatPost(post);
            setNewCombatPost(post.name);
        }
    };

    const handleSelectDutyTeam = (team: DutyTeam) => {
        if (selectedDutyTeam?.id === team.id) {
            setSelectedDutyTeam(null);
            setNewDutyTeam({ name: '', postId: 1 });
        } else {
            setSelectedDutyTeam(team);
            setNewDutyTeam({ name: team.name, postId: team.postId });
        }
    };

    const handleSelectPersonnel = (person: Personnel) => {
        if (selectedPersonnel?.id === person.id) {
            setSelectedPersonnel(null);
            setNewPersonnel({ name: '', rankId: 1, dutyTeamId: 1 });
        } else {
            setSelectedPersonnel(person);
            setNewPersonnel({ name: person.name, rankId: person.rankId, dutyTeamId: person.dutyTeamId });
        }
    };

    return (
        <div className={styles.container}>
            {/* Контейнер для всех таблиц */}
            <div className={styles.tablesContainer}>
                {/* Блок Боевых Постов */}
                <div className={styles.tableSection}>
                    <div className={styles.tableHeader}>
                        <h2>Боевые Посты (БП)</h2>
                        <div className={styles.controls}>
                            <button
                                className={styles.addButton}
                                onClick={addCombatPost}
                                title="Добавить"
                            >
                                <img src={addPlus} alt="Добавить" />
                            </button>
                            {selectedCombatPost && (
                                <>
                                    <button
                                        className={styles.saveButton}
                                        onClick={updateCombatPost}
                                        title="Сохранить изменения"
                                    >
                                        <img src={saveIcon} alt="Сохранить" />
                                    </button>
                                    <button
                                        className={styles.deleteButton}
                                        onClick={deleteCombatPost}
                                        title="Удалить"
                                    >
                                        <img src={deleteIcon} alt="Удалить" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Форма для добавления/редактирования БП */}
                    <div className={styles.addForm}>
                        <input
                            type="text"
                            value={newCombatPost}
                            onChange={(e) => setNewCombatPost(e.target.value)}
                            placeholder="Название БП"
                        />
                    </div>

                    {/* Таблица БП */}
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Название</th>
                        </tr>
                        </thead>
                        <tbody>
                        {combatPosts.map((post) => (
                            <tr
                                key={post.id}
                                onClick={() => handleSelectCombatPost(post)}
                                className={
                                    selectedCombatPost?.id === post.id ? styles.selectedRow : ''
                                }
                            >
                                <td>{post.id}</td>
                                <td>
                                    {selectedCombatPost?.id === post.id ? (
                                        <input
                                            type="text"
                                            value={newCombatPost}
                                            onChange={(e) =>
                                                setNewCombatPost(e.target.value)
                                            }
                                        />
                                    ) : (
                                        post.name
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Блок НДР */}
                <div className={styles.tableSection}>
                    <div className={styles.tableHeader}>
                        <h2>Номер дежурного расчета (НДР)</h2>
                        <div className={styles.controls}>
                            <button
                                className={styles.addButton}
                                onClick={addDutyTeam}
                                title="Добавить"
                            >
                                <img src={addPlus} alt="Добавить" />
                            </button>
                            {selectedDutyTeam && (
                                <>
                                    <button
                                        className={styles.saveButton}
                                        onClick={updateDutyTeam}
                                        title="Сохранить изменения"
                                    >
                                        <img src={saveIcon} alt="Сохранить" />
                                    </button>
                                    <button
                                        className={styles.deleteButton}
                                        onClick={deleteDutyTeam}
                                        title="Удалить"
                                    >
                                        <img src={deleteIcon} alt="Удалить" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Форма для добавления/редактирования НДР */}
                    <div className={styles.addForm}>
                        <input
                            type="text"
                            value={newDutyTeam.name}
                            onChange={(e) =>
                                setNewDutyTeam({ ...newDutyTeam, name: e.target.value })
                            }
                            placeholder="Название НДР"
                        />
                        <select
                            value={newDutyTeam.postId}
                            onChange={(e) =>
                                setNewDutyTeam({ ...newDutyTeam, postId: Number(e.target.value) })
                            }
                        >
                            {combatPosts.map((post) => (
                                <option key={post.id} value={post.id}>
                                    {post.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Таблица НДР */}
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Название</th>
                            <th>Боевой Пост</th>
                        </tr>
                        </thead>
                        <tbody>
                        {dutyTeams.map((team) => {
                            const post = combatPosts.find((p) => p.id === team.postId);
                            return (
                                <tr
                                    key={team.id}
                                    onClick={() => handleSelectDutyTeam(team)}
                                    className={
                                        selectedDutyTeam?.id === team.id ? styles.selectedRow : ''
                                    }
                                >
                                    <td>{team.id}</td>
                                    <td>
                                        {selectedDutyTeam?.id === team.id ? (
                                            <input
                                                type="text"
                                                value={newDutyTeam.name}
                                                onChange={(e) =>
                                                    setNewDutyTeam({
                                                        ...newDutyTeam,
                                                        name: e.target.value,
                                                    })
                                                }
                                            />
                                        ) : (
                                            team.name
                                        )}
                                    </td>
                                    <td>
                                        {selectedDutyTeam?.id === team.id ? (
                                            <select
                                                value={newDutyTeam.postId}
                                                onChange={(e) =>
                                                    setNewDutyTeam({
                                                        ...newDutyTeam,
                                                        postId: Number(e.target.value),
                                                    })
                                                }
                                            >
                                                {combatPosts.map((post) => (
                                                    <option key={post.id} value={post.id}>
                                                        {post.name}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            post?.name || 'Не указан'
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>

                {/* Блок Сотрудников */}
                <div className={styles.tableSection}>
                    <div className={styles.tableHeader}>
                        <h2>Сотрудники</h2>
                        <div className={styles.controls}>
                            <button
                                className={styles.addButton}
                                onClick={addPersonnel}
                                title="Добавить"
                            >
                                <img src={addPlus} alt="Добавить" />
                            </button>
                            {selectedPersonnel && (
                                <>
                                    <button
                                        className={styles.saveButton}
                                        onClick={updatePersonnel}
                                        title="Сохранить изменения"
                                    >
                                        <img src={saveIcon} alt="Сохранить" />
                                    </button>
                                    <button
                                        className={styles.deleteButton}
                                        onClick={deletePersonnel}
                                        title="Удалить"
                                    >
                                        <img src={deleteIcon} alt="Удалить" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Форма для добавления/редактирования сотрудников */}
                    <div className={styles.addForm}>
                        <input
                            type="text"
                            value={newPersonnel.name}
                            onChange={(e) =>
                                setNewPersonnel({ ...newPersonnel, name: e.target.value })
                            }
                            placeholder="ФИО"
                        />
                        <select
                            value={newPersonnel.rankId}
                            onChange={(e) =>
                                setNewPersonnel({
                                    ...newPersonnel,
                                    rankId: Number(e.target.value),
                                })
                            }
                        >
                            {ranks.map((rank) => (
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
                                    dutyTeamId: Number(e.target.value),
                                })
                            }
                        >
                            {dutyTeams.map((team) => (
                                <option key={team.id} value={team.id}>
                                    {team.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Таблица Сотрудников */}
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>ФИО</th>
                            <th>Звание</th>
                            <th>НДР</th>
                        </tr>
                        </thead>
                        <tbody>
                        {personnel.map((employee) => {
                            const rank = ranks.find((r) => r.id === employee.rankId);
                            const team = dutyTeams.find((t) => t.id === employee.dutyTeamId);
                            return (
                                <tr
                                    key={employee.id}
                                    onClick={() => handleSelectPersonnel(employee)}
                                    className={
                                        selectedPersonnel?.id === employee.id
                                            ? styles.selectedRow
                                            : ''
                                    }
                                >
                                    <td>{employee.id}</td>
                                    <td>
                                        {selectedPersonnel?.id === employee.id ? (
                                            <input
                                                type="text"
                                                value={newPersonnel.name}
                                                onChange={(e) =>
                                                    setNewPersonnel({
                                                        ...newPersonnel,
                                                        name: e.target.value,
                                                    })
                                                }
                                            />
                                        ) : (
                                            employee.name
                                        )}
                                    </td>
                                    <td>
                                        {selectedPersonnel?.id === employee.id ? (
                                            <select
                                                value={newPersonnel.rankId}
                                                onChange={(e) =>
                                                    setNewPersonnel({
                                                        ...newPersonnel,
                                                        rankId: Number(e.target.value),
                                                    })
                                                }
                                            >
                                                {ranks.map((rank) => (
                                                    <option key={rank.id} value={rank.id}>
                                                        {rank.name}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            rank?.name || 'Не указано'
                                        )}
                                    </td>
                                    <td>
                                        {selectedPersonnel?.id === employee.id ? (
                                            <select
                                                value={newPersonnel.dutyTeamId}
                                                onChange={(e) =>
                                                    setNewPersonnel({
                                                        ...newPersonnel,
                                                        dutyTeamId: Number(e.target.value),
                                                    })
                                                }
                                            >
                                                {dutyTeams.map((team) => (
                                                    <option key={team.id} value={team.id}>
                                                        {team.name}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            team?.name || 'Не указано'
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DatabaseManager;