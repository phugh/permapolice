chrome.runtime.onInstalled.addListener(function(object) {
  chrome.runtime.openOptionsPage();
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.data.block) {
      chrome.tabs.update(sender.tab.id, {url: 'content/blocked.html'});
    } else {
      chrome.browserAction.setBadgeText({
        text: request.data.filtered.toString(),
        tabId: sender.tab.id,
      });
      chrome.browserAction.setBadgeBackgroundColor({
        color: 'darkred',
        tabId: sender.tab.id,
      });
    }
  }
);
