# Extension Testing Guide

## Installation Steps

1. **Open Chrome Extensions Page**
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)

2. **Load the Extension**
   - Click "Load unpacked"
   - Select the `multi-scale-planner-ext` directory
   - The extension should appear in your extensions list

3. **Verify Installation**
   - Extension should show as "Multi-Scale Planner"
   - Version should be "1.0.0"
   - No errors should appear

## Basic Functionality Tests

### 1. Extension Popup Opens
- Click the extension icon in the toolbar
- OR press `Ctrl+Shift+P` (Cmd+Shift+P on Mac)
- Popup should open with three tabs: Quarterly, Weekly, Daily

### 2. Tab Navigation
- Click each tab (Quarterly, Weekly, Daily)
- Content should switch between views
- Active tab should be highlighted

### 3. Add Items
- **Quarterly View**: Click "Add Goal" → modal should open
- **Weekly View**: Click "Add Task" → modal should open with goal linking
- **Daily View**: Click "Add Priority" → modal should open with task linking

### 4. Focus Management
- In Daily view, click "Focus" on any priority
- Focus section should update to show selected priority
- Timer should be available (Start/Stop)

### 5. Cross-Navigation
- Create a goal, task, and priority (linked)
- Click the linked items (→ arrows) to jump between views
- Should switch tabs and highlight related items

### 6. Review System
- Click "Review" button in Weekly or Quarterly views
- Review modal should open with reflection prompts
- Should be able to save reviews

### 7. Data Persistence
- Add some items and close the extension
- Reopen the extension
- Data should persist across sessions

## Expected Behavior

### Data Flow
1. **Quarterly Goals** → track long-term objectives
2. **Weekly Tasks** → break down goals into actionable tasks
3. **Daily Priorities** → focus on 3-5 most important items

### Features Working
- ✅ Modal forms for adding items
- ✅ Cross-view navigation via clickable links
- ✅ Focus tracking with timer
- ✅ Progress tracking (goals update based on task completion)
- ✅ Review system for reflection
- ✅ Data persistence using Chrome Storage

## Troubleshooting

### Extension Won't Load
- Check for JavaScript errors in Developer Tools
- Verify manifest.json syntax is correct
- Make sure all files are in correct directories

### Data Not Persisting
- Check Chrome Storage permissions in manifest
- Verify Chrome Storage API is working properly

### Modal Issues
- Check if modal CSS is loading correctly
- Verify modal JavaScript event listeners are working

## Performance Expectations

- Extension should load quickly (< 200ms)
- Smooth tab switching
- Responsive UI interactions
- No memory leaks during extended use

## Browser Compatibility

- Chrome 88+ (Manifest V3 support)
- Edge 88+ (Chromium-based)
- Other Chromium-based browsers