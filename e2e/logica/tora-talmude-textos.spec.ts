import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { ARTICLES } from '../../src/app/core/library';
import { parseReferences } from '../../src/app/core/reference-parser';
import { headingKey, outline, parseBlocks, sectionLabels } from '../../src/app/core/rich-text-parser';
import { ARTICLE_SOURCES } from '../../src/app/core/sources';
import { blockWords } from '../../src/app/core/topic-sections';
import { titleCase } from '../../src/app/core/title-case';
import { TRAILS } from '../../src/app/core/trails';

// Os estudos “A Torá” e “O Talmude”, na prateleira “A Bíblia dos Judeus” da trilha “De Onde Veio a Bíblia”.
const ESTUDOS = [
  { id: 'tora', topicos: 5, cartoes: ['biblia-judaica'] },
  { id: 'talmude', topicos: 6, cartoes: [] as string[] },
];
const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const cache = new Map<string, [number, string][][]>();
const livro = (id: string) => (cache.get(id) ?? (cache.set(id, JSON.parse(readFileSync(`public/bible/almeida/${id}.json`, 'utf8'))), cache.get(id)!));

function texto(ref: string): { t: string; erro?: string } {
  const p = parseReferences(ref);
  if (p.errors.length || !p.refs.length) return { t: '', erro: `não entendida: ${ref}` };
  const out: string[] = [];
  for (const r of p.refs) {
    const cap = livro(r.bookId)[r.chapter - 1];
    if (!cap) return { t: '', erro: `capítulo inexistente: ${ref}` };
    const vs = cap.filter(([n]) => n >= (r.from ?? 1) && n <= (r.to ?? (r.from ?? 999)));
    if (!vs.length) return { t: '', erro: `versículo inexistente: ${ref}` };
    out.push(...vs.map(([, t]) => t));
  }
  return { t: out.join(' ') };
}
const contem = (v: string, q: string) => q.split(/\s*(?:…|\.\.\.)+\s*/).map(norm).filter(Boolean).every((f) => norm(v).includes(f));

for (const { id, topicos, cartoes } of ESTUDOS) {
  const md = readFileSync(`public/conteudo/artigos/${id}.md`, 'utf8');

  test(`${id}: está na prateleira, com fonte, tópicos, tempo de leitura e título no padrão`, () => {
    const prateleira = TRAILS.find((t) => t.id === 'sobre-a-biblia')?.branches.find((b) => b.title === 'A Bíblia dos Judeus');
    expect(prateleira?.ids).toEqual(['biblia-judaica', 'tora', 'talmude']);
    const artigo = ARTICLES.find((a) => a.id === id)!;
    expect(artigo, id).toBeTruthy();
    expect(titleCase(artigo.title)).toBe(artigo.title);
    expect(ARTICLE_SOURCES[id], 'fonte do estudo').toBeTruthy();

    const blocks = parseBlocks(md);
    const secoes = outline(md, artigo.topics).map((s) => headingKey(s.text));
    expect(artigo.topics, 'tópicos').toHaveLength(topicos);
    const achados = artigo.topics!.map((t) => secoes.indexOf(headingKey(t)));
    expect(achados.every((i) => i >= 0), 'todo tópico é título do texto').toBe(true);
    expect([...achados].sort((a, b) => a - b), 'tópicos na ordem do texto').toEqual(achados);
    expect(sectionLabels(blocks, artigo.topics!).filter((l) => l.startsWith('Tópico'))).toHaveLength(topicos);
    for (const t of artigo.topics!) expect(titleCase(t), t).toBe(t);
    const palavras = blocks.reduce((n, b) => n + blockWords(b), 0);
    expect(artigo.minutes, `minutos (${palavras} palavras)`).toBe(Math.max(1, Math.round(palavras / 200)));
    for (const p of artigo.passages ?? []) {
      const [livroId, cap] = p.split(' ');
      expect(livro(livroId)[Number(cap) - 1], `capítulo ${p}`).toBeTruthy();
    }
  });

  test(`${id}: toda referência existe e toda citação com referência é idêntica à Almeida do app`, () => {
    const ruins: string[] = [];
    const refs = [...md.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)].map((m) => m[1].trim());
    expect(refs.length).toBeGreaterThan(5);
    for (const r of new Set(refs)) { const e = texto(r).erro; if (e) ruins.push(e); }
    let conferidas = 0;
    for (const m of md.matchAll(/“([^”]{3,}?)”[\s,.;:(]*\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g)) {
      conferidas++;
      if (!contem(texto(m[2].trim()).t, m[1])) ruins.push(`${m[2]} :: ${m[1]}`);
    }
    expect(conferidas, 'citações conferidas').toBeGreaterThan(5);
    expect(ruins, 'citações que não batem com a Almeida').toEqual([]);
  });

  test(`${id}: os cartões “leia” existem e nenhum estudo é ligado duas vezes`, () => {
    for (const c of cartoes) {
      expect(ARTICLES.some((a) => a.id === c), c).toBe(true);
      expect(md.includes(`:::leia ${c}`), `cartão ${c}`).toBe(true);
    }
    const links = [...md.matchAll(/\]\((\/artigo\/[a-z0-9-]+)\)/g)].map((m) => m[1]);
    expect(new Set(links).size, 'link repetido').toBe(links.length);
    for (const c of cartoes) expect(links.includes(`/artigo/${c}`), `${c} em cartão e em link`).toBe(false);
  });
}

test('talmude: o texto do Talmude não é copiado: nada entre aspas além de poucas palavras fora da Bíblia', () => {
  const md = readFileSync('public/conteudo/artigos/talmude.md', 'utf8');
  for (const m of md.matchAll(/“([^”]+)”/g)) {
    // citações longas só se forem versículos (seguidos de [[ref]])
    const depois = md.slice(m.index! + m[0].length, m.index! + m[0].length + 12);
    if (m[1].split(/\s+/).length > 8) expect(depois, m[1]).toMatch(/\[\[/);
  }
});
