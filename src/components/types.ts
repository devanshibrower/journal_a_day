// Tool types
export type ToolType = 'marker' | 'washiTape' | 'imageFrame' | 'text' | null;

// Marker tool types
export type MarkerTipType = 'thin' | 'marker';

// Image frame types
export enum FrameToolState {
  INACTIVE,   // Not using image tool
  PLACING,    // Ready to place a frame
  SELECTED,   // Frame is selected for editing
  DRAGGING    // Moving a frame
}

export interface ImageFrame {
  type: 'imageFrame';
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  imageUrl?: string;
  padding?: number;
  bottomPadding?: number;
  createdAt: number; // Timestamp to track creation order
}

// Tool options types
export interface ToolOptions {
  markerColor?: string;
  markerTipType?: MarkerTipType;
  washiTapeSelection?: string;
  frameColor?: string;
  framePattern?: string;
}

// Drawing types
export interface Point {
  x: number;
  y: number;
}

export interface DrawnPath {
  points: Point[];
  color: string;
  tipType: MarkerTipType;
}

// Washi tape types
export interface WashiTapeElement {
  type: 'washiTape';
  id: string;  // Add ID for tracking
  pattern?: string;
  color?: string;
  x: number;
  y: number;
  width: number;
  rotation: number;
  createdAt: number; // Timestamp to track creation order
}

// Journal entry types
export interface JournalEntry {
  date: string;
  canvasData: string;
  elements: (WashiTapeElement | ImageFrame)[];  // Updated to include ImageFrames
  isLocked: boolean;
  lastModified: string;
}

export interface TextElement {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  width?: number;
  height?: number;
} 