import { test, expect } from './base';

test('lições cuja aula já passou ganham um check; as futuras, não', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-20T10:00:00'));
  await page.goto('/ebd/apoio/adultos');
  const lessons = page.locator('ol.lessons > li .lesson');
  await expect(lessons.first().locator('.tick')).toBeVisible();
  await expect(lessons.first()).toHaveAttribute('aria-label', /já aconteceu/);
  await expect(lessons.last().locator('.tick')).toHaveCount(0);
});
