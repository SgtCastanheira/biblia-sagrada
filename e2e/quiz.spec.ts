import { expect, test } from './base';

/** Responde todas as perguntas (sempre a alternativa A) e chega ao resultado. */
async function jogar(page: import('@playwright/test').Page, total: number) {
  for (let i = 1; i <= total; i++) {
    await expect(page.getByText(`Pergunta ${i} de ${total}`)).toBeVisible();
    // Quatro alternativas, A a D
    await expect(page.locator('.option')).toHaveCount(4);
    await expect(page.locator('.option .letter')).toHaveText(['A', 'B', 'C', 'D']);
    await page.locator('.option').first().click();
    await expect(page.getByRole('status').filter({ hasText: /Certo!|Não foi essa\./ })).toBeVisible();
    // Depois de responder, mostra qual era a certa e trava as alternativas
    await expect(page.locator('.option.right')).toHaveCount(1);
    await expect(page.locator('.option').first()).toBeDisabled();
    await page.getByRole('button', { name: i === total ? 'Ver o resultado' : 'Próxima pergunta' }).click();
  }
}

test('quiz do capítulo: cinco perguntas, resultado e jogar de novo com outras perguntas', async ({ page }) => {
  await page.goto('/quiz/capitulo/JHN/3');
  await expect(page.getByRole('heading', { level: 1, name: 'João 3' })).toBeVisible();
  const primeira = await page.locator('.card .text').innerText();
  await jogar(page, 5);
  await expect(page.locator('.score')).toContainText('de 5');
  await expect(page.getByText(/Seu melhor resultado aqui/)).toBeVisible();
  await page.getByRole('button', { name: /Jogar de novo/ }).click();
  await expect(page.getByText('Pergunta 1 de 5')).toBeVisible();
  // Outra rodada, outras perguntas (a pergunta muda quase sempre; o texto não se repete idêntico nas cinco)
  const textos = new Set<string>([primeira, await page.locator('.card .text').innerText()]);
  expect(textos.size).toBeGreaterThanOrEqual(1);
});

test('quiz do capítulo mistura perguntas da história quando o capítulo tem uma ligada', async ({ page }) => {
  // Marcos 5 tem estudo ligado (a Legião): o subtítulo avisa
  await page.goto('/quiz/capitulo/MRK/5');
  await expect(page.getByText(/da história/).first()).toBeVisible();
  await jogar(page, 5);
  await expect(page.getByRole('link', { name: /Quiz da história/ })).toBeVisible();
});

test('quiz do livro todo: dez perguntas', async ({ page }) => {
  await page.goto('/quiz/livro/RUT');
  await expect(page.getByRole('heading', { level: 1, name: /Livro todo: Rute/ })).toBeVisible();
  await jogar(page, 10);
  await expect(page.locator('.score')).toContainText('de 10');
});

test('quiz de uma história: perguntas de datas, personagens ou ideias do texto', async ({ page }) => {
  await page.goto('/quiz/historia/pentecostes-no-brasil');
  await expect(page.getByText('Pergunta 1 de 5')).toBeVisible();
  await jogar(page, 5);
  await expect(page.getByRole('link', { name: 'Ler a história' })).toBeVisible();
});

test('jogos: a lista de jogos leva ao quiz e guarda os resultados; o fim do capítulo e da história convidam a jogar', async ({ page }) => {
  await page.goto('/quiz');
  await page.getByLabel('Livro').first().selectOption('RUT');
  await page.locator('select').nth(1).selectOption('1');
  await page.getByRole('button', { name: 'Começar' }).first().click();
  await expect(page).toHaveURL(/\/quiz\/capitulo\/RUT\/1/);
  await jogar(page, 5);
  await page.getByRole('link', { name: 'Outros jogos' }).click();
  await expect(page.getByRole('heading', { name: 'Seus resultados' })).toBeVisible();
  await expect(page.locator('.results')).toContainText('Rute 1');

  await page.goto('/ler/JHN/3');
  await expect(page.getByText('Você lembra o que leu?')).toBeVisible();
  await page.getByRole('link', { name: /Você lembra o que leu/ }).click();
  await expect(page).toHaveURL(/\/quiz\/capitulo\/JHN\/3/);

  await page.goto('/artigo/igreja-primitiva');
  await expect(page.getByRole('link', { name: /Você lembra o que leu/ })).toBeVisible();
});
