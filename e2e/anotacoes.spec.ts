import { expect, test } from './base';

test('cria anotação com indicação e textos bíblicos', async ({ page }) => {
  await page.goto('/anotacoes');
  await page.locator('button.new').click();
  await page.getByRole('radio', { name: /Culto de Domingo/ }).click();
  await page.getByRole('textbox', { name: 'Tema' }).fill('A alegria no Senhor');
  await page.getByRole('textbox', { name: 'Pregador' }).fill('Pr. Teste');
  await page.getByRole('textbox', { name: 'Textos bíblicos' }).fill('Fp 4.4-7');
  await expect(page.locator('app-passage-view figure')).toBeVisible();
  await page.getByRole('button', { name: 'Voltar' }).click();
  const nota = page.locator('.note').first();
  await expect(nota).toContainText('Culto de Domingo');
  await expect(nota).toContainText('A alegria no Senhor');
});

test('cria uma indicação nova ("Culto de Jovens")', async ({ page }) => {
  await page.goto('/anotacoes');
  await page.locator('button.new').click();
  await page.locator('.types .add').click();
  await page.getByRole('textbox', { name: 'Nova indicação' }).fill('Culto de Jovens');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('radio', { name: /Culto de Jovens/ })).toHaveAttribute('aria-checked', 'true');
});

test('anotação aberta e deixada em branco não fica na lista', async ({ page }) => {
  await page.goto('/anotacoes');
  await page.locator('button.new').click();
  await page.getByRole('button', { name: 'Voltar' }).click();
  await expect(page.locator('.note')).toHaveCount(0);
});
