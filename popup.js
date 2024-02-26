document.addEventListener("DOMContentLoaded", () => {
  let timerButton = document.getElementById("timerButton");
  let resetButton = document.getElementById("resetButton");
  let durationSelect = document.getElementById("durationSelect");
  let timeInput = document.getElementById("timeInput");
  const setBtn = document.getElementById("setButton");
  let timer = document.getElementById("timer");

  let isTimerRunning = false;
  let isTimerPaused = false;
  let savedWork;
  let savedShort;
  let savedLong;
  let duration;

  durationSelect.addEventListener("change", () => {
    if (savedWork && durationSelect.value == "pomodoro") {
      timeInput.value = savedWork;
    } else if (savedShort && durationSelect.value == "shortbreak") {
      timeInput.value = savedShort;
    } else if (savedLong && durationSelect.value == "longbreak") {
      timeInput.value = savedLong;
    }
  });

  timeInput.addEventListener("change", (event) => {
    const val = event.target.value;
    if (val < 1 || val > 60) {
      timeInput.value = 25;
    }
  });

  setBtn.addEventListener("click", () => {
    if (durationSelect.value == "pomodoro") {
      chrome.storage.sync.set({ workDuration: savedWork });
    } else if (durationSelect.value == "shortbreak") {
      chrome.storage.sync.set({ shortBreakDuration: savedShort });
    } else if (durationSelect.value == "longbreak") {
      chrome.storage.sync.set({ longBreakDuration: savedLong });
    }
  });

  // Get the current duration from the background script and display it
  chrome.runtime.sendMessage({ action: "getDuration" }, (response) => {
    timer.innerText = response.duration;
  });

  chrome.storage.sync.get(["isTimerRunning", "isTimerPaused"], (data) => {
    isTimerRunning = data.isTimerRunning;
    isTimerPaused = data.isTimerPaused;
    if (isTimerRunning) {
      timerButton.textContent = isTimerPaused ? "Resume" : "Pause";
    }
  });

  timerButton.addEventListener("click", () => {
    if (!isTimerRunning) {
      if (timeInput.value < 1) {
        alert("Duration must be at least 1 minute.");
        return;
      }
      chrome.storage.sync.get("remainingDuration", (data) => {
        duration = data.remainingDuration;
      });
      duration *= 60;
      chrome.runtime.sendMessage({ action: "startTimer", duration: duration });
      timerButton.textContent = "Pause";
      isTimerRunning = true;
    } else if (!isTimerPaused) {
      chrome.runtime.sendMessage({ action: "pauseTimer" });
      timerButton.textContent = "Resume";
      isTimerPaused = true;
    } else {
      chrome.runtime.sendMessage({ action: "resumeTimer" });
      timerButton.textContent = "Pause";
      isTimerPaused = false;
    }

    chrome.storage.sync.set({
      isTimerRunning: isTimerRunning,
      isTimerPaused: isTimerPaused,
    });
  });

  resetButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "resetTimer" });
    timerButton.textContent = "Start";
    isTimerRunning = false;
    isTimerPaused = false;
    // Store button state
    chrome.storage.sync.set({
      isTimerRunning: isTimerRunning,
      isTimerPaused: isTimerPaused,
    });
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updateTimer") {
      // Update the timer display
      timer.innerText = request.duration;
    }
  });

  // Get the remaining duration from storage and display it
  chrome.storage.sync.get("remainingDuration", (data) => {
    timer.innerText = data.remainingDuration;
  });
});
