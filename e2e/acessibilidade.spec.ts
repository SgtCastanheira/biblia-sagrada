import { expect, test } from './base';

const telas = ['/', '/devocional', '/ebd', '/anotacoes', '/ajustes', '/ler/JHN/3', '/mapas/exodo',
  '/estudo', '/memorial?grupo=reis-israel', '/memorial/elias', '/artigo/cativeiros-de-israel', '/avivamento/edwards-pecadores', '/dicionario', '/dicionario/aba', '/livro/ROM',
  '/atlas', '/genealogia', '/profecias/milenio', '/artigo/profecias-de-daniel', '/dicionario/salvar'];

for (const tela of telas) {
  test(`${tela}: textos com pelo menos 13px`, async ({ page }) => {
    await page.goto(tela);
    await page.waitForLoadState('networkidle');
    const pequenos = await page.evaluate(() => {
      const achados: string[] = [];
      for (const el of document.querySelectorAll('body *')) {
        if (el.closest('svg, sup, .n')) continue; // mapas escalam; números de versículo são sobrescritos
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

test('contraste das cores de destaque (mínimo 4,5:1)', async ({ page }) => {
  await page.goto('/');
  const ratio = await page.evaluate(() => {
    const css = getComputedStyle(document.documentElement);
    const hex = (v: string) => v.trim().match(/\w\w/g)!.map((x) => parseInt(x, 16) / 255);
    const lum = (h: string) => {
      const [r, g, b] = hex(h).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const contrast = (a: string, b: string) => {
      const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
      return (x + 0.05) / (y + 0.05);
    };
    return {
      dourado: contrast(css.getPropertyValue('--accent-gold'), '#faf8f5'),
      placeholder: contrast(css.getPropertyValue('--placeholder'), '#ffffff'),
    };
  });
  expect(ratio.dourado).toBeGreaterThanOrEqual(4.5);
  expect(ratio.placeholder).toBeGreaterThanOrEqual(4.5);
});

test('botões principais têm área de toque de pelo menos 40px', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Área de toque importa no celular');
  await page.goto('/ler/JHN/3');
  for (const nome of ['Trocar versão', 'Aparência da leitura', 'Buscar na Bíblia']) {
    const alvo = page.getByRole('button', { name: nome }).or(page.getByRole('link', { name: nome })).first();
    await expect(alvo).toBeVisible();
    await page.waitForLoadState('networkidle');
    const box = (await alvo.boundingBox())!;
    expect(Math.min(box.width, box.height), `${nome} pequeno demais`).toBeGreaterThanOrEqual(40);
  }
});

test('todos os ícones aparecem como ícone (e não como texto)', async ({ page }) => {
  // Percorre muitas telas: precisa de mais tempo do que o padrão
  test.setTimeout(150_000);
  for (const tela of ['/', '/ler/JHN/3', '/devocional', '/ebd', '/anotacoes', '/sermoes', '/mapas', '/ajustes',
    '/estudo', '/memorial', '/historia', '/avivamento', '/dicionario', '/atlas', '/genealogia', '/tribos', '/ensino', '/meu-espaco', '/fontes', '/novidades', '/ibuc', '/ebd/apoio', '/ebd/apoio/aula/modelo-neemias-reconstroi-os-muros', '/ibuc/juniores', '/ibuc/aula/modelo-davi-e-golias', '/tribos/manasses', '/profecias', '/mapas/vida-de-jesus']) {
    await page.goto(tela);
    await page.waitForLoadState('networkidle');
    await page.evaluate(async () => {
      await document.fonts.load('24px "Material Symbols Outlined"', 'home');
      await document.fonts.ready;
    });
    const quebrados = await page.evaluate(() =>
      [...document.querySelectorAll('mat-icon')]
        .filter((el) => (el as HTMLElement).offsetParent)
        .filter((el) => {
          // Mede o desenho do texto (não a caixa): com a fonte de ícones, a palavra vira um único símbolo
          const range = document.createRange();
          range.selectNodeContents(el);
          return range.getBoundingClientRect().width > parseFloat(getComputedStyle(el).fontSize) * 1.6;
        })
        .map((el) => el.textContent!.trim()),
    );
    expect(quebrados, `Ícones sem desenho em ${tela} (rode tools/baixar-fontes.py): ${quebrados.join(', ')}`).toEqual([]);
  }
});
