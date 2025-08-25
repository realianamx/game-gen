export interface BlockPosition {
  x: number;
  y: number;
}

export interface BlockShape {
  id: string;
  blocks: BlockPosition[];
  color: string;
  name: string;
}

const COLORS = [
  '#ff3b3b', // Vibrant Red
  '#00d4aa', // Electric Teal
  '#0099ff', // Brilliant Blue
  '#00ff88', // Neon Green
  '#ffdd00', // Electric Yellow
  '#ff6bcf', // Hot Pink
  '#9d4edd', // Electric Purple
  '#ff8500', // Blazing Orange
  '#06ffa5', // Cyber Green
  '#ff0080', // Neon Magenta
  '#00ffff', // Cyan
  '#8a2be2', // Blue Violet
  '#ff1493', // Deep Pink
  '#00ff00', // Lime
  '#ffd700'  // Gold
];

// Define all possible block shapes
const SHAPES: Omit<BlockShape, 'id' | 'color'>[] = [
  // Single block
  { name: 'single', blocks: [{ x: 0, y: 0 }] },
  
  // Two blocks
  { name: 'double-h', blocks: [{ x: 0, y: 0 }, { x: 1, y: 0 }] },
  { name: 'double-v', blocks: [{ x: 0, y: 0 }, { x: 0, y: 1 }] },
  
  // Three blocks
  { name: 'triple-h', blocks: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }] },
  { name: 'triple-v', blocks: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }] },
  { name: 'L-shape', blocks: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }] },
  { name: 'corner', blocks: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }] },
  
  // Four blocks
  { name: 'quad-h', blocks: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }] },
  { name: 'quad-v', blocks: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }] },
  { name: 'square', blocks: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }] },
  { name: 'T-shape', blocks: [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }] },
  { name: 'Z-shape', blocks: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }] },
  { name: 'S-shape', blocks: [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }] },
  { name: 'L-big', blocks: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }] },
  { name: 'J-big', blocks: [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 0, y: 2 }] },
  
  // Five blocks
  { name: 'penta-h', blocks: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }] },
  { name: 'penta-v', blocks: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }, { x: 0, y: 4 }] },
  { name: 'plus', blocks: [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 }] },
  { name: 'cross-big', blocks: [{ x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }] },
  
  // Unique shapes
  { name: 'dog', blocks: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }] },
  { name: 'stairs', blocks: [{ x: 0, y: 2 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 0 }, { x: 2, y: 1 }] }
];

let shapeIdCounter = 0;

export const createBlockShape = (shapeTemplate: Omit<BlockShape, 'id' | 'color'>): BlockShape => {
  return {
    id: `shape-${++shapeIdCounter}`,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    ...shapeTemplate
  };
};

export const generateRandomPieces = (count: number): BlockShape[] => {
  const pieces: BlockShape[] = [];
  
  for (let i = 0; i < count; i++) {
    const randomShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    pieces.push(createBlockShape(randomShape));
  }
  
  return pieces;
};

export const getShapeByName = (name: string): Omit<BlockShape, 'id' | 'color'> | null => {
  return SHAPES.find(shape => shape.name === name) || null;
};

// Utility function to normalize block positions (ensure minimum x,y is 0)
export const normalizeBlockPositions = (blocks: BlockPosition[]): BlockPosition[] => {
  const minX = Math.min(...blocks.map(b => b.x));
  const minY = Math.min(...blocks.map(b => b.y));
  
  return blocks.map(block => ({
    x: block.x - minX,
    y: block.y - minY
  }));
};

// Rotate a shape 90 degrees clockwise
export const rotateShape = (shape: BlockShape): BlockShape => {
  const rotatedBlocks = shape.blocks.map(({ x, y }) => ({
    x: -y,
    y: x
  }));
  
  return {
    ...shape,
    blocks: normalizeBlockPositions(rotatedBlocks)
  };
};
