let timer = null;
let duration = 0;
let isPaused = false;

const Session = {
  Work: "work",
  ShortBreak: "shortBreak",
  LongBreak: "longBreak",
};

let currentSession = Session.Work;
let workSessionsCompleted = 0;

// function updateDurationsFromStorage(callback) {
//   // chrome.storage.sync.get(['workDuration', 'shortBreakDuration', 'longBreakDuration', 'duration'], (data) => {
//   //   workDuration = data.workDuration;
//   //   shortBreakDuration = data.shortBreakDuration;
//   //   longBreakDuration = data.longBreakDuration;
//   //   duration = data.duration;
//   callback();
// }

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startTimer") {
    // updateDurationsFromStorage( () => {
    if ((currentSession = Session.Work)) {
      chrome.storage.sync.get("workDuration", (data) => {
        duration = data.workDuration;
        console.log(
          "Work duration set in startTimer message handler: ",
          duration
        );
      });
    } else if ((currentSession = Session.ShortBreak)) {
      chrome.storage.sync.get("shortBreakDuration", (data) => {
        duration = data.shortBreakDuration;
        console.log(
          "Short duration set in startTimer message handler: ",
          duration
        );
      });
    } else {
      chrome.storage.sync.get("longBreakDuration", (data) => {
        duration = data.longBreakDuration;
        console.log(
          "Long duration set in startTimer message handler: ",
          duration
        );
      });
    }
    isPaused = false;
    startTimer();
    // });
  } else if (request.action === "pauseTimer") {
    isPaused = true;
  } else if (request.action === "resumeTimer") {
    isPaused = false;
  } else if (request.action === "resetTimer") {
    clearInterval(timer);
    duration = 0;
    isPaused = false;
    currentSession = Session.Work;
    chrome.runtime.sendMessage({
      action: "updateTimer",
      duration: formatDuration(duration),
    });
  } else if (request.action === "getDuration") {
    sendResponse({ duration: formatDuration(duration) });
  }

  return true;
});

function startTimer() {
  if (timer) {
    clearInterval(timer);
  }

  timer = setInterval(() => {
    if (!isPaused) {
      duration--;
      console.log("Duration updated in setInterval function:", duration); // test
      if (duration <= 0) {
        clearInterval(timer);
        switch (currentSession) {
          case Session.Work:
            console.log("duration " + duration); // test
            workSessionsCompleted++;
            if (workSessionsCompleted === 4) {
              currentSession = Session.LongBreak;
              // duration = longBreakDuration;
            } else {
              currentSession = Session.ShortBreak;
            }
            break;
          case Session.ShortBreak:
            // duration = shortBreakDuration;
            console.log("This is the short break: " + shortBreakDuration); // test for case
          case Session.LongBreak:
            console.log("This is the long break: " + longBreakDuration); // test for case
            // currentSession = Session.Work;
            // duration = workDuration;
            break;
        }
        startTimer();
      }
      // Store the remaining duration
      chrome.storage.sync.set({ remainingDuration: duration });
    }

    // Send a message to the popup to update the display
    chrome.runtime.sendMessage({
      action: "updateTimer",
      duration: formatDuration(duration),
    });
  }, 1000);
}

function formatDuration(duration) {
  let minutes = Math.floor(duration / 60);
  let seconds = duration % 60;
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  return String(minutes) + ":" + String(seconds);
}
