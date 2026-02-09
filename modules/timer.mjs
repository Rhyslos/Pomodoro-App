
let timerState = {
    IDLE:       "idle",
    INSESSION:  "in_session",
    PAUSE:      "pause",
    FINISHED:   "finished",
}

class pomodoroTimer{
    constructor(timer, task, set){
        this.timer  = timer;
        this.task   = task;

        this.targetSets = set;
        this.set    = 0;

        this.remainingTime = this.timer * 60 * 1000;
        this.currentState = timerState.IDLE;

        this.intervalID = null;
    }

    startTimer(minutes){
        if(this.currentState === timerState.INSESSION || this.currentState === timerState.PAUSE) return;
        
        this.currentState = timerState.INSESSION;

        if(this.remainingTime <= 0 || this.remainingTime === this.timer * 60 * 1000){
            this.remainingTime = this.timer * 60 * 1000;
        }

        this.runInternval();
    }

    finishedTask() {
        if(this.currentState === timerState.FINISHED){
            this.set++;
            console.log(this.set)
        }
    }

}

export {pomodoroTimer};