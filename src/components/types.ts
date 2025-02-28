// Tool types
export type ToolType = 'marker' | 'washiTape' | 'imageFrame' | null;

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
  type: 'imageFrame';  // Type discriminator to match WashiTapeElement pattern
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  imageUrl?: string;
  color: string; // For polaroid color
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
  pattern?: string;
  color?: string;
  x: number;
  y: number;
  width: number;
  rotation: number;
}

// Journal entry types
export interface JournalEntry {
  date: string;
  canvasData: string;
  elements: (WashiTapeElement | ImageFrame)[];  // Updated to include ImageFrames
  isLocked: boolean;
  lastModified: string;
} 