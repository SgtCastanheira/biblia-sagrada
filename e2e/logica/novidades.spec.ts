import { expect, test } from '@playwright/test';
import { ARTICLES, type Article } from '../../src/app/core/library';
import { dayTitle, parseDay, pickRecentDays, recentDays, RECENT_MAX, RECENT_MIN, type RecentBook } from '../../src/app/core/recent-books';
import { shelfBooks, TRAILS } from '../../src/app/core/trails';

/**
 * Os livros mais recentes ficam em destaque no alto de /historia. A data de cada livro é `Article.added`; sem ela o livro novo
 * não apareceria, então este teste exige a data em todos.
 */
const isoDay = /^\d{4}-\d{2}-\d{2}$/;

/** “2026-02-30” tem o formato certo, mas não existe: o dia lido de volta não bate. */
function isRealDay(iso: string): boolean {
  const d = parseDay(iso);
  const dois = (n: number) => String(n).padStart(2, '0');
  return iso === `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`;
}

function book(id: string, added: string | undefined): RecentBook {
  const article = { id, added } as Article;
  return { article, trail: TRAILS[0], shelf: 'prateleira' };
}
/** `n` livros de um mesmo dia. */
const day = (date: string, n: number, prefix = date) => Array.from({ length: n }, (_, i) => book(`${prefix}-${i + 1}`, date));
const ids = (days: ReturnType<typeof pickRecentDays>) => days.map((d) => [d.date, d.books.map((b) => b.article.id)]);

test('novidades: todo livro tem a data em que entrou no app, e nenhuma é do futuro', () => {
  // um dia a mais de folga: o relógio de quem roda o teste pode estar um fuso à frente
  const limite = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  for (const a of ARTICLES) {
    expect(a.added, `${a.id}: falta o campo added (a data de hoje, “AAAA-MM-DD”)`).toMatch(isoDay);
    expect(isRealDay(a.added!), `${a.id}: ${a.added} não é um dia do calendário`).toBe(true);
    expect(a.added! <= limite, `${a.id}: ${a.added} está no futuro`).toBe(true);
  }
});

test('novidades: o destaque da biblioteca traz os últimos livros, do mais novo ao mais antigo, em dias inteiros', () => {
  const dias = recentDays();
  const livros = dias.flatMap((d) => d.books);
  expect(livros.length).toBeGreaterThanOrEqual(RECENT_MIN);
  expect(livros.length).toBeLessThanOrEqual(RECENT_MAX);
  // dias em ordem decrescente, sem repetir dia nem livro
  expect(dias.map((d) => d.date)).toEqual([...new Set(dias.map((d) => d.date))].sort().reverse());
  expect(new Set(livros.map((b) => b.article.id)).size).toBe(livros.length);
  for (const d of dias) for (const b of d.books) expect(b.article.added, b.article.id).toBe(d.date);
  // o livro mais novo do app está lá, e nenhum livro de fora é mais novo do que o último que entrou
  const maisNovo = ARTICLES.map((a) => a.added!).sort().reverse()[0];
  expect(dias[0].date).toBe(maisNovo);
  const ultimo = dias.at(-1)!.date;
  const dentro = new Set(livros.map((b) => b.article.id));
  const todos = TRAILS.flatMap((t) => t.branches.flatMap((b) => shelfBooks(b).map((v) => v.article)));
  for (const a of todos) if (!dentro.has(a.id)) expect(a.added! <= ultimo, `${a.id} (${a.added}) devia estar no destaque`).toBe(true);
  // todo livro do destaque mora numa prateleira de verdade, na trilha indicada
  for (const b of livros) expect(b.trail.branches.some((br) => br.title === b.shelf && br.ids.includes(b.article.id)), `${b.article.id}: prateleira “${b.shelf}” de ${b.trail.id}`).toBe(true);
});

test('novidades: a regra junta dias inteiros até o mínimo e para no máximo', () => {
  // 5 hoje + 7 ontem = 12: o volume de ontem não é cortado
  expect(pickRecentDays([...day('2026-11-12', 7, 'o'), ...day('2026-11-13', 5, 'h'), ...day('2026-11-05', 9, 'a')]).map((d) => [d.date, d.books.length])).toEqual([['2026-11-13', 5], ['2026-11-12', 7]]);
  // já com 7 livros no dia mais novo, o dia anterior fica de fora
  expect(pickRecentDays([...day('2026-11-13', 7), ...day('2026-11-12', 7)]).map((d) => [d.date, d.books.length])).toEqual([['2026-11-13', 7]]);
  // numa semana calma, entram os livros de dias atrás até o mínimo (3 + 2 + 2 = 7)
  expect(pickRecentDays([...day('2026-11-13', 3), ...day('2026-11-08', 2), ...day('2026-10-30', 2), ...day('2026-10-01', 4)]).map((d) => [d.date, d.books.length])).toEqual([['2026-11-13', 3], ['2026-11-08', 2], ['2026-10-30', 2]]);
  // um dia com 25 livros (uma entrada em massa) é cortado no máximo
  expect(pickRecentDays(day('2026-10-23', 25)).flatMap((d) => d.books)).toHaveLength(RECENT_MAX);
  // dois dias que juntam menos que o mínimo mostram tudo o que há
  expect(pickRecentDays([...day('2026-11-13', 2), ...day('2026-11-12', 1)]).flatMap((d) => d.books)).toHaveLength(3);
  expect(pickRecentDays([])).toEqual([]);
});

test('novidades: no mesmo dia vale a ordem da prateleira, e livro sem data não entra', () => {
  const lista = [book('a', '2026-11-13'), book('semdata', undefined), book('b', '2026-11-13'), book('c', '2026-11-13'), book('velho', '2026-01-01')];
  expect(ids(pickRecentDays(lista))).toEqual([['2026-11-13', ['a', 'b', 'c']], ['2026-01-01', ['velho']]]);
});

test('novidades: o título de cada dia diz hoje, ontem ou a data, com o ano só quando não é o de hoje', () => {
  const agora = new Date(2026, 10, 13, 18, 30); // 13 de novembro de 2026
  expect(dayTitle('2026-11-13', agora)).toBe('Hoje · 13 de novembro');
  expect(dayTitle('2026-11-12', agora)).toBe('Ontem · 12 de novembro');
  expect(dayTitle('2026-11-05', agora)).toBe('5 de novembro');
  expect(dayTitle('2026-11-01', agora)).toBe('1º de novembro');
  expect(dayTitle('2025-12-31', agora)).toBe('31 de dezembro de 2025');
  // virada de mês e de ano: ontem continua sendo ontem
  expect(dayTitle('2026-10-31', new Date(2026, 10, 1, 9))).toBe('Ontem · 31 de outubro');
  expect(dayTitle('2025-12-31', new Date(2026, 0, 1, 0, 5))).toBe('Ontem · 31 de dezembro de 2025');
});
