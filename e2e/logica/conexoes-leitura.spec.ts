import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { bookSpan, chapterIndex, chapterSpan } from '../../src/app/core/bible-connections';
import { BOOKS } from '../../src/app/core/books';
import { parseReferences } from '../../src/app/core/reference-parser';
import { connectionPassages, type ReferenceBook } from '../../src/app/pages/connections/connection-passages';

const at = (book: string, chapter: number) => chapterIndex(book, chapter)!;
const load = (book: string): ReferenceBook => JSON.parse(readFileSync(`public/bible/referencias/${book}.json`, 'utf8'));

test('conexões: os versículos conectados têm os dois lados legíveis e prontos para ler', () => {
  const passages = connectionPassages(chapterSpan(at('ISA', 53)), at('MAT', 8), load('ISA'), load('MAT'));
  expect(passages).toContainEqual({
    key: 'Isaías 53:4|Mateus 8:17', from: 'Isaías 53:4', to: 'Mateus 8:17', refs: 'Isaías 53:4; Mateus 8:17',
  });
  for (const passage of passages) {
    const parsed = parseReferences(passage.refs);
    expect(parsed.errors, passage.refs).toEqual([]);
    expect(parsed.refs, passage.refs).toHaveLength(2);
    expect(parsed.refs[0].bookId).toBe('ISA');
    expect(parsed.refs[0].chapter).toBe(53);
    expect(parsed.refs[1].bookId).toBe('MAT');
    expect(parsed.refs[1].chapter).toBe(8);
  }
});

test('conexões: uma ligação registrada só no destino também mostra e permite ler os dois trechos', () => {
  const source = load('ISA');
  expect(Object.entries(source).filter(([key]) => key.startsWith('53:')).flatMap(([, codes]) => codes).some((code) => code.startsWith('MAT.9.'))).toBe(false);
  expect(connectionPassages(chapterSpan(at('ISA', 53)), at('MAT', 9), source, load('MAT'))).toEqual([
    { key: 'Isaías 53:3|Mateus 9:24', from: 'Isaías 53:3', to: 'Mateus 9:24', refs: 'Isaías 53:3; Mateus 9:24' },
  ]);
});

test('conexões: pares repetidos nos dois sentidos aparecem uma vez e seguem a ordem dos versículos', () => {
  const source = { '53:7': ['MAT.8.18'], '53:4': ['MAT.8.17', 'MAT.8.17'], '52:1': ['MAT.8.17'] };
  const destination = { '8:17': ['ISA.53.4'], '8:18': ['ISA.53.7'], '9:24': ['ISA.53.3'] };
  const passages = connectionPassages(chapterSpan(at('ISA', 53)), at('MAT', 8), source, destination);
  expect(passages.map((passage) => passage.refs)).toEqual(['Isaías 53:4; Mateus 8:17', 'Isaías 53:7; Mateus 8:18']);
});

test('conexões: o livro inteiro reúne seus capítulos e conserva os intervalos recebidos do destino', () => {
  const span = bookSpan(BOOKS.findIndex((book) => book.id === 'ISA'));
  const passages = connectionPassages(span, at('MAT', 8), { '53:4': ['MAT.8.17'], '52:1': ['MAT.8.18-19'] }, { '8:20': ['ISA.54.2-3'] });
  expect(passages.map((passage) => passage.refs)).toEqual([
    'Isaías 52:1; Mateus 8:18-19', 'Isaías 53:4; Mateus 8:17', 'Isaías 54:2-3; Mateus 8:20',
  ]);
  expect(passages.every((passage) => parseReferences(passage.refs).errors.length === 0)).toBe(true);
});

test('conexões: capítulos do mesmo livro não perdem nem repetem as referências recíprocas', () => {
  const references = { '53:4': ['ISA.54.2'], '54:2': ['ISA.53.4'], '54:3': ['ISA.53.5-6'] };
  expect(connectionPassages(chapterSpan(at('ISA', 53)), at('ISA', 54), references, references).map((passage) => passage.refs)).toEqual([
    'Isaías 53:4; Isaías 54:2', 'Isaías 53:5-6; Isaías 54:3',
  ]);
});

test('conexões: dados inválidos e referências a outros capítulos não viram passagens conectadas', () => {
  const source = { '53:4': ['XXX.8.17', 'MAT.99.1', 'MAT.8.0', 'MAT.8.17-16', 'MAT.8.', 'MAT.9.24'], 'inválido': ['MAT.8.17'] };
  expect(connectionPassages(chapterSpan(at('ISA', 53)), at('MAT', 8), source, { '8:17': ['ISA.54.1', 'XXX.53.4'] })).toEqual([]);
});
