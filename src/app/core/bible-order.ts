import { BOOKS } from './books';
import { parseReferences } from './reference-parser';

/**
 * Posição na ordem da Bíblia (Gênesis 1.1 = menor, Apocalipse 22.21 = maior).
 * Usada para organizar listas de Gênesis a Apocalipse.
 */
export function positionOf(bookId: string, chapter = 0, verse = 0): number {
  const index = BOOKS.findIndex((b) => b.id === bookId);
  return (index < 0 ? 999 : index) * 1_000_000 + chapter * 1000 + verse;
}

/** Posição da primeira referência de um texto ("Is 7.14; Mt 1.23" → Isaías 7.14). Sem referência válida: no fim. */
export function positionOfRef(text: string | undefined): number {
  const first = text ? parseReferences(text).refs[0] : undefined;
  return first ? positionOf(first.bookId, first.chapter, first.from ?? 0) : Number.MAX_SAFE_INTEGER;
}

/** Livro da primeira referência. */
export function bookOfRef(text: string | undefined): string | undefined {
  return text ? parseReferences(text).refs[0]?.bookId : undefined;
}

/** "GEN 11" → posição. */
export const positionOfChapter = (chapter: string) => {
  const [bookId, n] = chapter.split(' ');
  return positionOf(bookId, Number(n));
};

/** Ordena uma lista pela ordem bíblica, mantendo a ordem original nos empates. */
export function inBibleOrder<T>(items: T[], position: (item: T) => number): T[] {
  return items.map((item, i) => ({ item, i, p: position(item) })).sort((a, b) => a.p - b.p || a.i - b.i).map((x) => x.item);
}
