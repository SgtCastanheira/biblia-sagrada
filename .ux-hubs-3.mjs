// Script temporário de auditoria (apagar depois): a aba Bíblia (leitor e livros) e o sino, para comparar com os hubs.
import { chromium } from 'playwright';

const OUT = '/tmp/claude-1000/-home-valter--rea-de-trabalho-App-da-Biblia/0052e955-7cd7-476e-a26d-52b963f394f2/scratchpad/ux-audit/hubs';
const b = await chromium.launch({ channel: 'chrome' });
const VPS = [
  { id: 'p360', width: 360, height: 740, mobile: true },
  { id: 'n1366', width: 1366, height: 768, mobile: false },
];
for (const vp of VPS) {
  const ctx = await b.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.mobile, hasTouch: vp.mobile, locale: 'pt-BR' });
  const page = await ctx.newPage();
  await page.addInitScript((latest) => {
    const d = new Date();
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    localStorage.setItem('biblia.notify.done', JSON.stringify([`curiosidade-${key}`, `devocional-${key}`]));
    localStorage.setItem('biblia.novidades.visto', latest);
  }, 'ad-ministerios-em-cada-estado');
  for (const [id, path] of [['leitor', '/ler/JHN/3'], ['livros', '/livros'], ['curiosidades', '/curiosidades'], ['busca', '/busca']]) {
    await page.goto('http://localhost:4200' + path);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${OUT}/aba-${id}-${vp.id}.png` });
  }
  await ctx.close();
}
await b.close();
