import { LATEST_RELEASE } from '../src/app/core/whats-new';
import { expect, test } from './base';

test('novidades aparecem uma vez em cada aparelho; na primeira visita, com boas-vindas', async ({ page }) => {
  await page.goto('/');
  // Quem já usava: tem dados do app e viu a atualização anterior
  await page.evaluate(() => localStorage.setItem('biblia.novidades.visto', 'versao-anterior'));
  await page.reload();
  const painel = page.locator('app-whats-new-sheet');
  await expect(painel).toContainText(LATEST_RELEASE.items[0].title);
  await painel.getByRole('button', { name: 'Entendi' }).click();
  await expect(painel).toHaveCount(0);
  await page.reload();
  await page.waitForTimeout(2500);
  await expect(painel).toHaveCount(0);

  // Outro aparelho, abrindo o link pela primeira vez (sem nenhum dado do app): boas-vindas com as abas e a novidade, uma vez
  await page.evaluate(() => Object.keys(localStorage).forEach((k) => localStorage.removeItem(k)));
  await page.reload();
  await expect(painel).toContainText('Bem-vindo');
  await expect(painel).toContainText(LATEST_RELEASE.title);
  await expect(painel.getByRole('button', { name: /Meu espaço/ })).toBeVisible();
  await painel.getByRole('button', { name: 'Começar' }).click();
  await page.reload();
  await page.waitForTimeout(2500);
  await expect(painel).toHaveCount(0);
});

test('a página de novidades leva às telas novas e copia o texto para compartilhar', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/ajustes');
  await page.getByRole('link', { name: 'Novidades' }).click();
  await page.evaluate(() => Object.defineProperty(navigator, 'share', { value: undefined }));
  await page.getByRole('button', { name: 'Compartilhar' }).first().click();
  const texto = await page.evaluate(() => navigator.clipboard.readText());
  expect(texto).toContain('*Bíblia Sagrada* — novidades');
  expect(texto).toContain('Abra e instale no celular: http');
  await page.getByRole('link', { name: /Fontes das informações/ }).click();
  await expect(page).toHaveURL(/\/fontes$/);
});
