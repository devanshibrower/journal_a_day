import React from 'react';

interface WashiTapeToolProps {
  isSelected: boolean;
  onClick: () => void;
  color?: string;
}

const WashiTapeTool: React.FC<WashiTapeToolProps> = ({
  isSelected,
  onClick,
  color = '#000000'
}) => {
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
      >
        <path 
          d="M0.0916662 3.36702L9.075 18.9266C9.12563 19.0143 9.23775 19.0443 9.32544 18.9937L9.89476 18.665C9.93687 18.6407 9.96759 18.6007 9.98018 18.5537L10.2571 17.52C10.2798 17.4356 10.3588 17.3789 10.446 17.3845L11.8232 17.4734C11.8971 17.4781 11.9665 17.438 11.9993 17.3717L12.611 16.1346C12.6497 16.0562 12.7384 16.0161 12.8228 16.0388L13.8565 16.3157C13.9034 16.3283 13.9535 16.3217 13.9956 16.2974L14.5649 15.9687C14.6526 15.9181 14.6826 15.806 14.632 15.7183L5.64866 0.158689C5.59804 0.0710023 5.48591 0.0409589 5.39823 0.0915849L4.82891 0.420282C4.7868 0.444593 4.75607 0.484637 4.74349 0.531604L4.46652 1.56527C4.4439 1.64968 4.36484 1.70639 4.27763 1.70077L2.90047 1.61195C2.82661 1.60719 2.75713 1.6473 2.72433 1.71365L2.11266 2.95071C2.07393 3.02905 1.98529 3.06916 1.90087 3.04654L0.867209 2.76957C0.820242 2.75699 0.7702 2.76358 0.728091 2.78789L0.158771 3.11659C0.0710844 3.16721 0.0410404 3.27934 0.0916662 3.36702Z" 
          fill={isSelected ? color : '#4B5563'}
        />
      </svg>
    </button>
  );
};

export default WashiTapeTool; 