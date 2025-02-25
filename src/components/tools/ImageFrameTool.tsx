import React from 'react';

interface ImageFrameToolProps {
  isSelected: boolean;
  onClick: () => void;
  color?: string;
}

const ImageFrameTool: React.FC<ImageFrameToolProps> = ({
  isSelected,
  onClick,
  color = '#000000'
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-20 h-20 rounded-md flex items-center justify-center transition-all
        ${isSelected ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
      title="Image Frame Tool"
    >
      <svg
        width="44"
        height="44"
        viewBox="0 0 24 24"
        fill={isSelected ? color : 'none'}
        stroke={isSelected ? color : '#4B5563'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M20 15l-5-5L5 20" />
      </svg>
    </button>
  );
};

export default ImageFrameTool; 