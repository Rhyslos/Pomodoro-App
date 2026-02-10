import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.resolve('data.json');

class JSONDatabase {
    constructor() {
        this.filePath = DB_PATH;
        this.init();
    }

    // Initialization Functions
    async init() {
        try {
            await fs.access(this.filePath);
        } catch {
            const initialData = { users: [], sessions: [] };
            await fs.writeFile(this.filePath, JSON.stringify(initialData, null, 2));
        }
    }

    // IO Functions
    async readData() {
        const raw = await fs.readFile(this.filePath, 'utf-8');
        return JSON.parse(raw);
    }

    async writeData(data) {
        await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
    }

    // User Functions
    async createUser(user) {
        const data = await this.readData();
        
        if (data.users.find(u => u.friendCode === user.friendCode)) {
            throw new Error("Friend Code Taken");
        }

        data.users.push(user);
        await this.writeData(data);
        return user;
    }

    async getUser(userId) {
        const data = await this.readData();
        return data.users.find(u => u.userId === userId);
    }
}

const db = new JSONDatabase();
export default db;