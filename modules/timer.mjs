
let timerState = {
    IDLE:       "idle",
    WORK:       "work",
    PAUSE:      "pause",
    FINISHED:   "finished",
}

class pomodoroTimer{
    constructor(timer, task, set){
        this.timer  = timer;
        this.task   = task;
        this.set    = 0;
        this.currentState = timerState.IDLE;
    }

    startTimer(minutes){
        this.currentState = timerState.INSESSION;
        let remainingTime = minutes * 60 * 1000;

        const intervalID = setInterval(() => {
            const mins = Math.floor(remainingTime / 60000);
            const secs = Math.floor((remainingTime % 60000) / 1000);

            const formattedTime = `${mins}:${secs.toString().padStart(2, '0')}`
            console.log(formattedTime);

            remainingTime -= 1000;
            if(remainingTime < 0){
                clearInterval(intervalID);
                this.currentState = timerState.FINISHED;
                console.log("timerState finished")
                this.finishedTask();
            }
        }, 1000);
    }

    finishedTask() {
        if(this.currentState === timerState.FINISHED){
            this.set++;
            console.log(this.set)
        }
    }

}

export {pomodoroTimer};