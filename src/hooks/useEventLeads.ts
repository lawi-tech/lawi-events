import { useState, useCallback } from 'react'
import type { Lead, LeadStatus, EventSession } from '../lib/types'
import { parseCSV } from '../lib/csv-parser'

const STORAGE_KEY = 'lawi_events_sessions'

function loadSessions(): EventSession[] {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    return s ? JSON.parse(s) : []
  } catch { return [] }
}

function saveSessions(sessions: EventSession[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions)) } catch {}
}

export function useEventLeads() {
  const [sessions, setSessions] = useState<EventSession[]>(loadSessions)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    () => loadSessions()[0]?.id ?? null
  )

  const activeSession = sessions.find(s => s.id === activeSessionId) ?? null
  const allLeads = activeSession?.leads ?? []

  // ── Import CSV ────────────────────────────────────────────────────────────
  const importCSV = useCallback((file: File, eventoName: string): Promise<{ count: number; warnings: string[] }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = e => {
        const text = e.target?.result as string
        const result = parseCSV(text, eventoName)
        if (result.leads.length === 0) {
          reject(new Error(result.warnings[0] || 'Nenhum lead encontrado.'))
          return
        }
        const session: EventSession = {
          id: `session-${Date.now()}`,
          name: eventoName,
          leads: result.leads,
          importedAt: new Date().toISOString(),
        }
        setSessions(prev => {
          const updated = [session, ...prev]
          saveSessions(updated)
          return updated
        })
        setActiveSessionId(session.id)
        resolve({ count: result.leads.length, warnings: result.warnings })
      }
      reader.onerror = () => reject(new Error('Erro ao ler o arquivo.'))
      reader.readAsText(file, 'utf-8')
    })
  }, [])

  // ── Add lead (captura no evento) ──────────────────────────────────────────
  const addLead = useCallback((lead: Omit<Lead, 'id' | 'capturedAt'>) => {
    const newLead: Lead = {
      ...lead,
      id: `manual-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      capturedAt: new Date().toISOString(),
    }
    setSessions(prev => {
      let targetId = activeSessionId
      let updated: EventSession[]

      if (!targetId) {
        const session: EventSession = {
          id: `session-manual-${Date.now()}`,
          name: lead.evento || 'Evento',
          leads: [newLead],
          importedAt: new Date().toISOString(),
        }
        updated = [session, ...prev]
        setActiveSessionId(session.id)
      } else {
        updated = prev.map(s =>
          s.id === targetId ? { ...s, leads: [newLead, ...s.leads] } : s
        )
      }
      saveSessions(updated)
      return updated
    })
  }, [activeSessionId])

  // ── Update lead ───────────────────────────────────────────────────────────
  const updateLead = useCallback((leadId: string, patch: Partial<Lead>) => {
    setSessions(prev => {
      const updated = prev.map(s => ({
        ...s,
        leads: s.leads.map(l => l.id === leadId ? { ...l, ...patch } : l)
      }))
      saveSessions(updated)
      return updated
    })
  }, [])

  const updateStatus = useCallback((leadId: string, status: LeadStatus) => {
    updateLead(leadId, { status })
  }, [updateLead])

  // ── Delete session ────────────────────────────────────────────────────────
  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prev => {
      const updated = prev.filter(s => s.id !== sessionId)
      saveSessions(updated)
      if (activeSessionId === sessionId) {
        setActiveSessionId(updated[0]?.id ?? null)
      }
      return updated
    })
  }, [activeSessionId])

  return {
    sessions,
    activeSession,
    activeSessionId,
    setActiveSessionId,
    allLeads,
    importCSV,
    addLead,
    updateLead,
    updateStatus,
    deleteSession,
  }
}
