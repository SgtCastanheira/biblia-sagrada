import { expect, test } from './base';

test('Bíblia em línguas indígenas do Brasil: Guarani Mbyá completa, Ticuna só NT, com o aviso de direitos', async ({ page }) => {
  await page.goto('/ler/JHN/3');
  await page.getByRole('button', { name: 'Trocar versão' }).click();
  await page.getByRole('button', { name: /Guarani Mbyá/ }).or(page.getByRole('option', { name: /Guarani Mbyá/ })).first().click();
  await expect(page.locator('#v16')).toContainText('Nhanderuete');
  await expect(page.locator('p.source')).toContainText('Wycliffe Bible Translators');
  await expect(page.locator('p.source')).toContainText('CC BY-NC-ND');

  // Guarani Mbyá e Guajajára têm a Bíblia inteira
  await page.goto('/ler/GEN/1');
  await expect(page.locator('#v1')).toContainText('Nhanderuete');
  await page.evaluate(() => localStorage.setItem('biblia.settings.version', JSON.stringify('guajajara')));
  await page.goto('/ler/GEN/1');
  await expect(page.locator('#v1')).toBeVisible();

  // As outras, só o Novo Testamento: o Antigo avisa, sem pedir nada à internet
  await page.evaluate(() => localStorage.setItem('biblia.settings.version', JSON.stringify('ticuna')));
  await page.goto('/ler/GEN/1');
  await expect(page.getByText('contém apenas o Novo Testamento')).toBeVisible();
  await page.goto('/ler/JHN/3');
  await expect(page.locator('#v16')).toContainText('Tupana');
});

test('o fim do capítulo mostra a licença certa de cada versão, não "domínio público" para todas', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('biblia.settings.version', JSON.stringify('nbv')));
  await page.goto('/ler/JHN/3');
  await expect(page.locator('p.source')).toContainText('CC BY-SA 4.0');
  await page.evaluate(() => localStorage.setItem('biblia.settings.version', JSON.stringify('almeida')));
  await page.goto('/ler/JHN/3');
  await expect(page.locator('p.source')).toContainText('domínio público');
});
