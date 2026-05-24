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
  /** Use cream surface variant */
  cream?: boolean;
}

export function AppCard({
  children,
  padding = '24px',
  className = '',
  onClick,
  style,
  dashed,
  lift,
  cream,
}: AppCardProps) {
  const [hovered, setHovered] = useState(false);
  const interactive = !!(onClick || lift);

  const base: CSSProperties = {
    background: cream ? 'var(--cream)' : 'var(--canvas)',
    border: `1px ${dashed ? 'dashed' : 'solid'} ${
      cream
        ? 'var(--beige-deep)'
        : hovered && interactive
          ? 'var(--beige-deep)'
          : 'var(--hairline-soft)'
    }`,
    borderRadius: '12px',
    padding,
    cursor: onClick ? 'pointer' : undefined,
    transition: 'border-color 150ms ease, transform 150ms ease, box-shadow 150ms ease',
    transform: hovered && lift ? 'translateY(-1px)' : 'none',
    boxShadow: hovered && lift ? 'rgba(0,0,0,0.04) 0px 4px 12px 0px' : 'none',
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
