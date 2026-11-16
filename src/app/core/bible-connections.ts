import { BOOKS } from './books';
import type { Book } from './models';

/**
 * A Bíblia Conectada: as ligações entre os capítulos, a partir das referências cruzadas que o leitor já embute (OpenBible.info,
 * CC BY). Código puro (sem Angular), para os testes; o desenho fica em shared/arcs-draw.ts.
 *
 * Os capítulos são numerados de 0 (Gênesis 1) a 1188 (Apocalipse 22), na ordem da Bíblia. Uma ligação junta dois capítulos
 * diferentes e conta quantas referências há entre eles, nos dois sentidos (public/bible/conexoes.json, de tools/gerar-conexoes.py).
 */

/** Os 1.189 capítulos. */
export const CHAPTER_COUNT = BOOKS.reduce((n, b) => n + b.chapters, 0);

/** Índice do primeiro capítulo de cada livro. */
const FIRST: number[] = [];
BOOKS.reduce((n, b) => {
  FIRST.push(n);
  return n + b.chapters;
}, 0);

/** Índice do primeiro capítulo do livro que está na posição `bookIndex` da lista (0 a 65). */
export const firstChapterOf = (bookIndex: number): number => FIRST[bookIndex];

/** Em que livro (posição na lista) cai o capítulo de índice `i`. */
export function bookIndexOf(i: number): number {
  let lo = 0;
  let hi = FIRST.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (FIRST[mid] <= i) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

export interface ChapterRef {
  index: number;
  bookIndex: number;
  book: Book;
  chapter: number;
  /** “Isaías 53”. */
  label: string;
}

export function chapterAt(index: number): ChapterRef {
  const bookIndex = bookIndexOf(index);
  const book = BOOKS[bookIndex];
  const chapter = index - FIRST[bookIndex] + 1;
  return { index, bookIndex, book, chapter, label: `${book.name} ${chapter}` };
}

/** Índice do capítulo `chapter` do livro `bookId` (“ISA”, 53); nulo se não existir. */
export function chapterIndex(bookId: string, chapter: number): number | null {
  const bookIndex = BOOKS.findIndex((b) => b.id === bookId);
  if (bookIndex < 0 || !Number.isInteger(chapter) || chapter < 1 || chapter > BOOKS[bookIndex].chapters) return null;
  return FIRST[bookIndex] + chapter - 1;
}

/** O que está em foco: um capítulo (de = até) ou um livro inteiro. Os dois extremos entram. */
export interface Span {
  from: number;
  to: number;
}

export const chapterSpan = (index: number): Span => ({ from: index, to: index });
export const bookSpan = (bookIndex: number): Span => ({ from: FIRST[bookIndex], to: FIRST[bookIndex] + BOOKS[bookIndex].chapters - 1 });
export const isChapter = (s: Span): boolean => s.from === s.to;
export const spanLabel = (s: Span): string => (isChapter(s) ? chapterAt(s.from).label : BOOKS[bookIndexOf(s.from)].name);
/** Endereço da tela para o que está em foco: `/conexoes/ISA/53` para um capítulo, `/conexoes/ISA` para um livro. */
export function spanPath(s: Span | null): string {
  if (!s) return '/conexoes';
  const c = chapterAt(s.from);
  return isChapter(s) ? `/conexoes/${c.book.id}/${c.chapter}` : `/conexoes/${c.book.id}`;
}
/** O contrário de `spanPath`: lê o livro e o capítulo do endereço; nulo se não existirem. */
export function spanFromParams(bookId: string | undefined, chapter: string | undefined): Span | null {
  if (!bookId) return null;
  const bookIndex = BOOKS.findIndex((b) => b.id === bookId.toUpperCase());
  if (bookIndex < 0) return null;
  if (chapter === undefined) return bookSpan(bookIndex);
  const index = chapterIndex(BOOKS[bookIndex].id, Number(chapter));
  return index === null ? null : chapterSpan(index);
}

/** Formato do arquivo public/bible/conexoes.json. */
export interface ConnectionData {
  versao: number;
  fonte: string;
  capitulos: number;
  /** a, b, n, a, b, n…: capítulos a < b e quantas referências há entre eles. */
  pares: number[];
}

export type LevelId = 'fortes' | 'mais' | 'todas';
export interface LevelInfo {
  id: LevelId;
  label: string;
  /** Só entram as ligações com pelo menos tantas referências. */
  min: number;
}
/** Quantas ligações desenhar: na visão geral, 70 mil linhas num celular viram uma mancha. */
export const LEVELS: LevelInfo[] = [
  { id: 'fortes', label: 'Mais fortes', min: 5 },
  { id: 'mais', label: 'Mais ligações', min: 3 },
  { id: 'todas', label: 'Todas', min: 1 },
];
export const levelOf = (id: string | undefined): LevelInfo => LEVELS.find((l) => l.id === id) ?? LEVELS[0];

export interface Neighbor {
  index: number;
  refs: number;
}

export interface BookLinks {
  bookIndex: number;
  book: Book;
  /** Referências entre o que está em foco e este livro. */
  refs: number;
  chapters: { index: number; chapter: number; refs: number }[];
}

export interface SpanSummary {
  /** Quantos capítulos de fora estão ligados ao que está em foco. */
  chapters: number;
  /** Em quantos livros eles estão (o próprio livro conta, se houver ligação dentro dele). */
  books: number;
  refs: number;
  top: { book: Book; refs: number }[];
}

export class ConnectionGraph {
  /** Quantas ligações há. */
  readonly size: number;
  /** Capítulos de cada ligação (a < b) e as referências entre eles. */
  readonly a: Uint16Array;
  readonly b: Uint16Array;
  readonly n: Uint8Array;
  /** Vizinhos de cada capítulo, em fila: os do capítulo i ficam de start[i] a start[i + 1]. */
  private readonly start: Uint32Array;
  private readonly other: Uint16Array;
  private readonly weight: Uint8Array;
  /** `atLeast[k]` = quantas ligações têm k referências ou mais. */
  private readonly atLeast: number[];
  private readonly orders = new Map<number, Uint32Array>();

  constructor(data: ConnectionData) {
    if (data.capitulos !== CHAPTER_COUNT || !Array.isArray(data.pares) || data.pares.length % 3 !== 0) {
      throw new Error('Dados de conexões inválidos');
    }
    const m = data.pares.length / 3;
    this.size = m;
    this.a = new Uint16Array(m);
    this.b = new Uint16Array(m);
    this.n = new Uint8Array(m);
    const degree = new Uint32Array(CHAPTER_COUNT);
    const histogram = new Array<number>(257).fill(0);
    for (let k = 0; k < m; k++) {
      const a = data.pares[3 * k];
      const b = data.pares[3 * k + 1];
      const n = data.pares[3 * k + 2];
      if (!(a >= 0 && a < b && b < CHAPTER_COUNT && n >= 1 && n <= 255)) throw new Error(`Ligação ${k} inválida`);
      this.a[k] = a;
      this.b[k] = b;
      this.n[k] = n;
      degree[a]++;
      degree[b]++;
      histogram[n]++;
    }
    this.start = new Uint32Array(CHAPTER_COUNT + 1);
    for (let i = 0; i < CHAPTER_COUNT; i++) this.start[i + 1] = this.start[i] + degree[i];
    const fill = this.start.slice(0, CHAPTER_COUNT);
    this.other = new Uint16Array(2 * m);
    this.weight = new Uint8Array(2 * m);
    for (let k = 0; k < m; k++) {
      const { a, b, n } = { a: this.a[k], b: this.b[k], n: this.n[k] };
      this.other[fill[a]] = b;
      this.weight[fill[a]++] = n;
      this.other[fill[b]] = a;
      this.weight[fill[b]++] = n;
    }
    this.atLeast = new Array<number>(257).fill(0);
    for (let k = 255; k >= 0; k--) this.atLeast[k] = this.atLeast[k + 1] + histogram[k + 1];
  }

  /** Quantas ligações têm `min` referências ou mais. */
  count(min: number): number {
    return this.atLeast[Math.max(0, Math.min(min - 1, 255))];
  }

  /** As ligações com `min` referências ou mais, da mais longa para a mais curta (as curtas ficam por cima no desenho). */
  ordered(min: number): Uint32Array {
    let order = this.orders.get(min);
    if (!order) {
      const picked: number[] = [];
      for (let k = 0; k < this.size; k++) if (this.n[k] >= min) picked.push(k);
      order = Uint32Array.from(picked).sort((x, y) => this.b[y] - this.a[y] - (this.b[x] - this.a[x]));
      this.orders.set(min, order);
    }
    return order;
  }

  /** Quantos capítulos estão ligados ao capítulo `i`. */
  degree(i: number): number {
    return this.start[i + 1] - this.start[i];
  }

  neighbors(i: number): Neighbor[] {
    const list: Neighbor[] = [];
    for (let p = this.start[i]; p < this.start[i + 1]; p++) list.push({ index: this.other[p], refs: this.weight[p] });
    return list;
  }

  /**
   * Os capítulos de fora que estão ligados ao que está em foco, com as referências somadas. Num livro inteiro, as ligações
   * dentro do próprio livro ficam de fora da lista (continuam no desenho).
   */
  linksOf(span: Span): Neighbor[] {
    if (isChapter(span)) return this.neighbors(span.from).sort((x, y) => y.refs - x.refs || x.index - y.index);
    const sums = new Map<number, number>();
    for (let i = span.from; i <= span.to; i++) {
      for (let p = this.start[i]; p < this.start[i + 1]; p++) {
        const j = this.other[p];
        if (j >= span.from && j <= span.to) continue;
        sums.set(j, (sums.get(j) ?? 0) + this.weight[p]);
      }
    }
    return [...sums].map(([index, refs]) => ({ index, refs })).sort((x, y) => y.refs - x.refs || x.index - y.index);
  }

  /** Os livros ligados ao que está em foco, do mais ligado ao menos, cada um com os seus capítulos. */
  groupByBook(span: Span): BookLinks[] {
    const groups = new Map<number, BookLinks>();
    for (const { index, refs } of this.linksOf(span)) {
      const bookIndex = bookIndexOf(index);
      let g = groups.get(bookIndex);
      if (!g) {
        g = { bookIndex, book: BOOKS[bookIndex], refs: 0, chapters: [] };
        groups.set(bookIndex, g);
      }
      g.refs += refs;
      g.chapters.push({ index, chapter: index - FIRST[bookIndex] + 1, refs });
    }
    for (const g of groups.values()) g.chapters.sort((x, y) => y.refs - x.refs || x.chapter - y.chapter);
    return [...groups.values()].sort((x, y) => y.refs - x.refs || x.bookIndex - y.bookIndex);
  }

  summary(span: Span): SpanSummary {
    const groups = this.groupByBook(span);
    return {
      chapters: groups.reduce((n, g) => n + g.chapters.length, 0),
      books: groups.length,
      refs: groups.reduce((n, g) => n + g.refs, 0),
      top: groups.slice(0, 6).map((g) => ({ book: g.book, refs: g.refs })),
    };
  }

  /** Os `limit` capítulos ligados ao maior número de outros capítulos. */
  mostConnected(limit: number): number[] {
    return Array.from({ length: CHAPTER_COUNT }, (_, i) => i)
      .sort((x, y) => this.degree(y) - this.degree(x) || x - y)
      .slice(0, limit);
  }
}

/** Cor do arco pela distância entre os capítulos: de roxo (perto) a amarelo-esverdeado (longe), na escala do logaritmo. */
export function distanceHue(distance: number): number {
  return 290 - (230 * Math.log(Math.max(1, distance))) / Math.log(CHAPTER_COUNT - 1);
}

/** Onde começar: capítulos que mostram bem o que o desenho faz, com uma linha sobre cada um. As ligações citadas existem nos dados. */
export const START_POINTS: { bookId: string; chapter: number; why: string }[] = [
  { bookId: 'GEN', chapter: 1, why: 'O princípio de tudo. Procure o eco dele nos Salmos e em João 1.' },
  { bookId: 'PSA', chapter: 22, why: 'O salmo que Jesus citou na cruz (Mt 27.46), ligado aos relatos da crucificação.' },
  { bookId: 'ISA', chapter: 53, why: 'O servo sofredor: ecos nos Evangelhos, em Atos e em 1 Pedro.' },
  { bookId: 'JHN', chapter: 3, why: 'Nicodemos e a serpente de bronze (Jo 3.14; Nm 21).' },
  { bookId: 'HEB', chapter: 11, why: 'A galeria da fé: Gênesis, Êxodo, Josué e outros livros do Antigo Testamento.' },
  { bookId: 'REV', chapter: 21, why: 'A nova Jerusalém, com raízes em Isaías e Ezequiel.' },
  { bookId: 'ROM', chapter: 8, why: 'A vida no Espírito: um dos capítulos mais ligados da Bíblia, neste conjunto de dados.' },
];
