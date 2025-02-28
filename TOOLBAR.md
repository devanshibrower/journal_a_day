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
- Options bar has tool-specific options. 
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
   - color options for marker tool specifically are FDBB80, FE7293, 84EB9E, FCEA60, 80C6FF, D4AFFE
   - Default SVG colors:
     - Body color: zinc-300 (#D4D4D8)
     - Dark elements: zinc-500 (#71717B)
     - Selected/hover state: zinc-900 (#18181B)

2. Washi Tape Tool
   - Pattern selection
   - Width options
   - Color selection
   - color options for washi tape tool specifically are 7ACCA8, 6BAAE8, F9CE70
   - Default SVG colors follow the same token rules as Marker Tool

3. Image Frame Tool
   - Frame style options
   - Color selection for frame
   - for no frame pattern - no color options
   - for polaroid frame pattern - color options are E8E0D0, D4C27D, D4A0A7, B2C2A9, B0C4DE
   - colors for cloud frame are A7CFFF, D5C9F6, FFCBD0, C2E6D9, F9E0C0
   - Default SVG colors:
     - Body/background color: zinc-300 (#D4D4D8)
     - Dark elements: zinc-500 (#71717B)
     - Selected/hover state: zinc-900 (#18181B)

### Visual Design
- Clean, minimal interface
- Smooth transitions and animations
- Clear visual feedback for selected states
- Professional shadow effects
- Consistent spacing and alignment
- Consistent use of Tailwind color tokens:
  - Use exact hex values from Tailwind's color palette (e.g., zinc-300 must be #D4D4D8)
  - No custom hex values that duplicate existing Tailwind colors
  - SVG color standardization:
    - Default body/background elements must use zinc-300 (#D4D4D8)
    - Default dark elements (strokes, fills) must use zinc-500 (#71717B)
    - Selected/hover states must use zinc-900 (#18181B) where zinc-500 was used in default state.
    - Custom colors (from tool-specific palettes) only apply to elements meant to show the selected color

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