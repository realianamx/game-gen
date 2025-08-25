import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { BlockShape, generateRandomPieces } from '../blockShapes';
import { checkLineClear, clearLines, canPlacePiece, placePieceOnGrid } from '../gameLogic';
import { Particle, createParticles, createExplosion, createSparkles, createBlastWave, createLightning, updateParticles } from '../../components/ParticleSystem';

export type GamePhase = 'ready' | 'playing' | 'gameOver';

export interface DragState {
  isDragging: boolean;
  piece: BlockShape | null;
  mouseX: number;
  mouseY: number;
}

export interface GameState {
  phase: GamePhase;
  grid: (string | null)[][];
  score: number;
  linesCleared: number;
  currentPieces: BlockShape[];
  particles: Particle[];
}

interface BlockBlastStore {
  gameState: GameState;
  dragState: DragState;
  
  // Actions
  initializeGame: () => void;
  restartGame: () => void;
  placePiece: (piece: BlockShape, x: number, y: number) => boolean;
  startDrag: (piece: BlockShape, mouseX: number, mouseY: number) => void;
  updateDragState: (updates: Partial<DragState>) => void;
  stopDrag: () => void;
  updateParticles: () => void;
}

const GRID_SIZE = 10;

const createEmptyGrid = (): (string | null)[][] => {
  return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
};

export const useBlockBlast = create<BlockBlastStore>()(
  subscribeWithSelector((set, get) => ({
    gameState: {
      phase: 'ready',
      grid: createEmptyGrid(),
      score: 0,
      linesCleared: 0,
      currentPieces: [],
      particles: []
    },
    
    dragState: {
      isDragging: false,
      piece: null,
      mouseX: 0,
      mouseY: 0
    },

    initializeGame: () => {
      set({
        gameState: {
          phase: 'playing',
          grid: createEmptyGrid(),
          score: 0,
          linesCleared: 0,
          currentPieces: generateRandomPieces(3),
          particles: []
        },
        dragState: {
          isDragging: false,
          piece: null,
          mouseX: 0,
          mouseY: 0
        }
      });
    },

    restartGame: () => {
      get().initializeGame();
    },

    placePiece: (piece: BlockShape, x: number, y: number) => {
      const { gameState } = get();
      
      if (!canPlacePiece(gameState.grid, piece, x, y)) {
        return false;
      }

      const newGrid = placePieceOnGrid(gameState.grid, piece, x, y);
      const { clearedLines, updatedGrid } = clearLines(newGrid);
      
      // Create EPIC particle effects for cleared blocks
      const newParticles: Particle[] = [];
      const isMobile = window.innerWidth <= 768;
      const CELL_SIZE = isMobile ? 25 : 45; // Responsive cell size for particle positioning
      
      clearedLines.forEach(line => {
        if (line.type === 'row') {
          for (let col = 0; col < GRID_SIZE; col++) {
            const color = gameState.grid[line.index][col] || '#ff6b6b';
            const x = col * CELL_SIZE + CELL_SIZE / 2;
            const y = line.index * CELL_SIZE + CELL_SIZE / 2;
            
            // Multiple explosion effects for each block
            newParticles.push(...createExplosion(x, y, color));
            newParticles.push(...createParticles(x, y, color, 20));
          }
        } else {
          for (let row = 0; row < GRID_SIZE; row++) {
            const color = gameState.grid[row][line.index] || '#ff6b6b';
            const x = line.index * CELL_SIZE + CELL_SIZE / 2;
            const y = row * CELL_SIZE + CELL_SIZE / 2;
            
            // Multiple explosion effects for each block
            newParticles.push(...createExplosion(x, y, color));
            newParticles.push(...createParticles(x, y, color, 20));
          }
        }
      });
      
      // Enhanced effects based on combo level
      const centerX = (GRID_SIZE * CELL_SIZE) / 2;
      const centerY = (GRID_SIZE * CELL_SIZE) / 2;
      
      if (clearedLines.length === 1) {
        // Single line clear - sparkles
        newParticles.push(...createSparkles(centerX, centerY));
      } else if (clearedLines.length === 2) {
        // Double combo - blast wave
        newParticles.push(...createBlastWave(centerX, centerY));
        newParticles.push(...createSparkles(centerX, centerY));
      } else if (clearedLines.length >= 3) {
        // Triple+ combo - EPIC lightning + blast wave
        newParticles.push(...createBlastWave(centerX, centerY));
        newParticles.push(...createLightning(0, centerY, GRID_SIZE * CELL_SIZE, centerY));
        newParticles.push(...createLightning(centerX, 0, centerX, GRID_SIZE * CELL_SIZE));
        newParticles.push(...createSparkles(centerX, centerY));
        
        // Add more blast waves for massive effect
        for (let i = 0; i < 3; i++) {
          const offsetX = centerX + (Math.random() - 0.5) * 200;
          const offsetY = centerY + (Math.random() - 0.5) * 200;
          newParticles.push(...createBlastWave(offsetX, offsetY));
        }
      }

      // Calculate enhanced scoring with combo multipliers
      const lineScore = clearedLines.length * 100;
      const pieceScore = piece.blocks.length * 10;
      const comboMultiplier = clearedLines.length > 1 ? clearedLines.length : 1;
      const bonusScore = clearedLines.length > 1 ? clearedLines.length * 100 * comboMultiplier : 0;

      // Remove the placed piece from current pieces
      const updatedPieces = gameState.currentPieces.filter(p => p.id !== piece.id);
      
      // Generate new pieces if all current pieces are used
      const finalPieces = updatedPieces.length === 0 ? generateRandomPieces(3) : updatedPieces;

      set(state => ({
        gameState: {
          ...state.gameState,
          grid: updatedGrid,
          score: state.gameState.score + lineScore + pieceScore + bonusScore,
          linesCleared: state.gameState.linesCleared + clearedLines.length,
          currentPieces: finalPieces,
          particles: [...state.gameState.particles, ...newParticles]
        },
        dragState: {
          isDragging: false,
          piece: null,
          mouseX: 0,
          mouseY: 0
        }
      }));

      // Check for game over
      setTimeout(() => {
        const { gameState: currentState } = get();
        const hasValidMove = currentState.currentPieces.some(piece =>
          canPlacePiece(currentState.grid, piece, 0, 0) ||
          Array(GRID_SIZE).fill(null).some((_, x) =>
            Array(GRID_SIZE).fill(null).some((_, y) =>
              canPlacePiece(currentState.grid, piece, x, y)
            )
          )
        );

        if (!hasValidMove) {
          set(state => ({
            gameState: {
              ...state.gameState,
              phase: 'gameOver'
            }
          }));
        }
      }, 100);

      return true;
    },

    startDrag: (piece: BlockShape, mouseX: number, mouseY: number) => {
      set(state => ({
        dragState: {
          isDragging: true,
          piece,
          mouseX,
          mouseY
        }
      }));
    },

    updateDragState: (updates: Partial<DragState>) => {
      set(state => ({
        dragState: {
          ...state.dragState,
          ...updates
        }
      }));
    },

    stopDrag: () => {
      set(state => ({
        dragState: {
          ...state.dragState,
          isDragging: false,
          piece: null
        }
      }));
    },

    updateParticles: () => {
      set(state => ({
        gameState: {
          ...state.gameState,
          particles: updateParticles(state.gameState.particles)
        }
      }));
    }
  }))
);

// Set up particle animation loop
setInterval(() => {
  useBlockBlast.getState().updateParticles();
}, 16); // ~60 FPS
