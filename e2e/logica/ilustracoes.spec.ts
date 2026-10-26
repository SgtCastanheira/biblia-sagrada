import { expect, test } from '@playwright/test';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { parseBlocks } from '../../src/app/core/rich-text-parser';
import { ARTICLES, CLASSIC_SERMONS } from '../../src/app/core/library';

const FIGURES = [...readFileSync('src/app/shared/figure.ts', 'utf8').matchAll(/@case \('([\w-]+)'\)/g)].map((m) => m[1]);

test('ilustrações: toda foto existe na pasta e toda figura existe no app, com legenda', () => {
  const problems: string[] = [];
  for (const file of readdirSync('public/conteudo/artigos')) {
    for (const b of parseBlocks(readFileSync(`public/conteudo/artigos/${file}`, 'utf8'))) {
      if (b.type === 'image') {
        if (!existsSync(`public/conteudo/${b.src}`)) problems.push(`${file}: foto ${b.src} não existe`);
        if (!b.alt || !b.caption?.length) problems.push(`${file}: foto ${b.src} sem descrição ou sem legenda (crédito)`);
      }
      if (b.type === 'figure' && !FIGURES.includes(b.figure!)) problems.push(`${file}: figura "${b.figure}" não existe`);
    }
  }
  expect(problems).toEqual([]);
});

test('histórias: cenas, destaques e personagens bem formados; retratos da capa existem', () => {
  const problems: string[] = [];
  for (const file of readdirSync('public/conteudo/artigos')) {
    for (const b of parseBlocks(readFileSync(`public/conteudo/artigos/${file}`, 'utf8'))) {
      if (b.type === 'scene' && (!b.place || !b.inlines?.length)) problems.push(`${file}: cena sem lugar ou sem texto`);
      if (b.type === 'pullquote' && (!b.inlines?.length || !b.cite)) problems.push(`${file}: destaque sem texto ou sem autor`);
      for (const p of b.people ?? []) {
        if (!p.name || !p.role) problems.push(`${file}: personagem sem nome ou papel`);
        if (p.src && !existsSync(`public/conteudo/${p.src}`)) problems.push(`${file}: foto ${p.src} não existe`);
      }
    }
  }
  for (const a of ARTICLES) {
    for (const src of a.portraits ?? []) if (!existsSync(`public/conteudo/${src}`)) problems.push(`${a.id}: retrato ${src} não existe`);
  }
  expect(problems).toEqual([]);
});

test('o leitor entende os blocos das histórias', () => {
  const [cena, destaque, pessoas] = parseBlocks(
    ':::cena Belém · 1910\nDois jovens.\n:::\n\n:::destaque\nIde.\n— Jesus, em [[Mc 16.15]]\n:::\n\n:::pessoas\n- Gunnar Vingren | pastor | imagens/gunnar-vingren.jpg\n- Daniel Berg | evangelista\n:::',
  );
  expect(cena).toMatchObject({ type: 'scene', place: 'Belém · 1910' });
  expect(destaque.cite?.map((i) => i.t)).toEqual(['text', 'ref']);
  expect(pessoas.people).toEqual([
    { name: 'Gunnar Vingren', role: 'pastor', src: 'imagens/gunnar-vingren.jpg' },
    { name: 'Daniel Berg', role: 'evangelista', src: undefined },
  ]);
});

test('histórias entrelaçadas: todo cartão "leia" leva a um artigo que existe, e o panorama cobre toda a coleção', () => {
  const problems: string[] = [];
  for (const file of readdirSync('public/conteudo/artigos')) {
    for (const b of parseBlocks(readFileSync(`public/conteudo/artigos/${file}`, 'utf8'))) {
      if (b.type === 'read' && !ARTICLES.some((a) => a.id === b.article)) problems.push(`${file}: "leia ${b.article}" não existe`);
      if (b.type === 'read' && `${b.article}.md` === file) problems.push(`${file}: cartão para si mesmo`);
    }
  }
  const overview = ARTICLES.find((a) => a.overview && a.collection === 'igreja')!;
  const linked = parseBlocks(readFileSync(`public/conteudo/artigos/${overview.id}.md`, 'utf8')).filter((b) => b.type === 'read').map((b) => b.article);
  for (const a of ARTICLES.filter((x) => x.collection === 'igreja' && !x.overview)) {
    if (!linked.includes(a.id)) problems.push(`o panorama não leva a "${a.id}"`);
  }
  expect(problems).toEqual([]);
});

test('avivamentos: cartões de sermão existem, fichas completas e o panorama leva a todos os avivamentos', () => {
  const problems: string[] = [];
  for (const file of readdirSync('public/conteudo/artigos')) {
    for (const b of parseBlocks(readFileSync(`public/conteudo/artigos/${file}`, 'utf8'))) {
      if (b.type === 'sermon' && !CLASSIC_SERMONS.some((s) => s.id === b.sermon)) problems.push(`${file}: sermão "${b.sermon}" não existe`);
      if (b.type === 'facts' && (!b.facts?.length || b.facts.some((f) => !f.label || !f.text.length))) problems.push(`${file}: ficha incompleta`);
    }
  }
  for (const s of CLASSIC_SERMONS) {
    if (s.revival && !ARTICLES.some((a) => a.id === s.revival)) problems.push(`sermão ${s.id}: avivamento "${s.revival}" não existe`);
  }
  const overview = ARTICLES.find((a) => a.overview && a.collection === 'avivamentos')!;
  const linked = parseBlocks(readFileSync(`public/conteudo/artigos/${overview.id}.md`, 'utf8')).filter((b) => b.type === 'read').map((b) => b.article);
  for (const a of ARTICLES.filter((x) => x.collection === 'avivamentos' && !x.overview)) {
    if (!linked.includes(a.id)) problems.push(`o panorama dos avivamentos não leva a "${a.id}"`);
  }
  expect(problems).toEqual([]);
});

test('o leitor entende a ficha e o cartão de sermão', () => {
  const [ficha, sermao] = parseBlocks(':::ficha Gales\n- Como começou | Em [[At 2.1]]\n- O fim | 1906\n:::\n\n:::sermao evan-roberts-quatro-condicoes\n:::');
  expect(ficha).toMatchObject({ type: 'facts', place: 'Gales' });
  expect(ficha.facts?.map((f) => f.label)).toEqual(['Como começou', 'O fim']);
  expect(ficha.facts?.[0].text.map((i) => i.t)).toEqual(['text', 'ref']);
  expect(sermao).toMatchObject({ type: 'sermon', sermon: 'evan-roberts-quatro-condicoes' });
});

test('Assembleia de Deus em cada estado: história, etapa no mapa com link, origem e referências válidas', async () => {
  const { AD_STATES } = await import('../../src/app/core/ad-states');
  const { findMap } = await import('../../src/app/core/maps');
  const { parseReferences } = await import('../../src/app/core/reference-parser');
  const map = findMap('assembleia-de-deus-estados')!;
  const problems: string[] = [];
  expect(AD_STATES.length).toBe(27);
  for (const s of AD_STATES) {
    const file = `public/conteudo/ad-estados/${s.id}.md`;
    if (!existsSync(file)) { problems.push(`${s.id}: história não existe`); continue; }
    const step = map.steps.find((x) => x.place === s.id);
    if (!step) problems.push(`${s.id}: sem etapa no mapa`);
    else {
      if (step.link !== `/assembleia-de-deus/${s.id}`) problems.push(`${s.id}: etapa sem link para a história`);
      if ((step.from ?? null) !== (s.from ?? null)) problems.push(`${s.id}: origem do mapa (${step.from}) diferente da história (${s.from})`);
    }
    for (const b of parseBlocks(readFileSync(file, 'utf8'))) {
      for (const p of b.people ?? []) if (p.src && !existsSync(`public/conteudo/${p.src}`)) problems.push(`${s.id}: foto ${p.src} não existe`);
      if (b.type === 'read' && !ARTICLES.some((a) => a.id === b.article)) problems.push(`${s.id}: "leia ${b.article}" não existe`);
      const inl = [...(b.inlines ?? []), ...(b.cite ?? []), ...(b.items ?? []).flat(), ...(b.events ?? []).flatMap((e) => e.text)];
      for (const i of inl) if (i.t === 'ref' && parseReferences(i.href!).errors.length) problems.push(`${s.id}: referência "${i.href}" inválida`);
    }
  }
  expect(problems).toEqual([]);
});

test('ministérios em cada estado: todo estado tem as convenções da CGADB, e os ministérios citados são de estados que existem', async () => {
  const { AD_STATES, CGADB_CONVENTIONS, STATE_MINISTRIES, BODIES } = await import('../../src/app/core/ad-states');
  const ids = new Set(AD_STATES.map((s) => s.id));
  for (const s of AD_STATES) expect(CGADB_CONVENTIONS[s.id]?.length, `${s.id} sem convenções da CGADB`).toBeGreaterThan(0);
  for (const [id, list] of Object.entries(STATE_MINISTRIES)) {
    expect(ids.has(id), `estado "${id}" não existe`).toBe(true);
    for (const m of list) expect(BODIES[m.body], `${id}: convenção "${m.body}"`).toBeTruthy();
  }
});
