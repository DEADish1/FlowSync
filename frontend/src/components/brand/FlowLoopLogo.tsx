'use client';

interface FlowLoopLogoProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

export function FlowLoopLogo({ size = 40, className = '', animate = true }: FlowLoopLogoProps) {
  const animationClass = animate ? 'animate-flow-loop' : '';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${animationClass} ${className}`}
      style={{ transformOrigin: 'center' }}
    >
      {/* Gradient Definition */}
      <defs>
        <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#2E7CFF', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#A16CFF', stopOpacity: 1 }} />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* The Flow Loop - smooth, asymmetric circle */}
      <path
        d="M 50 10
           C 70 10, 85 20, 90 40
           C 95 60, 88 75, 70 85
           C 52 95, 35 92, 20 80
           C 5 68, 8 50, 15 35
           C 22 20, 35 10, 50 10 Z"
        fill="url(#flowGradient)"
        filter="url(#glow)"
        opacity="0.9"
      />

      {/* Inner flow accent */}
      <path
        d="M 50 25
           C 62 25, 70 30, 73 42
           C 76 54, 72 62, 62 68
           C 52 74, 42 72, 35 65
           C 28 58, 30 48, 34 39
           C 38 30, 44 25, 50 25 Z"
        fill="none"
        stroke="#EAF2FF"
        strokeWidth="2"
        opacity="0.4"
      />
    </svg>
  );
}

export function FlowSyncWordmark({ className = '', size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <FlowLoopLogo size={size === 'sm' ? 32 : size === 'md' ? 40 : 56} />
      <div className="flex flex-col">
        <span className={`${sizeClasses[size]} font-bold tracking-tight text-gradient`}>
          FlowSync
        </span>
        {size !== 'sm' && (
          <span className="text-xs text-muted-foreground tracking-wide">
            Your rhythm. Your day. In sync.
          </span>
        )}
      </div>
    </div>
  );
}
