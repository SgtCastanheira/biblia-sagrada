import { MT_BRANCHES } from '../src/app/core/mt-church-map';
import { expect, expectNoHorizontalOverflow, test } from './base';

/**
 * O mapa mental da página de Mato Grosso: abre o ramo, abre a cidade, mostra a história com crédito nas fotos,
 * respeita o tamanho mínimo de texto e de toque e não cria rolagem lateral.
 */

const branch = MT_BRANCHES.find((b) => b.places.some((p) => p.id === 'sinop'))!;
const sinop = branch.places.find((p) => p.id === 'sinop')!;

test('mapa mental de MT: o ramo abre as cidades, a cidade abre a história e dá para fechar', async ({ page }) => {
  await page.goto('/assembleia-de-deus/mt');
  const map = page.getByRole('region', { name: /Mapa Mental/i }).or(page.locator('section.map'));
  await expect(map.getByRole('heading', { name: 'Mapa Mental: Cidade por Cidade' })).toBeVisible();
  // De início só o estado e os ramos
  await expect(map.locator('.place')).toHaveCount(0);
  await map.getByRole('button', { name: new RegExp(branch.name) }).click();
  await expect(map.locator('.place')).toHaveCount(branch.places.length);
  await map.getByRole('button', { name: new RegExp(`^.*${sinop.name}`) }).first().click();
  const story = map.locator('article.story');
  await expect(story.getByRole('heading', { name: sinop.name })).toBeVisible();
  await expect(story.getByText('O lugar')).toBeVisible();
  await expect(story.getByText('O que ficou para a cidade')).toBeVisible();
  await expect(story.getByText('Falta confirmar')).toBeVisible();
  await story.getByRole('button', { name: 'Fechar a história' }).click();
  await expect(story).toHaveCount(0);
});

test('mapa mental de MT: ?cidade= abre direto a história da cidade', async ({ page }) => {
  await page.goto('/assembleia-de-deus/mt?cidade=sinop');
  await expect(page.locator('article.story').getByRole('heading', { name: 'Sinop' })).toBeVisible();
});

test('mapa mental de MT: foto com legenda e crédito, e a bandeira amplia em tela cheia', async ({ page }) => {
  await page.goto('/assembleia-de-deus/mt?cidade=sinop');
  const story = page.locator('article.story');
  const figure = story.locator('figure.shot').first();
  if (await figure.count()) {
    await expect(figure.locator('figcaption .cred')).not.toBeEmpty();
    await expect(figure.locator('img')).toHaveJSProperty('complete', true);
  }
  await story.locator('.flagbtn').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Fechar a imagem' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('mapa mental de MT: toda cidade abre sem erro, com imagens que carregam', async ({ page }) => {
  test.setTimeout(120_000);
  for (const b of MT_BRANCHES) {
    for (const p of b.places) {
      await page.goto(`/assembleia-de-deus/mt?cidade=${p.id}`);
      const story = page.locator('article.story');
      await expect(story.getByRole('heading', { name: p.name, exact: true }), p.id).toBeVisible();
      const quebradas = await page.evaluate(async () => {
        const imgs = [...document.querySelectorAll('article.story img')] as HTMLImageElement[];
        imgs.forEach((i) => (i.loading = 'eager'));
        await Promise.all(imgs.map((i) => (i.complete ? Promise.resolve() : new Promise((ok) => { i.onload = i.onerror = ok; }))));
        return imgs.filter((i) => i.naturalWidth === 0).map((i) => i.getAttribute('src'));
      });
      expect(quebradas, `${p.id}: imagens quebradas`).toEqual([]);
    }
  }
});

test('mapa mental de MT: texto com 13px ou mais, alvos de toque de 40px ou mais e sem rolagem lateral', async ({ page }) => {
  await page.goto('/assembleia-de-deus/mt?cidade=sinop');
  await page.locator('article.story').waitFor();
  await expectNoHorizontalOverflow(page);
  const achados = await page.evaluate(() => {
    const out: string[] = [];
    const raiz = document.querySelector('section.map')!;
    for (const el of raiz.querySelectorAll('*')) {
      if (el.closest('svg, mat-icon, app-photo-viewer')) continue;
      const cs = getComputedStyle(el);
      const temTexto = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim());
      if (temTexto && (el as HTMLElement).offsetParent && parseFloat(cs.fontSize) < 12.9) out.push(`texto pequeno: ${el.tagName} “${el.textContent!.trim().slice(0, 24)}” (${cs.fontSize})`);
    }
    for (const b of raiz.querySelectorAll('button')) {
      const r = b.getBoundingClientRect();
      if (r.width && (r.height < 39.5 || r.width < 39.5)) out.push(`alvo pequeno: “${(b.getAttribute('aria-label') || b.textContent || '').trim().slice(0, 30)}” (${Math.round(r.width)}×${Math.round(r.height)})`);
    }
    return out;
  });
  expect(achados).toEqual([]);
});
