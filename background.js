let currentUrl = '';
let startTime;
let accumulatedTime = {};
let isTracking = false;
let lastResetDate = new Date().toDateString();

// Load saved data when the extension starts
chrome.storage.local.get(null, (items) => {
  accumulatedTime = items.accumulatedTime || {};
  lastResetDate = items.lastResetDate || new Date().toDateString();
  console.log('Loaded accumulated time:', accumulatedTime);
  console.log('Last reset date:', lastResetDate);
  checkAndResetAtMidnight();
});

function updateCurrentTab() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      let newUrl = new URL(tabs[0].url).hostname;
      if (newUrl !== currentUrl) {
        updateTimeSpent();
        currentUrl = newUrl;
        startTime = Date.now();
        isTracking = true;
        saveState();
      }
    } else {
      isTracking = false;
    }
  });
}

function updateTimeSpent() {
  if (currentUrl && startTime && isTracking) {
    let endTime = Date.now();
    let timeSpent = endTime - startTime;
    
    accumulatedTime[currentUrl] = (accumulatedTime[currentUrl] || 0) + timeSpent;
    
    saveAccumulatedTime();
    
    startTime = endTime; // Reset start time
  }
}

function saveAccumulatedTime() {
  chrome.storage.local.set({ 
    accumulatedTime: accumulatedTime,
    lastResetDate: lastResetDate
  }, () => {
    console.log('Accumulated time saved');
  });
}

function saveState() {
  chrome.storage.local.set({
    currentUrl: currentUrl,
    startTime: startTime,
    isTracking: isTracking
  }, () => {
    console.log('State saved');
  });
}

function loadState() {
  chrome.storage.local.get(['currentUrl', 'startTime', 'isTracking'], (state) => {
    currentUrl = state.currentUrl || '';
    startTime = state.startTime || Date.now();
    isTracking = state.isTracking || false;
    console.log('State loaded', state);
  });
}

function checkAndResetAtMidnight() {
  let currentDate = new Date().toDateString();
  if (currentDate !== lastResetDate) {
    console.log('Resetting accumulated time at midnight');
    accumulatedTime = {};
    lastResetDate = currentDate;
    saveAccumulatedTime();
  }
}

chrome.tabs.onActivated.addListener(updateCurrentTab);
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    updateCurrentTab();
  }
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    updateTimeSpent();
    isTracking = false;
  } else {
    updateCurrentTab();
  }
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action === "updateTime") {
      updateTimeSpent();
      updateCurrentTab();
      sendResponse({status: "Time updated", data: accumulatedTime});
    } else if (request.action === "getData") {
      updateTimeSpent(); // Ensure the latest time is recorded
      sendResponse({data: accumulatedTime});
    }
  }
);

// Set up alarm for periodic updates
chrome.alarms.create('updateTime', { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'updateTime') {
    checkAndResetAtMidnight();
    updateTimeSpent();
    saveState();
  }
});

// Initial setup
loadState();
updateCurrentTab();