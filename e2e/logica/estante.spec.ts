import { expect, test } from '@playwright/test';
import { TOOL_BAYS } from '../../src/app/core/library-bays';
import { TRAILS } from '../../src/app/core/trails';

/**
 * Estante de livros de /historia: cada assunto é um livro de uma cor. O texto da capa é creme (#fff8ec) e a
 * contagem é dourada (#f1d9a8); as duas precisam ter contraste de 4,5:1 com a cor da capa (a capa só escurece).
 */
function lum(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

test('estante: cada estante tem uma cor só dela, e o texto da capa continua legível', () => {
  const bays = [...TRAILS, ...TOOL_BAYS];
  const tones = bays.map((t) => t.tone);
  expect(new Set(tones).size, 'duas estantes com a mesma cor').toBe(bays.length);
  for (const t of bays) {
    expect(t.tone, t.id).toMatch(/^#[0-9a-f]{6}$/i);
    expect(contrast('#fff8ec', t.tone), `${t.id}: título creme`).toBeGreaterThanOrEqual(4.5);
    expect(contrast('#f1d9a8', t.tone), `${t.id}: contagem dourada`).toBeGreaterThanOrEqual(4.5);
  }
});

test('Como a Ciência Explica: os estudos ficam organizados nos volumes da coleção', () => {
  const series = TRAILS.find((t) => t.id === 'como-a-ciencia-explica');
  expect(series?.name).toBe('Como a Ciência Explica');
  expect(series?.branches.map((branch) => branch.title)).toEqual([
    'Volume 1 · Química e Matéria',
    'Volume 2 · Física e Movimento',
    'Volume 3 · Corpo e Vida',
  ]);
  expect(series?.branches.flatMap((branch) => branch.ids)).toEqual([
    'o-sinal-de-cana',
    'multiplicacao-dos-paes',
    'o-machado-que-flutuou',
    'jesus-sobre-as-aguas',
    'jesus-acalma-tempestade',
    'cego-de-nascenca',
    'filho-da-viuva-de-naim',
  ]);
});
