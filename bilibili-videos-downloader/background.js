// ... existing code ...
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'download' && msg.url) {
        chrome.downloads.download({
            url: msg.url,
            filename: msg.filename
        });
    }
});
// ... existing code ...