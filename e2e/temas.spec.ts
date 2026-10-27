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
    for (const tela of ['/', '/ler/JHN/3', '/historia', '/estudo', '/livros', '/ajustes']) {
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
  await page.getByRole('button', { name: 'Aparência da leitura' }).click();
  const grupo = page.getByRole('group', { name: 'Paleta de cores' });
  await grupo.getByRole('button', { name: /Noite quente/ }).click();
  await expect(page.locator('body')).toHaveClass(/theme-ember/);
  await grupo.getByRole('button', { name: /Névoa/ }).click();
  await expect(page.locator('body')).toHaveClass(/theme-mist/);
  await expect(page.locator('.warmth')).toHaveCount(0);

  const slider = page.getByRole('slider', { name: /Luz quente/ });
  await slider.focus();
  for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowRight');
  await expect(page.locator('.warmth')).toBeAttached();
  await expect(page.locator('.warmth')).toHaveCSS('pointer-events', 'none');

  await page.reload();
  await expect(page.locator('body')).toHaveClass(/theme-mist/);
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
