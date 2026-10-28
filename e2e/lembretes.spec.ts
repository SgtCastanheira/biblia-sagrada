import { remindersFor } from '../src/app/core/reminders';
import { expect, test } from './base';

// Os lembretes dependem da hora: os testes fixam o relógio e ligam os lembretes (desligados nos outros testes)
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (sessionStorage.getItem('lembretes-ligados')) return;
    sessionStorage.setItem('lembretes-ligados', '1');
    localStorage.setItem('biblia.lembretes', 'true');
    // Nas datas dos testes, o devocional e a curiosidade do dia não entram na fila de avisos
    const dates = ['2026-11-03', '2026-11-04', '2026-11-05'];
    localStorage.setItem('biblia.notify.done', JSON.stringify(dates.flatMap((d) => [`devocional-${d}`, `curiosidade-${d}`])));
  });
});

test('lembrete da vez: aparece na tela inicial e como aviso, uma vez só; "Já fiz" esconde o cartão', async ({ page }) => {
  const night = remindersFor('2026-11-03')[2];
  await page.clock.setFixedTime(new Date('2026-11-03T22:45:00'));
  await page.goto('/');
  const card = page.locator('app-reminder-card');
  await expect(card.getByRole('heading', { name: night.title })).toBeVisible();
  await expect(card.getByText(`Noite · ${night.at}`)).toBeVisible();
  await expect(card.getByRole('link', { name: night.action })).toHaveAttribute('href', /devocional|ler|historia|curiosidades|ensino/);
  // O aviso dentro do app chega sozinho
  await expect(page.locator('.curiosity-snack')).toContainText(night.title);

  await card.getByRole('button', { name: 'Já fiz' }).click();
  await expect(card.getByRole('heading')).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Histórias' })).toBeVisible();
  await page.waitForTimeout(2500);
  await expect(card.getByRole('heading')).toHaveCount(0);
  await expect(page.locator('.curiosity-snack')).toHaveCount(0);
});

test('lembretes antes do primeiro horário: nenhum cartão; o da manhã que passou sem aviso não volta à tarde', async ({ page }) => {
  const [morning, afternoon] = remindersFor('2026-11-04');
  await page.clock.setFixedTime(new Date('2026-11-04T06:30:00'));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Histórias' })).toBeVisible();
  await expect(page.locator('app-reminder-card').getByRole('heading')).toHaveCount(0);

  const [h, m] = afternoon.at.split(':').map(Number);
  await page.clock.setFixedTime(new Date(2026, 10, 4, h, m + 5));
  await page.reload();
  await expect(page.locator('app-reminder-card').getByRole('heading', { name: afternoon.title })).toBeVisible();
  await expect(page.locator('.curiosity-snack')).toContainText(afternoon.title);
  await expect(page.locator('.curiosity-snack')).not.toContainText(morning.title);
});

test('Ajustes: liga e desliga os lembretes e mostra os três horários de hoje', async ({ page }) => {
  const list = remindersFor('2026-11-05');
  await page.clock.setFixedTime(new Date('2026-11-05T15:00:00'));
  await page.goto('/ajustes');
  const row = page.locator('.row', { has: page.getByRole('switch', { name: 'Lembretes do dia' }) });
  await expect(row).toContainText(`Hoje: ${list[0].at}, ${list[1].at} e ${list[2].at}`);
  await row.getByRole('switch', { name: 'Lembretes do dia' }).click();
  await expect(row).not.toContainText('Hoje:');
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Histórias' })).toBeVisible();
  await expect(page.locator('app-reminder-card').getByRole('heading')).toHaveCount(0);
});
