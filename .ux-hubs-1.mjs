// Script temporário de auditoria (apagar depois): captura as telas dos hubs em vários tamanhos.
import { chromium } from 'playwright';
import fs from 'node:fs';

const OUT = '/tmp/claude-1000/-home-valter--rea-de-trabalho-App-da-Biblia/0052e955-7cd7-476e-a26d-52b963f394f2/scratchpad/ux-audit/hubs';
fs.mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { id: 'p360', width: 360, height: 740, mobile: true },
  { id: 'c412', width: 412, height: 915, mobile: true },
  { id: 'n1366', width: 1366, height: 768, mobile: false },
  { id: 'n1440', width: 1440, height: 900, mobile: false },
  { id: 'm1920', width: 1920, height: 1080, mobile: false },
];

const ROUTES = [
  { id: 'inicio', path: '/' },
  { id: 'estudo', path: '/estudo' },
  { id: 'ensino', path: '/ensino' },
  { id: 'meu', path: '/meu-espaco' },
  { id: 'novidades', path: '/novidades' },
  { id: 'ajustes', path: '/ajustes' },
];

const STATES = (process.argv[2] ?? 'novo,usuario').split(',');
const onlyRoutes = process.argv[3] ? process.argv[3].split(',') : null;
const onlyVps = process.argv[4] ? process.argv[4].split(',') : null;

function userState() {
  const today = new Date();
  const key = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  // Trimestre começando no primeiro domingo de outubro de 2026
  const start = new Date(2026, 9, 4);
  const titles = ['A criação', 'A queda', 'Noé e o dilúvio', 'Abraão, o amigo de Deus', 'Isaque, o filho da promessa', '', '', '', '', '', '', '', ''];
  const lessons = Array.from({ length: 13 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i * 7);
    return {
      number: i + 1, date: key(d), title: titles[i] ?? '', goldenText: '', reading: i === 4 ? 'Gênesis 21.1-21' : '',
      daily: Array(6).fill(''), dailyDone: Array(6).fill(false), notes: '', questions: '', plan: '', done: i < 3,
    };
  });
  return {
    'biblia.settings.lastRead': JSON.stringify({ bookId: 'JHN', chapter: 3 }),
    'biblia.settings.readChapters': JSON.stringify({ GEN: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], JHN: [1, 2, 3] }),
    'biblia.ebd.quarter': JSON.stringify({ year: 2026, quarter: 4, className: 'Adultos', theme: 'Os patriarcas', lessons }),
    'biblia.favorites': JSON.stringify([
      { bookId: 'JHN', chapter: 3, verse: 16, versionId: 'almeida', text: 'Porque Deus amou o mundo...', color: 'yellow', savedAt: Date.now() },
      { bookId: 'PSA', chapter: 23, verse: 1, versionId: 'almeida', text: 'O Senhor é o meu pastor...', color: 'green', savedAt: Date.now() },
    ]),
    'biblia.notes.items': JSON.stringify([
      { id: 'n1', date: key(yesterday), type: 'Culto de Domingo', title: 'A fé de Abraão', preacher: 'Pr. João', refs: 'Gn 12.1-3', body: 'Texto', application: '', createdAt: Date.now(), updatedAt: Date.now() },
    ]),
    'biblia.devotional.entries': JSON.stringify({
      [key(yesterday)]: { date: key(yesterday), passage: 'Salmos 23', keyVerse: '', observation: 'x', application: '', prayer: '', gratitude: [], worship: '', done: true, updatedAt: Date.now() },
    }),
  };
}

const b = await chromium.launch({ channel: 'chrome' });
const report = [];

for (const state of STATES) {
  for (const vp of VIEWPORTS) {
    if (onlyVps && !onlyVps.includes(vp.id)) continue;
    const ctx = await b.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.mobile,
      hasTouch: vp.mobile,
      deviceScaleFactor: 1,
      locale: 'pt-BR',
    });
    const page = await ctx.newPage();
    await page.addInitScript((latest) => {
      const d = new Date();
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      localStorage.setItem('biblia.notify.done', JSON.stringify([`curiosidade-${key}`, `devocional-${key}`]));
      localStorage.setItem('biblia.novidades.visto', latest);
    }, 'ad-ministerios-em-cada-estado');
    if (state === 'usuario') {
      await page.addInitScript((entries) => {
        if (sessionStorage.getItem('ux-seeded')) return;
        for (const [k, v] of Object.entries(entries)) localStorage.setItem(k, v);
        sessionStorage.setItem('ux-seeded', '1');
      }, userState());
    }
    for (const r of ROUTES) {
      if (onlyRoutes && !onlyRoutes.includes(r.id)) continue;
      await page.goto('http://localhost:4200' + r.path);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(800);
      const metrics = await page.evaluate(() => {
        const main = document.querySelector('main.content');
        const host = main?.firstElementChild?.nextElementSibling ?? main?.lastElementChild;
        const rect = (el) => {
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
        };
        const ps = [...document.querySelectorAll('main p, main .desc, main blockquote')].map((p) => Math.round(p.getBoundingClientRect().width));
        return {
          scrollH: document.documentElement.scrollHeight,
          innerH: innerHeight,
          innerW: innerWidth,
          hScroll: document.documentElement.scrollWidth > innerWidth,
          main: rect(main),
          host: rect(host),
          h1: rect(document.querySelector('main h1')),
          nav: rect(document.querySelector('nav.nav')),
          top: rect(document.querySelector('header.top-bar')),
          maxPara: Math.max(0, ...ps),
          cards: document.querySelectorAll('main .card, main a.row').length,
          title: document.title,
        };
      });
      const steps = [];
      let y = 0;
      let i = 0;
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
      while (i < 14) {
        const file = `${OUT}/${state}-${r.id}-${vp.id}-${String(i).padStart(2, '0')}.png`;
        await page.screenshot({ path: file });
        steps.push(file);
        const before = await page.evaluate(() => window.scrollY);
        await page.evaluate(() => window.scrollBy(0, Math.round(innerHeight * 0.8)));
        await page.waitForTimeout(600);
        const after = await page.evaluate(() => window.scrollY);
        if (after <= before + 2) break;
        y = after;
        i++;
      }
      report.push({ state, vp: vp.id, route: r.path, steps: steps.length, ...metrics });
      console.log(state, vp.id, r.path, 'passos', steps.length, JSON.stringify(metrics));
    }
    await ctx.close();
  }
}
fs.writeFileSync(`${OUT}/relatorio-${STATES.join('-')}.json`, JSON.stringify(report, null, 1));
await b.close();
