import { expect, test } from './base';
import { findArticle } from '../src/app/core/library';
import { TOOL_BAYS } from '../src/app/core/library-bays';
import { shelfBooks, TRAILS, trailArticleIds } from '../src/app/core/trails';

/** Volume 4, na ordem escolhida pelo dono do app: o número de cada livro é a posição aqui. */
const VOLUME_4 = [
  'paixao-getsemani', 'paixao-santa-ceia', 'paixao-prisao-e-interrogatorio', 'paixao-acoite-e-condenacao',
  'paixao-crucificacao', 'paixao-sepultamento-e-ressurreicao', 'paixao-quem-mandava',
];

const TOTAL = TOOL_BAYS.reduce((n, b) => n + b.shelves.reduce((m, sh) => m + sh.books.length, 0), 0) + TRAILS.reduce((n, t) => n + trailArticleIds(t).length + t.branches.reduce((m, b) => m + (b.links?.length ?? 0), 0), 0);

test('estante: toda história é uma lombada, agrupada por assunto', async ({ page }) => {
  await page.goto('/historia');
  await expect(page.locator('app-bookshelf .bay')).toHaveCount(TRAILS.length + TOOL_BAYS.length);
  await expect(page.locator('app-bookshelf .spine')).toHaveCount(TOTAL);
  // Cada assunto mostra quantos livros tem
  const primeira = TRAILS[0];
  await expect(page.locator('.bay').first().locator('.n')).toHaveText(String(trailArticleIds(primeira).length + primeira.branches.reduce((m, b) => m + (b.links?.length ?? 0), 0)));
});

test('biblioteca: cada subtópico é uma prateleira com o seu título', async ({ page }) => {
  await page.goto('/historia');
  const prateleiras = TRAILS.reduce((n, t) => n + t.branches.length, 0) + TOOL_BAYS.reduce((n, b) => n + b.shelves.length, 0);
  await expect(page.locator('app-bookshelf .shelf')).toHaveCount(prateleiras);
  const contexto = page.locator('#bay-contexto');
  await expect(contexto.getByRole('heading', { level: 3, name: 'Roma e o Poder' })).toBeVisible();
  await expect(contexto.getByRole('heading', { level: 3, name: 'A Fé e a Família' })).toBeVisible();
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

test('estante: cada livro do Volume 4 leva o seu número, na ordem escolhida pelo dono, nas capas e nas lombadas', async ({ page }) => {
  await page.goto('/historia');
  const volume = page.locator('.shelf', { has: page.getByRole('heading', { level: 3, name: /^Volume 4 ·/ }) });
  const livros = volume.locator('.spine');
  await expect(livros).toHaveCount(VOLUME_4.length);
  for (const [i, id] of VOLUME_4.entries()) {
    const titulo = findArticle(id)!.title;
    await expect(livros.nth(i).locator('.num'), `${titulo}: número`).toHaveText(String(i + 1));
    await expect(livros.nth(i), `${titulo}: nome do botão`).toHaveAccessibleName(new RegExp(`^Livro: ${titulo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}, número ${i + 1} de ${VOLUME_4.length}, em Como a Ciência Explica`));
  }
  // o número é grande o bastante para ler e para o dedo ver (a letra pede 13px; o disco, 24px)
  const caixa = await livros.first().locator('.num').boundingBox();
  expect(caixa!.width).toBeGreaterThanOrEqual(24);
  await expect(livros.first().locator('.num')).toHaveCSS('font-size', '14px');
  // na lombada o número ocupa o lugar do ícone: continua à vista e o título não perde espaço
  await page.getByRole('group', { name: 'Como ver os livros' }).getByRole('button', { name: 'Lombadas' }).click();
  for (let i = 0; i < VOLUME_4.length; i++) await expect(livros.nth(i).locator('.num')).toBeVisible();
  await expect(livros.first().locator('.ico')).toBeHidden();
});

test('estante: a lista do assunto também diz “Livro N de 7” nos livros do Volume 4', async ({ page }) => {
  await page.goto('/historia?trilha=como-a-ciencia-explica');
  const cartoes = page.locator('a.card.row');
  await expect(cartoes).toHaveCount(VOLUME_4.length);
  for (const [i, id] of VOLUME_4.entries()) {
    await expect(cartoes.nth(i)).toContainText(`Livro ${i + 1} de ${VOLUME_4.length}`);
    await expect(cartoes.nth(i)).toContainText(findArticle(id)!.title);
  }
});

test('estante: toda história tem o número da sua posição na prateleira, e atalhos e ferramentas ficam sem número', async ({ page }) => {
  await page.goto('/historia');
  const historias = TRAILS.reduce((n, t) => n + t.branches.reduce((m, b) => m + shelfBooks(b).length, 0), 0);
  await expect(page.locator('app-bookshelf .num')).toHaveCount(historias);
  await expect(page.locator('app-bookshelf .spine.shortcut .num')).toHaveCount(0);
  await expect(page.locator('#bay-mapas .num')).toHaveCount(0);

  // uma prateleira com um livro só: o 1, e o nome do botão não diz “de 1”
  const unica = page.locator('.shelf', { has: page.getByRole('heading', { level: 3, name: 'Quem É Deus' }) });
  await expect(unica.locator('.spine')).toHaveCount(1);
  await expect(unica.locator('.num')).toHaveText('1');
  await expect(unica.locator('.spine')).toHaveAccessibleName(`Livro: ${findArticle('trindade')!.title}, número 1, em Um Só Deus`);

  // uma prateleira com histórias e atalhos: a história é o 1 e os atalhos não entram na conta
  const mista = page.locator('.shelf', { has: page.getByRole('heading', { level: 3, name: 'A Igreja pelo País' }) });
  await expect(mista.locator('.spine')).toHaveCount(4);
  await expect(mista.locator('.num')).toHaveText('1');
  await expect(mista.locator('.spine.shortcut')).toHaveCount(3);

  // a maior prateleira segue a contagem inteira, na ordem
  const grande = page.locator('.shelf', { has: page.getByRole('heading', { level: 3, name: 'Livros de História da Igreja' }) });
  await expect(grande.locator('.num')).toHaveText(Array.from({ length: 20 }, (_, i) => String(i + 1)));
  await expect(grande.locator('.spine').last()).toHaveAccessibleName(/, número 20 de 20, em /);
});

test('estante: o número cabe no disco também com dois algarismos, e a lombada não perde o título', async ({ page }) => {
  await page.goto('/historia');
  const grande = page.locator('.shelf', { has: page.getByRole('heading', { level: 3, name: 'Livros de História da Igreja' }) });
  const disco = grande.locator('.num').last();
  await expect(disco).toHaveText('20');
  const folga = await disco.evaluate((el) => el.scrollWidth <= el.clientWidth + 1);
  expect(folga, 'o 20 cabe no disco').toBe(true);
  await page.getByRole('group', { name: 'Como ver os livros' }).getByRole('button', { name: 'Lombadas' }).click();
  await expect(grande.locator('.spine .t').first()).toBeVisible();
  await expect(grande.locator('.spine .ico').first()).toBeHidden();
});

test('estante: ?estante= abre a biblioteca já na estante do assunto (o link da imagem de compartilhar)', async ({ page }) => {
  await page.goto('/historia?estante=profecias');
  const baia = page.locator('#bay-profecias');
  await expect(baia).toBeVisible();
  // a estante vem logo abaixo da barra de cima (a margem de rolagem é de 72px)
  await expect.poll(async () => Math.round((await baia.boundingBox())!.y), { timeout: 6_000 }).toBeLessThan(200);
  expect((await baia.boundingBox())!.y).toBeGreaterThanOrEqual(0);
  // sem o parâmetro, a biblioteca abre no alto
  await page.goto('/historia');
  await expect(page.locator('#bay-profecias')).toBeVisible();
  expect((await page.locator('#bay-profecias').boundingBox())!.y).toBeGreaterThan(400);
});
