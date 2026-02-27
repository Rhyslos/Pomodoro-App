// Database class
class DatabaseMock {
    constructor() {
        this.roomMetrics = new Map();
    }

    // Database insertion functions
    async insertRoom(roomData) {
        this.roomMetrics.set(roomData.roomId, {
            ...roomData,
            status: 'active'
        });
        return true;
    }

    // Database update functions
    async completeRoom(roomId, historyData) {
        const room = this.roomMetrics.get(roomId);
        if (room) {
            this.roomMetrics.set(roomId, {
                ...room,
                ...historyData,
                status: 'ended'
            });
        }
        return true;
    }
}

// Export variables
const db = new DatabaseMock();
export default db;