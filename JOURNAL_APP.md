# Journal-A-Day Web App Requirements

## Overview
A minimalist daily journaling app that allows users to create one entry per day, with entries locking at midnight local time. The app utilizes the existing toolbar component for content creation and formatting.

## Core Features

### 1. Daily Canvas
- **One page per day**: Users get a fresh canvas each day
- **Entry locking**: Entries become view-only at midnight local time
- **Lock notification**: Notification when approaching midnight (within 15 minutes)
- **Integration with existing toolbar**: Use the marker, washi tape, and image frame tools

### 2. Browse Mode
- **Calendar view**: Simple, minimal month-based calendar with color accents
- **Visual indicators**: Highlight days that have entries
- **Month navigation**: Previous/next month buttons

### 3. Data Persistence
- **Local storage**: Save entries to the user's browser using localStorage
- **Entry format**: Store entries with timestamps, canvas data, and positioning info

## Technical Implementation

### Canvas Implementation (Hybrid Approach)
1. **Base Structure**:
   - HTML Canvas element for drawings (marker tool)
   - DOM container for positioned elements (washi tape, image frames)
   - z-index management to ensure proper layering

2. **Tool-Specific Implementation**:
   - **Marker Tool**: 
     - HTML Canvas API for drawing functionality
     - Track mouse/touch events for drawing paths
     - Store stroke data (points, color, width) for reconstruction
   
   - **Washi Tape Tool**:
     - Create DOM elements with the selected pattern as background
     - Enable dragging, rotating using CSS transforms
     - Store position, rotation, pattern, and color data
   
   - **Image Frame Tool**:
     - Create DOM elements with frame styling
     - Allow image upload or placeholders
     - Store position, frame style, and image reference

3. **State Management**:
   - Store Canvas data as image data URL
   - Store DOM elements data (positions, properties) as JSON
   - Implement a unified save system that captures both

### Date and Locking Mechanism
1. **Time Management**:
   - Check current time against midnight boundary
   - Show countdown notification when within 15 minutes of midnight
   - Implement lock by disabling toolbar and interactive elements

2. **Entry Storage Format**:
```javascript
{
  date: "2025-02-27", // ISO date string
  canvasData: "data:image/png;base64,...", // Canvas as data URL
  elements: [
    {
      type: "washiTape",
      pattern: "pattern1",
      color: "#7ACCA8",
      x: 100,
      y: 150,
      width: 200,
      rotation: 15
    },
    {
      type: "imageFrame",
      frameStyle: "polaroid",
      color: "#E8E0D0",
      x: 300,
      y: 200,
      width: 250,
      height: 300,
      imageData: "data:image/jpeg;base64,..."
    }
  ],
  isLocked: true,
  lastModified: "2025-02-27T23:45:12"
}
```

### Calendar Browse Implementation
1. **Calendar Design**:
   - Minimal design with subtle color accents
   - Current day highlighted with primary accent color
   - Days with entries indicated with a small dot or different background
   - Simple month/year header with navigation arrows

2. **Responsive Design**:
   - Fluid layout that adapts to different screen sizes
   - Canvas and toolbar scale proportionally
   - Calendar view adapts to mobile (possibly switching to a list view on very small screens)

## Implementation Steps

1. **Setup Canvas Environment**:
   - Create canvas element for drawing
   - Setup event handlers for drawing operations
   - Implement toolbar state connection

2. **Implement Tool Functionality**:
   - Connect marker tool to canvas drawing context
   - Create system for adding/manipulating washi tape elements
   - Build image frame functionality with upload capability

3. **Build Storage System**:
   - Implement localStorage saving/loading
   - Create functions to serialize/deserialize journal entries
   - Setup automatic saving on tool use

4. **Develop Time-Based Locking**:
   - Implement date checking mechanism
   - Create lock notification system
   - Build view-only mode for locked entries

5. **Create Calendar Browse View**:
   - Build calendar grid component
   - Implement entry navigation
   - Add indicators for days with entries

6. **Optimize for Deployment**:
   - Ensure responsive behavior
   - Test localStorage limits and fallbacks
   - Prepare for deployment

## Questions and Considerations

1. **Data Persistence**:
   - Should we implement a backup/export feature for entries?
   - What happens when localStorage is full?
   - Should we consider adding cloud sync in the future?

2. **User Experience**:
   - Should we add an undo/redo feature?
   - Do we need a way to temporarily unlock past entries?
   - Should we add a preview mode for past entries?

3. **Performance**:
   - How do we handle large canvas data efficiently?
   - Should we implement lazy loading for the calendar view?
   - What's the optimal way to store and render complex drawings?

4. **Security**:
   - Do we need to encrypt stored journal entries?
   - Should we add a PIN/password protection option?
   - How do we handle sensitive image data? 