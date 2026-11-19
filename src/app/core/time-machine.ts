import { ERAS, type Era } from './atlas';
import type { ContextEvent } from './ad-context';
import {
  CHRONO_CHAPTERS,
  CHRONO_SECTIONS,
  chronoBooks,
  sectionSize,
  TIMELINE_END,
  TIMELINE_START,
  timelineSegments,
} from './bible-chronological';
import { type Life, parsePeriod } from './contemporaries';
import { WORLD_EVENTS } from './world-events';

/**
 * A Máquina do Tempo: um ano só (o cursor) move o mapa, as vidas, o mundo e os livros. Código puro (sem Angular), para os testes.
 * Nada aqui é dado novo: as épocas e os impérios são os do Atlas, as vidas são as do Memorial, os fatos do mundo são os de `WORLD_EVENTS` e a
 * ordem dos livros é a da leitura cronológica.
 */

export const TM_START = TIMELINE_START; // 2000 a.C., o tempo de Abraão
export const TM_END = TIMELINE_END; // o ano 95, o Apocalipse
/** Quantos pixels vale um ano na faixa: o mínimo mostra o período inteiro, o máximo, uma década por tela de celular. */
export const TM_MIN_PPY = 0.7;
export const TM_MAX_PPY = 12;
export const TM_DEFAULT_PPY = 3;

export const clampYear = (year: number): number => Math.min(TM_END, Math.max(TM_START, year));
export const clampPpy = (ppy: number): number => Math.min(TM_MAX_PPY, Math.max(TM_MIN_PPY, ppy));

/** “740 a.C.” ou “28 d.C.” (a história não tem o ano zero: o 0 vira 1 d.C.). */
export function yearText(year: number): string {
  const y = Math.round(year);
  return y < 0 ? `${-y} a.C.` : `${y === 0 ? 1 : y} d.C.`;
}

export interface EraRange {
  era: Era;
  from: number;
  to: number;
}
/** Os anos de cada época do Atlas, lidos do texto que o próprio Atlas escreve (“c. 745–612 a.C.”). */
export const ERA_RANGES: EraRange[] = ERAS.map((era) => {
  const p = parsePeriod(era.period)!;
  return { era, from: p.from, to: p.to };
});

/** A época do Atlas (e, com ela, os impérios do mapa) que vale em um ano: a que o contém, a mais recente se duas se cruzam, ou a mais próxima. */
export function eraAt(year: number): Era {
  const inside = ERA_RANGES.filter((r) => year >= r.from && year <= r.to).sort((a, b) => b.from - a.from);
  if (inside.length) return inside[0].era;
  const distance = (r: EraRange) => (year < r.from ? r.from - year : year - r.to);
  return [...ERA_RANGES].sort((a, b) => distance(a) - distance(b))[0].era;
}

/** A fase da linha do tempo em um ano, ou `null` nos 400 anos sem livros entre Malaquias e Jesus. */
export function phaseAt(year: number): string | null {
  const segs = timelineSegments();
  const inside = segs.find((s) => year >= s.from && year <= s.to);
  if (inside) return inside.id;
  const retorno = segs.find((s) => s.id === 'retorno')!;
  const jesus = segs.find((s) => s.id === 'jesus')!;
  if (year > retorno.to && year < jesus.from) return null;
  const distance = (s: { from: number; to: number }) => (year < s.from ? s.from - year : year - s.to);
  return [...segs].sort((a, b) => distance(a) - distance(b))[0].id;
}

/** O ano do meio de uma fase (onde a Máquina do Tempo vai quando se escolhe a fase); a criação, sem data, leva ao começo. */
export function phaseMiddle(phase: string): number {
  const seg = timelineSegments().find((s) => s.id === phase);
  return seg ? Math.round((seg.from + seg.to) / 2) : TM_START;
}

/** Quanto tempo (anos de verdade) cada ponto sem ano exato (“c. 1100 a.C.”) vale na hora de dizer “vivia neste ano”. */
export const POINT_SPAN = 12;

/** Quem vivia em um ano: quem tem começo e fim, quem tem um ano aproximado (por perto) e quem só tem o século (de 1 a 100). */
export function aliveAt(lives: Life[], year: number): Life[] {
  return lives
    .filter((l) => (l.precision === 'ponto' ? Math.abs(year - l.from) <= POINT_SPAN : year >= l.from && year <= l.to))
    .sort((a, b) => a.from - b.from || a.name.localeCompare(b.name, 'pt-BR'));
}

export interface LanePlan {
  /** Em que fileira cada pessoa cai (0 é a de cima). */
  lane: Record<string, number>;
  count: number;
}
/**
 * Distribui as pessoas em fileiras sem se cobrirem (a primeira fileira livre). Quem só tem o século (os discípulos e apóstolos) não entra: são
 * dezenas ao mesmo tempo e viram uma faixa só. `gap` são os anos de folga entre duas pessoas na mesma fileira.
 */
export function packLanes(lives: Life[], gap = 3): LanePlan {
  const ends: number[] = [];
  const lane: Record<string, number> = {};
  const list = lives.filter((l) => l.precision !== 'seculo').sort((a, b) => a.from - b.from || b.to - a.to);
  for (const l of list) {
    const end = l.precision === 'ponto' ? l.from + 4 : l.to;
    let i = ends.findIndex((e) => e + gap < l.from);
    if (i < 0) i = ends.length;
    ends[i] = end;
    lane[l.id] = i;
  }
  return { lane, count: ends.length };
}

export interface PhaseBook {
  id: string;
  name: string;
  /** O primeiro capítulo do livro dentro da fase e quantos capítulos ele tem nela. */
  chapter: number;
  chapters: number;
}
/** Os livros que contam uma fase, na ordem em que aparecem na leitura. */
export function booksOfPhase(phase: string): PhaseBook[] {
  const out = new Map<string, PhaseBook & { at: number }>();
  for (const c of CHRONO_CHAPTERS) {
    if (CHRONO_SECTIONS[c.section - 1].group !== phase) continue;
    const found = out.get(c.bookId);
    if (found) found.chapters++;
    else out.set(c.bookId, { id: c.bookId, name: chronoBooks().find((b) => b.id === c.bookId)!.name, chapter: c.chapter, chapters: 1, at: c.index });
  }
  return [...out.values()].sort((a, b) => a.at - b.at).map(({ at: _at, ...b }) => b);
}

/** A Bíblia conta este fato? (O que ela cita num versículo é “na Bíblia”; o resto é história geral, que atingiu os povos de qualquer fé.) */
export const isInBible = (e: ContextEvent): boolean => !!e.ref;

/** Os fatos do mundo mais perto de um ano (na Bíblia ou fora dela), do mais perto ao mais longe, dentro de `radius` anos; `only` filtra quais entram. */
export function eventsNear(year: number, radius = 60, limit = 3, only: (e: ContextEvent) => boolean = () => true): ContextEvent[] {
  const distance = (e: ContextEvent) => (e.to !== undefined && year >= e.from && year <= e.to ? 0 : Math.min(Math.abs(year - e.from), e.to !== undefined ? Math.abs(year - e.to) : Infinity));
  return WORLD_EVENTS.filter((e) => e.from >= TM_START - 100 && e.from <= TM_END + 10)
    .filter(only)
    .filter((e) => distance(e) <= radius)
    .sort((a, b) => distance(a) - distance(b) || a.from - b.from)
    .slice(0, limit);
}

/** Os fatos do mundo que cabem na faixa (de 2000 a.C. ao ano 95). */
export const timelineEvents = (): ContextEvent[] => WORLD_EVENTS.filter((e) => e.from >= TM_START - 1 && e.from <= TM_END);

/** Quanto do tempo (anos de verdade) e do texto (capítulos) a fase ocupa, em %; o tempo é `null` para a criação, sem data. */
export function phaseShares(phase: string): { time: number | null; text: number } {
  const seg = timelineSegments().find((s) => s.id === phase);
  const chapters = CHRONO_SECTIONS.filter((s) => s.group === phase).reduce((sum, s) => sum + sectionSize(s), 0);
  return { time: seg ? seg.share : null, text: (chapters / CHRONO_CHAPTERS.length) * 100 };
}

/** Os anos marcados na régua, de um passo redondo que depende do zoom (no mínimo ~90 px entre duas marcas). */
export function rulerTicks(from: number, to: number, ppy: number): number[] {
  const steps = [5, 10, 20, 25, 50, 100, 250, 500];
  const step = steps.find((s) => s * ppy >= 90) ?? 500;
  const out: number[] = [];
  for (let y = Math.ceil(from / step) * step; y <= to; y += step) if (y !== 0) out.push(y);
  return out;
}
