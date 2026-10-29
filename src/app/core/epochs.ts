import { CONTEXT_EVENTS, type ContextEvent } from './ad-context';
import { BOOKS } from './books';
import type { Curiosity } from './curiosities';
import { ARTICLES, type Article } from './library';
import type { Person } from './memorial';
import type { Prophecy } from './prophecy';
import { parseReferences } from './reference-parser';
import { periodYears } from './story-graph';
import { WORLD_EVENTS } from './world-events';

/**
 * A linha do tempo da história: da Criação aos nossos dias em dezesseis épocas. Cada coisa do app que tem um tempo
 * (histórias, livros da Bíblia, personagens, curiosidades, profecias, mapas e as crises do mundo) cai numa época,
 * e a tela de cada época reúne tudo. Código puro (sem Angular), para os testes.
 */

export interface Epoch {
  id: string;
  name: string;
  /** Como o período aparece escrito. */
  period: string;
  /** Primeiro ano da época (negativo = a.C.); ela vai até o começo da próxima. */
  from: number;
  icon: string;
  summary: string;
  /** Grupo no índice. */
  part: string;
  /** Época do atlas (ERAS) que mostra o mapa do mundo nesse tempo. */
  atlas?: string;
}

export const EPOCH_PARTS = ['O Antigo Testamento', 'O Mundo de Jesus', 'A Igreja Antiga', 'A Igreja pelos Séculos', 'O Século Pentecostal e Hoje'];

export const EPOCHS: Epoch[] = [
  {
    id: 'origens', name: 'Das Origens a Abraão', period: 'Antes de c. 2000 a.C.', from: -3000, icon: 'public', part: EPOCH_PARTS[0], atlas: 'antes-de-abraao',
    summary: 'Criação, queda, dilúvio e Babel: o começo da história humana em Gênesis 1–11. Os estudiosos discutem como datá-lo; o mundo ao redor já tinha cidades, escrita e pirâmides.',
  },
  {
    id: 'patriarcas', name: 'Os Patriarcas', period: 'c. 2000–1700 a.C.', from: -2000, icon: 'family_history', part: EPOCH_PARTS[0], atlas: 'patriarcas',
    summary: 'Abraão, Isaque, Jacó e José: uma família que Deus chamou no meio de grandes civilizações, da Mesopotâmia ao Egito. Termina com José governando o Egito e a família de Jacó vivendo em Gósen.',
  },
  {
    id: 'egito-juizes', name: 'Do Êxodo aos Juízes', period: 'c. 1700–1050 a.C.', from: -1699, icon: 'hiking', part: EPOCH_PARTS[0], atlas: 'exodo-conquista',
    summary: 'A família de Jacó cresce no Egito e vira escrava; Moisés lidera o Êxodo, a Lei é dada no Sinai, Josué conquista Canaã e os juízes governam Israel. A data do Êxodo é debatida: c. 1446 ou c. 1270 a.C.',
  },
  {
    id: 'reino-unido', name: 'Saul, Davi e Salomão', period: 'c. 1050–930 a.C.', from: -1050, icon: 'military_tech', part: EPOCH_PARTS[0], atlas: 'reino-unido',
    summary: 'Israel passa a ter rei: Saul, depois Davi, que faz de Jerusalém a capital, e Salomão, que constrói o Templo. É o tempo dos salmos, dos provérbios e da maior extensão do reino.',
  },
  {
    id: 'reino-dividido', name: 'Israel e Judá', period: '930–605 a.C.', from: -930, icon: 'compare_arrows', part: EPOCH_PARTS[0], atlas: 'reino-dividido',
    summary: 'Com a morte de Salomão, o reino se divide: Israel ao norte, Judá ao sul. Reis bons e maus, profetas como Elias, Isaías e Jeremias, e a ameaça crescente da Assíria, que derruba Samaria em 722.',
  },
  {
    id: 'exilio-retorno', name: 'Babilônia, Exílio e Retorno', period: '605–430 a.C.', from: -605, icon: 'luggage', part: EPOCH_PARTS[0], atlas: 'babilonia',
    summary: 'A Babilônia leva Judá cativo e destrói Jerusalém e o Templo (586). Daniel e Ezequiel profetizam no exílio; depois da queda da Babilônia, Ciro deixa os judeus voltarem. Esdras, Neemias, Ester, Ageu, Zacarias e Malaquias são deste tempo.',
  },
  {
    id: 'entre-testamentos', name: 'Os 400 Anos entre os Testamentos', period: 'c. 430–6 a.C.', from: -430, icon: 'swap_horiz', part: EPOCH_PARTS[1], atlas: 'alexandre',
    summary: 'Nenhum livro do Antigo Testamento foi escrito depois de Malaquias, mas a história não parou: Persas, Alexandre, os reis do Egito e da Síria, a revolta dos Macabeus, os asmoneus e a chegada de Roma. É o mundo em que Jesus nasce.',
  },
  {
    id: 'jesus', name: 'Jesus de Nazaré', period: 'c. 6 a.C. – 30 d.C.', from: -6, icon: 'star', part: EPOCH_PARTS[1], atlas: 'roma',
    summary: 'O nascimento em Belém no fim do reinado de Herodes, o ministério na Galileia e na Judeia, a cruz e a ressurreição. Os quatro Evangelhos contam esse tempo, sob o domínio de Roma.',
  },
  {
    id: 'igreja-nasce', name: 'A Igreja Nasce', period: '30–64', from: 30, icon: 'local_fire_department', part: EPOCH_PARTS[2], atlas: 'roma',
    summary: 'Pentecostes, a perseguição que espalha a fé, a conversão de Paulo e as viagens missionárias. Surgem as igrejas de Jerusalém, Antioquia, Éfeso, Corinto e Roma, e os apóstolos escrevem as cartas.',
  },
  {
    id: 'roma-persegue', name: 'Roma Persegue, a Igreja Cresce', period: '64–313', from: 64, icon: 'heart_broken', part: EPOCH_PARTS[2],
    summary: 'De Nero a Diocleciano: perseguições em ondas, mártires, catacumbas, o Coliseu e a destruição de Jerusalém em 70. Mesmo assim, a Igreja se espalha por todo o império, e as epidemias e crises do século III põem à prova o seu cuidado com os doentes.',
  },
  {
    id: 'constantino', name: 'Constantino, os Credos e o Fim de Roma', period: '313–500', from: 313, icon: 'account_balance', part: EPOCH_PARTS[2],
    summary: 'O Edito de Milão dá liberdade aos cristãos; os concílios de Niceia e de Constantinopla fixam a fé na Trindade; Jerônimo traduz a Bíblia para o latim e Agostinho escreve. Em 476, cai o Império Romano do Ocidente.',
  },
  {
    id: 'idade-media', name: 'A Idade Média', period: '500–1500', from: 500, icon: 'castle', part: EPOCH_PARTS[3],
    summary: 'Mil anos de mosteiros, papas e reis, com o Grande Cisma de 1054, as Cruzadas, a Peste Negra e a queda de Constantinopla. No fim, Valdo, Wycliffe e Hus pedem a Bíblia na língua do povo, e Gutenberg a imprime.',
  },
  {
    id: 'reforma', name: 'A Reforma e o Mundo Novo', period: '1500–1650', from: 1500, icon: 'gavel', part: EPOCH_PARTS[3],
    summary: 'Lutero, Calvino e os anabatistas reformam a Igreja; a Igreja Católica responde em Trento; Tyndale e a Bíblia King James chegam ao povo. Do outro lado do Atlântico, a primeira missa no Brasil, em 1500, abre a história da fé por aqui.',
  },
  {
    id: 'despertamentos', name: 'Despertamentos e Missões', period: '1650–1900', from: 1650, icon: 'campaign', part: EPOCH_PARTS[3],
    summary: 'Morávios, Wesley, Whitefield e Edwards despertam multidões; nasce a Escola Dominical; Carey e Hudson Taylor levam o evangelho ao mundo, e os primeiros protestantes chegam ao Brasil. É também o tempo das revoluções, da abolição e da República.',
  },
  {
    id: 'pentecostes', name: 'O Fogo Pentecostal e as Duas Guerras', period: '1900–1945', from: 1900, icon: 'air', part: EPOCH_PARTS[4],
    summary: 'Topeka e a Rua Azusa espalham o batismo no Espírito Santo; em 1910 e 1911, a fé pentecostal chega a Belém do Pará. A igreja cresce no meio de duas guerras mundiais, da gripe espanhola e da crise de 1929.',
  },
  {
    id: 'mundo-atual', name: 'Do Pós-Guerra aos Nossos Dias', period: '1945–hoje', from: 1945, icon: 'language', part: EPOCH_PARTS[4],
    summary: 'A Guerra Fria, o Estado de Israel, os avivamentos nas Hébridas e na África, o regime militar no Brasil, a Constituição de 1988 e a era digital. A igreja pentecostal cria raízes em cada estado do país.',
  },
];

export const findEpoch = (id: string | undefined) => EPOCHS.find((e) => e.id === id);

/** A época de um ano (negativo = a.C.). */
export function epochOfYear(year: number): Epoch {
  let found = EPOCHS[0];
  for (const e of EPOCHS) if (e.from <= year) found = e;
  return found;
}

/** Primeiro e último ano de uma época (a última vai até o ano atual). */
export function epochRange(e: Epoch, now = new Date().getFullYear()): [number, number] {
  const next = EPOCHS[EPOCHS.indexOf(e) + 1];
  return [e.from, next ? next.from - 1 : now];
}

/** A época anterior e a próxima. */
export function epochNeighbours(e: Epoch): { prev: Epoch | null; next: Epoch | null } {
  const i = EPOCHS.indexOf(e);
  return { prev: EPOCHS[i - 1] ?? null, next: EPOCHS[i + 1] ?? null };
}

// ———— Histórias ————

/** Histórias cuja época não é a do começo do período (retratos de pessoas, por exemplo). */
export const ARTICLE_EPOCH: Record<string, string> = {
  'daniel-berg-e-gunnar-vingren': 'pentecostes',
  'frida-vingren': 'pentecostes',
  'cativeiros-de-israel': 'exilio-retorno',
  'grupos-do-tempo-de-jesus': 'jesus',
  'natal-e-os-calendarios': 'jesus',
};

/** A época de uma história: onde o período dela começa. Os panoramas e os estudos sem data ficam sem época. */
export function epochOfArticle(a: Article): Epoch | null {
  if (a.overview) return null;
  const forced = findEpoch(ARTICLE_EPOCH[a.id]);
  if (forced) return forced;
  const years = a.period ? periodYears(a.period) : null;
  return years ? epochOfYear(years[0]) : null;
}

export const storiesOfEpoch = (id: string): Article[] =>
  ARTICLES.filter((a) => epochOfArticle(a)?.id === id).sort((a, b) => startYear(a) - startYear(b));

const startYear = (a: Article) => (a.period ? periodYears(a.period)?.[0] : null) ?? 0;

// ———— Crises e fatos do mundo ————

/** Os fatos do mundo, do mais antigo para o mais novo: os de antes de 1890 e os do Brasil e do mundo desde então. */
export const WORLD_TIMELINE: ContextEvent[] = [...WORLD_EVENTS, ...CONTEXT_EVENTS].sort((a, b) => a.from - b.from || a.title.localeCompare(b.title, 'pt-BR'));

export const eventsOfEpoch = (id: string): ContextEvent[] => WORLD_TIMELINE.filter((e) => epochOfYear(e.from).id === id);

/** Um item da linha do tempo de uma época: uma história ou um fato do mundo. */
export interface TimelineEntry {
  year: number;
  story?: Article;
  event?: ContextEvent;
}

/** As histórias e os fatos da época, juntos e em ordem de ano; no mesmo ano, a história vem antes. */
export function timelineOfEpoch(id: string): TimelineEntry[] {
  const entries: TimelineEntry[] = [
    // Uma história que começou antes da época (a vida de alguém, um assunto longo) entra no começo dela
    ...storiesOfEpoch(id).map((story) => ({ year: Math.max(startYear(story), findEpoch(id)?.from ?? -Infinity), story })),
    ...eventsOfEpoch(id).map((event) => ({ year: event.from, event })),
  ];
  return entries.sort((a, b) => a.year - b.year || (a.story ? 0 : 1) - (b.story ? 0 : 1));
}

// ———— A Bíblia ————

/**
 * Em que época cada livro da Bíblia se passa: a época vale do capítulo indicado até o começo do próximo trecho.
 * Os livros dos profetas, dos salmos e das cartas ficam na época em que foram escritos ou em que o texto os põe.
 */
const BIBLE_EPOCHS: Record<string, [number, string][]> = {
  GEN: [[1, 'origens'], [12, 'patriarcas']],
  EXO: [[1, 'egito-juizes']], LEV: [[1, 'egito-juizes']], NUM: [[1, 'egito-juizes']], DEU: [[1, 'egito-juizes']],
  JOS: [[1, 'egito-juizes']], JDG: [[1, 'egito-juizes']], RUT: [[1, 'egito-juizes']],
  '1SA': [[1, 'egito-juizes'], [8, 'reino-unido']],
  '2SA': [[1, 'reino-unido']],
  '1KI': [[1, 'reino-unido'], [12, 'reino-dividido']],
  '2KI': [[1, 'reino-dividido'], [24, 'exilio-retorno']],
  '1CH': [[1, 'reino-unido']],
  '2CH': [[1, 'reino-unido'], [10, 'reino-dividido'], [36, 'exilio-retorno']],
  EZR: [[1, 'exilio-retorno']], NEH: [[1, 'exilio-retorno']], EST: [[1, 'exilio-retorno']],
  JOB: [[1, 'patriarcas']],
  PSA: [[1, 'reino-unido']], PRO: [[1, 'reino-unido']], ECC: [[1, 'reino-unido']], SNG: [[1, 'reino-unido']],
  ISA: [[1, 'reino-dividido']],
  JER: [[1, 'reino-dividido'], [40, 'exilio-retorno']],
  LAM: [[1, 'exilio-retorno']], EZK: [[1, 'exilio-retorno']], DAN: [[1, 'exilio-retorno']],
  HOS: [[1, 'reino-dividido']], JOL: [[1, 'reino-dividido']], AMO: [[1, 'reino-dividido']], OBA: [[1, 'exilio-retorno']],
  JON: [[1, 'reino-dividido']], MIC: [[1, 'reino-dividido']], NAM: [[1, 'reino-dividido']], HAB: [[1, 'reino-dividido']],
  ZEP: [[1, 'reino-dividido']], HAG: [[1, 'exilio-retorno']], ZEC: [[1, 'exilio-retorno']], MAL: [[1, 'exilio-retorno']],
  MAT: [[1, 'jesus']], MRK: [[1, 'jesus']], LUK: [[1, 'jesus']], JHN: [[1, 'jesus']],
  ACT: [[1, 'igreja-nasce']], ROM: [[1, 'igreja-nasce']], '1CO': [[1, 'igreja-nasce']], '2CO': [[1, 'igreja-nasce']],
  GAL: [[1, 'igreja-nasce']], EPH: [[1, 'igreja-nasce']], PHP: [[1, 'igreja-nasce']], COL: [[1, 'igreja-nasce']],
  '1TH': [[1, 'igreja-nasce']], '2TH': [[1, 'igreja-nasce']], '1TI': [[1, 'igreja-nasce']], '2TI': [[1, 'igreja-nasce']],
  TIT: [[1, 'igreja-nasce']], PHM: [[1, 'igreja-nasce']], HEB: [[1, 'igreja-nasce']], JAS: [[1, 'igreja-nasce']],
  '1PE': [[1, 'igreja-nasce']], '2PE': [[1, 'igreja-nasce']], JUD: [[1, 'igreja-nasce']],
  '1JN': [[1, 'roma-persegue']], '2JN': [[1, 'roma-persegue']], '3JN': [[1, 'roma-persegue']], REV: [[1, 'roma-persegue']],
};

/** A época de um capítulo da Bíblia. */
export function epochOfChapter(bookId: string, chapter: number): Epoch | null {
  const parts = BIBLE_EPOCHS[bookId];
  if (!parts) return null;
  let id = parts[0][1];
  for (const [start, epoch] of parts) if (chapter >= start) id = epoch;
  return findEpoch(id) ?? null;
}

/** A época de uma referência ("Gn 12.1-5"): a do primeiro trecho. */
export function epochOfRef(ref: string): Epoch | null {
  const first = parseReferences(ref).refs[0];
  return first ? epochOfChapter(first.bookId, first.chapter) : null;
}

/** As épocas por onde passa um livro da Bíblia, na ordem do tempo. */
export function epochsOfBook(bookId: string): Epoch[] {
  const ids = [...new Set((BIBLE_EPOCHS[bookId] ?? []).map(([, id]) => id))];
  return ids.map((id) => findEpoch(id)).filter((e): e is Epoch => !!e);
}

/** Um trecho da Bíblia que pertence a uma época. */
export interface BibleSpan {
  bookId: string;
  name: string;
  from: number;
  to: number;
  /** O livro inteiro está na época. */
  whole: boolean;
}

/** Os livros e capítulos da Bíblia de uma época, na ordem da Bíblia. */
export function bibleOfEpoch(id: string): BibleSpan[] {
  const out: BibleSpan[] = [];
  for (const book of BOOKS) {
    const parts = BIBLE_EPOCHS[book.id] ?? [];
    parts.forEach(([start, epoch], i) => {
      if (epoch !== id) return;
      const to = (parts[i + 1]?.[0] ?? book.chapters + 1) - 1;
      out.push({ bookId: book.id, name: book.name, from: start, to, whole: start === 1 && to === book.chapters });
    });
  }
  return out;
}

// ———— Personagens, curiosidades, profecias e mapas ————

export const epochOfPerson = (p: Person): Epoch | null => (p.refs.length ? epochOfRef(p.refs[0]) : null);

export const epochOfCuriosity = (c: Curiosity): Epoch | null => {
  const first = c.refs[0];
  return first ? epochOfChapter(first.bookId, first.chapter) : null;
};

export const epochOfProphecy = (p: Prophecy): Epoch | null => epochOfRef(p.ref);

/** A época de um mapa: a que tem mais dos capítulos ligados a ele ("ACT 16") ou, sem capítulos, a do período ("1910–hoje"). */
export function epochOfMap(map: { chapters?: string[]; period: string }): Epoch | null {
  const counts = new Map<string, number>();
  for (const key of map.chapters ?? []) {
    const [book, chapter] = key.split(' ');
    const epoch = Number(chapter) ? epochOfChapter(book, Number(chapter)) : null;
    if (epoch) counts.set(epoch.id, (counts.get(epoch.id) ?? 0) + 1);
  }
  if (counts.size) return findEpoch([...counts].sort((a, b) => b[1] - a[1])[0][0]) ?? null;
  const years = periodYears(map.period);
  return years ? epochOfYear(years[0]) : null;
}
