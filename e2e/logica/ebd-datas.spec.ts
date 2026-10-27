import { expect, test } from '@playwright/test';
import { dueLessonNumber, lessonDate } from '../../src/app/core/teaching';

const dia = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

test('EBD: cada lição cai num domingo, de 7 em 7 dias (4º trimestre de 2026: 4/10 a 27/12)', () => {
  expect(dia(lessonDate('2026-4', 1))).toBe('2026-10-04');
  expect(dia(lessonDate('2026-4', 5))).toBe('2026-11-01');
  expect(dia(lessonDate('2026-4', 13))).toBe('2026-12-27');
  for (let n = 1; n <= 13; n++) expect(lessonDate('2026-4', n).getDay(), `lição ${n}`).toBe(0);
});

test('EBD: o número da lição pisca na semana da aula (a mais próxima que ainda não passou)', () => {
  const hoje = (y: number, m: number, d: number) => dueLessonNumber('2026-4', 13, new Date(y, m - 1, d));
  expect(hoje(2026, 10, 27)).toBe(5); // 27/10: a aula de 1/11 está a 5 dias
  expect(hoje(2026, 10, 31)).toBe(5);
  expect(hoje(2026, 11, 1)).toBe(5); // no dia da aula, ainda pisca
  expect(hoje(2026, 11, 2)).toBe(6); // passou: vem a de 8/11
  expect(hoje(2026, 10, 4)).toBe(1);
  expect(hoje(2026, 9, 10)).toBeNull(); // faltam semanas para a primeira
  expect(hoje(2026, 12, 28)).toBeNull(); // acabou o trimestre
});
