// database interface functions
export class DBAdapter {
    async connect() { throw new Error("Not implemented"); }
    async getUserByUsername(username) { throw new Error("Not implemented"); }
    async getUserById(userId) { throw new Error("Not implemented"); }
    async createUser(user) { throw new Error("Not implemented"); }
    async updateUser(userId, updates) { throw new Error("Not implemented"); }
    async deleteUser(userId) { throw new Error("Not implemented"); }
}