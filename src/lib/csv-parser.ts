import type { Lead, LeadSource } from './types'
import { scoreToRating } from './types'

// ─── Encoding fix ─────────────────────────────────────────────────────────────
// O Hermes gera UTF-8 mas às vezes é interpretado como Latin-1/Windows-1252,
// produzindo sequências como "Ã©" no lugar de "é".
// Estratégia: recodificar via TextDecoder quando necessário.

function fixEncoding(text: string): string {
  // Detecta se há caracteres de encoding quebrado (padrão Mojibake)
  if (!/Ã|â€|Â/.test(text)) return text

  try {
    // Converte string JS (UTF-16) de volta para bytes Latin-1, depois relê como UTF-8
    const bytes = new Uint8Array(text.length)
    for (let i = 0; i < text.length; i++) {
      bytes[i] = text.charCodeAt(i) & 0xff
    }
    const decoded = new TextDecoder('utf-8').decode(bytes)
    // Só usa se o resultado parecer melhor (menos chars de substituição)
    const brokenCount = (text.match(/Ã|â€|Â/g) || []).length
    const fixedCount = (decoded.match(/Ã|â€|Â/g) || []).length
    return fixedCount < brokenCount ? decoded : text
  } catch {
    return text
  }
}

// ─── CSV line parser (lida com aspas e vírgulas dentro de campos) ──────────

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else { inQuotes = !inQuotes }
    } else if (ch === ',' && !inQuotes) {
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
// Colunas Hermes: page, name, country, industry, fit_score, match_reasons, elevatorPitch, id
// Colunas Notion genérico: name/nome, email, company/empresa, status, fonte, região, responsável, notas, linkedin

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

  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/[\s\-]/g, '_'))
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
    const row = parseCSVLine(lines[i])
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
      matchReasons: fixEncoding(get(row, 'match_reasons', 'match reasons', 'razoes', 'notas')),
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
  if (isHermes) warnings.push(`Schema Hermes detectado — ${leads.length} leads importados com score.`)

  return { leads, evento: eventoName, source: isHermes ? 'hermes_csv' : 'manual', warnings }
}
