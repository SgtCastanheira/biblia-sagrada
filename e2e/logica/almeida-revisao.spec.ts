import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { BOOKS } from '../../src/app/core/books';

/**
 * Revisão da Almeida embutida (17/11/2026). A fonte digital trazia letras trocadas, tils e acentos perdidos ("nao", "irmao",
 * "ceus"), pedaços de outros versículos colados e versículos cortados. As correções estão em tools/gerar-almeida.py
 * (WORD_FIXES, VERSE_FIXES e VERSE_FILLS) e se aplicam aos arquivos com tools/corrigir-almeida.py. Estes testes guardam o
 * resultado: a estrutura da Bíblia não mudou, nenhum versículo ficou vazio e o que foi corrigido não volta.
 */

/** Capítulos da Almeida embutida, como o leitor os vê. */
function almeida(bookId: string): [number, string][][] {
  return JSON.parse(readFileSync(resolve('public/bible/almeida', `${bookId}.json`), 'utf8'));
}

const verse = (bookId: string, chapter: number, number: number): string => {
  const row = almeida(bookId)[chapter - 1].find(([n]) => n === number);
  if (!row) throw new Error(`${bookId} ${chapter}.${number} não existe`);
  return row[1];
};

test('Almeida embutida: 1.189 capítulos, 31.098 versículos e nenhum sem texto', () => {
  // A revisão corrigiu texto, nunca juntou nem partiu versículo: se este número mudar, foi de propósito.
  // (Ez 8.18 vinha vazio da fonte e foi completado: VERSE_FILLS em tools/gerar-almeida.py.)
  const empty: string[] = [];
  let verses = 0;
  let chapters = 0;
  for (const book of BOOKS) {
    for (const [i, chapter] of almeida(book.id).entries()) {
      chapters++;
      for (const [number, text] of chapter) {
        verses++;
        if (!text.trim()) empty.push(`${book.id} ${i + 1}.${number}`);
      }
    }
  }
  expect(chapters).toBe(1189);
  expect(verses).toBe(31098);
  expect(empty).toEqual([]);
});

test('Almeida embutida: sem as palavras com erro de leitura já corrigidas e sem fragmentos soltos', () => {
  // "nao", "irmao", "ceus", "es" (por "os"), "Â" (por "À") e as outras só existem aqui por erro da fonte.
  const bad = /(?<![\p{L}-])(nao|irmao|irmaos|maos|ceus|mae|coraçao|ressurreiçao|tambem|sera|es|ha|ate|juizo|jerusalem|moises|entao|Entao|Nao|Â|Âs|Âquele)(?![\p{L}-])/u;
  // Pedaço de outro versículo colado no fim ("... ordenança. rifício até o terceiro") ou número de versículo dentro do texto.
  const stray = /\.\s+[a-z]{1,2}$|\ble\d+$|\s10Também/u;
  const found: string[] = [];
  for (const book of BOOKS) {
    for (const [i, chapter] of almeida(book.id).entries()) {
      for (const [number, text] of chapter) {
        if (bad.test(text) || stray.test(text)) found.push(`${book.id} ${i + 1}.${number}`);
      }
    }
  }
  expect(found).toEqual([]);
});

test('Almeida embutida: versículos que estavam corrompidos agora se leem inteiros', () => {
  // Nm 11.27 estava misturado com Nm 11.28 ("etenho dado os levitas a Arão e a Eldade e Medade profetizaram").
  expect(verse('NUM', 11, 27)).toBe('Correu, pois, um moço, e o anunciou a Moisés, dizendo: Eldade e Medade profetizam no arraial.');
  // Ez 8.18 vinha vazio; completado pela Almeida de 1911, na ortografia de hoje.
  expect(verse('EZK', 8, 18)).toContain('o meu olho não poupará, nem me apiedarei');
  expect(verse('EXO', 13, 21)).toContain('de dia numa coluna de nuvem para os guiar');
  expect(verse('EXO', 17, 6)).toContain('dela sairá água para que o povo possa beber');
  expect(verse('MAT', 7, 23)).toContain('Então lhes direi claramente: Nunca vos conheci');
  expect(verse('MAT', 13, 38)).toBe('o campo é o mundo; a boa semente são os filhos do reino; o joio são os filhos do maligno;');
  expect(verse('PHP', 3, 10)).toContain('e o poder da sua ressurreição e a participação dos seus sofrimentos');
  expect(verse('JHN', 12, 25)).toContain('quem neste mundo odeia a sua vida, guardá-la-á para a vida eterna');
  // A palavra antiga que o dicionário de hoje não tem é da própria Almeida e continua como está.
  expect(verse('MRK', 1, 7)).toContain('desatar a correia das alparcas');
});
