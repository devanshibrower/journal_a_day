import React from 'react';

interface CanvasControlsProps {
  onAddText: () => void;
  onClearCanvas: () => void;
  isTextSelected?: boolean;
}

const CanvasControls: React.FC<CanvasControlsProps> = ({
  onAddText,
  onClearCanvas,
  isTextSelected = false
}) => {
  return (
    <div className="flex flex-col justify-between bg-zinc-100 rounded-lg py-2 px-1.5 h-full">
      <button
        onClick={onAddText}
        className={`p-1.5 rounded-md transition-all group hover:scale-[1.2] ${isTextSelected ? 'scale-[1.2]' : ''}`}
        title="Add text"
      >
        <svg width="18" height="18" viewBox="0 0 6 6" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-colors">
          <g clipPath="url(#clip0_168_233)">
            <path d="M1.60117 1.43755H2.81367V4.5563H2.22617C2.12498 4.5563 2.03242 4.63979 2.03242 4.75005C2.03242 4.85891 2.11731 4.9438 2.22617 4.9438H3.76992C3.87112 4.9438 3.96367 4.86031 3.96367 4.75005C3.96367 4.64118 3.87879 4.5563 3.76992 4.5563H3.19492V1.4438H4.40742C4.49231 1.4438 4.56367 1.51516 4.56367 1.60005V1.75005C4.56367 1.85125 4.64716 1.9438 4.75742 1.9438C4.86629 1.9438 4.95117 1.85891 4.95117 1.75005V1.5938H4.95119L4.95116 1.59264C4.94427 1.29657 4.70317 1.06255 4.40742 1.06255H1.59492C1.29856 1.06255 1.05742 1.30368 1.05742 1.60005V1.75005C1.05742 1.85125 1.14091 1.9438 1.25117 1.9438C1.36004 1.9438 1.44492 1.85891 1.44492 1.75005V1.5938C1.44492 1.50891 1.51629 1.43755 1.60117 1.43755Z" className={`fill-zinc-400 stroke-zinc-400 group-hover:fill-zinc-900 group-hover:stroke-zinc-900 ${isTextSelected ? '!fill-zinc-900 !stroke-zinc-900' : ''}`} strokeWidth="0.1"/>
          </g>
          <defs>
            <clipPath id="clip0_168_233">
              <rect width="4" height="4" fill="white" transform="translate(1 1)"/>
            </clipPath>
          </defs>
        </svg>
      </button>

      <button
        onClick={onClearCanvas}
        className="p-1.5 rounded-md transition-all group hover:scale-[1.2]"
        title="Clear canvas"
      >
        <svg width="18" height="18" viewBox="0 0 6 6" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-colors">
          <path d="M4.32673 1.10255H3.67327V0.958274C3.67327 0.703677 3.46959 0.5 3.21499 0.5H2.56153C2.30693 0.5 2.10325 0.703677 2.10325 0.958274V1.10255H1.44979C1.20368 1.10255 1 1.30622 1 1.55233V1.80693C1 1.99364 1.11033 2.14639 1.27157 2.21429L1.40736 5.15064C1.42433 5.43069 1.64498 5.64286 1.92504 5.64286H3.83451C4.11457 5.64286 4.34371 5.42221 4.35219 5.15064L4.50495 2.2058C4.6662 2.13791 4.77652 1.97666 4.77652 1.79844V1.54385C4.77652 1.30622 4.57284 1.10255 4.32673 1.10255ZM2.49364 0.958274C2.49364 0.915842 2.52758 0.881895 2.57001 0.881895H3.22348C3.26591 0.881895 3.29986 0.915842 3.29986 0.958274V1.10255H2.50212V0.958274H2.49364ZM1.39038 1.55233C1.39038 1.51839 1.41584 1.48444 1.45827 1.48444H4.32673C4.36068 1.48444 4.39463 1.5099 4.39463 1.55233V1.80693C4.39463 1.84088 4.36917 1.87482 4.32673 1.87482H1.45827C1.42433 1.87482 1.39038 1.84936 1.39038 1.80693V1.55233ZM3.843 5.26096H1.94201C1.86563 5.26096 1.80622 5.20156 1.80622 5.13366L1.67044 2.25672H4.12306L3.98727 5.13366C3.97878 5.20156 3.91938 5.26096 3.843 5.26096Z" className="fill-zinc-400 group-hover:fill-zinc-900"/>
          <path d="M2.89441 2.99487C2.79257 2.99487 2.69922 3.07974 2.69922 3.19006V4.50548C2.69922 4.60732 2.78408 4.70067 2.89441 4.70067C2.99625 4.70067 3.0896 4.61581 3.0896 4.50548V3.18158C3.0896 3.07974 2.99625 2.99487 2.89441 2.99487Z" className="fill-zinc-400 group-hover:fill-zinc-900"/>
          <path d="M3.68096 3.15635C3.57913 3.14786 3.48577 3.23273 3.47729 3.33457L3.42637 4.31052C3.41788 4.41236 3.50275 4.50571 3.60459 4.5142H3.61307C3.71491 4.5142 3.79978 4.43782 3.79978 4.33598L3.8507 3.36003C3.86767 3.2497 3.7828 3.16483 3.68096 3.15635Z" className="fill-zinc-400 group-hover:fill-zinc-900"/>
          <path d="M2.09677 3.15635C1.99493 3.16483 1.91007 3.2497 1.91855 3.36003L1.97796 4.34447C1.98645 4.44631 2.07131 4.52268 2.16467 4.52268H2.17315C2.27499 4.5142 2.35986 4.42933 2.35137 4.31901L2.30045 3.33457C2.29196 3.23273 2.19861 3.14786 2.09677 3.15635Z" className="fill-zinc-400 group-hover:fill-zinc-900"/>
        </svg>
      </button>
    </div>
  );
};

export default CanvasControls; 