'use client';

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface AuroraBackgroundProps {
  intensity?: 'subtle' | 'default' | 'bold';
  className?: string;
}

export function AuroraBackground({ 
  intensity = 'default', 
  className = '' 
}: AuroraBackgroundProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const intensityClasses = {
    subtle: {
      left: 'from-blue-500/20 via-purple-500/15 to-pink-500/20',
      right: 'from-emerald-500/20 via-cyan-500/15 to-blue-500/20',
      animation: 'aurora-drift-subtle',
    },
    default: {
      left: 'from-blue-500/30 via-purple-500/25 to-pink-500/30',
      right: 'from-emerald-500/30 via-cyan-500/25 to-blue-500/30',
      animation: 'aurora-drift-default',
    },
    bold: {
      left: 'from-blue-500/40 via-purple-500/35 to-pink-500/40',
      right: 'from-emerald-500/40 via-cyan-500/35 to-blue-500/40',
      animation: 'aurora-drift-bold',
    },
  };

  const currentIntensity = intensityClasses[intensity];

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Left Aurora Panel */}
      <div 
        className={`absolute -top-1/2 -left-1/2 w-full h-[200%] bg-gradient-radial ${currentIntensity.left} ${
          prefersReducedMotion ? '' : currentIntensity.animation
        }`}
        style={{
          transform: 'rotate(-15deg)',
          filter: 'blur(60px)',
        }}
      />
      
      {/* Right Aurora Panel */}
      <div 
        className={`absolute -top-1/2 -right-1/2 w-full h-[200%] bg-gradient-radial ${currentIntensity.right} ${
          prefersReducedMotion ? '' : currentIntensity.animation
        }`}
        style={{
          transform: 'rotate(15deg)',
          filter: 'blur(60px)',
        }}
      />
      
      {/* Grain Overlay */}
      <div className="absolute inset-0 noise-overlay opacity-[0.03]" />
      
      {/* Subtle backdrop blur for depth */}
      <div className="absolute inset-0 backdrop-blur-[1px]" />
    </div>
  );
}
