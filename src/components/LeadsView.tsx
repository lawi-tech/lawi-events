import React, { useState, useMemo, useRef, useEffect } from 'react'
import { Search, X, ExternalLink, Mail, Linkedin, ChevronUp, ChevronDown } from 'lucide-react'
import type { Lead, LeadStatus, ScoreRating } from '../lib/types'
import { SCORE_LABELS, STATUS_LABELS, STATUS_COLORS, RESPONSAVEIS } from '../lib/types'

interface LeadsViewProps {
  leads: Lead[]
  onUpdateStatus: (id: string, status: LeadStatus) => void
  onUpdateLead: (id: string, patch: Partial<Lead>) => void
}

type SortKey = 'fitScore' | 'industry' | 'country' | 'name' | 'status' | 'responsavel'
type SortDir = 'asc' | 'desc'

// Select estilo institucional com texto sempre legível
const SEL: React.CSSProperties = {
  background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 4, color: '#ffffff', fontSize: 11, fontWeight: 500,
  padding: '4px 7px', fontFamily: 'var(--font-sans)', cursor: 'pointer',
}

// Dropdown de filtro por coluna
function ColFilter({ label, options, value, onChange, onClose }: {
  label: string; options: string[]; value: string
  onChange: (v: string) => void; onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div ref={ref} className="fade-in" style={{
      position: 'absolute', top: '100%', left: 0, zIndex: 100, minWidth: 180,
      background: '#122840', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      padding: 6, marginTop: 4,
    }}>
      <p style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '4px 8px 6px' }}>
        Filtrar por {label}
      </p>
      {options.map(opt => (
        <button key={opt} onClick={() => { onChange(opt); onClose() }} style={{
          width: '100%', display: 'block', textAlign: 'left',
          padding: '6px 10px', borderRadius: 4, border: 'none', cursor: 'pointer',
          background: value === opt ? 'var(--teal-dim)' : 'transparent',
          color: value === opt ? 'var(--teal)' : 'var(--text-secondary)',
          fontSize: 12, fontFamily: 'var(--font-sans)', fontWeight: value === opt ? 600 : 400,
        }}>
          {opt === 'all' ? `Todos` : opt}
        </button>
      ))}
    </div>
  )
}

export function LeadsView({ leads, onUpdateStatus, onUpdateLead }: LeadsViewProps) {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [openFilter, setOpenFilter] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('fitScore')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [selected, setSelected] = useState<Lead | null>(null)

  const setFilter = (key: string, val: string) => setFilters(f => ({ ...f, [key]: val }))
  const getFilter = (key: string) => filters[key] || 'all'

  const industries = useMemo(() => ['all', ...Array.from(new Set(leads.map(l => l.industry).filter(i => i && i.length < 80))).sort()], [leads])
  const countries  = useMemo(() => ['all', ...Array.from(new Set(leads.map(l => l.country).filter(c => c && c.length < 60))).sort()], [leads])
  const statuses   = ['all', 'novo', 'abordado', 'reuniao', 'proposta', 'convertido', 'descartado']
  const scores     = ['all', 'high', 'mid', 'low', 'unscored']
  const resps      = ['all', '', ...RESPONSAVEIS]

  const filtered = useMemo(() => {
    let r = leads.filter(l => {
      const q = search.toLowerCase()
      if (q && !l.name.toLowerCase().includes(q) && !l.industry.toLowerCase().includes(q) && !l.country.toLowerCase().includes(q)) return false
      if (getFilter('industry') !== 'all' && l.industry !== getFilter('industry')) return false
      if (getFilter('country') !== 'all' && l.country !== getFilter('country')) return false
      if (getFilter('status') !== 'all' && l.status !== getFilter('status')) return false
      if (getFilter('score') !== 'all' && l.scoreRating !== getFilter('score')) return false
      if (getFilter('responsavel') !== 'all' && l.responsavel !== getFilter('responsavel')) return false
      return true
    })
    r = [...r].sort((a, b) => {
      let av: any = a[sortKey as keyof Lead], bv: any = b[sortKey as keyof Lead]
      if (sortKey === 'fitScore') { av = a.fitScore ?? -1; bv = b.fitScore ?? -1 }
      if (typeof av === 'number') return sortDir === 'desc' ? bv - av : av - bv
      return sortDir === 'asc' ? String(av||'').localeCompare(String(bv||'')) : String(bv||'').localeCompare(String(av||''))
    })
    return r
  }, [leads, search, filters, sortKey, sortDir])

  const activeFilterCount = Object.values(filters).filter(v => v && v !== 'all').length + (search ? 1 : 0)

  const toggleSort = (key: SortKey) => {
    if (openFilter) { setOpenFilter(null); return }
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir(key === 'fitScore' ? 'desc' : 'asc') }
  }

  // Cabeçalho com ordenação + filtro dropdown
  const Th = ({ label, sortK, filterK, options }: { label: string; sortK: SortKey; filterK: string; options: string[] }) => {
    const isFiltered = getFilter(filterK) !== 'all'
    const isSorted = sortKey === sortK
    const isOpen = openFilter === filterK
    return (
      <th style={{ padding: '9px 12px', textAlign: 'left', whiteSpace: 'nowrap', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button onClick={() => toggleSort(sortK)} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', gap: 3,
            fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: isSorted ? 'var(--teal)' : 'var(--text-muted)',
            fontFamily: 'var(--font-sans)',
          }}>
            {label}
            {isSorted
              ? sortDir === 'asc' ? <ChevronUp size={9} color="var(--teal)" /> : <ChevronDown size={9} color="var(--teal)" />
              : <ChevronDown size={9} style={{ opacity: 0.3 }} />
            }
          </button>
          <button onClick={e => { e.stopPropagation(); setOpenFilter(isOpen ? null : filterK) }} style={{
            background: isFiltered ? 'var(--teal)' : 'rgba(255,255,255,0.08)',
            border: 'none', borderRadius: 3, cursor: 'pointer',
            width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 8, color: isFiltered ? 'var(--navy)' : 'var(--text-muted)', fontWeight: 700, lineHeight: 1 }}>▼</span>
          </button>
        </div>
        {isOpen && (
          <ColFilter label={label} options={options} value={getFilter(filterK)}
            onChange={v => setFilter(filterK, v)} onClose={() => setOpenFilter(null)} />
        )}
      </th>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Barra de busca */}
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', flexShrink: 0, display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome, empresa ou setor..."
              style={{ width: '100%', padding: '7px 10px 7px 28px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--white)', fontSize: 12, fontFamily: 'var(--font-sans)', outline: 'none' }} />
          </div>
          {activeFilterCount > 0 && (
            <button onClick={() => { setFilters({}); setSearch('') }} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-sans)' }}>
              <X size={11} /> Limpar filtros ({activeFilterCount})
            </button>
          )}
          <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{filtered.length} de {leads.length}</span>
        </div>

        {/* Tabela */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead style={{ position: 'sticky', top: 0, background: 'var(--navy-light)', zIndex: 10, borderBottom: '1px solid var(--border)' }}>
              <tr>
                <Th label="Setor"        sortK="industry"   filterK="industry"   options={industries} />
                <Th label="País"         sortK="country"    filterK="country"    options={countries} />
                <Th label="Empresa"      sortK="name"       filterK="score"      options={scores.map(s => s === 'all' ? 'all' : SCORE_LABELS[s as ScoreRating] || s)} />
                <Th label="Status"       sortK="status"     filterK="status"     options={statuses} />
                <Th label="Responsável"  sortK="responsavel" filterK="responsavel" options={resps.map(r => r === '' ? '(sem responsável)' : r)} />
                <th style={{ padding: '9px 12px' }} />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Nenhum lead encontrado.</td></tr>
                : filtered.map(lead => (
                  <tr key={lead.id} onClick={() => setSelected(s => s?.id === lead.id ? null : lead)}
                    style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', background: selected?.id === lead.id ? 'var(--surface-hover)' : 'transparent' }}
                    onMouseEnter={e => { if (selected?.id !== lead.id) (e.currentTarget as HTMLElement).style.background = 'var(--surface)' }}
                    onMouseLeave={e => { if (selected?.id !== lead.id) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                  >
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', maxWidth: 140 }}>
                      <div className="truncate">{lead.industry || '—'}</div>
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{lead.country || '—'}</td>
                    <td style={{ padding: '10px 12px', maxWidth: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {lead.fitScore !== null && (
                          <span style={{
                            fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', flexShrink: 0,
                            color: lead.scoreRating === 'high' ? 'var(--teal)' : lead.scoreRating === 'mid' ? '#f59e0b' : 'var(--text-muted)',
                          }}>{lead.fitScore}</span>
                        )}
                        <span className="truncate" style={{ fontWeight: 500 }}>{lead.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px' }} onClick={e => e.stopPropagation()}>
                      <select value={lead.status} onChange={e => onUpdateStatus(lead.id, e.target.value as LeadStatus)}
                        style={{
                          ...SEL,
                          borderColor: `${STATUS_COLORS[lead.status]}66`,
                          background: lead.status === 'novo' ? 'rgba(255,255,255,0.08)' : `${STATUS_COLORS[lead.status]}22`,
                          color: lead.status === 'novo' ? 'rgba(255,255,255,0.7)' : STATUS_COLORS[lead.status],
                          fontWeight: 600,
                        }}>
                        {(Object.keys(STATUS_LABELS) as LeadStatus[]).map(s => <option key={s} value={s} style={{ background: '#0d1f35', color: '#ffffff' }}>{STATUS_LABELS[s]}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '10px 12px' }} onClick={e => e.stopPropagation()}>
                      <select value={lead.responsavel} onChange={e => onUpdateLead(lead.id, { responsavel: e.target.value })} style={SEL}>
                        <option value="" style={{ background: '#0d1f35' }}>—</option>
                        {RESPONSAVEIS.map(r => <option key={r} value={r} style={{ background: '#0d1f35' }}>{r}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '10px 12px' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {lead.linkedin && <a href={lead.linkedin} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)' }}><Linkedin size={12} /></a>}
                        {lead.email && <a href={`mailto:${lead.email}`} style={{ color: 'var(--text-muted)' }}><Mail size={12} /></a>}
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Painel de detalhe */}
      {selected && <LeadDetail lead={selected} onClose={() => setSelected(null)} onUpdateStatus={onUpdateStatus} onUpdateLead={onUpdateLead} />}
    </div>
  )
}

function LeadDetail({ lead, onClose, onUpdateStatus, onUpdateLead }: {
  lead: Lead; onClose: () => void
  onUpdateStatus: (id: string, s: LeadStatus) => void
  onUpdateLead: (id: string, patch: Partial<Lead>) => void
}) {
  const [notes, setNotes] = useState(lead.notes)

  useEffect(() => { setNotes(lead.notes) }, [lead.id])

  return (
    <div className="fade-in" style={{ width: 320, flexShrink: 0, borderLeft: '1px solid var(--border)', background: 'var(--navy-light)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <p className="truncate" style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{lead.name}</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lead.industry} · {lead.country}</p>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px 4px', flexShrink: 0 }}>
          <X size={14} />
        </button>
      </div>

      <div style={{ padding: '14px 18px', flex: 1 }}>
        {/* Score */}
        {lead.fitScore !== null && (
          <Sec label="Fit Score">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--teal)', fontFamily: 'var(--font-mono)' }}>{lead.fitScore}</span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>/ 10 · {SCORE_LABELS[lead.scoreRating]}</span>
            </div>
            {lead.matchReasons && <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{lead.matchReasons}</p>}
          </Sec>
        )}

        {/* Pitch */}
        {lead.elevatorPitch && (
          <Sec label="Sobre a empresa">
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7, fontStyle: 'italic' }}>"{lead.elevatorPitch}"</p>
          </Sec>
        )}

        {/* Análise jurídica */}
        {(lead.documentosEncontrados || lead.maturidadeJuridica || lead.oportunidadeLawi) && (
          <Sec label="Análise jurídica">
            {lead.maturidadeJuridica && lead.maturidadeJuridica !== 'não avaliado' && (
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Maturidade: </span>
                <span style={{ fontSize: 11, color: lead.maturidadeJuridica === 'Baixo' ? '#f59e0b' : lead.maturidadeJuridica === 'Alto' ? 'var(--teal)' : 'var(--text-secondary)' }}>{lead.maturidadeJuridica}</span>
              </div>
            )}
            {lead.documentosEncontrados && <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 6 }}><strong style={{ color: 'var(--text-muted)', fontSize: 10, textTransform: 'uppercase' }}>Docs: </strong>{lead.documentosEncontrados}</p>}
            {lead.oportunidadeLawi && <p style={{ fontSize: 11, color: 'var(--teal)', lineHeight: 1.5 }}>{lead.oportunidadeLawi}</p>}
          </Sec>
        )}

        {/* Status */}
        <Sec label="Status">
          <select value={lead.status} onChange={e => onUpdateStatus(lead.id, e.target.value as LeadStatus)}
            style={{ width: '100%', padding: '7px 10px', background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 'var(--radius-sm)', color: '#ffffff', fontSize: 12, fontFamily: 'var(--font-sans)', cursor: 'pointer' }}>
            {(Object.keys(STATUS_LABELS) as LeadStatus[]).map(s => <option key={s} value={s} style={{ background: '#0d1f35' }}>{STATUS_LABELS[s]}</option>)}
          </select>
        </Sec>

        {/* Responsável */}
        <Sec label="Responsável">
          <select value={lead.responsavel} onChange={e => onUpdateLead(lead.id, { responsavel: e.target.value })}
            style={{ width: '100%', padding: '7px 10px', background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 'var(--radius-sm)', color: '#ffffff', fontSize: 12, fontFamily: 'var(--font-sans)', cursor: 'pointer' }}>
            <option value="" style={{ background: '#0d1f35' }}>Sem responsável</option>
            {RESPONSAVEIS.map(r => <option key={r} value={r} style={{ background: '#0d1f35' }}>{r}</option>)}
          </select>
        </Sec>

        {/* Notas */}
        <Sec label="Notas">
          <textarea value={notes} onChange={e => setNotes(e.target.value)} onBlur={() => onUpdateLead(lead.id, { notes })}
            placeholder="Observações, próximos passos..." rows={4}
            style={{ width: '100%', padding: '7px 10px', background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 'var(--radius-sm)', color: '#ffffff', fontSize: 11, fontFamily: 'var(--font-sans)', resize: 'vertical', lineHeight: 1.6 }} />
        </Sec>

        {/* Links */}
        {(lead.linkedin || lead.email) && (
          <Sec label="Contato">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {lead.linkedin && <a href={lead.linkedin} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--teal)', fontSize: 11, textDecoration: 'none' }}><Linkedin size={12} /> LinkedIn <ExternalLink size={10} /></a>}
              {lead.email && <a href={`mailto:${lead.email}`} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--teal)', fontSize: 11, textDecoration: 'none' }}><Mail size={12} /> {lead.email}</a>}
            </div>
          </Sec>
        )}

        <Sec label="Origem">
          <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 2 }}>
            <div>Evento: <span style={{ color: 'var(--text-secondary)' }}>{lead.evento || '—'}</span></div>
            <div>Fonte: <span style={{ color: 'var(--text-secondary)' }}>{lead.source === 'hermes_csv' ? 'Hermes CSV' : lead.source === 'captura_evento' ? 'Captura no evento' : 'Manual'}</span></div>
          </div>
        </Sec>
      </div>
    </div>
  )
}

function Sec({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <p style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 7 }}>{label}</p>
      {children}
    </div>
  )
}
