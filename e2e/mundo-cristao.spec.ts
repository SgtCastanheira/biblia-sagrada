import { expect, expectNoHorizontalOverflow, goToTab, test } from './base';
import { mockNews } from './noticias-falsas';

/**
 * Mundo Cristão (seção do Jornal, em /vozes, abaixo das Novas Vozes): lê as fontes ao vivo, tira o que é de outro assunto e as repetidas, mostra o selo de
 * atualização, se atualiza sozinho a cada 5 minutos e, sem internet, usa a reserva diária (public/data/noticias.json).
 */
const cartoes = (page: import('@playwright/test').Page) => page.locator('ul.grid > li.card');

test('o Jornal junta as Novas Vozes e o Mundo Cristão numa página só, e o endereço antigo leva a ela', async ({ page }) => {
  await page.goto('/mundo-cristao');
  await expect(page).toHaveURL(/\/vozes$/);
  await expect(page.getByRole('navigation', { name: 'Navegação principal' }).locator('.nav-item.active')).toHaveText(/Jornal/);
  // os sermões em cima e as notícias logo abaixo, na mesma página
  const vozes = page.getByRole('heading', { level: 1, name: 'Nesta edição' });
  const mundo = page.getByRole('heading', { level: 2, name: 'Mundo Cristão' });
  await expect(vozes).toBeVisible();
  const [acima, abaixo] = [await vozes.boundingBox(), await mundo.boundingBox()];
  expect(abaixo!.y).toBeGreaterThan(acima!.y);

  // 2 do Portas Abertas + 1 do Guiame + 1 da Voz dos Mártires; o show de louvor não é do assunto e a cópia do Guiame é repetida
  await expect(cartoes(page)).toHaveCount(4);
  const titulos = await cartoes(page).locator('h3').allInnerTexts();
  expect(titulos.join('|')).not.toContain('Show de louvor');
  // da mais nova para a mais antiga
  expect(titulos.map((t) => t.replace(/\s*\(abre[\s\S]*$/, ''))).toEqual([
    'Cristãos deslocados – teste um', 'Missionária chega à aldeia: teste três', 'Igreja perseguida: teste dois', 'Mártires de hoje: teste quatro',
  ]);
  await expect(page.getByText('Atualizado agora')).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test('cada cartão mostra fonte, data, resumo e leva à matéria original numa aba nova', async ({ page }) => {
  await page.goto('/vozes');
  const primeiro = cartoes(page).first();
  await expect(primeiro.locator('.meta strong')).toHaveText('Portas Abertas');
  await expect(primeiro.locator('time')).toHaveAttribute('datetime', '2026-11-16T11:00:00.000Z');
  await expect(primeiro.getByText('Resumo do teste um da Portas Abertas')).toBeVisible();
  const link = primeiro.getByRole('link');
  await expect(link).toHaveAttribute('href', 'https://portasabertas.org.br/noticias/teste-um/');
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link).toHaveAttribute('rel', /noopener/);
  // o http da fonte virou https
  await expect(cartoes(page).nth(1).getByRole('link')).toHaveAttribute('href', 'https://guiame.com.br/gospel/teste-tres.html');
  // miniatura quando há; ícone quando não há
  await expect(primeiro.locator('img')).toHaveAttribute('src', 'https://imagens.teste/um.png');
  await expect(cartoes(page).nth(2).locator('img')).toHaveCount(0);
});

test('dá para filtrar por fonte', async ({ page }) => {
  await page.goto('/vozes');
  await expect(cartoes(page)).toHaveCount(4);
  const grupo = page.getByRole('group', { name: 'Filtrar por fonte' });
  await grupo.getByRole('button', { name: 'Portas Abertas' }).click();
  await expect(cartoes(page)).toHaveCount(2);
  await expect(grupo.getByRole('button', { name: 'Portas Abertas' })).toHaveAttribute('aria-pressed', 'true');
  await grupo.getByRole('button', { name: 'Todas' }).click();
  await expect(cartoes(page)).toHaveCount(4);
});

test('a tela se atualiza sozinha a cada 5 minutos e o selo conta o tempo', async ({ page }) => {
  await page.clock.install();
  let leituras = 0;
  await page.route('https://portasabertas.org.br/wp-json/**', async (route) => {
    leituras++;
    await route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*' }, contentType: 'application/json', body: '[]' });
  });
  await page.goto('/vozes');
  await expect(page.getByText('Atualizado agora')).toBeVisible();
  expect(leituras).toBe(1);
  await page.clock.runFor(31_000);
  await expect(page.getByText('Atualizado agora')).toBeVisible();
  await page.clock.runFor(2.5 * 60_000);
  await expect(page.getByText(/Atualizado há [23] min/)).toBeVisible();
  await page.clock.runFor(2 * 60_000 + 5_000);
  await expect.poll(() => leituras).toBe(2);
  await expect(page.getByText('Atualizado agora')).toBeVisible();
});

test('se uma fonte cai, a tela segue com as outras e avisa qual caiu', async ({ page }) => {
  await mockNews(page, { failFeeds: ['https://guiame.com.br/rss'] });
  await page.goto('/vozes');
  // Guiame falhou ao vivo e a reserva (arquivo real do projeto) completa o que ela tiver daquela fonte
  await expect(page.getByText(/Guiame não respondeu agora/)).toBeVisible();
  await expect(page.getByText('Atualizado agora')).toBeVisible();
  await expect(cartoes(page).filter({ has: page.locator('.meta strong', { hasText: /^Portas Abertas$/ }) })).toHaveCount(2);
});

test('sem internet, mostra o resumo salvo e diz isso', async ({ page, problems }) => {
  problems.allow(/Falha de rede em https:\/\/portasabertas/);
  await mockNews(page, { offline: true });
  await page.goto('/vozes');
  await expect(page.getByText(/Sem conexão com as fontes · resumo salvo/)).toBeVisible();
  expect(await cartoes(page).count()).toBeGreaterThan(0);
  // as notícias são as do arquivo public/data/noticias.json
  const arquivo = await page.evaluate(() => fetch('data/noticias.json').then((r) => r.json()));
  expect(await cartoes(page).count()).toBe(arquivo.itens.length);
  await expect(cartoes(page).first().locator('h3')).toContainText(arquivo.itens[0].titulo);
});

test('sem fonte e sem reserva, a mensagem é amigável e dá para tentar de novo', async ({ page, problems }) => {
  problems.allow(/Falha de rede em https:\/\/portasabertas/);
  await mockNews(page, { offline: true });
  await page.route('**/data/noticias.json', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"geradoEm":"2026-01-01T00:00:00Z","itens":[]}' }));
  await page.goto('/vozes');
  await expect(page.getByText('Nenhuma notícia encontrada agora.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Tentar de novo' })).toBeVisible();
});

test('a tela inicial tem o atalho do Mundo Cristão, e ele abre a tela', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Mundo Cristão/ }).click();
  await expect(page).toHaveURL(/\/vozes$/);
  await expect(cartoes(page).first()).toBeVisible();
  await goToTab(page, 'Início');
  await goToTab(page, 'Jornal');
  await expect(page).toHaveURL(/\/vozes$/);
});
