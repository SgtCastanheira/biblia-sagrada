import type { AdState } from './ad-states';
import { dateLabel, dayLabel, photoLabel, toneOf, yearsLabel, type Anniversary, type DayGroup } from './anniversaries';
import type { DictionaryEntry } from './dictionary';
import type { Epoch } from './epochs';
import type { Hymn } from './harpa';
import { COLLECTIONS, findArticle, type ClassicSermon } from './library';
import type { Curiosity } from './curiosities';
import type { BibleMap } from './maps';
import type { Person } from './memorial';
import type { Prophecy } from './prophecy';
import { headingKey, parseBlocks, SPECIAL_SECTIONS } from './rich-text-parser';
import type { Tribe } from './tribes';
import { trailOfArticle, type Trail } from './trails';

/** Endereço público do app: é o que vai no QR code e no texto da imagem compartilhada. */
export const SITE_URL = 'https://sgtcastanheira.github.io/biblia-sagrada/';
export const SITE_NAME = 'Bíblia Sagrada';
export const SITE_TAGLINE = 'Leitura e estudo da Bíblia, grátis, no celular';

/** Cor de fundo quando a página não tem uma cor própria (a das trilhas e estantes já é escura o bastante). */
export const DEFAULT_TONE = '#243f33';
/** Cores do texto da imagem: as mesmas das capas dos livros na estante (contraste conferido nos testes). */
export const CARD_CREAM = '#fff8ec';
export const CARD_GOLD = '#f1d9a8';

/** Um tópico da imagem, com os subtópicos que aparecem logo abaixo dele. */
export interface ShareTopic {
  title: string;
  subs?: string[];
}

/** Tudo o que a imagem de compartilhar mostra. As páginas montam um destes e entregam ao painel. */
export interface ShareCard {
  /** Rota do app com a barra inicial ("/artigo/x"): vira o link e o QR code. */
  path: string;
  /** O assunto, em letras pequenas no alto ("História da Igreja"). */
  theme: string;
  title: string;
  subtitle?: string;
  /** Linha pequena sob o assunto ("11 min de leitura · 1910–hoje"). */
  meta?: string;
  topics: ShareTopic[];
  /** Quantos tópicos a página tem ao todo, quando a lista acima foi cortada (a imagem diz “+ N tópicos no app”). */
  total?: number;
  /** Selo grande abaixo do assunto (“116 anos”), nas imagens de datas da história. */
  badge?: string;
  /** Foto da imagem (caminho dentro de `public/conteudo`) e a linha de crédito, que sempre vai junto. */
  photo?: { src: string; credit: string; /** “Foto ilustrativa” em vez de “Foto”. */ label?: string; /** Onde fica o centro do recorte, de cima (0) para baixo (1); padrão: perto do alto, para os rostos. */ focusY?: number; /** Selo no canto da foto (o ano, no compilado de um dia). */ tag?: string };
  /** Várias fotos lado a lado, no compilado de um dia (no lugar de `photo`). */
  photos?: { src: string; credit: string; label?: string; tag?: string }[];
  /** Frase curta, em dourado, que deixa a pessoa com vontade de ler a história. */
  hook?: string;
  /** Cor de fundo, escura (creme e dourado precisam ter 4,5:1 com ela). */
  tone?: string;
  /** Convite acima do link ("Leia a história completa"). */
  cta?: string;
  /** Título da lista de tópicos (padrão: “O que você vai encontrar”; vazio = sem título). */
  topicsLabel?: string;
  /** Não desenha o título na imagem (ele continua no texto que acompanha): o compilado de um dia já diz tudo com a data. */
  hideTitle?: boolean;
}

const MAX_TOPICS = 12;
const MAX_SUBS = 2;

/** Texto em uma linha só, sem espaços repetidos. */
export const plain = (text: string | undefined | null) => (text ?? '').replace(/\s+/g, ' ').trim();

/** Endereço completo de uma rota do app, sempre no site publicado (mesmo quando se testa no computador). */
export function pageUrl(path: string): string {
  return SITE_URL + path.replace(/^\/+/, '');
}

/** O endereço sem "https://", como se escreve numa imagem. */
export const shortSiteUrl = () => SITE_URL.replace(/^https?:\/\//, '').replace(/\/$/, '');

/** Texto que acompanha a imagem no WhatsApp e no Instagram. */
export function shareText(card: ShareCard): string {
  const lines = [card.title, plain(card.subtitle), '', `${card.cta ?? 'Leia no app Bíblia Sagrada'}: ${pageUrl(card.path)}`];
  return lines.filter((l, i) => l || i === 2).join('\n');
}

/** Corta a lista de tópicos para caber na imagem, sem tópicos vazios nem repetidos. */
export function fitTopics(topics: ShareTopic[], max = MAX_TOPICS, maxSubs = MAX_SUBS): ShareTopic[] {
  const seen = new Set<string>();
  const out: ShareTopic[] = [];
  for (const t of topics) {
    const title = plain(t.title);
    const key = headingKey(title);
    if (!title || seen.has(key)) continue;
    seen.add(key);
    const subs = [...new Set((t.subs ?? []).map(plain).filter(Boolean))].slice(0, maxSubs);
    out.push(subs.length ? { title, subs } : { title });
    if (out.length === max) break;
  }
  return out;
}

const SPECIAL_KEYS = new Set(Object.keys(SPECIAL_SECTIONS).map(headingKey));

/**
 * Cartão de um estudo: o assunto é a trilha (ou a coleção), os tópicos são os títulos do texto e os
 * subtópicos são os subtítulos e os títulos das fichas de cada seção. Seções como “Para a Vida” e
 * “Linha do Tempo” não entram: não despertam vontade de ler.
 */
export function articleCard(articleId: string, md: string): ShareCard | null {
  const a = findArticle(articleId);
  if (!a) return null;
  const trail = trailOfArticle(a.id);
  const topics: ShareTopic[] = [];
  for (const b of parseBlocks(md)) {
    const text = plain(b.inlines?.map((x) => x.text).join(''));
    if (b.type === 'h2') {
      if (SPECIAL_KEYS.has(headingKey(text))) {
        topics.push({ title: '' });
        continue;
      }
      topics.push({ title: text, subs: [] });
    } else if ((b.type === 'h3' || b.type === 'facts') && topics.length) {
      const last = topics[topics.length - 1];
      const sub = b.type === 'h3' ? text : plain(b.place);
      if (last.title && sub) last.subs!.push(sub);
    }
  }
  return {
    path: `/artigo/${a.id}`,
    theme: trail?.name ?? COLLECTIONS[a.collection].name,
    title: a.title,
    subtitle: a.subtitle,
    meta: [`${a.minutes} min de leitura`, a.period].filter(Boolean).join(' · '),
    topics: fitTopics(topics),
    total: fitTopics(topics, 99).length,
    tone: trail?.tone,
    cta: 'Leia a história completa',
  };
}

/** Cartão simples de uma página que tem só uma lista de pontos (curiosidade, mapa, tribo, época…). */
export function listCard(c: Omit<ShareCard, 'topics'> & { points: (string | ShareTopic)[] }): ShareCard {
  const { points, ...rest } = c;
  return { ...rest, topics: fitTopics(points.map((p) => (typeof p === 'string' ? { title: p } : p))) };
}

/** Frase curta para a imagem: corta no último espaço antes do limite e termina em reticências. */
export function clip(text: string | undefined | null, max: number): string {
  const s = plain(text);
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), max / 2)).replace(/[\s,;:.]+$/, '')}…`;
}

const topic = (title: string, ...subs: (string | undefined)[]): ShareTopic => ({ title, subs: subs.filter((x): x is string => !!x) });

export function personCard(p: Person, group: string): ShareCard {
  return {
    path: `/memorial/${p.id}`,
    theme: `Memorial da Fé · ${group}`,
    title: p.name,
    subtitle: clip(p.summary, 150),
    meta: [p.title, p.period].filter(Boolean).join(' · '),
    topics: fitTopics([...(p.facts ?? []).map(([k, v]) => topic(`${k}: ${clip(v, 42)}`)), ...(p.keyVerse ? [topic(`Versículo-chave: ${clip(p.keyVerse, 32)}`)] : [])]),
    cta: 'Conheça esta história',
  };
}

export function prophecyCard(p: Prophecy, category: string): ShareCard {
  return {
    path: `/profecias/${p.id}`,
    theme: `Promessas e Profecias · ${category}`,
    title: p.title,
    subtitle: clip(p.given, 150),
    topics: fitTopics([
      topic('A promessa', p.ref),
      topic('O contexto'),
      topic('O cumprimento', ...p.fulfillment.map((f) => f.ref)),
      ...(p.views?.length ? [topic('As leituras diferentes', ...p.views.map((v) => v.name))] : []),
    ]),
    cta: 'Veja a promessa e o cumprimento',
  };
}

export function tribeCard(t: Tribe): ShareCard {
  return {
    path: `/tribos/${t.id}`,
    theme: 'As Doze Tribos de Israel',
    title: `Tribo de ${t.name}`,
    subtitle: clip(t.role, 150),
    meta: `Filho de ${t.father} e ${t.mother}`,
    topics: fitTopics([
      topic('A bênção de Jacó', t.jacob.ref),
      ...(t.moses.ref ? [topic('A bênção de Moisés', t.moses.ref)] : []),
      topic('O lugar no acampamento'),
      topic('O censo no Sinai e em Moabe'),
      topic('A vocação da tribo'),
    ]),
    cta: 'Conheça a tribo',
  };
}

export function adStateCard(s: AdState): ShareCard {
  return {
    path: `/assembleia-de-deus/${s.id}`,
    theme: 'Assembleias de Deus pelo Brasil',
    title: s.state,
    subtitle: clip(s.summary, 150),
    meta: [s.city, s.year].filter(Boolean).join(' · '),
    topics: fitTopics([
      topic('Quando a igreja chegou', s.year),
      ...(s.from ? [topic('De onde vieram os pioneiros', s.from)] : []),
      topic('Como tudo começou', clip(s.origin, 60)),
      topic('As convenções e os ministérios do estado'),
    ]),
    cta: 'Leia a história da igreja neste estado',
  };
}

export function dictionaryCard(e: DictionaryEntry, kind: string): ShareCard {
  return {
    path: `/dicionario/${e.id}`,
    theme: `Dicionário Bíblico · ${kind}`,
    title: e.term,
    subtitle: clip(e.definition, 150),
    topics: fitTopics([
      ...(e.original ?? []).map((o) => topic(`${o.word} (${o.translit})`, clip(o.meaning, 60))),
      ...(e.senses ?? []).map((x) => topic(clip(x.sense, 70))),
    ]),
    cta: 'Veja o significado e os versículos',
  };
}

export function hymnCard(h: Hymn, author?: string): ShareCard {
  return {
    path: `/harpa/${h.n}`,
    theme: 'Harpa Cristã',
    title: `Hino ${h.n}: ${h.title}`,
    subtitle: author ? `Autor: ${author}` : undefined,
    meta: h.origin?.year,
    topics: fitTopics([
      ...(author ? [topic('Quem escreveu', author)] : []),
      ...(h.origin ? [topic('A história do hino', clip(h.origin.story, 70))] : []),
    ]),
    cta: 'Conheça a história deste hino',
  };
}

export function epochCard(e: Epoch, index: number, total: number): ShareCard {
  return {
    path: `/epocas/${e.id}`,
    theme: `Linha do Tempo · ${e.part}`,
    title: e.name,
    subtitle: clip(e.summary, 150),
    meta: `${e.period} · época ${index + 1} de ${total}`,
    topics: fitTopics([topic('As histórias dessa época'), topic('Os personagens, os mapas e as profecias'), topic('As crises do mundo e o que a igreja fez nelas')]),
    cta: 'Veja a época inteira',
  };
}

export function classicSermonCard(s: ClassicSermon): ShareCard {
  return {
    path: `/avivamento/${s.id}`,
    theme: 'Sermões que Marcaram a História',
    title: s.title,
    subtitle: `${s.preacher} (${s.lived}) · ${s.place}, ${s.year}`,
    meta: s.movement,
    topics: fitTopics([topic('Quem foi o pregador', clip(s.bio, 70)), topic('Por que ficou famoso', clip(s.context, 70)), topic('O texto bíblico', s.text)]),
    cta: 'Leia o sermão',
  };
}

export function curiosityCard(c: Curiosity): ShareCard {
  return {
    path: `/curiosidades/${c.id}`,
    theme: `Você sabia? · ${c.topic}`,
    title: c.question,
    subtitle: 'A resposta está no app, com os versículos.',
    topics: fitTopics((c.points ?? []).map((x) => topic(x.label))),
    cta: 'Descubra a resposta',
  };
}

export function mapCard(m: BibleMap): ShareCard {
  return {
    path: `/mapas/${m.id}`,
    theme: 'Mapas e Lugares',
    title: m.title,
    subtitle: clip(m.summary, 150),
    meta: m.period,
    topics: fitTopics(m.steps.map((st) => topic(st.place))),
    cta: 'Veja o mapa e a jornada',
  };
}

/** Cartão de um assunto (trilha) da biblioteca: cada ramo vira um tópico, e as primeiras histórias, subtópicos. */
export function trailCard(t: Trail): ShareCard {
  const total = t.branches.reduce((n, b) => n + b.ids.length, 0);
  return {
    path: `/historia?trilha=${t.id}`,
    theme: 'Biblioteca de Histórias e Estudos',
    title: t.name,
    subtitle: clip(t.description, 150),
    meta: `${total} histórias e estudos`,
    topics: fitTopics(t.branches.map((b) => topic(b.title, ...b.ids.slice(0, 2).map((id) => findArticle(id)?.title)))),
    tone: t.tone,
    cta: 'Abra a biblioteca',
  };
}

/** Imagem de uma data da história: o selo com os anos, a data, a foto com o crédito e o título do fato. */
export function anniversaryCard(a: Anniversary, now: Date): ShareCard {
  return {
    path: a.link,
    theme: 'Datas da História',
    badge: yearsLabel(a, now),
    meta: dateLabel(a),
    title: a.title,
    subtitle: a.text,
    topics: [],
    tone: toneOf(a),
    cta: 'Leia a história completa',
    hook: a.hook,
    photo: a.image && a.credit ? { src: `conteudo/${a.image}`, credit: a.credit, label: photoLabel(a) } : undefined,
  };
}

/** Imagem do compilado de um dia que tem vários fatos: a data, os fatos em lista e a foto do primeiro que tem uma. */
export function dayCard(group: DayGroup): ShareCard {
  const first = group.events[0];
  const n = group.events.length;
  // uma foto por fato, lado a lado, cada uma com o ano no canto
  const photos = group.events.filter((e) => e.image && e.credit).map((e) => ({ src: `conteudo/${e.image}`, credit: e.credit!, label: photoLabel(e), tag: String(e.year) }));
  return {
    path: '/datas',
    theme: 'Datas da História',
    badge: `${n} fatos`,
    meta: dayLabel(group.month, group.day),
    title: `O que aconteceu em ${dayLabel(group.month, group.day)}`,
    topics: group.events.map((e) => ({ title: `${e.year}: ${e.title}` })),
    topicsLabel: '',
    hideTitle: true,
    tone: toneOf(first),
    cta: 'Veja todas as datas no app',
    photos: photos.length ? photos : undefined,
  };
}
