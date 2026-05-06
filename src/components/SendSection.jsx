import { useState } from 'react'
import { Send, CheckCircle, XCircle, AlertTriangle, Loader, Paperclip } from 'lucide-react'
import Card from './Card'
import { apiFetch } from '../api'

export default function SendSection({ emails, subject, htmlBody, attachments, onSaveRequest }) {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)

  async function sendEmails() {
    if (!emails.length) return alert('Please upload an Excel file first!')
    if (!subject.trim()) return alert('Please enter a subject!')
    if (!htmlBody.trim()) return alert('Please write an email template!')

    setLoading(true); setProgress(0); setResult(null)
    const interval = setInterval(() => setProgress(p => Math.min(p + Math.random() * 7, 88)), 350)

    try {
      const formData = new FormData()
      formData.append('emails', JSON.stringify(emails))
      formData.append('subject', subject)
      formData.append('htmlBody', htmlBody)
      attachments.forEach(file => formData.append('attachments', file))

      const res = await apiFetch('/send-emails', { method: 'POST', body: formData })
      const data = await res.json()
      clearInterval(interval)
      setProgress(100)
      // Ensure sent/failed are numbers
      data.sent = data.sent ?? 0
      data.failed = data.failed ?? 0
      data.errors = data.errors ?? []
      setTimeout(() => { setResult(data); setLoading(false) }, 400)
    } catch (e) {
      clearInterval(interval)
      alert('Send failed: ' + e.message)
      setLoading(false)
    }
  }

  const successRate = result ? Math.round((result.sent / emails.length) * 100) : 0

  return (
    <Card title="Send Campaign" step="6">
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* Summary */}
        <div style={{
          flex: 1, minWidth: 220,
          background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)', padding: '16px 20px'
        }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Campaign Summary</p>
          {[
            ['Recipients', emails.length || '—'],
            ['Subject', subject || '—'],
            ['Attachments', attachments.length ? `${attachments.length} file(s)` : 'None'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{k}</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 500, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minWidth: 220 }}>
          {/* Send */}
          <button
            onClick={sendEmails}
            disabled={loading || !emails.length}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              background: loading || !emails.length ? 'var(--bg-elevated)' : 'linear-gradient(135deg, #4f6ef7 0%, #7c3aed 100%)',
              color: loading || !emails.length ? 'var(--text-muted)' : '#fff',
              border: `1px solid ${loading || !emails.length ? 'var(--border)' : 'transparent'}`,
              padding: '13px 28px', borderRadius: 'var(--radius-md)',
              fontSize: '0.92rem', fontWeight: 600, cursor: loading || !emails.length ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', transition: 'all 0.2s',
              boxShadow: loading || !emails.length ? 'none' : '0 4px 20px rgba(79,110,247,0.35)',
            }}
            onMouseEnter={e => { if (!loading && emails.length) e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
          >
            {loading
              ? <><Loader size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Sending {emails.length} emails...</>
              : <><Send size={16} /> Send to {emails.length || 0} Recipients</>
            }
          </button>

          {/* Save Only */}
          <button
            onClick={() => onSaveRequest?.()}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              background: 'var(--bg-surface)', color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
              padding: '13px 28px', borderRadius: 'var(--radius-md)',
              fontSize: '0.92rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.borderColor = '#4f6ef7' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
          >
            Save Only
          </button>

          {/* Send and Save */}
          <button
            onClick={async () => { await sendEmails(); onSaveRequest?.() }}
            disabled={loading || !emails.length}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              background: loading || !emails.length ? 'var(--bg-elevated)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: loading || !emails.length ? 'var(--text-muted)' : '#fff',
              border: `1px solid ${loading || !emails.length ? 'var(--border)' : 'transparent'}`,
              padding: '13px 28px', borderRadius: 'var(--radius-md)',
              fontSize: '0.92rem', fontWeight: 600, cursor: loading || !emails.length ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', transition: 'all 0.2s',
              boxShadow: loading || !emails.length ? 'none' : '0 4px 20px rgba(16,185,129,0.3)',
            }}
            onMouseEnter={e => { if (!loading && emails.length) e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <Send size={16} /> Send and Save
          </button>

          {loading && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sending emails...</span>
                <span style={{ fontSize: '0.75rem', color: '#4f6ef7', fontWeight: 600 }}>{Math.round(progress)}%</span>
              </div>
              <div style={{ background: 'var(--bg-surface)', borderRadius: 99, height: 6, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <div style={{
                  height: '100%', borderRadius: 99, width: `${progress}%`,
                  background: 'linear-gradient(90deg, #4f6ef7, #7c3aed)',
                  transition: 'width 0.4s ease',
                  boxShadow: '0 0 8px rgba(79,110,247,0.5)'
                }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {result && (
        <div style={{ marginTop: 24, animation: 'fadeIn 0.4s ease' }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            {[
              { label: 'Sent', value: result.sent, color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', icon: CheckCircle },
              { label: 'Failed', value: result.failed, color: result.failed > 0 ? '#ef4444' : 'var(--text-muted)', bg: result.failed > 0 ? 'rgba(239,68,68,0.08)' : 'var(--bg-surface)', border: result.failed > 0 ? 'rgba(239,68,68,0.2)' : 'var(--border)', icon: XCircle },
              { label: 'Success Rate', value: `${successRate}%`, color: successRate === 100 ? '#10b981' : '#f59e0b', bg: 'rgba(79,110,247,0.06)', border: 'rgba(79,110,247,0.15)', icon: AlertTriangle },
            ].map(({ label, value, color, bg, border, icon: Icon }) => (
              <div key={label} style={{
                flex: 1, minWidth: 100, background: bg, border: `1px solid ${border}`,
                borderRadius: 'var(--radius-md)', padding: '14px 18px',
                display: 'flex', alignItems: 'center', gap: 12
              }}>
                <Icon size={20} color={color} />
                <div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3 }}>{label}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            background: result.failed === 0 ? 'rgba(16,185,129,0.06)' : 'rgba(245,158,11,0.06)',
            border: `1px solid ${result.failed === 0 ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
            borderRadius: 'var(--radius-md)', padding: '14px 18px',
            display: 'flex', alignItems: 'center', gap: 10
          }}>
            {result.failed === 0
              ? <CheckCircle size={18} color="#10b981" />
              : <AlertTriangle size={18} color="#f59e0b" />
            }
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              {result.failed === 0
                ? `All ${result.sent} emails delivered successfully.`
                : `${result.sent} delivered, ${result.failed} failed. Check errors below.`
              }
            </p>
          </div>

          {result.errors?.length > 0 && (
            <div style={{ marginTop: 12, background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Failed Deliveries
              </div>
              <div style={{ maxHeight: 140, overflowY: 'auto' }}>
                {result.errors.map((e, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', borderBottom: i < result.errors.length - 1 ? '1px solid var(--border)' : 'none', fontSize: '0.82rem' }}>
                    <XCircle size={14} color="#ef4444" style={{ flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-secondary)', flex: '0 0 180px' }}>{e.email}</span>
                    <span style={{ color: '#fca5a5' }}>{e.error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
