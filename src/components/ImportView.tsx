import React, { useState, useRef, type DragEvent } from 'react'
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, Info } from 'lucide-react'

interface ImportViewProps {
  onImport: (file: File, eventoName: string) => Promise<{ count: number; warnings: string[] }>
}

export function ImportView({ onImport }: ImportViewProps) {
  const [eventoName, setEventoName] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ count: number; warnings: string[] } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) { setError('Selecione um arquivo .csv'); return }
    const name = eventoName.trim() || file.name.replace('.csv', '')
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await onImport(file, name)
      setResult(res)
      setEventoName('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao importar.')
    } finally {
      setLoading(false)
    }
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  return (
    <div style={{ padding: '28px 32px', overflowY: 'auto', height: '100%', maxWidth: 580 }}>
      <div className="animate-fade-up" style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--teal)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
          CSV do Hermes
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px' }}>Importar Leads</h1>
      </div>

      {/* Nome do evento */}
      <div className="animate-fade-up delay-1" style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
          Nome do evento
        </label>
        <input
          value={eventoName}
          onChange={e => setEventoName(e.target.value)}
          placeholder="Ex: Web Summit 2026, INTA London..."
          style={{
            width: '100%', padding: '10px 14px',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', color: 'var(--white)',
            fontSize: 13, fontFamily: 'var(--font-sans)', outline: 'none',
          }}
        />
      </div>

      {/* Drop zone */}
      <div
        className="animate-fade-up delay-2"
        onDrop={onDrop}
        onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `2px dashed ${isDragging ? 'var(--teal)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '48px 32px',
          textAlign: 'center',
          cursor: 'pointer',
          background: isDragging ? 'var(--teal-dim2)' : 'var(--surface)',
          transition: 'all 0.2s',
          marginBottom: 20,
        }}
      >
        {loading ? (
          <Loader2 size={32} style={{ margin: '0 auto 12px', color: 'var(--teal)', animation: 'spin 1s linear infinite' }} />
        ) : isDragging ? (
          <Upload size={32} style={{ margin: '0 auto 12px', color: 'var(--teal)' }} />
        ) : (
          <FileSpreadsheet size={32} style={{ margin: '0 auto 12px', color: 'var(--text-muted)' }} />
        )}
        <p style={{ fontSize: 14, fontWeight: 500, color: loading ? 'var(--teal)' : 'var(--text-secondary)', marginBottom: 4 }}>
          {loading ? 'Importando...' : isDragging ? 'Solte aqui' : 'Arraste o CSV ou clique para selecionar'}
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Suporta CSVs exportados pelo Hermes · Fix de encoding automático
        </p>
        <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }} />
      </div>

      {/* Success */}
      {result && (
        <div className="animate-fade-in" style={{
          background: 'rgba(0,184,169,0.08)', border: '1px solid var(--border-teal)',
          borderRadius: 'var(--radius)', padding: '16px 20px', marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <CheckCircle2 size={14} color="var(--teal)" />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--teal)' }}>
              {result.count} leads importados com sucesso
            </span>
          </div>
          {result.warnings.map((w, i) => (
            <p key={i} style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{w}</p>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="animate-fade-in" style={{
          background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <AlertCircle size={14} color="#ef4444" />
          <span style={{ fontSize: 12, color: '#ef4444' }}>{error}</span>
        </div>
      )}

      {/* Schema reference */}
      <div className="animate-fade-up delay-3" style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '16px 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <Info size={12} color="var(--text-muted)" />
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Colunas reconhecidas
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {['name', 'country', 'industry', 'fit_score', 'match_reasons', 'elevatorPitch', 'email', 'linkedin', 'status', 'responsável', 'notas'].map(col => (
            <span key={col} style={{
              background: 'var(--navy)', border: '1px solid var(--border)',
              borderRadius: 4, padding: '2px 8px', fontSize: 11,
              fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)',
            }}>
              {col}
            </span>
          ))}
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
          Encoding UTF-8 corrigido automaticamente. Compatível com o schema padrão do Hermes.
        </p>
      </div>
    </div>
  )
}
