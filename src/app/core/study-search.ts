/**
 * Busca no Estudo: procura no título e no texto das histórias, dos estados, dos sermões, dos personagens,
 * do dicionário, das profecias, das curiosidades e dos hinos. Código puro (sem Angular), para os testes.
 */

export type HitKind = 'historia' | 'estado' | 'sermao' | 'personagem' | 'dicionario' | 'profecia' | 'curiosidade' | 'hino' | 'epoca' | 'fato';

export interface SearchDoc {
  kind: HitKind;
  id: string;
  title: string;
  /** Linha abaixo do título (subtítulo, época, autor). */
  subtitle?: string;
  link: string;
  /** Texto principal (já sem Markdown). */
  body: string;
}

export const KIND_INFO: Record<HitKind, { label: string; icon: string }> = {
  historia: { label: 'História', icon: 'auto_stories' },
  estado: { label: 'Estado', icon: 'pin_drop' },
  sermao: { label: 'Sermão', icon: 'campaign' },
  personagem: { label: 'Personagem', icon: 'military_tech' },
  dicionario: { label: 'Dicionário', icon: 'translate' },
  profecia: { label: 'Profecia', icon: 'star' },
  curiosidade: { label: 'Você sabia?', icon: 'lightbulb' },
  hino: { label: 'Harpa', icon: 'music_note' },
  epoca: { label: 'Época', icon: 'timeline' },
  fato: { label: 'Fato do mundo', icon: 'crisis_alert' },
};

export interface SearchHit {
  doc: SearchDoc;
  score: number;
  /** Trecho do texto onde a busca apareceu: antes, o que casou e depois. */
  snippet: { before: string; hit: string; after: string } | null;
}

/** Minúsculas e sem acentos, para "Nicéia" e "niceia" serem a mesma palavra. */
export const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const STOPWORDS = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'o', 'a', 'os', 'as', 'um', 'uma', 'em', 'no', 'na', 'nos', 'nas', 'que', 'com', 'por', 'para', 'ao', 'sobre']);

/** Palavras que as pessoas trocam: quem procura "conselho de Niceia" quer o "Concílio de Niceia". */
const SYNONYM_GROUPS = [
  ['conselho', 'concilio', 'sinodo'],
  ['avivamento', 'despertamento', 'reavivamento'],
  ['cativeiro', 'exilio'],
  ['pastor', 'presbitero', 'bispo'],
  ['igreja', 'assembleia'],
  ['pecado', 'transgressao'],
  ['milagre', 'maravilha'],
  ['dizimo', 'dizimos'],
];

const SYNONYMS = new Map<string, string[]>();
for (const group of SYNONYM_GROUPS) for (const word of group) SYNONYMS.set(word, group.filter((w) => w !== word));

/** As palavras da busca (sem acentos, sem "de/da/o"). */
export function queryTerms(query: string): string[] {
  const words = fold(query).split(/[^a-z0-9]+/).filter(Boolean);
  const meaningful = words.filter((w) => !STOPWORDS.has(w));
  return (meaningful.length ? meaningful : words).filter((w) => w.length >= 2 || /^\d+$/.test(w));
}

/** Tira o Markdown do app: referências, links, negrito, fichas, imagens e blocos. */
export function plainText(md: string): string {
  return md
    .replace(/^:::\s*\S*.*$/gm, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[\[([^\]|]*)\|([^\]]*)\]\]/g, '$2')
    .replace(/\[\[([^\]]*)\]\]/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/^#+\s*/gm, '')
    .replace(/[*_`>|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Todas as formas aceitas para uma palavra da busca: ela mesma e as trocas (igreja ↔ assembleia). */
const variants = (term: string) => [term, ...(SYNONYMS.get(term) ?? [])];

/** A palavra da busca vale para o texto se ele tem uma palavra que começa com ela (concilio → concílios). */
function wordIndex(text: string, term: string): number {
  let from = 0;
  while (true) {
    const i = text.indexOf(term, from);
    if (i < 0) return -1;
    if (i === 0 || !/[a-z0-9]/.test(text[i - 1])) return i;
    from = i + 1;
  }
}

interface Prepared {
  doc: SearchDoc;
  title: string;
  subtitle: string;
  body: string;
  /** O corpo sem acentos tem o mesmo tamanho do original, então os índices servem para o trecho. */
  rawBody: string;
}

export function prepare(docs: SearchDoc[]): Prepared[] {
  return docs.map((doc) => ({ doc, title: fold(doc.title), subtitle: fold(doc.subtitle ?? ''), body: fold(doc.body), rawBody: doc.body }));
}

export function search(prepared: Prepared[], query: string, limit = 60): SearchHit[] {
  const terms = queryTerms(query);
  if (!terms.length) return [];
  const phrase = fold(query).replace(/\s+/g, ' ').trim();
  const hits: SearchHit[] = [];
  for (const p of prepared) {
    let score = 0;
    let firstBody = -1;
    let firstLen = 0;
    let ok = true;
    for (const term of terms) {
      let best = 0;
      for (const v of variants(term)) {
        const exact = v === term ? 1 : 0.8;
        if (wordIndex(p.title, v) >= 0) best = Math.max(best, 10 * exact);
        else if (p.title.includes(v)) best = Math.max(best, 6 * exact);
        if (wordIndex(p.subtitle, v) >= 0) best = Math.max(best, 5 * exact);
        const at = wordIndex(p.body, v);
        if (at >= 0) {
          let count = 1;
          for (let i = p.body.indexOf(v, at + 1); i >= 0 && count < 6; i = p.body.indexOf(v, i + 1)) count++;
          best = Math.max(best, (1 + count * 0.4) * exact);
          if (firstBody < 0 || at < firstBody) { firstBody = at; firstLen = v.length; }
        }
      }
      if (!best) { ok = false; break; }
      score += best;
    }
    if (!ok) continue;
    if (terms.length > 1 && (p.title.includes(phrase) || p.body.includes(phrase))) score += 8;
    hits.push({ doc: p.doc, score, snippet: firstBody >= 0 ? snippetAt(p.rawBody, firstBody, firstLen) : null });
  }
  return hits.sort((a, b) => b.score - a.score || a.doc.title.localeCompare(b.doc.title, 'pt-BR')).slice(0, limit);
}

/** Um trecho de cerca de 150 letras em volta do achado, cortado em palavras inteiras. */
function snippetAt(text: string, at: number, len: number) {
  const start = Math.max(0, at - 60);
  const end = Math.min(text.length, at + len + 90);
  let from = start;
  if (from > 0) { const sp = text.indexOf(' ', from); if (sp >= 0 && sp < at) from = sp + 1; }
  let to = end;
  if (to < text.length) { const sp = text.lastIndexOf(' ', to); if (sp > at + len) to = sp; }
  const wordEnd = text.indexOf(' ', at + len);
  const hitEnd = wordEnd < 0 || wordEnd > to ? at + len : wordEnd;
  return {
    before: (from > 0 ? '… ' : '') + text.slice(from, at),
    hit: text.slice(at, hitEnd),
    after: text.slice(hitEnd, to) + (to < text.length ? ' …' : ''),
  };
}
