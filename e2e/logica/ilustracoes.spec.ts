import { expect, test } from '@playwright/test';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { parseBlocks } from '../../src/app/core/rich-text-parser';

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
