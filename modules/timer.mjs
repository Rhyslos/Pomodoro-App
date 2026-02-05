
let timerState = {
    IDLE: "idle",
    INSESSION: "in_session",
    FINISHED: "finished",
}

class pomodoroTimer{
    constructor(timer, task, set){
        this.timer  = timer;
        this.task   = task;
        this.set    = 0;
        this.currentState = timerState.IDLE;
    }

    startTimer(minutes){
        this.currentState = timerState.INSESSION; // Corrected: Updates class property
        let remainingTime = minutes * 60 * 1000;

        const intervalID = setInterval(() => {
            const mins = Math.floor(remainingTime / 60000);
            const secs = Math.floor((remainingTime % 60000) / 1000);

            const formattedTime = `${mins}:${secs.toString().padStart(2, '0')}`
            console.log(formattedTime);

            remainingTime -= 1000;
            if(remainingTime < 0){
                clearInterval(intervalID);
                this.currentState = timerState.FINISHED; // Corrected: Updates class property
                console.log("timerState finished")
                this.finishedTask();
            }
        }, 1000);
    }

    finishedTask() {
        if(this.currentState === timerState.FINISHED){ // Corrected: Matches constructor name
            this.set++;
            console.log(this.set)
            console.log("did this fire?")
        }
    }

}

export {pomodoroTimer};