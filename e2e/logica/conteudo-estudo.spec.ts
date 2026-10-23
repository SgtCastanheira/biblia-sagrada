import { expect, test } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
import { BOOKS } from '../../src/app/core/books';
import { DictionaryEntry, DictionaryMatcher } from '../../src/app/core/dictionary';
import { ERAS } from '../../src/app/core/atlas';
import { GENEALOGY } from '../../src/app/core/genealogy';
import { ARTICLES, CLASSIC_SERMONS } from '../../src/app/core/library';
import { findMap } from '../../src/app/core/maps';
import { articlesOfPerson, mapsOfPerson, relatedPeople } from '../../src/app/core/relations';
import { GROUPS, Person } from '../../src/app/core/memorial';
import { parseReferences } from '../../src/app/core/reference-parser';
import { parseBlocks } from '../../src/app/core/rich-text-parser';

const json = <T>(file: string): T => JSON.parse(readFileSync(`public/conteudo/${file}`, 'utf8')) as T;
const refsIn = (text: string) => [...text.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)].map((m) => m[1].trim());

/** Falha listando cada referência que o leitor do app não entende. */
function expectValidRefs(refs: string[], where: string) {
  const bad = refs.filter((r) => {
    const parsed = parseReferences(r);
    return parsed.errors.length > 0 || parsed.refs.length === 0;
  });
  expect(bad, `Referências inválidas em ${where}`).toEqual([]);
}

test('dicionário: ids únicos, “veja também” existentes e referências válidas', () => {
  const dict = json<DictionaryEntry[]>('dicionario.json');
  const ids = new Set(dict.map((e) => e.id));
  expect(ids.size, 'ids repetidos').toBe(dict.length);
  for (const e of dict) {
    for (const s of e.see ?? []) expect(ids.has(s), `${e.id} → "${s}" não existe`).toBe(true);
    expectValidRefs(e.refs ?? [], `dicionário/${e.id}`);
  }
});

test('dicionário: marca a palavra uma vez por capítulo e prefere a expressão mais longa', () => {
  const m = new DictionaryMatcher(json<DictionaryEntry[]>('dicionario.json'));
  const seen = new Set<string>();
  const a = m.split('E todos ficaram cheios do Espírito Santo, e o Espírito lhes concedia', seen);
  expect(a.filter((p) => p.entry).map((p) => [p.text, p.entry])).toEqual([
    ['Espírito Santo', 'espirito-santo'],
    ['Espírito', 'espirito'],
  ]);
  const b = m.split('o Espírito Santo desceu', seen);
  expect(b.some((p) => p.entry), 'já marcado neste capítulo').toBe(false);
  expect(b.map((p) => p.text).join('')).toBe('o Espírito Santo desceu');
  // Nomes com maiúscula só valem como escritos: "senhor" (dono) não é o nome de Deus
  expect(m.split('o senhor da casa', new Set()).some((p) => p.entry === 'senhor')).toBe(false);
});

test('introdução de todos os 66 livros com versículo-chave válido', () => {
  const intros = json<Record<string, { keyVerse: string }>>('livros.json');
  expect(Object.keys(intros).sort()).toEqual(BOOKS.map((b) => b.id).sort());
  expectValidRefs(Object.values(intros).map((i) => i.keyVerse), 'livros.json');
});

test('notas de estudo: capítulos existentes e versículos dentro do capítulo', () => {
  const notes = json<Record<string, { v: string }[]>>('notas.json');
  for (const [key, list] of Object.entries(notes)) {
    const [bookId, n] = key.split(' ');
    const book = BOOKS.find((b) => b.id === bookId);
    expect(book && Number(n) >= 1 && Number(n) <= book.chapters, `capítulo inexistente: ${key}`).toBeTruthy();
    expectValidRefs(list.map((note) => `${book!.abbrev} ${n}.${note.v}`), `notas/${key}`);
  }
});

test('memorial: grupos conhecidos, todos os reis e referências válidas', () => {
  const people = json<Person[]>('memorial.json');
  const groups = new Set(GROUPS.map((g) => g.id));
  expect(new Set(people.map((p) => p.id)).size).toBe(people.length);
  for (const p of people) {
    for (const g of p.groups) expect(groups.has(g), `${p.id}: grupo "${g}"`).toBe(true);
    expectValidRefs([...p.refs, p.keyVerse], `memorial/${p.id}`);
  }
  const count = (g: string) => people.filter((p) => p.groups.includes(g as never)).length;
  expect(count('reis-israel'), 'reis de Israel').toBe(19);
  expect(count('reis-juda'), 'reis de Judá (com Atalia)').toBe(20);
  expect(count('profetas-menores')).toBe(12);
  expect(count('profetas-maiores')).toBe(4);
  for (const g of groups) expect(count(g), `grupo vazio: ${g}`).toBeGreaterThan(0);
});

test('artigos e sermões: arquivo existe, texto formatado e referências válidas', () => {
  const files = [
    ...ARTICLES.map((a) => `artigos/${a.id}.md`),
    ...CLASSIC_SERMONS.map((s) => `sermoes/${s.id}.md`),
  ];
  for (const file of files) {
    const text = readFileSync(`public/conteudo/${file}`, 'utf8');
    expect(parseBlocks(text).length, `${file} vazio`).toBeGreaterThan(3);
    expectValidRefs(refsIn(text), file);
  }
  expectValidRefs(CLASSIC_SERMONS.map((s) => s.text), 'textos dos sermões');
  // Nenhum arquivo esquecido sem estar no índice
  expect(readdirSync('public/conteudo/artigos').sort()).toEqual(ARTICLES.map((a) => `${a.id}.md`).sort());
  expect(readdirSync('public/conteudo/sermoes').sort()).toEqual(CLASSIC_SERMONS.map((s) => `${s.id}.md`).sort());
});

test('texto formatado: linha do tempo, nota e referências', () => {
  const blocks = parseBlocks('## Título\n\nTexto com [[Jo 3.16]] e **negrito**.\n\n:::tempo\n- 722 a.C. | Queda | Samaria [[2Rs 17.6]]\n:::\n\n:::nota\nLembrete\n:::');
  expect(blocks.map((b) => b.type)).toEqual(['h2', 'p', 'timeline', 'note']);
  expect(blocks[1].inlines!.map((i) => i.t)).toEqual(['text', 'ref', 'text', 'b', 'text']);
  expect(blocks[2].events![0]).toMatchObject({ date: '722 a.C.', title: 'Queda' });
});

test('profecias: referências válidas, estudos existentes e interpretações quando debatida', () => {
  const list = json<{ id: string; ref: string; status: string; fulfillment: { ref: string }[]; views?: unknown[]; article?: string }[]>('profecias.json');
  expect(new Set(list.map((p) => p.id)).size).toBe(list.length);
  for (const p of list) {
    expectValidRefs([p.ref, ...p.fulfillment.map((f) => f.ref)], `profecias/${p.id}`);
    if (p.article) expect(ARTICLES.some((a) => a.id === p.article), `${p.id}: estudo ${p.article}`).toBe(true);
    if (p.status === 'debatida') expect(p.views?.length ?? 0, `${p.id}: debatida sem interpretações`).toBeGreaterThan(1);
  }
});

test('citações do AT no NT: referências válidas e tipo conhecido', () => {
  const list = json<{ nt: string; ot: string; type: string }[]>('citacoes.json');
  for (const q of list) {
    expectValidRefs([q.nt, q.ot], `citações ${q.nt}`);
    expect(['citacao', 'alusao', 'tema']).toContain(q.type);
  }
});

test('dicionário: sentidos e conjugações com versículos válidos', () => {
  const dict = json<DictionaryEntry[]>('dicionario.json');
  for (const e of dict) {
    expectValidRefs([...(e.senses ?? []).flatMap((s) => s.refs), ...(e.inflections ?? []).map((f) => f.ref)], `dicionário/${e.id}`);
  }
  expect(dict.filter((e) => e.kind === 'verbo').length).toBeGreaterThanOrEqual(10);
});

test('genealogia, relações e mapas apontam para personagens e mapas que existem', () => {
  const people = new Set(json<Person[]>('memorial.json').map((p) => p.id));
  const persons = GENEALOGY.flatMap((s) => [...(s.nodes ?? []), ...(s.mt ?? []), ...(s.lk ?? [])]).flatMap((n) => [
    n.person, n.mother?.person, ...(n.contemporaries ?? []).map((c) => c.person),
  ]).filter((x): x is string => !!x);
  const branches = GENEALOGY.flatMap((s) => s.branches?.items ?? []).map((i) => i.person).filter((x): x is string => !!x);
  expect([...persons, ...branches].filter((id) => !people.has(id)), 'pessoas da genealogia sem página').toEqual([]);
  for (const s of GENEALOGY) expectValidRefs([s.refs, ...[...(s.nodes ?? []), ...(s.mt ?? []), ...(s.lk ?? [])].map((n) => n.ref).filter((r): r is string => !!r)], `genealogia/${s.id}`);
  // Mateus: 14 gerações de Abraão a Davi (sem contar os reis omitidos depois)
  expect(GENEALOGY.find((s) => s.id === 'abraao-davi')!.nodes!.length).toBe(14);
  for (const id of people) {
    expect(relatedPeople(id).filter((r) => !people.has(r)), `relações de ${id}`).toEqual([]);
    expect(mapsOfPerson(id).filter((m) => !findMap(m)), `mapas de ${id}`).toEqual([]);
    expect(articlesOfPerson(id).filter((a) => !ARTICLES.some((x) => x.id === a)), `estudos de ${id}`).toEqual([]);
  }
  for (const era of ERAS) {
    expect(era.maps.filter((m) => !findMap(m)), `mapas da época ${era.id}`).toEqual([]);
    expectValidRefs(era.events.map((e) => e.ref).filter((r): r is string => !!r), `atlas/${era.id}`);
  }
  expect(ARTICLES.flatMap((a) => a.passages ?? []).filter((c) => {
    const [b, n] = c.split(' ');
    const book = BOOKS.find((x) => x.id === b);
    return !book || Number(n) < 1 || Number(n) > book.chapters;
  }), 'capítulos inexistentes nos estudos').toEqual([]);
});
