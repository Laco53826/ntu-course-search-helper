chrome.runtime.onMessage.addListener((message) => {
  if (!message || message.type !== "openSearchTabs") {
    return;
  }

  const urls = Array.isArray(message.urls) ? message.urls : [];
  urls.forEach((url) => {
    if (typeof url === "string" && url.startsWith("https://")) {
      chrome.tabs.create({ url });
    }
  });
});
