import { expect, test } from './base';

test('estudo: pesquisar "conselho de Niceia" leva à história do Concílio', async ({ page }) => {
  await page.goto('/estudo');
  await page.getByRole('searchbox', { name: 'Pesquisar no estudo' }).fill('conselho de niceia');
  const first = page.locator('a.hit').first();
  await expect(first).toBeVisible();
  await expect(first).toContainText('Niceia');
  await expect(page.locator('a.hit mark').first()).toBeVisible();
  await first.click();
  await expect(page).toHaveURL(/\/artigo\/constantino-e-os-concilios/);
  // O endereço guarda a pesquisa: ao voltar, ela continua
  await page.goBack();
  await expect(page.getByRole('searchbox', { name: 'Pesquisar no estudo' })).toHaveValue('conselho de niceia');
});

test('estudo: filtro por tipo, mensagem sem resultado e botão de limpar', async ({ page }) => {
  await page.goto('/estudo?q=avivamento');
  await expect(page.locator('a.hit').first()).toBeVisible();
  await page.locator('.chips button', { hasText: 'Estado' }).click();
  for (const meta of await page.locator('a.hit .meta').allTextContents()) expect(meta).toContain('Estado');
  await page.getByRole('searchbox', { name: 'Pesquisar no estudo' }).fill('zzxqwv');
  await expect(page.getByText(/Nada encontrado/)).toBeVisible();
  await page.getByRole('button', { name: 'Limpar a pesquisa' }).click();
  await expect(page.getByRole('heading', { name: 'Personagens' })).toBeVisible();
});
