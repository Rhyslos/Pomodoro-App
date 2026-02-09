let timerState = {
    IDLE: "idle",
    WORK: "work",
    BREAK: "break",
    FINISHED: "finished",
}

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
            const mins = Math.floor(this.remainingTime / 60000);
            const secs = Math.floor((this.remainingTime % 60000) / 1000);
            console.log(`Set ${this.currentSet} / ${this.targetSets} finished.`);

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
            console.log(`Set ${this.currentSet} / ${this.targetSets} finished.`);

            if (this.currentSet < this.targetSets) {
                console.log(`Starting ${this.breakTime} min break...`);
                this.currentState = timerState.BREAK;
                this.remainingTime = this.breakTime * 60 * 1000; 
                this.runInterval(); 
            } else {
                this.currentState = timerState.FINISHED;
                console.log("All sets finished!");
            }
        } 
        else if (this.currentState === timerState.BREAK) {
            console.log("Break over! Back to work.");
            this.currentState = timerState.WORK;
            this.remainingTime = this.workTime * 60 * 1000;
            this.runInterval(); 
        }
    }

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