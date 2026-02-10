import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.resolve('data.json');
const HISTORY_PATH = path.resolve('history.json');

class JSONDatabase {
    constructor() {
        this.filePath = DB_PATH;
        this.historyPath = HISTORY_PATH;
        this.ensureFileExists();
        this.ensureHistoryExists();
    }

    // Initialization Functions
    async ensureFileExists() {
        try {
            await fs.access(this.filePath);
        } catch {
            await this._saveFile({ users: [], sessions: [] });
        }
    }

    async ensureHistoryExists() {
        try {
            await fs.access(this.historyPath);
        } catch {
            await fs.writeFile(this.historyPath, JSON.stringify([], null, 2));
        }
    }

    // Internal Helper Functions
    async _readFile() {
        const rawData = await fs.readFile(this.filePath, 'utf-8');
        return JSON.parse(rawData);
    }

    async _saveFile(data) {
        await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
    }

    // User Data Functions
    async createUser(user) {
        const data = await this._readFile();
        
        const isTaken = data.users.some(u => u.friendCode === user.friendCode);
        if (isTaken) throw new Error("Friend Code Taken");

        data.users.push(user);
        await this._saveFile(data);
    }

    async getUser(userId) {
        const data = await this._readFile();
        return data.users.find(u => u.userId === userId);
    }

    // History Functions
    async saveSessionLog(sessionLog) {
        const raw = await fs.readFile(this.historyPath, 'utf-8');
        const history = JSON.parse(raw);
        
        history.push(sessionLog);
        
        await fs.writeFile(this.historyPath, JSON.stringify(history, null, 2));
    }
}

const db = new JSONDatabase();
export default db;