import { createUserID, createFriendCode } from '../modules/lib.mjs';

// User manager class
class UserManager {
    
    // User creation functions
    async createUser(username) {
        const userId = createUserID();
        const friendCode = createFriendCode();
            
        const candidateUser = {
            userId: userId,
            friendCode: friendCode,
            username: username,
            createdAt: new Date().toISOString()
        };

        return candidateUser;
    }

    // Data retrieval functions
    async getUser(userId) {
        return null; 
    }
}

// Export variables
const userManager = new UserManager();
export { userManager };