import React, { useState } from 'react';
import MarkerTool from './tools/MarkerTool';
import WashiTapeTool, { PatternPreview, WASHI_PATTERNS } from './tools/WashiTapeTool';
import ImageFrameTool, { FramePatternPreview, FRAME_PATTERNS, FramePattern } from './tools/ImageFrameTool';
import clsx from 'clsx';

// Define tool types for type safety
type ToolType = 'marker' | 'washiTape' | 'imageFrame' | null;
type MarkerTipType = 'thin' | 'marker';

// Interface for our toolbar props
interface ToolbarProps {
  className?: string;
}

// Define a type for washi tape selection - could be a pattern ID or a color
type WashiTapeSelection = string;

const Toolbar: React.FC<ToolbarProps> = ({ className }) => {
  // State for currently selected tool
  const [selectedTool, setSelectedTool] = useState<ToolType>(null);
  
  // State for whether options bar is expanded
  const [isOptionsExpanded, setIsOptionsExpanded] = useState(false);

  // State for tool options with separate color states for each tool
  const [markerColor, setMarkerColor] = useState('#FDBB80');
  // Replace separate pattern and color states with a single selection state
  const [washiTapeSelection, setWashiTapeSelection] = useState<WashiTapeSelection>('checkers');
  const [frameColor, setFrameColor] = useState('#E8E0D0'); // Default to first polaroid color
  
  const [markerTipType, setMarkerTipType] = useState<MarkerTipType>('marker');
  const [selectedFramePattern, setSelectedFramePattern] = useState('regular');
  
  // State to track which color button is being hovered
  const [hoveredColorIndex, setHoveredColorIndex] = useState<number | null>(null);
  // State to track which tip button is being hovered
  const [hoveredTipType, setHoveredTipType] = useState<MarkerTipType | null>(null);
  // State to track which pattern is being hovered
  const [hoveredPatternId, setHoveredPatternId] = useState<string | null>(null);
  // State to track which washi tape color is being hovered
  const [hoveredWashiTapeColorIndex, setHoveredWashiTapeColorIndex] = useState<number | null>(null);

  // Separate color palettes for each tool
  const markerColors = [
    '#FDBB80', // orange
    '#FE7293', // pink
    '#84EB9E', // green
    '#FCEA60', // yellow
    '#80C6FF', // blue
    '#D4AFFE', // purple
  ];

  const washiTapeColors = [
    '#7ACCA8', // teal
    '#6BAAE8', // blue
    '#F9CE70', // yellow
  ];

  // Separate color palettes for each frame type
  const polaroidColors = [
    '#E8E0D0', // beige
    '#D4C27D', // gold
    '#D4A0A7', // pink
    '#B2C2A9', // sage
    '#B0C4DE', // light blue
  ];

  const cloudColors = [
    '#A7CFFF', // light blue
    '#D5C9F6', // lavender
    '#FFCBD0', // pink
    '#C2E6D9', // mint
    '#F9E0C0', // peach
  ];

  const tipTypes: MarkerTipType[] = ['thin', 'marker'];

  // Handle tool selection
  const handleToolSelect = (tool: ToolType) => {
    // For all tools, including image frame, switch between them
    if (tool === selectedTool) {
      setSelectedTool(null);
      setIsOptionsExpanded(false);
      // Reset frame pattern to regular when deselecting image frame tool
      if (tool === 'imageFrame') {
        setSelectedFramePattern('regular');
      }
    } else {
      setSelectedTool(tool);
      setIsOptionsExpanded(true);
    }
  };

  // Handle closing the toolbar
  const handleClose = () => {
    setSelectedTool(null);
    setIsOptionsExpanded(false);
  };

  // Get current tool's color palette
  const getCurrentToolColors = () => {
    switch (selectedTool) {
      case 'marker':
        return markerColors;
      case 'washiTape':
        return washiTapeColors;
      case 'imageFrame':
        // Return cloud colors for regular frame (will be disabled)
        if (selectedFramePattern === 'regular') {
          return cloudColors;
        } else if (selectedFramePattern === 'polaroid') {
          return polaroidColors;
        } else {
          return cloudColors;
        }
      default:
        return markerColors;
    }
  };

  // Handle washi tape selection (pattern or color)
  const handleWashiTapeSelection = (selection: WashiTapeSelection) => {
    setWashiTapeSelection(selection);
  };

  // Check if the current selection is a pattern or a color
  const isWashiTapePattern = (selection: WashiTapeSelection) => {
    return WASHI_PATTERNS.some(pattern => pattern.id === selection);
  };

  // Get current color for washi tape (if a color is selected, otherwise null)
  const getWashiTapeColor = () => {
    return isWashiTapePattern(washiTapeSelection) ? null : washiTapeSelection;
  };

  // Get current pattern for washi tape (if a pattern is selected, otherwise null)
  const getWashiTapePattern = () => {
    return isWashiTapePattern(washiTapeSelection) ? washiTapeSelection : null;
  };

  // Handle color selection based on the active tool
  const handleColorSelect = (color: string) => {
    switch (selectedTool) {
      case 'marker':
        setMarkerColor(color);
        break;
      case 'washiTape':
        // For washi tape, selecting a color means deselecting any pattern
        setWashiTapeSelection(color);
        break;
      case 'imageFrame':
        setFrameColor(color);
        break;
    }
  };

  // Get current selected color based on the active tool
  const getCurrentColor = () => {
    switch (selectedTool) {
      case 'marker':
        return markerColor;
      case 'washiTape':
        return getWashiTapeColor() || (WASHI_PATTERNS.find(p => p.id === getWashiTapePattern())?.background || '#FFFFFF');
      case 'imageFrame':
        return frameColor;
      default:
        return markerColor;
    }
  };

  // Update frame pattern selection to also set the appropriate default color
  const handleFramePatternSelect = (patternId: string) => {
    setSelectedFramePattern(patternId);
    // Set default color based on pattern
    if (patternId === 'polaroid') {
      setFrameColor(polaroidColors[0]); // #E8E0D0
    } else if (patternId === 'cloud') {
      setFrameColor(cloudColors[0]); // #A7CFFF
    }
  };

  return (
    <div 
      className={`fixed left-1/2 bottom-[40%] -translate-x-1/2 ${className || ''}`}
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
    >
      <div className="relative w-fit">
        {/* Options bar */}
        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 transition-all duration-300 ease-in-out
          ${isOptionsExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          <div className="rounded-full py-1.5 px-2">
            <div className="flex items-center">
              <div className="flex gap-1.5">
                {selectedTool === 'marker' && (
                  <>
                    <div className="relative" style={{ width: '24px', height: '24px', margin: '3px' }}>
                      {/* Background rounded square for marker tip */}
                      <div className="absolute inset-0 w-full h-full rounded-md"></div>
                      
                      {/* Selection ring - using a div instead of outline */}
                      {(markerTipType === 'marker' || hoveredTipType === 'marker') && (
                        <div 
                          className="absolute rounded-md pointer-events-none transition-opacity duration-150"
                          style={{
                            top: '-2px',
                            left: '-2px',
                            width: '28px',
                            height: '28px',
                            border: `1px solid ${markerTipType === 'marker' ? '#90A2B9' : 'rgba(144, 162, 185, 0.7)'}`,
                            opacity: markerTipType === 'marker' ? 1 : 0.7,
                            zIndex: 10
                          }}
                        ></div>
                      )}
                      
                      {/* Button for interaction */}
                      <button
                        className="absolute inset-0 w-full h-full rounded-md flex items-center justify-center"
                        onClick={() => setMarkerTipType('marker')}
                        title="Marker Tip"
                        onMouseEnter={() => setHoveredTipType('marker')}
                        onMouseLeave={() => setHoveredTipType(null)}
                        style={{ background: 'transparent' }}
                      >
                        <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <g transform="translate(3,2.5) scale(2.7)">
                            <path d="M0.615234 0.926502C0.615234 0.815615 0.689783 0.718582 0.796925 0.690011L3.07665 0.0820851C3.23203 0.0406499 3.38446 0.157764 3.38446 0.318576V2.46154H0.615234V0.926502Z" fill={markerTipType === 'marker' ? '#18181B' : '#71717B'}/>
                            <path d="M3.54954 2.26464C3.54325 2.20172 3.49031 2.15381 3.42708 2.15381H0.572922C0.509691 2.15381 0.456747 2.20172 0.450455 2.26464L0.312064 3.64855C0.309237 3.67682 0.296716 3.70325 0.276626 3.72334L0.0360484 3.96391C0.012967 3.987 0 4.0183 0 4.05094V4.49235C0 4.56032 0.0551034 4.61542 0.123077 4.61542H3.87692C3.9449 4.61542 4 4.56032 4 4.49235V4.05094C4 4.0183 3.98703 3.987 3.96395 3.96391L3.72337 3.72334C3.70328 3.70325 3.69076 3.67682 3.68794 3.64855L3.54954 2.26464Z" fill="#D4D4D8"/>
                          </g>
                        </svg>
                      </button>
                    </div>
                    
                    <div className="relative" style={{ width: '24px', height: '24px', margin: '3px' }}>
                      {/* Background rounded square for thin tip */}
                      <div className="absolute inset-0 w-full h-full rounded-md"></div>
                      
                      {/* Selection ring - using a div instead of outline */}
                      {(markerTipType === 'thin' || hoveredTipType === 'thin') && (
                        <div 
                          className="absolute rounded-md pointer-events-none transition-opacity duration-150"
                          style={{
                            top: '-2px',
                            left: '-2px',
                            width: '28px',
                            height: '28px',
                            border: `1px solid ${markerTipType === 'thin' ? '#90A2B9' : 'rgba(144, 162, 185, 0.7)'}`,
                            opacity: markerTipType === 'thin' ? 1 : 0.7,
                            zIndex: 10
                          }}
                        ></div>
                      )}
                      
                      {/* Button for interaction */}
                      <button
                        className="absolute inset-0 w-full h-full rounded-md flex items-center justify-center"
                        onClick={() => setMarkerTipType('thin')}
                        title="Thin Tip"
                        onMouseEnter={() => setHoveredTipType('thin')}
                        onMouseLeave={() => setHoveredTipType(null)}
                        style={{ background: 'transparent' }}
                      >
                        <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <g transform="translate(3,2.5) scale(2.7)">
                            <path d="M1.79504 0.0765867C1.81851 0.0296529 1.86648 0 1.91897 0V0C1.96902 0 2.01519 0.027 2.03973 0.0706316L3.5 2.66667H0.5L1.79504 0.0765867Z" fill={markerTipType === 'thin' ? '#18181B' : '#71717B'}/>
                            <path d="M3.54954 2.26464C3.54325 2.20172 3.49031 2.15381 3.42708 2.15381H0.572922C0.509691 2.15381 0.456747 2.20172 0.450455 2.26464L0.312064 3.64855C0.309237 3.67682 0.296716 3.70325 0.276626 3.72334L0.0360484 3.96391C0.012967 3.987 0 4.0183 0 4.05094V4.49235C0 4.56032 0.0551034 4.61542 0.123077 4.61542H3.87692C3.9449 4.61542 4 4.56032 4 4.49235V4.05094C4 4.0183 3.98703 3.987 3.96395 3.96391L3.72337 3.72334C3.70328 3.70325 3.69076 3.67682 3.68794 3.64855L3.54954 2.26464Z" fill="#D4D4D8"/>
                          </g>
                        </svg>
                      </button>
                    </div>
                  </>
                )}
                {selectedTool === 'washiTape' && (
                  <>
                    {/* All washi tape options in a single flex container for consistent spacing */}
                    <div className="flex items-center">
                      {/* Pattern buttons */}
                      {WASHI_PATTERNS.map((pattern) => (
                        <div 
                          key={pattern.id} 
                          className="relative" 
                          style={{ width: '24px', height: '24px', margin: '3px' }}
                        >
                          {/* Selection ring - using a div instead of outline */}
                          {(washiTapeSelection === pattern.id || hoveredPatternId === pattern.id) && (
                            <div 
                              className="absolute rounded-full pointer-events-none transition-opacity duration-150"
                              style={{
                                top: '-2px',
                                left: '-2px',
                                width: '28px',
                                height: '28px',
                                border: `1px solid ${washiTapeSelection === pattern.id ? '#90A2B9' : 'rgba(144, 162, 185, 0.7)'}`,
                                opacity: washiTapeSelection === pattern.id ? 1 : 0.7,
                                zIndex: 10
                              }}
                            ></div>
                          )}
                          
                          {/* Button for interaction */}
                          <PatternPreview 
                            pattern={pattern}
                            isSelected={washiTapeSelection === pattern.id}
                            onClick={() => handleWashiTapeSelection(pattern.id)}
                            onMouseEnter={() => setHoveredPatternId(pattern.id)}
                            onMouseLeave={() => setHoveredPatternId(null)}
                          />
                        </div>
                      ))}
                      
                      {/* Color buttons - in same container as patterns for consistent spacing */}
                      {washiTapeColors.map((color, index) => (
                        <div key={color} className="relative" style={{ width: '24px', height: '24px', margin: '3px' }}>
                          {/* Selection ring - using a div instead of outline */}
                          {(washiTapeSelection === color || hoveredWashiTapeColorIndex === index) && (
                            <div 
                              className="absolute rounded-full pointer-events-none transition-opacity duration-150"
                              style={{
                                top: '-2px',
                                left: '-2px',
                                width: '28px',
                                height: '28px',
                                border: `1px solid ${washiTapeSelection === color ? '#90A2B9' : 'rgba(144, 162, 185, 0.7)'}`,
                                opacity: washiTapeSelection === color ? 1 : 0.7,
                                zIndex: 10
                              }}
                            ></div>
                          )}
                          
                          {/* Button for interaction */}
                          <button
                            onClick={() => handleWashiTapeSelection(color)}
                            className="absolute inset-0 w-full h-full rounded-full"
                            style={{ 
                              backgroundColor: color,
                              cursor: 'pointer'
                            }}
                            onMouseEnter={() => setHoveredWashiTapeColorIndex(index)}
                            onMouseLeave={() => setHoveredWashiTapeColorIndex(null)}
                          ></button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {selectedTool === 'imageFrame' && (
                  <div className="flex gap-1.5">
                    {FRAME_PATTERNS.map((pattern) => (
                      <FramePatternPreview
                        key={pattern.id}
                        pattern={pattern}
                        isSelected={selectedFramePattern === pattern.id}
                        onClick={() => handleFramePatternSelect(pattern.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {/* Only show divider when needed */}
              {selectedTool === 'marker' || selectedTool === 'imageFrame' && (
                <div className="w-px h-6 bg-gray-200 mx-2" />
              )}
              
              <div className={`flex items-center`}>
                {/* Show colors for marker tool or image frame tool (always show for image frame) */}
                {(selectedTool === 'marker' || selectedTool === 'imageFrame') && getCurrentToolColors().map((color, index) => (
                  <div key={color} className="relative" style={{ width: '24px', height: '24px', margin: '3px' }}>
                    {/* Selection ring - using a div instead of outline */}
                    {(getCurrentColor() === color || hoveredColorIndex === index) && selectedFramePattern !== 'regular' && (
                      <div 
                        className="absolute rounded-full pointer-events-none transition-opacity duration-150"
                        style={{
                          top: '-2px',
                          left: '-2px',
                          width: '28px',
                          height: '28px',
                          border: `1px solid ${getCurrentColor() === color ? '#90A2B9' : 'rgba(144, 162, 185, 0.7)'}`,
                          opacity: getCurrentColor() === color ? 1 : 0.7,
                          zIndex: 10
                        }}
                      ></div>
                    )}
                    
                    {/* Button for interaction */}
                    <button
                      onClick={() => handleColorSelect(color)}
                      className="absolute inset-0 w-full h-full rounded-full transition-opacity"
                      style={{ 
                        backgroundColor: color,
                        cursor: selectedFramePattern === 'regular' ? 'not-allowed' : 'pointer',
                        opacity: selectedFramePattern === 'regular' ? '0.5' : '1'
                      }}
                      onMouseEnter={() => setHoveredColorIndex(index)}
                      onMouseLeave={() => setHoveredColorIndex(null)}
                      disabled={selectedFramePattern === 'regular'}
                    ></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main toolbar */}
        <div className="bg-zinc-100 rounded-xl">
          <div className="px-3 py-3 flex items-center gap-8">
            <MarkerTool
              isSelected={selectedTool === 'marker'}
              onClick={() => handleToolSelect('marker')}
              color={markerColor}
              tipType={markerTipType}
              bodyColor={selectedTool === 'marker' ? '#90A2B9' : '#D9D9D9'}
            />
            <WashiTapeTool
              isSelected={selectedTool === 'washiTape'}
              onClick={() => handleToolSelect('washiTape')}
              selectedWashiTape={washiTapeSelection}
            />
            <ImageFrameTool
              isSelected={selectedTool === 'imageFrame'}
              onClick={() => handleToolSelect('imageFrame')}
              color={frameColor}
              selectedPattern={selectedFramePattern}
              onPatternSelect={setSelectedFramePattern}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;