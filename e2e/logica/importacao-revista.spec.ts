import { expect, test } from '@playwright/test';
import { importLesson } from '../../src/app/core/lesson-import';

// Somente a ESTRUTURA de uma lição (títulos de seção e referências). Nenhum texto da revista.
const estrutura = `Lição 01: Carta aos Filipenses: um chamado à alegria | 4º Trimestre de 2026 | EBD JOVENS
EBD | CPAD JOVENS – TEMA: REGOZIJAI-VOS NO SENHOR – Vivendo com propósito

TEXTO PRINCIPAL
"[citação]" (Fp 1.6).

LEITURA SEMANAL
SEGUNDA — At 16.12 Descrição
TERÇA — At 22.29; 23.27 Descrição
QUARTA — At 16.9,10 Descrição
QUINTA — 1Ts 2.2 Descrição
SEXTA — Ne 8.10 Descrição
SÁBADO — Fp 1.1 Descrição

TEXTO BÍBLICO
Filipenses 1.1-11.
[texto]`;

test('extrai só título, tema e referências da lição', () => {
  const r = importLesson(estrutura);
  expect(r.number).toBe(1);
  expect(r.title).toBe('Carta aos Filipenses: um chamado à alegria');
  expect(r.theme).toBe('Regozijai-vos no Senhor');
  expect(r.goldenText).toBe('Fp 1.6');
  expect(r.reading).toBe('Filipenses 1.1-11');
  expect(r.daily).toEqual(['At 16.12', 'At 22.29; 23.27', 'At 16.9,10', '1Ts 2.2', 'Ne 8.10', 'Fp 1.1']);
});

test('aceita "TEXTO ÁUREO" e "LEITURA BÍBLICA EM CLASSE"', () => {
  const r = importLesson('Lição 5 - A humildade de Cristo\nTEXTO ÁUREO\n"..." (Fp 2.5)\nLEITURA BÍBLICA EM CLASSE\nFilipenses 2.1-11');
  expect(r.number).toBe(5);
  expect(r.goldenText).toBe('Fp 2.5');
  expect(r.reading).toBe('Filipenses 2.1-11');
});

test('texto sem referências não preenche nada', () => {
  const r = importLesson('Um texto qualquer sem nada de lição.');
  expect(r.title).toBeUndefined();
  expect(r.daily.every((d) => d === null)).toBe(true);
});
