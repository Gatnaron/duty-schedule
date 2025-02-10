CREATE TABLE IF NOT EXISTS CombatPosts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS DutyTeams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    postId INTEGER,
    FOREIGN KEY(postId) REFERENCES CombatPosts(id)
);

CREATE TABLE IF NOT EXISTS Ranks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Personnel (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    rankId INTEGER,
    dutyTeamId INTEGER,
    FOREIGN KEY(rankId) REFERENCES Ranks(id),
    FOREIGN KEY(dutyTeamId) REFERENCES DutyTeams(id)
);

CREATE TABLE IF NOT EXISTS Schedule (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    time TEXT NOT NULL,
    event TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS DutySchedule (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date_of_dutySchedule TEXT NOT NULL,
    dutyTeamId INTEGER,
    plannedPersonnelId INTEGER,
    actualPersonnelId INTEGER,
    FOREIGN KEY(dutyTeamId) REFERENCES DutyTeams(id),
    FOREIGN KEY(plannedPersonnelId) REFERENCES Personnel(id),
    FOREIGN KEY(actualPersonnelId) REFERENCES Personnel(id)
);

CREATE TABLE IF NOT EXISTS ZVKS (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    whoPosition TEXT NOT NULL,
    whoName TEXT NOT NULL,
    withPosition TEXT NOT NULL,
    withName TEXT NOT NULL,
    communicatorTime TEXT NOT NULL,
    commanderTime TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date_of_notes TEXT NOT NULL,
    content TEXT NOT NULL
);

CREATE TABLE Orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dutyScheduleId INTEGER NOT NULL,
    orderNumber TEXT,
    FOREIGN KEY (dutyScheduleId) REFERENCES DutySchedule(id)
);