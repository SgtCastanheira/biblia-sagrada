import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { BOOKS } from '../../src/app/core/books';
import { chronoBooks, CHRONO_GROUPS } from '../../src/app/core/bible-chronological';
import { BOOK_TIME, bookPlaces, bookShifts, shiftSummary, timeMarksOf, TIME_KINDS, writtenYear } from '../../src/app/core/book-time';
import { parseReferences } from '../../src/app/core/reference-parser';
import { TIME_VERIFIED, TIME_WORDS } from '../../src/app/core/time-words';

const norm = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const cache = new Map<string, [number, string][][]>();
const livro = (id: string) => (cache.get(id) ?? (cache.set(id, JSON.parse(readFileSync(`public/bible/almeida/${id}.json`, 'utf8'))), cache.get(id)!));
function passagem(ref: string): { bookId: string; texto: string } {
  const p = parseReferences(ref);
  expect(p.errors, ref).toEqual([]);
  expect(p.refs, ref).toHaveLength(1);
  const r = p.refs[0];
  const cap = livro(r.bookId)[r.chapter - 1];
  expect(cap, `capítulo inexistente: ${ref}`).toBeTruthy();
  const vs = cap.filter(([n]) => n >= (r.from ?? 1) && n <= (r.to ?? (r.from ?? 999)));
  expect(vs.length, `versículo inexistente: ${ref}`).toBeGreaterThan(0);
  return { bookId: r.bookId, texto: vs.map(([, t]) => t).join(' ') };
}

test('livros em ordem cronológica: os 66 livros, cada um no lugar do seu primeiro capítulo na leitura', () => {
  const books = chronoBooks();
  expect(books).toHaveLength(66);
  expect(books.map((b) => b.position)).toEqual(Array.from({ length: 66 }, (_, i) => i + 1));
  expect(new Set(books.map((b) => b.id)).size).toBe(66);
  for (const b of books) {
    expect(b.first.bookId, b.id).toBe(b.id);
    expect(b.last.bookId, b.id).toBe(b.id);
    expect(b.chapters, b.id).toBe(BOOKS.find((x) => x.id === b.id)!.chapters);
    expect(b.last.index, b.id).toBeGreaterThanOrEqual(b.first.index);
    expect(b.phases.length, b.id).toBeGreaterThan(0);
    for (const p of b.phases) expect(CHRONO_GROUPS.map((g) => g.id), `${b.id}: ${p}`).toContain(p);
  }
  // a regra: o primeiro capítulo manda
  for (let i = 1; i < books.length; i++) expect(books[i].first.index, books[i].id).toBeGreaterThan(books[i - 1].first.index);
});

test('livros em ordem cronológica: a ordem bate com os fatos que cada livro conta', () => {
  const pos = (id: string) => chronoBooks().find((b) => b.id === id)!.position;
  const ids = chronoBooks().map((b) => b.id);
  expect(ids.slice(0, 6)).toEqual(['GEN', 'JOB', 'EXO', 'LEV', 'NUM', 'DEU']);
  expect(ids[ids.length - 1]).toBe('REV');
  const antes = (...seq: string[]) => { for (let i = 1; i < seq.length; i++) expect(pos(seq[i - 1]), `${seq[i - 1]} antes de ${seq[i]}`).toBeLessThan(pos(seq[i])); };
  antes('DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA', '1KI', '2KI');
  antes('AMO', 'HOS', 'ISA', 'JER', 'EZK', 'EZR', 'NEH', 'MAL');
  antes('MAL', 'MAT', 'ACT', 'GAL', 'ROM', 'HEB', 'REV');
  antes('1TH', '2TH', '1CO', '2CO', 'ROM', 'PHP', '1TI', '2TI'); // as cartas de Paulo na ordem das viagens
  // os que atravessam várias fases dizem quais
  const phases = (id: string) => chronoBooks().find((b) => b.id === id)!.phases;
  expect(phases('PSA')).toEqual(expect.arrayContaining(['exodo', 'reino-unido', 'exilio', 'retorno']));
  expect(phases('GEN')).toEqual(['comeco', 'patriarcas']);
  expect(phases('ISA').length).toBeGreaterThan(1);
  expect(phases('RUT')).toEqual(['conquista']);
  expect(phases('REV')).toEqual(['fim']);
});

test('tempo nos livros: cada marca é um versículo do próprio livro, com o trecho exato da Almeida', () => {
  const problemas: string[] = [];
  for (const m of BOOK_TIME) {
    expect(Object.keys(TIME_KINDS), m.ref).toContain(m.kind);
    expect(BOOKS.some((b) => b.id === m.book), m.book).toBe(true);
    const { bookId, texto } = passagem(m.ref);
    if (bookId !== m.book) problemas.push(`${m.ref}: o versículo é de ${bookId}, não de ${m.book}`);
    const flat = norm(texto);
    if (!flat.includes(norm(m.almeida))) problemas.push(`${m.ref}: “${m.almeida}” não está no versículo`);
    // toda citação entre “…” na nota é um trecho do versículo
    for (const q of m.note.matchAll(/“([^”]+)”/g)) if (!flat.includes(norm(q[1]))) problemas.push(`${m.ref}: a nota cita “${q[1]}”, que não está no versículo`);
    expect(m.note.length, m.ref).toBeGreaterThan(15);
    expect(m.note.length, `${m.ref}: nota longa demais para um bloco`).toBeLessThan(140);
    for (const w of m.words ?? []) {
      if (!TIME_WORDS.some((x) => x.id === w)) problemas.push(`${m.ref}: palavra ${w} não existe`);
      else if (!TIME_VERIFIED[w]?.includes(m.ref)) problemas.push(`${m.ref}: ${w} não foi conferida neste versículo no interlinear`);
    }
    if (m.kind === 'palavra' && !m.words?.length) problemas.push(`${m.ref}: marca “palavra” sem a palavra`);
    // “a abertura não dá data”: é o primeiro versículo do livro, e ele não traz rei, ano nem reinado
    if (m.kind === 'sem-data') {
      if (!/ 1\.1$/.test(m.ref)) problemas.push(`${m.ref}: “sem data” só vale para o primeiro versículo (1.1)`);
      if (/\b(rei|reis|reinado|ano|anos)\b/.test(flat)) problemas.push(`${m.ref}: o versículo cita rei ou ano, então não é “sem data”`);
    }
  }
  expect(problemas, problemas.join('\n')).toEqual([]);
});

test('tempo nos livros: quais livros têm marca, e quais ficam sem (em vez de ter uma inventada)', () => {
  const com = new Set(BOOK_TIME.map((m) => m.book));
  const sem = BOOKS.filter((b) => !com.has(b.id)).map((b) => b.id).sort();
  expect(sem).toEqual(['2JN', '2TH', '3JN', 'JAS', 'LAM', 'PHM', 'PHP', 'SNG'].sort());
  expect(com.size).toBe(58);
  for (const b of com) expect(timeMarksOf(b).length, b).toBeLessThanOrEqual(3);
  // os cinco casos de que a conversa mais gosta
  expect(timeMarksOf('GAL').some((m) => m.ref === 'Gl 4.4' && m.words?.includes('cronos'))).toBe(true);
  expect(timeMarksOf('MRK').some((m) => m.ref === 'Mc 1.15' && m.words?.includes('kairos'))).toBe(true);
  expect(timeMarksOf('HEB').some((m) => m.ref === 'Hb 1.2' && m.words?.includes('aion'))).toBe(true);
  expect(timeMarksOf('JHN').some((m) => m.words?.includes('hora'))).toBe(true);
  expect(timeMarksOf('ECC').some((m) => m.words?.includes('et') && m.words?.includes('zeman'))).toBe(true);
  // as profecias de tempo: Daniel 7.25 e Apocalipse 12.14 repetem a mesma expressão
  const dn = timeMarksOf('DAN').find((m) => m.ref === 'Dn 7.25')!;
  const ap = timeMarksOf('REV').find((m) => m.ref === 'Ap 12.14')!;
  expect(norm(passagem(dn.ref).texto)).toContain(norm('um tempo, e tempos, e metade de um tempo'));
  expect(norm(passagem(ap.ref).texto)).toContain(norm('um tempo, e tempos, e metade de um tempo'));
});

test('tempo nos livros: o ano em que cada livro foi escrito vem do texto de livros.json, e fica vazio onde o texto não dá', () => {
  const intros: Record<string, { date: string }> = JSON.parse(readFileSync('public/conteudo/livros.json', 'utf8'));
  const years = Object.fromEntries(BOOKS.map((b) => [b.id, writtenYear(intros[b.id].date)]));
  // sem ano: o texto só diz o que o livro relata, que a data é incerta ou que é “antes de 70”
  expect(Object.keys(years).filter((id) => years[id] === null).sort()).toEqual(['1SA', '2SA', 'HEB', 'JOB', 'JOL', 'JON', 'RUT'].sort());
  expect(years).toMatchObject({
    GEN: -1440, EXO: -1440, LEV: -1440, NUM: -1400, DEU: -1400, JOS: -1400, JDG: -1000, '1KI': -560, '2KI': -560, '1CH': -450, EZR: -440, NEH: -430,
    EST: -470, PSA: -1440, PRO: -970, ECC: -935, SNG: -960, ISA: -740, JER: -627, EZK: -593, DAN: -605, HOS: -755, AMO: -760, OBA: -586, NAM: -663,
    MAT: 60, MRK: 55, LUK: 60, JHN: 85, ACT: 62, ROM: 57, GAL: 48, REV: 95,
  });
  // o ano escrito é só uma informação do livro; nenhum livro de mais de uma data é ordenado por um número inventado
  for (const b of BOOKS) expect(intros[b.id].date.length, b.id).toBeGreaterThan(5);
});

test('livros: as duas ordens são os mesmos 66 livros em lugares diferentes, e o que muda de uma para a outra se mede livro a livro', () => {
  const books = chronoBooks();
  const intros: Record<string, { date: string }> = JSON.parse(readFileSync('public/conteudo/livros.json', 'utf8'));
  const years = Object.fromEntries(books.map((b) => [b.id, writtenYear(intros[b.id].date)]));
  const fatos = bookPlaces(books, years, 'fatos');
  const escrita = bookPlaces(books, years, 'escrita');
  const um66 = Array.from({ length: 66 }, (_, i) => i + 1);
  expect(Object.values(fatos).sort((a, b) => a - b)).toEqual(um66);
  expect(Object.values(escrita).sort((a, b) => a - b)).toEqual(um66);
  for (const b of books) expect(fatos[b.id], b.id).toBe(b.position);
  // pelo ano de escrita, os sete sem ano ficam no fim, entre si na ordem dos fatos
  expect(['JOB', 'RUT', '1SA', '2SA', 'JOL', 'JON', 'HEB'].map((id) => escrita[id])).toEqual([60, 61, 62, 63, 64, 65, 66]);
  // quem tem ano fica à frente de quem não tem, e em ordem de ano
  const comAno = books.filter((b) => years[b.id] !== null).sort((a, b) => escrita[a.id] - escrita[b.id]);
  for (let i = 1; i < comAno.length; i++) expect(years[comAno[i].id]!, comAno[i].id).toBeGreaterThanOrEqual(years[comAno[i - 1].id]!);
  expect(Math.max(...comAno.map((b) => escrita[b.id]))).toBe(59);
  // Gênesis é o primeiro nas duas
  expect([fatos.GEN, escrita.GEN]).toEqual([1, 1]);

  // o que mudou ao ir dos fatos para a escrita
  const shifts = bookShifts(escrita, fatos);
  expect(shifts).toHaveLength(66);
  expect(shifts.find((s) => s.id === 'JOB')).toEqual({ id: 'JOB', now: 60, was: 2, delta: -58 }); // Jó desceu 58 lugares
  expect(shifts.find((s) => s.id === 'GEN')).toEqual({ id: 'GEN', now: 1, was: 1, delta: 0 });
  const resumo = shiftSummary(shifts);
  expect(resumo.moved + resumo.same).toBe(66);
  expect(resumo.up + resumo.down).toBe(resumo.moved);
  expect(resumo.moved).toBeGreaterThan(40); // as duas ordens são bem diferentes
  expect(resumo.same).toBeGreaterThan(0);
  expect(resumo.top).toHaveLength(3);
  expect(resumo.top.every((s) => s.delta !== 0)).toBe(true);
  for (let i = 1; i < 3; i++) expect(Math.abs(resumo.top[i].delta)).toBeLessThanOrEqual(Math.abs(resumo.top[i - 1].delta));
  expect(resumo.top[0].id).toBe(shifts.reduce((m, s) => (Math.abs(s.delta) > Math.abs(m.delta) ? s : m)).id);

  // voltar é o inverso: quem desceu 58 sobe 58
  const volta = bookShifts(fatos, escrita);
  for (const s of volta) expect(s.delta, s.id).toBe(0 - shifts.find((x) => x.id === s.id)!.delta);
  expect(shiftSummary(volta).up).toBe(resumo.down);
  expect(shiftSummary(volta).down).toBe(resumo.up);
});

