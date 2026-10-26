import { expect, test } from './base';

test('lista todos os mapas', async ({ page }) => {
  await page.goto('/mapas');
  await expect(page.locator('.grid .card')).toHaveCount(16);
  await expect(page.getByRole('heading', { name: 'História da Igreja' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Antigo Testamento' })).toBeVisible();
  await expect(page.locator('.card').first()).toContainText('Gênesis 11–13');
});

test('jornada: abre, avança etapas e fecha', async ({ page }) => {
  await page.goto('/mapas/segunda-viagem-de-paulo');
  await page.getByRole('button', { name: /Viver a jornada/ }).click();
  const jornada = page.getByRole('dialog');
  await expect(jornada).toBeVisible();
  const lugar = jornada.locator('.card-head .place');
  await expect(lugar).toHaveText('Antioquia');
  await jornada.getByRole('button', { name: /Pausar/ }).click();
  await jornada.getByRole('button', { name: 'Próxima etapa' }).click();
  await expect(lugar).toHaveText('Derbe');
  await expect(jornada.locator('blockquote')).toBeVisible();
  await jornada.getByRole('button', { name: 'Fechar' }).click();
  await expect(jornada).toBeHidden();
});

test('mapa: arrastar e zoom mudam a área visível', async ({ page, isMobile }) => {
  test.skip(!!isMobile, 'Roda do mouse só no computador');
  await page.goto('/mapas/segunda-viagem-de-paulo');
  const svg = page.locator('.map-frame svg');
  const antes = await svg.getAttribute('viewBox');
  const box = (await svg.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(0, -600);
  await expect.poll(() => svg.getAttribute('viewBox')).not.toBe(antes);
  await expect(page.getByRole('button', { name: 'Ver o mapa inteiro' })).toBeVisible();
});
