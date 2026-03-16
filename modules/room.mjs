import { pomodoroTimer } from './timer.mjs';

// room management classes
class Room {
    constructor(workTime, breakTime, longBreakTime, targetSets, autoStart, task, onStateChange) {
        this.workTime = workTime;
        this.breakTime = breakTime;
        this.longBreakTime = longBreakTime;
        this.targetSets = targetSets;
        this.autoStart = autoStart;
        this.task = task || "Study Group";
        this.onStateChange = onStateChange;
        
        this.currentSet = 0;
        this.remainingTime = this.workTime * 60 * 1000; 
        this.targetEndTime = null;
        this.currentState = timerState.IDLE;
        this.isPaused = false;
        
        this.intervalID = null;
        this.lastUpdatedAt = null; 

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

        // timer initialization functions
        this.timer = new pomodoroTimer(
            this.settings.workTime, 
            this.settings.breakTime, 
            this.settings.longBreakTime,
            this.settings.targetSets, 
            this.settings.autoStart, 
            this.settings.task,
            () => this.broadcast() 
        );
    }

    // connection functions
    addClient(res) {
        this.clients.add(res);
    }

    // connection functions
    removeClient(res) {
        this.clients.delete(res);
    }

    // broadcasting functions
    broadcast() {
        const data = `data: ${JSON.stringify(this.getStatus())}\n\n`;
        this.clients.forEach(client => client.write(data));
    }

    // settings functions
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.timer.stopTimer(); 
        this.timer = new pomodoroTimer(
            this.settings.workTime, 
            this.settings.breakTime, 
            this.settings.longBreakTime,
            this.settings.targetSets, 
            this.settings.autoStart, 
            this.settings.task,
            () => this.broadcast()
        );
        this.broadcast();
    }

    // participant functions
    join(user) {
        if (this.users.size >= 16 || this.isLocked || this.bannedUsers.has(user.userId)) return false;

        for (let existingUser of this.users) {
            if (existingUser.userId === user.userId) {
                existingUser.username = user.username;
                existingUser.color = user.color;
                this.broadcast();
                return true; 
            }
        }

        this.users.add(user);
        this.maxUsers = Math.max(this.maxUsers, this.users.size);
        this.broadcast();
        return true;
    }

    // participant functions
    leave(user) {
        const targetId = user.userId || user;
        for (let existingUser of this.users) {
            if (existingUser.userId === targetId) {
                this.users.delete(existingUser);
                this.broadcast();
                break;
            }
        }
    }

    // participant functions
    updateUserCache(updatedUserData) {
        for (let user of this.users) {
            if (user.userId === updatedUserData.userId) {
                user.username = updatedUserData.username || user.username;
                user.color = updatedUserData.color || user.color;
                break;
            }
        }
        this.broadcast();
    }

    // admin functions
    toggleLock(userId) {
        if (this.host.userId === userId) {
            this.isLocked = !this.isLocked;
            this.broadcast();
        }
    }

    // admin functions
    adminAction(hostId, targetUserId, action) {
        if (this.host.userId !== hostId || hostId === targetUserId) return;

        let targetUser = null;
        for (let u of this.users) {
            if (u.userId === targetUserId) {
                targetUser = u;
                break;
            }
        }

        if (action === 'kick' && targetUser) {
            this.leave(targetUser);
        } else if (action === 'ban' && targetUser) {
            this.bannedUsers.add(targetUserId);
            this.leave(targetUser);
        } else if (action === 'promote' && targetUser) {
            this.host = targetUser;
            this.broadcast();
        }
    }

    // task functions
    addTask(taskData) {
        this.tasks.push(taskData);
        this.telemetry.tasksCreated++;
        this.broadcast();
    }

    // task functions
    completeTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task && !task.completed) {
            task.completed = true;
            this.telemetry.tasksCompleted++;
            this.broadcast();
        }
    }

    // timer pass-through functions
    startSession() { this.timer.startTimer(); this.broadcast(); }
    pauseSession() { this.timer.pauseTimer(); this.broadcast(); }
    resumeSession() { this.timer.resumeTimer(); this.broadcast(); }
    stopSession() { this.timer.stopTimer(); this.broadcast(); }

    // data retrieval functions
    exportHistory() {
        const start = new Date(this.startTime);
        const end = new Date();
        return {
            endTime: end.toISOString(),
            durationSeconds: Math.floor((end - start) / 1000),
            maxParticipants: this.maxUsers,
            tasksCreated: this.telemetry.tasksCreated,
            tasksCompleted: this.telemetry.tasksCompleted
        };
    }

    // data retrieval functions
    getStatus() {
        return {
            id: this.id,
            host: this.host,
            users: Array.from(this.users),
            isLocked: this.isLocked,
            tasks: this.tasks,
            settings: this.settings,
            timer: this.timer.getStatus()
        };
    }
}

export { Room };