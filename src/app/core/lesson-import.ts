import { parseReferences } from './reference-parser';

/**
 * Extrai de um texto colado da revista apenas dados de referência:
 * número e título da lição, tema do trimestre e referências bíblicas.
 * Todo o restante do texto é descartado e nunca é armazenado.
 */
export interface LessonImport {
  number?: number;
  title?: string;
  theme?: string;
  goldenText?: string;
  reading?: string;
  /** Segunda a sábado; null quando não encontrado. */
  daily: (string | null)[];
}

const DAYS = ['SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO'];
const SMALL_WORDS = new Set(['a', 'o', 'as', 'os', 'e', 'de', 'da', 'do', 'das', 'dos', 'em', 'no', 'na', 'nos', 'nas', 'à', 'ao', 'com', 'por', 'para']);

const stripAccents = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '');

const isValidRef = (text: string) => {
  const result = parseReferences(text);
  return result.refs.length > 0 && result.errors.length === 0;
};

/** "REGOZIJAI-VOS NO SENHOR" → "Regozijai-vos no Senhor" */
function fromUpperCase(text: string): string {
  if (text !== text.toUpperCase()) return text;
  return text
    .toLowerCase()
    .split(' ')
    .map((word, i) => (i > 0 && SMALL_WORDS.has(word) ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(' ');
}

/** Maior prefixo de palavras que forma uma referência válida ("At 16.12 Filipos, …" → "At 16.12"). */
function leadingReference(text: string): string | null {
  const words = text.trim().split(/\s+/);
  for (let n = Math.min(words.length, 12); n > 0; n--) {
    const candidate = words.slice(0, n).join(' ').replace(/[.,;:]$/, '');
    if (isValidRef(candidate)) return candidate;
  }
  return null;
}

export function importLesson(raw: string): LessonImport {
  const text = raw.normalize('NFC').replace(/\r/g, '');
  const result: LessonImport = { daily: Array(6).fill(null) };

  const title = text.match(/Li[çc][ãa]o\s*0?(\d{1,2})\s*[:–-]\s*([^|\n]+)/i);
  if (title) {
    result.number = Number(title[1]);
    result.title = title[2].trim();
  }

  const theme = text.match(/TEMA\s*:\s*([^–|\n]+?)\s*(?:[–|]|\n|$)/i);
  if (theme) result.theme = fromUpperCase(theme[1].trim());

  // Texto Áureo / Principal: a referência entre parênteses logo depois do título da seção
  const golden = text.match(/TEXTO\s+(?:[ÁA]UREO|PRINCIPAL)[\s\S]{0,800}?\(([^)]+)\)/i);
  if (golden && isValidRef(golden[1].trim())) result.goldenText = golden[1].trim();

  // Leitura bíblica em classe: a linha seguinte ao título da seção
  const reading = text.match(/(?:TEXTO\s+B[ÍI]BLICO|LEITURA\s+B[ÍI]BLICA\s+EM\s+CLASSE)\s*\n\s*([^\n]+)/i);
  const readingRef = reading && leadingReference(reading[1]);
  if (readingRef) result.reading = readingRef;

  // Leitura semanal: "SEGUNDA — At 16.12 Descrição…"
  for (const line of text.split('\n')) {
    const match = stripAccents(line).match(/^\s*(SEGUNDA|TERCA|QUARTA|QUINTA|SEXTA|SABADO)(?:-FEIRA)?\s*[—–-]\s*/i);
    if (!match) continue;
    const index = DAYS.map(stripAccents).indexOf(match[1].toUpperCase());
    const ref = leadingReference(line.slice(match[0].length));
    if (index >= 0 && ref) result.daily[index] = ref;
  }

  return result;
}

export function hasImportData(data: LessonImport): boolean {
  return !!(data.title || data.goldenText || data.reading || data.daily.some(Boolean));
}
