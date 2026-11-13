import { expect, test } from '@playwright/test';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { ARTICLES } from '../../src/app/core/library';
import { PAIXAO_ARTICLES, PAIXAO_FIGURES, PAIXAO_IDS } from '../../src/app/core/paixao';
import { parseReferences } from '../../src/app/core/reference-parser';
import { parseBlocks, sectionLabels } from '../../src/app/core/rich-text-parser';
import { ARTICLE_SOURCES, WORKS } from '../../src/app/core/sources';
import { titleCase } from '../../src/app/core/title-case';
import { TRAILS } from '../../src/app/core/trails';
import { foldRanges, topicSections } from '../../src/app/core/topic-sections';

// Volume 4 · A Paixão, da Ceia à Ressurreição: sete livros da trilha “Como a Ciência Explica”.
const IDS = [
  'paixao-quem-mandava', 'paixao-santa-ceia', 'paixao-getsemani', 'paixao-prisao-e-interrogatorio',
  'paixao-acoite-e-condenacao', 'paixao-crucificacao', 'paixao-sepultamento-e-ressurreicao',
];
const publico = 'public/conteudo';
const md = (id: string) => readFileSync(`${publico}/artigos/${id}.md`, 'utf8');
const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const cache = new Map<string, [number, string][][]>();
const livro = (id: string) => (cache.get(id) ?? (cache.set(id, JSON.parse(readFileSync(`public/bible/almeida/${id}.json`, 'utf8'))), cache.get(id)!));

/** O texto da Almeida do app para uma referência, ou o motivo de ela não servir. */
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
/** Cada trecho de uma citação (separados por reticências) aparece no versículo, sem contar pontuação nem maiúsculas. */
const contem = (v: string, q: string) => norm(q).split(/ ?(?:…|\.\.\.)+ ?/).filter(Boolean).every((f) => norm(v).includes(f));

test('paixao: os sete livros estão na biblioteca, numa só prateleira da trilha, com fontes, tópicos e tempo de leitura certos', () => {
  const trilha = TRAILS.find((t) => t.id === 'como-a-ciencia-explica');
  expect(trilha, 'a trilha “Como a Ciência Explica”').toBeTruthy();
  expect(trilha!.branches.map((b) => b.title)).toEqual(['Volume 4 · A Paixão, da Ceia à Ressurreição']);
  // A ordem da prateleira é a escolhida pelo dono do app, que numera os livros (conferida em logica/estante.spec.ts); aqui, que são os mesmos sete livros
  expect([...trilha!.branches[0].ids].sort()).toEqual([...IDS].sort());
  expect([...PAIXAO_IDS].sort()).toEqual([...IDS].sort());
  for (const id of IDS) {
    const artigo = ARTICLES.find((a) => a.id === id);
    expect(artigo, id).toBeTruthy();
    const fonte = ARTICLE_SOURCES[id];
    expect(fonte, `fonte de ${id}`).toBeTruthy();
    expect((fonte.works ?? []).filter((w) => !WORKS[w]), `obras de ${id}`).toEqual([]);
    const blocks = parseBlocks(md(id));
    const sections = topicSections(blocks);
    const palavras = sections.reduce((n, s) => n + s.words, 0);
    expect(artigo!.topics, `tópicos de ${id}`).toEqual(sections.map((s) => s.title));
    expect(artigo!.minutes, `minutos de ${id}`).toBe(Math.max(1, Math.round(palavras / 200)));
    expect(sectionLabels(blocks, artigo!.topics!).filter(Boolean)[0]).toBe(`Tópico 1 de ${artigo!.topics!.length}`);
  }
});

test('paixao: referências, citações e falas idênticas à Almeida do app; títulos, blocos, imagens e ligações em ordem', () => {
  const ruins: string[] = [];
  for (const id of IDS) {
    const fonte = md(id);
    const refs = [...fonte.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)].map((m) => m[1].trim());
    for (const r of new Set(refs)) { const e = texto(r).erro; if (e) ruins.push(`${id}: ${e}`); }
    // “citação” seguida de [[referência]]: tem de estar no versículo
    for (const m of fonte.matchAll(/“([^”]{3,}?)”[\s,.;:)]*\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g)) {
      if (!contem(texto(m[2].trim()).t, m[1])) ruins.push(`${id}: ${m[2]} :: ${m[1]}`);
    }
    // falas de diálogo: o texto da fala é o do versículo
    for (const b of fonte.split(/^:::dialogo/m).slice(1)) {
      for (const l of b.split(/^:::\s*$/m)[0].split('\n').slice(1).filter((x) => x.includes(' | '))) {
        const rr = [...l.matchAll(/\[\[([^\]|]+)/g)].map((m) => m[1].trim());
        const f = l.split(' | ').slice(1).join(' | ').replace(/\[\[[^\]]+\]\]/g, '').trim();
        if (!rr.length || !contem(rr.map((r) => texto(r).t).join(' '), f)) ruins.push(`${id}: fala ${l.slice(0, 80)}`);
      }
    }
    const abre = (fonte.match(/^:::(dialogo|nota|figura|leia|destaque|ficha|pessoas|tempo)\b/gm) ?? []).length;
    if ((fonte.match(/^:::\s*$/gm) ?? []).length !== abre) ruins.push(`${id}: blocos ::: desbalanceados`);
    const titulos = [...fonte.matchAll(/^#{2,3} (.+)$/gm)].map((m) => m[1]);
    const fichas = [...fonte.matchAll(/^:::ficha\s+(.+)$/gm)].map((m) => m[1]);
    const dialogos = [...fonte.matchAll(/^:::dialogo\s+(.+)$/gm)].map((m) => m[1]);
    for (const t of [...titulos, ...fichas, ...dialogos]) if (titleCase(t) !== t) ruins.push(`${id}: título “${t}” → “${titleCase(t)}”`);
    for (const f of [...fonte.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g)].map((m) => m[1])) if (!existsSync(`${publico}/${f}`)) ruins.push(`${id}: imagem ausente ${f}`);
    for (const l of [...fonte.matchAll(/^:::leia\s+(\S+)/gm)].map((m) => m[1])) if (!ARTICLES.some((a) => a.id === l)) ruins.push(`${id}: leia ${l}`);
    for (const l of [...fonte.matchAll(/\]\(\/artigo\/([^)\s]+)\)/g)].map((m) => m[1])) if (!ARTICLES.some((a) => a.id === l)) ruins.push(`${id}: link /artigo/${l}`);
    // as figuras citadas no texto têm faixa compacta no catálogo
    for (const f of [...fonte.matchAll(/^:::figura\s+(\S+)/gm)].map((m) => m[1])) if (!PAIXAO_FIGURES[f]) ruins.push(`${id}: figura ${f} sem faixa no catálogo`);
  }
  expect(ruins).toEqual([]);
});

test('paixao: toda imagem que os livros, o catálogo e as figuras usam existe, e o peso das imagens fica sob controle', () => {
  const ruins: string[] = [];
  const arquivos = [
    'src/app/core/paixao.ts',
    ...readdirSync('src/app/shared/paixao').filter((f) => f.endsWith('.ts') || f.endsWith('.scss')).map((f) => `src/app/shared/paixao/${f}`),
  ];
  const usadas = new Set<string>();
  for (const f of arquivos) {
    for (const m of readFileSync(f, 'utf8').matchAll(/(?:conteudo\/)?imagens\/([A-Za-z0-9_.-]+\.(?:webp|png|jpg|jpeg|gif|svg))/g)) usadas.add(m[1]);
    for (const m of readFileSync(f, 'utf8').matchAll(/['"`](paixao-[A-Za-z0-9_.-]+\.(?:webp|png|jpg|jpeg|gif))['"`]/g)) usadas.add(m[1]);
  }
  for (const id of IDS) for (const m of md(id).matchAll(/\(imagens\/([A-Za-z0-9_.-]+)/g)) usadas.add(m[1]);
  for (const nome of usadas) if (!existsSync(`${publico}/imagens/${nome}`)) ruins.push(`imagem ausente: ${nome}`);
  // nenhuma imagem pesada em PNG: ficam em WebP (ou JPEG/GIF para baixar)
  for (const nome of usadas) if (nome.endsWith('.png')) ruins.push(`imagem em PNG (use WebP): ${nome}`);
  let bytes = 0;
  for (const nome of readdirSync(`${publico}/imagens`).filter((f) => f.startsWith('paixao-'))) {
    const size = statSync(`${publico}/imagens/${nome}`).size;
    bytes += size;
    if (size > 1_300_000) ruins.push(`imagem pesada demais (${Math.round(size / 1024)} KB): ${nome}`);
  }
  expect(bytes / 1024 / 1024, 'as imagens da Paixão pesam até 12 MB no total').toBeLessThan(12);
  expect(ruins).toEqual([]);
});

test('paixao: cada livro termina no cartão do próximo, fora de qualquer dobra; o último termina sem cartão', () => {
  for (const [i, id] of IDS.entries()) {
    const blocks = parseBlocks(md(id));
    const ultimo = blocks[blocks.length - 1];
    // o estudo de apoio (“Quem Mandava…”) abre o volume, e a continuação dele é a Santa Ceia
    const proximo = IDS[i + 1] ?? null;
    if (proximo) {
      expect(ultimo.type, id).toBe('read');
      expect(ultimo.article, id).toBe(proximo);
      expect(ultimo.mode, id).toBe('continua');
      expect(foldRanges(blocks).filter((f) => blocks.length - 1 >= f.first && blocks.length - 1 <= f.last), `${id}: cartão dentro de dobra`).toEqual([]);
    } else {
      expect(ultimo.type, id).not.toBe('read');
    }
  }
  expect(PAIXAO_ARTICLES.map((a) => a.id)).toEqual(IDS);
});
