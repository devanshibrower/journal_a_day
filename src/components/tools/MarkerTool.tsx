import React from 'react';

interface MarkerToolProps {
  isSelected: boolean;
  onClick: () => void;
  color?: string;
  bodyColor?: string;
  tipType?: 'thin' | 'marker';
}

const MarkerTool: React.FC<MarkerToolProps> = ({
  isSelected,
  onClick,
  color = '#67dfff',
  bodyColor = '#D9D9D9',
  tipType = 'marker'
}) => {
  // Adjust tip path based on type
  const getTipPath = () => {
    switch (tipType) {
      case 'thin':
        return "M5.88511 0.229775C5.95552 0.0889536 6.09945 0 6.2569 0V0C6.40707 0 6.54556 0.0809979 6.61918 0.211882L11 8H2L5.88511 0.229775Z";
      default: // marker
        return "M2 3.01113C2 2.65075 2.24228 2.33539 2.5905 2.24253L9.99959 0.266777C10.5046 0.132112 11 0.512734 11 1.03537V8H2V3.01113Z";
    }
  };

  return (
    <button
      onClick={onClick}
      className={`w-20 h-20 rounded-md flex items-center justify-center transition-all
        ${isSelected ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
      title="Marker Tool"
    >
      <svg 
        width="40" 
        height="54" 
        viewBox="0 0 13 18" 
        fill="none"
      >
        <path 
          d={getTipPath()}
          fill={isSelected ? color : 'black'}
        />
        <path 
          d="M11.536 7.3602C11.5156 7.15572 11.3435 7 11.138 7H1.862C1.65649 7 1.48443 7.15572 1.46398 7.3602L1.01421 11.8579C1.00502 11.9498 0.964328 12.0357 0.899036 12.101L0.117157 12.8828C0.0421427 12.9579 0 13.0596 0 13.1657V17.6C0 17.8209 0.179086 18 0.4 18H12.6C12.8209 18 13 17.8209 13 17.6V13.1657C13 13.0596 12.9579 12.9579 12.8828 12.8828L12.101 12.101C12.0357 12.0357 11.995 11.9498 11.9858 11.8579L11.536 7.3602Z" 
          fill={isSelected ? bodyColor : '#D9D9D9'}
        />
      </svg>
    </button>
  );
};

export default MarkerTool; 