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
