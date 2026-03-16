import { pomodoroTimer } from './timer.mjs';

class Room {
    constructor(roomId, hostUser, customSettings = {}) {
        this.id = roomId;
        this.host = hostUser;
        this.users = new Set([hostUser]); 
        this.maxUsers = 1;
        
        this.startTime = new Date().toISOString();
        this.isLocked = false;
        this.bannedUsers = new Set();
        this.tasks = [];
        this.telemetry = {
            tasksCreated: 0,
            tasksCompleted: 0
        };

        this.settings = {
            workTime: 25,
            breakTime: 5,
            longBreakTime: 15,
            targetSets: 4,
            autoStart: false,
            task: "Study Group",
            roomName: `${hostUser.username}'s Room`,
            showCode: false,
            debugMode: false,
            ...customSettings
        };

        this.timer = new pomodoroTimer(
            this.settings.workTime, 
            this.settings.breakTime, 
            this.settings.longBreakTime,
            this.settings.targetSets,
            this.settings.autoStart,
            this.settings.task
        );
    }

    // Settings functions
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.timer.stopTimer(); 
        
        this.timer = new pomodoroTimer(
            this.settings.workTime, 
            this.settings.breakTime, 
            this.settings.longBreakTime,
            this.settings.targetSets,
            this.settings.autoStart,
            this.settings.task
        );
    }

    // Participant functions
    join(user) {
        if (this.users.size >= 16) return false;
        if (this.isLocked) return false;
        if (this.bannedUsers.has(user.userId)) return false;

        for (let existingUser of this.users) {
            if (existingUser.userId === user.userId) {
                existingUser.username = user.username;
                existingUser.color = user.color;
                return true; 
            }
        }

        this.users.add(user);
        this.maxUsers = Math.max(this.maxUsers, this.users.size);
        return true;
    }

    leave(user) {
        const targetId = user.userId || user;
        
        for (let existingUser of this.users) {
            if (existingUser.userId === targetId) {
                this.users.delete(existingUser);
                break;
            }
        }
    }

    updateUserCache(updatedUserData) {
        for (let user of this.users) {
            if (user.userId === updatedUserData.userId) {
                if (updatedUserData.color !== undefined) user.color = updatedUserData.color;
                if (updatedUserData.username !== undefined) user.username = updatedUserData.username;
                
                if (this.host.userId === updatedUserData.userId) {
                    this.host.color = user.color;
                    this.host.username = user.username;
                }
                break;
            }
        }

        for (let task of this.tasks) {
            if (task.userId === updatedUserData.userId) {
                if (updatedUserData.color !== undefined) task.color = updatedUserData.color;
                if (updatedUserData.username !== undefined) task.username = updatedUserData.username;
            }
        }
    }

    // Admin functions
    toggleLock(userId) {
        if (this.host.userId === userId) {
            this.isLocked = !this.isLocked;
        }
    }

    adminAction(hostId, targetUserId, action) {
        if (this.host.userId !== hostId || hostId === targetUserId) return;

        let targetUser = null;
        for (let user of this.users) {
            if (user.userId === targetUserId) {
                targetUser = user;
                break;
            }
        }

        if (!targetUser) return;

        if (action === 'kick') {
            this.leave(targetUser);
        } else if (action === 'ban') {
            this.bannedUsers.add(targetUserId);
            this.leave(targetUser);
        } else if (action === 'promote') {
            this.host = targetUser;
        }
    }

    // Task functions
    addTask(taskData) {
        this.tasks.push(taskData);
        this.telemetry.tasksCreated++;
    }

    completeTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task && !task.completed) {
            task.completed = true;
            this.telemetry.tasksCompleted++;
        }
    }

    // Timer pass-through functions
    startSession() {
        this.timer.startTimer();
    }

    pauseSession() {
        this.timer.pauseTimer();
    }

    resumeSession() {
        this.timer.resumeTimer();
    }
    
    stopSession() {
        this.timer.stopTimer();
    }

    // Data retrieval functions
    exportHistory() {
        const start = new Date(this.startTime);
        const end = new Date();
        const durationSeconds = Math.floor((end - start) / 1000);

        return {
            endTime: end.toISOString(),
            durationSeconds: durationSeconds,
            maxParticipants: this.maxUsers,
            tasksCreated: this.telemetry.tasksCreated,
            tasksCompleted: this.telemetry.tasksCompleted
        };
    }

    getStatus() {
        return {
            id: this.id,
            host: this.host,
            users: Array.from(this.users),
            isLocked: this.isLocked,
            tasks: this.tasks,
            timer: this.timer.getStatus(),
            settings: this.settings
        };
    }
}

// Export variables
export { Room };