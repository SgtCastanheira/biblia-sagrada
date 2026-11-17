import { expect, test } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import { ARTICLES } from '../../src/app/core/library';
import { parseReferences } from '../../src/app/core/reference-parser';
import { headingKey, outline, parseBlocks, sectionLabels } from '../../src/app/core/rich-text-parser';
import { ARTICLE_SOURCES, WORKS } from '../../src/app/core/sources';
import { blockWords } from '../../src/app/core/topic-sections';
import { titleCase } from '../../src/app/core/title-case';
import { TRAILS } from '../../src/app/core/trails';

// “A Mulher, o Dragão e Miguel” (Apocalipse 12): estudo na prateleira “O Apocalipse por Dentro” da trilha Profecias.
const ID = 'a-mulher-o-dragao-e-miguel';
const TOPICOS = 7;
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

test('mulher, dragão e miguel: o estudo está na biblioteca, na trilha Profecias, com fontes, tópicos e tempo certos', () => {
  const trilha = TRAILS.find((t) => t.id === 'profecias');
  const prateleira = trilha?.branches.find((b) => b.title === 'O Apocalipse por Dentro');
  expect(prateleira, 'a prateleira “O Apocalipse por Dentro” da trilha Profecias').toBeTruthy();
  expect(prateleira!.ids, 'ordem: o ciclo dos selos, trombetas e taças vem antes do capítulo 12').toEqual(['selos-trombetas-e-tacas', ID]);
  const artigo = ARTICLES.find((a) => a.id === ID);
  expect(artigo, ID).toBeTruthy();
  expect(artigo!.story, 'se lê como história').toBe(true);
  expect(artigo!.added, 'dia em que o estudo entrou no app').toMatch(/^\d{4}-\d{2}-\d{2}$/);
  const fonte = ARTICLE_SOURCES[ID];
  expect(fonte, 'fonte do estudo').toBeTruthy();
  expect((fonte.works ?? []).filter((w) => !WORKS[w]), 'obras do estudo').toEqual([]);
  const blocks = parseBlocks(md);
  // Os tópicos da capa são os sete títulos do texto, na ordem
  const secoes = outline(md, artigo!.topics).map((s) => headingKey(s.text));
  expect(artigo!.topics, 'tópicos').toHaveLength(TOPICOS);
  const achados = artigo!.topics!.map((t) => secoes.indexOf(headingKey(t)));
  expect(achados.every((i) => i >= 0), 'todo tópico é título do texto').toBe(true);
  expect([...achados].sort((a, b) => a - b), 'tópicos na ordem do texto').toEqual(achados);
  expect(sectionLabels(blocks, artigo!.topics!).filter((l) => l.startsWith('Tópico'))).toHaveLength(TOPICOS);
  // cada tópico é uma pergunta, que não entrega a resposta
  for (const t of artigo!.topics!) expect(t.endsWith('?'), `tópico “${t}” é uma pergunta`).toBe(true);
  const palavras = blocks.reduce((n, b) => n + blockWords(b), 0);
  expect(artigo!.minutes, `minutos (${palavras} palavras)`).toBe(Math.max(1, Math.round(palavras / 200)));
  // o estudo traz os capítulos de Bíblia em que o leitor o encontra
  expect(artigo!.passages, 'passagens').toContain('REV 12');
  for (const p of artigo!.passages!) {
    const [livroId, cap] = p.split(' ');
    expect(livro(livroId)[Number(cap) - 1], `capítulo ${p}`).toBeTruthy();
  }
});

test('mulher, dragão e miguel: toda referência existe e toda citação com referência é idêntica à Almeida do app', () => {
  const ruins: string[] = [];
  const refs = [...md.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)].map((m) => m[1].trim());
  for (const r of new Set(refs)) { const e = texto(r).erro; if (e) ruins.push(e); }
  // “citação” seguida de [[referência]] (com ou sem parênteses): tem de estar no versículo
  let conferidas = 0;
  for (const m of md.matchAll(/“([^”]{3,}?)”[\s,.;:(]*\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g)) {
    conferidas++;
    if (!contem(texto(m[2].trim()).t, m[1])) ruins.push(`${m[2]} :: ${m[1]}`);
  }
  // o versículo em destaque (numa linha, e “— [[referência]]” na seguinte)
  for (const m of md.matchAll(/^:::destaque\n“([^”]+)”\n— \[\[([^\]|]+)\]\]\n:::/gm)) {
    conferidas++;
    if (!contem(texto(m[2].trim()).t, m[1])) ruins.push(`destaque ${m[2]} :: ${m[1]}`);
  }
  // se a conferência deixasse de achar as citações, este teste passaria sem conferir nada
  if (conferidas < 70) ruins.push(`só ${conferidas} citações conferidas (esperadas 70 ou mais)`);
  expect(ruins).toEqual([]);
});

test('mulher, dragão e miguel: blocos fechados, títulos no padrão, ligações que existem e nada de referência dentro de negrito ou itálico', () => {
  const ruins: string[] = [];
  const abre = (md.match(/^:::(nota|destaque|leia|ficha|tempo)\b/gm) ?? []).length;
  if ((md.match(/^:::\s*$/gm) ?? []).length !== abre) ruins.push('blocos ::: desbalanceados');
  for (const t of [...md.matchAll(/^#{2,3} (.+)$/gm)].map((m) => m[1])) if (titleCase(t) !== t) ruins.push(`título “${t}” → “${titleCase(t)}”`);
  for (const t of [...md.matchAll(/^:::ficha (.+)$/gm)].map((m) => m[1])) if (titleCase(t) !== t) ruins.push(`ficha “${t}” → “${titleCase(t)}”`);
  const artigo = ARTICLES.find((a) => a.id === ID)!;
  if (titleCase(artigo.title) !== artigo.title) ruins.push(`título do estudo → “${titleCase(artigo.title)}”`);
  for (const l of [...md.matchAll(/^:::leia\s+(\S+)/gm)].map((m) => m[1])) if (!ARTICLES.some((a) => a.id === l)) ruins.push(`leia ${l}`);
  for (const l of [...md.matchAll(/\]\(\/artigo\/([^)\s]+)\)/g)].map((m) => m[1])) if (!ARTICLES.some((a) => a.id === l)) ruins.push(`link /artigo/${l}`);
  // o leitor do texto não lê [[referência]] nem [link](…) dentro de **negrito** ou *itálico*: apareceriam como texto cru
  for (const m of md.matchAll(/\*\*([^*\n]+?)\*\*|(?<!\*)\*([^*\n]+?)\*(?!\*)/g)) {
    if (/\[\[|\]\(|\*/.test(m[1] ?? m[2] ?? '')) ruins.push(`marcação dentro de ênfase: ${m[0].slice(0, 70)}`);
  }
  // abre com o versículo em destaque e a letra capitular cai no primeiro parágrafo
  const blocks = parseBlocks(md);
  if (blocks[0].type !== 'pullquote') ruins.push('o texto deve abrir com o versículo em destaque');
  if (blocks.findIndex((b) => b.type === 'p') < 0) ruins.push('sem parágrafo');
  // sem referência solta como “(12:7)”: toda passagem vira [[referência]]
  for (const m of md.matchAll(/\((?:\d+:\d+[^)]*)\)/g)) ruins.push(`referência solta ${m[0]}`);
  // sem aspas retas na prosa (a legenda de uma foto, `![alt](src "legenda")`, leva aspas retas por sintaxe)
  if (/"/.test(md.split('\n').filter((l) => !l.startsWith('![')).join('\n'))) ruins.push('aspas retas no texto');
  // nenhuma ligação repetida: o mesmo estudo não é ligado duas vezes
  const alvos = [...md.matchAll(/\]\(\/artigo\/([^)\s]+)\)|^:::leia\s+(\S+)/gm)].map((m) => m[1] ?? m[2]);
  const repetidos = alvos.filter((a, i) => alvos.indexOf(a) !== i);
  if (repetidos.length) ruins.push(`liga duas vezes a ${repetidos.join(', ')}`);
  // o que já existe no app é ligado, não recontado: o livro inteiro, as bestas do capítulo 13 e o arrebatamento
  for (const id of ['apocalipse', 'trindade-satanica', 'arrebatamento']) {
    if (!alvos.includes(id)) ruins.push(`sem ligação para ${id}`);
  }
  // o capítulo seguinte (as bestas) é a continuação; o livro inteiro é apoio
  if (!/^:::leia trindade-satanica continua$/m.test(md)) ruins.push('o cartão da Trindade Satânica deve ser “continua”');
  if (!/^:::leia apocalipse apoio$/m.test(md)) ruins.push('o cartão do Apocalipse deve ser “apoio”');
  // a Trindade Satânica liga de volta para este estudo (as duas histórias se entrelaçam, cada uma de pé sozinha)
  const trindade = readFileSync('public/conteudo/artigos/trindade-satanica.md', 'utf8');
  if (!new RegExp(`^:::leia ${ID}$`, 'm').test(trindade)) ruins.push('a Trindade Satânica deve ligar de volta a este estudo');
  expect(ruins).toEqual([]);
});

test('mulher, dragão e miguel: o que foi cuidado na escrita não volta (voz, fatos e ressalvas)', () => {
  const ruins: string[] = [];
  const proibidas: [RegExp, string][] = [
    [/\bEste (estudo|livro|texto)\b|\bneste (estudo|livro|texto)\b/i, 'o texto não anuncia a si mesmo'],
    [/\beu vou\b|\bvou ser direto\b/i, 'o texto não fala em primeira pessoa'],
    [/\bprefeito/i, 'a palavra “prefeito” engana (prefeito, no Brasil, é quem governa uma cidade)'],
    [/Mi-ha-el|Mi-ka-el/, 'o nome se escreve Mikha’el (a sílaba do meio é “kĕ”, “como”, e não “ha”)'],
    [/estourou guerra|pelejar/i, 'a Almeida do app diz “houve guerra no céu” e “batalhavam” (Ap 12.7)'],
    [/vocês serão iguais a Deus/i, 'a Almeida do app diz “sereis como Deus” (Gn 3.5)'],
    [/Lúcifer,? (é|foi) o dragão/i, 'o capítulo 12 não chama o dragão de Lúcifer'],
    [/Roma (é|era) o dragão|o dragão (é|era) Roma/i, 'Roma não é o dragão: é um instrumento dele; o texto separa as duas coisas'],
    // vale a negativa do próprio texto (“O texto não diz que o dragão foi atrás do filho”), que é a ressalva
    [/(?<!não diz que )o dragão (subiu|foi) (ao céu )?atrás (da criança|do filho|do bebê)/i, 'o capítulo não diz que o dragão subiu atrás do filho'],
  ];
  // a prosa não conta as citações da Bíblia, que trazem a redação da Almeida
  const prosa = md.replace(/“[^”]*”/g, '');
  for (const [padrao, motivo] of proibidas) if (padrao.test(prosa)) ruins.push(motivo);
  // as ressalvas que o texto prometeu ficam no texto
  const exigidas: [RegExp, string][] = [
    [/O texto não diz que o dragão foi atrás do filho/, 'o texto deve dizer que o capítulo não conta uma perseguição do dragão atrás da criança'],
    [/o capítulo não a descreve assim/, 'o texto deve dizer que o capítulo não descreve a cena como uma perseguição pelos céus'],
    [/Não diz quando/, 'o texto deve dizer que o capítulo não diz quando houve a guerra'],
    [/é só uma leitura: o Apocalipse não explica o nome de Miguel/, 'o texto deve marcar como leitura a ligação entre o nome de Miguel e o “sereis como Deus”'],
    [/o Apocalipse nunca escreve o nome de Roma/, 'o texto deve dizer que o Apocalipse nunca escreve o nome de Roma'],
    [/Roma, porém, não é o dragão: é um instrumento dele/, 'o texto deve separar o dragão (o Diabo) do império (o instrumento)'],
    [/Quem lê só o capítulo 12 encontra/, 'o texto deve dizer que o capítulo 12 não usa o nome Lúcifer'],
    [/É uma leitura, e o texto não explica a imagem/, 'o texto deve marcar como leitura as estrelas lançadas como anjos'],
    [/símbolo é maior do que uma pessoa/, 'o texto deve mostrar, com o versículo 17, que a mulher é mais do que uma pessoa'],
    [/aparece só duas vezes no Novo Testamento/, 'o texto deve dizer que “arcanjo” aparece só duas vezes no Novo Testamento'],
    [/Entre o nascimento e o trono, o capítulo não conta nada/, 'o texto deve dizer que o capítulo salta do nascimento ao trono'],
  ];
  for (const [padrao, motivo] of exigidas) if (!padrao.test(md)) ruins.push(motivo);
  expect(ruins).toEqual([]);
});

test('a capa de Blake existe, aparece no texto com legenda e tem crédito', () => {
  const arquivo = 'imagens/mulher-dragao-blake.jpg';
  const a = ARTICLES.find((x) => x.id === ID)!;
  expect(a.cover).toBe(arquivo);
  expect(existsSync(`public/conteudo/${arquivo}`), 'o arquivo da capa').toBe(true);
  // a capa precisa aparecer também no texto, com a legenda e o crédito do museu
  const linha = md.split('\n').find((l) => l.includes(arquivo));
  expect(linha, 'a capa no texto').toBeTruthy();
  expect(linha).toMatch(/"[^"]*Brooklyn Museum[^"]*domínio público[^"]*"/);
  // crédito na tela de créditos e em CREDITOS.md
  const creditos = readFileSync('src/app/core/credits.ts', 'utf8');
  expect(creditos).toContain('Brooklyn_Museum_-_The_Great_Red_Dragon_and_the_Woman_Clothed_with_the_Sun');
  expect(readFileSync('CREDITOS.md', 'utf8')).toContain(`public/conteudo/${arquivo}`);
});
