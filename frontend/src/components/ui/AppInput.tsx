import React, { CSSProperties, forwardRef } from 'react';

const baseStyle: CSSProperties = {
  width: '100%',
  background: 'var(--app-surface2)',
  border: '1px solid var(--app-border)',
  borderRadius: '6px',
  padding: '8px 12px',
  fontSize: '14px',
  fontFamily: 'inherit',
  color: 'var(--app-text)',
  transition: 'border-color 150ms ease',
  outline: 'none',
  boxSizing: 'border-box',
};

/* ── AppInput ── */
interface AppInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  iconLeft?: React.ReactNode;
  wrapperStyle?: CSSProperties;
}

export const AppInput = forwardRef<HTMLInputElement, AppInputProps>(
  ({ iconLeft, style, wrapperStyle, ...rest }, ref) => {
    const [focused, setFocused] = React.useState(false);

    const inputStyle: CSSProperties = {
      ...baseStyle,
      paddingLeft: iconLeft ? '36px' : '12px',
      borderColor: focused ? 'var(--app-accent)' : 'var(--app-border)',
      ...style,
    };

    if (iconLeft) {
      return (
        <div style={{ position: 'relative', ...wrapperStyle }}>
          <span style={{
            position: 'absolute', left: '12px', top: '50%',
            transform: 'translateY(-50%)', color: 'var(--app-faint)',
            display: 'flex', alignItems: 'center', pointerEvents: 'none',
          }}>
            {iconLeft}
          </span>
          <input
            ref={ref}
            style={inputStyle}
            onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
            onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
            {...rest}
          />
        </div>
      );
    }

    return (
      <input
        ref={ref}
        style={inputStyle}
        onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
        {...rest}
      />
    );
  }
);
AppInput.displayName = 'AppInput';

/* ── AppTextarea ── */
interface AppTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoResize?: boolean;
}

export const AppTextarea = forwardRef<HTMLTextAreaElement, AppTextareaProps>(
  ({ style, autoResize, ...rest }, ref) => {
    const [focused, setFocused] = React.useState(false);

    const textareaStyle: CSSProperties = {
      ...baseStyle,
      minHeight: '80px',
      resize: autoResize ? 'none' : 'vertical',
      overflowY: autoResize ? 'hidden' : 'auto',
      borderColor: focused ? 'var(--app-accent)' : 'var(--app-border)',
      lineHeight: '1.55',
      ...style,
    };

    const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
      if (autoResize) {
        const el = e.currentTarget;
        el.style.height = 'auto';
        el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
      }
      rest.onInput?.(e);
    };

    return (
      <textarea
        ref={ref}
        style={textareaStyle}
        onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
        onInput={handleInput}
        {...rest}
      />
    );
  }
);
AppTextarea.displayName = 'AppTextarea';
