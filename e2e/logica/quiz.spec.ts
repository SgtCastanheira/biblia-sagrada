import { expect, test } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
import { BOOKS } from '../../src/app/core/books';
import { bookInfoQuiz, chapterQuiz, type ChapterSource, interleave, makeRng, type QuizQuestion, storyQuiz } from '../../src/app/core/quiz';

const bible = new Map<string, ChapterSource[]>();
for (const b of BOOKS) {
  const raw = JSON.parse(readFileSync(`public/bible/almeida/${b.id}.json`, 'utf8')) as [number, string][][];
  bible.set(b.id, raw.map((verses, i) => ({ bookId: b.id, chapter: i + 1, verses: verses.map(([verse, text]) => ({ verse, text })) })));
}

/** Como o serviço escolhe as "pegadinhas": até 3 outros capítulos do mesmo livro e 2 de outro livro. */
function poolFor(bookId: string, chapter: number): ChapterSource[] {
  const rng = makeRng(`pool-${bookId}-${chapter}`);
  const same = (bible.get(bookId) ?? []).filter((c) => c.chapter !== chapter);
  const idx = BOOKS.findIndex((b) => b.id === bookId);
  const other = bible.get(BOOKS[(idx + 7) % BOOKS.length].id) ?? [];
  const take = (list: ChapterSource[], n: number) => list.map((c) => ({ c, r: rng() })).sort((a, b) => a.r - b.r).slice(0, n).map((x) => x.c);
  return [...take(same, 3), ...take(other, 2)];
}

function check(q: QuizQuestion, where: string): string[] {
  const problems: string[] = [];
  if (q.options.length !== 4) problems.push(`${where}: ${q.options.length} alternativas`);
  if (new Set(q.options.map((o) => o.toLowerCase())).size !== q.options.length) problems.push(`${where}: alternativas repetidas (${q.options.join(' | ')})`);
  if (!(q.answer >= 0 && q.answer < q.options.length)) problems.push(`${where}: resposta fora das alternativas`);
  if (q.options.some((o) => !o.trim())) problems.push(`${where}: alternativa vazia`);
  if (q.kind === 'completar' && !q.text.includes('______')) problems.push(`${where}: sem lacuna`);
  if (q.kind === 'completar' && new RegExp(`(^|[^\\p{L}])${q.options[q.answer]}($|[^\\p{L}])`, 'iu').test(q.text)) problems.push(`${where}: a resposta aparece na pergunta`);
  return problems;
}

test('quiz: todo capítulo da Bíblia gera perguntas válidas (4 alternativas, uma certa, sem entregar a resposta)', () => {
  const problems: string[] = [];
  let few = 0;
  let total = 0;
  for (const [bookId, chapters] of bible) {
    for (const c of chapters) {
      const qs = chapterQuiz(c, poolFor(bookId, c.chapter), makeRng(`t-${bookId}-${c.chapter}`), 5);
      total++;
      if (qs.length < 3) few++;
      qs.forEach((q, i) => problems.push(...check(q, `${bookId} ${c.chapter} #${i + 1}`)));
    }
  }
  expect(problems.slice(0, 10)).toEqual([]);
  // Só capítulos curtíssimos podem dar menos de 3 perguntas (o jogo completa com perguntas do livro)
  expect(few / total).toBeLessThan(0.03);
});

test('quiz: o mesmo jogo se repete com a mesma semente, e uma semente nova muda as perguntas', () => {
  const c = bible.get('EXO')![2];
  const pool = poolFor('EXO', 3);
  const a = chapterQuiz(c, pool, makeRng('x'), 5).map((q) => q.id + q.answer);
  const b = chapterQuiz(c, pool, makeRng('x'), 5).map((q) => q.id + q.answer);
  const d = chapterQuiz(c, pool, makeRng('y'), 5).map((q) => q.id + q.answer);
  expect(a).toEqual(b);
  expect(a).not.toEqual(d);
  expect(a.length).toBe(5);
});

test('quiz: as respostas sobre o livro (autor, época, destinatários, capítulos) vêm de livros.json', () => {
  const intros = JSON.parse(readFileSync('public/conteudo/livros.json', 'utf8'));
  let withQuestions = 0;
  for (const b of BOOKS) {
    const qs = bookInfoQuiz(b.id, intros, makeRng(`l-${b.id}`), 4);
    if (qs.length >= 2) withQuestions++;
    qs.forEach((q, i) => expect(check(q, `${b.id} livro #${i + 1}`)).toEqual([]));
  }
  expect(withQuestions).toBeGreaterThan(55);
});

test('quiz: as histórias geram perguntas válidas a partir das datas, personagens, envios e termos em destaque', () => {
  const dir = 'public/conteudo';
  const files = [...readdirSync(`${dir}/artigos`).map((f) => `artigos/${f}`), ...readdirSync(`${dir}/ad-estados`).map((f) => `ad-estados/${f}`)];
  let good = 0;
  for (const f of files) {
    const qs = storyQuiz(readFileSync(`${dir}/${f}`, 'utf8'), f, makeRng(`h-${f}`), 5);
    if (qs.length >= 3) good++;
    qs.forEach((q, i) => expect(check(q, `${f} #${i + 1}`)).toEqual([]));
  }
  // A grande maioria das histórias tem material para pelo menos 3 perguntas
  expect(good / files.length).toBeGreaterThan(0.85);
});

test('quiz: interleave junta as fontes sem repetir pergunta', () => {
  const mk = (id: string): QuizQuestion => ({ id, kind: 'livro', source: 'livro', text: id, options: ['a', 'b', 'c', 'd'], answer: 0, explain: '' });
  const out = interleave([[mk('1'), mk('2'), mk('3')], [mk('2'), mk('4')]], 4);
  expect(out.map((q) => q.id)).toEqual(['1', '2', '4', '3']);
});
