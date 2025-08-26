import React, { useRef, useEffect, useCallback } from 'react';
import { useBlockBlast } from '../lib/stores/useBlockBlast';
import { useAudio } from '../lib/stores/useAudio';
import { drawGrid, drawBlocks, drawCurrentPieces, drawParticles } from '../lib/animations';
import { BlockPiece } from './BlockPiece';

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { gameState, placePiece, dragState, updateDragState } = useBlockBlast();
  const { playHit, playSuccess } = useAudio();

  // Much more responsive sizing for all screen sizes
  const isMobile = window.innerWidth <= 768;
  const isTablet = window.innerWidth <= 1024;
  
  // Calculate available space more conservatively
  const availableWidth = window.innerWidth - (isMobile ? 16 : isTablet ? 40 : 80);
  const availableHeight = window.innerHeight - (isMobile ? 180 : isTablet ? 220 : 280);
  
  // Set maximum sizes based on device type
  let maxSize;
  if (isMobile) {
    maxSize = Math.min(availableWidth, availableHeight * 0.6, 280);
  } else if (isTablet) {
    maxSize = Math.min(availableWidth, availableHeight * 0.5, 280);
  } else {
    maxSize = Math.min(availableWidth, availableHeight * 0.4, 250);
  }
  
  const CANVAS_SIZE = Math.max(220, maxSize);
  const GRID_SIZE = 10;
  const CELL_SIZE = CANVAS_SIZE / GRID_SIZE;
  const SCALE_FACTOR = isMobile ? 1.5 : 2; // Lower scale on mobile for better performance

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set HD scaling for crisp graphics
    ctx.save();
    ctx.scale(SCALE_FACTOR, SCALE_FACTOR);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width / SCALE_FACTOR, canvas.height / SCALE_FACTOR);

    // Draw static smooth background
    const bgGradient = ctx.createRadialGradient(
      CANVAS_SIZE / 2, CANVAS_SIZE / 2, 0,
      CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 1.5
    );
    bgGradient.addColorStop(0, '#1a1a2e');
    bgGradient.addColorStop(0.6, '#16213e');
    bgGradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Draw grid
    drawGrid(ctx, GRID_SIZE, CELL_SIZE);

    // Draw placed blocks
    drawBlocks(ctx, gameState.grid, CELL_SIZE);

    // Draw particles
    if (gameState.particles.length > 0) {
      drawParticles(ctx, gameState.particles);
    }

    // Draw drag preview with enhanced effects
    if (dragState.isDragging && dragState.piece) {
      const rect = canvas.getBoundingClientRect();
      // Calculate mouse position with proper scaling
      const scaleX = CANVAS_SIZE / rect.width;
      const scaleY = CANVAS_SIZE / rect.height;
      
      const mouseX = (dragState.mouseX - rect.left) * scaleX;
      const mouseY = (dragState.mouseY - rect.top) * scaleY;
      
      // Convert to grid coordinates
      const gridX = Math.floor(mouseX / CELL_SIZE);
      const gridY = Math.floor(mouseY / CELL_SIZE);

      // Check if placement is valid
      const canPlace = gameState.grid && 
        dragState.piece.blocks.every(({ x, y }) => {
          const checkX = gridX + x;
          const checkY = gridY + y;
          return checkX >= 0 && checkX < GRID_SIZE && 
                 checkY >= 0 && checkY < GRID_SIZE && 
                 gameState.grid[checkY][checkX] === null;
        });

      // Draw preview with soft effects
      ctx.save();
      if (canPlace) {
        ctx.globalAlpha = 0.7;
        ctx.shadowBlur = 8;
        ctx.shadowColor = dragState.piece.color;
      } else {
        ctx.globalAlpha = 0.4;
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#ff6666';
      }
      
      drawCurrentPieces(ctx, [dragState.piece], gridX, gridY, CELL_SIZE);
      ctx.restore();
    }
    
    // Restore scaling
    ctx.restore();
  }, [gameState, dragState, CELL_SIZE, GRID_SIZE]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const animationFrame = requestAnimationFrame(() => draw());
    return () => cancelAnimationFrame(animationFrame);
  }, [draw]);

  // Animation loop for particles
  useEffect(() => {
    let animationId: number;
    
    const animate = () => {
      if (gameState.particles.length > 0) {
        draw();
      }
      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, [draw, gameState.particles]);

  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragState.isDragging || !dragState.piece) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    // Calculate mouse position relative to the actual displayed canvas size
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;
    
    const mouseX = (event.clientX - rect.left) * scaleX;
    const mouseY = (event.clientY - rect.top) * scaleY;
    
    // Convert to grid coordinates
    const gridX = Math.floor(mouseX / CELL_SIZE);
    const gridY = Math.floor(mouseY / CELL_SIZE);

    console.log(`Click at canvas: ${mouseX}, ${mouseY} -> grid: ${gridX}, ${gridY}, rect: ${rect.width}x${rect.height}, canvas: ${CANVAS_SIZE}`);

    const success = placePiece(dragState.piece, gridX, gridY);
    if (success) {
      playSuccess();
    } else {
      playHit();
    }
  }, [dragState, placePiece, playSuccess, playHit, CELL_SIZE]);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragState.isDragging) {
      updateDragState({
        mouseX: event.clientX,
        mouseY: event.clientY
      });
    }
  }, [dragState.isDragging, updateDragState]);
  
  // Enhanced touch events for mobile support
  const handleTouchStart = useCallback((event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const touch = event.touches[0];
    if (dragState.isDragging && dragState.piece) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      // Calculate touch position with proper scaling
      const scaleX = CANVAS_SIZE / rect.width;
      const scaleY = CANVAS_SIZE / rect.height;
      
      const touchX = (touch.clientX - rect.left) * scaleX;
      const touchY = (touch.clientY - rect.top) * scaleY;
      
      // Convert to grid coordinates
      const gridX = Math.floor(touchX / CELL_SIZE);
      const gridY = Math.floor(touchY / CELL_SIZE);

      const success = placePiece(dragState.piece, gridX, gridY);
      if (success) {
        playSuccess();
        // Add haptic feedback for mobile
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      } else {
        playHit();
        // Stronger vibration for invalid moves
        if ('vibrate' in navigator) {
          navigator.vibrate([50, 50, 50]);
        }
      }
    }
  }, [dragState, placePiece, playSuccess, playHit, CELL_SIZE]);

  const handleTouchMove = useCallback((event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    if (dragState.isDragging && event.touches.length > 0) {
      const touch = event.touches[0];
      updateDragState({
        mouseX: touch.clientX,
        mouseY: touch.clientY
      });
    }
  }, [dragState.isDragging, updateDragState]);

  return (
    <div className={`flex flex-col items-center ${
      isMobile ? 'gap-2 p-1' : isTablet ? 'gap-3 p-2' : 'gap-4 p-3'
    }`}>
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE * SCALE_FACTOR}
        height={CANVAS_SIZE * SCALE_FACTOR}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        className={`border-slate-600 rounded-lg shadow-2xl cursor-crosshair ${
          isMobile ? 'border-2' : isTablet ? 'border-3' : 'border-4'
        }`}
        style={{ 
          width: `${CANVAS_SIZE}px`,
          height: `${CANVAS_SIZE}px`,
          background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f172a)',
          touchAction: 'none',
          boxShadow: isMobile 
            ? '0 4px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            : isTablet
            ? '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            : '0 12px 48px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.2)',
          imageRendering: 'auto',
          transform: 'translateZ(0)',
          willChange: 'transform',
          backfaceVisibility: 'hidden'
        }
      />
      
      {/* Current pieces to drag - responsive */}
      <div className={`flex justify-center ${
        isMobile 
          ? 'gap-1 flex-wrap max-w-full px-1' 
          : isTablet
          ? 'gap-2 flex-wrap max-w-full px-2'
          : 'gap-3'
      }`}>
        {gameState.currentPieces.map((piece, index) => (
          <div key={`${piece.id}-${index}`} className={
            isMobile ? 'scale-75' : isTablet ? 'scale-85' : ''
          }>
            <BlockPiece piece={piece} />
          </div>
        ))}
      </div>
    </div>
  );
};
