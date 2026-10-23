import { expect, test } from '@playwright/test';
import { parseReferences } from '../../src/app/core/reference-parser';
import { ACTIVITY_ICONS, PROGRAMS } from '../../src/app/core/teaching';

const refsIn = (text: string) => [...text.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)].map((m) => m[1].trim());

for (const program of Object.values(PROGRAMS)) {
  test(`${program.name}: turmas únicas e aulas ligadas a turmas que existem, com referências válidas`, () => {
    const classes = new Set(program.classes.map((c) => c.id));
    expect(classes.size).toBe(program.classes.length);
    expect(new Set(program.lessons.map((l) => l.id)).size).toBe(program.lessons.length);
    for (const l of program.lessons) {
      for (const c of [...l.classes, ...l.activities.flatMap((a) => a.classes ?? [])]) expect(classes.has(c), `${l.id}: turma "${c}"`).toBe(true);
      for (const a of l.activities) expect(ACTIVITY_ICONS[a.kind], `${l.id}: tipo "${a.kind}"`).toBeTruthy();
      const refs = [
        ...l.refs.split(';'), l.memoryVerse, ...l.questions.flatMap((q) => (q.ref ? [q.ref] : [])),
        ...[l.opening, l.context, l.application, ...l.curiosities.map((c) => c.text), ...l.activities.flatMap((a) => a.steps)].flatMap(refsIn),
      ];
      const bad = refs.filter((r) => {
        const p = parseReferences(r);
        return p.errors.length > 0 || !p.refs.length;
      });
      expect(bad, `referências inválidas em ${l.id}`).toEqual([]);
    }
  });
}
