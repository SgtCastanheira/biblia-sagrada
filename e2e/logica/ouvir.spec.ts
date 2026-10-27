import { expect, test } from '@playwright/test';
import { splitForSpeech } from '../../src/app/core/speech-split';

test('ouvir: o texto vira frases curtas, sem perder nada', () => {
  const text = 'No princípio, criou Deus os céus e a terra. E a terra era sem forma e vazia; e havia trevas sobre a face do abismo! Disse Deus: Haja luz?';
  const chunks = splitForSpeech(text);
  expect(chunks.length).toBeGreaterThanOrEqual(4);
  expect(chunks.join(' ').replace(/\s+/g, ' ')).toBe(text);
  expect(chunks.every((c) => c.length <= 220)).toBe(true);
});

test('ouvir: frase muito longa é cortada na vírgula ou no espaço', () => {
  const long = Array.from({ length: 60 }, (_, i) => `palavra${i}`).join(' ');
  const chunks = splitForSpeech(long);
  expect(chunks.length).toBeGreaterThan(1);
  expect(chunks.every((c) => c.length <= 220)).toBe(true);
  expect(chunks.join(' ')).toBe(long);
  expect(splitForSpeech('   ')).toEqual([]);
});

import { normalizeForMatch, textKey } from '../../src/app/core/audio-text';

test('ouvir: o identificador do trecho ignora acento, pontuação e maiúsculas, mas distingue textos', () => {
  expect(textKey('Eles O ouviram: “Jesus é Senhor!”')).toBe(textKey('eles o ouviram jesus e senhor'));
  expect(textKey('Pentecostes')).not.toBe(textKey('Pentecoste'));
  expect(normalizeForMatch('  Ação — João 3.16 ')).toBe('acao joao 3 16');
  expect(textKey('x')).toMatch(/^[0-9a-f]{8}$/);
});
