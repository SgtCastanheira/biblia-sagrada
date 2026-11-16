import { expect, expectNoHorizontalOverflow, test } from './base';
import type { Page } from '@playwright/test';

/** Captura o desenho para verificar que o movimento reduzido conserva os pixels entre quadros. */
async function canvasImage(page: Page): Promise<string> {
  return page.locator('app-bible-arcs canvas.top').evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL());
}

test.describe('conexões: abertura e movimento', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('a primeira visita tece os arcos, permite pular e não repete na próxima visita', async ({ page }) => {
    await page.goto('/conexoes');
    const arcs = page.locator('app-bible-arcs .arcs');
    const skip = page.getByRole('button', { name: 'Pular abertura' });
    await expect(arcs).toHaveClass(/opening/);
    await expect(skip).toBeVisible();
    const target = (await skip.boundingBox())!;
    expect(Math.min(target.width, target.height)).toBeGreaterThanOrEqual(40);
    await skip.click();
    await expect(arcs).not.toHaveClass(/opening/);
    await expect(skip).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem('biblia.conexoes.abertura'))).toBeTruthy();
    await page.reload();
    await expect(arcs).toBeVisible();
    await expect(arcs).not.toHaveClass(/opening/);
    await expect(skip).toHaveCount(0);
  });

  test('escolher um livro interrompe a abertura e seguir o fio termina no capítulo escolhido', async ({ page }) => {
    await page.goto('/conexoes');
    await expect(page.getByRole('button', { name: 'Pular abertura' })).toBeVisible();
    await page.getByLabel('Livro', { exact: true }).selectOption('ISA');
    await expect(page.locator('app-bible-arcs .arcs')).not.toHaveClass(/opening/);
    await page.getByLabel('Capítulo', { exact: true }).selectOption('53');
    await expect(page.locator('section.focus h2')).toHaveText('Isaías 53');
    // Registra o pulso mesmo se ele terminar antes de a asserção voltar ao navegador.
    const arcs = page.locator('app-bible-arcs .arcs');
    await arcs.evaluate((element: HTMLElement) => {
      const observer = new MutationObserver(() => {
        if (element.classList.contains('pulsing')) element.dataset['sawPulse'] = 'true';
        else if (element.dataset['sawPulse']) observer.disconnect();
      });
      observer.observe(element, { attributes: true, attributeFilter: ['class'] });
    });
    await page.locator('section.focus').getByRole('button', { name: /^Ver as ligações de Mateus 27, \d+ referências$/ }).click();
    await expect(page).toHaveURL(/\/conexoes\/MAT\/27$/);
    await expect(page.locator('section.focus h2')).toHaveText('Mateus 27');
    await expect(arcs).toHaveAttribute('data-saw-pulse', 'true');
    await expect(arcs).not.toHaveClass(/pulsing/, { timeout: 2500 });
    await expect(page.getByRole('navigation', { name: 'Seu caminho' }).getByRole('button')).toHaveText(['Isaías 53', 'Mateus 27']);
  });

  test('ligar movimento reduzido durante a abertura encerra o movimento imediatamente', async ({ page }) => {
    await page.goto('/conexoes');
    await expect(page.locator('app-bible-arcs .arcs')).toHaveClass(/opening/);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('app-bible-arcs .arcs')).not.toHaveClass(/opening/);
    await expect(page.getByRole('button', { name: 'Pular abertura' })).toHaveCount(0);
    const before = await canvasImage(page);
    await page.waitForTimeout(180);
    expect(await canvasImage(page)).toBe(before);
  });
});

test.describe('conexões: visual com movimento reduzido', () => {
  test.use({ reducedMotion: 'reduce' });

  test('não há abertura, pulso nem respiração, inclusive depois de seguir o fio', async ({ page }) => {
    await page.goto('/conexoes');
    await expect(page.locator('app-bible-arcs .arcs')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Pular abertura' })).toHaveCount(0);
    await page.getByLabel('Livro', { exact: true }).selectOption('ISA');
    await page.getByLabel('Capítulo', { exact: true }).selectOption('53');
    await page.locator('section.focus').getByRole('button', { name: /^Ver as ligações de Mateus 27, \d+ referências$/ }).click();
    await expect(page.locator('section.focus h2')).toHaveText('Mateus 27');
    const arcs = page.locator('app-bible-arcs .arcs');
    await expect(arcs).not.toHaveClass(/opening|pulsing/);
    const before = await canvasImage(page);
    await page.waitForTimeout(180);
    expect(await canvasImage(page)).toBe(before);
    const animations = await page.locator('app-bible-arcs').evaluate((root) => root.getAnimations({ subtree: true }).filter((animation) => animation.playState === 'running').length);
    expect(animations).toBe(0);
  });

  test('a composição cabe em 360px, com textos de pelo menos 13px e controles de pelo menos 40px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    for (const path of ['/conexoes', '/conexoes/ISA/53', '/conexoes/HEB', '/conexoes?mostrar=todas']) {
      await page.goto(path);
      await expect(page.locator('app-bible-arcs .arcs')).toBeVisible();
      await expectNoHorizontalOverflow(page);
      const report = await page.locator('app-connections').evaluate((root) => {
        const smallText: string[] = [];
        const smallTargets: string[] = [];
        for (const element of root.querySelectorAll<HTMLElement>('*')) {
          const rect = element.getBoundingClientRect();
          if (!rect.width || !rect.height || element.tagName.toLowerCase() === 'mat-icon') continue;
          const ownText = [...element.childNodes].some((node) => node.nodeType === 3 && node.textContent?.trim());
          if (ownText && parseFloat(getComputedStyle(element).fontSize) < 13) smallText.push(element.textContent!.trim().slice(0, 40));
          if (element.matches('button, select, summary, a.read') && Math.min(rect.width, rect.height) < 39.5) smallTargets.push(element.textContent!.trim().slice(0, 40));
        }
        return { smallText, smallTargets };
      });
      expect(report, path).toEqual({ smallText: [], smallTargets: [] });
    }
  });
});
