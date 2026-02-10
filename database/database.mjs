import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.resolve('data.json');

class JSONDatabase {
    constructor() {
        this.filePath = DB_PATH;
        this.ensureFileExists();
    }

    // Initialization Functions
    async ensureFileExists() {
        try {
            await fs.access(this.filePath);
        } catch {
            await this._saveFile({ users: [], sessions: [] });
        }
    }

    // Internal Helper Functions
    async _readFile() {
        const rawData = await fs.readFile(this.filePath, 'utf-8');
        return JSON.parse(rawData);
    }

    async _saveFile(data) {
        const jsonString = JSON.stringify(data, null, 2);
        await fs.writeFile(this.filePath, jsonString);
    }

    // User Data Functions
    async createUser(user) {
        const data = await this._readFile();
        
        const isTaken = data.users.some(u => u.friendCode === user.friendCode);
        
        if (isTaken) {
            throw new Error("Friend Code Taken");
        }

        data.users.push(user);
        await this._saveFile(data);
    }

    async getUser(userId) {
        const data = await this._readFile();
        return data.users.find(u => u.userId === userId);
    }
}

const db = new JSONDatabase();
export default db;