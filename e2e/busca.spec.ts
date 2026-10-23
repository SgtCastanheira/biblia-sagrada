import { expect, test } from './base';

test('digitar uma referência oferece "Ir para"', async ({ page }) => {
  await page.goto('/busca');
  await page.getByRole('searchbox', { name: 'Buscar na Bíblia' }).fill('Fp 4.13');
  await page.getByText('Ir para').click();
  await expect(page).toHaveURL(/\/ler\/PHP\/4#v13/);
});

test('busca por palavra (quando a Bíblia embutida existe)', async ({ page, request }) => {
  const index = await (await request.get('/bible/index.json')).json();
  test.skip((index.almeida ?? []).length < 66, 'A Almeida embutida ainda não foi gerada neste build');
  await page.goto('/busca');
  await page.getByRole('searchbox', { name: 'Buscar na Bíblia' }).fill('pastor');
  await expect(page.locator('.hit').first()).toBeVisible({ timeout: 20_000 });
  await expect(page.locator('.hit mark').first()).toHaveText(/pastor/i);
});
