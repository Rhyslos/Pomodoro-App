import pkg from 'pg';
import { DBAdapter } from './dbAdapter.mjs';

// initialization variables
const { Pool } = pkg;

// database formatting functions
function mapUserRow(row) {
    if (!row) return null;
    return {
        userId: row.id,
        username: row.username,
        passwordHash: row.password_hash,
        salt: row.salt,
        color: row.color,
        createdAt: row.created_at
    };
}

export class PostgresAdapter extends DBAdapter {
    constructor(connectionString) {
        super();
        const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

        this.pool = new Pool({
            connectionString: connectionString,
            ssl: isLocal ? false : { rejectUnauthorized: false }
        });
    }

    // connection functions
    async connect() {
        const client = await this.pool.connect();
        const query = `
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(255) PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                salt VARCHAR(255) NOT NULL,
                color VARCHAR(50),
                created_at TIMESTAMP NOT NULL
            );
        `;
        await client.query(query);
        client.release();
        return true;
    }

    // retrieval functions
    async getUserByUsername(username) {
        const result = await this.pool.query('SELECT * FROM users WHERE username = $1', [username]);
        return mapUserRow(result.rows[0]);
    }

    // retrieval functions
    async getUserById(userId) {
        const result = await this.pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        return mapUserRow(result.rows[0]);
    }

    // modification functions
    async createUser(user) {
        const query = `
            INSERT INTO users (id, username, password_hash, salt, color, created_at) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *
        `;
        const values = [user.userId, user.username, user.passwordHash, user.salt, user.color, user.createdAt];
        const result = await this.pool.query(query, values);
        return mapUserRow(result.rows[0]);
    }

    // modification functions
    async updateUser(userId, updates) {
        const fields = [];
        const values = [];
        let index = 1;

        if (updates.username) {
            fields.push(`username = $${index++}`);
            values.push(updates.username);
        }
        if (updates.color) {
            fields.push(`color = $${index++}`);
            values.push(updates.color);
        }
        if (updates.passwordHash) {
            fields.push(`password_hash = $${index++}`);
            values.push(updates.passwordHash);
            fields.push(`salt = $${index++}`);
            values.push(updates.salt);
        }

        if (fields.length === 0) return null;

        values.push(userId);
        const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`;
        
        const result = await this.pool.query(query, values);
        return mapUserRow(result.rows[0]);
    }

    // modification functions
    async deleteUser(userId) {
        await this.pool.query('DELETE FROM users WHERE id = $1', [userId]);
    }
}