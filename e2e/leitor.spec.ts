import { expect, test } from './base';

test.describe('Leitor', () => {
  test('mostra um versículo por linha (padrão)', async ({ page }) => {
    await page.goto('/ler/JHN/3');
    const linhas = page.locator('.line');
    await expect(linhas.first()).toBeVisible();
    expect(await linhas.count()).toBeGreaterThan(5);
    // Cada versículo começa numa linha nova: o topo do 2º está abaixo do fim do 1º
    const a = await linhas.nth(0).boundingBox();
    const b = await linhas.nth(1).boundingBox();
    expect(b!.y).toBeGreaterThanOrEqual(a!.y + a!.height - 1);
    await expect(linhas.nth(0).locator('.n')).toHaveText('1');
  });

  test('alterna para texto corrido em Aparência', async ({ page }) => {
    await page.goto('/ler/JHN/3');
    await page.getByRole('button', { name: 'Aparência da leitura' }).click();
    await page.getByRole('button', { name: /Texto corrido/ }).click();
    await page.keyboard.press('Escape');
    await expect(page.locator('.verse').first()).toBeVisible();
    await expect(page.locator('.line')).toHaveCount(0);
  });

  test('não tenta baixar arquivos locais inexistentes (sem 404)', async ({ page, problems }) => {
    // O vigia (problems) falha o teste se qualquer /bible/... responder 404
    await page.goto('/ler/JOS/1');
    await expect(page.locator('.line').first()).toBeVisible();
    await page.goto('/ler/ACT/16');
    await expect(page.locator('.line').first()).toBeVisible();
    expect(problems.errors).toEqual([]);
  });

  test('tocar num versículo permite destacar e salvar nos favoritos', async ({ page }) => {
    await page.goto('/ler/JHN/3');
    await page.locator('#v3').click();
    await page.getByRole('button', { name: 'Destacar em Verde' }).click();
    await expect(page.locator('#v3')).toHaveClass(/marked/);
    await page.goto('/favoritos');
    await expect(page.getByText('João 3:3')).toBeVisible();
  });

  test('navega para o próximo capítulo', async ({ page }) => {
    await page.goto('/ler/JHN/3');
    await page.locator('.nav-card.next').click();
    await expect(page).toHaveURL(/\/ler\/JHN\/4/);
    await expect(page.locator('.chapter-number')).toHaveText('4');
  });

  test('modo comparação mostra as duas versões', async ({ page }) => {
    await page.goto('/ler/PSA/23');
    await page.getByRole('button', { name: 'Comparar versões' }).click();
    await page.getByRole('button', { name: /King James Version/ }).click();
    await expect(page.locator('.pair').first()).toBeVisible();
    await expect(page.locator('.pair .other').first()).toContainText('(kjv)');
  });

  test('capítulo com mapa mostra o mapa no painel de estudo', async ({ page }) => {
    await page.goto('/ler/ACT/16');
    await page.getByRole('button', { name: /Estudar este capítulo/ }).click();
    await page.getByRole('link', { name: /Segunda viagem missionária/ }).click();
    await expect(page).toHaveURL(/\/mapas\/segunda-viagem-de-paulo/);
  });
});
