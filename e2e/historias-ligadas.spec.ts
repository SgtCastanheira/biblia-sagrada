import { readFileSync } from 'node:fs';
import { expect, test } from './base';
import { linkedArticles, sameEra, trailStep } from '../src/app/core/story-graph';

const ID = 'constantino-e-os-concilios';

/** Rola até uma fração do texto da história (0 = começo, 1 = fim). */
async function scrollText(page: import('@playwright/test').Page, fraction: number) {
  await page.evaluate((f) => {
    const r = document.querySelector('app-rich-text')!.getBoundingClientRect();
    window.scrollTo(0, scrollY + r.top + f * r.height - innerHeight * 0.5);
  }, fraction);
}

test('fim da história: a próxima da trilha, o progresso e a mesma época, sem repetir o que o texto já cita', async ({ page }) => {
  const step = trailStep(ID)!;
  const era = sameEra(ID, linkedArticles(readFileSync(`public/conteudo/artigos/${ID}.md`, 'utf8')));
  await page.goto(`/artigo/${ID}`);
  await expect(page.locator('.hero-over')).toContainText(`${step.trail.name} · história ${step.index + 1} de ${step.total}`);

  const journey = page.locator('app-story-journey');
  await journey.scrollIntoViewIfNeeded();
  await expect(journey.getByRole('heading', { name: `História ${step.index + 1} de ${step.total}` })).toBeVisible();
  await expect(journey.locator('.up-next')).toContainText(step.next!.title);
  await expect(journey.locator('.prev')).toContainText(step.prev!.title);
  await expect(journey.locator('.era-card')).toHaveCount(era.length);
  for (const m of era) await expect(journey.locator('.era-card', { hasText: m.article.title })).toBeVisible();

  // Chegou ao fim: a história fica lida, aqui e na lista da trilha
  await scrollText(page, 1);
  await expect(journey.locator('.count')).toContainText('1 de');
  await page.goto(`/historia?trilha=${step.trail.id}`);
  await expect(page.locator('a.card', { hasText: 'Constantino' }).locator('.meta')).toContainText('lida');
  await expect(page.locator('.cover .c-over')).toContainText('1 lida');
  // Terminou a 4ª: a trilha continua na 5ª, não volta ao começo
  await expect(page.locator('.go-on')).toContainText('Continuar a trilha');
  await expect(page.locator('.go-on')).toContainText(step.next!.title);
});

test('continuar de onde parou: na história e na tela inicial; o capítulo atual aparece embaixo', async ({ page }) => {
  await page.goto(`/artigo/${ID}`);
  await page.locator('app-rich-text h2').first().waitFor();
  await scrollText(page, 0.45);
  await expect(page.locator('.now.on')).toContainText('faltam');

  await page.reload();
  const resume = page.getByRole('button', { name: /Continuar de onde parou/ });
  await expect(resume).toBeVisible();
  await resume.click();
  await expect(resume).toBeHidden();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(400);

  await page.goto('/');
  const card = page.locator('a.story-resume');
  await expect(card).toContainText('Continuar a história');
  await expect(card).toContainText('Constantino');
  await card.click();
  await expect(page).toHaveURL(new RegExp(`/artigo/${ID}`));
});

test('a curiosidade leva ao estudo que a aprofunda, sem repetir o texto', async ({ page }) => {
  await page.goto('/curiosidades/palavra-trindade');
  await page.getByRole('link', { name: /Para estudar mais/ }).click();
  await expect(page).toHaveURL(/\/artigo\/trindade/);
});

test('a capa fica só com o título; os tópicos aparecem ao longo do texto, como “Tópico 3 de 5”', async ({ page }) => {
  await page.goto('/artigo/natal-e-os-calendarios');
  const hero = page.locator('.hero');
  await expect(hero.getByRole('heading', { level: 1, name: 'Jesus nasceu mesmo em 25 de dezembro?' })).toBeVisible();
  await expect(hero.locator('ul, .lead')).toHaveCount(0);
  await expect(page.locator('.toc')).toHaveCount(0);
  const heading = page.getByRole('heading', { level: 2, name: 'Os dez dias que desapareceram' });
  await heading.scrollIntoViewIfNeeded();
  await expect(page.locator('.chapter', { hasText: 'Tópico 3 de 5' })).toBeVisible();
});
