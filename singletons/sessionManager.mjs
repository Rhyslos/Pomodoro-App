import { Room } from '../modules/room.mjs';
import { createRoomCode } from '../modules/lib.mjs';
import db from '../modules/database.mjs';

// Session management classes
class SessionManager {
    constructor() {
        this.sessions = new Map();
    }

    // Session lifecycle functions
    async createSession(hostUser, settings = {}) {
        const roomId = createRoomCode();
        const newRoom = new Room(roomId, hostUser, settings);
        this.sessions.set(roomId, newRoom);
        
        await db.insertRoom({
            roomId: roomId,
            createdAt: newRoom.startTime
        });

        return newRoom;
    }

    getSession(roomId) {
        return this.sessions.get(roomId) || null;
    }

    async endSession(roomId) {
        const room = this.sessions.get(roomId);
        if (room) {
            const history = room.exportHistory();
            await db.completeRoom(roomId, history);
            this.sessions.delete(roomId);
        }
    }
}

// Export variables
const sessionManager = new SessionManager();
export { sessionManager };