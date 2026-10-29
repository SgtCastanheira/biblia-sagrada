import { expect, expectNoHorizontalOverflow, test } from './base';

test('linha do tempo: o índice mostra as épocas em grupos e leva a cada uma', async ({ page }) => {
  await page.goto('/epocas');
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { name: 'Linha do tempo', level: 1 })).toBeVisible();
  await expect(page.locator('a.era')).toHaveCount(16);
  for (const grupo of ['O Antigo Testamento', 'O Mundo de Jesus', 'A Igreja Antiga', 'A Igreja pelos Séculos', 'O Século Pentecostal e Hoje']) {
    await expect(page.getByRole('heading', { name: grupo })).toBeVisible();
  }
  await page.locator('a.era', { hasText: 'Os Patriarcas' }).click();
  await expect(page).toHaveURL(/\/epocas\/patriarcas/);
  await expect(page.getByRole('heading', { name: 'Os Patriarcas', level: 1 })).toBeVisible();
});

test('época dos patriarcas: livros da Bíblia, a fome do tempo de José, personagens e o mapa', async ({ page }) => {
  await page.goto('/epocas/patriarcas');
  await expect(page.getByRole('heading', { name: 'Na Bíblia' })).toBeVisible();
  await expect(page.locator('.chips a', { hasText: 'Gênesis' })).toHaveAttribute('href', /\/livro\/GEN/);
  const fome = page.locator('article.card-ev', { hasText: 'Sete anos de fome no Egito' });
  await expect(fome).toBeVisible();
  await expect(fome.getByRole('link', { name: /Gn 41\.53-57/ })).toHaveAttribute('href', /\/ler\/GEN\/41/);
  await expect(page.getByRole('heading', { name: 'Personagens' })).toBeVisible();
  await expect(page.locator('.chips a', { hasText: 'Abraão' }).first()).toBeVisible();
  await expect(page.locator('.chips a', { hasText: 'Jornada de Abraão' })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test('época pentecostal: a crise de 1929 aparece no meio das histórias, e o filtro separa as duas coisas', async ({ page }) => {
  await page.goto('/epocas/pentecostes');
  const crise = page.locator('article.card-ev', { hasText: 'A crise de 1929' });
  await expect(crise).toBeVisible();
  await expect(crise.locator('.tag')).toContainText('Economia');
  const historia = page.locator('a.card-ev.story', { hasText: 'O Pentecostalismo no Brasil' });
  await expect(historia).toBeVisible();
  await page.getByRole('button', { name: 'Crises e fatos do mundo' }).click();
  await expect(crise).toBeVisible();
  await expect(historia).toHaveCount(0);
  await page.getByRole('button', { name: 'Histórias' }).click();
  await expect(crise).toHaveCount(0);
  await expect(historia).toBeVisible();
  // O 1929 está na mesma linha do ano
  await page.getByRole('button', { name: 'Tudo' }).click();
  await expect(page.locator('li.year', { hasText: '1929' }).locator('article.card-ev', { hasText: 'A crise de 1929' })).toBeVisible();
});

test('a história leva à sua época, e a época leva à próxima e à anterior', async ({ page }) => {
  await page.goto('/artigo/coliseu-de-roma');
  await page.getByRole('link', { name: /Época: Roma Persegue/ }).click();
  await expect(page).toHaveURL(/\/epocas\/roma-persegue/);
  await expect(page.locator('a.card-ev.story', { hasText: 'O Coliseu' })).toBeVisible();
  await expect(page.locator('a.card-ev.story', { hasText: 'As Catacumbas de Roma' })).toBeVisible();
  await expect(page.locator('article.card-ev', { hasText: 'A peste de Cipriano' })).toBeVisible();
  await page.getByRole('link', { name: /Próxima época/ }).click();
  await expect(page).toHaveURL(/\/epocas\/constantino/);
  await page.getByRole('link', { name: /Época anterior/ }).click();
  await expect(page).toHaveURL(/\/epocas\/roma-persegue/);
});

test('curiosidade, personagem, profecia, mapa e livro mostram a época em que aconteceram', async ({ page }) => {
  await page.goto('/curiosidades/voltas-em-jerico');
  await expect(page.locator('app-era-chip a')).toContainText('Do Êxodo aos Juízes');
  await page.goto('/memorial/davi');
  await expect(page.locator('app-era-chip a')).toContainText('Saul, Davi e Salomão');
  await page.goto('/profecias/setenta-semanas');
  await expect(page.locator('app-era-chip a')).toContainText('Babilônia, Exílio e Retorno');
  await page.goto('/mapas/jornada-de-abraao');
  await expect(page.locator('app-era-chip a')).toContainText('Os Patriarcas');
  await page.goto('/livro/GEN');
  await expect(page.locator('app-era-chip a')).toHaveCount(2);
});

test('o leitor mostra a época do capítulo no painel de estudo', async ({ page }) => {
  await page.goto('/ler/GEN/12');
  await page.getByRole('button', { name: /Estudar este capítulo/ }).click();
  await expect(page.locator('app-era-chip a')).toContainText('Os Patriarcas');
  await page.locator('app-era-chip a').click();
  await expect(page).toHaveURL(/\/epocas\/patriarcas/);
});

test('a pesquisa do estudo acha o fato do mundo e a época', async ({ page }) => {
  await page.goto('/estudo?q=1929');
  const fato = page.locator('a.hit', { hasText: 'Fato do mundo' }).filter({ hasText: 'A crise de 1929' });
  await expect(fato).toBeVisible();
  await fato.click();
  await expect(page).toHaveURL(/\/epocas\/pentecostes/);
  await page.goto('/estudo?q=patriarcas');
  await expect(page.locator('a.hit', { hasText: 'Os Patriarcas' }).first()).toBeVisible();
});

test('a linha do tempo está no alto do Estudo, na tela inicial e em Histórias', async ({ page }) => {
  await page.goto('/estudo');
  await page.locator('a.timeline').click();
  await expect(page).toHaveURL(/\/epocas$/);
  await page.goto('/');
  await page.getByRole('link', { name: /A história, época por época/ }).click();
  await expect(page).toHaveURL(/\/epocas$/);
  await page.goto('/historia');
  await page.getByRole('link', { name: /Ver por época/ }).click();
  await expect(page).toHaveURL(/\/epocas$/);
});

test('época que não existe mostra um aviso, sem erro', async ({ page }) => {
  await page.goto('/epocas/nao-existe');
  await expect(page.getByText('Não encontrei essa época')).toBeVisible();
});

test('a igreja nas crises: a caixa aparece no fato e o filtro junta todos', async ({ page }) => {
  await page.goto('/epocas/pentecostes');
  const crise = page.locator('article.card-ev', { hasText: 'A crise de 1929' });
  await expect(crise.locator('app-church-note')).toContainText('Igreja Batista');
  const cangaco = page.locator('article.card-ev', { hasText: 'O cangaço de Lampião' });
  await expect(cangaco.locator('app-church-note a')).toHaveAttribute('href', /\/assembleia-de-deus\/al/);
  await page.getByRole('button', { name: 'A igreja nas crises' }).click();
  const cards = page.locator('article.card-ev');
  expect(await cards.count()).toBeGreaterThan(2);
  for (let i = 0; i < await cards.count(); i++) await expect(cards.nth(i).locator('app-church-note')).toHaveCount(1);
  await expect(page.locator('a.card-ev.story')).toHaveCount(0);
  await page.goto('/assembleia-de-deus/linha-do-tempo');
  await expect(page.locator('article.card-ev', { hasText: 'A crise de 1929' }).locator('app-church-note')).toBeVisible();
});

test('Libras: o VLibras só carrega quando a pessoa liga em Ajustes', async ({ page }) => {
  let pedidos = 0;
  await page.route('https://vlibras.gov.br/**', (route) => {
    pedidos++;
    return route.fulfill({ contentType: 'text/javascript', body: "document.body.insertAdjacentHTML('beforeend', '<div vw class=\"vlibras-teste\">VLibras</div>');" });
  });
  await page.goto('/ajustes');
  await page.waitForLoadState('networkidle');
  expect(pedidos).toBe(0);
  const chave = page.getByRole('switch', { name: 'Libras (VLibras)' });
  await chave.click();
  await expect(page.locator('.vlibras-teste')).toBeAttached();
  await expect(page.getByText(/Ligado: toque no botão azul/)).toBeVisible();
  expect(pedidos).toBe(1);
  // Desligar esconde; ao voltar, a escolha foi lembrada
  await chave.click();
  await expect(page.locator('.vlibras-teste')).toBeHidden();
  await chave.click();
  await page.reload();
  await expect(page.locator('.vlibras-teste')).toBeAttached();
});
