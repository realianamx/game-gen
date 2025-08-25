import { BlockShape } from './blockShapes';

export interface ClearedLine {
  type: 'row' | 'column';
  index: number;
}

export const canPlacePiece = (
  grid: (string | null)[][],
  piece: BlockShape,
  startX: number,
  startY: number
): boolean => {
  return piece.blocks.every(({ x, y }) => {
    const gridX = startX + x;
    const gridY = startY + y;
    
    // Check bounds
    if (gridX < 0 || gridX >= grid[0].length || gridY < 0 || gridY >= grid.length) {
      return false;
    }
    
    // Check if cell is empty
    return grid[gridY][gridX] === null;
  });
};

export const placePieceOnGrid = (
  grid: (string | null)[][],
  piece: BlockShape,
  startX: number,
  startY: number
): (string | null)[][] => {
  const newGrid = grid.map(row => [...row]);
  
  piece.blocks.forEach(({ x, y }) => {
    const gridX = startX + x;
    const gridY = startY + y;
    newGrid[gridY][gridX] = piece.color;
  });
  
  return newGrid;
};

export const checkLineClear = (grid: (string | null)[][]): ClearedLine[] => {
  const clearedLines: ClearedLine[] = [];
  
  // Check rows
  for (let row = 0; row < grid.length; row++) {
    if (grid[row].every(cell => cell !== null)) {
      clearedLines.push({ type: 'row', index: row });
    }
  }
  
  // Check columns
  for (let col = 0; col < grid[0].length; col++) {
    if (grid.every(row => row[col] !== null)) {
      clearedLines.push({ type: 'column', index: col });
    }
  }
  
  return clearedLines;
};

export const clearLines = (grid: (string | null)[][]): {
  clearedLines: ClearedLine[];
  updatedGrid: (string | null)[][];
} => {
  const clearedLines = checkLineClear(grid);
  let updatedGrid = grid.map(row => [...row]);
  
  // Clear rows
  clearedLines
    .filter(line => line.type === 'row')
    .forEach(line => {
      for (let col = 0; col < updatedGrid[0].length; col++) {
        updatedGrid[line.index][col] = null;
      }
    });
  
  // Clear columns
  clearedLines
    .filter(line => line.type === 'column')
    .forEach(line => {
      for (let row = 0; row < updatedGrid.length; row++) {
        updatedGrid[row][line.index] = null;
      }
    });
  
  return { clearedLines, updatedGrid };
};

export const calculateScore = (clearedLines: ClearedLine[], pieceSize: number): number => {
  const lineScore = clearedLines.length * 100;
  const pieceScore = pieceSize * 10;
  const bonusScore = clearedLines.length > 1 ? clearedLines.length * 50 : 0;
  
  return lineScore + pieceScore + bonusScore;
};
