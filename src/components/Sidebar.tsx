import React from 'react'
import { LayoutDashboard, Users, Upload, PlusCircle, Bell, ChevronDown } from 'lucide-react'
import type { EventSession } from '../lib/types'

type Page = 'dashboard' | 'leads' | 'import' | 'capture'

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
  { id: 'import'    as Page, label: 'Importar',  icon: Upload },
  { id: 'capture'   as Page, label: 'Capturar',  icon: PlusCircle },
]

export function Sidebar({ page, setPage, sessions, activeSessionId, setActiveSessionId, fupCount }: SidebarProps) {
  const [sessionsOpen, setSessionsOpen] = React.useState(true)

  return (
    <aside style={{
      width: 'var(--sidebar-w)',
      flexShrink: 0,
      background: 'rgba(255,255,255,0.03)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
          <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--white)' }}>lawi</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--teal)', letterSpacing: '0.05em', marginLeft: 4 }}>events</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 8px', flex: 1, overflowY: 'auto' }}>
        {NAV.map(item => {
          const active = page === item.id
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                marginBottom: 2,
                background: active ? 'var(--teal-dim)' : 'transparent',
                color: active ? 'var(--teal)' : 'var(--text-secondary)',
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                fontFamily: 'var(--font-sans)',
                transition: 'all 0.15s',
                textAlign: 'left',
                position: 'relative',
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-hover)' }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
            >
              <Icon size={15} />
              {item.label}
              {item.id === 'dashboard' && fupCount > 0 && (
                <span style={{
                  marginLeft: 'auto',
                  background: '#ef4444',
                  color: 'white',
                  fontSize: 10,
                  fontWeight: 700,
                  borderRadius: 10,
                  padding: '1px 6px',
                  minWidth: 18,
                  textAlign: 'center',
                }}>
                  {fupCount}
                </span>
              )}
              {item.id === 'capture' && (
                <span style={{
                  marginLeft: 'auto',
                  background: 'var(--teal)',
                  color: 'var(--navy)',
                  fontSize: 9,
                  fontWeight: 700,
                  borderRadius: 4,
                  padding: '1px 5px',
                  letterSpacing: '0.04em',
                }}>
                  EVENTO
                </span>
              )}
            </button>
          )
        })}

        {/* Sessions */}
        {sessions.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <button
              onClick={() => setSessionsOpen(o => !o)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 12px', background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', fontSize: 10, fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)',
              }}
            >
              <Bell size={10} />
              Eventos
              <ChevronDown size={10} style={{ marginLeft: 'auto', transform: sessionsOpen ? 'rotate(180deg)' : 'none', transition: '0.15s' }} />
            </button>
            {sessionsOpen && sessions.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSessionId(s.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                  padding: '7px 12px', borderRadius: 'var(--radius-sm)',
                  border: 'none', cursor: 'pointer', marginBottom: 1,
                  background: s.id === activeSessionId ? 'var(--surface)' : 'transparent',
                  color: s.id === activeSessionId ? 'var(--white)' : 'var(--text-secondary)',
                  fontSize: 12, fontFamily: 'var(--font-sans)',
                  textAlign: 'left', overflow: 'hidden',
                }}
              >
                <span style={{
                  width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                  background: s.id === activeSessionId ? 'var(--teal)' : 'var(--text-muted)',
                }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {s.name}
                </span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>
                  {s.leads.length}
                </span>
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', fontSize: 10, color: 'var(--text-muted)' }}>
        lawi.io · events module
      </div>
    </aside>
  )
}
