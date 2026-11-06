import { expect, expectNoHorizontalOverflow, goToTab, test } from './base';

const rotas = ['/', '/ensino', '/meu-espaco', '/livros', '/livro/JHN', '/ler/JHN/3', '/devocional', '/devocional/hoje', '/ebd', '/anotacoes',
  '/favoritos', '/mapas', '/mapas/exodo', '/busca', '/curiosidades', '/curiosidades/voltas-em-jerico', '/ajustes',
  '/estudo', '/memorial', '/memorial?grupo=reis-juda', '/memorial?grupo=dois-reinos', '/memorial/davi', '/historia', '/historia?colecao=biblia', '/artigo/cativeiros-de-israel',
  '/avivamento', '/avivamento/spurgeon-olhai-para-mim', '/dicionario', '/dicionario/graca', '/livro/GEN', '/mapas/cativeiros-de-israel',
  '/atlas', '/quiz', '/quiz/capitulo/JHN/3', '/quiz/livro/RUT', '/quiz/historia/igreja-primitiva', '/atlas?epoca=roma', '/atlas?epoca=asmoneus', '/artigo/entre-os-testamentos', '/artigo/grupos-do-tempo-de-jesus', '/artigo/da-volta-do-exilio-a-jesus', '/artigo/flavio-josefo', '/artigo/livros-dos-macabeus', '/artigo/septuaginta', '/genealogia', '/tribos', '/artigo/frida-vingren', '/artigo/escola-dominical', '/artigo/avivamentos-desde-atos', '/artigo/avivamento-do-pais-de-gales', '/historia?colecao=avivamentos', '/artigo/assembleia-de-deus-no-brasil', '/mapas/assembleia-de-deus-no-brasil', '/mapas/assembleia-de-deus-estados', '/assembleia-de-deus', '/assembleia-de-deus/linha-do-tempo', '/assembleia-de-deus/ce', '/assembleia-de-deus/pe', '/artigo/panorama-da-igreja', '/artigo/madureira-e-a-separacao', '/artigo/daniel-berg-e-gunnar-vingren', '/artigo/ministerios-na-biblia', '/harpa', '/harpa/328', '/artigo/harpa-crista', '/fontes', '/novidades', '/ibuc', '/ebd/apoio', '/ebd/apoio/jovens', '/ebd/apoio/aula/modelo-neemias-reconstroi-os-muros', '/ibuc/primarios', '/ibuc/maternal', '/ibuc/aula/modelo-davi-e-golias', '/tribos/juda', '/tribos/levi', '/mapas/tribos-de-israel', '/profecias', '/profecias/setenta-semanas', '/artigo/legiao-e-o-exercito-romano',
  '/artigo/apocalipse', '/artigo/trindade', '/artigo/deuses-pagaos', '/artigo/natal-e-os-calendarios', '/artigo/teologia-sistematico-carismatica', '/historia?trilha=um-so-deus', '/memorial?grupo=linha-do-tempo', '/dicionario/salvar', '/historia?colecao=contexto', '/estudo/livros', '/dicionario?ordem=biblia', '/creditos', '/artigo/igreja-e-estado', '/artigo/manual-do-diacono', '/artigo/manual-do-pastor-pentecostal', '/artigo/manual-da-igreja-e-do-obreiro', '/artigo/diacono-presbitero-e-pastor-nos-manuais', '/historia?trilha=teologia', '/historia?trilha=igreja-e-estado',
  '/artigo/igreja-na-america-do-sul', '/artigo/avivamentos-na-america-do-sul', '/epocas', '/datas', '/epocas/patriarcas', '/epocas/pentecostes', '/epocas/idade-media', '/artigo/coliseu-de-roma', '/artigo/catacumbas-de-roma',
  '/vozes', '/vozes/a-sanguessuga', '/vozes/a-sanguessuga?idioma=ru', '/vozes/a-sanguessuga?idioma=de', '/revisao/8f11d02bac34306e'];

for (const rota of rotas) {
  test(`abre ${rota} sem erros e sem rolagem lateral`, async ({ page }) => {
    await page.goto(rota);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('main')).not.toBeEmpty();
    await expectNoHorizontalOverflow(page);
  });
}

// Celulares Android mais simples têm 360 px de largura (o projeto "celular" usa um Pixel 7, com 412 px)
test.describe('celular pequeno (360 px)', () => {
  test.use({ viewport: { width: 360, height: 740 } });
  test('nenhuma tela passa da largura do aparelho', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'só no projeto celular');
    test.setTimeout(240_000);
    for (const rota of rotas) {
      await page.goto(rota);
      await page.waitForLoadState('networkidle');
      const largura = await page.evaluate(() => ({ pagina: document.documentElement.scrollWidth, tela: innerWidth }));
      expect(largura.pagina, `${rota} passa da largura de 360 px`).toBeLessThanOrEqual(360);
    }
  });
});

test('barra de navegação leva às áreas principais', async ({ page }) => {
  await page.goto('/');
  for (const [aba, url] of [['Bíblia', /\/ler\//], ['História', /\/historia/], ['Ensino', /\/ensino/], ['Jornal', /\/vozes/], ['Meu espaço', /\/meu-espaco/], ['Início', /\/$/]] as const) {
    await goToTab(page, aba);
    await expect(page).toHaveURL(url);
  }
});

test('cada tela acende a aba certa do menu', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Navegação principal' });
  for (const [url, aba] of [['/tribos', 'História'], ['/ebd', 'Ensino'], ['/sermoes', 'Ensino'], ['/vozes', 'Jornal'], ['/vozes/a-sanguessuga', 'Jornal'], ['/ibuc', 'Ensino'], ['/devocional', 'Meu espaço'], ['/favoritos', 'Meu espaço'], ['/livros', 'Bíblia']] as const) {
    await page.goto(url);
    const menuButton = page.getByRole('button', { name: 'Abrir menu de navegação' });
    if (await menuButton.isVisible()) await menuButton.click();
    await expect(nav.locator('.nav-item.active')).toHaveText(new RegExp(aba));
  }
});

test('menu lateral abre pelo botão e pelo gesto da borda no celular', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'só no projeto celular');
  await page.goto('/');

  const menuButton = page.getByRole('button', { name: 'Abrir menu de navegação' });
  const nav = page.getByRole('navigation', { name: 'Navegação principal' });
  await expect(menuButton).toBeVisible();
  await expect(nav).toBeHidden();
  await menuButton.click();
  await expect(nav).toBeVisible();
  await nav.getByRole('link', { name: 'História' }).click();
  await expect(page).toHaveURL(/\/historia/);
  await expect(nav).toBeHidden();

  await page.evaluate(() => {
    const target = document.elementFromPoint(2, 300) as HTMLElement;
    const start = new Touch({ identifier: 1, target, clientX: 2, clientY: 300 });
    const end = new Touch({ identifier: 1, target, clientX: 130, clientY: 304 });
    target.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: [start], changedTouches: [start] }));
    target.dispatchEvent(new TouchEvent('touchend', { bubbles: true, touches: [], changedTouches: [end] }));
  });
  await expect(nav).toBeVisible();
  await page.evaluate(() => {
    const target = document.querySelector('.nav a.nav-item') as HTMLElement;
    const start = new Touch({ identifier: 2, target, clientX: 120, clientY: 200 });
    const end = new Touch({ identifier: 2, target, clientX: 5, clientY: 204 });
    target.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: [start], changedTouches: [start] }));
    target.dispatchEvent(new TouchEvent('touchend', { bubbles: true, touches: [], changedTouches: [end] }));
  });
  await expect(nav).toBeHidden();
});

test('rota inexistente volta para o início', async ({ page }) => {
  await page.goto('/pagina-que-nao-existe');
  await expect(page).toHaveURL(/\/$/);
});
