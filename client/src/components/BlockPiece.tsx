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
  const CELL_SIZE = isMobile ? 20 : 25;
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

  // Calculate canvas dimensions
  const minX = Math.min(...piece.blocks.map(b => b.x));
  const maxX = Math.max(...piece.blocks.map(b => b.x));
  const minY = Math.min(...piece.blocks.map(b => b.y));
  const maxY = Math.max(...piece.blocks.map(b => b.y));

  const width = (maxX - minX + 1) * CELL_SIZE + CANVAS_PADDING * 2;
  const height = (maxY - minY + 1) * CELL_SIZE + CANVAS_PADDING * 2;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw piece blocks with enhanced 3D effect
    piece.blocks.forEach(({ x, y }) => {
      const drawX = (x - minX) * CELL_SIZE + CANVAS_PADDING;
      const drawY = (y - minY) * CELL_SIZE + CANVAS_PADDING;

      // Create 3D gradient effect
      const gradient = ctx.createLinearGradient(drawX, drawY, drawX + CELL_SIZE, drawY + CELL_SIZE);
      gradient.addColorStop(0, lightenColor(piece.color, 0.3));
      gradient.addColorStop(0.5, piece.color);
      gradient.addColorStop(1, darkenColor(piece.color, 0.3));

      // Main block
      ctx.fillStyle = gradient;
      ctx.fillRect(drawX + 1, drawY + 1, CELL_SIZE - 2, CELL_SIZE - 2);

      // Highlight (top-left)
      ctx.fillStyle = lightenColor(piece.color, 0.4);
      ctx.fillRect(drawX + 1, drawY + 1, CELL_SIZE - 2, 2);
      ctx.fillRect(drawX + 1, drawY + 1, 2, CELL_SIZE - 2);

      // Shadow (bottom-right)
      ctx.fillStyle = darkenColor(piece.color, 0.4);
      ctx.fillRect(drawX + CELL_SIZE - 3, drawY + 3, 2, CELL_SIZE - 3);
      ctx.fillRect(drawX + 3, drawY + CELL_SIZE - 3, CELL_SIZE - 3, 2);

      // Outer border
      ctx.strokeStyle = darkenColor(piece.color, 0.5);
      ctx.lineWidth = 1;
      ctx.strokeRect(drawX, drawY, CELL_SIZE, CELL_SIZE);
    });

    // Add glow effect when dragging
    if (isDragging) {
      ctx.shadowBlur = 15;
      ctx.shadowColor = piece.color;
      ctx.strokeStyle = piece.color;
      ctx.lineWidth = 2;
      piece.blocks.forEach(({ x, y }) => {
        const drawX = (x - minX) * CELL_SIZE + CANVAS_PADDING;
        const drawY = (y - minY) * CELL_SIZE + CANVAS_PADDING;
        ctx.strokeRect(drawX, drawY, CELL_SIZE, CELL_SIZE);
      });
      ctx.shadowBlur = 0;
    }
  }, [piece, minX, minY, CELL_SIZE, CANVAS_PADDING, isDragging, lightenColor, darkenColor]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    startDrag(piece, event.clientX, event.clientY);
  }, [piece, startDrag]);

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    event.preventDefault();
    const touch = event.touches[0];
    startDrag(piece, touch.clientX, touch.clientY);
  }, [piece, startDrag]);

  return (
    <div className={`relative ${isDragging ? 'opacity-50 scale-95' : 'hover:scale-105'} transition-all duration-200`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className={`cursor-grab active:cursor-grabbing border-2 rounded-lg transition-all duration-200 ${
          isDragging 
            ? 'border-slate-300/40 shadow-md' 
            : 'border-slate-400/20 hover:border-slate-300/30 hover:shadow-md'
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8))',
          touchAction: 'none'
        }}
      />
    </div>
  );
};