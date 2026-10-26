// Script temporário de auditoria (apagar depois): testa a navegação entre abas e hubs.
import { chromium } from 'playwright';

const OUT = '/tmp/claude-1000/-home-valter--rea-de-trabalho-App-da-Biblia/0052e955-7cd7-476e-a26d-52b963f394f2/scratchpad/ux-audit/hubs';
const b = await chromium.launch({ channel: 'chrome' });

async function newPage(vp) {
  const ctx = await b.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.mobile, hasTouch: vp.mobile, locale: 'pt-BR' });
  const page = await ctx.newPage();
  await page.addInitScript((latest) => {
    const d = new Date();
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    localStorage.setItem('biblia.notify.done', JSON.stringify([`curiosidade-${key}`, `devocional-${key}`]));
    localStorage.setItem('biblia.novidades.visto', latest);
  }, 'ad-ministerios-em-cada-estado');
  return { ctx, page };
}

const activeTab = (page) => page.evaluate(() => document.querySelector('nav.nav .nav-item.active .label')?.textContent?.trim() ?? '(nenhuma)');
const settle = async (page) => { await page.waitForLoadState('networkidle'); await page.waitForTimeout(700); };

const { ctx, page } = await newPage({ width: 360, height: 740, mobile: true });

// 1) Rolar o hub Estudo, entrar num item e voltar: a posição é mantida?
await page.goto('http://localhost:4200/estudo');
await settle(page);
await page.evaluate(() => document.getElementById('historia')?.scrollIntoView());
await page.waitForTimeout(500);
const yBefore = await page.evaluate(() => scrollY);
await page.click('a[href="/harpa"]');
await settle(page);
console.log('harpa: aba ativa =', await activeTab(page), '| tem voltar =', await page.locator('app-back').count());
await page.goBack();
await settle(page);
const yAfter = await page.evaluate(() => scrollY);
console.log('estudo: scroll antes =', yBefore, '| depois de voltar =', yAfter);
await page.screenshot({ path: `${OUT}/nav-estudo-depois-de-voltar-p360.png` });

// 2) Tocar de novo na aba ativa com o hub rolado
await page.evaluate(() => window.scrollTo(0, 2500));
await page.waitForTimeout(400);
await page.click('nav.nav a.nav-item:has-text("Estudo")');
await page.waitForTimeout(800);
console.log('estudo: depois de tocar na aba ativa, scrollY =', await page.evaluate(() => scrollY));

// 3) O índice (chips) continua visível quando a página rola?
await page.evaluate(() => window.scrollTo(0, 1800));
await page.waitForTimeout(400);
const tocVisible = await page.evaluate(() => { const r = document.querySelector('nav.toc')?.getBoundingClientRect(); return r ? r.bottom > 60 && r.top < innerHeight : false; });
console.log('estudo: índice visível depois de rolar =', tocVisible);

// 4) Itens que trocam de aba
const checks = [
  ['/meu-espaco', 'a[href="/livros"]', 'Meu espaço → Minha leitura'],
  ['/ensino', 'header.top-bar a[href="/curiosidades"]', 'Ensino → sino'],
  ['/estudo', 'header.top-bar a[href="/ajustes"]', 'Estudo → engrenagem'],
  ['/', 'a.whats-new', 'Início → O que há de novo'],
  ['/', 'header.top-bar a.brand', 'Início → marca "Bíblia"'],
];
for (const [from, sel, label] of checks) {
  await page.goto('http://localhost:4200' + from);
  await settle(page);
  const before = await activeTab(page);
  await page.click(sel);
  await settle(page);
  console.log(`${label}: aba antes = ${before} | depois = ${await activeTab(page)} | url = ${new URL(page.url()).pathname} | tem voltar = ${await page.locator('app-back').count()}`);
}

// 5) Rótulos da barra de baixo: cabem na largura?
const labels = await page.evaluate(() => [...document.querySelectorAll('nav.nav .nav-item')].map((a) => {
  const l = a.querySelector('.label');
  const r = l.getBoundingClientRect();
  const ar = a.getBoundingClientRect();
  return { text: l.textContent.trim(), left: Math.round(r.left), right: Math.round(r.right), itemW: Math.round(ar.width), overflow: l.scrollWidth > ar.width || r.right > innerWidth };
}));
console.log('rótulos 360:', JSON.stringify(labels));

// 6) Alvos de toque do topo
const topTargets = await page.evaluate(() => [...document.querySelectorAll('header.top-bar a, header.top-bar button')].map((e) => {
  const r = e.getBoundingClientRect();
  return `${(e.getAttribute('aria-label') ?? e.textContent).trim()}: ${Math.round(r.width)}x${Math.round(r.height)}`;
}));
console.log('topo 360:', topTargets.join(' | '));
await ctx.close();

// 7) Ajustes: linhas com seta/alavanca desalinhadas (computador)
{
  const { ctx: c2, page: p2 } = await newPage({ width: 1366, height: 768, mobile: false });
  await p2.goto('http://localhost:4200/ajustes');
  await settle(p2);
  const rows = await p2.evaluate(() => [...document.querySelectorAll('section.card')].slice(0, 3).flatMap((card) => {
    const cr = card.getBoundingClientRect();
    return [...card.querySelectorAll('.row')].map((row) => {
      const rr = row.getBoundingClientRect();
      const last = row.lastElementChild.getBoundingClientRect();
      return `${row.tagName.toLowerCase()} "${row.querySelector('strong')?.textContent}": linha ${Math.round(rr.left)}–${Math.round(rr.right)}, cartão ${Math.round(cr.left)}–${Math.round(cr.right)}, último elemento termina em ${Math.round(last.right)}`;
    });
  }));
  console.log(rows.join('\n'));
  // Alinhamento do título entre telas
  for (const path of ['/estudo', '/meu-espaco', '/ajustes', '/novidades']) {
    await p2.goto('http://localhost:4200' + path);
    await settle(p2);
    console.log(path, 'h1 x =', await p2.evaluate(() => Math.round(document.querySelector('main h1').getBoundingClientRect().left)));
  }
  await c2.close();
}
await b.close();
