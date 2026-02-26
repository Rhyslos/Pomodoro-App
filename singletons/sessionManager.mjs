import { Room } from '../modules/room.mjs';
import { createRoomCode } from '../modules/lib.mjs';

// Session manager class
class SessionManager {

    // Session lifecycle functions
    createSession(hostUser) {
        const roomId = createRoomCode();
        const newRoom = new Room(roomId, hostUser);
        return newRoom;
    }

    getSession(roomId) {
        return null;
    }

    async endSession(roomId) {
        return;
    }
}

// Export variables
const sessionManager = new SessionManager();
export { sessionManager };