chrome.runtime.onInstalled.addListener(() => {
    console.log('Multi-Scale Planner extension installed');
});

chrome.commands.onCommand.addListener((command) => {
    if (command === 'open-planner') {
        chrome.action.openPopup();
    }
});

chrome.action.onClicked.addListener((tab) => {
    chrome.action.openPopup();
});