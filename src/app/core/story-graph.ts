import { ARTICLES, type Article, findArticle } from './library';
import { type Trail, TRAILS, trailArticleIds, trailOfArticle } from './trails';

/**
 * Como as histórias se ligam, sem repetir: a ordem de cada trilha (anterior e próxima), as histórias de outras
 * trilhas que aconteceram na mesma época e as histórias que o próprio texto já cita (que não se sugerem de novo).
 * Código puro (sem Angular), para os testes.
 */

/** Onde a história está na sua trilha: posição, anterior, próxima e, no fim, a trilha seguinte. */
export interface TrailStep {
  trail: Trail;
  /** Título do ramo da trilha ("A Reforma"). */
  branch: string;
  /** Posição a partir de 0. */
  index: number;
  total: number;
  ids: string[];
  prev: Article | null;
  next: Article | null;
  /** Quando esta é a última história, a trilha que vem depois. */
  nextTrail: Trail | null;
}

export function trailStep(articleId: string): TrailStep | null {
  const trail = trailOfArticle(articleId);
  if (!trail) return null;
  const ids = trailArticleIds(trail);
  const index = ids.indexOf(articleId);
  const branch = trail.branches.find((b) => b.ids.includes(articleId))!.title;
  const next = index + 1 < ids.length ? findArticle(ids[index + 1]) ?? null : null;
  const t = TRAILS.indexOf(trail);
  return {
    trail, branch, index, total: ids.length, ids,
    prev: index > 0 ? findArticle(ids[index - 1]) ?? null : null,
    next,
    nextTrail: next ? null : TRAILS[(t + 1) % TRAILS.length],
  };
}

/** Histórias que o texto já cita (cartões ":::leia" e links para /artigo/…): não se sugerem de novo no fim. */
export function linkedArticles(md: string): string[] {
  const ids = [
    ...[...md.matchAll(/^:::\s*leia\s+(\S+)/gm)].map((m) => m[1]),
    ...[...md.matchAll(/\]\(\/artigo\/([a-z0-9-]+)\)/g)].map((m) => m[1]),
  ];
  return [...new Set(ids)];
}

const ROMAN: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100 };
function roman(s: string): number {
  let total = 0;
  for (let i = 0; i < s.length; i++) {
    const v = ROMAN[s[i]], n = ROMAN[s[i + 1]] ?? 0;
    total += v < n ? -v : v;
  }
  return total;
}

interface Point { start: number; end: number; era: 'ac' | 'dc' | null }

function point(part: string, now: number): Point | null {
  const era = /a\.\s?C\./i.test(part) ? 'ac' : /d\.\s?C\./i.test(part) ? 'dc' : null;
  if (/hoje/i.test(part)) return { start: now, end: now, era: 'dc' };
  const century = part.match(/s[ée]c\.?\s*([IVXLC]+)/);
  if (century) {
    const n = roman(century[1]);
    return era === 'ac' ? { start: -n * 100, end: -(n * 100 - 99), era } : { start: (n - 1) * 100 + 1, end: n * 100, era: 'dc' };
  }
  const year = part.match(/(\d{1,4})/);
  if (!year) return null;
  const v = Number(year[1]);
  return { start: era === 'ac' ? -v : v, end: era === 'ac' ? -v : v, era };
}

/**
 * Os anos de um período, com a.C. negativo: "313–451" → [313, 451]; "c. 430 a.C. – 4 a.C." → [-430, -4];
 * "séc. I" → [1, 100]; "1910–hoje" → [1910, ano atual]. Sem datas ("Toda a Bíblia") → null.
 */
export function periodYears(period: string, now = new Date().getFullYear()): [number, number] | null {
  const parts = period.split(/\s*[–—]\s*|\s+-\s+/).map((p) => p.trim()).filter(Boolean);
  const points = parts.map((p) => point(p, now));
  if (!points.length || points.some((p) => !p)) return null;
  const first = points[0]!, last = points[points.length - 1]!;
  // "c. 1400–400 a.C.": o a.C. do fim vale para o começo
  if (points.length > 1 && first.era === null && last.era === 'ac') {
    first.start = -first.start;
    first.end = -first.end;
  }
  const start = Math.min(first.start, last.start), end = Math.max(first.end, last.end);
  return [start, end];
}

/** Quanto dois períodos coincidem: o trecho em comum dividido pelo total (0 = nada; 1 = iguais). */
export function eraOverlap(a: [number, number], b: [number, number]): number {
  const lo = Math.max(a[0], b[0]), hi = Math.min(a[1], b[1]);
  if (hi < lo) return 0;
  return (hi - lo + 1) / (Math.max(a[1], b[1]) - Math.min(a[0], b[0]) + 1);
}

export interface EraMatch {
  article: Article;
  trail: Trail;
  score: number;
}

/**
 * Histórias de outras trilhas que aconteceram na mesma época, sem repetir as que o texto já cita nem a anterior e
 * a próxima da trilha. Os períodos precisam se cruzar, e vêm primeiro as que começam mais perto (em anos) do começo
 * desta: uma história longa (séc. III a.C. – séc. X) não puxa a Idade Média só por cruzar com ela.
 * Até 450 anos de distância; no máximo duas da mesma trilha, para variar.
 */
export function sameEra(articleId: string, exclude: Iterable<string> = [], limit = 3): EraMatch[] {
  const self = findArticle(articleId);
  const years = self?.period ? periodYears(self.period) : null;
  const trail = trailOfArticle(articleId);
  if (!self || !years || !trail) return [];
  const step = trailStep(articleId);
  const skip = new Set([articleId, ...exclude, step?.prev?.id, step?.next?.id].filter(Boolean) as string[]);
  const found: EraMatch[] = [];
  for (const a of ARTICLES) {
    if (skip.has(a.id) || a.overview) continue;
    const t = trailOfArticle(a.id);
    if (!t || t === trail) continue;
    const other = a.period ? periodYears(a.period) : null;
    if (!other || eraOverlap(years, other) === 0) continue;
    // Perto no começo: 1 no mesmo ano, 0,5 a 50 anos, 0,1 a 450 anos
    const score = 1 / (1 + Math.abs(other[0] - years[0]) / 50);
    if (score >= 0.1) found.push({ article: a, trail: t, score: score + eraOverlap(years, other) / 100 });
  }
  found.sort((a, b) => b.score - a.score);
  const perTrail = new Map<string, number>();
  const out: EraMatch[] = [];
  for (const m of found) {
    const n = perTrail.get(m.trail.id) ?? 0;
    if (n >= 2) continue;
    perTrail.set(m.trail.id, n + 1);
    out.push(m);
    if (out.length === limit) break;
  }
  return out;
}
