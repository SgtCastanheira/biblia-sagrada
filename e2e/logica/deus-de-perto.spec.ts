import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { ARTICLES } from '../../src/app/core/library';
import { parseReferences } from '../../src/app/core/reference-parser';
import { headingKey, outline, parseBlocks, sectionLabels } from '../../src/app/core/rich-text-parser';
import { ARTICLE_SOURCES, WORKS } from '../../src/app/core/sources';
import { blockWords } from '../../src/app/core/topic-sections';
import { titleCase } from '../../src/app/core/title-case';
import { TRAILS } from '../../src/app/core/trails';

// “Deus de Perto, Deus de Longe” (tese: ninguém morre pelo que não acredita): um estudo argumentativo,
// de Gênesis ao Apocalipse, na prateleira “Conhecer a Deus de Perto” da trilha Teologia.
const ID = 'deus-de-perto-deus-de-longe';
const TOPICOS = 8;
const md = readFileSync(`public/conteudo/artigos/${ID}.md`, 'utf8');
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
const contem = (v: string, q: string) => q.split(/\s*(?:…|\.\.\.)+\s*/).map(norm).filter(Boolean).every((f) => norm(v).includes(f));

test('deus de perto: o estudo está na biblioteca, na trilha Teologia, com fontes, tópicos e tempo certos', () => {
  const trilha = TRAILS.find((t) => t.id === 'teologia');
  const prateleira = trilha?.branches.find((b) => b.title === 'Conhecer a Deus de Perto');
  expect(prateleira, 'a prateleira “Conhecer a Deus de Perto” da trilha Teologia').toBeTruthy();
  expect(prateleira!.ids).toEqual([ID]);
  const artigo = ARTICLES.find((a) => a.id === ID);
  expect(artigo, ID).toBeTruthy();
  expect(artigo!.story, 'se lê como história').toBe(true);
  const fonte = ARTICLE_SOURCES[ID];
  expect(fonte, 'fonte do estudo').toBeTruthy();
  expect((fonte.works ?? []).filter((w) => !WORKS[w]), 'obras do estudo').toEqual([]);
  const blocks = parseBlocks(md);
  // Os tópicos da capa são oito títulos do texto, na ordem; o fecho (“Ovelha que Ouve e Segue”) fica sem número
  const secoes = outline(md, artigo!.topics).map((s) => headingKey(s.text));
  expect(artigo!.topics, 'tópicos').toHaveLength(TOPICOS);
  const achados = artigo!.topics!.map((t) => secoes.indexOf(headingKey(t)));
  expect(achados.every((i) => i >= 0), 'todo tópico é título do texto').toBe(true);
  expect([...achados].sort((a, b) => a - b), 'tópicos na ordem do texto').toEqual(achados);
  expect(sectionLabels(blocks, artigo!.topics!).filter((l) => l.startsWith('Tópico'))).toHaveLength(TOPICOS);
  const palavras = blocks.reduce((n, b) => n + blockWords(b), 0);
  expect(artigo!.minutes, `minutos (${palavras} palavras)`).toBe(Math.max(1, Math.round(palavras / 200)));
  // O estudo traz os capítulos de Bíblia em que o leitor o encontra
  expect(artigo!.passages!.length, 'passagens').toBeGreaterThan(3);
  for (const p of artigo!.passages!) {
    const [livroId, cap] = p.split(' ');
    expect(livro(livroId)[Number(cap) - 1], `capítulo ${p}`).toBeTruthy();
  }
});

test('deus de perto: toda referência existe e toda citação com referência é idêntica à Almeida do app', () => {
  const ruins: string[] = [];
  const refs = [...md.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)].map((m) => m[1].trim());
  for (const r of new Set(refs)) { const e = texto(r).erro; if (e) ruins.push(e); }
  // “citação” seguida de [[referência]] (com ou sem parênteses): tem de estar no versículo
  let conferidas = 0;
  for (const m of md.matchAll(/“([^”]{3,}?)”[\s,.;:(]*\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g)) {
    conferidas++;
    if (!contem(texto(m[2].trim()).t, m[1])) ruins.push(`${m[2]} :: ${m[1]}`);
  }
  // frases em destaque (o versículo numa linha e “— [[referência]]” na seguinte)
  for (const m of md.matchAll(/^:::destaque\n“([^”]+)”\n— \[\[([^\]|]+)\]\]\n:::/gm)) {
    conferidas++;
    if (!contem(texto(m[2].trim()).t, m[1])) ruins.push(`destaque ${m[2]} :: ${m[1]}`);
  }
  // se a conferência deixasse de achar as citações, este teste passaria sem conferir nada
  if (conferidas < 150) ruins.push(`só ${conferidas} citações conferidas (esperadas 150 ou mais)`);
  expect(ruins).toEqual([]);
});

test('deus de perto: blocos fechados, títulos no padrão, ligações que existem e nada de referência dentro de negrito ou itálico', () => {
  const ruins: string[] = [];
  const abre = (md.match(/^:::(nota|destaque|leia|ficha|tempo)\b/gm) ?? []).length;
  if ((md.match(/^:::\s*$/gm) ?? []).length !== abre) ruins.push('blocos ::: desbalanceados');
  for (const t of [...md.matchAll(/^#{2,3} (.+)$/gm)].map((m) => m[1])) if (titleCase(t) !== t) ruins.push(`título “${t}” → “${titleCase(t)}”`);
  for (const t of [...md.matchAll(/^:::ficha (.+)$/gm)].map((m) => m[1])) if (titleCase(t) !== t) ruins.push(`ficha “${t}” → “${titleCase(t)}”`);
  for (const l of [...md.matchAll(/^:::leia\s+(\S+)/gm)].map((m) => m[1])) if (!ARTICLES.some((a) => a.id === l)) ruins.push(`leia ${l}`);
  for (const l of [...md.matchAll(/\]\(\/artigo\/([^)\s]+)\)/g)].map((m) => m[1])) if (!ARTICLES.some((a) => a.id === l)) ruins.push(`link /artigo/${l}`);
  // o leitor do texto não lê [[referência]] nem [link](…) dentro de **negrito** ou *itálico*: apareceriam como texto cru
  for (const m of md.matchAll(/\*\*([^*\n]+?)\*\*|(?<!\*)\*([^*\n]+?)\*(?!\*)/g)) {
    if (/\[\[|\]\(|\*/.test(m[1] ?? m[2] ?? '')) ruins.push(`marcação dentro de ênfase: ${m[0].slice(0, 70)}`);
  }
  // a primeira coisa do texto é um versículo em destaque e a letra capitular cai no primeiro parágrafo
  const blocks = parseBlocks(md);
  if (blocks[0].type !== 'pullquote') ruins.push('o texto deve abrir com o versículo em destaque');
  if (blocks.findIndex((b) => b.type === 'p') < 0) ruins.push('sem parágrafo');
  // cada tópico numerado termina com uma pausa (:::nota), que vira o quadro com a pergunta
  const pausas = blocks.filter((b) => b.type === 'note').length;
  if (pausas < TOPICOS) ruins.push(`${pausas} pausas (:::nota), esperadas ${TOPICOS} ou mais`);
  // sem referência solta como “(19:16)”: toda passagem vira [[referência]]
  for (const m of md.matchAll(/\((?:\d+:\d+[^)]*)\)/g)) ruins.push(`referência solta ${m[0]}`);
  // sem aspas retas na prosa
  if (/"/.test(md)) ruins.push('aspas retas no texto');
  // nenhuma ligação repetida: o mesmo estudo não é ligado duas vezes
  const alvos = [...md.matchAll(/\]\(\/artigo\/([^)\s]+)\)|^:::leia\s+(\S+)/gm)].map((m) => m[1] ?? m[2]);
  const repetidos = alvos.filter((a, i) => alvos.indexOf(a) !== i);
  if (repetidos.length) ruins.push(`liga duas vezes a ${repetidos.join(', ')}`);
  // o que já existe no app é ligado, não recontado: martírios, Coliseu, perseguição no Brasil e as duas séries vizinhas
  for (const id of ['perseguicoes', 'coliseu-de-roma', 'irmaos-perseguidos', 'o-ferro-que-levanta', 'o-ferro-que-fere']) {
    if (!alvos.includes(id)) ruins.push(`sem ligação para ${id}`);
  }
  expect(ruins).toEqual([]);
});

test('deus de perto: a tese abre e fecha o estudo, e o que foi cuidado na escrita não volta (voz, fatos e ressalvas)', () => {
  const ruins: string[] = [];
  // abre e fecha com a tese
  if (!md.includes('**Ninguém morre pelo que não acredita.**')) ruins.push('o estudo deve abrir com a tese');
  if (!/\*\*Ninguém morre pelo que não acredita\. Só morre de perto quem vive de perto\.\*\*\s*$/.test(md)) ruins.push('o estudo deve fechar retomando a tese');
  if (!/\*\*Só morre de perto quem vive de perto\.\*\*/.test(md)) ruins.push('falta a frase “Só morre de perto quem vive de perto”');
  const proibidas: [RegExp, string][] = [
    [/Pare comigo/i, 'a pausa se chama “Pare aqui” (a voz dos textos é impessoal)'],
    [/\bEste (estudo|livro|texto)\b|\bneste (estudo|livro|texto)\b/i, 'o texto não anuncia a si mesmo'],
    [/\beu vou\b/i, 'o texto não fala em primeira pessoa'],
    [/Capítulo \d+/, 'os títulos são perguntas, sem “Capítulo N”'],
    [/artificialmente compostas/i, 'é a redação da ARC; a Almeida do app diz “fábulas engenhosas” (2Pe 1.16)'],
    [/três anos/i, 'a Bíblia não diz quanto tempo Pedro andou com Jesus; o texto diz só que ele deixou as redes e o seguiu'],
    [/catacumbas?/i, 'as catacumbas foram cemitérios, não esconderijos; o app já tem estudo sobre elas e este não as cita'],
    [/\bprefeito/i, 'a palavra “prefeito” engana (prefeito, no Brasil, é quem governa uma cidade)'],
    [/lançados? aos leões|no Coliseu morreram/i, 'o lugar exato das mortes em Roma é tradição; o estudo liga ao estudo do Coliseu em vez de afirmar'],
  ];
  // a prosa não conta as citações da Bíblia nem a oração, que é dita em primeira pessoa
  const prosa = md.replace(/“[^”]*”/g, '').replace(/^> .*$/gm, '');
  for (const [padrao, motivo] of proibidas) if (padrao.test(prosa)) ruins.push(motivo);
  // as ressalvas que o texto prometeu ficam no texto
  const exigidas: [RegExp, string][] = [
    [/^:::ficha O que o Texto Diz e o que Ele Não Diz/m, 'Jr 23.23 deve ter o quadro do que o texto diz e não diz (o contexto é o dos falsos profetas)'],
    [/nunca estiveram no concílio/, 'Jr 23 trata de profetas que falavam sem ter estado no concílio de Deus'],
    [/Do bode, ela não descreve o andar/, 'o texto deve dizer que a Bíblia não descreve o andar do bode (é imagem de pregação)'],
    [/a Almeida traz “cabritos”/, 'o texto deve dizer que a Almeida do app traz “cabritos” em Mt 25.32'],
    [/Ninguém nasce ovelha obediente/, 'o texto deve dizer que Is 53.6 chama de ovelha a desgarrada'],
    [/ser usado não prova ser conhecido/, 'o texto deve dizer que ser usado não prova ser conhecido (Mt 7.22-23)'],
    [/a intimidade não é o único fator/i, 'o texto deve dizer que a intimidade não explica todo uso (1Co 12.11)'],
    [/Seria um erro tirar daí uma regra/, 'o texto deve dizer que milagre ausente não prova fé ausente (Jo 9.3)'],
    [/a salvação não se compra com esse preço/, 'o texto deve dizer que a salvação já foi paga (Ef 2.8-9)'],
    [/com perseguições/, 'o texto deve lembrar “com perseguições” em Mc 10.30 (nada de evangelho da prosperidade)'],
    [/Morrer prova convicção/, 'o texto deve dizer que morrer prova convicção e não, sozinho, verdade'],
    [/A Bíblia não conta como Paulo morreu/, 'o texto deve dizer que a Bíblia não conta a morte de Paulo'],
    [/não é Escritura/, 'o texto deve dizer que a carta de Clemente não é Escritura'],
    [/morreram e não mataram/, 'o texto deve marcar que os mártires morreram e não mataram'],
    [/Mas se não, fica sabendo/, 'o texto deve trazer o “mas se não” de Dn 3.18 (entrega não obriga Deus a livrar)'],
    [/Só em Apocalipse 17\.6 a Almeida traz “mártires”/, 'a Almeida do app só usa “mártires” em Ap 17.6'],
  ];
  for (const [padrao, motivo] of exigidas) if (!padrao.test(md)) ruins.push(motivo);
  expect(ruins).toEqual([]);
});
