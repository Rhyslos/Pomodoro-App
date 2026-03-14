// initialization variables
let activeAdapter = null;

// database management functions
export const dbManager = {
    setAdapter(adapter) {
        activeAdapter = adapter;
    },
    
    async connect() {
        if (!activeAdapter) throw new Error("No database adapter set");
        return activeAdapter.connect();
    },
    
    async getUserByUsername(username) {
        return activeAdapter.getUserByUsername(username);
    },

    async getUserById(userId) {
        return activeAdapter.getUserById(userId);
    },
    
    async createUser(user) {
        return activeAdapter.createUser(user);
    },
    
    async updateUser(userId, updates) {
        return activeAdapter.updateUser(userId, updates);
    },
    
    async deleteUser(userId) {
        return activeAdapter.deleteUser(userId);
    }
};