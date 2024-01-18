let timer = 0;
let isRunning = false;

startTimer = (duration) => {
    let timerElement = document.getElementById("timer");
    let startButton = document.getElementById("startButton");

    timer = setInterval( function () {
        let minutes = parseInt(duration / 60, 10);
        let seconds = parseInt(duration % 60, 10);

        timerElement = minutes + ":" + seconds;

        if(duration <= 0) {
            clearInterval(timer);
            timerElement.textContent = "00:00";
            startButton.textContent = "START";
            isRunning = false;
        }

        duration--;
    }, 1000);
}

    document.addEventListener("DOMContentLoaded", function () {
        let startButton = document.getElementById("startButton");
        let resetButton = document.getElementById("resetButton");

        startButton.addEventListener("click", function () {
            if (isRunning) {
              clearInterval(timer);
              startButton.textContent = "Resume";
            } else {
              let workDuration = parseInt(document.getElementById("workDuration").value, 10) * 60;
              startTimer(workDuration);
              startButton.textContent = "Pause";
            }

            isRunning = !isRunning;
        });
        
        resetButton.addEventListener("click", function () {
            clearInterval(timer);
            document.getElementById("timer").textContent = "25:00";
            startButton.textContent = "Start";
            isRunning = false;
          });
    });
    