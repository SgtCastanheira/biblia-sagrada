import { expect, test } from './base';

test('capa da história: o quadro ao fundo e o botão de ouvir', async ({ page }) => {
  await page.goto('/artigo/igreja-e-estado');
  const hero = page.locator('.hero.has-cover');
  await expect(hero.locator('img.cover-img')).toHaveAttribute('src', /primeira-missa-meirelles/);
  await expect(hero.getByRole('heading', { level: 1, name: 'A Igreja e o Estado no Brasil' })).toBeVisible();
  await expect(hero.getByRole('button', { name: 'Ouvir a história' })).toBeVisible();
  // Sem quadro definido, a capa continua com o ícone de fundo
  await page.goto('/artigo/movimento-pentecostal');
  await expect(page.locator('.hero')).not.toHaveClass(/has-cover/);
  await expect(page.locator('.hero .watermark')).toBeAttached();
});

test('leitura sem distração: no celular as barras saem ao descer e voltam ao subir', async ({ page }, info) => {
  test.skip(info.project.name !== 'celular', 'no computador o menu é lateral e fica');
  await page.goto('/artigo/igreja-e-estado');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const nav = page.locator('nav.nav');
  const top = page.locator('header.top-bar');
  for (let i = 0; i < 5; i++) {
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(80);
  }
  await expect(nav).toHaveClass(/hidden/);
  await expect(top).toHaveClass(/hidden/);
  await page.mouse.wheel(0, -300);
  await expect(nav).not.toHaveClass(/hidden/);
  await expect(top).not.toHaveClass(/hidden/);
  // Em outra tela, as barras já começam à vista
  await page.mouse.wheel(0, 800);
  await expect(nav).toHaveClass(/hidden/);
  await page.goto('/historia');
  await expect(nav).not.toHaveClass(/hidden/);
});

test('fotos: um toque abre em tela cheia com a legenda, amplia e fecha com Esc', async ({ page }) => {
  await page.goto('/artigo/igreja-e-estado');
  const photo = page.locator('figure.photo').first();
  await photo.getByRole('button', { name: 'Ampliar a imagem' }).click();
  const viewer = page.getByRole('dialog', { name: /A Primeira Missa no Brasil/ });
  await expect(viewer).toBeVisible();
  await expect(viewer).toContainText('Domínio público');
  await expect(viewer.getByRole('button', { name: 'Fechar a imagem' })).toBeFocused();
  await viewer.getByRole('img').click();
  await expect(viewer).toContainText('Arraste para ver os detalhes');
  await page.keyboard.press('Escape');
  await expect(viewer).toHaveCount(0);
  // Também abre tocando na própria foto
  await photo.getByRole('img').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Fechar a imagem' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('fim da história: "História concluída" e quantas a pessoa já leu', async ({ page }) => {
  await page.goto('/artigo/igreja-e-estado');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.locator('app-story-journey').scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 200);
  await expect(page.getByRole('status').filter({ hasText: 'História concluída' })).toContainText('Você já leu 1 história do app');
});
