let timer = null;
let duration = 0;
let isPaused = false;

const Session = {
  Work: 'work',
  ShortBreak: 'shortBreak',
  LongBreak: 'longBreak',
};

let currentSession = Session.Work;
let workSessionsCompleted = 0;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startTimer') {
    chrome.storage.sync.get(['workDuration', 'shortBreakDuration', 'longBreakDuration'], (data) => {
      workDuration = data.workDuration;
      shortBreakDuration = data.shortBreakDuration;
      longBreakDuration = data.longBreakDuration;
    duration = request.duration;
    isPaused = false;
    startTimer();
  })
  } else if (request.action === 'pauseTimer') {
    isPaused = true;
  } else if (request.action === 'resumeTimer') {
    isPaused = false;
  } else if(request.action === 'resetTimer') {
    clearInterval(timer);
    duration = 0;
    isPaused = false;
    currentSession = Session.Work;
    chrome.runtime.sendMessage({action: 'updateTimer', duration: formatDuration(duration)});
  } else if (request.action === 'getDuration') {
    sendResponse({duration: formatDuration(duration)});
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
      if (duration <= 0) {
        clearInterval(timer);
        switch (currentSession) {
          case Session.Work:
            console.log("work duration: " + workDuration);
            console.log("duration " + duration);
            workSessionsCompleted++;  
            if (workSessionsCompleted === 4) {
              currentSession = Session.LongBreak;
              duration = longBreakDuration;
            } else {
              currentSession = Session.ShortBreak;
              duration = shortBreakDuration;
            }
            break;
          case Session.ShortBreak:
          case Session.LongBreak:
            currentSession = Session.Work;
            duration = workDuration;
            break;
        }
        startTimer();
      }
      // Store the remaining duration
      chrome.storage.sync.set({remainingDuration: duration});
    }

    // Send a message to the popup to update the display
    chrome.runtime.sendMessage({action: 'updateTimer', duration: formatDuration(duration)});
  }, 1000);
}

function formatDuration(duration) {
  let minutes = Math.floor(duration / 60);
  let seconds = duration % 60;
  if (seconds < 10) {
    seconds = '0' + seconds;
  }
  return String(minutes) + ':' + String(seconds);
}

chrome.runtime.onConnect.addListener('DOMContentLoaded', (port) => {  
  // Listen for messages from the popup
  port.onMessage.addListener((msg) => {
      // Check if the message is to execute myFunction
      if (msg.action === 'formatThisDuration') {
          myFunction(msg.argument);
      }

      return true;
  });
  return true;
});
