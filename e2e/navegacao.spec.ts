import { expect, expectNoHorizontalOverflow, goToTab, test } from './base';

const rotas = ['/', '/livros', '/livro/JHN', '/ler/JHN/3', '/devocional', '/devocional/hoje', '/ebd', '/anotacoes',
  '/favoritos', '/mapas', '/mapas/exodo', '/busca', '/curiosidades', '/curiosidades/voltas-em-jerico', '/ajustes',
  '/estudo', '/memorial', '/memorial?grupo=reis-juda', '/memorial?grupo=dois-reinos', '/memorial/davi', '/historia', '/historia?colecao=biblia', '/artigo/cativeiros-de-israel',
  '/avivamento', '/avivamento/spurgeon-olhai-para-mim', '/dicionario', '/dicionario/graca', '/livro/GEN', '/mapas/cativeiros-de-israel',
  '/atlas', '/atlas?epoca=roma', '/genealogia', '/tribos', '/novidades', '/ibuc', '/ibuc/primarios', '/ibuc/maternal', '/ibuc/aula/modelo-davi-e-golias', '/tribos/juda', '/tribos/levi', '/mapas/tribos-de-israel', '/profecias', '/profecias/setenta-semanas', '/artigo/legiao-e-o-exercito-romano',
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
  for (const [aba, url] of [['Estudo', /\/estudo/], ['Devocional', /\/devocional/], ['Anotações', /\/anotacoes/], ['Início', /\/$/]] as const) {
    await goToTab(page, aba);
    await expect(page).toHaveURL(url);
  }
});

test('rota inexistente volta para o início', async ({ page }) => {
  await page.goto('/pagina-que-nao-existe');
  await expect(page).toHaveURL(/\/$/);
});
