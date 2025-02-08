const API_URL = 'http://localhost:3001/api';

// Интерфейсы для типизации данных
export interface CombatPost {
    id: number;
    name: string;
}

export interface DutyTeam {
    id: number;
    name: string;
    postId: number;
}

export interface Rank {
    id: number;
    name: string;
}

export interface Personnel {
    id: number;
    name: string;
    rankId: number;
    teamIds: number[];
}

export interface Schedule {
    id: number;
    time: string;
    event: string;
}

export interface DutySchedule {
    id: number;
    date_of_dutySchedule: string;
    dutyTeamId: number;
    personnelId: number;
}

export interface ZVKS {
    id: number;
    whoPosition: string;
    whoName: string;
    withPosition: string;
    withName: string;
    communicatorTime: string;
    commanderTime: string;
}

export interface Statistics {
    id: number;
    date_of_statistics: string;
    dutyTeamId: number;
    plannedPersonnelId: number;
    actualPersonnelId: number;
}

export interface Note {
    id: number;
    date_of_notes: string;
    content: string;
}

// Методы для званий
export const fetchRanks = async (): Promise<Rank[]> => {
    const response = await fetch(`${API_URL}/ranks`);
    return response.json();
};

// Методы для работы с БП
export const fetchCombatPosts = async (): Promise<CombatPost[]> => {
    const response = await fetch(`${API_URL}/combat-posts`);
    return response.json();
};

export const createCombatPost = async (name: string): Promise<CombatPost> => {
    const response = await fetch(`${API_URL}/combat-posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
    });
    return response.json();
};

export const updateCombatPost = async (id: number, name: string): Promise<CombatPost> => {
    const response = await fetch(`${API_URL}/combat-posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
    });
    return response.json();
};

// Методы для работы с НДР
export const fetchDutyTeams = async (): Promise<DutyTeam[]> => {
    const response = await fetch(`${API_URL}/duty-teams`);
    return response.json();
};

export const createDutyTeam = async (name: string, postId: number): Promise<DutyTeam> => {
    const response = await fetch(`${API_URL}/duty-teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, postId }),
    });
    return response.json();
};

export const updateDutyTeam = async (id: number, name: string, postId: number): Promise<DutyTeam> => {
    const response = await fetch(`${API_URL}/duty-teams/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, postId }),
    });
    return response.json();
};

// Методы для работы с персоналом
export const fetchPersonnel = async (): Promise<Personnel[]> => {
    const response = await fetch(`${API_URL}/personnel`);
    return response.json();
};

export const createPersonnel = async (name: string, rankId: number): Promise<Personnel> => {
    const response = await fetch(`${API_URL}/personnel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, rankId, teamIds: [] }),
    });
    return response.json();
};

export const updatePersonnel = async (
    id: number,
    name: string,
    rankId: number,
    teamIds: number[]
): Promise<Personnel> => {
    const response = await fetch(`${API_URL}/personnel/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, rankId, teamIds }),
    });
    return response.json();
};

// Методы для работы с расписанием
export const fetchSchedule = async (): Promise<Schedule[]> => {
    const response = await fetch(`${API_URL}/schedule`);
    return response.json();
};

export const createSchedule = async (time: string, event: string): Promise<Schedule> => {
    const response = await fetch(`${API_URL}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ time, event }),
    });
    return response.json();
};

// Методы для работы с графиком дежурств
export const fetchDutySchedule = async (): Promise<DutySchedule[]> => {
    const response = await fetch(`${API_URL}/duty-schedule`);
    return response.json();
};

export const createDutySchedule = async (
    date_of_dutySchedule: string,
    dutyTeamId: number,
    personnelId: number
): Promise<DutySchedule> => {
    const response = await fetch(`${API_URL}/duty-schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date_of_dutySchedule, dutyTeamId, personnelId }),
    });
    return response.json();
};

// Методы для работы с ЗВКС
export const fetchZVKS = async (): Promise<ZVKS[]> => {
    const response = await fetch(`${API_URL}/zvks`);
    return response.json();
};

export const createZVKS = async (
    whoPosition: string,
    whoName: string,
    withPosition: string,
    withName: string,
    communicatorTime: string,
    commanderTime: string
): Promise<ZVKS> => {
    const response = await fetch(`${API_URL}/zvks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whoPosition, whoName, withPosition, withName, communicatorTime, commanderTime }),
    });
    return response.json();
};

// Методы для работы со статистикой
export const fetchStatistics = async (): Promise<Statistics[]> => {
    const response = await fetch(`${API_URL}/statistics`);
    return response.json();
};

export const createStatistics = async (
    date_of_statistics: string,
    dutyTeamId: number,
    plannedPersonnelId: number,
    actualPersonnelId: number
): Promise<Statistics> => {
    const response = await fetch(`${API_URL}/statistics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date_of_statistics, dutyTeamId, plannedPersonnelId, actualPersonnelId }),
    });
    return response.json();
};

// Методы для работы с заметками
export const fetchNotes = async (): Promise<Note[]> => {
    const response = await fetch(`${API_URL}/notes`);
    return response.json();
};

export const createNote = async (date_of_notes: string, content: string): Promise<Note> => {
    const response = await fetch(`${API_URL}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date_of_notes, content }),
    });
    return response.json();
};