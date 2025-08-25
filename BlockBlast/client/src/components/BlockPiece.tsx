import React, { useRef, useEffect, useCallback } from 'react';
import { useBlockBlast } from '../lib/stores/useBlockBlast';
import { BlockShape } from '../lib/blockShapes';

interface BlockPieceProps {
  piece: BlockShape;
}

export const BlockPiece: React.FC<BlockPieceProps> = ({ piece }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { startDrag, stopDrag, dragState } = useBlockBlast();

  const isMobile = window.innerWidth <= 768;
  const CELL_SIZE = isMobile ? 20 : 25; // Smaller pieces on mobile
  const CANVAS_PADDING = isMobile ? 3 : 5;

  // Helper functions for color manipulation
  const lightenColor = (color: string, amount: number): string => {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + Math.round(255 * amount));
    const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + Math.round(255 * amount));
    const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + Math.round(255 * amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };
  
  const darkenColor = (color: string, amount: number): string => {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - Math.round(255 * amount));
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - Math.round(255 * amount));
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - Math.round(255 * amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const isDragging = dragState.isDragging && dragState.piece?.id === piece.id;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Add glow effect for the entire piece
    if (!isDragging) {
      ctx.save();
      ctx.shadowBlur = 15;
      ctx.shadowColor = piece.color;
      ctx.globalAlpha = 0.3;
      
      piece.blocks.forEach(({ x, y }) => {
        const drawX = (x + 1) * CELL_SIZE + CANVAS_PADDING;
        const drawY = (y + 1) * CELL_SIZE + CANVAS_PADDING;
        ctx.fillStyle = piece.color;
        ctx.fillRect(drawX - 2, drawY - 2, CELL_SIZE + 2, CELL_SIZE + 2);
      });
      
      ctx.restore();
    }

    // Draw piece blocks with enhanced HD graphics
    piece.blocks.forEach(({ x, y }) => {
      const drawX = (x + 1) * CELL_SIZE + CANVAS_PADDING;
      const drawY = (y + 1) * CELL_SIZE + CANVAS_PADDING;

      // Enhanced shadow with multiple layers
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(drawX + 3, drawY + 3, CELL_SIZE - 2, CELL_SIZE - 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(drawX + 2, drawY + 2, CELL_SIZE - 2, CELL_SIZE - 2);

      // Create HD gradient for 3D effect
      const gradient = ctx.createLinearGradient(drawX, drawY, drawX, drawY + CELL_SIZE);
      const baseColor = piece.color;
      const lightColor = lightenColor(baseColor, 0.4);
      const darkColor = darkenColor(baseColor, 0.3);
      
      gradient.addColorStop(0, lightColor);
      gradient.addColorStop(0.3, baseColor);
      gradient.addColorStop(1, darkColor);

      // Main block with gradient
      ctx.fillStyle = gradient;
      ctx.fillRect(drawX, drawY, CELL_SIZE - 2, CELL_SIZE - 2);

      // Inner highlight for glass effect
      const highlightGradient = ctx.createLinearGradient(drawX, drawY, drawX, drawY + CELL_SIZE * 0.4);
      highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
      ctx.fillStyle = highlightGradient;
      ctx.fillRect(drawX, drawY, CELL_SIZE - 2, CELL_SIZE * 0.4);

      // Enhanced border with multiple colors
      ctx.strokeStyle = lightColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(drawX, drawY, CELL_SIZE - 2, CELL_SIZE - 2);
      
      ctx.strokeStyle = darkColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(drawX + 1, drawY + 1, CELL_SIZE - 4, CELL_SIZE - 4);
    });
  }, [piece, isDragging, lightenColor, darkenColor]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    startDrag(piece, event.clientX, event.clientY);
  }, [piece, startDrag]);

  const handleMouseUp = useCallback(() => {
    if (dragState.isDragging && dragState.piece?.id === piece.id) {
      stopDrag();
    }
  }, [dragState, piece.id, stopDrag]);

  // Calculate canvas size based on piece dimensions
  const maxX = Math.max(...piece.blocks.map(b => b.x));
  const maxY = Math.max(...piece.blocks.map(b => b.y));
  const minX = Math.min(...piece.blocks.map(b => b.x));
  const minY = Math.min(...piece.blocks.map(b => b.y));
  
  const canvasWidth = (maxX - minX + 3) * CELL_SIZE + CANVAS_PADDING * 2;
  const canvasHeight = (maxY - minY + 3) * CELL_SIZE + CANVAS_PADDING * 2;

  return (
    <div className={`relative ${isDragging ? 'opacity-50' : ''}`}>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        className={`
          rounded-lg shadow-xl transition-all duration-200 border-2 transform
          ${isDragging 
            ? 'border-cyan-400 cursor-grabbing scale-110 shadow-2xl shadow-cyan-400/50 animate-pulse' 
            : 'border-purple-400/50 cursor-grab hover:border-cyan-400 hover:shadow-2xl hover:shadow-cyan-400/50 hover:scale-110 hover:-translate-y-1'
          }
        `}
        style={{ 
          background: isDragging 
            ? 'linear-gradient(145deg, #1a1a2a, #2a2a4a)'
            : 'linear-gradient(145deg, #2a1a4a, #1a1a2a)',
          touchAction: 'none',
          boxShadow: isDragging 
            ? '0 0 30px rgba(0, 255, 255, 0.5)'
            : '0 5px 20px rgba(0, 0, 0, 0.5)'
        }}
      />
    </div>
  );
};
