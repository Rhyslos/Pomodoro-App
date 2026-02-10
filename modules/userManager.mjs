import db from './database.mjs'; 
import { generateSecureUserID, generateFriendCode } from './utils/ids.mjs';

class UserManager {
    
    async createUser(username) {
        const userId = generateSecureUserID();
        
        while (true) {
            const friendCode = generateFriendCode();
            
            const candidateUser = {
                userId: userId,
                friendCode: friendCode,
                username: username,
                createdAt: new Date().toISOString()
            };

            try {
                await db.createUser(candidateUser);
                return candidateUser;
            } catch (error) {
                if (error.message !== "Friend Code Taken") {
                    throw error;
                }
            }
        }
    }

    // Data Retrieval Functions
    async getUser(userId) {
        return await db.getUser(userId);
    }
}

export { UserManager };