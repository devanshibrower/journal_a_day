import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ToolType, FrameToolState, FrameState, ImageFrame } from '../components/types';
import { WASHI_PATTERNS, WashiTapePattern } from '../components/tools/WashiTapeTool';

interface Point {
  x: number;
  y: number;
}

interface WashiTapeElement {
  x: number;
  y: number;
  width: number;
  rotation: number;
  pattern?: string;
  color?: string;
}

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
  clearRef?: React.MutableRefObject<(() => void) | null>;
}

const Canvas: React.FC<CanvasProps> = ({
  selectedTool = null,
  toolOptions = {},
  undoRef,
  redoRef,
  clearRef,
}) => {
  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const frameLayerRef = useRef<HTMLDivElement>(null);
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const pointsBuffer = useRef<Point[]>([]);

  // Washi tape state
  const [isPlacingWashiTape, setIsPlacingWashiTape] = useState(false);
  const [washiTapeStartX, setWashiTapeStartX] = useState(0);
  const [washiTapeStartY, setWashiTapeStartY] = useState(0);
  const [washiTapeWidth, setWashiTapeWidth] = useState(0);
  const [washiTapeRotation, setWashiTapeRotation] = useState(0);

  // History state
  const [history, setHistory] = useState<ImageData[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const isDrawingRef = useRef(false);

  // Consolidated frame state
  const [frameState, setFrameState] = useState<FrameState>({
    frames: [],
    selectedId: null,
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
    toolState: FrameToolState.INACTIVE
  });

  // Constants for frame dimensions
  const FRAME_WIDTH = 120;
  const FRAME_HEIGHT = 150;
  const FRAME_PADDING = 12;
  const FRAME_BOTTOM = 36;

  const [mousePosition, setMousePosition] = useState<Point>({ x: 0, y: 0 });

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

  // Handle mouse movement for frame preview
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePosition({ x, y });

    // Handle drawing tools
    if (selectedTool === 'marker' && isDrawing) {
      const coords = getScaledCoords(e);
      pointsBuffer.current.push(coords);
      if (pointsBuffer.current.length > 4) {
        pointsBuffer.current = pointsBuffer.current.slice(-4);
      }

      const offscreenCanvas = offscreenCanvasRef.current;
      if (!offscreenCanvas) return;

      const offscreenCtx = offscreenCanvas.getContext('2d', { alpha: false });
      if (!offscreenCtx) return;

      offscreenCtx.strokeStyle = toolOptions.markerColor || '#000000';
      drawSmoothLine(offscreenCtx, pointsBuffer.current);
      drawCanvas();

      setLastX(coords.x);
      setLastY(coords.y);
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

    // Always redraw canvas to update frame preview
    drawCanvas();
  };

  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool === 'imageFrame' && frameState.toolState === FrameToolState.PLACING) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newFrame: ImageFrame = {
        id: Math.random().toString(36).substr(2, 9),
        x,
        y,
        width: FRAME_WIDTH,
        height: FRAME_HEIGHT,
        rotation: 0
      };

      setFrameState(prev => ({
        ...prev,
        frames: [...prev.frames, newFrame],
        selectedId: newFrame.id,
        toolState: selectedTool === 'imageFrame' ? FrameToolState.PLACING : FrameToolState.INACTIVE
      }));
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

    // Draw offscreen content (markers, etc)
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

    // Draw frame preview if placing
    if (selectedTool === 'imageFrame' && frameState.toolState === FrameToolState.PLACING) {
      drawFramePreview(ctx);
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

  // Draw a single frame
  const drawFrame = (ctx: CanvasRenderingContext2D, frame: ImageFrame) => {
    ctx.save();
    
    // Draw frame background
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;
    
    ctx.beginPath();
    ctx.roundRect(
      frame.x - frame.width/2,
      frame.y - frame.height/2,
      frame.width,
      frame.height,
      8
    );
    ctx.fill();
    
    // Draw upload placeholder if no image
    if (!frame.imageUrl) {
      const centerX = frame.x;
      const centerY = frame.y;
      const iconSize = 40;
      
      ctx.strokeStyle = '#CCCCCC';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - iconSize/2, centerY);
      ctx.lineTo(centerX + iconSize/2, centerY);
      ctx.moveTo(centerX, centerY - iconSize/2);
      ctx.lineTo(centerX, centerY + iconSize/2);
      ctx.stroke();
    }
    
    ctx.restore();
  };

  // Draw frame preview
  const drawFramePreview = (ctx: CanvasRenderingContext2D) => {
    if (selectedTool !== 'imageFrame' || frameState.toolState !== FrameToolState.PLACING) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.save();
    
    // Set up dashed preview style
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 2 * dpr;
    ctx.setLineDash([5 * dpr, 5 * dpr]);
    
    // Draw preview rectangle
    const x = mousePosition.x * dpr;
    const y = mousePosition.y * dpr;
    
    ctx.beginPath();
    ctx.rect(
      x - (FRAME_WIDTH * dpr)/2,
      y - (FRAME_HEIGHT * dpr)/2,
      FRAME_WIDTH * dpr,
      FRAME_HEIGHT * dpr
    );
    ctx.stroke();
    
    // Draw plus icon in center
    const iconSize = 20 * dpr;
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 2 * dpr;
    ctx.setLineDash([]);
    
    ctx.beginPath();
    ctx.moveTo(x - iconSize/2, y);
    ctx.lineTo(x + iconSize/2, y);
    ctx.moveTo(x, y - iconSize/2);
    ctx.lineTo(x, y + iconSize/2);
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
      setLastX(coords.x);
      setLastY(coords.y);
      pointsBuffer.current = [coords];
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

      pointsBuffer.current.push(coords);
      if (pointsBuffer.current.length > 4) {
        pointsBuffer.current = pointsBuffer.current.slice(-4);
      }

      offscreenCtx.strokeStyle = toolOptions.markerColor || '#000000';
      drawSmoothLine(offscreenCtx, pointsBuffer.current);
      drawCanvas();

      setLastX(coords.x);
      setLastY(coords.y);
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

  // Stop drawing
  const stopDrawing = () => {
    if (selectedTool === 'marker' && isDrawingRef.current) {
      saveToHistory();
      setIsDrawing(false);
      isDrawingRef.current = false;
      pointsBuffer.current = [];
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
  };

  // Handle frame placement
  const handleFramePlacement = (e: React.MouseEvent<HTMLDivElement>) => {
    if (selectedTool !== 'imageFrame') return;

    const rect = frameLayerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newFrame: ImageFrame = {
      id: Math.random().toString(36).substr(2, 9),
      x,
      y,
      width: 120,
      height: 150,
      rotation: 0
    };

    setFrameState(prev => ({
      ...prev,
      frames: [...prev.frames, newFrame],
      toolState: FrameToolState.PLACING // Keep in placing mode for multiple frames
    }));
    
    // Deselect tool after placing frame
    const event = new CustomEvent('deselectTool');
    window.dispatchEvent(event);
  };

  // Handle file selection
  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !frameState.selectedId) return;

    const reader = new FileReader();
    reader.onload = () => {
      const imageUrl = reader.result as string;
      setFrameState(prev => ({
        ...prev,
        frames: prev.frames.map(frame => 
          frame.id === prev.selectedId ? { ...frame, imageUrl } : frame
        )
      }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Handle frame click
  const handleFrameClick = (e: React.MouseEvent, frameId: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    setFrameState(prev => ({
      ...prev,
      selectedId: frameId,
      toolState: FrameToolState.SELECTED
    }));
  };

  // Handle plus button click
  const handlePlusButtonClick = (e: React.MouseEvent, frameId: string) => {
    e.stopPropagation();
    e.preventDefault();
    setFrameState(prev => ({
      ...prev,
      selectedId: frameId
    }));
    fileInputRef.current?.click();
  };

  // Handle frame mouse down for dragging
  const handleFrameMouseDown = (e: React.MouseEvent, frameId: string) => {
    e.stopPropagation();
    e.preventDefault();
    
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

  // Handle frame mouse move for dragging
  const handleFrameMouseMove = (e: React.MouseEvent) => {
    if (!frameState.isDragging || !frameState.selectedId) return;

    const frame = frameState.frames.find(f => f.id === frameState.selectedId);
    if (!frame) return;

    const newX = e.clientX - frameState.dragOffset.x;
    const newY = e.clientY - frameState.dragOffset.y;

    setFrameState(prev => ({
      ...prev,
      frames: prev.frames.map(f =>
        f.id === prev.selectedId
          ? { ...f, x: newX, y: newY }
          : f
      )
    }));
  };

  // Handle frame mouse up to stop dragging
  const handleFrameMouseUp = () => {
    setFrameState(prev => ({
      ...prev,
      isDragging: false,
      toolState: prev.selectedId ? FrameToolState.SELECTED : prev.toolState
    }));
  };

  // Undo/redo functions
  const undo = useCallback(() => {
    if (currentStep > 0) {
      const offscreenCanvas = offscreenCanvasRef.current;
      if (!offscreenCanvas) return;

      const ctx = offscreenCanvas.getContext('2d', { alpha: false });
      if (!ctx) return;

      const newStep = currentStep - 1;
      ctx.putImageData(history[newStep], 0, 0);
      setCurrentStep(newStep);
      drawCanvas();
    }
  }, [currentStep, history]);

  const redo = useCallback(() => {
    if (currentStep < history.length - 1) {
      const offscreenCanvas = offscreenCanvasRef.current;
      if (!offscreenCanvas) return;

      const ctx = offscreenCanvas.getContext('2d', { alpha: false });
      if (!ctx) return;

      const newStep = currentStep + 1;
      ctx.putImageData(history[newStep], 0, 0);
      setCurrentStep(newStep);
      drawCanvas();
    }
  }, [currentStep, history]);

  // Clear canvas
  const clearCanvas = useCallback(() => {
    const offscreenCanvas = offscreenCanvasRef.current;
    if (!offscreenCanvas) return;

    const ctx = offscreenCanvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    ctx.fillStyle = '#FAFAFA';
    ctx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
    saveToHistory();
    drawCanvas();
  }, [saveToHistory]);

  // Expose methods through refs
  useEffect(() => {
    if (undoRef) undoRef.current = undo;
    if (redoRef) redoRef.current = redo;
    if (clearRef) clearRef.current = clearCanvas;
  }, [undo, redo, clearCanvas]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'z' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [undo, redo]);

  // Update frame tool state when selected tool changes
  useEffect(() => {
    if (selectedTool === 'imageFrame') {
      setFrameState(prev => ({
        ...prev,
        toolState: FrameToolState.PLACING,
        selectedId: null // Clear selection when entering placing mode
      }));
    } else {
      setFrameState(prev => ({
        ...prev,
        toolState: FrameToolState.INACTIVE
      }));
    }
  }, [selectedTool]);

  return (
    <div className="absolute inset-0 w-full h-full">
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
      <div
        ref={frameLayerRef}
        className="absolute inset-0 pointer-events-none"
        onMouseMove={handleFrameMouseMove}
        onMouseUp={handleFrameMouseUp}
        onMouseLeave={handleFrameMouseUp}
        style={{ pointerEvents: frameState.frames.length > 0 ? 'auto' : 'none' }}
      >
        {frameState.frames.map(frame => (
          <div
            key={frame.id}
            className={`absolute transition-transform ${frameState.selectedId === frame.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
            style={{
              left: frame.x,
              top: frame.y,
              width: `${frame.width}px`,
              height: `${frame.height}px`,
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              pointerEvents: 'auto',
              transform: `translate(-50%, -50%)`,
              cursor: frameState.isDragging ? 'grabbing' : 'grab',
              transition: frameState.isDragging ? 'none' : 'transform 0.15s ease-out',
              zIndex: frameState.selectedId === frame.id ? 10 : 1
            }}
            onClick={(e) => handleFrameClick(e, frame.id)}
            onMouseDown={(e) => handleFrameMouseDown(e, frame.id)}
          >
            {frame.imageUrl ? (
              <img
                src={frame.imageUrl}
                alt=""
                className="w-full h-full object-cover rounded-lg select-none"
                style={{ padding: '12px', paddingBottom: '36px' }}
                draggable={false}
              />
            ) : (
              <div 
                className="absolute inset-0 flex items-center justify-center cursor-pointer"
              >
                <button
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                  onClick={(e) => handlePlusButtonClick(e, frame.id)}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-gray-400"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInput}
      />
      {frameState.toolState === FrameToolState.PLACING && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-sm text-sm text-gray-600">
          Click anywhere to place a frame
        </div>
      )}
    </div>
  );
};

export default Canvas; 