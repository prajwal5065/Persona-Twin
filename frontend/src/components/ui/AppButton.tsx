import React, { CSSProperties } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

interface AppButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, { normal: CSSProperties; hover: CSSProperties }> = {
  primary: {
    normal: { background: 'var(--app-accent)', color: 'white', borderColor: 'var(--app-accent)' },
    hover:  { background: 'var(--app-accent-hover)', borderColor: 'var(--app-accent-hover)' },
  },
  secondary: {
    normal: { background: 'transparent', color: 'var(--app-text)', borderColor: 'var(--app-border2)' },
    hover:  { background: 'rgba(255,255,255,0.04)', borderColor: 'var(--app-border2)' },
  },
  ghost: {
    normal: { background: 'transparent', color: 'var(--app-muted)', borderColor: 'transparent' },
    hover:  { color: 'var(--app-text)', background: 'rgba(255,255,255,0.04)' },
  },
  danger: {
    normal: { background: 'transparent', color: 'var(--app-danger)', borderColor: 'rgba(239,68,68,0.3)' },
    hover:  { background: 'rgba(239,68,68,0.08)' },
  },
};

const sizeStyles: Record<Size, CSSProperties> = {
  sm: { fontSize: '13px', padding: '6px 12px', height: '32px' },
  md: { fontSize: '14px', padding: '8px 16px', height: '36px' },
};

export function AppButton({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth,
  disabled,
  style,
  ...rest
}: AppButtonProps) {
  const [hovered, setHovered] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);

  const base: CSSProperties = {
    fontFamily: 'inherit',
    fontWeight: 500,
    borderRadius: '6px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background 150ms ease, border-color 150ms ease, opacity 150ms ease, transform 150ms ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    border: '1px solid transparent',
    opacity: disabled ? 0.45 : 1,
    width: fullWidth ? '100%' : undefined,
    whiteSpace: 'nowrap',
    letterSpacing: '-0.01em',
    transform: disabled ? 'none' : pressed ? 'scale(0.97)' : hovered ? 'translateY(-1px)' : 'none',
    ...sizeStyles[size],
    ...variantStyles[variant].normal,
    ...(hovered && !disabled ? variantStyles[variant].hover : {}),
    ...style,
  };

  return (
    <button
      {...rest}
      disabled={disabled}
      style={base}
      onMouseEnter={(e) => { setHovered(true); rest.onMouseEnter?.(e); }}
      onMouseLeave={(e) => { setHovered(false); setPressed(false); rest.onMouseLeave?.(e); }}
      onMouseDown={(e) => { setPressed(true); rest.onMouseDown?.(e); }}
      onMouseUp={(e) => { setPressed(false); rest.onMouseUp?.(e); }}
    >
      {children}
    </button>
  );
}
