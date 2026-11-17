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

test('paixao: a prisão conta o “A quem buscais?” de João, e o Talmude vem com a origem dita primeiro, sem aspas de fora da Almeida e sem nome de estudioso', () => {
  const t = md('paixao-prisao-e-interrogatorio');
  const ruins: string[] = [];

  // A cena de Jo 18.3-9: a pergunta, o “Sou eu”, a queda dos guardas e o pedido de soltar os discípulos; vem antes da espada
  const dialogo = t.match(/:::dialogo A Quem Buscais\?\n([\s\S]*?)\n:::/);
  if (!dialogo) ruins.push('falta o diálogo “A Quem Buscais?”');
  else {
    const d = dialogo[1];
    if (d.split('\n').filter((l) => l.startsWith('Jesus | A quem buscais? [[Jo 18.')).length !== 2) ruins.push('Jesus pergunta “A quem buscais?” duas vezes (Jo 18.4 e 18.7)');
    for (const trecho of ['Os guardas | A Jesus, o nazareno. [[Jo 18.5]]', 'Jesus | Sou eu. [[Jo 18.5]]', 'Os guardas recuam e caem por terra. [[Jo 18.6]]', 'deixai ir estes. [[Jo 18.8]]']) {
      if (!d.includes(trecho)) ruins.push(`o diálogo deve ter: ${trecho}`);
    }
    if (t.indexOf(dialogo[0]) > t.indexOf('Simão Pedro arranca')) ruins.push('a cena de “A quem buscais?” vem antes da espada de Pedro');
  }
  if (!/Os que vinham prendê-lo caem, e é Jesus quem refaz a pergunta/.test(t)) ruins.push('o texto deve dizer que os que vinham prendê-lo caem e que Jesus refaz a pergunta');
  if (!/sem afirmar o que veio primeiro/.test(t)) ruins.push('o texto não fixa se o beijo ou o “Sou eu” veio primeiro');

  // O Talmude: seção própria, depois de Herodes e antes do resumo das idas e vindas
  const ini = t.indexOf('### O que o Talmude Diz sobre o Julgamento de Jesus?');
  const fim = t.indexOf('### As Idas e Vindas da Ceia ao Gólgota');
  if (ini < 0 || fim < ini) ruins.push('falta a seção do Talmude, entre Herodes e “As Idas e Vindas”');
  else {
    const s = t.slice(ini, fim);
    if (ini < t.indexOf('### Jesus Diante de Herodes Antipas')) ruins.push('a seção do Talmude vem depois de Herodes');
    // a origem e a data vêm antes do conteúdo
    const origem = s.indexOf('século II');
    if (origem < 0 || origem > s.indexOf('Sanhedrin, página 43a')) ruins.push('o texto diz de onde vem o Talmude (a data) antes de contar o trecho');
    for (const [padrao, motivo] of [
      [/Nenhum Evangelho o cita/, 'o texto diz que nenhum Evangelho cita o Talmude'],
      [/Yeshu ha-Notzri/, 'o nome vem do aramaico'],
      [/Sanhedrin, página 43a/, 'o trecho de 43a'],
      [/Sanhedrin 41a/, 'o trecho de 41a (o fim da pena de morte pelo Sinédrio)'],
      [/Sanhedrin 4\.1/, 'a regra da Mishná de julgar de dia'],
      [/Nem todos os que leem o Talmude aceitam/, 'a ressalva de que nem todos leem Yeshu como Jesus'],
      [/O Talmude não liga uma coisa à outra/, 'o Talmude não liga o fim da pena de morte a Jesus'],
    ] as [RegExp, string][]) if (!padrao.test(s)) ruins.push(`a seção do Talmude deve ter: ${motivo}`);
    // nenhuma aspa “…” de fora da Almeida: toda citação da seção é seguida de [[referência]] (o resto do Talmude é contado em palavras próprias)
    for (const m of s.matchAll(/“[^”]*”/g)) {
      if (!/^[\s,.;:)]*\[\[/.test(s.slice(m.index! + m[0].length))) ruins.push(`aspas sem referência na seção do Talmude: ${m[0].slice(0, 50)}`);
    }
    // os livros ficam nos Evangelhos: nenhum nome de estudioso
    for (const nome of ['Schäfer', 'Schafer', 'Ehrman', 'Klausner', 'Herford', 'Maier', 'Lasker', 'Rubenstein', 'Boyarin', 'Powell', 'Neusner', 'Meier', 'Bauckham', 'Levine', 'Dalman', 'Jeremias']) {
      if (s.includes(nome)) ruins.push(`a seção do Talmude não nomeia estudioso: ${nome}`);
    }
    if (/discutível/i.test(s)) ruins.push('o livro não usa “discutível”');
  }

  // As fontes lidas do Talmude estão registradas no livro
  const fontes = ARTICLE_SOURCES['paixao-prisao-e-interrogatorio'];
  for (const w of ['paixao-talmude', 'paixao-wikipedia-talmude']) {
    if (!fontes?.works?.includes(w)) ruins.push(`o livro lista a obra ${w}`);
    if (!WORKS[w]) ruins.push(`a obra ${w} existe em WORKS`);
  }
  expect(ruins).toEqual([]);
});
