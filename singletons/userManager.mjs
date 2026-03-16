import crypto from 'node:crypto';
import { createUserID } from '../modules/lib.mjs';
import { dbManager } from './dbManager.mjs';

// user management classes
class UserManager {
    constructor() {
        this.sessions = new Map();
    }

    // security functions
    hashPassword(password, salt) {
        return crypto.scryptSync(password, salt, 64).toString('hex');
    }

    generateSalt() {
        return crypto.randomBytes(16).toString('hex');
    }

    generateToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    // account creation functions
    async createUser(username, password) {
        const existingUser = await dbManager.getUserByUsername(username);
        if (existingUser) return null;

        const userId = createUserID();
        const salt = this.generateSalt();
        const passwordHash = this.hashPassword(password, salt);

        const newUser = {
            userId,
            username,
            passwordHash,
            salt,
            color: null,
            createdAt: new Date().toISOString()
        };

        await dbManager.createUser(newUser);
        return { userId, username, color: newUser.color };
    }

    // authentication functions
    async loginUser(username, password) {
        const user = await dbManager.getUserByUsername(username);
        if (!user) return null;

        const inputHash = this.hashPassword(password, user.salt);
        
        const storedHashBuffer = Buffer.from(user.passwordHash, 'hex');
        const inputHashBuffer = Buffer.from(inputHash, 'hex');
        
        if (storedHashBuffer.length === inputHashBuffer.length && crypto.timingSafeEqual(storedHashBuffer, inputHashBuffer)) {
            const token = this.generateToken();
            this.sessions.set(token, user.userId);
            return { token, user: { userId: user.userId, username: user.username, color: user.color } };
        }
        
        return null;
    }

    async getUserByToken(token) {
        const userId = this.sessions.get(token);
        if (!userId) return null;
        
        const user = await dbManager.getUserById(userId);
        if (!user) return null;
        
        return { userId: user.userId, username: user.username, color: user.color };
    }

    async updateUser(userId, updates) {
        const user = await dbManager.getUserById(userId);
        if (!user) return null;

        const dbUpdates = {};
        if (updates.username) dbUpdates.username = updates.username;
        if (updates.color) dbUpdates.color = updates.color;
        if (updates.password) {
            dbUpdates.salt = this.generateSalt();
            dbUpdates.passwordHash = this.hashPassword(updates.password, dbUpdates.salt);
        }

        const updatedUser = await dbManager.updateUser(userId, dbUpdates);
        return { userId: updatedUser.userId, username: updatedUser.username, color: updatedUser.color };
    }

    // account deletion functions
    async deleteUser(userId) {
        await dbManager.deleteUser(userId);
        
        for (const [token, id] of this.sessions.entries()) {
            if (id === userId) {
                this.sessions.delete(token);
            }
        }
    }
    
    // session termination functions
    async logoutUser(token) {
        this.sessions.delete(token);
    }
}

// export variables
const userManager = new UserManager();
export { userManager };