import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { AD_STATES } from '../../src/app/core/ad-states';
import { CURIOSITIES } from '../../src/app/core/curiosities';
import { EPOCHS } from '../../src/app/core/epochs';
import { ARTICLES, CLASSIC_SERMONS } from '../../src/app/core/library';
import { MAPS_IN_ORDER } from '../../src/app/core/maps';
import {
  adStateCard, articleCard, CARD_CREAM, CARD_GOLD, classicSermonCard, curiosityCard, DEFAULT_TONE, dictionaryCard, epochCard, fitTopics,
  hymnCard, mapCard, pageUrl, personCard, prophecyCard, shareText, shortWhen, SITE_URL, shelfCard, trailCard, tribeCard, type ShareCard,
} from '../../src/app/core/share-card';
import { shelfBooks, TRAILS } from '../../src/app/core/trails';
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

test('compartilhar: a hora da cena entra no subtópico em forma curta, sem estourar a linha da imagem', () => {
  // Exemplos de linhas de hora (":::hora …") e a forma curta de cada uma
  const horas: [string, string][] = [
    ['Quinta-feira · ao anoitecer, por volta das 18h', 'Quinta, 18h'],
    ['Quinta-feira · de noite, durante a ceia', 'Quinta, de noite'],
    ['Quinta para sexta · de noite, antes do canto do galo (entre a meia-noite e as 3h)', 'Quinta para sexta, 0h–3h'],
    ['Quinta para sexta · de madrugada, até o amanhecer', 'Quinta para sexta, de madrugada'],
    ['Sexta-feira · de manhã, antes das 9h; João diz cerca da hora sexta', 'Sexta, antes das 9h'],
    ['Sexta-feira · de manhã, depois das 9h', 'Sexta, depois das 9h'],
    ['Sexta-feira · hora terceira, por volta das 9h', 'Sexta, 9h'],
    ['Sexta-feira · das 9h ao meio-dia, antes das trevas', 'Sexta, 9h–12h'],
    ['Sexta-feira · do meio-dia às 15h, da hora sexta à nona', 'Sexta, 12h–15h'],
    ['Sexta-feira · à tarde, antes do pôr do sol', 'Sexta, à tarde'],
    ['Sexta-feira · ao cair da tarde, antes do pôr do sol, por volta das 18h', 'Sexta, 18h'],
    ['Sábado · de dia', 'Sábado, de dia'],
    ['De sexta a domingo', 'Sexta a domingo'],
    ['Domingo · ao anoitecer; e oito dias depois', 'Domingo, ao anoitecer'],
    ['', ''],
  ];
  for (const [entrada, saida] of horas) expect(shortWhen(entrada), entrada).toBe(saida);

  // Dentro do cartão: só o título de cena (###) logo seguido de ":::hora" ganha a hora; os demais ficam como eram
  const md = [
    '## Primeiro Tópico', '', '### O Cenáculo', '', ':::hora Quinta-feira · ao anoitecer, por volta das 18h', '', 'Texto.', '',
    '### Uma Cena Sem Hora', '', 'Texto.', '', '### Terceira Cena', '', 'Texto.',
  ].join('\n');
  expect(articleCard(ARTICLES[0].id, md)?.topics[0].subs).toEqual(['Quinta, 18h · O Cenáculo', 'Uma Cena Sem Hora']);

  // Título comprido: a hora vai na frente e fica inteira; é o fim do título que se corta, e a linha cabe
  const longo = 'Jesus Diante de Caifás e do Sinédrio, o Conselho Reunido na Madrugada da Prisão';
  const md2 = `## Tópico\n\n### ${longo}\n\n:::hora Quinta para sexta · de noite, antes do canto do galo (entre a meia-noite e as 3h)\n\nTexto.`;
  const sub = articleCard(ARTICLES[0].id, md2)?.topics[0].subs?.[0] ?? '';
  expect(sub.length).toBeLessThanOrEqual(67);
  expect(sub.startsWith('Quinta para sexta, 0h–3h · Jesus Diante de Caifás')).toBe(true);
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
  for (const t of TRAILS) for (const b of t.branches) check(shelfCard(t, b), `estante ${t.id} / ${b.title}`, problems);
  expect(problems).toEqual([]);
});

const PREFIXO = 'https://sgtcastanheira.github.io/biblia-sagrada/';

test('compartilhar: a estante do Volume 4 vira um cartão com os sete livros numerados, na ordem, e o texto lista todos', () => {
  const trilha = TRAILS.find((t) => t.id === 'como-a-ciencia-explica')!;
  const volume = trilha.branches.find((b) => b.title.startsWith('Volume 4'))!;
  const card = shelfCard(trilha, volume)!;
  expect(card.title).toBe('A Paixão, da Ceia à Ressurreição');
  expect(card.theme).toBe('Como a Ciência Explica · Volume 4');
  expect(card.path).toBe('/historia?estante=como-a-ciencia-explica');
  expect(card.topics).toEqual([]);
  expect(card.tone).toBe(trilha.tone);
  expect(card.meta).toMatch(/^7 livros · \d+ min de leitura$/);
  expect(card.books!.map((b) => [b.n, b.title])).toEqual([
    [1, 'Getsêmani'], [2, 'Santa Ceia'], [3, 'Prisão e Interrogatório'], [4, 'Açoite e Condenação'],
    [5, 'Crucificação'], [6, 'Sepultamento e Ressurreição'], [7, 'Quem Mandava e Onde Mandava'],
  ]);
  for (const b of card.books!) expect(b.icon, b.title).toBeTruthy();
  const texto = shareText(card);
  expect(texto).toContain('A Paixão, da Ceia à Ressurreição');
  expect(texto).toContain('1. Getsêmani\n2. Santa Ceia\n3. Prisão e Interrogatório');
  expect(texto).toContain('7. Quem Mandava e Onde Mandava');
  expect(texto.endsWith(`Abra a biblioteca: ${PREFIXO}historia?estante=como-a-ciencia-explica`)).toBe(true);
});

test('compartilhar: toda prateleira de histórias gera a imagem da estante, numerada na ordem e com o link da sua estante', () => {
  let comUma = 0;
  for (const t of TRAILS) {
    for (const b of t.branches) {
      const card = shelfCard(t, b)!;
      const quem = `${t.id} / ${b.title}`;
      expect(card, quem).toBeTruthy();
      const numerados = card.books!.filter((x) => x.n);
      expect(numerados.map((x) => x.n), quem).toEqual(shelfBooks(b).map((x) => x.n));
      // os atalhos vêm depois das histórias, sem número
      expect(card.books!.slice(numerados.length).every((x) => x.shortcut && !x.n), `${quem}: atalhos`).toBe(true);
      expect(card.books!.length, quem).toBe(shelfBooks(b).length + (b.links?.length ?? 0));
      expect(card.path, quem).toBe(`/historia?estante=${t.id}`);
      expect(card.tone, quem).toBe(t.tone);
      expect(shareText(card), quem).toContain(`1. ${shelfBooks(b)[0].article.title}`);
      if (numerados.length === 1) comUma++;
    }
  }
  expect(comUma, 'prateleiras com uma história só').toBeGreaterThan(0);
});

test('compartilhar: prateleira com um livro só leva o 1; com atalhos, os atalhos ficam sem número; a maior segue a contagem inteira', () => {
  const achar = (titulo: string) => {
    for (const t of TRAILS) {
      const b = t.branches.find((x) => x.title === titulo);
      if (b) return shelfCard(t, b)!;
    }
    throw new Error(titulo);
  };
  const uma = achar('Quem É Deus');
  expect(uma.books).toHaveLength(1);
  expect(uma.books![0].n).toBe(1);
  expect(uma.meta).toMatch(/^1 livro · \d+ min de leitura$/);
  expect(shareText(uma)).toContain('\n\n1. A Trindade');

  const comAtalhos = achar('A Igreja pelo País');
  expect(comAtalhos.books!.map((b) => b.n)).toEqual([1, undefined, undefined, undefined]);
  expect(comAtalhos.meta).toMatch(/^1 livro · \d+ min de leitura · 3 atalhos$/);
  expect(shareText(comAtalhos)).toContain('Atalho: ');

  const maior = achar('Livros de História da Igreja');
  expect(maior.books!.map((b) => b.n)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
});

test('compartilhar: o texto sem estante continua do mesmo jeito (título, subtítulo e link)', () => {
  expect(shareText({ path: '/artigo/x', theme: 'T', title: 'Título', subtitle: 'Sub', topics: [], cta: 'Leia' })).toBe('Título\nSub\n\nLeia: https://sgtcastanheira.github.io/biblia-sagrada/artigo/x');
  expect(shareText({ path: '/artigo/x', theme: 'T', title: 'Título', topics: [] })).toBe('Título\n\nLeia no app Bíblia Sagrada: https://sgtcastanheira.github.io/biblia-sagrada/artigo/x');
});
