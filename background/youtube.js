chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "saveData") {
    saveOrUpdateData(request.key, request.data);
  }
});

function saveOrUpdateData(key, newData) {
  chrome.storage.local.get([key], function (result) {
    let existingData = result[key] || [];

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
      if (chrome.runtime.lastError) {
        console.error(`Error in storage: ${chrome.runtime.lastError}`);
      } else {
        console.log(`Data for ${key} saved or updated.`);
      }
    });
  });
}

function removeDuplicates(data) {
  const uniqueByLink = new Map(data.map(item => [item.link, item]));
  return Array.from(uniqueByLink.values());
}
