# Multi-Scale Planner Chrome Extension

A Chrome extension implementing Cal Newport's multi-scale planning methodology: quarterly goals → weekly tasks → daily execution.

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