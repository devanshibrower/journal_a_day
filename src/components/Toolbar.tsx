import React, { useState } from 'react';
import MarkerTool from './tools/MarkerTool';
import WashiTapeTool, { PatternPreview, WASHI_PATTERNS } from './tools/WashiTapeTool';
import ImageFrameTool, { FramePatternPreview, FRAME_PATTERNS } from './tools/ImageFrameTool';

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
  const [frameColor, setFrameColor] = useState('#6BAAE8');
  
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

  const frameColors = [
    '#6BAAE8', // blue
    '#F9CE70', // yellow
    '#7ACCA8', // teal
    '#FE7293', // pink
  ];

  const tipTypes: MarkerTipType[] = ['thin', 'marker'];

  // Handle tool selection
  const handleToolSelect = (tool: ToolType) => {
    if (tool === 'imageFrame') {
      // For image frame tool, always keep it selected and expanded
      setSelectedTool('imageFrame');
      setIsOptionsExpanded(true);
      return;
    }

    // For other tools, switch between them
    if (tool === selectedTool) {
      setSelectedTool(null);
      setIsOptionsExpanded(false);
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
        return frameColors;
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

  return (
    <div 
      className={`fixed left-1/2 bottom-[40%] -translate-x-1/2 ${className || ''}`}
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
    >
      <div className="relative w-fit">
        {/* Options bar */}
        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 transition-all duration-300 ease-in-out mb-2
          ${isOptionsExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          <div className="bg-zinc-100 rounded-full py-1.5 px-2">
            <div className="flex items-center">
              <div className="flex gap-1.5">
                {selectedTool === 'marker' && (
                  <>
                    <div className="relative" style={{ width: '24px', height: '24px', margin: '3px' }}>
                      {/* Background circle for marker tip */}
                      <div className="absolute inset-0 w-full h-full rounded-full bg-white"></div>
                      
                      {/* Selection ring - using a div instead of outline */}
                      {(markerTipType === 'marker' || hoveredTipType === 'marker') && (
                        <div 
                          className="absolute rounded-full pointer-events-none transition-opacity duration-150"
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
                        className="absolute inset-0 w-full h-full rounded-full flex items-center justify-center"
                        onClick={() => setMarkerTipType('marker')}
                        title="Marker Tip"
                        onMouseEnter={() => setHoveredTipType('marker')}
                        onMouseLeave={() => setHoveredTipType(null)}
                        style={{ background: 'transparent' }}
                      >
                        <svg width="100%" height="100%" viewBox="0 0 8 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <g clipPath="url(#clip0_93_1447)">
                            <rect x="0.75" width="6.5" height="6.5" rx="3.25" fill="white"/>
                            <path d="M2.5 2.62871C2.5 2.50858 2.58076 2.40346 2.69683 2.37251L5.16653 1.71393C5.33486 1.66904 5.5 1.79591 5.5 1.97012V4.29167H2.5V2.62871Z" fill={markerTipType === 'marker' ? '#18181B' : '#71717B'}/>
                            <path d="M5.67932 4.07832C5.67251 4.01016 5.61515 3.95825 5.54665 3.95825H2.45465C2.38615 3.95825 2.32879 4.01016 2.32198 4.07832L2.17205 5.57756C2.16899 5.60819 2.15543 5.63681 2.13366 5.65857L1.87304 5.9192C1.84803 5.9442 1.83398 5.97812 1.83398 6.01348V7.49159C1.83398 7.56522 1.89368 7.62492 1.96732 7.62492H6.03398C6.10762 7.62492 6.16732 7.56522 6.16732 7.49159V6.01348C6.16732 5.97812 6.15327 5.9442 6.12827 5.9192L5.86764 5.65857C5.84588 5.63681 5.83231 5.60819 5.82925 5.57756L5.67932 4.07832Z" fill="#D9D9D9"/>
                          </g>
                          <defs>
                            <clipPath id="clip0_93_1447">
                              <rect x="0.75" width="6.5" height="6.5" rx="3.25" fill="white"/>
                            </clipPath>
                          </defs>
                        </svg>
                      </button>
                    </div>
                    
                    <div className="relative" style={{ width: '24px', height: '24px', margin: '3px' }}>
                      {/* Background circle for thin tip */}
                      <div className="absolute inset-0 w-full h-full rounded-full bg-white"></div>
                      
                      {/* Selection ring - using a div instead of outline */}
                      {(markerTipType === 'thin' || hoveredTipType === 'thin') && (
                        <div 
                          className="absolute rounded-full pointer-events-none transition-opacity duration-150"
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
                        className="absolute inset-0 w-full h-full rounded-full flex items-center justify-center"
                        onClick={() => setMarkerTipType('thin')}
                        title="Thin Tip"
                        onMouseEnter={() => setHoveredTipType('thin')}
                        onMouseLeave={() => setHoveredTipType(null)}
                        style={{ background: 'transparent' }}
                      >
                        <svg width="100%" height="100%" viewBox="0 0 8 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <g clipPath="url(#clip0_93_1451)">
                            <rect x="0.75" width="6.5" height="6.5" rx="3.25" fill="white"/>
                            <path d="M3.79504 1.70159C3.81851 1.65465 3.86648 1.625 3.91897 1.625V1.625C3.96902 1.625 4.01519 1.652 4.03973 1.69563L5.5 4.29167H2.5L3.79504 1.70159Z" fill={markerTipType === 'thin' ? '#18181B' : '#71717B'}/>
                            <path d="M5.67932 4.07832C5.67251 4.01016 5.61515 3.95825 5.54665 3.95825H2.45465C2.38615 3.95825 2.32879 4.01016 2.32198 4.07832L2.17205 5.57756C2.16899 5.60819 2.15543 5.63681 2.13366 5.65857L1.87304 5.9192C1.84803 5.9442 1.83398 5.97812 1.83398 6.01348V7.49159C1.83398 7.56522 1.89368 7.62492 1.96732 7.62492H6.03398C6.10762 7.62492 6.16732 7.56522 6.16732 7.49159V6.01348C6.16732 5.97812 6.15327 5.9442 6.12827 5.9192L5.86764 5.65857C5.84588 5.63681 5.83231 5.60819 5.82925 5.57756L5.67932 4.07832Z" fill="#D9D9D9"/>
                          </g>
                          <defs>
                            <clipPath id="clip0_93_1451">
                              <rect x="0.75" width="6.5" height="6.5" rx="3.25" fill="white"/>
                            </clipPath>
                          </defs>
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
                        onClick={() => setSelectedFramePattern(pattern.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {selectedTool !== 'washiTape' && <div className="w-px h-6 bg-gray-200 mx-2" />}
              
              <div className={`flex items-center`}>
                {selectedTool !== 'washiTape' && getCurrentToolColors().map((color, index) => (
                  <div key={color} className="relative" style={{ width: '24px', height: '24px', margin: '3px' }}>
                    {/* Selection ring - using a div instead of outline */}
                    {(getCurrentColor() === color || hoveredColorIndex === index) && (
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
                      className="absolute inset-0 w-full h-full rounded-full"
                      style={{ 
                        backgroundColor: color,
                        cursor: 'pointer'
                      }}
                      onMouseEnter={() => setHoveredColorIndex(index)}
                      onMouseLeave={() => setHoveredColorIndex(null)}
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