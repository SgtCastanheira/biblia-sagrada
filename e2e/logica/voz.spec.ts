import { expect, test } from '@playwright/test';
import { isNaturalVoice, rankVoices } from '../../src/app/core/voice';

const v = (name: string, lang = 'pt-BR') => ({ name, lang });

test('voz: a neural da Microsoft vem primeiro e a do Google fica por último', () => {
  const ranked = rankVoices([
    v('Google português do Brasil'),
    v('Microsoft Maria - Portuguese (Brazil)'),
    v('Microsoft Francisca Online (Natural) - Portuguese (Brazil)'),
    v('Luciana'),
    v('Joana', 'pt-PT'),
    v('Samantha', 'en-US'),
  ]);
  expect(ranked.map((x) => x.name)).toEqual([
    'Microsoft Francisca Online (Natural) - Portuguese (Brazil)',
    'Microsoft Maria - Portuguese (Brazil)',
    'Luciana',
    'Google português do Brasil',
    'Joana',
  ]);
});

test('voz: Premium da Apple ganha da comum, e voz compacta ou eSpeak perde', () => {
  const ranked = rankVoices([v('Luciana (Compacta)'), v('eSpeak Portuguese (Brazil)'), v('Luciana (Premium)')]);
  expect(ranked[0].name).toBe('Luciana (Premium)');
  expect(ranked[ranked.length - 1].name).toMatch(/eSpeak|Compacta/);
  expect(isNaturalVoice('Luciana (Premium)')).toBe(true);
  expect(isNaturalVoice('Google português do Brasil')).toBe(false);
});
