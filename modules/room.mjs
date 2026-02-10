import { PomodoroTimer } from './timer.mjs';

class Room {
    constructor(roomId, hostUser) {
        this.id = roomId;
        this.host = hostUser;
        this.users = new Set([hostUser]);

        this.settings = {
            workTime: 25,
            breakTime: 5,
            task: "Study Group",
            targetSets: 4
        };

        this.timer = new PomodoroTimer(
            this.settings.workTime, 
            this.settings.breakTime, 
            this.settings.task, 
            this.settings.targetSets
        );
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };

        this.timer.stop();
        
        this.timer = new PomodoroTimer(
            this.settings.workTime, 
            this.settings.breakTime, 
            this.settings.task, 
            this.settings.targetSets
        );
        
        console.log(`Room ${this.id} settings updated & timer reset.`);
    }

    join(user) {
        if (this.users.size >= 16) {
            return false;
        }
        this.users.add(user);
        return true;
    }

    leave(user) {
        this.users.delete(user);
    }

    startSession() {
        this.timer.start();
    }
    
    stopSession() {
        this.timer.stop();
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