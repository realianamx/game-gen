import { BlockShape } from './blockShapes';
import { Particle } from '../components/ParticleSystem';

export const drawGrid = (ctx: CanvasRenderingContext2D, gridSize: number, cellSize: number) => {
  // Animated grid with neon glow
  const time = Date.now() * 0.002;
  const alpha = 0.15 + Math.sin(time) * 0.05;
  
  ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
  ctx.lineWidth = 1;
  ctx.shadowBlur = 5;
  ctx.shadowColor = '#00ffff';
  
  // Draw vertical lines
  for (let i = 0; i <= gridSize; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cellSize, 0);
    ctx.lineTo(i * cellSize, gridSize * cellSize);
    ctx.stroke();
  }
  
  // Draw horizontal lines
  for (let i = 0; i <= gridSize; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * cellSize);
    ctx.lineTo(gridSize * cellSize, i * cellSize);
    ctx.stroke();
  }
  
  ctx.shadowBlur = 0;
};

export const drawBlocks = (
  ctx: CanvasRenderingContext2D,
  grid: (string | null)[][],
  cellSize: number
) => {
  grid.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        drawSingleBlock(ctx, x * cellSize, y * cellSize, cellSize, cell);
      }
    });
  });
};

export const drawSingleBlock = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  glow: boolean = false
) => {
  const padding = 2;
  const blockSize = size - padding;
  
  // Glow effect for special blocks
  if (glow) {
    ctx.save();
    ctx.shadowBlur = 20;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.fillRect(x + padding, y + padding, blockSize, blockSize);
    ctx.restore();
  }
  
  // Block shadow with depth
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(x + padding + 3, y + padding + 3, blockSize, blockSize);
  
  // Create gradient for 3D effect
  const gradient = ctx.createLinearGradient(x, y, x, y + size);
  gradient.addColorStop(0, lightenColor(color, 0.4));
  gradient.addColorStop(0.5, color);
  gradient.addColorStop(1, darkenColor(color, 0.3));
  
  // Main block with gradient
  ctx.fillStyle = gradient;
  ctx.fillRect(x + padding, y + padding, blockSize, blockSize);
  
  // Inner highlight
  const highlightGradient = ctx.createLinearGradient(x, y, x, y + size * 0.4);
  highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
  highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
  ctx.fillStyle = highlightGradient;
  ctx.fillRect(x + padding, y + padding, blockSize, blockSize * 0.4);
  
  // Glossy border
  ctx.strokeStyle = lightenColor(color, 0.2);
  ctx.lineWidth = 2;
  ctx.strokeRect(x + padding, y + padding, blockSize, blockSize);
  
  // Inner border for depth
  ctx.strokeStyle = darkenColor(color, 0.4);
  ctx.lineWidth = 1;
  ctx.strokeRect(x + padding + 1, y + padding + 1, blockSize - 2, blockSize - 2);
};

// Helper functions for color manipulation
export const lightenColor = (color: string, amount: number): string => {
  const hex = color.replace('#', '');
  const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + Math.round(255 * amount));
  const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + Math.round(255 * amount));
  const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + Math.round(255 * amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

export const darkenColor = (color: string, amount: number): string => {
  const hex = color.replace('#', '');
  const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - Math.round(255 * amount));
  const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - Math.round(255 * amount));
  const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - Math.round(255 * amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

export const drawCurrentPieces = (
  ctx: CanvasRenderingContext2D,
  pieces: BlockShape[],
  offsetX: number,
  offsetY: number,
  cellSize: number
) => {
  pieces.forEach(piece => {
    piece.blocks.forEach(({ x, y }) => {
      const drawX = (offsetX + x) * cellSize;
      const drawY = (offsetY + y) * cellSize;
      drawSingleBlock(ctx, drawX, drawY, cellSize, piece.color);
    });
  });
};

export const drawParticles = (ctx: CanvasRenderingContext2D, particles: Particle[]) => {
  particles.forEach(particle => {
    const alpha = particle.life / particle.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    
    // Add glow effect to particles
    ctx.shadowBlur = particle.size * 2;
    ctx.shadowColor = particle.color;
    
    // Draw outer glow
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size * 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw inner core
    ctx.shadowBlur = 0;
    ctx.fillStyle = lightenColor(particle.color, 0.3);
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size * 0.6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  });
};

// Animation utilities
export const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

export const easeOutBounce = (t: number): number => {
  const n1 = 7.5625;
  const d1 = 2.75;

  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    return n1 * (t -= 1.5 / d1) * t + 0.75;
  } else if (t < 2.5 / d1) {
    return n1 * (t -= 2.25 / d1) * t + 0.9375;
  } else {
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
};

export const interpolateColor = (color1: string, color2: string, factor: number): string => {
  // Simple color interpolation for hex colors
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');
  
  const r1 = parseInt(hex1.substr(0, 2), 16);
  const g1 = parseInt(hex1.substr(2, 2), 16);
  const b1 = parseInt(hex1.substr(4, 2), 16);
  
  const r2 = parseInt(hex2.substr(0, 2), 16);
  const g2 = parseInt(hex2.substr(2, 2), 16);
  const b2 = parseInt(hex2.substr(4, 2), 16);
  
  const r = Math.round(r1 + factor * (r2 - r1));
  const g = Math.round(g1 + factor * (g2 - g1));
  const b = Math.round(b1 + factor * (b2 - b1));
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};
