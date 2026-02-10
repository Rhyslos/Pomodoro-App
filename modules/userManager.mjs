import db from '../database/database.mjs'; 
import { createUserID, createFriendCode } from './lib.mjs';

class UserManager {
    
    async createUser(username) {
        const userId = createUserID();
        
        while (true) {
            const friendCode = createFriendCode();
            
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