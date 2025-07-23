# Multi-Scale Planner

**A Chrome extension to implement Cal Newport's multi-scale planning system, helping you connect your long-term goals with your daily actions.**

---

## 🌟 Core Philosophy

This extension is built on Cal Newport's concept of **multi-scale planning**. The idea is to create a clear hierarchy from your high-level ambitions down to your daily schedule:

1.  **Quarterly Goals:** Define your big objectives for the next few months.
2.  **Weekly Plan:** Break down your quarterly goals into concrete tasks for the week.
3.  **Daily Execution:** Schedule and focus on your weekly tasks each day.

By connecting these scales, you ensure that your daily efforts are always aligned with your most important goals.

## ✨ Key Features

### 🎯 Daily Priorities Management

- **Full CRUD Operations:** Easily create, edit, update, and delete your daily priorities.
- **Drag-and-Drop Reordering:** Intuitively reorder your tasks to reflect their true importance.
- **Task Linking:** Connect your daily priorities to your larger weekly tasks for better alignment.

### ⏱️ Focus Timer

- **Dedicated Focus Mode:** Select a single priority and start a timer to focus exclusively on it.
- **Full Timer Controls:** Start, pause, reset, and complete focus sessions.
- **Keyboard Shortcuts:** Manage your focus timer without leaving your keyboard (`Shift + Space` to start/pause, `Shift + R` to reset, `Shift + C` to complete).

### 📊 Productivity Analytics

- **Automatic Session Tracking:** Every completed focus session is automatically logged.
- **Daily Stats:** View your total focus time, number of sessions, and average session duration for the day.
- **Session History:** Review a list of your completed focus sessions to see where your time went.

### 🗓️ Daily Time Blocking

- **Visual Time Blocks:** Plan your day by creating time blocks for your tasks.
- **Color-Coded Block Types:** Categorize your time into Work, Breaks, Meetings, and Personal activities.
- **Drag-and-Drop Scheduling:** Easily adjust your schedule by dragging and dropping time blocks.

## 🚀 Getting Started

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/multi-scale-planner-ext.git
    ```
2.  **Open Chrome and navigate to `chrome://extensions`**.
3.  **Enable "Developer mode"** in the top right corner.
4.  Click on **"Load unpacked"** and select the cloned repository's directory.

### How to Use

1.  **Open the Extension:** Click on the Multi-Scale Planner icon in your Chrome toolbar, or use the keyboard shortcut `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac).
2.  **Add Your Priorities:** Start by adding your most important tasks for the day.
3.  **Start a Focus Session:** Click the "Focus" button on a priority to start the timer and begin a deep work session.
4.  **Plan Your Day:** Use the time blocking feature to schedule your tasks and other activities.
5.  **Review Your Progress:** At the end of the day, check your productivity stats to see what you've accomplished.

## 🤝 Contributing

Contributions are welcome! If you have ideas for new features or improvements, please open an issue or submit a pull request.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

A Chrome extension for a multi time scale planning tool loosely based on Cal Newport's multi-scale planning methodology: quarterly goals → weekly tasks → daily execution.

## Features

### Core Functionality
- **Three-tier planning system**: Quarterly, Weekly, and Daily views
- **Hierarchical task linking**: Goals → Tasks → Priorities 
- **Focus management**: Track current focus with built-in timer
- **Time blocking**: Visual time block planning for daily work
- **Quick capture**: Fast todo entry for miscellaneous items

### Advanced Features
- **Cross-navigation**: Click links to jump between related items
- **Progress tracking**: Automatic goal progress based on task completion
- **Review system**: Weekly and quarterly review prompts
- **Data persistence**: All data stored locally using Chrome Storage API
- **Modal forms**: Clean, professional UI for adding items

## Installation

1. Clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. The extension icon will appear in your toolbar

## Usage

### Getting Started
1. Click the extension icon or use `Ctrl+Shift+P` to open
2. Start by adding quarterly goals in the Quarterly tab
3. Add weekly tasks linked to your goals in the Weekly tab
4. Set daily priorities linked to your tasks in the Daily tab

### Daily Planning Workflow
1. Open the Daily tab each morning
2. Add 3-5 priorities for the day
3. Set your current focus and start the timer
4. Use time blocks to structure your day
5. Mark tasks complete as you finish them

### Weekly Review
1. Click "Review" in the Weekly tab
2. Reflect on what went well and what could improve
3. Note key insights and plan actions for next week

### Quarterly Review
1. Click "Review" in the Quarterly tab
2. Assess goal progress and strategic direction
3. Plan adjustments for the next quarter

## Keyboard Shortcuts

- `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac): Open planner
- `Enter`: Add quick todo
- `Escape`: Close modals

## Technical Details

### Architecture
- **Manifest V3** Chrome extension
- **Vanilla JavaScript** for lightweight performance
- **Chrome Storage API** for data persistence
- **Modular design** with separate components for storage, time tracking, and UI

### File Structure
```
multi-scale-planner/
├── manifest.json
├── popup/
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
├── background/
│   └── service-worker.js
├── lib/
│   ├── storage.js
│   └── time-tracker.js
└── assets/
    └── icons/
```

## Development

### Prerequisites
- Chrome browser with developer mode enabled
- Basic knowledge of HTML, CSS, and JavaScript

### Local Development
1. Make changes to the source files
2. Go to `chrome://extensions/`
3. Click the refresh icon for the extension
4. Test changes in the popup

### Data Structure
The extension uses a hierarchical data structure:
- **Quarters** contain goals with progress tracking
- **Weeks** contain tasks linked to quarterly goals
- **Days** contain priorities linked to weekly tasks

## Privacy

All data is stored locally in Chrome's storage. No data is sent to external servers.

## Support

For issues or feature requests, please file an issue on the GitHub repository.