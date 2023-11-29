document.getElementById('openOptionsPageBtn').addEventListener('click', function () {
    chrome.runtime.openOptionsPage();
});

// Load all scraped data into lists.
document.addEventListener("DOMContentLoaded", function () {
    checkForVidIQUrl(function (isVidIQUrl) {
        const vidiqScraperSection = document.getElementById("vidiq-keyword-scraper");
        if (isVidIQUrl) {
            vidiqScraperSection.style.display = "block";
            loadVidIQDataList();
        } else {
            vidiqScraperSection.style.display = "none";
        }
    });

    checkForYouTubeUrl(function (isYouTubeUrl) {
        const youtubeScraperSection = document.getElementById("youtube-videos-scraper");
        if (isYouTubeUrl) {
            // TODO: check url for /watch or /videos.
            youtubeScraperSection.style.display = "block";
            loadScrapedDataList();
        } else {
            youtubeScraperSection.style.display = "none";
        }
    });

});

// DISPLAY FUNCTIONS
function checkForVidIQUrl(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const activeTab = tabs[0];
        if (activeTab.url && activeTab.url.includes("vidiq.com")) callback(true, activeTab.url);
        else callback(false);
    });
}


// TODO: refactor to check for YouTube URL for variations (e.g. /watch, /videos, etc.)
function checkForYouTubeUrl(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const activeTab = tabs[0];
        if (activeTab.url && activeTab.url.includes("youtube.com")) callback(true, activeTab.url);
        else callback(false);
    });
}