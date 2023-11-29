console.log("vidiq.js loaded");

let stopScraping = false;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log(request)
    try {
        if (request.action === "startVidIQScraping") {
            console.log("Message received:", request.action); // Add this line
            stopScraping = false;
            scrapeVidIQ(request.url);
        } else if (request.action === "stopVidIQScraping") {
            console.log("Received stopVidIQScraping message, stopping scrape");
            stopScraping = true;
        }
    } catch (error) {
        console.error(error);
    }
});

function scrapeVidIQ(url) {
    try {
        console.log("Scraping VidIQ keywords from", url);

        const channel = document.getElementById("channel-name").textContent.trim();

        const scrapedData = [];
        const table = document.querySelector('#related-keywords-table');

        if (table && url) {
            const rows = table.querySelectorAll('tr[data-testid="data-row"]');

            rows.forEach(row => {
                const keywordCell = row.querySelector('td[data-testid="td-keyword-cell"] p');
                const scoreCell = row.querySelector('td[data-testid="td-related_score-cell"]');
                const volumeCell = row.querySelector('td[data-testid="td-estimated_monthly_search-cell"]');
                const competitionCell = row.querySelector('td[data-testid="td-competition-cell"]');
                const overallCell = row.querySelector('td[data-testid="td-overall-cell"]');
                const wordsCell = row.querySelector('td[data-testid="td-numberOfWords-cell"]');

                const keyword = keywordCell ? keywordCell.textContent.trim() : null;
                const relatedScore = scoreCell ? scoreCell.textContent.trim() : null;
                const searchVolume = volumeCell ? volumeCell.textContent.trim() : null;
                const competition = competitionCell ? competitionCell.textContent.trim() : null;
                const overall = overallCell ? overallCell.textContent.trim() : null;
                const numberOfWords = wordsCell ? wordsCell.textContent.trim() : null;

                if (keyword && relatedScore) {
                    scrapedData.push({ keyword, relatedScore, searchVolume, competition, overall, numberOfWords, channel });
                }
            });

            console.log("vidiq scraped data", scrapedData);

            if (scrapedData.length > 0) {
                chrome.runtime.sendMessage({
                    action: 'saveVidIQKeywords',
                    key: `growth-tools-vidiq-keywords-${channel}`,
                    data: scrapedData
                }, function (response) {
                    // Once the 'saveVidIQKeywords' action is completed, send the next message
                    chrome.runtime.sendMessage({
                        action: "updateVidIQProgress",
                        count: scrapedData.length,
                    });
                });
            }
        }
    } catch (error) {
        console.error("Error in scrapeVidIQ:", error);
    }
}
