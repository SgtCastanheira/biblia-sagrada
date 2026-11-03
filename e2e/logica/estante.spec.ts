import { expect, test } from '@playwright/test';
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

test('estante: cada livro tem uma cor só dele, e o texto da capa continua legível', () => {
  const tones = TRAILS.map((t) => t.tone);
  expect(new Set(tones).size, 'duas trilhas com a mesma cor').toBe(TRAILS.length);
  for (const t of TRAILS) {
    expect(t.tone, t.id).toMatch(/^#[0-9a-f]{6}$/i);
    expect(contrast('#fff8ec', t.tone), `${t.id}: título creme`).toBeGreaterThanOrEqual(4.5);
    expect(contrast('#f1d9a8', t.tone), `${t.id}: contagem dourada`).toBeGreaterThanOrEqual(4.5);
  }
});
