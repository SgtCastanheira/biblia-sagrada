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
  await expect(page.locator('.notice.fallback')).toContainText('só tem o Novo Testamento');
  await expect(page.locator('#v1')).toContainText('No princípio'); // o capítulo vem da Almeida
  await expect(page.locator('p.source')).toContainText('Almeida');
  await page.getByRole('button', { name: 'Ver o Novo Testamento' }).click();
  await expect(page).toHaveURL(/\/ler\/MAT\/1/);
  await expect(page.locator('#v1')).toBeVisible();
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

test('Sinodal russa embutida: Bíblia inteira, sem pedir nada à internet', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('biblia.settings.version', JSON.stringify('synodal')));
  for (const ref of ['GEN/1', 'PSA/23', 'JHN/3', 'REV/22']) {
    await page.goto(`/ler/${ref}`);
    await expect(page.locator('#v1')).toContainText(/[А-Яа-я]/);
  }
  await expect(page.locator('p.source')).toContainText('domínio público');
});

test('tradução que pula versículos avisa quais faltam; versão completa não avisa', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('biblia.settings.version', JSON.stringify('xavante')));
  await page.goto('/ler/JHN/1');
  await expect(page.locator('.gap-note')).toContainText('Esta tradução não traz os versículos 11, 17');
  await page.evaluate(() => localStorage.setItem('biblia.settings.version', JSON.stringify('almeida')));
  await page.goto('/ler/JHN/1');
  await expect(page.locator('#v1')).toBeVisible();
  await expect(page.locator('.gap-note')).toHaveCount(0);
});
