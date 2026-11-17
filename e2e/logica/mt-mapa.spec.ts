import { expect, test } from '@playwright/test';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { MT_BRANCHES } from '../../src/app/core/mt-church-map';
import type { MtImage } from '../../src/app/core/mt-church-map-types';
import { outline } from '../../src/app/core/rich-text-parser';

/** Largura e altura de um WebP (VP8, VP8L ou VP8X), sem biblioteca. */
function webpSize(file: string): { w: number; h: number } | null {
  const b = readFileSync(file);
  if (b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WEBP') return null;
  const kind = b.toString('ascii', 12, 16);
  if (kind === 'VP8X') return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
  if (kind === 'VP8L') {
    const bits = b.readUInt32LE(21);
    return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (kind === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
  return null;
}

const places = MT_BRANCHES.flatMap((b) => b.places.map((p) => ({ b, p })));
const images = places.flatMap(({ p }) => [p.flag, p.photo, p.epoch, ...p.people.map((q) => q.photo)].filter((i): i is MtImage => !!i).map((i) => ({ place: p.id, img: i })));

test('mapa mental de MT: ramos e lugares têm identificador único e todos os campos do painel preenchidos', () => {
  const problems: string[] = [];
  const ids = new Set<string>();
  expect(MT_BRANCHES.length).toBeGreaterThanOrEqual(6);
  for (const b of MT_BRANCHES) {
    if (!/^#[0-9a-f]{6}$/i.test(b.color)) problems.push(`ramo ${b.id}: cor ${b.color}`);
    if (!b.places.length) problems.push(`ramo ${b.id}: sem lugares`);
    if (!b.hint || !b.name || !b.icon) problems.push(`ramo ${b.id}: faltam nome, ícone ou frase`);
  }
  for (const { b, p } of places) {
    if (ids.has(p.id)) problems.push(`lugar repetido: ${p.id}`);
    ids.add(p.id);
    for (const campo of ['name', 'place', 'placeSource', 'benefit', 'missing', 'sources'] as const) if (!p[campo]?.trim()) problems.push(`${b.id}/${p.id}: ${campo} vazio`);
    if (!p.flag && !p.icon) problems.push(`${p.id}: sem bandeira e sem ícone`);
    for (const f of p.facts) if (!f.year.trim() || !f.text.trim()) problems.push(`${p.id}: fato incompleto`);
    const names = p.people.map((q) => q.name);
    if (new Set(names).size !== names.length) problems.push(`${p.id}: pessoa repetida`);
    for (const q of p.people) if (!q.name.trim() || !q.role.trim()) problems.push(`${p.id}: pessoa sem nome ou função`);
  }
  expect(problems).toEqual([]);
});

test('mapa mental de MT: toda foto e bandeira existe, tem legenda e crédito, e o tamanho declarado é o do arquivo', () => {
  const problems: string[] = [];
  let total = 0;
  for (const { place, img } of images) {
    const file = `public/conteudo/${img.src}`;
    if (!existsSync(file)) { problems.push(`${place}: ${img.src} não existe`); continue; }
    const bytes = statSync(file).size;
    total += bytes;
    if (bytes > 190_000) problems.push(`${place}: ${img.src} pesa ${Math.round(bytes / 1000)} kB (máximo 190 kB)`);
    if (!img.alt.trim() || !img.caption.trim()) problems.push(`${place}: ${img.src} sem texto alternativo ou legenda`);
    if (!img.credit.trim()) problems.push(`${place}: ${img.src} sem crédito`);
    const size = img.src.endsWith('.webp') ? webpSize(file) : null;
    if (!size) problems.push(`${place}: ${img.src} não é um WebP legível`);
    else if (size.w !== img.w || size.h !== img.h) problems.push(`${place}: ${img.src} tem ${size.w}×${size.h}, mas o dado diz ${img.w}×${img.h}`);
  }
  // Tudo junto, o mapa não pode pesar demais na primeira abertura de cada cidade
  expect(total, 'peso de todas as imagens do mapa').toBeLessThan(6_000_000);
  expect(problems).toEqual([]);
});

test('mapa mental de MT: cada imagem tem crédito em CREDITOS.md', () => {
  const doc = readFileSync('CREDITOS.md', 'utf8');
  const sem = [...new Set(images.map(({ img }) => img.src.split('/').pop()!))].filter((nome) => !doc.includes(nome));
  expect(sem, 'arquivos que faltam em CREDITOS.md').toEqual([]);
});

test('mapa mental de MT: o botão “ler a história completa” leva a um capítulo que existe no texto', () => {
  const titles = new Set(outline(readFileSync('public/conteudo/ad-estados/mt.md', 'utf8')).map((o) => o.text));
  const sem = places.filter(({ p }) => p.chapter && !titles.has(p.chapter)).map(({ p }) => `${p.id}: capítulo “${p.chapter}” não existe no texto`);
  expect(sem).toEqual([]);
});

test('mapa mental de MT: foto de pessoa só entra com licença aberta ou com a autorização de quem aparece', () => {
  const sem = places.flatMap(({ p }) => p.people.filter((q) => q.photo && !/autoriza|CC BY|CC0|domínio público|Public domain/i.test(q.photo.credit)).map((q) => `${p.id}: ${q.name}`));
  expect(sem).toEqual([]);
});
