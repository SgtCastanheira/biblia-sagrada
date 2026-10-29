import { AD_STATES } from '../src/app/core/ad-states';
import { CURIOSITIES } from '../src/app/core/curiosities';
import { EPOCHS } from '../src/app/core/epochs';
import { ARTICLES, CLASSIC_SERMONS } from '../src/app/core/library';
import { BIBLE_MAPS, findMap } from '../src/app/core/maps';
import { TRIBES } from '../src/app/core/tribes';
import { expect, expectNoHorizontalOverflow, test } from './base';

/**
 * Varredura: abre TODA tela gerada a partir dos dados (estudos, estados, mapas, sermões, tribos, curiosidades)
 * e confere, em cada uma, o que um leitor perceberia de imediato: nenhum erro no console nem requisição
 * falha (o fixture de base.ts já cuida disso), nenhuma rolagem lateral, texto com pelo menos 13px,
 * tela não vazia e fotos carregando. Assim, uma página nova com problema aparece no teste.
 */

const rotas: string[] = [
  ...ARTICLES.map((a) => `/artigo/${a.id}`),
  ...AD_STATES.map((s) => `/assembleia-de-deus/${s.id}`),
  ...[...BIBLE_MAPS, findMap('assembleia-de-deus-estados')!].map((m) => `/mapas/${m.id}`),
  ...CLASSIC_SERMONS.map((s) => `/avivamento/${s.id}`),
  ...TRIBES.map((t) => `/tribos/${t.id}`),
  ...CURIOSITIES.map((c) => `/curiosidades/${c.id}`),
  ...EPOCHS.map((e) => `/epocas/${e.id}`),
  '/assembleia-de-deus', '/assembleia-de-deus/linha-do-tempo', '/epocas', '/historia', '/historia?colecao=avivamentos', '/historia?colecao=biblia', '/mapas', '/estudo', '/avivamento',
];

for (const rota of rotas) {
  test(`varredura ${rota}`, async ({ page }) => {
    await page.goto(rota);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('main')).not.toBeEmpty();
    await expectNoHorizontalOverflow(page);

    // Fotos: força o carregamento (são preguiçosas) e confere que todas apareceram
    const quebradas = await page.evaluate(async () => {
      const imgs = [...document.querySelectorAll('img')] as HTMLImageElement[];
      imgs.forEach((img) => (img.loading = 'eager'));
      await Promise.all(imgs.map((img) => (img.complete ? Promise.resolve() : new Promise((ok) => { img.onload = img.onerror = ok; }))));
      return imgs.filter((img) => img.naturalWidth === 0).map((img) => img.getAttribute('src') ?? '?');
    });
    expect(quebradas, 'fotos que não carregaram').toEqual([]);

    // Texto pequeno demais (mesma regra de acessibilidade.spec.ts)
    const pequenos = await page.evaluate(() => {
      const achados: string[] = [];
      for (const el of document.querySelectorAll('body *')) {
        if (el.closest('svg, sup, .n, .watermark')) continue;
        const temTexto = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim());
        if (!temTexto || !(el as HTMLElement).offsetParent) continue;
        const size = parseFloat(getComputedStyle(el).fontSize);
        if (size < 12.9) achados.push(`${el.tagName.toLowerCase()} "${el.textContent!.trim().slice(0, 30)}" (${size}px)`);
      }
      return achados;
    });
    expect(pequenos, `Textos menores que 13px:\n${pequenos.join('\n')}`).toEqual([]);
  });
}
