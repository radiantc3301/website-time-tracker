// This runs once the dom content is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    updateCurrentTabTime();
    updatePopup();
});

function updateCurrentTabTime() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
            let currentUrl = new URL(tabs[0].url).hostname;
            chrome.runtime.sendMessage({action: "updateTime", url: currentUrl}, function(response) {
                console.log("Time updated for current tab");
                updatePopup();
            });
        }
    });
}

function updatePopup() {
    chrome.storage.local.get(null, (items) => {
        let statsDiv = document.getElementById('stats');
        statsDiv.innerHTML = ''; // Clear previous content

        // Sort websites by time spent
        let sortedItems = Object.entries(items).sort((a, b) => b[1] - a[1]);

        for (let [url, time] of sortedItems) {
            if (url !== 'total') {  // Assuming you might have a 'total' key
                let timeSpent = formatTime(time);
                let p = document.createElement('p');
                p.textContent = `${url}: ${timeSpent}`;
                statsDiv.appendChild(p);
            }
        }

        // Optionally, add total time at the top
        // if (items.total) {
        //     let totalP = document.createElement('p');
        //     totalP.textContent = `Total time: ${formatTime(items.total)}`;
        //     totalP.style.fontWeight = 'bold';
        //     statsDiv.insertBefore(totalP, statsDiv.firstChild);
        // }
    });
}

function formatTime(milliseconds) {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);

    seconds = seconds % 60;
    minutes = minutes % 60;

    return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
}

function padZero(num) {
    return num.toString().padStart(2, '0');
}