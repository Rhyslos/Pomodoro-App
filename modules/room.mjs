import { pomodoroTimer } from './timer.mjs';

class Room {
    constructor(roomId, hostUser) {
        this.id = roomId;
        this.host = hostUser;
        this.users = new Set([hostUser]); 
        
        // Logging Data
        this.startTime = new Date().toISOString();
        this.activityLog = [];
        this.logAction(hostUser, "CREATED_ROOM");

        // Timer Setup
        this.settings = {
            workTime: 25,
            breakTime: 5,
            task: "Study Group",
            targetSets: 4
        };

        this.timer = new pomodoroTimer(
            this.settings.workTime, 
            this.settings.breakTime, 
            this.settings.task, 
            this.settings.targetSets
        );
    }

    // Logging Functions
    logAction(user, action) {
        this.activityLog.push({
            user: user.username || user.id, // Log name if available
            action: action,
            time: new Date().toISOString()
        });
    }

    exportHistory() {
        return {
            sessionId: this.id,
            hostId: this.host.id,
            startTime: this.startTime,
            endTime: new Date().toISOString(),
            activityLog: this.activityLog
        };
    }

    // Settings Functions
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.timer.stopTimer(); 
        
        this.timer = new pomodoroTimer(
            this.settings.workTime, 
            this.settings.breakTime, 
            this.settings.task, 
            this.settings.targetSets
        );
        this.logAction(this.host, "UPDATED_SETTINGS");
    }

    // Participant Functions
    join(user) {
        if (this.users.size >= 16) return false;
        
        this.users.add(user);
        this.logAction(user, "JOIN");
        return true;
    }

    leave(user) {
        this.users.delete(user);
        this.logAction(user, "LEAVE");
    }

    // Timer Pass-Through Functions
    startSession() {
        this.timer.startTimer();
        this.logAction(this.host, "STARTED_SESSION");
    }
    
    stopSession() {
        this.timer.stopTimer();
        this.logAction(this.host, "STOPPED_SESSION");
    }

    getStatus() {
        return {
            id: this.id,
            host: this.host,
            users: Array.from(this.users),
            timer: this.timer.getStatus(),
            settings: this.settings
        };
    }
}

export { Room };