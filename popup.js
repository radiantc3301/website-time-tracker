document.addEventListener('DOMContentLoaded', function() {
    updatePopup();
});

function updatePopup() {
    chrome.runtime.sendMessage({action: "getData"}, function(response) {
        if (response && response.data) {
            displayData(response.data);
        }
    });
}

function displayData(data) {
    let statsDiv = document.getElementById('stats');
    statsDiv.innerHTML = ''; // Clear previous content

    // Sort websites by time spent
    let sortedItems = Object.entries(data).sort((a, b) => b[1] - a[1]);

    for (let [url, time] of sortedItems) {
        if (url !== 'currentUrl' && url !== 'startTime' && url !== 'isTracking') {
            let timeSpent = formatTime(time);
            let p = document.createElement('p');
            p.textContent = `${url}: ${timeSpent}`;
            statsDiv.appendChild(p);
        }
    }
}

function formatTime(milliseconds) {
    let seconds = Math.round(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);

    seconds = seconds % 60;
    minutes = minutes % 60;

    return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
}

function padZero(num) {
    return num.toString().padStart(2, '0');
}