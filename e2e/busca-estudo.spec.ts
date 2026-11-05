import { expect, test } from './base';

test('estudo: pesquisar "conselho de Niceia" leva à história do Concílio', async ({ page }) => {
  await page.goto('/historia');
  await page.getByRole('searchbox', { name: 'Pesquisar na biblioteca' }).fill('conselho de niceia');
  const hits = page.locator('a.hit');
  await expect(hits.first()).toBeVisible();
  await expect(hits.first()).toContainText('Niceia');
  await expect(page.locator('a.hit mark').first()).toBeVisible();
  // Mais de um estudo fala de Niceia (a síntese de Ferguson também): o do Concílio tem de estar entre os primeiros, não necessariamente em primeiro
  const concilio = page.locator('a.hit[href$="/artigo/constantino-e-os-concilios"]');
  await expect(concilio).toBeVisible();
  const primeiros = await hits.evaluateAll((els) => els.slice(0, 5).map((e) => e.getAttribute('href')));
  expect(primeiros.some((h) => h?.endsWith('/artigo/constantino-e-os-concilios')), `entre os 5 primeiros: ${primeiros.join(', ')}`).toBe(true);
  await concilio.click();
  await expect(page).toHaveURL(/\/artigo\/constantino-e-os-concilios/);
  // O endereço guarda a pesquisa: ao voltar, ela continua
  await page.goBack();
  await expect(page.getByRole('searchbox', { name: 'Pesquisar na biblioteca' })).toHaveValue('conselho de niceia');
});

test('estudo: filtro por tipo, mensagem sem resultado e botão de limpar', async ({ page }) => {
  await page.goto('/historia?q=avivamento');
  await expect(page.locator('a.hit').first()).toBeVisible();
  await page.locator('.chips button', { hasText: 'Estado' }).click();
  for (const meta of await page.locator('a.hit .meta').allTextContents()) expect(meta).toContain('Estado');
  await page.getByRole('searchbox', { name: 'Pesquisar na biblioteca' }).fill('zzxqwv');
  await expect(page.getByText(/Nada encontrado/)).toBeVisible();
  await page.getByRole('button', { name: 'Limpar a pesquisa' }).click();
  await expect(page.getByRole('heading', { name: 'Personagens e Famílias' })).toBeVisible();
});
