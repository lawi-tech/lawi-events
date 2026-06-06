import React, { useState } from 'react'
import { CheckCircle2, UserPlus } from 'lucide-react'
import type { Lead } from '../lib/types'
import { RESPONSAVEIS } from '../lib/types'

interface CaptureViewProps {
  onAddLead: (lead: Omit<Lead, 'id' | 'capturedAt'>) => void
  eventoName: string
}

const CANAIS = ['LinkedIn', 'Email', 'Crachá', 'Indicação', 'Stand', 'Palestra', 'Outro']

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
      {label}
    </label>
    {children}
  </div>
)

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px',
  background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)', color: 'var(--white)',
  fontSize: 14, fontFamily: 'var(--font-sans)', outline: 'none',
}

export function CaptureView({ onAddLead, eventoName }: CaptureViewProps) {
  const empty = { name: '', company: '', country: '', industry: '', canal: '', responsavel: '', notes: '', linkedin: '', email: '' }
  const [form, setForm] = useState(empty)
  const [saved, setSaved] = useState(false)

  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = () => {
    if (!form.name.trim()) return
    onAddLead({
      name: form.name.trim(),
      company: form.company.trim() || form.name.trim(),
      country: form.country.trim(),
      industry: form.industry.trim(),
      fitScore: null,
      scoreRating: 'unscored',
      matchReasons: form.canal ? `Canal: ${form.canal}` : '',
      elevatorPitch: '',
      status: 'novo',
      responsavel: form.responsavel,
      notes: form.notes.trim(),
      linkedin: form.linkedin.trim(),
      email: form.email.trim(),
      source: 'captura_evento',
      evento: eventoName || 'Evento',
      documentosEncontrados: '',
      maturidadeJuridica: '',
      oportunidadeLawi: '',
    })
    setForm(empty)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div style={{ padding: '28px 24px', overflowY: 'auto', height: '100%', maxWidth: 480 }}>
      <div className="animate-fade-up" style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--teal)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
          {eventoName || 'Evento atual'}
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px' }}>Capturar Lead</h1>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Preencha os dados do contato no evento</p>
      </div>

      {saved && (
        <div className="animate-fade-in" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(0,184,169,0.1)', border: '1px solid var(--border-teal)',
          borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: 20,
        }}>
          <CheckCircle2 size={15} color="var(--teal)" />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--teal)' }}>Lead salvo!</span>
        </div>
      )}

      <div className="animate-fade-up delay-1">
        <Field label="Nome / Empresa *">
          <input value={form.name} onChange={set('name')} placeholder="Nome ou empresa..." style={inputStyle} autoFocus />
        </Field>

        <Field label="Empresa">
          <input value={form.company} onChange={set('company')} placeholder="Nome da empresa (se diferente)..." style={inputStyle} />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="País">
            <input value={form.country} onChange={set('country')} placeholder="Brasil, Argentina..." style={inputStyle} />
          </Field>
          <Field label="Setor">
            <input value={form.industry} onChange={set('industry')} placeholder="Fintech, SaaS..." style={inputStyle} />
          </Field>
        </div>

        <Field label="Canal de contato">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {CANAIS.map(c => (
              <button
                key={c}
                onClick={() => setForm(f => ({ ...f, canal: f.canal === c ? '' : c }))}
                style={{
                  padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  fontSize: 12, fontFamily: 'var(--font-sans)',
                  background: form.canal === c ? 'var(--teal)' : 'var(--surface)',
                  color: form.canal === c ? 'var(--navy)' : 'var(--text-secondary)',
                  fontWeight: form.canal === c ? 700 : 400,
                  transition: 'all 0.15s',
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Responsável">
          <select value={form.responsavel} onChange={set('responsavel')} style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="" style={{ background: 'var(--navy)' }}>— Selecione</option>
            {RESPONSAVEIS.map(r => <option key={r} value={r} style={{ background: 'var(--navy)' }}>{r}</option>)}
          </select>
        </Field>

        <Field label="LinkedIn">
          <input value={form.linkedin} onChange={set('linkedin')} placeholder="linkedin.com/in/..." style={inputStyle} />
        </Field>

        <Field label="Email">
          <input value={form.email} onChange={set('email')} type="email" placeholder="contato@empresa.com" style={inputStyle} />
        </Field>

        <Field label="Notas rápidas">
          <textarea
            value={form.notes}
            onChange={set('notes')}
            placeholder="Impressões, próximos passos, contexto da conversa..."
            rows={3}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
          />
        </Field>

        <button
          onClick={handleSubmit}
          disabled={!form.name.trim()}
          style={{
            width: '100%', padding: '14px',
            background: form.name.trim() ? 'var(--teal)' : 'var(--surface)',
            color: form.name.trim() ? 'var(--navy)' : 'var(--text-muted)',
            border: 'none', borderRadius: 'var(--radius)',
            fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-sans)',
            cursor: form.name.trim() ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.2s',
          }}
        >
          <UserPlus size={16} />
          Salvar Lead
        </button>
      </div>
    </div>
  )
}
