class StorageManager {
    constructor() {
        this.storage = chrome.storage.sync || chrome.storage.local;
        this.initializeData();
    }

    async initializeData() {
        const data = await this.getAllData();
        if (!data.quarters) {
            await this.setDefaultData();
        }
    }

    async setDefaultData() {
        const currentDate = new Date();
        const currentQuarter = this.getQuarterKey(currentDate);
        const currentWeek = this.getWeekKey(currentDate);
        const currentDay = this.getDayKey(currentDate);

        const defaultData = {
            quarters: {
                [currentQuarter]: {
                    goals: [],
                    startDate: this.getQuarterStartDate(currentDate),
                    endDate: this.getQuarterEndDate(currentDate)
                }
            },
            weeks: {
                [currentWeek]: {
                    tasks: [],
                    quarterKey: currentQuarter
                }
            },
            days: {
                [currentDay]: {
                    priorities: [],
                    timeBlocks: [],
                    quickTodos: [],
                    weekKey: currentWeek,
                    currentFocus: null
                }
            },
            settings: {
                theme: 'light',
                notifications: true,
                timerSound: true
            }
        };

        await this.storage.set(defaultData);
    }

    async getAllData() {
        return new Promise((resolve) => {
            this.storage.get(null, (result) => {
                resolve(result);
            });
        });
    }

    async getQuarterData(quarterKey) {
        const data = await this.getAllData();
        return data.quarters?.[quarterKey] || { goals: [] };
    }

    async getWeekData(weekKey) {
        const data = await this.getAllData();
        return data.weeks?.[weekKey] || { tasks: [] };
    }

    async getDayData(dayKey) {
        const data = await this.getAllData();
        return data.days?.[dayKey] || { priorities: [], timeBlocks: [], quickTodos: [] };
    }

    async updateQuarterData(quarterKey, quarterData) {
        const data = await this.getAllData();
        if (!data.quarters) data.quarters = {};
        data.quarters[quarterKey] = quarterData;
        await this.storage.set({ quarters: data.quarters });
    }

    async updateWeekData(weekKey, weekData) {
        const data = await this.getAllData();
        if (!data.weeks) data.weeks = {};
        data.weeks[weekKey] = weekData;
        await this.storage.set({ weeks: data.weeks });
    }

    async updateDayData(dayKey, dayData) {
        const data = await this.getAllData();
        if (!data.days) data.days = {};
        data.days[dayKey] = dayData;
        await this.storage.set({ days: data.days });
    }

    // Goal management
    async addGoal(quarterKey, goal) {
        const quarterData = await this.getQuarterData(quarterKey);
        goal.id = this.generateId();
        goal.createdAt = new Date().toISOString();
        goal.progress = 0;
        quarterData.goals.push(goal);
        await this.updateQuarterData(quarterKey, quarterData);
        return goal;
    }

    async updateGoal(quarterKey, goalId, updates) {
        const quarterData = await this.getQuarterData(quarterKey);
        const goalIndex = quarterData.goals.findIndex(g => g.id === goalId);
        if (goalIndex >= 0) {
            quarterData.goals[goalIndex] = { ...quarterData.goals[goalIndex], ...updates };
            await this.updateQuarterData(quarterKey, quarterData);
        }
    }

    async deleteGoal(quarterKey, goalId) {
        const quarterData = await this.getQuarterData(quarterKey);
        quarterData.goals = quarterData.goals.filter(g => g.id !== goalId);
        await this.updateQuarterData(quarterKey, quarterData);
    }

    // Task management
    async addTask(weekKey, task) {
        const weekData = await this.getWeekData(weekKey);
        task.id = this.generateId();
        task.createdAt = new Date().toISOString();
        task.completed = false;
        weekData.tasks.push(task);
        await this.updateWeekData(weekKey, weekData);
        return task;
    }

    async updateTask(weekKey, taskId, updates) {
        const weekData = await this.getWeekData(weekKey);
        const taskIndex = weekData.tasks.findIndex(t => t.id === taskId);
        if (taskIndex >= 0) {
            weekData.tasks[taskIndex] = { ...weekData.tasks[taskIndex], ...updates };
            await this.updateWeekData(weekKey, weekData);
        }
    }

    async deleteTask(weekKey, taskId) {
        const weekData = await this.getWeekData(weekKey);
        weekData.tasks = weekData.tasks.filter(t => t.id !== taskId);
        await this.updateWeekData(weekKey, weekData);
    }

    // Priority management
    async addPriority(dayKey, priority) {
        const dayData = await this.getDayData(dayKey);
        priority.id = this.generateId();
        priority.createdAt = new Date().toISOString();
        priority.completed = false;
        dayData.priorities.push(priority);
        await this.updateDayData(dayKey, dayData);
        return priority;
    }

    async updatePriority(dayKey, priorityId, updates) {
        const dayData = await this.getDayData(dayKey);
        const priorityIndex = dayData.priorities.findIndex(p => p.id === priorityId);
        if (priorityIndex >= 0) {
            dayData.priorities[priorityIndex] = { ...dayData.priorities[priorityIndex], ...updates };
            await this.updateDayData(dayKey, dayData);
        }
    }

    async deletePriority(dayKey, priorityId) {
        const dayData = await this.getDayData(dayKey);
        dayData.priorities = dayData.priorities.filter(p => p.id !== priorityId);
        await this.updateDayData(dayKey, dayData);
    }

    async reorderPriorities(dayKey, priorityIds) {
        const dayData = await this.getDayData(dayKey);
        
        // Reorder priorities based on the new order
        const reorderedPriorities = priorityIds.map(id => 
            dayData.priorities.find(priority => priority.id === id)
        ).filter(Boolean);
        
        dayData.priorities = reorderedPriorities;
        await this.updateDayData(dayKey, dayData);
    }

    async setCurrentFocus(dayKey, priorityId) {
        const dayData = await this.getDayData(dayKey);
        dayData.currentFocus = priorityId;
        await this.updateDayData(dayKey, dayData);
    }

    // Quick todos
    async addQuickTodo(dayKey, todo) {
        const dayData = await this.getDayData(dayKey);
        todo.id = this.generateId();
        todo.completed = false;
        dayData.quickTodos.push(todo);
        await this.updateDayData(dayKey, dayData);
        return todo;
    }

    async updateQuickTodo(dayKey, todoId, updates) {
        const dayData = await this.getDayData(dayKey);
        const todoIndex = dayData.quickTodos.findIndex(t => t.id === todoId);
        if (todoIndex >= 0) {
            dayData.quickTodos[todoIndex] = { ...dayData.quickTodos[todoIndex], ...updates };
            await this.updateDayData(dayKey, dayData);
        }
    }

    async deleteQuickTodo(dayKey, todoId) {
        const dayData = await this.getDayData(dayKey);
        dayData.quickTodos = dayData.quickTodos.filter(t => t.id !== todoId);
        await this.updateDayData(dayKey, dayData);
    }

    // Time block management
    async addTimeBlock(dayKey, timeBlock) {
        const dayData = await this.getDayData(dayKey);
        timeBlock.id = this.generateId();
        timeBlock.createdAt = new Date().toISOString();
        if (!dayData.timeBlocks) dayData.timeBlocks = [];
        dayData.timeBlocks.push(timeBlock);
        await this.updateDayData(dayKey, dayData);
        return timeBlock;
    }

    async updateTimeBlock(dayKey, blockId, updates) {
        const dayData = await this.getDayData(dayKey);
        if (!dayData.timeBlocks) dayData.timeBlocks = [];
        const blockIndex = dayData.timeBlocks.findIndex(b => b.id === blockId);
        if (blockIndex >= 0) {
            dayData.timeBlocks[blockIndex] = { ...dayData.timeBlocks[blockIndex], ...updates };
            await this.updateDayData(dayKey, dayData);
        }
    }

    async deleteTimeBlock(dayKey, blockId) {
        const dayData = await this.getDayData(dayKey);
        if (!dayData.timeBlocks) dayData.timeBlocks = [];
        dayData.timeBlocks = dayData.timeBlocks.filter(b => b.id !== blockId);
        await this.updateDayData(dayKey, dayData);
    }

    async reorderTimeBlocks(dayKey, blockIds) {
        const dayData = await this.getDayData(dayKey);
        if (!dayData.timeBlocks) dayData.timeBlocks = [];
        
        // Reorder blocks based on the new order
        const reorderedBlocks = blockIds.map(id => 
            dayData.timeBlocks.find(block => block.id === id)
        ).filter(Boolean);
        
        dayData.timeBlocks = reorderedBlocks;
        await this.updateDayData(dayKey, dayData);
    }

    // Utility methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getQuarterKey(date) {
        const year = date.getFullYear();
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `${year}-Q${quarter}`;
    }

    getWeekKey(date) {
        const year = date.getFullYear();
        const week = this.getWeekNumber(date);
        return `${year}-W${week}`;
    }

    getDayKey(date) {
        return date.toISOString().split('T')[0];
    }

    getWeekNumber(date) {
        const start = new Date(date.getFullYear(), 0, 1);
        const diff = date - start;
        return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
    }

    getQuarterStartDate(date) {
        const year = date.getFullYear();
        const quarter = Math.floor(date.getMonth() / 3);
        return new Date(year, quarter * 3, 1).toISOString().split('T')[0];
    }

    getQuarterEndDate(date) {
        const year = date.getFullYear();
        const quarter = Math.floor(date.getMonth() / 3);
        return new Date(year, quarter * 3 + 3, 0).toISOString().split('T')[0];
    }

    async getAllTasksForGoal(goalId) {
        const data = await this.getAllData();
        const tasks = [];
        
        if (data.weeks) {
            for (const weekData of Object.values(data.weeks)) {
                if (weekData.tasks) {
                    const goalTasks = weekData.tasks.filter(task => task.goalId === goalId);
                    tasks.push(...goalTasks);
                }
            }
        }
        
        return tasks;
    }

    getCurrentKeys() {
        const now = new Date();
        return {
            quarter: this.getQuarterKey(now),
            week: this.getWeekKey(now),
            day: this.getDayKey(now)
        };
    }

    async getAllWeeksInQuarter(quarterKey) {
        const data = await this.getAllData();
        const weeks = [];
        
        // Extract year and quarter from quarterKey (e.g., "2024-Q3")
        const [year, quarterStr] = quarterKey.split('-');
        const quarter = parseInt(quarterStr.substring(1));
        
        // Get all week keys that belong to this quarter
        if (data.weeks) {
            for (const weekKey of Object.keys(data.weeks)) {
                const [weekYear, weekStr] = weekKey.split('-');
                const weekNum = parseInt(weekStr.substring(1));
                
                // Check if this week belongs to the current quarter
                if (weekYear === year) {
                    // Calculate which quarter this week belongs to
                    // Approximate: Q1 = weeks 1-13, Q2 = weeks 14-26, Q3 = weeks 27-39, Q4 = weeks 40-52
                    const weekQuarter = Math.ceil(weekNum / 13);
                    if (weekQuarter === quarter) {
                        weeks.push({ key: weekKey, data: data.weeks[weekKey] });
                    }
                }
            }
        }
        
        return weeks;
    }
}