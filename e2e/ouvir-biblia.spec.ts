import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Page } from '@playwright/test';
import { textKey } from '../src/app/core/audio-text';
import { chapterIntro } from '../src/app/core/bible-audio';
import { expect, test } from './base';

/** Um sintetizador de mentira (como em ouvir.spec.ts): anota o que seria falado e termina cada fala logo em seguida. */
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
        getVoices: () => [{ name: 'Voz A', lang: 'pt-BR', voiceURI: 'a' }],
        addEventListener: () => {},
        cancel: () => {},
        speak: (u: FakeUtterance) => { spoken.push(u.text); setTimeout(() => u.onstart?.(), 1); setTimeout(() => u.onend?.(), 5); },
      },
    });
  });
});

const spokenText = (page: Page) => page.evaluate(() => (window as unknown as { spoken: string[] }).spoken.join(' | '));

/** Os versículos do capítulo, como o leitor os mostra (Almeida embutida). */
const verses = (chapter: number): string[] => {
  const book: [number, string][][] = JSON.parse(readFileSync(resolve('public/bible/almeida/PSA.json'), 'utf8'));
  return book[chapter - 1].map(([, text]) => text).filter((text) => text.trim());
};

/** Um MP3 mínimo de ~5,2 s (200 quadros de silêncio). */
const frame = Buffer.concat([Buffer.from([0xff, 0xfb, 0x90, 0x04]), Buffer.alloc(413)]);
const mp3 = Buffer.concat(Array.from({ length: 200 }, () => frame));

/**
 * Finge o armazém das gravações: a lista de capítulos gravados, os tempos de cada um (casando com o texto de verdade
 * dos Salmos) e o MP3. `hits` conta quantas vezes cada arquivo foi pedido. `starts117` são os tempos do Salmo 117.
 */
async function stubAudio(page: Page, covered: [number, number][], options: { wrongVerse?: number; starts117?: number[] } = {}) {
  const hits = { json: [] as number[], mp3: [] as number[] };
  await page.route('**/audio/biblia/almeida/cobertura.json', (route) => route.fulfill({ json: { voice: 'Leonardo', books: covered.length ? { PSA: covered } : {} } }));
  await page.route(/\/audio\/biblia\/almeida\/PSA-(\d+)\.json$/, (route) => {
    const chapter = Number(/PSA-(\d+)\.json/.exec(route.request().url())![1]);
    hits.json.push(chapter);
    const texts = [chapterIntro('Salmos', chapter), ...verses(chapter)];
    const items = texts.map((text, i) => ({ t: chapter === 117 && options.starts117 ? options.starts117[i] : i * 0.1, k: textKey(i === options.wrongVerse ? `${text} (texto de outra edição)` : text) }));
    return route.fulfill({ json: { source: 'x', voice: 'Leonardo', seconds: 5, items } });
  });
  await page.route(/\/audio\/biblia\/almeida\/PSA-(\d+)\.mp3$/, (route) => {
    hits.mp3.push(Number(/PSA-(\d+)\.mp3/.exec(route.request().url())![1]));
    return route.fulfill({ body: mp3, contentType: 'audio/mpeg', headers: { 'accept-ranges': 'bytes' } });
  });
  return hits;
}

test('ouvir a Bíblia com a gravação: destaca o versículo, passa sozinha ao capítulo seguinte e, sem gravação, usa a voz do aparelho', async ({ page }) => {
  // Salmos 117 e 118 gravados; o 119 não
  const hits = await stubAudio(page, [[117, 118]], { starts117: [0, 1, 2.5] });
  await page.goto('/ler/PSA/117');
  await expect(page.locator('#v1')).toBeVisible();
  await page.getByRole('button', { name: 'Ouvir este capítulo' }).click();
  const player = page.getByRole('region', { name: 'Ouvir' });
  await expect(player).toContainText('Voz gravada: Leonardo (voz neural)');
  // Não usou a voz do aparelho, e o versículo lido fica marcado na tela, na hora que a gravação diz
  expect(await spokenText(page)).toBe('');
  await expect(page.locator('#v1')).toHaveClass(/speaking/);
  await expect(page.locator('#v2')).toHaveClass(/speaking/);
  // Acabou o Salmo 117: segue sozinha para o 118, que também tem gravação
  await expect(page).toHaveURL(/\/ler\/PSA\/118/, { timeout: 12_000 });
  await expect(player).toContainText('Voz gravada: Leonardo (voz neural)');
  expect(await spokenText(page)).toBe('');
  // O capítulo seguinte foi baixado antes (um pedido só, não dois) e os tempos vieram junto
  expect(hits.mp3.filter((n) => n === 118)).toHaveLength(1);
  expect(hits.json.filter((n) => n === 118)).toHaveLength(1);
  // Acabou o 118: o 119 não tem gravação, então a voz do aparelho assume e anuncia o capítulo
  await expect(page).toHaveURL(/\/ler\/PSA\/119/, { timeout: 12_000 });
  await expect.poll(() => spokenText(page), { timeout: 10_000 }).toContain('Salmos, capítulo 119');
  expect(hits.mp3).not.toContain(119);
  await expect(player).not.toContainText('Voz gravada');
  await player.getByRole('button', { name: 'Parar e fechar' }).click();
  await expect(player).toHaveCount(0);
});

test('ouvir a Bíblia: se o texto da tela não é o que foi gravado, lê com a voz do aparelho (a voz nunca diz outra coisa)', async ({ page }) => {
  // O versículo 1 foi gravado com outra redação (por exemplo, o texto foi corrigido depois)
  const hits = await stubAudio(page, [[117, 117]], { wrongVerse: 1 });
  await page.goto('/ler/PSA/117');
  await expect(page.locator('#v1')).toBeVisible();
  await page.getByRole('button', { name: 'Ouvir este capítulo' }).click();
  await expect.poll(() => spokenText(page)).toContain('Salmos, capítulo 117');
  await expect.poll(() => spokenText(page), { timeout: 8000 }).toContain('Louvai');
  await expect(page.getByRole('region', { name: 'Ouvir' })).not.toContainText('Voz gravada');
  expect(hits.mp3).toEqual([]);
  await page.getByRole('region', { name: 'Ouvir' }).getByRole('button', { name: 'Parar e fechar' }).click();
});

test('ouvir a Bíblia: capítulo fora da lista de gravados nem pede o arquivo de áudio', async ({ page }) => {
  const hits = await stubAudio(page, []);
  await page.goto('/ler/PSA/117');
  await expect(page.locator('#v1')).toBeVisible();
  await page.getByRole('button', { name: 'Ouvir este capítulo' }).click();
  await expect.poll(() => spokenText(page)).toContain('Salmos, capítulo 117');
  expect(hits.json).toEqual([]);
  expect(hits.mp3).toEqual([]);
  await page.getByRole('region', { name: 'Ouvir' }).getByRole('button', { name: 'Parar e fechar' }).click();
});
