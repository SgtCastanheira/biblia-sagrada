import { expect, test } from './base';
import { findArticle } from '../src/app/core/library';
import { TRAILS, trailArticleIds } from '../src/app/core/trails';

const TOTAL = TRAILS.reduce((n, t) => n + trailArticleIds(t).length + t.branches.reduce((m, b) => m + (b.links?.length ?? 0), 0), 0);

test('estante: toda história é uma lombada, agrupada por assunto', async ({ page }) => {
  await page.goto('/historia');
  await expect(page.locator('app-bookshelf .bay')).toHaveCount(TRAILS.length);
  await expect(page.locator('app-bookshelf .spine')).toHaveCount(TOTAL);
  // Cada assunto mostra quantos livros tem
  const primeira = TRAILS[0];
  await expect(page.locator('.bay').first().locator('.n')).toHaveText(String(trailArticleIds(primeira).length + primeira.branches.reduce((m, b) => m + (b.links?.length ?? 0), 0)));
});

test('biblioteca: cada subtópico é uma prateleira com o seu título, e o índice leva à estante do assunto', async ({ page }) => {
  await page.goto('/historia');
  const prateleiras = TRAILS.reduce((n, t) => n + t.branches.length, 0);
  await expect(page.locator('app-bookshelf .shelf')).toHaveCount(prateleiras);
  const contexto = page.locator('#bay-contexto');
  await expect(contexto.getByRole('heading', { level: 3, name: 'Roma e o Poder' })).toBeVisible();
  await expect(contexto.getByRole('heading', { level: 3, name: 'A Fé e a Família' })).toBeVisible();
  await page.getByRole('navigation', { name: 'Assuntos da biblioteca' }).getByRole('button', { name: 'Ir para Profecias' }).click();
  await expect(page.locator('#bay-profecias')).toBeInViewport();
});

test('estante: tocar na lombada mostra a capa com o título inteiro; "Abrir o livro" gira a capa e entra na história', async ({ page }) => {
  await page.goto('/historia');
  const a = findArticle('trindade')!;
  await page.getByRole('button', { name: new RegExp(`^Livro: ${a.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`) }).click();
  const capa = page.getByRole('dialog', { name: a.title });
  await expect(capa).toBeVisible();
  await expect(capa).toContainText(a.subtitle);
  await capa.getByRole('button', { name: 'Abrir o livro' }).click();
  await expect(capa.locator('.vol')).toHaveClass(/opening/);
  await expect(page).toHaveURL(/\/artigo\/trindade$/);
});

test('estante: Esc fecha a capa e devolve o livro à prateleira', async ({ page }) => {
  await page.goto('/historia');
  await page.locator('.spine').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page).toHaveURL(/\/historia$/);
});

test('estante: "Ver em lista" leva ao assunto, e "Todos" volta para a estante', async ({ page }) => {
  await page.goto('/historia');
  await page.getByRole('link', { name: 'Ver o assunto Profecias em lista' }).click();
  await expect(page).toHaveURL(/\/historia\?trilha=profecias/);
  await expect(page.getByRole('heading', { level: 2, name: 'Profecias' })).toBeVisible();
  await page.getByRole('navigation', { name: 'Assuntos das histórias' }).getByRole('link', { name: 'Todos' }).click();
  await expect(page.locator('app-bookshelf')).toBeVisible();
});

test('estante: um atalho (que não é história) também é um livro e leva à tela dele', async ({ page }) => {
  await page.goto('/historia');
  await page.getByRole('button', { name: /^Atalho: / }).first().click();
  await page.getByRole('dialog').getByRole('button', { name: 'Abrir', exact: true }).click();
  await expect(page).not.toHaveURL(/\/historia$/);
});

test.describe('com movimento reduzido', () => {
  test.use({ reducedMotion: 'reduce' });
  test('o livro abre sem esperar a animação', async ({ page }) => {
    await page.goto('/historia');
    await page.getByRole('button', { name: /^Livro: A Trindade: Um Só Deus/ }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Abrir o livro' }).click();
    await expect(page).toHaveURL(/\/artigo\/trindade$/);
  });
});
