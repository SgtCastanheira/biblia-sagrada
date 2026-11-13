import type { Article } from './library';
import { dayLabel } from './anniversaries';
import { shelfBooks, TRAILS, type Trail } from './trails';

/**
 * Os livros mais recentes, em destaque no alto de /historia. Código puro (sem Angular), para os testes.
 *
 * Regra: contam-se dias inteiros, do mais novo para o mais antigo, até juntar pelo menos `RECENT_MIN` livros, e nunca passa de
 * `RECENT_MAX`. Assim um volume que chegou num dia só não é cortado ao meio, e numa semana calma o destaque ainda mostra os
 * últimos livros, mesmo que sejam de dias atrás. O dia vem de `Article.added`; no mesmo dia, vale a ordem da prateleira.
 */
export const RECENT_MIN = 6;
export const RECENT_MAX = 12;

/** Um livro recente e a prateleira de onde ele vem (a cor da capa é a do assunto dele). */
export interface RecentBook {
  article: Article;
  trail: Trail;
  /** Título da prateleira (ramo da trilha) em que o livro mora. */
  shelf: string;
}

/** Os livros de um mesmo dia. */
export interface RecentDay {
  /** “AAAA-MM-DD”. */
  date: string;
  books: RecentBook[];
}

/** Toda história que está numa prateleira, na ordem do app: trilha, ramo e posição. */
function storiesOnShelves(): RecentBook[] {
  return TRAILS.flatMap((trail) => trail.branches.flatMap((b) => shelfBooks(b).map(({ article }) => ({ article, trail, shelf: b.title }))));
}

/** Aplica a regra a uma lista de livros (na ordem da prateleira): os livros sem data contam como antigos e ficam de fora. */
export function pickRecentDays(books: RecentBook[]): RecentDay[] {
  // `sort` é estável: no mesmo dia, os livros ficam na ordem da prateleira
  const dated = books.filter((b) => b.article.added).sort((a, b) => b.article.added!.localeCompare(a.article.added!));
  const days: RecentDay[] = [];
  let total = 0;
  for (const book of dated) {
    if (total >= RECENT_MAX) break;
    const date = book.article.added!;
    const last = days.at(-1);
    if (last?.date === date) {
      last.books.push(book);
    } else {
      // Um dia novo só começa se ainda faltam livros para o mínimo
      if (total >= RECENT_MIN) break;
      days.push({ date, books: [book] });
    }
    total++;
  }
  return days;
}

/** Os dias em destaque no alto de /historia. */
export const recentDays = (): RecentDay[] => pickRecentDays(storiesOnShelves());

/** “AAAA-MM-DD” lido como dia do calendário local (e não como UTC, que escorregaria um dia). */
export function parseDay(date: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** “Hoje · 13 de novembro”, “Ontem · 12 de novembro” ou “5 de novembro” (com o ano, se não for o de hoje). */
export function dayTitle(date: string, now: Date = new Date()): string {
  const day = parseDay(date);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const ago = Math.round((today.getTime() - day.getTime()) / 86_400_000);
  const year = day.getFullYear() === now.getFullYear() ? '' : ` de ${day.getFullYear()}`;
  const text = dayLabel(day.getMonth() + 1, day.getDate()) + year;
  if (ago === 0) return `Hoje · ${text}`;
  if (ago === 1) return `Ontem · ${text}`;
  return text;
}
