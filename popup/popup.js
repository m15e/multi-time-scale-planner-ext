class MultiScalePlanner {
    constructor() {
        this.storage = new StorageManager();
        this.timeTracker = new TimeTracker();
        this.currentTab = 'daily';
        this.currentKeys = this.storage.getCurrentKeys();
        this.currentFocus = null;
        this.currentModalType = null;
        this.currentTimeBlockId = null;
        this.draggedElement = null;
        this.draggedPriorityElement = null;
        
        this.init();
    }

    async init() {
        await this.setupEventListeners();
        await this.loadData();
        await this.setupTimeTracker();
        this.updatePeriodIndicator();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Focus buttons
        document.querySelectorAll('.focus-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.setCurrentFocus(e.target.dataset.priority);
            });
        });

        // Focus task selection
        document.getElementById('focus-task-select').addEventListener('change', (e) => {
            this.selectFocusTask(e.target.value);
        });

        // Timer controls
        document.getElementById('start-timer').addEventListener('click', () => {
            this.startTimer();
        });

        document.getElementById('pause-timer').addEventListener('click', () => {
            this.pauseTimer();
        });

        document.getElementById('reset-timer').addEventListener('click', () => {
            this.resetTimer();
        });

        document.getElementById('complete-task').addEventListener('click', () => {
            this.completeCurrentTask();
        });

        document.getElementById('change-task').addEventListener('click', () => {
            this.changeTask();
        });

        // Stats toggle
        document.getElementById('toggle-stats').addEventListener('click', () => {
            this.toggleStats();
        });

        // Settings button
        document.getElementById('settings-button').addEventListener('click', () => {
            this.openSettingsModal();
        });

        // Quick capture
        const quickInput = document.querySelector('.quick-input');
        quickInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addQuickTodo(e.target.value);
                e.target.value = '';
            }
        });

        // Add buttons
        document.getElementById('add-goal')?.addEventListener('click', () => {
            this.addGoal();
        });

        document.getElementById('add-task')?.addEventListener('click', () => {
            this.addTask();
        });

        document.getElementById('add-priority')?.addEventListener('click', () => {
            this.addPriority();
        });

        // Time block button
        document.getElementById('add-time-block')?.addEventListener('click', () => {
            this.openTimeBlockModal();
        });

        // Review buttons
        document.getElementById('weekly-review')?.addEventListener('click', () => {
            this.openReviewModal('weekly');
        });

        document.getElementById('quarterly-review')?.addEventListener('click', () => {
            this.openReviewModal('quarterly');
        });

        // Checkbox handling
        document.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox' && e.target.closest('.quick-todo')) {
                this.toggleQuickTodo(e.target);
            } else if (e.target.type === 'checkbox' && e.target.closest('.task-item')) {
                this.toggleTask(e.target);
            }
        });

        // Action buttons for all sections
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-todo-btn')) {
                this.editQuickTodo(e.target);
            } else if (e.target.classList.contains('delete-todo-btn')) {
                this.deleteQuickTodo(e.target);
            } else if (e.target.classList.contains('edit-block-btn')) {
                this.editTimeBlock(e.target);
            } else if (e.target.classList.contains('delete-block-btn')) {
                this.deleteTimeBlock(e.target);
            } else if (e.target.classList.contains('edit-priority-btn')) {
                this.editPriority(e.target);
            } else if (e.target.classList.contains('delete-priority-btn')) {
                this.deletePriority(e.target);
            } else if (e.target.classList.contains('edit-task-btn')) {
                this.editTask(e.target);
            } else if (e.target.classList.contains('delete-task-btn')) {
                this.deleteTask(e.target);
            } else if (e.target.classList.contains('edit-goal-btn')) {
                this.editGoal(e.target);
            } else if (e.target.classList.contains('delete-goal-btn')) {
                this.deleteGoal(e.target);
            }
        });

        // Double-click to edit all editable elements
        document.addEventListener('dblclick', (e) => {
            if (e.target.classList.contains('todo-text')) {
                const editBtn = e.target.parentNode.querySelector('.edit-todo-btn');
                if (editBtn) {
                    this.editQuickTodo(editBtn);
                }
            } else if (e.target.classList.contains('priority-title')) {
                const editBtn = e.target.closest('.priority-item').querySelector('.edit-priority-btn');
                if (editBtn) {
                    this.editPriority(editBtn);
                }
            } else if (e.target.classList.contains('task-title')) {
                const editBtn = e.target.closest('.task-item').querySelector('.edit-task-btn');
                if (editBtn) {
                    this.editTask(editBtn);
                }
            } else if (e.target.classList.contains('goal-title')) {
                const editBtn = e.target.closest('.goal-item').querySelector('.edit-goal-btn');
                if (editBtn) {
                    this.editGoal(editBtn);
                }
            }
        });

        // Clickable links for cross-navigation
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('clickable-link')) {
                const targetTab = e.target.dataset.tab;
                if (targetTab && targetTab !== 'No goal' && targetTab !== 'Standalone task') {
                    this.switchTab(targetTab);
                }
            }
        });

        // Modal event listeners
        document.getElementById('modal-close').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('modal-cancel').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('modal-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeModal();
            }
        });

        document.getElementById('modal-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleModalSubmit();
        });

        // Review modal event listeners
        document.getElementById('review-modal-close').addEventListener('click', () => {
            this.closeReviewModal();
        });

        document.getElementById('review-cancel').addEventListener('click', () => {
            this.closeReviewModal();
        });

        document.getElementById('review-save').addEventListener('click', () => {
            this.saveReview();
        });

        document.getElementById('review-modal-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeReviewModal();
            }
        });

        // Time block modal event listeners
        document.getElementById('time-block-modal-close').addEventListener('click', () => {
            this.closeTimeBlockModal();
        });

        document.getElementById('time-block-cancel').addEventListener('click', () => {
            this.closeTimeBlockModal();
        });

        document.getElementById('time-block-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTimeBlock();
        });

        document.getElementById('time-block-modal-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeTimeBlockModal();
            }
        });

        // Settings modal event listeners
        document.getElementById('settings-modal-close').addEventListener('click', () => {
            this.closeSettingsModal();
        });

        document.getElementById('settings-modal-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeSettingsModal();
            }
        });

        // Settings action buttons
        document.getElementById('export-data').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('import-data').addEventListener('click', () => {
            document.getElementById('import-file').click();
        });

        document.getElementById('import-file').addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });

        document.getElementById('reset-app').addEventListener('click', () => {
            this.resetApp();
        });

        // Keyboard shortcuts for timer
        document.addEventListener('keydown', (e) => {
            // Only handle shortcuts when not in input fields
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
                return;
            }
            
            if (e.key === ' ' && e.shiftKey) {
                // Shift+Space: Start/Pause timer
                e.preventDefault();
                if (this.timeTracker.isRunning) {
                    this.pauseTimer();
                } else {
                    this.startTimer();
                }
            } else if (e.key === 'r' && e.shiftKey) {
                // Shift+R: Reset timer
                e.preventDefault();
                this.resetTimer();
            } else if (e.key === 'c' && e.shiftKey) {
                // Shift+C: Complete task
                e.preventDefault();
                this.completeCurrentTask();
            }
        });
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        // Load data for the new tab
        this.loadTabData(tabName);
    }

    async loadData() {
        await this.loadTabData(this.currentTab);
    }

    async loadTabData(tabName) {
        switch (tabName) {
            case 'quarterly':
                await this.loadQuarterlyData();
                break;
            case 'weekly':
                await this.loadWeeklyData();
                break;
            case 'daily':
                await this.loadDailyData();
                break;
        }
    }

    async loadQuarterlyData() {
        // Update progress before loading to ensure current state
        await this.updateGoalProgress();
        
        const quarterData = await this.storage.getQuarterData(this.currentKeys.quarter);
        const goalsContainer = document.querySelector('.goals-container');
        
        if (quarterData.goals.length === 0) {
            goalsContainer.innerHTML = '<p class="empty-state">No goals set for this quarter. Click "Add Goal" to get started.</p>';
            return;
        }
        
        goalsContainer.innerHTML = quarterData.goals.map(goal => `
            <div class="goal-item" data-goal-id="${goal.id}">
                <div class="goal-content">
                    <span class="goal-title">${goal.title}</span>
                    <div class="goal-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${goal.progress || 0}%"></div>
                        </div>
                        <span class="progress-text">${goal.progress || 0}%</span>
                    </div>
                </div>
                <div class="goal-actions">
                    <button class="edit-goal-btn" title="Edit">✎</button>
                    <button class="delete-goal-btn" title="Delete">×</button>
                </div>
            </div>
        `).join('');
    }

    async loadWeeklyData() {
        const weekData = await this.storage.getWeekData(this.currentKeys.week);
        const quarterData = await this.storage.getQuarterData(this.currentKeys.quarter);
        const tasksContainer = document.querySelector('.tasks-container');
        
        if (weekData.tasks.length === 0) {
            tasksContainer.innerHTML = '<p class="empty-state">No tasks for this week. Click "Add Task" to get started.</p>';
            return;
        }
        
        tasksContainer.innerHTML = weekData.tasks.map(task => {
            const relatedGoal = quarterData.goals.find(g => g.id === task.goalId);
            return `
                <div class="task-item" data-task-id="${task.id}">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="task-title">${task.title}</span>
                    <span class="task-goal clickable-link" data-goal-id="${task.goalId}" data-tab="quarterly">
                        → ${relatedGoal ? relatedGoal.title : 'No goal'}
                    </span>
                    <div class="task-actions">
                        <button class="edit-task-btn" title="Edit">✎</button>
                        <button class="delete-task-btn" title="Delete">×</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    async loadDailyData() {
        const dayData = await this.storage.getDayData(this.currentKeys.day);
        const weekData = await this.storage.getWeekData(this.currentKeys.week);
        
        this.loadPriorities(dayData, weekData);
        this.loadCurrentFocus(dayData);
        this.loadTimeBlocks(dayData);
        this.loadQuickTodos(dayData);
        this.loadProductivityStats();
        this.updateDateDisplay();
    }

    loadPriorities(dayData, weekData) {
        const prioritiesSection = document.querySelector('.priorities-section');
        
        if (dayData.priorities.length === 0) {
            prioritiesSection.innerHTML = '<p class="empty-state">No priorities set for today. Plan your day by adding priorities.</p>';
            return;
        }
        
        prioritiesSection.innerHTML = dayData.priorities.map((priority, index) => {
            const relatedTask = weekData.tasks.find(t => t.id === priority.taskId);
            return `
                <div class="priority-item ${priority.completed ? 'completed' : ''}" 
                     draggable="true" data-priority-id="${priority.id}">
                    <div class="priority-drag-handle">⋮⋮</div>
                    <div class="priority-number">${index + 1}</div>
                    <div class="priority-content">
                        <span class="priority-title">${priority.title}</span>
                        <span class="priority-link clickable-link" data-task-id="${priority.taskId}" data-tab="weekly">
                            → ${relatedTask ? relatedTask.title : 'Standalone task'}
                        </span>
                    </div>
                    <div class="priority-actions">
                        <button class="edit-priority-btn" title="Edit">✎</button>
                        <button class="delete-priority-btn" title="Delete">×</button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Add drag and drop functionality
        this.setupPriorityDragAndDrop();
    }

    loadCurrentFocus(dayData) {
        const focusTaskSelect = document.getElementById('focus-task-select');
        const focusActiveTask = document.getElementById('focus-active-task');
        const focusTaskSelector = document.querySelector('.focus-task-selector');
        
        // Clear and populate the select dropdown
        focusTaskSelect.innerHTML = '<option value="">Select a priority to focus on...</option>';
        
        if (dayData.priorities && dayData.priorities.length > 0) {
            dayData.priorities.forEach(priority => {
                if (!priority.completed) {
                    const option = document.createElement('option');
                    option.value = priority.id;
                    option.textContent = priority.title;
                    focusTaskSelect.appendChild(option);
                }
            });
        }
        
        // Check if there's a current focus
        if (dayData.currentFocus) {
            const currentFocusPriority = dayData.priorities.find(p => p.id === dayData.currentFocus);
            if (currentFocusPriority) {
                this.currentFocus = currentFocusPriority.id;
                focusTaskSelect.value = currentFocusPriority.id;
                this.showActiveTask(currentFocusPriority);
            } else {
                this.showTaskSelector();
            }
        } else {
            this.showTaskSelector();
        }
    }

    showTaskSelector() {
        document.querySelector('.focus-task-selector').style.display = 'block';
        document.getElementById('focus-active-task').style.display = 'none';
        this.currentFocus = null;
    }

    showActiveTask(priority) {
        document.querySelector('.focus-task-selector').style.display = 'none';
        document.getElementById('focus-active-task').style.display = 'block';
        document.getElementById('active-task-title').textContent = priority.title;
        this.updateTimerDisplay();
    }

    loadTimeBlocks(dayData) {
        const timeBlocksContainer = document.querySelector('.time-blocks-container');
        
        if (!dayData.timeBlocks || dayData.timeBlocks.length === 0) {
            timeBlocksContainer.innerHTML = '<p class="empty-state">No time blocks scheduled. Click "Add Block" to get started.</p>';
            return;
        }
        
        timeBlocksContainer.innerHTML = dayData.timeBlocks
            .sort((a, b) => a.startTime.localeCompare(b.startTime))
            .map(block => this.createTimeBlockHTML(block))
            .join('');
        
        // Add drag and drop event listeners
        this.setupDragAndDrop();
    }

    createTimeBlockHTML(block) {
        const duration = this.calculateDuration(block.startTime, block.endTime);
        const timeRange = `${this.formatTime(block.startTime)}-${this.formatTime(block.endTime)}`;
        
        return `
            <div class="time-block" draggable="true" data-block-id="${block.id}">
                <div class="drag-handle">⋮⋮</div>
                <span class="time-range">${timeRange}</span>
                <div class="block-bar">
                    <div class="block-fill ${block.type || 'work'}" style="width: 100%"></div>
                </div>
                <span class="block-task">${block.task}</span>
                <div class="block-actions">
                    <button class="edit-block-btn" title="Edit">✎</button>
                    <button class="delete-block-btn" title="Delete">×</button>
                </div>
            </div>
        `;
    }

    setupDragAndDrop() {
        const timeBlocks = document.querySelectorAll('.time-block');
        
        timeBlocks.forEach(block => {
            block.addEventListener('dragstart', (e) => {
                this.draggedElement = e.target;
                e.target.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', e.target.outerHTML);
            });
            
            block.addEventListener('dragend', (e) => {
                e.target.classList.remove('dragging');
                this.draggedElement = null;
                
                // Remove all drag-over classes
                timeBlocks.forEach(b => b.classList.remove('drag-over'));
            });
            
            block.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                
                if (e.target !== this.draggedElement) {
                    e.target.classList.add('drag-over');
                }
            });
            
            block.addEventListener('dragleave', (e) => {
                e.target.classList.remove('drag-over');
            });
            
            block.addEventListener('drop', (e) => {
                e.preventDefault();
                e.target.classList.remove('drag-over');
                
                if (e.target !== this.draggedElement) {
                    this.reorderTimeBlocks(this.draggedElement, e.target);
                }
            });
        });
    }

    async reorderTimeBlocks(draggedBlock, targetBlock) {
        const container = document.querySelector('.time-blocks-container');
        const blocks = Array.from(container.querySelectorAll('.time-block'));
        
        const draggedIndex = blocks.indexOf(draggedBlock);
        const targetIndex = blocks.indexOf(targetBlock);
        
        if (draggedIndex > targetIndex) {
            container.insertBefore(draggedBlock, targetBlock);
        } else {
            container.insertBefore(draggedBlock, targetBlock.nextSibling);
        }
        
        // Get new order of block IDs
        const newOrder = Array.from(container.querySelectorAll('.time-block'))
            .map(block => block.dataset.blockId);
        
        // Update storage
        await this.storage.reorderTimeBlocks(this.currentKeys.day, newOrder);
    }

    loadQuickTodos(dayData) {
        const quickTodosContainer = document.querySelector('.quick-todos');
        
        if (dayData.quickTodos.length === 0) {
            quickTodosContainer.innerHTML = '<p class="empty-state">No quick todos</p>';
            return;
        }
        
        quickTodosContainer.innerHTML = dayData.quickTodos.map(todo => `
            <div class="quick-todo ${todo.completed ? 'completed' : ''}" data-todo-id="${todo.id}">
                <input type="checkbox" ${todo.completed ? 'checked' : ''}>
                <span class="todo-text">${todo.title}</span>
                <div class="todo-actions">
                    <button class="edit-todo-btn" title="Edit">✎</button>
                    <button class="delete-todo-btn" title="Delete">×</button>
                </div>
            </div>
        `).join('');
    }

    async loadProductivityStats() {
        const today = new Date().toISOString().split('T')[0];
        const sessions = await this.timeTracker.getSessions(today);
        
        // Calculate totals
        const totalTime = sessions.reduce((sum, session) => sum + session.duration, 0);
        const sessionCount = sessions.length;
        const avgSessionLength = sessionCount > 0 ? totalTime / sessionCount : 0;
        
        // Update summary stats
        document.getElementById('total-focus-time').textContent = this.formatDuration(totalTime);
        document.getElementById('session-count').textContent = sessionCount;
        document.getElementById('avg-session-length').textContent = this.formatDuration(avgSessionLength);
        
        // Update session list
        const sessionList = document.getElementById('session-list');
        
        if (sessions.length === 0) {
            sessionList.innerHTML = '<div class="session-list empty">No focus sessions today</div>';
        } else {
            sessionList.innerHTML = sessions
                .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
                .map(session => `
                    <div class="session-item">
                        <span class="session-task">${session.taskTitle}</span>
                        <span class="session-duration">${this.formatDuration(session.duration)}</span>
                    </div>
                `).join('');
        }
    }

    formatDuration(milliseconds) {
        const minutes = Math.floor(milliseconds / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        
        if (hours > 0) {
            return `${hours}h ${remainingMinutes}m`;
        } else {
            return `${minutes}m`;
        }
    }

    toggleStats() {
        const statsContent = document.getElementById('stats-content');
        const toggleButton = document.getElementById('toggle-stats');
        
        if (statsContent.classList.contains('collapsed')) {
            statsContent.classList.remove('collapsed');
            toggleButton.textContent = '📊';
        } else {
            statsContent.classList.add('collapsed');
            toggleButton.textContent = '📈';
        }
    }

    async setCurrentFocus(priorityId) {
        await this.storage.setCurrentFocus(this.currentKeys.day, priorityId);
        this.currentFocus = priorityId;
        
        
        const activeButton = document.querySelector(`[data-priority="${priorityId}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
            activeButton.textContent = 'Focused';
        }
        
        // Update focus display
        const dayData = await this.storage.getDayData(this.currentKeys.day);
        const priority = dayData.priorities.find(p => p.id === priorityId);
        
        if (priority) {
            // Update the select dropdown
            document.getElementById('focus-task-select').value = priorityId;
            this.showActiveTask(priority);
        }
        
        // Reset timer for new focus
        this.timeTracker.reset();
        this.updateTimerDisplay();
    }

    async setupTimeTracker() {
        this.timeTracker.onTick((elapsed) => {
            this.updateTimerDisplay(elapsed);
        });
        
        this.timeTracker.onStart(() => {
            this.updateTimerButtons(true);
            document.getElementById('timer-display').classList.add('running');
        });
        
        this.timeTracker.onStop(() => {
            this.updateTimerButtons(false);
            document.getElementById('timer-display').classList.remove('running');
        });
        
        // Wait for initialization to complete
        await this.timeTracker.initializeFromBackground();
        
        // Update UI based on current timer state
        this.updateTimerButtons(this.timeTracker.isRunning);
        if (this.timeTracker.isRunning) {
            document.getElementById('timer-display').classList.add('running');
        }
        this.updateTimerDisplay(this.timeTracker.elapsedTime);
    }

    updateTimerButtons(isRunning) {
        const startButton = document.getElementById('start-timer');
        const pauseButton = document.getElementById('pause-timer');
        
        if (isRunning) {
            startButton.style.display = 'none';
            pauseButton.style.display = 'inline-block';
        } else {
            startButton.style.display = 'inline-block';
            pauseButton.style.display = 'none';
        }
    }

    updateTimerDisplay(elapsed = 0) {
        const timerDisplay = document.getElementById('timer-display');
        const sessionDuration = document.getElementById('active-task-duration');
        
        const formattedTime = this.timeTracker.formatTime(elapsed);
        timerDisplay.textContent = formattedTime;
        
        if (sessionDuration) {
            sessionDuration.textContent = `Session: ${formattedTime}`;
        }
    }

    async selectFocusTask(priorityId) {
        if (!priorityId) return;
        
        await this.storage.setCurrentFocus(this.currentKeys.day, priorityId);
        this.currentFocus = priorityId;
        
        // Get the priority data
        const dayData = await this.storage.getDayData(this.currentKeys.day);
        const priority = dayData.priorities.find(p => p.id === priorityId);
        
        if (priority) {
            this.showActiveTask(priority);
            this.timeTracker.reset();
            this.updateTimerDisplay();
        }
    }

    async startTimer() {
        if (!this.currentFocus) {
            alert('Please select a focus task first');
            return;
        }
        
        // Get current focus task details
        const dayData = await this.storage.getDayData(this.currentKeys.day);
        const currentPriority = dayData.priorities.find(p => p.id === this.currentFocus);
        
        if (currentPriority) {
            await this.timeTracker.start(this.currentFocus, currentPriority.title);
        } else {
            await this.timeTracker.start();
        }
    }

    async pauseTimer() {
        await this.timeTracker.stop();
    }

    async resetTimer() {
        await this.timeTracker.reset();
        this.updateTimerDisplay();
    }

    async changeTask() {
        await this.timeTracker.stop();
        await this.timeTracker.reset();
        this.showTaskSelector();
        this.storage.setCurrentFocus(this.currentKeys.day, null);
    }

    async completeCurrentTask() {
        if (!this.currentFocus) {
            alert('No current focus to complete');
            return;
        }
        
        // Stop timer and save session
        const elapsed = this.timeTracker.getElapsedTime();
        this.timeTracker.stop();
        
        if (elapsed > 0) {
            const dayData = await this.storage.getDayData(this.currentKeys.day);
            const currentPriority = dayData.priorities.find(p => p.id === this.currentFocus);
            
            if (currentPriority) {
                await this.timeTracker.saveSession(
                    this.currentFocus,
                    currentPriority.title,
                    elapsed
                );
                
                // Show completion message with time spent
                const timeSpent = this.timeTracker.formatTime(elapsed);
                alert(`Task completed! Time spent: ${timeSpent}`);
            }
        }
        
        // Mark priority as completed
        await this.storage.updatePriority(this.currentKeys.day, this.currentFocus, {
            completed: true,
            completedAt: new Date().toISOString()
        });
        
        // Reset focus
        await this.storage.setCurrentFocus(this.currentKeys.day, null);
        this.currentFocus = null;
        
        // Show task selector again
        this.showTaskSelector();
        
        // Refresh display
        await this.loadDailyData();
        this.timeTracker.reset();
        this.updateTimerDisplay();
        
        // Refresh productivity stats
        await this.loadProductivityStats();
    }

    async addQuickTodo(title) {
        if (!title.trim()) return;
        
        await this.storage.addQuickTodo(this.currentKeys.day, {
            title: title.trim()
        });
        
        const dayData = await this.storage.getDayData(this.currentKeys.day);
        this.loadQuickTodos(dayData);
    }

    async toggleQuickTodo(checkbox) {
        const todoElement = checkbox.closest('.quick-todo');
        const todoId = todoElement.dataset.todoId;
        
        await this.storage.updateQuickTodo(this.currentKeys.day, todoId, {
            completed: checkbox.checked
        });
        
        // Update visual state
        if (checkbox.checked) {
            todoElement.classList.add('completed');
        } else {
            todoElement.classList.remove('completed');
        }
    }

    editQuickTodo(button) {
        const todoElement = button.closest('.quick-todo');
        const todoText = todoElement.querySelector('.todo-text');
        const todoId = todoElement.dataset.todoId;
        
        // Store original text
        const originalText = todoText.textContent;
        
        // Create input element
        const input = document.createElement('input');
        input.type = 'text';
        input.value = originalText;
        input.className = 'todo-text editing';
        
        // Replace span with input
        todoText.parentNode.replaceChild(input, todoText);
        input.focus();
        input.select();
        
        // Handle save on Enter or blur
        const saveEdit = async () => {
            const newText = input.value.trim();
            if (newText && newText !== originalText) {
                await this.storage.updateQuickTodo(this.currentKeys.day, todoId, {
                    title: newText
                });
            }
            // Reload the quick todos to restore normal view
            const dayData = await this.storage.getDayData(this.currentKeys.day);
            this.loadQuickTodos(dayData);
        };
        
        // Handle cancel on Escape
        const cancelEdit = async () => {
            // Reload the quick todos to restore normal view
            const dayData = await this.storage.getDayData(this.currentKeys.day);
            this.loadQuickTodos(dayData);
        };
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveEdit();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelEdit();
            }
        });
        
        input.addEventListener('blur', saveEdit);
    }

    async deleteQuickTodo(button) {
        const todoElement = button.closest('.quick-todo');
        const todoId = todoElement.dataset.todoId;
        const todoText = todoElement.querySelector('.todo-text').textContent;
        
        // Confirm deletion
        if (confirm(`Delete "${todoText}"?`)) {
            await this.storage.deleteQuickTodo(this.currentKeys.day, todoId);
            
            // Reload the quick todos
            const dayData = await this.storage.getDayData(this.currentKeys.day);
            this.loadQuickTodos(dayData);
        }
    }

    async toggleTask(checkbox) {
        const taskElement = checkbox.closest('.task-item');
        const taskId = taskElement.dataset.taskId;
        
        await this.storage.updateTask(this.currentKeys.week, taskId, {
            completed: checkbox.checked,
            completedAt: checkbox.checked ? new Date().toISOString() : null
        });
        
        // Update goal progress when task completion state changes
        await this.updateGoalProgress();
    }

    async updateGoalProgress() {
        const quarterData = await this.storage.getQuarterData(this.currentKeys.quarter);
        
        // Calculate progress for each goal based on completed tasks across all weeks
        for (const goal of quarterData.goals) {
            const allTasksForGoal = await this.storage.getAllTasksForGoal(goal.id);
            
            if (allTasksForGoal.length > 0) {
                const completedTasks = allTasksForGoal.filter(t => t.completed);
                const progress = Math.round((completedTasks.length / allTasksForGoal.length) * 100);
                
                await this.storage.updateGoal(this.currentKeys.quarter, goal.id, {
                    progress: progress
                });
            } else {
                // If no tasks are linked to this goal, set progress to 0
                await this.storage.updateGoal(this.currentKeys.quarter, goal.id, {
                    progress: 0
                });
            }
        }
    }

    async addGoal() {
        this.openModal('Add Goal', 'goal');
    }

    async addTask() {
        this.openModal('Add Task', 'task');
    }

    async addPriority() {
        this.openModal('Add Priority', 'priority');
    }

    async openModal(title, type) {
        this.currentModalType = type;
        
        // Set modal title
        document.getElementById('modal-title').textContent = title;
        
        // Reset form
        document.getElementById('item-title').value = '';
        document.getElementById('item-link').innerHTML = '<option value="">None</option>';
        
        // Show/hide link group and populate options
        const linkGroup = document.getElementById('link-group');
        const linkSelect = document.getElementById('item-link');
        
        if (type === 'task') {
            linkGroup.style.display = 'block';
            const quarterData = await this.storage.getQuarterData(this.currentKeys.quarter);
            quarterData.goals.forEach(goal => {
                const option = document.createElement('option');
                option.value = goal.id;
                option.textContent = goal.title;
                linkSelect.appendChild(option);
            });
        } else if (type === 'priority') {
            linkGroup.style.display = 'block';
            const weekData = await this.storage.getWeekData(this.currentKeys.week);
            weekData.tasks.forEach(task => {
                const option = document.createElement('option');
                option.value = task.id;
                option.textContent = task.title;
                linkSelect.appendChild(option);
            });
        } else {
            linkGroup.style.display = 'none';
        }
        
        // Show modal
        document.getElementById('modal-overlay').classList.add('active');
        document.getElementById('item-title').focus();
    }

    closeModal() {
        document.getElementById('modal-overlay').classList.remove('active');
        this.currentModalType = null;
    }

    async handleModalSubmit() {
        const title = document.getElementById('item-title').value.trim();
        const linkValue = document.getElementById('item-link').value;
        
        if (!title) return;
        
        switch (this.currentModalType) {
            case 'goal':
                await this.storage.addGoal(this.currentKeys.quarter, {
                    title: title,
                    priority: 1
                });
                await this.loadQuarterlyData();
                break;
                
            case 'task':
                await this.storage.addTask(this.currentKeys.week, {
                    title: title,
                    goalId: linkValue || null
                });
                await this.loadWeeklyData();
                // Update goal progress when new task is added
                await this.updateGoalProgress();
                break;
                
            case 'priority':
                await this.storage.addPriority(this.currentKeys.day, {
                    title: title,
                    taskId: linkValue || null
                });
                await this.loadDailyData();
                break;
        }
        
        this.closeModal();
    }

    // Time Block Modal Methods
    openTimeBlockModal(blockId = null) {
        this.currentTimeBlockId = blockId;
        
        const title = blockId ? 'Edit Time Block' : 'Add Time Block';
        document.getElementById('time-block-modal-title').textContent = title;
        
        // Reset form
        document.getElementById('block-start-time').value = '';
        document.getElementById('block-end-time').value = '';
        document.getElementById('block-task').value = '';
        document.getElementById('block-type').value = 'work';
        
        // If editing, populate form
        if (blockId) {
            this.populateTimeBlockForm(blockId);
        }
        
        document.getElementById('time-block-modal-overlay').classList.add('active');
        document.getElementById('block-start-time').focus();
    }

    closeTimeBlockModal() {
        document.getElementById('time-block-modal-overlay').classList.remove('active');
        this.currentTimeBlockId = null;
    }

    async populateTimeBlockForm(blockId) {
        const dayData = await this.storage.getDayData(this.currentKeys.day);
        const block = dayData.timeBlocks?.find(b => b.id === blockId);
        
        if (block) {
            document.getElementById('block-start-time').value = block.startTime;
            document.getElementById('block-end-time').value = block.endTime;
            document.getElementById('block-task').value = block.task;
            document.getElementById('block-type').value = block.type || 'work';
        }
    }

    async saveTimeBlock() {
        const startTime = document.getElementById('block-start-time').value;
        const endTime = document.getElementById('block-end-time').value;
        const task = document.getElementById('block-task').value.trim();
        const type = document.getElementById('block-type').value;
        
        if (!startTime || !endTime || !task) {
            alert('Please fill in all fields');
            return;
        }
        
        if (startTime >= endTime) {
            alert('End time must be after start time');
            return;
        }
        
        const blockData = {
            startTime,
            endTime,
            task,
            type
        };
        
        if (this.currentTimeBlockId) {
            // Update existing block
            await this.storage.updateTimeBlock(this.currentKeys.day, this.currentTimeBlockId, blockData);
        } else {
            // Add new block
            await this.storage.addTimeBlock(this.currentKeys.day, blockData);
        }
        
        this.closeTimeBlockModal();
        await this.loadDailyData();
    }

    editTimeBlock(button) {
        const blockElement = button.closest('.time-block');
        const blockId = blockElement.dataset.blockId;
        this.openTimeBlockModal(blockId);
    }

    async deleteTimeBlock(button) {
        const blockElement = button.closest('.time-block');
        const blockId = blockElement.dataset.blockId;
        const taskText = blockElement.querySelector('.block-task').textContent;
        
        if (confirm(`Delete time block "${taskText}"?`)) {
            await this.storage.deleteTimeBlock(this.currentKeys.day, blockId);
            await this.loadDailyData();
        }
    }

    // Utility methods for time blocks
    formatTime(timeString) {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    }

    calculateDuration(startTime, endTime) {
        const start = new Date(`1970-01-01T${startTime}`);
        const end = new Date(`1970-01-01T${endTime}`);
        const diff = end - start;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return { hours, minutes };
    }

    openReviewModal(type) {
        this.currentReviewType = type;
        
        // Set modal title
        const title = type === 'weekly' ? 'Weekly Review' : 'Quarterly Review';
        document.getElementById('review-modal-title').textContent = title;
        
        // Clear form
        document.getElementById('review-went-well').value = '';
        document.getElementById('review-improvements').value = '';
        document.getElementById('review-insights').value = '';
        document.getElementById('review-actions').value = '';
        
        // Show modal
        document.getElementById('review-modal-overlay').classList.add('active');
        document.getElementById('review-went-well').focus();
    }

    closeReviewModal() {
        document.getElementById('review-modal-overlay').classList.remove('active');
        this.currentReviewType = null;
    }

    async saveReview() {
        const reviewData = {
            type: this.currentReviewType,
            date: new Date().toISOString(),
            wentWell: document.getElementById('review-went-well').value,
            improvements: document.getElementById('review-improvements').value,
            insights: document.getElementById('review-insights').value,
            actions: document.getElementById('review-actions').value
        };

        // Save to storage
        const reviews = await this.getReviews();
        reviews.push(reviewData);
        await chrome.storage.local.set({ reviews });

        this.closeReviewModal();
        
        // Show success message
        alert('Review saved successfully!');
    }

    async getReviews() {
        const result = await chrome.storage.local.get(['reviews']);
        return result.reviews || [];
    }

    updatePeriodIndicator() {
        const periodElement = document.getElementById('current-period');
        const now = new Date();
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        
        const month = monthNames[now.getMonth()];
        const year = now.getFullYear();
        const week = this.storage.getWeekNumber(now);
        
        periodElement.textContent = `${month} ${year} - Week ${week}`;
    }

    setupPriorityDragAndDrop() {
        const priorityItems = document.querySelectorAll('.priority-item');
        
        priorityItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                this.draggedPriorityElement = e.target;
                e.target.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', e.target.outerHTML);
            });
            
            item.addEventListener('dragend', (e) => {
                e.target.classList.remove('dragging');
                this.draggedPriorityElement = null;
                
                // Remove all drag-over classes
                priorityItems.forEach(p => p.classList.remove('drag-over'));
            });
            
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                
                if (e.target !== this.draggedPriorityElement) {
                    e.target.classList.add('drag-over');
                }
            });
            
            item.addEventListener('dragleave', (e) => {
                e.target.classList.remove('drag-over');
            });
            
            item.addEventListener('drop', (e) => {
                e.preventDefault();
                e.target.classList.remove('drag-over');
                
                if (e.target !== this.draggedPriorityElement) {
                    this.reorderPriorities(this.draggedPriorityElement, e.target);
                }
            });
        });
    }

    async reorderPriorities(draggedItem, targetItem) {
        const container = document.querySelector('.priorities-section');
        const items = Array.from(container.querySelectorAll('.priority-item'));
        
        const draggedIndex = items.indexOf(draggedItem);
        const targetIndex = items.indexOf(targetItem);
        
        if (draggedIndex > targetIndex) {
            container.insertBefore(draggedItem, targetItem);
        } else {
            container.insertBefore(draggedItem, targetItem.nextSibling);
        }
        
        // Update priority numbers
        const updatedItems = Array.from(container.querySelectorAll('.priority-item'));
        updatedItems.forEach((item, index) => {
            const numberElement = item.querySelector('.priority-number');
            numberElement.textContent = index + 1;
        });
        
        // Get new order of priority IDs
        const newOrder = updatedItems.map(item => item.dataset.priorityId);
        
        // Update storage
        await this.storage.reorderPriorities(this.currentKeys.day, newOrder);
        
        // Refresh focus selector
        const dayData = await this.storage.getDayData(this.currentKeys.day);
        this.loadCurrentFocus(dayData);
    }

    editPriority(button) {
        const priorityItem = button.closest('.priority-item');
        const priorityTitle = priorityItem.querySelector('.priority-title');
        const priorityId = priorityItem.dataset.priorityId;
        
        // Store original text
        const originalText = priorityTitle.textContent;
        
        // Create input element
        const input = document.createElement('input');
        input.type = 'text';
        input.value = originalText;
        input.className = 'priority-title editing';
        
        // Replace span with input
        priorityTitle.parentNode.replaceChild(input, priorityTitle);
        input.focus();
        input.select();
        
        // Handle save on Enter or blur
        const saveEdit = async () => {
            const newText = input.value.trim();
            if (newText && newText !== originalText) {
                await this.storage.updatePriority(this.currentKeys.day, priorityId, {
                    title: newText
                });
            }
            // Reload the priorities to restore normal view
            await this.loadDailyData();
        };
        
        // Handle cancel on Escape
        const cancelEdit = async () => {
            // Reload the priorities to restore normal view
            await this.loadDailyData();
        };
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveEdit();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelEdit();
            }
        });
        
        input.addEventListener('blur', saveEdit);
    }

    async deletePriority(button) {
        const priorityItem = button.closest('.priority-item');
        const priorityId = priorityItem.dataset.priorityId;
        const priorityTitle = priorityItem.querySelector('.priority-title').textContent;
        
        // Confirm deletion
        if (confirm(`Delete priority "${priorityTitle}"?`)) {
            await this.storage.deletePriority(this.currentKeys.day, priorityId);
            
            // If this was the current focus, clear it
            if (this.currentFocus === priorityId) {
                await this.storage.setCurrentFocus(this.currentKeys.day, null);
                this.currentFocus = null;
                this.timeTracker.reset();
                this.updateTimerDisplay();
            }
            
            // Reload the priorities
            await this.loadDailyData();
        }
    }

    updateDateDisplay() {
        const dateElement = document.querySelector('.date-display');
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        
        dateElement.textContent = now.toLocaleDateString('en-US', options);
    }

    // Weekly Task CRUD Methods
    editTask(button) {
        const taskItem = button.closest('.task-item');
        const taskTitle = taskItem.querySelector('.task-title');
        const taskId = taskItem.dataset.taskId;
        
        // Store original text
        const originalText = taskTitle.textContent;
        
        // Create input element
        const input = document.createElement('input');
        input.type = 'text';
        input.value = originalText;
        input.className = 'task-title editing';
        input.style.cssText = 'background: white; border: 1px solid #007bff; border-radius: 3px; padding: 2px 6px; outline: none; flex: 1;';
        
        // Replace span with input
        taskTitle.parentNode.replaceChild(input, taskTitle);
        input.focus();
        input.select();
        
        // Handle save on Enter or blur
        const saveEdit = async () => {
            const newText = input.value.trim();
            if (newText && newText !== originalText) {
                await this.storage.updateTask(this.currentKeys.week, taskId, {
                    title: newText
                });
            }
            // Reload the tasks to restore normal view
            await this.loadWeeklyData();
            // Update goal progress in case task relationships changed
            await this.updateGoalProgress();
        };
        
        // Handle cancel on Escape
        const cancelEdit = async () => {
            // Reload the tasks to restore normal view
            await this.loadWeeklyData();
        };
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveEdit();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelEdit();
            }
        });
        
        input.addEventListener('blur', saveEdit);
    }

    async deleteTask(button) {
        const taskItem = button.closest('.task-item');
        const taskId = taskItem.dataset.taskId;
        const taskTitle = taskItem.querySelector('.task-title').textContent;
        
        // Confirm deletion
        if (confirm(`Delete task "${taskTitle}"?`)) {
            await this.storage.deleteTask(this.currentKeys.week, taskId);
            
            // Reload the tasks
            await this.loadWeeklyData();
            
            // Update goal progress after task deletion
            await this.updateGoalProgress();
        }
    }

    // Quarterly Goal CRUD Methods
    editGoal(button) {
        const goalItem = button.closest('.goal-item');
        const goalTitle = goalItem.querySelector('.goal-title');
        const goalId = goalItem.dataset.goalId;
        
        // Store original text
        const originalText = goalTitle.textContent;
        
        // Create input element
        const input = document.createElement('input');
        input.type = 'text';
        input.value = originalText;
        input.className = 'goal-title editing';
        input.style.cssText = 'background: white; border: 1px solid #007bff; border-radius: 3px; padding: 2px 6px; outline: none; flex: 1;';
        
        // Replace span with input
        goalTitle.parentNode.replaceChild(input, goalTitle);
        input.focus();
        input.select();
        
        // Handle save on Enter or blur
        const saveEdit = async () => {
            const newText = input.value.trim();
            if (newText && newText !== originalText) {
                await this.storage.updateGoal(this.currentKeys.quarter, goalId, {
                    title: newText
                });
            }
            // Reload the goals to restore normal view
            await this.loadQuarterlyData();
            // Update progress to ensure current state
            await this.updateGoalProgress();
        };
        
        // Handle cancel on Escape
        const cancelEdit = async () => {
            // Reload the goals to restore normal view
            await this.loadQuarterlyData();
        };
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveEdit();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelEdit();
            }
        });
        
        input.addEventListener('blur', saveEdit);
    }

    async deleteGoal(button) {
        const goalItem = button.closest('.goal-item');
        const goalId = goalItem.dataset.goalId;
        const goalTitle = goalItem.querySelector('.goal-title').textContent;
        
        // Confirm deletion
        if (confirm(`Delete goal "${goalTitle}"?`)) {
            await this.storage.deleteGoal(this.currentKeys.quarter, goalId);
            
            // Reload the goals
            await this.loadQuarterlyData();
            
            // Also reload weekly tasks to update their links
            await this.loadWeeklyData();
            
            // Update progress for remaining goals
            await this.updateGoalProgress();
        }
    }

    // Settings Modal Methods
    openSettingsModal() {
        document.getElementById('settings-modal-overlay').classList.add('active');
    }

    closeSettingsModal() {
        document.getElementById('settings-modal-overlay').classList.remove('active');
    }

    async exportData() {
        try {
            const data = await this.storage.exportData();
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `multi-scale-planner-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            alert('Data exported successfully!');
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export data. Please try again.');
        }
    }

    async importData(file) {
        if (!file) return;
        
        try {
            const text = await file.text();
            const success = await this.storage.importData(text);
            
            if (success) {
                alert('Data imported successfully! The app will refresh.');
                // Refresh the current view
                await this.loadData();
                this.closeSettingsModal();
            } else {
                alert('Failed to import data. Please check the file format.');
            }
        } catch (error) {
            console.error('Import failed:', error);
            alert('Failed to import data. Please check the file format.');
        }
        
        // Reset the file input
        document.getElementById('import-file').value = '';
    }

    async resetApp() {
        const confirmed = confirm(
            'Are you sure you want to reset the app?\n\n' +
            'This will permanently delete ALL data including:\n' +
            '• All quarterly goals\n' +
            '• All weekly tasks\n' +
            '• All daily priorities\n' +
            '• All time blocks\n' +
            '• All quick todos\n' +
            '• All focus session history\n' +
            '• All reviews\n\n' +
            'This action cannot be undone.\n\n' +
            'Type "RESET" to confirm:'
        );
        
        if (confirmed) {
            const confirmation = prompt('Type "RESET" to confirm the app reset:');
            if (confirmation === 'RESET') {
                try {
                    await this.storage.clearAllData();
                    
                    // Clear time tracker sessions
                    await chrome.storage.local.remove(['sessions']);
                    
                    // Clear reviews
                    await chrome.storage.local.remove(['reviews']);
                    
                    alert('App has been reset successfully! All data has been cleared.');
                    
                    // Refresh the app
                    await this.loadData();
                    this.closeSettingsModal();
                    
                    // Reset current focus and timer
                    this.currentFocus = null;
                    this.timeTracker.reset();
                    this.updateTimerDisplay();
                    this.showTaskSelector();
                    
                } catch (error) {
                    console.error('Reset failed:', error);
                    alert('Failed to reset the app. Please try again.');
                }
            } else {
                alert('Reset cancelled. Your data is safe.');
            }
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MultiScalePlanner();
});