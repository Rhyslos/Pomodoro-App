// State variables
let timerState = {
    IDLE: "idle",
    WORK: "work",
    BREAK: "break",
    FINISHED: "finished",
}

// Timer class
class pomodoroTimer {
    constructor(workTime, breakTime, task, targetSets) {
        this.workTime = workTime;
        this.breakTime = breakTime;
        this.task = task;
        this.targetSets = targetSets;
        
        this.currentSet = 0;
        this.remainingTime = this.workTime * 60 * 1000; 
        this.currentState = timerState.IDLE;
        
        this.intervalID = null;
    }

    // Timer action functions
    startTimer() {
        if (this.currentState === timerState.WORK || this.currentState === timerState.BREAK) return;

        if (this.currentState === timerState.IDLE) {
            this.currentState = timerState.WORK;
            this.remainingTime = this.workTime * 60 * 1000;
        }

        this.runInterval();
    }

    stopTimer() {
        if (this.intervalID) {
            clearInterval(this.intervalID);
            this.intervalID = null;
        }
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

            if (this.currentSet < this.targetSets) {
                this.currentState = timerState.BREAK;
                this.remainingTime = this.breakTime * 60 * 1000; 
                this.runInterval(); 
            } else {
                this.currentState = timerState.FINISHED;
            }
        } 
        else if (this.currentState === timerState.BREAK) {
            this.currentState = timerState.WORK;
            this.remainingTime = this.workTime * 60 * 1000;
            this.runInterval(); 
        }
    }

    // Data retrieval functions
    getStatus() {
        return {
            state: this.currentState,
            remaining: Math.ceil(this.remainingTime / 1000),
            currentSet: this.currentSet,
            targetSets: this.targetSets,
            task: this.task
        };
    }
}

export { pomodoroTimer };