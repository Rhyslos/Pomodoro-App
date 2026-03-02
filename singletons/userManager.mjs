import { createUserID, createFriendCode } from '../modules/lib.mjs';

// User management classes
class UserManager {
    constructor() {
        this.activeUsers = new Map();
    }
    
    // User creation functions
    async createUser(username) {
        const userId = createUserID();
        const friendCode = createFriendCode();
            
        const candidateUser = {
            userId: userId,
            friendCode: friendCode,
            username: username,
            color: null,
            createdAt: new Date().toISOString()
        };

        this.activeUsers.set(userId, candidateUser);
        return candidateUser;
    }

    async restoreUser(userData) {
        this.activeUsers.set(userData.userId, userData);
        return userData;
    }

    // Data retrieval functions
    async getUser(userId) {
        return this.activeUsers.get(userId) || null; 
    }

    // User update functions
    async updateUser(userId, updates) {
        const user = this.activeUsers.get(userId);
        if (user) {
            // Mutate the existing object so shared references in Rooms update automatically
            Object.assign(user, updates);
            return user;
        }
        return null;
    }

    // User deletion functions
    async deleteUser(userId) {
        this.activeUsers.delete(userId);
    }
}

// Export variables
const userManager = new UserManager();
export { userManager };