import { expect, test } from './base';

test.describe('Leitor', () => {
  test('mostra um versículo por linha (padrão)', async ({ page }) => {
    await page.goto('/ler/JHN/3');
    const linhas = page.locator('.line');
    await expect(linhas.first()).toBeVisible();
    expect(await linhas.count()).toBeGreaterThan(5);
    // Cada versículo começa numa linha nova: o topo do 2º está abaixo do fim do 1º
    const a = await linhas.nth(0).boundingBox();
    const b = await linhas.nth(1).boundingBox();
    expect(b!.y).toBeGreaterThanOrEqual(a!.y + a!.height - 1);
    await expect(linhas.nth(0).locator('.n')).toHaveText('1');
  });

  test('alterna para texto corrido em Aparência', async ({ page }) => {
    await page.goto('/ler/JHN/3');
    await page.getByRole('button', { name: 'Aparência da leitura' }).click();
    await page.getByRole('button', { name: /Texto corrido/ }).click();
    await page.keyboard.press('Escape');
    await expect(page.getByText(/um homem chamado Nicodemos/)).toBeVisible();
    await expect(page.locator('.line')).toHaveCount(0);
  });

  test('não tenta baixar arquivos locais inexistentes (sem 404)', async ({ page, problems }) => {
    // O vigia (problems) falha o teste se qualquer /bible/... responder 404
    await page.goto('/ler/JOS/1');
    await expect(page.locator('.line').first()).toBeVisible();
    await page.goto('/ler/ACT/16');
    await expect(page.locator('.line').first()).toBeVisible();
    expect(problems.errors).toEqual([]);
  });

  test('tocar num versículo permite destacar e salvar nos favoritos', async ({ page }) => {
    await page.goto('/ler/JHN/3');
    await page.locator('#v3').click();
    await page.getByRole('button', { name: 'Destacar em Verde' }).click();
    await expect(page.locator('#v3')).toHaveClass(/marked/);
    await page.goto('/favoritos');
    await expect(page.getByText('João 3:3')).toBeVisible();
  });

  test('navega para o próximo capítulo', async ({ page }) => {
    await page.goto('/ler/JHN/3');
    await page.locator('.nav-card.next').click();
    await expect(page).toHaveURL(/\/ler\/JHN\/4/);
    await expect(page.locator('.chapter-number')).toHaveText('4');
  });

  test('modo comparação mostra as duas versões', async ({ page }) => {
    await page.goto('/ler/PSA/23');
    await page.getByRole('button', { name: 'Comparar versões' }).click();
    await page.getByRole('button', { name: /King James Version/ }).click();
    await expect(page.locator('.pair').first()).toBeVisible();
    await expect(page.locator('.pair .other').first()).toContainText('(kjv)');
  });

  test('capítulo com mapa mostra o mapa no painel de estudo', async ({ page }) => {
    await page.goto('/ler/ACT/16');
    await page.getByRole('button', { name: /Estudar este capítulo/ }).click();
    await page.getByRole('link', { name: /Segunda viagem missionária/ }).click();
    await expect(page).toHaveURL(/\/mapas\/segunda-viagem-de-paulo/);
  });
});

test('versões em português embutidas: Bíblia Livre, Nova Bíblia Viva e a BLT (só NT)', async ({ page }) => {
  await page.goto('/ler/JHN/3');
  await page.getByRole('button', { name: 'Trocar versão' }).click();
  await page.getByRole('button', { name: /Nova Bíblia Viva/ }).or(page.getByRole('option', { name: /Nova Bíblia Viva/ })).first().click();
  await expect(page.locator('#v16')).toContainText('Deus amou tanto o mundo');

  // Versão só do Novo Testamento: o Antigo avisa, sem pedir nada à internet
  await page.evaluate(() => localStorage.setItem('biblia.settings.version', JSON.stringify('blt')));
  await page.goto('/ler/GEN/1');
  await expect(page.getByText('contém apenas o Novo Testamento')).toBeVisible();
  await page.goto('/ler/MAT/5');
  await expect(page.locator('#v3')).toBeVisible();

  // Vindas da CrossWire: a NVA e a Almeida 1911, com a ortografia da época
  await page.evaluate(() => localStorage.setItem('biblia.settings.version', JSON.stringify('alm1911')));
  await page.goto('/ler/JHN/3');
  await expect(page.locator('#v16')).toContainText('aquelle');
  await page.evaluate(() => localStorage.setItem('biblia.settings.version', JSON.stringify('lsg')));
  await page.goto('/ler/JHN/3');
  await expect(page.locator('#v16')).toContainText('Car Dieu a tant aimé le monde');
  await page.evaluate(() => localStorage.setItem('biblia.settings.version', JSON.stringify('nva')));
  await page.goto('/ler/PSA/23');
  await expect(page.locator('#v1')).toContainText('meu pastor');
});

test('versículo abre o mesmo texto na NVI, ARA e NTLH (site do YouVersion)', async ({ page }) => {
  await page.goto('/ler/JHN/3');
  await page.locator('#v16').click();
  await expect(page.getByRole('link', { name: /Nova Versão Internacional/ })).toHaveAttribute('href', 'https://www.bible.com/bible/129/JHN.3.16.NVI');
  await expect(page.getByRole('link', { name: /Almeida Revista e Atualizada/ })).toHaveAttribute('href', 'https://www.bible.com/bible/1608/JHN.3.16.ARA');
  await expect(page.getByRole('link', { name: /Linguagem de Hoje/ })).toHaveAttribute('href', 'https://www.bible.com/bible/211/JHN.3.16.NTLH');
});

test('fitinha: marca o capítulo, aparece na tela inicial e some ao tocar de novo', async ({ page }) => {
  await page.goto('/ler/JHN/3');
  const ribbon = page.getByRole('button', { name: /fitinha/i });
  await expect(ribbon).toHaveAttribute('aria-pressed', 'false');
  await ribbon.click();
  await expect(ribbon).toHaveAttribute('aria-pressed', 'true');
  // Em outro capítulo a fitinha fica curta; a tela inicial leva de volta a ela
  await page.goto('/ler/JHN/4');
  await expect(page.getByRole('button', { name: /fitinha/i })).toHaveAttribute('aria-pressed', 'false');
  await page.goto('/');
  await page.getByRole('link', { name: /Sua fitinha/ }).click();
  await expect(page).toHaveURL(/\/ler\/JHN\/3/);
  await page.getByRole('button', { name: /fitinha/i }).click();
  await expect(page.getByRole('button', { name: /fitinha/i })).toHaveAttribute('aria-pressed', 'false');
});

test('virar a página: a folha nova chega com a animação do lado certo', async ({ page }) => {
  await page.goto('/ler/JHN/3');
  await expect(page.getByText(/um homem chamado Nicodemos/)).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/\/ler\/JHN\/4/);
  await expect(page.locator('.book-page')).toHaveClass(/turn-next/);
  await expect(page.locator('.book-page')).not.toHaveClass(/turn-/, { timeout: 3000 });
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('.book-page')).toHaveClass(/turn-prev/);
});

test('versões em espanhol e alemão embutidas: o mesmo versículo, em cada língua, sem internet', async ({ page }) => {
  const abrir = async (version: string) => {
    await page.evaluate((v) => localStorage.setItem('biblia.settings.version', JSON.stringify(v)), version);
    await page.goto('/ler/JHN/3');
  };
  await page.goto('/ler/JHN/3');
  await abrir('rv1909');
  await expect(page.locator('#v16')).toContainText('Porque de tal manera amó Dios al mundo');
  await abrir('vbl');
  await expect(page.locator('#v16')).toContainText('Dios');
  await abrir('luther1912');
  await expect(page.locator('#v16')).toContainText('Also hat Gott die Welt geliebt');
  await abrir('schlachter');
  await expect(page.locator('#v16')).toContainText('Gott');
  // O seletor agrupa por idioma
  await page.getByRole('button', { name: 'Trocar versão' }).click();
  await expect(page.getByText('Espanhol', { exact: true })).toBeVisible();
  await expect(page.getByText('Alemão', { exact: true })).toBeVisible();
});

test('Bíblia hebraica: o texto aparece da direita para a esquerda, e o Novo Testamento também', async ({ page }) => {
  await page.goto('/ler/GEN/1');
  await page.evaluate(() => localStorage.setItem('biblia.settings.version', JSON.stringify('hebraico')));
  await page.goto('/ler/GEN/1');
  await expect(page.locator('#v1')).toContainText('בראשית ברא אלהים');
  await expect(page.locator('#v1')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('#v1')).toHaveAttribute('lang', 'he');
  await page.goto('/ler/JHN/3');
  await expect(page.locator('#v16')).toContainText('כי');
  // Voltando ao português, a página volta à direção normal
  await page.evaluate(() => localStorage.setItem('biblia.settings.version', JSON.stringify('almeida')));
  await page.goto('/ler/GEN/1');
  await expect(page.locator('#v1')).not.toHaveAttribute('dir', 'rtl');
});
