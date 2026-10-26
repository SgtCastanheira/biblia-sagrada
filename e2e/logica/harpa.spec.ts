import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { HarpaData } from '../../src/app/core/harpa';
import { parseReferences } from '../../src/app/core/reference-parser';

const data = JSON.parse(readFileSync('public/conteudo/harpa.json', 'utf8')) as HarpaData;
const refsIn = (text: string) => [...text.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)].map((m) => m[1].trim());

test('Harpa: hinos em ordem, números de 1 a 640 sem repetir, todos com título e com a fonte do número', () => {
  const numbers = data.hymns.map((h) => h.n);
  expect(numbers).toEqual([...new Set(numbers)].sort((a, b) => a - b));
  expect(numbers.every((n) => n >= 1 && n <= 640)).toBe(true);
  expect(data.hymns.filter((h) => !h.title || !h.sources?.length).map((h) => h.n), 'hinos sem título ou sem fonte').toEqual([]);
});

test('Harpa: autores existem, e toda origem tem fonte e referências válidas', () => {
  const missing = data.hymns.filter((h) => h.person && !data.people[h.person]).map((h) => `${h.n}: ${h.person}`);
  expect(missing, 'autores sem nome').toEqual([]);
  for (const h of data.hymns.filter((x) => x.origin)) {
    const o = h.origin!;
    expect(o.sources.length, `hino ${h.n}: origem sem fonte`).toBeGreaterThan(0);
    for (const r of [...(o.bible ? [o.bible] : []), ...refsIn(o.story)]) {
      const p = parseReferences(r);
      expect(p.errors.length === 0 && p.refs.length > 0, `hino ${h.n}: referência "${r}"`).toBe(true);
    }
  }
  // Nenhuma letra no app: só título, autor e origem
  expect(JSON.stringify(data)).not.toContain('firstLine');
});
