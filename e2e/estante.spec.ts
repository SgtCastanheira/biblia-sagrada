import { expect, test } from './base';
import { TRAILS } from '../src/app/core/trails';

test('estante: um livro por assunto; tocar abre o livro e entra no assunto', async ({ page }) => {
  await page.goto('/historia');
  const livros = page.locator('app-bookshelf .book');
  await expect(livros).toHaveCount(TRAILS.length);
  await livros.filter({ hasText: 'Profecias' }).click();
  // A capa gira antes de entrar
  await expect(livros.filter({ hasText: 'Profecias' })).toHaveClass(/opening/);
  await expect(page).toHaveURL(/\/historia\?trilha=profecias/);
  await expect(page.getByRole('heading', { level: 2, name: 'Profecias' })).toBeVisible();
  // De dentro do livro, "Todos" volta para a estante
  await page.getByRole('navigation', { name: 'Assuntos das histórias' }).getByRole('link', { name: 'Todos' }).click();
  await expect(page.locator('app-bookshelf')).toBeVisible();
});

test.describe('com movimento reduzido', () => {
  test.use({ reducedMotion: 'reduce' });
  test('o livro abre sem esperar a animação', async ({ page }) => {
    await page.goto('/historia');
    await page.locator('app-bookshelf .book').filter({ hasText: 'Teologia' }).click();
    await expect(page).toHaveURL(/trilha=teologia/);
  });
});
