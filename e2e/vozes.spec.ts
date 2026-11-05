import { expect, goToTab, test } from './base';

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

test('o sermão aparece no Jornal (aba própria), fora do menu Ensino, e abre pelo link direto', async ({ page }) => {
  await page.goto('/ensino');
  await expect(page.getByRole('link', { name: /Novas Vozes da Palavra/ })).toHaveCount(0);
  await goToTab(page, 'Jornal');
  await expect(page).toHaveURL(/\/vozes$/);
  // Duas seções separadas; só a dos sermões tem matéria por enquanto
  await expect(page.getByRole('heading', { level: 2, name: 'Sermões' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Pregações' })).toHaveCount(0);
  await expect(page.getByText('Novo', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: /A Sanguessuga/ }).click();
  await expect(page).toHaveURL(new RegExp(`/vozes/${ID}$`));
  await expect(page.getByRole('heading', { level: 1, name: 'A Sanguessuga' })).toBeVisible();
  // Publicado: pode ser achado por buscadores
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Novas Vozes da Palavra' })).toBeVisible();
});

test('o ícone do jornal pisca enquanto há matéria nova e para depois de abrir', async ({ page }) => {
  await page.goto('/');
  const jornal = page.getByRole('navigation', { name: 'Navegação principal' }).locator('.nav-item', { hasText: 'Jornal' });
  await expect(jornal).toHaveClass(/fresh/);
  await expect(jornal.locator('.dot')).toBeVisible();
  await expect(jornal.locator('.label')).toHaveText('Jornal');
  expect(await jornal.locator('.indicator').evaluate((el) => getComputedStyle(el).animationName), 'pisca').toMatch(/news-pulse$/);
  // Com movimento reduzido, o ícone não pisca, mas o ponto dourado continua
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await jornal.locator('.indicator').evaluate((el) => getComputedStyle(el).animationName), 'sem piscar').toBe('none');
  await expect(jornal.locator('.dot')).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  // Abrir a matéria apaga o aviso, e ele não volta ao recarregar
  await goToTab(page, 'Jornal');
  await page.getByRole('link', { name: /A Sanguessuga/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'A Sanguessuga' })).toBeVisible();
  await expect(jornal).not.toHaveClass(/fresh/);
  await expect(jornal.locator('.dot')).toHaveCount(0);
  await page.reload();
  await expect(jornal).not.toHaveClass(/fresh/);
  expect(await page.evaluate(() => localStorage.getItem('biblia.vozes.vistas'))).toBe(JSON.stringify([ID]));
});

test('Ensino sem IBUC nem Minhas aulas da revista no menu; as telas continuam abrindo pelo endereço', async ({ page }) => {
  await page.goto('/ensino');
  await expect(page.getByRole('heading', { level: 1, name: 'Ensino' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Instituto Bíblico Único Caminho/ })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /Minhas aulas da revista/ })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'IBUC' })).toHaveCount(0);
  // O que ficou: apoio ao professor e os sermões do próprio usuário
  await expect(page.getByRole('link', { name: /Apoio ao professor/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Meus sermões/ })).toBeVisible();
  for (const rota of ['/ibuc', '/ebd']) {
    await page.goto(rota);
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
  }
});

test('o sermão é um jornal: manchete, autoria, texto-base, as quatro ilustrações e o texto da imagem do autor', async ({ page }) => {
  await page.goto(`/vozes/${ID}`);
  await expect(page.getByText('Novas Vozes da Palavra').first()).toBeVisible();
  await expect(page.getByText('Por Lucas Silva')).toBeVisible();
  // O retrato do autor, à direita do título, carregou de verdade e fica na altura do título
  const retrato = page.locator('.head .title-row .author-photo');
  await expect(retrato).toBeVisible();
  expect(await retrato.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0), 'o retrato carregou').toBe(true);
  const [foto, titulo] = await Promise.all([retrato.boundingBox(), page.getByRole('heading', { level: 1 }).boundingBox()]);
  expect(foto!.x, 'o retrato fica à direita do título').toBeGreaterThan(titulo!.x + 100);
  expect(foto!.y, 'o retrato fica na mesma faixa do título').toBeLessThan(titulo!.y + titulo!.height);
  await expect(page.getByText('Texto-base')).toBeVisible();
  await expect(page.locator('.base')).toContainText('A sanguessuga tem duas filhas');
  for (const nome of [/Ilustração de uma sanguessuga/, /A sanguessuga e as suas duas filhas/, /O caminho de Tiago 1/, /A fonte de água viva/]) {
    await expect(page.getByRole('img', { name: nome })).toBeVisible();
  }
  // As três partes e o fim do sermão (o que estava na imagem)
  await expect(page.getByRole('heading', { level: 2 })).toHaveCount(3);
  await expect(page.getByText('Se alguém tem sede, venha a mim e beba')).toBeVisible();
  await expect(page.getByText('Hoje Deus o chama para uma nova realidade').first()).toBeVisible();
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

test('o link de aprovação deixa de abrir o sermão depois da publicação', async ({ page }) => {
  await page.goto(`/revisao/${TOKEN}`);
  await expect(page.getByRole('heading', { name: 'Este link não é válido' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Navegação principal' })).toHaveCount(0);
  await expect(page.locator('header.top-bar')).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.getByRole('heading', { level: 1, name: 'A Sanguessuga' })).toHaveCount(0);
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
