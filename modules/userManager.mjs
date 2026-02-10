import db from './database.mjs'; 
import { generateSecureUserID, generateFriendCode } from './utils/ids.mjs';

class UserManager {
    
    // User Creation Functions
    async createUser(username) {
        const userId = generateSecureUserID();
        let friendCode = generateFriendCode();
        
        const newUser = {
            userId: userId,
            friendCode: friendCode,
            username: username,
            createdAt: new Date().toISOString()
        };

        let success = false;
        
        while (!success) {
            try {
                await db.createUser(newUser);
                success = true;
                return newUser;
            } catch (error) {
                if (error.message === "Friend Code Taken") {
                    friendCode = generateFriendCode();
                    newUser.friendCode = friendCode;
                } else {
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