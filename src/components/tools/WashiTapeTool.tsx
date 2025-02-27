import React, { useState } from 'react';

export interface WashiTapePattern {
  id: string;
  background: string;
  patternDef: React.ReactNode;
  patternId: string;
}

interface WashiTapeToolProps {
  isSelected: boolean;
  onClick: () => void;
  selectedWashiTape: string;
}

// Pattern definition
export const WASHI_PATTERNS: WashiTapePattern[] = [
  {
    id: 'checkers',
    background: '#A5B4FC',
    patternId: 'checkers-pattern',
    patternDef: (
      <pattern
        id="checkers-pattern"
        patternUnits="userSpaceOnUse"
        width="12"
        height="12"
      >
        <rect width="12" height="12" fill="currentColor"/>
        <path d="M1 1H5V5H1V1ZM7 1H11V5H7V1ZM1 7H5V11H1V7ZM7 7H11V11H7V7Z" 
          fill="#FCE7F3" fillOpacity="0.9"/>
      </pattern>
    )
  },
  {
    id: 'circles',
    background: '#F97316',
    patternId: 'circles-pattern',
    patternDef: (
      <pattern
        id="circles-pattern"
        patternUnits="userSpaceOnUse"
        width="12"
        height="12"
      >
        <rect width="12" height="12" fill="currentColor"/>
        <circle cx="6" cy="6" r="4" fill="none" stroke="#FACC15" strokeWidth="1.5" strokeOpacity="0.9"/>
        <circle cx="6" cy="6" r="2" fill="#FACC15" fillOpacity="0.9"/>
      </pattern>
    )
  },
  {
    id: 'stars',
    background: '#FDE047',
    patternId: 'stars-pattern',
    patternDef: (
      <pattern
        id="stars-pattern"
        patternUnits="userSpaceOnUse"
        width="8"
        height="8"
      >
        <rect width="8" height="8" fill="currentColor"/>
        <g fill="#839BDE" fillOpacity="0.9">
          <polygon fillRule="evenodd" points="4 1 5 3 7 4 5 5 4 7 3 5 1 4 3 3 4 1"/>
        </g>
      </pattern>
    )
  },
  {
    id: 'waves',
    background: '#F8E1E7',
    patternId: 'waves-pattern',
    patternDef: (
      <pattern
        id="waves-pattern"
        patternUnits="userSpaceOnUse"
        width="12"
        height="12"
      >
        <rect width="12" height="12" fill="currentColor"/>
        <path 
          d="M0 3C2 3 4 6 6 6S10 3 12 3M0 9C2 9 4 12 6 12S10 9 12 9"
          stroke="#EC4899" 
          strokeWidth="1.5"
          strokeOpacity="0.9"
          fill="none"
        />
      </pattern>
    )
  }
];

export const PatternPreview: React.FC<{ 
  pattern: WashiTapePattern; 
  isSelected: boolean; 
  onClick: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}> = ({
  pattern,
  isSelected,
  onClick,
  onMouseEnter,
  onMouseLeave
}) => {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="w-full h-full rounded-full overflow-hidden"
      style={{ background: 'transparent' }}
    >
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ color: pattern.background }}
      >
        <defs>
          {pattern.patternDef}
          <mask id={`circle-mask-${pattern.id}`}>
            <circle cx="12" cy="12" r="12" fill="white"/>
          </mask>
        </defs>
        <circle cx="12" cy="12" r="12" fill={pattern.background} />
        <circle 
          cx="12" 
          cy="12" 
          r="12" 
          fill={`url(#${pattern.patternId})`}
          mask={`url(#circle-mask-${pattern.id})`}
        />
      </svg>
    </button>
  );
};

const WashiTapeTool: React.FC<WashiTapeToolProps> = ({
  isSelected,
  onClick,
  selectedWashiTape
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Check if the selected option is a pattern or a color
  const isPatternSelected = WASHI_PATTERNS.some(p => p.id === selectedWashiTape);
  
  // Get the current pattern if one is selected
  const currentPattern = isPatternSelected ? 
    WASHI_PATTERNS.find(p => p.id === selectedWashiTape) : 
    null;

  // Determine what fill to use for the tape body
  const getTapeFill = () => {
    if (!isSelected) {
      return '#D4D4D8'; // Default unselected color
    }
    
    // If a pattern is selected, use it, otherwise use the solid color
    return currentPattern ? `url(#${currentPattern.patternId}-tape)` : selectedWashiTape;
  }

  // Create a modified pattern specifically for the tape view
  const getModifiedPatternForTape = () => {
    if (!currentPattern) return null;
    
    // Use a more reliable approach for patterns in the tape
    return (
      <pattern
        id={`${currentPattern.patternId}-tape`}
        patternUnits="userSpaceOnUse"
        width={currentPattern.id === 'stars' ? "8" : "12"}
        height={currentPattern.id === 'stars' ? "8" : "12"}
        patternTransform="scale(0.6)"
        x="0"
        y="0"
      >
        <rect width="100%" height="100%" fill={currentPattern.background}/>
        <use href={`#${currentPattern.patternId}-content`} />
      </pattern>
    );
  };

  // Extract pattern content to be reused
  const getPatternContent = () => {
    if (!currentPattern) return null;
    
    // Create a group for the pattern content that can be referenced
    switch (currentPattern.id) {
      case 'checkers':
        return (
          <g id={`${currentPattern.patternId}-content`}>
            <path d="M1 1H5V5H1V1ZM7 1H11V5H7V1ZM1 7H5V11H1V7ZM7 7H11V11H7V7Z" 
              fill="#FCE7F3" fillOpacity="0.9"/>
          </g>
        );
      case 'circles':
        return (
          <g id={`${currentPattern.patternId}-content`}>
            <circle cx="6" cy="6" r="4" fill="none" stroke="#FACC15" strokeWidth="1.5" strokeOpacity="0.9"/>
            <circle cx="6" cy="6" r="2" fill="#FACC15" fillOpacity="0.9"/>
          </g>
        );
      case 'stars':
        return (
          <g id={`${currentPattern.patternId}-content`}>
            <polygon fill="#839BDE" fillOpacity="0.9" fillRule="evenodd" points="4 1 5 3 7 4 5 5 4 7 3 5 1 4 3 3 4 1"/>
          </g>
        );
      case 'waves':
        return (
          <g id={`${currentPattern.patternId}-content`}>
            <path 
              d="M0 3C2 3 4 6 6 6S10 3 12 3M0 9C2 9 4 12 6 12S10 9 12 9"
              stroke="#EC4899" 
              strokeWidth="1.5"
              strokeOpacity="0.9"
              fill="none"
            />
          </g>
        );
      default:
        return null;
    }
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`w-18 h-18 rounded-md flex items-center justify-center transition-all
        ${isSelected ? 'bg-gray-100' : ''}`}
      title="Washi Tape Tool"
    >
      <svg 
        width="53" 
        height="53" 
        viewBox="0 0 16 16" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {currentPattern?.patternDef}
          {getPatternContent()}
          {getModifiedPatternForTape()}
        </defs>
        <path 
          d="M5.77397 14.7667H5.23333L5.23333 1.23333H5.77397L6.49382 1.82121C6.61134 1.91718 6.77524 1.93249 6.90849 1.85994L8 1.26567L9.09151 1.85994C9.22476 1.93249 9.38866 1.91718 9.50618 1.82121L10.226 1.23333H10.7667V14.7667H10.226L9.50618 14.1788C9.38866 14.0828 9.22476 14.0675 9.09151 14.1401L8 14.7343L6.90849 14.1401C6.77524 14.0675 6.61134 14.0828 6.49382 14.1788L5.77397 14.7667ZM7.95537 14.7586C7.95541 14.7586 7.95545 14.7586 7.95549 14.7586L7.95537 14.7586Z" 
          fill={getTapeFill()} 
          stroke={isSelected ? "none" : isHovered ? '#18181B' : '#71717A'} 
          strokeWidth="0.466667"
        />

        {/* Add a rectangle behind the path that's filled with the pattern for more reliable rendering */}
        {isSelected && currentPattern && (
          <rect
            x="5.2"
            y="1.2"
            width="5.6"
            height="13.6"
            fill={`url(#${currentPattern.patternId}-tape)`}
            mask="url(#tape-mask)"
          />
        )}

        {/* Add a mask for the rectangle */}
        <mask id="tape-mask">
          <path
            d="M5.77397 14.7667H5.23333L5.23333 1.23333H5.77397L6.49382 1.82121C6.61134 1.91718 6.77524 1.93249 6.90849 1.85994L8 1.26567L9.09151 1.85994C9.22476 1.93249 9.38866 1.91718 9.50618 1.82121L10.226 1.23333H10.7667V14.7667H10.226L9.50618 14.1788C9.38866 14.0828 9.22476 14.0675 9.09151 14.1401L8 14.7343L6.90849 14.1401C6.77524 14.0675 6.61134 14.0828 6.49382 14.1788L5.77397 14.7667Z"
            fill="white"
          />
        </mask>
      </svg>
    </button>
  );
};

export default WashiTapeTool; 