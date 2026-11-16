import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import {
  KEYWORDS, NEWS_LIMIT, NEWS_SOURCES, PROXIES, agoLabel, decodeEntities, fromRss2Json, fromWordPress, matchesTopic, mergeNews, parseCache, parseDate,
  plainText, safeUrl, toNewsItem, type NewsItem, type NewsSource,
} from '../../src/app/core/christian-world';

/**
 * Mundo Cristão: a limpeza, o filtro, a remoção de repetidas e a ordem das notícias (código que o app e o GitHub Actions
 * compartilham) e a validade do arquivo de reserva public/data/noticias.json.
 */
const geral: NewsSource = { name: 'Site geral', site: 'https://exemplo.org', kind: 'rss', url: 'https://exemplo.org/feed', filter: true };
const dedicado: NewsSource = { ...geral, name: 'Site do assunto', filter: false };

const item = (over: Partial<NewsItem>): NewsItem => ({ titulo: 'T', resumo: '', data: '2026-11-10T10:00:00.000Z', fonte: 'F', url: 'https://a.org/x', thumbnail: null, ...over });

test('entidades HTML e etiquetas viram texto limpo, sem o rodapé do WordPress', () => {
  expect(decodeEntities('Miss&atilde;o &amp; f&eacute; &#8211; &#x2019;ok&#x2019; &hellip; &inexistente;')).toBe('Missão & fé – ’ok’ … &inexistente;');
  const html = '<p>Os cristãos&nbsp;fugiram.</p><p>Foram dias dif&iacute;ceis [&#8230;]</p><p>O post <a href="https://x.org/a">Título</a> apareceu primeiro em <a href="https://x.org">Site</a>.</p>';
  expect(plainText(html)).toBe('Os cristãos fugiram. Foram dias difíceis…');
  expect(plainText('<script>alert(1)</script><b>só isto</b>')).toBe('só isto');
});

test('só endereços http(s) servem, e o http vira https', () => {
  expect(safeUrl('http://guiame.com.br/a.html')).toBe('https://guiame.com.br/a.html');
  expect(safeUrl('javascript:alert(1)')).toBeNull();
  expect(safeUrl('data:text/html,x')).toBeNull();
  expect(safeUrl('/a.jpg', 'https://x.org/p/q')).toBe('https://x.org/a.jpg');
  expect(safeUrl('')).toBeNull();
});

test('data sem fuso vale UTC; lixo não é data', () => {
  expect(parseDate('2026-11-13 20:08:32')).toBe(Date.UTC(2026, 10, 13, 20, 8, 32));
  expect(parseDate('Fri, 24 Apr 2026 09:05:46 +0000')).toBe(Date.UTC(2026, 3, 24, 9, 5, 46));
  expect(parseDate('2026-11-16T08:00:00-03:00')).toBe(Date.UTC(2026, 10, 16, 11, 0, 0));
  expect(parseDate('ontem')).toBeNull();
  expect(parseDate(null)).toBeNull();
});

test('o filtro por palavras-chave ignora acento e caixa, e não deixa passar o que é de outro assunto', () => {
  expect(matchesTopic({ titulo: 'PERSEGUIÇÃO a cristãos na Nigéria', resumo: '' })).toBe(true);
  expect(matchesTopic({ titulo: 'Missionária chega à aldeia', resumo: '' })).toBe(true);
  expect(matchesTopic({ titulo: 'Show', resumo: 'Pastor preso por pregar' })).toBe(true);
  expect(matchesTopic({ titulo: 'Show de louvor lota o estádio', resumo: 'Uma noite de música' })).toBe(false);
  // “missão” sozinha aparece em qualquer texto de igreja
  expect(matchesTopic({ titulo: 'A missão da igreja local', resumo: '' })).toBe(false);
  expect(matchesTopic({ titulo: 'Show', resumo: '' }, ['Missões / Ação Social'])).toBe(true);
  expect(KEYWORDS.every((k) => k === k.toLowerCase() && !/[À-ÿ]/.test(k))).toBe(true);
});

test('toNewsItem: fonte geral filtra, fonte dedicada não; sem título, endereço ou data a notícia some', () => {
  const base = { title: 'Culto de domingo', link: 'http://exemplo.org/a', date: '2026-11-10 10:00:00', html: '<p>Resumo comum.</p>' };
  expect(toNewsItem(base, geral)).toBeNull();
  expect(toNewsItem(base, dedicado)).toMatchObject({ titulo: 'Culto de domingo', url: 'https://exemplo.org/a', fonte: 'Site do assunto', data: '2026-11-10T10:00:00.000Z' });
  expect(toNewsItem({ ...base, title: 'Perseguição na Índia' }, geral)).not.toBeNull();
  expect(toNewsItem({ ...base, title: '' }, dedicado)).toBeNull();
  expect(toNewsItem({ ...base, link: 'javascript:1' }, dedicado)).toBeNull();
  expect(toNewsItem({ ...base, date: 'sem data' }, dedicado)).toBeNull();
});

test('toNewsItem: resumo limpo e curto, que não repete o título; imagem do feed ou a primeira do HTML', () => {
  const longo = `<p>${'palavra '.repeat(80)}</p>`;
  const a = toNewsItem({ title: 'Título', link: 'https://x.org/a', date: 1_700_000_000_000, html: longo }, dedicado)!;
  expect(a.resumo.length).toBeLessThanOrEqual(221);
  expect(a.resumo.endsWith('…')).toBe(true);
  const b = toNewsItem({ title: 'Título igual', link: 'https://x.org/a', date: 1_700_000_000_000, html: '<p>Título igual</p>' }, dedicado)!;
  expect(b.resumo).toBe('');
  const c = toNewsItem({ title: 'T', link: 'https://x.org/a', date: 1_700_000_000_000, html: '<a><img data-x="1" src="http://img.x.org/f.jpg"></a><p>Texto</p>' }, dedicado)!;
  expect(c.thumbnail).toBe('https://img.x.org/f.jpg');
  const d = toNewsItem({ title: 'T', link: 'https://x.org/a', date: 1_700_000_000_000, html: '<img src="http://img.x.org/f.jpg">', image: 'https://img.x.org/capa.jpg' }, dedicado)!;
  expect(d.thumbnail).toBe('https://img.x.org/capa.jpg');
});

test('mergeNews: a mais nova primeiro, sem repetir o mesmo endereço nem o mesmo título, no limite', () => {
  const lista = mergeNews([
    [item({ titulo: 'Velha', url: 'https://a.org/1', data: '2026-11-01T00:00:00.000Z' }), item({ titulo: 'Nova', url: 'https://a.org/2', data: '2026-11-09T00:00:00.000Z' })],
    [item({ titulo: 'Outra fonte, mesma matéria', url: 'http://www.a.org/2/?utm=x', data: '2026-11-08T00:00:00.000Z', thumbnail: 'https://i.org/f.jpg' }),
      item({ titulo: 'VELHA!', url: 'https://b.org/velha-copia', data: '2026-11-02T00:00:00.000Z' })],
  ]);
  // do par repetido fica a cópia mais nova (“VELHA!”, de 2 nov); a de 1 nov sai
  expect(lista.map((i) => i.titulo)).toEqual(['Nova', 'VELHA!']);
  // a cópia sem imagem herda a imagem da repetida
  expect(lista[0].thumbnail).toBe('https://i.org/f.jpg');
  const muitas = Array.from({ length: 50 }, (_, n) => item({ titulo: `Matéria ${n}`, url: `https://a.org/m${n}`, data: new Date(Date.UTC(2026, 10, 1, 0, n)).toISOString() }));
  const corte = mergeNews([muitas]);
  expect(corte).toHaveLength(NEWS_LIMIT);
  expect(corte[0].titulo).toBe('Matéria 49');
});

test('as respostas da API do Portas Abertas e do rss2json viram entradas', () => {
  const wp = fromWordPress([{ date_gmt: '2026-11-16T11:00:00', link: 'https://p.org/a/', title: { rendered: 'A &amp; B' }, content: { rendered: '<p>c</p>' }, meta: { subtitulo: 'Sub', imagem_miniatura: 'https://p.org/m.avif', banner: 'https://p.org/b.avif' } }]);
  expect(toNewsItem(wp[0], dedicado)).toMatchObject({ titulo: 'A & B', resumo: 'Sub', thumbnail: 'https://p.org/m.avif', data: '2026-11-16T11:00:00.000Z' });
  expect(fromWordPress({ code: 'rest_error' })).toEqual([]);
  const rss = fromRss2Json({ status: 'ok', items: [{ title: 'X', link: 'https://x.org/1', pubDate: '2026-11-13 20:08:32', description: '<p>d</p>', thumbnail: 'https://x.org/t.jpg', categories: ['Missões'] }] });
  expect(rss).toHaveLength(1);
  expect(toNewsItem(rss[0], geral)).toMatchObject({ titulo: 'X', thumbnail: 'https://x.org/t.jpg' });
  expect(fromRss2Json({ status: 'error', message: 'limite' })).toEqual([]);
});

test('há quanto tempo: agora, minutos, horas e dias', () => {
  const t = Date.UTC(2026, 10, 16, 12, 0, 0);
  expect(agoLabel(t, t + 10_000)).toBe('agora');
  expect(agoLabel(t, t + 3 * 60_000)).toBe('há 3 min');
  expect(agoLabel(t, t + 2 * 3_600_000)).toBe('há 2 h');
  expect(agoLabel(t, t + 24 * 3_600_000)).toBe('há 1 dia');
  expect(agoLabel(t, t + 4 * 24 * 3_600_000)).toBe('há 4 dias');
});

test('o arquivo de reserva lido da rede descarta o que não presta', () => {
  expect(parseCache(null)).toBeNull();
  expect(parseCache({ itens: [] })).toBeNull();
  const lido = parseCache({
    geradoEm: '2026-11-16T10:00:00Z',
    itens: [
      { titulo: 'Boa', resumo: 'r', data: '2026-11-16T10:00:00Z', fonte: 'F', url: 'http://a.org/x', thumbnail: 'javascript:alert(1)' },
      { titulo: '', resumo: '', data: '2026-11-16T10:00:00Z', fonte: 'F', url: 'https://a.org/y' },
      { titulo: 'Sem link', data: '2026-11-16T10:00:00Z', fonte: 'F', url: 'ftp://a.org/z' },
      { titulo: 'Sem data', data: 'x', fonte: 'F', url: 'https://a.org/w' },
    ],
  })!;
  expect(lido.itens).toEqual([{ titulo: 'Boa', resumo: 'r', data: '2026-11-16T10:00:00.000Z', fonte: 'F', url: 'https://a.org/x', thumbnail: null }]);
});

test('as fontes e os proxies são endereços https, sem repetição', () => {
  expect(new Set(NEWS_SOURCES.map((s) => s.name)).size).toBe(NEWS_SOURCES.length);
  for (const s of NEWS_SOURCES) {
    expect(s.url.startsWith('https://'), s.name).toBe(true);
    expect(s.site.startsWith('https://'), s.name).toBe(true);
  }
  for (const p of PROXIES) expect(p.url('https://exemplo.org/feed')).toMatch(/^https:\/\/.+https%3A%2F%2Fexemplo\.org%2Ffeed$/);
});

test('public/data/noticias.json (a reserva diária) existe, é válido, está em ordem e é só de fontes conhecidas', () => {
  const json = JSON.parse(readFileSync('public/data/noticias.json', 'utf8'));
  const cache = parseCache(json)!;
  expect(cache, 'arquivo de reserva ilegível').not.toBeNull();
  expect(Number.isNaN(Date.parse(cache.geradoEm))).toBe(false);
  expect(cache.itens.length).toBeGreaterThan(0);
  expect(cache.itens.length).toBeLessThanOrEqual(NEWS_LIMIT);
  // parseCache descarta o inválido: se o número bate, nada foi descartado
  expect(cache.itens).toHaveLength(json.itens.length);
  const nomes = NEWS_SOURCES.map((s) => s.name);
  const ruins: string[] = [];
  cache.itens.forEach((i, n) => {
    if (!nomes.includes(i.fonte)) ruins.push(`fonte desconhecida: ${i.fonte}`);
    if (n && Date.parse(i.data) > Date.parse(cache.itens[n - 1].data)) ruins.push(`fora de ordem: ${i.titulo}`);
  });
  expect(new Set(cache.itens.map((i) => i.url)).size).toBe(cache.itens.length);
  expect(ruins).toEqual([]);
});
