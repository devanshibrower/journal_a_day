import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  color = '#000000',
  bodyColor = '#D4D4D8',
  tipType = 'marker'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Tip paths for each type
  const tipPaths = {
    thin: "M7.875 1.17233C7.92781 1.06672 8.03576 1 8.15384 1V1C8.26647 1 8.37034 1.06075 8.42556 1.15891L11 7H5L7.875 1.17233Z",
    marker: "M4.5 3.25835C4.5 2.98806 4.68171 2.75154 4.94287 2.6819L10.4997 1.20008C10.8784 1.09908 11.25 1.38455 11.25 1.77653V7H4.5V3.25835Z"
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`w-18 h-18 rounded-md flex items-center justify-center transition-all
        ${isSelected ? 'bg-gray-100' : ''}`}
      style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
      title="Marker Tool"
    >
      <svg 
        width="53" 
        height="53" 
        viewBox="0 0 16 16" 
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <AnimatePresence mode="wait">
          <motion.g
            key={tipType}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              transition: { duration: 0.2, ease: "easeOut" }
            }}
            exit={{ 
              opacity: 0,
              transition: { duration: 0.15, ease: "easeIn" }
            }}
          >
            <path 
              d={tipPaths[tipType]}
              fill={isSelected ? color : isHovered ? '#18181B' : '#A1A1AA'}
            />
          </motion.g>
        </AnimatePresence>
        <motion.path 
          d="M11.652 6.52015C11.6367 6.36679 11.5076 6.25 11.3535 6.25H4.3965C4.24237 6.25 4.11332 6.36679 4.09798 6.52015L3.76066 9.89344C3.75376 9.96235 3.72325 10.0268 3.67428 10.0757L3.08787 10.6621C3.03161 10.7184 3 10.7947 3 10.8743V14.2C3 14.3657 3.13431 14.5 3.3 14.5H12.45C12.6157 14.5 12.75 14.3657 12.75 14.2V10.8743C12.75 10.7947 12.7184 10.7184 12.6621 10.6621L12.0757 10.0757C12.0268 10.0268 11.9962 9.96235 11.9893 9.89344L11.652 6.52015Z" 
          fill={isSelected ? bodyColor : '#D4D4D8'}
          transition={{ duration: 0.2 }}
        />
      </svg>
    </button>
  );
};

export default MarkerTool; 