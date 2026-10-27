import { findBook } from './books';
import { parseBlocks, type Inline } from './rich-text-parser';

/**
 * "Você lembra o que leu?": perguntas de múltipla escolha (A, B, C e D) geradas do próprio texto, sem internet.
 * Código puro (sem Angular): o serviço só busca os textos; aqui ficam as regras, para testar em todos os capítulos.
 */

export type QuizKind = 'completar' | 'nome' | 'frase' | 'livro' | 'historia';

export interface QuizQuestion {
  id: string;
  kind: QuizKind;
  /** De onde veio a pergunta: o capítulo, o livro todo ou a história. */
  source: 'capitulo' | 'livro' | 'historia';
  text: string;
  /** Sempre quatro alternativas, já embaralhadas. */
  options: string[];
  /** Índice da alternativa certa (0 = A). */
  answer: number;
  /** Frase mostrada depois de responder. */
  explain: string;
  /** Referência bíblica para o botão "Ver no texto" (ex.: "EXO 3.2"). */
  ref?: { bookId: string; chapter: number; verse: number };
  /** História de onde saiu a pergunta (para o botão "Ler a história"). */
  article?: string;
}

export interface VerseText {
  verse: number;
  text: string;
}

export interface ChapterSource {
  bookId: string;
  chapter: number;
  verses: VerseText[];
}

export interface BookIntroLite {
  author?: string;
  date?: string;
  audience?: string;
}

// ---------- aleatório com semente: o mesmo jogo pode ser repetido, e "jogar de novo" muda a semente ----------

export type Rng = () => number;

export function makeRng(seed: string): Rng {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(list: readonly T[], rng: Rng): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const pick = <T>(list: readonly T[], rng: Rng): T => list[Math.floor(rng() * list.length)];

// ---------- palavras ----------

const WORD = /[\p{L}][\p{L}'’-]*/gu;

/** Palavras muito comuns, que não servem de resposta nem de pegadinha. */
const STOP = new Set(
  `que para com por uma uns umas dos das nos nas aos como mas não nem seu sua seus suas ele ela eles elas isto isso aquilo este esta estes estas esse essa esses essas aquele aquela mais muito todo toda todos todas quando onde porque pois assim então ainda também entre sobre sido está estão será serão tendo havia haver tinha tinham fosse foram foi era eram ser são sou estou tem têm temos teu tua teus tuas meu minha meus minhas nosso nossa vosso vossa vós nós eu tu lhe lhes nele nela deles delas desta deste disso nisso depois antes até sem sob cada outro outra outros outras qual quais quem quer disse dizendo diz dizer disseram fez fazer feito faz vos vosso vos tudo nada algum alguma alguns algumas mesmo mesma já só sim aqui ali lá hoje ontem sempre nunca`.split(/\s+/),
);

/** Nomes que aparecem em quase todo capítulo: seriam resposta fácil ou pegadinha injusta. */
const TOO_COMMON_NAMES = new Set(['Senhor', 'Deus', 'Jesus', 'Cristo', 'Espírito', 'Santo', 'Pai', 'Filho', 'Eis', 'Ora', 'Porém', 'Então', 'Mas', 'Porque', 'Quando', 'Disse', 'Portanto', 'Também', 'Todavia', 'Contudo']);

interface Token {
  word: string;
  index: number;
}

function tokens(text: string): Token[] {
  return [...text.matchAll(WORD)].map((m) => ({ word: m[0].replace(/^['’-]+|['’-]+$/g, ''), index: m.index! }));
}

const isCapital = (w: string) => /^\p{Lu}/u.test(w);
const fold = (w: string) => w.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Nomes próprios de um texto: palavras com inicial maiúscula que não abrem uma frase. */
function namesIn(text: string): string[] {
  const out: string[] = [];
  const toks = tokens(text);
  for (let i = 0; i < toks.length; i++) {
    const { word, index } = toks[i];
    if (word.length < 3 || !isCapital(word) || TOO_COMMON_NAMES.has(word)) continue;
    const before = text.slice(0, index).trimEnd();
    const startsSentence = i === 0 || /[.!?:;]$/.test(before) || before === '';
    if (startsSentence) continue;
    out.push(word);
  }
  return out;
}

/** Palavras de conteúdo (verbos e substantivos compridos), para quando o versículo não tem nome próprio. */
function contentWords(text: string): Token[] {
  return tokens(text).filter((t, i) => i > 0 && t.word.length >= 6 && !STOP.has(fold(t.word)) && !isCapital(t.word));
}

const clean = (t: string) => t.replace(/\s+/g, ' ').trim();

function cut(text: string, from: number, to: number, max = 170): string {
  // Mostra uma janela do versículo em volta da lacuna, sem passar do tamanho
  let start = 0;
  let end = text.length;
  if (text.length > max) {
    start = Math.max(0, from - Math.floor(max / 2));
    end = Math.min(text.length, start + max);
    start = Math.max(0, end - max);
    const space = text.indexOf(' ', start);
    if (start > 0 && space >= 0 && space < from) start = space + 1;
    const last = text.lastIndexOf(' ', end);
    if (end < text.length && last > to) end = last;
  }
  return `${start > 0 ? '… ' : ''}${text.slice(start, end).trim()}${end < text.length ? ' …' : ''}`;
}

// ---------- alternativas ----------

/** Escolhe 3 alternativas erradas parecidas com a certa (mesmo tipo e tamanho parecido), sem repetir. */
function distractors(answer: string, candidates: string[], avoid: Set<string>, rng: Rng, similar: (c: string) => number): string[] | null {
  const seen = new Set<string>([fold(answer), ...avoid]);
  const unique: string[] = [];
  for (const c of candidates) {
    const k = fold(c);
    if (seen.has(k)) continue;
    seen.add(k);
    unique.push(c);
  }
  if (unique.length < 3) return null;
  // As mais parecidas primeiro, com um pouco de sorte para o jogo variar
  const ranked = shuffle(unique, rng).sort((a, b) => similar(a) - similar(b));
  return ranked.slice(0, 3);
}

function build(
  base: Omit<QuizQuestion, 'options' | 'answer'>,
  correct: string,
  wrong: string[],
  rng: Rng,
): QuizQuestion {
  const options = shuffle([correct, ...wrong], rng);
  return { ...base, options, answer: options.indexOf(correct) };
}

const sameShape = (answer: string) => (c: string) => Math.abs(c.length - answer.length) + (isCapital(c) === isCapital(answer) ? 0 : 20) + (fold(c).slice(-2) === fold(answer).slice(-2) ? 0 : 4);

// ---------- perguntas do capítulo ----------

function refName(bookId: string, chapter: number): string {
  return `${findBook(bookId)?.name ?? bookId} ${chapter}`;
}

/** Palavras do livro (de outros capítulos) para servir de alternativa errada. */
function poolWords(pool: ChapterSource[], capital: boolean): string[] {
  const out: string[] = [];
  for (const c of pool) {
    for (const v of c.verses) {
      if (capital) out.push(...namesIn(v.text));
      else out.push(...contentWords(v.text).map((t) => t.word));
    }
  }
  return out;
}

/** Palavras do nome do livro: aparecem no enunciado, por isso não podem ser a resposta. */
const bookWords = (bookId: string) => new Set(tokens(findBook(bookId)?.name ?? '').map((t) => fold(t.word)));

function clozeQuestion(target: ChapterSource, verse: VerseText, pool: ChapterSource[], rng: Rng, used: Set<string>): QuizQuestion | null {
  const text = clean(verse.text);
  const toks = tokens(text);
  const names = namesIn(text);
  // Nome próprio é a melhor lacuna; se não houver, uma palavra de conteúdo
  let answerWord = names.length ? pick(names, rng) : '';
  let wrongPool: string[];
  if (answerWord) {
    wrongPool = poolWords([target, ...pool], true);
  } else {
    const words = contentWords(text);
    if (!words.length) return null;
    answerWord = pick(words, rng).word;
    wrongPool = poolWords([target, ...pool], false);
  }
  if (used.has(fold(answerWord)) || bookWords(target.bookId).has(fold(answerWord))) return null;
  const inVerse = new Set(toks.map((t) => fold(t.word)));
  const wrong = distractors(answerWord, wrongPool, inVerse, rng, sameShape(answerWord));
  if (!wrong) return null;
  const at = toks.find((t) => t.word === answerWord);
  if (!at) return null;
  const blanked = `${text.slice(0, at.index)}______${text.slice(at.index + answerWord.length)}`;
  // Se a mesma palavra aparece em outro ponto do versículo, a lacuna se entrega: pula
  if (new RegExp(`(^|[^\\p{L}])${answerWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^\\p{L}])`, 'iu').test(blanked)) return null;
  const shown = cut(blanked, at.index, at.index + 6);
  used.add(fold(answerWord));
  return build(
    {
      id: `c-${target.bookId}-${target.chapter}-${verse.verse}`,
      kind: 'completar',
      source: 'capitulo',
      text: `Em ${refName(target.bookId, target.chapter)}, complete o versículo:\n“${shown}”`,
      explain: `A palavra é “${answerWord}”, em ${refName(target.bookId, target.chapter)}.${verse.verse}.`,
      ref: { bookId: target.bookId, chapter: target.chapter, verse: verse.verse },
    },
    answerWord,
    wrong,
    rng,
  );
}

function nameQuestion(target: ChapterSource, pool: ChapterSource[], rng: Rng, used: Set<string>): QuizQuestion | null {
  const here = new Map<string, number>();
  for (const v of target.verses) for (const n of namesIn(v.text)) if (!here.has(fold(n))) here.set(fold(n), v.verse);
  const mine = [...here.keys()];
  const banned = bookWords(target.bookId);
  const candidates = namesIn(target.verses.map((v) => v.text).join(' ')).filter((n) => !used.has(fold(n)) && !banned.has(fold(n)));
  if (!candidates.length) return null;
  const answerWord = pick(candidates, rng);
  const wrongPool = poolWords(pool, true);
  const wrong = distractors(answerWord, wrongPool, new Set(mine), rng, sameShape(answerWord));
  if (!wrong) return null;
  used.add(fold(answerWord));
  const verse = here.get(fold(answerWord)) ?? 1;
  return build(
    {
      id: `n-${target.bookId}-${target.chapter}-${fold(answerWord)}`,
      kind: 'nome',
      source: 'capitulo',
      text: `Qual destes nomes aparece em ${refName(target.bookId, target.chapter)}?`,
      explain: `“${answerWord}” aparece em ${refName(target.bookId, target.chapter)}.${verse}. Os outros nomes são de outros capítulos do livro.`,
      ref: { bookId: target.bookId, chapter: target.chapter, verse },
    },
    answerWord,
    wrong,
    rng,
  );
}

function opening(text: string, words = 9): string {
  const w = clean(text).split(' ');
  return w.length <= words ? clean(text) : `${w.slice(0, words).join(' ')} …`;
}

function phraseQuestion(target: ChapterSource, pool: ChapterSource[], rng: Rng, usedVerses: Set<number>): QuizQuestion | null {
  const verses = target.verses.filter((v) => !usedVerses.has(v.verse) && clean(v.text).split(' ').length >= 7);
  if (!verses.length) return null;
  const verse = pick(verses, rng);
  const correct = opening(verse.text);
  const hereText = new Set(target.verses.map((v) => fold(opening(v.text))));
  const others = pool.flatMap((c) => c.verses.filter((v) => clean(v.text).split(' ').length >= 7).map((v) => opening(v.text)));
  const wrong = distractors(correct, others, hereText, rng, (c) => Math.abs(c.length - correct.length));
  if (!wrong) return null;
  usedVerses.add(verse.verse);
  return build(
    {
      id: `f-${target.bookId}-${target.chapter}-${verse.verse}`,
      kind: 'frase',
      source: 'capitulo',
      text: `Qual destas frases está em ${refName(target.bookId, target.chapter)}?`,
      explain: `É o começo de ${refName(target.bookId, target.chapter)}.${verse.verse}. As outras frases são de outros capítulos do livro.`,
      ref: { bookId: target.bookId, chapter: target.chapter, verse: verse.verse },
    },
    correct,
    wrong,
    rng,
  );
}

/**
 * Perguntas sobre um capítulo: completar versículos, achar um nome e reconhecer uma frase.
 * Devolve até `count` perguntas (capítulos muito curtos dão menos).
 */
export function chapterQuiz(target: ChapterSource, pool: ChapterSource[], rng: Rng, count = 5): QuizQuestion[] {
  const out: QuizQuestion[] = [];
  const used = new Set<string>();
  const usedVerses = new Set<number>();
  const verses = shuffle(target.verses.filter((v) => clean(v.text).length >= 40), rng);
  // Ordem de preferência: completar, nome, completar, frase, completar…
  const plan: ('c' | 'n' | 'f')[] = ['c', 'n', 'c', 'f', 'c', 'n', 'c', 'f', 'c', 'c'];
  let vi = 0;
  for (const step of plan) {
    if (out.length >= count) break;
    let q: QuizQuestion | null = null;
    if (step === 'n') q = nameQuestion(target, pool, rng, used);
    else if (step === 'f') q = phraseQuestion(target, pool, rng, usedVerses);
    else {
      for (; vi < verses.length && !q; vi++) {
        if (usedVerses.has(verses[vi].verse)) continue;
        q = clozeQuestion(target, verses[vi], pool, rng, used);
        if (q) usedVerses.add(verses[vi].verse);
      }
    }
    if (q) out.push(q);
  }
  return out;
}

// ---------- perguntas do livro todo ----------

const firstPart = (s: string) => clean(s.split(/\s*[;(]\s*|,\s+(?:segundo|conforme|na tradição)/)[0]).replace(/[.,]$/, '');

/** Quem escreveu, quando e para quem: perguntas gerais sobre um livro, com os outros livros como pegadinhas. */
export function bookInfoQuiz(bookId: string, intros: Record<string, BookIntroLite>, rng: Rng, count = 3): QuizQuestion[] {
  const book = findBook(bookId);
  const mine = intros[bookId];
  if (!book || !mine) return [];
  const others = Object.entries(intros).filter(([id]) => id !== bookId);
  const out: QuizQuestion[] = [];
  const make = (field: 'author' | 'date' | 'audience', text: string, label: string) => {
    const correct = mine[field] ? firstPart(mine[field]!) : '';
    if (!correct || correct.length > 90) return;
    const pool = others.map(([, i]) => (i[field] ? firstPart(i[field]!) : '')).filter((x) => x && x.length <= 90);
    const wrong = distractors(correct, pool, new Set(), rng, (c) => Math.abs(c.length - correct.length));
    if (!wrong) return;
    out.push(build({ id: `l-${bookId}-${field}`, kind: 'livro', source: 'livro', text, explain: `${label}: ${correct}.` }, correct, wrong, rng));
  };
  make('author', `Quem escreveu o livro de ${book.name}, segundo a tradição?`, 'Autor');
  make('date', `Em que época foi escrito o livro de ${book.name}?`, 'Época');
  make('audience', `Para quem foi escrito o livro de ${book.name}?`, 'Destinatários');
  // Quantos capítulos
  const near = shuffle([-3, -2, -1, 1, 2, 3, 5].map((d) => book.chapters + d).filter((n) => n >= 1 && n !== book.chapters), rng).slice(0, 3);
  if (near.length === 3) {
    out.push(build({ id: `l-${bookId}-capitulos`, kind: 'livro', source: 'livro', text: `Quantos capítulos tem o livro de ${book.name}?`, explain: `${book.name} tem ${book.chapters} ${book.chapters === 1 ? 'capítulo' : 'capítulos'}.` }, String(book.chapters), near.map(String), rng));
  }
  return shuffle(out, rng).slice(0, count);
}

// ---------- perguntas de uma história ----------

const plain = (inlines: Inline[] = []) => clean(inlines.map((i) => i.text).join(''));

/** Perguntas sobre uma história (um artigo): datas da linha do tempo, personagens, termos em destaque e envios. */
export function storyQuiz(markdown: string, articleId: string, rng: Rng, count = 5): QuizQuestion[] {
  const blocks = parseBlocks(markdown);
  const pool: QuizQuestion[] = [];

  // 1) Linha do tempo: "Quando aconteceu...?"
  const events = blocks.filter((b) => b.type === 'timeline').flatMap((b) => b.events ?? []);
  const dates = [...new Set(events.map((e) => e.date.trim()))];
  for (const e of events) {
    const correct = e.date.trim();
    const wrong = distractors(correct, dates, new Set(), rng, (c) => Math.abs(c.length - correct.length));
    if (!wrong) continue;
    const detail = plain(e.text);
    pool.push(build({ id: `h-t-${fold(e.title)}`, kind: 'historia', source: 'historia', article: articleId, text: `Quando aconteceu: ${e.title}${detail ? ` (${detail.length > 110 ? detail.slice(0, 107) + '…' : detail})` : ''}?`, explain: `${e.title}: ${correct}.` }, correct, wrong, rng));
  }

  // 2) Personagens: "Quem foi...?"
  const people = blocks.filter((b) => b.type === 'people').flatMap((b) => b.people ?? []);
  const roles = people.map((p) => p.role);
  for (const p of people) {
    const wrong = distractors(p.role, roles, new Set(), rng, (c) => Math.abs(c.length - p.role.length));
    if (!wrong) continue;
    pool.push(build({ id: `h-p-${fold(p.name)}`, kind: 'historia', source: 'historia', article: articleId, text: `Quem foi ${p.name}?`, explain: `${p.name}: ${p.role}.` }, p.role, wrong, rng));
  }

  // 3) Envios: "Quem foi de A para B?"
  const sends = blocks.filter((b) => b.type === 'sends').flatMap((b) => b.sends ?? []);
  const whos = sends.map((s) => s.who);
  for (const s of sends) {
    const wrong = distractors(s.who, whos, new Set(), rng, (c) => Math.abs(c.length - s.who.length));
    if (!wrong) continue;
    pool.push(build({ id: `h-s-${fold(s.who)}-${fold(s.to)}`, kind: 'historia', source: 'historia', article: articleId, text: `Quem foi enviado de ${s.from} para ${s.to}${s.year ? ` (${s.year})` : ''}?`, explain: `${s.who}${s.note ? `: ${s.note}` : ''}.` }, s.who, wrong, rng));
  }

  // 4) Termos em destaque: completar a frase
  const bolds: { term: string; sentence: string }[] = [];
  for (const b of blocks) {
    if (b.type !== 'p' || !b.inlines) continue;
    const full = plain(b.inlines);
    for (const part of b.inlines) {
      if (part.t !== 'b' || part.text.length < 3 || part.text.length > 28) continue;
      bolds.push({ term: part.text.trim(), sentence: full });
    }
  }
  // Anos e nomes próprios dentro dos parágrafos também viram lacunas
  const years: { year: string; sentence: string }[] = [];
  const names: { name: string; sentence: string }[] = [];
  for (const b of blocks) {
    if ((b.type !== 'p' && b.type !== 'scene') || !b.inlines) continue;
    const full = plain(b.inlines);
    for (const m of full.matchAll(/\b(1[0-9]{3}|20[0-2][0-9])\b/g)) years.push({ year: m[1], sentence: full });
    for (const n of namesIn(full)) names.push({ name: n, sentence: full });
  }
  const yearSet = [...new Set(years.map((y) => y.year))];
  for (const y of years) {
    const n = Number(y.year);
    const near = [-1, 1, -2, 2, -3, 3, -5, 5, 10, -10].map((d) => String(n + d)).filter((v) => Number(v) <= 2030);
    const wrong = distractors(y.year, [...yearSet.filter((v) => Math.abs(Number(v) - n) <= 40), ...near], new Set(), rng, (c) => Math.abs(Number(c) - n));
    if (!wrong) continue;
    const at = y.sentence.indexOf(y.year);
    const blanked = `${y.sentence.slice(0, at)}______${y.sentence.slice(at + 4)}`;
    if (blanked.includes(y.year)) continue;
    pool.push(build({ id: `h-a-${y.year}-${fold(y.sentence.slice(0, 12))}`, kind: 'historia', source: 'historia', article: articleId, text: `Em que ano? Complete a frase da história:\n“${cut(blanked, at, at + 6, 190)}”`, explain: `O ano é ${y.year}.` }, y.year, wrong, rng));
  }
  const nameSet = [...new Set(names.map((x) => x.name))];
  for (const nm of names) {
    const wrong = distractors(nm.name, nameSet, new Set(nm.sentence.split(/\s+/).map(fold)), rng, sameShape(nm.name));
    if (!wrong) continue;
    const at = nm.sentence.indexOf(nm.name);
    const blanked = `${nm.sentence.slice(0, at)}______${nm.sentence.slice(at + nm.name.length)}`;
    if (new RegExp(`(^|[^\\p{L}])${nm.name}($|[^\\p{L}])`, 'u').test(blanked)) continue;
    pool.push(build({ id: `h-n-${fold(nm.name)}-${fold(nm.sentence.slice(0, 12))}`, kind: 'historia', source: 'historia', article: articleId, text: `Quem ou onde? Complete a frase da história:\n“${cut(blanked, at, at + 6, 190)}”`, explain: `A resposta é “${nm.name}”.` }, nm.name, wrong, rng));
  }

  const terms = [...new Set(bolds.map((b) => b.term))];
  for (const b of bolds) {
    const at = b.sentence.indexOf(b.term);
    if (at < 0) continue;
    const wrong = distractors(b.term, terms, new Set(b.sentence.split(/\s+/).map(fold)), rng, sameShape(b.term));
    if (!wrong) continue;
    const blanked = `${b.sentence.slice(0, at)}______${b.sentence.slice(at + b.term.length)}`;
    pool.push(build({ id: `h-b-${fold(b.term)}`, kind: 'historia', source: 'historia', article: articleId, text: `Complete a frase da história:\n“${cut(blanked, at, at + 6, 190)}”`, explain: `A resposta é “${b.term}”.` }, b.term, wrong, rng));
  }

  // Variedade: uma de cada tipo antes de repetir
  const byKind = new Map<string, QuizQuestion[]>();
  for (const q of shuffle(pool, rng)) {
    const k = q.id.slice(0, 3);
    byKind.set(k, [...(byKind.get(k) ?? []), q]);
  }
  const out: QuizQuestion[] = [];
  const lists = shuffle([...byKind.values()], rng);
  while (out.length < count && lists.some((l) => l.length)) {
    for (const l of lists) if (l.length && out.length < count) out.push(l.shift()!);
  }
  return out;
}

/** Junta perguntas de várias fontes até o total pedido, sem repetir, e embaralha a ordem final de leve. */
export function interleave(groups: QuizQuestion[][], total: number): QuizQuestion[] {
  const out: QuizQuestion[] = [];
  const seen = new Set<string>();
  const lists = groups.map((g) => [...g]);
  while (out.length < total && lists.some((l) => l.length)) {
    for (const l of lists) {
      const q = l.shift();
      if (q && !seen.has(q.id) && out.length < total) {
        seen.add(q.id);
        out.push(q);
      }
    }
  }
  return out;
}
