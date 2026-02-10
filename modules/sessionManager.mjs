import { Room } from './room.mjs';
import db from '../database/database.mjs';
import { createRoomCode } from './lib.mjs';

class SessionManager {
    constructor() {
        this.sessions = new Map();
    }

    // Session Lifecycle Functions
    createSession(hostUser) {
        const roomId = createRoomCode();
        
        const newRoom = new Room(roomId, hostUser);
        this.sessions.set(roomId, newRoom);
        
        return newRoom;
    }

    getSession(roomId) {
        return this.sessions.get(roomId);
    }

    async endSession(roomId) {
        const room = this.sessions.get(roomId);
        if (!room) return;

        const historyLog = room.exportHistory();
        await db.saveSessionLog(historyLog);

        this.sessions.delete(roomId);
    }
}

export { SessionManager };