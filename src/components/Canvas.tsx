import React, { useRef, useEffect, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { ToolType, DrawnPath, Point, ImageFrame, FrameToolState, TextElement, WashiTapeElement } from '../components/types';
import { WASHI_PATTERNS, WashiTapePattern } from '../components/tools/WashiTapeTool';
import TextModal from './TextModal';

// Constants for frame dimensions and proportions
const FRAME_WIDTH = 220;  // Increased from original 180, but maintaining proportions
const FRAME_HEIGHT = 270; // Increased from original 220, maintaining original aspect ratio
const FRAME_ASPECT_RATIO = FRAME_WIDTH / FRAME_HEIGHT;
const FRAME_MIN_WIDTH = 50;
const FRAME_PADDING = 8;
const FRAME_BOTTOM_PADDING = 40; // Moderate increase from original 32

// Helper functions for frame dimensions
const calculateFrameDimensions = (width: number, height: number) => {
  const currentRatio = width / height;
  
  if (currentRatio > FRAME_ASPECT_RATIO) {
    // Width is too large, adjust it based on height
    return {
      width: height * FRAME_ASPECT_RATIO,
      height: height
    };
  } else {
    // Height is too large, adjust it based on width
    return {
      width: width,
      height: width / FRAME_ASPECT_RATIO
    };
  }
};

const enforceMinFrameSize = (width: number, height: number) => {
  if (width < FRAME_MIN_WIDTH) {
    return {
      width: FRAME_MIN_WIDTH,
      height: FRAME_MIN_WIDTH / FRAME_ASPECT_RATIO
    };
  }
  if (height < FRAME_MIN_WIDTH / FRAME_ASPECT_RATIO) {
    return {
      width: FRAME_MIN_WIDTH,
      height: FRAME_MIN_WIDTH / FRAME_ASPECT_RATIO
    };
  }
  return { width, height };
};

interface CanvasProps {
  width?: number;
  height?: number;
  selectedTool?: ToolType;
  setSelectedTool: (tool: ToolType) => void;
  toolOptions?: {
    markerColor?: string;
    markerTipType?: 'thin' | 'marker';
    washiTapeSelection?: string;
    frameColor?: string;
    framePattern?: string;
  };
  undoRef?: React.MutableRefObject<(() => void) | null>;
  redoRef?: React.MutableRefObject<(() => void) | null>;
}

interface CanvasState {
  paths: DrawnPath[];
  frames: ImageFrame[];
  textElements: TextElement[];
  washiTapeElements: WashiTapeElement[];
  offscreenCanvas: ImageData | null;
}

type TextInteractionState = 'IDLE' | 'CREATING' | 'SELECTED' | 'EDITING' | 'RESIZING' | 'DRAGGING';

const Canvas: React.FC<CanvasProps> = ({
  selectedTool = null,
  setSelectedTool,
  toolOptions = {},
  undoRef,
  redoRef,
}) => {
  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Frame state
  const [frameState, setFrameState] = useState<{
    frames: ImageFrame[];
    selectedId: string | null;
  }>({
    frames: [],
    selectedId: null
  });

  // Resize state
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartData, setResizeStartData] = useState<{
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    aspectRatio: number;
    handleOffset: { x: number; y: number };
  } | null>(null);

  // RAF reference for smooth resizing
  const rafRef = useRef<number | undefined>(undefined);
  const currentResizeData = useRef<{
    mouseX: number;
    mouseY: number;
    frame: ImageFrame;
  } | null>(null);

  // Cursor position for all tools
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  // Mouse position for preview
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);

  // Drawing states
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [paths, setPaths] = useState<DrawnPath[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const isDrawingRef = useRef(false);

  // Washi tape state
  const [isPlacingWashiTape, setIsPlacingWashiTape] = useState(false);
  const [washiTapeStartX, setWashiTapeStartX] = useState(0);
  const [washiTapeStartY, setWashiTapeStartY] = useState(0);
  const [washiTapeWidth, setWashiTapeWidth] = useState(0);
  const [washiTapeRotation, setWashiTapeRotation] = useState(0);

  // History state
  const [history, setHistory] = useState<ImageData[]>([]);

  // Text state
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [isEditingText, setIsEditingText] = useState(false);
  const [textBoxSize, setTextBoxSize] = useState<{width: number, height: number}>({width: 150, height: 50});
  const [isResizingText, setIsResizingText] = useState(false);
  const [resizeStartPos, setResizeStartPos] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [resizeStartSize, setResizeStartSize] = useState<{width: number, height: number}>({width: 0, height: 0});

  // Text Modal state
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [textDragStart, setTextDragStart] = useState<{x: number, y: number} | null>(null);
  const [textPosition, setTextPosition] = useState<{x: number, y: number}>({x: 0, y: 0});

  // History stacks for undo/redo
  const [undoStack, setUndoStack] = useState<CanvasState[]>([]);
  const [redoStack, setRedoStack] = useState<CanvasState[]>([]);

  // Add state for frame dragging
  const [isDraggingFrame, setIsDraggingFrame] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [frameStartPos, setFrameStartPos] = useState({ x: 0, y: 0 });

  // Add state for washi tape elements
  const [washiTapeElements, setWashiTapeElements] = useState<WashiTapeElement[]>([]);

  // Add debounce ref
  const saveHistoryTimeoutRef = useRef<number | null>(null);

  // Add text interaction state
  const [textInteractionState, setTextInteractionState] = useState<TextInteractionState>('IDLE');

  // Initialize offscreen canvas
  useEffect(() => {
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
      const canvas = offscreenCanvasRef.current;
      const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
      if (ctx) {
        ctx.fillStyle = '#FAFAFA';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  // Initialize canvas and handle resize
  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      const offscreenCanvas = offscreenCanvasRef.current;
      if (!canvas || !offscreenCanvas) return;

      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      offscreenCanvas.width = width * dpr;
      offscreenCanvas.height = height * dpr;

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const offscreenCtx = offscreenCanvas.getContext('2d', { alpha: false, willReadFrequently: true });
      if (offscreenCtx) {
        offscreenCtx.fillStyle = '#FAFAFA';
        offscreenCtx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
        requestAnimationFrame(drawCanvas);
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Save initial state when component mounts
  useEffect(() => {
    if (!offscreenCanvasRef.current) return;
    
    const initialState: CanvasState = {
      paths: [],
      frames: [],
      textElements: [],
      washiTapeElements: [],
      offscreenCanvas: offscreenCanvasRef.current?.getContext('2d', { alpha: false, willReadFrequently: true })?.getImageData(
        0,
        0,
        offscreenCanvasRef.current.width,
        offscreenCanvasRef.current.height
      ) || null
    };
    
    if (undoStack.length === 0) {
      setUndoStack([initialState]);
    }
  }, [undoStack.length]);

  // Save current state to history with debouncing
  const saveToHistory = useCallback((skipImageData = false) => {
    // Clear any pending save
    if (saveHistoryTimeoutRef.current) {
      window.clearTimeout(saveHistoryTimeoutRef.current);
    }

    // Schedule new save with 300ms debounce
    saveHistoryTimeoutRef.current = window.setTimeout(() => {
      console.log('Saving to history:', {
        paths: paths.length,
        frames: frameState.frames.length,
        textElements: textElements.length,
        washiTapeElements: washiTapeElements.length
      });

      const offscreenCanvas = offscreenCanvasRef.current;
      if (!offscreenCanvas) return;

      const ctx = offscreenCanvas.getContext('2d', { alpha: false, willReadFrequently: true });
      if (!ctx) return;

      // Create current state snapshot
      const currentState: CanvasState = {
        paths: [...paths],
        frames: [...frameState.frames],
        textElements: [...textElements],
        washiTapeElements: [...washiTapeElements],
        offscreenCanvas: skipImageData ? null : ctx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height)
      };

      setUndoStack(prev => {
        // If we're at max size, remove the oldest entry (but keep initial state)
        if (prev.length >= 15) {
          return [...prev.slice(1, -1), currentState];
        }
        return [...prev, currentState];
      });
      
      // Clear redo stack when new action is performed
      setRedoStack([]);
    }, 300);
  }, [paths, frameState.frames, textElements, washiTapeElements]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveHistoryTimeoutRef.current) {
        window.clearTimeout(saveHistoryTimeoutRef.current);
      }
    };
  }, []);

  // Draw grid
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    const canvas = ctx.canvas;
    const dpr = window.devicePixelRatio || 1;
    const gridSize = 10 * dpr;
    
    ctx.save();
    ctx.strokeStyle = '#E4E4E7';
    ctx.lineWidth = 0.3 * dpr;
    ctx.beginPath();
    
    for (let x = 0; x <= canvas.width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
    }
    
    for (let y = 0; y <= canvas.height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
    }
    
    ctx.stroke();
    ctx.restore();
  }, []);

  // Draw washi tape on canvas
  const drawWashiTape = useCallback((
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    rotation: number,
    selection?: string
  ) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rotation * Math.PI) / 180);
    
    const height = 40 * (window.devicePixelRatio || 1);
    const dpr = window.devicePixelRatio || 1;

    const isPattern = WASHI_PATTERNS.some((p: WashiTapePattern) => p.id === selection);
    
    if (isPattern) {
      const selectedPattern = WASHI_PATTERNS.find((p: WashiTapePattern) => p.id === selection);
      if (selectedPattern) {
        const patternCanvas = document.createElement('canvas');
        const patternCtx = patternCanvas.getContext('2d', { alpha: false, willReadFrequently: true });
        if (patternCtx) {
          const patternSize = selectedPattern.id === 'stars' ? 24 : 36;
          patternCanvas.width = patternSize * dpr;
          patternCanvas.height = patternSize * dpr;
          
          patternCtx.scale(dpr, dpr);
          patternCtx.fillStyle = selectedPattern.background;
          patternCtx.fillRect(0, 0, patternSize, patternSize);
          
          switch (selectedPattern.id) {
            case 'checkers':
              patternCtx.fillStyle = '#FCE7F3';
              patternCtx.fillRect(3, 3, 12, 12);
              patternCtx.fillRect(21, 3, 12, 12);
              patternCtx.fillRect(3, 21, 12, 12);
              patternCtx.fillRect(21, 21, 12, 12);
              break;
              
            case 'circles':
              patternCtx.strokeStyle = '#FACC15';
              patternCtx.lineWidth = 3;
              patternCtx.beginPath();
              patternCtx.arc(18, 18, 12, 0, Math.PI * 2);
              patternCtx.stroke();
              patternCtx.beginPath();
              patternCtx.arc(18, 18, 6, 0, Math.PI * 2);
              patternCtx.fillStyle = '#FACC15';
              patternCtx.fill();
              break;
              
            case 'stars':
              patternCtx.fillStyle = '#839BDE';
              const centerX = 12;
              const centerY = 12;
              const outerRadius = 9;
              const innerRadius = 4.5;
              const spikes = 5;
              
              patternCtx.beginPath();
              for (let i = 0; i < spikes * 2; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const angle = (i * Math.PI) / spikes;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                if (i === 0) patternCtx.moveTo(x, y);
                else patternCtx.lineTo(x, y);
              }
              patternCtx.closePath();
              patternCtx.fill();
              break;
              
            case 'waves':
              patternCtx.strokeStyle = '#EC4899';
              patternCtx.lineWidth = 3;
              patternCtx.beginPath();
              patternCtx.moveTo(0, 9);
              patternCtx.bezierCurveTo(9, 9, 9, 18, 18, 18);
              patternCtx.bezierCurveTo(27, 18, 27, 9, 36, 9);
              patternCtx.moveTo(0, 27);
              patternCtx.bezierCurveTo(9, 27, 9, 36, 18, 36);
              patternCtx.bezierCurveTo(27, 36, 27, 27, 36, 27);
              patternCtx.stroke();
              break;
          }

          const canvasPattern = ctx.createPattern(patternCanvas, 'repeat');
          if (canvasPattern) {
            const matrix = new DOMMatrix();
            matrix.scaleSelf(1/dpr, 1/dpr);
            canvasPattern.setTransform(matrix);
            ctx.fillStyle = canvasPattern;
          }
        }
      }
    } else {
      const baseColor = selection || '#FFFFFF';
      const r = parseInt(baseColor.slice(1, 3), 16);
      const g = parseInt(baseColor.slice(3, 5), 16);
      const b = parseInt(baseColor.slice(5, 7), 16);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.6)`;
    }

    ctx.beginPath();
    ctx.rect(0, -height/2, width, height);
    ctx.fill();

    ctx.restore();
  }, []);

  // Draw everything on canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const offscreenCanvas = offscreenCanvasRef.current;
    if (!canvas || !offscreenCanvas) return;

    const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
    if (!ctx) return;

    console.log('Drawing canvas with:', {
      washiTapeElements: washiTapeElements.length,
      isPlacingWashiTape,
      currentPath: currentPath.length
    });

    // Clear canvas
    ctx.fillStyle = '#FAFAFA';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw offscreen content
    ctx.drawImage(offscreenCanvas, 0, 0);

    // Draw grid
    drawGrid(ctx);

    // Draw existing washi tape elements
    washiTapeElements.forEach(tape => {
      console.log('Drawing washi tape:', tape);
      drawWashiTape(
        ctx,
        tape.x,
        tape.y,
        tape.width,
        tape.rotation,
        tape.pattern
      );
    });

    // Draw washi tape preview if placing
    if (isPlacingWashiTape) {
      console.log('Drawing washi tape preview:', {
        x: washiTapeStartX,
        y: washiTapeStartY,
        width: washiTapeWidth,
        rotation: washiTapeRotation
      });
      drawWashiTape(
        ctx,
        washiTapeStartX,
        washiTapeStartY,
        washiTapeWidth,
        washiTapeRotation,
        toolOptions.washiTapeSelection
      );
    }
  }, [
    drawGrid,
    drawWashiTape,
    isPlacingWashiTape,
    washiTapeStartX,
    washiTapeStartY,
    washiTapeWidth,
    washiTapeRotation,
    toolOptions.washiTapeSelection,
    washiTapeElements,
    currentPath
  ]);

  // Undo function
  const handleUndo = useCallback(() => {
    setUndoStack(prev => {
      if (prev.length <= 1) return prev; // Keep at least initial state

      const newUndoStack = [...prev];
      const currentState = newUndoStack.pop(); // Remove current state
      const previousState = newUndoStack[newUndoStack.length - 1]; // Get previous state
      
      if (currentState && previousState) {
        // Save current state to redo stack
        setRedoStack(prev => [...prev, currentState]);
        
        // Batch state updates for better performance
        ReactDOM.unstable_batchedUpdates(() => {
          // Reset all interactive states
          setIsDrawing(false);
          isDrawingRef.current = false;
          setIsPlacingWashiTape(false);
          setCurrentPath([]);
          
          // Restore previous state
          setPaths(previousState.paths);
          setFrameState(prev => ({ 
            ...prev, 
            frames: previousState.frames,
            selectedId: null
          }));
          setTextElements(previousState.textElements);
          setWashiTapeElements(previousState.washiTapeElements || []); // Ensure washi tape elements are restored
          setSelectedTextId(null);
          
          // Restore canvas state
          if (previousState.offscreenCanvas && offscreenCanvasRef.current) {
            const ctx = offscreenCanvasRef.current.getContext('2d', { alpha: false, willReadFrequently: true });
            if (ctx) {
              ctx.putImageData(previousState.offscreenCanvas, 0, 0);
            }
          }
        });
      }
      
      requestAnimationFrame(drawCanvas);
      return newUndoStack;
    });
  }, [drawCanvas]);

  // Redo function
  const handleRedo = useCallback(() => {
    setRedoStack(redoStack => {
      if (redoStack.length === 0) return redoStack;

      const [nextState, ...remainingRedoStack] = [...redoStack].reverse();
      
      // Batch all state updates for better performance
      ReactDOM.unstable_batchedUpdates(() => {
        // Reset all interactive states
        setIsDrawing(false);
        isDrawingRef.current = false;
        setIsPlacingWashiTape(false);
        setCurrentPath([]);
        
        // Restore next state
        setPaths(nextState.paths);
        setFrameState(prev => ({ 
          ...prev, 
          frames: nextState.frames,
          selectedId: null
        }));
        setTextElements(nextState.textElements);
        setWashiTapeElements(nextState.washiTapeElements || []); // Ensure washi tape elements are restored
        setSelectedTextId(null);
        
        // Restore canvas state
        if (nextState.offscreenCanvas && offscreenCanvasRef.current) {
          const ctx = offscreenCanvasRef.current.getContext('2d', { alpha: false, willReadFrequently: true });
          if (ctx) {
            ctx.putImageData(nextState.offscreenCanvas, 0, 0);
          }
        }

        // Update undo stack
        setUndoStack(undoStack => [...undoStack, nextState]);
      });
      
      requestAnimationFrame(drawCanvas);
      return remainingRedoStack.reverse();
    });
  }, [drawCanvas]);

  // Expose undo/redo methods through refs
  useEffect(() => {
    if (undoRef) undoRef.current = handleUndo;
    if (redoRef) redoRef.current = handleRedo;
  }, [handleUndo, handleRedo]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Skip shortcuts if we're in a text input, but allow TextModal interactions
      const target = e.target as HTMLElement;
      const isInTextModal = target.closest('[role="dialog"]') !== null;
      const isTextInput = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;

      // Allow all interactions within TextModal
      if (isInTextModal) {
        return;
      }

      // Skip shortcuts only for text inputs outside TextModal
      if (isTextInput && !isInTextModal) {
        return;
      }

      // Handle undo/redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          // Redo: Cmd/Ctrl + Shift + Z
          handleRedo();
        } else {
          // Undo: Cmd/Ctrl + Z
          handleUndo();
        }
      }
      
      // Handle tool switching
      if (e.key === 't') {
        e.preventDefault();
        setSelectedTool(selectedTool === 'text' ? null : 'text');
      }
      
      // Delete key pressed with a frame selected
      if ((e.key === 'Delete' || e.key === 'Backspace') && (frameState.selectedId || selectedTextId)) {
        e.preventDefault();
        
        if (frameState.selectedId) {
          console.log('Delete key pressed, removing frame:', frameState.selectedId);
          setFrameState(prev => ({
            ...prev,
            frames: prev.frames.filter(frame => frame.id !== prev.selectedId),
            selectedId: null
          }));
        } else if (selectedTextId) {
          console.log('Delete key pressed, removing text:', selectedTextId);
          setTextElements(prev => prev.filter(t => t.id !== selectedTextId));
          setSelectedTextId(null);
        }
        
        // Save to history after deletion
        saveToHistory();
      }
      
      // Escape key to deselect
      if (e.key === 'Escape') {
        // Clear selected frame
        if (frameState.selectedId) {
          setFrameState(prev => ({
            ...prev,
            selectedId: null
          }));
        }
        
        // Clear selected text
        if (selectedTextId) {
          setSelectedTextId(null);
        }
        
        // Close text modal
        if (isTextModalOpen) {
          setIsTextModalOpen(false);
          setEditingTextId(null);
        }
      }
    };
  
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [handleUndo, handleRedo, selectedTool, selectedTextId, isTextModalOpen, setSelectedTool, frameState.selectedId, saveToHistory]);

  // Get scaled coordinates
  const getScaledCoords = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    return {
      x: (e.clientX - rect.left) * dpr,
      y: (e.clientY - rect.top) * dpr
    };
  };

  // Reset mouse position when tool changes
  useEffect(() => {
    setMousePosition(null);
  }, [selectedTool]);

  // Draw smooth line function
  const drawSmoothLine = useCallback((ctx: CanvasRenderingContext2D, points: Point[]) => {
    if (points.length < 2) return;
    
    const dpr = window.devicePixelRatio || 1;
    
    // Set line style based on marker type
    if (toolOptions.markerTipType === 'marker') {
      ctx.lineCap = 'butt'; // Change to flat tip for highlighter
      ctx.lineJoin = 'miter'; // Change to sharp corners for highlighter
      ctx.lineWidth = 20 * dpr;
      ctx.globalAlpha = 0.3;  // Set transparency for highlighter effect
    } else {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 2 * dpr;
      ctx.globalAlpha = 1;    // Full opacity for thin pen
    }
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length - 2; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    
    if (points.length > 2) {
      ctx.quadraticCurveTo(
        points[points.length - 2].x,
        points[points.length - 2].y,
        points[points.length - 1].x,
        points[points.length - 1].y
      );
    }
    
    ctx.stroke();
    ctx.globalAlpha = 1; // Reset alpha for other operations
  }, [toolOptions.markerTipType]);

  // Handle mouse movement with proper memoization and state updates
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const newX = e.clientX - rect.left;
    const newY = e.clientY - rect.top;

    // Handle resizing
    if (isResizing && frameState.selectedId && resizeStartData) {
      const frame = frameState.frames.find(f => f.id === frameState.selectedId);
      if (!frame) return;

      const deltaX = e.clientX - resizeStartData.startX;
      const deltaY = e.clientY - resizeStartData.startY;

      const useDeltaX = Math.abs(deltaX) > Math.abs(deltaY);
      let newWidth = useDeltaX 
        ? resizeStartData.startWidth + deltaX 
        : (resizeStartData.startHeight + deltaY) * FRAME_ASPECT_RATIO;
      let newHeight = newWidth / FRAME_ASPECT_RATIO;

      const { width: finalWidth, height: finalHeight } = enforceMinFrameSize(newWidth, newHeight);

      setFrameState(prev => ({
        ...prev,
        frames: prev.frames.map(f =>
          f.id === frame.id ? {
            ...f,
            width: finalWidth,
            height: finalHeight
          } : f
        )
      }));
    }

    // Handle drawing tools
    if (selectedTool === 'marker' && isDrawing) {
      const coords = getScaledCoords(e);
      setCurrentPath(prev => {
        const newPath = [...prev, coords];
        if (newPath.length > 4) {
          return newPath.slice(-4);
        }
        return newPath;
      });

      const offscreenCanvas = offscreenCanvasRef.current;
      if (!offscreenCanvas) return;

      const offscreenCtx = offscreenCanvas.getContext('2d', { alpha: false, willReadFrequently: true });
      if (!offscreenCtx) return;

      offscreenCtx.strokeStyle = toolOptions.markerColor || '#000000';
      drawSmoothLine(offscreenCtx, currentPath);
      requestAnimationFrame(drawCanvas);
    } else if (selectedTool === 'washiTape' && isPlacingWashiTape) {
      const coords = getScaledCoords(e);
      const dx = coords.x - washiTapeStartX;
      const dy = coords.y - washiTapeStartY;
      const width = Math.sqrt(dx * dx + dy * dy);
      const rotation = (Math.atan2(dy, dx) * 180) / Math.PI;

      // Batch washi tape preview updates
      ReactDOM.unstable_batchedUpdates(() => {
        setWashiTapeWidth(width);
        setWashiTapeRotation(rotation);
      });
      requestAnimationFrame(drawCanvas);
    }
  }, [
    isResizing, frameState.selectedId, resizeStartData, 
    selectedTool, isDrawing, currentPath, 
    isPlacingWashiTape, washiTapeStartX, washiTapeStartY,
    toolOptions.markerColor, getScaledCoords, drawSmoothLine, drawCanvas
  ]);

  // Start drawing
  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    console.log('Start drawing called with tool:', selectedTool);
    
    if (selectedTool === 'marker') {
      const coords = getScaledCoords(e);
      console.log('Starting marker at:', coords);
      setIsDrawing(true);
      isDrawingRef.current = true;
      setCurrentPath([coords]);
    } else if (selectedTool === 'washiTape') {
      const coords = getScaledCoords(e);
      console.log('Starting washi tape at:', coords);
      setIsPlacingWashiTape(true);
      setWashiTapeStartX(coords.x);
      setWashiTapeStartY(coords.y);
      setWashiTapeWidth(0);
      setWashiTapeRotation(0);
    }
  }, [selectedTool, getScaledCoords]);

  // Continue drawing
  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedTool) return;

    const coords = getScaledCoords(e);

    if (selectedTool === 'marker' && isDrawing) {
      console.log('Drawing marker at:', coords);
      const offscreenCanvas = offscreenCanvasRef.current;
      if (!offscreenCanvas) return;

      const offscreenCtx = offscreenCanvas.getContext('2d', { alpha: false, willReadFrequently: true });
      if (!offscreenCtx) return;

      const newPath = [...currentPath, coords];
      if (newPath.length > 4) {
        newPath.splice(0, newPath.length - 4);
      }

      offscreenCtx.strokeStyle = toolOptions.markerColor || '#000000';
      drawSmoothLine(offscreenCtx, newPath);
      setCurrentPath(newPath);
      requestAnimationFrame(drawCanvas);
    } else if (selectedTool === 'washiTape' && isPlacingWashiTape) {
      console.log('Adjusting washi tape at:', coords);
      const dx = coords.x - washiTapeStartX;
      const dy = coords.y - washiTapeStartY;
      const width = Math.sqrt(dx * dx + dy * dy);
      const rotation = (Math.atan2(dy, dx) * 180) / Math.PI;

      setWashiTapeWidth(width);
      setWashiTapeRotation(rotation);
      requestAnimationFrame(drawCanvas);
    }
  }, [
    selectedTool,
    isDrawing,
    currentPath,
    isPlacingWashiTape,
    washiTapeStartX,
    washiTapeStartY,
    toolOptions.markerColor,
    getScaledCoords,
    drawSmoothLine,
    drawCanvas
  ]);

  // Handle frame mouse down for selection and dragging - SIMPLIFIED VERSION
  const handleFrameMouseDown = useCallback((e: React.MouseEvent, frameId: string) => {
    e.stopPropagation();
    e.preventDefault(); // Prevent default browser drag behavior
    
    // Always select the frame
    setFrameState(prev => ({
      ...prev,
      selectedId: frameId
    }));
    
    // Don't start dragging if we're using drawing tools
    if (selectedTool === 'marker' || selectedTool === 'washiTape') {
      return;
    }
    
    // Get initial values
    const frame = frameState.frames.find(f => f.id === frameId);
    if (!frame) return;
    
    // Capture starting mouse position
    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    
    // Capture frame starting position
    const startFrameX = frame.x;
    const startFrameY = frame.y;
    
    // Flag for tracking drag state
    let isDragging = true;
    
    const handleMove = (moveEvent: MouseEvent) => {
      if (!isDragging) return;
      
      // Calculate the delta from the original mouse position
      const deltaX = moveEvent.clientX - startMouseX;
      const deltaY = moveEvent.clientY - startMouseY;
      
      // Update frame position by calculating new position based on the starting position and delta
      setFrameState(prev => {
        const updatedFrames = prev.frames.map(f => 
          f.id === frameId 
            ? { ...f, x: startFrameX + deltaX, y: startFrameY + deltaY }
            : f
        );
        return {
          ...prev,
          frames: updatedFrames
        };
      });
    };
    
    const handleUp = () => {
      isDragging = false;
      
      // Clean up event listeners
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
      
      // Save to history after drag ends
      saveToHistory();
    };
    
    // Add event listeners directly to document for reliability
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  }, [selectedTool, frameState.frames, saveToHistory]);

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent, frameId: string) => {
    e.stopPropagation();
    
    const frame = frameState.frames.find(f => f.id === frameId);
    if (!frame) return;
    
    setFrameState(prev => ({ ...prev, selectedId: frameId }));
    setIsResizing(true);
    
    // Store initial resize data
    setResizeStartData({
      startX: e.clientX,
      startY: e.clientY,
      startWidth: frame.width,
      startHeight: frame.height,
      aspectRatio: frame.width / frame.height,
      handleOffset: { x: 0, y: 0 } // We don't need this anymore
    });
  };

  // Stop drawing
  const stopDrawing = useCallback(() => {
    // Prevent multiple calls if already stopped
    if (!isDrawingRef.current && !isPlacingWashiTape && !isResizing) {
      return;
    }

    console.log('Stop drawing called:', {
      isDrawing: isDrawingRef.current,
      isPlacingWashiTape,
      washiTapeWidth,
      currentPath: currentPath.length
    });

    if (selectedTool === 'marker' && isDrawingRef.current) {
      console.log('Saving marker path to history');
      if (currentPath.length > 0) {
        saveToHistory();
      }
      setIsDrawing(false);
      isDrawingRef.current = false;
      setCurrentPath([]);
    } else if (selectedTool === 'washiTape' && isPlacingWashiTape) {
      console.log('Processing washi tape placement');
      if (washiTapeWidth > 0) {
        // Create new washi tape element
        const newWashiTape: WashiTapeElement = {
          type: 'washiTape',
          id: Math.random().toString(36).substr(2, 9),
          pattern: toolOptions.washiTapeSelection,
          x: washiTapeStartX,
          y: washiTapeStartY,
          width: washiTapeWidth,
          rotation: washiTapeRotation,
          createdAt: Date.now()
        };
        
        // Single batch update for all state changes
        ReactDOM.unstable_batchedUpdates(() => {
          setWashiTapeElements(prev => [...prev, newWashiTape]);
          setIsPlacingWashiTape(false);
          setWashiTapeWidth(0);
          setWashiTapeRotation(0);
          saveToHistory();
        });
      } else {
        setIsPlacingWashiTape(false);
      }
    }

    // End resize operations
    if (isResizing) {
      setIsResizing(false);
      saveToHistory();
    }
  }, [
    selectedTool,
    isPlacingWashiTape,
    washiTapeWidth,
    washiTapeStartX,
    washiTapeStartY,
    washiTapeRotation,
    toolOptions.washiTapeSelection,
    currentPath,
    isResizing,
    saveToHistory
  ]);

  // Update tool state when selected tool changes
  useEffect(() => {
    if (selectedTool === 'imageFrame') {
      // When switching to frame tool, deselect existing frames
      setFrameState(prev => ({
        ...prev,
        selectedId: null
      }));
      setTextInteractionState('IDLE');
    } else if (selectedTool === 'text') {
      // When switching to text tool, deselect frames and text
      setSelectedTextId(null);
      setIsEditingText(false);
      setTextInteractionState('IDLE');
      setFrameState(prev => ({
        ...prev,
        selectedId: null
      }));
    } else if (selectedTool === 'marker' || selectedTool === 'washiTape') {
      // When switching to drawing tools, deselect frames and text
      setSelectedTextId(null);
      setIsEditingText(false);
      setTextInteractionState('IDLE');
      setFrameState(prev => ({
        ...prev,
        selectedId: null
      }));
    } else if (selectedTool === null) {
      // Selection mode - allows for selecting and moving frames/text
      if (textInteractionState === 'CREATING') {
        setTextInteractionState('IDLE');
      }
    }
  }, [selectedTool]);

  // Handle canvas clicks for text and frames
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedTool) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (selectedTool === 'text') {
      setEditingTextId(null);
      setTextPosition({ x, y });
      setIsTextModalOpen(true);
    } else if (selectedTool === 'imageFrame') {
      const newFrame: ImageFrame = {
        type: 'imageFrame',
        id: Math.random().toString(36).substr(2, 9),
        x,
        y,
        width: FRAME_WIDTH,
        height: FRAME_HEIGHT,
        color: toolOptions.frameColor || '#E8E0D0',
        padding: FRAME_PADDING,
        bottomPadding: FRAME_BOTTOM_PADDING,
        createdAt: Date.now()
      };

      // Use a single state update
      setFrameState(prev => {
        const newState = {
          frames: [...prev.frames, newFrame],
          selectedId: newFrame.id
        };
        
        // Schedule history save for next frame
        requestAnimationFrame(() => {
          saveToHistory();
          setSelectedTool(null);
        });
        
        return newState;
      });
    }
  }, [selectedTool, toolOptions.frameColor, saveToHistory, setSelectedTool]);

  // Add effect to handle frame color changes
  useEffect(() => {
    let frameUpdateTimeout: number;
    
    if (frameState.selectedId && toolOptions.frameColor) {
      frameUpdateTimeout = window.setTimeout(() => {
        setFrameState(prev => ({
          ...prev,
          frames: prev.frames.map(frame =>
            frame.id === prev.selectedId
              ? { ...frame, color: toolOptions.frameColor || frame.color }
              : frame
          )
        }));
        saveToHistory();
      }, 0);
    }
    
    return () => {
      if (frameUpdateTimeout) {
        clearTimeout(frameUpdateTimeout);
      }
    };
  }, [toolOptions.frameColor, frameState.selectedId, saveToHistory]);

  // Handle image upload for frames
  const handleImageUpload = (frameId: string) => {
    // Set the selected frame in state
    setFrameState(prev => ({
      ...prev,
      selectedId: frameId
    }));
    
    // Trigger the input click
    if (fileInputRef.current) {
      fileInputRef.current.dataset.frameId = frameId;
      fileInputRef.current.click();
    } else {
      console.error('File input reference not found');
    }
  };

  // Process selected image file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    
    // Get the frame ID from the data attribute
    const frameId = e.currentTarget.dataset.frameId;
    if (!frameId) {
      console.error('No frame ID found on file input');
      return;
    }
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      e.target.value = '';
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = () => {
      try {
        const imageUrl = reader.result as string;
        
        // Create an image to ensure it loads properly
        const img = new Image();
        img.onload = () => {
          // Update frame state with new image and timestamp
          setFrameState(prev => {
            const newFrames = prev.frames.map(frame => 
              frame.id === frameId
                ? { 
                    ...frame, 
                    imageUrl,
                    createdAt: Date.now() // Update timestamp when image is added
                  }
                : frame
            );
            return {
              ...prev,
              frames: newFrames,
              selectedId: frameId
            };
          });
          
          // Save to history without capturing image data
          saveToHistory(true);
        };
        
        img.onerror = () => {
          console.error('Error loading image');
        };
        
        img.src = imageUrl;
      } catch (error) {
        console.error('Error processing image:', error);
      }
    };
    
    reader.onerror = () => {
      console.error('Error reading file');
    };
    
    try {
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error reading file:', error);
    }
    
    // Reset file input
    e.target.value = '';
  };

  // Add a helper function to resize large images
  const resizeImageIfNeeded = (imageUrl: string, maxWidth = 1200, maxHeight = 1200): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        // If image is small enough, return original
        if (img.width <= maxWidth && img.height <= maxHeight) {
          resolve(imageUrl);
          return;
        }

        try {
          // Calculate new dimensions while maintaining aspect ratio
          let newWidth = img.width;
          let newHeight = img.height;
          
          if (newWidth > maxWidth) {
            newHeight = (maxWidth / newWidth) * newHeight;
            newWidth = maxWidth;
          }
          
          if (newHeight > maxHeight) {
            newWidth = (maxHeight / newHeight) * newWidth;
            newHeight = maxHeight;
          }
          
          // Create canvas for resizing
          const canvas = document.createElement('canvas');
          canvas.width = newWidth;
          canvas.height = newHeight;
          
          // Draw resized image
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(imageUrl); // Fall back to original if can't get context
            return;
          }
          
          ctx.drawImage(img, 0, 0, newWidth, newHeight);
          
          // Get resized image as data URL
          const resizedImageUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(resizedImageUrl);
        } catch (err) {
          console.error('Error resizing image:', err);
          resolve(imageUrl); // Fall back to original on error
        }
      };
      
      img.onerror = () => {
        console.error('Error loading image for resize');
        reject(new Error('Failed to load image for resizing'));
      };
      
      img.src = imageUrl;
    });
  };

  // Handle text resize start
  const handleTextResizeStart = (e: React.MouseEvent, textId: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Only start resize on left mouse button
    if (e.button !== 0) return;
    
    const text = textElements.find(t => t.id === textId);
    if (!text) return;
    
    setIsResizingText(true);
    setTextInteractionState('RESIZING');
    setResizeStartPos({
      x: e.clientX,
      y: e.clientY
    });
    setResizeStartSize({
      width: text.width || textBoxSize.width,
      height: text.height || textBoxSize.height
    });
  };

  // Handle text resize move
  const handleTextResizeMove = (e: React.MouseEvent) => {
    if (!isResizingText || !selectedTextId) return;
    
    e.stopPropagation();
    e.preventDefault();
    
    const deltaX = e.clientX - resizeStartPos.x;
    const deltaY = e.clientY - resizeStartPos.y;
    
    const newWidth = Math.max(50, resizeStartSize.width + deltaX);
    const newHeight = Math.max(20, resizeStartSize.height + deltaY);
    
    setTextBoxSize({width: newWidth, height: newHeight});
    
    setTextElements(prev => 
      prev.map(t => 
        t.id === selectedTextId 
          ? { ...t, width: newWidth, height: newHeight } 
          : t
      )
    );
  };

  // Handle text resize end
  const handleTextResizeEnd = () => {
    if (isResizingText) {
      saveToHistory(); // Save history after text resize
      setIsResizingText(false);
      // Reset resize state
      setResizeStartPos({ x: 0, y: 0 });
      setResizeStartSize({ width: 0, height: 0 });
    }
  };

  // Handle text drag move
  const handleTextDragMove = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!textDragStart || !selectedTextId) return;

    const deltaX = e.clientX - textDragStart.x;
    const deltaY = e.clientY - textDragStart.y;

    setTextElements(prev => prev.map(t => 
      t.id === selectedTextId ? {
        ...t,
        x: t.x + deltaX,
        y: t.y + deltaY
      } : t
    ));

    setTextDragStart({
      x: e.clientX,
      y: e.clientY
    });
  }, [textDragStart, selectedTextId]);

  // Handle text drag end
  const handleTextDragEnd = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (textInteractionState === 'DRAGGING') {
      saveToHistory();
      setTextDragStart(null);
      setTextInteractionState('SELECTED');
    }
  }, [textInteractionState, saveToHistory]);

  // Add global mouse move and up handlers for text resizing
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (textInteractionState === 'RESIZING' && selectedTextId) {
        e.preventDefault();
        handleTextResizeMove(e as unknown as React.MouseEvent);
      } else if (textInteractionState === 'DRAGGING' && selectedTextId) {
        e.preventDefault();
        handleTextDragMove(e as unknown as React.MouseEvent);
      }
    };
    
    const handleGlobalMouseUp = (e: MouseEvent) => {
      // Handle text interactions first
      if (textInteractionState === 'RESIZING') {
        handleTextResizeEnd();
        setTextInteractionState('SELECTED');
      } else if (textInteractionState === 'DRAGGING') {
        handleTextDragEnd(e as unknown as React.MouseEvent);
        setTextInteractionState('SELECTED');
      }

      // Handle other drawing operations
      if (isDrawingRef.current || isPlacingWashiTape || isResizing) {
        stopDrawing();
      }
    };

    const handleGlobalMouseLeave = () => {
      if (textInteractionState === 'RESIZING') {
        handleTextResizeEnd();
        setTextInteractionState('SELECTED');
      } else if (textInteractionState === 'DRAGGING') {
        setTextDragStart(null);
        setTextInteractionState('SELECTED');
      }
    };
    
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('mouseleave', handleGlobalMouseLeave);
    
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('mouseleave', handleGlobalMouseLeave);
    };
  }, [
    textInteractionState,
    selectedTextId,
    isPlacingWashiTape,
    isResizing,
    stopDrawing,
    handleTextResizeMove,
    handleTextDragMove,
    handleTextResizeEnd,
    handleTextDragEnd
  ]);

  // Clean up RAF on unmount and when resizing ends
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Handle text save with history
  const handleTextSave = useCallback((text: string) => {
    if (!text.trim()) return; // Don't save empty text
    
    if (editingTextId) {
      // Update existing text
      setTextElements(prev => {
        const updated = prev.map(t => 
          t.id === editingTextId ? { ...t, text } : t
        );
        // Only save history if text actually changed
        const textChanged = prev.find(t => t.id === editingTextId)?.text !== text;
        if (textChanged) {
          setTimeout(() => saveToHistory(), 0);
        }
        return updated;
      });
    } else {
      // Create new text element
      setTextElements(prev => {
        const newElement = {
          id: Math.random().toString(36).substr(2, 9),
          x: textPosition.x,
          y: textPosition.y,
          text,
          fontSize: 20,
          fontFamily: 'Cedarville Cursive',
          color: '#000000',
          width: 150,
          height: 50
        };
        setTimeout(() => saveToHistory(), 0);
        return [...prev, newElement];
      });
    }
    
    // Reset state
    setIsTextModalOpen(false);
    setEditingTextId(null);
  }, [editingTextId, textPosition.x, textPosition.y, saveToHistory]);

  // Handle text delete
  const handleTextDelete = useCallback(() => {
    if (editingTextId) {
      setTextElements(prev => prev.filter(t => t.id !== editingTextId));
      saveToHistory();
    }
    setIsTextModalOpen(false);
    setEditingTextId(null);
  }, [editingTextId, saveToHistory]);

  // Handle text drag start
  const handleTextDragStart = useCallback((e: React.MouseEvent, textId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only start drag on left mouse button
    if (e.button !== 0) return;

    setTextDragStart({
      x: e.clientX,
      y: e.clientY
    });
    setSelectedTextId(textId);
    setTextInteractionState('DRAGGING');
  }, []);

  // Add a function to delete the selected frame
  const handleFrameDelete = useCallback(() => {
    if (!frameState.selectedId) return;
    
    setFrameState(prev => ({
      ...prev,
      frames: prev.frames.filter(frame => frame.id !== prev.selectedId),
      selectedId: null
    }));
    
    saveToHistory();
  }, [frameState.selectedId, saveToHistory]);

  // Render a frame element as a direct child of the main container
  const renderFrame = (frame: ImageFrame, zIndex: number) => {
    return (
      <div
        key={frame.id}
        className={`absolute ${frameState.selectedId === frame.id ? 'ring-2 ring-blue-500' : ''}`}
        style={{
          position: 'absolute',
          left: frame.x,
          top: frame.y,
          width: `${frame.width}px`,
          height: `${frame.height}px`,
          backgroundColor: frame.color,
          borderRadius: '2px',
          transform: 'translate(-50%, -50%)',
          padding: `${frame.padding || FRAME_PADDING}px`,
          paddingBottom: `${frame.bottomPadding || FRAME_BOTTOM_PADDING}px`,
          cursor: frameState.selectedId === frame.id ? 'move' : 'pointer',
          boxShadow: frameState.selectedId === frame.id ? '0 0 0 4px rgba(59, 130, 246, 0.3)' : 'none',
          transition: 'all 0.1s ease-out',
          zIndex: zIndex,
          pointerEvents: 'auto',
          overflow: 'visible'
        }}
        onMouseDown={(e) => {
          handleFrameMouseDown(e, frame.id);
        }}
      >
        {frame.imageUrl ? (
          <img
            src={frame.imageUrl}
            alt=""
            className="w-full h-full object-cover"
            style={{
              transition: 'all 0.1s ease-out'
            }}
            draggable={false}
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center bg-gray-100 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation(); 
              e.preventDefault();
              handleImageUpload(frame.id);
            }}
            style={{ 
              cursor: 'pointer'
            }}
          >
            <div className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
          </div>
        )}

        {/* Delete button */}
        {frameState.selectedId === frame.id && (
          <div
            className="absolute top-0 right-0 w-6 h-6 bg-white rounded-full cursor-pointer hover:bg-red-100 flex items-center justify-center"
            style={{ 
              transform: 'translate(50%, -50%)',
              zIndex: zIndex + 100
            }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              
              // Remove this frame
              setFrameState(prev => ({
                ...prev,
                frames: prev.frames.filter(f => f.id !== frame.id),
                selectedId: null
              }));
              
              // Save to history
              saveToHistory();
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500">
              <path d="M3 6h18" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative w-full h-full overflow-visible">
      {/* Canvas for drawing */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 bg-zinc-50"
        onClick={(e) => {
          if (selectedTool === 'text' || selectedTool === 'imageFrame') {
            handleCanvasClick(e);
          }
        }}
        onMouseDown={(e) => {
          if (selectedTool === 'marker' || selectedTool === 'washiTape') {
            startDrawing(e);
          }
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          // Only call stopDrawing if we're actually drawing or placing washi tape
          if (isDrawingRef.current || isPlacingWashiTape) {
            stopDrawing();
          }
        }}
        style={{ touchAction: 'none', zIndex: 1 }}
      />

      {/* DIRECT RENDERING: Only frames */}
      {frameState.frames
        .sort((a, b) => a.createdAt - b.createdAt)
        .map((frame, index) => renderFrame(frame, 10 + index))}

      {/* Text elements layer */}
      <div 
        className="absolute inset-0 pointer-events-none overflow-visible"
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%',
          pointerEvents: selectedTool === 'text' || selectedTextId ? 'auto' : 'none',
          zIndex: 1000 // Always on top
        }}
        onClick={(e) => {
          // Only create new text if we're in text tool mode, not resizing, and not editing existing text
          if (selectedTool === 'text' && 
              e.target === e.currentTarget && 
              textInteractionState === 'IDLE' && 
              !isTextModalOpen) {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) return;
            
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            setTextPosition({ x, y });
            setIsTextModalOpen(true);
            setTextInteractionState('CREATING');
          }
        }}
      >
        {textElements.map(text => (
          <div
            key={text.id}
            className={`absolute ${selectedTextId === text.id ? 'ring-2 ring-blue-500' : ''}`}
            style={{
              left: `${text.x}px`,
              top: `${text.y}px`,
              transform: 'translate(-50%, -50%)',
              fontSize: `${text.fontSize}px`,
              fontFamily: text.fontFamily,
              color: text.color,
              cursor: textInteractionState === 'DRAGGING' ? 'grabbing' : 
                     textInteractionState === 'RESIZING' ? 'se-resize' : 
                     selectedTextId === text.id ? 'grab' : 'pointer',
              width: `${text.width}px`,
              height: `${text.height}px`,
              padding: '4px',
              userSelect: 'none',
              backgroundColor: selectedTextId === text.id ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (textInteractionState === 'IDLE') {
                setSelectedTextId(text.id);
                setTextInteractionState('SELECTED');
              }
            }}
            onMouseDown={(e) => {
              if (textInteractionState === 'SELECTED' || textInteractionState === 'IDLE') {
                handleTextDragStart(e, text.id);
              }
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (textInteractionState !== 'RESIZING' && textInteractionState !== 'DRAGGING') {
                setEditingTextId(text.id);
                setIsTextModalOpen(true);
                setTextInteractionState('EDITING');
              }
            }}
          >
            <div className="w-full h-full break-words overflow-hidden">
              {text.text}
            </div>
            
            {/* Delete button */}
            {selectedTextId === text.id && (
              <div
                className="absolute top-0 right-0 w-6 h-6 bg-white rounded-full cursor-pointer hover:bg-red-100 flex items-center justify-center"
                style={{ 
                  transform: 'translate(50%, -50%)',
                  zIndex: 10
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  
                  // Remove this text element
                  setTextElements(prev => prev.filter(t => t.id !== text.id));
                  setSelectedTextId(null);
                  
                  // Save to history
                  saveToHistory();
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500">
                  <path d="M3 6h18" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </div>
            )}
            
            {/* Resize handle */}
            {selectedTextId === text.id && (
              <div
                className="absolute bottom-0 right-0 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-se-resize hover:scale-125"
                style={{ 
                  transform: 'translate(50%, 50%)',
                  zIndex: 10
                }}
                onMouseDown={(e) => handleTextResizeStart(e, text.id)}
              />
            )}
          </div>
        ))}
      </div>

      {/* Text Modal */}
      <TextModal
        isOpen={isTextModalOpen}
        onClose={() => {
          setIsTextModalOpen(false);
          if (textInteractionState === 'CREATING') {
            setTextInteractionState('IDLE');
          } else if (textInteractionState === 'EDITING') {
            setTextInteractionState('SELECTED');
          }
          setEditingTextId(null);
        }}
        onSave={handleTextSave}
        initialText={editingTextId ? textElements.find(t => t.id === editingTextId)?.text || '' : ''}
      />

      {/* Hidden file input for image upload */}
      <input 
        type="file"
        ref={fileInputRef}
        style={{ 
          position: 'absolute', 
          top: '-1000px', // Move it completely off-screen
          left: '-1000px',
          opacity: 0,
          pointerEvents: 'none',
          visibility: 'hidden' // Extra measure to ensure it's truly hidden
        }}
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default Canvas; 