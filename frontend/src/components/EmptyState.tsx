interface EmptyStateProps {
  icon: any;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      className="dashed-trace animate-fade-in"
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '64px 24px', textAlign: 'center',
      }}
    >
      <div style={{
        width: 56, height: 56, borderRadius: 12,
        background: 'rgba(247,97,30,0.07)',
        border: '1px solid rgba(247,97,30,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
      }}>
        <Icon size={24} style={{ color: 'var(--primary)', opacity: 0.7 }} strokeWidth={1.5} />
      </div>
      <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>{title}</h3>
      <p style={{ fontSize: 14, color: 'var(--slate)', maxWidth: 320, lineHeight: 1.6, marginBottom: 24 }}>
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
