import { useState, useEffect, useCallback } from 'react'
import type { Lead, LeadStatus, EventSession, EventoConfig } from '../lib/types'
import { parseCSV } from '../lib/csv-parser'

const OVERRIDES_KEY = 'lawi_events_overrides' // status/responsavel/notas editados pelo usuário

// Carrega overrides do localStorage (edições do usuário)
function loadOverrides(): Record<string, Partial<Lead>> {
  try {
    const s = localStorage.getItem(OVERRIDES_KEY)
    return s ? JSON.parse(s) : {}
  } catch { return {} }
}

function saveOverrides(overrides: Record<string, Partial<Lead>>) {
  try { localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides)) } catch {}
}

// Aplica overrides do usuário sobre os leads do CSV
function applyOverrides(leads: Lead[], overrides: Record<string, Partial<Lead>>): Lead[] {
  return leads.map(l => overrides[l.id] ? { ...l, ...overrides[l.id] } : l)
}

export function useEventLeads() {
  const [eventos, setEventos] = useState<EventoConfig[]>([])
  const [sessions, setSessions] = useState<EventSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [overrides, setOverrides] = useState<Record<string, Partial<Lead>>>(loadOverrides)
  const [loading, setLoading] = useState(true)
  const [manualLeads, setManualLeads] = useState<Lead[]>([])

  // Carrega index.json com lista de eventos
  useEffect(() => {
    fetch('/eventos/index.json')
      .then(r => r.json())
      .then((list: EventoConfig[]) => setEventos(list))
      .catch(() => setEventos([]))
  }, [])

  // Carrega CSVs de todos os eventos
  useEffect(() => {
    if (eventos.length === 0) { setLoading(false); return }
    setLoading(true)
    Promise.all(
      eventos.map(async (ev) => {
        try {
          const res = await fetch(`/eventos/${ev.file}`)
          const text = await res.text()
          const { leads } = parseCSV(text, ev.name)
          // Usa o nome do arquivo como ID estável para os leads
          const stableLeads = leads.map((l, i) => ({
            ...l,
            id: `${ev.file}-${i}`,
            evento: ev.name,
          }))
          return {
            id: ev.file,
            name: ev.name,
            file: ev.file,
            leads: stableLeads,
            loadedAt: new Date().toISOString(),
          } as EventSession
        } catch {
          return null
        }
      })
    ).then(results => {
      const valid = results.filter(Boolean) as EventSession[]
      setSessions(valid)
      if (valid.length > 0 && !activeSessionId) setActiveSessionId(valid[0].id)
      setLoading(false)
    })
  }, [eventos])

  const activeSession = sessions.find(s => s.id === activeSessionId) ?? null

  // Leads ativos = CSV + overrides do usuário + leads manuais
  const allLeads = activeSession
    ? [...applyOverrides(activeSession.leads, overrides), ...manualLeads.filter(l => l.evento === activeSession.name)]
    : manualLeads

  // Atualiza um campo do lead (persiste no localStorage)
  const updateLead = useCallback((leadId: string, patch: Partial<Lead>) => {
    setOverrides(prev => {
      const updated = { ...prev, [leadId]: { ...(prev[leadId] || {}), ...patch } }
      saveOverrides(updated)
      return updated
    })
  }, [])

  const updateStatus = useCallback((leadId: string, status: LeadStatus) => {
    updateLead(leadId, { status })
  }, [updateLead])

  // Captura manual no evento
  const addLead = useCallback((lead: Omit<Lead, 'id' | 'capturedAt'>) => {
    const newLead: Lead = {
      ...lead,
      id: `manual-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      capturedAt: new Date().toISOString(),
    }
    setManualLeads(prev => [newLead, ...prev])
  }, [])

  return {
    eventos,
    sessions,
    activeSession,
    activeSessionId,
    setActiveSessionId,
    allLeads,
    loading,
    updateLead,
    updateStatus,
    addLead,
  }
}
