import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  speed: number;
  size: number;
  alpha: number;
  stuck: boolean;
  finalY: number;
}

const ParticleAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const yearRef = useRef(1950);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const createParticle = (): Particle => ({
      x: Math.random() * canvas.width,
      y: canvas.height + 10,
      speed: 1 + Math.random() * 2,
      size: 1.5 + Math.random() * 2, // Slightly smaller particles to allow for more density
      alpha: 0.1 + Math.random() * 0.4,
      stuck: false,
      finalY: 20 + Math.random() * 300 // Increased range for more vertical spread
    });

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Calculate years passed since 1950
      const yearsPassed = yearRef.current - 1950;
      
      // Exponential growth formula for particle count
      // Base particles + exponential growth factor
      const baseParticles = Math.floor(yearsPassed * 2);
      const exponentialFactor = Math.pow(1.1, yearsPassed / 5);
      const targetParticleCount = Math.floor(baseParticles * exponentialFactor);

      // Add new particles gradually
      if (particles.current.length < targetParticleCount) {
        // Add multiple particles per frame as time progresses
        const particlesToAdd = Math.min(
          5 + Math.floor(yearsPassed / 10),
          targetParticleCount - particles.current.length
        );
        
        for (let i = 0; i < particlesToAdd; i++) {
          particles.current.push(createParticle());
        }
      }

      particles.current.forEach((particle) => {
        if (!particle.stuck) {
          particle.y -= particle.speed;
          
          // Check if particle should stick at the top
          if (particle.y <= particle.finalY) {
            particle.stuck = true;
            particle.y = particle.finalY;
          }
        }
        
        // Draw particle with a blue glow effect
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(64, 156, 255, ${particle.alpha})`; // Blue color
        ctx.fill();

        // Add blue glow effect
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(64, 156, 255, ${particle.alpha * 0.3})`;
        ctx.fill();
      });

      // Increment year more slowly
      if (yearRef.current < 2024) {
        yearRef.current += 0.03; // Slowed down further to allow more accumulation
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full" />;
};

export default ParticleAnimation;