import crypto from 'node:crypto';
import { createUserID } from '../modules/lib.mjs';

// User management classes
class UserManager {
    constructor() {
        this.users = new Map();
        this.sessions = new Map();
    }

    // Security functions
    hashPassword(password, salt) {
        return crypto.scryptSync(password, salt, 64).toString('hex');
    }

    generateSalt() {
        return crypto.randomBytes(16).toString('hex');
    }

    generateToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    // Account creation functions
    async createUser(username, password) {
        for (const user of this.users.values()) {
            if (user.username === username) return null;
        }

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

        this.users.set(userId, newUser);
        return { userId, username, color: newUser.color };
    }

    // Authentication functions
    async loginUser(username, password) {
        for (const user of this.users.values()) {
            if (user.username === username) {
                const inputHash = this.hashPassword(password, user.salt);
                
                const storedHashBuffer = Buffer.from(user.passwordHash, 'hex');
                const inputHashBuffer = Buffer.from(inputHash, 'hex');
                
                if (storedHashBuffer.length === inputHashBuffer.length && crypto.timingSafeEqual(storedHashBuffer, inputHashBuffer)) {
                    const token = this.generateToken();
                    this.sessions.set(token, user.userId);
                    return { token, user: { userId: user.userId, username, color: user.color } };
                }
            }
        }
        return null;
    }

    // Session validation functions
    async getUserByToken(token) {
        const userId = this.sessions.get(token);
        if (!userId) return null;
        
        const user = this.users.get(userId);
        if (!user) return null;
        
        return { userId: user.userId, username: user.username, color: user.color };
    }

    // Data update functions
    async updateUser(userId, updates) {
        const user = this.users.get(userId);
        if (!user) return null;

        if (updates.username) user.username = updates.username;
        if (updates.color) user.color = updates.color;
        if (updates.password) {
            user.salt = this.generateSalt();
            user.passwordHash = this.hashPassword(updates.password, user.salt);
        }

        return { userId: user.userId, username: user.username, color: user.color };
    }

    // Account deletion functions
    async deleteUser(userId) {
        this.users.delete(userId);
        
        for (const [token, id] of this.sessions.entries()) {
            if (id === userId) {
                this.sessions.delete(token);
            }
        }
    }
    
    // Session termination functions
    async logoutUser(token) {
        this.sessions.delete(token);
    }
}

// Export variables
const userManager = new UserManager();
export { userManager };