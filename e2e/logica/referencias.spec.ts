import { expect, test } from '@playwright/test';
import { parseReferences } from '../../src/app/core/reference-parser';

/** O leitor de referências precisa entender os formatos usados em revistas e Bíblias. */
const casos: [string, string[]][] = [
  ['Js 6.1-20', ['Josué 6:1-20']],
  ['Josué 6:1-20', ['Josué 6:1-20']],
  ['1 Co 13:4-7', ['1 Coríntios 13:4-7']],
  ['I Coríntios 13', ['1 Coríntios 13']],
  ['II Reis 2.11', ['2 Reis 2:11']],
  ['Salmo 23', ['Salmos 23']],
  ['Jo 3.16', ['João 3:16']],
  ['Jó 1.1', ['Jó 1:1']],
  ['Mt 5,1-12', ['Mateus 5:1-12']],
  ['At 16.9,10', ['Atos 16:9-10']],
  ['At 22.29; 23.27', ['Atos 22:29', 'Atos 23:27']],
  ['Rm 8.1,5,6-9', ['Romanos 8:1', 'Romanos 8:5-9']],
  ['Hb 11.30; Rm 8.28-39', ['Hebreus 11:30', 'Romanos 8:28-39']],
  ['1Ts 2.2', ['1 Tessalonicenses 2:2']],
  ['Deuteron 6.4-9', ['Deuteronômio 6:4-9']],
];

for (const [entrada, esperado] of casos) {
  test(`entende "${entrada}"`, () => {
    const r = parseReferences(entrada);
    expect(r.errors).toEqual([]);
    expect(r.refs.map((x) => x.label)).toEqual(esperado);
  });
}

for (const invalida of ['Xyz 3', 'Gn 51', 'At 16.10-9', 'Jo']) {
  test(`recusa "${invalida}"`, () => {
    expect(parseReferences(invalida).refs).toEqual([]);
  });
}

test('trecho que atravessa capítulos: 1Sm 9.15-10.1', () => {
  const { refs, errors } = parseReferences('1Sm 9.15-10.1; Is 52.13–53.12');
  expect(errors).toEqual([]);
  expect(refs.map((r) => [r.bookId, r.chapter, r.from, r.to])).toEqual([
    ['1SA', 9, 15, 999],
    ['1SA', 10, 1, 1],
    ['ISA', 52, 13, 999],
    ['ISA', 53, 1, 12],
  ]);
  expect(parseReferences('Gn 3.1-2.5').errors).toEqual(['Gn 3.1-2.5']);
});
