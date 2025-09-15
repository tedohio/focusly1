'use client';

import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface FloatingOrbsProps {
  enabled?: boolean;
  className?: string;
}

export function FloatingOrbs({ enabled = true, className = '' }: FloatingOrbsProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  // Don't render orbs if motion is disabled or component is disabled
  if (!enabled || prefersReducedMotion) {
    return null;
  }

  // Generate deterministic but varied orb properties
  const orbs = Array.from({ length: 6 }, (_, i) => {
    const seed = i * 0.618; // Golden ratio for natural distribution
    return {
      id: i,
      size: 120 + (Math.sin(seed) * 140), // 120-260px range
      x: 20 + (Math.cos(seed * 2) * 60), // 20-80% horizontal position
      y: 10 + (Math.sin(seed * 3) * 80), // 10-90% vertical position
      duration: 20 + (Math.sin(seed * 4) * 15), // 20-35s duration
      delay: Math.sin(seed * 5) * 5, // 0-5s delay
      opacity: 0.25 + (Math.sin(seed * 6) * 0.15), // 0.25-0.4 opacity
    };
  });

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className="absolute rounded-full mix-blend-screen"
          style={{
            width: orb.size,
            height: orb.size,
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            background: `radial-gradient(circle, rgba(255,255,255,${orb.opacity}) 0%, transparent 70%)`,
            filter: 'blur(1px)',
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 360],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
