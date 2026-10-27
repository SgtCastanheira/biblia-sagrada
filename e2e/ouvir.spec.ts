import { expect, test } from './base';

/** Um sintetizador de mentira: anota o que seria falado e termina cada fala logo em seguida. */
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const spoken: string[] = [];
    (window as unknown as { spoken: string[] }).spoken = spoken;
    class FakeUtterance {
      lang = ''; voice = null; rate = 1; pitch = 1; onstart: (() => void) | null = null; onend: (() => void) | null = null; onerror: ((e: unknown) => void) | null = null;
      constructor(public text: string) {}
    }
    (window as unknown as { SpeechSynthesisUtterance: unknown }).SpeechSynthesisUtterance = FakeUtterance;
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        getVoices: () => [{ name: 'Voz A', lang: 'pt-BR', voiceURI: 'a' }, { name: 'Voz B', lang: 'pt-BR', voiceURI: 'b' }],
        addEventListener: () => {},
        cancel: () => {},
        speak: (u: FakeUtterance) => { spoken.push(u.text); setTimeout(() => u.onstart?.(), 1); setTimeout(() => u.onend?.(), 5); },
      },
    });
  });
});

test('ouvir um capítulo: anuncia o livro, lê os versículos e marca o que está sendo lido', async ({ page }) => {
  await page.goto('/ler/PSA/117');
  await expect(page.getByText(/Louvai ao Senhor/).first()).toBeVisible();
  await page.getByRole('button', { name: 'Ouvir este capítulo' }).click();
  const player = page.getByRole('region', { name: 'Ouvir' });
  await expect(player).toBeVisible();
  await expect.poll(() => page.evaluate(() => (window as unknown as { spoken: string[] }).spoken.join(' | '))).toContain('Salmos, capítulo 117');
  await expect.poll(() => page.evaluate(() => (window as unknown as { spoken: string[] }).spoken.join(' ')), { timeout: 8000 }).toContain('Louvai');
  // Pausa e continua; fechar para tudo
  await player.getByLabel('Escolher a voz').selectOption('b');
  await expect(player.getByLabel('Escolher a voz')).toHaveValue('b');
  await player.getByRole('button', { name: 'Pausar' }).click();
  await expect(player.getByRole('button', { name: 'Continuar a ouvir' })).toBeVisible();
  await player.getByRole('button', { name: 'Parar e fechar' }).click();
  await expect(player).toHaveCount(0);
});

test('ouvir uma história: lê o título e os parágrafos, com controle de velocidade', async ({ page }) => {
  await page.goto('/artigo/igreja-primitiva');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.getByRole('button', { name: 'Ouvir esta história' }).click();
  const player = page.getByRole('region', { name: 'Ouvir' });
  await expect(player).toBeVisible();
  await player.getByRole('button', { name: '1×' }).click();
  await expect(player.getByRole('button', { name: '1×' })).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => page.evaluate(() => (window as unknown as { spoken: string[] }).spoken.length)).toBeGreaterThan(2);
  await page.getByRole('button', { name: 'Parar de ouvir' }).click();
  await expect(player).toHaveCount(0);
});

test('ouvir sem voz no aparelho: avisa o que fazer em vez de ficar mudo', async ({ page }) => {
  // Um navegador que aceita a fala e nunca começa (como o Brave no Linux)
  await page.addInitScript(() => {
    Object.defineProperty(window, 'speechSynthesis', {
      value: { getVoices: () => [], addEventListener: () => {}, cancel: () => {}, speak: () => {} },
    });
  });
  await page.goto('/artigo/igreja-primitiva');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.getByRole('button', { name: 'Ouvir esta história' }).click();
  await expect(page.getByRole('alert')).toContainText('não tem voz em português', { timeout: 8000 });
  await expect(page.getByRole('button', { name: 'Continuar a ouvir' })).toBeVisible();
});

test('ouvir com a gravação: toca o áudio, destaca o parágrafo certo e mostra a voz neural', async ({ page }) => {
  // Um MP3 mínimo (quadros de silêncio) e um índice que aponta cada trecho da tela
  const frame = Buffer.concat([Buffer.from([0xff, 0xfb, 0x90, 0x04]), Buffer.alloc(413)]);
  const mp3 = Buffer.concat(Array.from({ length: 400 }, () => frame));
  await page.route('**/audio/artigos/igreja-primitiva.mp3', (route) => route.fulfill({ body: mp3, contentType: 'audio/mpeg', headers: { 'accept-ranges': 'bytes' } }));
  await page.route('**/audio/index.json', async (route) => {
    // Os trechos da página, como o app os vê, viram o índice da gravação
    const texts: string[] = await page.evaluate(() => {
      const body = document.querySelector('app-rich-text')!;
      const wanted = [...body.querySelectorAll<HTMLElement>('h2, h3, p, blockquote, ul:not(.people) > li, ol:not(.timeline) > li')].filter((el) => !el.closest('.people, .read, .sources, .toc, .timeline, .chain, .facts, app-send-chain'));
      return wanted.filter((el) => !wanted.some((o) => o !== el && el.contains(o))).map((el) => (el.textContent ?? '').replace(/\s+/g, ' ').trim()).filter(Boolean);
    });
    const { textKey } = await import('../src/app/core/audio-text');
    const title = await page.getByRole('heading', { level: 1 }).innerText();
    const items = [{ t: 0, k: textKey(`${title}.`) }, ...texts.map((text, i) => ({ t: (i + 1) * 0.5, k: textKey(text) }))];
    await route.fulfill({ json: { voice: 'pt-BR-FranciscaNeural', files: { 'artigos/igreja-primitiva': { source: 'x', seconds: 20, items } } } });
  });
  await page.goto('/artigo/igreja-primitiva');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.getByRole('button', { name: 'Ouvir esta história' }).click();
  const player = page.getByRole('region', { name: 'Ouvir' });
  await expect(player).toContainText('Voz gravada: Francisca (voz neural)');
  // Não usou a voz do aparelho
  expect(await page.evaluate(() => (window as unknown as { spoken: string[] }).spoken.length)).toBe(0);
  await expect(player.getByRole('button', { name: 'Pausar' })).toBeVisible();
  await page.getByRole('button', { name: 'Parar de ouvir' }).click();
  await expect(player).toHaveCount(0);
});
