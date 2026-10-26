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

test('tribos: mapa com territórios, página da tribo e ligação com o memorial', async ({ page }) => {
  await page.goto('/tribos');
  await expect(page.locator('app-bible-map path.territory')).toHaveCount(14);
  // Destacar uma tribo apaga as outras
  await page.getByRole('group', { name: 'Destacar o território de uma tribo' }).getByRole('button', { name: 'Manassés' }).click();
  await expect(page.locator('app-bible-map path.territory.focus')).toHaveCount(2);
  await expect(page.getByRole('cell', { name: /Benjamim/ }).first()).toBeVisible();

  await page.getByRole('link', { name: /Judá.*realeza/ }).click();
  await expect(page).toHaveURL(/\/tribos\/juda/);
  await expect(page.getByRole('heading', { name: 'Judá', level: 1 })).toBeVisible();
  await expect(page.getByText('Nasom, filho de Aminadabe')).toBeVisible();
  await expect(page.getByText(/O cetro não se arredará/)).toBeVisible();
  await page.getByRole('link', { name: 'Davi', exact: true }).click();
  await expect(page).toHaveURL(/\/memorial\/davi/);
  await expect(page.getByText('Tribo de Judá')).toBeVisible();
});

test('leitor: Josué 18 oferece o estudo e o mapa das tribos', async ({ page }) => {
  await page.goto('/ler/JOS/18');
  await page.getByRole('button', { name: /Estudar este capítulo/ }).click();
  await page.getByRole('link', { name: /As doze tribos de Israel/ }).click();
  await expect(page).toHaveURL(/\/tribos$/);
  await page.goto('/mapas/tribos-de-israel');
  await page.getByRole('link', { name: 'As doze tribos' }).click();
  await expect(page.getByRole('heading', { name: 'As doze tribos de Israel' })).toBeVisible();
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

test('IBUC: turma por idade e aula-modelo com curiosidades e brincadeiras', async ({ page }) => {
  await page.goto('/ensino');
  await page.getByRole('link', { name: /Instituto Bíblico Único Caminho/ }).click();
  await expect(page.getByRole('heading', { name: 'IBUC', level: 1 })).toBeVisible();
  await page.getByRole('link', { name: /Primários/ }).click();
  await expect(page.getByText('Como ensinar nesta idade')).toBeVisible();
  await page.getByRole('link', { name: /Davi e Golias/ }).click();
  await expect(page.getByText('Quase três metros')).toBeVisible();
  await expect(page.getByText('Acerte o gigante')).toBeVisible();
  await page.getByRole('button', { name: 'Voltar à turma' }).click();
  await expect(page).toHaveURL(/\/ibuc\/primarios/);
});

test('mapa das tribos: o templo aparece e a tribo escolhida mostra a distância até ele', async ({ page }) => {
  await page.goto('/tribos');
  await expect(page.locator('#mapa .landmark')).toHaveAttribute('aria-label', 'Templo · Jerusalém');
  await expect(page.locator('#mapa .measure')).toHaveCount(0);
  await page.getByRole('group', { name: 'Destacar o território de uma tribo' }).getByRole('button', { name: 'Naftali' }).click();
  await expect(page.locator('#mapa .measure-label')).toHaveText(/≈ \d+ km/);

  await page.goto('/tribos/manasses');
  // As duas metades de Manassés, cada uma com a sua distância
  await expect(page.locator('.measure-label')).toHaveCount(2);

  await page.goto('/mapas/tribos-de-israel');
  await page.locator('ol.steps li').first().click();
  await expect(page.locator('.measure-label')).toHaveText(/≈ \d+ km/);
});

test('memorial: os dois reinos lado a lado, com os fatos que os ligam', async ({ page }) => {
  await page.goto('/memorial?grupo=reis-juda');
  await page.getByRole('navigation', { name: 'Grupos' }).getByRole('link', { name: 'Os dois reinos' }).click();
  await expect(page.getByRole('heading', { name: 'Os dois reinos', level: 1 })).toBeVisible();
  // Jeroboão I (Israel) e Roboão (Judá) começam juntos, na mesma linha, depois da divisão
  const primeira = page.locator('.realms li.pair').first();
  await expect(primeira.locator('.realm-king').first()).toContainText('Jeroboão I');
  await expect(primeira.locator('.realm-king.right')).toContainText('Roboão');
  await expect(page.locator('.realms li.event')).toHaveCount(5);
  await expect(page.locator('.realm-king')).toHaveCount(39);
  await expect(page.locator('.realm-king.right')).toHaveCount(20);
  await page.locator('.realm-king', { hasText: 'Ezequias' }).click();
  await expect(page).toHaveURL(/\/memorial\/ezequias/);
});

test('fontes: cada estudo mostra de onde vêm as informações, e há uma página com todas', async ({ page }) => {
  await page.goto('/artigo/o-templo-de-herodes');
  await page.getByText('Fontes das informações').click();
  await expect(page.getByText(/Antiguidades Judaicas 15\.380/)).toBeVisible();
  await expect(page.getByText('Jerusalém no tempo de Jesus')).toBeVisible();
  await page.getByRole('link', { name: 'Todas as fontes do app' }).click();
  await expect(page.getByRole('heading', { name: 'Fontes das informações', level: 1 })).toBeVisible();
  await page.goto('/estudo');
  await expect(page.getByRole('link', { name: /Fontes das informações/ })).toBeVisible();
});

test('Harpa Cristã: busca por número, página do hino com autor e fontes, sem a letra', async ({ page }) => {
  await page.goto('/estudo');
  await page.getByRole('link', { name: /Harpa Cristã/ }).click();
  await expect(page.getByRole('heading', { name: 'Harpa Cristã', level: 1 })).toBeVisible();
  await page.getByRole('textbox', { name: 'Buscar hino' }).fill('1');
  await page.locator('ol.hymns a').first().click();
  await expect(page).toHaveURL(/\/harpa\/1$/);
  await expect(page.getByText('A letra não aparece no app')).toBeVisible();
  await expect(page.getByRole('link', { name: /Hymnary\.org: Harpa Cristã nº 1/ })).toBeVisible();
  await expect(page.locator('.facts cite', { hasText: 'There Shall Be Showers of Blessing' })).toBeVisible();
});

test('estudo dos ministérios: na seção Igreja e ministérios, ligado ao dicionário e ao leitor', async ({ page }) => {
  await page.goto('/estudo');
  await page.getByRole('link', { name: /Os ministérios na Bíblia/ }).click();
  await expect(page.getByRole('heading', { name: 'Presbíteros e bispos' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Na igreja hoje' })).toBeVisible();
  await page.getByRole('link', { name: 'Diácono', exact: true }).first().click();
  await expect(page).toHaveURL(/\/dicionario\/diacono/);
  await page.goto('/ler/1TI/3');
  await page.getByRole('button', { name: /Estudar este capítulo/ }).click();
  await expect(page.getByRole('link', { name: /Os ministérios na Bíblia/ })).toBeVisible();
});
