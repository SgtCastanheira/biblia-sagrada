import { Page } from '@playwright/test';
import { expect, test } from './base';

/**
 * Espera o service worker terminar a instalação: todos os arquivos dos grupos “prefetch”
 * do ngsw.json guardados no aparelho e a página já controlada por ele.
 */
async function waitUntilInstalled(page: Page) {
  await expect
    .poll(
      () =>
        page.evaluate(async () => {
          if (!navigator.serviceWorker.controller) return false;
          const manifest = await (await fetch('/ngsw.json', { cache: 'no-store' })).json();
          const wanted: string[] = manifest.assetGroups
            .filter((g: { installMode: string }) => g.installMode === 'prefetch')
            .flatMap((g: { urls: string[] }) => g.urls);
          const cached = new Set<string>();
          for (const name of await caches.keys()) {
            for (const r of await (await caches.open(name)).keys()) cached.add(new URL(r.url).pathname);
          }
          return wanted.every((u) => cached.has(u));
        }),
      { timeout: 110_000, intervals: [1000] },
    )
    .toBe(true);
}

/** Só roda com PROD=1 (build de produção com service worker). */
test('capítulo já lido abre sem internet', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await page.goto('/ler/JHN/3');
  await expect(page.locator('.line').first()).toBeVisible();

  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('.line').first()).toBeVisible();
  await expect(page.getByText('Você está offline')).toBeVisible();
  await context.setOffline(false);
});

test('a Bíblia inteira funciona sem internet, inclusive capítulos nunca abertos e a busca', async ({ page, context }) => {
  test.setTimeout(150_000);
  await page.goto('/');
  await waitUntilInstalled(page);

  await context.setOffline(true);
  await page.goto('/ler/REV/22');
  await expect(page.locator('.line').first()).toContainText('rio da água da vida');

  await page.goto('/busca');
  await page.getByRole('searchbox', { name: 'Buscar na Bíblia' }).fill('"o Senhor é o meu pastor"');
  await expect(page.locator('.hit').first()).toContainText('Salmos 23:1');
  await context.setOffline(false);
});

test('o conteúdo de estudo funciona sem internet', async ({ page, context }) => {
  test.setTimeout(150_000);
  await page.goto('/');
  await waitUntilInstalled(page);

  await context.setOffline(true);
  await page.goto('/avivamento/moody-novo-nascimento');
  await expect(page.getByText('Olhe, e viva', { exact: false }).first()).toBeVisible();
  await page.goto('/ler/EPH/2');
  await expect(page.locator('.word').first()).toBeVisible();
  await context.setOffline(false);
});
