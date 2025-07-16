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
    }

    start() {
        if (this.isRunning) return;
        
        this.startTime = Date.now() - this.elapsedTime;
        this.isRunning = true;
        
        this.intervalId = setInterval(() => {
            this.elapsedTime = Date.now() - this.startTime;
            if (this.callbacks.onTick) {
                this.callbacks.onTick(this.elapsedTime);
            }
        }, 1000);
        
        if (this.callbacks.onStart) {
            this.callbacks.onStart();
        }
    }

    stop() {
        if (!this.isRunning) return;
        
        clearInterval(this.intervalId);
        this.isRunning = false;
        
        if (this.callbacks.onStop) {
            this.callbacks.onStop(this.elapsedTime);
        }
    }

    reset() {
        this.stop();
        this.elapsedTime = 0;
        this.startTime = null;
        
        if (this.callbacks.onReset) {
            this.callbacks.onReset();
        }
    }

    getElapsedTime() {
        if (this.isRunning) {
            return Date.now() - this.startTime;
        }
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
        const sessionData = {
            taskId,
            taskTitle,
            duration,
            startTime: this.startTime,
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