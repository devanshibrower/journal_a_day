import React, { useState } from 'react';
import MarkerTool from './tools/MarkerTool';
import WashiTapeTool, { WashiTapePattern, PatternPreview, WASHI_PATTERNS } from './tools/WashiTapeTool';
import ImageFrameTool from './tools/ImageFrameTool';

// Define tool types for type safety
type ToolType = 'marker' | 'washiTape' | 'imageFrame' | null;
type MarkerTipType = 'thin' | 'marker';

// Interface for our toolbar props
interface ToolbarProps {
  className?: string;
}

const Toolbar: React.FC<ToolbarProps> = ({ className }) => {
  // State for currently selected tool
  const [selectedTool, setSelectedTool] = useState<ToolType>(null);
  
  // State for whether options bar is expanded
  const [isOptionsExpanded, setIsOptionsExpanded] = useState(false);

  // State for tool options
  const [markerColor, setMarkerColor] = useState('#67dfff');
  const [markerTipType, setMarkerTipType] = useState<MarkerTipType>('marker');
  const [selectedPattern, setSelectedPattern] = useState('scallop');

  // Updated color set to match the design
  const toolColors = [
    '#67dfff', // light blue
    '#ff659f', // pink
    '#fcf151', // yellow
    '#83f18d', // light green
    '#b581fe', // purple
  ];

  const tipTypes: MarkerTipType[] = ['thin', 'marker'];

  // Handle tool selection
  const handleToolSelect = (tool: ToolType) => {
    if (selectedTool === tool) {
      setIsOptionsExpanded(false);
      setTimeout(() => setSelectedTool(null), 300); // Wait for animation to complete
    } else {
      setSelectedTool(tool);
      setIsOptionsExpanded(true);
    }
  };

  const getTipIcon = (type: MarkerTipType) => {
    switch (type) {
      case 'thin':
        return (
          <svg width="100%" height="100%" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_71_478)">
              <rect width="12" height="12" rx="6" fill="white"/>
              <path d="M5.62131 3.1414C5.66464 3.05474 5.75321 3 5.8501 3V3C5.94251 3 6.02774 3.04984 6.07304 3.13039L8.76893 7.92308H3.23047L5.62131 3.1414Z" fill="currentColor"/>
              <path d="M9.09909 7.52952C9.08651 7.40369 8.98062 7.30786 8.85416 7.30786H3.14584C3.01938 7.30786 2.91349 7.40369 2.90091 7.52952L2.62413 10.2974C2.61847 10.3539 2.59343 10.4067 2.55325 10.4469L2.0721 10.9281C2.02593 10.9742 2 11.0368 2 11.1021V13.8309C2 13.9669 2.11021 14.0771 2.24615 14.0771H9.75385C9.88979 14.0771 10 13.9669 10 13.8309V11.1021C10 11.0368 9.97407 10.9742 9.9279 10.9281L9.44675 10.4469C9.40657 10.4067 9.38153 10.3539 9.37587 10.2974L9.09909 7.52952Z" fill="#D9D9D9"/>
            </g>
            <defs>
              <clipPath id="clip0_71_478">
                <rect width="12" height="12" rx="6" fill="white"/>
              </clipPath>
            </defs>
          </svg>
        );
      default: // marker
        return (
          <svg width="100%" height="100%" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_71_472)">
              <rect width="12" height="12" rx="6" fill="white"/>
              <path d="M3.23047 4.853C3.23047 4.63123 3.37957 4.43716 3.59385 4.38002L8.15329 3.16417C8.46406 3.0813 8.76893 3.31553 8.76893 3.63715V7.92308H3.23047V4.853Z" fill="currentColor"/>
              <path d="M9.09909 7.52928C9.08651 7.40344 8.98062 7.30762 8.85416 7.30762H3.14584C3.01938 7.30762 2.91349 7.40344 2.90091 7.52928L2.62413 10.2971C2.61847 10.3536 2.59343 10.4065 2.55325 10.4467L2.0721 10.9278C2.02593 10.974 2 11.0366 2 11.1019V13.8307C2 13.9666 2.11021 14.0768 2.24615 14.0768H9.75385C9.88979 14.0768 10 13.9666 10 13.8307V11.1019C10 11.0366 9.97407 10.974 9.9279 10.9278L9.44675 10.4467C9.40657 10.4065 9.38153 10.3536 9.37587 10.2971L9.09909 7.52928Z" fill="#D9D9D9"/>
            </g>
            <defs>
              <clipPath id="clip0_71_472">
                <rect width="12" height="12" rx="6" fill="white"/>
              </clipPath>
            </defs>
          </svg>
        );
    }
  };

  return (
    <div className={`fixed left-1/2 bottom-[40%] -translate-x-1/2 ${className || ''}`}>
      <div className="relative w-fit">
        {/* Options bar */}
        <div className={`absolute bottom-full left-0 right-0 transition-all duration-300 ease-in-out mb-2
          ${isOptionsExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          <div className="bg-white rounded-full py-2 px-3 w-full shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {selectedTool === 'marker' && tipTypes.map((type) => (
                  <button
                    key={type}
                    className={`relative w-7 h-7 rounded-full transition-all overflow-visible
                      ${markerTipType === type 
                        ? 'bg-gray-200 text-gray-700' 
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
                    onClick={() => setMarkerTipType(type)}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-full">
                        {getTipIcon(type)}
                      </div>
                    </div>
                  </button>
                ))}
                {selectedTool === 'washiTape' && (
                  <div className="flex gap-2">
                    {WASHI_PATTERNS.map((pattern) => (
                      <PatternPreview
                        key={pattern.id}
                        pattern={pattern}
                        isSelected={selectedPattern === pattern.id}
                        onClick={() => setSelectedPattern(pattern.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              <div className="w-px h-7 bg-gray-200 mx-3" />
              
              <div className="flex gap-2">
                {toolColors.map((color) => (
                  <button
                    key={color}
                    className={`w-7 h-7 rounded-full hover:ring-2 hover:ring-gray-200 transition-all
                      ${markerColor === color ? 'ring-2 ring-gray-400' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setMarkerColor(color)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main toolbar */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="px-3 py-3 flex items-center gap-4">
            <MarkerTool
              isSelected={selectedTool === 'marker'}
              onClick={() => handleToolSelect(selectedTool === 'marker' ? null : 'marker')}
              color={markerColor}
              tipType={markerTipType}
              bodyColor={selectedTool === 'marker' ? '#D9D9D9' : '#D9D9D9'}
            />
            <WashiTapeTool
              isSelected={selectedTool === 'washiTape'}
              onClick={() => handleToolSelect(selectedTool === 'washiTape' ? null : 'washiTape')}
              color={markerColor}
              selectedPattern={selectedPattern}
              onPatternSelect={setSelectedPattern}
            />
            <ImageFrameTool
              isSelected={selectedTool === 'imageFrame'}
              onClick={() => handleToolSelect(selectedTool === 'imageFrame' ? null : 'imageFrame')}
              color={markerColor}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toolbar; 