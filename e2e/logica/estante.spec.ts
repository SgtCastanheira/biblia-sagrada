import { expect, test } from '@playwright/test';
import { bookLook, mixHex } from '../../src/app/core/book-look';
import { ARTICLES, findArticle } from '../../src/app/core/library';
import { TOOL_BAYS } from '../../src/app/core/library-bays';
import { shelfBooks, TRAILS } from '../../src/app/core/trails';

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

/** A sequência do Volume 4 foi escolhida pelo dono do app (13 nov 2026), na imagem da estante: Getsêmani é o 1 e Quem Mandava, o 7. */
const VOLUME_4 = [
  'paixao-getsemani', 'paixao-santa-ceia', 'paixao-prisao-e-interrogatorio', 'paixao-acoite-e-condenacao',
  'paixao-crucificacao', 'paixao-sepultamento-e-ressurreicao', 'paixao-quem-mandava',
];

test('estante: o Volume 4 segue a ordem escolhida pelo dono do app, e o número de cada livro é a sua posição', () => {
  const volume = TRAILS.flatMap((t) => t.branches).find((b) => b.title.startsWith('Volume 4'));
  expect(volume, 'prateleira do Volume 4').toBeTruthy();
  expect(volume!.ids).toEqual(VOLUME_4);
  expect(shelfBooks(volume!).map((v) => [v.n, v.article.id])).toEqual(VOLUME_4.map((id, i) => [i + 1, id]));
});

test('estante: toda prateleira de histórias segue a contagem na ordem (1, 2, 3…), e com uma história só fica o 1', () => {
  let prateleiras = 0;
  let comUma = 0;
  for (const trilha of TRAILS) {
    for (const b of trilha.branches) {
      for (const id of b.ids) expect(findArticle(id), `${trilha.id} / ${b.title}: ${id}`).toBeTruthy();
      const livros = shelfBooks(b);
      expect(livros.map((v) => v.n), `${trilha.id} / ${b.title}`).toEqual(b.ids.map((_, i) => i + 1));
      expect(livros.map((v) => v.article.id), `${trilha.id} / ${b.title}: ordem`).toEqual(b.ids);
      prateleiras++;
      if (livros.length === 1) comUma++;
    }
  }
  expect(prateleiras).toBeGreaterThan(10);
  expect(comUma, 'prateleiras com uma história só').toBeGreaterThan(0);
});

test('estante: o jeito das capas (tom e creme) vem só do id, uma capa em cada cinco é de creme, e a mistura faz o que o color-mix faz', () => {
  const ids = ARTICLES.map((a) => a.id);
  for (const id of ids) expect([0, 12, 22, 30], id).toContain(bookLook(id).dark);
  const claras = ids.filter((id) => bookLook(id).light).length / ids.length;
  expect(claras, 'parte das capas de creme').toBeGreaterThan(0.1);
  expect(claras, 'parte das capas de creme').toBeLessThan(0.3);
  expect(mixHex('#3e4a3e', '#000000', 0)).toBe('#3e4a3e');
  expect(mixHex('#ffffff', '#000000', 0.5)).toBe('#808080');
  expect(mixHex('#102030', '#ffffff', 1)).toBe('#ffffff');
});

test('estante: o número da capa (disco dourado, ou escuro na capa de creme) e o texto das capas têm contraste', () => {
  const contrastOf = (a: string, b: string) => contrast(a, b);
  for (const t of TRAILS) {
    // disco dourado com número escuro: o que há nas capas escuras
    expect(contrastOf('#2b2118', '#f1d9a8'), 'número escuro no disco dourado').toBeGreaterThanOrEqual(4.5);
    // disco escuro com número creme: o que há nas capas de creme; o disco também se distingue da capa
    const disco = mixHex(t.tone, '#000000', 0.15);
    expect(contrastOf('#fff8ec', disco), `${t.id}: número creme no disco escuro`).toBeGreaterThanOrEqual(4.5);
    expect(contrastOf(disco, '#efe3c8'), `${t.id}: disco escuro na capa de creme`).toBeGreaterThanOrEqual(3);
    // título creme nas capas escuras (a cor do assunto só escurece até 30%)
    for (const dark of [0, 12, 22, 30]) expect(contrastOf('#fff8ec', mixHex(t.tone, '#000000', dark / 100)), `${t.id}: título creme com ${dark}%`).toBeGreaterThanOrEqual(4.5);
  }
  expect(contrastOf('#2b2118', '#efe3c8'), 'título escuro na capa de creme').toBeGreaterThanOrEqual(4.5);
});
