import React, { useRef, useEffect, useCallback } from 'react';
import { useBlockBlast } from '../lib/stores/useBlockBlast';
import { useAudio } from '../lib/stores/useAudio';
import { drawGrid, drawBlocks, drawCurrentPieces, drawParticles } from '../lib/animations';
import { BlockPiece } from './BlockPiece';

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { gameState, placePiece, dragState, updateDragState } = useBlockBlast();
  const { playHit, playSuccess } = useAudio();

  // Much smaller responsive sizing to fit all screens
  const isMobile = window.innerWidth <= 768;
  const availableWidth = window.innerWidth - (isMobile ? 20 : 60);
  const availableHeight = window.innerHeight - (isMobile ? 200 : 300);
  
  const maxSize = isMobile 
    ? Math.min(availableWidth, availableHeight, 320) // Much smaller for mobile
    : Math.min(availableWidth, availableHeight, 450);
  
  const CANVAS_SIZE = Math.max(250, maxSize); // Smaller minimum size
  const GRID_SIZE = 10;
  const CELL_SIZE = CANVAS_SIZE / GRID_SIZE;
  const SCALE_FACTOR = isMobile ? 1.2 : 1.8; // Reduced scaling

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

    // Draw animated background with gradient
    const bgGradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width
    );
    bgGradient.addColorStop(0, '#2a1a4a');
    bgGradient.addColorStop(0.5, '#1a1a2a');
    bgGradient.addColorStop(1, '#0a0a1a');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add animated grid glow effect
    const time = Date.now() * 0.001;
    ctx.save();
    ctx.shadowBlur = 5 + Math.sin(time) * 3;
    ctx.shadowColor = '#00ffff';

    // Draw grid
    drawGrid(ctx, GRID_SIZE, CELL_SIZE);
    ctx.restore();

    // Draw placed blocks
    drawBlocks(ctx, gameState.grid, CELL_SIZE);

    // Draw particles
    if (gameState.particles.length > 0) {
      drawParticles(ctx, gameState.particles);
    }

    // Draw drag preview with enhanced effects
    if (dragState.isDragging && dragState.piece) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = (canvas.width / SCALE_FACTOR) / rect.width;
      const scaleY = (canvas.height / SCALE_FACTOR) / rect.height;
      const mouseX = (dragState.mouseX - rect.left) * scaleX;
      const mouseY = (dragState.mouseY - rect.top) * scaleY;
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

      // Draw preview with enhanced effects and blast preview
      ctx.save();
      if (canPlace) {
        ctx.globalAlpha = 0.8;
        ctx.shadowBlur = 20;
        ctx.shadowColor = dragState.piece.color;
        // Add pulsing effect
        const pulse = 0.8 + Math.sin(Date.now() * 0.01) * 0.2;
        ctx.globalAlpha *= pulse;
      } else {
        ctx.globalAlpha = 0.3;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff0000';
        // Add warning flash
        const flash = Math.sin(Date.now() * 0.02) > 0 ? 1 : 0.3;
        ctx.globalAlpha *= flash;
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
    // Fixed coordinate calculation for proper upper board functionality
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (event.clientX - rect.left) * scaleX;
    const mouseY = (event.clientY - rect.top) * scaleY;
    const gridX = Math.floor(mouseX / (CELL_SIZE * SCALE_FACTOR));
    const gridY = Math.floor(mouseY / (CELL_SIZE * SCALE_FACTOR));

    console.log(`Click at canvas: ${mouseX}, ${mouseY} -> grid: ${gridX}, ${gridY}`);

    const success = placePiece(dragState.piece, gridX, gridY);
    if (success) {
      playSuccess();
    } else {
      playHit();
    }
  }, [dragState, placePiece, playSuccess, playHit, CELL_SIZE, SCALE_FACTOR]);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragState.isDragging) {
      updateDragState({
        mouseX: event.clientX,
        mouseY: event.clientY
      });
    }
  }, [dragState.isDragging, updateDragState]);
  
  // Touch events for mobile support
  const handleTouchStart = useCallback((event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const touch = event.touches[0];
    if (dragState.isDragging && dragState.piece) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const touchX = (touch.clientX - rect.left) * scaleX;
      const touchY = (touch.clientY - rect.top) * scaleY;
      const gridX = Math.floor(touchX / (CELL_SIZE * SCALE_FACTOR));
      const gridY = Math.floor(touchY / (CELL_SIZE * SCALE_FACTOR));

      const success = placePiece(dragState.piece, gridX, gridY);
      if (success) {
        playSuccess();
      } else {
        playHit();
      }
    }
  }, [dragState, placePiece, playSuccess, playHit, CELL_SIZE, SCALE_FACTOR]);

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
      isMobile ? 'gap-3 p-2' : 'gap-6 p-4'
    }`}>
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE * SCALE_FACTOR}
        height={CANVAS_SIZE * SCALE_FACTOR}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        className={`border-4 border-cyan-400/50 rounded-lg shadow-2xl cursor-crosshair animate-neon ${
          isMobile ? 'border-2' : 'border-4'
        }`}
        style={{ 
          width: `${CANVAS_SIZE}px`,
          height: `${CANVAS_SIZE}px`,
          background: 'linear-gradient(45deg, #2a1a4a, #1a1a2a)',
          touchAction: 'none',
          boxShadow: isMobile 
            ? '0 0 20px rgba(0, 255, 255, 0.3), inset 0 0 10px rgba(0, 255, 255, 0.1)'
            : '0 0 40px rgba(0, 255, 255, 0.3), inset 0 0 20px rgba(0, 255, 255, 0.1), 0 0 80px rgba(138, 43, 226, 0.4)',
          imageRendering: 'crisp-edges'
        }}
      />
      
      {/* Current pieces to drag - mobile responsive */}
      <div className={`flex justify-center ${
        isMobile 
          ? 'gap-2 flex-wrap max-w-full px-2' 
          : 'gap-4'
      }`}>
        {gameState.currentPieces.map((piece, index) => (
          <div key={`${piece.id}-${index}`} className={isMobile ? 'scale-90' : ''}>
            <BlockPiece piece={piece} />
          </div>
        ))}
      </div>
    </div>
  );
};
