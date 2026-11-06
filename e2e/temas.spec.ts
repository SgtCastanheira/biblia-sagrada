import { expect, test } from './base';

const NOVOS = ['ember', 'forest', 'mist'] as const;

/** Mede o contraste real do texto na tela (cor do texto contra o fundo que o cerca), ignorando painéis com cor própria. */
async function textosFracos(page: import('@playwright/test').Page): Promise<string[]> {
  return page.evaluate(() => {
    // O Chrome devolve misturas de cor (color-mix) como "color(srgb 0.6 0.5 0.4)", com valores de 0 a 1
    const parse = (c: string) => {
      const n = (c.match(/[\d.]+/g) ?? []).map(Number);
      return c.startsWith('color(') ? [n[0] * 255, n[1] * 255, n[2] * 255, n[3] ?? 1] : n;
    };
    const lum = ([r, g, b]: number[]) => {
      const f = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const fundoDe = (el: Element): number[] | null => {
      for (let e: Element | null = el; e; e = e.parentElement) {
        const cs = getComputedStyle(e);
        if (cs.backgroundImage !== 'none') return null; // degradê ou foto: não dá para medir
        const [r, g, b, a = 1] = parse(cs.backgroundColor);
        if (a > 0.95) return [r, g, b];
      }
      return null;
    };
    const fracos: string[] = [];
    for (const el of document.querySelectorAll('body *')) {
      if (el.closest('svg, .hero, .cover, .scene, .warmth, .cdk-overlay-container, mat-icon, [aria-hidden="true"]')) continue;
      if (!(el as HTMLElement).offsetParent) continue;
      if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim())) continue;
      const cs = getComputedStyle(el);
      if (parseFloat(cs.opacity) < 1) continue;
      const bg = fundoDe(el);
      if (!bg) continue;
      const [r, g, b, a = 1] = parse(cs.color);
      if (a < 0.95) continue;
      const [hi, lo] = [lum([r, g, b]), lum(bg)].sort((x, y) => y - x);
      const ratio = (hi + 0.05) / (lo + 0.05);
      if (ratio < 4.5) fracos.push(`${el.tagName.toLowerCase()}.${(el.className?.toString() ?? '').split(' ')[0]} "${el.textContent!.trim().slice(0, 28)}" ${ratio.toFixed(2)}`);
    }
    return fracos;
  });
}

for (const tema of NOVOS) {
  test(`tema ${tema}: o texto de várias telas passa de 4,5:1 de verdade`, async ({ page }) => {
    await page.addInitScript((t) => localStorage.setItem('biblia.settings.theme', JSON.stringify(t)), tema);
    const todos: string[] = [];
    for (const tela of ['/', '/ler/JHN/3', '/historia', '/estudo', '/livros', '/ajustes', '/epocas', '/epocas/pentecostes', '/vozes', '/vozes/a-sanguessuga', '/revisao/8f11d02bac34306e']) {
      await page.goto(tela);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('body')).toHaveClass(new RegExp(`theme-${tema}`));
      todos.push(...(await textosFracos(page)).map((f) => `${tela}: ${f}`));
    }
    expect(todos, `No tema ${tema}:\n${todos.join('\n')}`).toEqual([]);
  });
}

// O jornal das Novas Vozes e a prévia do autor também nos temas de sempre
for (const tema of ['dark', 'sepia'] as const) {
  test(`tema ${tema}: o jornal das Novas Vozes passa de 4,5:1 de verdade`, async ({ page }) => {
    await page.addInitScript((t) => localStorage.setItem('biblia.settings.theme', JSON.stringify(t)), tema);
    const todos: string[] = [];
    for (const tela of ['/vozes', '/vozes/a-sanguessuga', '/revisao/8f11d02bac34306e']) {
      await page.goto(tela);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('body')).toHaveClass(new RegExp(`theme-${tema}`));
      todos.push(...(await textosFracos(page)).map((f) => `${tela}: ${f}`));
    }
    expect(todos, `No tema ${tema}:\n${todos.join('\n')}`).toEqual([]);
  });
}

test('cores: escolher a paleta e a luz quente na Aparência da leitura, e lembrar na próxima vez', async ({ page }) => {
  await page.goto('/ler/JHN/3');
  await page.getByRole('button', { name: 'Escolher cor do app' }).click();
  await expect(page.getByRole('menu')).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const colorMenu = page.getByRole('menu');
  const swatches = colorMenu.getByRole('menuitemradio');
  await expect(swatches).toHaveCount(5);
  await expect(colorMenu.getByText('Noite')).toHaveCount(0);
  await expect(colorMenu.getByText('Noite quente')).toHaveCount(0);
  const swatchPositions = await swatches.evaluateAll((items) => items.map((item) => item.getBoundingClientRect().y));
  expect(new Set(swatchPositions).size).toBe(1);
  const selectedSwatch = colorMenu.getByRole('menuitemradio', { name: 'Cor: Claro' }).locator('.theme-swatch');
  await expect(selectedSwatch).toHaveCSS('outline-style', 'none');
  await expect(selectedSwatch).toHaveCSS('box-shadow', 'none');
  const selectedColorButton = colorMenu.getByRole('menuitemradio', { name: 'Cor: Claro' });
  await selectedColorButton.hover();
  await expect(selectedColorButton).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await colorMenu.getByRole('menuitemradio', { name: 'Cor: Floresta' }).click();
  await expect(page.locator('body')).toHaveClass(/theme-forest/);
  await expect(page.getByRole('menu')).toHaveCount(0);
  await page.getByRole('button', { name: 'Escolher cor do app' }).click();
  await page.getByRole('menuitemradio', { name: 'Cor: Sépia' }).click();
  await expect(page.locator('body')).toHaveClass(/theme-sepia/);
  await expect(page.locator('.warmth')).toHaveCount(0);

  await page.getByRole('button', { name: 'Escolher cor do app' }).click();
  await page.getByRole('menuitem', { name: 'Mais opções de leitura' }).click();
  const slider = page.getByRole('slider', { name: /Luz quente/ });
  await slider.focus();
  for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowRight');
  await expect(page.locator('.warmth')).toBeAttached();
  await expect(page.locator('.warmth')).toHaveCSS('pointer-events', 'none');

  await page.reload();
  await expect(page.locator('body')).toHaveClass(/theme-sepia/);
  await expect(page.locator('.warmth')).toBeAttached();
});

test('cores: o modo automático segue o claro e o escuro do aparelho', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.addInitScript(() => localStorage.setItem('biblia.settings.theme', JSON.stringify('auto')));
  await page.goto('/');
  await expect(page.locator('body')).toHaveClass(/theme-dark/);
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('body')).toHaveClass(/theme-light/);
});

test('Ajustes destaca Aparência e permite escolher cor, tamanho e luz quente', async ({ page }) => {
  await page.goto('/ajustes');
  const aparencia = page.locator('section.appearance');
  await expect(aparencia.getByRole('heading', { name: 'Aparência' })).toBeVisible();
  await expect(aparencia.getByRole('group', { name: 'Paleta de cores' })).toBeVisible();

  const group = aparencia.getByRole('group', { name: 'Paleta de cores' });
  await group.getByRole('button', { name: /Floresta/ }).click();
  await expect(page.locator('body')).toHaveClass(/theme-forest/);

  const fontSize = aparencia.getByRole('slider', { name: 'Tamanho do texto' });
  await fontSize.focus();
  await page.keyboard.press('ArrowRight');
  await expect(aparencia.getByText(/Tamanho do texto/)).toContainText('20px');

  const warmth = aparencia.getByRole('slider', { name: /Luz quente/ });
  await warmth.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.warmth')).toBeAttached();
});
