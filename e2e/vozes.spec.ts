import { expect, test } from './base';

const ID = 'a-sanguessuga';
const TOKEN = '8f11d02bac34306e';

/** Um sintetizador de mentira: anota (língua | texto) de cada fala e termina logo em seguida; há vozes em português e em espanhol. */
async function fakeSpeech(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    const spoken: string[] = [];
    (window as unknown as { spoken: string[] }).spoken = spoken;
    class FakeUtterance {
      lang = ''; voice = null; rate = 1; pitch = 1; onstart: (() => void) | null = null; onend: (() => void) | null = null; onerror: ((e: unknown) => void) | null = null;
      constructor(public text: string) {}
    }
    (window as unknown as { SpeechSynthesisUtterance: unknown }).SpeechSynthesisUtterance = FakeUtterance;
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        getVoices: () => [{ name: 'Voz PT', lang: 'pt-BR', voiceURI: 'pt' }, { name: 'Voz ES', lang: 'es-ES', voiceURI: 'es' }],
        addEventListener: () => {},
        cancel: () => {},
        speak: (u: FakeUtterance) => { spoken.push(`${u.lang} | ${u.text}`); setTimeout(() => u.onstart?.(), 1); setTimeout(() => u.onend?.(), 5); },
      },
    });
  });
}

const spoken = (page: import('@playwright/test').Page) => page.evaluate(() => (window as unknown as { spoken: string[] }).spoken.join('\n'));

test('Ensino tem o menu das Novas Vozes, que leva à primeira página e ao sermão', async ({ page }) => {
  await page.goto('/ensino');
  const card = page.getByRole('link', { name: /Novas Vozes da Palavra/ });
  await expect(card).toBeVisible();
  await expect(card).toContainText('Em revisão'); // em desenvolvimento, o sermão ainda espera a aprovação do autor
  await card.click();
  await expect(page).toHaveURL(/\/vozes$/);
  await expect(page.getByRole('navigation', { name: 'Navegação principal' }).locator('.nav-item.active')).toHaveText(/Ensino/);
  await expect(page.getByText('Nesta edição')).toBeVisible();
  await page.getByRole('link', { name: /A Sanguessuga/ }).click();
  await expect(page).toHaveURL(new RegExp(`/vozes/${ID}$`));
  await expect(page.getByRole('heading', { level: 1, name: 'A Sanguessuga' })).toBeVisible();
});

test('o sermão é um jornal: manchete, autoria, texto-base, as quatro ilustrações e o texto da imagem do autor', async ({ page }) => {
  await page.goto(`/vozes/${ID}`);
  await expect(page.getByText('Novas Vozes da Palavra').first()).toBeVisible();
  await expect(page.getByText('Por Lucas Silva')).toBeVisible();
  await expect(page.getByText('Texto-base')).toBeVisible();
  await expect(page.locator('.base')).toContainText('A sanguessuga tem duas filhas');
  for (const nome of [/Desenho de uma sanguessuga/, /A sanguessuga e as suas duas filhas/, /O caminho de Tiago 1/, /A fonte de água viva/]) {
    await expect(page.getByRole('img', { name: nome })).toBeVisible();
  }
  // As três partes e o fim do sermão (o que estava na imagem)
  await expect(page.getByRole('heading', { level: 2 })).toHaveCount(3);
  await expect(page.getByText('Se alguém tem sede, venha a mim e beba')).toBeVisible();
  await expect(page.getByText('Hoje Deus te chama para uma nova realidade').first()).toBeVisible();
  // O versículo por extenso vem da Bíblia do app
  await expect(page.locator('.verse', { hasText: 'Tiago 1:14-15' })).toContainText('Cada um, porém, é tentado');
});

test('trocar de idioma muda o texto, os versículos e o idioma da página', async ({ page }) => {
  await page.goto(`/vozes/${ID}`);
  await page.getByRole('button', { name: 'Español' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'La Sanguijuela' })).toBeVisible();
  await expect(page.locator('.base')).toContainText('La sanguijuela tiene dos hijas');
  await expect(page.locator('article.paper')).toHaveAttribute('lang', 'es');
  await expect(page.getByText('Traducción del texto original en portugués')).toBeVisible();
  await expect(page.getByRole('img', { name: /La sanguijuela y sus dos hijas/ })).toBeVisible();
  // Tocar uma referência abre o versículo na Bíblia em espanhol
  await page.getByRole('button', { name: 'Proverbios 30:14' }).click();
  await expect(page.locator('app-passage-sheet')).toContainText('Hay generación cuyos dientes son espadas');
  await page.keyboard.press('Escape');
  // O endereço pode pedir o idioma: russo e francês (os Salmos têm numeração própria)
  await page.goto(`/vozes/${ID}?idioma=ru`);
  await expect(page.getByRole('heading', { level: 1, name: 'Пиявка' })).toBeVisible();
  await page.goto(`/vozes/${ID}?idioma=fr`);
  await page.getByRole('button', { name: 'Psaume 42:8' }).click();
  await expect(page.locator('app-passage-sheet')).toContainText('Un flot appelle un autre flot');
});

test('ouvir lê o título e o texto, diz as referências por extenso e usa a língua escolhida', async ({ page }) => {
  await fakeSpeech(page);
  await page.goto(`/vozes/${ID}`);
  await expect(page.getByText('Quem fala é Agur')).toBeVisible();
  await page.getByRole('button', { name: 'Ouvir' }).first().click();
  const player = page.getByRole('region', { name: 'Ouvir' });
  await expect(player).toBeVisible();
  await expect.poll(() => spoken(page), { timeout: 8000 }).toContain('pt-BR | A Sanguessuga');
  await expect.poll(() => spoken(page), { timeout: 8000 }).toContain('Pv capítulo 30, versículo 1'.replace('Pv', 'Provérbios'));
  // O número romano do título e os números dos versículos não são lidos
  expect(await spoken(page)).not.toMatch(/\| I O que/);
  await player.getByRole('button', { name: 'Parar e fechar' }).click();
  await expect(player).toHaveCount(0);

  await page.getByRole('button', { name: 'Español' }).click();
  await page.getByRole('button', { name: 'Escuchar' }).click();
  await expect(player).toBeVisible();
  await expect(player.getByLabel('Escolher a voz')).toHaveCount(0); // só uma voz em espanhol: sem escolha
  await expect.poll(() => spoken(page), { timeout: 8000 }).toContain('es-ES | La Sanguijuela');
  await expect.poll(() => spoken(page), { timeout: 8000 }).toContain('Proverbios capítulo 30, versículo 1');
  // Trocar de idioma para a leitura
  await page.getByRole('button', { name: 'English' }).click();
  await expect(player).toHaveCount(0);
});

test('a prévia do autor abre sem as barras do app, pede ao buscador para não indexar e mostra a versão do texto', async ({ page }) => {
  await page.goto(`/revisao/${TOKEN}`);
  await expect(page.getByText('Prévia para aprovação').first()).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Navegação principal' })).toHaveCount(0);
  await expect(page.locator('header.top-bar')).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('.banner code')).toHaveText(/^[0-9a-f]{8}$/);
  // O mesmo jornal que o público vai ler
  await expect(page.getByRole('heading', { level: 1, name: 'A Sanguessuga' })).toBeVisible();
  // O que o editor mudou: o que pede resposta vem primeiro
  const grupos = page.locator('.changes .kind');
  await expect(grupos.first()).toContainText('Para você conferir');
  await expect(page.getByRole('heading', { name: 'Sebna e os filhos' })).toBeVisible();
  await expect(page.getByText('Sebna o tesoureiro foi arrastado pra miséria')).toBeVisible();
});

test('o autor aprova uma versão: precisa autorizar, recebe a mensagem para o editor e a decisão fica guardada', async ({ page }) => {
  await page.goto(`/revisao/${TOKEN}`);
  const aprovar = page.getByRole('button', { name: 'Aprovar para publicação' });
  await expect(aprovar).toBeDisabled();
  await expect(page.getByLabel(/Seu nome/)).toHaveValue('Lucas Silva');
  await page.getByLabel(/Li o sermão e autorizo/).check();
  await expect(aprovar).toBeEnabled();
  await aprovar.click();
  const enviada = page.locator('.sent');
  await expect(enviada).toContainText('Aprovação do sermão');
  await expect(enviada).toContainText('autorizo a publicação');
  const versao = (await page.locator('.banner code').textContent())!;
  await expect(enviada).toContainText(`Versão do texto: ${versao}`);
  await expect(enviada.getByRole('link', { name: /WhatsApp/ })).toHaveAttribute('href', /^https:\/\/wa\.me\/\?text=/);
  // Volta depois: a decisão está guardada neste aparelho e vale para esta versão
  await page.reload();
  await expect(page.getByRole('status').filter({ hasText: 'Você aprovou esta versão' })).toBeVisible();
});

test('o autor pede ajustes: só com a descrição do que quer mudar', async ({ page }) => {
  await page.goto(`/revisao/${TOKEN}`);
  const pedir = page.getByRole('button', { name: 'Pedir ajustes' });
  await expect(pedir).toBeDisabled();
  await page.getByLabel(/Ajustes que você quer/).fill('Na parte II, trocar “basta” por “chega”.');
  await expect(pedir).toBeEnabled();
  await pedir.click();
  await expect(page.locator('.sent')).toContainText('Pedido de ajustes');
  await expect(page.locator('.sent')).toContainText('trocar “basta” por “chega”');
  await expect(page.locator('.sent')).not.toContainText('autorizo');
});

test('um link de revisão inventado não abre nada', async ({ page }) => {
  await page.goto('/revisao/0000000000000000');
  await expect(page.getByRole('heading', { name: 'Este link não é válido' })).toBeVisible();
  await expect(page.getByText('Sanguessuga')).toHaveCount(0);
});

test('nenhuma tela do app leva ao link de revisão do autor', async ({ page }) => {
  for (const rota of ['/', '/ensino', '/vozes', `/vozes/${ID}`, '/historia', '/meu-espaco', '/busca']) {
    await page.goto(rota);
    await page.waitForLoadState('networkidle');
    expect(await page.locator('a[href*="revisao"]').count(), `${rota} tem um link para a revisão`).toBe(0);
  }
});
