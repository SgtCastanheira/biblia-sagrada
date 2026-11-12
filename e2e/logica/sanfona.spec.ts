import { expect, test } from '@playwright/test';
import { parseBlocks } from '../../src/app/core/rich-text-parser';
import { blockWords, foldRanges, locateTopic, readingFraction, topicSections, visibleBlocks } from '../../src/app/core/topic-sections';

/**
 * Sanfona por tópico (estudos longos): as contas ficam num módulo puro. O progresso de leitura é medido pelas palavras, e não
 * pela altura da página, porque a altura muda quando os tópicos abrem e fecham.
 */
const MD = [
  '## Primeiro', '', 'Um dois três quatro.', '', '### Cena', '', 'Cinco seis.', '',
  '## Segundo', '', 'Sete oito nove dez onze doze treze catorze quinze dezesseis.', '',
  '## Terceiro', '', 'Fim.',
].join('\n');

test('sanfona: cada título de seção é um tópico, com as palavras e os minutos dele', () => {
  const blocks = parseBlocks(MD);
  const sections = topicSections(blocks);
  expect(sections.map((s) => [s.head, s.last])).toEqual([[0, 3], [4, 5], [6, 7]]);
  expect(sections.map((s) => s.title)).toEqual(['Primeiro', 'Segundo', 'Terceiro']);
  expect(sections.map((s) => s.words)).toEqual([8, 11, 2]);
  expect(sections.every((s) => s.minutes >= 1)).toBe(true);
  expect(blockWords(blocks[1])).toBe(4);
  expect(topicSections(parseBlocks('Só um parágrafo, sem títulos.'))).toEqual([]);
});

test('sanfona: só o tópico aberto mostra o corpo; os títulos aparecem sempre', () => {
  const sections = topicSections(parseBlocks(MD));
  expect(visibleBlocks(sections, 8, new Set([1]))).toEqual([true, false, false, false, true, true, true, false]);
  expect(visibleBlocks(sections, 8, new Set())).toEqual([true, false, false, false, true, false, true, false]);
  expect(visibleBlocks(sections, 8, new Set([0, 1, 2])).every(Boolean)).toBe(true);
});

test('sanfona: o progresso vem das palavras e volta ao mesmo ponto do texto', () => {
  const sections = topicSections(parseBlocks(MD));
  expect(readingFraction(sections, 0, 0)).toBe(0);
  expect(readingFraction(sections, 1, 0)).toBeCloseTo(8 / 21);
  expect(readingFraction(sections, 2, 1)).toBe(1);
  // sobe sempre, tópico após tópico, e ir e voltar dá o mesmo lugar
  let before = -1;
  for (let n = 0; n < sections.length; n++) {
    for (const within of [0.25, 0.5, 0.75]) {
      const f = readingFraction(sections, n, within);
      expect(f).toBeGreaterThan(before);
      before = f;
      const back = locateTopic(sections, f);
      expect(back.topic).toBe(n);
      expect(back.within).toBeCloseTo(within);
    }
  }
  expect(locateTopic(sections, 0)).toEqual({ topic: 0, within: 0 });
  expect(locateTopic(sections, 1).topic).toBe(2);
});

test('sanfona: ":::dobra" logo abaixo de um ### marca a seção "Saiba mais", e só ela esconde o corpo', () => {
  const md = [
    '## Tópico', '', 'Abertura.', '', '### Contexto', '', ':::dobra', '', 'Corpo um.', '', 'Corpo dois.', '',
    '### Cena', '', 'Texto da cena.', '', '### Sem marca', '', 'Fica à vista.',
  ].join('\n');
  const blocks = parseBlocks(md);
  expect(blocks.map((b) => b.type)).toEqual(['h2', 'p', 'h3', 'fold', 'p', 'p', 'h3', 'p', 'h3', 'p']);
  const folds = foldRanges(blocks);
  expect(folds).toEqual([{ head: 2, first: 4, last: 5, title: 'Contexto' }]);
  const sections = topicSections(blocks);
  const fechado = visibleBlocks(sections, blocks.length, new Set([0]), folds, new Set());
  expect(fechado).toEqual([true, true, true, true, false, false, true, true, true, true]);
  const aberto = visibleBlocks(sections, blocks.length, new Set([0]), folds, new Set([2]));
  expect(aberto.every(Boolean)).toBe(true);
  // tópico fechado esconde tudo, dobra aberta ou não
  expect(visibleBlocks(sections, blocks.length, new Set(), folds, new Set([2])).slice(1)).toEqual(Array(9).fill(false));
  // sem ":::dobra" logo depois de um ###, nada é dobrável
  expect(foldRanges(parseBlocks('## A\n\nTexto.\n\n:::dobra\n\nSolto.'))).toEqual([]);
});

test('sanfona: sem a sanfona por tópico (livros curtos), as dobras abrem e fecham sozinhas e o resto fica à vista', () => {
  const md = [
    '## Um', '', '### Contexto', '', ':::dobra', '', 'Corpo um.', '', '### Cena', '', 'Texto da cena.', '',
    '## Dois', '', 'Depois da dobra.',
  ].join('\n');
  const blocks = parseBlocks(md);
  const folds = foldRanges(blocks);
  expect(folds).toHaveLength(1);
  // nenhum tópico (lista vazia): só o corpo da dobra fechada some
  const fechada = visibleBlocks([], blocks.length, new Set(), folds, new Set());
  expect(fechada.filter((visivel) => !visivel)).toHaveLength(1);
  expect(fechada[folds[0].first]).toBe(false);
  expect(fechada[folds[0].head]).toBe(true);
  expect(visibleBlocks([], blocks.length, new Set(), folds, new Set([folds[0].head])).every(Boolean)).toBe(true);
});
