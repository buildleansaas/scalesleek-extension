chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "saveVidIQKeywords") {
        saveOrUpdateData(request.key, request.data);
        sendResponse({ status: "saved" });
    }
});

function saveOrUpdateData(key, newData) {
    chrome.storage.local.get([key], function (result) {
        let existingData = result[key] || [];

        newData.forEach((newItem) => {
            const existingItemIndex = existingData.findIndex((ed) => ed.channel === newItem.channel && ed.keyword === newItem.keyword);
            if (existingItemIndex !== -1) {
                existingData[existingItemIndex] = newItem;
            } else {
                existingData.push(newItem);
            }
        });

        const uniqueData = removeDuplicates(existingData);

        chrome.storage.local.set({ [key]: uniqueData }, function () {
            if (chrome.runtime.lastError) {
                console.error(`Error in storage: ${chrome.runtime.lastError}`);
            } else {
                console.log(`Data for ${key} saved or updated.`);
            }
        });
    });
}

function removeDuplicates(data) {
    // Using a combination of channel and keyword as a unique identifier
    const uniqueByIdentifier = new Map(data.map(item => [`${item.channel}-${item.keyword}`, item]));
    return Array.from(uniqueByIdentifier.values());
}
