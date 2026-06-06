import React from 'react'
import { TrendingUp, Users, AlertCircle, CheckCircle2, Clock, ChevronDown } from 'lucide-react'
import type { Lead, FupAlert, EventSession } from '../lib/types'
import { STATUS_LABELS, STATUS_COLORS } from '../lib/types'

interface DashboardProps {
  leads: Lead[]
  fupAlerts: FupAlert[]
  sessions: EventSession[]
  activeSessionId: string | null
  onSelectSession: (id: string) => void
  onLeadClick: (lead: Lead) => void
}

const SETORES = [
  { key: 'fintech',    label: 'Fintech',     match: (s: string) => /fintech|financ/i.test(s),    color: '#00B8A9', bg: 'rgba(0,184,169,0.1)' },
  { key: 'education',  label: 'Education',   match: (s: string) => /educ|school|learn/i.test(s), color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  { key: 'ecommerce',  label: 'E-commerce',  match: (s: string) => /commerce|retail|shop/i.test(s), color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
]

export function DashboardView({ leads, fupAlerts, sessions, activeSessionId, onSelectSession, onLeadClick }: DashboardProps) {
  const activeSession = sessions.find(s => s.id === activeSessionId)

  const high = leads.filter(l => l.scoreRating === 'high').length
  const mid  = leads.filter(l => l.scoreRating === 'mid').length
  const low  = leads.filter(l => l.scoreRating === 'low').length
  const converted = leads.filter(l => l.status === 'convertido').length
  const active    = leads.filter(l => !['convertido','descartado'].includes(l.status)).length

  const byStatus = (['novo','abordado','reuniao','proposta','convertido','descartado'] as const).map(s => ({
    status: s, count: leads.filter(l => l.status === s).length,
  })).filter(x => x.count > 0)

  const topLeads = leads.filter(l => l.scoreRating === 'high' && l.status !== 'descartado').slice(0, 5)

  return (
    <div style={{ padding: '28px 32px', overflowY: 'auto', height: '100%' }}>

      {/* Header + seletor de evento */}
      <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--teal)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
            Overview
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px' }}>Dashboard</h1>
        </div>

        {/* Seletor de evento */}
        {sessions.length > 0 && (
          <div style={{ position: 'relative' }}>
            <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
              Evento
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={activeSessionId ?? ''}
                onChange={e => onSelectSession(e.target.value)}
                style={{
                  appearance: 'none',
                  background: 'var(--surface)',
                  border: '1px solid var(--border-teal)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--white)',
                  fontSize: 13, fontWeight: 600,
                  padding: '8px 32px 8px 12px',
                  fontFamily: 'var(--font-sans)',
                  cursor: 'pointer', minWidth: 200,
                }}
              >
                {sessions.map(s => (
                  <option key={s.id} value={s.id} style={{ background: 'var(--navy)' }}>
                    {s.name} ({s.leads.length})
                  </option>
                ))}
              </select>
              <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--teal)', pointerEvents: 'none' }} />
            </div>
          </div>
        )}
      </div>

      {/* KPI cards */}
      <div className="animate-fade-up delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total', value: leads.length, color: 'var(--white)' },
          { label: '🔥 Alto Fit', value: high, color: 'var(--teal)' },
          { label: '☀️ Médio Fit', value: mid, color: '#f59e0b' },
          { label: 'Ativos', value: active, color: '#8b5cf6' },
          { label: 'Convertidos', value: converted, color: '#00B8A9' },
        ].map(card => (
          <div key={card.label} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '16px 18px',
          }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{card.label}</div>
            <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-1px', color: card.color }}>{card.value}</span>
          </div>
        ))}
      </div>

      {/* Cards por setor */}
      <div className="animate-fade-up delay-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {SETORES.map(setor => {
          const setorLeads = leads.filter(l => setor.match(l.industry))
          const high = setorLeads.filter(l => l.scoreRating === 'high').length
          const mid  = setorLeads.filter(l => l.scoreRating === 'mid').length
          const low  = setorLeads.filter(l => l.scoreRating === 'low').length
          return (
            <div key={setor.key} style={{
              background: setor.bg, border: `1px solid ${setor.color}33`,
              borderRadius: 'var(--radius)', padding: '18px 20px',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: setor.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                {setor.label}
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-1px', marginBottom: 12 }}>{setorLeads.length}</div>
              <div style={{ display: 'flex', gap: 10, fontSize: 11 }}>
                <span style={{ color: 'var(--teal)' }}>🔥 {high}</span>
                <span style={{ color: '#f59e0b' }}>☀️ {mid}</span>
                <span style={{ color: 'var(--text-muted)' }}>❄️ {low}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Score breakdown */}
        <div className="animate-fade-up delay-2" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px' }}>
          <h3 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Score Hermes</h3>
          {[
            { label: '🔥 Alto fit (≥5)', count: high, color: 'var(--teal)' },
            { label: '☀️ Médio fit (3–4)', count: mid, color: '#f59e0b' },
            { label: '❄️ Baixo fit (<3)', count: low, color: 'rgba(255,255,255,0.2)' },
          ].map(item => (
            <div key={item.label} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.label}</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{item.count}</span>
              </div>
              <div style={{ height: 4, background: 'var(--border)', borderRadius: 2 }}>
                <div style={{ height: '100%', borderRadius: 2, background: item.color, width: leads.length ? `${(item.count / leads.length) * 100}%` : '0%', transition: 'width 0.6s ease' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Pipeline */}
        <div className="animate-fade-up delay-2" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px' }}>
          <h3 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Pipeline</h3>
          {byStatus.length === 0
            ? <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Nenhum dado ainda.</p>
            : byStatus.map(item => (
              <div key={item.status} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[item.status], flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{STATUS_LABELS[item.status]}</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{item.count}</span>
              </div>
            ))
          }
        </div>
      </div>

      {/* FUP Alerts */}
      {fupAlerts.length > 0 && (
        <div className="animate-fade-up delay-3" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius)', padding: '16px 20px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <AlertCircle size={14} color="#ef4444" />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#ef4444' }}>{fupAlerts.length} follow-up{fupAlerts.length > 1 ? 's' : ''} pendente{fupAlerts.length > 1 ? 's' : ''}</span>
          </div>
          {fupAlerts.slice(0, 4).map(a => (
            <div key={a.leadId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(239,68,68,0.1)' }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 500 }}>{a.leadName}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>{a.company}</span>
              </div>
              <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 600 }}>há {a.daysAgo}d</span>
            </div>
          ))}
        </div>
      )}

      {/* Top leads */}
      {topLeads.length > 0 && (
        <div className="animate-fade-up delay-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px' }}>
          <h3 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Top Leads — Alto Fit</h3>
          {topLeads.map(lead => (
            <button key={lead.id} onClick={() => onLeadClick(lead)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 0',
              background: 'none', border: 'none', borderBottom: '1px solid var(--border)',
              cursor: 'pointer', textAlign: 'left',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--teal-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'var(--teal)', flexShrink: 0 }}>
                {lead.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--white)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.industry} · {lead.country}</div>
              </div>
              {lead.fitScore !== null && (
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--teal)', background: 'var(--teal-dim)', padding: '3px 8px', borderRadius: 6, flexShrink: 0 }}>
                  {lead.fitScore}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
