/**
 * Mundo Cristão: notícias de missões, da igreja perseguida e dos países onde o evangelho é proibido.
 *
 * Este arquivo é TypeScript puro, sem Angular e sem importações, de propósito: o app (a seção Mundo Cristão do Jornal, em /vozes) e o script
 * do GitHub Actions (tools/noticias/buscar-noticias.mjs, que o Node 24 lê direto) usam as MESMAS fontes, o mesmo filtro e
 * a mesma limpeza. Só sintaxe que o Node apaga sozinho (nada de enum nem de propriedade no construtor).
 *
 * ── Para trocar de fonte ou de proxy, edite só aqui no topo. ──
 */

/** De quanto em quanto tempo a tela se atualiza sozinha enquanto está aberta. */
export const REFRESH_MS = 5 * 60 * 1000;
/** Quantas notícias ficam na tela e no arquivo de reserva. */
export const NEWS_LIMIT = 20;
/** Reserva diária: o GitHub Actions grava este arquivo; a tela o usa quando a busca ao vivo falha. */
export const NEWS_CACHE_URL = 'data/noticias.json';

export type FeedKind = 'rss' | 'wp';

export interface NewsSource {
  /** Nome que aparece em cada notícia. */
  name: string;
  /** Endereço do site, para o crédito no pé da tela. */
  site: string;
  /** `rss`: feed RSS (passa por proxy no navegador). `wp`: API REST do WordPress (o site libera CORS, vai direto). */
  kind: FeedKind;
  url: string;
  /** Só entram os itens que casam com as palavras-chave (sites gerais). Falso: o site inteiro já é do assunto. */
  filter: boolean;
}

/**
 * URLs conferidas em 16 nov 2026:
 * - Portas Abertas não tem RSS (o /feed devolve a página inicial); a API do WordPress deles tem o tipo `noticias` e libera CORS.
 * - Voz dos Mártires: o site brasileiro não respondeu; o feed de Portugal (pt-PT) respondeu, mas publica pouco.
 * - Gospel Prime mudou para goodprime.co (o endereço antigo redireciona).
 * - Guiame: o feed é /rss (/feed dá erro 500).
 */
export const NEWS_SOURCES: NewsSource[] = [
  { name: 'Portas Abertas', site: 'https://portasabertas.org.br', kind: 'wp', url: 'https://portasabertas.org.br/wp-json/wp/v2/noticias?per_page=20&_fields=id,date_gmt,link,title,meta', filter: false },
  { name: 'Voz dos Mártires', site: 'https://www.vozdosmartires.pt', kind: 'rss', url: 'https://www.vozdosmartires.pt/feed/', filter: false },
  { name: 'Gospel Prime', site: 'https://goodprime.co', kind: 'rss', url: 'https://goodprime.co/feed/', filter: true },
  { name: 'Guiame', site: 'https://guiame.com.br', kind: 'rss', url: 'https://guiame.com.br/rss', filter: true },
];

/**
 * Serviços que leem o feed por nós, porque os sites não liberam CORS para o navegador. Tenta-se um de cada vez, na ordem:
 * se um cair, o próximo assume. Para trocar, mude esta lista (`json` = rss2json; `xml` = devolve o XML puro).
 * Em 16 nov 2026: rss2json respondeu; allorigins deu erro 520; corsproxy.io passou a exigir chave.
 */
export interface Proxy {
  name: string;
  kind: 'json' | 'xml';
  url: (feed: string) => string;
}
export const PROXIES: Proxy[] = [
  { name: 'rss2json', kind: 'json', url: (feed) => `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed)}` },
  { name: 'allorigins', kind: 'xml', url: (feed) => `https://api.allorigins.win/raw?url=${encodeURIComponent(feed)}` },
];

/** Palavras que marcam uma notícia do assunto (sem acento e em minúsculas; comparação por trecho). */
export const KEYWORDS: string[] = [
  // “missão” sozinha não entra: aparece em qualquer texto de igreja (“a missão da igreja”)
  'persegu', 'martir', 'missoes', 'missionar', 'campo missionario', 'era missionaria', 'igreja perseguida', 'igrejas perseguidas',
  'cristaos presos', 'cristao preso', 'cristaos mortos', 'cristaos assassinados', 'cristaos sequestrados', 'cristaos atacados',
  'pastor preso', 'pastor morto', 'pastor assassinado', 'pastor sequestrado', 'pastores presos', 'pastores multados', 'pastor multado',
  'evangelho proibido', 'proibido de pregar', 'proibida de pregar', 'por causa da fe', 'ataque a igreja', 'ataques a igrejas',
  'igrejas incendiadas', 'igreja incendiada', 'blasfemia', 'convertidos ao cristianismo', 'cristas espancadas', 'crista espancada',
  'jovem crista', 'portas abertas', 'voz dos martires', 'lista mundial da perseguicao',
];

/** Uma notícia, nos campos que o arquivo de reserva guarda. */
export interface NewsItem {
  titulo: string;
  resumo: string;
  /** Data e hora de publicação, em ISO (UTC). */
  data: string;
  /** Nome da fonte (como em `NewsSource.name`). */
  fonte: string;
  url: string;
  thumbnail: string | null;
}

/** O arquivo de reserva (public/data/noticias.json). */
export interface NewsCache {
  /** Quando o GitHub Actions leu os feeds pela última vez com mudança. */
  geradoEm: string;
  itens: NewsItem[];
}

/** O que cada fonte entrega, já reduzido ao essencial, antes da limpeza. */
export interface RawEntry {
  title?: string | null;
  link?: string | null;
  /** ISO, RFC 822 ou número (ms). Sem fuso, vale UTC. */
  date?: string | number | Date | null;
  /** Texto curto pronto (subtítulo, resumo do feed). */
  summary?: string | null;
  /** HTML do resumo ou do conteúdo, de onde sai o texto e, se faltar, a primeira imagem. */
  html?: string | null;
  image?: string | null;
  categories?: string[] | null;
}

const NAMED: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', hellip: '…', ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’',
  ndash: '–', mdash: '—', laquo: '«', raquo: '»', ordm: 'º', ordf: 'ª', deg: '°', ccedil: 'ç', Ccedil: 'Ç', ntilde: 'ñ', Ntilde: 'Ñ',
  euro: '€', bull: '•', middot: '·', copy: '©',
};
// Vogais acentuadas: a letra + o nome do acento (aacute, egrave, otilde, uuml…)
for (const [accent, marks] of [
  ['acute', 'áéíóúÁÉÍÓÚ'], ['grave', 'àèìòùÀÈÌÒÙ'], ['circ', 'âêîôûÂÊÎÔÛ'], ['tilde', 'ãõÃÕ'], ['uml', 'äëïöüÄËÏÖÜ'],
] as const) {
  const letters = accent === 'tilde' ? 'aoAO' : 'aeiouAEIOU';
  [...marks].forEach((mark, i) => { NAMED[`${letters[i]}${accent}`] = mark; });
}

/** `&aacute;`, `&#8211;` e `&#x2013;` viram o caractere. */
export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi, (all, code: string) => {
    if (code[0] === '#') {
      const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : all;
    }
    return NAMED[code] ?? all;
  });
}

/** HTML → texto simples numa linha: sem etiquetas, com os acentos, sem o rodapé “O post … apareceu primeiro em …”. */
export function plainText(html: string): string {
  let t = html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6]|br)>|<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
  t = decodeEntities(t).replace(/\s+/g, ' ').trim();
  t = t.replace(/\s*(O|A)s?\s+(post|conteúdo|artigo)\s.+?\s(apareceu|aparece)\s+primeiro\s+em\s.*$/i, '');
  return t.replace(/\s*\[…\]\s*$/, '…').trim();
}

/** Corta no limite sem partir palavra. */
export function cut(text: string, max: number): string {
  if (text.length <= max) return text;
  const head = text.slice(0, max);
  const at = head.lastIndexOf(' ');
  return `${(at > max * 0.6 ? head.slice(0, at) : head).replace(/[\s.,;:\u2013\u2014-]+$/, '')}\u2026`;
}

/** S\u00f3 endere\u00e7os http(s); o http vira https (o app \u00e9 https e bloquearia o resto). Devolve null para o que n\u00e3o serve. */
export function safeUrl(value: string | null | undefined, base?: string): string | null {
  if (!value) return null;
  try {
    const u = new URL(value.trim(), base);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
    u.protocol = 'https:';
    return u.href;
  } catch {
    return null;
  }
}

/** A primeira imagem de um trecho de HTML. */
export function firstImage(html: string | null | undefined, base?: string): string | null {
  const m = html?.match(/<img[^>]+?(?:data-src|src)=["']([^"']+)["']/i);
  return m ? safeUrl(decodeEntities(m[1]), base) : null;
}

/** Data em milissegundos, ou null. Sem fuso (\u201c2026-11-13 20:08:32\u201d) vale UTC. */
export function parseDate(value: string | number | Date | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.getTime();
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  let s = value.trim();
  if (/^\d{4}-\d\d-\d\d[ T]\d\d:\d\d(:\d\d(\.\d+)?)?$/.test(s)) s = `${s.replace(' ', 'T')}Z`;
  const t = Date.parse(s);
  return Number.isNaN(t) ? null : t;
}

/** Sem acento, em min\u00fasculas e sem pontua\u00e7\u00e3o, para comparar. */
export function fold(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

/** A notícia é do assunto (missões, perseguição…)? */
export function matchesTopic(item: { titulo: string; resumo: string }, categories: string[] = []): boolean {
  const haystack = ` ${fold(`${item.titulo} ${item.resumo} ${categories.join(' ')}`)} `;
  return KEYWORDS.some((k) => haystack.includes(k));
}

/** Uma entrada crua vira notícia. Devolve null se faltar título, endereço ou data, ou se a fonte filtra e não casa. */
export function toNewsItem(raw: RawEntry, source: NewsSource): NewsItem | null {
  const titulo = plainText(raw.title ?? '');
  const url = safeUrl(raw.link);
  const time = parseDate(raw.date);
  if (!titulo || !url || time === null) return null;
  const summary = plainText(raw.summary || raw.html || '');
  const resumo = cut(summary.toLowerCase() === titulo.toLowerCase() ? '' : summary, 220);
  const item: NewsItem = {
    titulo,
    resumo,
    data: new Date(time).toISOString(),
    fonte: source.name,
    url,
    thumbnail: safeUrl(raw.image, url) ?? firstImage(raw.html, url),
  };
  if (source.filter && !matchesTopic(item, raw.categories ?? [])) return null;
  return item;
}

/** Chave para achar a mesma matéria em duas listas: endereço sem esquema, www, parâmetros e barra final. */
function urlKey(url: string): string {
  try {
    const u = new URL(url);
    return `${u.hostname.replace(/^www\./, '')}${u.pathname.replace(/\/+$/, '')}`.toLowerCase();
  } catch {
    return url;
  }
}

/** Junta as listas, tira repetidas (mesmo endereço ou mesmo título), põe a mais nova primeiro e corta no limite. */
export function mergeNews(lists: NewsItem[][], limit = NEWS_LIMIT): NewsItem[] {
  const all = lists.flat().sort((a, b) => Date.parse(b.data) - Date.parse(a.data));
  const seen = new Map<string, NewsItem>();
  const out: NewsItem[] = [];
  for (const item of all) {
    const keys = [`u:${urlKey(item.url)}`, `t:${fold(item.titulo)}`];
    const twin = keys.map((k) => seen.get(k)).find((x) => x);
    if (twin) {
      // A cópia mais nova já está na lista; se ela veio sem imagem e esta tem, aproveita
      if (!twin.thumbnail && item.thumbnail) twin.thumbnail = item.thumbnail;
      continue;
    }
    keys.forEach((k) => seen.set(k, item));
    out.push(item);
  }
  return out.slice(0, limit);
}

/** Resposta da API do WordPress do Portas Abertas (tipo `noticias`) → entradas. O subtítulo é o resumo; a miniatura vem em `meta`. */
export function fromWordPress(json: unknown): RawEntry[] {
  if (!Array.isArray(json)) return [];
  return json.map((p: Record<string, unknown>) => {
    const meta = (p['meta'] ?? {}) as Record<string, unknown>;
    const title = (p['title'] ?? {}) as Record<string, unknown>;
    const content = (p['content'] ?? {}) as Record<string, unknown>;
    const text = (v: unknown) => (typeof v === 'string' ? v : '');
    return {
      title: text(title['rendered']),
      link: text(p['link']),
      date: text(p['date_gmt']),
      summary: text(meta['subtitulo']),
      html: text(content['rendered']),
      image: text(meta['imagem_miniatura']) || text(meta['banner']),
    };
  });
}

/** Resposta do rss2json → entradas. */
export function fromRss2Json(json: unknown): RawEntry[] {
  const items = (json as { status?: string; items?: unknown[] } | null)?.items;
  if (!json || (json as { status?: string }).status !== 'ok' || !Array.isArray(items)) return [];
  return items.map((i) => {
    const it = i as Record<string, unknown>;
    const text = (v: unknown) => (typeof v === 'string' ? v : '');
    const enclosure = (it['enclosure'] ?? {}) as Record<string, unknown>;
    return {
      title: text(it['title']),
      link: text(it['link']),
      date: text(it['pubDate']),
      html: text(it['description']) || text(it['content']),
      image: text(it['thumbnail']) || (text(enclosure['type']).startsWith('image') ? text(enclosure['link']) : ''),
      categories: Array.isArray(it['categories']) ? (it['categories'] as unknown[]).filter((c): c is string => typeof c === 'string') : [],
    };
  });
}

/** Rótulo de há quanto tempo: “agora”, “há 3 min”, “há 2 h”, “há 4 dias”. */
export function agoLabel(from: number, now: number): string {
  const s = Math.max(0, Math.round((now - from) / 1000));
  if (s < 45) return 'agora';
  const m = Math.round(s / 60);
  if (m < 60) return `há ${Math.max(1, m)} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.round(h / 24);
  return d === 1 ? 'há 1 dia' : `há ${d} dias`;
}

/** Confere o arquivo de reserva lido da rede: só ficam as notícias com título, endereço http(s) e data de verdade. */
export function parseCache(json: unknown): NewsCache | null {
  const raw = json as { geradoEm?: unknown; itens?: unknown } | null;
  if (!raw || typeof raw.geradoEm !== 'string' || !Array.isArray(raw.itens)) return null;
  const text = (v: unknown) => (typeof v === 'string' ? v : '');
  const itens: NewsItem[] = [];
  for (const entry of raw.itens as Record<string, unknown>[]) {
    const url = safeUrl(text(entry?.['url']));
    const time = parseDate(text(entry?.['data']));
    const titulo = text(entry?.['titulo']).trim();
    if (!url || time === null || !titulo) continue;
    itens.push({
      titulo,
      resumo: text(entry['resumo']),
      data: new Date(time).toISOString(),
      fonte: text(entry['fonte']),
      url,
      thumbnail: safeUrl(text(entry['thumbnail'])),
    });
  }
  return { geradoEm: raw.geradoEm, itens };
}
