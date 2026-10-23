/** Memorial da Fé: personagens bíblicos agrupados (heróis da fé, profetas, reis, nazireus…). */

export type MemorialGroup =
  | 'herois'
  | 'patriarcas'
  | 'juizes'
  | 'profetas-maiores'
  | 'profetas-menores'
  | 'profetas'
  | 'reis-unido'
  | 'reis-israel'
  | 'reis-juda'
  | 'nazireus'
  | 'mulheres'
  | 'apostolos'
  | 'personagens';

export type KingVerdict = 'bom' | 'mau' | 'misto';

export interface Person {
  id: string;
  name: string;
  /** Epíteto curto: "O pai da fé". */
  title: string;
  /** Significado do nome (quando conhecido). */
  meaning?: string;
  period: string;
  groups: MemorialGroup[];
  summary: string;
  facts?: [string, string][];
  /** Passagens principais. */
  refs: string[];
  /** Texto mostrado por inteiro na página. */
  keyVerse: string;
  legacy?: string;
  /** Só para reis. */
  reign?: { years: string; length: string; verdict: KingVerdict };
}

export interface GroupInfo {
  id: MemorialGroup;
  name: string;
  icon: string;
  description: string;
  /** Texto bíblico que define o grupo. */
  ref?: string;
}

export const GROUPS: GroupInfo[] = [
  {
    id: 'herois',
    name: 'Heróis da Fé',
    icon: 'military_tech',
    description: 'A “galeria da fé” de Hebreus 11: homens e mulheres que creram em Deus antes de ver a promessa cumprida.',
    ref: 'Hb 11.1-2',
  },
  {
    id: 'patriarcas',
    name: 'Patriarcas',
    icon: 'family_history',
    description: 'Os pais do povo de Israel, com quem Deus fez a aliança da promessa: Abraão, Isaque, Jacó e os doze filhos.',
    ref: 'Gn 12.1-3',
  },
  {
    id: 'juizes',
    name: 'Juízes',
    icon: 'gavel',
    description: 'Líderes levantados por Deus entre a conquista de Canaã e o primeiro rei, para livrar Israel dos opressores.',
    ref: 'Jz 2.16-18',
  },
  {
    id: 'profetas-maiores',
    name: 'Profetas Maiores',
    icon: 'campaign',
    description: '“Maiores” pelo tamanho dos livros, não pela importância: Isaías, Jeremias (com Lamentações), Ezequiel e Daniel.',
  },
  {
    id: 'profetas-menores',
    name: 'Profetas Menores',
    icon: 'record_voice_over',
    description: 'Os doze livros proféticos mais curtos, reunidos pelos judeus num só rolo, “o Livro dos Doze”.',
  },
  {
    id: 'profetas',
    name: 'Outros profetas',
    icon: 'hearing',
    description: 'Profetas que não deixaram livro com o seu nome, mas falaram em nome de Deus em momentos decisivos.',
  },
  {
    id: 'reis-unido',
    name: 'Reino Unido',
    icon: 'crown',
    description: 'Os três reis que governaram as doze tribos juntas, antes da divisão do reino (cerca de 1050–931 a.C.).',
    ref: '1Sm 8.4-7',
  },
  {
    id: 'reis-israel',
    name: 'Reis de Israel',
    icon: 'castle',
    description: 'O Reino do Norte (dez tribos, capital Samaria): 19 reis em cerca de 210 anos, até o cativeiro assírio em 722 a.C.',
    ref: '1Rs 12.16-20',
  },
  {
    id: 'reis-juda',
    name: 'Reis de Judá',
    icon: 'temple_buddhist',
    description: 'O Reino do Sul (Judá e Benjamim, capital Jerusalém): 20 governantes da linhagem de Davi, até o exílio babilônico em 586 a.C.',
    ref: '2Sm 7.12-16',
  },
  {
    id: 'nazireus',
    name: 'Nazireus',
    icon: 'spa',
    description: 'Consagrados a Deus por um voto: não bebiam vinho nem nada da uva, não cortavam o cabelo e não tocavam em mortos.',
    ref: 'Nm 6.1-8',
  },
  {
    id: 'mulheres',
    name: 'Mulheres de fé',
    icon: 'local_florist',
    description: 'Mulheres que marcaram a história da salvação com coragem, fé e serviço.',
  },
  {
    id: 'apostolos',
    name: 'Apóstolos',
    icon: 'groups',
    description: 'Os enviados de Jesus, testemunhas da ressurreição, que levaram o Evangelho “até os confins da terra”.',
    ref: 'At 1.8',
  },
  {
    id: 'personagens',
    name: 'Outros personagens',
    icon: 'person',
    description: 'Homens e mulheres que marcaram a história bíblica — na criação, na linhagem do Messias, no retorno do exílio e na igreja primitiva.',
  },
];

export const findGroup = (id: string) => GROUPS.find((g) => g.id === id);

export const VERDICTS: Record<KingVerdict, string> = {
  bom: 'Fez o que era reto',
  mau: 'Fez o que era mau',
  misto: 'Altos e baixos',
};

/** Linha do tempo dos dois reinos: os fatos que marcam Israel (Norte) e Judá (Sul) juntos. */
export const TWO_KINGDOMS_EVENTS: { year: number; label: string; text: string; ref: string; end?: boolean }[] = [
  { year: 931, label: '931 a.C.', text: 'O reino se divide: as dez tribos do Norte fazem Jeroboão rei; Judá e Benjamim ficam com Roboão, filho de Salomão.', ref: '1Rs 12.16-20' },
  { year: 853, label: '853 a.C.', text: 'Acabe, de Israel, e Josafá, de Judá, lutam juntos em Ramote-Gileade.', ref: '1Rs 22.29-35' },
  { year: 841, label: '841 a.C.', text: 'No mesmo dia, Jeú mata os reis dos dois reinos: Jorão, de Israel, e Acazias, de Judá.', ref: '2Rs 9.24-27' },
  { year: 722, label: '722 a.C.', text: 'Samaria cai: a Assíria leva Israel cativo. É o fim do Reino do Norte.', ref: '2Rs 17.5-6', end: true },
  { year: 586, label: '586 a.C.', text: 'Jerusalém e o templo são destruídos pela Babilônia: Judá vai para o exílio.', ref: '2Rs 25.8-11', end: true },
];

/** Ano em que o reinado começou ("931–913 a.C." → 931; "c. 1050–1010 a.C." → 1050). */
export const reignStart = (years: string) => Number(years.match(/\d+/)?.[0] ?? 0);
