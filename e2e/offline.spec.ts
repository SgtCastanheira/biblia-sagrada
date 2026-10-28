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

test('o service worker é o sw.js: o do Angular e, junto, os lembretes com o app fechado', async ({ page }) => {
  await page.goto('/');
  const worker = await page.evaluate(async () => (await navigator.serviceWorker.ready).active?.scriptURL ?? '');
  expect(new URL(worker).pathname).toBe('/sw.js');
  // A agenda que o app guarda para o service worker fica no cache dos lembretes, e o sw.js sabe lê-la
  const script = await (await page.request.get('/sw.js')).text();
  expect(script).toContain("importScripts('ngsw-worker.js')");
  expect(script).toContain('periodicsync');
  expect(script).toContain('biblia-lembretes');
});

test('com a notificação ligada, o app deixa a agenda dos lembretes dos próximos dias para o service worker', async ({ page, context }) => {
  await context.grantPermissions(['notifications']);
  await page.addInitScript(() => {
    localStorage.setItem('biblia.lembretes', 'true');
    localStorage.setItem('biblia.notify.systemEnabled', 'true');
  });
  await page.goto('/');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  const agenda = async () => page.evaluate(async () => {
    const response = await (await caches.open('biblia-lembretes')).match(new URL('lembretes/agenda.json', document.baseURI).href);
    return response ? ((await response.json()) as { id: string; at: number; url: string }[]) : [];
  });
  await expect.poll(async () => (await agenda()).length).toBe(12);
  const items = await agenda();
  // Endereços relativos ao app (no site, dentro de /biblia-sagrada/) e em ordem de horário
  expect(items.every((r) => !r.url.startsWith('/'))).toBe(true);
  expect(items.map((r) => r.at)).toEqual([...items.map((r) => r.at)].sort((a, b) => a - b));
});

test('com o app fechado, o service worker mostra o lembrete da vez quando o sistema o acorda', async ({ page, context, problems }) => {
  // about:blank faz o papel do app fechado; lá os scripts dos testes não têm sessionStorage nem localStorage
  problems.allow(/'(session|local)Storage' property/);
  await context.grantPermissions(['notifications']);
  await page.addInitScript(() => {
    // Notificação ligada, como para quem ativou; os avisos de hoje já foram vistos (a página não notifica nada)
    const d = new Date();
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    localStorage.setItem('biblia.lembretes', 'true');
    localStorage.setItem('biblia.notify.systemEnabled', 'true');
    localStorage.setItem('biblia.notify.done', JSON.stringify([`curiosidade-${key}`, `devocional-${key}`, ...[0, 1, 2].map((n) => `lembrete-${key}-${n}`)]));
  });
  await page.goto('/');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.waitForTimeout(1500);
  // Agenda com um lembrete que venceu há um minuto e ainda não apareceu
  const origin = await page.evaluate(async () => {
    const cache = await caches.open('biblia-lembretes');
    await cache.put(new URL('lembretes/agenda.json', document.baseURI).href, new Response(JSON.stringify([
      { id: 'teste-2', at: Date.now() - 60_000, title: 'E se Jesus voltar hoje, você sobe?', body: 'Teste', url: 'devocional/hoje' },
    ])));
    await cache.delete(new URL('lembretes/mostrados.json', document.baseURI).href);
    return location.origin;
  });
  const cdp = await context.newCDPSession(page);
  const registration = new Promise<string>((resolve) => {
    cdp.on('ServiceWorker.workerRegistrationUpdated', ({ registrations }) => {
      const r = registrations.find((x: { scopeURL: string; isDeleted: boolean }) => x.scopeURL.startsWith(origin) && !x.isDeleted);
      if (r) resolve(r.registrationId);
    });
  });
  await cdp.send('ServiceWorker.enable');
  const registrationId = await registration;
  // "Fecha" o app: nenhuma janela do site aberta quando o sistema acorda o service worker
  await page.goto('about:blank');
  await cdp.send('ServiceWorker.dispatchPeriodicSyncEvent', { origin, registrationId, tag: 'lembretes' });
  await page.goto('/');
  await expect
    .poll(() => page.evaluate(async () => (await (await navigator.serviceWorker.ready).getNotifications({ tag: 'lembrete' })).map((n) => n.title)))
    .toContain('E se Jesus voltar hoje, você sobe?');
  // E não repete: ficou anotado como mostrado
  await expect
    .poll(() => page.evaluate(async () => {
      const r = await (await caches.open('biblia-lembretes')).match(new URL('lembretes/mostrados.json', document.baseURI).href);
      return r ? ((await r.json()) as string[]) : [];
    }))
    .toContain('teste-2');
});
