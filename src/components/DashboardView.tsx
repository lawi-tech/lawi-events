import React, { useState, useEffect } from 'react'
import { AlertCircle, ChevronDown } from 'lucide-react'
import type { Lead, FupAlert, EventSession } from '../lib/types'
import { STATUS_LABELS, STATUS_COLORS } from '../lib/types'

interface Props {
  leads: Lead[]
  fupAlerts: FupAlert[]
  sessions: EventSession[]
  activeSessionId: string | null
  onSelectSession: (id: string) => void
  onLeadClick: (lead: Lead) => void
}

const SETORES = [
  { label: 'Fintech',    match: (s: string) => /fintech|financ|payment|banco|bank/i.test(s),    color: 'var(--teal)',  border: 'var(--teal-border)' },
  { label: 'Education',  match: (s: string) => /educ|school|learn|ensino|curso/i.test(s),        color: '#8b5cf6',     border: 'rgba(139,92,246,0.25)' },
  { label: 'E-commerce', match: (s: string) => /commerce|retail|shop|varejo|loja/i.test(s),      color: '#f59e0b',     border: 'rgba(245,158,11,0.25)' },
]

function Dot({ color }: { color: string }) {
  return <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: color, marginRight: 4, flexShrink: 0 }} />
}

export function DashboardView({ leads, fupAlerts, sessions, activeSessionId, onSelectSession, onLeadClick }: Props) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  const high = leads.filter(l => l.scoreRating === 'high').length
  const mid  = leads.filter(l => l.scoreRating === 'mid').length
  const converted = leads.filter(l => l.status === 'convertido').length

  const byStatus = (['novo','abordado','reuniao','proposta','convertido','descartado'] as const)
    .map(s => ({ status: s, count: leads.filter(l => l.status === s).length }))
    .filter(x => x.count > 0)

  const topLeads = leads.filter(l => l.scoreRating === 'high' && l.status !== 'descartado').slice(0, 6)
  const pad = isMobile ? '16px' : '28px 32px'
  const gap = isMobile ? 8 : 10

  return (
    <div style={{ padding: pad, overflowY: 'auto', height: isMobile ? 'auto' : '100%' }}>
      <div className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--teal)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>Visão geral</p>
          <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, letterSpacing: '-0.4px' }}>Dashboard</h1>
        </div>
        {sessions.length > 0 && (
          <div>
            <p style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5 }}>Evento</p>
            <div style={{ position: 'relative' }}>
              <select value={activeSessionId ?? ''} onChange={e => onSelectSession(e.target.value)} style={{
                appearance: 'none', background: 'var(--surface)',
                border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)',
                color: 'var(--white)', fontSize: 12, fontWeight: 600,
                padding: '7px 28px 7px 11px', fontFamily: 'var(--font-sans)', cursor: 'pointer', minWidth: 160,
              }}>
                {sessions.map(s => <option key={s.id} value={s.id} style={{ background: '#0d1f35' }}>{s.name} ({s.leads.length})</option>)}
              </select>
              <ChevronDown size={12} style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--teal)', pointerEvents: 'none' }} />
            </div>
          </div>
        )}
      </div>

      <div className="fade-up d1" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap, marginBottom: gap + 4 }}>
        {[
          { label: 'Total de leads', value: leads.length },
          { label: 'Alto fit', value: high, color: 'var(--teal)' },
          { label: 'Médio fit', value: mid, color: '#f59e0b' },
          { label: 'Convertidos', value: converted, color: '#00B8A9' },
        ].map(c => (
          <div key={c.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: isMobile ? '14px' : '16px 18px' }}>
            <p style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{c.label}</p>
            <span style={{ fontSize: isMobile ? 24 : 28, fontWeight: 800, letterSpacing: '-1px', color: c.color || 'var(--white)' }}>{c.value}</span>
          </div>
        ))}
      </div>

      <div className="fade-up d2" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap, marginBottom: gap + 4 }}>
        {SETORES.map(setor => {
          const sl = leads.filter(l => setor.match(l.industry))
          const h = sl.filter(l => l.scoreRating === 'high').length
          const m = sl.filter(l => l.scoreRating === 'mid').length
          const lo = sl.filter(l => l.scoreRating === 'low').length
          return (
            <div key={setor.label} style={{ background: 'var(--surface)', border: `1px solid ${setor.border}`, borderRadius: 'var(--radius)', padding: isMobile ? '14px' : '16px 18px' }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: setor.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{setor.label}</p>
              <p style={{ fontSize: isMobile ? 22 : 26, fontWeight: 800, letterSpacing: '-1px', marginBottom: 8 }}>{sl.length}</p>
              <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center' }}><Dot color="var(--teal)" />Alto: {h}</span>
                <span style={{ display: 'flex', alignItems: 'center' }}><Dot color="#f59e0b" />Médio: {m}</span>
                <span style={{ display: 'flex', alignItems: 'center' }}><Dot color="var(--text-muted)" />Baixo: {lo}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap, marginBottom: gap + 4 }}>
        <div className="fade-up d2" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: isMobile ? '14px' : '18px 20px' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Distribuição de fit</p>
          {[
            { label: 'Alto fit (score 5–10)', count: high, color: 'var(--teal)' },
            { label: 'Médio fit (score 3–4)', count: mid, color: '#f59e0b' },
            { label: 'Baixo fit (score 0–2)', count: leads.filter(l => l.scoreRating === 'low').length, color: 'rgba(255,255,255,0.15)' },
          ].map(item => (
            <div key={item.label} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{item.label}</span>
                <span style={{ fontSize: 11, fontWeight: 600 }}>{item.count}</span>
              </div>
              <div style={{ height: 3, background: 'var(--border)', borderRadius: 2 }}>
                <div style={{ height: '100%', borderRadius: 2, background: item.color, width: leads.length ? `${(item.count / leads.length) * 100}%` : '0%', transition: 'width 0.5s ease' }} />
              </div>
            </div>
          ))}
        </div>
        <div className="fade-up d2" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: isMobile ? '14px' : '18px 20px' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Pipeline</p>
          {byStatus.length === 0
            ? <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Nenhuma movimentação ainda.</p>
            : byStatus.map(item => (
              <div key={item.status} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Dot color={STATUS_COLORS[item.status]} />
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{STATUS_LABELS[item.status]}</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{item.count}</span>
              </div>
            ))
          }
        </div>
      </div>

      {fupAlerts.length > 0 && (
        <div className="fade-up d3" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 'var(--radius)', padding: '14px', marginBottom: gap + 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <AlertCircle size={13} color="#ef4444" />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#ef4444' }}>{fupAlerts.length} follow-up{fupAlerts.length > 1 ? 's' : ''} pendente{fupAlerts.length > 1 ? 's' : ''}</span>
          </div>
          {fupAlerts.slice(0, 4).map(a => (
            <div key={a.leadId} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(239,68,68,0.08)' }}>
              <span style={{ fontSize: 12 }}>{a.leadName} <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{a.company}</span></span>
              <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 600 }}>há {a.daysAgo}d</span>
            </div>
          ))}
        </div>
      )}

      {topLeads.length > 0 && (
        <div className="fade-up d4" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: isMobile ? '14px' : '18px 20px', marginBottom: isMobile ? 24 : 0 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Leads de maior potencial</p>
          {topLeads.map(lead => (
            <button key={lead.id} onClick={() => onLeadClick(lead)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '9px 0', background: 'none', border: 'none', borderBottom: '1px solid var(--border)',
              cursor: 'pointer', textAlign: 'left',
            }}>
              <div style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--teal-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--teal)', flexShrink: 0 }}>
                {lead.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--white)' }} className="truncate">{lead.name}</p>
                <p style={{ fontSize: 10, color: 'var(--text-muted)' }} className="truncate">{lead.industry} · {lead.country}</p>
              </div>
              {lead.fitScore !== null && (
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--teal)', background: 'var(--teal-dim)', padding: '2px 7px', borderRadius: 4, flexShrink: 0, fontFamily: 'var(--font-mono)' }}>{lead.fitScore}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
