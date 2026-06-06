import React, { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { DashboardView } from './components/DashboardView'
import { LeadsView } from './components/LeadsView'
import { ImportView } from './components/ImportView'
import { CaptureView } from './components/CaptureView'
import { useEventLeads } from './hooks/useEventLeads'
import { calcFupAlerts } from './lib/types'
import type { Lead } from './lib/types'

type Page = 'dashboard' | 'leads' | 'import' | 'capture'

export default function App() {
  const [page, setPage] = useState<Page>('dashboard')
  const [dashboardSelected, setDashboardSelected] = useState<Lead | null>(null)

  const {
    sessions,
    activeSession,
    activeSessionId,
    setActiveSessionId,
    allLeads,
    importCSV,
    addLead,
    updateLead,
    updateStatus,
  } = useEventLeads()

  const fupAlerts = calcFupAlerts(allLeads)

  // Quando clica num lead no dashboard, vai para leads com detalhe aberto
  const handleDashboardLeadClick = (lead: Lead) => {
    setDashboardSelected(lead)
    setPage('leads')
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        page={page}
        setPage={p => { setPage(p); setDashboardSelected(null) }}
        sessions={sessions}
        activeSessionId={activeSessionId}
        setActiveSessionId={id => { setActiveSessionId(id); setPage('leads') }}
        fupCount={fupAlerts.length}
      />

      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Topbar com nome do evento ativo */}
        <div style={{
          height: 'var(--topbar-h)', flexShrink: 0,
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center',
          padding: '0 24px',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {activeSession ? (
              <>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Evento ativo:</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--white)' }}>{activeSession.name}</span>
                <span style={{
                  fontSize: 10, fontWeight: 700, background: 'var(--teal-dim)',
                  color: 'var(--teal)', borderRadius: 4, padding: '2px 7px',
                }}>
                  {allLeads.length} leads
                </span>
              </>
            ) : (
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Nenhum evento importado</span>
            )}
          </div>

          {fupAlerts.length > 0 && (
            <button
              onClick={() => setPage('dashboard')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 6, padding: '5px 10px', cursor: 'pointer',
                color: '#ef4444', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-sans)',
              }}
            >
              ⚠️ {fupAlerts.length} FUP pendente{fupAlerts.length > 1 ? 's' : ''}
            </button>
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {page === 'dashboard' && (
            <DashboardView
              leads={allLeads}
              fupAlerts={fupAlerts}
              sessions={sessions}
              activeSessionId={activeSessionId}
              onSelectSession={id => setActiveSessionId(id)}
              onLeadClick={handleDashboardLeadClick}
            />
          )}
          {page === 'leads' && (
            <LeadsView
              leads={allLeads}
              onUpdateStatus={updateStatus}
              onUpdateLead={updateLead}
            />
          )}
          {page === 'import' && (
            <ImportView
              onImport={async (file, name) => {
                const res = await importCSV(file, name)
                setPage('leads')
                return res
              }}
            />
          )}
          {page === 'capture' && (
            <CaptureView
              onAddLead={addLead}
              eventoName={activeSession?.name ?? ''}
            />
          )}
        </div>
      </main>
    </div>
  )
}
