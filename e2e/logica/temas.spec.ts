import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

/**
 * Contraste (WCAG) das paletas de cor: lê os tokens de src/styles.scss e confere que o texto continua legível
 * em cada tema (mínimo 4,5:1), para os temas novos serem calmos sem perder a leitura.
 */
const scss = readFileSync('src/styles.scss', 'utf8');

function lum(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/** Tokens de um tema: o bloco de theme-overrides entre "body.theme-<id> {" e o fim do bloco. */
function tokens(id: string): Record<string, string> {
  const start = scss.lastIndexOf(`body.theme-${id} {`);
  expect(start, `tema ${id} existe`).toBeGreaterThanOrEqual(0);
  const block = scss.slice(start, scss.indexOf('\n}', start));
  return Object.fromEntries([...block.matchAll(/^\s*([a-z-]+): (#[0-9a-fA-F]{6}),?$/gm)].map((m) => [m[1], m[2]]));
}

for (const id of ['dark', 'sepia', 'ember', 'forest', 'mist']) {
  test(`tema ${id}: o texto passa de 4,5:1 sobre o fundo e sobre os cartões`, () => {
    const t = tokens(id);
    const pairs: [string, string][] = [
      ['on-surface', 'surface'],
      ['on-surface-variant', 'surface'],
      ['on-surface-variant', 'surface-container'],
      ['on-surface', 'surface-container'],
      ['primary', 'surface'],
      ['on-primary-container', 'primary-container'],
    ];
    for (const [fg, bg] of pairs) {
      if (!t[fg] || !t[bg]) continue;
      expect(contrast(t[fg], t[bg]), `${id}: ${fg} sobre ${bg}`).toBeGreaterThanOrEqual(4.5);
    }
  });
}

test('temas: o dourado de destaque também é legível em cada paleta', () => {
  const surface = (id: string) => tokens(id)['surface'];
  const gold = (id: string) => {
    const start = scss.lastIndexOf(`body.theme-${id} {`);
    return scss.slice(start, scss.indexOf('\n}', start)).match(/--accent-gold: (#[0-9a-fA-F]{6})/)?.[1];
  };
  for (const id of ['sepia', 'ember', 'forest', 'mist']) {
    expect(gold(id), `${id} define o dourado`).toBeTruthy();
    expect(contrast(gold(id)!, surface(id)), id).toBeGreaterThanOrEqual(4.5);
  }
});
