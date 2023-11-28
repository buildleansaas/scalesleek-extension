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
        chrome.storage.local.set({ [key]: [request.newData] }, function () {
          console.log(`New data for ${request.url} added.`);
        });
      }
    });
  }
});

// Update Existing Data
function updateData(key, newData) {
  chrome.storage.local.get([key], function (result) {
    if (result[key]) {
      let existingData = result[key];

      newData.forEach((newItem) => {
        const existingItemIndex = existingData.findIndex((ed) => ed.link === newItem.link);
        if (existingItemIndex !== -1) {
          // Update existing item
          existingData[existingItemIndex] = newItem;
        } else {
          // Add new item
          existingData.push(newItem);
        }
      });

      // Save the updated data
      chrome.storage.local.set({ [key]: existingData }, function () {
        console.log(`Data for ${key} updated.`);
      });
    }
  });
}