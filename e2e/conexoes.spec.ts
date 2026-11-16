import { expect, test } from './base';
import type { Page } from '@playwright/test';

/**
 * A Bíblia Conectada (/conexoes): o desenho dos arcos, a escolha de um capítulo ou de um livro, a lista “Siga o fio”, o endereço que
 * guarda o que está em foco, o compartilhar e as entradas (estante da biblioteca e versículo do leitor). A conta das ligações e dos
 * capítulos está em logica/conexoes.spec.ts.
 */
const HARRISON = 'https://www.chrisharrison.net/index.php/Visualizations/BibleViz';

/** Quantos pontos do canvas têm alguma cor: prova que o desenho foi pintado (sem depender de onde cada arco passa). */
async function painted(page: Page, which: 'base' | 'top'): Promise<number> {
  return page.locator(`app-bible-arcs canvas.${which}`).evaluate((c: HTMLCanvasElement) => {
    const { data } = c.getContext('2d')!.getImageData(0, 0, c.width, c.height);
    let n = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] > 0) n++;
    return n;
  });
}

test('conexões: a tela abre com o desenho pintado, os três níveis, os pontos de partida e o crédito à página de Chris Harrison', async ({ page }) => {
  await page.goto('/conexoes');
  await expect(page.getByRole('heading', { level: 1, name: 'A Bíblia Conectada' })).toBeVisible();
  await expect(page.locator('app-bible-arcs')).toBeVisible();
  await expect.poll(() => painted(page, 'base'), { timeout: 10_000 }).toBeGreaterThan(5000);
  // a faixa dos livros (camada de cima) também está lá
  expect(await painted(page, 'top')).toBeGreaterThan(500);

  const niveis = page.getByRole('group', { name: 'Quantas ligações mostrar na visão geral' });
  await expect(niveis.getByRole('button', { name: /^Mais fortes · 4\.188$/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(niveis.getByRole('button', { name: /^Mais ligações · 11\.902$/ })).toHaveAttribute('aria-pressed', 'false');
  await expect(niveis.getByRole('button', { name: /^Todas · 70\.160$/ })).toBeVisible();
  await expect(page.getByText(/São 70\.160 ligações entre os 1\.189 capítulos/)).toBeVisible();

  await expect(page.getByRole('heading', { level: 2, name: 'Comece por aqui' })).toBeVisible();
  await expect(page.locator('.start-card')).toHaveCount(7);
  await expect(page.locator('.start-card').first()).toContainText('Gênesis 1');

  // o crédito: visível, com o endereço da página original
  const credito = page.locator('.stage .credit');
  await expect(credito).toContainText('Ideia inspirada em Bible Cross-References, de Chris Harrison e Christoph Römhild (2007)');
  await expect(credito.getByRole('link', { name: 'Bible Cross-References' })).toHaveAttribute('href', HARRISON);
  await expect(credito.getByRole('link', { name: 'Bible Cross-References' })).toHaveAttribute('target', '_blank');
});

test('conexões: escolher o livro e o capítulo acende as ligações, mostra os números e leva ao leitor', async ({ page }) => {
  await page.goto('/conexoes');
  await page.getByLabel('Livro', { exact: true }).selectOption('ISA');
  await expect(page).toHaveURL(/\/conexoes\/ISA$/);
  await page.getByLabel('Capítulo', { exact: true }).selectOption('53');
  await expect(page).toHaveURL(/\/conexoes\/ISA\/53$/);
  const foco = page.locator('section.focus');
  await expect(foco.getByRole('heading', { level: 2, name: 'Isaías 53' })).toBeVisible();
  await expect(foco).toContainText('Ligado a 130 capítulos, em 36 livros');
  await expect(foco.getByRole('heading', { level: 3, name: 'Mais ligado com' })).toBeVisible();
  await expect(foco.locator('.bars li').first()).toContainText('Mateus');
  await expect(foco.getByRole('link', { name: 'Ler Isaías 53' })).toHaveAttribute('href', /\/ler\/ISA\/53$/);
  // o desenho do que está em foco foi pintado (as ligações crescem em meio segundo)
  await expect.poll(() => painted(page, 'top'), { timeout: 5000 }).toBeGreaterThan(3000);
  await expect(page.locator('app-bible-arcs .arcs')).toHaveClass(/focus/);

  // as citações que o app explica aparecem, com a explicação e os dois textos
  await expect(foco.getByRole('heading', { level: 3, name: 'Citações e alusões explicadas' })).toBeVisible();
  const citacoes = foco.locator('article.quote');
  expect(await citacoes.count()).toBeGreaterThanOrEqual(3);
  await expect(citacoes.first()).toContainText(/Citação direta|Alusão|Relação de tema/);
  await expect(foco.getByRole('button', { name: 'Is 53.4', exact: true })).toBeVisible();
});

test('conexões: o leitor de tela ouve só uma frase curta a cada troca, e não o painel inteiro', async ({ page }) => {
  await page.goto('/conexoes/ISA/53');
  const foco = page.locator('section.focus');
  await expect(foco).toBeVisible();
  await expect(foco).not.toHaveAttribute('aria-live', /.+/);
  await expect(foco.getByRole('status')).toHaveText('Isaías 53. Ligado a 130 capítulos, em 36 livros.');
  await page.getByRole('button', { name: 'Próximo capítulo' }).click();
  await expect(foco.getByRole('status')).toHaveText(/^Isaías 54\. Ligado a \d+ capítulos, em \d+ livros\.$/);
});

test('conexões: o endereço guarda o capítulo, o livro e o nível, e um endereço inválido volta para a visão geral', async ({ page }) => {
  await page.goto('/conexoes/HEB');
  await expect(page.locator('section.focus').getByRole('heading', { level: 2, name: 'Hebreus' })).toBeVisible();
  await expect(page.getByLabel('Livro', { exact: true })).toHaveValue('HEB');
  await expect(page.getByLabel('Capítulo', { exact: true })).toHaveValue('');
  await expect(page.locator('section.focus .count')).toContainText('(fora do próprio livro)');
  await expect(page.locator('section.focus').getByRole('link', { name: 'Abrir Hebreus' })).toHaveAttribute('href', /\/livro\/HEB$/);

  await page.goto('/conexoes/JHN/3?mostrar=mais');
  await expect(page.locator('section.focus h2')).toHaveText('João 3');
  await expect(page.getByRole('button', { name: /^Mais ligações/ })).toHaveAttribute('aria-pressed', 'true');

  await page.goto('/conexoes/XYZ/9');
  await expect(page.locator('section.start')).toBeVisible();
  await expect(page.locator('section.focus')).toHaveCount(0);
  await page.goto('/conexoes/ISA/99');
  await expect(page.locator('section.start')).toBeVisible();
});

test('conexões: trocar o nível muda o endereço e o desenho, e o nível “Todas” termina de pintar', async ({ page }) => {
  await page.goto('/conexoes');
  await expect.poll(() => painted(page, 'base'), { timeout: 10_000 }).toBeGreaterThan(5000);
  await page.getByRole('button', { name: /^Mais ligações/ }).click();
  await expect(page).toHaveURL(/mostrar=mais/);
  await expect(page.getByRole('button', { name: /^Mais ligações/ })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: /^Todas/ }).click();
  await expect(page).toHaveURL(/mostrar=todas/);
  // 70 mil ligações: o aviso aparece enquanto soma e some quando termina
  await expect(page.locator('app-bible-arcs .busy')).toHaveCount(0, { timeout: 40_000 });
  expect(await painted(page, 'base')).toBeGreaterThan(20_000);
  await page.getByRole('button', { name: /^Mais fortes/ }).click();
  await expect(page).not.toHaveURL(/mostrar=/);
});

test('conexões: “Siga o fio” leva de um capítulo a outro e guarda o caminho; os botões passam de capítulo em capítulo', async ({ page }) => {
  await page.goto('/conexoes/ISA/53');
  const foco = page.locator('section.focus');
  await foco.getByRole('button', { name: /^Ver as ligações de Mateus 27, \d+ referências$/ }).click();
  await expect(page).toHaveURL(/\/conexoes\/MAT\/27$/);
  await expect(foco.getByRole('heading', { level: 2, name: 'Mateus 27' })).toBeVisible();
  const caminho = page.getByRole('navigation', { name: 'Seu caminho' });
  await expect(caminho.getByRole('button')).toHaveText(['Isaías 53', 'Mateus 27']);
  await expect(caminho.getByRole('button', { name: 'Mateus 27' })).toHaveAttribute('aria-current', 'true');
  // voltar pelo caminho
  await caminho.getByRole('button', { name: 'Isaías 53' }).click();
  await expect(page).toHaveURL(/\/conexoes\/ISA\/53$/);
  await expect(page.getByRole('navigation', { name: 'Seu caminho' })).toHaveCount(0);

  // os botões de capítulo
  await page.getByRole('button', { name: 'Próximo capítulo' }).click();
  await expect(page).toHaveURL(/\/conexoes\/ISA\/54$/);
  await page.getByRole('button', { name: 'Capítulo anterior' }).click();
  await page.getByRole('button', { name: 'Capítulo anterior' }).click();
  await expect(page).toHaveURL(/\/conexoes\/ISA\/52$/);
  // nas pontas da Bíblia o botão fica desligado
  await page.goto('/conexoes/GEN/1');
  await expect(page.getByRole('button', { name: 'Capítulo anterior' })).toBeDisabled();
  await page.goto('/conexoes/REV/22');
  await expect(page.getByRole('button', { name: 'Próximo capítulo' })).toBeDisabled();
});

test('conexões: um ponto de partida abre o capítulo e a lista de livros ligados pode ser ampliada', async ({ page }) => {
  await page.goto('/conexoes');
  await page.locator('.start-card', { hasText: 'Salmos 22' }).click();
  await expect(page).toHaveURL(/\/conexoes\/PSA\/22$/);
  const foco = page.locator('section.focus');
  await expect(foco.locator('article.quote').first()).toBeVisible();
  const grupos = foco.locator('.group');
  await expect(grupos).toHaveCount(8);
  await foco.getByRole('button', { name: /^Mostrar os \d+ livros$/ }).click();
  await expect.poll(() => grupos.count()).toBeGreaterThan(8);
  await foco.getByRole('button', { name: 'Mostrar menos livros' }).click();
  await expect(grupos).toHaveCount(8);
});

test('conexões: arrastar pela linha de baixo do desenho escolhe o capítulo, e o endereço acompanha quando o dedo sai', async ({ page }) => {
  await page.goto('/conexoes');
  await expect.poll(() => painted(page, 'base'), { timeout: 10_000 }).toBeGreaterThan(5000);
  // com o cabeçalho da tela, a linha dos livros pode ficar abaixo da dobra: o mouse só acerta o que está à vista
  await page.locator('app-bible-arcs .arcs').scrollIntoViewIfNeeded();
  const caixa = (await page.locator('app-bible-arcs .arcs').boundingBox())!;
  const y = caixa.y + caixa.height * 0.8;
  await page.mouse.move(caixa.x + caixa.width * 0.3, y);
  await page.mouse.down();
  await page.mouse.move(caixa.x + caixa.width * 0.6, y, { steps: 6 });
  // enquanto arrasta, a etiqueta mostra o capítulo e a escolha já muda
  await expect(page.locator('app-bible-arcs .tip')).toBeVisible();
  await expect(page.locator('section.focus h2')).toBeVisible();
  await page.mouse.up();
  await expect(page).toHaveURL(/\/conexoes\/[0-9A-Z]{3}\/\d+$/);
  const titulo = (await page.locator('section.focus h2').textContent())!.trim();
  expect(titulo).toMatch(/^.+ \d+$/);
  await expect(page.getByLabel('Livro', { exact: true })).not.toHaveValue('');
});

test('conexões: compartilhar gera a imagem do capítulo em foco, com o link que abre a tela no mesmo ponto', async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as unknown as { __shared: unknown };
    Object.defineProperty(navigator, 'canShare', { value: () => true, configurable: true });
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async (d: ShareData) => {
        w.__shared = { title: d.title, text: d.text, files: (d.files ?? []).map((f) => f.name) };
      },
    });
  });
  await page.goto('/conexoes/ISA/53');
  await expect.poll(() => painted(page, 'base'), { timeout: 10_000 }).toBeGreaterThan(5000);
  await page.getByRole('button', { name: 'Compartilhar estas conexões' }).click();
  const img = page.locator('app-share-sheet .preview img');
  await expect(img).toBeVisible({ timeout: 15_000 });
  await expect(img).toHaveAttribute('alt', /Isaías 53/);
  expect(await img.evaluate((i: HTMLImageElement) => [i.naturalWidth, i.naturalHeight])).toEqual([1080, 1350]);
  // o painel escuro dos arcos foi desenhado: há pixels rosa (Novo Testamento) e dourados (Antigo) fora do cabeçalho
  const cores = await img.evaluate((i: HTMLImageElement) => {
    const c = document.createElement('canvas');
    c.width = i.naturalWidth;
    c.height = i.naturalHeight;
    const ctx = c.getContext('2d')!;
    ctx.drawImage(i, 0, 0);
    const { data } = ctx.getImageData(0, 430, 1080, 560);
    // as cores dos arcos misturam com o fundo escuro, então a conta usa faixas (rosa e dourado), e não a cor exata
    let rosa = 0;
    let dourado = 0;
    for (let p = 0; p < data.length; p += 4) {
      const [r, g, b] = [data[p], data[p + 1], data[p + 2]];
      if (r >= 220 && g >= 100 && g <= 200 && b >= 140 && b <= 225 && r - g >= 40) rosa++;
      else if (r >= 200 && g >= 170 && b >= 110 && b <= 200 && r - b >= 45) dourado++;
    }
    return { rosa, dourado };
  });
  expect(cores.rosa, 'pixels rosa').toBeGreaterThan(1500);
  expect(cores.dourado, 'pixels dourados').toBeGreaterThan(800);
  await page.getByRole('button', { name: /Stories/ }).click();
  await expect.poll(async () => img.evaluate((i: HTMLImageElement) => i.naturalHeight), { timeout: 15_000 }).toBe(1920);
  await page.getByRole('button', { name: 'Compartilhar imagem' }).click();
  const enviado = await page.evaluate(() => (window as unknown as { __shared: { title: string; text: string; files: string[] } }).__shared);
  expect(enviado.title).toBe('Isaías 53');
  expect(enviado.text).toContain('Ligado a 130 capítulos, em 36 livros');
  expect(enviado.text.endsWith('Explore as conexões da Bíblia: https://sgtcastanheira.github.io/biblia-sagrada/conexoes/ISA/53')).toBe(true);
  expect(enviado.files).toEqual(['biblia-sagrada-conexoes-ISA-53.png']);
});

test('conexões: a visão geral também pode ser compartilhada', async ({ page }) => {
  await page.goto('/conexoes');
  await page.getByRole('button', { name: 'Compartilhar estas conexões' }).click();
  const img = page.locator('app-share-sheet .preview img');
  await expect(img).toBeVisible({ timeout: 15_000 });
  await expect(img).toHaveAttribute('alt', /A Bíblia Conectada/);
  expect(await img.evaluate((i: HTMLImageElement) => [i.naturalWidth, i.naturalHeight])).toEqual([1080, 1350]);
});

test('conexões: entra-se pela estante da biblioteca (Contexto e Cultura) e pelo versículo do leitor', async ({ page }) => {
  await page.goto('/historia');
  await page.getByRole('button', { name: /^Livro: A Bíblia Conectada/ }).click();
  await expect(page).toHaveURL(/\/conexoes$/);
  await expect(page.getByRole('heading', { level: 1, name: 'A Bíblia Conectada' })).toBeVisible();

  await page.goto('/ler/JHN/3');
  await page.locator('#v16 .n').click();
  await page.getByRole('button', { name: /Ver as conexões deste capítulo/ }).click();
  await expect(page).toHaveURL(/\/conexoes\/JHN\/3$/);
  await expect(page.locator('section.focus h2')).toHaveText('João 3');
});

test('conexões: botões e campos com pelo menos 40px, e as fontes e os créditos citam a página original', async ({ page, isMobile }) => {
  await page.goto('/conexoes/ISA/53');
  await expect(page.locator('section.focus')).toBeVisible();
  if (isMobile) {
    const pequenos = await page.locator('main').evaluate((main) => {
      const achados: string[] = [];
      for (const el of main.querySelectorAll<HTMLElement>('button, select, summary, a.read')) {
        const r = el.getBoundingClientRect();
        if (r.width && r.height && Math.min(r.width, r.height) < 39.5) achados.push(`${el.tagName.toLowerCase()} “${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 24)}” ${Math.round(r.width)}×${Math.round(r.height)}`);
      }
      return achados;
    });
    expect(pequenos).toEqual([]);
  }
  // as fontes da tela
  await page.getByText('Fontes das informações').click();
  await expect(page.getByText(/OpenBible\.info\. Cross References/)).toBeVisible();
  await expect(page.getByText(/Chris Harrison e Christoph Römhild\. Bible Cross-References/)).toBeVisible();
  // e a página de créditos
  await page.goto('/creditos');
  await expect(page.getByText('Bible Cross-References, de Chris Harrison e Christoph Römhild (2007)')).toBeVisible();
});

test.describe('com movimento reduzido', () => {
  test.use({ reducedMotion: 'reduce' });
  test('as ligações do capítulo aparecem de uma vez, sem animação', async ({ page }) => {
    await page.goto('/conexoes/ISA/53');
    await expect(page.locator('section.focus')).toBeVisible();
    await expect.poll(() => painted(page, 'top'), { timeout: 3000 }).toBeGreaterThan(3000);
  });
});
