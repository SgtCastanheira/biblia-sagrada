// Script temporário da auditoria de UX (área Ensino). Apagar depois de usar.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT = '/tmp/claude-1000/-home-valter--rea-de-trabalho-App-da-Biblia/0052e955-7cd7-476e-a26d-52b963f394f2/scratchpad/ux-audit/ensino';
const SEED = '/tmp/claude-1000/-home-valter--rea-de-trabalho-App-da-Biblia/0052e955-7cd7-476e-a26d-52b963f394f2/scratchpad/seed.json';
const BASE = 'http://localhost:4200';

const state = process.argv[2] ?? 'vazio';
const vpFilter = process.argv[3] ? process.argv[3].split(',') : null;
const routeFilter = process.argv[4] ? process.argv[4].split(',') : null;

const VIEWPORTS = [
  { name: 'm360', width: 360, height: 740, mobile: true },
  { name: 'm412', width: 412, height: 915, mobile: true },
  { name: 'n1366', width: 1366, height: 768 },
  { name: 'd1440', width: 1440, height: 900 },
  { name: 'd1920', width: 1920, height: 1080 },
];

const ROUTES = [
  '/ensino', '/ebd', '/ebd/apoio', '/ebd/apoio/jovens', '/ebd/apoio/aula/modelo-neemias-reconstroi-os-muros',
  '/ibuc', '/ibuc/juniores', '/ibuc/aula/modelo-davi-e-golias', '/sermoes', '/anotacoes', '/favoritos',
  '/devocional', '/devocional/hoje', '/meu-espaco', '/ebd/licao/5',
];

const seed = state === 'cheio' ? JSON.parse(fs.readFileSync(SEED, 'utf8')) : null;
const slug = (r) => r.replace(/^\//, '').replace(/\//g, '_') || 'inicio';

const browser = await chromium.launch({ channel: 'chrome' });
const metrics = [];

for (const vp of VIEWPORTS.filter((v) => !vpFilter || vpFilter.includes(v.name))) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: !!vp.mobile,
    hasTouch: !!vp.mobile,
    deviceScaleFactor: 1,
    locale: 'pt-BR',
  });
  await context.addInitScript(([latest, seedData]) => {
    const d = new Date();
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    localStorage.setItem('biblia.notify.done', JSON.stringify([`curiosidade-${key}`, `devocional-${key}`, `ebd-2026-11-01-6`]));
    localStorage.setItem('biblia.novidades.visto', latest);
    if (seedData && !sessionStorage.getItem('seeded')) {
      for (const [k, v] of Object.entries(seedData)) localStorage.setItem(k, JSON.stringify(v));
      sessionStorage.setItem('seeded', '1');
    }
  }, ['ad-ministerios-em-cada-estado', seed]);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));

  for (const route of ROUTES.filter((r) => !routeFilter || routeFilter.includes(r))) {
    // sessionStorage é por aba: recria a semente a cada rota para começar do mesmo estado
    await page.evaluate(() => sessionStorage.removeItem('seeded')).catch(() => {});
    await page.goto(BASE + route);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);

    const m = await page.evaluate(() => {
      const main = document.querySelector('main.content');
      const host = main?.querySelector(':scope > :not(router-outlet)');
      const r = (el) => (el ? (({ left, top, width, height }) => ({ left: Math.round(left), top: Math.round(top), width: Math.round(width), height: Math.round(height) }))(el.getBoundingClientRect()) : null);
      // Bloco de texto mais largo (aproxima o comprimento da linha)
      let widest = null;
      for (const el of document.querySelectorAll('main p, main li, main .desc, main app-rich-text p')) {
        const b = el.getBoundingClientRect();
        if (!b.width || (el.textContent ?? '').trim().length < 60) continue;
        const fs = parseFloat(getComputedStyle(el).fontSize);
        if (!widest || b.width > widest.width) widest = { width: Math.round(b.width), fontSize: fs, cpl: Math.round(b.width / (fs * 0.5)), text: (el.textContent ?? '').trim().slice(0, 50) };
      }
      return {
        scrollHeight: document.documentElement.scrollHeight,
        innerHeight: innerHeight,
        innerWidth: innerWidth,
        hScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        main: r(main),
        host: r(host),
        hostTag: host?.tagName.toLowerCase(),
        widest,
        h1: document.querySelector('main h1')?.textContent?.trim() ?? document.querySelector('main textarea')?.value ?? null,
        title: document.title,
      };
    });
    const narrow = vp.width < 840;
    const step = vp.height - (narrow ? 150 : 80);
    const steps = Math.min(30, Math.max(1, Math.ceil((m.scrollHeight - vp.height) / step) + 1));
    const dir = path.join(OUT, state, slug(route));
    fs.mkdirSync(dir, { recursive: true });
    for (let i = 0; i < steps; i++) {
      await page.evaluate((y) => window.scrollTo(0, y), i * step);
      await page.waitForTimeout(350);
      await page.screenshot({ path: path.join(dir, `${vp.name}-${String(i).padStart(2, '0')}.png`) });
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    metrics.push({ state, vp: vp.name, route, steps, screens: +(m.scrollHeight / vp.height).toFixed(1), ...m });
    console.log(state, vp.name, route, 'h=', m.scrollHeight, 'telas=', (m.scrollHeight / vp.height).toFixed(1), 'host=', JSON.stringify(m.host), 'hscroll=', m.hScroll);
  }
  if (errors.length) console.log('ERROS', vp.name, errors.slice(0, 3));
  await context.close();
}
await browser.close();
fs.writeFileSync(path.join(OUT, `metricas-${state}${vpFilter ? '-' + vpFilter.join('_') : ''}.json`), JSON.stringify(metrics, null, 1));
