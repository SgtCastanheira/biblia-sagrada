import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { filterVersionGroups, VERSION_GROUPS, VERSIONS } from '../../src/app/core/versions';

const ids = (query: string) => filterVersionGroups(VERSION_GROUPS, query).flatMap((g) => g.versions.map((v) => v.id));

test('busca de versões: sem texto mostra todas, com texto ignora acento e maiúsculas', () => {
  expect(filterVersionGroups(VERSION_GROUPS, '')).toBe(VERSION_GROUPS);
  expect(filterVersionGroups(VERSION_GROUPS, '   ')).toBe(VERSION_GROUPS);
  expect(ids('KAYAPÓ')).toEqual(['kayapo']);
  expect(ids('kayapo')).toEqual(['kayapo']);
  expect(ids('Bakairi')).toEqual(['bakairi']);
  expect(ids('metindjwynh')).toEqual(['kayapo']); // o título na própria língua, sem os acentos dela
  expect(ids('ingles')).toContain('kjv');
  expect(ids('ingles')).not.toContain('almeida');
});

test('busca de versões: “Xingu” acha as três línguas da região e só elas', () => {
  expect(ids('xingu').sort()).toEqual(['bakairi', 'kayabi', 'kayapo']);
  expect(ids('Parque Indígena do Xingu')).toEqual(['kayabi']);
  expect(ids('mebêngôkre')).toEqual(['kayapo']);
});

test('busca de versões: todas as palavras precisam aparecer, e grupos vazios somem', () => {
  const grupos = filterVersionGroups(VERSION_GROUPS, 'indígena novo testamento');
  expect(grupos.map((g) => g.language)).toEqual(['Línguas indígenas do Brasil']);
  // Guarani Mbyá e Guajajára têm a Bíblia inteira, então ficam de fora de “só Novo Testamento”
  expect(ids('indígena novo testamento')).not.toContain('mbya');
  expect(ids('indígena novo testamento')).toContain('xavante');
  expect(ids('indígena')).toContain('mbya');
  expect(ids('xingu hebraico')).toEqual([]);
  expect(ids('zzzz')).toEqual([]);
});

test('Bakairí e Kayapó: Novo Testamento inteiro embutido, no cache offline e nos créditos', () => {
  const index = JSON.parse(readFileSync('public/bible/index.json', 'utf-8')) as Record<string, string[]>;
  const ngsw = readFileSync('ngsw-config.json', 'utf-8');
  const creditos = readFileSync('CREDITOS.md', 'utf-8');
  const credits = readFileSync('src/app/core/credits.ts', 'utf-8');
  const esperado = { bakairi: 7821, kayapo: 7675 } as const; // versículos do eBible (bkqNT e txuNT)
  for (const [id, versiculos] of Object.entries(esperado)) {
    expect(index[id], `${id} no index.json`).toHaveLength(27);
    expect(index[id][0]).toBe('MAT');
    let total = 0;
    for (const livro of index[id]) {
      const capitulos = JSON.parse(readFileSync(`public/bible/${id}/${livro}.json`, 'utf-8')) as [number, string][][];
      total += capitulos.reduce((n, c) => n + c.length, 0);
    }
    expect(total, `versículos de ${id}`).toBe(versiculos);
    const versao = VERSIONS.find((v) => v.id === id);
    expect(versao?.ntOnly).toBe(true);
    expect(versao?.copyright).toContain('CC BY-NC-ND');
    expect(ngsw).toContain(`/bible/${id}/*.json`);
  }
  expect(creditos).toContain('bkqNT');
  expect(creditos).toContain('txuNT');
  expect(credits).toContain('https://ebible.org/bkqNT/');
  expect(credits).toContain('https://ebible.org/txuNT/');
});

test('toda versão embutida tem entrada na lista, no cache offline e vice-versa', () => {
  const index = JSON.parse(readFileSync('public/bible/index.json', 'utf-8')) as Record<string, string[]>;
  const ngsw = readFileSync('ngsw-config.json', 'utf-8');
  const problemas: string[] = [];
  for (const id of Object.keys(index)) {
    if (!VERSIONS.some((v) => v.id === id)) problemas.push(`${id}: está em public/bible mas não em versions.ts`);
    if (id !== 'almeida' && !ngsw.includes(`/bible/${id}/*.json`)) problemas.push(`${id}: falta no ngsw-config.json`);
  }
  expect(problemas).toEqual([]);
});
