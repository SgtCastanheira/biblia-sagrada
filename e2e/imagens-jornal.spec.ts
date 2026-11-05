import { expect, test } from './base';

/**
 * Fotos como num jornal: no computador a foto fica à esquerda e o texto começa ao lado dela e corre em volta; no celular
 * ela fica entre os parágrafos. A foto sempre vem antes do parágrafo de que fala (veja logica/imagens-no-texto.spec.ts).
 */
const PAGINAS = [
  ['uma história com fotos', '/artigo/avivamento-da-coreia', 'Kil Sun-ju'],
  ['uma história com quadro', '/artigo/coliseu-de-roma', 'Arco de Tito'],
  ['um estudo que não é história', '/artigo/natal-e-os-calendarios', 'Cronógrafo'],
] as const;

for (const [nome, url, alt] of PAGINAS) {
  test(`jornal: ${nome} tem a foto à esquerda com o texto ao lado, no computador`, async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 820 });
    await page.goto(url);
    const foto = page.locator(`figure.photo:has(img[alt*="${alt}"])`).first();
    await foto.scrollIntoViewIfNeeded();
    const medidas = await foto.evaluate((fig) => {
      const proximo = fig.nextElementSibling as HTMLElement;
      // o primeiro texto de verdade (numa lista, as caixas dos itens começam na margem e enganariam a medida)
      const caminho = document.createTreeWalker(proximo, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT) });
      const r = document.createRange();
      r.selectNodeContents(caminho.nextNode()!);
      const texto = r.getClientRects()[0];
      const caixa = fig.getBoundingClientRect();
      return { float: getComputedStyle(fig).float, direitaDaFoto: caixa.right, esquerdaDoTexto: texto.left, topoDaFoto: caixa.top, topoDoTexto: texto.top, tag: proximo.tagName };
    });
    expect(medidas.float).toBe('left');
    expect(['P', 'UL', 'OL']).toContain(medidas.tag);
    // o texto começa ao lado da foto, e não embaixo dela
    expect(medidas.esquerdaDoTexto).toBeGreaterThanOrEqual(medidas.direitaDaFoto);
    expect(Math.abs(medidas.topoDoTexto - medidas.topoDaFoto)).toBeLessThan(40);
  });
}

test('jornal: no celular a foto fica entre os parágrafos, sem encolher o texto', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/artigo/avivamento-da-coreia');
  const foto = page.locator('figure.photo:has(img[alt*="Kil Sun-ju"])').first();
  await foto.scrollIntoViewIfNeeded();
  expect(await foto.evaluate((f) => getComputedStyle(f).float)).toBe('none');
  const largura = await foto.evaluate((f) => f.nextElementSibling!.getBoundingClientRect().width);
  expect(largura).toBeGreaterThan(300);
});
