import { useState, useEffect } from 'react'
import { LayoutTemplate, Trash2, FileText, Save, Loader, RefreshCw } from 'lucide-react'
import { apiFetch, API } from '../api'

export async function saveTemplateToServer(name, innerHtml, fullHtml, attachments = []) {
  const attachmentData = await Promise.all(
    attachments.map(file => new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = e => resolve({ name: file.name, size: file.size, type: file.type, data: e.target.result })
      reader.readAsDataURL(file)
    }))
  )
  await apiFetch('/templates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, innerHtml, fullHtml, attachments: attachmentData })
  })
}

export default function Sidebar({ onLoad, onSaveRequest }) {
  const [templates, setTemplates] = useState({})
  const [active, setActive] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchTemplates() {
    try {
      const res = await apiFetch('/templates')
      const data = await res.json()
      setTemplates(data)
      return data
    } catch { setTemplates({}) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchTemplates() }, [])

  // Expose refresh globally
  window.__refreshSidebar = fetchTemplates

  async function handleDelete(e, name) {
    e.stopPropagation()
    await apiFetch(`/templates/${encodeURIComponent(name)}`, { method: 'DELETE' })
    if (active === name) setActive(null)
    fetchTemplates()
  }

  function handleLoad(name) {
    setActive(name)
    onLoad(templates[name])
  }

  async function handleResave(e, name) {
    e.stopPropagation()
    const innerHtml = window.__getEditorHTML?.() || ''
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f4f4f4;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:4px;">
      <tr><td style="padding:40px 48px 32px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#1f2937;">
        ${innerHtml}
      </td></tr>
      <tr><td style="padding:20px 48px 28px;border-top:1px solid #f3f4f6;">
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#9ca3af;line-height:1.6;">
          This email was sent by Digicoders &middot; <a href="https://digicoders.in" style="color:#6b7280;text-decoration:none;">digicoders.in</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`
    const currentAttachments = window.__getCurrentAttachments?.() || []
    await saveTemplateToServer(name, innerHtml, fullHtml, currentAttachments)
    fetchTemplates()
  }

  const names = Object.keys(templates)

  return (
    <aside style={{
      width: 260, flexShrink: 0,
      background: 'var(--bg-card)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      height: 'calc(100vh - 64px)',
      position: 'sticky', top: 64, overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{
        padding: '18px 20px 14px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LayoutTemplate size={15} color="#4f6ef7" />
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Templates
          </span>
        </div>
        <button onClick={onSaveRequest} style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: 'rgba(79,110,247,0.1)', border: '1px solid rgba(79,110,247,0.2)',
          color: '#4f6ef7', borderRadius: 7, padding: '5px 10px',
          fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(79,110,247,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(79,110,247,0.1)'}
        >
          <Save size={12} /> Save
        </button>
      </div>

      {/* List */}
      <div style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
            <Loader size={18} color="#4b6080" style={{ animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : names.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(79,110,247,0.08)', border: '1px solid rgba(79,110,247,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px'
            }}>
              <FileText size={18} color="#4b6080" />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              No saved templates yet.<br />
              <span style={{ color: '#4f6ef7' }}>Save your first template</span> using the button above.
            </p>
          </div>
        ) : names.map(name => (
          <div key={name} onClick={() => handleLoad(name)} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
            background: active === name ? 'rgba(79,110,247,0.1)' : 'transparent',
            border: `1px solid ${active === name ? 'rgba(79,110,247,0.25)' : 'transparent'}`,
            transition: 'all 0.15s'
          }}
            onMouseEnter={e => { if (active !== name) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
            onMouseLeave={e => { if (active !== name) e.currentTarget.style.background = 'transparent' }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: active === name ? 'rgba(79,110,247,0.15)' : 'var(--bg-surface)',
              border: `1px solid ${active === name ? 'rgba(79,110,247,0.3)' : 'var(--border)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <FileText size={14} color={active === name ? '#4f6ef7' : '#4b6080'} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: '0.84rem', fontWeight: 500,
                color: active === name ? '#a5b4fc' : 'var(--text-primary)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>{name}</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 1 }}>
                {templates[name].savedAt || 'Saved'}
              </p>
            </div>
            <button onClick={e => handleResave(e, name)} title="Resave with current content" style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', padding: 4, borderRadius: 5,
                display: 'flex', flexShrink: 0, transition: 'all 0.15s'
              }}
                onMouseEnter={e => { e.currentTarget.style.color = '#10b981'; e.currentTarget.style.background = 'rgba(16,185,129,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none' }}
              >
                <RefreshCw size={13} />
              </button>
            <button onClick={e => handleDelete(e, name)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', padding: 4, borderRadius: 5,
              display: 'flex', flexShrink: 0, transition: 'all 0.15s'
            }}
              onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none' }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          {names.length} template{names.length !== 1 ? 's' : ''} saved on server
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </aside>
  )
}
