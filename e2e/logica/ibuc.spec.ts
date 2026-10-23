import { expect, test } from '@playwright/test';
import { parseReferences } from '../../src/app/core/reference-parser';
import { ACTIVITY_ICONS, PROGRAMS, quartersOf, supportLesson } from '../../src/app/core/teaching';

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

test('apoio ao professor: lições 1 a 13 por trimestre e a aula certa para cada lição', () => {
  const base = PROGRAMS.ebd;
  const aula = { ...base.lessons[0], id: 'teste', example: false, quarter: '2031-2', number: 5, classes: ['jovens'] };
  const program = { ...base, lessons: [...base.lessons, aula] };
  const quarters = quartersOf(program, 'jovens');
  const q = quarters.find((x) => x.key === '2031-2')!;
  expect(q.lessons.map((l) => l.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  expect(q.lessons[4].lesson?.id).toBe('teste');
  expect(q.lessons.filter((l) => l.lesson).length).toBe(1);
  // O trimestre atual aparece sempre, mesmo sem aulas
  expect(quarters.some((x) => x.current)).toBe(true);
  expect(supportLesson(program, 'jovens', '2031-2', 5)?.id).toBe('teste');
  expect(supportLesson(program, 'adultos', '2031-2', 5)).toBeUndefined();
});
