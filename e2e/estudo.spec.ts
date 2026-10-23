import { expect, test } from './base';

test('início leva à biblioteca de estudo', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Estudo' }).first().click();
  await expect(page.getByRole('heading', { name: 'Estudo', level: 1 })).toBeVisible();
  await expect(page.getByText('Memorial da Fé')).toBeVisible();
});

test('leitor: palavra do dicionário abre o verbete', async ({ page }) => {
  await page.goto('/ler/EPH/2');
  const palavra = page.locator('.word', { hasText: 'graça' }).first();
  await expect(palavra).toBeVisible();
  await palavra.click();
  await expect(page.getByRole('heading', { name: 'Graça' })).toBeVisible();
  await expect(page.getByText('χάρις')).toBeVisible();
  await page.getByRole('link', { name: 'Abrir no dicionário' }).click();
  await expect(page).toHaveURL(/\/dicionario\/graca/);
});

test('leitor: cada termo do dicionário é marcado uma vez por capítulo', async ({ page }) => {
  await page.goto('/ler/EPH/2');
  await expect(page.locator('.word').first()).toBeVisible();
  const textos = await page.locator('.word').allTextContents();
  expect(textos.filter((t) => t.toLowerCase() === 'graça')).toHaveLength(1);
});

test('leitor: contexto e notas do capítulo; desligar o dicionário', async ({ page }) => {
  await page.goto('/ler/JHN/3');
  await page.getByRole('button', { name: /Estudar este capítulo/ }).click();
  await expect(page.getByText('Nicodemos, de noite')).toBeVisible();
  await expect(page.getByRole('link', { name: /Tudo para estudar João/ })).toBeVisible();

  await page.getByRole('button', { name: 'Aparência da leitura' }).click();
  await page.getByRole('button', { name: 'Dicionário' }).click();
  await page.keyboard.press('Escape');
  await expect(page.locator('.word')).toHaveCount(0);
});

test('livro mostra introdução e contexto histórico', async ({ page }) => {
  await page.goto('/livro/ROM');
  await expect(page.getByRole('heading', { name: 'Introdução e contexto' })).toBeVisible();
  await expect(page.getByText('c. 57 d.C., de Corinto')).toBeVisible();
});

test('memorial: reis de Judá em ordem com avaliação', async ({ page }) => {
  await page.goto('/memorial?grupo=reis-juda');
  const reis = page.locator('.king .name');
  await expect(reis).toHaveCount(20);
  await expect(reis.first()).toHaveText('Roboão');
  await expect(reis.last()).toHaveText('Zedequias');
  await page.getByRole('link', { name: /Josias/ }).click();
  await expect(page.getByRole('heading', { name: 'Josias', level: 1 })).toBeVisible();
  await expect(page.getByText('Fez o que era reto')).toBeVisible();
});

test('memorial: nazireus e texto-chave carregado', async ({ page }) => {
  await page.goto('/memorial?grupo=nazireus');
  await expect(page.getByText('Sansão')).toBeVisible();
  await page.getByRole('link', { name: /Samuel/ }).click();
  await expect(page.locator('app-passage-view blockquote')).toBeVisible();
});

test('estudo dos cativeiros: referência abre o versículo e o mapa liga ao estudo', async ({ page }) => {
  await page.goto('/artigo/cativeiros-de-israel');
  await expect(page.getByRole('heading', { name: 'Os cativeiros de Israel' })).toBeVisible();
  await page.getByRole('button', { name: '2Rs 17.6' }).first().click();
  await expect(page.locator('.app-sheet app-passage-view blockquote')).toBeVisible();
  await page.keyboard.press('Escape');

  await page.goto('/mapas/cativeiros-de-israel');
  await page.getByRole('link', { name: 'Ler o estudo' }).click();
  await expect(page).toHaveURL(/\/artigo\/cativeiros-de-israel/);
});

test('sermão histórico abre o texto e passa ao próximo', async ({ page }) => {
  await page.goto('/avivamento');
  await page.getByText('Pecadores nas mãos de um Deus irado').click();
  await expect(page.getByText('teia de aranha', { exact: false })).toBeVisible();
  await expect(page.getByText('Tradução condensada.')).toBeVisible();
  await page.getByRole('link', { name: /Próximo sermão/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('O método da graça');
});

test('dicionário: busca e filtro por idioma', async ({ page }) => {
  await page.goto('/dicionario');
  await page.getByLabel('Buscar no dicionário').fill('shalom');
  await expect(page.locator('.entry .term')).toHaveText(['Jeová-Salom', 'Paz']);
  await page.getByLabel('Buscar no dicionário').fill('');
  await page.getByRole('button', { name: 'Aramaico' }).click();
  await expect(page).toHaveURL(/lingua=ar/);
  await expect(page.getByText('Talita cumi').first()).toBeVisible();
  await expect(page.getByText('Graça')).toHaveCount(0);
});

test('atlas: troca de época e legenda dos impérios', async ({ page }) => {
  await page.goto('/atlas');
  await expect(page.getByRole('heading', { name: 'Antes de Abraão', level: 2 })).toBeVisible();
  await page.getByRole('button', { name: /O mundo romano/ }).click();
  await expect(page).toHaveURL(/epoca=roma/);
  await expect(page.getByText('Império Parto', { exact: false }).first()).toBeVisible();
  await expect(page.locator('app-bible-map path.power').first()).toBeAttached();
});

test('mapa: camadas, época e distâncias', async ({ page }) => {
  await page.goto('/mapas/segunda-viagem-de-paulo');
  await expect(page.getByText(/Percurso ≈/)).toBeVisible();
  await expect(page.locator('.km').first()).toBeVisible();
  await expect(page.locator('app-bible-map .scale')).toBeAttached();
  const borders = page.locator('app-bible-map path.border');
  await expect(borders).toHaveCount(0);
  await page.getByRole('button', { name: 'Países de hoje' }).click();
  await expect(borders.first()).toBeAttached();
  await page.getByRole('link', { name: /veja o mundo ao redor no Atlas/ }).click();
  await expect(page).toHaveURL(/atlas\?epoca=roma/);
});

test('genealogia: linhas de Mateus e Lucas e link para o memorial', async ({ page }) => {
  await page.goto('/genealogia');
  await page.getByRole('tab', { name: /Lucas/ }).first().click();
  await expect(page.getByText('Natã', { exact: true }).first()).toBeVisible();
  await page.getByRole('tab', { name: /Mateus/ }).first().click();
  await expect(page.getByText('não citado por Mateus').first()).toBeVisible();
  await page.getByRole('button', { name: /^Boaz|^Booz/ }).first().click();
  await expect(page).toHaveURL(/\/memorial\/boaz/);
  await expect(page.getByText('Está na genealogia de Jesus')).toBeVisible();
});

test('profecias: filtro e página com interpretações', async ({ page }) => {
  await page.goto('/profecias');
  await page.getByRole('navigation', { name: 'Situação' }).getByRole('link', { name: 'Interpretações diferentes' }).click();
  await expect(page.locator('.status.cumprida')).toHaveCount(0);
  await page.getByText('Mil anos').click();
  await expect(page.getByRole('heading', { name: 'Pré-milenismo' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Amilenismo' })).toBeVisible();
});

test('versículo: referências cruzadas curadas e automáticas', async ({ page }) => {
  await page.goto('/ler/MAT/1');
  await page.locator('#v23').click();
  await expect(page.getByText('Citação direta · cita')).toBeVisible();
  await expect(page.getByText('Isaías 7:14')).toBeVisible();
  await page.getByText('Isaías 7:14').click();
  await expect(page.locator('.app-sheet app-passage-view blockquote')).toBeVisible();
});

test('dicionário: a palavra mostra a forma e o sentido daquele versículo', async ({ page }) => {
  await page.goto('/ler/MRK/5');
  await page.locator('#v34 .word', { hasText: 'salvou' }).click();
  await expect(page.getByText('Neste versículo')).toBeVisible();
  await expect(page.getByText('Perfeito, indicativo, ativo', { exact: false }).first()).toBeVisible();
  await expect(page.getByText('Curar uma doença').first()).toBeVisible();
});

test('aula de contexto aparece no capítulo e tem índice', async ({ page }) => {
  await page.goto('/ler/MRK/5');
  await page.getByRole('button', { name: /Estudar este capítulo/ }).click();
  await page.getByRole('link', { name: /Legião: o exército romano/ }).click();
  await expect(page.getByText('Neste estudo')).toBeVisible();
  await expect(page.locator('table').first()).toBeVisible();
});

test('voltar leva para a tela anterior (o caminho feito), e não para uma página fixa', async ({ page }) => {
  await page.goto('/ler/MRK/5');
  await page.getByRole('button', { name: /Estudar este capítulo/ }).click();
  await page.getByRole('link', { name: /Legião: o exército romano/ }).click();
  await expect(page).toHaveURL(/\/artigo\/legiao/);
  await page.getByRole('button', { name: 'Voltar' }).click();
  await expect(page).toHaveURL(/\/ler\/MRK\/5/);
});

test('aberto direto por um link, voltar vai para a página da seção', async ({ page }) => {
  await page.goto('/artigo/apocalipse');
  await page.getByRole('button', { name: 'Voltar' }).click();
  await expect(page).toHaveURL(/\/historia\?colecao=profecias/);
});

test('ordem da Bíblia: profetas menores, profecias e estudo livro por livro', async ({ page }) => {
  await page.goto('/memorial?grupo=profetas-menores');
  const nomes = page.locator('.card.row .name');
  await expect(nomes.first()).toHaveText('Oseias');
  await expect(nomes.last()).toHaveText('Malaquias');

  await page.goto('/profecias');
  await expect(page.locator('h2.section-title').first()).toHaveText('Gênesis');
  await expect(page.locator('h2.section-title').last()).toHaveText('Apocalipse');

  await page.goto('/estudo/livros');
  await page.locator('summary', { hasText: 'Gênesis' }).first().click();
  await expect(page.getByText('A jornada de Abraão', { exact: false }).first()).toBeVisible();
  await page.getByRole('tab', { name: 'Novo Testamento' }).click();
  await expect(page.locator('summary .b-name').first()).toContainText('Mateus');
});

test('livro mostra o que há para estudar nele', async ({ page }) => {
  await page.goto('/livro/DAN');
  await expect(page.getByRole('heading', { name: 'Para estudar Daniel' })).toBeVisible();
  await expect(page.getByText('As setenta semanas').first()).toBeVisible();
});

test('dicionário pela ordem da Bíblia e por assunto', async ({ page }) => {
  await page.goto('/dicionario');
  await page.getByRole('tab', { name: 'Pela Bíblia' }).click();
  await expect(page.locator('h2.letter').first()).toHaveText('Gênesis');
  await page.getByRole('tab', { name: 'Por assunto' }).click();
  await expect(page.locator('h2.letter').first()).toHaveText('Deus e os seus nomes');
});

test('pregações recomendadas com link para ouvir', async ({ page }) => {
  await page.goto('/avivamento');
  await expect(page.getByRole('heading', { name: 'Pregações recomendadas' })).toBeVisible();
  const ouvir = page.getByRole('link', { name: 'Ouvir' }).first();
  await expect(ouvir).toHaveAttribute('href', /youtube\.com\/results/);
});
