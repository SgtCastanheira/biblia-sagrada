import { expect, test } from './base';

// Volume 4 · A Paixão, da Ceia à Ressurreição (veja logica/paixao.spec.ts para o texto, as citações e as imagens)
const LIVROS = [
  'paixao-quem-mandava', 'paixao-santa-ceia', 'paixao-getsemani', 'paixao-prisao-e-interrogatorio',
  'paixao-acoite-e-condenacao', 'paixao-crucificacao', 'paixao-sepultamento-e-ressurreicao',
];

test('a biblioteca mostra a trilha “Como a Ciência Explica” só com o Volume 4 e os sete livros', async ({ page }) => {
  await page.goto('/historia');
  await page.waitForLoadState('networkidle');
  await expect(page.getByText('Volume 4 · A Paixão, da Ceia à Ressurreição').first()).toBeVisible();
  await expect(page.getByText(/Volume [123] ·/)).toHaveCount(0);
  const texto = await page.locator('body').innerText();
  for (const titulo of ['Quem Mandava e Onde Mandava', 'Santa Ceia', 'Getsêmani', 'Prisão e Interrogatório', 'Açoite e Condenação', 'Crucificação', 'Sepultamento e Ressurreição']) {
    expect(texto, titulo).toContain(titulo);
  }
  for (const escondido of ['Água em Vinho', 'Machado que Flutuou', 'Cego de Nascença']) expect(texto, escondido).not.toContain(escondido);
});

for (const id of LIVROS) {
  test(`/artigo/${id}: abre sem rolar para os lados e as figuras respeitam letra de 13px e alvos de 40px`, async ({ page, isMobile }) => {
    test.setTimeout(120_000);
    await page.goto(`/artigo/${id}`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const faixas = page.locator('app-compact-figure');
    const total = await faixas.count();
    const problemas: string[] = [];
    for (let i = 0; i < total; i++) {
      const faixa = faixas.nth(i);
      await faixa.scrollIntoViewIfNeeded();
      await faixa.locator('button').first().click();
      await page.waitForTimeout(1200);
      const achados = await faixa.evaluate((host, celular) => {
        const pequenos: string[] = [];
        const alvos: string[] = [];
        for (const el of host.querySelectorAll('*')) {
          if (el.closest('svg, sup, .n')) continue;
          const html = el as HTMLElement;
          if (!html.offsetParent && getComputedStyle(html).position !== 'fixed') continue;
          const temTexto = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim());
          if (temTexto) {
            const size = parseFloat(getComputedStyle(el).fontSize);
            if (size < 12.9) pequenos.push(`${el.tagName.toLowerCase()} “${el.textContent!.trim().slice(0, 24)}” (${size}px)`);
          }
          if (celular && el.matches('button, input[type=range], [role=button], summary')) {
            const r = el.getBoundingClientRect();
            if (r.width && r.height && Math.min(r.width, r.height) < 39.5) alvos.push(`${el.tagName.toLowerCase()} “${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 20)}” (${Math.round(r.width)}×${Math.round(r.height)})`);
          }
        }
        return { pequenos, alvos, larguraDoBloco: host.scrollWidth > host.clientWidth + 2 };
      }, isMobile);
      const nome = ((await faixa.innerText()) || '').split('\n').filter(Boolean).slice(-1)[0];
      if (achados.pequenos.length) problemas.push(`figura “${nome}”: letras menores que 13px: ${[...new Set(achados.pequenos)].slice(0, 6).join('; ')}`);
      if (achados.alvos.length) problemas.push(`figura “${nome}”: alvos de toque menores que 40px: ${[...new Set(achados.alvos)].slice(0, 6).join('; ')}`);
      if (achados.larguraDoBloco) problemas.push(`figura “${nome}”: transborda na largura`);
    }
    expect(problemas, problemas.join('\n')).toEqual([]);
    const largura = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
    expect(largura[0], 'a página não pode rolar para os lados').toBeLessThanOrEqual(largura[1] + 1);
  });
}
