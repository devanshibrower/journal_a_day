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
