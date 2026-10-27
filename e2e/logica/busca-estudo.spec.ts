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
