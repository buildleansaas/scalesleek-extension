chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "saveData") {
    chrome.storage.local.set({ [request.key]: request.data }, function () {
      if (chrome.runtime.lastError) {
        console.error(`Error in storage: ${chrome.runtime.lastError}`);
      }
    });
  }
});
