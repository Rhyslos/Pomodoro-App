import { Room } from '../modules/room.mjs';
import { createRoomCode } from '../modules/lib.mjs';

class SessionManager {
    constructor() {
        this.sessions = new Map();
    }

    // session lifecycle functions
    async createSession(hostUser, settings = {}) {
        const roomId = createRoomCode();
        const newRoom = new Room(roomId, hostUser, settings);
        this.sessions.set(roomId, newRoom);
        
        return newRoom;
    }

    // session lifecycle functions
    getSession(roomId) {
        return this.sessions.get(roomId) || null;
    }

    // session lifecycle functions
    async endSession(roomId) {
        const room = this.sessions.get(roomId);
        if (room) {
            this.sessions.delete(roomId);
        }
    }
}

// export functions
const sessionManager = new SessionManager();
export { sessionManager };