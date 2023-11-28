chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "saveData") {
    chrome.storage.local.set({ [request.key]: request.data }, function () {
      if (chrome.runtime.lastError) {
        console.error(`Error in storage: ${chrome.runtime.lastError}`);
      }
    });
  }

  if (request.action === "newData") {
    const key = `growth-tools-youtube-videos-${request.url}`;
    chrome.storage.local.get([key], function (result) {
      if (result[key]) {
        // Update existing data
        updateData(key, request.newData);
      } else {
        // Add new data
        const uniqueNewData = removeDuplicates([request.newData]);
        chrome.storage.local.set({ [key]: uniqueNewData }, function () {
          console.log(`New data for ${request.url} added.`);
        });
      }
    });
  }
});

function updateData(key, newData) {
  chrome.storage.local.get([key], function (result) {
    if (result[key]) {
      let existingData = result[key];

      newData.forEach((newItem) => {
        const existingItemIndex = existingData.findIndex((ed) => ed.link === newItem.link);
        if (existingItemIndex !== -1) {
          existingData[existingItemIndex] = newItem;
        } else {
          existingData.push(newItem);
        }
      });

      const uniqueData = removeDuplicates(existingData);

      chrome.storage.local.set({ [key]: uniqueData }, function () {
        console.log(`Data for ${key} updated.`);
      });
    }
  });
}

function removeDuplicates(data) {
  const uniqueByLink = new Map(data.map(item => [item.link, item]));
  return Array.from(uniqueByLink.values());
}
