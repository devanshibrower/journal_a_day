import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ToolType, DrawnPath, Point, ImageFrame, FrameToolState } from '../components/types';
import { WASHI_PATTERNS, WashiTapePattern } from '../components/tools/WashiTapeTool';

// Constants for frame dimensions
const FRAME_WIDTH = 110;
const FRAME_HEIGHT = 140;

interface CanvasProps {
  width?: number;
  height?: number;
  selectedTool?: ToolType;
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

const Canvas: React.FC<CanvasProps> = ({
  selectedTool = null,
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
    isDragging: boolean;
    dragOffset: { x: number; y: number };
    toolState: FrameToolState;
  }>({
    frames: [], // Initialize with empty frames array
    selectedId: null,
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
    toolState: FrameToolState.INACTIVE
  });

  // Resize and rotate state
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [resizeStartData, setResizeStartData] = useState<{
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    aspectRatio: number;
    handleOffset: { x: number; y: number };
  } | null>(null);
  const [rotateStartAngle, setRotateStartAngle] = useState(0);

  // RAF reference for smooth resizing
  const rafRef = useRef<number>();
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

  // Initialize offscreen canvas
  useEffect(() => {
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
      const canvas = offscreenCanvasRef.current;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (ctx) {
        ctx.fillStyle = '#FAFAFA';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        saveToHistory();
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

      const offscreenCtx = offscreenCanvas.getContext('2d', { alpha: false });
      if (offscreenCtx) {
        offscreenCtx.fillStyle = '#FAFAFA';
        offscreenCtx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
      }

      drawCanvas();
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Save current state to history
  const saveToHistory = useCallback(() => {
    const offscreenCanvas = offscreenCanvasRef.current;
    if (!offscreenCanvas) return;

    const ctx = offscreenCanvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
    const newHistory = history.slice(0, currentStep + 1);
    setHistory([...newHistory, imageData]);
    setCurrentStep(currentStep + 1);
  }, [history, currentStep]);

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

  // Handle mouse movement
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    // Handle frame dragging
    if (frameState.isDragging && frameState.selectedId) {
      const frame = frameState.frames.find(f => f.id === frameState.selectedId);
      if (!frame) return;
      
      // Calculate new position
      const newX = e.clientX - frameState.dragOffset.x;
      const newY = e.clientY - frameState.dragOffset.y;
      
      // Update frame position
      setFrameState(prev => ({
        ...prev,
        frames: prev.frames.map(f => 
          f.id === prev.selectedId ? { ...f, x: newX, y: newY } : f
        )
      }));
    }
    
    // Handle resizing
    if (isResizing && frameState.selectedId && resizeStartData) {
      const frame = frameState.frames.find(f => f.id === frameState.selectedId);
      if (!frame) return;
      
      // Calculate the distance moved from the original start position
      const deltaX = e.clientX - resizeStartData.startX;
      const deltaY = e.clientY - resizeStartData.startY;
      
      // Calculate scale based on diagonal movement for smoother resizing
      const diagonal = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const direction = deltaX + deltaY > 0 ? 1 : -1;
      const scaleFactor = 1 + (direction * diagonal / Math.sqrt(resizeStartData.startWidth * resizeStartData.startWidth + resizeStartData.startHeight * resizeStartData.startHeight));
      
      // Apply scaling with minimum size constraint
      const baseScale = Math.max(0.2, scaleFactor); // Allow scaling down to 20% of original size
      const newWidth = resizeStartData.startWidth * baseScale;
      const newHeight = resizeStartData.startHeight * baseScale;
      
      // Only update if above minimum size
      if (newWidth >= 50 && newHeight >= 50) {
        setFrameState(prev => ({
          ...prev,
          frames: prev.frames.map(f => 
            f.id === prev.selectedId ? { 
              ...f, 
              width: newWidth,
              height: newHeight
            } : f
          )
        }));
      }
    }
    
    // Handle rotating
    if (isRotating && frameState.selectedId) {
      const frame = frameState.frames.find(f => f.id === frameState.selectedId);
      if (!frame) return;
      
      const centerX = frame.x;
      const centerY = frame.y;
      
      // Calculate current angle
      const currentAngleRad = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      const angleDiff = currentAngleRad - rotateStartAngle;
      const angleDiffDeg = angleDiff * (180 / Math.PI);
      
      // Update frame rotation
      setFrameState(prev => ({
        ...prev,
        frames: prev.frames.map(f => 
          f.id === prev.selectedId ? { 
            ...f, 
            rotation: (f.rotation + angleDiffDeg) % 360
          } : f
        )
      }));
      
      setRotateStartAngle(currentAngleRad);
    }
    
    // Update cursor position
    setCursorPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });

    // Update mouse position for frame preview
    if (selectedTool === 'imageFrame' && frameState.toolState === FrameToolState.PLACING) {
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }

    // Handle drawing tools
    if (selectedTool === 'marker' && isDrawing) {
      const coords = getScaledCoords(e);
      currentPath.push(coords);
      if (currentPath.length > 4) {
        currentPath.splice(0, currentPath.length - 4);
      }

      const offscreenCanvas = offscreenCanvasRef.current;
      if (!offscreenCanvas) return;

      const offscreenCtx = offscreenCanvas.getContext('2d', { alpha: false });
      if (!offscreenCtx) return;

      offscreenCtx.strokeStyle = toolOptions.markerColor || '#000000';
      drawSmoothLine(offscreenCtx, currentPath);
      drawCanvas();

      setCurrentPath(currentPath);
    } else if (selectedTool === 'washiTape' && isPlacingWashiTape) {
      const coords = getScaledCoords(e);
      const dx = coords.x - washiTapeStartX;
      const dy = coords.y - washiTapeStartY;
      const width = Math.sqrt(dx * dx + dy * dy);
      const rotation = (Math.atan2(dy, dx) * 180) / Math.PI;

      setWashiTapeWidth(width);
      setWashiTapeRotation(rotation);
      drawCanvas();
    }

    // Update current resize data for RAF
    if (isResizing && currentResizeData.current) {
      currentResizeData.current.mouseX = e.clientX;
      currentResizeData.current.mouseY = e.clientY;
    }
  };

  // Draw everything on canvas
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const offscreenCanvas = offscreenCanvasRef.current;
    if (!canvas || !offscreenCanvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#FAFAFA';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw offscreen content
    ctx.drawImage(offscreenCanvas, 0, 0);

    // Draw grid
    drawGrid(ctx);

    // Draw washi tape preview if placing
    if (isPlacingWashiTape) {
      drawWashiTape(
        ctx,
        washiTapeStartX,
        washiTapeStartY,
        washiTapeWidth,
        washiTapeRotation,
        toolOptions.washiTapeSelection
      );
    }
  };

  // Draw grid
  const drawGrid = (ctx: CanvasRenderingContext2D) => {
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
  };

  // Draw washi tape
  const drawWashiTape = (
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

    const height = 30 * (window.devicePixelRatio || 1);
    const dpr = window.devicePixelRatio || 1;

    const isPattern = WASHI_PATTERNS.some((p: WashiTapePattern) => p.id === selection);
    
    if (isPattern) {
      const selectedPattern = WASHI_PATTERNS.find((p: WashiTapePattern) => p.id === selection);
      if (selectedPattern) {
        const patternCanvas = document.createElement('canvas');
        const patternCtx = patternCanvas.getContext('2d');
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
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1 * dpr;
    ctx.stroke();

    ctx.restore();
  };

  // Draw smooth line for marker
  const drawSmoothLine = (ctx: CanvasRenderingContext2D, points: Point[]) => {
    if (points.length < 2) return;

    ctx.save();
    if (toolOptions.markerTipType === 'marker') {
      ctx.globalCompositeOperation = 'source-over';
      if (ctx.strokeStyle && typeof ctx.strokeStyle === 'string') {
        const hex = ctx.strokeStyle;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.3)`;
      }
      ctx.lineCap = 'butt';
      ctx.lineJoin = 'miter';
      ctx.miterLimit = 2;
      ctx.lineWidth = 20 * (window.devicePixelRatio || 1);
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 2 * (window.devicePixelRatio || 1);
    }

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    if (points.length === 2) {
      ctx.lineTo(points[1].x, points[1].y);
    } else {
      for (let i = 1; i < points.length - 2; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      ctx.quadraticCurveTo(
        points[points.length - 2].x,
        points[points.length - 2].y,
        points[points.length - 1].x,
        points[points.length - 1].y
      );
    }

    ctx.stroke();
    ctx.restore();
  };

  // Start drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getScaledCoords(e);

    if (selectedTool === 'marker') {
      setIsDrawing(true);
      isDrawingRef.current = true;
      setCurrentPath([coords]);
    } else if (selectedTool === 'washiTape') {
      setIsPlacingWashiTape(true);
      setWashiTapeStartX(coords.x);
      setWashiTapeStartY(coords.y);
      setWashiTapeWidth(0);
      setWashiTapeRotation(0);
    }
  };

  // Continue drawing
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedTool) return;

    const coords = getScaledCoords(e);

    if (selectedTool === 'marker' && isDrawing) {
      const offscreenCanvas = offscreenCanvasRef.current;
      if (!offscreenCanvas) return;

      const offscreenCtx = offscreenCanvas.getContext('2d', { alpha: false });
      if (!offscreenCtx) return;

      currentPath.push(coords);
      if (currentPath.length > 4) {
        currentPath.splice(0, currentPath.length - 4);
      }

      offscreenCtx.strokeStyle = toolOptions.markerColor || '#000000';
      drawSmoothLine(offscreenCtx, currentPath);
      drawCanvas();

      setCurrentPath(currentPath);
    } else if (selectedTool === 'washiTape' && isPlacingWashiTape) {
      const dx = coords.x - washiTapeStartX;
      const dy = coords.y - washiTapeStartY;
      const width = Math.sqrt(dx * dx + dy * dy);
      const rotation = (Math.atan2(dy, dx) * 180) / Math.PI;

      setWashiTapeWidth(width);
      setWashiTapeRotation(rotation);
      drawCanvas();
    }
  };

  // Handle frame mouse down for dragging
  const handleFrameMouseDown = (e: React.MouseEvent, frameId: string) => {
    e.stopPropagation();
    
    const frame = frameState.frames.find(f => f.id === frameId);
    if (!frame) return;
    
    setFrameState(prev => ({
      ...prev,
      selectedId: frameId,
      isDragging: true,
      dragOffset: {
        x: e.clientX - frame.x,
        y: e.clientY - frame.y
      },
      toolState: FrameToolState.DRAGGING
    }));
  };

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent, frameId: string) => {
    e.stopPropagation();
    
    const frame = frameState.frames.find(f => f.id === frameId);
    if (!frame) return;
    
    // Calculate handle offset from mouse position
    const handleRect = (e.target as HTMLElement).getBoundingClientRect();
    const handleOffset = {
      x: e.clientX - (handleRect.left + handleRect.width / 2),
      y: e.clientY - (handleRect.top + handleRect.height / 2)
    };
    
    setFrameState(prev => ({ ...prev, selectedId: frameId }));
    setIsResizing(true);
    
    // Store initial resize data
    setResizeStartData({
      startX: e.clientX - handleOffset.x,
      startY: e.clientY - handleOffset.y,
      startWidth: frame.width,
      startHeight: frame.height,
      aspectRatio: frame.width / frame.height,
      handleOffset
    });

    // Initialize current resize data
    currentResizeData.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      frame
    };

    // Start RAF loop
    rafRef.current = requestAnimationFrame(updateResize);
  };

  // Update resize with RAF
  const updateResize = useCallback(() => {
    if (!isResizing || !resizeStartData || !currentResizeData.current) return;

    const { mouseX, mouseY, frame } = currentResizeData.current;
    const { startWidth, startHeight, startX, startY, aspectRatio } = resizeStartData;

    // Calculate deltas with handle offset correction
    const deltaX = mouseX - startX;
    const deltaY = mouseY - startY;

    // Calculate new dimensions while maintaining aspect ratio
    let newWidth = Math.max(50, startWidth + deltaX);
    let newHeight = newWidth / aspectRatio;

    // Ensure minimum height
    if (newHeight < 50) {
      newHeight = 50;
      newWidth = newHeight * aspectRatio;
    }

    // Update frame size
    setFrameState(prev => ({
      ...prev,
      frames: prev.frames.map(f =>
        f.id === frame.id ? {
          ...f,
          width: newWidth,
          height: newHeight
        } : f
      )
    }));

    // Continue RAF loop if still resizing
    if (isResizing) {
      rafRef.current = requestAnimationFrame(updateResize);
    }
  }, [isResizing, resizeStartData]);

  // Handle rotation start
  const handleRotateStart = (e: React.MouseEvent, frameId: string) => {
    e.stopPropagation();
    
    const frame = frameState.frames.find(f => f.id === frameId);
    if (!frame) return;
    
    const centerX = frame.x;
    const centerY = frame.y;
    
    // Calculate angle from center of frame to mouse position
    const angleRad = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    
    setFrameState(prev => ({ ...prev, selectedId: frameId }));
    setIsRotating(true);
    setRotateStartAngle(angleRad);
  };

  // Stop drawing and interactions
  const stopDrawing = () => {
    if (selectedTool === 'marker' && isDrawingRef.current) {
      saveToHistory();
      setIsDrawing(false);
      isDrawingRef.current = false;
      setCurrentPath([]);
    } else if (selectedTool === 'washiTape' && isPlacingWashiTape) {
      const offscreenCanvas = offscreenCanvasRef.current;
      if (!offscreenCanvas) return;

      const offscreenCtx = offscreenCanvas.getContext('2d', { alpha: false });
      if (!offscreenCtx) return;

      drawWashiTape(
        offscreenCtx,
        washiTapeStartX,
        washiTapeStartY,
        washiTapeWidth,
        washiTapeRotation,
        toolOptions.washiTapeSelection
      );

      setIsPlacingWashiTape(false);
      saveToHistory();
      drawCanvas();
    }

    // End frame dragging
    if (frameState.isDragging) {
      setFrameState(prev => ({
        ...prev,
        isDragging: false,
        toolState: prev.selectedId ? FrameToolState.SELECTED : FrameToolState.PLACING
      }));
    }

    // Clean up resize state
    if (isResizing) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      currentResizeData.current = null;
    }

    setIsResizing(false);
    setIsRotating(false);
  };

  // Expose methods through refs
  useEffect(() => {
    if (undoRef) undoRef.current = saveToHistory;
    if (redoRef) redoRef.current = saveToHistory;
  }, [saveToHistory]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'z' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (e.shiftKey) {
          saveToHistory();
        } else {
          saveToHistory();
        }
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [saveToHistory]);

  // Update tool state when selected tool changes
  useEffect(() => {
    console.log('Tool changed to:', selectedTool);
    if (selectedTool === 'imageFrame') {
      setFrameState(prev => {
        console.log('Setting frameState to PLACING');
        return {
          ...prev,
          toolState: FrameToolState.PLACING
        };
      });
    } else {
      setFrameState(prev => ({
        ...prev,
        toolState: FrameToolState.INACTIVE,
        selectedId: null
      }));
    }
  }, [selectedTool]);

  // Handle canvas clicks for image frames
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    console.log('Canvas clicked, tool:', selectedTool, 'toolState:', frameState.toolState);
    
    if (selectedTool === 'imageFrame' && frameState.toolState === FrameToolState.PLACING) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const newFrame: ImageFrame = {
        type: 'imageFrame',
        id: Math.random().toString(36).substr(2, 9),
        x,
        y,
        width: FRAME_WIDTH,
        height: FRAME_HEIGHT,
        rotation: 0,
        color: toolOptions.frameColor || '#E8E0D0' // Default polaroid color
      };
      
      console.log('New frame created:', newFrame);
      
      setFrameState(prev => {
        const newState = {
          ...prev,
          frames: [...prev.frames, newFrame],
          selectedId: newFrame.id,
          toolState: FrameToolState.SELECTED
        };
        console.log('Current frames:', newState.frames);
        return newState;
      });
    }
  };

  // Handle image upload for frames
  const handleImageUpload = (frameId: string) => {
    setFrameState(prev => ({
      ...prev,
      selectedId: frameId
    }));
    
    fileInputRef.current?.click();
  };

  // Process selected image file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !frameState.selectedId) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      const imageUrl = reader.result as string;
      
      setFrameState(prev => ({
        ...prev,
        frames: prev.frames.map(frame => 
          frame.id === prev.selectedId
            ? { ...frame, imageUrl }
            : frame
        )
      }));
    };
    
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset file input
  };

  // Add global mouse up handler
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      stopDrawing();
      
      if (frameState.isDragging) {
        setFrameState(prev => ({
          ...prev,
          isDragging: false,
          toolState: prev.selectedId ? FrameToolState.SELECTED : FrameToolState.PLACING
        }));
      }
      
      setIsResizing(false);
      setIsRotating(false);
    };
    
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [frameState.isDragging, frameState.selectedId]);

  // Clean up RAF on unmount and when resizing ends
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full bg-zinc-50"
        onMouseDown={startDrawing}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onClick={handleCanvasClick}
        style={{ touchAction: 'none' }}
      />

      {/* Frame rendering layer */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%',
          pointerEvents: selectedTool === 'imageFrame' || frameState.selectedId ? 'auto' : 'none'
        }}
        onClick={(e) => {
          e.stopPropagation();
          handleCanvasClick(e as unknown as React.MouseEvent<HTMLCanvasElement>);
        }}
        onMouseMove={(e) => {
          e.stopPropagation();
          handleMouseMove(e as unknown as React.MouseEvent<HTMLCanvasElement>);
        }}
        onMouseUp={(e) => {
          e.stopPropagation();
          stopDrawing();
        }}
        onMouseOut={(e) => {
          e.stopPropagation();
          stopDrawing();
        }}
      >
        {/* Preview frame */}
        {selectedTool === 'imageFrame' && frameState.toolState === FrameToolState.PLACING && (
          <div
            className="absolute border-2 border-dashed border-gray-500 bg-gray-100 bg-opacity-30"
            style={{
              left: cursorPosition.x,
              top: cursorPosition.y,
              width: `${FRAME_WIDTH}px`,
              height: `${FRAME_HEIGHT}px`,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none'
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
          </div>
        )}

        {(() => { console.log('Rendering frames:', frameState.frames); return null; })()}
        {frameState.frames.map(frame => (
          <div
            key={frame.id}
            className={`absolute ${frameState.selectedId === frame.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
            style={{
              left: frame.x,
              top: frame.y,
              width: `${frame.width}px`,
              height: `${frame.height}px`,
              backgroundColor: frame.color,
              borderRadius: '2px',
              transform: `translate(-50%, -50%) rotate(${frame.rotation}deg)`,
              padding: '8px',
              paddingBottom: '36px',
              cursor: frameState.isDragging && frameState.selectedId === frame.id ? 'grabbing' : 'grab',
              transition: isResizing ? 'none' : 'all 0.1s ease-out',
              willChange: isResizing ? 'width, height' : 'auto'
            }}
            onMouseDown={(e) => handleFrameMouseDown(e, frame.id)}
          >
            {frame.imageUrl ? (
              <img
                src={frame.imageUrl}
                alt=""
                className="w-full h-full object-cover"
                style={{
                  transition: isResizing ? 'none' : 'all 0.1s ease-out',
                  willChange: isResizing ? 'width, height' : 'auto'
                }}
                draggable={false}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <button
                  className="w-12 h-12 rounded-full bg-white hover:bg-gray-200 flex items-center justify-center shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageUpload(frame.id);
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
              </div>
            )}

            {/* Resize and rotate controls */}
            {frameState.selectedId === frame.id && (
              <>
                {/* Resize handle */}
                <div
                  className="absolute bottom-0 right-0 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-se-resize hover:scale-125"
                  style={{ 
                    transform: 'translate(50%, 50%)',
                    transition: isResizing ? 'none' : 'transform 0.1s ease-out',
                    willChange: isResizing ? 'transform' : 'auto'
                  }}
                  onMouseDown={(e) => handleResizeStart(e, frame.id)}
                />
                
                {/* Rotate handle */}
                <div
                  className="absolute top-0 right-0 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-crosshair hover:scale-125"
                  style={{ 
                    transform: 'translate(50%, -50%)',
                    transition: isResizing ? 'none' : 'transform 0.1s ease-out',
                    willChange: isResizing ? 'transform' : 'auto'
                  }}
                  onMouseDown={(e) => handleRotateStart(e, frame.id)}
                />
              </>
            )}
          </div>
        ))}
      </div>

      {/* Hidden file input for image upload */}
      <input 
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default Canvas; 