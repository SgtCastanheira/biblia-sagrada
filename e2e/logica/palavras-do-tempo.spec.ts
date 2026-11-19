import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { parseReferences } from '../../src/app/core/reference-parser';
import { TIME_CAUTION, TIME_COMPARES, TIME_VERIFIED, TIME_WORDS } from '../../src/app/core/time-words';

const norm = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const cache = new Map<string, [number, string][][]>();
const livro = (id: string) => (cache.get(id) ?? (cache.set(id, JSON.parse(readFileSync(`public/bible/almeida/${id}.json`, 'utf8'))), cache.get(id)!));
function texto(ref: string): string {
  const p = parseReferences(ref);
  expect(p.errors, ref).toEqual([]);
  expect(p.refs.length, ref).toBeGreaterThan(0);
  const out: string[] = [];
  for (const r of p.refs) {
    const cap = livro(r.bookId)[r.chapter - 1];
    expect(cap, `capítulo inexistente: ${ref}`).toBeTruthy();
    const vs = cap.filter(([n]) => n >= (r.from ?? 1) && n <= (r.to ?? (r.from ?? 999)));
    expect(vs.length, `versículo inexistente: ${ref}`).toBeGreaterThan(0);
    out.push(...vs.map(([, t]) => t));
  }
  return out.join(' ');
}

const CONFERIDO = TIME_VERIFIED;

test('palavras do tempo: quatro do grego e quatro do hebraico, cada uma com o número de Strong e a escrita original', () => {
  expect(TIME_WORDS.map((w) => w.id)).toEqual(['cronos', 'kairos', 'aion', 'hora', 'et', 'zeman', 'moed', 'olam']);
  expect(TIME_WORDS.filter((w) => w.lang === 'grego')).toHaveLength(4);
  expect(TIME_WORDS.filter((w) => w.lang === 'hebraico')).toHaveLength(4);
  for (const w of TIME_WORDS) {
    expect(w.strong, w.id).toMatch(w.lang === 'grego' ? /^G\d+$/ : /^H\d+$/);
    expect(w.script, w.id).toMatch(w.lang === 'grego' ? /^[\p{Script=Greek}]+$/u : /^[\p{Script=Hebrew}]+$/u);
    expect(w.short.length, w.id).toBeGreaterThan(4);
    expect(w.text.length, w.id).toBeGreaterThan(60);
    expect(w.verses.length, w.id).toBeGreaterThan(0);
  }
  // os números são os dos verbetes lidos
  expect(Object.fromEntries(TIME_WORDS.map((w) => [w.id, w.strong]))).toEqual({
    cronos: 'G5550', kairos: 'G2540', aion: 'G165', hora: 'G5610', et: 'H6256', zeman: 'H2165', moed: 'H4150', olam: 'H5769',
  });
});

test('palavras do tempo: cada versículo existe na Almeida, traz o trecho indicado e foi conferido no interlinear', () => {
  for (const w of TIME_WORDS) {
    for (const v of w.verses) {
      expect(norm(texto(v.ref)), `${w.id} em ${v.ref}: “${v.almeida}” não está no versículo`).toContain(norm(v.almeida));
      expect(CONFERIDO[w.id], `${w.id} em ${v.ref}: o versículo não foi conferido para esta palavra`).toContain(v.ref);
    }
  }
});

test('palavras do tempo: as comparações citam versículos que as palavras indicadas de fato têm, e o aviso fala da exceção', () => {
  const byId = new Map(TIME_WORDS.map((w) => [w.id, w]));
  expect(TIME_COMPARES.length).toBeGreaterThanOrEqual(4);
  for (const c of TIME_COMPARES) {
    expect(c.words.length, c.id).toBeGreaterThanOrEqual(2);
    for (const id of c.words) expect(byId.has(id), `${c.id}: ${id}`).toBe(true);
    for (const ref of c.refs) {
      texto(ref); // existe
      const em = c.words.filter((id) => byId.get(id)!.verses.some((v) => v.ref === ref));
      expect(em.length, `${c.id}: ${ref} não está nos versículos de nenhuma das palavras (${c.words.join(', ')})`).toBeGreaterThan(0);
    }
  }
  // os pares que a Bíblia traz num mesmo versículo têm as duas palavras listadas nele
  for (const [ref, ids] of [['At 1.7', ['cronos', 'kairos']], ['Rm 13.11', ['kairos', 'hora']], ['Ap 10.6', ['cronos', 'aion']], ['Ec 3.1', ['et', 'zeman']]] as const) {
    for (const id of ids) expect(CONFERIDO[id], `${ref} para ${id}`).toContain(ref);
  }
  expect(TIME_CAUTION).toContain('exceção');
  expect(TIME_CAUTION).toContain('Apocalipse 10.6');
});

test('palavras do tempo: o texto não copia a Almeida entre aspas além do que está nos versículos', () => {
  const todos = norm([...TIME_WORDS.flatMap((w) => [w.text, ...w.verses.map((v) => v.note ?? '')]), ...TIME_COMPARES.map((c) => c.text), TIME_CAUTION].join(' ')) ;
  expect(todos.length).toBeGreaterThan(100);
  // toda citação entre “…” nos textos tem de estar na Almeida (nos versículos citados) ou ser uma palavra solta da tradução
  const aspas = [...[...TIME_WORDS.flatMap((w) => [w.text, ...w.verses.map((v) => v.note ?? '')]), ...TIME_COMPARES.map((c) => c.text), TIME_CAUTION].join(' ').matchAll(/“([^”]+)”/g)].map((m) => m[1]);
  const biblia = norm(
    [...new Set([...TIME_WORDS.flatMap((w) => w.verses.map((v) => v.ref)), ...TIME_COMPARES.flatMap((c) => c.refs)])].map((r) => texto(r)).join(' '),
  );
  const soltas = new Set(['cronologia', 'cronômetro', 'tempos', 'épocas', 'tempo', 'demora', 'plenitude', 'século', 'mundo', 'eternidade', 'ocasião própria', 'estações']);
  const foraDaBiblia = aspas.filter((a) => !soltas.has(a.toLowerCase()) && !biblia.includes(norm(a)));
  expect(foraDaBiblia, `citações que não estão nos versículos citados: ${foraDaBiblia.join(' | ')}`).toEqual([]);
});
