import { chromium } from 'playwright';
import fs from 'node:fs';

const OUT = '/tmp/claude-1000/-home-valter--rea-de-trabalho-App-da-Biblia/0052e955-7cd7-476e-a26d-52b963f394f2/scratchpad/ux-audit/detalhes';
fs.mkdirSync(OUT + '/raw', { recursive: true });

const ROUTES = [
  ['cativeiros', '/artigo/cativeiros-de-israel', true],
  ['avivamentos', '/artigo/avivamentos-desde-atos', true],
  ['reforma', '/artigo/reforma-protestante', true],
  ['edwards', '/avivamento/edwards-pecadores', true],
  ['setenta', '/profecias/setenta-semanas', true],
  ['davi', '/memorial/davi', true],
  ['graca', '/dicionario/graca', false],
  ['juda', '/tribos/juda', true],
  ['harpa328', '/harpa/328', false],
  ['jerico', '/curiosidades/voltas-em-jerico', false],
  ['exodo', '/mapas/exodo', true],
];

const VIEWPORTS = [
  ['m360', { width: 360, height: 740 }, true],
  ['m412', { width: 412, height: 915 }, true],
  ['n1366', { width: 1366, height: 768 }, false],
  ['d1920', { width: 1920, height: 1080 }, false],
  ['l1440', { width: 1440, height: 900 }, false],
];

const only = process.argv[2]; // filtro opcional por chave de rota
const onlyVp = process.argv[3];

const b = await chromium.launch({ channel: 'chrome' });
const metrics = {};
for (const [key, url, long] of ROUTES) {
  if (only && only !== 'all' && !only.split(',').includes(key)) continue;
  for (const [vk, size, mobile] of VIEWPORTS) {
    if (onlyVp && !onlyVp.split(',').includes(vk)) continue;
    if (vk === 'l1440' && !long) continue;
    const ctx = await b.newContext({ viewport: size, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.addInitScript((latest) => {
      const d = new Date();
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      localStorage.setItem('biblia.notify.done', JSON.stringify([`curiosidade-${k}`, `devocional-${k}`]));
      localStorage.setItem('biblia.novidades.visto', latest);
    }, 'ad-ministerios-em-cada-estado');
    await page.goto('http://localhost:4200' + url);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1200);

    const m = await page.evaluate(() => {
      const main = document.querySelector('main.content');
      const host = main?.querySelector(':scope > :not(router-outlet)');
      const r = (el) => { if (!el) return null; const x = el.getBoundingClientRect(); return { top: Math.round(x.top + scrollY), left: Math.round(x.left), width: Math.round(x.width), height: Math.round(x.height) }; };
      const col = host?.querySelector(':scope > .article') ?? host;
      const outline = [];
      const walk = (parent, depth) => {
        for (const el of parent.children) {
          const box = r(el);
          if (!box || box.height === 0) continue;
          const tag = el.tagName.toLowerCase();
          const cls = (el.getAttribute('class') ?? '').replace(/ng-\S+/g, '').trim();
          const text = (el.innerText ?? '').replace(/\s+/g, ' ').trim().slice(0, 70);
          outline.push({ depth, tag, cls, top: box.top, h: box.height, text });
          if (depth < 1 && (tag === 'app-rich-text' || el.classList.contains('article') || tag === 'article')) walk(el, depth + 1);
        }
      };
      if (col) walk(col, 0);
      const nav = document.querySelector('nav.nav');
      return {
        scrollHeight: document.documentElement.scrollHeight,
        innerHeight,
        innerWidth,
        hScroll: document.documentElement.scrollWidth > innerWidth,
        main: r(main),
        host: r(host),
        col: r(col),
        nav: r(nav),
        outline,
      };
    });
    m.screens = +(m.scrollHeight / m.innerHeight).toFixed(1);
    metrics[`${key}.${vk}`] = m;

    // capturas da janela visível, rolando em passos
    const step = Math.round(size.height * 0.85);
    let y = 0, i = 0;
    while (true) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(350);
      await page.screenshot({ path: `${OUT}/raw/${key}.${vk}.${String(i).padStart(2, '0')}.png` });
      i++;
      const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
      if (y >= max) break;
      y = Math.min(y + step, max);
      if (i > 60) break;
    }
    metrics[`${key}.${vk}`].shots = i;
    console.log(key, vk, 'altura', m.scrollHeight, 'telas', m.screens, 'capturas', i, 'col', JSON.stringify(m.col), 'hscroll', m.hScroll);
    await ctx.close();
  }
}
await b.close();
const file = `${OUT}/metrics${only ? '-' + only.replace(/,/g, '_') : ''}${onlyVp ? '-' + onlyVp.replace(/,/g, '_') : ''}.json`;
fs.writeFileSync(file, JSON.stringify(metrics, null, 1));
console.log('ok', file);
