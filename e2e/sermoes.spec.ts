import { expect, test } from './base';

test('cria um sermão expositivo, com tópicos, e prega no modo púlpito', async ({ page }) => {
  await page.goto('/anotacoes');
  await page.getByText('Crie o seu próprio sermão').click();
  await expect(page).toHaveURL(/\/sermoes$/);
  await page.getByRole('button', { name: /Expositivo/ }).click();

  await page.getByRole('textbox', { name: 'Título do sermão' }).fill('Alegria em qualquer circunstância');
  await page.getByRole('textbox', { name: 'Texto base' }).fill('Fp 4.4-7');
  await expect(page.locator('app-passage-view figure').first()).toBeVisible();
  await page.getByRole('textbox', { name: 'Tema central' }).fill('A alegria do cristão vem de Cristo.');
  await page.getByRole('textbox', { name: 'Título do tópico 1' }).fill('Alegrai-vos sempre');
  await page.getByRole('textbox', { name: 'Título do tópico 2' }).fill('Não andeis ansiosos');

  // Reordenar e adicionar tópicos
  await page.getByRole('button', { name: 'Mover para baixo' }).first().click();
  await expect(page.getByRole('textbox', { name: 'Título do tópico 1' })).toHaveValue('Não andeis ansiosos');
  await page.getByRole('button', { name: 'Adicionar tópico' }).click();
  await expect(page.locator('.point')).toHaveCount(4);

  // Modo púlpito
  await page.getByRole('link', { name: /Pregar/ }).click();
  await expect(page.locator('.pulpit h1')).toHaveText('Alegria em qualquer circunstância');
  await expect(page.locator('.pulpit cite')).toHaveText('Fp 4.4-7');
  await page.getByRole('button', { name: 'Próxima parte' }).click();
  await page.getByRole('button', { name: 'Próxima parte' }).click();
  await expect(page.locator('.pulpit h1')).toHaveText('Não andeis ansiosos');
  await page.getByRole('button', { name: 'Sair do modo púlpito' }).click();

  await page.getByRole('button', { name: 'Voltar' }).click();
  await expect(page.locator('.sermon').first()).toContainText('Alegria em qualquer circunstância');
});

test('sermão aberto e deixado em branco é descartado', async ({ page }) => {
  await page.goto('/sermoes');
  await page.getByRole('button', { name: /Em branco/ }).click();
  await page.getByRole('button', { name: 'Voltar' }).click();
  await expect(page.locator('.sermon')).toHaveCount(0);
});
