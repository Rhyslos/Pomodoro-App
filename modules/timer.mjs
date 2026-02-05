

class pomodoroTimer{
    constructor(timer, task, set){
        this.timer  = timer;
        this.task   = task;
        this.set    = set;
    }

    startTimer(minutes){
        let remainingTime = minutes * 60 * 1000;

        const intervalID = setInterval(() => {
            const mins = Math.floor(remainingTime / 60000);
            const secs = Math.floor((remainingTime % 60000) / 1000);

            const formattedTime = `${mins}:${secs.toString().padStart(2, '0')}`
            console.log(formattedTime);

            remainingTime -= 1000;
            if(remainingTime < 0){
                clearInterval(intervalID);
            }
        }, 1000);
    }

}

export {pomodoroTimer};