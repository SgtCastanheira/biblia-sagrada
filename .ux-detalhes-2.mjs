import { chromium } from 'playwright';
import fs from 'node:fs';

const OUT = '/tmp/claude-1000/-home-valter--rea-de-trabalho-App-da-Biblia/0052e955-7cd7-476e-a26d-52b963f394f2/scratchpad/ux-audit/detalhes';
const ROUTES = [
  ['cativeiros', '/artigo/cativeiros-de-israel'],
  ['avivamentos', '/artigo/avivamentos-desde-atos'],
  ['reforma', '/artigo/reforma-protestante'],
  ['edwards', '/avivamento/edwards-pecadores'],
  ['setenta', '/profecias/setenta-semanas'],
  ['davi', '/memorial/davi'],
  ['graca', '/dicionario/graca'],
  ['juda', '/tribos/juda'],
  ['harpa328', '/harpa/328'],
  ['jerico', '/curiosidades/voltas-em-jerico'],
  ['exodo', '/mapas/exodo'],
];
const init = (latest) => {
  const d = new Date();
  const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  localStorage.setItem('biblia.notify.done', JSON.stringify([`curiosidade-${k}`, `devocional-${k}`]));
  localStorage.setItem('biblia.novidades.visto', latest);
};

const b = await chromium.launch({ channel: 'chrome' });
const report = {};

// 1) Celular 360: alvos de toque pequenos, pontuação órfã, barras fixas
for (const [key, url] of ROUTES) {
  const ctx = await b.newContext({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.addInitScript(init, 'ad-ministerios-em-cada-estado');
  await page.goto('http://localhost:4200' + url);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  report[key] = await page.evaluate(() => {
    const main = document.querySelector('main.content');
    const small = [];
    for (const el of main.querySelectorAll('button, a')) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      // links e referências dentro de parágrafos ganham área extra no toque (ignorados aqui)
      const inText = el.closest('p, li, dd, td, blockquote, figcaption, .text, .step-text, .read-desc') && !el.matches('.inline-ref, .refs button, .mini-refs button, .inf-ref');
      if (inText) continue;
      const m = Math.min(r.width, r.height);
      if (m < 40) small.push(`${el.tagName.toLowerCase()}.${(el.className || '').toString().replace(/mat-\S+|mdc-\S+|ng-\S+|cdk-\S+/g, '').trim().replace(/\s+/g, '.')} "${(el.innerText || el.getAttribute('aria-label') || '').trim().slice(0, 30)}" ${Math.round(r.width)}x${Math.round(r.height)}`);
    }
    // pontuação que cai sozinha na linha seguinte depois de uma referência
    let orphans = 0, refsFollowed = 0;
    const examples = [];
    for (const btn of main.querySelectorAll('app-rich-text button.ref')) {
      const next = btn.nextSibling;
      if (!next || next.nodeType !== 3 || !/^[.,;:)!?]/.test(next.textContent)) continue;
      refsFollowed++;
      const range = document.createRange();
      range.setStart(next, 0); range.setEnd(next, 1);
      const pr = range.getBoundingClientRect();
      const br = btn.getBoundingClientRect();
      if (pr.top > br.top + br.height / 2) { orphans++; if (examples.length < 3) examples.push(btn.innerText + ' ' + next.textContent.slice(0, 2)); }
    }
    const top = document.querySelector('.top-bar')?.getBoundingClientRect().height;
    const nav = document.querySelector('nav.nav')?.getBoundingClientRect().height;
    return { small: small.slice(0, 25), smallCount: small.length, refsFollowed, orphans, examples, topBar: top, bottomNav: nav };
  });
  // a barra de baixo some ao rolar nas páginas de leitura longa?
  await page.mouse.wheel(0, 0);
  await page.evaluate(() => window.scrollTo(0, 2000));
  await page.waitForTimeout(400);
  await page.evaluate(() => window.scrollBy(0, 600));
  await page.waitForTimeout(600);
  report[key].navHiddenAfterScroll = await page.evaluate(() => document.querySelector('nav.nav').classList.contains('hidden'));
  await ctx.close();
}

// 2) Índice no celular: salto para um capítulo e o que aparece no topo
{
  const ctx = await b.newContext({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.addInitScript(init, 'ad-ministerios-em-cada-estado');
  await page.goto('http://localhost:4200/artigo/avivamentos-desde-atos');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
  await page.locator('summary.toc-title').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/raw/toc-aberto.m360.png` });
  await page.locator('.toc nav button').nth(9).click();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${OUT}/raw/toc-salto.m360.png` });
  report.tocJump = await page.evaluate(() => {
    const h = document.getElementById('secao-10');
    const label = h?.previousElementSibling;
    return { scrollY, h2Top: Math.round(h.getBoundingClientRect().top), labelTop: label ? Math.round(label.getBoundingClientRect().top) : null, labelText: label?.textContent, topBar: document.querySelector('.top-bar').getBoundingClientRect().bottom, tocStillVisible: document.querySelector('.toc').getBoundingClientRect().bottom > 0 };
  });
  await ctx.close();
}

// 3) Computador: espaço livre dos lados da coluna de leitura
for (const size of [{ width: 1366, height: 768 }, { width: 1440, height: 900 }, { width: 1920, height: 1080 }]) {
  const ctx = await b.newContext({ viewport: size, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.addInitScript(init, 'ad-ministerios-em-cada-estado');
  await page.goto('http://localhost:4200/artigo/avivamentos-desde-atos');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
  report[`livre.${size.width}`] = await page.evaluate(() => {
    const col = document.querySelector('.article').getBoundingClientRect();
    const rail = document.querySelector('nav.nav').getBoundingClientRect();
    const toc = document.querySelector('.toc').getBoundingClientRect();
    const firstP = document.querySelector('app-rich-text p').getBoundingClientRect();
    return { colLeft: Math.round(col.left), colWidth: Math.round(col.width), freeLeft: Math.round(col.left - rail.right), freeRight: Math.round(innerWidth - col.right), tocHeight: Math.round(toc.height), firstParagraphTop: Math.round(firstP.top + scrollY), viewport: innerHeight };
  });
  await ctx.close();
}

await b.close();
fs.writeFileSync(`${OUT}/metrics-2.json`, JSON.stringify(report, null, 1));
console.log(JSON.stringify(report, null, 1));
