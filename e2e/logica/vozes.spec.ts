import { expect, test } from '@playwright/test';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import {
  approvalMessage, bibleVersionFor, contentVersion, GUEST_LANGUAGES, GUEST_SERMONS, GUEST_STRINGS, guestSermonByToken, guestTextPath,
  guestSermonForRoute, LangCode, readingMinutes, visibleGuestSermons,
} from '../../src/app/core/guest-sermons';
import { parseReferences } from '../../src/app/core/reference-parser';
import { Block, parseBlocks } from '../../src/app/core/rich-text-parser';
import { spokenReference } from '../../src/app/core/speech-ref';
import { pageUrl } from '../../src/app/core/share-card';
import { voiceSermonCard } from '../../src/app/core/voice-share-card';

const text = (id: string, lang: LangCode) => readFileSync(`public/conteudo/${guestTextPath(id, lang)}`, 'utf8');
const sermon = GUEST_SERMONS[0];

/** Versões embutidas no app por língua (as que dá para conferir sem internet). */
const LOCAL_BIBLE: Partial<Record<LangCode, string>> = { pt: 'almeida', es: 'rv1909', fr: 'lsg', de: 'luther1912', ru: 'synodal' };

/** O versículo de um livro/capítulo na Bíblia embutida: texto de cada versículo pedido. */
function verses(version: string, ref: string): string[] {
  return parseReferences(ref).refs.flatMap((r) => {
    const book = JSON.parse(readFileSync(`public/bible/${version}/${r.bookId}.json`, 'utf8')) as [number, string][][];
    const chapter = book[r.chapter - 1] ?? [];
    const wanted = chapter.filter(([v]) => r.from === undefined || (v >= r.from && v <= (r.to ?? r.from)));
    return wanted.map(([, t]) => t);
  });
}

const fold = (t: string) => t.normalize('NFC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

/** As referências tocáveis e os versículos por extenso de um texto, na ordem. */
const refsOf = (blocks: Block[]) => {
  const out: string[] = [];
  const inlines = (parts: { t: string; href?: string }[] = []) => parts.forEach((p) => p.t === 'ref' && out.push(p.href!));
  for (const b of blocks) {
    if (b.type === 'verse') out.push(b.href!);
    inlines(b.inlines);
    b.items?.forEach(inlines);
    inlines(b.cite);
  }
  return out;
};

test('vozes: cada sermão tem o texto em todos os idiomas que declara, e só neles', () => {
  const ids = new Set(GUEST_SERMONS.map((s) => s.id));
  expect(ids.size).toBe(GUEST_SERMONS.length);
  for (const s of GUEST_SERMONS) {
    expect(s.languages[0], `${s.id}: o português vem primeiro`).toBe('pt');
    for (const l of GUEST_LANGUAGES) {
      const path = `public/conteudo/${guestTextPath(s.id, l.code)}`;
      expect(existsSync(path), `${s.id} em ${l.code}: ${path}`).toBe(s.languages.includes(l.code));
      if (s.languages.includes(l.code)) {
        expect(s.meta[l.code].title && s.meta[l.code].deck && s.meta[l.code].kicker, `${s.id} em ${l.code}: título, subtítulo e chamada`).toBeTruthy();
      }
    }
  }
  // Nada sobra na pasta: todo arquivo é de um sermão e de um idioma declarados
  const known = new Set(GUEST_SERMONS.flatMap((s) => s.languages.map((l) => guestTextPath(s.id, l).replace('vozes/', ''))));
  for (const file of readdirSync('public/conteudo/vozes')) expect(known.has(file), `arquivo sem sermão: ${file}`).toBe(true);
  for (const l of GUEST_LANGUAGES) expect(Object.keys(GUEST_STRINGS[l.code]).length, `textos da tela em ${l.code}`).toBe(Object.keys(GUEST_STRINGS.pt).length);
});

test('vozes: as traduções têm a mesma forma do original (mesmos blocos, mesmas referências)', () => {
  // Nos Salmos, o francês (Louis Segond) e o russo (Sinodal) numeram diferente das versões em português, espanhol e alemão
  const psalms: Partial<Record<LangCode, Record<string, string>>> = {
    fr: { 'Sl 42.7': 'Sl 42.8', 'Sl 42.2': 'Sl 42.3' },
    ru: { 'Sl 42.7': 'Sl 41.8', 'Sl 42.2': 'Sl 41.3' },
  };
  const original = parseBlocks(text(sermon.id, 'pt'));
  const shape = (blocks: Block[]) => blocks.map((b) => b.type + (b.type === 'figure' ? `:${b.figure}` : b.type === 'ol' || b.type === 'ul' ? `:${b.items!.length}` : ''));
  const originalRefs = refsOf(original);
  expect(original.some((b) => b.type === 'verse'), 'o texto-base vem por extenso').toBe(true);
  for (const lang of sermon.languages.filter((l) => l !== 'pt')) {
    const blocks = parseBlocks(text(sermon.id, lang));
    expect(shape(blocks), `forma em ${lang}`).toEqual(shape(original));
    const expected = originalRefs.map((r) => psalms[lang]?.[r] ?? r);
    expect(refsOf(blocks), `referências em ${lang}`).toEqual(expected);
  }
});

test('vozes: toda referência é válida e existe na Bíblia embutida da língua', () => {
  for (const lang of sermon.languages) {
    const blocks = parseBlocks(text(sermon.id, lang));
    for (const ref of refsOf(blocks)) {
      const parsed = parseReferences(ref);
      expect(parsed.errors, `${lang}: ${ref}`).toEqual([]);
      expect(parsed.refs.length, `${lang}: ${ref}`).toBeGreaterThan(0);
      const version = LOCAL_BIBLE[lang];
      if (!version) continue; // inglês: a versão vem da bible-api.com
      for (const r of parsed.refs) {
        const wanted = r.from === undefined ? 1 : (r.to ?? r.from) - r.from + 1;
        expect(verses(version, ref).length, `${lang} (${version}): ${ref} tem os versículos pedidos`).toBeGreaterThanOrEqual(Math.min(wanted, 1));
      }
    }
  }
});

test('vozes: as citações entre aspas que vêm com a referência são palavras da Bíblia da língua', () => {
  // «texto» ([[ref]]): o texto tem de estar no versículo, palavra por palavra (sem contar maiúsculas e pontuação)
  const quoted = /[«“„]([^»”“„]+?)[»”“]\s*\(\[\[([^\]|]+)/g;
  let checked = 0;
  for (const lang of sermon.languages) {
    const version = LOCAL_BIBLE[lang];
    if (!version) continue;
    for (const m of text(sermon.id, lang).matchAll(quoted)) {
      const verse = fold(verses(version, m[2]).join(' '));
      expect(verse.includes(fold(m[1])), `${lang} (${version}): “${m[1]}” não está em ${m[2]}`).toBe(true);
      checked++;
    }
  }
  expect(checked, 'o teste achou as citações').toBeGreaterThanOrEqual(20);
});

test('vozes: os Salmos do francês e do russo apontam para o versículo certo', () => {
  expect(fold(verses('rv1909', 'Sl 42.7').join(' '))).toContain('un abismo llama');
  expect(fold(verses('lsg', 'Sl 42.8').join(' '))).toContain('un flot appelle un autre flot');
  expect(fold(verses('synodal', 'Sl 41.8').join(' '))).toContain('бездна бездну призывает');
  expect(fold(verses('synodal', 'Sl 41.3').join(' '))).toContain('жаждет душа моя к богу');
});

test('vozes: o quadro, a frase em destaque e os versículos por extenso são lidos pelo leitor de texto', () => {
  const blocks = parseBlocks(':::nota Fatos\nUm.\nDois.\n:::\n\n:::versiculo Tg 1.14-15 | Santiago 1:14-15\n\n:::versiculo Jr 2.13\n\n:::nota\nsem título\n:::');
  expect(blocks[0]).toMatchObject({ type: 'note', place: 'Fatos' });
  expect(blocks[0].items).toHaveLength(2);
  expect(blocks[1]).toMatchObject({ type: 'verse', href: 'Tg 1.14-15', label: 'Santiago 1:14-15' });
  expect(blocks[2]).toMatchObject({ type: 'verse', href: 'Jr 2.13', label: undefined });
  expect(blocks[3]).toMatchObject({ type: 'note', place: undefined });
});

test('vozes: o link de revisão é exclusivo e não aparece em nenhum outro arquivo do app', () => {
  const tokens = GUEST_SERMONS.map((s) => s.reviewToken);
  expect(new Set(tokens).size).toBe(tokens.length);
  for (const t of tokens) expect(t, 'pelo menos 16 letras e números').toMatch(/^[0-9a-f]{16,}$/);
  expect(guestSermonByToken(sermon.reviewToken)?.id).toBe(sermon.id);
  expect(guestSermonByToken('qualquer-coisa')).toBeUndefined();
  // O endereço só é conhecido por quem o recebe: fora do arquivo de dados, ele não pode estar em lista, rota, índice nem texto
  const walk = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(`${dir}/${e.name}`) : [`${dir}/${e.name}`]));
  for (const file of [...walk('src'), ...walk('public/conteudo'), 'public/sw.js', 'ngsw-config.json']) {
    if (/\.(woff2|jpg|png|mp3|svg|ico|webp)$/.test(file) || file.endsWith('guest-sermons.ts')) continue;
    for (const t of tokens) expect(readFileSync(file, 'utf8').includes(t), `${file} cita o link de revisão`).toBe(false);
  }
});

test('vozes: catálogo e acesso direto respeitam os estados de publicação', () => {
  const inReview = GUEST_SERMONS.filter((s) => s.status === 'revisao');
  const unlisted = GUEST_SERMONS.find((s) => s.status === 'nao-listado')!;
  expect(visibleGuestSermons(false).some((s) => s.id === unlisted.id), 'não aparece no catálogo publicado').toBe(false);
  expect(visibleGuestSermons(true).some((s) => s.id === unlisted.id), 'não aparece nem no catálogo de desenvolvimento').toBe(false);
  expect(guestSermonForRoute(unlisted.id, false), 'abre pelo endereço direto em produção').toBe(unlisted);
  expect(guestSermonForRoute(unlisted.id, true), 'abre pelo endereço direto em desenvolvimento').toBe(unlisted);
  expect(visibleGuestSermons(false).filter((s) => s.status === 'revisao'), 'revisão não aparece em produção').toEqual([]);
  expect(inReview.every((s) => visibleGuestSermons(true).some((visible) => visible.id === s.id))).toBe(true);
  expect(inReview.every((s) => guestSermonForRoute(s.id, false) === undefined), 'revisão não abre em produção').toBe(true);
  expect(inReview.every((s) => guestSermonForRoute(s.id, true) !== undefined), 'revisão abre em desenvolvimento').toBe(true);
  expect(visibleGuestSermons(false).every((s) => s.status === 'publicado')).toBe(true);
});

test('vozes: a versão do texto muda com uma letra e a mensagem de aprovação diz qual versão foi aprovada', () => {
  const a = contentVersion('um texto');
  expect(a).toMatch(/^[0-9a-f]{8}$/);
  expect(contentVersion('um texto')).toBe(a);
  expect(contentVersion('um texto.')).not.toBe(a);
  const ok = approvalMessage(sermon, { decision: 'aprovado', version: a, name: 'Lucas Silva', note: '' });
  expect(ok).toContain('Aprovação do sermão');
  expect(ok).toContain(`Versão do texto: ${a}`);
  expect(ok).toContain('autorizo a publicação');
  const ask = approvalMessage(sermon, { decision: 'ajustes', version: a, name: 'Lucas Silva', note: 'Trocar X por Y' });
  expect(ask).toContain('Pedido de ajustes');
  expect(ask).toContain('Trocar X por Y');
  expect(ask).not.toContain('autorizo');
});

test('vozes: os versículos usam a versão que a pessoa escolheu, se for da língua do texto; senão a padrão da língua', () => {
  expect(bibleVersionFor('pt', 'almeida')).toBe('almeida');
  expect(bibleVersionFor('pt', 'nbv')).toBe('nbv');
  expect(bibleVersionFor('pt', 'blt'), 'só o Novo Testamento: não serve para Provérbios').toBe('almeida');
  expect(bibleVersionFor('pt', 'kjv')).toBe('almeida');
  expect(bibleVersionFor('es', 'almeida')).toBe('rv1909');
  expect(bibleVersionFor('es', 'vbl')).toBe('vbl');
  expect(bibleVersionFor('en', 'almeida')).toBe('web');
  expect(bibleVersionFor('fr', 'almeida')).toBe('lsg');
  expect(bibleVersionFor('de', 'elo')).toBe('elo');
  expect(bibleVersionFor('ru', 'almeida')).toBe('synodal');
});

test('vozes: referência dita em voz alta e minutos de leitura', () => {
  expect(spokenReference('Provérbios 30:15-16', 'pt')).toBe('Provérbios capítulo 30, versículos 15 a 16');
  expect(spokenReference('Pv 30.1', 'pt')).toBe('Pv capítulo 30, versículo 1');
  expect(spokenReference('Proverbs 30:4', 'en')).toBe('Proverbs chapter 30, verse 4');
  expect(spokenReference('3. Mose 17,11', 'de')).toBe('3. Mose Kapitel 17, Vers 11');
  expect(spokenReference('Притчи 30:15-16', 'ru')).toBe('Притчи глава 30, стихи 15 по 16');
  expect(readingMinutes('uma duas')).toBe(1);
  expect(readingMinutes(Array(1000).fill('palavra').join(' '))).toBe(5);
});

test('vozes: a lista de mudanças do editor está completa e pede resposta onde não há certeza', () => {
  expect(sermon.changes.length).toBeGreaterThan(5);
  for (const c of sermon.changes) {
    expect(c.title.trim() && c.why.trim(), `mudança sem título ou motivo: ${c.title}`).toBeTruthy();
    if (c.kind === 'ajustado' || c.kind === 'retirado') expect(c.original, `${c.title}: mostra o que estava no texto`).toBeTruthy();
  }
  expect(sermon.changes.some((c) => c.kind === 'conferir')).toBe(true);
  expect(sermon.changes.some((c) => c.kind === 'retirado')).toBe(true);
  // Toda fonte de fato acrescentado tem endereço
  for (const s of sermon.sources) expect(s.url).toMatch(/^https:\/\//);
});

test('vozes: o texto do autor foi respeitado (frases-chave dele continuam no sermão)', () => {
  const pt = text(sermon.id, 'pt');
  for (const frase of ['A sanguessuga é semelhante ao pecado: nunca diz basta', 'Um abismo chama outro abismo', 'cisternas', 'Quem tem sede de vencer, venha', 'O pródigo caiu em si', 'Hoje Deus te chama para uma nova realidade']) {
    expect(pt, frase).toContain(frase);
  }
  // O que saiu (por não conferir com a Bíblia) não pode estar no texto publicado
  expect(pt).not.toMatch(/Sebna|toro selvagem/);
});

test('vozes: a imagem de compartilhar leva a frase de efeito do próprio texto e o QR code do sermão no idioma certo', () => {
  const lum = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contrast = (a: string, b: string) => {
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };
  for (const lang of sermon.languages) {
    const md = text(sermon.id, lang);
    const card = voiceSermonCard(sermon, lang);
    // A frase de efeito é a primeira frase em destaque do texto naquele idioma, palavra por palavra
    const pull = parseBlocks(md).find((b) => b.type === 'pullquote')!;
    expect(card.hook, `${lang}: a frase de efeito vem do texto`).toBe(pull.inlines!.map((x) => x.text).join(''));
    expect(card.title).toBe(sermon.meta[lang].title);
    expect(card.badge, `${lang}: o texto-base em letras grandes`).toBeTruthy();
    expect(pageUrl(card.path)).toBe(lang === 'pt' ? `https://sgtcastanheira.github.io/biblia-sagrada/vozes/${sermon.id}` : `https://sgtcastanheira.github.io/biblia-sagrada/vozes/${sermon.id}?idioma=${lang}`);
    expect(pageUrl(card.path), 'nunca o link de revisão do autor').not.toContain(sermon.reviewToken);
    expect(existsSync(`public/conteudo/${card.photo!.src.replace('conteudo/', '')}`), 'a ilustração existe').toBe(true);
    expect(contrast('#fff8ec', card.tone!), `${lang}: creme no fundo`).toBeGreaterThanOrEqual(4.5);
    expect(contrast('#f1d9a8', card.tone!), `${lang}: dourado no fundo`).toBeGreaterThanOrEqual(4.5);
    // Nada do texto do sermão vai na imagem: só título, autoria, o texto-base e a frase dele
    expect(card.topics, `${lang}: sem lista de partes`).toEqual([]);
    expect(JSON.stringify(card).length, `${lang}: só títulos e a frase`).toBeLessThan(1200);
  }
});
