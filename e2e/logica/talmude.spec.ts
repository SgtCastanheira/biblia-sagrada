import { expect, test } from '@playwright/test';
import { BAVLI_TRACTATES, PASSAGES, SEDARIM, TRACTATES } from '../../src/app/core/talmud';
import { parseReferences } from '../../src/app/core/reference-parser';
import { titleCase } from '../../src/app/core/title-case';

test('Talmude: seis ordens e 63 tratados da Mishná, 37 com Guemará no Talmude Babilônico', () => {
  expect(SEDARIM.map((s) => s.id)).toEqual(['zeraim', 'moed', 'nashim', 'nezikin', 'kodashim', 'tohorot']);
  expect(SEDARIM.map((s) => s.tractates.length)).toEqual([11, 12, 7, 10, 11, 12]);
  expect(TRACTATES).toHaveLength(63);
  expect(new Set(TRACTATES.map((x) => x.name)).size).toBe(63);
  expect(BAVLI_TRACTATES).toHaveLength(37);
  // o Babilônico traz, por ordem: 1, 11, 7, 8, 9 e 1 tratados
  expect(SEDARIM.map((s) => s.tractates.filter((x) => x.bavli).length)).toEqual([1, 11, 7, 8, 9, 1]);
  // quais ficam sem Guemará (a lista que o artigo do app repete)
  const without = TRACTATES.filter((x) => !x.bavli).map((x) => x.name);
  expect(without).toContain('Shekalim');
  expect(without).toContain('Avot');
  expect(without).toContain('Eduyot');
  expect(without).toContain('Midot');
  expect(without).toContain('Kinim');
  expect(without).not.toContain('Berakhot');
  expect(without).not.toContain('Nidá');
});

test('Talmude: cada tratado tem nome em hebraico, sentido, tema e endereço na Sefaria', () => {
  for (const x of TRACTATES) {
    expect(x.he, x.name).toMatch(/[֐-׿]/);
    expect(x.pt.length, x.name).toBeGreaterThan(2);
    expect(x.theme.length, x.name).toBeGreaterThan(20);
    expect(x.mishnah, x.name).toMatch(/^https:\/\/www\.sefaria\.org\/[A-Za-z_'.0-9]+$/);
    if (x.bavli) expect(x.bavli, x.name).toMatch(/^https:\/\/www\.sefaria\.org\/[A-Za-z_'.0-9]+$/);
  }
});

test('Talmude: os trechos contados têm onde ler, o que dizem e referências bíblicas que existem', () => {
  expect(PASSAGES.length).toBeGreaterThanOrEqual(5);
  expect(new Set(PASSAGES.map((p) => p.id)).size).toBe(PASSAGES.length);
  for (const p of PASSAGES) {
    expect(p.link, p.id).toMatch(/^https:\/\/www\.sefaria\.org\//);
    expect(p.where.length, p.id).toBeGreaterThan(8);
    expect(p.summary.length, p.id).toBeGreaterThanOrEqual(2);
    // o texto é recontado com palavras do app (a tradução inglesa é CC BY-NC); só entram citações de poucas palavras
    for (const para of p.summary) expect(para.length, p.id).toBeGreaterThan(40);
    if (p.bible) {
      const refs = [...p.bible.matchAll(/\[\[([^\]]+)\]\]/g)].map((m) => m[1]);
      expect(refs.length, p.id).toBeGreaterThan(0);
      for (const r of refs) expect(parseReferences(r).refs.length, `${p.id}: ${r}`).toBeGreaterThan(0);
    }
    expect(titleCase(p.title), p.title).toBe(p.title);
  }
});
