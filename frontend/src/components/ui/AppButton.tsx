import React, { CSSProperties } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'cream' | 'dark';
type Size = 'sm' | 'md';

interface AppButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, { normal: CSSProperties; hover: CSSProperties }> = {
  primary: {
    normal: { background: 'var(--primary)', color: 'white', borderColor: 'var(--primary)' },
    hover:  { background: 'var(--primary-deep)', borderColor: 'var(--primary-deep)' },
  },
  dark: {
    normal: { background: 'var(--ink)', color: 'white', borderColor: 'var(--ink)' },
    hover:  { background: 'var(--charcoal)' },
  },
  secondary: {
    normal: { background: 'transparent', color: 'var(--ink)', borderColor: 'var(--hairline-strong)' },
    hover:  { background: 'var(--surface)', borderColor: 'var(--beige-deep)' },
  },
  cream: {
    normal: { background: 'var(--cream)', color: 'var(--ink)', borderColor: 'var(--beige-deep)' },
    hover:  { background: 'var(--cream-deeper)' },
  },
  ghost: {
    normal: { background: 'transparent', color: 'var(--steel)', borderColor: 'transparent' },
    hover:  { color: 'var(--ink)', background: 'var(--surface)', borderColor: 'var(--hairline)' },
  },
  danger: {
    normal: { background: 'transparent', color: '#dc2626', borderColor: 'rgba(220,38,38,0.25)' },
    hover:  { background: 'rgba(220,38,38,0.07)' },
  },
};

const sizeStyles: Record<Size, CSSProperties> = {
  sm: { fontSize: '13px', padding: '6px 14px', height: '34px' },
  md: { fontSize: '14px', padding: '10px 20px', height: '40px' },
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
    fontFamily: 'Inter, sans-serif',
    fontWeight: 500,
    borderRadius: '8px',
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
    transform: disabled ? 'none' : pressed ? 'scale(0.97)' : 'none',
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
