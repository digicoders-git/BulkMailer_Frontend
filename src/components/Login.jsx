import { useState } from 'react'
import { Mail, Shield, ArrowRight, RefreshCw, CheckCircle } from 'lucide-react'

const ADMIN_EMAIL = 'digicoderstech@gmail.com'
const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function Login({ onLogin }) {
  const [step, setStep] = useState('email') // 'email' | 'otp'
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(0)

  async function handleSendOtp(e) {
    e.preventDefault()
    if (email !== ADMIN_EMAIL) { setError('Access denied. Use the authorized email.'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API}/auth/send-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setStep('otp')
      startResendTimer()
    } catch { setError('Network error. Is the server running?') }
    finally { setLoading(false) }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault()
    const otpStr = otp.join('')
    if (otpStr.length !== 6) { setError('Enter complete 6-digit OTP'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API}/auth/verify-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpStr })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      localStorage.setItem('bm_token', data.token)
      onLogin(data.token)
    } catch { setError('Network error.') }
    finally { setLoading(false) }
  }

  function startResendTimer() {
    setResendTimer(60)
    const t = setInterval(() => setResendTimer(p => { if (p <= 1) { clearInterval(t); return 0 } return p - 1 }), 1000)
  }

  async function handleResend() {
    if (resendTimer > 0) return
    setLoading(true); setError(''); setOtp(['', '', '', '', '', ''])
    try {
      await fetch(`${API}/auth/send-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
      startResendTimer()
    } finally { setLoading(false) }
  }

  function handleOtpChange(val, idx) {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[idx] = val.slice(-1)
    setOtp(next)
    if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus()
  }

  function handleOtpKeyDown(e, idx) {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) document.getElementById(`otp-${idx - 1}`)?.focus()
  }

  function handleOtpPaste(e) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      document.getElementById('otp-5')?.focus()
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-base)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79,110,247,0.08) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg,#4f6ef7,#7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', boxShadow: '0 0 32px rgba(79,110,247,0.4)'
          }}>
            <Mail size={24} color="#fff" strokeWidth={2} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', margin: 0 }}>
            BulkMailer
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 6 }}>
            Admin Portal · Digicoders
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 20, padding: '32px 36px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)'
        }}>
          {step === 'email' ? (
            <>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                  Sign in to your account
                </h2>
                <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', margin: 0 }}>
                  Enter your admin email to receive a one-time password
                </p>
              </div>

              <form onSubmit={handleSendOtp}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Email Address
                </label>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: 'var(--bg-surface)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '0 14px', marginBottom: 20,
                  transition: 'border-color 0.2s'
                }} onFocus={() => {}} >
                  <Mail size={15} color="#4b6080" style={{ flexShrink: 0 }} />
                  <input
                    type="email" value={email} onChange={e => { setEmail(e.target.value); setError('') }}
                    placeholder="digicoderstech@gmail.com"
                    required autoFocus
                    style={{
                      flex: 1, background: 'transparent', border: 'none',
                      padding: '13px 0', color: 'var(--text-primary)',
                      fontSize: '0.92rem', outline: 'none', fontFamily: 'inherit'
                    }}
                  />
                </div>

                {error && (
                  <div style={{
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: 8, padding: '10px 14px', marginBottom: 16,
                    fontSize: '0.82rem', color: '#fca5a5'
                  }}>{error}</div>
                )}

                <button type="submit" disabled={loading} style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: loading ? 'var(--bg-elevated)' : 'linear-gradient(135deg,#4f6ef7,#7c3aed)',
                  color: '#fff', border: 'none', borderRadius: 10, padding: '13px',
                  fontSize: '0.92rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', boxShadow: loading ? 'none' : '0 4px 20px rgba(79,110,247,0.4)',
                  transition: 'all 0.2s'
                }}>
                  {loading ? 'Sending OTP...' : <><span>Send OTP</span><ArrowRight size={16} /></>}
                </button>
              </form>
            </>
          ) : (
            <>
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <CheckCircle size={16} color="#10b981" />
                  </div>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    Check your email
                  </h2>
                </div>
                <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', margin: 0 }}>
                  OTP sent to <strong style={{ color: 'var(--text-secondary)' }}>{email}</strong>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Enter 6-digit OTP
                </label>

                <div style={{ display: 'flex', gap: 8, marginBottom: 20, justifyContent: 'center' }} onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx} id={`otp-${idx}`}
                      type="text" inputMode="numeric" maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(e.target.value, idx)}
                      onKeyDown={e => handleOtpKeyDown(e, idx)}
                      style={{
                        width: 48, height: 56, textAlign: 'center',
                        background: digit ? 'rgba(79,110,247,0.1)' : 'var(--bg-surface)',
                        border: `2px solid ${digit ? '#4f6ef7' : 'var(--border)'}`,
                        borderRadius: 10, color: 'var(--text-primary)',
                        fontSize: '1.3rem', fontWeight: 700, outline: 'none',
                        fontFamily: 'inherit', transition: 'all 0.15s', cursor: 'text'
                      }}
                      onFocus={e => e.target.style.borderColor = '#4f6ef7'}
                      onBlur={e => e.target.style.borderColor = digit ? '#4f6ef7' : 'var(--border)'}
                    />
                  ))}
                </div>

                {error && (
                  <div style={{
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: 8, padding: '10px 14px', marginBottom: 16,
                    fontSize: '0.82rem', color: '#fca5a5'
                  }}>{error}</div>
                )}

                <button type="submit" disabled={loading || otp.join('').length !== 6} style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: (loading || otp.join('').length !== 6) ? 'var(--bg-elevated)' : 'linear-gradient(135deg,#4f6ef7,#7c3aed)',
                  color: (loading || otp.join('').length !== 6) ? 'var(--text-muted)' : '#fff',
                  border: 'none', borderRadius: 10, padding: '13px',
                  fontSize: '0.92rem', fontWeight: 600,
                  cursor: (loading || otp.join('').length !== 6) ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', transition: 'all 0.2s',
                  boxShadow: (loading || otp.join('').length !== 6) ? 'none' : '0 4px 20px rgba(79,110,247,0.4)'
                }}>
                  <Shield size={16} />
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                  <button type="button" onClick={() => { setStep('email'); setError(''); setOtp(['','','','','','']) }} style={{
                    background: 'none', border: 'none', color: 'var(--text-muted)',
                    fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit', padding: 0
                  }}>← Change email</button>

                  <button type="button" onClick={handleResend} disabled={resendTimer > 0} style={{
                    background: 'none', border: 'none', cursor: resendTimer > 0 ? 'not-allowed' : 'pointer',
                    color: resendTimer > 0 ? 'var(--text-muted)' : '#4f6ef7',
                    fontSize: '0.8rem', fontFamily: 'inherit', padding: 0,
                    display: 'flex', alignItems: 'center', gap: 4
                  }}>
                    <RefreshCw size={12} />
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 20 }}>
          Secured with OTP · Session valid for 8 hours
        </p>
      </div>
    </div>
  )
}
