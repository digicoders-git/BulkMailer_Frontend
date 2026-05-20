import { useState, useEffect } from 'react'
import { Settings, Server, User, Lock, Wifi, CheckCircle, AlertCircle, Save, Eye, EyeOff, Info } from 'lucide-react'
import Card from './Card'
import { apiFetch } from '../api'

const PRESETS = [
  { label: 'Gmail', host: 'smtp.gmail.com', port: 587, secure: false },
  { label: 'Gmail SSL', host: 'smtp.gmail.com', port: 465, secure: true },
  { label: 'Outlook', host: 'smtp.office365.com', port: 587, secure: false },
  { label: 'Yahoo', host: 'smtp.mail.yahoo.com', port: 587, secure: false },
  { label: 'Custom', host: '', port: 587, secure: false },
]

export default function SettingsPage() {
  const [cfg, setCfg] = useState({ host: '', port: 587, secure: false, user: '', pass: '', fromName: '' })
  const [showPass, setShowPass] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null)  // {type:'success'|'error', msg}
  const [testStatus, setTestStatus] = useState(null)

  useEffect(() => {
    apiFetch('/smtp-config').then(r => r.json()).then(data => {
      setCfg({ host: data.host, port: data.port, secure: data.secure, user: data.user, pass: '', fromName: data.fromName || '' })
    }).catch(() => {})
  }, [])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true); setSaveStatus(null)
    try {
      const res = await apiFetch('/smtp-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cfg)
      })
      const data = await res.json()
      if (!res.ok) { setSaveStatus({ type: 'error', msg: data.error }); return }
      setSaveStatus({ type: 'success', msg: 'SMTP configuration saved successfully!' })
    } catch { setSaveStatus({ type: 'error', msg: 'Network error' }) }
    finally { setSaving(false) }
  }

  async function handleTest() {
    setTesting(true); setTestStatus(null)
    try {
      const res = await apiFetch('/smtp-test', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setTestStatus({ type: 'error', msg: data.error }); return }
      setTestStatus({ type: 'success', msg: data.message })
    } catch { setTestStatus({ type: 'error', msg: 'Network error' }) }
    finally { setTesting(false) }
  }

  function applyPreset(preset) {
    if (preset.host) setCfg(p => ({ ...p, host: preset.host, port: preset.port, secure: preset.secure }))
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '36px 24px 80px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          SMTP Configuration
        </h2>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: 4 }}>
          Configure your email server settings for sending bulk emails
        </p>
      </div>

      {/* Presets */}
      <Card title="Quick Presets" icon={Server}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PRESETS.map(p => (
            <button key={p.label} onClick={() => applyPreset(p)} style={{
              padding: '7px 16px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
              fontSize: '0.82rem', fontWeight: 500, transition: 'all 0.15s',
              background: cfg.host === p.host && p.host ? 'rgba(79,110,247,0.15)' : 'var(--bg-surface)',
              border: `1px solid ${cfg.host === p.host && p.host ? '#4f6ef7' : 'var(--border)'}`,
              color: cfg.host === p.host && p.host ? '#4f6ef7' : 'var(--text-secondary)',
            }}>{p.label}</button>
          ))}
        </div>
        <div style={{
          marginTop: 14, padding: '10px 14px', borderRadius: 8,
          background: 'rgba(79,110,247,0.06)', border: '1px solid rgba(79,110,247,0.15)',
          display: 'flex', gap: 8, alignItems: 'flex-start'
        }}>
          <Info size={14} color="#4f6ef7" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
            For Gmail, use an <strong style={{ color: 'var(--text-secondary)' }}>App Password</strong> — not your regular password.
            Go to Google Account → Security → 2-Step Verification → App Passwords.
          </p>
        </div>
      </Card>

      {/* Config Form */}
      <Card title="SMTP Settings" icon={Settings}>
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

            {/* Sender Name */}
            <div style={{ gridColumn: '1 / -1' }}>
              <Label>Sender Name</Label>
              <InputWrap icon={<User size={14} color="#4b6080" />}>
                <input type="text" value={cfg.fromName} onChange={e => setCfg(p => ({ ...p, fromName: e.target.value }))}
                  placeholder="Himanshu Kashyap" style={iStyle} />
              </InputWrap>
            </div>

            {/* Host */}
            <div style={{ gridColumn: '1 / -1' }}>
              <Label>SMTP Host</Label>
              <InputWrap icon={<Server size={14} color="#4b6080" />}>
                <input type="text" value={cfg.host} onChange={e => setCfg(p => ({ ...p, host: e.target.value }))}
                  placeholder="smtp.gmail.com" required style={iStyle} />
              </InputWrap>
            </div>

            {/* Port */}
            <div>
              <Label>Port</Label>
              <InputWrap icon={<Wifi size={14} color="#4b6080" />}>
                <input type="number" value={cfg.port} onChange={e => setCfg(p => ({ ...p, port: e.target.value }))}
                  placeholder="587" required style={iStyle} />
              </InputWrap>
            </div>

            {/* Secure */}
            <div>
              <Label>Security</Label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ label: 'TLS (587)', val: false }, { label: 'SSL (465)', val: true }].map(opt => (
                  <button type="button" key={opt.label} onClick={() => setCfg(p => ({ ...p, secure: opt.val }))} style={{
                    flex: 1, padding: '10px 8px', borderRadius: 8, cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 500, transition: 'all 0.15s',
                    background: cfg.secure === opt.val ? 'rgba(79,110,247,0.15)' : 'var(--bg-elevated)',
                    border: `1px solid ${cfg.secure === opt.val ? '#4f6ef7' : 'var(--border)'}`,
                    color: cfg.secure === opt.val ? '#4f6ef7' : 'var(--text-muted)',
                  }}>{opt.label}</button>
                ))}
              </div>
            </div>

            {/* Username */}
            <div style={{ gridColumn: '1 / -1' }}>
              <Label>Username / Email</Label>
              <InputWrap icon={<User size={14} color="#4b6080" />}>
                <input type="email" value={cfg.user} onChange={e => setCfg(p => ({ ...p, user: e.target.value }))}
                  placeholder="your@gmail.com" required style={iStyle} />
              </InputWrap>
            </div>

            {/* Password */}
            <div style={{ gridColumn: '1 / -1' }}>
              <Label>Password / App Password</Label>
              <InputWrap icon={<Lock size={14} color="#4b6080" />} suffix={
                <button type="button" onClick={() => setShowPass(p => !p)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  display: 'flex', padding: '0 4px'
                }}>
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              }>
                <input type={showPass ? 'text' : 'password'} value={cfg.pass}
                  onChange={e => setCfg(p => ({ ...p, pass: e.target.value }))}
                  placeholder="Enter password or app password" required style={iStyle} />
              </InputWrap>
            </div>
          </div>

          {/* Status Messages */}
          {saveStatus && (
            <StatusBox type={saveStatus.type} msg={saveStatus.msg} />
          )}
          {testStatus && (
            <StatusBox type={testStatus.type} msg={testStatus.msg} />
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={handleTest} disabled={testing} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              color: testing ? 'var(--text-muted)' : 'var(--text-secondary)',
              borderRadius: 10, padding: '12px', fontSize: '0.88rem', fontWeight: 500,
              cursor: testing ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.2s'
            }}
              onMouseEnter={e => { if (!testing) { e.currentTarget.style.borderColor = '#4f6ef7'; e.currentTarget.style.color = '#4f6ef7' } }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            >
              <Wifi size={15} />
              {testing ? 'Testing...' : 'Test Connection'}
            </button>

            <button type="submit" disabled={saving} style={{
              flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              background: saving ? 'var(--bg-elevated)' : 'linear-gradient(135deg,#4f6ef7,#7c3aed)',
              color: saving ? 'var(--text-muted)' : '#fff', border: 'none',
              borderRadius: 10, padding: '12px', fontSize: '0.88rem', fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              boxShadow: saving ? 'none' : '0 4px 14px rgba(79,110,247,0.35)', transition: 'all 0.2s'
            }}>
              <Save size={15} />
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  )
}

function Label({ children }) {
  return <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{children}</label>
}

function InputWrap({ icon, suffix, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
      borderRadius: 9, padding: '0 12px', transition: 'border-color 0.2s'
    }}
      onFocus={() => {}} onBlur={() => {}}
    >
      {icon}
      {children}
      {suffix}
    </div>
  )
}

const iStyle = {
  flex: 1, background: 'transparent', border: 'none',
  padding: '11px 0', color: 'var(--text-primary)',
  fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', minWidth: 0
}

function StatusBox({ type, msg }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
      padding: '10px 14px', borderRadius: 8,
      background: type === 'success' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
      border: `1px solid ${type === 'success' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
    }}>
      {type === 'success'
        ? <CheckCircle size={15} color="#10b981" />
        : <AlertCircle size={15} color="#ef4444" />
      }
      <span style={{ fontSize: '0.83rem', color: type === 'success' ? '#86efac' : '#fca5a5' }}>{msg}</span>
    </div>
  )
}
