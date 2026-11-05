import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

/**
 * O estudo do avivamento da Coreia diz, no começo de cada capítulo, de qual Coreia está falando: a Coreia unida (até
 * 1945, sem divisão), a Coreia do Sul ou a Coreia do Norte. Não usa a pergunta “Qual Coreia?” como título.
 */
const texto = readFileSync('public/conteudo/artigos/avivamento-da-coreia.md', 'utf8');
const ROTULO = /\*\*(Coreia unida|Coreia do Sul|Coreia do Norte|Coreia do Norte e Coreia do Sul|Da Coreia unida às duas Coreias)\.\*\*/;
const SEM_ROTULO = ['O que Ficou', 'Linha do Tempo', 'Para a Vida'];

test('coreia: cada capítulo diz de qual Coreia fala (unida, do Sul ou do Norte)', () => {
  const capitulos = texto.split(/\n## /).slice(1);
  expect(capitulos.length).toBeGreaterThan(10);
  const sem = capitulos
    .filter((c) => !SEM_ROTULO.some((t) => c.startsWith(t)))
    .filter((c) => !ROTULO.test(c) && !/:::cena [^\n]*Coreia unida/.test(c))
    .map((c) => c.split('\n')[0]);
  expect(sem, 'capítulos sem o nome da Coreia').toEqual([]);
});

test('coreia: o estudo fala em “Coreia unida” e não usa a pergunta como título', () => {
  expect(texto).toContain('Coreia unida');
  expect(texto).not.toMatch(/Qual Coreia/i);
  expect(texto).not.toMatch(/ainda um só país|então um só país/);
});
