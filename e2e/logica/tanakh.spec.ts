import { expect, test } from '@playwright/test';
import { BOOKS } from '../../src/app/core/books';
import { christianOrder, TANAKH } from '../../src/app/core/tanakh';

test('Bíblia hebraica: 24 rolos que cobrem os 39 livros do Antigo Testamento, cada um uma vez só', () => {
  expect(TANAKH).toHaveLength(24);
  const ids = TANAKH.flatMap((b) => b.ids);
  expect(ids).toHaveLength(39);
  expect(new Set(ids).size).toBe(39);
  const at = BOOKS.filter((b) => b.testament === 'AT').map((b) => b.id).sort();
  expect([...ids].sort()).toEqual(at);
  expect(TANAKH.filter((b) => b.group === 'lei')).toHaveLength(5);
  expect(TANAKH.filter((b) => b.group === 'profetas')).toHaveLength(8);
  expect(TANAKH.filter((b) => b.group === 'escritos')).toHaveLength(11);
});

test('Bíblia hebraica: na nossa ordem, Daniel e Lamentações saem dos Escritos e vão para junto dos profetas', () => {
  const order = christianOrder();
  expect(order).toHaveLength(39);
  const group = (id: string) => order.find((b) => b.id === id)!.group;
  expect(group('DAN')).toBe('escritos');
  expect(order.findIndex((b) => b.id === 'DAN')).toBeGreaterThan(order.findIndex((b) => b.id === 'ISA'));
  expect(order.findIndex((b) => b.id === 'RUT')).toBeLessThan(order.findIndex((b) => b.id === 'ISA'));
  // As Crônicas, que fecham a Bíblia hebraica, ficam no meio da nossa
  expect(order.findIndex((b) => b.id === '2CH')).toBeLessThan(order.length - 10);
});
