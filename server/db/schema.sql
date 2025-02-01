-- Боевые посты
CREATE TABLE IF NOT EXISTS combat_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

-- Номера дежурных расчетов
CREATE TABLE IF NOT EXISTS duty_teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  post_id INTEGER NOT NULL,
  FOREIGN KEY (post_id) REFERENCES combat_posts(id)
);

-- Звания
CREATE TABLE IF NOT EXISTS ranks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

-- Состав сотрудников
CREATE TABLE IF NOT EXISTS personnel (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  rank_id INTEGER NOT NULL,
  teams TEXT NOT NULL, -- JSON массив ID duty_teams
  FOREIGN KEY (rank_id) REFERENCES ranks(id)
);

-- График дежурств
CREATE TABLE IF NOT EXISTS schedule (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL, -- Формат YYYY-MM-DD
  team_id INTEGER NOT NULL,
  personnel_id INTEGER NOT NULL,
  FOREIGN KEY (team_id) REFERENCES duty_teams(id),
  FOREIGN KEY (personnel_id) REFERENCES personnel(id)
);

-- Статистика
CREATE TABLE IF NOT EXISTS stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  schedule_id INTEGER NOT NULL UNIQUE,
  actual_personnel_id INTEGER NOT NULL,
  order_number TEXT,
  FOREIGN KEY (schedule_id) REFERENCES schedule(id),
  FOREIGN KEY (actual_personnel_id) REFERENCES personnel(id)
);

-- Расписание мероприятий
CREATE TABLE IF NOT EXISTS timetable (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  time TEXT NOT NULL, -- Формат HH:MM
  event TEXT NOT NULL
);

-- ЗВКС
CREATE TABLE IF NOT EXISTS zvks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  initiator_position TEXT NOT NULL,
  initiator_name TEXT NOT NULL,
  contact_position TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  comms_time TEXT NOT NULL, -- Время связиста
  commander_time TEXT NOT NULL, -- Время командира
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Заметки
CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL,
  date TEXT NOT NULL DEFAULT (DATE('now'))
);