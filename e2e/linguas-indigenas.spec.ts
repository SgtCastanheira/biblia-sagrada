import { expect, test } from './base';

test('Bíblia em línguas indígenas do Brasil: Guarani Mbyá completa, Ticuna só NT, com o aviso de direitos', async ({ page }) => {
  await page.goto('/ler/JHN/3');
  await page.getByRole('button', { name: 'Trocar versão' }).click();
  await page.getByRole('button', { name: /Guarani Mbyá/ }).or(page.getByRole('option', { name: /Guarani Mbyá/ })).first().click();
  await expect(page.locator('#v16')).toContainText('Nhanderuete');
  await expect(page.locator('p.source')).toContainText('Wycliffe Bible Translators');
  await expect(page.locator('p.source')).toContainText('CC BY-NC-ND');

  // Guarani Mbyá e Guajajára têm a Bíblia inteira
  await page.goto('/ler/GEN/1');
  await expect(page.locator('#v1')).toContainText('Nhanderuete');
  await page.evaluate(() => localStorage.setItem('biblia.settings.version', JSON.stringify('guajajara')));
  await page.goto('/ler/GEN/1');
  await expect(page.locator('#v1')).toBeVisible();

  // As outras, só o Novo Testamento: o Antigo avisa, sem pedir nada à internet
  await page.evaluate(() => localStorage.setItem('biblia.settings.version', JSON.stringify('ticuna')));
  await page.goto('/ler/GEN/1');
  await expect(page.locator('.notice.fallback')).toContainText('só tem o Novo Testamento');
  await expect(page.locator('#v1')).toContainText('No princípio'); // o capítulo vem da Almeida
  await expect(page.locator('p.source')).toContainText('Almeida');
  await page.getByRole('button', { name: 'Ver o Novo Testamento' }).click();
  await expect(page).toHaveURL(/\/ler\/MAT\/1/);
  await expect(page.locator('#v1')).toBeVisible();
  await page.goto('/ler/JHN/3');
  await expect(page.locator('#v16')).toContainText('Tupana');
});

test('o fim do capítulo mostra a licença certa de cada versão, não "domínio público" para todas', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('biblia.settings.version', JSON.stringify('nbv')));
  await page.goto('/ler/JHN/3');
  await expect(page.locator('p.source')).toContainText('CC BY-SA 4.0');
  await page.evaluate(() => localStorage.setItem('biblia.settings.version', JSON.stringify('almeida')));
  await page.goto('/ler/JHN/3');
  await expect(page.locator('p.source')).toContainText('domínio público');
});

test('Sinodal russa embutida: Bíblia inteira, sem pedir nada à internet', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('biblia.settings.version', JSON.stringify('synodal')));
  for (const ref of ['GEN/1', 'PSA/23', 'JHN/3', 'REV/22']) {
    await page.goto(`/ler/${ref}`);
    await expect(page.locator('#v1')).toContainText(/[А-Яа-я]/);
  }
  await expect(page.locator('p.source')).toContainText('domínio público');
});

test('tradução que pula versículos avisa quais faltam; versão completa não avisa', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('biblia.settings.version', JSON.stringify('xavante')));
  await page.goto('/ler/JHN/1');
  await expect(page.locator('.gap-note')).toContainText('Esta tradução não traz os versículos 11, 17');
  await page.evaluate(() => localStorage.setItem('biblia.settings.version', JSON.stringify('almeida')));
  await page.goto('/ler/JHN/1');
  await expect(page.locator('#v1')).toBeVisible();
  await expect(page.locator('.gap-note')).toHaveCount(0);
});

test('busca na lista de versões: “xingu” acha Kayabí, Bakairí e Kayapó, e o Kayapó abre com o aviso de direitos', async ({ page }) => {
  await page.goto('/ler/JHN/3');
  await page.getByRole('button', { name: 'Trocar versão' }).click();
  const painel = page.locator('app-version-sheet');
  const busca = painel.getByRole('searchbox', { name: /Buscar versão/ });
  await expect(painel.locator('button.item').first()).toBeVisible();
  const todas = await painel.locator('button.item').count();
  expect(todas).toBeGreaterThan(40);

  await busca.fill('xingu');
  await expect(painel.locator('.count')).toHaveText('3 versões encontradas');
  await expect(painel.locator('button.item')).toHaveCount(3);
  await expect(painel.locator('h3')).toHaveText(['Línguas indígenas do Brasil']);
  for (const nome of ['Kayabí', 'Bakairí', 'Kayapó']) await expect(painel.locator('button.item', { hasText: nome })).toBeVisible();

  // sem acento e sem maiúsculas também acha; sem resultado, a tela explica o que tentar
  await busca.fill('KAYAPO');
  await expect(painel.locator('button.item')).toHaveCount(1);
  await busca.fill('zzzz');
  await expect(painel.locator('button.item')).toHaveCount(0);
  await expect(painel.locator('.empty')).toContainText('Nenhuma versão encontrada para “zzzz”');

  // o botão de limpar traz a lista inteira de volta
  await painel.getByRole('button', { name: 'Limpar a busca' }).click();
  await expect(painel.locator('button.item')).toHaveCount(todas);
  await expect(painel.locator('.count')).toHaveCount(0);

  // Enter escolhe a versão quando só sobrou uma
  await busca.fill('bakairi');
  await busca.press('Enter');
  await expect(painel).toHaveCount(0);
  await expect(page.locator('#v16')).toContainText('Idânârâ Deus kywynedyly');
  await expect(page.locator('p.source')).toContainText('Wycliffe Bible Translators');
  await expect(page.locator('p.source')).toContainText('2011');

  // o Kayapó, escolhido pelo toque
  await page.getByRole('button', { name: 'Trocar versão' }).click();
  await painel.getByRole('searchbox', { name: /Buscar versão/ }).fill('xingu');
  await painel.locator('button.item', { hasText: 'Kayapó' }).click();
  await expect(page.locator('#v16')).toContainText('Metĩndjwỳnh ne kum pykakam');
  await expect(page.locator('p.source')).toContainText('2012 Wycliffe Bible Translators');
  await expect(page.locator('p.source')).toContainText('CC BY-NC-ND');

  // o Antigo Testamento avisa e vem da Almeida
  await page.goto('/ler/GEN/1');
  await expect(page.locator('.notice.fallback')).toContainText('só tem o Novo Testamento');
});
