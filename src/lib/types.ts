export type ScoreRating = 'high' | 'mid' | 'low' | 'unscored'
export type LeadStatus = 'novo' | 'abordado' | 'reuniao' | 'proposta' | 'convertido' | 'descartado'
export type LeadSource = 'hermes_csv' | 'captura_evento' | 'manual'
export type MaturidadeJuridica = 'Alto' | 'Médio' | 'Baixo' | 'não avaliado' | ''

export interface Lead {
  id: string
  name: string
  company: string
  country: string
  industry: string
  fitScore: number | null
  scoreRating: ScoreRating
  matchReasons: string
  elevatorPitch: string
  // Campos jurídicos (output do prompt Hermes fase 2)
  documentosEncontrados: string
  maturidadeJuridica: MaturidadeJuridica
  oportunidadeLawi: string
  // CRM
  status: LeadStatus
  responsavel: string
  notes: string
  linkedin: string
  email: string
  source: LeadSource
  evento: string
  capturedAt: string
}

export interface EventoConfig {
  name: string
  file: string
}

export interface EventSession {
  id: string
  name: string
  file: string
  leads: Lead[]
  loadedAt: string
}

export function scoreToRating(score: number | null): ScoreRating {
  if (score === null) return 'unscored'
  if (score >= 5) return 'high'
  if (score >= 3) return 'mid'
  return 'low'
}

export const SCORE_LABELS: Record<ScoreRating, string> = {
  high: 'Alto',
  mid: 'Médio',
  low: 'Baixo',
  unscored: 'Sem score',
}

export const STATUS_LABELS: Record<LeadStatus, string> = {
  novo: 'Novo',
  abordado: 'Abordado',
  reuniao: 'Reunião',
  proposta: 'Proposta',
  convertido: 'Convertido',
  descartado: 'Descartado',
}

export const STATUS_COLORS: Record<LeadStatus, string> = {
  novo: 'rgba(255,255,255,0.15)',
  abordado: '#f59e0b',
  reuniao: '#8b5cf6',
  proposta: '#3b82f6',
  convertido: '#00B8A9',
  descartado: '#ef4444',
}

export const RESPONSAVEIS = ['Benjamin', 'Eugenia', 'Rayane', 'Alisson', 'Gabriela', 'Jessica', 'Verber']

export interface FupAlert {
  leadId: string
  leadName: string
  company: string
  daysAgo: number
  status: LeadStatus
}

export function calcFupAlerts(leads: Lead[]): FupAlert[] {
  const now = Date.now()
  const alerts: FupAlert[] = []
  for (const lead of leads) {
    if (lead.status === 'convertido' || lead.status === 'descartado') continue
    const captured = new Date(lead.capturedAt).getTime()
    const daysAgo = Math.floor((now - captured) / 86400000)
    const threshold = lead.status === 'proposta' ? 4 : 7
    if (daysAgo >= threshold) {
      alerts.push({ leadId: lead.id, leadName: lead.name, company: lead.company, daysAgo, status: lead.status })
    }
  }
  return alerts.sort((a, b) => b.daysAgo - a.daysAgo)
}
