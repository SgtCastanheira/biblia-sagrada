import type { Lonlat } from './atlas';
import { distanceKm, formatKm } from './atlas';
import type { BibleMap, MapPlace, MapStep } from './maps';

/**
 * As doze tribos de Israel: o patriarca, as bênçãos de Jacó e de Moisés, a vocação que a Bíblia
 * descreve, os líderes de cada tribo, os censos, o acampamento no deserto e o território (Josué 13–21).
 * As fronteiras são aproximadas (traçadas a partir de Js 13–19); o mapa as recorta pelo litoral.
 */

export type CampSide = 'leste' | 'sul' | 'oeste' | 'norte' | 'centro';

export interface Leader {
  /** Ofício: "Príncipe da tribo no deserto". */
  office: string;
  name: string;
  ref: string;
}

export interface TribePerson {
  name: string;
  /** Id no Memorial da Fé. */
  person?: string;
  note: string;
  ref: string;
}

export interface Territory {
  /** Id do lugar no mapa (o território principal tem o id da tribo). */
  id: string;
  name: string;
  /** Ponto do número no mapa e de onde se mede a distância (centro aproximado). */
  center: Lonlat;
  polygon: Lonlat[];
  ref: string;
  /** Uma frase, usada no mapa. */
  summary: string;
  cities: string;
}

export interface Tribe {
  id: string;
  name: string;
  color: string;
  /** Vocação, numa linha. */
  role: string;
  /** Curiosidade que abre o estudo da tribo ("Você sabia?"). */
  hook: { text: string; ref: string };
  meaning: string;
  /** Filho de Jacó (ou neto, no caso de Efraim e Manassés). */
  father: string;
  mother: string;
  /** Ordem de nascimento entre os filhos de Jacó. */
  order?: number;
  birthRef: string;
  /** Patriarca no Memorial da Fé. */
  person?: string;
  /** O que a Bíblia descreve como vocação da tribo (texto com [[referências]]). */
  calling: string;
  jacob: { ref: string; text: string };
  moses: { ref: string; text: string } | { ref: null; text: string };
  census: { sinai: number; moab: number; refs: string; note?: string };
  camp: { side: CampSide; text: string };
  leaders: Leader[];
  territories: Territory[];
  /** Texto sobre a herança (com [[referências]]). */
  land: string;
  people: TribePerson[];
  history: string;
}

/** Onde estava o templo (monte Moriá) e o tabernáculo nos dias de Josué. */
export const TEMPLE: { lon: number; lat: number } = { lon: 35.235, lat: 31.778 };
export const SHILOH: { lon: number; lat: number } = { lon: 35.29, lat: 32.055 };

// Vértices compartilhados entre territórios vizinhos (longitude, latitude)
const V = {
  jordanMouth: [35.53, 31.77],
  adumim: [35.38, 31.8],
  hinom: [35.23, 31.765],
  kiriathJearim: [35.1, 31.81],
  bethShemesh: [34.98, 31.75],
  ekron: [34.85, 31.78],
  jabneel: [34.7, 31.92],
  seaJabneel: [34.45, 31.95],
  bethHoron: [35.08, 31.88],
  bethel: [35.22, 31.93],
  jordanJericho: [35.53, 31.92],
  gezer: [34.92, 31.88],
  yarkon: [34.8, 32.1],
  seaYarkon: [34.5, 32.12],
  seaKanah: [34.55, 32.2],
  kanah: [34.83, 32.18],
  kanahEast: [35.05, 32.15],
  michmethath: [35.25, 32.17],
  janoah: [35.4, 32.13],
  jordanJabbok: [35.55, 32.1],
  jordanBethShan: [35.56, 32.48],
  gilboa: [35.38, 32.48],
  megiddo: [35.2, 32.57],
  issacharWest: [35.14, 32.625],
  jokneam: [35.08, 32.68],
  carmel: [34.97, 32.83],
  seaCarmel: [34.75, 32.85],
  jordanGalilee: [35.58, 32.7],
  tabor: [35.39, 32.69],
  taborEast: [35.45, 32.72],
  zebulunMid: [35.28, 32.66],
  zebulunNorth: [35.45, 32.8],
  zebulunNw: [35.32, 32.86],
  iphtahel: [35.2, 32.83],
  zebulunWest: [35.1, 32.75],
  asherEast: [35.38, 33.05],
  asherNorth: [35.42, 33.3],
  sidon: [35.48, 33.55],
  galileeNorth: [35.6, 32.9],
  hula: [35.62, 33.1],
  laishWest: [35.6, 33.25],
  hermonWest: [35.55, 33.4],
  simeonNw: [34.3, 31.38],
  simeonN: [34.7, 31.4],
  simeonNe: [35.0, 31.32],
  simeonE: [35.12, 31.18],
  simeonSe: [35.05, 30.98],
  simeonS: [34.6, 30.98],
  simeonSw: [34.25, 31.05],
  reubenNw: [35.56, 31.85],
  heshbon: [35.8, 31.85],
  reubenNe: [36.1, 31.82],
  gileadW: [35.58, 32.42],
  mahanaim: [35.75, 32.3],
  ammonN: [36.0, 32.22],
} satisfies Record<string, Lonlat>;

export const TRIBES: Tribe[] = [
  {
    id: 'ruben',
    name: 'Rúben',
    color: '#b5654b',
    role: 'O primogênito que perdeu a primazia',
    hook: { text: 'Era o primogênito e perdeu o lugar de líder — mas foi ele quem tentou salvar José da morte.', ref: 'Gn 37.21-22' },
    meaning: 'Vede, um filho',
    father: 'Jacó',
    mother: 'Lia',
    order: 1,
    birthRef: 'Gn 29.32',
    calling:
      'Como primogênito, Rúben teria a liderança e a porção dobrada, mas perdeu esse direito por ter se deitado com Bila, a concubina do pai [[Gn 35.22]]. A primogenitura passou a José e a liderança a Judá [[1Cr 5.1-2]]. A tribo era de criadores de gado e por isso pediu as pastagens a leste do Jordão [[Nm 32.1-5]]. Rúben também mostra um lado bom: tentou salvar José da morte [[Gn 37.21-22]].',
    jacob: { ref: 'Gn 49.3-4', text: 'Jacó reconhece a dignidade do primogênito, mas declara: “não reterás a preeminência”. A instabilidade (“descomedido como a água”) custou-lhe a liderança.' },
    moses: { ref: 'Dt 33.6', text: 'Moisés pede que Rúben viva e não desapareça — uma oração pela sobrevivência de uma tribo pequena e exposta, na fronteira com Moabe.' },
    census: { sinai: 46500, moab: 43730, refs: 'Nm 1.20-21; Nm 26.5-7' },
    camp: { side: 'sul', text: 'Ao sul do tabernáculo, à frente do segundo grupo (Rúben, Simeão e Gade), que marchava em segundo lugar.' },
    leaders: [
      { office: 'Príncipe da tribo no deserto', name: 'Elizur, filho de Sedeur', ref: 'Nm 1.5' },
      { office: 'Espia enviado a Canaã', name: 'Samua, filho de Zacur', ref: 'Nm 13.4' },
      { office: 'Chefe da tribo no tempo de Davi', name: 'Eliézer, filho de Zicri', ref: '1Cr 27.16' },
    ],
    territories: [
      {
        id: 'ruben',
        name: 'Rúben',
        center: [35.85, 31.65],
        polygon: [V.reubenNw, V.heshbon, V.reubenNe, [36.1, 31.45], [35.83, 31.45], [35.6, 31.45], [35.58, 31.62], V.jordanMouth],
        ref: 'Js 13.15-23',
        summary: 'o planalto a leste do mar Morto, do rio Arnom até Hesbom — terra de pastagens, na fronteira com Moabe',
        cities: 'Aroer, Dibom, Medeba, Hesbom e Bezer (cidade de refúgio)',
      },
    ],
    land: 'Moisés deu a Rúben, Gade e meia tribo de Manassés a terra a leste do Jordão, com uma condição: os homens atravessariam armados e lutariam com os irmãos até que todos recebessem a sua parte [[Nm 32.20-33]]. Eles cumpriram [[Js 4.12]] [[Js 22.1-6]]. A divisa sul de Rúben era o rio Arnom, a fronteira com Moabe.',
    people: [
      { name: 'Datã, Abirão e Om', note: 'Rubenitas que se rebelaram com Corá contra Moisés e Arão.', ref: 'Nm 16.1-3' },
      { name: 'Adina', note: 'Chefe dos rubenitas entre os valentes de Davi.', ref: '1Cr 11.42' },
    ],
    history:
      'No cântico de Débora, Rúben ficou entre os currais, dividido e indeciso, e não foi à batalha [[Jz 5.15-16]]. Por estar a leste do Jordão, aberto ao deserto, guerreou com os hagarenos e confiou em Deus [[1Cr 5.18-22]], mas também foi uma das primeiras tribos levadas pela Assíria [[1Cr 5.26]].',
  },
  {
    id: 'simeao',
    name: 'Simeão',
    color: '#7a6a4f',
    role: 'Espalhado no meio de Judá',
    hook: { text: 'Entre os dois censos do deserto, Simeão encolheu de 59.300 para 22.200 homens: a maior queda de todas.', ref: 'Nm 26.14' },
    meaning: 'Ouvir (“o Senhor ouviu”)',
    father: 'Jacó',
    mother: 'Lia',
    order: 2,
    birthRef: 'Gn 29.33',
    calling:
      'A Bíblia não atribui a Simeão uma função própria. A sua história é marcada pela violência em Siquém, quando Simeão e Levi vingaram Diná [[Gn 34.25-31]]. Por isso Jacó anunciou que seriam espalhados em Israel [[Gn 49.7]]. Para Simeão isso se cumpriu literalmente: recebeu cidades dentro do território de Judá [[Js 19.1-9]] e acabou absorvido por ele.',
    jacob: { ref: 'Gn 49.5-7', text: 'Simeão e Levi são repreendidos juntos pela violência. “Dividi-los-ei em Jacó, e os espalharei em Israel.”' },
    moses: { ref: null, text: 'Simeão é a única tribo que Moisés não menciona na bênção de Deuteronômio 33 — sinal de que já era pequena e estava se juntando a Judá.' },
    census: {
      sinai: 59300,
      moab: 22200,
      refs: 'Nm 1.22-23; Nm 26.12-14',
      note: 'A maior queda entre os dois censos. Muitos a ligam à praga de Baal-Peor, que começou com um príncipe simeonita [[Nm 25.9-14]].',
    },
    camp: { side: 'sul', text: 'Ao sul do tabernáculo, no grupo de Rúben.' },
    leaders: [
      { office: 'Príncipe da tribo no deserto', name: 'Selumiel, filho de Zurisadai', ref: 'Nm 1.6' },
      { office: 'Espia enviado a Canaã', name: 'Safate, filho de Hori', ref: 'Nm 13.5' },
      { office: 'Repartidor da terra', name: 'Semuel, filho de Amiúde', ref: 'Nm 34.20' },
      { office: 'Chefe da tribo no tempo de Davi', name: 'Sefatias, filho de Maacá', ref: '1Cr 27.16' },
    ],
    territories: [
      {
        id: 'simeao',
        name: 'Simeão',
        center: [34.75, 31.18],
        polygon: [V.simeonNw, V.simeonN, V.simeonNe, V.simeonE, V.simeonSe, V.simeonS, V.simeonSw],
        ref: 'Js 19.1-9',
        summary: 'cidades no Neguebe, o sul seco, dentro do território de Judá',
        cities: 'Berseba, Ziclague, Horma e Sarúen',
      },
    ],
    land: 'A parte de Judá era grande demais para ele; por isso Simeão recebeu cidades no meio dela [[Js 19.9]]. As duas tribos lutaram juntas na conquista [[Jz 1.3]]. Berseba, a cidade de Abraão e Isaque [[Gn 21.31]], ficou com Simeão.',
    people: [
      { name: 'Zinri', note: 'Príncipe simeonita morto por Fineias no pecado de Baal-Peor.', ref: 'Nm 25.14' },
    ],
    history:
      'Simeonitas ainda aparecem como grupo no tempo de Ezequias, quando conquistaram pastagens em Gedor e no monte Seir [[1Cr 4.38-43]]. Alguns se juntaram ao rei Asa em Judá, ao verem que o Senhor estava com ele [[2Cr 15.9]]. Em Apocalipse, Simeão está entre as tribos seladas [[Ap 7.7]].',
  },
  {
    id: 'levi',
    name: 'Levi',
    color: '#6d5d8a',
    role: 'O culto: sacerdotes e levitas',
    hook: { text: 'É a única tribo que não ganhou terra: “o Senhor, Deus de Israel, é a sua herança”.', ref: 'Js 13.33' },
    meaning: 'Unido (“agora se unirá meu marido a mim”)',
    father: 'Jacó',
    mother: 'Lia',
    order: 3,
    birthRef: 'Gn 29.34',
    calling:
      'É a única tribo com uma função dada por Deus na Lei. Os sacerdotes, filhos de Arão, ofereciam os sacrifícios [[Êx 28.1]]. Os demais levitas cuidavam do tabernáculo e o transportavam no deserto: gersonitas, coatitas e meraritas [[Nm 3.5-10]] [[Nm 4.1-33]]. Também ensinavam a Lei ao povo [[Dt 33.10]] [[Ne 8.7-8]] e, no templo, foram organizados por Davi como cantores, porteiros e oficiais [[1Cr 23.2-6]]. Os levitas ficaram no lugar dos primogênitos de Israel [[Nm 3.12]].',
    jacob: { ref: 'Gn 49.5-7', text: 'A mesma repreensão de Simeão: Levi seria espalhado em Israel. Mas a dispersão virou bênção — os levitas foram espalhados para servir em todas as tribos.' },
    moses: { ref: 'Dt 33.8-11', text: 'Levi recebe o Urim e o Tumim, a missão de ensinar os preceitos de Deus e de oferecer o incenso e os holocaustos. A fidelidade dos levitas no episódio do bezerro de ouro [[Êx 32.26-29]] mudou a sua história.' },
    census: {
      sinai: 22000,
      moab: 23000,
      refs: 'Nm 3.39; Nm 26.62',
      note: 'Levi era contado à parte: todos os homens de um mês para cima, e não os de vinte anos que iam à guerra [[Nm 1.47-49]].',
    },
    camp: { side: 'centro', text: 'Em volta do tabernáculo, entre ele e as outras tribos: Moisés e os sacerdotes a leste, os coatitas ao sul, os gersonitas a oeste e os meraritas ao norte [[Nm 3.23-38]].' },
    leaders: [
      { office: 'Sumo sacerdote', name: 'Arão, irmão de Moisés', ref: 'Êx 28.1' },
      { office: 'Príncipe dos príncipes dos levitas', name: 'Eleazar, filho de Arão', ref: 'Nm 3.32' },
      { office: 'Repartidor da terra (com Josué)', name: 'Eleazar, o sacerdote', ref: 'Nm 34.17' },
      { office: 'Chefe no tempo de Davi', name: 'Hasabias, filho de Quemuel; sobre os aronitas, Zadoque', ref: '1Cr 27.17' },
    ],
    territories: [],
    land: 'Levi não recebeu território: “o Senhor, Deus de Israel, é a sua herança” [[Js 13.33]] [[Nm 18.20-24]]. Viviam dos dízimos e recebiam 48 cidades com pastagens em volta, espalhadas por todas as tribos [[Nm 35.1-8]] [[Js 21.1-42]]. Treze delas, em Judá, Simeão e Benjamim, eram dos sacerdotes [[Js 21.4]]. Seis eram cidades de refúgio [[Js 20.7-9]].',
    people: [
      { name: 'Moisés', person: 'moises', note: 'Filho de Anrão e Joquebede, da casa de Levi.', ref: 'Êx 2.1-2' },
      { name: 'Arão', person: 'arao', note: 'Irmão de Moisés, o primeiro sumo sacerdote.', ref: 'Êx 6.20' },
      { name: 'Miriã', person: 'miria', note: 'Irmã de Moisés e de Arão, profetisa.', ref: 'Êx 15.20' },
      { name: 'Eli', person: 'eli', note: 'Sacerdote em Siló, onde estava o tabernáculo.', ref: '1Sm 1.9' },
      { name: 'Samuel', person: 'samuel', note: 'Levita pela genealogia, morava na região de Efraim.', ref: '1Cr 6.33-38' },
      { name: 'Jeremias', person: 'jeremias', note: 'Dos sacerdotes de Anatote, uma cidade levita em Benjamim.', ref: 'Jr 1.1' },
      { name: 'Ezequiel', person: 'ezequiel', note: 'Sacerdote levado ao exílio na Babilônia.', ref: 'Ez 1.3' },
      { name: 'Esdras', person: 'esdras', note: 'Sacerdote e escriba, descendente de Arão.', ref: 'Ed 7.1-6' },
      { name: 'João Batista', person: 'joao-batista', note: 'Filho do sacerdote Zacarias e de Isabel, descendente de Arão.', ref: 'Lc 1.5' },
      { name: 'Barnabé', person: 'barnabe', note: 'Levita natural de Chipre.', ref: 'At 4.36' },
    ],
    history:
      'Quando o reino se dividiu, os levitas do Norte foram expulsos por Jeroboão e vieram para Judá [[2Cr 11.13-14]]. Malaquias lembra a aliança de Deus com Levi e cobra dos sacerdotes o ensino fiel [[Ml 2.4-7]]. Hebreus mostra que Jesus é sacerdote de outra ordem, a de Melquisedeque, e não da tribo de Levi [[Hb 7.11-17]].',
  },
  {
    id: 'juda',
    name: 'Judá',
    color: '#c9a14a',
    role: 'A realeza e a liderança',
    hook: { text: 'Dela vieram Davi e Jesus, “o Leão da tribo de Judá” — e é de Judá que vem a palavra “judeu”.', ref: 'Ap 5.5' },
    meaning: 'Louvor (“esta vez louvarei ao Senhor”)',
    father: 'Jacó',
    mother: 'Lia',
    order: 4,
    birthRef: 'Gn 29.35',
    person: 'juda',
    calling:
      'Judá recebeu o cetro: a liderança e a realeza [[Gn 49.10]] [[1Cr 5.2]]. No deserto, a sua bandeira ia na frente da marcha [[Nm 10.14]]. Depois de Josué, Deus mandou que Judá subisse primeiro contra os cananeus [[Jz 1.1-2]]. Dele veio Davi e a dinastia a quem Deus prometeu um reino eterno [[2Sm 7.12-16]] e, dela, o Messias, “o Leão da tribo de Judá” [[Ap 5.5]] [[Hb 7.14]]. A palavra “judeu” vem de Judá.',
    jacob: { ref: 'Gn 49.8-12', text: 'A bênção mais longa de Jacó: Judá é o leãozinho a quem os irmãos se prostrarão, e “o cetro não se arredará de Judá… até que venha aquele a quem pertence” — texto lido desde a antiguidade como promessa do Messias.' },
    moses: { ref: 'Dt 33.7', text: 'Moisés pede que Deus ouça a voz de Judá e seja o seu auxílio na luta — a tribo que iria à frente nas batalhas.' },
    census: { sinai: 74600, moab: 76500, refs: 'Nm 1.26-27; Nm 26.19-22', note: 'A maior tribo nos dois censos.' },
    camp: { side: 'leste', text: 'A leste, diante da entrada do tabernáculo, à frente do primeiro grupo (Judá, Issacar e Zebulom), que marchava na frente.' },
    leaders: [
      { office: 'Príncipe da tribo no deserto', name: 'Nasom, filho de Aminadabe', ref: 'Nm 1.7' },
      { office: 'Espia enviado a Canaã', name: 'Calebe, filho de Jefoné', ref: 'Nm 13.6' },
      { office: 'Repartidor da terra', name: 'Calebe, filho de Jefoné', ref: 'Nm 34.19' },
      { office: 'Chefe da tribo no tempo de Davi', name: 'Eliú, um dos irmãos de Davi', ref: '1Cr 27.18' },
    ],
    territories: [
      {
        id: 'juda',
        name: 'Judá',
        center: [35.1, 31.5],
        polygon: [
          V.jordanMouth, V.adumim, V.hinom, V.kiriathJearim, V.bethShemesh, V.ekron, V.jabneel, V.seaJabneel, [34.1, 31.55],
          V.simeonNw, V.simeonN, V.simeonNe, V.simeonE, V.simeonSe, V.simeonS, V.simeonSw,
          [34.3, 30.7], [35.3, 30.7], [35.4, 31.05], [35.42, 31.4], [35.45, 31.6],
        ],
        ref: 'Js 15.1-12',
        summary: 'o maior território: as montanhas de Hebrom e Belém, o deserto de Judá e o Neguebe, até o vale de Hinom, em Jerusalém',
        cities: 'Hebrom, Belém, Laquis, Debir, Tecoa e En-Gedi',
      },
    ],
    land: 'Judá foi a primeira tribo a receber a sua parte a oeste do Jordão [[Js 15.1]]. Calebe, aos 85 anos, pediu e conquistou Hebrom [[Js 14.6-15]]. A divisa norte passava pelo vale de Hinom, logo ao sul de Jerusalém [[Js 15.8]]. As cidades dos filisteus no litoral foram atribuídas a Judá [[Js 15.45-47]], mas não foram conquistadas, e os jebuseus continuaram em Jerusalém [[Js 15.63]].',
    people: [
      { name: 'Calebe', person: 'calebe', note: 'Um dos dois espias fiéis; recebeu Hebrom.', ref: 'Js 14.13-14' },
      { name: 'Otniel', person: 'otniel', note: 'O primeiro juiz, sobrinho de Calebe.', ref: 'Jz 3.9' },
      { name: 'Bezaleel', note: 'O artífice cheio do Espírito que construiu o tabernáculo.', ref: 'Êx 31.2-5' },
      { name: 'Boaz', person: 'boaz', note: 'De Belém, bisavô de Davi.', ref: 'Rt 4.18-22' },
      { name: 'Davi', person: 'davi', note: 'O rei segundo o coração de Deus.', ref: '1Sm 16.1' },
      { name: 'Salomão', person: 'salomao', note: 'Construiu o templo em Jerusalém.', ref: '1Rs 6.1' },
      { name: 'Amós', person: 'amos', note: 'Pastor de Tecoa, profeta enviado ao Norte.', ref: 'Am 1.1' },
      { name: 'Daniel', person: 'daniel', note: 'Dos filhos de Judá levados à Babilônia.', ref: 'Dn 1.6' },
      { name: 'Zorobabel', person: 'zorobabel', note: 'Descendente de Davi, liderou a volta do exílio.', ref: 'Ed 3.2' },
      { name: 'Jesus Cristo', note: 'O Leão da tribo de Judá, o Filho de Davi.', ref: 'Mt 1.1-3' },
    ],
    history:
      'Com a divisão do reino, Judá e Benjamim formaram o Reino do Sul, com a capital em Jerusalém e os reis da casa de Davi [[1Rs 12.21]]. O reino durou até a destruição de Jerusalém pela Babilônia, em 586 a.C. [[2Rs 25.8-11]]. Depois do exílio, quem voltou e reconstruiu o templo foi sobretudo o povo de Judá e Benjamim [[Ed 1.5]].',
  },
  {
    id: 'da',
    name: 'Dã',
    color: '#6b84b8',
    role: 'O juiz e a retaguarda',
    hook: { text: 'É a única tribo que não aparece entre os 144 mil selados de Apocalipse 7.', ref: 'Ap 7.4-8' },
    meaning: 'Julgou (“julgou-me Deus”)',
    father: 'Jacó',
    mother: 'Bila, serva de Raquel',
    order: 5,
    birthRef: 'Gn 30.6',
    calling:
      'Jacó disse que Dã “julgará o seu povo” [[Gn 49.16]], e foi de Dã que veio Sansão, um dos juízes de Israel [[Jz 13.2]] [[Jz 16.31]]. Na marcha do deserto, o grupo de Dã era a retaguarda, que recolhia todos os arraiais [[Nm 10.25]]. Um danita, Aoliabe, trabalhou com Bezaleel, de Judá, na construção do tabernáculo [[Êx 31.6]] [[Êx 38.23]].',
    jacob: { ref: 'Gn 49.16-18', text: 'Dã julgará o seu povo; mas também será “serpente junto ao caminho” — uma tribo pequena que vence pela astúcia. A bênção termina com uma oração: “A tua salvação tenho esperado, ó Senhor!”' },
    moses: { ref: 'Dt 33.22', text: 'Dã é “cachorro de leão, que salta de Basã” — talvez uma alusão à mudança da tribo para o extremo norte, perto de Basã.' },
    census: { sinai: 62700, moab: 64400, refs: 'Nm 1.38-39; Nm 26.42-43', note: 'A segunda maior tribo, embora Dã tivesse um único filho, Husim [[Gn 46.23]].' },
    camp: { side: 'norte', text: 'Ao norte do tabernáculo, à frente do quarto grupo (Dã, Aser e Naftali), que fechava a marcha como retaguarda.' },
    leaders: [
      { office: 'Príncipe da tribo no deserto', name: 'Aiezer, filho de Amisadai', ref: 'Nm 2.25' },
      { office: 'Espia enviado a Canaã', name: 'Amiel, filho de Gemali', ref: 'Nm 13.12' },
      { office: 'Repartidor da terra', name: 'Buqui, filho de Jógli', ref: 'Nm 34.22' },
      { office: 'Chefe da tribo no tempo de Davi', name: 'Azarel, filho de Jeroão', ref: '1Cr 27.22' },
    ],
    territories: [
      {
        id: 'da',
        name: 'Dã',
        center: [34.85, 31.9],
        polygon: [V.bethHoron, V.kiriathJearim, V.bethShemesh, V.ekron, V.jabneel, V.seaJabneel, V.seaYarkon, V.yarkon, V.gezer],
        ref: 'Js 19.40-46',
        summary: 'uma faixa pequena entre Judá, Efraim e o mar, perto de Jope',
        cities: 'Zorá, Estaol, Aijalom, Timna e Ecrom',
      },
      {
        id: 'da-norte',
        name: 'Dã (Laís)',
        center: [35.67, 33.26],
        polygon: [V.laishWest, V.hermonWest, [35.75, 33.38], [35.85, 33.22], [35.75, 33.12], V.hula],
        ref: 'Jz 18.27-29',
        summary: 'apertada pelos amorreus e pelos filisteus, a tribo conquista Laís, no extremo norte, e lhe dá o nome de Dã',
        cities: 'Laís, que passou a se chamar Dã',
      },
    ],
    land: 'O território de Dã era pequeno e disputado: os amorreus não deixavam os danitas descer à planície [[Jz 1.34]]. Por isso parte da tribo migrou para o norte e tomou Laís [[Js 19.47]] [[Jz 18.1-29]]. Dali vem a expressão “de Dã até Berseba”, de um extremo ao outro de Israel [[Jz 20.1]] [[1Sm 3.20]].',
    people: [
      { name: 'Aoliabe', note: 'Artífice que trabalhou no tabernáculo.', ref: 'Êx 31.6' },
      { name: 'Sansão', person: 'sansao', note: 'Juiz e nazireu, de Zorá.', ref: 'Jz 13.2-5' },
    ],
    history:
      'Em Laís, os danitas levantaram uma imagem esculpida e tiveram sacerdotes próprios [[Jz 18.30-31]]. Mais tarde, Jeroboão pôs ali um dos bezerros de ouro [[1Rs 12.28-30]]. Dã é a única tribo que não aparece na lista dos selados de Apocalipse [[Ap 7.4-8]]. Mesmo assim, recebe a primeira porção na divisão da terra que Ezequiel viu [[Ez 48.1-2]].',
  },
  {
    id: 'naftali',
    name: 'Naftali',
    color: '#3f9e8f',
    role: 'As palavras formosas e a Galileia',
    hook: { text: 'Isaías anunciou uma grande luz sobre a terra de Naftali — e foi ali que Jesus começou a pregar.', ref: 'Mt 4.13-16' },
    meaning: 'Minha luta (“com grandes lutas tenho lutado”)',
    father: 'Jacó',
    mother: 'Bila, serva de Raquel',
    order: 6,
    birthRef: 'Gn 30.8',
    calling:
      'Jacó compara Naftali a uma gazela solta, que “profere palavras formosas” [[Gn 49.21]]. A Bíblia não descreve um ofício para a tribo; ela aparece pela coragem: Baraque, de Quedes-Naftali, liderou a vitória sobre Sísera [[Jz 4.6-10]], e o cântico de Débora diz que Naftali se expôs à morte [[Jz 5.18]]. A região de Naftali e Zebulom foi onde Jesus morou e pregou, cumprindo a profecia da “grande luz” [[Is 9.1-2]] [[Mt 4.13-16]].',
    jacob: { ref: 'Gn 49.21', text: '“Naftali é uma gazela solta; ele profere palavras formosas.” Liberdade e beleza na palavra.' },
    moses: { ref: 'Dt 33.23', text: 'Naftali é “saciado de favores e farto da bênção do Senhor” e possui “o lago” — o lago de Quinerete, a Galileia.' },
    census: { sinai: 53400, moab: 45400, refs: 'Nm 1.42-43; Nm 26.48-50' },
    camp: { side: 'norte', text: 'Ao norte do tabernáculo, no grupo de Dã.' },
    leaders: [
      { office: 'Príncipe da tribo no deserto', name: 'Airá, filho de Enã', ref: 'Nm 1.15' },
      { office: 'Espia enviado a Canaã', name: 'Nabi, filho de Vofsi', ref: 'Nm 13.14' },
      { office: 'Repartidor da terra', name: 'Pedael, filho de Amiúde', ref: 'Nm 34.28' },
      { office: 'Chefe da tribo no tempo de Davi', name: 'Jerimote, filho de Azriel', ref: '1Cr 27.19' },
    ],
    territories: [
      {
        id: 'naftali',
        name: 'Naftali',
        center: [35.47, 33.02],
        polygon: [V.taborEast, V.jordanGalilee, V.galileeNorth, V.hula, V.laishWest, V.hermonWest, V.sidon, V.asherNorth, V.asherEast, V.zebulunNw, V.zebulunNorth],
        ref: 'Js 19.32-39',
        summary: 'a alta Galileia, a oeste do lago de Quinerete e do alto Jordão',
        cities: 'Hazor, Quedes (cidade de refúgio), Quinerete e Bete-Semes da Galileia',
      },
    ],
    land: 'Naftali ficou com a alta Galileia, uma região de montes e de terras férteis em volta do lago [[Js 19.32-39]]. Quedes, em Naftali, foi uma das seis cidades de refúgio [[Js 20.7]].',
    people: [
      { name: 'Baraque', person: 'baraque', note: 'Chamado por Débora para enfrentar Sísera.', ref: 'Jz 4.6' },
      { name: 'Hirão, o artífice', note: 'Filho de uma viúva de Naftali; fez as obras de bronze do templo de Salomão.', ref: '1Rs 7.13-14' },
    ],
    history:
      'Por ficar no norte, no caminho dos exércitos, Naftali foi uma das primeiras regiões tomadas pela Assíria, por Tiglate-Pileser, por volta de 732 a.C. [[2Rs 15.29]]. Isaías anunciou que justamente ali, na terra humilhada, brilharia uma grande luz [[Is 9.1-2]]. Jesus foi morar em Cafarnaum, “nos confins de Zabulom e Naftali” [[Mt 4.13]].',
  },
  {
    id: 'gade',
    name: 'Gade',
    color: '#3f7d9e',
    role: 'Guerreiros da fronteira',
    hook: { text: 'Os guerreiros de Gade que seguiram Davi tinham “rostos como de leões” e eram “ligeiros como corças sobre os montes”.', ref: '1Cr 12.8' },
    meaning: 'Afortunado (boa sorte)',
    father: 'Jacó',
    mother: 'Zilpa, serva de Lia',
    order: 7,
    birthRef: 'Gn 30.11',
    calling:
      'Gade é a tribo dos guerreiros. Vivia a leste do Jordão, exposta aos ataques do deserto, e Jacó disse que seria acometida, mas acometeria por fim [[Gn 49.19]]. Os gaditas que se juntaram a Davi eram “homens valentes… seus rostos eram como rostos de leões, e eles eram tão ligeiros como corças sobre os montes” [[1Cr 12.8]]. Como Rúben, criava muito gado [[Nm 32.1]].',
    jacob: { ref: 'Gn 49.19', text: '“Guerrilheiros o acometerão; mas ele, por sua vez, os acometerá.” Uma tribo de fronteira, sempre atacada e sempre resistindo.' },
    moses: { ref: 'Dt 33.20-21', text: 'Gade “habita como a leoa”, escolheu a primeira parte da terra e, ainda assim, foi com os chefes do povo cumprir a justiça do Senhor — atravessou o Jordão para lutar pelos irmãos.' },
    census: { sinai: 45650, moab: 40500, refs: 'Nm 1.24-25; Nm 26.15-18' },
    camp: { side: 'sul', text: 'Ao sul do tabernáculo, no grupo de Rúben.' },
    leaders: [
      { office: 'Príncipe da tribo no deserto', name: 'Eliasafe, filho de Deuel (Reuel em Nm 2.14)', ref: 'Nm 1.14' },
      { office: 'Espia enviado a Canaã', name: 'Geuel, filho de Maqui', ref: 'Nm 13.15' },
    ],
    territories: [
      {
        id: 'gade',
        name: 'Gade',
        center: [35.82, 32.08],
        polygon: [V.reubenNw, [35.57, 32.1], V.gileadW, V.mahanaim, V.ammonN, [36.1, 32.0], V.reubenNe, V.heshbon],
        ref: 'Js 13.24-28',
        summary: 'Gileade, a leste do Jordão, entre Rúben e Manassés, até a fronteira de Amom',
        cities: 'Jazer, Ramote-Gileade (cidade de refúgio), Maanaim e Sucote',
      },
    ],
    land: 'Gade ficou com a terra de Gileade a leste do Jordão, incluindo o vale do Jordão até o mar de Quinerete [[Js 13.24-28]]. Ramote-Gileade, em Gade, foi cidade de refúgio [[Js 20.8]]. A lista dos chefes das tribos no tempo de Davi não menciona Gade nem Aser [[1Cr 27.16-22]].',
    people: [
      { name: 'Os valentes gaditas', note: 'Guerreiros que atravessaram o Jordão na cheia para se juntar a Davi.', ref: '1Cr 12.8-15' },
    ],
    history:
      'Gade, Rúben e a meia tribo de Manassés levantaram um altar junto ao Jordão como testemunho de que também pertenciam ao Senhor, o que quase causou uma guerra até tudo ser explicado [[Js 22.10-34]]. Estiveram entre os primeiros levados cativos pela Assíria [[1Cr 5.26]].',
  },
  {
    id: 'aser',
    name: 'Aser',
    color: '#7d8f3a',
    role: 'Fartura e azeite',
    hook: { text: 'Mais de 700 anos depois de a Assíria levar o Norte, uma profetisa de Aser reconheceu o menino Jesus no templo.', ref: 'Lc 2.36-38' },
    meaning: 'Feliz (“feliz sou eu!”)',
    father: 'Jacó',
    mother: 'Zilpa, serva de Lia',
    order: 8,
    birthRef: 'Gn 30.13',
    calling:
      'A Bíblia associa Aser à fartura: “o seu pão será gordo; ele produzirá delícias reais” [[Gn 49.20]], e Moisés diz “mergulhe em azeite o seu pé” [[Dt 33.24]]. A tribo ficou com a planície fértil do litoral norte, terra de oliveiras. Não há um ofício descrito; a vocação está na bênção da terra.',
    jacob: { ref: 'Gn 49.20', text: 'Pão farto e “delícias reais” — produtos finos, dignos da mesa de reis.' },
    moses: { ref: 'Dt 33.24-25', text: 'Aser é favorecido pelos irmãos, rico em azeite, protegido por ferrolhos de ferro e bronze: “como os teus dias, assim seja a tua força”.' },
    census: { sinai: 41500, moab: 53400, refs: 'Nm 1.40-41; Nm 26.44-47' },
    camp: { side: 'norte', text: 'Ao norte do tabernáculo, no grupo de Dã.' },
    leaders: [
      { office: 'Príncipe da tribo no deserto', name: 'Pagiel, filho de Ocrã', ref: 'Nm 1.13' },
      { office: 'Espia enviado a Canaã', name: 'Setur, filho de Micael', ref: 'Nm 13.13' },
      { office: 'Repartidor da terra', name: 'Aiúde, filho de Selômi', ref: 'Nm 34.27' },
    ],
    territories: [
      {
        id: 'aser',
        name: 'Aser',
        center: [35.24, 33.1],
        polygon: [V.carmel, V.jokneam, V.zebulunWest, V.iphtahel, V.zebulunNw, V.asherEast, V.asherNorth, V.sidon, [35.2, 33.6], [34.95, 33.0], V.seaCarmel],
        ref: 'Js 19.24-31',
        summary: 'a planície do litoral norte, do monte Carmelo até perto de Sidom',
        cities: 'Aco, Acsafe, Aczibe e a região de Tiro',
      },
    ],
    land: 'O território de Aser ia do Carmelo até a região de Tiro e Sidom [[Js 19.24-31]]. Mas Aser não expulsou os cananeus de Aco, Sidom e outras cidades, e passou a morar no meio deles [[Jz 1.31-32]].',
    people: [
      { name: 'Ana, a profetisa', person: 'ana-profetisa', note: 'Filha de Fanuel, da tribo de Aser; reconheceu o menino Jesus no templo.', ref: 'Lc 2.36-38' },
    ],
    history:
      'Aser não veio à batalha contra Sísera e ficou nos seus portos [[Jz 5.17]]. Séculos depois, quando Ezequias convidou o Norte para a Páscoa, alguns de Aser se humilharam e vieram a Jerusalém [[2Cr 30.11]]. A profetisa Ana, no templo, mostra que a identidade da tribo continuava viva no tempo de Jesus [[Lc 2.36]].',
  },
  {
    id: 'issacar',
    name: 'Issacar',
    color: '#b07a2e',
    role: 'O discernimento dos tempos e o trabalho no campo',
    hook: { text: 'Os seus chefes eram “entendidos na ciência dos tempos, para saberem o que Israel devia fazer”.', ref: '1Cr 12.32' },
    meaning: 'Recompensa (“Deus me tem dado o meu galardão”)',
    father: 'Jacó',
    mother: 'Lia',
    order: 9,
    birthRef: 'Gn 30.18',
    calling:
      'Os chefes de Issacar que se juntaram a Davi eram “entendidos na ciência dos tempos, para saberem o que Israel devia fazer” [[1Cr 12.32]] — por isso Issacar é lembrado pelo discernimento. Jacó o descreve como um jumento forte, que viu que a terra era boa e aceitou a carga do trabalho [[Gn 49.14-15]]: a tribo ficou com o vale de Jezreel, a terra mais fértil de Israel.',
    jacob: { ref: 'Gn 49.14-15', text: 'Um jumento forte, que gosta do descanso e da terra agradável, e por isso se sujeita à carga — trabalho pesado, e talvez até o tributo a povos mais fortes.' },
    moses: { ref: 'Dt 33.18-19', text: 'Junto com Zebulom: “e tu, Issacar, nas tuas tendas”. As duas tribos chamariam os povos ao monte para oferecer sacrifícios de justiça.' },
    census: { sinai: 54400, moab: 64300, refs: 'Nm 1.28-29; Nm 26.23-25' },
    camp: { side: 'leste', text: 'A leste do tabernáculo, no grupo de Judá, que marchava na frente.' },
    leaders: [
      { office: 'Príncipe da tribo no deserto', name: 'Netanel, filho de Zuar', ref: 'Nm 1.8' },
      { office: 'Espia enviado a Canaã', name: 'Ioal, filho de José', ref: 'Nm 13.7' },
      { office: 'Repartidor da terra', name: 'Paltiel, filho de Azã', ref: 'Nm 34.26' },
      { office: 'Chefe da tribo no tempo de Davi', name: 'Onri, filho de Micael', ref: '1Cr 27.18' },
    ],
    territories: [
      {
        id: 'issacar',
        name: 'Issacar',
        center: [35.4, 32.6],
        polygon: [V.megiddo, V.gilboa, V.jordanBethShan, V.jordanGalilee, V.taborEast, V.tabor, V.zebulunMid, V.issacharWest],
        ref: 'Js 19.17-23',
        summary: 'o vale de Jezreel e o monte Tabor, as terras mais férteis do país',
        cities: 'Jezreel, Suném, Quesulote e En-Ganim',
      },
    ],
    land: 'O território de Issacar era pequeno, mas rico: a planície de Jezreel, do monte Tabor até o Jordão [[Js 19.17-23]]. Era também o grande campo de batalha do país, por onde passavam os exércitos — ali Gideão venceu os midianitas [[Jz 6.33]] e Saul caiu no Gilboa [[1Sm 31.1]].',
    people: [
      { name: 'Tola', person: 'tola', note: 'Juiz de Israel por 23 anos.', ref: 'Jz 10.1-2' },
      { name: 'Baasa', person: 'baasa', note: 'Rei de Israel, da casa de Issacar.', ref: '1Rs 15.27' },
      { name: 'Os chefes entendidos', note: 'Duzentos chefes que sabiam o que Israel devia fazer.', ref: '1Cr 12.32' },
    ],
    history:
      'Os príncipes de Issacar foram com Débora e Baraque à batalha [[Jz 5.15]]. Na Páscoa de Ezequias, muitos de Issacar vieram a Jerusalém, e o rei orou por eles [[2Cr 30.18-20]].',
  },
  {
    id: 'zebulom',
    name: 'Zebulom',
    color: '#4f7fb0',
    role: 'O comércio e o caminho do mar',
    hook: { text: 'Jacó disse que Zebulom moraria no litoral — mas as fronteiras traçadas por Josué não chegam ao mar.', ref: 'Gn 49.13' },
    meaning: 'Morada (“agora morará comigo meu marido”)',
    father: 'Jacó',
    mother: 'Lia',
    order: 10,
    birthRef: 'Gn 30.20',
    calling:
      'Jacó disse que Zebulom habitaria no litoral e seria ancoradouro de navios [[Gn 49.13]], e Moisés fala da “abundância dos mares” [[Dt 33.18-19]]: Zebulom é lembrado pelo comércio. As fronteiras de Josué, porém, não chegam ao mar [[Js 19.10-16]]. A tribo ficava perto do litoral e do “caminho do mar” [[Is 9.1]], a grande estrada do comércio. Zebulom também foi valente na batalha contra Sísera [[Jz 5.18]].',
    jacob: { ref: 'Gn 49.13', text: '“Zebulom habitará no litoral; será ele ancoradouro de navios; e o seu termo estender-se-á até Sidom.”' },
    moses: { ref: 'Dt 33.18-19', text: '“Zebulom, alegra-te nas tuas saídas” — as viagens e o comércio — “porque chuparão a abundância dos mares e os tesouros escondidos da areia.”' },
    census: { sinai: 57400, moab: 60500, refs: 'Nm 1.30-31; Nm 26.26-27' },
    camp: { side: 'leste', text: 'A leste do tabernáculo, no grupo de Judá.' },
    leaders: [
      { office: 'Príncipe da tribo no deserto', name: 'Eliabe, filho de Helom', ref: 'Nm 1.9' },
      { office: 'Espia enviado a Canaã', name: 'Gadiel, filho de Sódi', ref: 'Nm 13.10' },
      { office: 'Repartidor da terra', name: 'Elizafã, filho de Parnaque', ref: 'Nm 34.25' },
      { office: 'Chefe da tribo no tempo de Davi', name: 'Ismaías, filho de Obadias', ref: '1Cr 27.19' },
    ],
    territories: [
      {
        id: 'zebulom',
        name: 'Zebulom',
        center: [35.27, 32.76],
        polygon: [V.jokneam, V.issacharWest, V.zebulunMid, V.tabor, V.taborEast, V.zebulunNorth, V.zebulunNw, V.iphtahel, V.zebulunWest],
        ref: 'Js 19.10-16',
        summary: 'a baixa Galileia, entre o Carmelo e o lago — a região onde depois ficou Nazaré',
        cities: 'Sarida, Daberate, Jafia, Gate-Hefer e Belém de Zebulom',
      },
    ],
    land: 'Zebulom ficou com as colinas da baixa Galileia [[Js 19.10-16]], entre Aser, Naftali e Issacar. Nazaré, onde Jesus cresceu, ficava nessa região, mas não é citada no Antigo Testamento.',
    people: [
      { name: 'Elom', person: 'elom', note: 'Juiz de Israel por dez anos.', ref: 'Jz 12.11-12' },
      { name: 'Jonas', person: 'jonas', note: 'O profeta era de Gate-Hefer, uma cidade de Zebulom.', ref: '2Rs 14.25' },
    ],
    history:
      'Zebulom e Naftali arriscaram a vida na batalha de Débora [[Jz 5.18]], e cinquenta mil de Zebulom vieram ajudar Davi, “de coração inteiro” [[1Cr 12.33]]. Alguns de Zebulom foram à Páscoa de Ezequias [[2Cr 30.11]]. Jesus cresceu nessa terra e começou o seu ministério “na terra de Zabulom e na terra de Naftali” [[Mt 4.15-16]].',
  },
  {
    id: 'efraim',
    name: 'Efraim',
    color: '#6f8f4e',
    role: 'A liderança do Norte',
    hook: { text: 'Uma única palavra separou a vida da morte de 42 mil efraimitas: “Chibolete”.', ref: 'Jz 12.5-6' },
    meaning: 'Frutífero (“Deus me fez crescer na terra da minha aflição”)',
    father: 'José (adotado por Jacó)',
    mother: 'Asenate',
    birthRef: 'Gn 41.52',
    person: 'jose',
    calling:
      'Efraim e Manassés são filhos de José, mas Jacó os adotou como filhos [[Gn 48.5]]: assim José, que recebeu a primogenitura [[1Cr 5.1-2]], ficou com duas porções. Ao abençoá-los, Jacó pôs o mais novo, Efraim, à frente [[Gn 48.19-20]]. Efraim liderou o Norte: dela vieram Josué e Jeroboão, e o tabernáculo ficou em Siló, no seu território [[Js 18.1]]. Os profetas chamam o Reino do Norte simplesmente de “Efraim” [[Is 7.2]] [[Os 11.8]].',
    jacob: { ref: 'Gn 49.22-26', text: 'José é o “ramo frutífero junto a uma fonte”, perseguido pelos flecheiros, mas firmado pelo Poderoso de Jacó. As maiores bênçãos de Jacó repousam sobre ele — e passam a Efraim e Manassés.' },
    moses: { ref: 'Dt 33.13-17', text: 'A terra de José será abençoada com o orvalho, as fontes e os frutos; “tais são as miríades de Efraim, e tais são os milhares de Manassés”.' },
    census: { sinai: 40500, moab: 32500, refs: 'Nm 1.32-33; Nm 26.35-37' },
    camp: { side: 'oeste', text: 'A oeste do tabernáculo, à frente do terceiro grupo (Efraim, Manassés e Benjamim) — as tribos de Raquel.' },
    leaders: [
      { office: 'Príncipe da tribo no deserto', name: 'Elisama, filho de Amiúde', ref: 'Nm 1.10' },
      { office: 'Espia enviado a Canaã', name: 'Oseias (Josué), filho de Num', ref: 'Nm 13.8' },
      { office: 'Repartidor da terra', name: 'Quemuel, filho de Siftã', ref: 'Nm 34.24' },
      { office: 'Chefe da tribo no tempo de Davi', name: 'Oseias, filho de Azazias', ref: '1Cr 27.20' },
    ],
    territories: [
      {
        id: 'efraim',
        name: 'Efraim',
        center: [35.1, 32.06],
        polygon: [V.jordanJericho, V.bethel, V.bethHoron, V.gezer, V.yarkon, V.seaYarkon, V.seaKanah, V.kanah, V.kanahEast, V.michmethath, V.janoah, V.jordanJabbok],
        ref: 'Js 16.1-10',
        summary: 'a região montanhosa central, com Siló, onde ficou o tabernáculo, e Siquém',
        cities: 'Siló, Siquém (cidade de refúgio), Timnate-Sera e Gezer',
      },
    ],
    land: 'Efraim recebeu a região montanhosa central [[Js 16.5-9]], com Siló, onde o tabernáculo ficou por gerações [[Js 18.1]] [[1Sm 1.3]], e Siquém, cidade de refúgio [[Js 20.7]]. Os filhos de José reclamaram que a terra era pouca; Josué mandou que desmatassem os montes [[Js 17.14-18]]. Josué recebeu a sua herança em Timnate-Sera, em Efraim [[Js 19.49-50]].',
    people: [
      { name: 'Josué', person: 'josue', note: 'O sucessor de Moisés, que liderou a conquista e a partilha.', ref: 'Nm 13.8' },
      { name: 'Jeroboão I', person: 'jeroboao-i', note: 'O primeiro rei do Reino do Norte.', ref: '1Rs 11.26' },
    ],
    history:
      'Efraim era orgulhosa: reclamou com Gideão [[Jz 8.1-3]] e lutou contra Jefté, quando os efraimitas foram reconhecidos por não saberem dizer “Chibolete” [[Jz 12.1-6]]. Depois de Salomão, Jeroboão, um efraimita, levou as dez tribos a se separarem [[1Rs 12.16-20]]. O Reino do Norte caiu diante da Assíria em 722 a.C. [[2Rs 17.5-6]], mas Deus diz por Oseias: “Como te deixaria, ó Efraim?” [[Os 11.8]].',
  },
  {
    id: 'manasses',
    name: 'Manassés',
    color: '#a36b8f',
    role: 'Uma tribo nos dois lados do Jordão',
    hook: { text: 'Cinco irmãs desta tribo pediram herança a Moisés — e mudaram a lei de Israel.', ref: 'Nm 27.1-8' },
    meaning: 'Fazer esquecer (“Deus me fez esquecer de todo o meu trabalho”)',
    father: 'José (adotado por Jacó)',
    mother: 'Asenate',
    birthRef: 'Gn 41.51',
    person: 'jose',
    calling:
      'Manassés era o primogênito de José, mas Jacó deu a precedência a Efraim [[Gn 48.13-20]]. É a tribo dividida em duas metades: uma a leste do Jordão, em Gileade e Basã, que Maquir e Jair conquistaram [[Nm 32.39-42]]; outra a oeste, ao norte de Efraim [[Js 17.7-11]]. Foi de Manassés que veio Gideão [[Jz 6.15]]. As filhas de Zelofeade, também de Manassés, conseguiram que as mulheres pudessem herdar a terra quando não havia filhos homens [[Nm 27.1-8]].',
    jacob: { ref: 'Gn 48.13-20', text: 'Jacó cruza as mãos e põe a direita sobre Efraim, o mais novo: “o seu irmão menor será maior do que ele”. Manassés também se tornaria “um povo” grande.' },
    moses: { ref: 'Dt 33.17', text: 'Na bênção de José, Moisés fala dos “milhares de Manassés” ao lado das “miríades de Efraim”.' },
    census: { sinai: 32200, moab: 52700, refs: 'Nm 1.34-35; Nm 26.29-34', note: 'O maior crescimento entre os dois censos.' },
    camp: { side: 'oeste', text: 'A oeste do tabernáculo, no grupo de Efraim.' },
    leaders: [
      { office: 'Príncipe da tribo no deserto', name: 'Gamaliel, filho de Pedazur', ref: 'Nm 1.10' },
      { office: 'Espia enviado a Canaã', name: 'Gadi, filho de Susi', ref: 'Nm 13.11' },
      { office: 'Repartidor da terra', name: 'Haniel, filho de Éfode', ref: 'Nm 34.23' },
      { office: 'Chefes no tempo de Davi', name: 'Joel, filho de Pedaías; em Gileade, Ido, filho de Zacarias', ref: '1Cr 27.20-21' },
    ],
    territories: [
      {
        id: 'manasses-leste',
        name: 'Manassés (leste)',
        center: [36.15, 32.75],
        polygon: [V.gileadW, [35.6, 32.7], [35.66, 32.88], [35.72, 33.08], [35.75, 33.12], [35.85, 33.22], [36.2, 33.25], [36.6, 32.95], [36.6, 32.4], [36.25, 32.25], V.ammonN, V.mahanaim],
        ref: 'Js 13.29-31',
        summary: 'a meia tribo do leste: o norte de Gileade e Basã, terra de gado e de carvalhos',
        cities: 'Golã (cidade de refúgio), Astarote, Edrei e as aldeias de Jair',
      },
      {
        id: 'manasses',
        name: 'Manassés (oeste)',
        center: [35.2, 32.36],
        polygon: [V.seaKanah, V.kanah, V.kanahEast, V.michmethath, V.janoah, V.jordanJabbok, V.jordanBethShan, V.gilboa, V.megiddo, V.issacharWest, V.jokneam, V.carmel, V.seaCarmel],
        ref: 'Js 17.1-13',
        summary: 'a meia tribo do oeste: ao norte de Efraim, até o Carmelo e a beira do vale de Jezreel',
        cities: 'Siquém (na divisa), Tirza, Dotã, Dor, Megido, Taanaque e Bete-Seã',
      },
    ],
    land: 'Moisés deu a Gileade e Basã à meia tribo de Manassés [[Js 13.29-31]]. A outra metade recebeu terra a oeste, ao norte de Efraim, e ainda cidades dentro de Issacar e Aser, como Bete-Seã e Megido, mas não conseguiu expulsar os cananeus delas [[Js 17.11-13]]. As filhas de Zelofeade receberam a sua parte, como Moisés tinha mandado [[Js 17.3-6]]. Golã, em Basã, foi cidade de refúgio [[Js 20.8]].',
    people: [
      { name: 'Gideão', person: 'gideao', note: 'Juiz que venceu os midianitas com 300 homens.', ref: 'Jz 6.15' },
      { name: 'As filhas de Zelofeade', note: 'Macla, Noa, Hogla, Milca e Tirza: pediram e receberam herança.', ref: 'Nm 27.1-7' },
      { name: 'Jair, filho de Manassés', note: 'Conquistou as aldeias que levaram o seu nome (Havote-Jair).', ref: 'Nm 32.41' },
    ],
    history:
      'Na Páscoa de Ezequias, alguns de Manassés se humilharam e foram a Jerusalém [[2Cr 30.11]], e Josias tirou os ídolos também das cidades de Manassés [[2Cr 34.6]]. A meia tribo do leste foi levada pela Assíria junto com Rúben e Gade [[1Cr 5.26]]. O rei Manassés, de Judá, tem o mesmo nome, mas não é desta tribo.',
  },
  {
    id: 'benjamim',
    name: 'Benjamim',
    color: '#a8473f',
    role: 'Guerreiros e o primeiro rei',
    hook: { text: 'Setecentos canhotos de Benjamim acertavam uma pedra com a funda “a um fio de cabelo, sem errar”.', ref: 'Jz 20.16' },
    meaning: 'Filho da mão direita (Raquel o chamou Benôni, “filho da minha dor”)',
    father: 'Jacó',
    mother: 'Raquel',
    order: 12,
    birthRef: 'Gn 35.18',
    calling:
      'Benjamim é a tribo dos guerreiros: “lobo que despedaça” [[Gn 49.27]]. Havia entre eles setecentos canhotos que atiravam pedras com a funda “a um fio de cabelo, sem errar” [[Jz 20.16]]. Dela veio o primeiro rei, Saul [[1Sm 9.1-2]], e, muito depois, o apóstolo Paulo [[Fp 3.5]]. Jerusalém ficou na divisa de Benjamim com Judá [[Js 18.16]] [[Js 18.28]], e Moisés disse que “o amado do Senhor habitará seguro junto a ele” [[Dt 33.12]].',
    jacob: { ref: 'Gn 49.27', text: '“Benjamim é lobo que despedaça; pela manhã devorará a presa, e à tarde repartirá o despojo.” Força e ousadia na guerra.' },
    moses: { ref: 'Dt 33.12', text: 'O amado do Senhor habita seguro, e o Senhor o cerca o dia todo e “habita entre os seus ombros” — muitos veem aqui o templo, construído junto à divisa de Benjamim.' },
    census: { sinai: 35400, moab: 45600, refs: 'Nm 1.36-37; Nm 26.38-41' },
    camp: { side: 'oeste', text: 'A oeste do tabernáculo, no grupo de Efraim — as tribos de Raquel juntas.' },
    leaders: [
      { office: 'Príncipe da tribo no deserto', name: 'Abidã, filho de Gideôni', ref: 'Nm 1.11' },
      { office: 'Espia enviado a Canaã', name: 'Palti, filho de Rafu', ref: 'Nm 13.9' },
      { office: 'Repartidor da terra', name: 'Elidá, filho de Quislom', ref: 'Nm 34.21' },
      { office: 'Chefe da tribo no tempo de Davi', name: 'Jaasiel, filho de Abner', ref: '1Cr 27.21' },
    ],
    territories: [
      {
        id: 'benjamim',
        name: 'Benjamim',
        center: [35.38, 31.87],
        polygon: [V.jordanMouth, V.jordanJericho, V.bethel, V.bethHoron, V.kiriathJearim, V.hinom, V.adumim],
        ref: 'Js 18.11-28',
        summary: 'uma faixa estreita entre Judá e Efraim, de Jericó a Jerusalém',
        cities: 'Jericó, Betel, Gibeá, Ramá, Gibeom, Mispa e Jebus (Jerusalém)',
      },
    ],
    land: 'Foi a primeira sorte lançada em Siló [[Js 18.11]]. O território era pequeno, mas estratégico: ligava o vale do Jordão às montanhas e incluía Jericó, Betel, Gibeom e Jebus, que é Jerusalém [[Js 18.21-28]].',
    people: [
      { name: 'Eúde', person: 'eude', note: 'Juiz canhoto que libertou Israel de Moabe.', ref: 'Jz 3.15' },
      { name: 'Saul', person: 'saul', note: 'O primeiro rei de Israel.', ref: '1Sm 9.1-2' },
      { name: 'Jônatas', person: 'jonatas', note: 'Filho de Saul e amigo de Davi.', ref: '1Sm 18.1' },
      { name: 'Mardoqueu', person: 'mardoqueu', note: 'Benjamita no exílio persa, primo e tutor de Ester.', ref: 'Et 2.5-7' },
      { name: 'Ester', person: 'ester', note: 'A rainha que salvou o seu povo; da família benjamita de Mardoqueu.', ref: 'Et 2.15' },
      { name: 'Paulo', person: 'paulo', note: '“Da tribo de Benjamim, hebreu de hebreus.”', ref: 'Fp 3.5' },
    ],
    history:
      'Depois do crime de Gibeá, as outras tribos guerrearam contra Benjamim, que quase desapareceu [[Jz 20.12-48]] [[Jz 21.1-3]]. Recuperada, deu a Israel o seu primeiro rei. Na divisão do reino, Benjamim ficou com Judá [[1Rs 12.21]] e, depois do exílio, voltou com ele a Jerusalém [[Ed 1.5]].',
  },
];

/** Ordem em que Josué reparte a terra (Js 13–19), com Levi por último (Js 21). */
const ALLOTMENT_ORDER = ['ruben', 'gade', 'manasses-leste', 'juda', 'efraim', 'manasses', 'benjamim', 'simeao', 'zebulom', 'issacar', 'aser', 'naftali', 'da', 'da-norte'];

export const findTribe = (id: string) => TRIBES.find((t) => t.id === id);

/** Territórios na ordem da partilha, com a tribo de cada um. */
export const TERRITORIES = ALLOTMENT_ORDER.map((id) => {
  const tribe = TRIBES.find((t) => t.territories.some((x) => x.id === id))!;
  return { tribe, territory: tribe.territories.find((x) => x.id === id)! };
});

export interface TribeDistance {
  temple: number;
  shiloh: number;
  /** Dias de caminhada pelas estradas da época (estimativa). */
  days: number;
}

export function distances(territory: Territory): TribeDistance {
  const at = { lon: territory.center[0], lat: territory.center[1] };
  const temple = distanceKm(at, TEMPLE);
  // A pé, as estradas tornam o caminho cerca de 30% mais longo; uns 25 km por dia
  return { temple, shiloh: distanceKm(at, SHILOH), days: Math.max(1, Math.round((temple * 1.3) / 25)) };
}

export const daysLabel = (d: TribeDistance) => (d.temple * 1.3 < 25 ? 'menos de um dia' : `cerca de ${d.days} ${d.days === 1 ? 'dia' : 'dias'}`);

/** Tribo de um personagem do Memorial (quando a Bíblia a indica). */
export const tribeOfPerson = (personId: string) => TRIBES.find((t) => t.people.some((p) => p.person === personId));

/** Tribos que descendem de um patriarca do Memorial (Judá → Judá; José → Efraim e Manassés). */
export const tribesOfPatriarch = (personId: string) => TRIBES.filter((t) => t.person === personId);

/** Capítulos em que o leitor oferece o estudo das tribos. */
export const TRIBE_CHAPTERS = [
  'GEN 29', 'GEN 30', 'GEN 48', 'GEN 49', 'NUM 1', 'NUM 2', 'NUM 26', 'NUM 32', 'NUM 34', 'DEU 33',
  'JOS 13', 'JOS 14', 'JOS 15', 'JOS 16', 'JOS 17', 'JOS 18', 'JOS 19', 'JOS 21', 'EZK 48', 'REV 7',
];

const SIDE_NAMES: Record<CampSide, string> = { leste: 'Leste', sul: 'Sul', oeste: 'Oeste', norte: 'Norte', centro: 'Centro' };
export const campSideName = (side: CampSide) => SIDE_NAMES[side];

/** O acampamento no deserto (Nm 2): quatro grupos de três tribos em volta do tabernáculo. */
export const CAMP: { side: Exclude<CampSide, 'centro'>; leader: string; tribes: string[]; total: number; march: string; ref: string }[] = [
  { side: 'norte', leader: 'Dã', tribes: ['da', 'aser', 'naftali'], total: 157600, march: 'Marchava por último, como retaguarda', ref: 'Nm 2.25-31' },
  { side: 'oeste', leader: 'Efraim', tribes: ['efraim', 'manasses', 'benjamim'], total: 108100, march: 'Marchava em terceiro', ref: 'Nm 2.18-24' },
  { side: 'leste', leader: 'Judá', tribes: ['juda', 'issacar', 'zebulom'], total: 186400, march: 'Marchava na frente', ref: 'Nm 2.3-9' },
  { side: 'sul', leader: 'Rúben', tribes: ['ruben', 'simeao', 'gade'], total: 151450, march: 'Marchava em segundo', ref: 'Nm 2.10-16' },
];

const places: MapPlace[] = [
  ...TERRITORIES.map(({ territory: t }) => ({ id: t.id, name: t.name, lon: t.center[0], lat: t.center[1], label: 'r' as const })),
  { id: 'jerusalem', name: 'Jerusalém (o templo)', lon: TEMPLE.lon, lat: TEMPLE.lat, label: 'l' },
  { id: 'silo', name: 'Siló', lon: SHILOH.lon, lat: SHILOH.lat, label: 'r' },
  { id: 'mar-grande', name: 'Mar Mediterrâneo', lon: 34.45, lat: 32.55, region: true },
  { id: 'mar-morto', name: 'Mar Morto', lon: 35.48, lat: 31.25, region: true },
  { id: 'moabe', name: 'Moabe', lon: 35.95, lat: 31.15, region: true },
  { id: 'amom', name: 'Amom', lon: 36.4, lat: 31.95, region: true },
  { id: 'edom', name: 'Edom', lon: 35.65, lat: 30.9, region: true },
  { id: 'filisteus', name: 'Filisteus', lon: 34.56, lat: 31.56, region: true },
  { id: 'fenicia', name: 'Fenícia', lon: 35.2, lat: 33.45, region: true },
  { id: 'ara', name: 'Arã (Damasco)', lon: 36.3, lat: 33.45, region: true },
];

const steps: MapStep[] = [
  ...TERRITORIES.map(({ territory: t }) => {
    const d = distances(t);
    return {
      place: t.id,
      text: `${t.name}: ${t.summary}. Até o templo em Jerusalém: ${formatKm(d.temple)} em linha reta (${daysLabel(d)} a pé).`,
      ref: t.ref,
    };
  }),
  { place: 'silo', text: 'Levi não recebe território: “o Senhor é a sua herança”. Em Siló, os levitas recebem 48 cidades espalhadas por todas as tribos.', ref: 'Js 21.1-8' },
];

/** O mapa da divisão da terra (Js 13–21), com os territórios coloridos. */
export const TRIBES_MAP: BibleMap = {
  id: 'tribos-de-israel', title: 'A divisão da terra entre as tribos',
  period: 'Josué — datação debatida (séc. XV ou XIII a.C.)',
  summary: 'Os territórios das doze tribos, na ordem em que Josué repartiu a terra, com a distância de cada um até o templo em Jerusalém.',
  icon: 'grid_view',
  bounds: [34.2, 30.8, 36.7, 33.6],
  places,
  steps,
  route: false,
  distances: false,
  zoom: 0.5,
  territories: TERRITORIES.map(({ tribe, territory: t }) => ({ id: t.id, tribe: tribe.id, name: t.name, color: tribe.color, polygon: t.polygon })),
  study: { link: '/tribos', label: 'As doze tribos' },
  note: 'Fronteiras aproximadas, traçadas a partir de Josué 13–19; as cidades citadas nem sempre têm localização certa. O templo só foi construído por Salomão (1Rs 6); nos dias de Josué, o tabernáculo estava em Siló.',
  chapters: TRIBE_CHAPTERS.filter((c) => !c.startsWith('GEN 29') && !c.startsWith('GEN 30')),
};

/** Como a terra foi repartida (texto com [[referências]], linha do tempo e destaque). */
export const DIVISION_TEXT = `A terra era uma promessa de Deus desde Abraão [[Gn 15.18-21]], e continuava sendo dele: “a terra é minha; pois vós sois para mim estrangeiros e peregrinos” [[Lv 25.23]]. Por isso a herança de cada família não podia ser vendida para sempre: no ano do jubileu, voltava ao dono [[Lv 25.10]].

:::tempo
- Campinas de Moabe | Moisés dá a Transjordânia | Rúben, Gade e meia tribo de Manassés recebem a terra a leste do Jordão, com a condição de lutar ao lado dos irmãos [[Nm 32.20-33]]
- Antes de atravessar | As regras da partilha | Tribo grande, herança grande; tribo pequena, herança pequena — e a posição decidida por sorte, “perante o Senhor” [[Nm 26.52-56]]. Deus fixa as fronteiras de Canaã [[Nm 34.1-12]] e nomeia um príncipe de cada tribo para repartir [[Nm 34.16-29]]
- Gilgal | As primeiras sortes | Eleazar e Josué repartem a terra [[Js 14.1-5]]. Calebe, aos 85 anos, recebe Hebrom [[Js 14.6-15]]; Judá, Efraim e Manassés recebem as suas partes [[Js 15.1]] [[Js 16.1]] [[Js 17.1]]
- Siló | O tabernáculo e as sete tribos | Três homens de cada tribo percorrem a terra e a descrevem num livro, em sete partes; Josué lança as sortes perante o Senhor [[Js 18.1-10]]
- Siló | Refúgio e cidades levitas | Seis cidades de refúgio, três de cada lado do Jordão [[Js 20.7-9]], e 48 cidades para os levitas [[Js 21.1-42]]
- O fim da partilha | Nenhuma palavra falhou | “Nenhuma promessa falhou de todas as boas palavras que o Senhor falara” [[Js 21.43-45]]
:::

:::nota
**As filhas de Zelofeade.** Zelofeade, de Manassés, morreu sem filhos homens. As suas cinco filhas foram a Moisés pedir herança, e Deus respondeu: “As filhas de Zelofeade falam o que é justo” [[Nm 27.1-8]]. Elas receberam a sua parte na partilha [[Js 17.3-6]].
:::

O número doze é mantido mesmo com Levi fora da partilha: José recebe duas porções, uma para Efraim e outra para Manassés [[Js 14.3-4]].`;

/** Por que a distância até o templo importava. */
export const PILGRIMAGE_TEXT = `Três vezes por ano, todos os homens de Israel deviam comparecer “no lugar que ele escolher”: na Páscoa (festa dos pães ázimos), no Pentecostes (festa das semanas) e na festa dos tabernáculos [[Dt 16.16]]. Nos dias de Josué e dos juízes, esse lugar era Siló [[Js 18.1]] [[1Sm 1.3]]; depois de Salomão, o templo de Jerusalém [[1Rs 8.1-11]]. As famílias viajavam em caravanas — Jesus, aos doze anos, foi assim de Nazaré a Jerusalém [[Lc 2.41-44]] — cantando os “cânticos de romagem” (das subidas), os Salmos 120 a 134 [[Sl 122.1-2]].`;

/** Perguntas frequentes (respostas com [[referências]]). */
export const TRIBE_QUESTIONS: { q: string; a: string }[] = [
  {
    q: 'Eram doze ou treze tribos?',
    a: 'Jacó teve doze filhos [[Gn 35.22-26]]. Mas adotou os dois filhos de José, Efraim e Manassés [[Gn 48.5]], e José recebeu assim a porção dobrada do primogênito [[1Cr 5.1-2]]. Como Levi não recebeu terra [[Js 14.3-4]], as listas da partilha também somam doze: sai Levi, e José vira duas tribos. Quando a Bíblia lista os filhos, aparecem Levi e José; quando lista a terra ou o exército, aparecem Efraim e Manassés. O número doze é mantido de propósito, até no Novo Testamento [[Mt 19.28]] [[Ap 21.12]].',
  },
  {
    q: 'Cada tribo tinha uma função?',
    a: 'Só Levi recebeu na Lei uma função própria, o culto [[Nm 3.5-10]] [[Nm 18.1-7]], e Judá recebeu o cetro [[Gn 49.10]]. As demais “vocações” vêm das bênçãos proféticas de Jacó e de Moisés [[Gn 49.1-28]] [[Dt 33.1-29]] e da história de cada tribo: Zebulom e o comércio, Issacar e o discernimento [[1Cr 12.32]], Gade e Benjamim na guerra [[1Cr 12.8]] [[Jz 20.16]], Aser e a fartura. Listas que dão a cada tribo uma “unção” (louvor, intercessão, finanças…) são aplicações devocionais, não o que o texto diz. A ideia de que Zebulom sustentava o estudo de Issacar, por exemplo, vem da tradição judaica posterior, não da Bíblia.',
  },
  {
    q: 'As bandeiras, as cores e as pedras de cada tribo estão na Bíblia?',
    a: 'A Bíblia diz que cada tribo acampava “junto ao seu estandarte, com as insígnias das casas de seus pais” [[Nm 2.2]], mas não descreve o que havia nelas. O peitoral do sumo sacerdote tinha doze pedras com os nomes dos filhos de Israel [[Êx 28.17-21]], e a ordem dos nomes não é dada. As cores e os símbolos de cada tribo (o leão de Judá, o navio de Zebulom…) vêm da tradição judaica, que os tirou das bênçãos de Gênesis 49.',
  },
  {
    q: 'Por que Dã não aparece em Apocalipse 7?',
    a: 'A lista dos 144 mil selados [[Ap 7.4-8]] começa por Judá, inclui Levi e José, e não traz Dã (nem Efraim pelo nome). O texto não explica. A explicação mais comum é que Dã foi a primeira tribo a adotar a idolatria organizada [[Jz 18.30-31]] [[1Rs 12.28-30]] — compare com [[Dt 29.18-20]]. Desde o século II, alguns pais da Igreja, como Irineu, disseram que o anticristo viria de Dã; isso é tradição, não está na Bíblia. Outros lembram que a lista é simbólica (doze vezes doze mil) e que Ezequiel ainda dá a Dã uma porção na terra restaurada [[Ez 48.1-2]].',
  },
  {
    q: 'As dez tribos do Norte se perderam?',
    a: 'Em 722 a.C., a Assíria levou muitos israelitas do Norte [[2Rs 17.6]]. Mas desde a divisão do reino, levitas e fiéis de todas as tribos tinham ido para Judá [[2Cr 11.13-16]] [[2Cr 15.9]], e alguns de Aser, Manassés e Zebulom foram à Páscoa de Ezequias [[2Cr 30.11]]. No Novo Testamento, Ana é da tribo de Aser [[Lc 2.36]], Paulo fala das “nossas doze tribos” [[At 26.7]] e Tiago escreve “às doze tribos da Dispersão” [[Tg 1.1]]. As teorias que identificam as tribos perdidas com povos de hoje são especulação.',
  },
  {
    q: 'E a nova divisão da terra em Ezequiel?',
    a: 'Ezequiel vê a terra repartida outra vez entre as doze tribos, em faixas de norte a sul, com a porção sagrada e o santuário no meio [[Ez 47.13-14]] [[Ez 48.1-29]]. A cidade tem doze portas com os nomes das tribos e se chama “O Senhor está ali” [[Ez 48.30-35]]. Uns entendem que é uma restauração literal futura de Israel; outros, que é uma visão simbólica do povo de Deus reunido em volta da sua presença, retomada na Nova Jerusalém de Apocalipse, com as doze portas das tribos [[Ap 21.12]].',
  },
];
