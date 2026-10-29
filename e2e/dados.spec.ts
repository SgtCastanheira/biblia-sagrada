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

/** Arquivo de backup montado no teste, no mesmo formato que o app exporta. */
const arquivoBackup = (data: Record<string, unknown>) => ({
  name: 'backup.json',
  mimeType: 'application/json',
  buffer: Buffer.from(JSON.stringify({ app: 'biblia-sagrada', version: 1, exportedAt: new Date().toISOString(), data })),
});

test('backup danificado é recusado e os dados continuam', async ({ page }) => {
  await page.goto('/ajustes');
  await page.evaluate(() => localStorage.setItem('biblia.teste', 'antigo'));
  await page.locator('input[type=file]').setInputFiles(arquivoBackup({ 'biblia.teste': { quebrado: true } }));
  await expect(page.getByText('Este backup está danificado')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('biblia.teste'))).toBe('antigo');
});

test('backup que não cabe no aparelho devolve os dados que estavam aqui', async ({ page }) => {
  await page.goto('/ajustes');
  await page.evaluate(() => {
    localStorage.setItem('biblia.teste', 'antigo');
    // Simula o espaço acabando no meio da restauração
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key: string, value: string) {
      if (key === 'biblia.grande') throw new DOMException('Sem espaço', 'QuotaExceededError');
      setItem.call(this, key, value);
    };
  });
  page.once('dialog', (d) => d.accept());
  await page.locator('input[type=file]').setInputFiles(arquivoBackup({ 'biblia.novo': 'x', 'biblia.grande': 'y' }));
  await expect(page.getByText('O backup não coube neste aparelho')).toBeVisible();
  const dados = await page.evaluate(() => [localStorage.getItem('biblia.teste'), localStorage.getItem('biblia.novo')]);
  expect(dados).toEqual(['antigo', null]);
});

test('quando não consegue salvar, avisa e leva aos Ajustes', async ({ page }) => {
  await page.goto('/anotacoes');
  await page.evaluate(() => {
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key: string, value: string) {
      if (key.startsWith('biblia.notes')) throw new DOMException('Sem espaço', 'QuotaExceededError');
      setItem.call(this, key, value);
    };
  });
  await page.locator('button.new').click();
  await page.getByRole('textbox', { name: 'Tema' }).fill('Não vai salvar');
  await expect(page.getByText('Não foi possível salvar neste aparelho')).toBeVisible();
  await page.getByRole('button', { name: 'Ajustes' }).click();
  await expect(page).toHaveURL(/\/ajustes/);
  await expect(page.getByText('Algo não foi salvo nesta visita')).toBeVisible();
  await expect(page.getByText(/Seus dados ocupam \d+ KB/)).toBeVisible();
});
