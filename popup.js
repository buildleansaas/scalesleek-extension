document.getElementById("scrapeBtn").addEventListener("click", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const activeTab = tabs[0];
    console.log("Sending startScraping message to content script");
    chrome.tabs.sendMessage(activeTab.id, { action: "startScraping", url: activeTab.url });
    document.getElementById("stopBtn").style.display = "block"; // Show stop button
  });
});

document.getElementById("stopBtn").addEventListener("click", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, { action: "stopScraping" });
    document.getElementById("stopBtn").style.display = "none"; // Hide stop button
  });
});

document.getElementById("downloadBtn").addEventListener("click", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const activeTab = tabs[0];
    const key = `scalesleek-youtube-videos-${activeTab.url}`;
    chrome.storage.local.get([key], function (result) {
      if (result[key]) {
        const csvData = convertToCSV(result[key]);
        exportCSV(csvData);
      }
    });
  });
});

function convertToCSV(data) {
  const csvRows = ["Title,Impressions,Image,Link"];
  data.forEach((item) => {
    const values = [item.title, item.impressions, item.image, item.link].map((v) => `"${v.replace(/"/g, '""')}"`);
    csvRows.push(values.join(","));
  });
  return csvRows.join("\n");
}

function exportCSV(csvData) {
  const blob = new Blob([csvData], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = "youtube_videos.csv";
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "updateProgress") {
    document.getElementById("progress").textContent = `Scraped ${request.count} videos.`;
    document.getElementById("downloadBtn").style.display = "block"; // Show download button
  } else if (request.action === "showDownload") {
    document.getElementById("downloadBtn").style.display = "block"; // Ensure download button is visible
  }
});
