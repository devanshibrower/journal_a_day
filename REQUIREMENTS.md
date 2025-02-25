# Digital Journal Toolbar Project

A FigJam-inspired digital journal toolbar implementation.

## Core Requirements

### Toolbar Structure
- A toolbar with three main tools: marker, washi tape, and image frame in light grey color
- main tools are in b/w color by default, no bg color on tools button by default
- in hover state, show white bg for tool buttons
- Rectangular toolbar with slightly rounded corners
- Tools are arranged horizontally with equal spacing

### Tool Options
- An options bar appears inside the toolbar when a tool is selected
- The options bar expands appears within the toolbar, expanding the main toolbar upwards (not downward). The positions of the main tools should not change
- Options bar has tool-specific options on the left and color options on the right
- all the menu items in the options bar are circular in shape
- Left and right sections are separated by a vertical divider in grey color. 

### Tool Behaviors
- Tools change appearance from B&W to colored when selected
- Tools reflect currently selected options in their appearance (e.g., marker color and tip changes)
- Clicking a selected tool deselects it
- when a tool is selected, the options bar should expand upward from the toolbar
- all the tools must have dynamic svg icons - that reflect selections from the options bar which is specific to the tool.

### Tool-Specific Features
1. Marker Tool
   - Adjustable tip type -> highlighter, thin pen, marker
   - Color selection
   - Dynamic preview of selected color and tip type in selected tool button's svg

2. Washi Tape Tool
   - Pattern selection
   - Width options
   - Color selection

3. Image Frame Tool
   - Frame style options
   - Color selection for frame

### Visual Design
- Clean, minimal interface
- Smooth transitions and animations
- Clear visual feedback for selected states
- Professional shadow effects
- Consistent spacing and alignment

## Implementation Notes
- Built with React + TypeScript
- Uses Tailwind CSS for styling
- SVG icons with dynamic color changes
- Responsive and accessible design 

## Instructions while building the project
- follow design references that are shared as screenshots
- follow the requirements shared above
- ask any questions that you have at any time
- ask for assets if needed
- add comments to the code to explain what you are doing and why, so its easy for me to understand the code
- Dont make changes to things that are not mentioned while discussing an issue. double check with me before making any changes.