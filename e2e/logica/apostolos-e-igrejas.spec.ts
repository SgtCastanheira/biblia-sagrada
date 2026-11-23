import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { ARTICLES } from '../../src/app/core/library';
import { parseReferences } from '../../src/app/core/reference-parser';
import { headingKey, outline, parseBlocks, sectionLabels } from '../../src/app/core/rich-text-parser';
import { ARTICLE_SOURCES, WORKS } from '../../src/app/core/sources';
import { blockWords } from '../../src/app/core/topic-sections';
import { titleCase } from '../../src/app/core/title-case';
import { TRAILS } from '../../src/app/core/trails';

// “Os Apóstolos e as Igrejas”: seis histórias na prateleira de mesmo nome da trilha História da Igreja.
// O que a Bíblia afirma, o que a tradição guarda e o que Josefo confirma, com a idade de cada fonte.
// Fontes lidas em 23 de novembro de 2026: Eusébio (livros 1 a 5), Clemente de Roma, Inácio, Ireneu, Josefo (livro 20) e a Wikipédia.
const IDS = [
  'apostolos-e-igrejas-tres-fontes',
  'pedro-de-jerusalem-a-roma',
  'paulo-e-as-suas-igrejas',
  'joao-e-as-igrejas-da-asia',
  'para-onde-foram-os-outros-apostolos',
  'quem-liderava-as-primeiras-igrejas',
];
const TOPICOS: Record<string, number> = {
  'apostolos-e-igrejas-tres-fontes': 6,
  'pedro-de-jerusalem-a-roma': 6,
  'paulo-e-as-suas-igrejas': 6,
  'joao-e-as-igrejas-da-asia': 6,
  'para-onde-foram-os-outros-apostolos': 11,
  'quem-liderava-as-primeiras-igrejas': 6,
};
// piso de citações de versículo conferidas por história (se a conferência parasse de achá-las, o teste passaria sem conferir nada)
const CITACOES_MINIMAS: Record<string, number> = {
  'apostolos-e-igrejas-tres-fontes': 8,
  'pedro-de-jerusalem-a-roma': 20,
  'paulo-e-as-suas-igrejas': 38,
  'joao-e-as-igrejas-da-asia': 9,
  'para-onde-foram-os-outros-apostolos': 7,
  'quem-liderava-as-primeiras-igrejas': 14,
};
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

test('apóstolos e igrejas: as seis histórias estão na biblioteca, na ordem da prateleira, com fontes, tópicos e tempo certos', () => {
  const trilha = TRAILS.find((t) => t.id === 'igreja');
  const prateleira = trilha?.branches.find((b) => b.title === 'Os Apóstolos e as Igrejas');
  expect(prateleira, 'a prateleira “Os Apóstolos e as Igrejas” da trilha História da Igreja').toBeTruthy();
  // o número de cada livro na estante é a posição na lista: as fontes são o 1 e os líderes o 6
  expect(prateleira!.ids).toEqual(IDS);
  for (const id of IDS) {
    const artigo = ARTICLES.find((a) => a.id === id);
    expect(artigo, id).toBeTruthy();
    expect(artigo!.collection, `${id} fica na coleção da História da Igreja`).toBe('igreja');
    expect(artigo!.added, `${id} entrou no app em 23 de novembro de 2026`).toBe('2026-11-23');
    expect(artigo!.period, `período de ${id}`).toMatch(/^\d+–\d+ d\.C\.$/);
    const fonte = ARTICLE_SOURCES[id];
    expect(fonte, `fonte de ${id}`).toBeTruthy();
    expect((fonte.works ?? []).filter((w) => !WORKS[w]), `obras de ${id}`).toEqual([]);
    expect(fonte.works, `obras de ${id}`).toContain('eusebio-historia');
    const blocks = parseBlocks(md(id));
    // os tópicos da capa são títulos do texto, na ordem, e cada um ganha o rótulo “Tópico N de M”
    const secoes = outline(md(id), artigo!.topics).map((s) => headingKey(s.text));
    expect(artigo!.topics, `tópicos de ${id}`).toHaveLength(TOPICOS[id]);
    const achados = artigo!.topics!.map((t) => secoes.indexOf(headingKey(t)));
    expect(achados.every((i) => i >= 0), `todo tópico de ${id} é título do texto`).toBe(true);
    expect([...achados].sort((a, b) => a - b), `tópicos de ${id} na ordem do texto`).toEqual(achados);
    expect(sectionLabels(blocks, artigo!.topics!).filter((l) => l.startsWith('Tópico'))).toHaveLength(TOPICOS[id]);
    // cada tópico é uma pergunta (a capa mostra só o título, sem a resposta)
    for (const t of artigo!.topics!) expect(t.endsWith('?'), `tópico “${t}” de ${id} é uma pergunta`).toBe(true);
    const palavras = blocks.reduce((n, b) => n + blockWords(b), 0);
    expect(artigo!.minutes, `minutos de ${id} (${palavras} palavras)`).toBe(Math.max(1, Math.round(palavras / 200)));
    // cada história traz os capítulos de Bíblia em que o leitor a encontra
    expect(artigo!.passages!.length, `passagens de ${id}`).toBeGreaterThan(3);
    for (const p of artigo!.passages!) {
      const [livroId, cap] = p.split(' ');
      expect(livro(livroId)[Number(cap) - 1], `capítulo ${p} de ${id}`).toBeTruthy();
    }
  }
});

test('apóstolos e igrejas: toda referência existe e toda citação com referência é idêntica à Almeida do app', () => {
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
    if (conferidas < CITACOES_MINIMAS[id]) ruins.push(`${id}: só ${conferidas} citações conferidas (esperadas ${CITACOES_MINIMAS[id]} ou mais)`);
  }
  expect(ruins).toEqual([]);
});

test('apóstolos e igrejas: blocos fechados, títulos no padrão, ligações que existem, cartões em cadeia e nada de referência dentro de ênfase', () => {
  const ruins: string[] = [];
  const titulos = new Map(ARTICLES.map((a) => [a.id, a.title]));
  for (const id of IDS) {
    const fonte = md(id);
    const abre = (fonte.match(/^:::(nota|destaque|leia|ficha|tempo)\b/gm) ?? []).length;
    if ((fonte.match(/^:::\s*$/gm) ?? []).length !== abre) ruins.push(`${id}: blocos ::: desbalanceados`);
    for (const t of [...fonte.matchAll(/^#{2,3} (.+)$/gm)].map((m) => m[1])) if (titleCase(t) !== t) ruins.push(`${id}: título “${t}” → “${titleCase(t)}”`);
    for (const t of [...fonte.matchAll(/^:::ficha (.+)$/gm)].map((m) => m[1])) if (titleCase(t) !== t) ruins.push(`${id}: ficha “${t}” → “${titleCase(t)}”`);
    for (const l of [...fonte.matchAll(/^:::leia\s+(\S+)/gm)].map((m) => m[1])) if (!titulos.has(l)) ruins.push(`${id}: leia ${l}`);
    for (const l of [...fonte.matchAll(/\]\(\/artigo\/([^)\s]+)\)/g)].map((m) => m[1])) if (!titulos.has(l)) ruins.push(`${id}: link /artigo/${l}`);
    // o leitor do texto não lê [[referência]] nem [link](…) dentro de **negrito** ou *itálico*: apareceriam como texto cru
    for (const m of fonte.matchAll(/\*\*([^*\n]+?)\*\*|(?<!\*)\*([^*\n]+?)\*(?!\*)/g)) {
      if (/\[\[|\]\(|\*/.test(m[1] ?? m[2] ?? '')) ruins.push(`${id}: marcação dentro de ênfase: ${m[0].slice(0, 70)}`);
    }
    // sem referência solta como “(19:16)” nem aspas retas na prosa
    for (const m of fonte.matchAll(/\((?:\d+:\d+[^)]*)\)/g)) ruins.push(`${id}: referência solta ${m[0]}`);
    if (/"/.test(fonte)) ruins.push(`${id}: aspas retas no texto`);
    // uma história nunca liga duas vezes à mesma outra
    const alvos = [...fonte.matchAll(/\]\(\/artigo\/([^)\s]+)\)|^:::leia\s+(\S+)/gm)].map((m) => m[1] ?? m[2]);
    const repetidos = alvos.filter((a, i) => alvos.indexOf(a) !== i);
    if (repetidos.length) ruins.push(`${id}: liga duas vezes a ${repetidos.join(', ')}`);
    // a menção em itálico a outra história escreve o título como ele é
    for (const m of fonte.matchAll(/(?<!\*)\*([^*\n]+\?)\*(?!\*)/g)) {
      if (![...titulos.values()].includes(m[1])) ruins.push(`${id}: menção em itálico “${m[1]}” não é título de nenhuma história`);
    }
  }
  // cada história leva à seguinte por um cartão “continua” ao fim; a última volta à primeira
  IDS.slice(0, -1).forEach((id, i) => {
    if (!md(id).includes(`:::leia ${IDS[i + 1]} continua`)) ruins.push(`${id} não leva a ${IDS[i + 1]} por um cartão “continua”`);
  });
  if (!/^:::leia apostolos-e-igrejas-tres-fontes\s*$/m.test(md(IDS[5]))) ruins.push('a última história não volta à primeira');
  // a primeira reúne as outras cinco
  for (const id of IDS.slice(1)) if (!new RegExp(`^:::leia ${id}\\b`, 'm').test(md(IDS[0]))) ruins.push(`a primeira não tem cartão para ${id}`);
  expect(ruins).toEqual([]);
});

test('apóstolos e igrejas: o que foi conferido nas fontes e cuidado na escrita não volta (fatos, idades e silêncios)', () => {
  const ruins: string[] = [];
  const todos = IDS.map((id) => md(id)).join('\n');
  const proibidas: [RegExp, string][] = [
    [/Vou ser direto|Este estudo|[Nn]este livro|Seja honesto/, 'o texto não anuncia a si mesmo (voz impessoal)'],
    [/sumo sacerdote Anás\b/, 'quem mandou apedrejar Tiago foi Anano, o Jovem, filho do Anás dos Evangelhos'],
    [/Papias[^.]{0,80}ouvinte de João|ouvinte de João[^.]{0,80}Papias/, 'o próprio Papias diz que ouviu Aristião e o presbítero João (Eusébio, 3.39)'],
    [/Pedro[^.]{0,60}primeiro bispo de Roma|primeiro bispo de Roma[^.]{0,60}Pedro/, 'Eusébio e Ireneu dão a Lino o primeiro episcopado depois de Pedro e Paulo'],
    [/Dimas|Gestas/, 'nomes de apócrifos que este estudo não usa'],
    [/crucificado de cabeça para baixo[^.]{0,40}(com certeza|sem dúvida)/i, 'a cruz invertida é tradição de Orígenes, e não fato'],
    [/Judas Tadeu[^.]{0,40}(fundou|evangelizou) Edessa/, 'o Tadeu de Edessa, para Eusébio, é um dos Setenta'],
  ];
  for (const [re, porque] of proibidas) if (re.test(todos)) ruins.push(`${re}: ${porque}`);
  // cada fato do guia que foi corrigido ao conferir as fontes
  const exigidos: [string, string, string][] = [
    ['apostolos-e-igrejas-tres-fontes', 'Anano, o Jovem', 'Tiago foi apedrejado por Anano, o Jovem, e não por “Anás”'],
    ['apostolos-e-igrejas-tres-fontes', 'Setenta', 'o Tadeu de Edessa era um dos Setenta (Eusébio 1.12–13)'],
    ['para-onde-foram-os-outros-apostolos', 'fim da Idade Média', 'a cruz em X só se firmou na arte no fim da Idade Média'],
    ['para-onde-foram-os-outros-apostolos', 'lexicógrafo Papias', 'a frase sobre Maria de Clopas não é do bispo Papias'],
    ['joao-e-as-igrejas-da-asia', 'Aristião e o presbítero João', 'os dois Joões de Papias (Eusébio 3.39)'],
    ['pedro-de-jerusalem-a-roma', 'Lino', 'o primeiro bispo de Roma depois de Pedro e Paulo foi Lino (Eusébio 3.2)'],
    ['quem-liderava-as-primeiras-igrejas', 'Anano, o Jovem', 'Josefo conta a morte de Tiago e o nome de quem a mandou'],
    ['quem-liderava-as-primeiras-igrejas', 'Evódio', 'Evódio, o primeiro bispo de Antioquia, segundo Eusébio (3.22)'],
    ['paulo-e-as-suas-igrejas', 'sete vezes preso', 'Clemente de Roma: Paulo esteve sete vezes preso'],
    ['paulo-e-as-suas-igrejas', 'Em Quais Igrejas Paulo Nunca Esteve?', 'Roma e o vale do Lico: igrejas que Paulo não plantou nem visitou'],
  ];
  for (const [id, trecho, porque] of exigidos) if (!md(id).includes(trecho)) ruins.push(`${id}: falta “${trecho}” (${porque})`);
  // o texto fala de “nenhuma das fontes aqui lidas” onde afirma um silêncio (não de todas as fontes que existem)
  if (!/nenhuma das fontes aqui lidas|fontes aqui citadas|fontes aqui lidas/.test(todos)) ruins.push('os silêncios precisam dizer que são das fontes lidas');
  expect(ruins).toEqual([]);
});

test('apóstolos e igrejas: os onze, Matias e Paulo têm lugar certo: quadro no primeiro livro, ficha no Memorial e uma seção para cada um', () => {
  const ruins: string[] = [];
  const memorial = new Set<string>((JSON.parse(readFileSync('public/conteudo/memorial.json', 'utf8')) as { id: string }[]).map((p) => p.id));
  // na ordem da lista de Mateus 10, com o lugar de cada um: [id no Memorial, história, tópico do livro dos outros apóstolos (0 = livro próprio)]
  const quadro: [string, string, number][] = [
    ['pedro', 'pedro-de-jerusalem-a-roma', 0],
    ['andre', 'para-onde-foram-os-outros-apostolos', 2],
    ['tiago-zebedeu', 'para-onde-foram-os-outros-apostolos', 3],
    ['joao-apostolo', 'joao-e-as-igrejas-da-asia', 0],
    ['filipe', 'para-onde-foram-os-outros-apostolos', 4],
    ['bartolomeu', 'para-onde-foram-os-outros-apostolos', 5],
    ['tome', 'para-onde-foram-os-outros-apostolos', 6],
    ['mateus', 'para-onde-foram-os-outros-apostolos', 7],
    ['tiago-alfeu', 'para-onde-foram-os-outros-apostolos', 8],
    ['tadeu', 'para-onde-foram-os-outros-apostolos', 9],
    ['simao-zelote', 'para-onde-foram-os-outros-apostolos', 10],
    ['matias', 'para-onde-foram-os-outros-apostolos', 11],
    ['paulo', 'paulo-e-as-suas-igrejas', 0],
  ];
  const hub = md('apostolos-e-igrejas-tres-fontes');
  const linhas = [...hub.matchAll(/^- (.+?) \| (.+)$/gm)].map((m) => m[2]).filter((l) => l.includes('/memorial/'));
  if (linhas.length !== quadro.length) ruins.push(`o quadro do primeiro livro tem ${linhas.length} linhas, esperadas ${quadro.length}`);
  quadro.forEach(([pessoa, historia, topico], i) => {
    if (!memorial.has(pessoa)) ruins.push(`${pessoa}: sem ficha no Memorial`);
    const titulo = ARTICLES.find((a) => a.id === historia)!.title;
    const linha = linhas[i] ?? '';
    if (!linha.includes(`(/memorial/${pessoa})`)) ruins.push(`linha ${i + 1} do quadro devia levar a /memorial/${pessoa}`);
    if (!linha.includes(`*${titulo}*`)) ruins.push(`linha ${i + 1} do quadro devia citar *${titulo}*`);
    if (topico && !linha.includes(`tópico ${topico}.`)) ruins.push(`linha ${i + 1} do quadro devia dizer “tópico ${topico}”`);
  });
  // o livro dos outros apóstolos tem uma seção para cada um, e o tópico N do quadro é mesmo o N-ésimo
  const outros = ARTICLES.find((a) => a.id === 'para-onde-foram-os-outros-apostolos')!;
  const nomes: [number, RegExp][] = [
    [2, /André/], [3, /Tiago de Zebedeu/], [4, /Filipe/], [5, /Bartolomeu/], [6, /Tomé/],
    [7, /Mateus/], [8, /Tiago, Filho de Alfeu/], [9, /Tadeu/], [10, /Simão/], [11, /Substituto de Judas/],
  ];
  for (const [n, re] of nomes) if (!re.test(outros.topics![n - 1] ?? '')) ruins.push(`o tópico ${n} do livro dos outros apóstolos devia falar de ${re}`);
  const fichas = [...md('para-onde-foram-os-outros-apostolos').matchAll(/^:::ficha (.+?):/gm)].map((m) => m[1]);
  if (fichas.length !== 10) ruins.push(`o livro dos outros apóstolos tem ${fichas.length} fichas de apóstolo, esperadas 10`);
  // Judas Iscariotes e Matias: o texto diz de onde vêm os onze e o doze
  if (!/Judas Iscariotes morreu antes do Pentecostes/.test(hub) || !/Matias completou o número/.test(hub)) ruins.push('o quadro precisa explicar “onze mais Matias”');
  expect(ruins).toEqual([]);
});

test('apóstolos e igrejas: o trecho de Josefo sobre Tiago vem inteiro, com crédito, e as histórias se ligam nos dois sentidos', () => {
  const ruins: string[] = [];
  const lideres = md('quem-liderava-as-primeiras-igrejas');
  const citacao = [...lideres.matchAll(/^> (.+)$/gm)].map((m) => m[1]);
  if (citacao.length !== 3) ruins.push(`o trecho de Josefo devia ter 3 parágrafos citados, tem ${citacao.length}`);
  const inteiro = citacao.join(' ');
  // cada afirmação do parágrafo de Antiguidades 20.9.1 (Whiston) tem de estar na tradução
  for (const trecho of ['morte de Festo', 'Albino', 'filho de Anano', 'cinco filhos', 'saduceus', 'Sinédrio', 'o irmão de Jesus, o chamado Cristo, cujo nome era Tiago', 'apedrejados', 'Alexandria', 'três meses', 'Jesus, filho de Damneu']) {
    if (!inteiro.includes(trecho)) ruins.push(`falta no trecho de Josefo: “${trecho}”`);
  }
  if (!/Antiguidades Judaicas\* 20\.9\.1\./.test(lideres)) ruins.push('falta a referência do trecho (Antiguidades Judaicas 20.9.1)');
  if (!/Whiston/.test(lideres) || !/domínio público/.test(lideres)) ruins.push('falta o crédito da tradução (Whiston, domínio público)');
  if (!ARTICLE_SOURCES['quem-liderava-as-primeiras-igrejas'].ancient!.some((a) => /Whiston/.test(a) && /traduzido para o app/.test(a))) ruins.push('a fonte do trecho traduzido precisa estar em ARTICLE_SOURCES');
  // as ligações: livro 6 → estudo de Josefo (apoio), estudo de Josefo → livro 6, livro 1 menciona onde está o trecho
  if (!/^:::leia flavio-josefo apoio\s*$/m.test(lideres)) ruins.push('o livro dos líderes não leva ao estudo de Josefo');
  if (!/^:::leia quem-liderava-as-primeiras-igrejas\s*$/m.test(readFileSync('public/conteudo/artigos/flavio-josefo.md', 'utf8'))) ruins.push('o estudo de Josefo não leva de volta ao trecho');
  if (!md('apostolos-e-igrejas-tres-fontes').includes('O parágrafo inteiro, traduzido, está em *Quem Liderava as Primeiras Igrejas?*')) ruins.push('o livro 1 não diz onde está o trecho inteiro');
  if (!lideres.includes('(/memorial/tiago-irmao-do-senhor)')) ruins.push('falta o link para a ficha de Tiago no Memorial');
  expect(ruins).toEqual([]);
});

test('apóstolos e igrejas: o contexto histórico de cada assunto leva ao estudo, ao verbete, à ficha ou ao mapa que o explica, e diz por que aparece ali', () => {
  const ruins: string[] = [];
  const memorial = new Set<string>((JSON.parse(readFileSync('public/conteudo/memorial.json', 'utf8')) as { id: string }[]).map((p) => p.id));
  const dicionario = new Set<string>((JSON.parse(readFileSync('public/conteudo/dicionario.json', 'utf8')) as { id: string }[]).map((p) => p.id));
  const mapas = readFileSync('src/app/core/maps.ts', 'utf8');
  // cartões “para entender o cenário” que cada história tem de ter (o texto diz por que o assunto aparece ali)
  const apoios: Record<string, number> = {
    'apostolos-e-igrejas-tres-fontes': 2,
    'pedro-de-jerusalem-a-roma': 2,
    'paulo-e-as-suas-igrejas': 3,
    'joao-e-as-igrejas-da-asia': 2,
    'para-onde-foram-os-outros-apostolos': 0,
    'quem-liderava-as-primeiras-igrejas': 3,
  };
  for (const id of IDS) {
    const fonte = md(id);
    const cartoes = [...fonte.matchAll(/^:::leia (\S+) apoio\n([^\n]*)\n:::/gm)];
    if (cartoes.length < apoios[id]) ruins.push(`${id}: ${cartoes.length} cartões de contexto, esperados ${apoios[id]} ou mais`);
    for (const [, alvo, texto] of cartoes) {
      if (texto.trim().split(/\s+/).length < 15) ruins.push(`${id}: o cartão de ${alvo} não explica por que o assunto aparece ali (texto curto)`);
      if (/\[\[|\]\(/.test(texto)) ruins.push(`${id}: o cartão de ${alvo} não pode ter referência nem link dentro do texto`);
    }
    for (const m of fonte.matchAll(/\]\(\/memorial\/([^)\s]+)\)/g)) if (!memorial.has(m[1])) ruins.push(`${id}: /memorial/${m[1]} não existe`);
    for (const m of fonte.matchAll(/\]\(\/dicionario\/([^)\s]+)\)/g)) if (!dicionario.has(m[1])) ruins.push(`${id}: /dicionario/${m[1]} não existe`);
    for (const m of fonte.matchAll(/\]\(\/mapas\/([^)\s]+)\)/g)) if (!mapas.includes(`id: '${m[1]}'`)) ruins.push(`${id}: /mapas/${m[1]} não existe`);
    // a mesma ficha, o mesmo verbete ou o mesmo mapa não é ligado duas vezes na mesma história
    const todos = [...fonte.matchAll(/\]\((\/(?:memorial|dicionario|mapas)\/[^)\s]+)\)/g)].map((m) => m[1]);
    const repetidos = todos.filter((a, i) => todos.indexOf(a) !== i);
    if (repetidos.length) ruins.push(`${id}: liga duas vezes a ${[...new Set(repetidos)].join(', ')}`);
  }
  // cada apóstolo do livro dos outros tem a linha “Para ler mais”, com a ficha dele no Memorial
  const linhas = [...md('para-onde-foram-os-outros-apostolos').matchAll(/^- Para ler mais \| (.+)$/gm)].map((m) => m[1]);
  if (linhas.length !== 10) ruins.push(`o livro dos outros apóstolos tem ${linhas.length} linhas “Para ler mais”, esperadas 10`);
  for (const l of linhas) if (!/\(\/memorial\//.test(l)) ruins.push(`linha “Para ler mais” sem ficha do Memorial: ${l.slice(0, 60)}`);
  expect(ruins).toEqual([]);
});
