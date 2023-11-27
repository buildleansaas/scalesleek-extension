// FILE CONTENTS:
// 1. Chrome background connections
//    - chrome.runtime.onMessage.addListener (updateProgress, showDownload)
// 2. Popup.html event listeners
//    - Start scraping
//    - Stop scraping
//    - Download CSV
// 3. Display functions
//    - Load all scraped data into lists
//    - Create a row for the data list
// 4. CSV functions
//    - Download CSV
//    - Convert scraped data to CSV
//    - Export CSV

// CHROME BACKGROUND CONNECTIONS

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "updateProgress") {
    document.getElementById("progress").textContent = `Scraped ${request.count} videos.`;
    document.getElementById("downloadBtn").style.display = "block"; // Show download button
  } else if (request.action === "showDownload") {
    document.getElementById("downloadBtn").style.display = "block"; // Ensure download button is visible
  }
});

// POPUP.HTML EVENT LISTENERS

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

// Download CSV
document.getElementById("downloadBtn").addEventListener("click", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const activeTab = tabs[0];
    const key = `scalesleek-youtube-videos-${activeTab.url}`;
    chrome.storage.local.get([key], function (result) {
      if (result[key]) {
        const csvData = convertToCSV(result[key]);
        exportCSV(csvData, activeTab.url);
      }
    });
  });
});

// Load all scraped data into lists.
document.addEventListener("DOMContentLoaded", function () {
  loadScrapedDataList();
});

// DISPLAY FUNCTIONS

// Load all scraped data into lists.
function loadScrapedDataList() {
  chrome.storage.local.get(null, function (items) {
    const dataList = document.getElementById("dataList");
    dataList.innerHTML = ""; // Clear existing list

    for (let key in items) {
      if (key.startsWith("scalesleek-youtube-videos-")) {
        const url = key.replace("scalesleek-youtube-videos-", "");
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
  tdUrl.textContent = url.replaceAll("https://www.youtube.com/", "");
  const tdCount = document.createElement("td");
  tdCount.textContent = count.toString();
  const tdDownload = document.createElement("td");
  const downloadButton = document.createElement("button");
  downloadButton.textContent = "Download";
  downloadButton.addEventListener("click", function () {
    downloadCSV(url);
  });
  tdDownload.appendChild(downloadButton);

  tr.appendChild(tdUrl);
  tr.appendChild(tdCount);
  tr.appendChild(tdDownload);

  return tr;
}

// CSV FUNCTIONS

// Download CSV
function downloadCSV(urlKey) {
  const key = `scalesleek-youtube-videos-${urlKey}`;
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
