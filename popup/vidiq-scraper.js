chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "updateVidIQProgress") loadVidIQDataList();
});

// Start scraping VidIQ
document.getElementById("scrapeVidIQBtn").addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const activeTab = tabs[0];
        console.log("Active tab:", activeTab.url);
        chrome.tabs.sendMessage(activeTab.id, { action: "startVidIQScraping", url: activeTab.url });
    });
});

function loadVidIQDataList() {
    chrome.storage.local.get(null, function (items) {
        console.log("Loaded items:", items)
        const VidIQKeywordsList = document.getElementById("VidIQKeywordsList");
        VidIQKeywordsList.innerHTML = ""; // Clear existing list

        for (let key in items) {
            if (key.startsWith("growth-tools-vidiq-keywords-")) {
                const channel = key.replace("growth-tools-vidiq-keywords-", "");
                const count = items[key].length;
                VidIQKeywordsList.appendChild(createVidIQDataRow(channel, count));
            }
        }
    });
}

function createVidIQDataRow(channel, count) {
    const tr = document.createElement("tr");

    const tdChannel = document.createElement("td");
    const aChannel = document.createElement("a");
    aChannel.href = "#";
    aChannel.textContent = channel;
    aChannel.addEventListener("click", function (event) {
        event.preventDefault();
        const optionsUrl = `options.html?type=${encodeURIComponent("youtube")}&channel=${encodeURIComponent(channel)}`;
        chrome.tabs.create({ url: optionsUrl });
    });
    tdChannel.appendChild(aChannel);

    const tdCount = document.createElement("td");
    tdCount.textContent = count.toString();

    const tdDownload = document.createElement("td");
    const downloadButton = document.createElement("button");
    downloadButton.textContent = "CSV";
    downloadButton.addEventListener("click", function () {
        downloadVidIQCSV(channel);
    });
    tdDownload.appendChild(downloadButton);

    const tdDelete = document.createElement("td");
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", function () {
        deleteVidIQData(channel);
    });
    tdDelete.appendChild(deleteButton);

    tr.appendChild(tdChannel);
    tr.appendChild(tdCount);
    tr.appendChild(tdDownload);
    tr.appendChild(tdDelete);

    return tr;
}


function convertVidIQToCSV(data) {
    const csvRows = ["Keyword,Related Score,Search Volume,Competition,Overall,Number of Words"];
    data.forEach((item) => {
        const values = [item.keyword, item.relatedScore, item.searchVolume, item.competition, item.overall, item.numberOfWords]
            .map((v) => `"${v.replace(/"/g, '""')}"`);
        csvRows.push(values.join(","));
    });
    return csvRows.join("\n");
}

function downloadVidIQCSV(channelKey) {
    const key = `growth-tools-vidiq-keywords-${channelKey}`;
    chrome.storage.local.get([key], function (result) {
        if (result[key]) {
            const csvData = convertVidIQToCSV(result[key]);
            exportCSV(csvData, `${channelKey}_vidiq_keywords`);
        }
    });
}

function deleteVidIQData(channelKey) {
    const key = `growth-tools-vidiq-keywords-${channelKey}`;
    chrome.storage.local.remove(key, function () {
        console.log(`Data for ${channelKey} deleted`);
        loadVidIQDataList(); // Refresh the list to reflect the deletion
    });
}

function exportCSV(csvData, filename) {
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = `${filename}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}
