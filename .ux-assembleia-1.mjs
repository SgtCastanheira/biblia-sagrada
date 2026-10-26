// Script temporário da auditoria de UX (área: assembleia). Apagar depois de rodar.
import { chromium } from 'playwright';
import fs from 'node:fs';

const OUT = '/tmp/claude-1000/-home-valter--rea-de-trabalho-App-da-Biblia/0052e955-7cd7-476e-a26d-52b963f394f2/scratchpad/ux-audit/assembleia';
const BASE = 'http://localhost:4200';

const ROUTES = [
  '/assembleia-de-deus',
  '/assembleia-de-deus/ce',
  '/assembleia-de-deus/sp',
  '/assembleia-de-deus/rj',
  '/artigo/assembleia-de-deus-no-brasil',
  '/artigo/madureira-e-a-separacao',
  '/artigo/daniel-berg-e-gunnar-vingren',
  '/artigo/frida-vingren',
  '/artigo/panorama-da-igreja',
  '/artigo/escola-dominical',
  '/mapas/assembleia-de-deus-no-brasil',
  '/mapas/assembleia-de-deus-estados',
];

const VIEWPORTS = [
  { key: 'm360', width: 360, height: 740, mobile: true },
  { key: 'm412', width: 412, height: 915, mobile: true },
  { key: 'n1366', width: 1366, height: 768, mobile: false },
  { key: 'l1440', width: 1440, height: 900, mobile: false },
  { key: 'd1920', width: 1920, height: 1080, mobile: false },
];

const slug = (r) => r.replace(/^\//, '').replace(/\//g, '_') || 'home';
const only = process.argv[2] ? process.argv[2].split(',') : null;

const b = await chromium.launch({ channel: 'chrome' });
const metrics = {};
for (const vp of VIEWPORTS) {
  const ctx = await b.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
    deviceScaleFactor: 1,
  });
  await ctx.addInitScript((latest) => {
    const d = new Date();
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    localStorage.setItem('biblia.notify.done', JSON.stringify([`curiosidade-${key}`, `devocional-${key}`]));
    localStorage.setItem('biblia.novidades.visto', latest);
  }, 'ad-ministerios-em-cada-estado');
  const page = await ctx.newPage();
  for (const route of ROUTES) {
    if (only && !only.includes(slug(route))) continue;
    await page.goto(BASE + route);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);
    const m = await page.evaluate(() => {
      const doc = document.documentElement;
      const pick = (sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { y: Math.round(r.top + scrollY), h: Math.round(r.height), x: Math.round(r.left), w: Math.round(r.width) };
      };
      // largura do texto e caracteres por linha (média) nos parágrafos do texto
      const ps = [...document.querySelectorAll('app-rich-text > p')].slice(0, 6);
      const cpl = ps.map((p) => {
        const cs = getComputedStyle(p);
        const lh = parseFloat(cs.lineHeight);
        const lines = Math.max(1, Math.round(p.getBoundingClientRect().height / lh));
        return { w: Math.round(p.getBoundingClientRect().width), lines, chars: p.textContent.length, cpl: Math.round(p.textContent.length / lines) };
      });
      const h2s = [...document.querySelectorAll('app-rich-text h2')].map((h) => ({ t: h.textContent.trim(), y: Math.round(h.getBoundingClientRect().top + scrollY) }));
      return {
        scrollHeight: doc.scrollHeight,
        clientWidth: doc.clientWidth,
        hScroll: doc.scrollWidth > doc.clientWidth,
        main: pick('main.content'),
        article: pick('.article'),
        hero: pick('.hero'),
        route: pick('.route'),
        mapCard: pick('a.card.map'),
        toc: pick('.toc'),
        rich: pick('app-rich-text'),
        ministries: pick('.ministries'),
        sources: pick('.sources'),
        appSources: pick('app-sources'),
        neighbours: pick('.neighbours'),
        mapFrame: pick('.map-frame'),
        steps: pick('.steps'),
        actions: pick('.actions'),
        studyCard: pick('a.card.study'),
        regions: [...document.querySelectorAll('h2.section-title')].map((h) => ({ t: h.textContent.trim(), y: Math.round(h.getBoundingClientRect().top + scrollY) })),
        h2s,
        cpl,
      };
    });
    metrics[`${slug(route)}@${vp.key}`] = m;

    // capturas da janela em passos (as animações ao rolar exigem rolar de verdade)
    const bars = vp.mobile ? 60 + 72 : 60;
    const step = vp.height - bars - 40;
    let y = 0;
    let n = 0;
    const max = m.scrollHeight;
    while (true) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(350);
      const file = `${OUT}/${slug(route)}__${vp.key}__${String(n).padStart(2, '0')}.png`;
      await page.screenshot({ path: file });
      n++;
      if (y + vp.height >= max || n > 80) break;
      y += step;
    }
    metrics[`${slug(route)}@${vp.key}`].shots = n;
    console.log(route, vp.key, 'height', m.scrollHeight, 'shots', n, 'hScroll', m.hScroll);
  }
  await ctx.close();
}
await b.close();
const mfile = `${OUT}/metrics${only ? '-' + only.join('_') : ''}.json`;
fs.writeFileSync(mfile, JSON.stringify(metrics, null, 1));
console.log('ok', mfile);
