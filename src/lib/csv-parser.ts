import type { Lead, LeadSource } from './types'
import { scoreToRating } from './types'

// ─── Encoding fix ─────────────────────────────────────────────────────────────

function fixEncoding(text: string): string {
  if (!/Ã|â€|Â/.test(text)) return text
  try {
    const bytes = new Uint8Array(text.length)
    for (let i = 0; i < text.length; i++) {
      bytes[i] = text.charCodeAt(i) & 0xff
    }
    const decoded = new TextDecoder('utf-8').decode(bytes)
    const brokenCount = (text.match(/Ã|â€|Â/g) || []).length
    const fixedCount = (decoded.match(/Ã|â€|Â/g) || []).length
    return fixedCount < brokenCount ? decoded : text
  } catch {
    return text
  }
}

// ─── Detecta separador (vírgula ou ponto e vírgula) ──────────────────────────

function detectSeparator(firstLine: string): string {
  const commas = (firstLine.match(/,/g) || []).length
  const semicolons = (firstLine.match(/;/g) || []).length
  return semicolons > commas ? ';' : ','
}

// ─── CSV line parser ──────────────────────────────────────────────────────────

function parseCSVLine(line: string, sep: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else { inQuotes = !inQuotes }
    } else if (ch === sep && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current.trim())
  return result
}

// ─── Schema Hermes → Lead ─────────────────────────────────────────────────────

function parseScore(val: string): number | null {
  const n = parseFloat(val)
  return isNaN(n) ? null : n
}

function inferStatus(val: string) {
  const v = val.toLowerCase()
  if (v.includes('proposta')) return 'proposta' as const
  if (v.includes('reunia') || v.includes('meeting')) return 'reuniao' as const
  if (v.includes('abordado') || v.includes('contact')) return 'abordado' as const
  if (v.includes('convert') || v.includes('ganho') || v.includes('won')) return 'convertido' as const
  if (v.includes('descard') || v.includes('lost') || v.includes('perdido')) return 'descartado' as const
  return 'novo' as const
}

export interface ParseResult {
  leads: Lead[]
  evento: string
  source: LeadSource
  warnings: string[]
}

export function parseCSV(raw: string, eventoName: string): ParseResult {
  const text = fixEncoding(raw)
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return { leads: [], evento: eventoName, source: 'hermes_csv', warnings: ['CSV vazio ou sem dados.'] }

  // Detecta separador na primeira linha
  const sep = detectSeparator(lines[0])

  const headers = parseCSVLine(lines[0], sep).map(h => h.toLowerCase().replace(/[\s\-]/g, '_'))
  const warnings: string[] = []

  // Detecta schema: Hermes ou Notion genérico
  const isHermes = headers.includes('fit_score') || headers.includes('elevatorpitch') || headers.includes('match_reasons')

  const get = (row: string[], key: string, ...aliases: string[]): string => {
    for (const k of [key, ...aliases]) {
      const idx = headers.indexOf(k)
      if (idx !== -1 && row[idx]) return row[idx]
    }
    return ''
  }

  const leads: Lead[] = []
  const capturedAt = new Date().toISOString()

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i], sep)
    if (row.every(c => !c)) continue

    const name = get(row, 'name', 'nome', 'lead', 'company', 'empresa')
    if (!name) continue

    const fitScoreRaw = isHermes ? get(row, 'fit_score') : get(row, 'score', 'rating', 'prioridade')
    const fitScore = parseScore(fitScoreRaw)

    const lead: Lead = {
      id: `lead-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
      name: fixEncoding(name),
      company: fixEncoding(isHermes ? name : get(row, 'company', 'empresa', 'perfil')),
      country: fixEncoding(get(row, 'country', 'país', 'pais', 'região', 'regiao')),
      industry: fixEncoding(get(row, 'industry', 'industria', 'setor', 'sector')),
      fitScore,
      scoreRating: scoreToRating(fitScore),
      matchReasons: fixEncoding(get(row, 'match_reasons', 'match_reasons', 'razoes', 'notas')),
      elevatorPitch: fixEncoding(get(row, 'elevatorpitch', 'elevator_pitch', 'descricao', 'descrição', 'pitch')),
      status: inferStatus(get(row, 'status', '')),
      responsavel: fixEncoding(get(row, 'responsável', 'responsavel', 'owner', 'assigned')),
      notes: fixEncoding(get(row, 'notes', 'notas', 'observações', 'observacoes')),
      linkedin: get(row, 'linkedin', 'linkedin_url'),
      email: get(row, 'email', 'e-mail'),
      source: isHermes ? 'hermes_csv' : 'manual',
      evento: eventoName,
      capturedAt,
    }
    leads.push(lead)
  }

  // Ordena por fitScore desc
  leads.sort((a, b) => (b.fitScore ?? -1) - (a.fitScore ?? -1))

  if (leads.length === 0) warnings.push('Nenhum lead encontrado. Verifique se o CSV tem coluna "name" ou "nome".')
  else warnings.push(`Schema ${isHermes ? 'Hermes' : 'padrão'} detectado (separador: "${sep}") — ${leads.length} leads importados.`)

  return { leads, evento: eventoName, source: isHermes ? 'hermes_csv' : 'manual', warnings }
}
