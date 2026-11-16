import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { ARTICLES } from '../../src/app/core/library';
import { parseReferences } from '../../src/app/core/reference-parser';
import { headingKey, outline, parseBlocks, sectionLabels } from '../../src/app/core/rich-text-parser';
import { ARTICLE_SOURCES, WORKS } from '../../src/app/core/sources';
import { blockWords } from '../../src/app/core/topic-sections';
import { titleCase } from '../../src/app/core/title-case';
import { TRAILS } from '../../src/app/core/trails';

// “Os Dois Ferros” (Provérbios 27.17): o ferro que fere (o adversário) e o ferro que levanta (o mentor),
// duas histórias na prateleira “Os Dois Ferros” da trilha Histórias da Bíblia.
const IDS = ['o-ferro-que-fere', 'o-ferro-que-levanta'];
const TOPICOS = 7;
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

test('dois ferros: as duas histórias estão na biblioteca, na mesma prateleira, com fontes, tópicos e tempo certos', () => {
  const trilha = TRAILS.find((t) => t.id === 'historias-da-biblia');
  const prateleira = trilha?.branches.find((b) => b.title === 'Os Dois Ferros');
  expect(prateleira, 'a prateleira “Os Dois Ferros” da trilha Histórias da Bíblia').toBeTruthy();
  // O número de cada livro na estante é a posição na lista: o ferro que fere é o 1 e o que levanta o 2
  expect(prateleira!.ids).toEqual(IDS);
  for (const id of IDS) {
    const artigo = ARTICLES.find((a) => a.id === id);
    expect(artigo, id).toBeTruthy();
    expect(artigo!.story, `${id} se lê como história`).toBe(true);
    const fonte = ARTICLE_SOURCES[id];
    expect(fonte, `fonte de ${id}`).toBeTruthy();
    expect((fonte.works ?? []).filter((w) => !WORKS[w]), `obras de ${id}`).toEqual([]);
    const blocks = parseBlocks(md(id));
    // Os tópicos da capa são sete títulos do texto, na ordem; os demais (como agir, preço e sinais, síntese, oração) ficam sem número
    const secoes = outline(md(id), artigo!.topics).map((s) => headingKey(s.text));
    expect(artigo!.topics, `tópicos de ${id}`).toHaveLength(TOPICOS);
    const achados = artigo!.topics!.map((t) => secoes.indexOf(headingKey(t)));
    expect(achados.every((i) => i >= 0), `todo tópico de ${id} é título do texto`).toBe(true);
    expect([...achados].sort((a, b) => a - b), `tópicos de ${id} na ordem do texto`).toEqual(achados);
    expect(sectionLabels(blocks, artigo!.topics!).filter((l) => l.startsWith('Tópico'))).toHaveLength(TOPICOS);
    const palavras = blocks.reduce((n, b) => n + blockWords(b), 0);
    expect(artigo!.minutes, `minutos de ${id} (${palavras} palavras)`).toBe(Math.max(1, Math.round(palavras / 200)));
    // Cada história traz os capítulos de Bíblia em que o leitor a encontra
    expect(artigo!.passages!.length, `passagens de ${id}`).toBeGreaterThan(3);
    for (const p of artigo!.passages!) {
      const [livroId, cap] = p.split(' ');
      expect(livro(livroId)[Number(cap) - 1], `capítulo ${p} de ${id}`).toBeTruthy();
    }
  }
});

test('dois ferros: toda referência existe e toda citação com referência é idêntica à Almeida do app', () => {
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
    if (conferidas < 80) ruins.push(`${id}: só ${conferidas} citações conferidas (esperadas 80 ou mais)`);
  }
  expect(ruins).toEqual([]);
});

test('dois ferros: blocos fechados, títulos no padrão, ligações que existem e nada de referência dentro de negrito ou itálico', () => {
  const ruins: string[] = [];
  for (const id of IDS) {
    const fonte = md(id);
    const abre = (fonte.match(/^:::(nota|destaque|leia|ficha|tempo)\b/gm) ?? []).length;
    if ((fonte.match(/^:::\s*$/gm) ?? []).length !== abre) ruins.push(`${id}: blocos ::: desbalanceados`);
    for (const t of [...fonte.matchAll(/^#{2,3} (.+)$/gm)].map((m) => m[1])) if (titleCase(t) !== t) ruins.push(`${id}: título “${t}” → “${titleCase(t)}”`);
    for (const t of [...fonte.matchAll(/^:::ficha (.+)$/gm)].map((m) => m[1])) if (titleCase(t) !== t) ruins.push(`${id}: ficha “${t}” → “${titleCase(t)}”`);
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
    // cada tópico numerado termina com uma pausa (:::nota), que vira o quadro com a pergunta
    const pausas = blocks.filter((b) => b.type === 'note').length;
    if (pausas < TOPICOS) ruins.push(`${id}: ${pausas} pausas (:::nota), esperadas ${TOPICOS} ou mais`);
    // sem referência solta como “(19:16)”: toda passagem vira [[referência]]
    for (const m of fonte.matchAll(/\((?:\d+:\d+[^)]*)\)/g)) ruins.push(`${id}: referência solta ${m[0]}`);
    // sem aspas retas na prosa
    if (/"/.test(fonte)) ruins.push(`${id}: aspas retas no texto`);
  }
  // cada história leva à outra por um cartão ao fim (e nenhuma liga duas vezes à mesma)
  if (!md(IDS[0]).includes(':::leia o-ferro-que-levanta continua')) ruins.push('o ferro que fere não leva ao que levanta');
  if (!/^:::leia o-ferro-que-fere\b/m.test(md(IDS[1]))) ruins.push('o ferro que levanta não leva ao que fere');
  for (const id of IDS) {
    const alvos = [...md(id).matchAll(/\]\(\/artigo\/([^)\s]+)\)|^:::leia\s+(\S+)/gm)].map((m) => m[1] ?? m[2]);
    const repetidos = alvos.filter((a, i) => alvos.indexOf(a) !== i);
    if (repetidos.length) ruins.push(`${id}: liga duas vezes a ${repetidos.join(', ')}`);
  }
  expect(ruins).toEqual([]);
});

test('dois ferros: o que foi cuidado na escrita não volta (voz, fatos e silêncios do texto)', () => {
  const ruins: string[] = [];
  const proibidas: [RegExp, string][] = [
    [/Pare comigo/i, 'a pausa se chama “Pare aqui” (a voz dos textos é impessoal)'],
    [/\bEste livro\b|\bneste livro\b|Fim do Livro|Livro [12]\b/i, 'o texto não anuncia a si mesmo nem se chama livro'],
    [/\beu vou\b/i, 'o texto não fala em primeira pessoa'],
    [/Capítulo \d+/, 'os títulos são perguntas, sem “Capítulo N”'],
    [/campo de Safate/i, 'Safate é o pai de Eliseu; o texto diz Abel-Meolá (1 Rs 19.16)'],
    [/em onze palavras/i, 'Provérbios 27.17 tem mais de onze palavras em português'],
    [/ungiu (a )?Eliseu com azeite|derramou azeite sobre Eliseu/i, '1 Reis 19 não registra azeite: Elias lança a capa'],
    [/\[\[Lc 9\.62\]\]/, 'a Almeida do app tem 61 versículos em Lucas 9: cita-se o intervalo 57-62'],
    [/anos depois, quando sobe ao céu/i, 'o texto não diz quanto tempo passou entre a capa e a subida de Elias'],
    [/a frase mais honesta de toda/i, 'afirmação sem apoio'],
  ];
  // a prosa não conta as citações da Bíblia (“Eu vou para o Pai” é de Jesus) nem a oração, que é dita em primeira pessoa
  const prosa = (s: string) => s.replace(/“[^”]*”/g, '').replace(/^> .*$/gm, '');
  for (const id of IDS) for (const [padrao, motivo] of proibidas) if (padrao.test(prosa(md(id)))) ruins.push(`${id}: ${motivo}`);
  // as ressalvas que o texto prometeu ficam no texto
  const fere = md(IDS[0]);
  if (!/não diz[^.]*que Deus\s+\*enviou\* Penina/i.test(fere)) ruins.push('o ferro que fere deve dizer que 1 Sm 1.5-6 não diz que Deus enviou Penina');
  if (!/Permitir não é aprovar/.test(fere)) ruins.push('o ferro que fere deve dizer que permitir não é aprovar');
  if (!/Abre a tua boca a favor do mudo/.test(fere)) ruins.push('o ferro que fere deve trazer os textos que mandam denunciar (Pv 31.8-9)');
  const levanta = md(IDS[1]);
  if (!/nunca promete que todo crente terá um Elias/.test(levanta)) ruins.push('o ferro que levanta deve dizer que a Bíblia não promete um Elias a todos');
  if (!/não registra azeite|ungiu com azeite/.test(levanta)) ruins.push('o ferro que levanta deve dizer que 1 Reis 19 não registra azeite');
  if (!/Lc 9\.57-62/.test(levanta)) ruins.push('o ferro que levanta deve citar Lucas 9 pelo intervalo 57-62');
  expect(ruins).toEqual([]);
});
