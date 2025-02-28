import './App.css';
import Toolbar from './components/Toolbar';
import Canvas from './components/Canvas';
import { useState, useCallback, useRef } from 'react';
import { ToolType } from './components/types';

type ToolOptions = {
  markerColor?: string;
  markerTipType?: 'thin' | 'marker';
  washiTapeSelection?: string;
  frameColor?: string;
  framePattern?: string;
};

function App() {
  // State for selected tool and options
  const [selectedTool, setSelectedTool] = useState<ToolType>(null);
  const [toolOptions, setToolOptions] = useState<ToolOptions>({
    markerColor: '#FDBB80', // Default orange color from toolbar
    markerTipType: 'marker', // Default tip type
    washiTapeSelection: 'checkers', // Default washi tape pattern
    framePattern: 'regular', // Default frame pattern
    frameColor: '#E8E0D0' // Default frame color
  });

  // Canvas refs
  const canvasUndoRef = useRef<() => void>(null);
  const canvasRedoRef = useRef<() => void>(null);
  const canvasClearRef = useRef<() => void>(null);

  const handleOptionsChange = (options: Partial<ToolOptions>) => {
    setToolOptions(prev => ({ ...prev, ...options }));
  };

  return (
    <div className="app min-h-screen w-full bg-zinc-50">
      {/* Canvas takes full viewport */}
      <div className="fixed inset-0 h-screen w-screen">
        <Canvas 
          selectedTool={selectedTool}
          toolOptions={toolOptions}
          undoRef={canvasUndoRef}
          redoRef={canvasRedoRef}
          clearRef={canvasClearRef}
        />
      </div>
      
      {/* Clear canvas button */}
      <button
        onClick={() => canvasClearRef.current?.()}
        className="fixed top-6 right-6 p-2 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors shadow-sm"
        title="Clear canvas"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 8V18C5 19.1046 5.89543 20 7 20H17C18.1046 20 19 19.1046 19 18V8M14 8V6C14 5.44772 13.5523 5 13 5H11C10.4477 5 10 5.44772 10 6V8M3 8H21" 
            stroke="#71717A" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
        </svg>
      </button>
      
      {/* Main toolbar at the bottom */}
      <div className="fixed left-1/2 bottom-[10%] -translate-x-1/2 z-50">
        <Toolbar 
          onToolSelect={setSelectedTool}
          onOptionsChange={handleOptionsChange}
        />
      </div>
    </div>
  );
}

export default App;
