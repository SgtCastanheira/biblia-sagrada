import { expect, test } from './base';
import { CHRONO_GROUPS } from '../src/app/core/bible-chronological';

test('Livros: três cartões levam à ordem cronológica, à Torá e ao Talmude', async ({ page }) => {
  await page.goto('/livros');
  const ways = page.getByRole('navigation', { name: 'Outras maneiras de ler' });
  await expect(ways.getByRole('link')).toHaveCount(3);
  await ways.getByRole('link', { name: /Ordem Cronológica/ }).click();
  await expect(page).toHaveURL(/\/cronologica$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('A Bíblia em Ordem Cronológica');
});

test('Cronológica: começa em Gênesis 1 e o próximo segue a ordem dos fatos (Babel, depois Jó, depois Abraão)', async ({ page }) => {
  await page.goto('/cronologica');
  await expect(page.getByText('0 de 1189 capítulos lidos').first()).toBeVisible();
  await page.getByRole('link', { name: /Começar em Gênesis 1/ }).click();
  await expect(page).toHaveURL(/\/ler\/GEN\/1\?ordem=cronologica/);
  const bar = page.getByRole('link', { name: /Ordem cronológica: ver todas as seções/ });
  await expect(bar).toContainText('A Criação, a Queda, o Dilúvio e Babel');
  await expect(bar).toContainText('1/1189');

  // Gênesis 11 → Jó 1 → ... → Jó 42 → Gênesis 12
  await page.goto('/ler/GEN/11?ordem=cronologica');
  await page.locator('.nav-card.next').click();
  await expect(page).toHaveURL(/\/ler\/JOB\/1\?ordem=cronologica/);
  await expect(page.getByRole('link', { name: /Ordem cronológica: ver todas as seções/ })).toContainText('Jó, o Justo que Sofreu');
  await page.goto('/ler/JOB/42?ordem=cronologica');
  await page.locator('.nav-card.next').click();
  await expect(page).toHaveURL(/\/ler\/GEN\/12\?ordem=cronologica/);
  await expect(page.locator('.chapter-number')).toHaveText('12');
  // a página nova chega virando (600 ms); um toque durante a virada não vale, como na leitura de sempre
  await expect(page.locator('article.book-page')).not.toHaveClass(/turn-/);
  await page.locator('.nav-card:not(.next)').click();
  await expect(page).toHaveURL(/\/ler\/JOB\/42\?ordem=cronologica/);
});

test('Leitor: sem ?ordem= a leitura segue a ordem da Bíblia, como sempre', async ({ page }) => {
  await page.goto('/ler/GEN/11');
  await expect(page.getByRole('link', { name: /Ordem cronológica: ver todas as seções/ })).toHaveCount(0);
  await page.locator('.nav-card.next').click();
  await expect(page).toHaveURL(/\/ler\/GEN\/12$/);
});

test('Cronológica: o progresso conta os capítulos lidos, e “Continuar” vai ao primeiro que falta', async ({ page }) => {
  // quem leu Gênesis 1 a 11 continua em Jó 1, na ordem dos fatos
  await page.addInitScript(() => localStorage.setItem('biblia.settings.readChapters', JSON.stringify({ GEN: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] })));
  await page.goto('/cronologica');
  await expect(page.getByText('11 de 1189 capítulos lidos').first()).toBeVisible();
  await expect(page.getByRole('link', { name: /Continuar em Jó 1/ })).toBeVisible();
  // a fase que se está lendo (Jó e os patriarcas) fica escolhida; a primeira, já lida, mostra 11/11
  const tiles = page.getByRole('navigation', { name: 'Fases da história' });
  await expect(tiles.getByRole('button', { name: /Jó e os Patriarcas/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(tiles.getByRole('button', { name: /No Princípio/ })).toHaveAttribute('aria-pressed', 'false');
  await expect(tiles.getByRole('button', { name: /No Princípio/ })).toContainText('11/11');
  const region = page.getByRole('region', { name: 'Seções de Jó e os Patriarcas' });
  await expect(region).toBeVisible();
  // o bloco em que a pessoa parou ganha o selo “Continue aqui”
  await expect(region.locator('li.next')).toContainText('Jó, o Justo que Sofreu');
  await expect(region.locator('li.next')).toContainText('Continue aqui');
  await expect(region.locator('li.next')).toHaveCount(1);
});

test('Cronológica: a jornada conecta as fases, compara tempo e leitura e acompanha a seleção por toque e teclado', async ({ page }) => {
  await page.goto('/cronologica');
  const timeline = page.getByRole('region', { name: 'Linha do tempo' });
  const phases = timeline.getByRole('navigation', { name: 'Fases da história' });
  const buttons = phases.locator('button.tile');
  await expect(buttons).toHaveCount(11);
  await expect(phases.locator('.journey-lane')).toHaveCount(3);
  for (const [index, count] of [4, 4, 3].entries()) {
    await expect(phases.locator('.journey-lane').nth(index).locator('button.tile')).toHaveCount(count);
  }
  expect(await buttons.locator('.t-name').allTextContents()).toEqual(CHRONO_GROUPS.map((group) => group.name));
  expect(await buttons.locator('.t-sub').allTextContents()).toEqual(CHRONO_GROUPS.map((group) => group.period));
  await expect(phases.locator('button.tile.on')).toHaveCount(1);
  await expect(phases.getByRole('button', { name: /No Princípio/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(timeline.locator('.phase-detail')).toContainText('No Princípio');

  // A jornada mostra a sequência. As durações e proporções continuam no comparador, recolhido inicialmente.
  const comparison = timeline.locator('details.tl-comparison');
  await expect(comparison.locator('.band')).toBeHidden();
  await comparison.getByText('Comparar tempo e leitura', { exact: true }).click();
  await expect(comparison.locator('.band .seg')).toHaveCount(10);
  await expect(comparison.locator('.tl-text .seg')).toHaveCount(11);
  await expect(comparison.getByText(/ampliada cerca de \d vezes/)).toBeVisible();
  await expect(comparison.locator('.tl-caption')).toContainText('No Princípio não tem data certa');
  await phases.getByRole('button', { name: /A Vida de Jesus/ }).click();
  await expect(timeline.locator('.phase-detail')).toContainText('A Vida de Jesus');
  await expect(comparison.locator('.tl-caption')).toContainText('A Vida de Jesus ocupa cerca de 2% do tempo e cerca de 7% do texto (89 capítulos)');
  await expect(comparison.locator('.band .seg.on')).toHaveCount(1);
  await expect(comparison.locator('.tl-text .seg.on')).toHaveCount(1);

  // O botão inclui ícone, nome e data, sem cortar o texto nem exigir um alvo pequeno.
  for (const width of [360, 1366]) {
    await page.setViewportSize({ width, height: 800 });
    const bounds = await buttons.evaluateAll((elements) => elements.map((button) => {
      const area = button.getBoundingClientRect();
      return {
        name: button.querySelector('.t-name')!.textContent,
        width: area.width,
        height: area.height,
        children: Array.from(button.querySelectorAll<HTMLElement>('.phase-icon, .t-name, .t-sub')).map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            inside: rect.left >= area.left - 1 && rect.right <= area.right + 1 && rect.top >= area.top - 1 && rect.bottom <= area.bottom + 1,
            dateSize: element.classList.contains('t-sub') ? parseFloat(getComputedStyle(element).fontSize) : null,
          };
        }),
      };
    }));
    for (const marker of bounds) {
      expect(marker.width, `${marker.name}: largura a ${width}px`).toBeGreaterThanOrEqual(44);
      expect(marker.height, `${marker.name}: altura a ${width}px`).toBeGreaterThanOrEqual(44);
      for (const child of marker.children) {
        expect(child.inside, `${marker.name}: ícone, nome ou data cortado a ${width}px`).toBe(true);
        if (child.dateSize !== null) expect(child.dateSize).toBeGreaterThanOrEqual(14);
      }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), `rolagem lateral a ${width}px`).toBeLessThanOrEqual(0);
  }

  // Explorar pelo teclado preserva a posição da página; “Ver seções” faz a navegação explícita.
  const last = phases.getByRole('button', { name: /Os Últimos Escritos/ });
  await last.focus();
  const scrollBefore = await page.evaluate(() => window.scrollY);
  await page.keyboard.press('Enter');
  await expect(last).toHaveAttribute('aria-pressed', 'true');
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  expect(Math.abs(await page.evaluate(() => window.scrollY) - scrollBefore)).toBeLessThanOrEqual(1);
  const first = phases.getByRole('button', { name: /No Princípio/ });
  await first.focus();
  await page.keyboard.press('Space');
  await expect(first).toHaveAttribute('aria-pressed', 'true');
  await phases.getByRole('button', { name: /A Volta do Exílio/ }).locator('.t-name').click();
  await expect(phases.getByRole('button', { name: /A Volta do Exílio/ })).toHaveAttribute('aria-pressed', 'true');
  await timeline.locator('.phase-detail').getByRole('button', { name: 'Ver seções', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Seções de A Volta do Exílio' })).toBeInViewport({ ratio: 0.1 });
});

const maquina = (page: import('@playwright/test').Page) => page.getByRole('region', { name: 'A Máquina do Tempo' });
const cursor = (page: import('@playwright/test').Page) => maquina(page).getByRole('slider', { name: 'Ano da viagem no tempo' });
const ano = async (page: import('@playwright/test').Page) => Number(await cursor(page).getAttribute('aria-valuenow'));

test('Máquina do tempo: um ano mostra o mapa da época, a fase, os livros, quem vivia e o que acontecia no mundo', async ({ page }) => {
  await page.goto('/cronologica?ano=-740');
  const tm = maquina(page);
  await expect(cursor(page)).toHaveAttribute('aria-valuenow', '-740');
  await expect(cursor(page)).toHaveAttribute('aria-valuetext', '740 a.C.');
  await expect(cursor(page)).toHaveAttribute('aria-valuemin', '-2000');
  await expect(cursor(page)).toHaveAttribute('aria-valuemax', '95');
  // o mapa é o da época (o Império Assírio, com Judá como vassalo), e os impérios aparecem escritos
  await expect(tm.locator('app-bible-map svg').first()).toBeVisible();
  await expect(tm.locator('.era-name')).toContainText('O Império Assírio');
  await expect(tm.locator('.powers')).toContainText('Judá (vassalo)');
  await expect(tm.locator('.era-chip')).toHaveText('O Império Assírio');
  await expect(tm.locator('.year')).toHaveText('740 a.C.');
  // na Bíblia: a fase, quanto do tempo e do texto ela ocupa, e os livros que a contam, cada um abrindo no primeiro capítulo dela
  await expect(tm.locator('.phase-line')).toContainText('Israel e Judá: Reis e Profetas');
  await expect(tm.locator('.shares')).toContainText('do tempo e');
  const livros = tm.locator('.chips:not(.people) a');
  await expect(livros.filter({ hasText: 'Isaías' })).toHaveAttribute('href', /\/ler\/ISA\/\d+\?ordem=cronologica/);
  for (const nome of ['1 Reis', '2 Reis', 'Amós', 'Oséias']) await expect(livros.filter({ hasText: nome })).toHaveCount(1);
  // quem vivia: reis e profetas do tempo de Isaías, e ninguém de outro tempo
  const vivos = tm.locator('.chips.people');
  for (const nome of ['Isaías', 'Uzias (Azarias)', 'Oseias', 'Peca', 'Jotão']) await expect(vivos.getByText(nome, { exact: true })).toBeVisible();
  await expect(vivos.getByText('Davi', { exact: true })).toHaveCount(0);
  await expect(tm.locator('.people-count, h3 .count').first()).toBeVisible();
  // o que acontecia no mundo, com o versículo quando a Bíblia conta
  await expect(tm.locator('.events')).toContainText('A queda de Samaria');
  await expect(tm.locator('.events')).toContainText('Senaqueribe cerca Jerusalém');
  await expect(tm.locator('.events .ref', { hasText: '2Rs 17.5-6' })).toBeVisible();
  // as vidas que estavam vivas neste ano acendem na faixa
  await expect(tm.locator('.bar[data-id="isaias"]')).toHaveClass(/live/);
  await expect(tm.locator('.bar[data-id="davi"]')).not.toHaveClass(/live/);
  // a página abaixo abre as seções da mesma fase
  await expect(page.getByRole('region', { name: 'Seções de Israel e Judá: Reis e Profetas' })).toBeVisible();
});

test('Máquina do tempo: o teclado viaja no tempo e aproxima a faixa, e o leitor de tela ouve o ano quando a viagem para', async ({ page }) => {
  await page.goto('/cronologica?ano=-740');
  const slider = cursor(page);
  await slider.focus();
  for (let i = 0; i < 10; i++) await page.keyboard.press('ArrowRight');
  await expect(slider).toHaveAttribute('aria-valuenow', '-730');
  await page.keyboard.press('Shift+ArrowLeft');
  await expect(slider).toHaveAttribute('aria-valuenow', '-740');
  await page.keyboard.press('PageUp');
  await expect(slider).toHaveAttribute('aria-valuenow', '-690');
  await page.keyboard.press('PageDown');
  await expect(slider).toHaveAttribute('aria-valuenow', '-740');
  await page.keyboard.press('End');
  await expect(slider).toHaveAttribute('aria-valuenow', '95');
  await expect(maquina(page).locator('.era-name')).toContainText('O mundo romano');
  await page.keyboard.press('ArrowRight'); // não passa da ponta
  await expect(slider).toHaveAttribute('aria-valuenow', '95');
  await page.keyboard.press('Home');
  await expect(slider).toHaveAttribute('aria-valuenow', '-2000');
  await expect(maquina(page).locator('.era-name')).toContainText('Os patriarcas');
  // aproximar: a faixa do mundo fica mais larga (mais pixels por ano), e afastar volta
  const largura = () => maquina(page).locator('.world').evaluate((e) => e.getBoundingClientRect().width);
  const antes = await largura();
  await page.keyboard.press('+');
  await expect.poll(largura).toBeGreaterThan(antes * 1.3);
  await page.keyboard.press('-');
  await expect.poll(largura).toBeCloseTo(antes, 0);
  // o leitor de tela ouve a viagem quando ela para, e não cada ano que passa
  await expect(maquina(page).getByRole('status')).toContainText('2000 a.C.', { timeout: 3000 });
});

test('Máquina do tempo: arrastar a faixa viaja no tempo, e tocar numa vida ou num fato vai até ele', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/cronologica?ano=-740');
  const faixa = maquina(page).locator('.ribbon');
  await faixa.scrollIntoViewIfNeeded();
  const caixa = (await faixa.boundingBox())!;
  const y = caixa.y + 20;
  const x0 = caixa.x + caixa.width / 2;
  // arrasta 300 px para a esquerda: com 3 px por ano, são cem anos para a frente
  await page.mouse.move(x0, y);
  await page.mouse.down();
  await page.mouse.move(x0 - 300, y, { steps: 12 });
  await page.waitForTimeout(160); // parou antes de soltar: sem embalo
  await page.mouse.up();
  expect(Math.abs((await ano(page)) - -640)).toBeLessThanOrEqual(3);
  // o mapa e o painel acompanharam: -640 ainda é o Império Assírio (até 612 a.C.)
  await expect(maquina(page).locator('.era-name')).toContainText('O Império Assírio');
  // um toque numa vida leva até o meio dela (Isaías: 740 a 680 a.C.)
  await page.keyboard.press('Escape');
  await cursor(page).focus();
  await page.keyboard.press('Home');
  await page.keyboard.press('PageUp');
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => ano(page)).toBe(-1949);
  await page.goto('/cronologica?ano=-700');
  await maquina(page).locator('.bar[data-id="isaias"]').click();
  await expect.poll(() => ano(page), { timeout: 4000 }).toBe(-710);
  await expect(maquina(page).locator('.chips.people').getByText('Isaías', { exact: true })).toBeVisible();
  // um toque num losango leva ao fato do mundo
  await maquina(page).locator('.mark[data-year="-586"]').click();
  await expect.poll(() => ano(page), { timeout: 4000 }).toBe(-586);
  await expect(maquina(page).locator('.events')).toContainText('queda de Jerusalém');
  await expect(maquina(page).locator('.era-name')).toContainText('O Império Babilônico');
});

test('Máquina do tempo: os fatos do mundo mostram se a Bíblia conta ou se ficaram fora dela, e dois botões filtram', async ({ page }) => {
  await page.goto('/cronologica?ano=-586');
  const tm = maquina(page);
  const lista = tm.locator('.events li');
  // a queda de Jerusalém a Bíblia conta (2 Reis 25); o eclipse de 585 a.C. e as moedas de Creso ficaram fora dela
  await expect(lista.filter({ hasText: 'A queda de Jerusalém' }).locator('.tag')).toHaveText('Na Bíblia');
  await expect(lista.filter({ hasText: 'A queda de Jerusalém' }).locator('.ref')).toBeVisible();
  await expect(lista.filter({ hasText: 'O eclipse que parou uma batalha' }).locator('.tag')).toHaveText('Fora da Bíblia');
  await expect(lista.filter({ hasText: 'O eclipse que parou uma batalha' }).locator('.ref')).toHaveCount(0);
  // na faixa, duas fileiras de marcas: losangos (a Bíblia conta) e bolinhas (fora dela)
  const dentro = await tm.locator('.mark:not(.out)').count();
  const fora = await tm.locator('.mark.out').count();
  expect(dentro).toBeGreaterThan(15);
  expect(fora).toBeGreaterThanOrEqual(12);
  // só os que ficaram fora da Bíblia
  await tm.getByRole('button', { name: 'Na Bíblia', exact: true }).click();
  await expect(tm.getByRole('button', { name: 'Na Bíblia', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await expect(tm.locator('.events .tag:not(.out)')).toHaveCount(0);
  await expect(tm.locator('.events')).toContainText('O eclipse que parou uma batalha');
  await expect(tm.locator('.mark:not(.out)')).toHaveCount(0);
  await expect(tm.locator('.mark.out')).toHaveCount(fora);
  // só os que a Bíblia conta
  await tm.getByRole('button', { name: 'Na Bíblia', exact: true }).click();
  await tm.getByRole('button', { name: 'Fora da Bíblia', exact: true }).click();
  await expect(tm.locator('.events .tag.out')).toHaveCount(0);
  await expect(tm.locator('.events')).toContainText('A queda de Jerusalém');
  await expect(tm.locator('.mark.out')).toHaveCount(0);
  // nenhum dos dois: o painel diz o que fazer
  await tm.getByRole('button', { name: 'Na Bíblia', exact: true }).click();
  await expect(tm.locator('.events-wrap')).toContainText('Escolha acima quais fatos mostrar');
});

test('Máquina do tempo: nos 400 anos de silêncio não há livro, e o painel diz isso e leva ao período', async ({ page }) => {
  await page.goto('/cronologica?ano=-300');
  const tm = maquina(page);
  await expect(tm.locator('.silence')).toContainText('Os 400 anos de silêncio');
  await expect(tm.locator('.silence')).toContainText('Nenhum livro da Bíblia foi escrito nestes anos');
  await expect(tm.locator('.silence').getByRole('link', { name: 'Conhecer este período' })).toHaveAttribute('href', /\/epocas\/entre-testamentos/);
  await expect(tm.locator('.era-name')).toContainText('Os quatro reinos dos sucessores');
  // o mundo continuou: Alexandre, Roma e Cartago, a China (todos fora da Bíblia)
  await expect(tm.locator('.events')).toContainText('Alexandre conquista o Império Persa');
  await expect(tm.locator('.events .tag').first()).toHaveText('Fora da Bíblia');
  await expect(tm.locator('.chips:not(.people) a')).toHaveCount(0);
});

test('Máquina do tempo e jornada: mexer na faixa abre as seções da fase na página, e tocar numa fase leva a faixa até ela', async ({ page }) => {
  await page.goto('/cronologica?ano=-740');
  await expect(page.getByRole('region', { name: 'Seções de Israel e Judá: Reis e Profetas' })).toBeVisible();
  // da faixa para a página: o fim da faixa é o último escrito
  await cursor(page).focus();
  await page.keyboard.press('End');
  await expect(page.getByRole('region', { name: 'Seções de Os Últimos Escritos' })).toBeVisible();
  await page.keyboard.press('PageDown'); // de 95 para 45: o tempo de Paulo
  await expect(page.getByRole('region', { name: 'Seções de A Igreja Nasce: Atos e as Cartas' })).toBeVisible();
  // da página para a faixa: tocar numa fase da jornada leva o cursor ao meio dela
  await page.getByRole('button', { name: /^A Vida de Jesus/ }).first().click();
  // o cursor desliza de 45 até o meio da fase: espera chegar à fase (não basta passar de -6 no caminho)
  await expect.poll(async () => { const a = await ano(page); return a >= -6 && a <= 30; }, { timeout: 4000 }).toBe(true);
  await expect(maquina(page).locator('.phase-line')).toContainText('A Vida de Jesus');
  await expect(maquina(page).locator('.era-name')).toContainText('O mundo romano');
  // e o salto que a página pediu não bate de volta nela: a fase continua a escolhida
  await expect(page.getByRole('region', { name: 'Seções de A Vida de Jesus' })).toBeVisible();
});

test('Máquina do tempo: ▶ viaja sozinha, pausa onde a pessoa parar, e quem pede menos movimento recebe saltos', async ({ page }) => {
  await page.goto('/cronologica?ano=-1000');
  const tm = maquina(page);
  await tm.getByRole('button', { name: 'Reproduzir a viagem' }).click();
  await expect(tm.getByRole('button', { name: 'Pausar a viagem' })).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => ano(page), { timeout: 5000 }).toBeGreaterThan(-1000 + 25); // 30 anos por segundo
  await tm.getByRole('button', { name: 'Pausar a viagem' }).click();
  const parou = await ano(page);
  await page.waitForTimeout(500);
  expect(await ano(page)).toBe(parou);
  // a velocidade muda
  await tm.getByRole('button', { name: /Velocidade/ }).click();
  await expect(tm.getByRole('button', { name: /Velocidade: 80 anos por segundo/ })).toBeVisible();
  // menos movimento: a faixa não desliza, salta de tempos em tempos (cerca de 21 anos por salto, e nunca poucos anos por vez)
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/cronologica?ano=-1000');
  await tm.getByRole('button', { name: 'Reproduzir a viagem' }).click();
  const amostras: number[] = [];
  for (let i = 0; i < 22; i++) { amostras.push(await ano(page)); await page.waitForTimeout(100); }
  const saltos = amostras.slice(1).map((v, i) => v - amostras[i]).filter((d) => d !== 0);
  expect(saltos.length, 'houve ao menos um salto em 2 s').toBeGreaterThan(0);
  for (const d of saltos) expect(d, 'cada mudança é um salto, e não um deslizar').toBeGreaterThanOrEqual(15);
  await tm.getByRole('button', { name: 'Pausar a viagem' }).click();
});

test('Máquina do tempo: cabe no celular, no tablet e no computador, com o mapa e a faixa juntos no celular', async ({ page }) => {
  for (const [width, lado] of [[360, false], [820, false], [1366, true]] as const) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/cronologica?ano=-740');
    const tm = maquina(page);
    await expect(tm.locator('app-bible-map svg').first()).toBeVisible();
    const caixa = async (sel: string) => (await tm.locator(sel).first().boundingBox())!;
    const mapa = await caixa('.map');
    const controles = await caixa('.controls');
    const faixa = await caixa('.ribbon');
    const painel = await caixa('.info');
    // tudo dentro da tela, sem rolar para o lado
    for (const [nome, b] of [['mapa', mapa], ['controles', controles], ['faixa', faixa], ['painel', painel]] as const) {
      expect(b.x, `${nome} a ${width}px`).toBeGreaterThanOrEqual(0);
      expect(b.x + b.width, `${nome} a ${width}px`).toBeLessThanOrEqual(width + 1);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), `rolagem lateral a ${width}px`).toBeLessThanOrEqual(0);
    expect(faixa.height).toBeGreaterThanOrEqual(220);
    // os controles têm altura de toque
    for (const b of await tm.locator('.controls button').all()) expect((await b.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    if (lado) {
      expect(painel.x, 'computador: painel ao lado do mapa').toBeGreaterThan(mapa.x + mapa.width - 2);
      expect(faixa.y, 'computador: faixa embaixo').toBeGreaterThan(painel.y);
    } else {
      // celular e tablet: mapa, controles, faixa e só então o painel, para ver o mapa mudar enquanto se arrasta
      expect(controles.y).toBeGreaterThan(mapa.y);
      expect(faixa.y).toBeGreaterThan(controles.y);
      expect(painel.y).toBeGreaterThan(faixa.y);
    }
  }
});

test('Contemporâneos: o bloco abre na pessoa da fase, e escolher outra mostra quem viveu na mesma época e o que a Bíblia diz', async ({ page }) => {
  await page.goto('/cronologica');
  const block = page.getByRole('region', { name: 'Quem Viveu na Mesma Época?' });
  // sem leitura nenhuma, a fase é a primeira e a pessoa é Abraão, com quem os pais e filhos dos patriarcas se cruzam
  await expect(block.locator('.who h3')).toHaveText('Abraão');
  await expect(block.locator('.who')).toContainText('c. 2000–1825 a.C.');
  await expect(block.locator('.who-basis')).toContainText('Gn 25.7');
  for (const nome of ['Isaque', 'Sara', 'Jacó', 'Melquisedeque']) await expect(block.locator('.chart .name', { hasText: nome }).first()).toBeVisible();
  // o seletor só tem os períodos, e a pessoa de cada um aparece abaixo dele
  const select = block.locator('select');
  await expect(select).toHaveValue('patriarcas');
  await expect(select.locator('option')).toHaveCount(10);
  // exatamente os nomes dos períodos (os mesmos das caixinhas lá em cima), na ordem da história, e nenhuma pessoa
  expect(await select.locator('option').allTextContents()).toEqual([
    'Jó e os Patriarcas', 'O Êxodo, a Lei e o Deserto', 'A Conquista e os Juízes', 'Samuel, Saul, Davi e Salomão', 'Israel e Judá: Reis e Profetas',
    'A Queda de Jerusalém e o Exílio', 'A Volta do Exílio', 'A Vida de Jesus', 'A Igreja Nasce: Atos e as Cartas', 'Os Últimos Escritos',
  ]);
  expect(await select.locator('optgroup').count(), 'sem grupos de pessoas no seletor').toBe(0);
  await expect(block.locator('.folk .pp', { hasText: 'Abraão' })).toHaveClass(/on/);
  // Isaías: os reis do tempo dele e, no texto, o que os livros dizem
  await select.selectOption('reino-dividido');
  await expect(block.locator('.who h3')).toHaveText('Elias'); // trocar de período já abre uma pessoa dele
  // o período tem 49 pessoas: a lista mostra as primeiras, e as demais vêm no botão
  await expect(block.locator('.folk .pp', { hasText: 'Isaías' })).toHaveCount(0);
  await block.getByRole('button', { name: /Mostrar todas/ }).click();
  await block.locator('.folk .pp', { hasText: 'Isaías' }).click();
  await expect(block.locator('.who h3')).toHaveText('Isaías');
  for (const nome of ['Uzias (Azarias)', 'Ezequias', 'Miqueias', 'Acaz']) await expect(block.locator('.chart .name', { hasText: nome }).first()).toBeVisible();
  await expect(block.locator('.chart .bar.me')).toHaveCount(1);
  await expect(block.locator('.bible')).toContainText('O livro os situa na mesma época');
  // o versículo abre na folha de baixo e traz o nome dos reis
  await block.locator('.bible .ref', { hasText: 'Is 1.1' }).click();
  await expect(page.locator('mat-bottom-sheet-container')).toContainText('Uzias');
  await page.keyboard.press('Escape');
  // tocar no nome de quem viveu na mesma época leva a ele
  await block.locator('.chart .name', { hasText: 'Ezequias' }).click();
  await expect(block.locator('.who h3')).toHaveText('Ezequias');
  // quem vem do desenho leva o seletor para o período dele (Ezequias é do mesmo), e outro período mostra as pessoas dele
  await expect(select).toHaveValue('reino-dividido');
  await select.selectOption('igreja');
  await expect(block.locator('.folk')).toContainText('Barnabé');
  await block.locator('.folk .pp', { hasText: 'Paulo' }).click();
  await expect(block.locator('.who h3')).toHaveText('Paulo');
  await expect(block.getByRole('heading', { name: /Também no século I/ })).toBeVisible();
  await expect(block.locator('.people').getByRole('button', { name: 'Pedro' })).toBeVisible();
  await expect(block.locator('.chart .name', { hasText: 'Jesus' }).first()).toBeVisible();
});

test('Contemporâneos: quem lê uma fase vê a pessoa dela, e as faixas cabem na tela do celular', async ({ page }) => {
  // quem já leu Gênesis e Jó está no Êxodo: o bloco abre em Moisés
  await page.addInitScript(() =>
    localStorage.setItem('biblia.settings.readChapters', JSON.stringify({ GEN: Array.from({ length: 50 }, (_, i) => i + 1), JOB: Array.from({ length: 42 }, (_, i) => i + 1) })),
  );
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto('/cronologica');
  const block = page.getByRole('region', { name: 'Quem Viveu na Mesma Época?' });
  await expect(block.locator('.who h3')).toHaveText('Moisés');
  await expect(block.locator('select')).toHaveValue('exodo');
  for (const nome of ['Arão', 'Miriã', 'Josué', 'Calebe']) await expect(block.locator('.chart .name', { hasText: nome }).first()).toBeVisible();
  const box = (await block.locator('.chart').boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(360);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(wide, 'rolagem lateral').toBeLessThanOrEqual(0);
  // as barras ficam dentro da faixa
  const bars = await block.locator('.track').evaluateAll((els) => els.map((e) => { const t = e.getBoundingClientRect(); const b = e.querySelector('.bar')!.getBoundingClientRect(); return [b.left - t.left, t.right - b.right]; }));
  for (const [esq, dir] of bars) { expect(esq).toBeGreaterThanOrEqual(-8); expect(dir).toBeGreaterThanOrEqual(-8); }
});

test('Contemporâneos: o seletor lista só períodos, as pessoas do período vêm abaixo em blocos, e tudo se ajusta ao celular, ao tablet e ao computador', async ({ page }) => {
  for (const [width, minPerRow] of [[360, 2], [820, 4], [1366, 6]] as const) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/cronologica');
    const block = page.getByRole('region', { name: 'Quem Viveu na Mesma Época?' });
    const select = block.locator('select');
    await expect(select).toBeVisible();
    await select.selectOption('reino-dividido');
    // o seletor cabe na tela e tem altura de toque
    const sb = (await select.boundingBox())!;
    expect(sb.x + sb.width, `seletor a ${width}px`).toBeLessThanOrEqual(width);
    expect(sb.height).toBeGreaterThanOrEqual(44);
    // são muitas pessoas (reis e profetas): a lista mostra as primeiras e oferece as demais
    const folk = block.locator('.folk .pp');
    await expect(folk).toHaveCount(18);
    const total = Number(await block.locator('.sub .count').first().textContent());
    expect(total).toBeGreaterThan(40);
    await expect(block.getByRole('button', { name: `Mostrar todas (${total})` })).toBeVisible();
    // blocos lado a lado, sem estourar nem cobrir um ao outro
    const tops = await folk.evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
    expect(tops.filter((x) => x === tops[0]).length, `blocos na primeira linha a ${width}px`).toBeGreaterThanOrEqual(minPerRow);
    const estouram = await folk.evaluateAll((els) => els.filter((e) => e.scrollWidth > e.clientWidth + 1).map((e) => e.textContent?.trim()));
    expect(estouram, `nomes maiores que o bloco a ${width}px`).toEqual([]);
    const altura = await folk.first().evaluate((e) => e.getBoundingClientRect().height);
    expect(altura).toBeGreaterThanOrEqual(40);
    const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(wide, `rolagem lateral a ${width}px`).toBeLessThanOrEqual(0);
    // abrir as demais mostra todas; fechar volta às primeiras
    await block.getByRole('button', { name: /Mostrar todas/ }).click();
    await expect(folk).toHaveCount(total);
    await block.getByRole('button', { name: 'Mostrar menos' }).click();
    await expect(folk).toHaveCount(18);
  }
});

test('Cronológica: os atalhos do alto levam aos dois blocos de baixo', async ({ page }) => {
  await page.goto('/cronologica');
  const jump = page.getByRole('navigation', { name: 'Mais nesta página' });
  await jump.getByRole('button', { name: 'Os livros na ordem' }).click();
  await expect(page.getByRole('heading', { name: 'Os Livros em Ordem Cronológica' })).toBeInViewport({ ratio: 0.5 });
  await jump.getByRole('button', { name: 'Os nomes do tempo' }).click();
  await expect(page.getByRole('heading', { name: 'Os Nomes do Tempo' })).toBeInViewport({ ratio: 0.5 });
  await jump.getByRole('button', { name: 'Quem viveu na mesma época?' }).click();
  await expect(page.getByRole('heading', { name: 'Quem Viveu na Mesma Época?' })).toBeInViewport({ ratio: 0.5 });
});

test('Livros em ordem: os 66 livros em blocos, pelos fatos (Gênesis, Jó, Êxodo… Apocalipse) ou pelo ano de escrita', async ({ page }) => {
  await page.goto('/cronologica');
  const block = page.getByRole('region', { name: 'Os Livros em Ordem Cronológica' });
  const books = block.locator('.book');
  await expect(books).toHaveCount(66);
  // pelos fatos: o primeiro capítulo de cada livro manda
  await expect(books.nth(0)).toContainText('Gênesis');
  await expect(books.nth(1)).toContainText('Jó');
  await expect(books.nth(2)).toContainText('Êxodo');
  await expect(books.nth(65)).toContainText('Apocalipse');
  await expect(books.nth(6)).toContainText('Salmos');
  await expect(books.nth(6)).toContainText('4 fases'); // Salmos atravessa as fases
  await expect(books.nth(0).locator('.n')).toHaveText('1');
  // pelo ano de escrita: os que o app não data ficam no fim, sem ano
  await block.getByRole('button', { name: 'Pelo ano em que foram escritos' }).click();
  await expect(books.nth(0)).toContainText('Gênesis');
  await expect(books.nth(0)).toContainText('c. 1440 a.C.');
  await expect(books.nth(65)).toContainText('sem ano no app');
  const semAno = await books.filter({ hasText: 'sem ano no app' }).count();
  expect(semAno).toBe(7); // Jó, Rute, 1 e 2 Samuel, Joel, Jonas e Hebreus
  await expect(books.filter({ hasText: 'Hebreus' })).toContainText('sem ano no app');
  await expect(books.filter({ hasText: 'Apocalipse' })).toContainText('c. 95 d.C.');
});

test('Livros em ordem: ao trocar de ordem, um aviso e as marcas dizem o que mudou, livro a livro', async ({ page }) => {
  await page.goto('/cronologica');
  const block = page.getByRole('region', { name: 'Os Livros em Ordem Cronológica' });
  const books = block.locator('.book');
  // a primeira vista fica limpa: nada de aviso nem de marcas antes de trocar
  await expect(block.getByRole('status')).toHaveCount(0);
  await expect(block.locator('.grid .shift')).toHaveCount(0);

  await block.getByRole('button', { name: 'Pelo ano em que foram escritos' }).click();
  const aviso = block.getByRole('status');
  await expect(aviso).toContainText('Você trocou a ordem: antes, pelos fatos que contam; agora, pelo ano em que foram escritos.');
  const texto = (await aviso.locator('.ch-sum').textContent()) ?? '';
  const mudaram = Number(texto.match(/(\d+) de 66 livros mudaram de lugar/)![1]);
  expect(mudaram).toBeGreaterThan(40);
  await expect(aviso.locator('.ch-top')).toContainText('Os que mais mudaram:');
  // cada livro que mudou ganha a seta e quantos lugares, mais o lugar de antes; quem não mudou diz que ficou
  await expect(block.locator('.grid .shift')).toHaveCount(mudaram);
  const jo = books.filter({ hasText: 'Jó' }).first();
  await expect(jo.locator('.shift')).toHaveText('▼ 58');
  await expect(jo.locator('.shift')).toHaveAttribute('aria-label', 'desceu 58 lugares: era o 2.º e agora é o 60.º');
  await expect(jo.locator('.was')).toHaveText('era o 2.º');
  await expect(jo.locator('.n')).toHaveText('60');
  const genesis = books.filter({ hasText: 'Gênesis' });
  await expect(genesis.locator('.shift')).toHaveCount(0);
  await expect(genesis.locator('.was')).toHaveText('mesmo lugar');
  // quem subiu ganha a seta para cima
  await expect(block.locator('.grid .shift.up').first()).toContainText('▲');
  await expect(block.locator('li.moved')).toHaveCount(mudaram);

  // “só os que mudaram de lugar”: o filtro esconde os que ficaram, e os números continuam os da ordem
  await aviso.getByRole('button', { name: /Só os que mudaram de lugar/ }).click();
  await expect(books).toHaveCount(mudaram);
  await expect(books.filter({ hasText: 'Gênesis' })).toHaveCount(0);
  await expect(books.filter({ hasText: 'Jó' }).first().locator('.n')).toHaveText('60');
  await aviso.getByRole('button', { name: /Só os que mudaram de lugar/ }).click();
  await expect(books).toHaveCount(66);

  // “destacar o que mudou” desliga e liga as marcas
  await aviso.getByRole('button', { name: 'Destacar o que mudou' }).click();
  await expect(block.locator('.grid .shift')).toHaveCount(0);
  await expect(block.locator('.was')).toHaveCount(0);
  await aviso.getByRole('button', { name: 'Destacar o que mudou' }).click();
  await expect(block.locator('.grid .shift')).toHaveCount(mudaram);

  // de volta aos fatos: o aviso inverte, e quem desceu agora sobe
  await block.getByRole('button', { name: 'Pelos fatos que contam' }).click();
  await expect(aviso).toContainText('antes, pelo ano em que foram escritos; agora, pelos fatos que contam.');
  await expect(books.filter({ hasText: 'Jó' }).first().locator('.shift')).toHaveAttribute('aria-label', 'subiu 58 lugares: era o 60.º e agora é o 2.º');
  await expect(block.locator('.grid .shift')).toHaveCount(mudaram);
});

test('Livros em ordem: os livros que mudaram piscam uma vez ao trocar, e quem pede menos movimento fica só com a marca parada', async ({ page }) => {
  await page.goto('/cronologica');
  const block = page.getByRole('region', { name: 'Os Livros em Ordem Cronológica' });
  const animacao = () => block.locator('li.moved .book').first().evaluate((e) => getComputedStyle(e).animationName);
  await block.getByRole('button', { name: 'Pelo ano em que foram escritos' }).click();
  await expect.poll(animacao).toMatch(/shifted$/); // o Angular põe um prefixo no nome do quadro-chave
  await expect.poll(animacao, { timeout: 4000 }).toBe('none'); // pisca uma vez e para
  // com “menos movimento”, não pisca (as marcas continuam lá)
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await block.getByRole('button', { name: 'Pelos fatos que contam' }).click();
  expect(await animacao()).toBe('none');
  await expect(block.locator('.grid .shift').first()).toBeVisible();
});

test('Livros em ordem: o aviso do que mudou cabe no celular, com botões de toque e sem rolar para o lado', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto('/cronologica');
  const block = page.getByRole('region', { name: 'Os Livros em Ordem Cronológica' });
  await block.getByRole('button', { name: 'Pelo ano em que foram escritos' }).click();
  const aviso = block.getByRole('status');
  await expect(aviso).toBeVisible();
  const caixa = (await aviso.boundingBox())!;
  expect(caixa.x).toBeGreaterThanOrEqual(0);
  expect(caixa.x + caixa.width).toBeLessThanOrEqual(360);
  for (const nome of ['Destacar o que mudou', /Só os que mudaram de lugar/]) {
    const b = (await aviso.getByRole('button', { name: nome }).boundingBox())!;
    expect(b.height, String(nome)).toBeGreaterThanOrEqual(40);
  }
  // as marcas não estouram o bloco, nem os números de dois dígitos junto da seta
  const estouram = await block.locator('.book').evaluateAll((els) => els.filter((e) => e.scrollWidth > e.clientWidth + 1).map((e) => e.textContent?.trim()));
  expect(estouram, 'blocos com texto maior que o bloco').toEqual([]);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(wide, 'rolagem lateral').toBeLessThanOrEqual(0);
});

test('Livros em ordem: o filtro pela maneira de marcar o tempo mostra só esses livros, com o número da ordem de sempre', async ({ page }) => {
  await page.goto('/cronologica');
  const block = page.getByRole('region', { name: 'Os Livros em Ordem Cronológica' });
  await block.getByRole('button', { name: /A abertura não dá data/ }).click();
  const books = block.locator('.book');
  await expect(books).toHaveCount(7);
  const nomes = await books.locator('strong').allTextContents();
  expect(nomes).toEqual(expect.arrayContaining(['Jó', 'Joel', 'Obadias', 'Jonas', 'Naum', 'Habacuque', 'Malaquias']));
  // o número é o lugar do livro na ordem dos fatos, e não a posição na lista filtrada
  await expect(books.filter({ hasText: 'Jó' }).locator('.n')).toHaveText('2');
  await block.getByRole('button', { name: /Todos os livros/ }).click();
  await expect(books).toHaveCount(66);
});

test('Livros em ordem: tocar num livro mostra por onde ele passa, quando foi escrito e como marca o tempo, com versículos que abrem', async ({ page }) => {
  await page.goto('/cronologica');
  const block = page.getByRole('region', { name: 'Os Livros em Ordem Cronológica' });
  await block.locator('.book', { hasText: 'Gálatas' }).click();
  const detail = block.locator('.detail');
  await expect(detail).toContainText('n.º 46 na ordem dos fatos');
  await expect(detail).toContainText('Começa em Gl 1 (capítulo n.º 1.038 de 1.189');
  await expect(detail).toContainText('c. 48–55 d.C.');
  await expect(detail.locator('.ph')).toContainText('A Igreja Nasce');
  const gl44 = detail.locator('.marks li', { hasText: 'Gl 4.4' });
  await expect(gl44).toContainText('vindo a plenitude dos tempos');
  await expect(gl44.locator('.word')).toHaveText('cronos');
  await gl44.locator('.ref').click();
  await expect(page.locator('mat-bottom-sheet-container')).toContainText('plenitude');
  await page.keyboard.press('Escape');
  // abre uma vez e fecha de novo
  await block.locator('.book', { hasText: 'Gálatas' }).click();
  await expect(detail).toHaveCount(0);
  // um livro que atravessa várias fases e um que o app ainda não marcou
  await block.locator('.book', { hasText: 'Isaías' }).click();
  await expect(block.locator('.detail .ph').first()).toBeVisible();
  expect(await block.locator('.detail .ph').count()).toBeGreaterThan(1);
  await block.locator('.book', { hasText: 'Tiago' }).first().click();
  await expect(block.locator('.detail .none')).toContainText('ainda não registrou');
  // “ler na ordem cronológica” leva ao primeiro capítulo, com a ordem ligada
  await block.locator('.book', { hasText: 'Gálatas' }).click();
  await block.getByRole('link', { name: 'Ler na ordem cronológica' }).click();
  await expect(page).toHaveURL(/\/ler\/GAL\/1\?ordem=cronologica/);
});

test('Livros em ordem: o livro lido por inteiro ganha o sinal, e os blocos cabem no celular', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('biblia.settings.readChapters', JSON.stringify({ OBA: [1], PHM: [1] })));
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto('/cronologica');
  const block = page.getByRole('region', { name: 'Os Livros em Ordem Cronológica' });
  await expect(block.locator('.book', { hasText: 'Obadias' }).getByLabel('Livro lido')).toBeVisible();
  await expect(block.locator('.book', { hasText: 'Filemom' }).getByLabel('Livro lido')).toBeVisible();
  await expect(block.getByLabel('Livro lido')).toHaveCount(2);
  // duas colunas ou mais, sem rolar para o lado, e cada bloco tem altura de toque
  const tops = await block.locator('.book').evaluateAll((els) => els.slice(0, 6).map((e) => Math.round(e.getBoundingClientRect().top)));
  expect(tops.filter((t) => t === tops[0]).length).toBeGreaterThanOrEqual(2);
  // nenhum nome estoura o bloco (a palavra mais longa é “Tessalonicenses”)
  const estouram = await block.locator('.book').evaluateAll((els) => els.filter((e) => e.scrollWidth > e.clientWidth + 1).map((e) => e.textContent?.trim()));
  expect(estouram, 'blocos com texto maior que o bloco').toEqual([]);
  const altura = await block.locator('.book').first().evaluate((e) => e.getBoundingClientRect().height);
  expect(altura).toBeGreaterThanOrEqual(40);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(wide, 'rolagem lateral').toBeLessThanOrEqual(0);
});

test('Nomes do tempo: quatro palavras do grego e quatro do hebraico, com os versículos que se abrem', async ({ page }) => {
  await page.goto('/cronologica');
  const block = page.getByRole('region', { name: 'Os Nomes do Tempo' });
  await expect(block.locator('.card')).toHaveCount(8);
  const cronos = block.locator('.card', { hasText: 'G5550' });
  await expect(cronos).toContainText('χρόνος');
  await expect(cronos).toContainText('O tempo que passa');
  await expect(block.locator('.card', { hasText: 'G2540' })).toContainText('καιρός');
  await expect(block.locator('.card', { hasText: 'G2540' })).toContainText('O tempo certo');
  // o hebraico se escreve da direita para a esquerda
  const olam = block.locator('.card.he', { hasText: 'H5769' });
  await expect(olam.locator('.script')).toHaveAttribute('dir', 'rtl');
  await expect(olam.locator('.script')).toHaveAttribute('lang', 'he');
  await expect(block.locator('.card.he')).toHaveCount(4);
  // o versículo onde a Almeida traduz cronos por “demora”
  await cronos.locator('.ref', { hasText: 'Ap 10.6' }).click();
  await expect(page.locator('mat-bottom-sheet-container')).toContainText('demora');
  await page.keyboard.press('Escape');
  // as comparações e o aviso de que a diferença é de ênfase
  await expect(block.locator('.cmp')).toHaveCount(5);
  await expect(block.locator('.cmp', { hasText: 'Cronos e Kairós no Mesmo Verso' })).toContainText('dos tempos e das épocas');
  await expect(block.locator('.caution')).toContainText('de ênfase, não uma regra sem exceção');
  // sem rolar para o lado no celular
  await page.setViewportSize({ width: 360, height: 780 });
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(wide, 'rolagem lateral a 360px').toBeLessThanOrEqual(0);
});

test('Cronológica: no celular as fases seguem uma linha vertical, sem deslizar para o lado', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto('/cronologica');
  const row = page.getByRole('navigation', { name: 'Fases da história' });
  await expect(row.locator('.tile')).toHaveCount(12);
  const buttons = row.locator('button.tile');
  const boxes = await buttons.evaluateAll((elements) => elements.map((element) => {
    const rect = element.getBoundingClientRect();
    const icon = element.querySelector('.phase-icon')!.getBoundingClientRect();
    return { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, iconX: icon.left + icon.width / 2 };
  }));
  for (let i = 1; i < boxes.length; i++) {
    expect(boxes[i].top, 'fases em sequência vertical, sem sobreposição').toBeGreaterThanOrEqual(boxes[i - 1].bottom);
    expect(Math.abs(boxes[i].iconX - boxes[0].iconX), 'ícones alinhados no mesmo eixo vertical').toBeLessThanOrEqual(1);
  }
  for (const box of boxes) {
    expect(box.left).toBeGreaterThanOrEqual(0);
    expect(box.right).toBeLessThanOrEqual(360);
  }
  // A última fase é alcançada por rolagem normal da página, e continua selecionável.
  const last = row.getByRole('button', { name: /Os Últimos Escritos/ });
  await last.scrollIntoViewIfNeeded();
  await last.click();
  await expect(last).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('region', { name: 'Seções de Os Últimos Escritos' })).toBeVisible();
  const box = (await last.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(360);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(wide, 'a jornada não exige rolagem horizontal').toBeLessThanOrEqual(0);
});

test('Cronológica: escolher uma fase mostra suas seções e preserva os avisos de escolha', async ({ page }) => {
  await page.goto('/cronologica');
  const tiles = page.getByRole('navigation', { name: 'Fases da história' });
  await tiles.getByRole('button', { name: /Jó e os Patriarcas/ }).click();
  const group = page.getByRole('region', { name: 'Seções de Jó e os Patriarcas' });
  const job = group.getByRole('link', { name: /Jó, o Justo que Sofreu/ });
  await expect(job).toContainText('Jó 1–42');
  // o aviso “É uma escolha” fica no bloco, e o texto dele só aparece quando se abre
  const why = group.locator('.why').first();
  await expect(why.locator('summary')).toBeVisible();
  await expect(why.locator('p')).toBeHidden();
  await why.locator('summary').click();
  await expect(why.locator('p')).toContainText('O livro não diz quando se passa');
  await job.click();
  await expect(page).toHaveURL(/\/ler\/JOB\/1\?ordem=cronologica/);
});

test('Cronológica: a jornada adapta as fases ao celular e computador sem apertar as seções', async ({ page }) => {
  for (const [width, phasesPerRow, sectionsPerRow] of [[360, 1, 2], [820, 1, 3], [1366, 4, 4]] as const) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/cronologica');
    const tiles = page.getByRole('navigation', { name: 'Fases da história' });
    // A jornada tem uma coluna no celular e tablet; em tela larga, quatro fases por trecho.
    await expect(tiles.locator('.tile')).toHaveCount(12); // 11 fases e o intervalo dos 400 anos
    const tileTops = await tiles.locator('.phase-list').first().locator('button.tile').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
    expect(tileTops.filter((t) => Math.abs(t - tileTops[0]) < 4).length, `fases na primeira linha a ${width}px`).toBe(phasesPerRow);
    // as seções da fase escolhida também (Jó e os patriarcas tem 4)
    await tiles.getByRole('button', { name: /Jó e os Patriarcas/ }).click();
    const cards = page.getByRole('region', { name: 'Seções de Jó e os Patriarcas' }).locator('.card');
    await expect(cards).toHaveCount(4);
    const tops = await cards.evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
    expect(tops.filter((t) => Math.abs(t - tops[0]) < 4).length, `blocos na primeira linha a ${width}px`).toBeGreaterThanOrEqual(sectionsPerRow);
    const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(wide, `rolagem lateral a ${width}px`).toBeLessThanOrEqual(0);
  }
});

test('Cronológica: o intervalo dos 400 anos leva à época entre os Testamentos', async ({ page }) => {
  await page.goto('/cronologica');
  await page.getByRole('link', { name: /Os 400 Anos de Silêncio/ }).click();
  await expect(page).toHaveURL(/\/epocas\/entre-testamentos/);
});

test('Torá: 54 porções em cinco livros, e cada porção abre o capítulo em que começa', async ({ page }) => {
  await page.goto('/tora');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('A Torá');
  await expect(page.locator('.book')).toHaveCount(5);
  await expect(page.locator('.book li')).toHaveCount(54);
  const lech = page.locator('.book li', { hasText: 'Lech Lecha' });
  await expect(lech).toContainText('Gn 1' + '2.1 – 17.27');
  await lech.getByRole('link').click();
  await expect(page).toHaveURL(/\/ler\/GEN\/12$/);

  // uma porção que começa no meio de um capítulo abre no versículo
  await page.goto('/tora');
  await page.locator('.book li', { hasText: 'Vayishlach' }).getByRole('link').click();
  await expect(page).toHaveURL(/\/ler\/GEN\/32#v3$/);
});

test('Torá: o hebraico das porções aparece da direita para a esquerda', async ({ page }) => {
  await page.goto('/tora');
  const he = page.locator('.book li').first().locator('[lang="he"]');
  await expect(he).toHaveText('בראשית');
  await expect(he).toHaveAttribute('dir', 'rtl');
});

test('Talmude: o que o app traz e não traz, os cinco trechos e as seis ordens', async ({ page }) => {
  await page.goto('/talmude');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('O Talmude');
  await expect(page.getByText('O texto completo do Talmude não está aqui')).toBeVisible();
  await expect(page.locator('article.passage')).toHaveCount(5);
  await expect(page.locator('details.seder')).toHaveCount(6);

  // a Mishná de Berakhot tem os dois endereços (Mishná e Guemará); Peá só o da Mishná
  const zeraim = page.locator('details.seder').first();
  await zeraim.locator('summary').click();
  const berakhot = zeraim.locator('li', { hasText: 'Berakhot' });
  await expect(berakhot.getByRole('link', { name: /Guemará/ })).toHaveAttribute('href', 'https://www.sefaria.org/Berakhot');
  await expect(berakhot.getByRole('link', { name: /Mishná/ })).toHaveAttribute('href', 'https://www.sefaria.org/Mishnah_Berakhot');
  const pea = zeraim.locator('li', { hasText: 'O canto do campo' });
  await expect(pea.getByRole('link', { name: /Guemará/ })).toHaveCount(0);
  await expect(pea).toContainText('sem Guemará no Babilônico');
});

test('Talmude: todos os links para fora abrem em outra aba, sem passar a origem', async ({ page }) => {
  await page.goto('/talmude');
  await page.locator('details.seder').first().locator('summary').click();
  const links = page.locator('a[href^="https://www.sefaria.org/"]');
  expect(await links.count()).toBeGreaterThan(5);
  for (const a of await links.all()) {
    await expect(a).toHaveAttribute('target', '_blank');
    await expect(a).toHaveAttribute('rel', /noopener/);
  }
});

test('Talmude: as referências bíblicas dos trechos são passagens que se tocam', async ({ page }) => {
  await page.goto('/talmude');
  const hillel = page.locator('article.passage', { hasText: 'Hillel e a Torá em um Pé Só' });
  await expect(hillel).toContainText('Lv 19.18');
  await expect(hillel).toContainText('Mt 7.12');
});

test('Estudos: A Torá e O Talmude abrem, têm os tópicos na capa e ligam às telas', async ({ page }) => {
  await page.goto('/artigo/tora');
  await expect(page.getByRole('heading', { level: 1 }).first()).toContainText('A Torá: Instrução, e Não Só Lei');
  await expect(page.getByRole('link', { name: 'A Torá', exact: true }).first()).toHaveAttribute('href', '/tora');
  await page.goto('/artigo/talmude');
  await expect(page.getByRole('heading', { level: 1 }).first()).toContainText('O Talmude: Séculos de Conversa em Volta da Torá');
  await expect(page.getByRole('link', { name: 'O Talmude', exact: true }).first()).toHaveAttribute('href', '/talmude');
});

test('Estante: “A Bíblia dos Judeus” tem os três livros, numerados na ordem', async ({ page }) => {
  await page.goto('/historia');
  const shelf = page.locator('#bay-sobre-a-biblia');
  const livros = shelf.getByRole('button', { name: /^Livro: (A Bíblia Judaica|A Torá: Instrução|O Talmude: Séculos)/ });
  await expect(livros).toHaveCount(3);
  await expect(livros.nth(0)).toHaveAccessibleName(/A Bíblia Judaica.*número 1 de 3/);
  await expect(livros.nth(1)).toHaveAccessibleName(/A Torá: Instrução, e Não Só Lei, número 2 de 3/);
  await expect(livros.nth(2)).toHaveAccessibleName(/O Talmude: Séculos de Conversa em Volta da Torá, número 3 de 3/);
});
