import { expect, test } from './base';
import { ANNIVERSARIES } from '../src/app/core/anniversaries';

/**
 * Datas da história: a tela inicial destaca, com foto, o que faz aniversário por perto (a chegada de Daniel Berg e
 * Gunnar Vingren a Belém, em 19 de novembro de 1910), os destaques passam sozinhos e dá para pausar; a página /datas
 * lista o ano inteiro; e cada fato vira uma imagem de comemoração para compartilhar.
 */
const DIA = new Date('2026-11-19T10:00:00');

test('datas: em 19 de novembro, a tela inicial mostra “Hoje na História” com a chegada de Berg e Vingren e a foto com crédito', async ({ page }) => {
  await page.clock.install({ time: DIA });
  await page.goto('/');
  const box = page.locator('app-commemorations');
  await expect(box.getByRole('heading', { name: 'Hoje na História' })).toBeVisible();
  await expect(box.getByRole('heading', { level: 3 })).toHaveText('Berg e Vingren Chegam a Belém');
  await expect(box.locator('.badge')).toContainText('116 anos');
  await expect(box.locator('.badge')).toContainText('Hoje');
  await expect(box.getByText('19 de novembro de 1910')).toBeVisible();
  await expect(box.getByText(/Foto: Gunnar Vingren em 1908.*domínio público/)).toBeVisible();
  await expect(box.locator('img')).toBeVisible();
  expect(await box.locator('img').evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
  await box.getByRole('link', { name: 'Ler a história' }).click();
  await expect(page).toHaveURL(/\/artigo\/daniel-berg-e-gunnar-vingren/);
});

test('datas: os destaques passam sozinhos, e parar ou escolher um segura a troca', async ({ page }) => {
  await page.clock.install({ time: DIA });
  await page.goto('/');
  const box = page.locator('app-commemorations');
  const title = box.getByRole('heading', { level: 3 });
  await expect(title).toHaveText('Berg e Vingren Chegam a Belém');
  const dots = box.locator('.dot');
  expect(await dots.count()).toBeGreaterThanOrEqual(2);
  expect(await dots.count()).toBeLessThanOrEqual(12);
  await page.clock.fastForward(10_000);
  await expect(title).not.toHaveText('Berg e Vingren Chegam a Belém');
  const second = await title.textContent();
  // pausar: depois de muito tempo o destaque continua o mesmo
  await box.getByRole('button', { name: 'Pausar a troca dos destaques' }).click();
  await expect(box.getByRole('button', { name: 'Retomar a troca dos destaques' })).toBeVisible();
  await page.clock.fastForward(30_000);
  await expect(title).toHaveText(second!);
  // escolher o primeiro ponto
  await dots.nth(0).click();
  await expect(dots.nth(0)).toHaveAttribute('aria-current', 'true');
  await expect(title).not.toHaveText(second!);
});

test('datas: com “reduzir movimento” ligado os destaques não passam sozinhos e não há botão de pausar', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.install({ time: DIA });
  await page.goto('/');
  const box = page.locator('app-commemorations');
  await expect(box.getByRole('heading', { level: 3 })).toHaveText('Berg e Vingren Chegam a Belém');
  await expect(box.getByRole('button', { name: /Pausar a troca/ })).toHaveCount(0);
  await page.clock.fastForward(40_000);
  await expect(box.getByRole('heading', { level: 3 })).toHaveText('Berg e Vingren Chegam a Belém');
  await box.locator('.dot').nth(1).click();
  await expect(box.getByRole('heading', { level: 3 })).not.toHaveText('Berg e Vingren Chegam a Belém');
});

test('datas: sem fato no dia, a tela inicial mostra só as datas do mês, e muda quando o mês vira', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-10T10:00:00') });
  await page.goto('/');
  const box = page.locator('app-commemorations');
  await expect(box.getByRole('heading', { name: 'Datas de novembro' })).toBeVisible();
  await expect(box.locator('.badge').first()).toContainText(/Em \d+ dias|Amanhã|Hoje/);
  const dias = (mes: number) => new Set(ANNIVERSARIES.filter((a) => a.month === mes).map((a) => a.day)).size; // um cartão por dia
  expect(await box.locator('.dot').count()).toBe(dias(11));
  // em dezembro a lista é outra: só os fatos de dezembro
  await page.clock.setFixedTime(new Date('2026-12-01T10:00:00'));
  await page.goto('/');
  await expect(box.getByRole('heading', { name: 'Datas de dezembro' })).toBeVisible();
  expect(await box.locator('.dot').count()).toBe(dias(12));
});

test('datas: “Compartilhar” monta a imagem de comemoração com a foto e o QR code', async ({ page }) => {
  await page.clock.install({ time: DIA });
  await page.goto('/');
  await page.locator('app-commemorations').getByRole('button', { name: /Compartilhar a imagem desta data/ }).click();
  const img = page.locator('app-share-sheet .preview img');
  await expect(img).toBeVisible({ timeout: 15_000 });
  expect(await img.evaluate((i: HTMLImageElement) => [i.naturalWidth, i.naturalHeight])).toEqual([1080, 1350]);
  const pixels = await img.evaluate((i: HTMLImageElement) => {
    const c = document.createElement('canvas');
    c.width = i.naturalWidth;
    c.height = i.naturalHeight;
    const ctx = c.getContext('2d')!;
    ctx.drawImage(i, 0, 0);
    // o quadro do QR code é branco; a foto (retrato claro) deixa uma área clara e outra escura no meio da imagem
    return { qr: [...ctx.getImageData(797, 1167, 1, 1).data.slice(0, 3)], foto: ctx.getImageData(540, 520, 1, 1).data[0] };
  });
  expect(pixels.qr).toEqual([255, 255, 255]);
  expect(pixels.foto).toBeGreaterThan(0);
});

test('datas: /datas lista o ano inteiro, começa pelo mês de hoje e marca o fato do dia', async ({ page }) => {
  await page.clock.install({ time: DIA });
  await page.goto('/datas');
  await expect(page.getByRole('heading', { level: 1, name: 'Datas da História' })).toBeVisible();
  await expect(page.locator('li .title')).toHaveCount(ANNIVERSARIES.length);
  await expect(page.locator('h2.section-title').first()).toHaveText('Novembro');
  const hoje = page.locator('li.today');
  await expect(hoje).toHaveCount(1);
  await expect(hoje).toContainText('Berg e Vingren Chegam a Belém');
  await expect(hoje).toContainText('116 anos');
  await expect(hoje).toContainText('Hoje');
  await hoje.getByRole('button', { name: /Compartilhar a imagem: Berg e Vingren/ }).click();
  await expect(page.locator('app-share-sheet .preview img')).toBeVisible({ timeout: 15_000 });
});

test('datas: um fato da lista leva à história e a biblioteca tem o livro “Datas da História”', async ({ page }) => {
  await page.goto('/datas');
  await page.locator('li', { hasText: 'A Primeira Missa no Brasil' }).getByRole('link').first().click();
  await expect(page).toHaveURL(/\/artigo\/igreja-e-estado/);
  await page.goto('/historia');
  await page.getByRole('button', { name: /^Livro: Datas da História/ }).click();
  await expect(page).toHaveURL(/\/datas$/);
});

test('datas: na página das datas a foto aparece grande, com o crédito: ao lado do texto no computador e acima dele no celular', async ({ page }) => {
  await page.clock.install({ time: DIA });
  await page.goto('/datas');
  const cartao = page.locator('.ev.has-photo').first();
  const foto = cartao.locator('img.thumb');
  await expect(foto).toBeVisible();
  await expect.poll(() => foto.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
  await expect(cartao.locator('.credit')).toContainText(/Foto( ilustrativa)?:/);
  const [f, texto] = [await foto.boundingBox(), await cartao.locator('.main').boundingBox()];
  expect(f!.height).toBeGreaterThanOrEqual(110);
  expect(f!.width).toBeGreaterThanOrEqual(150);
  if ((page.viewportSize()?.width ?? 0) >= 640) {
    expect(f!.x).toBeGreaterThan(texto!.x + texto!.width / 2); // à direita do texto, na mesma altura
    expect(f!.y).toBeLessThan(texto!.y + texto!.height);
  } else {
    expect(f!.y + f!.height).toBeLessThanOrEqual(texto!.y + 1); // em faixa, acima do texto
    expect(f!.width).toBeGreaterThan((page.viewportSize()?.width ?? 0) * 0.7);
  }
});

test('datas: o alto da biblioteca tem o cartão “Datas de novembro”, que leva à página das datas', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-10T10:00:00') });
  await page.goto('/historia');
  const cartao = page.getByRole('link', { name: /Datas de novembro/ });
  await expect(cartao).toBeVisible();
  await expect(cartao).toContainText(`${ANNIVERSARIES.filter((a) => a.month === 11).length} fatos`);
  await cartao.click();
  await expect(page).toHaveURL(/\/datas$/);
});

test('datas: 15 de novembro tem dois fatos, e a tela inicial mostra um compilado do dia com os dois', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-15T10:00:00') });
  await page.goto('/');
  const box = page.locator('app-commemorations');
  await expect(box.getByRole('heading', { name: 'Hoje na História' })).toBeVisible();
  await expect(box.getByRole('heading', { level: 3 })).toHaveText('2 fatos nesse dia');
  await expect(box.locator('.when')).toHaveText('15 de novembro');
  await expect(box.locator('.badge')).toContainText('2 fatos');
  const fatos = box.locator('.events li');
  await expect(fatos).toHaveCount(2);
  await expect(fatos.nth(0)).toContainText('1927');
  await expect(fatos.nth(0)).toContainText('A Primeira Assembleia de Deus de São Paulo');
  await expect(fatos.nth(1)).toContainText('1929');
  await expect(fatos.nth(1)).toContainText('Começa o Trabalho de Madureira');
  await fatos.nth(1).getByRole('link').click();
  await expect(page).toHaveURL(/\/artigo\/madureira-e-a-separacao/);
});

test('datas: o compilado do dia vira uma imagem só para compartilhar', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-15T10:00:00') });
  await page.goto('/');
  await page.locator('app-commemorations').getByRole('button', { name: /Compartilhar a imagem desta data/ }).click();
  const img = page.locator('app-share-sheet .preview img');
  await expect(img).toBeVisible({ timeout: 15_000 });
  expect(await img.evaluate((i: HTMLImageElement) => [i.naturalWidth, i.naturalHeight])).toEqual([1080, 1350]);
  await expect(img).toHaveAttribute('alt', /O que aconteceu em 15 de novembro/);
});

test('datas: /datas junta os fatos do mesmo dia num cartão só, com o botão de compartilhar o dia', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-15T10:00:00') });
  await page.goto('/datas');
  const dia = page.locator('li', { hasText: 'A Primeira Assembleia de Deus de São Paulo' });
  await expect(dia).toHaveCount(1);
  await expect(dia).toContainText('Começa o Trabalho de Madureira');
  await expect(dia).toContainText('2 fatos nesse dia');
  await expect(dia.locator('.ev')).toHaveCount(2);
  await expect(dia).toHaveClass(/today/);
  await dia.getByRole('button', { name: /Compartilhar a imagem do dia 15 de novembro/ }).click();
  await expect(page.locator('app-share-sheet .preview img')).toBeVisible({ timeout: 15_000 });
  // dia com um fato só: sem compilado
  await page.goto('/datas');
  await expect(page.locator('li', { hasText: 'A Primeira Missa no Brasil' }).getByText('fatos nesse dia')).toHaveCount(0);
  // a lista tem um cartão por dia, e cada fato continua com o seu título
  const dias = new Set(ANNIVERSARIES.map((a) => `${a.month}-${a.day}`)).size;
  await expect(page.locator('ul.list > li')).toHaveCount(dias);
  await expect(page.locator('li .title')).toHaveCount(ANNIVERSARIES.length);
});

test('datas: 1º de janeiro tem três fatos, e cada um aparece no compilado com a sua foto e o seu crédito', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T10:00:00') });
  await page.goto('/');
  const box = page.locator('app-commemorations');
  await expect(box.getByRole('heading', { level: 3 })).toHaveText('3 fatos nesse dia');
  const fatos = box.locator('.events li');
  await expect(fatos).toHaveCount(3);
  for (let i = 0; i < 3; i++) {
    const foto = fatos.nth(i).locator('img.ev-img');
    await expect(foto).toBeVisible();
    await expect.poll(() => foto.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0), { message: `foto do fato ${i + 1}` }).toBe(true); // as fotos carregam sob demanda
    await expect(fatos.nth(i).locator('.ev-credit')).toContainText(/Foto/);
  }
  // a imagem do dia leva as três fotos lado a lado
  await box.getByRole('button', { name: /Compartilhar a imagem desta data/ }).click();
  const img = page.locator('app-share-sheet .preview img');
  await expect(img).toBeVisible({ timeout: 15_000 });
  expect(await img.evaluate((i: HTMLImageElement) => [i.naturalWidth, i.naturalHeight])).toEqual([1080, 1350]);
});
