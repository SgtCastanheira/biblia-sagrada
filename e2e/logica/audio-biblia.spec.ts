import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { textKey } from '../../src/app/core/audio-text';
import {
  BIBLE_AUDIO_COVERAGE_FILE,
  bibleAudioUrl,
  chapterAudioFile,
  chapterIntro,
  coverageFromFiles,
  expandBookSelection,
  hasChapterAudio,
  matchChapter,
  parseChapterSelection,
  toRanges,
} from '../../src/app/core/bible-audio';
import { BOOKS } from '../../src/app/core/books';

const ALL = BOOKS.map((b) => b.id);

test('Bíblia gravada: um MP3 e um json por capítulo, e a lista dos gravados, numa pasta própria', () => {
  expect(chapterAudioFile('JHN', 3, 'mp3')).toBe('biblia/almeida/JHN-3.mp3');
  expect(chapterAudioFile('1CO', 13, 'json')).toBe('biblia/almeida/1CO-13.json');
  expect(BIBLE_AUDIO_COVERAGE_FILE).toBe('biblia/almeida/cobertura.json');
  expect(chapterIntro('João', 3)).toBe('João, capítulo 3');
});

test('Bíblia gravada: o endereço serve para a pasta do app e para um armazém de fora', () => {
  const page = 'https://sgtcastanheira.github.io/biblia-sagrada/ler/JHN/3';
  // Padrão: relativo à página do app
  expect(bibleAudioUrl('biblia/almeida/JHN-3.mp3', 'https://sgtcastanheira.github.io/biblia-sagrada/')).toBe('https://sgtcastanheira.github.io/biblia-sagrada/audio/biblia/almeida/JHN-3.mp3');
  // Armazém de fora (endereço absoluto terminado em "/")
  expect(bibleAudioUrl('biblia/almeida/JHN-3.mp3', page, 'https://audio.exemplo.org/')).toBe('https://audio.exemplo.org/biblia/almeida/JHN-3.mp3');
});

test('Bíblia gravada: intervalos e cobertura', () => {
  expect(toRanges([3, 1, 2, 7, 2, 9, 8])).toEqual([[1, 3], [7, 9]]);
  expect(toRanges([])).toEqual([]);
  const coverage = coverageFromFiles(['PSA-23.json', 'PSA-24.json', 'JHN-1.json', 'JHN-2.json', 'JHN-4.json', '1CO-13.json', 'cobertura.json', 'JHN-1.mp3', 'x.json'], 'Leonardo');
  expect(coverage).toEqual({ voice: 'Leonardo', books: { '1CO': [[13, 13]], JHN: [[1, 2], [4, 4]], PSA: [[23, 24]] } });
  expect(hasChapterAudio(coverage, 'JHN', 2)).toBe(true);
  expect(hasChapterAudio(coverage, 'JHN', 3)).toBe(false);
  expect(hasChapterAudio(coverage, 'GEN', 1)).toBe(false);
  // Sem cobertura (sem internet, ou nada gravado): nunca há áudio
  expect(hasChapterAudio(null, 'JHN', 1)).toBe(false);
  expect(hasChapterAudio({ voice: '', books: {} }, 'JHN', 1)).toBe(false);
});

test('Bíblia gravada: só casa com a tela se todos os trechos forem os gravados, na mesma ordem', () => {
  const texts = ['Salmos, capítulo 117', 'Louvai ao Senhor, todas as nações.', 'Porque a sua misericórdia é grande para conosco.'];
  const entry = { items: texts.map((t, i) => ({ t: i * 2.5, k: textKey(t) })) };
  expect(matchChapter(entry, texts)).toEqual([0, 2.5, 5]);
  // Acento, pontuação e maiúsculas não contam (é o que o textKey ignora)
  expect(matchChapter(entry, ['salmos capitulo 117', 'LOUVAI ao Senhor todas as nacoes!!', texts[2]])).toEqual([0, 2.5, 5]);
  // Uma palavra trocada depois da gravação (texto corrigido), um versículo a mais, um a menos ou fora de ordem: nada de áudio
  // (a voz do aparelho lê o que está escrito)
  expect(matchChapter(entry, [texts[0], 'Louvai o Senhor, todas as nações.', texts[2]])).toBeNull();
  expect(matchChapter(entry, texts.slice(0, 2))).toBeNull();
  expect(matchChapter(entry, [...texts, 'Aleluia.'])).toBeNull();
  expect(matchChapter(entry, [texts[0], texts[2], texts[1]])).toBeNull();
  expect(matchChapter(entry, [])).toBeNull();
});

test('Bíblia gravada: --livros e --capitulos do gerador', () => {
  expect(expandBookSelection('JHN,PSA', ALL)).toEqual(['JHN', 'PSA']);
  expect(expandBookSelection('jhn, psa, JHN', ALL)).toEqual(['JHN', 'PSA']);
  expect(expandBookSelection('EVANGELHOS', ALL)).toEqual(['MAT', 'MRK', 'LUK', 'JHN']);
  // As fases do plano somam a Bíblia toda, sem repetir nem faltar livro
  const phases = ['FASE-A', 'FASE-B', 'FASE-C'].flatMap((f) => expandBookSelection(f, ALL));
  expect(phases.length).toBe(66);
  expect(new Set(phases).size).toBe(66);
  expect(expandBookSelection('NT', ALL).length).toBe(27);
  expect(expandBookSelection('AT', ALL).length).toBe(39);
  expect(expandBookSelection('FASE-A', ALL)).toEqual(['MAT', 'MRK', 'LUK', 'JHN', 'PSA', 'PRO']);
  expect(expandBookSelection('FASE-B', ALL)[0]).toBe('ACT');
  expect(() => expandBookSelection('XXX', ALL)).toThrow(/XXX/);
  expect(parseChapterSelection('23')).toEqual([23]);
  expect(parseChapterSelection('1-3,7')).toEqual([1, 2, 3, 7]);
  expect(() => parseChapterSelection('a')).toThrow();
});

/** Capítulos da Almeida embutida, como o gerador e o leitor os veem. */
function almeida(bookId: string): [number, string][][] {
  return JSON.parse(readFileSync(resolve('public/bible/almeida', `${bookId}.json`), 'utf8'));
}

test('Bíblia gravada: todo versículo da Almeida tem texto para ler', () => {
  // O leitor pula o versículo sem texto, e o gerador também; este teste avisa se aparecer um vazio sem querer.
  // (Ez 8.18 vinha vazio da fonte e foi completado em 17/11/2026: VERSE_FILLS em tools/gerar-almeida.py.)
  const empty: string[] = [];
  let verses = 0;
  let chapters = 0;
  for (const book of BOOKS) {
    for (const [i, chapter] of almeida(book.id).entries()) {
      chapters++;
      for (const [verse, text] of chapter) {
        verses++;
        if (!text.trim()) empty.push(`${book.id} ${i + 1}.${verse}`);
      }
    }
  }
  expect(chapters).toBe(1189);
  expect(verses).toBeGreaterThan(31000);
  expect(empty).toEqual([]);
});

/**
 * A fonte digital da Almeida trazia letras trocadas, tils e acentos perdidos ("nao", "irmao", "ceus") e pedaços de outros
 * versículos. A varredura de 17/11/2026 corrigiu o que tinha correção certa (WORD_FIXES e VERSE_FIXES em
 * tools/gerar-almeida.py). Este teste impede que voltem as palavras que só existem por erro de leitura da fonte
 * (a voz gravada leria "nao" e "ceus" do jeito errado, e a gravação não se refaz de graça).
 */
test('Almeida embutida: sem as palavras com erro de leitura já corrigidas e sem fragmentos soltos', () => {
  const bad = /(?<![\p{L}-])(nao|irmao|irmaos|maos|ceus|mae|coraçao|ressurreiçao|tambem|sera|es|ha|ate|juizo|jerusalem|moises|entao|Entao|Nao|Â|Âs|Âquele)(?![\p{L}-])/u;
  const stray = /\.\s+[a-z]{1,2}$|\ble\d+$|\s10Também/u;
  const found: string[] = [];
  for (const book of BOOKS) {
    for (const [i, chapter] of almeida(book.id).entries()) {
      for (const [verse, text] of chapter) {
        if (bad.test(text) || stray.test(text)) found.push(`${book.id} ${i + 1}.${verse}`);
      }
    }
  }
  expect(found).toEqual([]);
});

// ---- MP3: limpar as etiquetas e medir a duração (tools/mp3.mjs) ----
const mp3Url = pathToFileURL(resolve('tools/mp3.mjs')).href;
const loadMp3 = () => import(mp3Url) as Promise<{ mp3Seconds: (b: Buffer) => number; stripMp3Tags: (b: Buffer) => Buffer }>;

/** Um quadro MPEG 1 camada III, 128 kbit/s, 44,1 kHz, mono: 417 bytes de silêncio. */
const frame = () => Buffer.concat([Buffer.from([0xff, 0xfb, 0x90, 0xc4]), Buffer.alloc(413)]);
/** O quadro "Info" que muitos codificadores põem no começo: um quadro de silêncio com metadados depois das informações laterais (17 bytes, mono). */
const infoFrame = () => {
  const f = frame();
  f.write('Info', 4 + 17, 'latin1');
  return f;
};
/** Etiqueta ID3v2.4 de `size` bytes de dados (o tamanho vai em 4 bytes de 7 bits). */
const id3v2 = (size: number) => Buffer.concat([Buffer.from([0x49, 0x44, 0x33, 4, 0, 0, (size >> 21) & 0x7f, (size >> 14) & 0x7f, (size >> 7) & 0x7f, size & 0x7f]), Buffer.alloc(size, 0x20)]);

test('MP3: tira a etiqueta ID3, o quadro Info e a etiqueta do fim, sem perder som', async () => {
  const { mp3Seconds, stripMp3Tags } = await loadMp3();
  const sound = Buffer.concat(Array.from({ length: 100 }, frame));
  const raw = Buffer.concat([id3v2(17160), infoFrame(), sound, Buffer.from('TAG'), Buffer.alloc(125)]);
  const clean = stripMp3Tags(raw);
  expect(clean.length).toBe(sound.length);
  expect(clean.equals(sound)).toBe(true);
  // 100 quadros de 1152 amostras a 44,1 kHz
  expect(mp3Seconds(clean)).toBeCloseTo((100 * 1152) / 44100, 6);
  // Idempotente, e um MP3 já limpo volta igual
  expect(stripMp3Tags(clean).equals(clean)).toBe(true);
  // Um quadro normal no começo (sem "Info") não é cortado
  expect(stripMp3Tags(sound).length).toBe(sound.length);
});

test('MP3: colar vários trechos já limpos dá a soma das durações (é o que o app usa para destacar o versículo)', async () => {
  const { mp3Seconds, stripMp3Tags } = await loadMp3();
  const part = () => Buffer.concat([id3v2(17160), infoFrame(), ...Array.from({ length: 40 }, frame)]);
  const parts = [part(), part(), part()].map(stripMp3Tags);
  const one = mp3Seconds(parts[0]);
  expect(mp3Seconds(Buffer.concat(parts))).toBeCloseTo(one * 3, 6);
  // Sem a limpeza, cada etiqueta de 17 KB iria junto para o arquivo
  expect(Buffer.concat([part(), part(), part()]).length - Buffer.concat(parts).length).toBeGreaterThan(3 * 17000);
});
