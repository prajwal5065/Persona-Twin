interface ProgressRingProps {
  value: number;        // 0–100
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}

export default function ProgressRing({
  value,
  size = 52,
  strokeWidth = 4,
  color = '#F7611E',
  label,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--hairline)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      {label && (
        <span style={{ fontSize: '10px', color: 'var(--steel)', fontWeight: 500, lineHeight: 1 }}>
          {label}
        </span>
      )}
    </div>
  );
}
