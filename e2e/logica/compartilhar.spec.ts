import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { AD_STATES } from '../../src/app/core/ad-states';
import { CURIOSITIES } from '../../src/app/core/curiosities';
import { EPOCHS } from '../../src/app/core/epochs';
import { ARTICLES, CLASSIC_SERMONS } from '../../src/app/core/library';
import { MAPS_IN_ORDER } from '../../src/app/core/maps';
import {
  adStateCard, articleCard, CARD_CREAM, CARD_GOLD, classicSermonCard, curiosityCard, DEFAULT_TONE, dictionaryCard, epochCard, fitTopics,
  hymnCard, mapCard, pageUrl, personCard, prophecyCard, shareText, SITE_URL, trailCard, tribeCard, type ShareCard,
} from '../../src/app/core/share-card';
import { TRAILS } from '../../src/app/core/trails';
import { TRIBES } from '../../src/app/core/tribes';

/**
 * Imagem de compartilhar (WhatsApp e Instagram): o modelo de cada página precisa ter assunto, título, tópicos e o endereço
 * do app no site publicado (nunca localhost), e o texto da imagem precisa ter contraste com o fundo.
 */
const json = <T>(file: string): T => JSON.parse(readFileSync(`public/conteudo/${file}`, 'utf8'));

function lum(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

function check(card: ShareCard | null, who: string, problems: string[]): void {
  if (!card) return void problems.push(`${who}: sem cartão`);
  if (!card.title.trim() || !card.theme.trim()) problems.push(`${who}: sem título ou assunto`);
  if (!/^\/[a-z0-9]/.test(card.path)) problems.push(`${who}: caminho "${card.path}"`);
  if (!pageUrl(card.path).startsWith(SITE_URL)) problems.push(`${who}: endereço fora do site`);
  if (pageUrl(card.path).includes('localhost')) problems.push(`${who}: endereço de teste`);
  const titles = card.topics.map((t) => t.title);
  if (new Set(titles).size !== titles.length) problems.push(`${who}: tópicos repetidos`);
  if (titles.some((t) => !t.trim())) problems.push(`${who}: tópico vazio`);
  if (card.topics.some((t) => (t.subs?.length ?? 0) > 2)) problems.push(`${who}: mais de dois subtópicos`);
  if (card.total !== undefined && card.total < card.topics.length) problems.push(`${who}: total menor que os tópicos`);
  if (card.tone && contrast(CARD_CREAM, card.tone) < 4.5) problems.push(`${who}: creme sem contraste com ${card.tone}`);
  if (card.tone && contrast(CARD_GOLD, card.tone) < 4.5) problems.push(`${who}: dourado sem contraste com ${card.tone}`);
}

test('compartilhar: o endereço é sempre o do site publicado e o texto leva o link', () => {
  expect(pageUrl('/artigo/x')).toBe('https://sgtcastanheira.github.io/biblia-sagrada/artigo/x');
  expect(pageUrl('historia?trilha=a')).toBe('https://sgtcastanheira.github.io/biblia-sagrada/historia?trilha=a');
  const text = shareText({ path: '/artigo/x', theme: 'T', title: 'Título', subtitle: 'Sub', topics: [], cta: 'Leia' });
  expect(text).toContain('Título');
  expect(text).toContain('Leia: https://sgtcastanheira.github.io/biblia-sagrada/artigo/x');
});

test('compartilhar: o fundo padrão e as cores das trilhas deixam o texto da imagem legível', () => {
  for (const tone of [DEFAULT_TONE, ...TRAILS.map((t) => t.tone)]) {
    expect(contrast(CARD_CREAM, tone), `creme em ${tone}`).toBeGreaterThanOrEqual(4.5);
    expect(contrast(CARD_GOLD, tone), `dourado em ${tone}`).toBeGreaterThanOrEqual(4.5);
  }
});

test('compartilhar: a lista de tópicos some com repetições e vazios e limita os subtópicos', () => {
  const out = fitTopics([{ title: ' A ', subs: ['1', '1', '2', '3'] }, { title: 'a' }, { title: '' }, { title: 'B' }]);
  expect(out).toEqual([{ title: 'A', subs: ['1', '2'] }, { title: 'B' }]);
  expect(fitTopics(Array.from({ length: 30 }, (_, i) => ({ title: `T${i}` }))).length).toBeLessThanOrEqual(12);
});

test('compartilhar: todo estudo gera uma imagem com assunto, tópicos e o endereço dele', () => {
  const problems: string[] = [];
  for (const a of ARTICLES) {
    const card = articleCard(a.id, readFileSync(`public/conteudo/artigos/${a.id}.md`, 'utf8'));
    check(card, a.id, problems);
    if (card && a.topics?.length && card.topics.length < Math.min(a.topics.length, 12)) problems.push(`${a.id}: perdeu tópicos`);
    if (card && !card.topics.length && !/Overview|resumo/i.test(a.id)) problems.push(`${a.id}: sem nenhum tópico`);
    if (card && card.path !== `/artigo/${a.id}`) problems.push(`${a.id}: caminho errado`);
  }
  expect(problems).toEqual([]);
});

test('compartilhar: as outras páginas também geram o cartão', () => {
  const problems: string[] = [];
  const people = json<Parameters<typeof personCard>[0][]>('memorial.json');
  const prophecies = json<Parameters<typeof prophecyCard>[0][]>('profecias.json');
  const dictionary = json<Parameters<typeof dictionaryCard>[0][]>('dicionario.json');
  const harpa = json<{ hymns: Parameters<typeof hymnCard>[0][] }>('harpa.json');
  for (const p of people) check(personCard(p, 'Personagens'), `pessoa ${p.id}`, problems);
  for (const p of prophecies) check(prophecyCard(p, 'Categoria'), `profecia ${p.id}`, problems);
  for (const e of dictionary) check(dictionaryCard(e, 'Nome'), `verbete ${e.id}`, problems);
  for (const h of harpa.hymns) check(hymnCard(h, h.author), `hino ${h.n}`, problems);
  for (const t of TRIBES) check(tribeCard(t), `tribo ${t.id}`, problems);
  for (const s of AD_STATES) check(adStateCard(s), `estado ${s.id}`, problems);
  EPOCHS.forEach((e, i) => check(epochCard(e, i, EPOCHS.length), `época ${e.id}`, problems));
  for (const c of CURIOSITIES) check(curiosityCard(c), `curiosidade ${c.id}`, problems);
  for (const m of MAPS_IN_ORDER) check(mapCard(m), `mapa ${m.id}`, problems);
  for (const s of CLASSIC_SERMONS) check(classicSermonCard(s), `sermão ${s.id}`, problems);
  for (const t of TRAILS) check(trailCard(t), `trilha ${t.id}`, problems);
  expect(problems).toEqual([]);
});
