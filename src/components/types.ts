// Tool types
export type ToolType = 'marker' | 'washiTape' | 'imageFrame' | null;

// Marker tool types
export type MarkerTipType = 'thin' | 'marker';

// Tool options types
export interface ToolOptions {
  markerColor?: string;
  markerTipType?: MarkerTipType;
  washiTapeSelection?: string;
  frameColor?: string;
  framePattern?: string;
}

// Frame-specific types
export enum FrameToolState {
  INACTIVE = 'INACTIVE',     // Tool not selected
  PLACING = 'PLACING',       // Ready to place new frame
  SELECTED = 'SELECTED',     // Frame selected, can drag/edit
  DRAGGING = 'DRAGGING'      // Currently dragging frame
}

export interface FrameState {
  frames: ImageFrame[];
  selectedId: string | null;
  isDragging: boolean;
  dragOffset: { x: number; y: number };
  toolState: FrameToolState;
}

export interface ImageFrame {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  imageUrl?: string;
  rotation: number;
}

// Journal entry types
export interface JournalEntry {
  date: string;
  canvasData: string;
  elements: (WashiTapeElement | ImageFrameElement)[];
  isLocked: boolean;
  lastModified: string;
}

export interface WashiTapeElement {
  type: 'washiTape';
  pattern?: string;
  color?: string;
  x: number;
  y: number;
  width: number;
  rotation: number;
}

export interface ImageFrameElement {
  type: 'imageFrame';
  frameStyle: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  imageData?: string;
} 