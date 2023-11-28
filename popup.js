// FILE CONTENTS:
// - Chrome background connections
//    - chrome.runtime.onMessage.addListener (updateProgress, showDownload)
// - Popup.html event listeners
//    - Start scraping
//    - Stop scraping
//    - Download CSV
// - Display functions
//    - Load all scraped data into lists
//    - Create a row for the data list
// - CSV functions
//    - Download CSV
//    - Convert scraped data to CSV
//    - Export CSV

// CHROME BACKGROUND CONNECTIONS

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "updateProgress") {
    document.getElementById("progress").textContent = `Scraped ${request.count} videos.`;
    document.getElementById("downloadBtn").style.display = "block"; // Show download button
    loadScrapedDataList(); // Reload data list
  } else if (request.action === "showDownload") {
    document.getElementById("downloadBtn").style.display = "block"; // Ensure download button is visible
  }
});

// POPUP.HTML EVENT LISTENERS

// Display mechanism
function checkForYouTubeUrl(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const activeTab = tabs[0];
    if (activeTab.url && activeTab.url.includes("youtube.com")) callback(true);
    else callback(false);
  });
}

// Start scraping
document.getElementById("scrapeBtn").addEventListener("click", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const activeTab = tabs[0];
    console.log("Sending startScraping message to content script");
    chrome.tabs.sendMessage(activeTab.id, { action: "startScraping", url: activeTab.url });
    document.getElementById("stopBtn").style.display = "block"; // Show stop button
  });
});

// Stop scraping
document.getElementById("stopBtn").addEventListener("click", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, { action: "stopScraping" });
    document.getElementById("stopBtn").style.display = "none"; // Hide stop button
  });
});

// Load all scraped data into lists.
document.addEventListener("DOMContentLoaded", function () {
  checkForYouTubeUrl(function (isYouTubeUrl) {
    const youtubeScraperSection = document.getElementById("youtube-scraper");
    

    if (isYouTubeUrl) {
      // Show the 'youtube-scraper' section if it's a YouTube URL
      youtubeScraperSection.style.display = "block";
      loadScrapedDataList();
    } else {
      // Hide the 'youtube-scraper' section if it's not a YouTube URL
      youtubeScraperSection.style.display = "none";
    }
  });
  loadScrapedDataList();
});

// DISPLAY FUNCTIONS

// Load all scraped data into lists.
function loadScrapedDataList() {
  chrome.storage.local.get(null, function (items) {
    const dataList = document.getElementById("dataList");
    dataList.innerHTML = ""; // Clear existing list

    for (let key in items) {
      if (key.startsWith("growth-tools-youtube-videos-")) {
        const url = key.replace("growth-tools-youtube-videos-", "");
        const count = items[key].length;
        dataList.appendChild(createDataRow(url, count));
      }
    }
  });
}

// Create a row for the data list.
function createDataRow(url, count) {
  const tr = document.createElement("tr");
  const tdUrl = document.createElement("td");
  const aUrl = document.createElement("a");
  aUrl.href = "#";
  aUrl.textContent = url.replaceAll("https://www.youtube.com/", "");
  aUrl.addEventListener("click", function (event) {
    event.preventDefault();
    // Open the options page with the URL parameter
    const optionsUrl = `options.html?url=${encodeURIComponent(url)}`;
    chrome.tabs.create({ url: optionsUrl });
});
  tdUrl.appendChild(aUrl);

  const tdCount = document.createElement("td");
  tdCount.textContent = count.toString();

  const tdDownload = document.createElement("td");
  const downloadButton = document.createElement("button");
  downloadButton.textContent = "CSV";
  downloadButton.addEventListener("click", function () {
    downloadCSV(url);
  });
  tdDownload.appendChild(downloadButton);

  const tdDelete = document.createElement("td");
  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", function () {
    deleteData(url);
  });
  tdDelete.appendChild(deleteButton);

  tr.appendChild(tdUrl);
  tr.appendChild(tdCount);
  tr.appendChild(tdDownload);
  tr.appendChild(tdDelete);

  return tr;
}

// CSV FUNCTIONS

// Download CSV
function downloadCSV(urlKey) {
  const key = `growth-tools-youtube-videos-${urlKey}`;
  chrome.storage.local.get([key], function (result) {
    if (result[key]) {
      const csvData = convertToCSV(result[key]);
      exportCSV(csvData, urlKey);
    }
  });
}

// Convert scraped data to CSV.
function convertToCSV(data) {
  const csvRows = ["Title,Impressions,Image,Link"];
  data.forEach((item) => {
    const values = [item.title, item.impressions, item.image, item.link].map((v) => `"${v.replace(/"/g, '""')}"`);
    csvRows.push(values.join(","));
  });
  return csvRows.join("\n");
}

// Export CSV
function exportCSV(csvData, urlKey) {
  const blob = new Blob([csvData], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = `${urlKey}_youtube_videos.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

function deleteData(urlKey) {
  const key = `growth-tools-youtube-videos-${urlKey}`;
  chrome.storage.local.remove(key, function () {
    console.log(`Data for ${urlKey} deleted`);
    loadScrapedDataList(); // Refresh the list to reflect the deletion
  });
}
