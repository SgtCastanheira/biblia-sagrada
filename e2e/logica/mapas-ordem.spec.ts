import { expect, test } from '@playwright/test';
import { MAPS_IN_ORDER, mapReference } from '../../src/app/core/maps';

test('mapas seguem a ordem dos livros da Bíblia', () => {
  const ordem = MAPS_IN_ORDER.map((m) => `${mapReference(m)} — ${m.title}`);
  console.log(ordem.join('\n'));
  expect(MAPS_IN_ORDER.map((m) => m.id)).toEqual([
    'jornada-de-abraao',
    'tribos-de-israel',
    'fuga-e-retorno-de-moises',
    'exodo',
    'conquista-de-jerico',
    'cativeiros-de-israel',
    'exilio-na-babilonia',
    'vida-de-jesus',
    'nascimento-de-jesus',
    'ministerio-na-galileia',
    'discipulos-apos-a-cruz',
    'primeira-viagem-de-paulo',
    'segunda-viagem-de-paulo',
    'viagem-a-roma',
  ]);
});
