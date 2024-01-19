let timer = null;
let duration = 0;
let isPaused = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startTimer') {
    duration = request.duration;
    isPaused = false;
    startTimer();
  } else if (request.action === 'pauseTimer') {
    isPaused = true;
  } else if (request.action === 'resumeTimer') {
    isPaused = false;
  } else if(request.action === 'resetTimer') {
    clearInterval(timer);
    duration = 0;
    isPaused = false;
    chrome.runtime.sendMessage({action: 'updateTimer', duration: formatDuration(duration)});
  } else if (request.action === 'getDuration') {
    sendResponse({duration: formatDuration(duration)});
  }
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
      }
      // Store the remaining duration
      chrome.storage.sync.set({remainingDuration: duration});
    }

    // Send a message to the popup to update the display
    chrome.runtime.sendMessage({action: 'updateTimer', duration: duration});
  }, 1000);
}

function formatDuration(duration) {
    let minutes = Math.floor(duration / 60);
    let seconds = duration % 60;
    if (seconds < 10) {
      seconds = '0' + seconds;
    }
    return minutes + ':' + seconds;
  }