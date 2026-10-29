import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { CONTEXT_EVENTS, CONTEXT_ICONS, CONTEXT_KIND_NAMES } from '../../src/app/core/ad-context';
import { ERAS } from '../../src/app/core/atlas';
import { BOOKS } from '../../src/app/core/books';
import { CHURCH_MAPS } from '../../src/app/core/church-maps';
import { CURIOSITIES } from '../../src/app/core/curiosities';
import {
  ARTICLE_EPOCH, bibleOfEpoch, EPOCH_PARTS, EPOCHS, epochOfArticle, epochOfChapter, epochOfCuriosity, epochOfMap, epochOfPerson, epochOfProphecy,
  epochOfRef, epochOfYear, epochRange, epochsOfBook, eventsOfEpoch, findEpoch, storiesOfEpoch, timelineOfEpoch, WORLD_TIMELINE,
} from '../../src/app/core/epochs';
import { ARTICLES, findArticle } from '../../src/app/core/library';
import { BIBLE_MAPS } from '../../src/app/core/maps';
import { parseReferences } from '../../src/app/core/reference-parser';
import { WORLD_EVENTS } from '../../src/app/core/world-events';

const json = <T>(file: string): T => JSON.parse(readFileSync(`public/conteudo/${file}`, 'utf8')) as T;

test('épocas: em ordem, sem buracos, com grupo e mapa do atlas que existem', () => {
  expect(new Set(EPOCHS.map((e) => e.id)).size).toBe(EPOCHS.length);
  for (let i = 1; i < EPOCHS.length; i++) expect(EPOCHS[i].from, EPOCHS[i].id).toBeGreaterThan(EPOCHS[i - 1].from);
  for (const e of EPOCHS) {
    expect(EPOCH_PARTS, e.id).toContain(e.part);
    expect(e.summary.length, e.id).toBeGreaterThan(80);
    if (e.atlas) expect(ERAS.map((x) => x.id), `${e.id}: época do atlas`).toContain(e.atlas);
  }
  // Cada ano cai em uma época só, e as fronteiras são as que o texto promete
  expect(epochOfYear(-4000).id).toBe('origens');
  expect(epochOfYear(-7).id).toBe('entre-testamentos');
  expect(epochOfYear(-6).id).toBe('jesus');
  expect(epochOfYear(29).id).toBe('jesus');
  expect(epochOfYear(30).id).toBe('igreja-nasce');
  expect(epochOfYear(64).id).toBe('roma-persegue');
  expect(epochOfYear(1500).id).toBe('reforma');
  expect(epochOfYear(1929).id).toBe('pentecostes');
  expect(epochOfYear(1945).id).toBe('mundo-atual');
  const [a, b] = epochRange(findEpoch('reforma')!);
  expect([a, b]).toEqual([1500, 1649]);
});

test('fatos do mundo: ids únicos, tipos com ícone, referências que a Bíblia entende e histórias que existem', () => {
  const ids = WORLD_TIMELINE.map((e) => e.id);
  expect(new Set(ids).size, 'ids repetidos').toBe(ids.length);
  expect(WORLD_TIMELINE.length).toBe(WORLD_EVENTS.length + CONTEXT_EVENTS.length);
  for (const e of WORLD_TIMELINE) {
    expect(CONTEXT_ICONS[e.kind], `${e.id}: ícone`).toBeTruthy();
    expect(CONTEXT_KIND_NAMES[e.kind], `${e.id}: nome do tipo`).toBeTruthy();
    expect(e.title.length, e.id).toBeGreaterThan(3);
    expect(e.text.length, e.id).toBeGreaterThan(30);
    expect(e.when, e.id).toBeTruthy();
    if (e.to !== undefined) expect(e.to, e.id).toBeGreaterThanOrEqual(e.from);
    if (e.ref) {
      const r = parseReferences(e.ref);
      expect(r.errors, `${e.id}: ${e.ref}`).toEqual([]);
      expect(r.refs.length, e.id).toBeGreaterThan(0);
    }
    if (e.article) expect(findArticle(e.article), `${e.id}: história ${e.article}`).toBeTruthy();
  }
  for (let i = 1; i < WORLD_TIMELINE.length; i++) expect(WORLD_TIMELINE[i].from).toBeGreaterThanOrEqual(WORLD_TIMELINE[i - 1].from);
  // Toda época que não é só de silêncio tem ao menos um fato do mundo, e as crises que o pedido citou estão lá
  for (const e of EPOCHS) expect(eventsOfEpoch(e.id).length, `${e.id}: sem fatos do mundo`).toBeGreaterThan(0);
  expect(eventsOfEpoch('pentecostes').map((e) => e.title)).toContain('A crise de 1929');
  expect(eventsOfEpoch('mundo-atual').map((e) => e.title)).toContain('A pandemia de covid-19');
  expect(eventsOfEpoch('idade-media').map((e) => e.title)).toContain('A Peste Negra');
  expect(eventsOfEpoch('patriarcas').map((e) => e.title)).toContain('Sete anos de fome no Egito');
});

test('Bíblia: cada capítulo de cada livro pertence a uma época só, e os livros somam todos os capítulos', () => {
  for (const b of BOOKS) {
    expect(epochOfChapter(b.id, 1), b.id).toBeTruthy();
    expect(epochsOfBook(b.id).length, b.id).toBeGreaterThan(0);
  }
  for (const b of BOOKS) {
    let chapters = 0;
    for (const e of EPOCHS) for (const s of bibleOfEpoch(e.id).filter((x) => x.bookId === b.id)) chapters += s.to - s.from + 1;
    expect(chapters, `${b.name}: capítulos nas épocas`).toBe(b.chapters);
  }
  expect(epochOfRef('Gn 3.15')?.id).toBe('origens');
  expect(epochOfRef('Gn 12.1-5')?.id).toBe('patriarcas');
  expect(epochOfRef('1Sm 17')?.id).toBe('reino-unido');
  expect(epochOfRef('Is 53')?.id).toBe('reino-dividido');
  expect(epochOfRef('Jr 52')?.id).toBe('exilio-retorno');
  expect(epochOfRef('At 16.9')?.id).toBe('igreja-nasce');
  expect(epochOfRef('Ap 1.9')?.id).toBe('roma-persegue');
});

test('histórias: cada uma com período cai numa época, e as exceções existem', () => {
  for (const [id, epoch] of Object.entries(ARTICLE_EPOCH)) {
    expect(findArticle(id), `exceção ${id}`).toBeTruthy();
    expect(findEpoch(epoch), `exceção ${id}: época`).toBeTruthy();
  }
  const dated = ARTICLES.filter((a) => !a.overview && a.period && /\d/.test(a.period));
  for (const a of dated) expect(epochOfArticle(a), `${a.id} (${a.period})`).toBeTruthy();
  // Os painéis das coleções e os estudos sem data ficam fora
  expect(epochOfArticle(findArticle('panorama-da-igreja')!)).toBeNull();
  expect(epochOfArticle(findArticle('trindade')!)).toBeNull();
  // Roma: as duas histórias novas e a das perseguições ficam juntas
  expect(storiesOfEpoch('roma-persegue').map((a) => a.id)).toEqual(expect.arrayContaining(['perseguicoes', 'coliseu-de-roma', 'catacumbas-de-roma']));
  expect(epochOfArticle(findArticle('daniel-berg-e-gunnar-vingren')!)?.id).toBe('pentecostes');
});

test('personagens, curiosidades, profecias e mapas: todos têm época', () => {
  const people = json<{ id: string; refs: string[] }[]>('memorial.json') as never as Parameters<typeof epochOfPerson>[0][];
  const prophecies = json<unknown[]>('profecias.json') as Parameters<typeof epochOfProphecy>[0][];
  expect(people.filter((p) => !epochOfPerson(p)).map((p) => p.id)).toEqual([]);
  expect(prophecies.filter((p) => !epochOfProphecy(p)).map((p) => p.id)).toEqual([]);
  expect(CURIOSITIES.filter((c) => !epochOfCuriosity(c)).map((c) => c.id)).toEqual([]);
  expect([...BIBLE_MAPS, ...CHURCH_MAPS].filter((m) => !epochOfMap(m)).map((m) => m.id)).toEqual([]);
  expect(epochOfMap(BIBLE_MAPS.find((m) => m.id === 'jornada-de-abraao')!)?.id).toBe('patriarcas');
  expect(epochOfMap(BIBLE_MAPS.find((m) => m.id === 'segunda-viagem-de-paulo')!)?.id).toBe('igreja-nasce');
});

test('linha do tempo de uma época: em ordem de ano, e a história vem antes do fato do mesmo ano', () => {
  for (const e of EPOCHS) {
    const items = timelineOfEpoch(e.id);
    for (let i = 1; i < items.length; i++) {
      expect(items[i].year, e.id).toBeGreaterThanOrEqual(items[i - 1].year);
      if (items[i].year === items[i - 1].year && items[i].story) expect(items[i - 1].story, `${e.id}: ${items[i].year}`).toBeTruthy();
    }
  }
  const years = timelineOfEpoch('pentecostes').map((i) => i.year);
  expect(years[0]).toBeGreaterThanOrEqual(1900);
  expect(years).toContain(1929);
  expect(years).toContain(1910);
});

test('a igreja nas crises: só com fonte ou história, e as crises que o usuário citou estão lá', () => {
  const notes = WORLD_TIMELINE.filter((e) => e.church);
  expect(notes.length).toBeGreaterThanOrEqual(10);
  for (const e of notes) {
    const c = e.church!;
    expect(c.text.length, e.id).toBeGreaterThan(40);
    expect(!!(c.link || c.source), `${e.id}: sem link nem fonte`).toBe(true);
    if (c.link?.startsWith('/artigo/')) expect(findArticle(c.link.split('/')[2]), `${e.id}: ${c.link}`).toBeTruthy();
    if (c.link) expect(c.label, `${e.id}: link sem nome`).toBeTruthy();
  }
  const byId = (id: string) => WORLD_TIMELINE.find((e) => e.id === id)!;
  expect(byId('cangaco').church?.text).toContain('Lampião');
  expect(byId('crash').church?.text).toContain('Batista');
  expect(byId('brasil-ww1').church?.text).toContain('Otto Nelson');
});
