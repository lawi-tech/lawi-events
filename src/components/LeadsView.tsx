import React, { useState, useMemo } from 'react'
import { Search, SlidersHorizontal, X, ExternalLink, Mail, Linkedin } from 'lucide-react'
import type { Lead, LeadStatus, ScoreRating } from '../lib/types'
import { SCORE_LABELS, STATUS_LABELS, STATUS_COLORS, RESPONSAVEIS } from '../lib/types'

interface LeadsViewProps {
  leads: Lead[]
  onUpdateStatus: (id: string, status: LeadStatus) => void
  onUpdateLead: (id: string, patch: Partial<Lead>) => void
}

const SCORE_OPTIONS: (ScoreRating | 'all')[] = ['all', 'high', 'mid', 'low']
const STATUS_OPTIONS: (LeadStatus | 'all')[] = ['all', 'novo', 'abordado', 'reuniao', 'proposta', 'convertido', 'descartado']

export function LeadsView({ leads, onUpdateStatus, onUpdateLead }: LeadsViewProps) {
  const [search, setSearch] = useState('')
  const [scoreFilter, setScoreFilter] = useState<ScoreRating | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all')
  const [countryFilter, setCountryFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [selected, setSelected] = useState<Lead | null>(null)

  const countries = useMemo(() => {
    const s = new Set(leads.map(l => l.country).filter(Boolean))
    return ['all', ...Array.from(s).sort()]
  }, [leads])

  const filtered = useMemo(() => leads.filter(l => {
    const q = search.toLowerCase()
    const matchQ = !q || l.name.toLowerCase().includes(q) || l.company.toLowerCase().includes(q) || l.industry.toLowerCase().includes(q)
    const matchScore = scoreFilter === 'all' || l.scoreRating === scoreFilter
    const matchStatus = statusFilter === 'all' || l.status === statusFilter
    const matchCountry = countryFilter === 'all' || l.country === countryFilter
    return matchQ && matchScore && matchStatus && matchCountry
  }), [leads, search, scoreFilter, statusFilter, countryFilter])

  const activeFilters = (scoreFilter !== 'all' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0) + (countryFilter !== 'all' ? 1 : 0)

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.3px' }}>Leads</h1>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                {filtered.length} de {leads.length} leads
              </p>
            </div>
          </div>

          {/* Search + filter toggle */}
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nome, empresa ou setor..."
                style={{
                  width: '100%', padding: '8px 10px 8px 30px',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', color: 'var(--white)',
                  fontSize: 13, fontFamily: 'var(--font-sans)', outline: 'none',
                }}
              />
            </div>
            <button
              onClick={() => setShowFilters(f => !f)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 'var(--radius-sm)',
                border: `1px solid ${showFilters ? 'var(--teal)' : 'var(--border)'}`,
                background: showFilters ? 'var(--teal-dim)' : 'var(--surface)',
                color: showFilters ? 'var(--teal)' : 'var(--text-secondary)',
                cursor: 'pointer', fontSize: 12, fontWeight: 500, fontFamily: 'var(--font-sans)',
              }}
            >
              <SlidersHorizontal size={13} />
              Filtros
              {activeFilters > 0 && (
                <span style={{ background: 'var(--teal)', color: 'var(--navy)', borderRadius: 10, fontSize: 9, fontWeight: 700, padding: '0 5px', minWidth: 16, textAlign: 'center' }}>
                  {activeFilters}
                </span>
              )}
            </button>
            {activeFilters > 0 && (
              <button
                onClick={() => { setScoreFilter('all'); setStatusFilter('all'); setCountryFilter('all') }}
                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-sans)' }}
              >
                <X size={12} /> Limpar
              </button>
            )}
          </div>

          {/* Filter bar */}
          {showFilters && (
            <div className="animate-fade-in" style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              <FilterGroup label="Score" options={SCORE_OPTIONS} value={scoreFilter} onChange={v => setScoreFilter(v as ScoreRating | 'all')}
                labelFn={v => v === 'all' ? 'Todos' : SCORE_LABELS[v as ScoreRating]} />
              <FilterGroup label="Status" options={STATUS_OPTIONS} value={statusFilter} onChange={v => setStatusFilter(v as LeadStatus | 'all')}
                labelFn={v => v === 'all' ? 'Todos' : STATUS_LABELS[v as LeadStatus]} />
              <FilterGroup label="País" options={countries} value={countryFilter} onChange={setCountryFilter}
                labelFn={v => v === 'all' ? 'Todos' : v} />
            </div>
          )}
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              Nenhum lead encontrado.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Score', 'Empresa', 'Setor', 'País', 'Status', 'Responsável', ''].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead, i) => (
                  <tr
                    key={lead.id}
                    className={`animate-fade-up delay-${Math.min(i + 1, 5)}`}
                    onClick={() => setSelected(lead)}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      cursor: 'pointer',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = 'var(--surface-hover)'}
                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <ScoreBadge score={lead.fitScore} rating={lead.scoreRating} />
                    </td>
                    <td style={{ padding: '12px 16px', maxWidth: 180 }}>
                      <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.name}</div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', maxWidth: 140 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.industry}</div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{lead.country}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <StatusSelect
                        status={lead.status}
                        onChange={s => { onUpdateStatus(lead.id, s); }}
                        onClick={e => e.stopPropagation()}
                      />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <select
                        value={lead.responsavel}
                        onClick={e => e.stopPropagation()}
                        onChange={e => { onUpdateLead(lead.id, { responsavel: e.target.value }); e.stopPropagation() }}
                        style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, color: lead.responsavel ? 'var(--white)' : 'var(--text-muted)', fontSize: 12, padding: '4px 8px', fontFamily: 'var(--font-sans)', cursor: 'pointer' }}
                      >
                        <option value="">—</option>
                        {RESPONSAVEIS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {lead.linkedin && <a href={lead.linkedin} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ color: 'var(--text-muted)' }}><Linkedin size={13} /></a>}
                        {lead.email && <a href={`mailto:${lead.email}`} onClick={e => e.stopPropagation()} style={{ color: 'var(--text-muted)' }}><Mail size={13} /></a>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <LeadDetail lead={selected} onClose={() => setSelected(null)} onUpdateStatus={onUpdateStatus} onUpdateLead={onUpdateLead} />
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreBadge({ score, rating }: { score: number | null; rating: string }) {
  const color = rating === 'high' ? 'var(--teal)' : rating === 'mid' ? '#f59e0b' : 'var(--text-muted)'
  const bg = rating === 'high' ? 'var(--teal-dim)' : rating === 'mid' ? 'rgba(245,158,11,0.12)' : 'transparent'
  return (
    <span style={{ background: bg, color, borderRadius: 6, padding: '3px 8px', fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-mono)' }}>
      {score !== null ? score : '—'}
    </span>
  )
}

function StatusSelect({ status, onChange, onClick }: { status: LeadStatus; onChange: (s: LeadStatus) => void; onClick: (e: React.MouseEvent) => void }) {
  return (
    <select
      value={status}
      onClick={onClick}
      onChange={e => onChange(e.target.value as LeadStatus)}
      style={{
        background: `${STATUS_COLORS[status]}22`,
        border: `1px solid ${STATUS_COLORS[status]}55`,
        borderRadius: 6,
        color: STATUS_COLORS[status] === 'rgba(255,255,255,0.18)' ? 'var(--text-secondary)' : STATUS_COLORS[status],
        fontSize: 11, fontWeight: 600, padding: '4px 8px',
        fontFamily: 'var(--font-sans)', cursor: 'pointer',
      }}
    >
      {(Object.keys(STATUS_LABELS) as LeadStatus[]).map(s => (
        <option key={s} value={s} style={{ background: 'var(--navy)', color: 'white' }}>{STATUS_LABELS[s]}</option>
      ))}
    </select>
  )
}

function FilterGroup({ label, options, value, onChange, labelFn }: {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
  labelFn: (v: string) => string
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{label}:</span>
      <div style={{ display: 'flex', gap: 4 }}>
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-sans)',
              background: value === opt ? 'var(--teal)' : 'var(--surface)',
              color: value === opt ? 'var(--navy)' : 'var(--text-secondary)',
              fontWeight: value === opt ? 700 : 400,
            }}
          >
            {labelFn(opt)}
          </button>
        ))}
      </div>
    </div>
  )
}

function LeadDetail({ lead, onClose, onUpdateStatus, onUpdateLead }: {
  lead: Lead
  onClose: () => void
  onUpdateStatus: (id: string, s: LeadStatus) => void
  onUpdateLead: (id: string, patch: Partial<Lead>) => void
}) {
  const [notes, setNotes] = useState(lead.notes)

  return (
    <div className="animate-fade-in" style={{
      width: 340, flexShrink: 0, borderLeft: '1px solid var(--border)',
      background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column',
      overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{lead.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lead.industry} · {lead.country}</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
          <X size={16} />
        </button>
      </div>

      <div style={{ padding: '16px 20px', flex: 1 }}>
        {/* Score */}
        {lead.fitScore !== null && (
          <Section label="Score Hermes">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--teal)', fontFamily: 'var(--font-mono)' }}>{lead.fitScore}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>/ 10</span>
            </div>
            {lead.matchReasons && (
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{lead.matchReasons}</p>
            )}
          </Section>
        )}

        {/* Elevator pitch */}
        {lead.elevatorPitch && (
          <Section label="Pitch">
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7, fontStyle: 'italic' }}>
              "{lead.elevatorPitch}"
            </p>
          </Section>
        )}

        {/* Status */}
        <Section label="Status">
          <select
            value={lead.status}
            onChange={e => onUpdateStatus(lead.id, e.target.value as LeadStatus)}
            style={{
              width: '100%', padding: '8px 10px',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', color: 'var(--white)',
              fontSize: 13, fontFamily: 'var(--font-sans)', cursor: 'pointer',
            }}
          >
            {(Object.keys(STATUS_LABELS) as LeadStatus[]).map(s => (
              <option key={s} value={s} style={{ background: 'var(--navy)' }}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </Section>

        {/* Responsável */}
        <Section label="Responsável">
          <select
            value={lead.responsavel}
            onChange={e => onUpdateLead(lead.id, { responsavel: e.target.value })}
            style={{
              width: '100%', padding: '8px 10px',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', color: 'var(--white)',
              fontSize: 13, fontFamily: 'var(--font-sans)', cursor: 'pointer',
            }}
          >
            <option value="" style={{ background: 'var(--navy)' }}>— Sem responsável</option>
            {RESPONSAVEIS.map(r => <option key={r} value={r} style={{ background: 'var(--navy)' }}>{r}</option>)}
          </select>
        </Section>

        {/* Notas */}
        <Section label="Notas">
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            onBlur={() => onUpdateLead(lead.id, { notes })}
            placeholder="Adicione observações..."
            rows={4}
            style={{
              width: '100%', padding: '8px 10px',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', color: 'var(--white)',
              fontSize: 12, fontFamily: 'var(--font-sans)', resize: 'vertical',
              lineHeight: 1.6,
            }}
          />
        </Section>

        {/* Links */}
        {(lead.linkedin || lead.email) && (
          <Section label="Contato">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {lead.linkedin && (
                <a href={lead.linkedin} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--teal)', fontSize: 12, textDecoration: 'none' }}>
                  <Linkedin size={13} /> LinkedIn <ExternalLink size={11} />
                </a>
              )}
              {lead.email && (
                <a href={`mailto:${lead.email}`} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--teal)', fontSize: 12, textDecoration: 'none' }}>
                  <Mail size={13} /> {lead.email}
                </a>
              )}
            </div>
          </Section>
        )}

        {/* Meta */}
        <Section label="Origem">
          <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 2 }}>
            <div>Evento: <span style={{ color: 'var(--text-secondary)' }}>{lead.evento || '—'}</span></div>
            <div>Fonte: <span style={{ color: 'var(--text-secondary)' }}>{lead.source === 'hermes_csv' ? 'Hermes CSV' : lead.source === 'captura_evento' ? 'Captura no evento' : 'Manual'}</span></div>
            <div>Capturado: <span style={{ color: 'var(--text-secondary)' }}>{new Date(lead.capturedAt).toLocaleDateString('pt-BR')}</span></div>
          </div>
        </Section>
      </div>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
        {label}
      </div>
      {children}
    </div>
  )
}
