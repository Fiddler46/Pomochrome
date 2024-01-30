document.addEventListener('DOMContentLoaded', () => {
  let timerButton = document.getElementById('timerButton');
  let resetButton = document.getElementById('resetButton');
  let isTimerRunning = false;
  let isTimerPaused = false;

  // Get the current duration from the background script and display it
  chrome.runtime.sendMessage({action: 'getDuration'}, (response) => {
    document.getElementById('timer').innerText = response.duration;
  });

  chrome.storage.sync.get(['isTimerRunning', 'isTimerPaused'], (data) => {
    isTimerRunning = data.isTimerRunning;
    isTimerPaused = data.isTimerPaused;
    if (isTimerRunning) {
      timerButton.textContent = isTimerPaused ? 'Resume' : 'Pause';
    }
  });

  timerButton.addEventListener('click', () => {
    if (!isTimerRunning) {
      let duration = parseInt(document.getElementById('workDuration').value, 10);
      if (duration < 1) {
        alert('Work duration must be at least 1 minute.');
        return;
      }

      duration *= 60;
      chrome.runtime.sendMessage({action: 'startTimer', duration: duration});
      timerButton.textContent = 'Pause';
      isTimerRunning = true;
    } else if (!isTimerPaused) {
      chrome.runtime.sendMessage({action: 'pauseTimer'});
      timerButton.textContent = 'Resume';
      isTimerPaused = true;
    } else {
      chrome.runtime.sendMessage({action: 'resumeTimer'});
      timerButton.textContent = 'Pause';
      isTimerPaused = false;
    }
    chrome.storage.sync.set({isTimerRunning: isTimerRunning, isTimerPaused: isTimerPaused});
  });

  resetButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({action: 'resetTimer'});
    timerButton.textContent = 'Start';
    isTimerRunning = false;
    isTimerPaused = false;
    // Store button state
    chrome.storage.sync.set({isTimerRunning: isTimerRunning, isTimerPaused: isTimerPaused});
  })

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updateTimer') {
      // Update the timer display
      document.getElementById('timer').innerText = request.duration;
    }
  });

  // Get the remaining duration from storage and display it
  chrome.storage.sync.get('remainingDuration', (data) => {
    document.getElementById('timer').innerText = data.remainingDuration;
  });
});
