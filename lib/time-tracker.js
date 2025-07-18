class TimeTracker {
    constructor() {
        this.startTime = null;
        this.elapsedTime = 0;
        this.isRunning = false;
        this.intervalId = null;
        this.callbacks = {
            onTick: null,
            onStart: null,
            onStop: null,
            onReset: null
        };
        this.currentTask = null;
        
        // Initialize from background timer state
        this.initializeFromBackground();
        
        // Listen for timer updates from background script
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'timerUpdate') {
                this.elapsedTime = request.elapsedTime;
                if (this.callbacks.onTick) {
                    this.callbacks.onTick(this.elapsedTime);
                }
            }
        });
    }

    async initializeFromBackground() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'getTimerState' });
            if (response && response.timerState) {
                const state = response.timerState;
                this.isRunning = state.isRunning;
                this.startTime = state.startTime;
                this.elapsedTime = state.elapsedTime;
                this.currentTask = state.currentTask;
                
                // Start local UI updates if timer is running
                if (this.isRunning) {
                    this.startLocalUIUpdates();
                }
            }
        } catch (error) {
            console.error('Failed to initialize timer from background:', error);
        }
    }

    async start(taskId = null, taskTitle = null) {
        if (this.isRunning) return;
        
        try {
            const response = await chrome.runtime.sendMessage({ 
                action: 'startTimer',
                taskId: taskId || this.currentTask?.id,
                taskTitle: taskTitle || this.currentTask?.title
            });
            
            if (response && response.success) {
                this.isRunning = true;
                this.startTime = response.timerState.startTime;
                this.currentTask = response.timerState.currentTask;
                
                this.startLocalUIUpdates();
                
                if (this.callbacks.onStart) {
                    this.callbacks.onStart();
                }
            }
        } catch (error) {
            console.error('Failed to start background timer:', error);
        }
    }

    async stop() {
        if (!this.isRunning) return;
        
        try {
            const response = await chrome.runtime.sendMessage({ action: 'stopTimer' });
            
            if (response && response.success) {
                this.isRunning = false;
                this.elapsedTime = response.timerState.elapsedTime;
                
                this.stopLocalUIUpdates();
                
                if (this.callbacks.onStop) {
                    this.callbacks.onStop(this.elapsedTime);
                }
            }
        } catch (error) {
            console.error('Failed to stop background timer:', error);
        }
    }

    async reset() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'resetTimer' });
            
            if (response && response.success) {
                this.isRunning = false;
                this.elapsedTime = 0;
                this.startTime = null;
                this.currentTask = null;
                
                this.stopLocalUIUpdates();
                
                if (this.callbacks.onReset) {
                    this.callbacks.onReset();
                }
            }
        } catch (error) {
            console.error('Failed to reset background timer:', error);
        }
    }

    startLocalUIUpdates() {
        if (this.intervalId) return;
        
        this.intervalId = setInterval(async () => {
            try {
                const response = await chrome.runtime.sendMessage({ action: 'getTimerState' });
                if (response && response.timerState) {
                    this.elapsedTime = response.timerState.elapsedTime;
                    if (this.callbacks.onTick) {
                        this.callbacks.onTick(this.elapsedTime);
                    }
                }
            } catch (error) {
                // Background script might not be ready, ignore
            }
        }, 1000);
    }

    stopLocalUIUpdates() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    getElapsedTime() {
        return this.elapsedTime;
    }

    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    onTick(callback) {
        this.callbacks.onTick = callback;
    }

    onStart(callback) {
        this.callbacks.onStart = callback;
    }

    onStop(callback) {
        this.callbacks.onStop = callback;
    }

    onReset(callback) {
        this.callbacks.onReset = callback;
    }

    // Session tracking
    async saveSession(taskId, taskTitle, duration) {
        try {
            const response = await chrome.runtime.sendMessage({ 
                action: 'saveSession',
                taskId: taskId,
                taskTitle: taskTitle,
                duration: duration
            });
            
            if (response && response.success) {
                return response.sessionData;
            }
        } catch (error) {
            console.error('Failed to save session via background script:', error);
            
            // Fallback to direct storage
            const sessionData = {
                taskId,
                taskTitle,
                duration,
                startTime: this.startTime,
                endTime: Date.now(),
                date: new Date().toISOString().split('T')[0]
            };

            const result = await chrome.storage.local.get(['sessions']);
            const sessions = result.sessions || [];
            sessions.push(sessionData);
            await chrome.storage.local.set({ sessions });
            
            return sessionData;
        }
    }

    async getSessions(date = null) {
        const result = await chrome.storage.local.get(['sessions']);
        const sessions = result.sessions || [];
        
        if (date) {
            return sessions.filter(session => session.date === date);
        }
        
        return sessions;
    }

    async getTotalTimeForTask(taskId) {
        const sessions = await this.getSessions();
        return sessions
            .filter(session => session.taskId === taskId)
            .reduce((total, session) => total + session.duration, 0);
    }

    async getTotalTimeForDate(date) {
        const sessions = await this.getSessions(date);
        return sessions.reduce((total, session) => total + session.duration, 0);
    }

    async getProductivityStats(days = 7) {
        const sessions = await this.getSessions();
        const now = new Date();
        const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
        
        const recentSessions = sessions.filter(session => {
            const sessionDate = new Date(session.date);
            return sessionDate >= startDate && sessionDate <= now;
        });

        const stats = {
            totalTime: 0,
            sessionsCount: recentSessions.length,
            averageSessionLength: 0,
            dailyBreakdown: {}
        };

        // Calculate daily breakdown
        recentSessions.forEach(session => {
            stats.totalTime += session.duration;
            
            if (!stats.dailyBreakdown[session.date]) {
                stats.dailyBreakdown[session.date] = {
                    totalTime: 0,
                    sessions: 0
                };
            }
            
            stats.dailyBreakdown[session.date].totalTime += session.duration;
            stats.dailyBreakdown[session.date].sessions++;
        });

        // Calculate average session length
        if (stats.sessionsCount > 0) {
            stats.averageSessionLength = stats.totalTime / stats.sessionsCount;
        }

        return stats;
    }
}