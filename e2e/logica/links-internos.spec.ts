import { expect, test } from '@playwright/test';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { AD_STATES } from '../../src/app/core/ad-states';
import { BOOKS } from '../../src/app/core/books';
import { EBD_SUPPORT_CLASSES, EBD_SUPPORT_LESSONS } from '../../src/app/core/ebd-support';
import { IBUC_CLASSES, IBUC_LESSONS } from '../../src/app/core/ibuc';
import { CURIOSITIES } from '../../src/app/core/curiosities';
import { ARTICLES, CLASSIC_SERMONS, findArticle } from '../../src/app/core/library';
import { BIBLE_MAPS, findMap } from '../../src/app/core/maps';
import { articlesWithoutTrail, TRAILS, trailOfArticle } from '../../src/app/core/trails';
import { parseReferences } from '../../src/app/core/reference-parser';
import { TRIBES } from '../../src/app/core/tribes';
import { RELEASES } from '../../src/app/core/whats-new';

/**
 * Todo link interno escrito nos textos e nos dados (“[texto](/artigo/x)”, link: '/mapas/y') precisa levar a uma tela
 * que existe. Assim, um estudo apagado ou renomeado não deixa botões quebrados para trás.
 */

const json = <T>(file: string): T => JSON.parse(readFileSync(`public/conteudo/${file}`, 'utf8')) as T;
const memorial = new Set(json<{ id: string }[]>('memorial.json').map((p) => p.id));
const dictionary = new Set(json<{ id: string }[]>('dicionario.json').map((e) => e.id));
const prophecies = new Set(json<{ id: string }[]>('profecias.json').map((p) => p.id));
const hymns = new Set(json<{ hymns: { n: number }[] }>('harpa.json').hymns.map((h) => String(h.n)));

const FIXED = new Set([
  '/', '/estudo', '/estudo/livros', '/ensino', '/meu-espaco', '/historia', '/avivamento', '/profecias', '/dicionario', '/atlas', '/mapas',
  '/busca', '/quiz', '/livros', '/curiosidades', '/devocional', '/ibuc', '/ebd', '/ebd/apoio', '/anotacoes', '/favoritos', '/sermoes', '/novidades',
  '/fontes', '/creditos', '/ajustes', '/harpa', '/tribos', '/genealogia', '/memorial', '/assembleia-de-deus', '/assembleia-de-deus/linha-do-tempo',
]);

/** Devolve o motivo se a rota não existe; texto vazio se existe. */
function problemWith(route: string): string {
  const path = route.split(/[?#]/)[0].replace(/\/$/, '') || '/';
  if (FIXED.has(path)) return '';
  const [, section, id, extra] = path.split('/');
  if (section === 'quiz') return '';
  const known = (set: Set<string> | string[]) => (Array.isArray(set) ? set.includes(id) : set.has(id));
  switch (section) {
    case 'artigo': return known(ARTICLES.map((a) => a.id)) ? '' : 'artigo não existe';
    case 'avivamento': return known(CLASSIC_SERMONS.map((s) => s.id)) ? '' : 'sermão não existe';
    case 'mapas': return findMap(id) || BIBLE_MAPS.some((m) => m.id === id) ? '' : 'mapa não existe';
    case 'assembleia-de-deus': return known(AD_STATES.map((s) => s.id)) ? '' : 'estado não existe';
    case 'tribos': return known(TRIBES.map((t) => t.id)) ? '' : 'tribo não existe';
    case 'memorial': return known(memorial) ? '' : 'personagem não existe';
    case 'dicionario': return known(dictionary) ? '' : 'verbete não existe';
    case 'profecias': return known(prophecies) ? '' : 'profecia não existe';
    case 'harpa': return known(hymns) ? '' : 'hino não existe';
    case 'curiosidades': return known(CURIOSITIES.map((c) => c.id)) ? '' : 'curiosidade não existe';
    case 'ebd':
      // /ebd, /ebd/licao/:n, /ebd/apoio, /ebd/apoio/:turma, /ebd/apoio/aula/:id
      if (id === 'licao') return Number.isInteger(Number(extra)) ? '' : 'lição inválida';
      if (id !== 'apoio') return 'rota desconhecida';
      if (extra === 'aula') return EBD_SUPPORT_LESSONS.some((l) => l.id === path.split('/')[4]) ? '' : 'aula não existe';
      return !extra || EBD_SUPPORT_CLASSES.some((c) => c.id === extra) ? '' : 'turma não existe';
    case 'ibuc':
      if (id === 'aula') return IBUC_LESSONS.some((l) => l.id === extra) ? '' : 'aula não existe';
      return IBUC_CLASSES.some((c) => c.id === id) ? '' : 'turma não existe';
    case 'livro': return BOOKS.some((b) => b.id === id) ? '' : 'livro não existe';
    case 'ler': return BOOKS.some((b) => b.id === id) && Number.isInteger(Number(extra)) ? '' : 'capítulo inválido';
    default: return 'rota desconhecida';
  }
}

function markdownFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? markdownFiles(full) : full.endsWith('.md') ? [full] : [];
  });
}

test('links internos escritos nos textos (Markdown) levam a telas que existem', () => {
  const problems: string[] = [];
  for (const file of markdownFiles('public/conteudo')) {
    const text = readFileSync(file, 'utf8');
    for (const m of text.matchAll(/\]\((\/[^)\s]*)\)/g)) {
      const why = problemWith(m[1]);
      if (why) problems.push(`${file}: ${m[1]} → ${why}`);
    }
    // Fotos e figuras citadas no texto
    for (const m of text.matchAll(/!\[[^\]]*\]\((imagens\/[^)\s]+)/g)) {
      if (!existsSync(`public/conteudo/${m[1]}`)) problems.push(`${file}: foto ${m[1]} não existe`);
    }
  }
  expect(problems).toEqual([]);
});

test('links dos dados (novidades, estados, mapas) levam a telas que existem', () => {
  const problems: string[] = [];
  const check = (where: string, route: string) => {
    const why = problemWith(route);
    if (why) problems.push(`${where}: ${route} → ${why}`);
  };
  for (const r of RELEASES) for (const i of r.items) check(`novidades/${r.id}`, i.link);
  for (const m of [...BIBLE_MAPS, ...(findMap('assembleia-de-deus-estados') ? [findMap('assembleia-de-deus-estados')!] : [])]) {
    if (m.study) check(`mapa ${m.id}`, m.study.link);
    for (const s of m.steps) if (s.link) check(`mapa ${m.id}`, s.link);
  }
  for (const s of AD_STATES) expect(existsSync(`public/conteudo/ad-estados/${s.id}.md`), `história de ${s.id}`).toBe(true);
  expect(problems).toEqual([]);
});

test('linha do tempo nacional: toda história de estado tem fatos datados e o contexto cobre o período de cada estado', async () => {
  const { AD_STATES } = await import('../../src/app/core/ad-states');
  const { buildTimeline, yearOf } = await import('../../src/app/core/ad-timeline');
  const { contextFor } = await import('../../src/app/core/ad-context');
  const texts = Object.fromEntries(AD_STATES.map((s) => [s.id, readFileSync(`public/conteudo/ad-estados/${s.id}.md`, 'utf8')]));
  const all = buildTimeline(texts);
  expect(yearOf('c. 1948')).toBe(1948);
  expect(yearOf('jun. 1911')).toBe(1911);
  expect(yearOf('1922–1924')).toBe(1922);
  expect(yearOf('sem data')).toBeNull();
  for (const s of AD_STATES) {
    expect(all.filter((i) => i.lane === 'igreja' && i.uf === s.id).length, `${s.id}: sem linha do tempo datada`).toBeGreaterThan(0);
    expect(contextFor(s.id, s.span).length, `${s.id}: sem contexto do tempo`).toBeGreaterThanOrEqual(3);
    expect(s.span[0] <= s.span[1], `${s.id}: período invertido`).toBe(true);
  }
  // Em ordem cronológica
  for (let i = 1; i < all.length; i++) expect(all[i].year).toBeGreaterThanOrEqual(all[i - 1].year);
});

test('histórias: todo artigo está em exatamente uma trilha e os atalhos das trilhas levam a telas que existem', () => {
  expect(articlesWithoutTrail().map((a) => a.id)).toEqual([]);
  const seen = new Map<string, string>();
  for (const t of TRAILS) for (const b of t.branches) for (const id of b.ids) {
    expect(findArticle(id), `${t.id}: artigo ${id}`).toBeTruthy();
    expect(seen.get(id), `${id} está em duas trilhas`).toBeUndefined();
    seen.set(id, t.id);
    expect(trailOfArticle(id)?.id).toBe(t.id);
  }
  for (const t of TRAILS) for (const b of t.branches) for (const l of b.links ?? []) {
    const bad = problemWith(l.link);
    expect(bad, `trilha ${t.id}: ${l.link}`).toBe('');
  }
});

for (const turma of ['adultos', 'jovens', 'pre-adolescentes', 'adolescentes', 'juvenis', 'juniores']) test(`EBD (${turma}, 4º trimestre): 13 lições, cada uma com lembretes, atividades e referências que existem`, () => {
  const lessons = EBD_SUPPORT_LESSONS.filter((l) => l.quarter === '2026-4' && l.classes.includes(turma));
  expect(lessons.map((l) => l.number).sort((a, b) => a! - b!)).toEqual(Array.from({ length: 13 }, (_, i) => i + 1));
  const problems: string[] = [];
  const refs = (text: string) => [...text.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)].map((m) => m[1]);
  const links = (text: string) => [...text.matchAll(/\]\((\/[^)\s]+)\)/g)].map((m) => m[1]);
  for (const l of lessons) {
    const where = `lição ${l.number}`;
    if (!l.reminders || l.reminders.length < 3) problems.push(`${where}: poucos lembretes`);
    if (l.curiosities.length < 3) problems.push(`${where}: poucas curiosidades`);
    if (l.activities.length < 2) problems.push(`${where}: poucas atividades`);
    if (l.questions.length < 5) problems.push(`${where}: poucas perguntas`);
    if (parseReferences(l.memoryVerse).errors.length) problems.push(`${where}: versículo para decorar inválido (${l.memoryVerse})`);
    for (const r of l.refs.split(';')) if (parseReferences(r.trim()).errors.length) problems.push(`${where}: refs inválidas (${r})`);
    const text = [...(l.reminders ?? []), l.opening, ...l.curiosities.map((c) => c.text), l.context, ...l.activities.flatMap((a) => [a.material, ...a.steps]), l.application, l.deepen ?? ''].join('\n');
    for (const r of refs(text)) {
      const parsed = parseReferences(r);
      if (parsed.errors.length || !parsed.refs.length) problems.push(`${where}: referência inválida [[${r}]]`);
    }
    for (const q of l.questions) if (q.ref && parseReferences(q.ref).errors.length) problems.push(`${where}: pergunta com referência inválida (${q.ref})`);
    for (const link of links(text)) {
      const why = problemWith(link);
      if (why) problems.push(`${where}: ${link} → ${why}`);
    }
  }
  expect(problems).toEqual([]);
});
