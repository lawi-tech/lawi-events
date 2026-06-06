import type { Lead, LeadSource } from './types'
import { scoreToRating } from './types'

function fixEncoding(text: string): string {
  if (!/Ã|â€|Â/.test(text)) return text
  try {
    const bytes = new Uint8Array(text.length)
    for (let i = 0; i < text.length; i++) bytes[i] = text.charCodeAt(i) & 0xff
    const decoded = new TextDecoder('utf-8').decode(bytes)
    const brokenCount = (text.match(/Ã|â€|Â/g) || []).length
    const fixedCount = (decoded.match(/Ã|â€|Â/g) || []).length
    return fixedCount < brokenCount ? decoded : text
  } catch { return text }
}

function detectSeparator(firstLine: string): string {
  const commas = (firstLine.match(/,/g) || []).length
  const semicolons = (firstLine.match(/;/g) || []).length
  return semicolons > commas ? ';' : ','
}

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
    } else { current += ch }
  }
  result.push(current.trim())
  return result
}

function parseScore(val: string): number | null {
  const n = parseFloat(val)
  return isNaN(n) ? null : n
}

function inferStatus(val: string) {
  const v = (val || '').toLowerCase()
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

  const sep = detectSeparator(lines[0])

  // Mapeia headers normalizados → índice, ignorando colunas vazias
  const rawHeaders = parseCSVLine(lines[0], sep)
  const headerMap: Record<string, number> = {}
  rawHeaders.forEach((h, i) => {
    const norm = h.toLowerCase().replace(/[\s\-]/g, '_').trim()
    if (norm) headerMap[norm] = i
  })

  const get = (row: string[], ...keys: string[]): string => {
    for (const k of keys) {
      const idx = headerMap[k]
      if (idx !== undefined && row[idx]) return fixEncoding(row[idx].trim())
    }
    return ''
  }

  const isHermes = 'fit_score' in headerMap || 'elevatorpitch' in headerMap || 'match_reasons' in headerMap

  const leads: Lead[] = []
  const capturedAt = new Date().toISOString()
  const warnings: string[] = []

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i], sep)
    if (row.every(c => !c)) continue

    const name = get(row, 'name', 'nome', 'lead', 'empresa', 'company')
    if (!name) continue

    // País: só aceita se for string curta e razoável (< 60 chars, sem vírgulas internas)
    const countryRaw = get(row, 'country', 'país', 'pais', 'região', 'regiao')
    const country = countryRaw.length < 60 && !countryRaw.includes(';') ? countryRaw : ''

    // Industry: idem
    const industryRaw = get(row, 'industry', 'industria', 'setor', 'sector')
    const industry = industryRaw.length < 80 ? industryRaw : ''

    const fitScore = parseScore(get(row, 'fit_score', 'score', 'rating', 'prioridade'))

    const lead: Lead = {
      id: `lead-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      company: isHermes ? name : get(row, 'company', 'empresa', 'perfil', 'name'),
      country,
      industry,
      fitScore,
      scoreRating: scoreToRating(fitScore),
      matchReasons: get(row, 'match_reasons'),
      elevatorPitch: get(row, 'elevatorpitch', 'elevator_pitch', 'descricao', 'pitch'),
      status: inferStatus(get(row, 'status')),
      responsavel: get(row, 'responsável', 'responsavel', 'owner', 'assigned'),
      notes: get(row, 'notes', 'notas', 'observações', 'observacoes'),
      linkedin: get(row, 'linkedin', 'linkedin_url'),
      email: get(row, 'email', 'e-mail'),
      source: isHermes ? 'hermes_csv' : 'manual',
      evento: eventoName,
      capturedAt,
    }
    leads.push(lead)
  }

  leads.sort((a, b) => (b.fitScore ?? -1) - (a.fitScore ?? -1))

  if (leads.length === 0) warnings.push('Nenhum lead encontrado. Verifique se o CSV tem coluna "name" ou "nome".')
  else warnings.push(`${leads.length} leads importados (sep: "${sep}", schema: ${isHermes ? 'Hermes' : 'padrão'}).`)

  return { leads, evento: eventoName, source: isHermes ? 'hermes_csv' : 'manual', warnings }
}
