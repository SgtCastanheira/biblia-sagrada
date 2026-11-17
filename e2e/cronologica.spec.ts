import { expect, test } from './base';

test('Livros: três cartões levam à ordem cronológica, à Torá e ao Talmude', async ({ page }) => {
  await page.goto('/livros');
  const ways = page.getByRole('navigation', { name: 'Outras maneiras de ler' });
  await expect(ways.getByRole('link')).toHaveCount(3);
  await ways.getByRole('link', { name: /Ordem Cronológica/ }).click();
  await expect(page).toHaveURL(/\/cronologica$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('A Bíblia em Ordem Cronológica');
});

test('Cronológica: começa em Gênesis 1 e o próximo segue a ordem dos fatos (Babel, depois Jó, depois Abraão)', async ({ page }) => {
  await page.goto('/cronologica');
  await expect(page.getByText('0 de 1189 capítulos lidos').first()).toBeVisible();
  await page.getByRole('link', { name: /Começar em Gênesis 1/ }).click();
  await expect(page).toHaveURL(/\/ler\/GEN\/1\?ordem=cronologica/);
  const bar = page.getByRole('link', { name: /Ordem cronológica: ver todas as seções/ });
  await expect(bar).toContainText('A Criação, a Queda, o Dilúvio e Babel');
  await expect(bar).toContainText('1/1189');

  // Gênesis 11 → Jó 1 → ... → Jó 42 → Gênesis 12
  await page.goto('/ler/GEN/11?ordem=cronologica');
  await page.locator('.nav-card.next').click();
  await expect(page).toHaveURL(/\/ler\/JOB\/1\?ordem=cronologica/);
  await expect(page.getByRole('link', { name: /Ordem cronológica: ver todas as seções/ })).toContainText('Jó, o Justo que Sofreu');
  await page.goto('/ler/JOB/42?ordem=cronologica');
  await page.locator('.nav-card.next').click();
  await expect(page).toHaveURL(/\/ler\/GEN\/12\?ordem=cronologica/);
  await expect(page.locator('.chapter-number')).toHaveText('12');
  // a página nova chega virando (600 ms); um toque durante a virada não vale, como na leitura de sempre
  await expect(page.locator('article.book-page')).not.toHaveClass(/turn-/);
  await page.locator('.nav-card:not(.next)').click();
  await expect(page).toHaveURL(/\/ler\/JOB\/42\?ordem=cronologica/);
});

test('Leitor: sem ?ordem= a leitura segue a ordem da Bíblia, como sempre', async ({ page }) => {
  await page.goto('/ler/GEN/11');
  await expect(page.getByRole('link', { name: /Ordem cronológica: ver todas as seções/ })).toHaveCount(0);
  await page.locator('.nav-card.next').click();
  await expect(page).toHaveURL(/\/ler\/GEN\/12$/);
});

test('Cronológica: o progresso conta os capítulos lidos, e “Continuar” vai ao primeiro que falta', async ({ page }) => {
  // quem leu Gênesis 1 a 11 continua em Jó 1, na ordem dos fatos
  await page.addInitScript(() => localStorage.setItem('biblia.settings.readChapters', JSON.stringify({ GEN: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] })));
  await page.goto('/cronologica');
  await expect(page.getByText('11 de 1189 capítulos lidos').first()).toBeVisible();
  await expect(page.getByRole('link', { name: /Continuar em Jó 1/ })).toBeVisible();
  // o grupo que se está lendo (Jó e os patriarcas) fica aberto; o primeiro, já lido, fica fechado
  await expect(page.locator('details.group', { hasText: 'Jó e os Patriarcas' })).toHaveAttribute('open', '');
  await expect(page.locator('details.group').first()).not.toHaveAttribute('open', '');
  await expect(page.locator('details.group').first()).toContainText('11/11');
});

test('Cronológica: os grupos abrem e mostram as seções com as referências e os avisos de escolha', async ({ page }) => {
  await page.goto('/cronologica');
  const group = page.locator('details.group', { hasText: 'Jó e os Patriarcas' });
  await group.locator('summary').click();
  const job = group.getByRole('link', { name: /Jó, o Justo que Sofreu/ });
  await expect(job).toContainText('Jó 1–42');
  await expect(group.getByText(/uma escolha/i).first()).toBeVisible();
  await job.click();
  await expect(page).toHaveURL(/\/ler\/JOB\/1\?ordem=cronologica/);
});

test('Cronológica: o intervalo dos 400 anos leva à época entre os Testamentos', async ({ page }) => {
  await page.goto('/cronologica');
  await page.getByRole('link', { name: /Os 400 Anos de Silêncio/ }).click();
  await expect(page).toHaveURL(/\/epocas\/entre-testamentos/);
});

test('Torá: 54 porções em cinco livros, e cada porção abre o capítulo em que começa', async ({ page }) => {
  await page.goto('/tora');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('A Torá');
  await expect(page.locator('.book')).toHaveCount(5);
  await expect(page.locator('.book li')).toHaveCount(54);
  const lech = page.locator('.book li', { hasText: 'Lech Lecha' });
  await expect(lech).toContainText('Gn 1' + '2.1 – 17.27');
  await lech.getByRole('link').click();
  await expect(page).toHaveURL(/\/ler\/GEN\/12$/);

  // uma porção que começa no meio de um capítulo abre no versículo
  await page.goto('/tora');
  await page.locator('.book li', { hasText: 'Vayishlach' }).getByRole('link').click();
  await expect(page).toHaveURL(/\/ler\/GEN\/32#v3$/);
});

test('Torá: o hebraico das porções aparece da direita para a esquerda', async ({ page }) => {
  await page.goto('/tora');
  const he = page.locator('.book li').first().locator('[lang="he"]');
  await expect(he).toHaveText('בראשית');
  await expect(he).toHaveAttribute('dir', 'rtl');
});

test('Talmude: o que o app traz e não traz, os cinco trechos e as seis ordens', async ({ page }) => {
  await page.goto('/talmude');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('O Talmude');
  await expect(page.getByText('O texto completo do Talmude não está aqui')).toBeVisible();
  await expect(page.locator('article.passage')).toHaveCount(5);
  await expect(page.locator('details.seder')).toHaveCount(6);

  // a Mishná de Berakhot tem os dois endereços (Mishná e Guemará); Peá só o da Mishná
  const zeraim = page.locator('details.seder').first();
  await zeraim.locator('summary').click();
  const berakhot = zeraim.locator('li', { hasText: 'Berakhot' });
  await expect(berakhot.getByRole('link', { name: /Guemará/ })).toHaveAttribute('href', 'https://www.sefaria.org/Berakhot');
  await expect(berakhot.getByRole('link', { name: /Mishná/ })).toHaveAttribute('href', 'https://www.sefaria.org/Mishnah_Berakhot');
  const pea = zeraim.locator('li', { hasText: 'O canto do campo' });
  await expect(pea.getByRole('link', { name: /Guemará/ })).toHaveCount(0);
  await expect(pea).toContainText('sem Guemará no Babilônico');
});

test('Talmude: todos os links para fora abrem em outra aba, sem passar a origem', async ({ page }) => {
  await page.goto('/talmude');
  await page.locator('details.seder').first().locator('summary').click();
  const links = page.locator('a[href^="https://www.sefaria.org/"]');
  expect(await links.count()).toBeGreaterThan(5);
  for (const a of await links.all()) {
    await expect(a).toHaveAttribute('target', '_blank');
    await expect(a).toHaveAttribute('rel', /noopener/);
  }
});

test('Talmude: as referências bíblicas dos trechos são passagens que se tocam', async ({ page }) => {
  await page.goto('/talmude');
  const hillel = page.locator('article.passage', { hasText: 'Hillel e a Torá em um Pé Só' });
  await expect(hillel).toContainText('Lv 19.18');
  await expect(hillel).toContainText('Mt 7.12');
});

test('Estudos: A Torá e O Talmude abrem, têm os tópicos na capa e ligam às telas', async ({ page }) => {
  await page.goto('/artigo/tora');
  await expect(page.getByRole('heading', { level: 1 }).first()).toContainText('A Torá: Instrução, e Não Só Lei');
  await expect(page.getByRole('link', { name: 'A Torá', exact: true }).first()).toHaveAttribute('href', '/tora');
  await page.goto('/artigo/talmude');
  await expect(page.getByRole('heading', { level: 1 }).first()).toContainText('O Talmude: Séculos de Conversa em Volta da Torá');
  await expect(page.getByRole('link', { name: 'O Talmude', exact: true }).first()).toHaveAttribute('href', '/talmude');
});

test('Estante: “A Bíblia dos Judeus” tem os três livros, numerados na ordem', async ({ page }) => {
  await page.goto('/historia');
  const shelf = page.locator('#bay-sobre-a-biblia');
  const livros = shelf.getByRole('button', { name: /^Livro: (A Bíblia Judaica|A Torá: Instrução|O Talmude: Séculos)/ });
  await expect(livros).toHaveCount(3);
  await expect(livros.nth(0)).toHaveAccessibleName(/A Bíblia Judaica.*número 1 de 3/);
  await expect(livros.nth(1)).toHaveAccessibleName(/A Torá: Instrução, e Não Só Lei, número 2 de 3/);
  await expect(livros.nth(2)).toHaveAccessibleName(/O Talmude: Séculos de Conversa em Volta da Torá, número 3 de 3/);
});
