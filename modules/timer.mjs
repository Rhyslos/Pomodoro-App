// State variables
let timerState = {
    IDLE: "idle",
    WORK: "work",
    BREAK: "break",
    FINISHED: "finished",
}

// Timer management classes
class pomodoroTimer {
    constructor(workTime, breakTime, longBreakTime, targetSets, autoStart, task) {
        this.workTime = workTime;
        this.breakTime = breakTime;
        this.longBreakTime = longBreakTime;
        this.targetSets = targetSets;
        this.autoStart = autoStart;
        this.task = task || "Study Group";
        
        this.currentSet = 0;
        this.remainingTime = this.workTime * 60 * 1000; 
        this.currentState = timerState.IDLE;
        this.isPaused = false;
        
        this.intervalID = null;
    }

    // Timer action functions
    startTimer() {
        if (this.currentState !== timerState.IDLE && this.currentState !== timerState.FINISHED) return;

        this.currentState = timerState.WORK;
        this.remainingTime = this.workTime * 60 * 1000;
        this.isPaused = false;
        this.currentSet = 0;

        this.runInterval();
    }

    pauseTimer() {
        if (this.intervalID) {
            clearInterval(this.intervalID);
            this.intervalID = null;
            this.isPaused = true;
        }
    }

    resumeTimer() {
        if (this.isPaused && (this.currentState === timerState.WORK || this.currentState === timerState.BREAK)) {
            this.isPaused = false;
            this.runInterval();
        }
    }

    stopTimer() {
        if (this.intervalID) {
            clearInterval(this.intervalID);
            this.intervalID = null;
        }
        this.currentState = timerState.IDLE;
        this.isPaused = false;
        this.remainingTime = this.workTime * 60 * 1000;
        this.currentSet = 0;
    }

    runInterval() {
        if (this.intervalID) clearInterval(this.intervalID);

        this.intervalID = setInterval(() => {
            this.remainingTime -= 1000;

            if (this.remainingTime < 0) {
                clearInterval(this.intervalID);
                this.handlePhaseChange();
            }
        }, 1000);
    }

    handlePhaseChange() {
        if (this.currentState === timerState.WORK) {
            this.currentSet++;
            this.currentState = timerState.BREAK;
            
            // Trigger long break after target sets are completed
            if (this.currentSet % this.targetSets === 0) {
                this.remainingTime = this.longBreakTime * 60 * 1000; 
            } else {
                this.remainingTime = this.breakTime * 60 * 1000; 
            }

            if (this.autoStart) {
                this.runInterval();
            } else {
                this.isPaused = true;
            }
        } 
        else if (this.currentState === timerState.BREAK) {
            this.currentState = timerState.WORK;
            this.remainingTime = this.workTime * 60 * 1000;
            
            if (this.autoStart) {
                this.runInterval();
            } else {
                this.isPaused = true;
            }
        }
    }

    // Data retrieval functions
    getStatus() {
        return {
            state: this.currentState,
            isPaused: this.isPaused,
            remaining: Math.ceil(this.remainingTime / 1000),
            currentSet: this.currentSet,
            targetSets: this.targetSets,
            task: this.task
        };
    }
}

// Export variables
export { pomodoroTimer };