import { Mail, Zap, LogOut, Settings } from 'lucide-react'

export default function Header({ onLogout, page, onPageChange }) {
  return (
    <header style={{
      background: 'linear-gradient(135deg, #0d1526 0%, #111827 100%)',
      borderBottom: '1px solid #1e2d45',
      padding: '0 40px',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: 'linear-gradient(135deg, #4f6ef7, #7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 16px rgba(79,110,247,0.4)'
        }}>
          <Mail size={18} color="#fff" strokeWidth={2} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#f1f5f9', letterSpacing: '-0.01em' }}>
            BulkMailer
          </div>
          <div style={{ fontSize: '0.72rem', color: '#4b6080', letterSpacing: '0.02em' }}>
            noreply@digicoders.in
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => onPageChange(page === 'settings' ? 'campaign' : 'settings')} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: page === 'settings' ? 'rgba(79,110,247,0.15)' : 'rgba(79,110,247,0.08)',
          border: `1px solid ${page === 'settings' ? '#4f6ef7' : '#1e2d45'}`,
          borderRadius: 20, padding: '5px 12px', cursor: 'pointer'
        }}>
          <Settings size={12} color="#4f6ef7" />
          <span style={{ fontSize: '0.75rem', color: '#4f6ef7', fontWeight: 500 }}>
            {page === 'settings' ? 'Campaign' : 'Settings'}
          </span>
        </button>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
          borderRadius: 20, padding: '5px 12px'
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 6px #10b981' }} />
          <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 500 }}>SMTP Connected</span>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(79,110,247,0.08)', border: '1px solid #1e2d45',
          borderRadius: 20, padding: '5px 12px'
        }}>
          <Zap size={12} color="#4f6ef7" />
          <span style={{ fontSize: '0.75rem', color: '#4f6ef7', fontWeight: 500 }}>Digicoders</span>
        </div>
        <button onClick={onLogout} title="Logout" style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 20, padding: '5px 12px', cursor: 'pointer'
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
        >
          <LogOut size={12} color="#ef4444" />
          <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 500 }}>Logout</span>
        </button>
      </div>
    </header>
  )
}
