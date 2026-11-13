import { readFileSync } from 'node:fs';
import { expect, test } from './base';
import { AD_STATES } from '../src/app/core/ad-states';
import { CURIOSITIES } from '../src/app/core/curiosities';
import { EPOCHS } from '../src/app/core/epochs';
import { CLASSIC_SERMONS } from '../src/app/core/library';
import { MAPS_IN_ORDER } from '../src/app/core/maps';
import { shelfBooks, TRAILS } from '../src/app/core/trails';
import { TRIBES } from '../src/app/core/tribes';

/**
 * Compartilhar uma imagem: toda página de estudo tem o botão, que abre um painel com a imagem (assunto, tópicos,
 * nome do app, endereço e QR code) para mandar no WhatsApp ou no Instagram, ou salvar.
 */
const json = <T>(file: string): T => JSON.parse(readFileSync(`public/conteudo/${file}`, 'utf8'));
const people = json<{ id: string }[]>('memorial.json');
const prophecies = json<{ id: string }[]>('profecias.json');
const dictionary = json<{ id: string }[]>('dicionario.json');
const hymns = json<{ hymns: { n: number }[] }>('harpa.json').hymns;

const PAGES: [string, string][] = [
  ['estudo', '/artigo/a-geracao-que-nao-conheceu-o-senhor'],
  ['personagem', `/memorial/${people[0].id}`],
  ['profecia', `/profecias/${prophecies[0].id}`],
  ['tribo', `/tribos/${TRIBES[0].id}`],
  ['estado da Assembleia de Deus', `/assembleia-de-deus/${AD_STATES[0].id}`],
  ['verbete do dicionário', `/dicionario/${dictionary[0].id}`],
  ['hino da Harpa', `/harpa/${hymns[0].n}`],
  ['época', `/epocas/${EPOCHS[0].id}`],
  ['sermão histórico', `/avivamento/${CLASSIC_SERMONS[0].id}`],
  ['curiosidade', `/curiosidades/${CURIOSITIES[0].id}`],
  ['mapa', `/mapas/${MAPS_IN_ORDER[0].id}`],
  ['assunto da biblioteca', `/historia?trilha=${TRAILS[0].id}`],
  ['sermão de Novas Vozes da Palavra', '/vozes/a-sanguessuga'],
];

for (const [name, url] of PAGES) {
  test(`compartilhar: ${name} tem o botão e a imagem sai com o tamanho do feed`, async ({ page }) => {
    await page.goto(url);
    await page.getByRole('button', { name: /^Compartilhar/ }).first().click();
    const img = page.locator('app-share-sheet .preview img');
    await expect(img).toBeVisible({ timeout: 15_000 });
    const size = await img.evaluate((i: HTMLImageElement) => [i.naturalWidth, i.naturalHeight]);
    expect(size).toEqual([1080, 1350]);
    await expect(img).toHaveAttribute('alt', /Prévia da imagem para compartilhar/);
  });
}

test('compartilhar: a imagem tem o QR code e muda de tamanho para os Stories', async ({ page }) => {
  await page.goto('/artigo/avivamento-da-coreia');
  await page.getByRole('button', { name: 'Compartilhar', exact: true }).click();
  const img = page.locator('app-share-sheet .preview img');
  await expect(img).toBeVisible({ timeout: 15_000 });
  // o quadro branco do QR code fica no rodapé, à direita
  const white = await img.evaluate(async (i: HTMLImageElement) => {
    const c = document.createElement('canvas');
    c.width = i.naturalWidth;
    c.height = i.naturalHeight;
    const ctx = c.getContext('2d')!;
    ctx.drawImage(i, 0, 0);
    const [r, g, b] = ctx.getImageData(797, 1167, 1, 1).data;
    return [r, g, b];
  });
  expect(white, 'quadro branco do QR code').toEqual([255, 255, 255]);
  await page.getByRole('button', { name: /Stories/ }).click();
  await expect(page.getByRole('button', { name: /Stories/ })).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(async () => img.evaluate((i: HTMLImageElement) => i.naturalHeight), { timeout: 15_000 }).toBe(1920);
});

test('compartilhar: manda a imagem pelo menu do aparelho, com o texto e o link', async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as unknown as { __shared: unknown };
    Object.defineProperty(navigator, 'canShare', { value: () => true, configurable: true });
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async (d: ShareData) => {
        w.__shared = { title: d.title, text: d.text, files: (d.files ?? []).map((f) => ({ name: f.name, type: f.type, size: f.size })) };
      },
    });
  });
  await page.goto('/artigo/avivamento-da-coreia');
  await page.getByRole('button', { name: 'Compartilhar', exact: true }).click();
  await expect(page.locator('app-share-sheet .preview img')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: 'Compartilhar imagem' }).click();
  const shared = await page.evaluate(() => (window as unknown as { __shared: { title: string; text: string; files: { name: string; type: string; size: number }[] } }).__shared);
  expect(shared.title).toBe('O Grande Avivamento da Coreia');
  expect(shared.text).toContain('https://sgtcastanheira.github.io/biblia-sagrada/artigo/avivamento-da-coreia');
  expect(shared.files).toHaveLength(1);
  expect(shared.files[0].type).toBe('image/png');
  expect(shared.files[0].name).toBe('biblia-sagrada-artigo-avivamento-da-coreia.png');
  expect(shared.files[0].size).toBeGreaterThan(20_000);
});

test('compartilhar: baixa a imagem, copia o link e abre o WhatsApp com o link', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.addInitScript(() => {
    (window as unknown as { __opened: string[] }).__opened = [];
    window.open = (u?: string | URL) => {
      (window as unknown as { __opened: string[] }).__opened.push(String(u));
      return null;
    };
  });
  await page.goto('/artigo/avivamento-da-coreia');
  await page.getByRole('button', { name: 'Compartilhar', exact: true }).click();
  await expect(page.locator('app-share-sheet .preview img')).toBeVisible({ timeout: 15_000 });

  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Baixar a imagem' }).click()]);
  expect(download.suggestedFilename()).toBe('biblia-sagrada-artigo-avivamento-da-coreia.png');

  await page.getByRole('button', { name: 'Copiar o link' }).click();
  await expect(page.getByText('Link copiado')).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('https://sgtcastanheira.github.io/biblia-sagrada/artigo/avivamento-da-coreia');

  await page.getByRole('button', { name: 'Enviar o link no WhatsApp' }).click();
  const opened = await page.evaluate(() => (window as unknown as { __opened: string[] }).__opened);
  expect(opened[0]).toMatch(/^https:\/\/wa\.me\/\?text=/);
  expect(decodeURIComponent(opened[0])).toContain('https://sgtcastanheira.github.io/biblia-sagrada/artigo/avivamento-da-coreia');
});

test('compartilhar: sem menu de compartilhar, “Compartilhar imagem” salva a imagem e avisa', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'canShare', { value: undefined, configurable: true });
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
  });
  await page.goto('/curiosidades/' + CURIOSITIES[0].id);
  await page.getByRole('button', { name: 'Compartilhar', exact: true }).click();
  await expect(page.locator('app-share-sheet .preview img')).toBeVisible({ timeout: 15_000 });
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Compartilhar imagem' }).click()]);
  expect(download.suggestedFilename()).toMatch(/^biblia-sagrada-curiosidades-.+\.png$/);
  await expect(page.getByText(/A imagem foi salva/)).toBeVisible();
});

test('compartilhar: o painel tem botões grandes e letras legíveis', async ({ page }) => {
  await page.goto('/artigo/avivamento-da-coreia');
  await page.getByRole('button', { name: 'Compartilhar', exact: true }).click();
  await expect(page.locator('app-share-sheet .preview img')).toBeVisible({ timeout: 15_000 });
  const report = await page.locator('app-share-sheet').evaluate((root) => {
    const small: string[] = [];
    for (const el of root.querySelectorAll<HTMLElement>('*')) {
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && (n.textContent ?? '').trim());
      if (own && parseFloat(getComputedStyle(el).fontSize) < 13) small.push(el.textContent!.trim().slice(0, 30));
    }
    const buttons = [...root.querySelectorAll<HTMLElement>('button')].map((b) => [b.textContent!.trim(), Math.round(b.getBoundingClientRect().height)] as const);
    return { small, buttons };
  });
  expect(report.small).toEqual([]);
  for (const [label, height] of report.buttons) expect(height, label).toBeGreaterThanOrEqual(40);
});

test('compartilhar: os quatro botões do painel ficam à vista, sem rolar, até numa janela baixa', async ({ page }) => {
  const estreita = (page.viewportSize()?.width ?? 0) < 700;
  await page.setViewportSize(estreita ? { width: 390, height: 740 } : { width: 1080, height: 661 });
  await page.goto('/artigo/da-volta-do-exilio-a-jesus');
  await page.locator('app-share-image-button button').first().click();
  await page.locator('app-share-sheet .preview img').waitFor({ timeout: 15_000 });
  const altura = page.viewportSize()!.height;
  for (const nome of [/Compartilhar imagem/, /Baixar a imagem/, /Enviar o link no WhatsApp/, /Copiar o link/]) {
    const caixa = await page.getByRole('button', { name: nome }).boundingBox();
    expect(caixa, String(nome)).not.toBeNull();
    expect(caixa!.y, `${nome} começa dentro da tela`).toBeGreaterThanOrEqual(0);
    expect(caixa!.y + caixa!.height, `${nome} termina dentro da tela`).toBeLessThanOrEqual(altura);
    expect(caixa!.height).toBeGreaterThanOrEqual(40);
  }
});

test('compartilhar: a estante do Volume 4 tem o botão, a imagem sai nos dois tamanhos com as capas desenhadas, e o texto lista os livros em ordem', async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as unknown as { __shared: unknown };
    Object.defineProperty(navigator, 'canShare', { value: () => true, configurable: true });
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async (d: ShareData) => {
        w.__shared = { title: d.title, text: d.text, files: (d.files ?? []).map((f) => ({ name: f.name, type: f.type })) };
      },
    });
  });
  await page.goto('/historia');
  await page.getByRole('button', { name: /^Compartilhar a estante Volume 4/ }).click();
  const img = page.locator('app-share-sheet .preview img');
  await expect(img).toBeVisible({ timeout: 15_000 });
  await expect(img).toHaveAttribute('alt', /A Paixão, da Ceia à Ressurreição/);
  expect(await img.evaluate((i: HTMLImageElement) => [i.naturalWidth, i.naturalHeight])).toEqual([1080, 1350]);

  // As capas foram desenhadas: o dourado dos números, dos ícones e dos fios aparece de sobra na região da estante
  // (a conta não depende de coordenadas de cada capa, só de a estante estar lá)
  const dourado = await img.evaluate((i: HTMLImageElement) => {
    const c = document.createElement('canvas');
    c.width = i.naturalWidth;
    c.height = i.naturalHeight;
    const ctx = c.getContext('2d')!;
    ctx.drawImage(i, 0, 0);
    const { data } = ctx.getImageData(0, 400, 1080, 610);
    let n = 0;
    for (let p = 0; p < data.length; p += 4) if (Math.abs(data[p] - 241) < 8 && Math.abs(data[p + 1] - 217) < 8 && Math.abs(data[p + 2] - 168) < 8) n++;
    return n;
  });
  expect(dourado, 'pixels dourados na estante').toBeGreaterThan(3000);

  await page.getByRole('button', { name: /Stories/ }).click();
  await expect.poll(async () => img.evaluate((i: HTMLImageElement) => i.naturalHeight), { timeout: 15_000 }).toBe(1920);

  await page.getByRole('button', { name: 'Compartilhar imagem' }).click();
  const shared = await page.evaluate(() => (window as unknown as { __shared: { title: string; text: string; files: { name: string; type: string }[] } }).__shared);
  expect(shared.title).toBe('A Paixão, da Ceia à Ressurreição');
  expect(shared.text).toContain('1. Getsêmani\n2. Santa Ceia\n3. Prisão e Interrogatório\n4. Açoite e Condenação\n5. Crucificação\n6. Sepultamento e Ressurreição\n7. Quem Mandava e Onde Mandava');
  expect(shared.text.endsWith('Abra a biblioteca: https://sgtcastanheira.github.io/biblia-sagrada/historia?estante=como-a-ciencia-explica')).toBe(true);
  expect(shared.files).toEqual([{ name: 'biblia-sagrada-historia-estante-como-a-ciencia-explica.png', type: 'image/png' }]);
});

test('compartilhar: toda prateleira de histórias tem o botão da estante, com área de toque de 40px, e as ferramentas não', async ({ page }) => {
  await page.goto('/historia');
  const prateleiras = TRAILS.reduce((n, t) => n + t.branches.filter((b) => shelfBooks(b).length || b.links?.length).length, 0);
  const botoes = page.getByRole('button', { name: /^Compartilhar a estante/ });
  await expect(botoes).toHaveCount(prateleiras);
  await expect(page.locator('#bay-mapas').getByRole('button', { name: /^Compartilhar a estante/ })).toHaveCount(0);
  const caixa = (await botoes.first().boundingBox())!;
  expect(Math.min(caixa.width, caixa.height)).toBeGreaterThanOrEqual(40);
});

// Uma com um livro só, uma com atalhos e a maior (20 livros): todas geram a imagem, e o texto lista os livros na ordem
for (const [titulo, texto] of [
  ['Quem É Deus', /\n\n1\. A Trindade/],
  ['A Igreja pelo País', /\n\n1\. .+\nAtalho: /],
  ['Livros de História da Igreja', /\n\n1\. .+\n2\. .+\n3\. /],
] as const) {
  test(`compartilhar: a estante “${titulo}” gera a imagem e o texto com a contagem na ordem`, async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __shared: unknown };
      Object.defineProperty(navigator, 'canShare', { value: () => true, configurable: true });
      Object.defineProperty(navigator, 'share', { configurable: true, value: async (d: ShareData) => { w.__shared = { text: d.text }; } });
    });
    await page.goto('/historia');
    await page.getByRole('button', { name: `Compartilhar a estante ${titulo}` }).click();
    const img = page.locator('app-share-sheet .preview img');
    await expect(img).toBeVisible({ timeout: 15_000 });
    expect(await img.evaluate((i: HTMLImageElement) => [i.naturalWidth, i.naturalHeight])).toEqual([1080, 1350]);
    await page.getByRole('button', { name: /Stories/ }).click();
    await expect.poll(async () => img.evaluate((i: HTMLImageElement) => i.naturalHeight), { timeout: 15_000 }).toBe(1920);
    await page.getByRole('button', { name: 'Compartilhar imagem' }).click();
    const compartilhado = await page.evaluate(() => (window as unknown as { __shared: { text: string } }).__shared);
    expect(compartilhado.text).toMatch(texto);
    expect(compartilhado.text).toContain('/historia?estante=');
  });
}
