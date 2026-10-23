import { BOOKS } from './books';

export interface ParsedRef {
  bookId: string;
  chapter: number;
  from?: number;
  to?: number;
  label: string;
}

export interface ParseResult {
  refs: ParsedRef[];
  errors: string[];
}

const normalize = (text: string) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[\s.]/g, '');

// Abreviações e nomes alternativos comuns em revistas e Bíblias em português
const ALIASES: Record<string, string> = {
  gen: 'GEN', exo: 'EXO', ex: 'EXO', lev: 'LEV', num: 'NUM', deut: 'DEU', deu: 'DEU',
  jos: 'JOS', juizes: 'JDG', jui: 'JDG', rute: 'RUT',
  '1sam': '1SA', '2sam': '2SA', '1rs': '1KI', '2rs': '2KI', '1reis': '1KI', '2reis': '2KI',
  '1cron': '1CH', '2cron': '2CH', esd: 'EZR', nee: 'NEH', est: 'EST',
  job: 'JOB', jó: 'JOB', salmo: 'PSA', sal: 'PSA', sl: 'PSA', prov: 'PRO', pro: 'PRO', ecl: 'ECC',
  cantares: 'SNG', canticodoscanticos: 'SNG', cantico: 'SNG', isa: 'ISA', jer: 'JER', lam: 'LAM',
  eze: 'EZK', dan: 'DAN', ose: 'HOS', oseias: 'HOS', joel: 'JOL', amos: 'AMO', obd: 'OBA', jon: 'JON',
  miq: 'MIC', miqueias: 'MIC', nau: 'NAM', hab: 'HAB', sof: 'ZEP', zac: 'ZEC', mal: 'MAL',
  mat: 'MAT', mar: 'MRK', luc: 'LUK', joao: 'JHN', jo: 'JHN', atos: 'ACT', rom: 'ROM',
  '1cor': '1CO', '2cor': '2CO', gal: 'GAL', efe: 'EPH', fil: 'PHP', fl: 'PHP', col: 'COL',
  '1tes': '1TH', '2tes': '2TH', '1tim': '1TI', '2tim': '2TI', tit: 'TIT', filemon: 'PHM', flm: 'PHM',
  heb: 'HEB', tia: 'JAS', '1ped': '1PE', '2ped': '2PE', '1joao': '1JN', '2joao': '2JN', '3joao': '3JN',
  jud: 'JUD', apoc: 'REV', apocalipse: 'REV',
};

const BOOK_KEYS = new Map<string, string>();
for (const book of BOOKS) {
  BOOK_KEYS.set(normalize(book.name), book.id);
  BOOK_KEYS.set(normalize(book.abbrev), book.id);
}
for (const [alias, id] of Object.entries(ALIASES)) {
  BOOK_KEYS.set(normalize(alias), id);
}
// "Jo" é João; "Jó" (com acento) é o livro de Jó
BOOK_KEYS.set('jo', 'JHN');

function findBookId(raw: string): string | undefined {
  // Aceita algarismos romanos no início: "I Coríntios", "II Reis"
  const roman = raw.trim().match(/^(iii|ii|i)\s+(.+)$/i);
  const text = roman ? `${roman[1].length}${roman[2]}` : raw;
  if (/^j[óÓ]$/i.test(text.trim())) return 'JOB';

  const key = normalize(text);
  const exact = BOOK_KEYS.get(key);
  if (exact) return exact;
  if (key.length < 3) return undefined;
  // Prefixo do nome completo: "Deuteron" → Deuteronômio
  return BOOKS.find((b) => normalize(b.name).startsWith(key))?.id;
}

// Livro + capítulo + versículos opcionais: "At 16.9,10", "Js 6:1-20", "Mt 5,1-12", "Sl 23"
const REF_PATTERN = /^(.+?)\s*(\d+)(?:\s*([:.,])\s*(\d[\d\s,\-–]*))?$/;
// Trecho que atravessa capítulos: "1Sm 9.15-10.1", "Is 52.13–53.12"
const CROSS_CHAPTER_PATTERN = /^(.+?)\s*(\d+)\s*[:.]\s*(\d+)\s*[-–]\s*(\d+)\s*[:.]\s*(\d+)$/;
/** "Até o fim do capítulo" (os capítulos têm no máximo 176 versículos). */
const END_OF_CHAPTER = 999;
// Continuação sem o nome do livro: "23.27" em "At 22.29; 23.27"
const CONTINUATION_PATTERN = /^\d+\s*[:.]\s*\d/;

/** Converte "9,10,12-14" em intervalos, juntando os consecutivos: [9-10], [12-14]. */
function parseVerseList(spec: string): { from: number; to?: number }[] | null {
  const ranges: { from: number; to: number }[] = [];
  for (const item of spec.split(',').map((i) => i.trim()).filter(Boolean)) {
    const m = item.match(/^(\d+)(?:\s*[-–]\s*(\d+))?$/);
    if (!m) return null;
    const from = Number(m[1]);
    const to = m[2] ? Number(m[2]) : from;
    if (to < from) return null;
    const last = ranges.at(-1);
    if (last && from === last.to + 1) last.to = to;
    else ranges.push({ from, to });
  }
  return ranges.map((r) => (r.to === r.from ? { from: r.from } : r));
}

/** Interpreta referências como "Js 6.1-20; Hb 11:30", "At 16.9,10" ou "Salmo 23". */
export function parseReferences(input: string): ParseResult {
  const result: ParseResult = { refs: [], errors: [] };
  let previousBook = '';
  for (const raw of input.split(';').map((p) => p.trim()).filter(Boolean)) {
    const part = CONTINUATION_PATTERN.test(raw) && previousBook ? `${previousBook} ${raw}` : raw;
    const cross = part.match(CROSS_CHAPTER_PATTERN);
    if (cross) {
      const crossBook = BOOKS.find((b) => b.id === findBookId(cross[1]));
      const [c1, v1, c2, v2] = cross.slice(2).map(Number);
      if (!crossBook || c1 < 1 || c2 <= c1 || c2 > crossBook.chapters || v1 < 1 || v2 < 1) {
        result.errors.push(raw);
        continue;
      }
      previousBook = crossBook.name;
      for (let c = c1; c <= c2; c++) {
        const from = c === c1 ? v1 : 1;
        const to = c === c2 ? v2 : END_OF_CHAPTER;
        const label =
          c === c1 ? `${crossBook.name} ${c1}:${v1}–${c2}:${v2}` : c === c2 ? `${crossBook.name} ${c}:1-${v2}` : `${crossBook.name} ${c}`;
        result.refs.push(c === c1 || c === c2 ? { bookId: crossBook.id, chapter: c, from, to, label } : { bookId: crossBook.id, chapter: c, label });
      }
      continue;
    }
    const match = part.match(REF_PATTERN);
    const bookId = match && findBookId(match[1]);
    const book = bookId && BOOKS.find((b) => b.id === bookId);
    const chapter = match ? Number(match[2]) : 0;
    if (!match || !book || chapter < 1 || chapter > book.chapters) {
      result.errors.push(raw);
      continue;
    }
    previousBook = book.name;

    if (!match[4]) {
      result.refs.push({ bookId: book.id, chapter, label: `${book.name} ${chapter}` });
      continue;
    }
    const ranges = parseVerseList(match[4]);
    if (!ranges?.length) {
      result.errors.push(raw);
      continue;
    }
    for (const { from, to } of ranges) {
      result.refs.push({ bookId: book.id, chapter, from, to, label: `${book.name} ${chapter}:${from}${to ? `-${to}` : ''}` });
    }
  }
  return result;
}
