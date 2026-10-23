import { expect, test } from './base';

const estrutura = `Lição 01: Carta aos Filipenses: um chamado à alegria | 4º Trimestre
CPAD JOVENS – TEMA: REGOZIJAI-VOS NO SENHOR – Vivendo
TEXTO PRINCIPAL
"[citação]" (Fp 1.6).
LEITURA SEMANAL
SEGUNDA — At 16.12 Descrição que deve ser descartada
TERÇA — At 22.29; 23.27 Descrição
TEXTO BÍBLICO
Filipenses 1.1-11.
INTRODUÇÃO
[comentário que deve ser descartado]`;

test('cria o trimestre e importa a lição colando o texto', async ({ page }) => {
  await page.goto('/ebd');
  await page.locator('button.create').click();
  await expect(page.locator('.lesson')).toHaveCount(13);

  await page.goto('/ebd/licao/1');
  await page.getByRole('button', { name: 'Colar da revista' }).click();
  await page.getByRole('textbox', { name: 'Texto da lição' }).fill(estrutura);
  await page.getByRole('button', { name: 'Ler referências' }).click();
  await page.getByRole('button', { name: /Preencher Lição 1/ }).click();

  await expect(page.locator('.title-input')).toHaveValue('Carta aos Filipenses: um chamado à alegria');
  await expect(page.locator('.ref-input').nth(0)).toHaveValue('Fp 1.6');
  await expect(page.locator('.ref-input').nth(1)).toHaveValue('Filipenses 1.1-11');

  // Nada além de título e referências fica salvo
  const salvo = await page.evaluate(() => localStorage.getItem('biblia.ebd.quarter') ?? '');
  expect(salvo).not.toContain('descartada');
  expect(salvo).not.toContain('comentário');

  // A lição de Filipenses mostra o mapa da 2ª viagem
  await expect(page.getByText('Mapas desta lição')).toBeVisible();
});
