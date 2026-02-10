import { Room } from './room.mjs';
import db from './database.mjs';

class SessionManager {
    constructor() {
        this.sessions = new Map();
    }

    // Session Lifecycle Functions
    createSession(hostUser) {
        const roomId = this.generateRoomId();
        
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

        // Archive the log
        const historyLog = room.exportHistory();
        await db.saveSessionLog(historyLog);

        // Delete from RAM
        this.sessions.delete(roomId);
    }

    // Helper Functions
    generateRoomId() {
        return 'ROOM-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    }
}

export { SessionManager };