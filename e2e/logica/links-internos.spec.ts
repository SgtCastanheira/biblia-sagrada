import { expect, test } from '@playwright/test';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { AD_STATES } from '../../src/app/core/ad-states';
import { BOOKS } from '../../src/app/core/books';
import { EBD_SUPPORT_CLASSES, EBD_SUPPORT_LESSONS } from '../../src/app/core/ebd-support';
import { IBUC_CLASSES, IBUC_LESSONS } from '../../src/app/core/ibuc';
import { CURIOSITIES } from '../../src/app/core/curiosities';
import { ARTICLES, CLASSIC_SERMONS } from '../../src/app/core/library';
import { BIBLE_MAPS, findMap } from '../../src/app/core/maps';
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
  '/busca', '/livros', '/curiosidades', '/devocional', '/ibuc', '/ebd', '/ebd/apoio', '/anotacoes', '/favoritos', '/sermoes', '/novidades',
  '/fontes', '/creditos', '/ajustes', '/harpa', '/tribos', '/genealogia', '/memorial', '/assembleia-de-deus', '/assembleia-de-deus/linha-do-tempo',
]);

/** Devolve o motivo se a rota não existe; texto vazio se existe. */
function problemWith(route: string): string {
  const path = route.split(/[?#]/)[0].replace(/\/$/, '') || '/';
  if (FIXED.has(path)) return '';
  const [, section, id, extra] = path.split('/');
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
  for (const m of [...BIBLE_MAPS, ...(findMap('assembleia-de-deus-estados') ? [findMap('assembleia-de-deus-estados')!, findMap('assembleia-de-deus-no-brasil')!] : [])]) {
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
