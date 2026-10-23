import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { BIBLE_MAPS } from '../../src/app/core/maps';
import { Person } from '../../src/app/core/memorial';
import { parseReferences } from '../../src/app/core/reference-parser';
import {
  CAMP, DIVISION_TEXT, distances, PILGRIMAGE_TEXT, TERRITORIES, TRIBE_CHAPTERS, TRIBE_QUESTIONS, TRIBES, TRIBES_MAP,
} from '../../src/app/core/tribes';

const refsIn = (text: string) => [...text.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)].map((m) => m[1].trim());
const books = new Map<string, [number, string][][]>();
const book = (id: string) => {
  if (!books.has(id)) books.set(id, JSON.parse(readFileSync(`public/bible/almeida/${id}.json`, 'utf8')));
  return books.get(id)!;
};

/** Toda referência precisa ser entendida pelo app e apontar para versículos que existem na Almeida. */
function expectRealRefs(refs: string[], where: string) {
  const bad: string[] = [];
  for (const text of refs) {
    const parsed = parseReferences(text);
    if (parsed.errors.length || !parsed.refs.length) {
      bad.push(`${text} (não reconhecida)`);
      continue;
    }
    for (const r of parsed.refs) {
      const chapter = book(r.bookId)[r.chapter - 1];
      const last = chapter?.at(-1)?.[0] ?? 0;
      if (!chapter || (r.from && r.from > last) || (r.to && r.to < 999 && r.to > last)) bad.push(`${text} (não existe)`);
    }
  }
  expect(bad, `Referências inválidas em ${where}`).toEqual([]);
}

test('tribos: referências de todos os textos existem na Almeida', () => {
  for (const t of TRIBES) {
    const refs = [
      t.birthRef, t.hook.ref, t.jacob.ref, ...(t.moses.ref ? [t.moses.ref] : []), ...t.census.refs.split('; '),
      ...t.leaders.map((l) => l.ref), ...t.people.map((p) => p.ref), ...t.territories.map((x) => x.ref),
      ...[t.calling, t.land, t.history, t.moses.text, t.census.note ?? ''].flatMap(refsIn),
    ];
    expectRealRefs(refs, `tribos/${t.id}`);
  }
  expectRealRefs([...refsIn(DIVISION_TEXT), ...refsIn(PILGRIMAGE_TEXT), ...TRIBE_QUESTIONS.flatMap((q) => refsIn(q.a)), ...CAMP.map((c) => c.ref)], 'textos das tribos');
  expectRealRefs(TRIBES_MAP.steps.map((s) => s.ref), 'mapa das tribos');
});

test('tribos: 12 filhos de Jacó, 12 porções de terra e personagens existentes no Memorial', () => {
  const sons = TRIBES.filter((t) => t.order).map((t) => t.order);
  // José (11º) não dá nome a tribo: no lugar dele estão Efraim e Manassés
  expect(sons).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12]);
  expect(TRIBES.filter((t) => t.territories.length).length, 'tribos com terra').toBe(12);
  expect(new Set(TRIBES.map((t) => t.id)).size).toBe(TRIBES.length);

  const memorial = new Set((JSON.parse(readFileSync('public/conteudo/memorial.json', 'utf8')) as Person[]).map((p) => p.id));
  const missing = TRIBES.flatMap((t) => [t.person, ...t.people.map((p) => p.person)]).filter((id) => id && !memorial.has(id));
  expect(missing, 'personagens que não existem no Memorial').toEqual([]);

  // Os censos somam o que Números diz (Nm 1.46 e Nm 26.51) e cada grupo do acampamento também (Nm 2)
  const soldiers = TRIBES.filter((t) => t.id !== 'levi');
  expect(soldiers.reduce((s, t) => s + t.census.sinai, 0)).toBe(603550);
  expect(soldiers.reduce((s, t) => s + t.census.moab, 0)).toBe(601730);
  for (const c of CAMP) {
    expect(c.tribes.reduce((s, id) => s + TRIBES.find((t) => t.id === id)!.census.sinai, 0), `grupo de ${c.leader}`).toBe(c.total);
    for (const id of c.tribes) expect(TRIBES.find((t) => t.id === id)!.camp.side).toBe(c.side);
  }
});

test('tribos: o número de cada território fica dentro do próprio polígono e as distâncias fazem sentido', () => {
  const inside = ([x, y]: [number, number], poly: [number, number][]) => {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i];
      const [xj, yj] = poly[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
    }
    return c;
  };
  for (const { territory } of TERRITORIES) {
    expect(inside(territory.center, territory.polygon), `${territory.name}: centro fora do território`).toBe(true);
  }
  const km = (id: string) => distances(TERRITORIES.find((x) => x.territory.id === id)!.territory).temple;
  expect(km('benjamim')).toBeLessThan(20);
  expect(km('naftali')).toBeGreaterThan(100);
  expect(km('da-norte')).toBeGreaterThan(km('naftali'));
});

test('tribos: o mapa está registrado e o estudo aparece nos capítulos certos', () => {
  expect(BIBLE_MAPS).toContain(TRIBES_MAP);
  expect(TRIBES_MAP.territories?.length).toBe(TERRITORIES.length);
  for (const c of TRIBE_CHAPTERS) expect(c, 'capítulo no formato "GEN 49"').toMatch(/^[1-3A-Z]{3} \d+$/);
  expect(TRIBE_CHAPTERS).toContain('GEN 49');
  expect(TRIBE_CHAPTERS).toContain('JOS 18');
});
