const NEWTAB_PAGE = chrome.runtime.getURL("newtab.html");

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (!changeInfo.url) {
    return;
  }

  if (
    changeInfo.url.startsWith("chrome://start-page/") ||
    changeInfo.url === "chrome://newtab/"
  ) {
    chrome.tabs.update(tabId, {
      url: NEWTAB_PAGE
    });
  }
});

function normalizeNode(node) {
  return {
    id: node.id,
    title: node.title || "",
    url: node.url || null,
    isFolder: !node.url
  };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "getTopBookmarks") {
    chrome.bookmarks.getTree((tree) => {
      if (chrome.runtime.lastError) {
        sendResponse({ items: [] });
        return;
      }

      const root = tree && tree[0];
      const rootChildren = root && root.children ? root.children : [];

      /*
       * Chromium系では通常、rootChildren[0] が
       * Bookmarks Bar。
       */
      const bookmarkBar = rootChildren[0];

      if (!bookmarkBar || !bookmarkBar.children) {
        sendResponse({ items: [] });
        return;
      }

      const items = bookmarkBar.children.map(normalizeNode);

      sendResponse({
        items: items
      });
    });

    return true;
  }

  if (message.type === "getFolderChildren") {
    chrome.bookmarks.getChildren(message.folderId, (children) => {
      if (chrome.runtime.lastError) {
        sendResponse({ items: [] });
        return;
      }

      sendResponse({
        items: children.map(normalizeNode)
      });
    });

    return true;
  }
});
