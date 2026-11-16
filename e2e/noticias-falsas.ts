import type { Page } from '@playwright/test';

/** Notícias de mentira e estáveis para os testes: nada depende da internet nem dos sites das fontes. */
const CORS = { 'access-control-allow-origin': '*' };
/** Um PNG de 1×1 pixel: as miniaturas “carregam” sem sair da máquina. */
const PIXEL = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');

export const FAKE_WP = [
  { id: 1, date_gmt: '2026-11-16T11:00:00', link: 'https://portasabertas.org.br/noticias/teste-um/', title: { rendered: 'Cristãos deslocados &#8211; teste um' }, content: { rendered: '<p>Texto longo.</p>' }, meta: { subtitulo: 'Resumo do teste um da Portas Abertas', imagem_miniatura: 'https://imagens.teste/um.png' } },
  { id: 2, date_gmt: '2026-11-14T11:00:00', link: 'https://portasabertas.org.br/noticias/teste-dois/', title: { rendered: 'Igreja perseguida: teste dois' }, content: { rendered: '' }, meta: { subtitulo: 'Resumo do teste dois', imagem_miniatura: '' } },
];

const RSS: Record<string, unknown[]> = {
  'https://guiame.com.br/rss': [
    { title: 'Missionária chega à aldeia: teste três', link: 'http://guiame.com.br/gospel/teste-tres.html', pubDate: '2026-11-15 20:08:32', description: '<a href="/x"><img src="https://imagens.teste/tres.png" alt=""></a><p>Uma missionária viajou. Resumo do teste três.</p>', categories: ['Missões / Ação Social'] },
    { title: 'Show de louvor lota o estádio', link: 'http://guiame.com.br/gospel/fora-do-assunto.html', pubDate: '2026-11-15 19:00:00', description: '<p>Nada a ver com o assunto.</p>', categories: ['Música'] },
    // A mesma matéria da Portas Abertas, com o endereço escrito de outro jeito: não pode aparecer duas vezes
    { title: 'Cristãos deslocados – teste um', link: 'https://www.portasabertas.org.br/noticias/teste-um', pubDate: '2026-11-16 12:00:00', description: '<p>Repetida.</p>', categories: [] },
  ],
  'https://goodprime.co/feed/': [],
  'https://www.vozdosmartires.pt/feed/': [
    { title: 'Mártires de hoje: teste quatro', link: 'https://www.vozdosmartires.pt/teste-quatro/', pubDate: '2026-11-10 09:05:46', description: '<p>Resumo do teste quatro.</p>', categories: [] },
  ],
};

export interface NewsMocks {
  /** Falha ao vivo (sem internet): a tela deve usar data/noticias.json. */
  offline?: boolean;
  /** Só estas fontes (por endereço de feed) falham nos proxies. */
  failFeeds?: string[];
}

/** Põe as respostas falsas das fontes e dos proxies. Chamada de novo com outras opções, a última vale. */
export async function mockNews(page: Page, opts: NewsMocks = {}) {
  await page.route('https://imagens.teste/**', (route) => route.fulfill({ status: 200, headers: CORS, contentType: 'image/png', body: PIXEL }));
  await page.route('https://portasabertas.org.br/wp-json/**', (route) =>
    opts.offline ? route.abort('internetdisconnected') : route.fulfill({ status: 200, headers: CORS, contentType: 'application/json', body: JSON.stringify(FAKE_WP) }),
  );
  await page.route('https://api.rss2json.com/**', (route) => {
    const feed = new URL(route.request().url()).searchParams.get('rss_url') ?? '';
    if (opts.offline || opts.failFeeds?.includes(feed)) return route.fulfill({ status: 500, headers: CORS, body: 'erro' });
    return route.fulfill({ status: 200, headers: CORS, contentType: 'application/json', body: JSON.stringify({ status: 'ok', feed: { url: feed }, items: RSS[feed] ?? [] }) });
  });
  // O segundo serviço da lista: nos testes, está sempre fora do ar
  await page.route('https://api.allorigins.win/**', (route) => route.fulfill({ status: 520, headers: CORS, body: 'erro' }));
}
