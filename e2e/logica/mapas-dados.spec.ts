import { expect, test } from '@playwright/test';
import { existsSync } from 'node:fs';
import { BIBLE_MAPS } from '../../src/app/core/maps';
import { parseReferences } from '../../src/app/core/reference-parser';

for (const map of BIBLE_MAPS) {
  test(`mapa "${map.title}": etapas válidas`, () => {
    const places = new Set(map.places.map((p) => p.id));
    for (const [i, step] of map.steps.entries()) {
      expect(places.has(step.place), `etapa ${i + 1}: lugar "${step.place}" não existe`).toBe(true);
      const r = parseReferences(step.ref);
      expect(r.errors, `etapa ${i + 1}: referência "${step.ref}" inválida`).toEqual([]);
      expect(r.refs.length).toBeGreaterThan(0);
    }
    const [lonMin, latMin, lonMax, latMax] = map.bounds;
    for (const p of map.places) {
      expect(p.lon >= lonMin && p.lon <= lonMax && p.lat >= latMin && p.lat <= latMax, `"${p.name}" fora dos limites do mapa`).toBe(true);
    }
    expect(existsSync(`public/maps/${map.id}.json`), 'geografia do mapa não gerada').toBe(true);
  });
}
