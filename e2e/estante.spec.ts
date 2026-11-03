import { expect, test } from './base';
import { findArticle } from '../src/app/core/library';
import { TOOL_BAYS } from '../src/app/core/library-bays';
import { TRAILS, trailArticleIds } from '../src/app/core/trails';

const TOTAL = TOOL_BAYS.reduce((n, b) => n + b.shelves.reduce((m, sh) => m + sh.books.length, 0), 0) + TRAILS.reduce((n, t) => n + trailArticleIds(t).length + t.branches.reduce((m, b) => m + (b.links?.length ?? 0), 0), 0);

test('estante: toda história é uma lombada, agrupada por assunto', async ({ page }) => {
  await page.goto('/historia');
  await expect(page.locator('app-bookshelf .bay')).toHaveCount(TRAILS.length + TOOL_BAYS.length);
  await expect(page.locator('app-bookshelf .spine')).toHaveCount(TOTAL);
  // Cada assunto mostra quantos livros tem
  const primeira = TRAILS[0];
  await expect(page.locator('.bay').first().locator('.n')).toHaveText(String(trailArticleIds(primeira).length + primeira.branches.reduce((m, b) => m + (b.links?.length ?? 0), 0)));
});

test('biblioteca: cada subtópico é uma prateleira com o seu título, e o índice leva à estante do assunto', async ({ page }) => {
  await page.goto('/historia');
  const prateleiras = TRAILS.reduce((n, t) => n + t.branches.length, 0) + TOOL_BAYS.reduce((n, b) => n + b.shelves.length, 0);
  await expect(page.locator('app-bookshelf .shelf')).toHaveCount(prateleiras);
  const contexto = page.locator('#bay-contexto');
  await expect(contexto.getByRole('heading', { level: 3, name: 'Roma e o Poder' })).toBeVisible();
  await expect(contexto.getByRole('heading', { level: 3, name: 'A Fé e a Família' })).toBeVisible();
  await page.getByRole('navigation', { name: 'Assuntos da biblioteca' }).getByRole('button', { name: 'Ir para Profecias' }).click();
  await expect(page.locator('#bay-profecias')).toBeInViewport();
});

test('estante: tocar no livro já o abre (a capa gira) e entra na história, sem passo no meio', async ({ page }) => {
  await page.goto('/historia');
  const a = findArticle('trindade')!;
  await page.getByRole('button', { name: new RegExp(`^Livro: ${a.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`) }).click();
  await expect(page.locator('.stage .vol')).toBeVisible();
  await expect(page.locator('.stage .vol')).toContainText(a.title);
  await expect(page.locator('.stage .vol')).toHaveClass(/opening/);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page).toHaveURL(/\/artigo\/trindade$/);
});

test('estante: capas de frente por padrão, lombadas a um toque, e a escolha fica guardada', async ({ page }) => {
  await page.goto('/historia');
  const modo = page.getByRole('group', { name: 'Como ver os livros' });
  await expect(modo.getByRole('button', { name: 'Capas' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('app-bookshelf')).toHaveClass(/capas/);
  await modo.getByRole('button', { name: 'Lombadas' }).click();
  await expect(page.locator('app-bookshelf')).not.toHaveClass(/capas/);
  await page.reload();
  await expect(page.getByRole('group', { name: 'Como ver os livros' }).getByRole('button', { name: 'Lombadas' })).toHaveAttribute('aria-pressed', 'true');
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
  await expect(page).not.toHaveURL(/\/historia$/);
});

test.describe('com movimento reduzido', () => {
  test.use({ reducedMotion: 'reduce' });
  test('o livro abre sem esperar a animação', async ({ page }) => {
    await page.goto('/historia');
    await page.getByRole('button', { name: /^Livro: A Trindade: Um Só Deus/ }).click();
    await expect(page).toHaveURL(/\/artigo\/trindade$/);
  });
});

test('história e estudo são uma tela só: mapas e ferramentas são livros, e /estudo leva para cá', async ({ page }) => {
  await page.goto('/historia');
  // O mapa de uma jornada é um livro, na estante de mapas
  const mapas = page.locator('#bay-mapas');
  await expect(mapas.getByRole('heading', { level: 3, name: 'Novo Testamento' })).toBeVisible();
  await mapas.getByRole('button', { name: /^Livro: .*Paulo/ }).first().click();
  await expect(page).toHaveURL(/\/mapas\/[a-z0-9-]+$/);
  // O endereço antigo continua valendo, e a pesquisa vai junto
  await page.goto('/estudo?q=niceia');
  await expect(page).toHaveURL(/\/historia\?q=niceia/);
  await expect(page.getByRole('searchbox', { name: 'Pesquisar na biblioteca' })).toHaveValue('niceia');
  // A aba de baixo agora se chama História
  await expect(page.getByRole('navigation').getByRole('link', { name: 'História' }).first()).toBeVisible();
});
