import React, { useState } from 'react';
// Import the user's image directly
import frameImageUrl from '../../assets/image1.png';

// Interface for our frame patterns
export interface FramePattern {
  id: string;
  svg: (color: string, isSelected: boolean, isHovered: boolean) => React.ReactElement;
  previewSvg: (color: string) => React.ReactElement;
}

interface ImageFrameToolProps {
  isSelected: boolean;
  onClick: () => void;
  color?: string;
  selectedPattern?: string;
  onPatternSelect?: (patternId: string) => void;
}

// Frame pattern definitions
export const FRAME_PATTERNS: FramePattern[] = [
  {
    id: 'regular',
    svg: (color: string, isSelected: boolean, isHovered: boolean = false) => (
      <svg width="53" height="53" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_regular)">
          <rect x="1" y="1" width="14" height="14" rx="0.875" fill="#D4D4D8"/>
          {isSelected ? (
            <image
              x="1"
              y="1"
              width="14"
              height="14"
              href={frameImageUrl}
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#clip0_regular)"
            />
          ) : (
            <>
              <path d="M1 10.4999C2.19786 9.76782 4 7.49989 6 11.4999C6.91756 13.335 7.75021 7.43738 10 7.99992C12 8.5 14.1765 11.1628 15 11.9999" stroke={isHovered ? '#18181B' : '#71717B'} strokeWidth="0.875" strokeLinecap="round"/>
              <circle cx="12.3125" cy="4.3125" r="1.3125" fill={isHovered ? '#18181B' : '#71717B'}/>
            </>
          )}
        </g>
        <defs>
          <clipPath id="clip0_regular">
            <rect x="1" y="1" width="14" height="14" rx="0.875" fill="white"/>
          </clipPath>
        </defs>
      </svg>
    ),
    previewSvg: (color: string) => (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_preview)">
          <rect x="1" y="1" width="14" height="14" rx="0.875" fill="#D4D4D8"/>
          <path d="M1 10.4999C2.19786 9.76782 4 7.49989 6 11.4999C6.91756 13.335 7.75021 7.43738 10 7.99992C12 8.5 14.1765 11.1628 15 11.9999" stroke={color} strokeWidth="0.875" strokeLinecap="round"/>
          <circle cx="12.3125" cy="4.3125" r="1.3125" fill={color}/>
        </g>
        <defs>
          <clipPath id="clip0_preview">
            <rect x="1" y="1" width="14" height="14" rx="0.875" fill="white"/>
          </clipPath>
        </defs>
      </svg>
    )
  },
  {
    id: 'cloud',
    svg: (color: string, isSelected: boolean, isHovered: boolean = false) => (
      <svg width="53" height="53" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M3.01574 0.93163C3.0375 0.953389 3.05858 0.975826 3.07895 0.998905C3.34898 0.692961 3.74406 0.5 4.18421 0.5C4.62436 0.5 5.01944 0.692961 5.28947 0.998905C5.55951 0.692961 5.95459 0.5 6.39474 0.5C6.83489 0.5 7.22997 0.692961 7.5 0.998905C7.77003 0.692961 8.16511 0.5 8.60526 0.5C9.04541 0.5 9.44049 0.692885 9.71053 0.998724C9.98056 0.692886 10.3756 0.5 10.8158 0.5C11.2559 0.5 11.6509 0.692885 11.9209 0.998724C12.1909 0.692886 12.5859 0.5 13.026 0.5C13.8399 0.5 14.5 1.15979 14.5 1.97368C14.5 2.4139 14.307 2.80904 14.0009 3.07908C14.3068 3.3491 14.4997 3.74412 14.4997 4.18419C14.4997 4.62434 14.3067 5.01942 14.0008 5.28945C14.3067 5.55948 14.4997 5.95456 14.4997 6.39471C14.4997 6.83486 14.3067 7.22994 14.0008 7.49997C14.3067 7.77 14.4997 8.16508 14.4997 8.60523C14.4997 9.04538 14.3067 9.44046 14.0008 9.71049C14.3067 9.98052 14.4997 10.3756 14.4997 10.8157C14.4997 11.2558 14.3068 11.6508 14.0009 11.9209C14.307 12.1909 14.5 12.586 14.5 13.0263C14.5 13.8275 13.8605 14.4794 13.064 14.4995C13.0515 14.4998 13.0389 14.4999 13.0263 14.4999C13.0263 14.4999 13.0263 14.4999 13.0263 14.4999C12.5862 14.4999 12.1911 14.307 11.9211 14.0011C11.921 14.0011 11.9211 14.001 11.9211 14.0011C11.651 14.3069 11.2559 14.5 10.8158 14.5C10.3756 14.5 9.98056 14.307 9.71053 14.0011C9.44049 14.307 9.04541 14.5 8.60526 14.5C8.16511 14.5 7.77003 14.307 7.5 14.0011C7.22997 14.307 6.83489 14.5 6.39474 14.5C5.95459 14.5 5.55951 14.307 5.28947 14.0011C5.01944 14.307 4.62436 14.5 4.18421 14.5C3.74406 14.5 3.34898 14.307 3.07895 14.0011C2.80891 14.307 2.41383 14.5 1.97368 14.5C1.15979 14.5 0.5 13.8402 0.5 13.0263C0.5 13.0263 0.5 13.0263 0.5 13.0263C0.5 12.5862 0.692963 12.191 0.998908 11.921C0.692963 11.651 0.5 11.2559 0.5 10.8157C0.5 10.3756 0.692962 9.98052 0.998907 9.71049C0.692962 9.44046 0.5 9.04538 0.5 8.60523C0.5 8.16508 0.692963 7.77 0.998907 7.49997C0.692963 7.22994 0.5 6.83486 0.5 6.39471C0.5 5.95456 0.692962 5.55948 0.998907 5.28945C0.692962 5.01942 0.5 4.62434 0.5 4.18419C0.5 3.74405 0.692963 3.34897 0.998907 3.07894C0.692963 2.80891 0.5 2.41383 0.5 1.97368C0.5 1.15979 1.15979 0.5 1.97368 0.5C2.38063 0.5 2.74905 0.664947 3.01574 0.93163Z" fill={isSelected ? color : isHovered ? '#18181B' : '#71717B'}/>
        <g clipPath="url(#clip0_139_617)">
          <rect x="1.8457" y="1.84619" width="11.3077" height="11.3077" rx="0.706731" fill="#D4D4D8"/>
          {isSelected ? (
            <image
              x="1.8457"
              y="1.84619"
              width="11.3077"
              height="11.3077"
              href={frameImageUrl}
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#clip0_139_617)"
            />
          ) : (
            <>
              <path d="M1.8457 9.51938C2.81321 8.9281 4.26878 7.09631 5.88416 10.3271C6.62527 11.8093 7.29779 7.04582 9.11493 7.50018C10.7303 7.90409 12.4882 10.0548 13.1534 10.7309" stroke={isHovered ? '#18181B' : '#71717B'} strokeWidth="0.706731" strokeLinecap="round"/>
              <circle cx="10.9839" cy="4.52128" r="1.0601" fill={isHovered ? '#18181B' : '#71717B'}/>
            </>
          )}
        </g>
        <defs>
          <clipPath id="clip0_139_617">
            <rect x="1.8457" y="1.84619" width="11.3077" height="11.3077" rx="0.706731" fill="white"/>
          </clipPath>
        </defs>
      </svg>
    ),
    previewSvg: (color: string) => (
      <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M3.01574 0.93163C3.0375 0.953389 3.05858 0.975826 3.07895 0.998905C3.34898 0.692961 3.74406 0.5 4.18421 0.5C4.62436 0.5 5.01944 0.692961 5.28947 0.998905C5.55951 0.692961 5.95459 0.5 6.39474 0.5C6.83489 0.5 7.22997 0.692961 7.5 0.998905C7.77003 0.692961 8.16511 0.5 8.60526 0.5C9.04541 0.5 9.44049 0.692885 9.71053 0.998724C9.98056 0.692886 10.3756 0.5 10.8158 0.5C11.2559 0.5 11.6509 0.692885 11.9209 0.998724C12.1909 0.692886 12.5859 0.5 13.026 0.5C13.8399 0.5 14.5 1.15979 14.5 1.97368C14.5 2.4139 14.307 2.80904 14.0009 3.07908C14.3068 3.3491 14.4997 3.74412 14.4997 4.18419C14.4997 4.62434 14.3067 5.01942 14.0008 5.28945C14.3067 5.55948 14.4997 5.95456 14.4997 6.39471C14.4997 6.83486 14.3067 7.22994 14.0008 7.49997C14.3067 7.77 14.4997 8.16508 14.4997 8.60523C14.4997 9.04538 14.3067 9.44046 14.0008 9.71049C14.3067 9.98052 14.4997 10.3756 14.4997 10.8157C14.4997 11.2558 14.3068 11.6508 14.0009 11.9209C14.307 12.1909 14.5 12.586 14.5 13.0263C14.5 13.8275 13.8605 14.4794 13.064 14.4995C13.0515 14.4998 13.0389 14.4999 13.0263 14.4999C13.0263 14.4999 13.0263 14.4999 13.0263 14.4999C12.5862 14.4999 12.1911 14.307 11.9211 14.0011C11.921 14.0011 11.9211 14.001 11.9211 14.0011C11.651 14.3069 11.2559 14.5 10.8158 14.5C10.3756 14.5 9.98056 14.307 9.71053 14.0011C9.44049 14.307 9.04541 14.5 8.60526 14.5C8.16511 14.5 7.77003 14.307 7.5 14.0011C7.22997 14.307 6.83489 14.5 6.39474 14.5C5.95459 14.5 5.55951 14.307 5.28947 14.0011C5.01944 14.307 4.62436 14.5 4.18421 14.5C3.74406 14.5 3.34898 14.307 3.07895 14.0011C2.80891 14.307 2.41383 14.5 1.97368 14.5C1.15979 14.5 0.5 13.8402 0.5 13.0263C0.5 13.0263 0.5 13.0263 0.5 13.0263C0.5 12.5862 0.692963 12.191 0.998908 11.921C0.692963 11.651 0.5 11.2559 0.5 10.8157C0.5 10.3756 0.692962 9.98052 0.998907 9.71049C0.692962 9.44046 0.5 9.04538 0.5 8.60523C0.5 8.16508 0.692963 7.77 0.998907 7.49997C0.692963 7.22994 0.5 6.83486 0.5 6.39471C0.5 5.95456 0.692962 5.55948 0.998907 5.28945C0.692962 5.01942 0.5 4.62434 0.5 4.18419C0.5 3.74405 0.692963 3.34897 0.998907 3.07894C0.692963 2.80891 0.5 2.41383 0.5 1.97368C0.5 1.15979 1.15979 0.5 1.97368 0.5C2.38063 0.5 2.74905 0.664947 3.01574 0.93163Z" fill={color}/>
        <rect x="1.8457" y="1.84619" width="11.3077" height="11.3077" rx="0.706731" fill="#D4D4D8"/>
        <path d="M1.8457 9.51938C2.81321 8.9281 4.26878 7.09631 5.88416 10.3271C6.62527 11.8093 7.29779 7.04582 9.11493 7.50018C10.7303 7.90409 12.4882 10.0548 13.1534 10.7309" stroke={color} strokeWidth="0.706731" strokeLinecap="round"/>
        <circle cx="10.9839" cy="4.52128" r="1.0601" fill={color}/>
      </svg>
    )
  },
  {
    id: 'polaroid',
    svg: (color: string, isSelected: boolean, isHovered: boolean = false) => (
      <svg width="53" height="53" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1.74219" y="0.699951" width="11.7" height="13.6" rx="0.2" fill={isSelected ? color : isHovered ? '#18181B' : '#71717B'}/>
        <g clipPath="url(#clip0_139_641)">
          <rect x="2.3418" y="1.30005" width="10.5" height="10.5" rx="0.1" fill="#D4D4D8"/>
          {isSelected ? (
            <image
              x="2.3418"
              y="1.30005"
              width="10.5"
              height="10.5"
              href={frameImageUrl}
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#clip0_139_641)"
            />
          ) : (
            <>
              <path d="M2.3418 8.46713C3.24546 7.91486 4.60499 6.20394 6.11379 9.22153C6.80599 10.6059 7.43414 6.15678 9.13139 6.58116C10.6402 6.95842 12.2821 8.96722 12.9034 9.59873" stroke={isHovered ? '#18181B' : '#71717B'} strokeWidth="0.660099" strokeLinecap="round"/>
              <circle cx="10.8769" cy="3.7985" r="0.990148" fill={isHovered ? '#18181B' : '#71717B'}/>
            </>
          )}
        </g>
      </svg>
    ),
    previewSvg: (color: string) => (
      <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1.74219" y="0.699951" width="11.7" height="13.6" rx="0.2" fill={color}/>
        <rect x="2.3418" y="1.30005" width="10.5" height="10.5" rx="0.1" fill="#D4D4D8"/>
        <path d="M2.3418 8.46713C3.24546 7.91486 4.60499 6.20394 6.11379 9.22153C6.80599 10.6059 7.43414 6.15678 9.13139 6.58116C10.6402 6.95842 12.2821 8.96722 12.9034 9.59873" stroke={color} strokeWidth="0.660099" strokeLinecap="round"/>
        <circle cx="10.8769" cy="3.7985" r="0.990148" fill={color}/>
      </svg>
    )
  }
];

// FramePatternPreview component
export const FramePatternPreview: React.FC<{ pattern: FramePattern; isSelected: boolean; onClick: () => void }> = ({
  pattern,
  isSelected,
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div className="relative" style={{ width: '24px', height: '24px' }}>
      {/* Background rounded square */}
      <div className="absolute inset-0 w-full h-full rounded-md"></div>
      
      {/* Button for interaction */}
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="absolute inset-0 w-full h-full rounded-md flex items-center justify-center transition-transform duration-150"
        style={{ 
          background: 'transparent',
          transform: isHovered || isSelected ? 'scale(1.2)' : 'scale(1)'
        }}
      >
        {pattern.previewSvg(isSelected ? '#18181B' : '#71717B')}
      </button>
    </div>
  );
};

const ImageFrameTool: React.FC<ImageFrameToolProps> = ({
  isSelected,
  onClick,
  color = '#000000',
  selectedPattern = 'regular',
  onPatternSelect
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const currentPattern = FRAME_PATTERNS.find(p => p.id === selectedPattern);

  // Only use color for polaroid and cloud frames
  const getFrameColor = () => {
    if (selectedPattern === 'regular') {
      return '#D4D4D8'; // Default gray for regular frame
    }
    return color;
  };

  const handleClick = () => {
    onClick();
    if (onPatternSelect) {
      onPatternSelect(selectedPattern);
    }
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`w-18 h-18 rounded-md flex items-center justify-center transition-all
        ${isSelected ? 'bg-gray-100' : ''}`}
      title="Image Frame Tool"
    >
      {currentPattern && currentPattern.svg(getFrameColor(), isSelected, isHovered)}
    </button>
  );
};

export default ImageFrameTool; 