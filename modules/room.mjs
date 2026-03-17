import { PomodoroTimer } from './timer.mjs';

// room management classes
class Room {
    constructor(roomId, hostUser, customSettings = {}) {
        this.id = roomId;
        this.host = hostUser;
        this.users = new Set([hostUser]); 
        this.maxUsers = 1;
        this.clients = new Set(); 
        this.userConnections = new Map();
        
        this.startTime = new Date().toISOString();
        this.isLocked = false;
        this.bannedUsers = new Set();
        this.tasks = [];
        this.telemetry = { tasksCreated: 0, tasksCompleted: 0 };

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
        this.timer = new PomodoroTimer(
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
    addClient(res, userId) {
        this.clients.add(res);
        res.userId = userId;
        
        const currentConnections = this.userConnections.get(userId) || 0;
        this.userConnections.set(userId, currentConnections + 1);
    }

    // connection functions
    removeClient(res) {
        this.clients.delete(res);
        
        if (res.userId) {
            const currentConnections = this.userConnections.get(res.userId) || 1;
            this.userConnections.set(res.userId, currentConnections - 1);
            
            if (currentConnections - 1 <= 0) {
                setTimeout(() => {
                    if (this.userConnections.get(res.userId) <= 0) {
                        this.leave(res.userId); 
                    }
                }, 3000);
            }
        }
    }

    // room teardown function
    terminate() {
        this.timer.stopTimer();
        
        for (let client of this.clients) {
            if (!client.writableEnded && !client.destroyed) {
                client.end(); 
            }
        }
        this.clients.clear();
    }

    // broadcasting functions
    broadcast() {
        const data = `data: ${JSON.stringify(this.getStatus())}\n\n`;
        for (let client of this.clients) {
            if (client.writableEnded || client.destroyed) {
                this.removeClient(client);
            } else {
                client.write(data);
            }
        }
    }

    // settings functions
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.timer.stopTimer(); 
        this.timer = new PomodoroTimer(
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
                
                for (let client of this.clients) {
                    if (client.userId === targetId && !client.writableEnded && !client.destroyed) {
                        client.end();
                    }
                }

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
        for (let task of this.tasks) {
            if (task.userId === updatedUserData.userId) {
                task.username = updatedUserData.username || task.username;
                task.color = updatedUserData.color || task.color;
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
            task.completedAt = new Date().toISOString();
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

// export functions
export { Room };