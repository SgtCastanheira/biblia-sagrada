import { expect, test } from '@playwright/test';
import { IBUC_CLASSES, IBUC_LESSONS } from '../../src/app/core/ibuc';
import { parseReferences } from '../../src/app/core/reference-parser';

const refsIn = (text: string) => [...text.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)].map((m) => m[1].trim());

test('IBUC: turmas únicas e aulas ligadas a turmas que existem, com referências válidas', () => {
  const classes = new Set(IBUC_CLASSES.map((c) => c.id));
  expect(classes.size).toBe(IBUC_CLASSES.length);
  expect(new Set(IBUC_LESSONS.map((l) => l.id)).size).toBe(IBUC_LESSONS.length);
  for (const l of IBUC_LESSONS) {
    for (const c of [...l.classes, ...l.activities.flatMap((a) => a.classes ?? [])]) expect(classes.has(c), `${l.id}: turma "${c}"`).toBe(true);
    const refs = [
      l.refs, l.memoryVerse, ...l.questions.flatMap((q) => (q.ref ? [q.ref] : [])),
      ...[l.opening, l.context, l.application, ...l.curiosities.map((c) => c.text), ...l.activities.flatMap((a) => a.steps)].flatMap(refsIn),
    ];
    const bad = refs.filter((r) => {
      const p = parseReferences(r);
      return p.errors.length > 0 || !p.refs.length;
    });
    expect(bad, `referências inválidas em ${l.id}`).toEqual([]);
  }
});
