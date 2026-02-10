import Database from 'better-sqlite3';

const db = new Database('pomodoro.db', { verbose: console.log });

db.pragma('journal_mode = WAL');

const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY,
        friend_code TEXT UNIQUE,
        username TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`;

db.exec(createUsersTable);

export default db;