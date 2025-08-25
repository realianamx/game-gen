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
  const colors = ['#ff0080', '#00ffff', '#ffff00', '#ff6600', '#8a2be2'];
  
  // Create ring of blast particles
  for (let i = 0; i < 50; i++) {
    const angle = (i / 50) * Math.PI * 2;
    const distance = 20 + Math.random() * 40;
    particles.push({
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance,
      vx: Math.cos(angle) * (8 + Math.random() * 6),
      vy: Math.sin(angle) * (8 + Math.random() * 6),
      life: 150,
      maxLife: 150,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 10 + 6
    });
  }
  
  return particles;
};

// Lightning effect for super combos
export const createLightning = (startX: number, startY: number, endX: number, endY: number): Particle[] => {
  const particles: Particle[] = [];
  const segments = 10;
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = startX + (endX - startX) * t + (Math.random() - 0.5) * 20;
    const y = startY + (endY - startY) * t + (Math.random() - 0.5) * 20;
    
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      life: 30 + Math.random() * 20,
      maxLife: 50,
      color: '#ffffff',
      size: Math.random() * 3 + 1
    });
  }
  
  return particles;
};
