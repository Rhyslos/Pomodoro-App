let timerState = {
    IDLE: "idle",
    WORK: "work",
    BREAK: "break",
    FINISHED: "finished",
}

class pomodoroTimer {
    constructor(workTime, breakTime, longBreakTime, targetSets, autoStart, task) {
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
    }

    // timer action functions
    startTimer() {
        if (this.currentState !== timerState.IDLE && this.currentState !== timerState.FINISHED) return;

        this.currentState = timerState.WORK;
        this.remainingTime = this.workTime * 60 * 1000;
        this.targetEndTime = Date.now() + this.remainingTime;
        this.isPaused = false;
        this.currentSet = 0;
        this.lastUpdatedAt = new Date().toISOString();

        this.runInterval();
    }

    // timer action functions
    pauseTimer() {
        if (this.intervalID) {
            clearInterval(this.intervalID);
            this.intervalID = null;
            
            if (!this.isPaused && this.targetEndTime) {
                this.remainingTime = Math.max(0, this.targetEndTime - Date.now());
            }
            
            this.isPaused = true;
            this.lastUpdatedAt = new Date().toISOString();
        }
    }

    // timer action functions
    resumeTimer() {
        if (this.isPaused && (this.currentState === timerState.WORK || this.currentState === timerState.BREAK)) {
            this.isPaused = false;
            this.targetEndTime = Date.now() + this.remainingTime;
            this.lastUpdatedAt = new Date().toISOString();
            this.runInterval();
        }
    }

    // timer action functions
    stopTimer() {
        if (this.intervalID) {
            clearInterval(this.intervalID);
            this.intervalID = null;
        }
        this.currentState = timerState.IDLE;
        this.isPaused = false;
        this.remainingTime = this.workTime * 60 * 1000;
        this.targetEndTime = null;
        this.currentSet = 0;
        this.lastUpdatedAt = null;
    }

    // timer execution functions
    runInterval() {
        if (this.intervalID) clearInterval(this.intervalID);

        this.intervalID = setInterval(() => {
            if (!this.isPaused && this.targetEndTime) {
                this.remainingTime = Math.max(0, this.targetEndTime - Date.now());
            }
            
            this.lastUpdatedAt = new Date().toISOString();

            if (this.remainingTime <= 0) {
                clearInterval(this.intervalID);
                this.handlePhaseChange();
            }
        }, 1000);
    }

    // timer execution functions
    handlePhaseChange() {
        if (this.currentState === timerState.WORK) {
            this.currentSet++;
            this.currentState = timerState.BREAK;
            
            if (this.currentSet > 0 && this.currentSet % this.targetSets === 0) {
                this.remainingTime = this.longBreakTime * 60 * 1000; 
            } else {
                this.remainingTime = this.breakTime * 60 * 1000; 
            }
        } 
        else if (this.currentState === timerState.BREAK) {
            this.currentState = timerState.WORK;
            this.remainingTime = this.workTime * 60 * 1000;
        }

        this.targetEndTime = Date.now() + this.remainingTime;
        this.lastUpdatedAt = new Date().toISOString();

        if (this.onStateChange) this.onStateChange();

        if (this.autoStart) {
            this.runInterval();
        } else {
            this.isPaused = true;
            this.targetEndTime = null; 
        }
    }

    // data retrieval functions
    getStatus() {
        let currentRemaining = this.remainingTime;
        if (!this.isPaused && this.targetEndTime && this.currentState !== timerState.IDLE && this.currentState !== timerState.FINISHED) {
            currentRemaining = Math.max(0, this.targetEndTime - Date.now());
        }

        return {
            state: this.currentState,
            isPaused: this.isPaused,
            remaining: Math.ceil(currentRemaining / 1000),
            currentSet: this.currentSet,
            targetSets: this.targetSets,
            task: this.task,
            lastUpdatedAt: this.lastUpdatedAt,
        };
    }
}

export { pomodoroTimer };