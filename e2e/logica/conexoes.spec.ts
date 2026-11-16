import { readFileSync, statSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import {
  bookIndexOf, bookSpan, CHAPTER_COUNT, chapterAt, chapterIndex, chapterSpan, ConnectionGraph, distanceHue, firstChapterOf, LEVELS, levelOf, spanFromParams, spanLabel,
  spanPath, START_POINTS, type ConnectionData,
} from '../../src/app/core/bible-connections';
import { BOOKS } from '../../src/app/core/books';
import { connectionsCard, pageUrl, shareText, SITE_URL } from '../../src/app/core/share-card';
import { CREDITS } from '../../src/app/core/credits';

/**
 * A Bíblia Conectada: a numeração dos capítulos, o arquivo de ligações (que sai das referências cruzadas do leitor) e as contas da
 * tela. Se um dia as referências forem geradas de novo, o teste da “validade” avisa que falta rodar tools/gerar-conexoes.py.
 */
const data = JSON.parse(readFileSync('public/bible/conexoes.json', 'utf8')) as ConnectionData;
const graph = new ConnectionGraph(data);
const at = (bookId: string, chapter: number) => chapterIndex(bookId, chapter)!;

test('conexões: os 1.189 capítulos têm número de 0 a 1188 na ordem da Bíblia, e o caminho de ida e volta fecha', () => {
  expect(CHAPTER_COUNT).toBe(1189);
  expect(chapterAt(0).label).toBe('Gênesis 1');
  expect(chapterAt(1188).label).toBe('Apocalipse 22');
  for (let i = 0; i < CHAPTER_COUNT; i++) {
    const c = chapterAt(i);
    expect(chapterIndex(c.book.id, c.chapter), c.label).toBe(i);
    expect(bookIndexOf(i)).toBe(c.bookIndex);
  }
  for (const [bookIndex, book] of BOOKS.entries()) {
    const span = bookSpan(bookIndex);
    expect(span.to - span.from + 1, book.name).toBe(book.chapters);
    expect(span.from).toBe(firstChapterOf(bookIndex));
  }
  expect(chapterIndex('ISA', 0)).toBeNull();
  expect(chapterIndex('ISA', 67)).toBeNull();
  expect(chapterIndex('XXX', 1)).toBeNull();
  expect(chapterIndex('ISA', 1.5)).toBeNull();
});

test('conexões: o endereço diz o que está em foco, e o foco volta para o mesmo endereço', () => {
  const isaias53 = chapterSpan(at('ISA', 53));
  expect(spanPath(isaias53)).toBe('/conexoes/ISA/53');
  expect(spanFromParams('ISA', '53')).toEqual(isaias53);
  expect(spanFromParams('isa', '53')).toEqual(isaias53);
  const hebreus = bookSpan(BOOKS.findIndex((b) => b.id === 'HEB'));
  expect(spanPath(hebreus)).toBe('/conexoes/HEB');
  expect(spanFromParams('HEB', undefined)).toEqual(hebreus);
  expect(spanLabel(isaias53)).toBe('Isaías 53');
  expect(spanLabel(hebreus)).toBe('Hebreus');
  expect(spanPath(null)).toBe('/conexoes');
  expect(spanFromParams(undefined, undefined)).toBeNull();
  expect(spanFromParams('XYZ', '1')).toBeNull();
  expect(spanFromParams('ISA', '99')).toBeNull();
  expect(spanFromParams('ISA', 'abc')).toBeNull();
});

test('conexões: o arquivo de ligações é bem formado e a Bíblia embutida tem os mesmos capítulos que a lista de livros', () => {
  expect(data.versao).toBe(1);
  expect(data.capitulos).toBe(CHAPTER_COUNT);
  expect(data.pares.length % 3).toBe(0);
  expect(graph.size).toBe(data.pares.length / 3);
  // o gerador usa a quantidade de capítulos da Bíblia embutida: tem de bater com a lista de livros do app
  for (const book of BOOKS) {
    const chapters = (JSON.parse(readFileSync(`public/bible/almeida/${book.id}.json`, 'utf8')) as unknown[]).length;
    expect(chapters, book.name).toBe(book.chapters);
  }
  // em ordem e sem repetição (a conta é feita aqui, e não com um `expect` por ligação: são 70 mil)
  const desordem: number[] = [];
  let last = -1;
  for (let k = 0; k < graph.size; k++) {
    const key = graph.a[k] * 2000 + graph.b[k];
    if (key <= last) desordem.push(k);
    last = key;
  }
  expect(desordem, 'ligações fora de ordem ou repetidas').toEqual([]);
});

test('conexões: validade — o arquivo é o que sai das referências cruzadas do leitor (senão, rode tools/gerar-conexoes.py)', () => {
  const expected = new Map<number, number>();
  for (const [bookIndex, book] of BOOKS.entries()) {
    const refs = JSON.parse(readFileSync(`public/bible/referencias/${book.id}.json`, 'utf8')) as Record<string, string[]>;
    for (const [key, targets] of Object.entries(refs)) {
      const from = firstChapterOf(bookIndex) + Number(key.split(':')[0]) - 1;
      for (const code of targets) {
        const m = /^([1-3]?[A-Z]{2,3})\.(\d+)\.\d+/.exec(code);
        const to = m ? chapterIndex(m[1], Number(m[2])) : null;
        if (to === null || to === from) continue;
        const k = Math.min(from, to) * 2000 + Math.max(from, to);
        expected.set(k, (expected.get(k) ?? 0) + 1);
      }
    }
  }
  expect(graph.size).toBe(expected.size);
  const diferentes: string[] = [];
  for (let k = 0; k < graph.size; k++) {
    if (graph.n[k] !== Math.min(255, expected.get(graph.a[k] * 2000 + graph.b[k]) ?? -1)) diferentes.push(`${chapterAt(graph.a[k]).label} ↔ ${chapterAt(graph.b[k]).label}`);
  }
  expect(diferentes.slice(0, 5), 'ligações diferentes das referências').toEqual([]);
});

test('conexões: os três níveis têm as contagens da tela, e as ligações do desenho vêm da mais longa para a mais curta', () => {
  expect(LEVELS.map((l) => l.id)).toEqual(['fortes', 'mais', 'todas']);
  expect(levelOf('mais').min).toBe(3);
  expect(levelOf('qualquer coisa')).toBe(LEVELS[0]);
  expect(graph.count(1)).toBe(graph.size);
  const counts = LEVELS.map((l) => graph.count(l.min));
  expect(counts[0]).toBeLessThan(counts[1]);
  expect(counts[1]).toBeLessThan(counts[2]);
  // o nível mais leve cabe no canvas: o desenho não vira uma mancha (de 3 mil a 6 mil arcos)
  expect(counts[0]).toBeGreaterThan(3000);
  expect(counts[0]).toBeLessThan(6000);
  for (const level of LEVELS) {
    const order = graph.ordered(level.min);
    expect(order.length).toBe(graph.count(level.min));
    let fora = -1;
    for (let p = 1; p < order.length && fora < 0; p++) {
      if (graph.b[order[p - 1]] - graph.a[order[p - 1]] < graph.b[order[p]] - graph.a[order[p]]) fora = p;
    }
    expect(fora, `${level.id}: primeira ligação fora de ordem`).toBe(-1);
  }
});

test('conexões: os vizinhos de um capítulo são os mesmos nos dois sentidos, e as somas fecham', () => {
  let total = 0;
  for (let i = 0; i < CHAPTER_COUNT; i++) total += graph.degree(i);
  expect(total).toBe(2 * graph.size);
  for (const [bookId, chapter, other] of [['ISA', 53, ['MAT', 27]], ['PSA', 22, ['MAT', 27]], ['GEN', 1, ['PSA', 104]]] as const) {
    const i = at(bookId, chapter);
    const j = at(other[0], other[1]);
    const forward = graph.neighbors(i).find((n) => n.index === j);
    const backward = graph.neighbors(j).find((n) => n.index === i);
    expect(forward, `${bookId} ${chapter}`).toBeTruthy();
    expect(forward!.refs).toBe(backward!.refs);
  }
  // um capítulo: o resumo bate com a lista
  const isaias53 = chapterSpan(at('ISA', 53));
  const summary = graph.summary(isaias53);
  expect(summary.chapters).toBe(graph.degree(at('ISA', 53)));
  expect(summary.refs).toBe(graph.neighbors(at('ISA', 53)).reduce((n, x) => n + x.refs, 0));
  const groups = graph.groupByBook(isaias53);
  expect(groups.reduce((n, g) => n + g.chapters.length, 0)).toBe(summary.chapters);
  expect(groups.map((g) => g.refs)).toEqual([...groups.map((g) => g.refs)].sort((x, y) => y - x));
  expect(summary.top.map((t) => t.book.id)).toEqual(groups.slice(0, 6).map((g) => g.book.id));
  // um livro inteiro: as ligações de dentro do próprio livro ficam de fora da lista
  const hebreus = bookSpan(BOOKS.findIndex((b) => b.id === 'HEB'));
  for (const { index } of graph.linksOf(hebreus)) expect(index >= hebreus.from && index <= hebreus.to, chapterAt(index).label).toBe(false);
  expect(graph.summary(hebreus).chapters).toBeGreaterThan(graph.summary(isaias53).chapters);
});

test('conexões: os pontos de partida existem, e o que a tela diz sobre cada um está nos dados', () => {
  expect(START_POINTS.length).toBeGreaterThanOrEqual(5);
  for (const s of START_POINTS) {
    const i = chapterIndex(s.bookId, s.chapter);
    expect(i, `${s.bookId} ${s.chapter}`).not.toBeNull();
    expect(graph.degree(i!), `${chapterAt(i!).label} sem ligações`).toBeGreaterThan(30);
    expect(s.why.trim().length, chapterAt(i!).label).toBeGreaterThan(10);
  }
  // as ligações citadas nos textos dos pontos de partida
  const ligados = (a: [string, number], b: [string, number]) => graph.neighbors(at(a[0], a[1])).some((n) => n.index === at(b[0], b[1]));
  expect(ligados(['GEN', 1], ['PSA', 104]), 'Gênesis 1 e Salmos 104').toBe(true);
  expect(ligados(['GEN', 1], ['JHN', 1]), 'Gênesis 1 e João 1').toBe(true);
  expect(ligados(['PSA', 22], ['MAT', 27]), 'Salmos 22 e Mateus 27').toBe(true);
  expect(ligados(['ISA', 53], ['ACT', 8]), 'Isaías 53 e Atos 8').toBe(true);
  expect(ligados(['ISA', 53], ['1PE', 2]), 'Isaías 53 e 1 Pedro 2').toBe(true);
  expect(ligados(['JHN', 3], ['NUM', 21]), 'João 3 e Números 21').toBe(true);
  expect(ligados(['HEB', 11], ['GEN', 22]), 'Hebreus 11 e Gênesis 22').toBe(true);
  expect(ligados(['REV', 21], ['ISA', 60]), 'Apocalipse 21 e Isaías 60').toBe(true);
  expect(ligados(['REV', 21], ['EZK', 48]), 'Apocalipse 21 e Ezequiel 48').toBe(true);
  // “um dos capítulos mais ligados”: Romanos 8 está entre os dez primeiros
  expect(graph.mostConnected(10)).toContain(at('ROM', 8));
});

test('conexões: a cor do arco vai do roxo (perto) ao amarelo-esverdeado (longe), sempre no mesmo sentido', () => {
  expect(distanceHue(1)).toBeCloseTo(290, 5);
  expect(distanceHue(CHAPTER_COUNT - 1)).toBeCloseTo(60, 5);
  let last = Infinity;
  for (const d of [1, 2, 5, 20, 100, 400, 1188]) {
    const h = distanceHue(d);
    expect(h).toBeLessThan(last);
    last = h;
  }
});

test('conexões: dados quebrados não passam pelo grafo', () => {
  expect(() => new ConnectionGraph({ ...data, capitulos: 10 })).toThrow();
  expect(() => new ConnectionGraph({ ...data, pares: [1, 2] })).toThrow();
  expect(() => new ConnectionGraph({ ...data, pares: [5, 3, 1] })).toThrow();
  expect(() => new ConnectionGraph({ ...data, pares: [0, 5000, 1] })).toThrow();
});

test('conexões: o cartão de compartilhar leva ao mesmo ponto da tela, no site publicado', () => {
  const art = { draw: () => undefined };
  const card = connectionsCard({ path: spanPath(chapterSpan(at('ISA', 53))), theme: 'A Bíblia Conectada', title: 'Isaías 53', subtitle: 'Ligado a 130 capítulos, em 36 livros', art });
  expect(card.topics).toEqual([]);
  expect(card.art).toBe(art);
  expect(pageUrl(card.path)).toBe(`${SITE_URL}conexoes/ISA/53`);
  expect(shareText(card)).toContain(`Explore as conexões da Bíblia: ${SITE_URL}conexoes/ISA/53`);
  expect(shareText(card)).toContain('Isaías 53\nLigado a 130 capítulos, em 36 livros');
});

test('conexões: as cinco artes cabem em 1 MB, têm crédito e são baixadas só ao usar a tela', () => {
  const images = ['fundo', 'fundo-celular', 'capa', 'compartilhar-feed', 'compartilhar-stories'].map((name) => `conexoes-${name}.webp`);
  const credits = CREDITS.flatMap((group) => group.items);
  const document = readFileSync('CREDITOS.md', 'utf8');
  let bytes = 0;
  for (const image of images) {
    bytes += statSync(`public/conteudo/imagens/${image}`).size;
    const credit = credits.find((entry) => entry.use.includes(image));
    expect(credit?.license, image).toBe('Criada com inteligência artificial para este estudo');
    expect(document).toContain(image);
  }
  expect(bytes).toBeLessThanOrEqual(1024 * 1024);
  const config = JSON.parse(readFileSync('ngsw-config.json', 'utf8'));
  for (const name of ['assets', 'conteudo']) {
    expect(config.assetGroups.find((group: { name: string }) => group.name === name).resources.files).toContain('!/conteudo/imagens/conexoes-*');
  }
  expect(config.assetGroups.find((group: { name: string }) => group.name === 'imagens-das-conexoes')).toMatchObject({
    installMode: 'lazy', updateMode: 'lazy', resources: { files: ['/conteudo/imagens/conexoes-*'] },
  });
});
