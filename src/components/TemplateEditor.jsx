import { useState, useRef, useEffect, useCallback } from 'react'
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import {
  Bold, Italic, Underline, Heading2, List, Link2,
  User, AtSign, RotateCcw, Eye, PenLine,
  AlignLeft, AlignCenter, AlignRight, ImagePlus,
  Crop, Settings2, Check, X
} from 'lucide-react'
import Card from './Card'

const DEFAULT_TEXT = `Dear {{name}},

Greetings from Digicoders!

We are pleased to inform you that your registration has been successfully completed. Your account is now active and you can access all features of our platform.

Should you have any queries or require assistance, please do not hesitate to contact us at noreply@digicoders.in.

We look forward to your continued association with us.

Warm regards,
Team Digicoders
Digicoders Pvt. Ltd.
https://digicoders.in`

const iStyle = {
  width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
  borderRadius: 8, padding: '9px 12px', color: 'var(--text-primary)',
  fontSize: '0.88rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box'
}

export default function TemplateEditor({ onChange, externalLoad }) {
  const [tab, setTab] = useState('edit')
  const [previewHtml, setPreviewHtml] = useState('')
  const [imgModal, setImgModal] = useState(null)
  // imgModal: { src, originalSrc, width, height, borderRadius, align, alt, cropMode, targetEl }
  const [crop, setCrop] = useState({ unit: '%', width: 100, height: 100, x: 0, y: 0 })
  const [completedCrop, setCompletedCrop] = useState(null)
  const cropImgRef = useRef()
  const editorRef = useRef()
  const imgInputRef = useRef()

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = DEFAULT_TEXT.replace(/\n/g, '<br>')
      syncValue()
    }
  }, [])

  useEffect(() => {
    if (externalLoad && editorRef.current) {
      // Restore exact inner content including images
      editorRef.current.innerHTML = externalLoad
      syncValue()
    }
  }, [externalLoad])

  useEffect(() => {
    window.__getEditorHTML = () => editorRef.current?.innerHTML || ''
  }, [])

  function syncValue() {
    if (!editorRef.current) return
    const content = editorRef.current.innerHTML
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f4f4f4;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:4px;">
      <tr><td style="padding:40px 48px 32px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#1f2937;">
        ${content}
      </td></tr>
      <tr><td style="padding:20px 48px 28px;border-top:1px solid #f3f4f6;">
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#9ca3af;">
          This email was sent by Digicoders &middot; <a href="https://digicoders.in" style="color:#6b7280;text-decoration:none;">digicoders.in</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`
    onChange(html)
    setPreviewHtml(html)
  }

  function exec(cmd, value = null) {
    editorRef.current?.focus()
    document.execCommand(cmd, false, value)
    syncValue()
  }

  function insertVar(v) {
    editorRef.current?.focus()
    document.execCommand('insertText', false, v)
    syncValue()
  }

  // Click on image in editor → open edit modal
  function handleEditorClick(e) {
    if (e.target.tagName === 'IMG') {
      const el = e.target
      const style = el.getAttribute('style') || ''
      const wMatch = style.match(/width:(\d+)px/) || []
      const hMatch = style.match(/height:(\d+)px/) || []
      const rMatch = style.match(/border-radius:(\d+)px/) || []
      const isCenter = style.includes('margin:12px auto')
      const isRight = style.includes('margin:12px 0 12px auto')
      setImgModal({
        src: el.src,
        originalSrc: el.src,
        width: wMatch[1] || el.width || 500,
        height: hMatch[1] || '',
        borderRadius: rMatch[1] || 0,
        align: isCenter ? 'center' : isRight ? 'right' : 'left',
        alt: el.alt || '',
        cropMode: false,
        targetEl: el
      })
      setCrop({ unit: '%', width: 100, height: 100, x: 0, y: 0 })
      setCompletedCrop(null)
    }
  }

  // New image upload
  function handleImageUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      setImgModal({
        src: ev.target.result,
        originalSrc: ev.target.result,
        width: 500, height: '', borderRadius: 4,
        align: 'center', alt: '', cropMode: false, targetEl: null
      })
      setCrop({ unit: '%', width: 100, height: 100, x: 0, y: 0 })
      setCompletedCrop(null)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // Apply crop → get cropped base64
  function applyCrop() {
    if (!completedCrop || !cropImgRef.current) return
    const img = cropImgRef.current
    const canvas = document.createElement('canvas')
    const scaleX = img.naturalWidth / img.width
    const scaleY = img.naturalHeight / img.height
    canvas.width = completedCrop.width * scaleX
    canvas.height = completedCrop.height * scaleY
    const ctx = canvas.getContext('2d')
    ctx.drawImage(
      img,
      completedCrop.x * scaleX, completedCrop.y * scaleY,
      completedCrop.width * scaleX, completedCrop.height * scaleY,
      0, 0, canvas.width, canvas.height
    )
    const croppedSrc = canvas.toDataURL('image/jpeg', 0.92)
    setImgModal(p => ({ ...p, src: croppedSrc, cropMode: false }))
    setCompletedCrop(null)
  }

  function cancelCrop() {
    setImgModal(p => ({ ...p, src: p.originalSrc, cropMode: false }))
    setCompletedCrop(null)
  }

  function applyImage() {
    const { src, width, height, borderRadius, align, alt, targetEl } = imgModal
    const marginStyle = align === 'center' ? 'margin:12px auto;' : align === 'right' ? 'margin:12px 0 12px auto;' : 'margin:12px 0;'
    const styleStr = `max-width:100%;display:block;${marginStyle}border-radius:${borderRadius}px;${width ? `width:${width}px;` : ''}${height ? `height:${height}px;` : ''}`

    if (targetEl) {
      // Edit existing image
      targetEl.src = src
      targetEl.alt = alt
      targetEl.setAttribute('style', styleStr)
      if (width) targetEl.setAttribute('width', width)
      else targetEl.removeAttribute('width')
      if (height) targetEl.setAttribute('height', height)
      else targetEl.removeAttribute('height')
    } else {
      // Insert new image
      const imgHtml = `<img src="${src}" ${width ? `width="${width}"` : ''} ${height ? `height="${height}"` : ''} alt="${alt}" style="${styleStr}" />`
      editorRef.current?.focus()
      document.execCommand('insertHTML', false, imgHtml)
    }
    syncValue()
    setImgModal(null)
  }

  const toolGroups = [
    [
      { icon: Bold, cmd: 'bold', title: 'Bold' },
      { icon: Italic, cmd: 'italic', title: 'Italic' },
      { icon: Underline, cmd: 'underline', title: 'Underline' },
    ],
    [
      { icon: AlignLeft, cmd: 'justifyLeft', title: 'Align Left' },
      { icon: AlignCenter, cmd: 'justifyCenter', title: 'Align Center' },
      { icon: AlignRight, cmd: 'justifyRight', title: 'Align Right' },
    ],
    [
      { icon: Heading2, cmd: 'formatBlock', value: 'h2', title: 'Heading' },
      { icon: List, cmd: 'insertUnorderedList', title: 'Bullet List' },
      { icon: Link2, title: 'Insert Link', action: () => { const url = prompt('Enter URL:'); if (url) exec('createLink', url) } },
    ],
    [
      { icon: ImagePlus, title: 'Insert Image', action: () => imgInputRef.current.click() },
      { icon: User, title: 'Insert {{name}}', action: () => insertVar('{{name}}'), label: '{{name}}' },
      { icon: AtSign, title: 'Insert {{email}}', action: () => insertVar('{{email}}'), label: '{{email}}' },
    ],
    [
      { icon: RotateCcw, title: 'Reset', action: () => { editorRef.current.innerHTML = DEFAULT_TEXT.replace(/\n/g, '<br>'); syncValue() } },
    ]
  ]

  return (
    <Card title="Email Template" step="3">
      <input ref={imgInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />

      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap',
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)', padding: '8px 12px', marginBottom: 12
      }}>
        {toolGroups.map((group, gi) => (
          <div key={gi} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {gi > 0 && <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }} />}
            {group.map(tool => (
              <ToolBtn key={tool.title} icon={tool.icon} title={tool.title} label={tool.label}
                onClick={tool.action || (() => exec(tool.cmd, tool.value))} />
            ))}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4 }}>
        {[{ id: 'edit', icon: PenLine, label: 'Compose' }, { id: 'preview', icon: Eye, label: 'Preview' }].map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); if (t.id === 'preview') syncValue() }} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
            borderRadius: '8px 8px 0 0',
            border: `1px solid ${tab === t.id ? '#4f6ef7' : 'var(--border)'}`,
            borderBottom: tab === t.id ? '1px solid var(--bg-card)' : '1px solid var(--border)',
            background: tab === t.id ? 'var(--bg-card)' : 'var(--bg-surface)',
            color: tab === t.id ? '#4f6ef7' : 'var(--text-muted)',
            cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500, fontFamily: 'inherit',
            marginBottom: tab === t.id ? -1 : 0, position: 'relative', zIndex: tab === t.id ? 1 : 0
          }}>
            <t.icon size={13} />{t.label}
          </button>
        ))}
      </div>

      <div ref={editorRef} contentEditable suppressContentEditableWarning
        onInput={syncValue} onClick={handleEditorClick}
        style={{
          display: tab === 'edit' ? 'block' : 'none',
          minHeight: 300, background: 'var(--bg-surface)',
          border: '1px solid #4f6ef7',
          borderRadius: '0 var(--radius-md) var(--radius-md) var(--radius-md)',
          padding: '18px 20px', color: 'var(--text-primary)',
          fontSize: '0.92rem', outline: 'none', lineHeight: 1.8, fontFamily: 'inherit'
        }}
      />

      {tab === 'preview' && (
        <div style={{
          minHeight: 300, background: '#f1f5f9', border: '1px solid #4f6ef7',
          borderRadius: '0 var(--radius-md) var(--radius-md) var(--radius-md)',
          padding: 24, overflowY: 'auto'
        }}>
          <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Variables:</span>
        {['{{name}}', '{{email}}'].map(v => (
          <span key={v} onClick={() => insertVar(v)} style={{
            fontSize: '0.75rem', padding: '3px 10px', borderRadius: 20, cursor: 'pointer',
            background: 'rgba(79,110,247,0.08)', border: '1px solid rgba(79,110,247,0.2)',
            color: '#4f6ef7', fontFamily: 'monospace'
          }}>{v}</span>
        ))}
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 8 }}>
          · Click on any image in editor to edit/crop it
        </span>
      </div>

      {/* Image Modal */}
      {imgModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 16
        }} onClick={() => !imgModal.cropMode && setImgModal(null)}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 18, width: 560, maxWidth: '100%', maxHeight: '90vh',
            overflowY: 'auto', animation: 'fadeIn 0.2s ease'
          }} onClick={e => e.stopPropagation()}>

            {/* Modal Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '18px 24px', borderBottom: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Settings2 size={16} color="#4f6ef7" />
                <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  {imgModal.cropMode ? 'Crop Image' : 'Image Settings'}
                </span>
              </div>
              {!imgModal.cropMode && (
                <button onClick={() => setImgModal(null)} style={{
                  background: 'none', border: 'none', color: 'var(--text-muted)',
                  cursor: 'pointer', display: 'flex', padding: 4
                }}><X size={18} /></button>
              )}
            </div>

            <div style={{ padding: 24 }}>
              {imgModal.cropMode ? (
                /* ── CROP MODE ── */
                <div>
                  <div style={{
                    background: '#000', borderRadius: 10, overflow: 'hidden',
                    marginBottom: 16, display: 'flex', justifyContent: 'center'
                  }}>
                    <ReactCrop
                      crop={crop} onChange={c => setCrop(c)}
                      onComplete={c => setCompletedCrop(c)}
                    >
                      <img ref={cropImgRef} src={imgModal.originalSrc}
                        style={{ maxWidth: '100%', maxHeight: 380, display: 'block' }} alt="crop" />
                    </ReactCrop>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={cancelCrop} style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      background: 'var(--bg-surface)', border: '1px solid var(--border)',
                      color: 'var(--text-secondary)', borderRadius: 9, padding: '10px',
                      fontSize: '0.88rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit'
                    }}><X size={14} /> Cancel</button>
                    <button onClick={applyCrop} style={{
                      flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      background: 'linear-gradient(135deg,#4f6ef7,#7c3aed)',
                      color: '#fff', border: 'none', borderRadius: 9, padding: '10px',
                      fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                    }}><Check size={14} /> Apply Crop</button>
                  </div>
                </div>
              ) : (
                /* ── SETTINGS MODE ── */
                <>
                  {/* Live Preview */}
                  <div style={{
                    background: 'var(--bg-surface)', border: '1px solid var(--border)',
                    borderRadius: 10, padding: 16, marginBottom: 20,
                    display: 'flex', justifyContent: imgModal.align, overflow: 'hidden', minHeight: 80
                  }}>
                    <img src={imgModal.src} alt="preview" style={{
                      width: Math.min(Number(imgModal.width) || 500, 480),
                      height: imgModal.height ? Number(imgModal.height) : 'auto',
                      borderRadius: Number(imgModal.borderRadius) || 0,
                      maxWidth: '100%', display: 'block', objectFit: 'cover'
                    }} />
                  </div>

                  {/* Crop Button */}
                  <button onClick={() => setImgModal(p => ({ ...p, cropMode: true }))} style={{
                    display: 'flex', alignItems: 'center', gap: 7, marginBottom: 18,
                    background: 'rgba(79,110,247,0.08)', border: '1px solid rgba(79,110,247,0.2)',
                    color: '#4f6ef7', borderRadius: 8, padding: '8px 16px',
                    fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit'
                  }}>
                    <Crop size={14} /> Crop Image
                  </button>

                  {/* Size Controls */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>Width (px)</label>
                      <input type="number" value={imgModal.width} min={50} max={1200}
                        onChange={e => setImgModal(p => ({ ...p, width: e.target.value }))}
                        style={iStyle} />
                      <input type="range" min={50} max={600} value={imgModal.width}
                        onChange={e => setImgModal(p => ({ ...p, width: e.target.value }))}
                        style={{ width: '100%', marginTop: 6, accentColor: '#4f6ef7' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>Height (px) — optional</label>
                      <input type="number" value={imgModal.height} placeholder="auto"
                        onChange={e => setImgModal(p => ({ ...p, height: e.target.value }))}
                        style={iStyle} />
                      <input type="range" min={0} max={600} value={imgModal.height || 0}
                        onChange={e => setImgModal(p => ({ ...p, height: e.target.value === '0' ? '' : e.target.value }))}
                        style={{ width: '100%', marginTop: 6, accentColor: '#4f6ef7' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>Border Radius (px)</label>
                      <input type="number" value={imgModal.borderRadius} min={0} max={200}
                        onChange={e => setImgModal(p => ({ ...p, borderRadius: e.target.value }))}
                        style={iStyle} />
                      <input type="range" min={0} max={200} value={imgModal.borderRadius}
                        onChange={e => setImgModal(p => ({ ...p, borderRadius: e.target.value }))}
                        style={{ width: '100%', marginTop: 6, accentColor: '#4f6ef7' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>Alt Text</label>
                      <input type="text" value={imgModal.alt} placeholder="Image description"
                        onChange={e => setImgModal(p => ({ ...p, alt: e.target.value }))}
                        style={iStyle} />
                    </div>
                  </div>

                  {/* Alignment */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 500 }}>Alignment</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[{ val: 'left', icon: AlignLeft }, { val: 'center', icon: AlignCenter }, { val: 'right', icon: AlignRight }].map(({ val, icon: Icon }) => (
                        <button key={val} onClick={() => setImgModal(p => ({ ...p, align: val }))} style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          padding: '9px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
                          fontSize: '0.82rem', fontWeight: 500, textTransform: 'capitalize',
                          background: imgModal.align === val ? 'rgba(79,110,247,0.15)' : 'var(--bg-surface)',
                          border: `1px solid ${imgModal.align === val ? '#4f6ef7' : 'var(--border)'}`,
                          color: imgModal.align === val ? '#4f6ef7' : 'var(--text-muted)',
                        }}>
                          <Icon size={14} />{val}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Apply Button */}
                  <button onClick={applyImage} style={{
                    width: '100%', background: 'linear-gradient(135deg,#4f6ef7,#7c3aed)',
                    color: '#fff', border: 'none', borderRadius: 10, padding: '13px',
                    fontSize: '0.92rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                    boxShadow: '0 4px 14px rgba(79,110,247,0.35)'
                  }}>
                    {imgModal.targetEl ? 'Update Image' : 'Insert Image'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

function ToolBtn({ icon: Icon, title, label, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button onClick={onClick} title={title}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        background: hovered ? 'rgba(79,110,247,0.12)' : 'transparent',
        border: `1px solid ${hovered ? 'rgba(79,110,247,0.3)' : 'transparent'}`,
        color: hovered ? '#4f6ef7' : 'var(--text-secondary)',
        padding: label ? '5px 9px' : '6px 7px',
        borderRadius: 6, cursor: 'pointer',
        fontSize: '0.78rem', fontWeight: 500, fontFamily: 'inherit', transition: 'all 0.15s'
      }}>
      <Icon size={14} />
      {label && <span>{label}</span>}
    </button>
  )
}
