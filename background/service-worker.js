chrome.runtime.onInstalled.addListener(async () => {
    console.log('Multi-Scale Planner extension installed');
    
    // Restore timer state on installation
    const result = await chrome.storage.local.get(['backgroundTimerState']);
    if (result.backgroundTimerState) {
        timerState = result.backgroundTimerState;
        
        // If timer was running, restore it
        if (timerState.isRunning && timerState.startTime) {
            chrome.alarms.create(timerState.alarmName, { delayInMinutes: 0, periodInMinutes: 1/60 });
        }
    }
});

chrome.commands.onCommand.addListener((command) => {
    if (command === 'open-planner') {
        chrome.action.openPopup();
    }
});

chrome.action.onClicked.addListener((tab) => {
    chrome.action.openPopup();
});

// Background timer state
let timerState = {
    isRunning: false,
    startTime: null,
    elapsedTime: 0,
    currentTask: null,
    alarmName: 'focusTimer'
};

// Message listener for communication with popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'startTimer':
            startBackgroundTimer(request.taskId, request.taskTitle);
            sendResponse({ success: true, timerState });
            break;
        case 'stopTimer':
            stopBackgroundTimer();
            sendResponse({ success: true, timerState });
            break;
        case 'resetTimer':
            resetBackgroundTimer();
            sendResponse({ success: true, timerState });
            break;
        case 'getTimerState':
            sendResponse({ timerState: getCurrentTimerState() });
            break;
        case 'saveSession':
            saveTimerSession(request.taskId, request.taskTitle, request.duration)
                .then(sessionData => {
                    sendResponse({ success: true, sessionData });
                })
                .catch(error => {
                    console.error('Failed to save session:', error);
                    sendResponse({ success: false, error: error.message });
                });
            return true; // Keep message channel open for async response
            break;
    }
});

function startBackgroundTimer(taskId, taskTitle) {
    if (timerState.isRunning) return;
    
    timerState.isRunning = true;
    timerState.startTime = Date.now() - timerState.elapsedTime;
    timerState.currentTask = { id: taskId, title: taskTitle };
    
    // Create a repeating alarm every second for timer updates
    chrome.alarms.create(timerState.alarmName, { delayInMinutes: 0, periodInMinutes: 1/60 });
    
    // Store timer state
    chrome.storage.local.set({ backgroundTimerState: timerState });
}

function stopBackgroundTimer() {
    if (!timerState.isRunning) return;
    
    timerState.isRunning = false;
    timerState.elapsedTime = Date.now() - timerState.startTime;
    
    // Clear the alarm
    chrome.alarms.clear(timerState.alarmName);
    
    // Store timer state
    chrome.storage.local.set({ backgroundTimerState: timerState });
}

function resetBackgroundTimer() {
    stopBackgroundTimer();
    timerState.elapsedTime = 0;
    timerState.startTime = null;
    timerState.currentTask = null;
    
    // Store timer state
    chrome.storage.local.set({ backgroundTimerState: timerState });
}

function getCurrentTimerState() {
    if (timerState.isRunning && timerState.startTime) {
        return {
            ...timerState,
            elapsedTime: Date.now() - timerState.startTime
        };
    }
    return timerState;
}

async function saveTimerSession(taskId, taskTitle, duration) {
    const sessionData = {
        taskId,
        taskTitle,
        duration,
        startTime: timerState.startTime,
        endTime: Date.now(),
        date: new Date().toISOString().split('T')[0]
    };

    // Get existing sessions
    const result = await chrome.storage.local.get(['sessions']);
    const sessions = result.sessions || [];
    
    // Add new session
    sessions.push(sessionData);
    
    // Save back to storage
    await chrome.storage.local.set({ sessions });
    
    return sessionData;
}

// Handle alarm events for timer updates
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === timerState.alarmName && timerState.isRunning) {
        // Update elapsed time
        timerState.elapsedTime = Date.now() - timerState.startTime;
        
        // Store updated state
        chrome.storage.local.set({ backgroundTimerState: timerState });
        
        // Send update to popup if it's open
        chrome.runtime.sendMessage({ 
            action: 'timerUpdate', 
            elapsedTime: timerState.elapsedTime 
        }).catch(() => {
            // Popup might not be open, ignore error
        });
    }
});

// Restore timer state on startup
chrome.runtime.onStartup.addListener(async () => {
    const result = await chrome.storage.local.get(['backgroundTimerState']);
    if (result.backgroundTimerState) {
        timerState = result.backgroundTimerState;
        
        // If timer was running, restore it
        if (timerState.isRunning && timerState.startTime) {
            chrome.alarms.create(timerState.alarmName, { delayInMinutes: 0, periodInMinutes: 1/60 });
        }
    }
});