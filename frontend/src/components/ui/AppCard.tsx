import React, { CSSProperties, useState } from 'react';

interface AppCardProps {
  children: React.ReactNode;
  padding?: string;
  className?: string;
  onClick?: () => void;
  style?: CSSProperties;
  dashed?: boolean;
  /** Lift on hover — adds translateY(-1px) */
  lift?: boolean;
}

export function AppCard({
  children,
  padding = '24px',
  className = '',
  onClick,
  style,
  dashed,
  lift,
}: AppCardProps) {
  const [hovered, setHovered] = useState(false);
  const interactive = !!(onClick || lift);

  const base: CSSProperties = {
    background: 'var(--app-surface)',
    border: `1px ${dashed ? 'dashed' : 'solid'} ${hovered && interactive ? 'var(--app-border2)' : 'var(--app-border)'}`,
    borderRadius: '10px',
    padding,
    cursor: onClick ? 'pointer' : undefined,
    transition: 'border-color 150ms ease, transform 150ms ease, background 150ms ease',
    transform: hovered && lift ? 'translateY(-1px)' : 'none',
    ...style,
  };

  return (
    <div
      style={base}
      className={className}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </div>
  );
}
