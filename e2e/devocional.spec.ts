import { expect, test } from './base';

test('faz o devocional do dia e soma na sequência', async ({ page }) => {
  await page.goto('/devocional/hoje');
  await page.locator('.suggestion').filter({ hasText: 'Salmo do dia' }).click();
  await page.getByRole('textbox', { name: 'Observar' }).fill('Deus cuida de mim.');
  await page.getByRole('button', { name: /Concluir devocional/ }).click();
  await expect(page.getByRole('button', { name: /Devocional concluído/ })).toBeVisible();
  await page.goto('/devocional');
  await expect(page.locator('.streak-number strong')).toHaveText('1');
});

test('pedidos de oração: adicionar e marcar como respondido', async ({ page }) => {
  await page.goto('/devocional');
  await page.getByRole('textbox', { name: 'Novo pedido' }).fill('Saúde da família');
  await page.getByRole('button', { name: 'Adicionar' }).click();
  await expect(page.getByText('Saúde da família')).toBeVisible();
  await page.getByRole('button', { name: 'Marcar como respondido' }).click();
  await expect(page.getByRole('button', { name: /Respondidos \(1\)/ })).toBeVisible();
});
