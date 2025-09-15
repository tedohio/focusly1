import { render, screen } from '@testing-library/react';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { FloatingOrbs } from '@/components/ui/FloatingOrbs';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock the hook
jest.mock('@/hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: jest.fn(),
}));

describe('Login Components', () => {
  beforeEach(() => {
    (usePrefersReducedMotion as jest.Mock).mockReturnValue(false);
  });

  describe('AuroraBackground', () => {
    it('renders with default intensity', () => {
      render(<AuroraBackground />);
      const container = document.querySelector('.absolute.inset-0.overflow-hidden');
      expect(container).toBeInTheDocument();
    });

    it('renders with custom intensity', () => {
      render(<AuroraBackground intensity="bold" />);
      const container = document.querySelector('.absolute.inset-0.overflow-hidden');
      expect(container).toBeInTheDocument();
    });

    it('disables animations when prefers reduced motion', () => {
      (usePrefersReducedMotion as jest.Mock).mockReturnValue(true);
      render(<AuroraBackground />);
      const container = document.querySelector('.absolute.inset-0.overflow-hidden');
      expect(container).toBeInTheDocument();
    });
  });

  describe('FloatingOrbs', () => {
    it('renders orbs when enabled and motion is allowed', () => {
      render(<FloatingOrbs enabled={true} />);
      const container = document.querySelector('.absolute.inset-0.pointer-events-none');
      expect(container).toBeInTheDocument();
    });

    it('does not render orbs when disabled', () => {
      render(<FloatingOrbs enabled={false} />);
      const container = document.querySelector('.absolute.inset-0.pointer-events-none');
      expect(container).not.toBeInTheDocument();
    });

    it('does not render orbs when prefers reduced motion', () => {
      (usePrefersReducedMotion as jest.Mock).mockReturnValue(true);
      render(<FloatingOrbs enabled={true} />);
      const container = document.querySelector('.absolute.inset-0.pointer-events-none');
      expect(container).not.toBeInTheDocument();
    });
  });
});
