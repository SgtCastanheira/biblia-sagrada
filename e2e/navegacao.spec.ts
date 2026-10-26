import { expect, expectNoHorizontalOverflow, goToTab, test } from './base';

const rotas = ['/', '/ensino', '/meu-espaco', '/livros', '/livro/JHN', '/ler/JHN/3', '/devocional', '/devocional/hoje', '/ebd', '/anotacoes',
  '/favoritos', '/mapas', '/mapas/exodo', '/busca', '/curiosidades', '/curiosidades/voltas-em-jerico', '/ajustes',
  '/estudo', '/memorial', '/memorial?grupo=reis-juda', '/memorial?grupo=dois-reinos', '/memorial/davi', '/historia', '/historia?colecao=biblia', '/artigo/cativeiros-de-israel',
  '/avivamento', '/avivamento/spurgeon-olhai-para-mim', '/dicionario', '/dicionario/graca', '/livro/GEN', '/mapas/cativeiros-de-israel',
  '/atlas', '/atlas?epoca=roma', '/genealogia', '/tribos', '/harpa', '/harpa/328', '/artigo/harpa-crista', '/fontes', '/novidades', '/ibuc', '/ebd/apoio', '/ebd/apoio/jovens', '/ebd/apoio/aula/modelo-neemias-reconstroi-os-muros', '/ibuc/primarios', '/ibuc/maternal', '/ibuc/aula/modelo-davi-e-golias', '/tribos/juda', '/tribos/levi', '/mapas/tribos-de-israel', '/profecias', '/profecias/setenta-semanas', '/artigo/legiao-e-o-exercito-romano',
  '/artigo/apocalipse', '/memorial?grupo=linha-do-tempo', '/dicionario/salvar', '/historia?colecao=contexto', '/estudo/livros', '/dicionario?ordem=biblia', '/creditos'];

for (const rota of rotas) {
  test(`abre ${rota} sem erros e sem rolagem lateral`, async ({ page }) => {
    await page.goto(rota);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('main')).not.toBeEmpty();
    await expectNoHorizontalOverflow(page);
  });
}

test('barra de navegação leva às áreas principais', async ({ page }) => {
  await page.goto('/');
  for (const [aba, url] of [['Bíblia', /\/ler\//], ['Estudo', /\/estudo/], ['Ensino', /\/ensino/], ['Meu espaço', /\/meu-espaco/], ['Início', /\/$/]] as const) {
    await goToTab(page, aba);
    await expect(page).toHaveURL(url);
  }
});

test('cada tela acende a aba certa do menu', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Navegação principal' });
  for (const [url, aba] of [['/tribos', 'Estudo'], ['/ebd', 'Ensino'], ['/sermoes', 'Ensino'], ['/ibuc', 'Ensino'], ['/devocional', 'Meu espaço'], ['/favoritos', 'Meu espaço'], ['/livros', 'Bíblia']] as const) {
    await page.goto(url);
    await expect(nav.locator('.nav-item.active')).toHaveText(new RegExp(aba));
  }
});

test('rota inexistente volta para o início', async ({ page }) => {
  await page.goto('/pagina-que-nao-existe');
  await expect(page).toHaveURL(/\/$/);
});
