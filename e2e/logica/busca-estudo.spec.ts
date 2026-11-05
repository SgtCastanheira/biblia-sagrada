import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { ARTICLES } from '../../src/app/core/library';
import { plainText, prepare, queryTerms, search, SearchDoc } from '../../src/app/core/study-search';

const docs: SearchDoc[] = ARTICLES.map((a) => ({
  kind: 'historia', id: a.id, title: a.title, subtitle: a.subtitle, link: `/artigo/${a.id}`,
  body: plainText(readFileSync(`public/conteudo/artigos/${a.id}.md`, 'utf8')),
}));
const index = prepare(docs);

test('busca no estudo: "conselho de Niceia" acha o Concílio, mesmo sem acento e com outra palavra', () => {
  for (const q of ['conselho de niceia', 'Concílio de Nicéia', 'niceia']) {
    const hits = search(index, q);
    expect(hits.length, q).toBeGreaterThan(0);
    expect(hits[0].doc.id, q).toBe('constantino-e-os-concilios');
    expect(hits[0].snippet?.hit.toLowerCase(), q).toMatch(/nic[eé]ia|conc[ií]lio|conselho/);
  }
});

test('busca no estudo: palavras sem sentido não acham nada, e "de/da" não contam', () => {
  expect(search(index, 'zzxqwv')).toEqual([]);
  expect(queryTerms('o conselho de Niceia')).toEqual(['conselho', 'niceia']);
  expect(search(index, 'x')).toEqual([]);
});

test('busca no estudo: as palavras do título valem mais que as do texto', () => {
  const hits = search(index, 'reforma');
  expect(hits.length).toBeGreaterThan(3);
  expect(hits[0].doc.title.toLowerCase()).toContain('reform');
});

test('busca no estudo: uma pesquisa de várias palavras traz a expressão inteira e esconde quem só passa pelo assunto', () => {
  // “Coreia do Norte” trazia 5 estudos (norte-americano, norte da Europa…): agora só os que dizem “Coreia do Norte”
  const hits = search(index, 'Coreia do Norte');
  expect(hits[0].doc.id).toBe('avivamento-da-coreia');
  expect(hits.length, hits.map((h) => h.doc.id).join(', ')).toBeLessThanOrEqual(2);
  expect(hits.every((h) => h.exact)).toBe(true);
  // uma palavra só continua mostrando tudo o que a cita
  expect(search(index, 'Coreia').length).toBeGreaterThanOrEqual(1);
  expect(search(index, 'reforma').length).toBeGreaterThan(3);
});
