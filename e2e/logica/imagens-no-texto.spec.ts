import { readdirSync, readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { parseBlocks } from '../../src/app/core/rich-text-parser';

/**
 * Fotos como num jornal: a foto vai à esquerda e o texto corre em volta. Por isso toda foto vem ANTES do parágrafo de que
 * ela fala, e não depois do último parágrafo da seção (onde não teria texto ao lado). Quando há duas fotos seguidas, o
 * texto vem logo depois das duas.
 */
test('imagens: toda foto tem texto logo depois, para correr em volta dela', () => {
  const problems: string[] = [];
  for (const dir of ['artigos', 'ad-estados']) {
    for (const file of readdirSync(`public/conteudo/${dir}`)) {
      const blocks = parseBlocks(readFileSync(`public/conteudo/${dir}/${file}`, 'utf8'));
      blocks.forEach((b, i) => {
        if (b.type !== 'image') return;
        let j = i + 1;
        let seguidas = 1;
        while (blocks[j]?.type === 'image') {
          j++;
          seguidas++;
        }
        const depois = blocks[j]?.type;
        if (depois !== 'p' && depois !== 'ul' && depois !== 'ol') problems.push(`${dir}/${file}: a foto “${b.alt}” fica solta, sem texto depois dela (vem ${depois ?? 'o fim'})`);
        if (seguidas > 2) problems.push(`${dir}/${file}: mais de duas fotos seguidas (“${b.alt}”)`);
      });
    }
  }
  expect(problems).toEqual([]);
});
