import { useState } from 'react'
import Header from './components/Header'
import Login from './components/Login'
import Sidebar, { saveTemplateToServer } from './components/Sidebar'
import ExcelUpload from './components/ExcelUpload'
import SubjectInput from './components/SubjectInput'
import TemplateEditor from './components/TemplateEditor'
import AttachmentUpload from './components/AttachmentUpload'
import SendSection from './components/SendSection'
import { getToken } from './api'

export default function App() {
  const [token, setToken] = useState(getToken)
  const [emails, setEmails] = useState([])
  const [subject, setSubject] = useState('Welcome to Digicoders!')
  const [htmlBody, setHtmlBody] = useState('')
  const [attachments, setAttachments] = useState([])
  const [externalLoad, setExternalLoad] = useState(null)

  // Expose attachments globally for sidebar resave
  window.__getCurrentAttachments = () => attachments
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSaveTemplate() {
    if (!templateName.trim()) return
    setSaving(true)
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
    await saveTemplateToServer(templateName.trim(), innerHtml, fullHtml, attachments)
    window.__refreshSidebar?.()
    setSaving(false)
    setTemplateName('')
    setShowSaveModal(false)
  }

  if (!token) return <Login onLogin={setToken} />

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Header onLogout={() => { localStorage.removeItem('bm_token'); setToken(null) }} />

      <div style={{ display: 'flex' }}>
        {/* Sidebar */}
        <Sidebar
          onLoad={data => {
            if (typeof data === 'string') {
              setExternalLoad(data)
            } else {
              setExternalLoad(data.innerHtml)
              setHtmlBody(data.fullHtml)
              // Restore attachments from base64
              if (data.attachments?.length) {
                const files = data.attachments.map(a => {
                  const arr = a.data.split(',')
                  const mime = arr[0].match(/:(.*?);/)[1]
                  const bstr = atob(arr[1])
                  const u8arr = new Uint8Array(bstr.length)
                  for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i)
                  return new File([u8arr], a.name, { type: mime })
                })
                setAttachments(files)
              } else {
                setAttachments([])
              }
            }
          }}
          onSaveRequest={() => setShowSaveModal(true)}
        />

        {/* Main Content */}
        <main style={{ flex: 1, minWidth: 0, padding: '36px 32px 80px', overflowY: 'auto' }}>
          <div style={{ maxWidth: 820, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ marginBottom: 4 }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                New Email Campaign
              </h2>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Upload recipients, compose your message, and send in bulk
              </p>
            </div>

            <ExcelUpload onParsed={setEmails} />
            <SubjectInput value={subject} onChange={setSubject} />
            <TemplateEditor onChange={setHtmlBody} externalLoad={externalLoad} />
            <AttachmentUpload attachments={attachments} onChange={setAttachments} />
            <SendSection emails={emails} subject={subject} htmlBody={htmlBody} attachments={attachments} />
          </div>
        </main>
      </div>

      {/* Save Template Modal */}
      {showSaveModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }} onClick={() => setShowSaveModal(false)}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 16, padding: 28, width: 400, maxWidth: '90vw',
            animation: 'fadeIn 0.2s ease'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>Save Template</h3>
              <button onClick={() => setShowSaveModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.3rem', lineHeight: 1 }}>×</button>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 14 }}>
              Give your template a name to save it in the sidebar for future use.
            </p>
            <input
              autoFocus
              type="text"
              placeholder="e.g. Welcome Email, Newsletter..."
              value={templateName}
              onChange={e => setTemplateName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSaveTemplate()}
              style={{
                width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 9, padding: '11px 14px', color: 'var(--text-primary)',
                fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', marginBottom: 14,
                boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = '#4f6ef7'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowSaveModal(false)} style={{
                flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', borderRadius: 9, padding: '10px',
                fontSize: '0.88rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit'
              }}>Cancel</button>
              <button onClick={handleSaveTemplate} disabled={saving} style={{
                flex: 2, background: saving ? 'var(--bg-elevated)' : 'linear-gradient(135deg,#4f6ef7,#7c3aed)',
                color: '#fff', border: 'none', borderRadius: 9, padding: '10px',
                fontSize: '0.88rem', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(79,110,247,0.3)'
              }}>{saving ? 'Saving...' : 'Save Template'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
