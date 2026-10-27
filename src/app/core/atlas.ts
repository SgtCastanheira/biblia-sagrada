import { BibleMap } from './maps';

/**
 * Atlas histórico: as grandes épocas da Bíblia com os reinos e impérios (fronteiras aproximadas),
 * os povos de cada época, e um índice de lugares (cidades, montes, mares, rios) mostrados ao redor dos mapas.
 * As fronteiras são recortadas pelo litoral no desenho, por isso podem ser traçadas de forma simples sobre o mar.
 */

export type Lonlat = [number, number];

export interface Power {
  name: string;
  /** Cor de preenchimento (fica translúcida no mapa). */
  color: string;
  polygon: Lonlat[];
  /** Onde escrever o nome (padrão: centro do polígono). */
  label?: Lonlat;
  note?: string;
}

export interface EraEvent {
  year: string;
  text: string;
  ref?: string;
}

export interface Era {
  id: string;
  name: string;
  /** Data representativa (negativo = antes de Cristo). */
  year: number;
  period: string;
  summary: string;
  powers: Power[];
  peoples: { name: string; lon: number; lat: number }[];
  events: EraEvent[];
  /** Mapas de jornada desta época. */
  maps: string[];
}

export type GazetteerKind = 'cidade' | 'monte' | 'agua' | 'rio' | 'deserto';

export interface GazetteerPlace {
  name: string;
  lon: number;
  lat: number;
  kind: GazetteerKind;
  /** Ano de fundação, quando a cidade é posterior (negativo = a.C.). */
  from?: number;
  /** Outro nome (moderno ou antigo). */
  alt?: string;
}

const C = {
  egypt: '#c9a14a',
  meso: '#b5654b',
  elam: '#8c6bb1',
  hittite: '#6f8f4e',
  israel: '#3f7d9e',
  judah: '#4f6b5c',
  neighbor: '#9b7d5c',
  aram: '#a36b8f',
  phoenicia: '#6b84b8',
  assyria: '#b5654b',
  babylon: '#b07a2e',
  media: '#7d8f3a',
  persia: '#8c6bb1',
  greece: '#4f7fb0',
  rome: '#a8473f',
  parthia: '#7a6a4f',
  nabatea: '#c08a5a',
};

// Polígonos que se repetem em várias épocas
const EGYPT_NILE: Lonlat[] = [[29, 31.8], [32.4, 31.5], [32.7, 30.2], [31.8, 27.6], [33.1, 24.2], [32.8, 22], [31, 22], [30.6, 25], [30.2, 28], [29.2, 30.4]];
const PALESTINE_ROMAN = {
  galileia: [[35.15, 33.12], [35.62, 33.12], [35.64, 32.72], [35.55, 32.58], [35.25, 32.55], [35.02, 32.78], [35.08, 33.0]] as Lonlat[],
  judeia: [[34.6, 32.62], [35.0, 32.6], [35.55, 32.56], [35.55, 32.05], [35.52, 31.4], [35.35, 31.0], [34.85, 31.05], [34.5, 31.45]] as Lonlat[],
  pereia: [[35.57, 32.4], [35.8, 32.35], [35.85, 31.75], [35.62, 31.45], [35.55, 31.75]] as Lonlat[],
  decapolis: [[35.62, 32.88], [36.35, 32.88], [36.35, 32.0], [35.8, 32.3], [35.6, 32.45]] as Lonlat[],
  filipe: [[35.62, 33.35], [36.45, 33.35], [36.6, 32.9], [35.65, 32.9]] as Lonlat[],
};

// Polígonos das épocas entre os Testamentos (aproximados, para estudo)
const PERSIA_EMPIRE: Lonlat[] = [[25.5, 41.8], [29.0, 41.4], [32.0, 42.2], [36.0, 41.8], [41.5, 41.6], [45.0, 41.8], [49.0, 40.6], [54.0, 38.6], [60.0, 37.6], [62.5, 35.0], [62.5, 26.0], [57.0, 25.5], [52.0, 27.5], [48.5, 29.8], [45.0, 29.5], [40.0, 30.5], [36.5, 29.0], [34.8, 29.5], [33.0, 28.0], [34.0, 26.0], [33.0, 23.0], [31.0, 22.0], [29.5, 25.0], [28.8, 30.0], [25.0, 31.8], [24.5, 36.0], [25.0, 39.5]];
const MACEDONIA: Lonlat[] = [[19.5, 42.0], [26.0, 42.0], [26.0, 40.2], [23.8, 38.3], [21.6, 38.0], [19.8, 39.7]];
const WEST_ANATOLIA: Lonlat[] = [[26.0, 42.0], [29.0, 42.2], [31.0, 41.0], [31.5, 38.5], [29.0, 36.6], [26.6, 37.2], [26.0, 40.2]];
const ASIA_PROVINCE: Lonlat[] = [[26.0, 40.3], [29.5, 40.6], [31.0, 39.5], [30.5, 37.2], [28.2, 36.6], [26.4, 37.2]];
const JUDAH_CORE: Lonlat[] = [[34.95, 31.98], [35.5, 31.98], [35.5, 31.55], [35.0, 31.55]];
const PTOLEMAIC: Lonlat[] = [...EGYPT_NILE.slice(0, 1), [32.4, 31.5], [34.2, 31.4], [35.0, 32.6], [35.6, 33.8], [35.95, 34.6], [36.6, 34.4], [36.4, 33.0], [35.7, 31.0], [34.8, 30.0], [33.0, 29.6], ...EGYPT_NILE.slice(3)];
const EGYPT_ONLY: Lonlat[] = [[29, 31.8], [32.4, 31.5], [34.2, 31.3], [34.9, 29.6], [33.5, 28.5], [32.7, 27], [33.1, 24.2], [32.8, 22], [31, 22], [30.6, 25], [30.2, 28], [29.2, 30.4]];
const SELEUCID: Lonlat[] = [[36.0, 34.6], [35.9, 36.0], [34.5, 36.8], [33.0, 38.5], [36.5, 39.5], [40.5, 38.0], [44.5, 37.5], [48.0, 37.5], [54.0, 37.0], [58.0, 36.0], [58.0, 30.0], [52.0, 28.0], [48.0, 29.8], [45.0, 30.0], [40.0, 32.0], [37.0, 32.5], [36.7, 33.5]];
const SELEUCID_SYRIA: Lonlat[] = [[35.9, 36.8], [35.95, 34.7], [37.3, 34.6], [38.6, 35.8], [38.4, 37.2]];
const HASMONEAN: Lonlat[] = [[34.4, 31.25], [34.5, 32.0], [34.9, 32.75], [35.1, 33.1], [35.65, 33.3], [36.05, 33.0], [36.0, 32.3], [35.9, 31.4], [35.55, 30.95], [34.95, 31.0]];
const HEROD_KINGDOM: Lonlat[] = [[34.4, 31.25], [34.5, 32.0], [34.9, 32.75], [35.15, 33.2], [36.4, 33.4], [36.75, 32.6], [36.2, 31.7], [35.75, 31.2], [35.5, 30.95], [34.95, 31.0]];
const NABATEAN: Lonlat[] = [[35.6, 31.35], [36.8, 32.0], [38.2, 30.5], [37.6, 27.4], [35.2, 28.0], [34.95, 29.6], [35.5, 30.9]];
const PARTHIA: Lonlat[] = [[40.5, 38.5], [44.0, 39.0], [48.0, 38.5], [54.0, 38.0], [60.0, 38.0], [62.5, 36.0], [62.5, 26.0], [57.0, 25.5], [52.0, 27.5], [48.0, 29.5], [45.0, 30.0], [41.5, 33.0], [40.5, 35.5], [39.5, 36.5], [40.0, 38.0]];
const PARTHIA_RISING: Lonlat[] = [[54.0, 38.2], [60.0, 38.2], [62.5, 36.0], [62.5, 33.6], [56.0, 34.4]];
const ROME_EAST: Lonlat[] = [[19.0, 42.8], [28.5, 42.2], [29.5, 41.3], [33.0, 42.2], [36.0, 41.8], [39.0, 41.2], [40.5, 40.5], [39.5, 38.5], [38.5, 37.6], [40.0, 36.6], [38.8, 35.5], [38.0, 33.0], [36.6, 32.4], [35.7, 31.3], [34.9, 29.8], [33.0, 28.6], [32.6, 30.0], [31.8, 27.6], [33.1, 24.2], [32.8, 22], [31, 22], [30.6, 25], [30.2, 28], [29.0, 29.5], [25.0, 30.6], [19.0, 30.4]];

export const ERAS: Era[] = [
  {
    id: 'antes-de-abraao',
    name: 'Antes de Abraão',
    year: -2300,
    period: 'c. 3000–2000 a.C.',
    summary: 'O mundo de Gênesis 10–11: as primeiras cidades da Mesopotâmia, a escrita cuneiforme, as pirâmides do Egito. Os sumérios constroem zigurates (torres-templo, como a de Babel) e Sargão de Acade forma o primeiro império da história. Ur, de onde Abraão sairia, já era uma cidade antiga e rica.',
    powers: [
      { name: 'Império Acádio (Sargão)', color: C.meso, polygon: [[38.2, 36.9], [41, 37.4], [44.5, 36.6], [46.2, 34.6], [48.6, 32], [48.4, 29.8], [46.6, 29.6], [44, 31.4], [41, 33.2], [38.6, 35.1]], label: [43.6, 33.8] },
      { name: 'Egito (Reino Antigo)', color: C.egypt, polygon: EGYPT_NILE, label: [31.2, 26.5], note: 'As grandes pirâmides de Gizé são de c. 2560 a.C.' },
      { name: 'Elão', color: C.elam, polygon: [[47.6, 33.6], [50.2, 32.6], [51.6, 30.6], [49.6, 29.4], [48.3, 30.5], [47.7, 32]], label: [49.6, 31.6] },
    ],
    peoples: [
      { name: 'Sumérios', lon: 45.9, lat: 30.7 },
      { name: 'Amorreus', lon: 39.2, lat: 34.3 },
      { name: 'Cananeus', lon: 35.5, lat: 32.4 },
      { name: 'Hurritas', lon: 41.2, lat: 37.6 },
      { name: 'Gútios', lon: 46.6, lat: 35.4 },
    ],
    events: [
      { year: 'c. 3200 a.C.', text: 'Surge a escrita cuneiforme na Suméria e os hieróglifos no Egito.' },
      { year: 'c. 2560 a.C.', text: 'A Grande Pirâmide de Gizé é construída.' },
      { year: 'c. 2300 a.C.', text: 'Sargão de Acade une a Mesopotâmia: o primeiro império.' },
      { year: 'c. 2100 a.C.', text: 'Ur vive o seu auge, com o grande zigurate do deus-lua.' },
      { year: '—', text: 'A tabela das nações e a torre de Babel.', ref: 'Gn 10.1-11.9' },
    ],
    maps: [],
  },
  {
    id: 'patriarcas',
    name: 'Os patriarcas',
    year: -1800,
    period: 'c. 2000–1700 a.C.',
    summary: 'Abraão, Isaque, Jacó e José vivem entre grandes civilizações: o Egito do Reino Médio, a Babilônia de Hamurábi (com o seu famoso código de leis) e o reino de Mari, cujos arquivos descrevem costumes parecidos com os de Gênesis. Canaã é um mosaico de pequenas cidades-estado.',
    powers: [
      { name: 'Babilônia (Hamurábi)', color: C.babylon, polygon: [[40.8, 36.2], [44, 36.4], [45.6, 34.5], [47.6, 31.5], [47.3, 30.2], [45, 30.7], [43, 32.5], [41, 34]], label: [44, 33.2] },
      { name: 'Egito (Reino Médio)', color: C.egypt, polygon: EGYPT_NILE, label: [31.2, 26.5] },
      { name: 'Elão', color: C.elam, polygon: [[47.6, 33.6], [50.2, 32.6], [51.6, 30.6], [49.6, 29.4], [48.3, 30.5], [47.7, 32]], label: [49.6, 31.6], note: 'Quedorlaomer, rei de Elão, lutou contra os reis de Sodoma (Gn 14).' },
    ],
    peoples: [
      { name: 'Cananeus', lon: 35.3, lat: 32.2 },
      { name: 'Amorreus', lon: 38.8, lat: 34.2 },
      { name: 'Hurritas', lon: 41.2, lat: 37.6 },
      { name: 'Hititas', lon: 34.2, lat: 39.4 },
      { name: 'Ismaelitas e nômades', lon: 38.6, lat: 29.8 },
    ],
    events: [
      { year: 'c. 2000 a.C.', text: 'Abraão sai de Ur e de Harã para Canaã.', ref: 'Gn 12.1-5' },
      { year: 'c. 1900 a.C.', text: 'Nascimento de Isaque; Jacó e Esaú.', ref: 'Gn 21.1-3' },
      { year: 'c. 1750 a.C.', text: 'Hamurábi da Babilônia publica o seu código de leis.' },
      { year: 'c. 1700 a.C.', text: 'José governa o Egito; a família de Jacó desce para Gósen.', ref: 'Gn 46.1-7' },
    ],
    maps: ['jornada-de-abraao'],
  },
  {
    id: 'exodo-conquista',
    name: 'Êxodo e conquista',
    year: -1300,
    period: 'c. 1500–1100 a.C.',
    summary: 'O Egito do Novo Império é a maior potência e domina Canaã; ao norte, os hititas disputam a Síria com ele. Israel sai do Egito, recebe a Lei no Sinai e entra em Canaã. A leste do Jordão ficam Edom, Moabe e Amom, parentes de Israel; no litoral, por volta de 1175 a.C., chegam os filisteus.',
    powers: [
      { name: 'Egito (Novo Império)', color: C.egypt, polygon: [...EGYPT_NILE.slice(0, 1), [32.4, 31.5], [34.2, 31.4], [35.0, 32.6], [35.6, 33.6], [36.5, 34.8], [37.0, 34.4], [36.4, 33.0], [35.7, 31.0], [34.8, 30.0], [33.0, 29.6], ...EGYPT_NILE.slice(3)], label: [31.2, 26.5], note: 'Domina Canaã até a batalha de Cades (c. 1274 a.C.) contra os hititas.' },
      { name: 'Hititas', color: C.hittite, polygon: [[27.5, 40.6], [31, 41.6], [35.5, 41.7], [38.6, 40.6], [39.6, 38], [38.6, 36], [37.1, 34.6], [36.4, 35.0], [36, 36], [33, 36.4], [30, 36.9], [28, 37.6], [27, 39]], label: [34.2, 39.0] },
      { name: 'Assíria (média)', color: C.assyria, polygon: [[41.6, 37.4], [44.2, 37.3], [45, 35.6], [43.8, 34.6], [42.2, 35.2]], label: [43.4, 36.1] },
    ],
    peoples: [
      { name: 'Cananeus', lon: 35.2, lat: 32.3 },
      { name: 'Edom', lon: 35.55, lat: 30.45 },
      { name: 'Moabe', lon: 35.85, lat: 31.35 },
      { name: 'Amom', lon: 36.1, lat: 31.95 },
      { name: 'Midianitas', lon: 35.3, lat: 28.3 },
      { name: 'Amalequitas', lon: 34.4, lat: 30.4 },
      { name: 'Filisteus (c. 1175)', lon: 34.45, lat: 31.6 },
    ],
    events: [
      { year: 'c. 1446 ou 1270 a.C.', text: 'O Êxodo (a data é debatida).', ref: 'Êx 12.40-41' },
      { year: '40 anos', text: 'Israel no deserto; a Lei no Sinai.', ref: 'Êx 19.1-6' },
      { year: 'c. 1406 ou 1230 a.C.', text: 'Josué atravessa o Jordão e conquista Jericó.', ref: 'Js 6.20' },
      { year: 'c. 1208 a.C.', text: 'A Estela de Merneptá, no Egito, menciona “Israel” — o registro mais antigo do nome fora da Bíblia.' },
      { year: 'c. 1175 a.C.', text: 'Os “povos do mar”, entre eles os filisteus, se instalam no litoral.' },
    ],
    maps: ['fuga-e-retorno-de-moises', 'exodo', 'conquista-de-jerico'],
  },
  {
    id: 'reino-unido',
    name: 'O reino de Davi e Salomão',
    year: -970,
    period: 'c. 1010–931 a.C.',
    summary: 'Com o Egito e a Assíria enfraquecidos, abre-se espaço para um reino forte em Israel. Davi conquista Jerusalém, vence os filisteus e domina Edom, Moabe, Amom e os arameus. Salomão constrói o templo e faz alianças comerciais com Tiro (cedros do Líbano) e com o Egito.',
    powers: [
      { name: 'Israel (Davi e Salomão)', color: C.israel, polygon: [[35.1, 33.2], [35.7, 33.3], [36.1, 32.4], [35.95, 31.7], [35.6, 31.2], [35.4, 30.9], [34.9, 31.0], [34.7, 31.6], [34.85, 32.4], [35.0, 32.85]], label: [35.3, 31.9] },
      { name: 'Tiro e Sidom (Fenícia)', color: C.phoenicia, polygon: [[35.1, 33.15], [35.4, 33.2], [35.75, 33.9], [36.0, 34.6], [35.7, 34.7], [35.4, 33.9]], label: [35.5, 33.9] },
      { name: 'Egito (fragmentado)', color: C.egypt, polygon: EGYPT_NILE, label: [31.2, 26.5] },
    ],
    peoples: [
      { name: 'Filisteus', lon: 34.45, lat: 31.55 },
      { name: 'Edom (dominado)', lon: 35.5, lat: 30.4 },
      { name: 'Moabe (dominado)', lon: 36.0, lat: 31.3 },
      { name: 'Amom (dominado)', lon: 36.3, lat: 32.0 },
      { name: 'Arameus (Zobá, Damasco)', lon: 36.9, lat: 33.8 },
    ],
    events: [
      { year: 'c. 1010 a.C.', text: 'Davi rei em Hebrom; depois conquista Jerusalém.', ref: '2Sm 5.1-10' },
      { year: 'c. 966 a.C.', text: 'Salomão começa o templo.', ref: '1Rs 6.1' },
      { year: '931 a.C.', text: 'Morte de Salomão; o reino se divide.', ref: '1Rs 12.16-20' },
    ],
    maps: [],
  },
  {
    id: 'reino-dividido',
    name: 'Israel e Judá',
    year: -850,
    period: '931–722 a.C.',
    summary: 'Dois reinos irmãos: Israel, ao norte (dez tribos, capital Samaria), e Judá, ao sul (capital Jerusalém). Em volta, vizinhos que ora são aliados, ora inimigos: Arã-Damasco, Fenícia, Moabe, Amom, Edom e os filisteus. Ao longe, a Assíria cresce e começa a cobrar tributo.',
    powers: [
      { name: 'Israel (Norte)', color: C.israel, polygon: [[35.1, 33.1], [35.7, 33.3], [35.9, 32.9], [36.1, 32.4], [35.95, 31.9], [35.55, 31.85], [35.3, 32.0], [34.95, 32.05], [34.85, 32.4], [35.0, 32.85]], label: [35.45, 32.45] },
      { name: 'Judá (Sul)', color: C.judah, polygon: [[34.9, 31.95], [35.3, 31.95], [35.5, 31.85], [35.45, 31.4], [35.4, 31.0], [35.1, 30.85], [34.8, 31.05], [34.75, 31.5]], label: [35.1, 31.4] },
      { name: 'Arã-Damasco', color: C.aram, polygon: [[35.7, 33.3], [36.0, 34.0], [36.8, 34.2], [37.2, 33.5], [36.8, 32.8], [36.1, 32.5], [35.9, 32.9]], label: [36.5, 33.4] },
      { name: 'Fenícia', color: C.phoenicia, polygon: [[35.1, 33.12], [35.4, 33.15], [35.75, 33.9], [36.0, 34.6], [35.7, 34.7], [35.4, 33.9]], label: [35.6, 34.1] },
      { name: 'Moabe', color: C.neighbor, polygon: [[35.55, 31.75], [36.0, 31.75], [36.1, 31.1], [35.6, 31.0]], label: [35.85, 31.4] },
      { name: 'Edom', color: C.neighbor, polygon: [[35.4, 31.0], [35.8, 31.0], [35.6, 30.0], [35.1, 29.6], [35.0, 30.3]], label: [35.4, 30.4] },
      { name: 'Assíria', color: C.assyria, polygon: [[39.5, 37.5], [43.5, 37.8], [45.2, 36.2], [44.8, 34.6], [42.5, 34.8], [40.5, 35.8]], label: [43.0, 36.0] },
    ],
    peoples: [
      { name: 'Filisteus', lon: 34.45, lat: 31.55 },
      { name: 'Amom', lon: 36.15, lat: 31.95 },
    ],
    events: [
      { year: '931 a.C.', text: 'Jeroboão I faz os bezerros de ouro em Betel e Dã.', ref: '1Rs 12.28-29' },
      { year: '853 a.C.', text: 'Batalha de Qarqar: Acabe luta ao lado de Damasco contra a Assíria.' },
      { year: 'c. 850 a.C.', text: 'Elias no Carmelo.', ref: '1Rs 18.36-39' },
      { year: '841 a.C.', text: 'Jeú paga tributo a Salmaneser III (Obelisco Negro).', ref: '2Rs 10.32-34' },
      { year: '722 a.C.', text: 'Samaria cai diante da Assíria.', ref: '2Rs 17.6' },
    ],
    maps: [],
  },
  {
    id: 'assiria',
    name: 'O Império Assírio',
    year: -700,
    period: 'c. 745–612 a.C.',
    summary: 'A Assíria, com capital em Nínive, torna-se o primeiro grande império do Oriente: deporta povos inteiros, destrói o Reino do Norte (722 a.C.) e cerca Jerusalém (701 a.C.). Judá sobrevive como vassalo. É o tempo de Isaías, Miqueias, Oseias, Amós, Jonas e Naum.',
    powers: [
      { name: 'Império Assírio', color: C.assyria, polygon: [[33.0, 37.1], [36.5, 38.1], [39.5, 38.3], [43.0, 38.0], [45.5, 37.0], [47.2, 35.0], [48.2, 32.4], [47.6, 30.4], [46.0, 30.2], [43.5, 31.4], [40.0, 33.4], [38.0, 32.4], [36.8, 30.0], [35.0, 30.4], [34.3, 31.3], [34.9, 32.6], [35.6, 34.0], [35.8, 35.5], [34.5, 36.6]], label: [41.5, 36.0] },
      { name: 'Judá (vassalo)', color: C.judah, polygon: [[34.9, 31.95], [35.3, 31.95], [35.5, 31.85], [35.45, 31.4], [35.4, 31.0], [35.1, 30.85], [34.8, 31.05], [34.75, 31.5]], label: [35.1, 31.4] },
      { name: 'Egito (faraós cuxitas)', color: C.egypt, polygon: EGYPT_NILE, label: [31.2, 26.5], note: 'A Assíria chegou a conquistar o Egito entre 671 e 656 a.C.' },
      { name: 'Urartu (Ararate)', color: C.hittite, polygon: [[39.5, 38.4], [41.5, 40.5], [44.5, 41.0], [46.0, 39.6], [45.0, 38.0], [42.5, 38.1]], label: [43.0, 39.4] },
    ],
    peoples: [
      { name: 'Medos', lon: 48.6, lat: 35.6 },
      { name: 'Caldeus', lon: 46.0, lat: 31.2 },
      { name: 'Arábios', lon: 39.5, lat: 29.0 },
    ],
    events: [
      { year: '745 a.C.', text: 'Tiglate-Pileser III inicia as conquistas e deportações.', ref: '2Rs 15.29' },
      { year: '722 a.C.', text: 'Queda de Samaria.', ref: '2Rs 17.5-6' },
      { year: '701 a.C.', text: 'Senaqueribe cerca Jerusalém; Deus livra a cidade.', ref: '2Rs 19.35-36' },
      { year: '612 a.C.', text: 'Nínive é destruída por babilônios e medos.', ref: 'Na 3.7' },
    ],
    maps: ['cativeiros-de-israel'],
  },
  {
    id: 'babilonia',
    name: 'O Império Babilônico',
    year: -580,
    period: '612–539 a.C.',
    summary: 'Nabucodonosor vence o Egito em Carquemis (605 a.C.), domina a região e destrói Jerusalém e o templo em 586 a.C. Ao norte e a leste, os medos se fortalecem; na Ásia Menor, o rico reino da Lídia. É o tempo de Jeremias, Ezequiel, Daniel, Habacuque e Obadias.',
    powers: [
      { name: 'Império Babilônico', color: C.babylon, polygon: [[35.0, 30.5], [34.3, 31.3], [35.0, 33.0], [35.8, 35.5], [36.5, 37.0], [39.0, 37.3], [42.5, 37.0], [44.5, 35.5], [46.0, 33.5], [48.0, 31.0], [47.5, 29.5], [44.0, 30.0], [40.5, 31.5], [38.0, 30.0], [36.5, 29.5]], label: [41.5, 33.6] },
      { name: 'Média', color: C.media, polygon: [[44.5, 39.5], [48.0, 40.0], [53.0, 37.5], [56.0, 35.0], [53.0, 33.5], [48.0, 34.0], [45.5, 35.5], [44.0, 37.5]], label: [50.0, 36.4] },
      { name: 'Lídia', color: C.greece, polygon: [[26.5, 40.3], [31.0, 41.0], [33.5, 40.0], [33.3, 38.0], [30.0, 36.8], [27.3, 37.5], [26.2, 39.0]], label: [29.8, 38.8] },
      { name: 'Egito', color: C.egypt, polygon: EGYPT_NILE, label: [31.2, 26.5] },
    ],
    peoples: [
      { name: 'Judeus exilados', lon: 45.0, lat: 32.0 },
      { name: 'Persas', lon: 52.5, lat: 30.0 },
    ],
    events: [
      { year: '605 a.C.', text: 'Batalha de Carquemis; Daniel levado para a Babilônia.', ref: 'Dn 1.1-6' },
      { year: '597 a.C.', text: 'Segunda deportação, com Ezequiel.', ref: '2Rs 24.10-16' },
      { year: '586 a.C.', text: 'Jerusalém e o templo destruídos.', ref: '2Rs 25.8-10' },
      { year: '539 a.C.', text: 'A Babilônia cai diante de Ciro.', ref: 'Dn 5.30-31' },
    ],
    maps: ['exilio-na-babilonia'],
  },
  {
    id: 'persia',
    name: 'O Império Persa',
    year: -500,
    period: '539–331 a.C.',
    summary: 'Ciro, o Grande, cria o maior império que o mundo já tinha visto, do Egito e da Ásia Menor até a Índia. Os persas permitem a volta dos povos deportados: os judeus reconstroem o templo e os muros de Jerusalém na pequena província de Yehud (Judá). É o tempo de Esdras, Neemias, Ester, Ageu, Zacarias e Malaquias.',
    powers: [
      { name: 'Império Persa', color: C.persia, polygon: [[25.5, 41.8], [29.0, 41.4], [32.0, 42.2], [36.0, 41.8], [41.5, 41.6], [45.0, 41.8], [49.0, 40.6], [54.0, 38.6], [60.0, 37.6], [62.5, 35.0], [62.5, 26.0], [57.0, 25.5], [52.0, 27.5], [48.5, 29.8], [45.0, 29.5], [40.0, 30.5], [36.5, 29.0], [34.8, 29.5], [33.0, 28.0], [34.0, 26.0], [33.0, 23.0], [31.0, 22.0], [29.5, 25.0], [28.8, 30.0], [25.0, 31.8], [24.5, 36.0], [25.0, 39.5]], label: [44.5, 34.8] },
      { name: 'Yehud (Judá)', color: C.judah, polygon: [[34.95, 31.98], [35.5, 31.98], [35.5, 31.55], [35.0, 31.55]], label: [35.2, 31.75] },
    ],
    peoples: [
      { name: 'Cidades gregas', lon: 22.5, lat: 38.5 },
      { name: 'Árabes', lon: 41.0, lat: 27.0 },
    ],
    events: [
      { year: '538 a.C.', text: 'Decreto de Ciro: os judeus podem voltar.', ref: 'Ed 1.1-4' },
      { year: '516 a.C.', text: 'O segundo templo é concluído.', ref: 'Ed 6.15' },
      { year: '490 e 480 a.C.', text: 'Os persas são derrotados pelos gregos em Maratona e Salamina.' },
      { year: 'c. 480 a.C.', text: 'Ester rainha em Susã.', ref: 'Et 2.17' },
      { year: '445 a.C.', text: 'Neemias reconstrói os muros.', ref: 'Ne 6.15' },
    ],
    maps: [],
  },
  {
    id: 'alexandre',
    name: 'Alexandre, o Grande',
    year: -323,
    period: '334–323 a.C.',
    summary: 'Em dez anos, um rei de vinte e poucos anos derruba o Império Persa e dá ao mundo uma só cultura e uma só língua, o grego. A Judeia, uma pequena província no meio do caminho, passa sem guerra do domínio persa para o grego. Alexandre morre em 323 a.C., aos 32 anos, sem deixar um herdeiro capaz de governar o que conquistou.',
    powers: [
      { name: 'Império de Alexandre', color: C.greece, polygon: PERSIA_EMPIRE, label: [44.5, 34.8], note: 'O mesmo território dos persas, agora sob um rei grego; segue até a Índia, fora do mapa.' },
      { name: 'Macedônia e Grécia', color: C.greece, polygon: MACEDONIA, label: [22.6, 40.9] },
      { name: 'Judeia', color: C.judah, polygon: JUDAH_CORE, label: [35.2, 31.75], note: 'Muda de dono sem ser destruída (Josefo conta que Alexandre poupou Jerusalém; os historiadores têm dúvidas).' },
    ],
    peoples: [
      { name: 'Alexandria', lon: 29.9, lat: 31.2 },
      { name: 'Babilônia', lon: 44.4, lat: 32.5 },
    ],
    events: [
      { year: '334 a.C.', text: 'Alexandre atravessa para a Ásia com o seu exército.' },
      { year: '333 a.C.', text: 'Vence os persas em Isso: o bode derruba o carneiro.', ref: 'Dn 8.5-7' },
      { year: '332–331 a.C.', text: 'Toma Tiro e o Egito e funda Alexandria, onde viverá uma grande comunidade judaica.' },
      { year: '323 a.C.', text: 'Morre na Babilônia: “quebrou-se o grande chifre”.', ref: 'Dn 8.8' },
    ],
    maps: [],
  },
  {
    id: 'sucessores',
    name: 'Os quatro reinos dos sucessores',
    year: -300,
    period: '323–200 a.C.',
    summary: 'Depois da morte de Alexandre, os seus generais brigam por vinte anos. Em 301 a.C., na batalha de Ipsos, o império é dividido em quatro: Cassandro na Macedônia, Lisímaco na Trácia e na Ásia Menor, Seleuco na Síria e no Oriente e Ptolomeu no Egito. Daniel já tinha visto os “quatro chifres”. A Judeia fica com os Ptolomeus por mais de cem anos: o “rei do Sul” de Daniel 11 contra o “rei do Norte”, os Selêucidas, que são os vizinhos que sempre disputam a terra de Israel.',
    powers: [
      { name: 'Ptolomeus', color: C.egypt, polygon: PTOLEMAIC, label: [31.2, 28.0], note: 'O Egito e a Judeia, de c. 301 até c. 200 a.C. Em Alexandria, traduzem a Bíblia para o grego.' },
      { name: 'Selêucidas', color: C.greece, polygon: SELEUCID, label: [44.0, 34.4], note: 'A Síria e o Oriente: o “rei do Norte”.' },
      { name: 'Macedônia', color: C.rome, polygon: MACEDONIA, label: [23.6, 41.0], note: 'O reino de Cassandro.' },
      { name: 'Trácia e Ásia Menor', color: C.aram, polygon: WEST_ANATOLIA, label: [28.6, 40.4], note: 'O reino de Lisímaco; cai em 281 a.C. e é absorvido pelos vizinhos.' },
      { name: 'Judeia', color: C.judah, polygon: JUDAH_CORE, label: [35.2, 31.75], note: 'Governada pelo sumo sacerdote, sob os Ptolomeus.' },
    ],
    peoples: [
      { name: 'Alexandria', lon: 29.9, lat: 31.2 },
      { name: 'Antioquia', lon: 36.16, lat: 36.2 },
    ],
    events: [
      { year: '323 a.C.', text: 'Morre Alexandre; o reino se divide entre os generais.', ref: 'Dn 11.3-4' },
      { year: '301 a.C.', text: 'Batalha de Ipsos: o império em quatro reinos.', ref: 'Dn 8.8,22' },
      { year: 'c. 301 a.C.', text: 'A Judeia passa para os Ptolomeus, do Egito.' },
      { year: 'séc. III a.C.', text: 'As guerras entre o rei do Sul e o rei do Norte.', ref: 'Dn 11.5-9' },
      { year: 'c. 250 a.C.', text: 'Começa a tradução da Torá para o grego, em Alexandria.' },
      { year: 'c. 200 a.C.', text: 'Antíoco III, da Síria, vence os egípcios em Panion e toma a Judeia.', ref: 'Dn 11.15-16' },
    ],
    maps: [],
  },
  {
    id: 'macabeus',
    name: 'Selêucidas, Macabeus e a ascensão de Roma',
    year: -167,
    period: '200–142 a.C.',
    summary: 'A Judeia passa para os Selêucidas, da Síria. Antíoco IV, que queria tornar todos os súditos gregos, proíbe a religião de Israel e instala um altar pagão no Templo, em 167 a.C.: a “abominação da desolação” de Daniel. A família de Matatias se rebela e, em 164 a.C., o Templo é purificado. Ao fundo, uma nova potência aparece no Ocidente: Roma já derrotou a Macedônia e obriga até os reis a recuar.',
    powers: [
      { name: 'Selêucidas', color: C.greece, polygon: SELEUCID, label: [44.0, 34.4], note: 'A Síria e o Oriente. O rei Antíoco IV profana o Templo em 167 a.C.' },
      { name: 'Egito', color: C.egypt, polygon: EGYPT_ONLY, label: [31.2, 28.0], note: 'Dos Ptolomeus. Perde a Judeia; em 168 a.C., Roma obriga Antíoco IV a deixar o Egito.' },
      { name: 'Macedônia (Roma)', color: C.rome, polygon: MACEDONIA, label: [23.6, 41.0], note: 'Roma vence a Macedônia em Pidna (168 a.C.) e a faz província em 148 a.C.' },
      { name: 'Judeia (Selêucidas)', color: C.judah, polygon: JUDAH_CORE, label: [35.2, 31.75], note: 'A revolta dos Macabeus começa em Modin, em 167 a.C.' },
      { name: 'Os partos, em ascensão', color: C.parthia, polygon: PARTHIA_RISING, label: [58.5, 36.0] },
    ],
    peoples: [
      { name: 'Modin', lon: 34.92, lat: 31.9 },
      { name: 'Jerusalém', lon: 35.22, lat: 31.78 },
    ],
    events: [
      { year: 'c. 200 a.C.', text: 'A Judeia passa dos Ptolomeus aos Selêucidas.' },
      { year: '175 a.C.', text: 'Antíoco IV Epifânio sobe ao trono; sumo sacerdócio posto à venda.' },
      { year: '168 a.C.', text: 'Roma vence a Macedônia e ordena que Antíoco IV saia do Egito.', ref: 'Dn 11.29-30' },
      { year: '167 a.C.', text: 'O Templo é profanado: a “abominação da desolação”.', ref: 'Dn 11.31' },
      { year: '164 a.C.', text: 'Judas Macabeu purifica o Templo (Hanucá).', ref: 'Jo 10.22' },
      { year: '161 a.C.', text: 'Judas faz uma aliança com Roma.' },
    ],
    maps: [],
  },
  {
    id: 'asmoneus',
    name: 'O reino dos Asmoneus',
    year: -80,
    period: '142–63 a.C.',
    summary: 'Por menos de oitenta anos, os judeus têm um reino próprio, governado pela família dos Macabeus (os Asmoneus), que eram ao mesmo tempo sacerdotes e reis. No seu auge, o reino tem quase o tamanho do de Davi. Enquanto isso, os Selêucidas encolhem, os partos tomam o Oriente e Roma avança pela Ásia Menor. Uma guerra civil entre dois irmãos vai abrir a porta para os romanos.',
    powers: [
      { name: 'Reino dos Asmoneus', color: C.judah, polygon: HASMONEAN, label: [35.2, 32.1], note: 'Alexandre Janeu (103–76 a.C.) leva o reino à sua maior extensão.' },
      { name: 'Selêucidas (só a Síria)', color: C.greece, polygon: SELEUCID_SYRIA, label: [36.9, 35.9], note: 'O império encolhe até quase desaparecer.' },
      { name: 'Egito', color: C.egypt, polygon: EGYPT_ONLY, label: [31.2, 28.0], note: 'Ainda dos Ptolomeus, cada vez mais fraco.' },
      { name: 'Reino Nabateu', color: C.nabatea, polygon: NABATEAN, label: [36.6, 29.6] },
      { name: 'Império Parto', color: C.parthia, polygon: PARTHIA, label: [50.0, 33.6], note: 'Domina a Mesopotâmia e o planalto do Irã.' },
      { name: 'Ásia (Roma)', color: C.rome, polygon: ASIA_PROVINCE, label: [28.6, 38.9], note: 'Província romana desde 133 a.C.' },
      { name: 'Macedônia (Roma)', color: C.rome, polygon: MACEDONIA, label: [23.6, 41.0], note: 'Província romana desde 148 a.C.' },
    ],
    peoples: [
      { name: 'Idumeia', lon: 35.0, lat: 31.15 },
      { name: 'Samaria', lon: 35.25, lat: 32.25 },
    ],
    events: [
      { year: '142 a.C.', text: 'Simão alcança a independência: o jugo dos gentios é tirado.' },
      { year: '134–104 a.C.', text: 'João Hircano amplia o reino e converte os idumeus.' },
      { year: '104 a.C.', text: 'Aristóbulo I é o primeiro a se chamar “rei”.' },
      { year: '103–76 a.C.', text: 'Alexandre Janeu: o reino chega à maior extensão; guerra com os fariseus.' },
      { year: '67–63 a.C.', text: 'Guerra civil entre Hircano II e Aristóbulo II; os dois pedem a ajuda de Roma.' },
      { year: '63 a.C.', text: 'O general romano Pompeu toma Jerusalém: acaba a independência.' },
    ],
    maps: [],
  },
  {
    id: 'herodes',
    name: 'Roma chega: o reino de Herodes',
    year: -20,
    period: '63–4 a.C.',
    summary: 'Depois de Pompeu, a Judeia passa a pagar tributo a Roma. A Síria vira província romana, e em 30 a.C. o Egito também. O Senado faz de Herodes, um idumeu, “rei dos judeus”, em 40 a.C.: um rei aliado de Roma, com um território quase tão grande quanto o dos Asmoneus. É o mundo em que Jesus vai nascer.',
    powers: [
      { name: 'Roma', color: C.rome, polygon: ROME_EAST, label: [29.0, 41.2], note: 'Inclui a Síria (província desde 64 a.C.) e o Egito (desde 30 a.C.).' },
      { name: 'Reino de Herodes', color: C.judah, polygon: HEROD_KINGDOM, label: [35.3, 32.3], note: 'Rei aliado de Roma (37–4 a.C.); reconstruiu o Templo.' },
      { name: 'Reino Nabateu', color: C.nabatea, polygon: NABATEAN, label: [36.6, 29.6] },
      { name: 'Império Parto', color: C.parthia, polygon: PARTHIA, label: [50.0, 33.6], note: 'O grande rival de Roma no Oriente.' },
    ],
    peoples: [
      { name: 'Jerusalém', lon: 35.22, lat: 31.78 },
      { name: 'Belém', lon: 35.2, lat: 31.7 },
    ],
    events: [
      { year: '63 a.C.', text: 'Pompeu toma Jerusalém; a Judeia paga tributo a Roma.' },
      { year: '40 a.C.', text: 'O Senado romano faz Herodes “rei dos judeus”.' },
      { year: '37 a.C.', text: 'Herodes conquista Jerusalém.' },
      { year: '27 a.C.', text: 'Augusto, o primeiro imperador: começa a paz romana.' },
      { year: 'c. 20 a.C.', text: 'Herodes começa a reconstruir o Templo.', ref: 'Jo 2.20' },
      { year: 'c. 6–4 a.C.', text: 'Jesus nasce em Belém, no fim do reinado de Herodes.', ref: 'Mt 2.1' },
    ],
    maps: [],
  },
  {
    id: 'roma',
    name: 'O mundo romano',
    year: 30,
    period: '4 a.C. – 100 d.C.',
    summary: 'Roma domina o Mediterrâneo: estradas, paz romana e o grego como língua comum abrem caminho para o Evangelho. A Palestina do tempo de Jesus está dividida: Galileia e Pereia com Herodes Antipas, Judeia e Samaria com um governador romano (Pôncio Pilatos), o norte com o tetrarca Filipe, e as dez cidades gregas da Decápolis. A leste, o Império Parto é o grande rival de Roma.',
    powers: [
      { name: 'Império Romano', color: C.rome, polygon: [[19.0, 42.8], [28.5, 42.2], [29.5, 41.3], [33.0, 42.2], [36.0, 41.8], [39.0, 41.2], [40.5, 40.5], [39.5, 38.5], [38.5, 37.6], [40.0, 36.6], [38.8, 35.5], [38.0, 33.0], [36.6, 32.4], [35.7, 31.3], [34.9, 29.8], [33.0, 28.6], [32.6, 30.0], [31.8, 27.6], [33.1, 24.2], [32.8, 22], [31, 22], [30.6, 25], [30.2, 28], [29.0, 29.5], [25.0, 30.6], [19.0, 30.4]], label: [33.5, 39.2] },
      { name: 'Galileia (Herodes Antipas)', color: C.israel, polygon: PALESTINE_ROMAN.galileia, label: [35.35, 32.85] },
      { name: 'Pereia (Herodes Antipas)', color: C.israel, polygon: PALESTINE_ROMAN.pereia, label: [35.72, 31.95] },
      { name: 'Judeia e Samaria (governador romano)', color: C.judah, polygon: PALESTINE_ROMAN.judeia, label: [35.1, 31.9] },
      { name: 'Decápolis', color: C.greece, polygon: PALESTINE_ROMAN.decapolis, label: [36.0, 32.5] },
      { name: 'Tetrarquia de Filipe', color: C.aram, polygon: PALESTINE_ROMAN.filipe, label: [36.1, 33.1] },
      { name: 'Reino Nabateu', color: C.nabatea, polygon: [[35.6, 31.35], [36.8, 32.0], [38.2, 30.5], [37.6, 27.4], [35.2, 28.0], [34.95, 29.6], [35.5, 30.9]], label: [36.6, 29.6] },
      { name: 'Império Parto', color: C.parthia, polygon: [[40.5, 38.5], [44.0, 39.0], [48.0, 38.5], [54.0, 38.0], [60.0, 38.0], [62.5, 36.0], [62.5, 26.0], [57.0, 25.5], [52.0, 27.5], [48.0, 29.5], [45.0, 30.0], [41.5, 33.0], [40.5, 35.5], [39.5, 36.5], [40.0, 38.0]], label: [50.0, 34.0] },
    ],
    peoples: [
      { name: 'Samaritanos', lon: 35.25, lat: 32.25 },
      { name: 'Idumeia', lon: 35.0, lat: 31.15 },
    ],
    events: [
      { year: '63 a.C.', text: 'O general romano Pompeu toma Jerusalém.' },
      { year: '37–4 a.C.', text: 'Herodes, o Grande, reina e reconstrói o templo.', ref: 'Mt 2.1' },
      { year: 'c. 6–4 a.C.', text: 'Nascimento de Jesus em Belém.', ref: 'Lc 2.1-7' },
      { year: 'c. 30 d.C.', text: 'Crucificação e ressurreição; Pentecostes.', ref: 'At 2.1-4' },
      { year: '46–57 d.C.', text: 'As viagens de Paulo.', ref: 'At 13.2-4' },
      { year: '70 d.C.', text: 'Os romanos destroem Jerusalém e o templo.', ref: 'Lc 21.20-24' },
    ],
    maps: ['nascimento-de-jesus', 'vida-de-jesus', 'ministerio-na-galileia', 'discipulos-apos-a-cruz', 'primeira-viagem-de-paulo', 'segunda-viagem-de-paulo', 'viagem-a-roma'],
  },
];

export const findEra = (id: string) => ERAS.find((e) => e.id === id);
export const eraOfMap = (mapId: string) => ERAS.find((e) => e.maps.includes(mapId));

/** Lugares de referência mostrados ao redor dos mapas. */
export const GAZETTEER: GazetteerPlace[] = [
  // Terra de Israel
  { name: 'Belém', lon: 35.2, lat: 31.7, kind: 'cidade' },
  { name: 'Hebrom', lon: 35.1, lat: 31.53, kind: 'cidade' },
  { name: 'Berseba', lon: 34.79, lat: 31.24, kind: 'cidade' },
  { name: 'Gaza', lon: 34.46, lat: 31.5, kind: 'cidade' },
  { name: 'Asquelom', lon: 34.55, lat: 31.66, kind: 'cidade' },
  { name: 'Asdode', lon: 34.65, lat: 31.8, kind: 'cidade' },
  { name: 'Ecrom', lon: 34.85, lat: 31.78, kind: 'cidade' },
  { name: 'Gate', lon: 34.85, lat: 31.7, kind: 'cidade' },
  { name: 'Laquis', lon: 34.85, lat: 31.56, kind: 'cidade' },
  { name: 'Jope', lon: 34.75, lat: 32.05, kind: 'cidade', alt: 'Jafa' },
  { name: 'Cesareia', lon: 34.89, lat: 32.5, kind: 'cidade', from: -22 },
  { name: 'Megido', lon: 35.18, lat: 32.58, kind: 'cidade' },
  { name: 'Jezreel', lon: 35.33, lat: 32.56, kind: 'cidade' },
  { name: 'Bete-Seã', lon: 35.5, lat: 32.5, kind: 'cidade', alt: 'Citópolis' },
  { name: 'Samaria', lon: 35.19, lat: 32.28, kind: 'cidade', from: -880 },
  { name: 'Siquém', lon: 35.28, lat: 32.21, kind: 'cidade' },
  { name: 'Siló', lon: 35.29, lat: 32.06, kind: 'cidade' },
  { name: 'Betel', lon: 35.22, lat: 31.93, kind: 'cidade' },
  { name: 'Gibeom', lon: 35.18, lat: 31.85, kind: 'cidade' },
  { name: 'Jericó', lon: 35.44, lat: 31.87, kind: 'cidade' },
  { name: 'Jerusalém', lon: 35.23, lat: 31.78, kind: 'cidade' },
  { name: 'Nazaré', lon: 35.3, lat: 32.7, kind: 'cidade' },
  { name: 'Caná', lon: 35.34, lat: 32.75, kind: 'cidade' },
  { name: 'Naim', lon: 35.35, lat: 32.63, kind: 'cidade' },
  { name: 'Cafarnaum', lon: 35.57, lat: 32.88, kind: 'cidade' },
  { name: 'Corazim', lon: 35.56, lat: 32.91, kind: 'cidade' },
  { name: 'Magdala', lon: 35.52, lat: 32.82, kind: 'cidade' },
  { name: 'Tiberíades', lon: 35.53, lat: 32.79, kind: 'cidade', from: 20 },
  { name: 'Gadara', lon: 35.68, lat: 32.65, kind: 'cidade' },
  { name: 'Hazor', lon: 35.57, lat: 33.02, kind: 'cidade' },
  { name: 'Dã', lon: 35.65, lat: 33.25, kind: 'cidade' },
  { name: 'Cesareia de Filipe', lon: 35.69, lat: 33.25, kind: 'cidade', from: -2 },
  { name: 'Gerasa', lon: 35.89, lat: 32.28, kind: 'cidade', alt: 'Jerash' },
  { name: 'Rabá', lon: 35.93, lat: 31.95, kind: 'cidade', alt: 'Amã' },
  { name: 'Hesbom', lon: 35.8, lat: 31.8, kind: 'cidade' },
  { name: 'Dibom', lon: 35.78, lat: 31.5, kind: 'cidade' },
  { name: 'Petra', lon: 35.44, lat: 30.33, kind: 'cidade', alt: 'Sela' },
  { name: 'Cades-Barneia', lon: 34.42, lat: 30.65, kind: 'cidade' },
  { name: 'Eziom-Geber', lon: 34.98, lat: 29.55, kind: 'cidade' },
  // Fenícia e Síria
  { name: 'Tiro', lon: 35.2, lat: 33.27, kind: 'cidade' },
  { name: 'Sidom', lon: 35.37, lat: 33.56, kind: 'cidade' },
  { name: 'Biblos', lon: 35.65, lat: 34.12, kind: 'cidade', alt: 'Gebal' },
  { name: 'Damasco', lon: 36.29, lat: 33.51, kind: 'cidade' },
  { name: 'Hamate', lon: 36.75, lat: 35.13, kind: 'cidade' },
  { name: 'Ribla', lon: 36.55, lat: 34.45, kind: 'cidade' },
  { name: 'Antioquia', lon: 36.16, lat: 36.2, kind: 'cidade', from: -300 },
  { name: 'Ebla', lon: 36.8, lat: 35.8, kind: 'cidade' },
  { name: 'Alepo', lon: 37.16, lat: 36.2, kind: 'cidade' },
  { name: 'Carquemis', lon: 38.01, lat: 36.83, kind: 'cidade' },
  { name: 'Harã', lon: 39.03, lat: 36.86, kind: 'cidade' },
  { name: 'Tarso', lon: 34.9, lat: 36.92, kind: 'cidade' },
  // Mesopotâmia e Pérsia
  { name: 'Mari', lon: 40.89, lat: 34.55, kind: 'cidade' },
  { name: 'Nínive', lon: 43.15, lat: 36.36, kind: 'cidade' },
  { name: 'Assur', lon: 43.26, lat: 35.46, kind: 'cidade' },
  { name: 'Calá', lon: 43.33, lat: 36.1, kind: 'cidade', alt: 'Nimrud' },
  { name: 'Babilônia', lon: 44.42, lat: 32.54, kind: 'cidade' },
  { name: 'Quis', lon: 44.6, lat: 32.55, kind: 'cidade' },
  { name: 'Nipur', lon: 45.23, lat: 32.13, kind: 'cidade' },
  { name: 'Ereque', lon: 45.64, lat: 31.32, kind: 'cidade', alt: 'Uruk' },
  { name: 'Ur', lon: 46.1, lat: 30.96, kind: 'cidade' },
  { name: 'Susã', lon: 48.25, lat: 32.19, kind: 'cidade' },
  { name: 'Ecbatana', lon: 48.52, lat: 34.8, kind: 'cidade', alt: 'Hamadã' },
  { name: 'Persépolis', lon: 52.89, lat: 29.93, kind: 'cidade', from: -518 },
  // Egito
  { name: 'Mênfis', lon: 31.25, lat: 29.85, kind: 'cidade', alt: 'Nofe' },
  { name: 'Om', lon: 31.31, lat: 30.13, kind: 'cidade', alt: 'Heliópolis' },
  { name: 'Zoã', lon: 31.88, lat: 30.97, kind: 'cidade', alt: 'Tânis' },
  { name: 'Tafnes', lon: 32.18, lat: 30.97, kind: 'cidade' },
  { name: 'Tebas', lon: 32.65, lat: 25.7, kind: 'cidade', alt: 'Nô' },
  { name: 'Alexandria', lon: 29.92, lat: 31.2, kind: 'cidade', from: -331 },
  // Ásia Menor e Grécia
  { name: 'Éfeso', lon: 27.34, lat: 37.94, kind: 'cidade' },
  { name: 'Esmirna', lon: 27.14, lat: 38.42, kind: 'cidade' },
  { name: 'Pérgamo', lon: 27.18, lat: 39.13, kind: 'cidade' },
  { name: 'Sardes', lon: 28.04, lat: 38.49, kind: 'cidade' },
  { name: 'Laodiceia', lon: 29.11, lat: 37.84, kind: 'cidade' },
  { name: 'Mileto', lon: 27.28, lat: 37.53, kind: 'cidade' },
  { name: 'Atenas', lon: 23.72, lat: 37.97, kind: 'cidade' },
  { name: 'Corinto', lon: 22.88, lat: 37.91, kind: 'cidade' },
  { name: 'Tessalônica', lon: 22.94, lat: 40.64, kind: 'cidade', from: -315 },
  // Montes
  { name: 'Monte Sinai', lon: 33.97, lat: 28.54, kind: 'monte', alt: 'Horebe (tradicional)' },
  { name: 'Monte Nebo', lon: 35.73, lat: 31.77, kind: 'monte' },
  { name: 'Monte Carmelo', lon: 35.0, lat: 32.73, kind: 'monte' },
  { name: 'Monte Tabor', lon: 35.39, lat: 32.69, kind: 'monte' },
  { name: 'Monte Hermom', lon: 35.86, lat: 33.42, kind: 'monte' },
  { name: 'Monte Gilboa', lon: 35.42, lat: 32.47, kind: 'monte' },
  { name: 'Ebal e Gerizim', lon: 35.27, lat: 32.21, kind: 'monte' },
  { name: 'Monte Ararate', lon: 44.3, lat: 39.7, kind: 'monte' },
  { name: 'Montes do Líbano', lon: 35.95, lat: 34.05, kind: 'monte' },
  // Águas
  { name: 'Mar Grande (Mediterrâneo)', lon: 30.5, lat: 33.6, kind: 'agua' },
  { name: 'Mar Salgado (Mar Morto)', lon: 35.5, lat: 31.45, kind: 'agua' },
  { name: 'Mar da Galileia', lon: 35.59, lat: 32.82, kind: 'agua', alt: 'Quinerete, Tiberíades' },
  { name: 'Mar Vermelho', lon: 37.5, lat: 23.5, kind: 'agua' },
  { name: 'Golfo Pérsico', lon: 51.0, lat: 27.2, kind: 'agua' },
  { name: 'Mar Negro', lon: 34.0, lat: 42.8, kind: 'agua' },
  { name: 'Mar Cáspio', lon: 51.2, lat: 39.0, kind: 'agua' },
  { name: 'Mar Egeu', lon: 25.0, lat: 38.6, kind: 'agua' },
  // Rios
  { name: 'Rio Jordão', lon: 35.57, lat: 32.15, kind: 'rio' },
  { name: 'Rio Nilo', lon: 31.0, lat: 27.3, kind: 'rio' },
  { name: 'Rio Eufrates', lon: 40.0, lat: 35.6, kind: 'rio' },
  { name: 'Rio Tigre', lon: 43.7, lat: 34.9, kind: 'rio' },
  { name: 'Ribeiro de Jaboque', lon: 35.75, lat: 32.2, kind: 'rio' },
  { name: 'Ribeiro de Arnom', lon: 35.75, lat: 31.45, kind: 'rio' },
  { name: 'Ribeiro de Quisom', lon: 35.1, lat: 32.68, kind: 'rio' },
  { name: 'Rio Orontes', lon: 36.6, lat: 35.4, kind: 'rio' },
  { name: 'Rio Habor', lon: 40.7, lat: 36.2, kind: 'rio' },
  // Desertos e regiões naturais
  { name: 'Deserto do Sinai', lon: 33.8, lat: 29.6, kind: 'deserto' },
  { name: 'Neguebe', lon: 34.8, lat: 30.75, kind: 'deserto' },
  { name: 'Deserto da Arábia', lon: 40.5, lat: 29.0, kind: 'deserto' },
  { name: 'Deserto da Síria', lon: 39.0, lat: 33.0, kind: 'deserto' },
  { name: 'Arabá', lon: 35.2, lat: 30.4, kind: 'deserto' },
];

/** Países atuais (nomes). As fronteiras atuais vêm do Natural Earth, junto com a geografia de cada mapa. */
export const MODERN_COUNTRIES: { name: string; lon: number; lat: number }[] = [
  { name: 'Egito', lon: 30.0, lat: 26.0 },
  { name: 'Israel', lon: 34.85, lat: 30.6 },
  { name: 'Jordânia', lon: 36.8, lat: 30.8 },
  { name: 'Líbano', lon: 35.9, lat: 33.85 },
  { name: 'Síria', lon: 38.6, lat: 35.2 },
  { name: 'Iraque', lon: 43.8, lat: 33.0 },
  { name: 'Irã', lon: 54.0, lat: 32.5 },
  { name: 'Turquia', lon: 35.5, lat: 39.2 },
  { name: 'Arábia Saudita', lon: 44.0, lat: 24.5 },
  { name: 'Grécia', lon: 21.8, lat: 39.8 },
  { name: 'Chipre', lon: 33.1, lat: 35.05 },
  { name: 'Kuwait', lon: 47.6, lat: 29.3 },
];

/** O mapa-base do atlas (sem rota). */
export const ATLAS_MAP: BibleMap = {
  id: 'atlas',
  title: 'Atlas do mundo bíblico',
  period: 'c. 3000 a.C. – 100 d.C.',
  summary: 'Os reinos e impérios das terras da Bíblia, época por época.',
  icon: 'public',
  bounds: [19.0, 22.0, 62.5, 43.0],
  places: [],
  steps: [],
  route: false,
  zoom: 0.04,
  chapters: [],
};

/** Distância em linha reta (km) entre dois pontos. */
export function distanceKm(a: { lon: number; lat: number }, b: { lon: number; lat: number }): number {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

/** "≈ 1.240 km" (arredondado para um número fácil de ler). */
export function formatKm(km: number): string {
  const rounded = km < 20 ? Math.round(km) : km < 200 ? Math.round(km / 5) * 5 : Math.round(km / 10) * 10;
  return `≈ ${rounded.toLocaleString('pt-BR')} km`;
}

/** As épocas do mapa "entre os Testamentos", em ordem (do último profeta ao nascimento de Jesus). */
export const BRIDGE_ERAS = ['persia', 'alexandre', 'sucessores', 'macabeus', 'asmoneus', 'herodes'];

/** O Mediterrâneo oriental, de perto: o Egito, a Síria e Israel no meio (mesma geografia do atlas). */
export const BRIDGE_MAP: BibleMap = {
  ...ATLAS_MAP,
  // Dois pontos invisíveis (sem nome) só para a câmera enquadrar: a geografia do atlas é a mesma
  places: [
    { id: 'canto-oeste', name: '', lon: 24.6, lat: 40.6, region: true },
    { id: 'canto-leste', name: '', lon: 45.6, lat: 28.6, region: true },
  ],
};
/** Lugares que a câmera do mapa das épocas enquadra. */
export const BRIDGE_FOCUS = ['canto-oeste', 'canto-leste'];
