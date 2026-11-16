import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { ARTICLES } from '../../src/app/core/library';
import { parseReferences } from '../../src/app/core/reference-parser';
import { headingKey, outline, parseBlocks, sectionLabels } from '../../src/app/core/rich-text-parser';
import { ARTICLE_SOURCES, WORKS } from '../../src/app/core/sources';
import { blockWords } from '../../src/app/core/topic-sections';
import { titleCase } from '../../src/app/core/title-case';
import { TRAILS } from '../../src/app/core/trails';

// “Acreditar e Crer”: o mesmo caminho, de Gênesis ao Apocalipse, em duas vozes (pentecostal e reformada),
// na prateleira “A Fé em Duas Vozes” da trilha Teologia.
const IDS = ['acreditar-e-crer-pentecostal', 'acreditar-e-crer-presbiteriano'];
const md = (id: string) => readFileSync(`public/conteudo/artigos/${id}.md`, 'utf8');
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

test('acreditar e crer: as duas vozes estão na biblioteca, na mesma prateleira da trilha Teologia, com fontes, tópicos e tempo certos', () => {
  const trilha = TRAILS.find((t) => t.id === 'teologia');
  const prateleira = trilha?.branches.find((b) => b.title === 'A Fé em Duas Vozes');
  expect(prateleira, 'a prateleira “A Fé em Duas Vozes” da trilha Teologia').toBeTruthy();
  // A ordem é a do número de cada livro na estante: a voz pentecostal é a 1 e a reformada a 2
  expect(prateleira!.ids).toEqual(IDS);
  for (const id of IDS) {
    const artigo = ARTICLES.find((a) => a.id === id);
    expect(artigo, id).toBeTruthy();
    expect(artigo!.story, `${id} se lê como história`).toBe(true);
    const fonte = ARTICLE_SOURCES[id];
    expect(fonte, `fonte de ${id}`).toBeTruthy();
    expect((fonte.works ?? []).filter((w) => !WORKS[w]), `obras de ${id}`).toEqual([]);
    const blocks = parseBlocks(md(id));
    // Os tópicos da capa são seis títulos do texto, na ordem; os demais títulos (conclusão, meios, oração) ficam sem número
    const secoes = outline(md(id), artigo!.topics).map((s) => headingKey(s.text));
    expect(artigo!.topics, `tópicos de ${id}`).toHaveLength(6);
    const achados = artigo!.topics!.map((t) => secoes.indexOf(headingKey(t)));
    expect(achados.every((i) => i >= 0), `todo tópico de ${id} é título do texto`).toBe(true);
    expect([...achados].sort((a, b) => a - b), `tópicos de ${id} na ordem do texto`).toEqual(achados);
    expect(sectionLabels(blocks, artigo!.topics!).filter((l) => l.startsWith('Tópico'))).toHaveLength(6);
    const palavras = blocks.reduce((n, b) => n + blockWords(b), 0);
    expect(artigo!.minutes, `minutos de ${id} (${palavras} palavras)`).toBe(Math.max(1, Math.round(palavras / 200)));
    // Cada voz traz os capítulos de Bíblia em que o leitor a encontra
    expect(artigo!.passages!.length, `passagens de ${id}`).toBeGreaterThan(3);
    for (const p of artigo!.passages!) {
      const [livroId, cap] = p.split(' ');
      expect(livro(livroId)[Number(cap) - 1], `capítulo ${p} de ${id}`).toBeTruthy();
    }
  }
});

test('acreditar e crer: toda referência existe e toda citação com referência é idêntica à Almeida do app', () => {
  const ruins: string[] = [];
  for (const id of IDS) {
    const fonte = md(id);
    const refs = [...fonte.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)].map((m) => m[1].trim());
    for (const r of new Set(refs)) { const e = texto(r).erro; if (e) ruins.push(`${id}: ${e}`); }
    // “citação” seguida de [[referência]] (com ou sem parênteses): tem de estar no versículo
    let conferidas = 0;
    for (const m of fonte.matchAll(/“([^”]{3,}?)”[\s,.;:(]*\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g)) {
      conferidas++;
      if (!contem(texto(m[2].trim()).t, m[1])) ruins.push(`${id}: ${m[2]} :: ${m[1]}`);
    }
    // frases em destaque (o versículo numa linha e “— [[referência]]” na seguinte)
    for (const m of fonte.matchAll(/^:::destaque\n“([^”]+)”\n— \[\[([^\]|]+)\]\]\n:::/gm)) {
      conferidas++;
      if (!contem(texto(m[2].trim()).t, m[1])) ruins.push(`${id}: destaque ${m[2]} :: ${m[1]}`);
    }
    // se a conferência deixasse de achar as citações, este teste passaria sem conferir nada
    if (conferidas < 25) ruins.push(`${id}: só ${conferidas} citações conferidas (esperadas 25 ou mais)`);
  }
  expect(ruins).toEqual([]);
});

test('acreditar e crer: blocos fechados, títulos no padrão, ligações que existem e nada de referência dentro de negrito ou itálico', () => {
  const ruins: string[] = [];
  for (const id of IDS) {
    const fonte = md(id);
    const abre = (fonte.match(/^:::(nota|destaque|leia|ficha|tempo)\b/gm) ?? []).length;
    if ((fonte.match(/^:::\s*$/gm) ?? []).length !== abre) ruins.push(`${id}: blocos ::: desbalanceados`);
    for (const t of [...fonte.matchAll(/^#{2,3} (.+)$/gm)].map((m) => m[1])) if (titleCase(t) !== t) ruins.push(`${id}: título “${t}” → “${titleCase(t)}”`);
    for (const l of [...fonte.matchAll(/^:::leia\s+(\S+)/gm)].map((m) => m[1])) if (!ARTICLES.some((a) => a.id === l)) ruins.push(`${id}: leia ${l}`);
    for (const l of [...fonte.matchAll(/\]\(\/artigo\/([^)\s]+)\)/g)].map((m) => m[1])) if (!ARTICLES.some((a) => a.id === l)) ruins.push(`${id}: link /artigo/${l}`);
    // o leitor do texto não lê [[referência]] nem [link](…) dentro de **negrito** ou *itálico*: apareceriam como texto cru
    for (const m of fonte.matchAll(/\*\*([^*\n]+?)\*\*|(?<!\*)\*([^*\n]+?)\*(?!\*)/g)) {
      if (/\[\[|\]\(|\*/.test(m[1] ?? m[2] ?? '')) ruins.push(`${id}: marcação dentro de ênfase: ${m[0].slice(0, 70)}`);
    }
    // a primeira coisa do texto é um versículo em destaque e a letra capitular cai no primeiro parágrafo
    const blocks = parseBlocks(fonte);
    if (blocks[0].type !== 'pullquote') ruins.push(`${id}: o texto deve abrir com o versículo em destaque`);
    if (blocks.findIndex((b) => b.type === 'p') < 0) ruins.push(`${id}: sem parágrafo`);
    // cada um dos seis tópicos fecha com uma pausa (:::nota), que vira o quadro com a pergunta
    const pausas = blocks.filter((b) => b.type === 'note').length;
    if (pausas !== 6) ruins.push(`${id}: ${pausas} pausas (:::nota), esperadas 6`);
  }
  // cada voz leva à outra por uma ligação no texto (a da trilha também leva, ao fim da história)
  if (!md(IDS[0]).includes('](/artigo/acreditar-e-crer-presbiteriano)')) ruins.push('a voz pentecostal não leva à reformada');
  if (!md(IDS[1]).includes('](/artigo/acreditar-e-crer-pentecostal)')) ruins.push('a voz reformada não leva à pentecostal');
  // um estudo nunca liga duas vezes à mesma história
  for (const id of IDS) {
    const alvos = [...md(id).matchAll(/\]\(\/artigo\/([^)\s]+)\)|^:::leia\s+(\S+)/gm)].map((m) => m[1] ?? m[2]);
    const repetidos = alvos.filter((a, i) => alvos.indexOf(a) !== i);
    if (repetidos.length) ruins.push(`${id}: liga duas vezes a ${repetidos.join(', ')}`);
  }
  expect(ruins).toEqual([]);
});

test('acreditar e crer: o que foi corrigido do texto original não volta (voz, fatos e atribuições)', () => {
  const ruins: string[] = [];
  const proibidas: [RegExp, string][] = [
    [/Pare comigo/i, 'a pausa se chama “Pare aqui” (a voz dos textos é impessoal)'],
    [/\bEste livro\b/i, 'o texto não anuncia a si mesmo'],
    [/\beu vou\b/i, 'o texto não fala em primeira pessoa'],
    [/cantaram no fogo|subindo a fogueira cantando/i, 'não há fonte de que os mártires de Esmirna cantaram no fogo'],
    [/ri sem saber/i, 'Isaque faz a pergunta do cordeiro: não ri sem saber (Gn 22.7)'],
    [/costas de um menino/i, 'Gn 22.6 diz que a lenha foi posta sobre Isaque; a idade dele não é dada'],
  ];
  for (const id of IDS) {
    const fonte = md(id);
    for (const [padrao, motivo] of proibidas) if (padrao.test(fonte)) ruins.push(`${id}: ${motivo}`);
    // a Confissão de Westminster e o Catecismo de Heidelberg não usam os termos latinos: o texto não os atribui a eles
    for (const par of fonte.split(/\n\n+/)) {
      if (/Westminster|Heidelberg/.test(par) && /notitia|assensus|fiducia/i.test(par) && !/não usam esses termos|não constam/.test(par)) {
        ruins.push(`${id}: parágrafo atribui os termos latinos a Westminster ou Heidelberg: ${par.slice(0, 80)}`);
      }
    }
  }
  // “Creio, Senhor” (a oração) existe só como oração: a citação do versículo é a da Almeida do app (“Creio! Ajuda a minha incredulidade”)
  for (const id of IDS) if (/“Creio, Senhor[!,]?[^”]*”\s*\(?\[\[Mc 9\.24/.test(md(id))) ruins.push(`${id}: citação de Mc 9.24 diferente da Almeida do app`);
  expect(ruins).toEqual([]);
});
