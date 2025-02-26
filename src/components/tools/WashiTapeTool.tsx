import React from 'react';

export interface WashiTapePattern {
  id: string;
  background: string;
  patternDef: React.ReactNode;
  patternId: string;
}

interface WashiTapeToolProps {
  isSelected: boolean;
  onClick: () => void;
  color?: string;
  selectedPattern?: string;
  onPatternSelect?: (patternId: string) => void;
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
    id: 'dots',
    background: '#B885F2',
    patternId: 'dots-pattern',
    patternDef: (
      <pattern
        id="dots-pattern"
        patternUnits="userSpaceOnUse"
        width="20"
        height="20"
      >
        <rect width="20" height="20" fill="currentColor"/>
        <g fill="#C2CB7E" fillOpacity="0.9" fillRule="evenodd">
          <circle cx="3" cy="3" r="3"/>
          <circle cx="13" cy="13" r="3"/>
        </g>
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

export const PatternPreview: React.FC<{ pattern: WashiTapePattern; isSelected: boolean; onClick: () => void }> = ({
  pattern,
  isSelected,
  onClick
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-7 h-7 rounded-full overflow-hidden transition-all
        ${isSelected ? 'ring-2 ring-gray-400' : 'hover:ring-2 hover:ring-gray-200'}`}
    >
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 28 28" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ color: pattern.background }}
      >
        <defs>
          {pattern.patternDef}
          <mask id={`circle-mask-${pattern.id}`}>
            <circle cx="14" cy="14" r="14" fill="white"/>
          </mask>
        </defs>
        <circle cx="14" cy="14" r="14" fill={pattern.background} />
        <circle 
          cx="14" 
          cy="14" 
          r="14" 
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
  color = '#000000',
  selectedPattern = 'scallop',
  onPatternSelect
}) => {
  const currentPattern = WASHI_PATTERNS.find(p => p.id === selectedPattern);

  return (
    <button
      onClick={onClick}
      className={`w-20 h-20 rounded-md flex items-center justify-center transition-all
        ${isSelected ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
      title="Washi Tape Tool"
    >
      <svg 
        width="40" 
        height="53" 
        viewBox="0 0 15 20" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ color: currentPattern?.background || color }}
      >
        <defs>
          {currentPattern?.patternDef}
        </defs>
        <path 
          d="M0.0916662 3.36702L9.075 18.9266C9.12563 19.0143 9.23775 19.0443 9.32544 18.9937L9.89476 18.665C9.93687 18.6407 9.96759 18.6007 9.98018 18.5537L10.2571 17.52C10.2798 17.4356 10.3588 17.3789 10.446 17.3845L11.8232 17.4734C11.8971 17.4781 11.9665 17.438 11.9993 17.3717L12.611 16.1346C12.6497 16.0562 12.7384 16.0161 12.8228 16.0388L13.8565 16.3157C13.9034 16.3283 13.9535 16.3217 13.9956 16.2974L14.5649 15.9687C14.6526 15.9181 14.6826 15.806 14.632 15.7183L5.64866 0.158689C5.59804 0.0710023 5.48591 0.0409589 5.39823 0.0915849L4.82891 0.420282C4.7868 0.444593 4.75607 0.484637 4.74349 0.531604L4.46652 1.56527C4.4439 1.64968 4.36484 1.70639 4.27763 1.70077L2.90047 1.61195C2.82661 1.60719 2.75713 1.6473 2.72433 1.71365L2.11266 2.95071C2.07393 3.02905 1.98529 3.06916 1.90087 3.04654L0.867209 2.76957C0.820242 2.75699 0.7702 2.76358 0.728091 2.78789L0.158771 3.11659C0.0710844 3.16721 0.0410404 3.27934 0.0916662 3.36702Z" 
          fill={isSelected ? `url(#${currentPattern?.patternId})` : '#4B5563'}
        />
      </svg>
    </button>
  );
};

export default WashiTapeTool; 