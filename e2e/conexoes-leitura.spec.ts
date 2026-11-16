import { expect, expectNoHorizontalOverflow, test } from './base';
import type { Page } from '@playwright/test';

/** Escolhe pelo nome visível, sem depender do índice interno do capítulo no grafo. */
async function chooseConnected(page: Page, label: string): Promise<void> {
  const select = page.getByLabel('Passagem conectada', { exact: true });
  const value = await select.getByRole('option', { name: new RegExp(`^${label}(?:\\s|$)`) }).getAttribute('value');
  expect(value, label).not.toBeNull();
  await select.selectOption(value!);
}

test.use({ reducedMotion: 'reduce' });

test('conexões: a passagem em foco mostra os versículos dos dois lados e permite ler a ligação sem sair do mapa', async ({ page }) => {
  await page.goto('/conexoes/ISA/53');
  const reading = page.locator('section.reading-connections');
  await expect(reading.getByRole('heading', { level: 3, name: 'Leia as passagens conectadas' })).toBeVisible();
  await chooseConnected(page, 'Mateus 8');
  const pair = reading.locator('article.connection-pair').filter({ hasText: 'Isaías 53:4' }).filter({ hasText: 'Mateus 8:17' });
  await expect(pair).toHaveCount(1);
  await pair.getByRole('button', { name: /^Ler as duas passagens:/ }).click();
  const passages = page.locator('app-passage-sheet figure.passage');
  await expect(passages.locator('figcaption > span')).toHaveText(['Isaías 53:4', 'Mateus 8:17']);
  await expect(passages.first().locator('blockquote')).not.toBeEmpty();
  await expect(passages.last().getByRole('link', { name: 'Abrir' })).toHaveAttribute('href', /\/ler\/MAT\/8#v17$/);
  await expect(page).toHaveURL(/\/conexoes\/ISA\/53$/);
  await page.keyboard.press('Escape');
  await expect(page.locator('app-passage-sheet')).toHaveCount(0);
  await expect(page.locator('section.focus h2')).toHaveText('Isaías 53');
});

test('conexões: também é possível ler a ligação que a base registra só no capítulo conectado', async ({ page }) => {
  await page.goto('/conexoes/ISA/53');
  await chooseConnected(page, 'Mateus 9');
  const pair = page.locator('section.reading-connections article.connection-pair');
  await expect(pair).toHaveCount(1);
  await expect(pair).toContainText('Isaías 53:3');
  await expect(pair).toContainText('Mateus 9:24');
  await pair.getByRole('button', { name: /^Ler as duas passagens:/ }).click();
  await expect(page.locator('app-passage-sheet figure.passage figcaption > span')).toHaveText(['Isaías 53:3', 'Mateus 9:24']);
});

test('conexões: a lista Siga o fio oferece leitura da ligação sem trocar o capítulo em foco', async ({ page }) => {
  await page.goto('/conexoes/ISA/53');
  const read = page.getByRole('button', { name: 'Ler conexão com Mateus 27', exact: true });
  await expect(read).toBeVisible();
  await read.click();
  const reading = page.locator('section.reading-connections');
  await expect(reading).toBeInViewport();
  await expect(reading.locator('article.connection-pair').first()).toContainText(/Mateus 27:\d+/);
  await expect(page.locator('section.focus h2')).toHaveText('Isaías 53');
  await expect(page).toHaveURL(/\/conexoes\/ISA\/53$/);
});

test('conexões: leitura do livro inteiro identifica os capítulos e cabe na tela de 360px', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/conexoes/HEB');
  const reading = page.locator('section.reading-connections');
  await expect(reading.locator('article.connection-pair').first()).toBeVisible();
  await expect(reading.locator('article.connection-pair').first()).toContainText(/Hebreus \d+:\d+/);
  await expectNoHorizontalOverflow(page);
  const targets = await reading.locator('button, select').evaluateAll((elements) => elements.map((element) => {
    const rect = element.getBoundingClientRect();
    return { text: element.textContent?.trim().slice(0, 40), width: rect.width, height: rect.height };
  }).filter((rect) => rect.width > 0 && rect.height > 0 && Math.min(rect.width, rect.height) < 39.5));
  expect(targets).toEqual([]);
});

test('conexões: sem os detalhes da referência, os dois capítulos completos continuam disponíveis para leitura', async ({ page, problems }) => {
  problems.allow(/Falha de rede.*bible\/referencias\/MAT\.json/);
  await page.route('**/bible/referencias/MAT.json', (route) => route.abort('failed'));
  await page.goto('/conexoes/ISA/53');
  await chooseConnected(page, 'Mateus 8');
  const reading = page.locator('section.reading-connections');
  await expect(reading).toContainText('Os versículos desta ligação ainda não estão disponíveis neste aparelho.');
  await expect(reading.locator('article.connection-pair')).toHaveCount(0);
  await reading.getByRole('button', { name: 'Ler os dois capítulos completos', exact: true }).click();
  await expect(page.locator('app-passage-sheet figure.passage figcaption > span')).toHaveText(['Isaías 53', 'Mateus 8']);
  await expect(page).toHaveURL(/\/conexoes\/ISA\/53$/);
});

test('conexões: cada ligação mostra o texto dos dois versículos lado a lado, sem precisar abrir nada', async ({ page }) => {
  await page.goto('/conexoes/ISA/53');
  await chooseConnected(page, 'Mateus 8');
  const pair = page.locator('section.reading-connections article.connection-pair').filter({ hasText: 'Isaías 53:4' });
  await expect(pair.getByText('Esta passagem', { exact: true })).toBeVisible();
  await expect(pair.getByText('Liga com', { exact: true })).toBeVisible();
  await expect(pair).toContainText('Verdadeiramente ele tomou sobre si as nossas enfermidades');
  await expect(pair).toContainText('Ele tomou sobre si as nossas enfermidades, e levou as nossas doenças');
});

test('conexões: sob o desenho, os capítulos ligados são botões que levam à leitura dos dois lados', async ({ page }) => {
  await page.goto('/conexoes/ISA/53');
  const chips = page.locator('.stage-reading .chip');
  await expect(chips.first()).toBeVisible();
  const label = (await chips.nth(1).textContent())!.trim();
  await chips.nth(1).click();
  const reading = page.locator('section.reading-connections');
  await expect(reading).toBeInViewport();
  await expect(reading.locator('article.connection-pair').first()).toContainText(new RegExp(`${label}:\\d+`));
  await expect(page).toHaveURL(/\/conexoes\/ISA\/53$/);
});

test('conexões: o mapa mental mostra a passagem no centro, os livros em ramos e abre capítulo e versículos', async ({ page }) => {
  await page.goto('/conexoes/ISA/53');
  await page.getByRole('button', { name: 'Mapa mental', exact: true }).click();
  const map = page.locator('app-connection-mindmap');
  await expect(map.locator('.node.root')).toContainText('Isaías 53');
  // o livro mais ligado já vem aberto, com o capítulo mais forte e os pares de versículos com texto
  const book = map.locator('button.book').filter({ hasText: 'Mateus' });
  await expect(book).toHaveAttribute('aria-expanded', 'true');
  await expect(map.locator('.node.pair').first()).toContainText(/Isaías 53:\d+/);
  // abrir outro capítulo mostra os dois versículos de verdade
  await map.getByRole('button', { name: /^Mateus 8\b/ }).click();
  const pair = map.locator('.node.pair').filter({ hasText: 'Isaías 53:4' }).filter({ hasText: 'Mateus 8:17' });
  await expect(pair).toContainText('Verdadeiramente ele tomou sobre si as nossas enfermidades');
  await expect(pair).toContainText('para que se cumprisse o que fora dito pelo profeta Isaías: Ele tomou sobre si as nossas enfermidades');
  // o nó mostra só um trecho; tocar nele abre os dois textos inteiros, sem sair da tela
  await pair.click();
  await expect(page.locator('app-passage-sheet figure.passage blockquote').last()).toContainText('e levou as nossas doenças');
  await expect(page.locator('app-passage-sheet figure.passage figcaption > span')).toHaveText(['Isaías 53:4', 'Mateus 8:17']);
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL(/\/conexoes\/ISA\/53$/);
  // fechar o livro esconde os capítulos
  await book.click();
  await expect(map.getByRole('button', { name: /^Mateus 8\b/ })).toHaveCount(0);
});

test('conexões: no mapa mental, tocar num capítulo sob o desenho abre o ramo dele', async ({ page }) => {
  await page.goto('/conexoes/ISA/53');
  await page.getByRole('button', { name: 'Mapa mental', exact: true }).click();
  const chip = page.locator('.stage-reading .chip').nth(2);
  const label = (await chip.textContent())!.trim();
  await chip.click();
  const chapter = page.locator('app-connection-mindmap').getByRole('button', { name: new RegExp(`^${label}\\b`) });
  await expect(chapter).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('app-connection-mindmap .node.pair').filter({ hasText: new RegExp(`${label}:\\d+`) }).first()).toBeVisible();
});

test('conexões: o mapa mental cabe na tela de 360px, desce em degraus e tem botões de 40px', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/conexoes/ISA/53');
  await page.getByRole('button', { name: 'Mapa mental', exact: true }).click();
  const map = page.locator('app-connection-mindmap');
  await expect(map.locator('.node.pair').first()).toBeVisible();
  await expectNoHorizontalOverflow(page);
  const targets = await map.locator('button').evaluateAll((elements) => elements.map((element) => {
    const rect = element.getBoundingClientRect();
    return { text: element.textContent?.trim().slice(0, 40), width: rect.width, height: rect.height };
  }).filter((rect) => rect.width > 0 && rect.height > 0 && Math.min(rect.width, rect.height) < 39.5));
  expect(targets).toEqual([]);
});
