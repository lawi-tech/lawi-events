import React from 'react'
import { TrendingUp, Users, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import type { Lead, FupAlert } from '../lib/types'
import { STATUS_LABELS, STATUS_COLORS } from '../lib/types'

interface DashboardProps {
  leads: Lead[]
  fupAlerts: FupAlert[]
  eventoName: string
  onLeadClick: (lead: Lead) => void
}

export function DashboardView({ leads, fupAlerts, eventoName, onLeadClick }: DashboardProps) {
  const high = leads.filter(l => l.scoreRating === 'high').length
  const mid  = leads.filter(l => l.scoreRating === 'mid').length
  const low  = leads.filter(l => l.scoreRating === 'low').length
  const converted = leads.filter(l => l.status === 'convertido').length
  const active    = leads.filter(l => !['convertido','descartado'].includes(l.status)).length

  // Pipeline breakdown
  const byStatus = (['novo','abordado','reuniao','proposta','convertido','descartado'] as const).map(s => ({
    status: s,
    count: leads.filter(l => l.status === s).length,
  })).filter(x => x.count > 0)

  // Top leads (high score, not descartado)
  const topLeads = leads.filter(l => l.scoreRating === 'high' && l.status !== 'descartado').slice(0, 5)

  return (
    <div style={{ padding: '28px 32px', overflowY: 'auto', height: '100%' }}>
      {/* Header */}
      <div className="animate-fade-up" style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--teal)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
          {eventoName || 'Sem evento selecionado'}
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px' }}>Dashboard</h1>
      </div>

      {/* KPI cards */}
      <div className="animate-fade-up delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Leads', value: leads.length, icon: Users, color: 'var(--teal)' },
          { label: 'Alto Score', value: high, icon: TrendingUp, color: '#f59e0b' },
          { label: 'Ativos', value: active, icon: Clock, color: '#8b5cf6' },
          { label: 'Convertidos', value: converted, icon: CheckCircle2, color: '#00B8A9' },
        ].map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '18px 20px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{card.label}</span>
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: `${card.color}22`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={14} color={card.color} />
                </div>
              </div>
              <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-1px' }}>{card.value}</span>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Score breakdown */}
        <div className="animate-fade-up delay-2" style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '20px',
        }}>
          <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
            Score Hermes
          </h3>
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
                <div style={{
                  height: '100%', borderRadius: 2,
                  background: item.color,
                  width: leads.length ? `${(item.count / leads.length) * 100}%` : '0%',
                  transition: 'width 0.6s ease',
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Pipeline */}
        <div className="animate-fade-up delay-2" style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '20px',
        }}>
          <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
            Pipeline
          </h3>
          {byStatus.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Nenhum dado ainda.</p>
          ) : byStatus.map(item => (
            <div key={item.status} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[item.status], flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{STATUS_LABELS[item.status]}</span>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FUP Alerts */}
      {fupAlerts.length > 0 && (
        <div className="animate-fade-up delay-3" style={{
          background: 'rgba(239,68,68,0.06)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 'var(--radius)',
          padding: '16px 20px',
          marginBottom: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <AlertCircle size={14} color="#ef4444" />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#ef4444' }}>
              {fupAlerts.length} follow-up{fupAlerts.length > 1 ? 's' : ''} pendente{fupAlerts.length > 1 ? 's' : ''}
            </span>
          </div>
          {fupAlerts.slice(0, 4).map(a => (
            <div key={a.leadId} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '6px 0', borderBottom: '1px solid rgba(239,68,68,0.1)',
            }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 500 }}>{a.leadName}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>{a.company}</span>
              </div>
              <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 600 }}>
                há {a.daysAgo}d
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Top leads */}
      {topLeads.length > 0 && (
        <div className="animate-fade-up delay-4" style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '20px',
        }}>
          <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
            Top Leads — Alto Fit
          </h3>
          {topLeads.map(lead => (
            <button
              key={lead.id}
              onClick={() => onLeadClick(lead)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 0', borderBottom: '1px solid var(--border)',
                background: 'none', border: 'none',
                cursor: 'pointer', textAlign: 'left',
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: 'var(--teal-dim)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color: 'var(--teal)', flexShrink: 0,
              }}>
                {lead.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {lead.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {lead.industry} · {lead.country}
                </div>
              </div>
              <div style={{
                fontSize: 13, fontWeight: 700, color: 'var(--teal)',
                background: 'var(--teal-dim)', padding: '3px 8px', borderRadius: 6, flexShrink: 0,
              }}>
                {lead.fitScore}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
