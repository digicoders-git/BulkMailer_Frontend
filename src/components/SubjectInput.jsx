import { useState } from 'react'
import { Type } from 'lucide-react'
import Card from './Card'

export default function SubjectInput({ value, onChange }) {
  const [focused, setFocused] = useState(false)

  return (
    <Card title="Email Subject" step="2">
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'var(--bg-surface)',
        border: `1px solid ${focused ? '#4f6ef7' : 'var(--border)'}`,
        borderRadius: 'var(--radius-md)',
        padding: '0 16px',
        transition: 'border-color 0.2s',
        boxShadow: focused ? '0 0 0 3px rgba(79,110,247,0.12)' : 'none'
      }}>
        <Type size={16} color={focused ? '#4f6ef7' : '#4b6080'} style={{ flexShrink: 0 }} />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Enter email subject line..."
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1, background: 'transparent', border: 'none',
            padding: '13px 0', color: 'var(--text-primary)',
            fontSize: '0.92rem', outline: 'none',
            fontFamily: 'inherit'
          }}
        />
        <span style={{ fontSize: '0.75rem', color: value.length > 80 ? '#f59e0b' : 'var(--text-muted)', flexShrink: 0 }}>
          {value.length}/100
        </span>
      </div>
    </Card>
  )
}
