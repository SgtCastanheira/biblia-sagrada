import { expect, test } from './base';

test('backup: exporta, apaga e restaura os dados', async ({ page }) => {
  await page.goto('/anotacoes');
  await page.locator('button.new').click();
  await page.getByRole('textbox', { name: 'Tema' }).fill('Anotação do backup');
  await page.getByRole('button', { name: 'Voltar' }).click();

  await page.goto('/ajustes');
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: /Fazer backup/ }).click()]);
  const arquivo = await download.path();

  await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('biblia.notes')).forEach((k) => localStorage.removeItem(k)));
  page.once('dialog', (d) => d.accept());
  // Depois de restaurar, o app recarrega sozinho: espera esse recarregamento terminar
  await Promise.all([page.waitForEvent('load'), page.locator('input[type=file]').setInputFiles(arquivo!)]);
  await page.goto('/anotacoes');
  await expect(page.getByText('Anotação do backup')).toBeVisible();
});
