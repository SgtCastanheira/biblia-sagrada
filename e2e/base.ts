import { expect, Page, test as base } from '@playwright/test';

/** Problemas detectados automaticamente durante cada teste. */
export interface Problems {
  errors: string[];
  allow: (pattern: RegExp) => void;
}

/** Texto bíblico falso e estável para os testes (não depende da internet nem do limite da API). */
function fakeChapter(url: string) {
  const [, version, book, chapter] = url.match(/\/data\/([^/]+)\/([^/]+)\/(\d+)/) ?? [];
  const verses = Array.from({ length: 12 }, (_, i) => ({
    book_id: book,
    chapter: Number(chapter),
    verse: i + 1,
    text: `Texto de teste ${book} ${chapter}:${i + 1} (${version}) com algumas palavras para ocupar a linha.`,
  }));
  return { translation: { identifier: version }, verses };
}

type Fixtures = { problems: Problems; realApi: boolean };

export const test = base.extend<Fixtures>({
  // Use test.use({ realApi: true }) para testar contra a bible-api.com de verdade
  realApi: [false, { option: true }],

  problems: [
    async ({ page, realApi }, use, testInfo) => {
      const errors: string[] = [];
      const allowed: RegExp[] = [];
      const origin = new URL(testInfo.project.use.baseURL ?? 'http://localhost:4200').origin;

      page.on('pageerror', (e) => errors.push(`Erro de JavaScript: ${e.message}`));
      page.on('console', (m) => {
        // "Failed to load resource" não diz o endereço: as falhas de rede são registradas abaixo, com a URL
        if (m.type() === 'error' && !m.text().startsWith('Failed to load resource')) {
          errors.push(`Console: ${m.text().slice(0, 300)}`);
        }
      });
      page.on('response', (r) => {
        const url = r.url();
        if (r.status() >= 400 && (url.startsWith(origin) || url.includes('bible-api.com'))) {
          errors.push(`HTTP ${r.status()} em ${url.replace(origin, '')}`);
        }
      });
      page.on('requestfailed', (r) => {
        const url = r.url();
        errors.push(`Falha de rede em ${url.replace(origin, '')}: ${r.failure()?.errorText}`);
      });

      if (!realApi) {
        await page.route('https://bible-api.com/**', (route) =>
          route.fulfill({
            status: 200,
            headers: { 'access-control-allow-origin': '*' },
            contentType: 'application/json',
            body: JSON.stringify(fakeChapter(route.request().url())),
          }),
        );
      }

      // Estado limpo + sem avisos automáticos (curiosidade/devocional/EBD) cobrindo a tela
      await page.addInitScript(() => {
        if (sessionStorage.getItem('e2e-init')) return;
        sessionStorage.setItem('e2e-init', '1');
        Object.keys(localStorage).filter((k) => k.startsWith('biblia.')).forEach((k) => localStorage.removeItem(k));
        const d = new Date();
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        localStorage.setItem('biblia.notify.done', JSON.stringify([`curiosidade-${key}`, `devocional-${key}`]));
      });

      await use({ errors, allow: (pattern) => allowed.push(pattern) });

      const real = errors.filter((e) => !allowed.some((p) => p.test(e)));
      expect(real, `Problemas encontrados durante o teste:\n${real.join('\n')}`).toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

/** Verifica que a página não rola para os lados (layout quebrado no celular). */
export async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, 'A página tem rolagem horizontal').toBeLessThanOrEqual(0);
}

/** Toca num item da barra de navegação principal. */
export async function goToTab(page: Page, label: string) {
  await page.getByRole('navigation', { name: 'Navegação principal' }).getByText(label, { exact: true }).click();
}
