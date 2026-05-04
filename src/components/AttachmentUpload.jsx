import { useState, useRef } from 'react'
import { Paperclip, X, FileText, FileImage, FileArchive, File, Upload } from 'lucide-react'
import Card from './Card'

function fileIcon(name) {
  const ext = name.split('.').pop().toLowerCase()
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return { Icon: FileImage, color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' }
  if (['zip', 'rar', '7z'].includes(ext)) return { Icon: FileArchive, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' }
  if (['pdf'].includes(ext)) return { Icon: FileText, color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' }
  if (['doc', 'docx', 'txt'].includes(ext)) return { Icon: FileText, color: '#4f6ef7', bg: 'rgba(79,110,247,0.08)', border: 'rgba(79,110,247,0.2)' }
  return { Icon: File, color: '#94a3b8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)' }
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function AttachmentUpload({ attachments, onChange }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  function handleFiles(files) {
    const newFiles = Array.from(files).filter(f => !attachments.find(a => a.name === f.name))
    onChange([...attachments, ...newFiles])
  }

  function remove(name) {
    onChange(attachments.filter(a => a.name !== name))
  }

  return (
    <Card title="Attachments" step="5">
      {/* Drop Zone */}
      <div
        onClick={() => inputRef.current.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
        style={{
          border: `2px dashed ${dragging ? '#4f6ef7' : 'var(--border-hover)'}`,
          borderRadius: 'var(--radius-md)', padding: '28px 20px',
          textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s',
          background: dragging ? 'rgba(79,110,247,0.04)' : 'var(--bg-surface)',
        }}
      >
        <input ref={inputRef} type="file" multiple style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)} />
        <div style={{
          width: 44, height: 44, borderRadius: 11,
          background: dragging ? 'rgba(79,110,247,0.15)' : 'rgba(79,110,247,0.08)',
          border: `1px solid ${dragging ? 'rgba(79,110,247,0.4)' : 'rgba(79,110,247,0.15)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px'
        }}>
          <Paperclip size={20} color="#4f6ef7" strokeWidth={1.5} />
        </div>
        <p style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: 4 }}>
          Drop files here or <span style={{ color: '#4f6ef7' }}>click to browse</span>
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          PDF, Word, Images, ZIP — any file type supported
        </p>
      </div>

      {/* File List */}
      {attachments.length > 0 && (
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {attachments.length} file{attachments.length > 1 ? 's' : ''} attached
            </span>
            <button onClick={() => onChange([])} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.75rem', color: '#ef4444', fontFamily: 'inherit', padding: 0
            }}>Remove all</button>
          </div>

          {attachments.map(file => {
            const { Icon, color, bg, border } = fileIcon(file.name)
            return (
              <div key={file.name} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', padding: '10px 14px',
                transition: 'border-color 0.15s'
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                  background: bg, border: `1px solid ${border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Icon size={17} color={color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  }}>{file.name}</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {formatSize(file.size)} · {file.name.split('.').pop().toUpperCase()}
                  </p>
                </div>
                <button onClick={() => remove(file.name)} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', padding: 5, borderRadius: 6,
                  display: 'flex', transition: 'all 0.15s'
                }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none' }}
                >
                  <X size={15} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
