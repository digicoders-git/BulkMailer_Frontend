import { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, X, Download } from 'lucide-react'
import * as XLSX from 'xlsx'
import Card from './Card'
import { apiFetch } from '../api'

export default function ExcelUpload({ onParsed }) {
  const [status, setStatus] = useState(null)
  const [emails, setEmails] = useState([])
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState(null)
  const inputRef = useRef()

  async function handleFile(file) {
    if (!file) return
    setFileName(file.name)
    setStatus({ type: 'loading' })
    const formData = new FormData()
    formData.append('excel', file)
    try {
      const res = await apiFetch('/parse-excel', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.error) { setStatus({ type: 'error', msg: data.error }); return }
      setEmails(data.emails)
      onParsed(data.emails)
      setStatus({ type: 'success', count: data.total })
    } catch (e) {
      setStatus({ type: 'error', msg: e.message })
    }
  }

  function reset() {
    setEmails([]); setStatus(null); setFileName(null); onParsed([])
    inputRef.current.value = ''
  }

  function downloadTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([['Name', 'Email'], ['John Doe', 'john@example.com'], ['Jane Smith', 'jane@example.com']])
    ws['!cols'] = [{ wch: 20 }, { wch: 30 }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Recipients')
    XLSX.writeFile(wb, 'email-recipients-template.xlsx')
  }

  return (
    <Card title="Upload Recipients" step="1">
      {/* Download Template Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <button onClick={downloadTemplate} style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: 'rgba(79,110,247,0.08)', border: '1px solid rgba(79,110,247,0.2)',
          color: '#4f6ef7', padding: '7px 14px', borderRadius: 8,
          fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
          transition: 'all 0.15s'
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(79,110,247,0.15)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(79,110,247,0.08)' }}
        >
          <Download size={14} />
          Download Excel Template
        </button>
      </div>

      {!fileName ? (
        <div
          onClick={() => inputRef.current.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
          style={{
            border: `2px dashed ${dragging ? '#4f6ef7' : '#1e2d45'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '48px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.25s',
            background: dragging ? 'rgba(79,110,247,0.04)' : 'var(--bg-surface)',
            position: 'relative',
          }}
        >
          <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }}
            onChange={e => handleFile(e.target.files[0])} />

          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'rgba(79,110,247,0.1)', border: '1px solid rgba(79,110,247,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Upload size={24} color="#4f6ef7" strokeWidth={1.5} />
          </div>

          <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: 6 }}>
            Drop your Excel file here
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            or <span style={{ color: '#4f6ef7', fontWeight: 500 }}>click to browse</span> · .xlsx, .xls supported
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 8 }}>
            File must contain an <strong style={{ color: 'var(--text-secondary)' }}>Email</strong> column
          </p>
        </div>
      ) : (
        <div style={{
          background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)', padding: '14px 18px',
          display: 'flex', alignItems: 'center', gap: 12
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <FileSpreadsheet size={18} color="#10b981" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 500, fontSize: '0.88rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fileName}</p>
            {status?.type === 'loading' && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Parsing file...</p>}
            {status?.type === 'success' && <p style={{ fontSize: '0.75rem', color: '#10b981' }}>{status.count} recipients found</p>}
            {status?.type === 'error' && <p style={{ fontSize: '0.75rem', color: 'var(--error)' }}>{status.msg}</p>}
          </div>
          <button onClick={reset} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6, display: 'flex' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {emails.length > 0 && (
        <div style={{ marginTop: 20, animation: 'fadeIn 0.3s ease' }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
            {[
              { label: 'Total Recipients', value: emails.length, color: '#4f6ef7', bg: 'rgba(79,110,247,0.08)', border: 'rgba(79,110,247,0.2)' },
              { label: 'Valid Emails', value: emails.length, color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
            ].map(({ label, value, color, bg, border }) => (
              <div key={label} style={{
                flex: 1, background: bg, border: `1px solid ${border}`,
                borderRadius: 'var(--radius-md)', padding: '12px 16px'
              }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{
            maxHeight: 200, overflowY: 'auto',
            background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)'
          }}>
            <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', flex: '0 0 140px' }}>Name</span>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email Address</span>
            </div>
            {emails.map((e, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '9px 16px', borderBottom: i < emails.length - 1 ? '1px solid var(--border)' : 'none',
                fontSize: '0.84rem', transition: 'background 0.15s'
              }}
                onMouseEnter={el => el.currentTarget.style.background = 'rgba(79,110,247,0.04)'}
                onMouseLeave={el => el.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: `hsl(${(i * 47) % 360}, 60%, 20%)`,
                  border: `1px solid hsl(${(i * 47) % 360}, 60%, 30%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 600, color: `hsl(${(i * 47) % 360}, 80%, 70%)`
                }}>
                  {(e.name || e.email)[0].toUpperCase()}
                </div>
                <span style={{ color: 'var(--text-secondary)', flex: '0 0 120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name || '—'}</span>
                <span style={{ color: 'var(--text-primary)' }}>{e.email}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
