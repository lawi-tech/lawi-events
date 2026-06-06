import React, { useState } from 'react'
import { LayoutDashboard, Users, UserPlus, ChevronDown } from 'lucide-react'
import type { EventSession } from '../lib/types'

type Page = 'dashboard' | 'leads' | 'capture'

interface SidebarProps {
  page: Page
  setPage: (p: Page) => void
  sessions: EventSession[]
  activeSessionId: string | null
  setActiveSessionId: (id: string) => void
  fupCount: number
}

const NAV = [
  { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'leads'     as Page, label: 'Leads',     icon: Users },
  { id: 'capture'   as Page, label: 'Novo Lead', icon: UserPlus },
]

export function Sidebar({ page, setPage, sessions, activeSessionId, setActiveSessionId, fupCount }: SidebarProps) {
  const [sessionsOpen, setSessionsOpen] = useState(true)

  return (
    <aside style={{
      width: 'var(--sidebar-w)', flexShrink: 0,
      background: 'var(--navy-light)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Logo */}
      <div style={{ padding: '18px 18px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px' }}>lawi</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--teal)', letterSpacing: '0.08em', marginLeft: 3 }}>EVENTS</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '10px 8px', flex: 1, overflowY: 'auto' }}>
        {NAV.map(item => {
          const active = page === item.id
          const Icon = item.icon
          return (
            <button key={item.id} onClick={() => setPage(item.id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 9,
              padding: '8px 10px', borderRadius: 'var(--radius-sm)',
              border: 'none', cursor: 'pointer', marginBottom: 1,
              background: active ? 'var(--teal-dim)' : 'transparent',
              color: active ? 'var(--teal)' : 'var(--text-secondary)',
              fontSize: 13, fontWeight: active ? 600 : 400,
              fontFamily: 'var(--font-sans)', textAlign: 'left',
              transition: 'all 0.12s',
            }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)' }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <Icon size={14} strokeWidth={active ? 2.2 : 1.8} />
              {item.label}
              {item.id === 'dashboard' && fupCount > 0 && (
                <span style={{ marginLeft: 'auto', background: '#ef4444', color: 'white', fontSize: 9, fontWeight: 700, borderRadius: 10, padding: '1px 5px' }}>
                  {fupCount}
                </span>
              )}
            </button>
          )
        })}

        {/* Eventos */}
        {sessions.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <button onClick={() => setSessionsOpen(o => !o)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 10px', background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', fontSize: 9, fontWeight: 700,
              letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)',
            }}>
              Eventos
              <ChevronDown size={9} style={{ marginLeft: 'auto', transform: sessionsOpen ? 'rotate(180deg)' : 'none', transition: '0.15s' }} />
            </button>
            {sessionsOpen && sessions.map(s => (
              <button key={s.id} onClick={() => setActiveSessionId(s.id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 10px', borderRadius: 'var(--radius-sm)',
                border: 'none', cursor: 'pointer', marginBottom: 1,
                background: s.id === activeSessionId ? 'var(--surface)' : 'transparent',
                color: s.id === activeSessionId ? 'var(--white)' : 'var(--text-secondary)',
                fontSize: 12, fontFamily: 'var(--font-sans)', textAlign: 'left',
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', flexShrink: 0, background: s.id === activeSessionId ? 'var(--teal)' : 'var(--text-muted)' }} />
                <span className="truncate" style={{ flex: 1 }}>{s.name}</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>{s.leads.length}</span>
              </button>
            ))}
          </div>
        )}
      </nav>

      <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
        lawi.io · gestão de eventos
      </div>
    </aside>
  )
}
