import { expect, test } from '@playwright/test';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { parseBlocks } from '../../src/app/core/rich-text-parser';
import { ARTICLES } from '../../src/app/core/library';

const FIGURES = [...readFileSync('src/app/shared/figure.ts', 'utf8').matchAll(/@case \('([\w-]+)'\)/g)].map((m) => m[1]);

test('ilustrações: toda foto existe na pasta e toda figura existe no app, com legenda', () => {
  const problems: string[] = [];
  for (const file of readdirSync('public/conteudo/artigos')) {
    for (const b of parseBlocks(readFileSync(`public/conteudo/artigos/${file}`, 'utf8'))) {
      if (b.type === 'image') {
        if (!existsSync(`public/conteudo/${b.src}`)) problems.push(`${file}: foto ${b.src} não existe`);
        if (!b.alt || !b.caption?.length) problems.push(`${file}: foto ${b.src} sem descrição ou sem legenda (crédito)`);
      }
      if (b.type === 'figure' && !FIGURES.includes(b.figure!)) problems.push(`${file}: figura "${b.figure}" não existe`);
    }
  }
  expect(problems).toEqual([]);
});

test('histórias: cenas, destaques e personagens bem formados; retratos da capa existem', () => {
  const problems: string[] = [];
  for (const file of readdirSync('public/conteudo/artigos')) {
    for (const b of parseBlocks(readFileSync(`public/conteudo/artigos/${file}`, 'utf8'))) {
      if (b.type === 'scene' && (!b.place || !b.inlines?.length)) problems.push(`${file}: cena sem lugar ou sem texto`);
      if (b.type === 'pullquote' && (!b.inlines?.length || !b.cite)) problems.push(`${file}: destaque sem texto ou sem autor`);
      for (const p of b.people ?? []) {
        if (!p.name || !p.role) problems.push(`${file}: personagem sem nome ou papel`);
        if (p.src && !existsSync(`public/conteudo/${p.src}`)) problems.push(`${file}: foto ${p.src} não existe`);
      }
    }
  }
  for (const a of ARTICLES) {
    for (const src of a.portraits ?? []) if (!existsSync(`public/conteudo/${src}`)) problems.push(`${a.id}: retrato ${src} não existe`);
  }
  expect(problems).toEqual([]);
});

test('o leitor entende os blocos das histórias', () => {
  const [cena, destaque, pessoas] = parseBlocks(
    ':::cena Belém · 1910\nDois jovens.\n:::\n\n:::destaque\nIde.\n— Jesus, em [[Mc 16.15]]\n:::\n\n:::pessoas\n- Gunnar Vingren | pastor | imagens/gunnar-vingren.jpg\n- Daniel Berg | evangelista\n:::',
  );
  expect(cena).toMatchObject({ type: 'scene', place: 'Belém · 1910' });
  expect(destaque.cite?.map((i) => i.t)).toEqual(['text', 'ref']);
  expect(pessoas.people).toEqual([
    { name: 'Gunnar Vingren', role: 'pastor', src: 'imagens/gunnar-vingren.jpg' },
    { name: 'Daniel Berg', role: 'evangelista', src: undefined },
  ]);
});

test('histórias entrelaçadas: todo cartão "leia" leva a um artigo que existe, e o panorama cobre toda a coleção', () => {
  const problems: string[] = [];
  for (const file of readdirSync('public/conteudo/artigos')) {
    for (const b of parseBlocks(readFileSync(`public/conteudo/artigos/${file}`, 'utf8'))) {
      if (b.type === 'read' && !ARTICLES.some((a) => a.id === b.article)) problems.push(`${file}: "leia ${b.article}" não existe`);
      if (b.type === 'read' && `${b.article}.md` === file) problems.push(`${file}: cartão para si mesmo`);
    }
  }
  const overview = ARTICLES.find((a) => a.overview && a.collection === 'igreja')!;
  const linked = parseBlocks(readFileSync(`public/conteudo/artigos/${overview.id}.md`, 'utf8')).filter((b) => b.type === 'read').map((b) => b.article);
  for (const a of ARTICLES.filter((x) => x.collection === 'igreja' && !x.overview)) {
    if (!linked.includes(a.id)) problems.push(`o panorama não leva a "${a.id}"`);
  }
  expect(problems).toEqual([]);
});
