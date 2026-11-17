import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { findBook } from '../../src/app/core/books';
import { COMBINED, PARASHOT, parashaOfVerse, parashaRange, parashotOf, TORAH_BOOKS, type TorahBookId } from '../../src/app/core/torah';

/** Versículos de cada capítulo na Almeida embutida. */
const counts = (id: string): number[] => (JSON.parse(readFileSync(`public/bible/almeida/${id}.json`, 'utf8')) as unknown[][]).map((c) => c.length);

test('Torá: 5 livros e 54 porções, na ordem, com a quantidade tradicional por livro', () => {
  expect(TORAH_BOOKS.map((b) => b.id)).toEqual(['GEN', 'EXO', 'LEV', 'NUM', 'DEU']);
  expect(PARASHOT).toHaveLength(54);
  PARASHOT.forEach((p, i) => expect(p.n).toBe(i + 1));
  const perBook = Object.fromEntries(TORAH_BOOKS.map((b) => [b.id, parashotOf(b.id).length]));
  expect(perBook).toEqual({ GEN: 12, EXO: 11, LEV: 10, NUM: 10, DEU: 11 });
  // nomes únicos, com texto hebraico e sentido
  expect(new Set(PARASHOT.map((p) => p.name)).size).toBe(54);
  for (const p of PARASHOT) {
    expect(p.he, p.name).toMatch(/[֐-׿]/);
    expect(p.meaning.length, p.name).toBeGreaterThanOrEqual(2);
    expect(p.summary.length, p.name).toBeGreaterThan(30);
  }
  for (const b of TORAH_BOOKS) expect(b.he).toMatch(/[֐-׿]/);
});

test('Torá: as porções se emendam sem buracos nem repetição e cobrem os cinco livros inteiros', () => {
  for (const book of TORAH_BOOKS) {
    const info = findBook(book.id)!;
    const verses = counts(book.id);
    const list = parashotOf(book.id);
    expect(list[0].from, `${book.pt}: começo`).toEqual([1, 1]);
    const last = list[list.length - 1];
    expect(last.to[0], `${book.pt}: último capítulo`).toBe(info.chapters);
    // a Almeida embutida pode ter um versículo a menos em alguns capítulos (veja CLAUDE.md), nunca a mais
    expect(last.to[1]).toBeGreaterThanOrEqual(verses[info.chapters - 1]);
    expect(last.to[1]).toBeLessThanOrEqual(verses[info.chapters - 1] + 1);

    for (let i = 0; i < list.length; i++) {
      const p = list[i];
      expect(p.from[0] * 1000 + p.from[1], `${p.name}: começa antes de acabar`).toBeLessThanOrEqual(p.to[0] * 1000 + p.to[1]);
      const next = list[i + 1];
      if (!next) continue;
      if (next.from[0] === p.to[0]) {
        expect(next.from[1], `${p.name} → ${next.name}`).toBe(p.to[1] + 1);
      } else {
        expect(next.from, `${p.name} → ${next.name}`).toEqual([p.to[0] + 1, 1]);
        const total = verses[p.to[0] - 1];
        expect(p.to[1], `${p.name}: último versículo de ${p.to[0]}`).toBeGreaterThanOrEqual(total);
        expect(p.to[1], `${p.name}: último versículo de ${p.to[0]}`).toBeLessThanOrEqual(total + 1);
      }
    }
  }
});

test('Torá: onde a numeração hebraica difere da nossa, os limites estão na nossa (Almeida), no mesmo lugar do texto', () => {
  const by = (name: string) => PARASHOT.find((p) => p.name === name)!;
  // Gn 31.55 da Almeida é o 32.1 do hebraico: Vayishlach começa no 32.4 hebraico = 32.3 nosso
  expect(by('Vayetzei').to).toEqual([32, 2]);
  expect(by('Vayishlach').from).toEqual([32, 3]);
  // Êxodo 20 tem 26 versículos na Almeida e 23 no hebraico
  expect(by('Yitro').to).toEqual([20, 26]);
  // Lv 5.20 da Almeida é o 6.1 do hebraico
  expect(by('Vayikra').to).toEqual([6, 7]);
  expect(by('Tzav').from).toEqual([6, 8]);
  // Nm 30.1 é o 29.40 do hebraico (para os dois lados)
  expect(by('Pinchas').to).toEqual([29, 40]);
  expect(by('Matot').from).toEqual([30, 1]);
  // Dt 29.1 é o 28.69 do hebraico
  expect(by('Ki Tavo').to).toEqual([29, 9]);
  expect(by('Nitzavim').from).toEqual([29, 10]);
  // nos demais, os números são os mesmos nas duas Bíblias
  expect(by('Bereshit').to).toEqual([6, 8]);
  expect(by('Noach').from).toEqual([6, 9]);
  expect(by('Haazinu').to).toEqual([32, 52]);
  expect(by('Vezot Haberachah').from).toEqual([33, 1]);
});

test('Torá: sete pares lidos juntos em alguns anos, e o texto da porção', () => {
  expect(COMBINED).toEqual([
    ['Vayakhel', 'Pekudei'],
    ['Tazria', 'Metzora'],
    ['Acharei Mot', 'Kedoshim'],
    ['Behar', 'Bechukotai'],
    ['Chukat', 'Balak'],
    ['Matot', 'Masei'],
    ['Nitzavim', 'Vayelech'],
  ]);
  expect(parashaRange(PARASHOT[0], 'Gn')).toBe('Gn 1.1 – 6.8');
  expect(parashaRange(PARASHOT.find((p) => p.name === 'Vayelech')!, 'Dt')).toBe('Dt 31.1-30');
});

test('Torá: achar a porção de um versículo', () => {
  expect(parashaOfVerse('GEN', 1, 1)?.name).toBe('Bereshit');
  expect(parashaOfVerse('GEN', 12, 1)?.name).toBe('Lech Lecha');
  expect(parashaOfVerse('EXO', 20, 3)?.name).toBe('Yitro');
  expect(parashaOfVerse('LEV', 19, 18)?.name).toBe('Kedoshim');
  expect(parashaOfVerse('NUM', 6, 24)?.name).toBe('Nasso');
  expect(parashaOfVerse('DEU', 6, 4)?.name).toBe('Vaetchanan');
  expect(parashaOfVerse('DEU', 34, 12)?.name).toBe('Vezot Haberachah');
  expect(parashaOfVerse('JOS', 1, 1)).toBeNull();
  // todo versículo da Torá está em exatamente uma porção
  for (const b of TORAH_BOOKS) {
    const v = counts(b.id);
    v.forEach((n, i) => {
      for (let verse = 1; verse <= n; verse++) {
        const hits = PARASHOT.filter((p) => p.book === (b.id as TorahBookId) && p.from[0] * 1000 + p.from[1] <= (i + 1) * 1000 + verse && (i + 1) * 1000 + verse <= p.to[0] * 1000 + p.to[1]);
        if (hits.length !== 1) throw new Error(`${b.id} ${i + 1}.${verse} está em ${hits.length} porções`);
      }
    });
  }
});
