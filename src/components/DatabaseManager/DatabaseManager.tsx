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
    dutyTeamIds: number[];
}

const DatabaseManager = () => {

    const [combatPosts, setCombatPosts] = useState<CombatPost[]>([]);
    const [dutyTeams, setDutyTeams] = useState<DutyTeam[]>([]);
    const [ranks, setRanks] = useState<Rank[]>([]);
    const [personnel, setPersonnel] = useState<Personnel[]>([]);

    const [selectedCombatPost, setSelectedCombatPost] = useState<CombatPost | null>(null);
    const [selectedDutyTeam, setSelectedDutyTeam] = useState<DutyTeam | null>(null);
    const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [newCombatPost, setNewCombatPost] = useState('');
    const [newDutyTeam, setNewDutyTeam] = useState({ name: '', postId: 1 });
    const [newPersonnel, setNewPersonnel] = useState({
        name: '',
        rankId: 1,
        dutyTeamIds: [] as number[],
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
            setNewDutyTeam({ name: '', postId: combatPosts.length > 0 ? combatPosts[combatPosts.length - 1].id : 0 });
        } catch (error) {
            console.error('Ошибка добавления НДР:', error);
        }
    };

    const addPersonnel = async () => {
        if (!newPersonnel.name || !newPersonnel.rankId || newPersonnel.dutyTeamIds.length === 0) return;

        try {
            await fetch('http://localhost:3001/api/personnel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newPersonnel.name,
                    rankId: newPersonnel.rankId,
                    dutyTeamIds: newPersonnel.dutyTeamIds,
                }),
            });

            reloadAllData();
            setNewPersonnel({ name: '', rankId: 1, dutyTeamIds: [] });
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
            setNewDutyTeam({ name: '', postId: combatPosts.length > 0 ? combatPosts[combatPosts.length - 1].id : 0 });
        } catch (error) {
            console.error('Ошибка редактирования НДР:', error);
        }
    };

    const updatePersonnel = async () => {
        if (!selectedPersonnel || !newPersonnel.name || !newPersonnel.rankId || newPersonnel.dutyTeamIds.length === 0) return;

        try {
            await fetch(`http://localhost:3001/api/personnel/${selectedPersonnel.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newPersonnel.name,
                    rankId: newPersonnel.rankId,
                    dutyTeamIds: newPersonnel.dutyTeamIds,
                }),
            });

            reloadAllData();
            setSelectedPersonnel(null);
            setNewPersonnel({ name: '', rankId: 1, dutyTeamIds: [] });
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
            setNewPersonnel({ name: '', rankId: 1, dutyTeamIds: [] });
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
            setNewPersonnel({ name: '', rankId: 1, dutyTeamIds: [] });
        } else {
            setSelectedPersonnel(person);
            setNewPersonnel({ name: person.name, rankId: person.rankId, dutyTeamIds: person.dutyTeamIds });
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
                        {combatPosts.map((post, index) => (
                            <tr
                                key={post.id}
                                data-id={post.id}
                                onClick={() => handleSelectCombatPost(post)}
                                className={
                                    selectedCombatPost?.id === post.id ? styles.selectedRow : ''
                                }
                            >
                                <td>{index + 1}</td>
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
                        {dutyTeams.map((team, index) => {
                            const post = combatPosts.find((p) => p.id === team.postId);
                            return (
                                <tr
                                    key={team.id}
                                    data-id={team.id}
                                    onClick={() => handleSelectDutyTeam(team)}
                                    className={
                                        selectedDutyTeam?.id === team.id ? styles.selectedRow : ''
                                    }
                                >
                                    <td>{index + 1}</td>
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
                                <img src={addPlus} alt="Добавить"/>
                            </button>
                            {selectedPersonnel && (
                                <>
                                    <button
                                        className={styles.saveButton}
                                        onClick={updatePersonnel}
                                        title="Сохранить изменения"
                                    >
                                        <img src={saveIcon} alt="Сохранить"/>
                                    </button>
                                    <button
                                        className={styles.deleteButton}
                                        onClick={deletePersonnel}
                                        title="Удалить"
                                    >
                                        <img src={deleteIcon} alt="Удалить"/>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className={styles.addForm}>
                        <input
                            type="text"
                            value={newPersonnel.name}
                            onChange={(e) =>
                                setNewPersonnel({...newPersonnel, name: e.target.value})
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

                        {/* Выпадающий список с мультиселектом */}
                        <div className={styles.multiSelectContainer}>
                            <div className={styles.multiSelect} onClick={() => setDropdownOpen(!dropdownOpen)}>
                                {newPersonnel.dutyTeamIds.length > 0
                                    ? dutyTeams
                                        .filter((team) => newPersonnel.dutyTeamIds.includes(team.id))
                                        .map((team) => team.name)
                                        .join(", ")
                                    : "Выберите НДР"}
                            </div>

                            {dropdownOpen && (
                                <div className={styles.dropdown}>
                                    {dutyTeams.map((team) => (
                                        <div
                                            key={team.id}
                                            className={`${styles.dropdownItem} ${newPersonnel.dutyTeamIds.includes(team.id) ? styles.selected : ''}`}
                                            onClick={() => {
                                                setNewPersonnel((prev) => ({
                                                    ...prev,
                                                    dutyTeamIds: prev.dutyTeamIds.includes(team.id)
                                                        ? prev.dutyTeamIds.filter((id) => id !== team.id) // Удаление
                                                        : [...prev.dutyTeamIds, team.id], // Добавление
                                                }));
                                            }}
                                        >
                                            {team.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
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
                        {personnel.map((employee, index) => {
                            const rank = ranks.find((r) => r.id === employee.rankId);
                            const employeeDutyTeams = dutyTeams.filter((team) =>
                                employee.dutyTeamIds.includes(team.id)
                            );
                            return (
                                <tr
                                    key={employee.id}
                                    data-id={employee.id}
                                    onClick={() => handleSelectPersonnel(employee)}
                                    className={
                                        selectedPersonnel?.id === employee.id
                                            ? styles.selectedRow
                                            : ''
                                    }
                                >
                                    <td>{index + 1}</td>
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
                                            <div className={styles.tagContainer}>
                                                {dutyTeams
                                                    .filter((team) => selectedPersonnel?.dutyTeamIds.includes(team.id)) // Показываем только связанные НДР
                                                    .map((team) => (
                                                        <span
                                                            key={team.id}
                                                            className={`${styles.tag} ${newPersonnel.dutyTeamIds.includes(team.id) ? styles.selectedTag : ''}`}
                                                            onClick={() => {
                                                                setNewPersonnel((prev) => ({
                                                                    ...prev,
                                                                    dutyTeamIds: prev.dutyTeamIds.includes(team.id)
                                                                        ? prev.dutyTeamIds.filter((id) => id !== team.id) // Удаление
                                                                        : [...prev.dutyTeamIds, team.id], // Добавление
                                                                }));
                                                            }}
                                                        >
                                                            {team.name}
                                                        </span>
                                                    ))}
                                            </div>
                                        ) : (
                                            employeeDutyTeams.length > 0 ? (
                                                <div className={styles.tagContainer}>
                                                    {employeeDutyTeams.map((team) => (
                                                        <span key={team.id} className={styles.tag}>
                                                            {team.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : 'Не указано'
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