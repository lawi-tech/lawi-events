import React, { useState, useMemo } from 'react'
import { Search, X, ExternalLink, Mail, Linkedin, ChevronUp, ChevronDown } from 'lucide-react'
import type { Lead, LeadStatus, ScoreRating } from '../lib/types'
import { SCORE_LABELS, STATUS_LABELS, STATUS_COLORS, RESPONSAVEIS } from '../lib/types'

interface LeadsViewProps {
  leads: Lead[]
  onUpdateStatus: (id: string, status: LeadStatus) => void
  onUpdateLead: (id: string, patch: Partial<Lead>) => void
}

type SortKey = 'fitScore' | 'industry' | 'country' | 'name' | 'status'
type SortDir = 'asc' | 'desc'

const SELECT_STYLE: React.CSSProperties = {
  background: '#1e2d3d',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 6,
  color: '#ffffff',
  fontSize: 12,
  fontWeight: 500,
  padding: '5px 8px',
  fontFamily: 'var(--font-sans)',
  cursor: 'pointer',
}

export function LeadsView({ leads, onUpdateStatus, onUpdateLead }: LeadsViewProps) {
  const [search, setSearch] = useState('')
  const [scoreFilter, setScoreFilter] = useState<ScoreRating | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all')
  const [countryFilter, setCountryFilter] = useState('all')
  const [industryFilter, setIndustryFilter] = useState('all')
  const [responsavelFilter, setResponsavelFilter] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('fitScore')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [selected, setSelected] = useState<Lead | null>(null)

  const countries = useMemo(() => {
    const s = new Set(leads.map(l => l.country).filter(c => c && c.length < 60))
    return ['all', ...Array.from(s).sort()]
  }, [leads])

  const industries = useMemo(() => {
    const s = new Set(leads.map(l => l.industry).filter(i => i && i.length < 80))
    return ['all', ...Array.from(s).sort()]
  }, [leads])

  const filtered = useMemo(() => {
    let result = leads.filter(l => {
      const q = search.toLowerCase()
      const matchQ = !q || l.name.toLowerCase().includes(q) || l.company.toLowerCase().includes(q) || l.industry.toLowerCase().includes(q)
      const matchScore = scoreFilter === 'all' || l.scoreRating === scoreFilter
      const matchStatus = statusFilter === 'all' || l.status === statusFilter
      const matchCountry = countryFilter === 'all' || l.country === countryFilter
      const matchIndustry = industryFilter === 'all' || l.industry === industryFilter
      const matchResp = responsavelFilter === 'all' || l.responsavel === responsavelFilter
      return matchQ && matchScore && matchStatus && matchCountry && matchIndustry && matchResp
    })

    result = [...result].sort((a, b) => {
      let av: string | number = '', bv: string | number = ''
      if (sortKey === 'fitScore') { av = a.fitScore ?? -1; bv = b.fitScore ?? -1 }
      else if (sortKey === 'industry') { av = a.industry; bv = b.industry }
      else if (sortKey === 'country') { av = a.country; bv = b.country }
      else if (sortKey === 'name') { av = a.name; bv = b.name }
      else if (sortKey === 'status') { av = a.status; bv = b.status }
      if (typeof av === 'number') return sortDir === 'desc' ? bv as number - av : av - (bv as number)
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
    })

    return result
  }, [leads, search, scoreFilter, statusFilter, countryFilter, industryFilter, responsavelFilter, sortKey, sortDir])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir(key === 'fitScore' ? 'desc' : 'asc') }
  }

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ChevronDown size={10} style={{ opacity: 0.3 }} />
    return sortDir === 'asc' ? <ChevronUp size={10} color="var(--teal)" /> : <ChevronDown size={10} color="var(--teal)" />
  }

  const clearFilters = () => { setScoreFilter('all'); setStatusFilter('all'); setCountryFilter('all'); setIndustryFilter('all'); setResponsavelFilter('all'); setSearch('') }
  const activeFilters = [scoreFilter, statusFilter, countryFilter, industryFilter, responsavelFilter].filter(f => f !== 'all').length + (search ? 1 : 0)

  const thStyle = (k: SortKey): React.CSSProperties => ({
    padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700,
    color: sortKey === k ? 'var(--teal)' : 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap',
    cursor: 'pointer', userSelect: 'none',
  })

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Topbar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome, empresa ou setor..."
                style={{ width: '100%', padding: '8px 10px 8px 30px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--white)', fontSize: 13, fontFamily: 'var(--font-sans)', outline: 'none' }} />
            </div>
            {activeFilters > 0 && (
              <button onClick={clearFilters} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-sans)' }}>
                <X size={12} /> Limpar ({activeFilters})
              </button>
            )}
          </div>

          {/* Filtros inline */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <FilterSelect label="Score" value={scoreFilter} onChange={v => setScoreFilter(v as ScoreRating | 'all')}
              options={[['all','Todos os scores'],['high','🔥 Alto'],['mid','☀️ Médio'],['low','❄️ Baixo']]} />
            <FilterSelect label="Status" value={statusFilter} onChange={v => setStatusFilter(v as LeadStatus | 'all')}
              options={[['all','Todos os status'],['novo','Novo'],['abordado','Abordado'],['reuniao','Reunião'],['proposta','Proposta'],['convertido','Convertido'],['descartado','Descartado']]} />
            <FilterSelect label="Setor" value={industryFilter} onChange={setIndustryFilter}
              options={industries.map(i => [i, i === 'all' ? 'Todos os setores' : i])} />
            <FilterSelect label="País" value={countryFilter} onChange={setCountryFilter}
              options={countries.map(c => [c, c === 'all' ? 'Todos os países' : c])} />
            <FilterSelect label="Responsável" value={responsavelFilter} onChange={setResponsavelFilter}
              options={[['all','Todos'],['','Sem responsável'],...RESPONSAVEIS.map(r => [r,r])]} />
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>
              {filtered.length} de {leads.length}
            </span>
          </div>
        </div>

        {/* Tabela */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead style={{ position: 'sticky', top: 0, background: 'var(--navy)', zIndex: 10 }}>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={thStyle('fitScore')} onClick={() => toggleSort('fitScore')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Score <SortIcon k="fitScore" /></div>
                </th>
                <th style={thStyle('industry')} onClick={() => toggleSort('industry')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Setor <SortIcon k="industry" /></div>
                </th>
                <th style={thStyle('country')} onClick={() => toggleSort('country')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>País <SortIcon k="country" /></div>
                </th>
                <th style={thStyle('name')} onClick={() => toggleSort('name')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Empresa <SortIcon k="name" /></div>
                </th>
                <th style={thStyle('status')} onClick={() => toggleSort('status')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Status <SortIcon k="status" /></div>
                </th>
                <th style={{ ...thStyle('name'), cursor: 'default' }}>Responsável</th>
                <th style={{ padding: '10px 14px' }} />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Nenhum lead encontrado.</td></tr>
              ) : filtered.map(lead => (
                <tr key={lead.id} onClick={() => setSelected(lead)}
                  style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = 'var(--surface-hover)'}
                  onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
                >
                  <td style={{ padding: '11px 14px' }}><ScoreBadge score={lead.fitScore} rating={lead.scoreRating} /></td>
                  <td style={{ padding: '11px 14px', color: 'var(--text-secondary)', maxWidth: 140 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.industry || '—'}</div>
                  </td>
                  <td style={{ padding: '11px 14px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{lead.country || '—'}</td>
                  <td style={{ padding: '11px 14px', maxWidth: 200 }}>
                    <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.name}</div>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <select value={lead.status} onClick={e => e.stopPropagation()}
                      onChange={e => { onUpdateStatus(lead.id, e.target.value as LeadStatus); e.stopPropagation() }}
                      style={{ ...SELECT_STYLE, borderColor: `${STATUS_COLORS[lead.status]}55`, background: `${STATUS_COLORS[lead.status]}22`, color: '#ffffff' }}>
                      {(Object.keys(STATUS_LABELS) as LeadStatus[]).map(s => (
                        <option key={s} value={s} style={{ background: '#0a2540', color: '#ffffff' }}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <select value={lead.responsavel} onClick={e => e.stopPropagation()}
                      onChange={e => { onUpdateLead(lead.id, { responsavel: e.target.value }); e.stopPropagation() }}
                      style={{ ...SELECT_STYLE }}>
                      <option value="" style={{ background: '#0a2540', color: '#ffffff' }}>—</option>
                      {RESPONSAVEIS.map(r => <option key={r} value={r} style={{ background: '#0a2540', color: '#ffffff' }}>{r}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {lead.linkedin && <a href={lead.linkedin} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ color: 'var(--text-muted)' }}><Linkedin size={13} /></a>}
                      {lead.email && <a href={`mailto:${lead.email}`} onClick={e => e.stopPropagation()} style={{ color: 'var(--text-muted)' }}><Mail size={13} /></a>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail panel */}
      {selected && <LeadDetail lead={selected} onClose={() => setSelected(null)} onUpdateStatus={onUpdateStatus} onUpdateLead={onUpdateLead} />}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FilterSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[][]
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{label}:</span>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ ...SELECT_STYLE, borderColor: value !== 'all' ? 'var(--teal)' : 'rgba(255,255,255,0.12)', color: value !== 'all' ? 'var(--teal)' : '#ffffff', background: value !== 'all' ? 'var(--teal-dim)' : '#1e2d3d' }}>
        {options.map(([v, l]) => <option key={v} value={v} style={{ background: '#0a2540', color: '#ffffff' }}>{l}</option>)}
      </select>
    </div>
  )
}

function ScoreBadge({ score, rating }: { score: number | null; rating: string }) {
  const color = rating === 'high' ? 'var(--teal)' : rating === 'mid' ? '#f59e0b' : 'var(--text-muted)'
  const bg = rating === 'high' ? 'var(--teal-dim)' : rating === 'mid' ? 'rgba(245,158,11,0.12)' : 'transparent'
  return (
    <span style={{ background: bg, color, borderRadius: 6, padding: '3px 8px', fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-mono)' }}>
      {score !== null ? score : '—'}
    </span>
  )
}

function LeadDetail({ lead, onClose, onUpdateStatus, onUpdateLead }: {
  lead: Lead; onClose: () => void
  onUpdateStatus: (id: string, s: LeadStatus) => void
  onUpdateLead: (id: string, patch: Partial<Lead>) => void
}) {
  const [notes, setNotes] = useState(lead.notes)

  return (
    <div className="animate-fade-in" style={{ width: 340, flexShrink: 0, borderLeft: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{lead.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lead.industry} · {lead.country}</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
          <X size={16} />
        </button>
      </div>

      <div style={{ padding: '16px 20px', flex: 1 }}>
        {lead.fitScore !== null && (
          <Section label="Score Hermes">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--teal)', fontFamily: 'var(--font-mono)' }}>{lead.fitScore}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>/ 10</span>
            </div>
            {lead.matchReasons && <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{lead.matchReasons}</p>}
          </Section>
        )}
        {lead.elevatorPitch && (
          <Section label="Pitch">
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7, fontStyle: 'italic' }}>"{lead.elevatorPitch}"</p>
          </Section>
        )}
        <Section label="Status">
          <select value={lead.status} onChange={e => onUpdateStatus(lead.id, e.target.value as LeadStatus)}
            style={{ width: '100%', padding: '8px 10px', background: '#1e2d3d', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 'var(--radius-sm)', color: '#ffffff', fontSize: 13, fontFamily: 'var(--font-sans)', cursor: 'pointer' }}>
            {(Object.keys(STATUS_LABELS) as LeadStatus[]).map(s => (
              <option key={s} value={s} style={{ background: '#0a2540', color: '#ffffff' }}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </Section>
        <Section label="Responsável">
          <select value={lead.responsavel} onChange={e => onUpdateLead(lead.id, { responsavel: e.target.value })}
            style={{ width: '100%', padding: '8px 10px', background: '#1e2d3d', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 'var(--radius-sm)', color: '#ffffff', fontSize: 13, fontFamily: 'var(--font-sans)', cursor: 'pointer' }}>
            <option value="" style={{ background: '#0a2540', color: '#ffffff' }}>— Sem responsável</option>
            {RESPONSAVEIS.map(r => <option key={r} value={r} style={{ background: '#0a2540', color: '#ffffff' }}>{r}</option>)}
          </select>
        </Section>
        <Section label="Notas">
          <textarea value={notes} onChange={e => setNotes(e.target.value)} onBlur={() => onUpdateLead(lead.id, { notes })}
            placeholder="Adicione observações..." rows={4}
            style={{ width: '100%', padding: '8px 10px', background: '#1e2d3d', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 'var(--radius-sm)', color: '#ffffff', fontSize: 12, fontFamily: 'var(--font-sans)', resize: 'vertical', lineHeight: 1.6 }} />
        </Section>
        {(lead.linkedin || lead.email) && (
          <Section label="Contato">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {lead.linkedin && <a href={lead.linkedin} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--teal)', fontSize: 12, textDecoration: 'none' }}><Linkedin size={13} /> LinkedIn <ExternalLink size={11} /></a>}
              {lead.email && <a href={`mailto:${lead.email}`} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--teal)', fontSize: 12, textDecoration: 'none' }}><Mail size={13} /> {lead.email}</a>}
            </div>
          </Section>
        )}
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
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  )
}
