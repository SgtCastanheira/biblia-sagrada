/**
 * Áudio gravado da Bíblia, um MP3 por capítulo (voz neural). Código puro, sem Angular: o app (ListenService) e a
 * ferramenta tools/gerar-audio.mjs --biblia usam as mesmas regras, e a lógica é testada em e2e/logica.
 *
 * Por capítulo há dois arquivos, `<LIVRO>-<n>.mp3` e `<LIVRO>-<n>.json` (de que segundo começa cada trecho), mais um
 * `cobertura.json` com a lista dos capítulos que já têm gravação. O app só pede o que a cobertura diz que existe,
 * então dá para gravar e publicar por etapas, e o que falta continua na voz do aparelho.
 */
import { textKey } from './audio-text';

/** Só a Almeida é gravada: as gravações são do texto dela, e as outras versões seguem com a voz do aparelho. */
export const BIBLE_AUDIO_VERSION = 'almeida';

/**
 * Onde ficam os arquivos: relativo à página (a pasta `public/audio/` do app) ou, quando a Bíblia gravada passar do
 * que o GitHub Pages comporta (1 GB), o endereço do armazém de arquivos, terminado em "/" (ex.: "https://audio.exemplo.org/").
 * O armazém precisa liberar CORS (GET) para o endereço do app, porque o app lê a cobertura e os tempos com fetch.
 */
export const BIBLE_AUDIO_BASE_URL = 'audio/';

/** Pasta das gravações da Almeida dentro da base. */
export const BIBLE_AUDIO_DIR = `biblia/${BIBLE_AUDIO_VERSION}/`;

/** Caminho (dentro da base) de um arquivo do capítulo. */
export const chapterAudioFile = (bookId: string, chapter: number, ext: 'mp3' | 'json'): string => `${BIBLE_AUDIO_DIR}${bookId}-${chapter}.${ext}`;

/** Caminho (dentro da base) da lista de capítulos gravados. */
export const BIBLE_AUDIO_COVERAGE_FILE = `${BIBLE_AUDIO_DIR}cobertura.json`;

/** Endereço completo de um arquivo; `pageBase` é o `document.baseURI` no app. */
export const bibleAudioUrl = (file: string, pageBase: string, base: string = BIBLE_AUDIO_BASE_URL): string => new URL(base + file, pageBase).href;

/** Como se anuncia o capítulo antes dos versículos: "João, capítulo 3". Um só lugar para o leitor e para o gerador. */
export const chapterIntro = (bookName: string, chapter: number): string => `${bookName}, capítulo ${chapter}`;

/** Os capítulos já gravados, por livro, em intervalos fechados: `{ JHN: [[1, 21]], PSA: [[23, 23], [117, 119]] }`. */
export interface BibleAudioCoverage {
  /** Nome da voz que aparece no player. */
  voice: string;
  books: Record<string, [number, number][]>;
}

/** Um capítulo gravado: de que segundo começa cada trecho ("Livro, capítulo N" e depois cada versículo). */
export interface ChapterAudio {
  /** Resumo do que foi gravado (voz, ajustes e texto): quando muda, o gerador regrava o capítulo. */
  source: string;
  /** Resumo só do texto: serve para `--completar` não regravar o que só mudou de voz. */
  text?: string;
  voice: string;
  seconds: number;
  /** `t`: início em segundos; `k`: textKey() do trecho. */
  items: { t: number; k: string }[];
}

/** O capítulo tem gravação? (a cobertura pode faltar: sem internet, ou antes de haver qualquer gravação) */
export function hasChapterAudio(coverage: BibleAudioCoverage | null | undefined, bookId: string, chapter: number): boolean {
  return !!coverage?.books?.[bookId]?.some(([from, to]) => chapter >= from && chapter <= to);
}

/** Junta capítulos soltos em intervalos: [1, 2, 3, 7] → [[1, 3], [7, 7]]. */
export function toRanges(chapters: number[]): [number, number][] {
  const out: [number, number][] = [];
  for (const n of [...new Set(chapters)].sort((a, b) => a - b)) {
    const last = out.at(-1);
    if (last && n === last[1] + 1) last[1] = n;
    else out.push([n, n]);
  }
  return out;
}

/** Monta a cobertura a partir da lista de arquivos de capítulo encontrados (`JHN-3.json`…). Ignora o que não for capítulo. */
export function coverageFromFiles(files: string[], voice: string): BibleAudioCoverage {
  const byBook = new Map<string, number[]>();
  for (const file of files) {
    const m = /^([0-9A-Z]{3})-(\d+)\.json$/.exec(file);
    if (m) byBook.set(m[1], [...(byBook.get(m[1]) ?? []), Number(m[2])]);
  }
  const books: Record<string, [number, number][]> = {};
  for (const id of [...byBook.keys()].sort()) books[id] = toRanges(byBook.get(id)!);
  return { voice, books };
}

/**
 * Casa o que está na tela com a gravação, em ordem e sem exceção: devolve o segundo de início de cada trecho, ou
 * `null` se qualquer trecho for diferente (texto corrigido depois da gravação, outra versão, capítulo com versículo
 * a mais). Assim a voz nunca diz algo diferente do que está escrito; nesse caso o app usa a voz do aparelho.
 */
export function matchChapter(entry: Pick<ChapterAudio, 'items'>, texts: string[]): number[] | null {
  if (!texts.length || entry.items.length !== texts.length) return null;
  const starts: number[] = [];
  for (const [i, text] of texts.entries()) {
    if (entry.items[i].k !== textKey(text)) return null;
    starts.push(entry.items[i].t);
  }
  return starts;
}

/** Livros que `--livros` do gerador aceita por apelido, além dos códigos (JHN, PSA…). */
const NEW_TESTAMENT = 'MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV'.split(' ');
const GOSPELS = ['MAT', 'MRK', 'LUK', 'JHN'];

/**
 * Expande `--livros` em códigos de livro: aceita códigos e os apelidos NT, AT, EVANGELHOS e as fases do plano
 * (FASE-A: Evangelhos, Salmos e Provérbios; FASE-B: Atos e o resto do Novo Testamento; FASE-C: o resto do Antigo).
 */
export function expandBookSelection(spec: string, allBookIds: string[]): string[] {
  const out: string[] = [];
  const add = (ids: string[]) => ids.forEach((id) => { if (allBookIds.includes(id) && !out.includes(id)) out.push(id); });
  for (const part of spec.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean)) {
    if (part === 'NT') add(NEW_TESTAMENT);
    else if (part === 'AT') add(allBookIds.filter((id) => !NEW_TESTAMENT.includes(id)));
    else if (part === 'EVANGELHOS') add(GOSPELS);
    else if (part === 'FASE-A') add([...GOSPELS, 'PSA', 'PRO']);
    else if (part === 'FASE-B') add(NEW_TESTAMENT.filter((id) => !GOSPELS.includes(id)));
    else if (part === 'FASE-C') add(allBookIds.filter((id) => !NEW_TESTAMENT.includes(id) && id !== 'PSA' && id !== 'PRO'));
    else if (allBookIds.includes(part)) add([part]);
    else throw new Error(`Livro desconhecido em --livros: ${part}`);
  }
  return out;
}

/** Lê `--capitulos` ("23", "1-3", "1,3,5-7"). */
export function parseChapterSelection(spec: string): number[] {
  const out: number[] = [];
  for (const part of spec.split(',').map((s) => s.trim()).filter(Boolean)) {
    const m = /^(\d+)(?:-(\d+))?$/.exec(part);
    if (!m) throw new Error(`Capítulos inválidos em --capitulos: ${part}`);
    const from = Number(m[1]);
    const to = Number(m[2] ?? m[1]);
    for (let n = from; n <= to; n++) out.push(n);
  }
  return out;
}
