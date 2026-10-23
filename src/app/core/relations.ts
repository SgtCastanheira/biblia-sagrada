import { GENEALOGY } from './genealogy';

/**
 * Relações entre personagens, mapas e estudos — usadas para conectar o Memorial da Fé
 * com a genealogia, os mapas e os artigos.
 */

/** Pares de pessoas relacionadas (família, ministério, convivência). Valem nos dois sentidos. */
const PAIRS: [string, string][] = [
  ['adao', 'eva'], ['eva', 'abel'], ['abraao', 'sara'], ['abraao', 'isaque'], ['abraao', 'melquisedeque'], ['sara', 'isaque'],
  ['isaque', 'jaco'], ['jaco', 'jose'], ['jaco', 'juda'], ['juda', 'tamar'], ['jose', 'juda'],
  ['moises', 'arao'], ['moises', 'miria'], ['moises', 'anrao-e-joquebede'], ['moises', 'josue'], ['arao', 'miria'],
  ['josue', 'calebe'], ['josue', 'raabe'], ['raabe', 'boaz'], ['boaz', 'rute'], ['rute', 'jesse'], ['jesse', 'davi'],
  ['debora', 'baraque'], ['ana-mae-de-samuel', 'samuel'], ['eli', 'samuel'], ['samuel', 'saul'], ['samuel', 'davi'],
  ['saul', 'jonatas'], ['davi', 'jonatas'], ['davi', 'abigail'], ['davi', 'bate-seba'], ['davi', 'nata'], ['davi', 'gade'],
  ['davi', 'salomao'], ['bate-seba', 'salomao'], ['nata', 'salomao'], ['salomao', 'roboao'], ['aias', 'jeroboao-i'],
  ['roboao', 'jeroboao-i'], ['acabe', 'elias'], ['elias', 'eliseu'], ['acabe', 'micaias'], ['josafa', 'micaias'],
  ['josafa', 'acabe'], ['jeu', 'eliseu'], ['jeu', 'jorao-de-israel'], ['atalia', 'joas-de-juda'], ['uzias', 'isaias'],
  ['acaz', 'isaias'], ['ezequias', 'isaias'], ['ezequias', 'manasses'], ['ezequias', 'miqueias'], ['josias', 'hulda'],
  ['josias', 'jeremias'], ['josias', 'sofonias'], ['jeremias', 'zedequias'], ['jeremias', 'jeoaquim'], ['joaquim', 'zorobabel'],
  ['zorobabel', 'ageu'], ['zorobabel', 'zacarias-profeta'], ['ester', 'mardoqueu'], ['esdras', 'neemias'], ['neemias', 'malaquias'],
  ['jeroboao-ii', 'jonas'], ['jeroboao-ii', 'amos'], ['jeroboao-ii', 'oseias-profeta'], ['oseias-rei', 'oseias-profeta'],
  ['isabel', 'joao-batista'], ['isabel', 'maria-mae-de-jesus'], ['maria-mae-de-jesus', 'jose-de-nazare'], ['maria-mae-de-jesus', 'ana-profetisa'],
  ['joao-batista', 'andre'], ['andre', 'pedro'], ['pedro', 'joao-apostolo'], ['joao-apostolo', 'tiago-zebedeu'],
  ['filipe', 'bartolomeu'], ['pedro', 'joao-marcos'], ['maria-de-betania', 'lazaro'], ['maria-madalena', 'joao-apostolo'],
  ['nicodemos', 'joao-batista'], ['tiago-irmao-do-senhor', 'paulo'], ['paulo', 'barnabe'], ['paulo', 'timoteo'], ['paulo', 'lucas'],
  ['paulo', 'priscila'], ['paulo', 'lidia'], ['paulo', 'estevao'], ['barnabe', 'joao-marcos'], ['paulo', 'agabo'],
  ['pedro', 'dorcas'], ['matias', 'pedro'], ['mateus', 'pedro'], ['tome', 'joao-apostolo'], ['maria-mae-de-jesus', 'joao-apostolo'],
];

export function relatedPeople(id: string): string[] {
  return [...new Set(PAIRS.flatMap(([a, b]) => (a === id ? [b] : b === id ? [a] : [])))];
}

/** Mapas de jornada ligados a cada personagem. */
const PERSON_MAPS: Record<string, string[]> = {
  abraao: ['jornada-de-abraao'], sara: ['jornada-de-abraao'], moises: ['fuga-e-retorno-de-moises', 'exodo'], arao: ['exodo'], miria: ['exodo'],
  josue: ['conquista-de-jerico'], raabe: ['conquista-de-jerico'], calebe: ['exodo'],
  'oseias-rei': ['cativeiros-de-israel'], peca: ['cativeiros-de-israel'], menaem: ['cativeiros-de-israel'], ezequias: ['cativeiros-de-israel'],
  manasses: ['cativeiros-de-israel'], 'jeoacaz-de-juda': ['cativeiros-de-israel'], jeoaquim: ['exilio-na-babilonia'], joaquim: ['cativeiros-de-israel'],
  zedequias: ['exilio-na-babilonia', 'cativeiros-de-israel'], daniel: ['cativeiros-de-israel'], ezequiel: ['cativeiros-de-israel'],
  jeremias: ['exilio-na-babilonia', 'cativeiros-de-israel'], ester: ['cativeiros-de-israel'], mardoqueu: ['cativeiros-de-israel'],
  esdras: ['cativeiros-de-israel'], neemias: ['cativeiros-de-israel'], zorobabel: ['cativeiros-de-israel'],
  'maria-mae-de-jesus': ['nascimento-de-jesus', 'vida-de-jesus'], 'jose-de-nazare': ['nascimento-de-jesus', 'vida-de-jesus'],
  'joao-batista': ['vida-de-jesus'], pedro: ['ministerio-na-galileia', 'discipulos-apos-a-cruz'], andre: ['ministerio-na-galileia'],
  'joao-apostolo': ['discipulos-apos-a-cruz'], 'tiago-zebedeu': ['ministerio-na-galileia'], 'maria-madalena': ['discipulos-apos-a-cruz'],
  tome: ['discipulos-apos-a-cruz'], mateus: ['ministerio-na-galileia'], lazaro: ['vida-de-jesus'], 'maria-de-betania': ['vida-de-jesus'],
  nicodemos: ['vida-de-jesus'], paulo: ['primeira-viagem-de-paulo', 'segunda-viagem-de-paulo', 'viagem-a-roma'],
  barnabe: ['primeira-viagem-de-paulo'], 'joao-marcos': ['primeira-viagem-de-paulo'], timoteo: ['segunda-viagem-de-paulo'],
  lidia: ['segunda-viagem-de-paulo'], priscila: ['segunda-viagem-de-paulo'], lucas: ['segunda-viagem-de-paulo', 'viagem-a-roma'],
};

/** Estudos e capítulos de história ligados a cada personagem. */
const PERSON_ARTICLES: Record<string, string[]> = {
  ...Object.fromEntries(
    ['oseias-rei', 'peca', 'menaem', 'ezequias', 'manasses', 'joaquim', 'zedequias', 'jeoaquim', 'daniel', 'ezequiel', 'jeremias', 'ester', 'mardoqueu', 'esdras', 'neemias', 'zorobabel', 'naum', 'jonas']
      .map((id) => [id, ['cativeiros-de-israel']]),
  ),
  ...Object.fromEntries(['pedro', 'paulo', 'estevao', 'barnabe', 'tiago-zebedeu', 'tiago-irmao-do-senhor', 'filipe', 'matias'].map((id) => [id, ['igreja-primitiva']])),
  daniel: ['cativeiros-de-israel', 'profecias-de-daniel'],
  'joao-apostolo': ['igreja-primitiva', 'apocalipse'],
  moises: ['formacao-do-antigo-testamento'],
};

export const mapsOfPerson = (id: string) => PERSON_MAPS[id] ?? [];
export const articlesOfPerson = (id: string) => PERSON_ARTICLES[id] ?? [];

/** Pessoas que aparecem na genealogia de Jesus (como geração ou como mãe citada). */
const IN_GENEALOGY = new Set(
  GENEALOGY.flatMap((s) => [...(s.nodes ?? []), ...(s.mt ?? []), ...(s.lk ?? [])]).flatMap((n) => [n.person, n.mother?.person]).filter((x): x is string => !!x),
);
export const inGenealogy = (id: string) => IN_GENEALOGY.has(id);

/** Ano aproximado a partir do texto do período ("931–913 a.C." → -931; "séc. I" → 30). */
export function yearOf(period: string): number {
  const text = period.toLowerCase();
  if (text.includes('início da humanidade')) return -4000;
  if (text.includes('antes do dilúvio')) return -3000;
  if (text.includes('patriarcas')) return -1900;
  const century = text.match(/séc\.\s*([ivx]+)\s*(a\.c\.)?/);
  const roman = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6 } as Record<string, number>;
  const number = text.match(/(\d{1,4})/);
  if (number) {
    const n = Number(number[1]);
    const bc = /a\.c\./.test(text.slice(text.indexOf(number[1])));
    return bc ? -n : n;
  }
  if (century) return century[2] ? -(roman[century[1]] ?? 1) * 100 + 50 : (roman[century[1]] ?? 1) * 100 - 70;
  return -800;
}

export const ERA_BANDS: { from: number; to: number; name: string }[] = [
  { from: -99999, to: -2001, name: 'Das origens a Abraão' },
  { from: -2000, to: -1501, name: 'Os patriarcas' },
  { from: -1500, to: -1051, name: 'Êxodo, conquista e juízes' },
  { from: -1050, to: -932, name: 'O reino unido' },
  { from: -931, to: -587, name: 'Os reinos de Israel e Judá' },
  { from: -586, to: -400, name: 'Exílio e retorno' },
  { from: -399, to: 99999, name: 'O Novo Testamento' },
];
