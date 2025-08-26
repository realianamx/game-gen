import React from 'react';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export const createParticles = (x: number, y: number, color: string, count: number = 15): Particle[] => {
  const particles: Particle[] = [];
  
  for (let i = 0; i < count; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.5) * 12 - Math.random() * 8,
      life: 80 + Math.random() * 40,
      maxLife: 80 + Math.random() * 40,
      color,
      size: Math.random() * 6 + 3
    });
  }
  
  return particles;
};

// Create explosion effect for line clears
export const createExplosion = (x: number, y: number, color: string): Particle[] => {
  const particles: Particle[] = [];
  
  for (let i = 0; i < 25; i++) {
    const angle = (i / 25) * Math.PI * 2;
    const speed = Math.random() * 8 + 4;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 100,
      maxLife: 100,
      color,
      size: Math.random() * 8 + 4
    });
  }
  
  return particles;
};

// Create sparkle effect for combos
export const createSparkles = (x: number, y: number): Particle[] => {
  const particles: Particle[] = [];
  const colors = ['#ffd700', '#fff700', '#ffff00', '#ff8c00'];
  
  for (let i = 0; i < 12; i++) {
    particles.push({
      x: x + (Math.random() - 0.5) * 40,
      y: y + (Math.random() - 0.5) * 40,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4 - Math.random() * 6,
      life: 120,
      maxLife: 120,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 4 + 2
    });
  }
  
  return particles;
};

export const updateParticles = (particles: Particle[]): Particle[] => {
  return particles
    .map(particle => ({
      ...particle,
      x: particle.x + particle.vx,
      y: particle.y + particle.vy,
      vx: particle.vx * 0.98,
      vy: particle.vy * 0.98 + 0.1, // gravity
      life: particle.life - 1
    }))
    .filter(particle => particle.life > 0);
};

export const drawParticles = (ctx: CanvasRenderingContext2D, particles: Particle[]) => {
  particles.forEach(particle => {
    const alpha = particle.life / particle.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
};

// Epic blast wave effect for massive line clears
export const createBlastWave = (centerX: number, centerY: number): Particle[] => {
  const particles: Particle[] = [];
  const colors = ['#ff0080', '#00ffff', '#ffff00', '#ff6600', '#8a2be2', '#ff3366', '#66ff33'];
  
  // Create multiple rings of blast particles for more epic effect
  for (let ring = 0; ring < 3; ring++) {
    const particleCount = 40 + ring * 15;
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + ring * 0.2;
      const baseDistance = 30 + ring * 25;
      const distance = baseDistance + Math.random() * 30;
      const speed = 12 + Math.random() * 8 + ring * 2;
      
      particles.push({
        x: centerX + Math.cos(angle) * (distance * 0.5),
        y: centerY + Math.sin(angle) * (distance * 0.5),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 180 + ring * 30,
        maxLife: 180 + ring * 30,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 12 + 8 - ring * 2
      });
    }
  }
  
  return particles;
};

// Lightning effect for super combos
export const createLightning = (startX: number, startY: number, endX: number, endY: number): Particle[] => {
  const particles: Particle[] = [];
  const segments = 15;
  const colors = ['#ffffff', '#88ccff', '#ffff88', '#ff88ff'];
  
  // Main lightning bolt
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = startX + (endX - startX) * t + (Math.random() - 0.5) * 30;
    const y = startY + (endY - startY) * t + (Math.random() - 0.5) * 30;
    
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3,
      life: 60 + Math.random() * 40,
      maxLife: 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 5 + 2
    });
  }
  
  // Add branching lightning
  for (let branch = 0; branch < 3; branch++) {
    const branchT = 0.3 + Math.random() * 0.4;
    const branchX = startX + (endX - startX) * branchT;
    const branchY = startY + (endY - startY) * branchT;
    const branchEndX = branchX + (Math.random() - 0.5) * 100;
    const branchEndY = branchY + (Math.random() - 0.5) * 100;
    
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      const x = branchX + (branchEndX - branchX) * t + (Math.random() - 0.5) * 15;
      const y = branchY + (branchEndY - branchY) * t + (Math.random() - 0.5) * 15;
      
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: 40 + Math.random() * 30,
        maxLife: 70,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 3 + 1
      });
    }
  }
  
  return particles;
};

// Shockwave effect for line clears
export const createShockwave = (centerX: number, centerY: number, gridSize: number): Particle[] => {
  const particles: Particle[] = [];
  const colors = ['#00ffff', '#ff00ff', '#ffff00'];
  
  // Create expanding ring effect
  for (let ring = 0; ring < 2; ring++) {
    const particleCount = 60 + ring * 20;
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const startRadius = ring * 20;
      
      particles.push({
        x: centerX + Math.cos(angle) * startRadius,
        y: centerY + Math.sin(angle) * startRadius,
        vx: Math.cos(angle) * (15 + ring * 5),
        vy: Math.sin(angle) * (15 + ring * 5),
        life: 120 + ring * 40,
        maxLife: 120 + ring * 40,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 4 + 2 + ring
      });
    }
  }
  
  return particles;
};
