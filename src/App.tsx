import './App.css';
import Toolbar from './components/Toolbar';
import Canvas from './components/Canvas';
import CanvasControls from './components/CanvasControls';
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
  const [toolbarHeight, setToolbarHeight] = useState(0);
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

  const handleToolbarRef = useCallback((node: HTMLDivElement) => {
    if (node) {
      const height = node.getBoundingClientRect().height;
      setToolbarHeight(height);
    }
  }, []);

  const handleOptionsChange = (options: Partial<ToolOptions>) => {
    setToolOptions(prev => ({ ...prev, ...options }));
  };

  const handleAddText = useCallback(() => {
    setSelectedTool(prev => prev === 'text' ? null : 'text');
  }, []);

  const handleClearCanvas = () => {
    // Will implement clear canvas functionality
    console.log('Clear canvas clicked');
  };

  return (
    <div className="app min-h-screen w-full bg-zinc-50">
      {/* Canvas takes full viewport */}
      <div className={`fixed inset-0 h-screen w-screen ${selectedTool === 'text' ? 'cursor-text' : ''}`}>
        <Canvas 
          selectedTool={selectedTool}
          setSelectedTool={setSelectedTool}
          toolOptions={toolOptions}
          undoRef={canvasUndoRef}
          redoRef={canvasRedoRef}
        />
      </div>
      
      {/* Bottom toolbar container - scaled up */}
      <div className="fixed bottom-[10%] left-0 right-0 flex justify-center items-center scale-[1.5] transform-gpu">
        <Toolbar 
          ref={handleToolbarRef}
          className="!static !transform-none" 
          onToolSelect={setSelectedTool}
          onOptionsChange={handleOptionsChange}
        />
        <div className="ml-[4px]">
          <CanvasControls
            onAddText={handleAddText}
            onClearCanvas={handleClearCanvas}
            isTextSelected={selectedTool === 'text'}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
