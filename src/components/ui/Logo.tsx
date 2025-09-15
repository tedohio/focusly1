import Image from 'next/image';

interface LogoProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export function Logo({ 
  src, 
  alt, 
  width = 48, 
  height = 48, 
  className = '' 
}: LogoProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={`object-contain ${className}`}
      priority
    />
  );
}
