import { pomodoroTimer } from './timer.mjs';

// Room class
class Room {
    constructor(roomId, hostUser) {
        this.id = roomId;
        this.host = hostUser;
        this.users = new Set([hostUser]); 
        
        this.startTime = new Date().toISOString();

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

    // Settings functions
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.timer.stopTimer(); 
        
        this.timer = new pomodoroTimer(
            this.settings.workTime, 
            this.settings.breakTime, 
            this.settings.task, 
            this.settings.targetSets
        );
    }

    // Participant functions
    join(user) {
        if (this.users.size >= 16) return false;
        this.users.add(user);
        return true;
    }

    leave(user) {
        this.users.delete(user);
    }

    // Timer pass-through functions
    startSession() {
        this.timer.startTimer();
    }
    
    stopSession() {
        this.timer.stopTimer();
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