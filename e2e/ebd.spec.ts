import { expect, test } from './base';

const estrutura = `Lição 01: Carta aos Filipenses: um chamado à alegria | 4º Trimestre
CPAD JOVENS – TEMA: REGOZIJAI-VOS NO SENHOR – Vivendo
TEXTO PRINCIPAL
"[citação]" (Fp 1.6).
LEITURA SEMANAL
SEGUNDA — At 16.12 Descrição que deve ser descartada
TERÇA — At 22.29; 23.27 Descrição
TEXTO BÍBLICO
Filipenses 1.1-11.
INTRODUÇÃO
[comentário que deve ser descartado]`;

test('cria o trimestre e importa a lição colando o texto', async ({ page }) => {
  await page.goto('/ebd');
  await page.locator('button.create').click();
  await expect(page.locator('.lesson')).toHaveCount(13);

  await page.goto('/ebd/licao/1');
  await page.getByRole('button', { name: 'Colar da revista' }).click();
  await page.getByRole('textbox', { name: 'Texto da lição' }).fill(estrutura);
  await page.getByRole('button', { name: 'Ler referências' }).click();
  await page.getByRole('button', { name: /Preencher Lição 1/ }).click();

  await expect(page.locator('.title-input')).toHaveValue('Carta aos Filipenses: um chamado à alegria');
  await expect(page.locator('.ref-input').nth(0)).toHaveValue('Fp 1.6');
  await expect(page.locator('.ref-input').nth(1)).toHaveValue('Filipenses 1.1-11');

  // Nada além de título e referências fica salvo
  const salvo = await page.evaluate(() => localStorage.getItem('biblia.ebd.quarter') ?? '');
  expect(salvo).not.toContain('descartada');
  expect(salvo).not.toContain('comentário');

  // A lição de Filipenses mostra o mapa da 2ª viagem
  await expect(page.getByText('Mapas desta lição')).toBeVisible();
});

test('apoio ao professor: turmas da EBD, aula-modelo e o material do app na lição', async ({ page }) => {
  await page.goto('/ebd');
  await page.getByRole('link', { name: /Apoio ao professor/ }).click();
  await expect(page.getByRole('heading', { name: 'EBD — Apoio ao professor', level: 1 })).toBeVisible();
  await page.getByRole('link', { name: /Jovens/ }).click();
  await expect(page.getByText('Como ensinar nesta idade')).toBeVisible();
  await page.getByRole('link', { name: /Neemias reconstrói os muros/ }).click();
  await expect(page.getByText('Quatro meses de oração')).toBeVisible();
  await expect(page.getByText('Debate: oração ou planejamento?')).toBeVisible();

  // A lição cadastrada com a leitura em Neemias já mostra a aula de apoio e o contexto do livro
  await page.goto('/ebd');
  await page.locator('button.create').click();
  await page.goto('/ebd/licao/1');
  await page.locator('.ref-input').nth(1).fill('Ne 2.1-20');
  const apoio = page.locator('app-lesson-support');
  await expect(apoio.getByRole('link', { name: /Neemias reconstrói os muros/ })).toBeVisible();
  await expect(apoio.getByRole('link', { name: /Quem escreveu Neemias/ })).toBeVisible();
});

test('apoio ao professor: a turma mostra as lições 1 a 13 do trimestre', async ({ page }) => {
  // Jovens: as lições ainda estão em preparação
  await page.goto('/ebd/apoio/jovens');
  await expect(page.getByRole('heading', { name: 'Lições do trimestre' })).toBeVisible();
  await expect(page.locator('ol.lessons > li')).toHaveCount(13);
  await expect(page.locator('ol.lessons > li .lesson').first()).toHaveAttribute('aria-label', 'Lição 1: em preparação');
  await expect(page.locator('ol.lessons > li .lesson').last()).toHaveAttribute('aria-label', 'Lição 13: em preparação');
});

test('apoio ao professor: Adultos tem as 13 lições de Deuteronômio, com lembretes e dinâmicas', async ({ page }) => {
  await page.goto('/ebd/apoio/adultos');
  await expect(page.locator('ol.lessons > li')).toHaveCount(13);
  await expect(page.locator('ol.lessons > li .lesson').first()).not.toHaveAttribute('aria-label', /em preparação/);
  await expect(page.locator('ol.lessons > li .lesson').last()).not.toHaveAttribute('aria-label', /em preparação/);

  await page.goto('/ebd/apoio/aula/adultos-4t26-05-grande-mandamento');
  await expect(page.getByRole('heading', { level: 1, name: 'O grande mandamento' })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Lembretes para você, professor/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Para aprofundar no app/ })).toBeVisible();
  await expect(page.getByText('Nos umbrais da casa')).toBeVisible();
  // Um lembrete tem referência que abre o versículo
  await page.getByRole('button', { name: 'Mc 12.28-34' }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
});
