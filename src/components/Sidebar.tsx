import React, { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { DashboardView } from './components/DashboardView'
import { LeadsView } from './components/LeadsView'
import { CaptureView } from './components/CaptureView'
import { useEventLeads } from './hooks/useEventLeads'
import { calcFupAlerts } from './lib/types'
import type { Lead } from './lib/types'

type Page = 'dashboard' | 'leads' | 'capture'

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768)
  React.useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return isMobile
}

export default function App() {
  const [page, setPage] = useState<Page>('dashboard')
  const isMobile = useIsMobile()
  const { sessions, activeSession, activeSessionId, setActiveSessionId, allLeads, loading, updateLead, updateStatus, addLead } = useEventLeads()
  const fupAlerts = calcFupAlerts(allLeads)

  const handleLeadClick = (_lead: Lead) => { setPage('leads') }

  return (
    <div style={{
      display: 'flex',
      height: isMobile ? 'auto' : '100vh',
      minHeight: isMobile ? '100vh' : 'auto',
      overflow: isMobile ? 'visible' : 'hidden',
    }}>
      <Sidebar
        page={page}
        setPage={setPage}
        sessions={sessions}
        activeSessionId={activeSessionId}
        setActiveSessionId={id => { setActiveSessionId(id); setPage('leads') }}
        fupCount={fupAlerts.length}
      />

      <main style={{
        flex: 1,
        overflow: isMobile ? 'visible' : 'hidden',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        paddingTop: isMobile ? 52 : 0,
      }}>
        <div style={{
          height: 'var(--topbar-h)', flexShrink: 0,
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center',
          padding: isMobile ? '0 14px 0 56px' : '0 20px',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
            {loading ? (
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Carregando...</span>
            ) : activeSession ? (
              <>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>Evento:</span>
                <span style={{ fontSize: 11, fontWeight: 600 }} className="truncate">{activeSession.name}</span>
                <span style={{ fontSize: 10, fontWeight: 700, background: 'var(--teal-dim)', color: 'var(--teal)', borderRadius: 3, padding: '2px 6px', flexShrink: 0 }}>
                  {allLeads.length}
                </span>
              </>
            ) : (
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Nenhum evento</span>
            )}
          </div>
          {fupAlerts.length > 0 && (
            <button onClick={() => setPage('dashboard')} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)',
              borderRadius: 5, padding: '4px 10px', cursor: 'pointer',
              color: '#ef4444', fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-sans)',
              flexShrink: 0,
            }}>
              {fupAlerts.length} FUP
            </button>
          )}
        </div>

        <div style={{ flex: 1, overflow: isMobile ? 'visible' : 'hidden' }}>
          {page === 'dashboard' && (
            <DashboardView leads={allLeads} fupAlerts={fupAlerts} sessions={sessions}
              activeSessionId={activeSessionId} onSelectSession={setActiveSessionId} onLeadClick={handleLeadClick} />
          )}
          {page === 'leads' && (
            <LeadsView leads={allLeads} onUpdateStatus={updateStatus} onUpdateLead={updateLead} />
          )}
          {page === 'capture' && (
            <CaptureView onAddLead={addLead} eventoName={activeSession?.name ?? ''} />
          )}
        </div>
      </main>
    </div>
  )
}
