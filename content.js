let stopScraping = false;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "startScraping") {
    console.log("Received startScraping message, beginning scrape");
    stopScraping = false;
    scrapeYouTube(request.url);
  } else if (request.action === "stopScraping") {
    console.log("Received stopScraping message, stopping scrape");
    stopScraping = true;
  }
});

function scrapeYouTube(url) {
  let scrapedData = [];

  function scrollToBottom(callback, maxScrolls = 100, scrolls = 0) {
    if (stopScraping) {
      callback(); // If scraping is stopped, invoke callback immediately
      return;
    }

    const lastHeight = document.documentElement.scrollHeight;
    window.scrollTo(0, lastHeight);

    setTimeout(() => {
      const newHeight = document.documentElement.scrollHeight;
      if (newHeight > lastHeight && scrolls < maxScrolls) {
        scrapeAndSave();
        scrollToBottom(callback, maxScrolls, scrolls + 1);
      } else {
        callback();
      }
    }, 5000); // Increased timeout
  }

  function scrapeAndSave() {
    if (stopScraping) return; // Stop scraping if the flag is set

    const newData = scrapeData();
    scrapedData = scrapedData.concat(newData);
    console.log(`Scraping data, total scraped: ${scrapedData.length}`);

    // Send scraped data to background script for storage
    chrome.runtime.sendMessage({
      action: "saveData",
      key: `scalesleek-youtube-videos-${url}`,
      data: scrapedData,
    });

    // Send message to update progress in popup
    chrome.runtime.sendMessage({ action: "updateProgress", count: scrapedData.length });
  }

  function scrapeData() {
    const videos = document.querySelectorAll("#dismissible");
    const data = [];

    videos.forEach((video) => {
      const titleElement = video.querySelector("#video-title");
      const impressionsElement = video.querySelector(".inline-metadata-item");
      const imageElement = video.querySelector("img.yt-core-image");
      const linkElement = video.querySelector("a.yt-simple-endpoint");

      const title = titleElement ? titleElement.innerText.trim() : "N/A";
      const impressions = impressionsElement ? impressionsElement.innerText.trim() : "N/A";
      const image = imageElement ? imageElement.src : "N/A";
      const link = linkElement ? "https://youtube.com" + linkElement.getAttribute("href") : "N/A";

      data.push({ title, impressions, image, link });
    });

    return data;
  }

  // Start the process
  scrollToBottom(() => {
    chrome.runtime.sendMessage({ action: "showDownload" });
  });
}
