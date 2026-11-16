import { chapterAt, chapterIndex, type Span } from '../../core/bible-connections';
import { BOOKS } from '../../core/books';

/** Referências por versículo, no formato local já usado pelo leitor. */
export type ReferenceBook = Record<string, string[]>;

const BOOK_BY_ID = new Map(BOOKS.map((book) => [book.id, book]));

interface Passage {
  index: number;
  verse: number;
  last: number;
  label: string;
}

export interface ConnectionPassage {
  key: string;
  from: string;
  to: string;
  /** Os dois trechos, prontos para abrir no painel de leitura. */
  refs: string;
}

/** Interpreta um código da base local sem aceitar livro, capítulo ou intervalo inválido. */
function decode(code: string): Passage | null {
  const match = /^([1-3]?[A-Z]{2,3})\.(\d+)\.(\d+)(?:-(\d+))?$/.exec(code);
  if (!match) return null;
  const book = BOOK_BY_ID.get(match[1]);
  const chapter = Number(match[2]);
  const verse = Number(match[3]);
  const last = Number(match[4] ?? match[3]);
  const index = book ? chapterIndex(book.id, chapter) : null;
  if (!book || index === null || verse < 1 || last < verse) return null;
  return { index, verse, last, label: `${book.name} ${chapter}:${verse}${last > verse ? `-${last}` : ''}` };
}

/**
 * Recupera os versículos de uma ligação do desenho, contando os dois sentidos da base. A ordem visual é sempre passagem em foco
 * → capítulo conectado, inclusive quando só o arquivo do destino contém a referência. O grafo agregado e seus dados ficam intactos.
 */
export function connectionPassages(span: Span, target: number, source: ReferenceBook, destination: ReferenceBook): ConnectionPassage[] {
  const origin = chapterAt(span.from);
  const connected = chapterAt(target);
  const targetPrefix = `${connected.book.id}.${connected.chapter}.`;
  const pairs = new Map<string, { from: Passage; to: Passage }>();
  const contains = (index: number) => index >= span.from && index <= span.to;
  const add = (from: Passage, to: Passage) => {
    if (from.index === to.index) return;
    pairs.set(`${from.label}|${to.label}`, { from, to });
  };

  for (const [key, codes] of Object.entries(source)) {
    if (span.from === span.to && !key.startsWith(`${origin.chapter}:`)) continue;
    const from = decode(`${origin.book.id}.${key.replace(':', '.')}`);
    if (!from || !contains(from.index)) continue;
    for (const code of codes) {
      if (!code.startsWith(targetPrefix)) continue;
      const to = decode(code);
      if (to?.index === target) add(from, to);
    }
  }

  for (const [key, codes] of Object.entries(destination)) {
    if (!key.startsWith(`${connected.chapter}:`)) continue;
    const to = decode(`${connected.book.id}.${key.replace(':', '.')}`);
    if (to?.index !== target) continue;
    for (const code of codes) {
      const from = decode(code);
      if (from && contains(from.index)) add(from, to);
    }
  }

  return [...pairs.entries()]
    .sort(([, a], [, b]) => a.from.index - b.from.index || a.from.verse - b.from.verse || a.from.last - b.from.last || a.to.verse - b.to.verse || a.to.last - b.to.last)
    .map(([key, { from, to }]) => ({ key, from: from.label, to: to.label, refs: `${from.label}; ${to.label}` }));
}
