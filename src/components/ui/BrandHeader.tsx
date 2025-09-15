import { Logo } from './Logo';

interface BrandHeaderProps {
  logo?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
  title?: string;
  subtitle?: string;
  layout?: 'logo-only' | 'logo-text' | 'logo-above-text';
  className?: string;
}

export function BrandHeader({
  logo,
  title = 'Focusly',
  subtitle = 'Cut the noise and execute on what matters',
  layout = 'logo-above-text',
  className = ''
}: BrandHeaderProps) {
  if (layout === 'logo-only' && logo) {
    return (
      <div className={`text-center space-y-4 ${className}`}>
        <div className="flex justify-center">
          <Logo
            src={logo.src}
            alt={logo.alt}
            width={logo.width || 64}
            height={logo.height || 64}
            className="drop-shadow-lg"
          />
        </div>
        {subtitle && (
          <p className="text-sm text-white/70">
            {subtitle}
          </p>
        )}
      </div>
    );
  }

  if (layout === 'logo-text' && logo) {
    return (
      <div className={`text-center space-y-2 ${className}`}>
        <div className="flex items-center justify-center space-x-3">
          <Logo
            src={logo.src}
            alt={logo.alt}
            width={logo.width || 40}
            height={logo.height || 40}
            className="drop-shadow-lg"
          />
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            {title}
          </h1>
        </div>
        {subtitle && (
          <p className="text-sm text-white/70">
            {subtitle}
          </p>
        )}
      </div>
    );
  }

  // Default: logo-above-text
  return (
    <div className={`text-center space-y-4 ${className}`}>
      {logo && (
        <div className="flex justify-center">
          <Logo
            src={logo.src}
            alt={logo.alt}
            width={logo.width || 56}
            height={logo.height || 56}
            className="drop-shadow-lg"
          />
        </div>
      )}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-white/70">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
