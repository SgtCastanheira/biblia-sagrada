import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { ARTICLES } from '../../src/app/core/library';
import { eraOverlap, linkedArticles, periodYears, sameEra, trailStep } from '../../src/app/core/story-graph';
import { TRAILS, trailArticleIds, trailOfArticle } from '../../src/app/core/trails';

const md = (id: string) => readFileSync(`public/conteudo/artigos/${id}.md`, 'utf8');

test('períodos: lê séculos, a.C., "c." e "hoje"', () => {
  expect(periodYears('313–451')).toEqual([313, 451]);
  expect(periodYears('c. 430 a.C. – 4 a.C.')).toEqual([-430, -4]);
  expect(periodYears('c. 1400–400 a.C.')).toEqual([-1400, -400]);
  expect(periodYears('605–536 a.C.')).toEqual([-605, -536]);
  expect(periodYears('séc. I')).toEqual([1, 100]);
  expect(periodYears('séc. III a.C. – séc. X d.C.')).toEqual([-300, 1000]);
  expect(periodYears('37 a.C. – 100 d.C.')).toEqual([-37, 100]);
  expect(periodYears('1910–hoje', 2026)).toEqual([1910, 2026]);
  expect(periodYears('c. 95 d.C.')).toEqual([95, 95]);
  expect(periodYears('Toda a Bíblia')).toBeNull();
  expect(eraOverlap([1904, 1906], [1903, 1910])).toBeGreaterThan(0);
  expect(eraOverlap([1904, 1906], [1910, 2026])).toBe(0);
  // Todo período com número tem de virar anos
  const unread = ARTICLES.filter((a) => a.period && /\d|séc/.test(a.period) && !periodYears(a.period)).map((a) => `${a.id}: ${a.period}`);
  expect(unread).toEqual([]);
});

test('trilhas: cada história sabe a sua posição, a anterior e a próxima; a última leva à trilha seguinte', () => {
  for (const t of TRAILS) {
    const ids = trailArticleIds(t);
    ids.forEach((id, i) => {
      const s = trailStep(id)!;
      expect(s.trail.id, id).toBe(t.id);
      expect(s.index, id).toBe(i);
      expect(s.prev?.id ?? null, id).toBe(i > 0 ? ids[i - 1] : null);
      expect(s.next?.id ?? null, id).toBe(i < ids.length - 1 ? ids[i + 1] : null);
      expect(!!s.nextTrail, id).toBe(i === ids.length - 1);
    });
  }
});

test('mesma época: só de outras trilhas, sem repetir o que o texto já cita nem a anterior e a próxima', () => {
  let some = 0;
  for (const a of ARTICLES) {
    const linked = linkedArticles(md(a.id));
    const step = trailStep(a.id);
    const found = sameEra(a.id, linked);
    some += found.length ? 1 : 0;
    const ids = found.map((m) => m.article.id);
    expect(new Set(ids).size, a.id).toBe(ids.length);
    for (const m of found) {
      expect(m.article.id, a.id).not.toBe(a.id);
      expect(linked, `${a.id} já cita ${m.article.id}`).not.toContain(m.article.id);
      expect([step?.prev?.id, step?.next?.id], a.id).not.toContain(m.article.id);
      expect(trailOfArticle(m.article.id)?.id, a.id).not.toBe(trailOfArticle(a.id)?.id);
      expect(m.score, a.id).toBeGreaterThan(0);
    }
  }
  // A maioria das histórias datadas encontra alguma vizinha de época
  expect(some).toBeGreaterThan(ARTICLES.length / 2);
});

test('sem repetir: nenhum artigo leva duas vezes à mesma história, e nenhum texto de cartão é copiado em outro artigo', () => {
  const problems: string[] = [];
  const texts = new Map<string, string>();
  for (const a of ARTICLES) {
    const text = md(a.id);
    const all = [
      ...[...text.matchAll(/^:::\s*leia\s+(\S+)/gm)].map((m) => m[1]),
      ...[...text.matchAll(/\]\(\/artigo\/([a-z0-9-]+)\)/g)].map((m) => m[1]),
    ];
    const twice = [...new Set(all.filter((x, i) => all.indexOf(x) !== i))];
    if (twice.length) problems.push(`${a.id} leva duas vezes a: ${twice.join(', ')}`);
    if (all.includes(a.id)) problems.push(`${a.id} leva a si mesmo`);
    for (const m of text.matchAll(/^:::\s*leia\s+(\S+)\s*\n([^:][\s\S]*?)\n:::/gm)) {
      const blurb = m[2].trim();
      if (texts.has(blurb)) problems.push(`texto do cartão repetido em ${texts.get(blurb)} e ${a.id}`);
      else texts.set(blurb, a.id);
    }
  }
  expect(problems).toEqual([]);
});

test('tópicos da capa: cada um é uma seção do texto, com o mesmo título e na mesma ordem', async () => {
  const { headingKey, outline } = await import('../../src/app/core/rich-text-parser');
  const problems: string[] = [];
  for (const a of ARTICLES.filter((x) => x.topics?.length)) {
    const sections = outline(md(a.id), a.topics).map((s) => headingKey(s.text));
    const found = a.topics!.map((t) => sections.indexOf(headingKey(t)));
    a.topics!.forEach((t, i) => { if (found[i] < 0) problems.push(`${a.id}: o tópico “${t}” não é um título do texto`); });
    if (found.some((x, i) => i > 0 && x < found[i - 1])) problems.push(`${a.id}: os tópicos estão fora da ordem do texto`);
    const labels = outline(md(a.id), a.topics).filter((s) => s.label.startsWith('Tópico')).length;
    if (labels !== a.topics!.length) problems.push(`${a.id}: ${labels} seções com rótulo de tópico, ${a.topics!.length} tópicos`);
  }
  expect(problems).toEqual([]);
});
