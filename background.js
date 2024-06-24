let currentUrl = '';
let startTime;
let accumulatedTime = {};

chrome.tabs.onActivated.addListener(activeInfo => {
  chrome.tabs.get(activeInfo.tabId, tab => {
    updateTimeSpent();
    currentUrl = new URL(tab.url).hostname;
    startTime = new Date();
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    updateTimeSpent();
    currentUrl = new URL(tab.url).hostname;
    startTime = new Date();
  }
});

function updateTimeSpent() {
  if (currentUrl && startTime) {
    let endTime = new Date();
    let timeSpent = endTime - startTime;
    
    accumulatedTime[currentUrl] = (accumulatedTime[currentUrl] || 0) + timeSpent;
    
    chrome.storage.local.set({ [currentUrl]: accumulatedTime[currentUrl] }, () => {
      console.log('Time updated for', currentUrl);
    });
  }
}

// Handle messages from popup
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action === "updateTime") {
      updateTimeSpent();
      currentUrl = request.url;
      startTime = new Date();
      sendResponse({status: "Time updated"});
    }
  }
);

// Update time every minute to handle long periods on the same tab
setInterval(updateTimeSpent, 60000);