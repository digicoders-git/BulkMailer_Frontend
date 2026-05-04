export default function Card({ title, step, icon: Icon, children, style = {} }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--border)',
      overflow: 'hidden',
      transition: 'border-color 0.2s',
      ...style
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <div style={{
        padding: '18px 28px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'linear-gradient(90deg, rgba(79,110,247,0.04) 0%, transparent 100%)'
      }}>
        {step && (
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, #4f6ef7, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 700, color: '#fff', flexShrink: 0
          }}>{step}</div>
        )}
        {Icon && !step && (
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'rgba(79,110,247,0.12)', border: '1px solid rgba(79,110,247,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <Icon size={14} color="#4f6ef7" />
          </div>
        )}
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {title}
        </span>
      </div>
      <div style={{ padding: 28 }}>
        {children}
      </div>
    </div>
  )
}
