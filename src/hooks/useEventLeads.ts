import { useState, useEffect, useCallback } from 'react'
import type { Lead, LeadStatus, EventSession, EventoConfig } from '../lib/types'
import { parseCSV } from '../lib/csv-parser'

const WORKER_URL = 'https://lawi-events.verber.workers.dev'

async function fetchOverrides(evento: string): Promise<Record<string, Partial<Lead>>> {
  try {
    const res = await fetch(`${WORKER_URL}/overrides?evento=${encodeURIComponent(evento)}`)
    return res.ok ? res.json() : {}
  } catch { return {} }
}

async function saveOverride(lead: Lead, patch: Partial<Lead>) {
  try {
    await fetch(`${WORKER_URL}/overrides`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lead_id:      lead.id,
        evento:       lead.evento,
        status:       patch.status       ?? lead.status,
        responsavel:  patch.responsavel  ?? lead.responsavel,
        notes:        patch.notes        ?? lead.notes,
        conviteLatam: patch.conviteLatam !== undefined ? patch.conviteLatam : lead.conviteLatam,
      }),
    })
  } catch (e) {
    console.error('Erro ao salvar override:', e)
  }
}

export function useEventLeads() {
  const [eventos, setEventos] = useState<EventoConfig[]>([])
  const [sessions, setSessions] = useState<EventSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [overrides, setOverrides] = useState<Record<string, Partial<Lead>>>({})
  const [loading, setLoading] = useState(true)
  const [manualLeads, setManualLeads] = useState<Lead[]>([])

  // Carrega index.json
  useEffect(() => {
    fetch('/eventos/index.json')
      .then(r => r.json())
      .then((list: EventoConfig[]) => setEventos(list))
      .catch(() => setEventos([]))
  }, [])

  // Carrega CSVs
  useEffect(() => {
    if (eventos.length === 0) { setLoading(false); return }
    setLoading(true)
    Promise.all(
      eventos.map(async (ev) => {
        try {
          const res = await fetch(`/eventos/${ev.file}`)
          const text = await res.text()
          const { leads } = parseCSV(text, ev.name)
          const stableLeads = leads.map((l, i) => ({
            ...l,
            id: `${ev.file}-${i}`,
            evento: ev.name,
          }))
          return { id: ev.file, name: ev.name, file: ev.file, leads: stableLeads, loadedAt: new Date().toISOString() } as EventSession
        } catch { return null }
      })
    ).then(results => {
      const valid = results.filter(Boolean) as EventSession[]
      setSessions(valid)
      if (valid.length > 0) setActiveSessionId(valid[0].id)
      setLoading(false)
    })
  }, [eventos])

  // Carrega overrides do Notion quando sessão muda
  useEffect(() => {
    const session = sessions.find(s => s.id === activeSessionId)
    if (!session) return
    fetchOverrides(session.name).then(setOverrides)
  }, [activeSessionId, sessions])

  const activeSession = sessions.find(s => s.id === activeSessionId) ?? null

  // Aplica overrides sobre os leads do CSV
  const allLeads = (activeSession?.leads ?? []).map(l => {
    const ov = overrides[l.id]
    return ov ? { ...l, ...ov } : l
  }).concat(manualLeads.filter(l => l.evento === activeSession?.name))

  const updateLead = useCallback((leadId: string, patch: Partial<Lead>) => {
    // Atualiza estado local imediatamente e persiste o estado COMPLETO no Notion
    setOverrides(prev => {
      const merged = { ...(prev[leadId] || {}), ...patch }
      // Persiste estado completo em background
      const session = sessions.find(s => s.id === activeSessionId)
      const baseLead = session?.leads.find(l => l.id === leadId)
      if (baseLead) {
        const fullLead = { ...baseLead, ...merged }
        saveOverride(fullLead, {
          status:        fullLead.status,
          responsavel:   fullLead.responsavel,
          notes:         fullLead.notes,
          conviteLatam:  fullLead.conviteLatam,
        })
      }
      return { ...prev, [leadId]: merged }
    })
  }, [sessions, activeSessionId])

  const updateStatus = useCallback((leadId: string, status: LeadStatus) => {
    updateLead(leadId, { status })
  }, [updateLead])

  const addLead = useCallback((lead: Omit<Lead, 'id' | 'capturedAt'>) => {
    const newLead: Lead = {
      ...lead,
      id: `manual-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      capturedAt: new Date().toISOString(),
    }
    setManualLeads(prev => [newLead, ...prev])
  }, [])

  return { eventos, sessions, activeSession, activeSessionId, setActiveSessionId, allLeads, loading, updateLead, updateStatus, addLead }
}
