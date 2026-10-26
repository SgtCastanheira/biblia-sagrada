import type { Lonlat } from './atlas';
import { BOOKS } from './books';
import { Testament } from './models';
import { CHURCH_MAPS } from './church-maps';
import { TRIBES_MAP } from './tribes';

/**
 * Mapas históricos. Cada mapa tem limites geográficos (longitude/latitude), lugares e uma rota numerada.
 * A geografia (costas, rios e lagos) é gerada a partir do Natural Earth (domínio público) para os
 * mesmos limites — veja public/maps/<id>.json.
 */

export type LabelSide = 'r' | 'l' | 't' | 'b';

export interface MapPlace {
  id: string;
  name: string;
  lon: number;
  lat: number;
  label?: LabelSide;
  /** Localização debatida ou tradicional. */
  uncertain?: boolean;
  /** Região (nome em itálico, sem ponto). */
  region?: boolean;
  /** Nome mostrado quando este lugar se junta a outros próximos (ex.: "Jerusalém"). */
  group?: string;
  /** Região que só aparece quando o mapa está bem aproximado (ex.: "Vale do Cedrom"). */
  detail?: boolean;
}

export interface MapStep {
  place: string;
  text: string;
  ref: string;
}

export interface BibleMap {
  id: string;
  title: string;
  period: string;
  summary: string;
  icon: string;
  /** [lonMin, latMin, lonMax, latMax] */
  bounds: [number, number, number, number];
  places: MapPlace[];
  steps: MapStep[];
  /** Rota desenhada entre os lugares dos passos (padrão: true). */
  route?: boolean;
  note?: string;
  /** Aproximação máxima da jornada (fração da largura do mapa). Menor = mais perto. Padrão 0.32. */
  zoom?: number;
  /** Capítulos relacionados, ex.: "ACT 16". */
  chapters: string[];
  /** false: as etapas não são uma viagem só (não mostra distâncias). */
  distances?: boolean;
  /** Regiões sempre coloridas (ex.: os territórios das tribos), recortadas pelo litoral. */
  territories?: MapTerritory[];
  /** Ponto de referência sempre visível (ex.: o templo); a região destacada mostra a distância até ele. */
  landmark?: { name: string; lon: number; lat: number };
  /** Estudo ligado ao mapa (quando não é um artigo). */
  study?: { link: string; label: string };
}

export interface MapTerritory {
  id: string;
  /** Grupo de regiões destacadas juntas (ex.: as duas metades de Manassés). */
  tribe?: string;
  name: string;
  color: string;
  polygon: Lonlat[];
  /** De onde se mede a distância até o ponto de referência. */
  center?: Lonlat;
}

export const BIBLE_MAPS: BibleMap[] = [
  {
    id: 'segunda-viagem-de-paulo',
    title: 'Segunda viagem missionária de Paulo',
    period: 'Por volta de 49–52 d.C.',
    summary: 'Paulo e Silas atravessam a Ásia Menor e, guiados por uma visão, levam o Evangelho à Europa — começando por Filipos.',
    icon: 'sailing',
    bounds: [21.3, 31.4, 37.2, 42.2],
    places: [
      { id: 'antioquia', name: 'Antioquia', lon: 36.16, lat: 36.2, label: 'r' },
      { id: 'derbe', name: 'Derbe', lon: 33.36, lat: 37.35, label: 'b' },
      { id: 'listra', name: 'Listra', lon: 32.45, lat: 37.58, label: 'b' },
      { id: 'icônio', name: 'Icônio', lon: 32.48, lat: 37.87, label: 't' },
      { id: 'troade', name: 'Trôade', lon: 26.16, lat: 39.75, label: 'r' },
      { id: 'samotracia', name: 'Samotrácia', lon: 25.53, lat: 40.47, label: 't' },
      { id: 'filipos', name: 'Filipos', lon: 24.28, lat: 41.01, label: 't' },
      { id: 'anfipolis', name: 'Anfípolis', lon: 23.85, lat: 40.82, label: 'l' },
      { id: 'tessalonica', name: 'Tessalônica', lon: 22.94, lat: 40.64, label: 't' },
      { id: 'bereia', name: 'Bereia', lon: 22.2, lat: 40.52, label: 'l' },
      { id: 'atenas', name: 'Atenas', lon: 23.72, lat: 37.97, label: 'r' },
      { id: 'corinto', name: 'Corinto', lon: 22.88, lat: 37.91, label: 'l' },
      { id: 'efeso', name: 'Éfeso', lon: 27.34, lat: 37.94, label: 'r' },
      { id: 'cesareia', name: 'Cesareia', lon: 34.89, lat: 32.5, label: 'l' },
      { id: 'jerusalem', name: 'Jerusalém', lon: 35.23, lat: 31.78, label: 'r' },
      { id: 'galacia', name: 'Galácia', lon: 32.2, lat: 39.4, region: true },
      { id: 'macedonia', name: 'Macedônia', lon: 23.4, lat: 41.75, region: true },
      { id: 'acaia', name: 'Acaia', lon: 22.6, lat: 37.25, region: true },
    ],
    steps: [
      { place: 'antioquia', text: 'Paulo escolhe Silas e parte de Antioquia, passando pela Síria e Cilícia.', ref: 'At 15.40-41' },
      { place: 'derbe', text: 'Em Derbe e Listra, Timóteo se junta à equipe.', ref: 'At 16.1-3' },
      { place: 'icônio', text: 'Atravessam a Frígia e a Galácia; o Espírito impede a pregação na Ásia e na Bitínia.', ref: 'At 16.6-7' },
      { place: 'troade', text: 'Em Trôade, Paulo tem a visão do homem macedônio: “Passa à Macedônia e ajuda-nos”.', ref: 'At 16.8-10' },
      { place: 'samotracia', text: 'Navegam direto para Samotrácia.', ref: 'At 16.11' },
      { place: 'filipos', text: 'Desembarcam em Neápolis, o porto de Filipos, a poucos quilômetros da cidade.', ref: 'At 16.11' },
      { place: 'filipos', text: 'Filipos: conversão de Lídia, prisão de Paulo e Silas e conversão do carcereiro. Nasce a primeira igreja da Europa.', ref: 'At 16.12-40' },
      { place: 'tessalonica', text: 'Passando por Anfípolis e Apolônia, chegam a Tessalônica.', ref: 'At 17.1-9' },
      { place: 'bereia', text: 'Em Bereia, os judeus examinam as Escrituras todos os dias.', ref: 'At 17.10-14' },
      { place: 'atenas', text: 'Em Atenas, Paulo prega no Areópago sobre o “Deus desconhecido”.', ref: 'At 17.15-34' },
      { place: 'corinto', text: 'Em Corinto, fica um ano e meio com Áquila e Priscila.', ref: 'At 18.1-11' },
      { place: 'efeso', text: 'Breve passagem por Éfeso, prometendo voltar.', ref: 'At 18.19-21' },
      { place: 'cesareia', text: 'Desembarca em Cesareia e sobe para saudar a igreja.', ref: 'At 18.22' },
      { place: 'antioquia', text: 'Volta a Antioquia, encerrando a viagem.', ref: 'At 18.22' },
    ],
    note: 'Trajeto aproximado. As cartas aos Filipenses e aos Tessalonicenses foram escritas às igrejas fundadas nesta viagem.',
    chapters: ['ACT 15', 'ACT 16', 'ACT 17', 'ACT 18', 'PHP 1', 'PHP 2', 'PHP 3', 'PHP 4', '1TH 1', '1TH 2', '2TH 1'],
  },
  {
    id: 'primeira-viagem-de-paulo',
    title: 'Primeira viagem missionária de Paulo',
    period: 'Por volta de 46–48 d.C.',
    summary: 'Enviados pela igreja de Antioquia, Paulo e Barnabé pregam em Chipre e no sul da Ásia Menor.',
    icon: 'sailing',
    bounds: [29.6, 33.9, 37.0, 39.0],
    places: [
      { id: 'antioquia', name: 'Antioquia', lon: 36.16, lat: 36.2, label: 'r' },
      { id: 'selêucia', name: 'Selêucia', lon: 35.93, lat: 36.12, label: 'b' },
      { id: 'salamina', name: 'Salamina', lon: 33.9, lat: 35.18, label: 'r' },
      { id: 'pafos', name: 'Pafos', lon: 32.41, lat: 34.76, label: 'l' },
      { id: 'perge', name: 'Perge', lon: 30.85, lat: 36.96, label: 'l' },
      { id: 'atalia', name: 'Atália', lon: 30.7, lat: 36.88, label: 'b' },
      { id: 'antioquia-pisidia', name: 'Antioquia da Pisídia', lon: 31.19, lat: 38.3, label: 't' },
      { id: 'iconio', name: 'Icônio', lon: 32.48, lat: 37.87, label: 'r' },
      { id: 'listra', name: 'Listra', lon: 32.45, lat: 37.58, label: 'l' },
      { id: 'derbe', name: 'Derbe', lon: 33.36, lat: 37.35, label: 'r' },
      { id: 'chipre', name: 'Chipre', lon: 33.1, lat: 35.05, region: true },
    ],
    steps: [
      { place: 'antioquia', text: 'O Espírito Santo separa Barnabé e Saulo; a igreja os envia.', ref: 'At 13.1-3' },
      { place: 'selêucia', text: 'Descem a Selêucia e navegam para Chipre.', ref: 'At 13.4' },
      { place: 'salamina', text: 'Pregam nas sinagogas de Salamina.', ref: 'At 13.5' },
      { place: 'pafos', text: 'Em Pafos, o procônsul Sérgio Paulo crê. A partir daqui, Saulo passa a ser chamado Paulo.', ref: 'At 13.6-12' },
      { place: 'perge', text: 'Chegam a Perge, na Panfília; João Marcos volta para Jerusalém.', ref: 'At 13.13' },
      { place: 'antioquia-pisidia', text: 'Em Antioquia da Pisídia, Paulo prega na sinagoga e se volta aos gentios.', ref: 'At 13.14-52' },
      { place: 'iconio', text: 'Em Icônio, muitos creem, mas há uma tentativa de apedrejamento.', ref: 'At 14.1-6' },
      { place: 'listra', text: 'Em Listra, um coxo é curado; Paulo é apedrejado e dado como morto.', ref: 'At 14.8-20' },
      { place: 'derbe', text: 'Em Derbe, fazem muitos discípulos e começam a volta.', ref: 'At 14.20-21' },
      { place: 'atalia', text: 'Voltam fortalecendo as igrejas e descem a Atália.', ref: 'At 14.21-25' },
      { place: 'antioquia', text: 'Retornam a Antioquia e contam como Deus abriu a porta da fé aos gentios.', ref: 'At 14.26-27' },
    ],
    note: 'Trajeto aproximado; o caminho de volta (Derbe → Listra → Icônio → Antioquia da Pisídia) aparece resumido.',
    chapters: ['ACT 13', 'ACT 14'],
  },
  {
    id: 'viagem-a-roma',
    title: 'A viagem de Paulo a Roma',
    period: 'Por volta de 59–60 d.C.',
    summary: 'Preso, Paulo apela a César e é levado de navio a Roma — com tempestade e naufrágio em Malta no caminho.',
    icon: 'directions_boat',
    bounds: [11.0, 31.2, 36.4, 42.6],
    places: [
      { id: 'cesareia', name: 'Cesareia', lon: 34.89, lat: 32.5, label: 'l' },
      { id: 'sidom', name: 'Sidom', lon: 35.37, lat: 33.56, label: 'r' },
      { id: 'mirra', name: 'Mirra', lon: 29.98, lat: 36.26, label: 't' },
      { id: 'cnido', name: 'Cnido', lon: 27.37, lat: 36.69, label: 't' },
      { id: 'bons-portos', name: 'Bons Portos', lon: 24.8, lat: 34.93, label: 'b', uncertain: true },
      { id: 'malta', name: 'Malta', lon: 14.4, lat: 35.9, label: 'b' },
      { id: 'siracusa', name: 'Siracusa', lon: 15.29, lat: 37.07, label: 'r' },
      { id: 'regio', name: 'Régio', lon: 15.65, lat: 38.11, label: 'r' },
      { id: 'puteoli', name: 'Putéoli', lon: 14.12, lat: 40.82, label: 'r' },
      { id: 'roma', name: 'Roma', lon: 12.5, lat: 41.9, label: 'r' },
      { id: 'creta', name: 'Creta', lon: 24.9, lat: 35.35, region: true },
    ],
    steps: [
      { place: 'cesareia', text: 'Paulo, prisioneiro, embarca com outros presos sob a guarda do centurião Júlio.', ref: 'At 27.1-2' },
      { place: 'sidom', text: 'Em Sidom, Júlio permite que Paulo visite os amigos.', ref: 'At 27.3' },
      { place: 'mirra', text: 'Em Mirra da Lícia, trocam para um navio de Alexandria que ia para a Itália.', ref: 'At 27.5-6' },
      { place: 'cnido', text: 'Navegam com dificuldade até a altura de Cnido.', ref: 'At 27.7' },
      { place: 'bons-portos', text: 'Abrigam-se em Bons Portos, em Creta. Paulo aconselha esperar o inverno, mas não é ouvido.', ref: 'At 27.8-12' },
      { place: 'malta', text: 'Uma tempestade de 14 dias termina em naufrágio; todos se salvam e chegam a Malta.', ref: 'At 27.13-44; 28.1-10' },
      { place: 'siracusa', text: 'Após três meses, seguem para Siracusa.', ref: 'At 28.11-12' },
      { place: 'regio', text: 'Passam por Régio.', ref: 'At 28.13' },
      { place: 'puteoli', text: 'Em Putéoli encontram irmãos e ficam sete dias.', ref: 'At 28.13-14' },
      { place: 'roma', text: 'Em Roma, Paulo vive dois anos em casa alugada, pregando o Reino de Deus.', ref: 'At 28.16-31' },
    ],
    note: 'Trajeto aproximado. A localização exata de Bons Portos, no sul de Creta, é tradicional.',
    chapters: ['ACT 27', 'ACT 28'],
  },
  {
    id: 'jornada-de-abraao',
    title: 'A jornada de Abraão',
    period: 'Por volta de 2000 a.C.',
    summary: 'Chamado por Deus, Abrão deixa Ur dos caldeus e Harã rumo à terra que lhe seria mostrada.',
    icon: 'hiking',
    bounds: [30.0, 28.5, 47.8, 38.4],
    places: [
      { id: 'ur', name: 'Ur dos caldeus', lon: 46.1, lat: 30.96, label: 'l' },
      { id: 'hara', name: 'Harã', lon: 39.03, lat: 36.87, label: 't' },
      { id: 'siquem', name: 'Siquém', lon: 35.28, lat: 32.21, label: 'r' },
      { id: 'betel', name: 'Betel', lon: 35.22, lat: 31.93, label: 'r' },
      { id: 'hebrom', name: 'Hebrom', lon: 35.1, lat: 31.53, label: 'r' },
      { id: 'egito', name: 'Egito', lon: 31.25, lat: 30.0, label: 'r' },
      { id: 'cana', name: 'Canaã', lon: 34.0, lat: 32.6, region: true },
      { id: 'mesopotamia', name: 'Mesopotâmia', lon: 42.3, lat: 34.0, region: true },
    ],
    steps: [
      { place: 'ur', text: 'Terá sai de Ur dos caldeus com Abrão, Sarai e Ló.', ref: 'Gn 11.31' },
      { place: 'hara', text: 'Habitam em Harã. Ali Deus chama Abrão: “Sai-te da tua terra”.', ref: 'Gn 11.31; 12.1-4' },
      { place: 'siquem', text: 'Em Siquém, Deus promete a terra à sua descendência; Abrão edifica um altar.', ref: 'Gn 12.6-7' },
      { place: 'betel', text: 'Arma a tenda entre Betel e Ai e invoca o nome do Senhor.', ref: 'Gn 12.8' },
      { place: 'egito', text: 'Por causa da fome, desce ao Egito.', ref: 'Gn 12.10' },
      { place: 'betel', text: 'Volta ao lugar do altar, entre Betel e Ai.', ref: 'Gn 13.1-4' },
      { place: 'hebrom', text: 'Separa-se de Ló e habita junto aos carvalhais de Manre, em Hebrom.', ref: 'Gn 13.18' },
    ],
    note: 'A localização de Ur mais aceita é Tell el-Muqayyar, no sul do atual Iraque. Datas aproximadas.',
    chapters: ['GEN 11', 'GEN 12', 'GEN 13'],
  },
  {
    id: 'exodo',
    title: 'O Êxodo',
    period: 'Datação debatida (séc. XV ou XIII a.C.)',
    summary: 'Deus liberta Israel do Egito e o conduz pelo deserto até o Sinai e, depois, às portas da terra prometida.',
    icon: 'landscape',
    bounds: [30.6, 27.6, 36.4, 32.3],
    places: [
      { id: 'ramesses', name: 'Ramessés', lon: 31.83, lat: 30.8, label: 'l' },
      { id: 'sucote', name: 'Sucote', lon: 32.1, lat: 30.55, label: 'l' },
      { id: 'mar', name: 'Travessia do mar', lon: 32.45, lat: 30.3, label: 'r', uncertain: true },
      { id: 'mara', name: 'Mara', lon: 32.95, lat: 29.43, label: 'l', uncertain: true },
      { id: 'elim', name: 'Elim', lon: 33.08, lat: 29.28, label: 'r', uncertain: true },
      { id: 'sinai', name: 'Monte Sinai', lon: 33.97, lat: 28.54, label: 'r', uncertain: true },
      { id: 'cades', name: 'Cades-Barneia', lon: 34.42, lat: 30.65, label: 'r', uncertain: true },
      { id: 'nebo', name: 'Monte Nebo', lon: 35.73, lat: 31.77, label: 'r' },
      { id: 'egito', name: 'Egito', lon: 31.2, lat: 29.4, region: true },
      { id: 'canaa', name: 'Canaã', lon: 35.0, lat: 31.95, region: true },
      { id: 'deserto', name: 'Deserto de Parã', lon: 34.4, lat: 29.9, region: true },
    ],
    steps: [
      { place: 'ramesses', text: 'Os filhos de Israel partem de Ramessés.', ref: 'Êx 12.37' },
      { place: 'sucote', text: 'Chegam a Sucote; Deus os guia por uma coluna de nuvem e de fogo.', ref: 'Êx 13.20-22' },
      { place: 'mar', text: 'Deus abre o mar e Israel passa a pé enxuto.', ref: 'Êx 14.21-22' },
      { place: 'mara', text: 'Em Mara, as águas amargas se tornam doces.', ref: 'Êx 15.22-25' },
      { place: 'elim', text: 'Em Elim há doze fontes e setenta palmeiras.', ref: 'Êx 15.27' },
      { place: 'sinai', text: 'No Sinai, Deus entrega a Lei e faz aliança com o povo.', ref: 'Êx 19.1-6' },
      { place: 'cades', text: 'De Cades, os espias são enviados a Canaã; por incredulidade, o povo vagueia 40 anos.', ref: 'Nm 13.26; 14.33' },
      { place: 'nebo', text: 'Do monte Nebo, Moisés contempla a terra prometida.', ref: 'Dt 34.1-4' },
    ],
    note: 'O trajeto exato do Êxodo é debatido. Aqui aparece a rota tradicional, com o Sinai em Jebel Musa e a travessia na região dos lagos, ao norte do golfo de Suez.',
    chapters: ['EXO 12', 'EXO 13', 'EXO 14', 'EXO 15', 'EXO 16', 'EXO 17', 'EXO 19', 'NUM 13', 'NUM 14', 'NUM 33', 'DEU 34'],
  },
  {
    id: 'conquista-de-jerico',
    title: 'A travessia do Jordão e a queda de Jericó',
    period: 'Datação debatida (séc. XV ou XIII a.C.)',
    summary: 'Israel atravessa o Jordão, acampa em Gilgal e, depois de sete dias rodeando Jericó, vê os muros caírem.',
    icon: 'fort',
    bounds: [35.05, 31.55, 35.95, 32.12],
    places: [
      { id: 'sitim', name: 'Sitim', lon: 35.67, lat: 31.84, label: 'r', uncertain: true },
      { id: 'jordao', name: 'Travessia do Jordão', lon: 35.545, lat: 31.84, label: 'b' },
      { id: 'gilgal', name: 'Gilgal', lon: 35.49, lat: 31.86, label: 't', uncertain: true },
      { id: 'jerico', name: 'Jericó', lon: 35.44, lat: 31.87, label: 'l' },
      { id: 'ai', name: 'Ai', lon: 35.26, lat: 31.92, label: 't', uncertain: true },
      { id: 'jerusalem', name: 'Jerusalém', lon: 35.23, lat: 31.78, label: 'l' },
      { id: 'nebo', name: 'Monte Nebo', lon: 35.73, lat: 31.77, label: 'r' },
      { id: 'mar-morto', name: 'Mar Morto', lon: 35.5, lat: 31.62, region: true },
    ],
    steps: [
      { place: 'sitim', text: 'De Sitim, Josué envia dois espias a Jericó; Raabe os esconde.', ref: 'Js 2.1' },
      { place: 'jordao', text: 'Os sacerdotes entram no Jordão com a arca e as águas se detêm.', ref: 'Js 3.14-17' },
      { place: 'gilgal', text: 'Em Gilgal, erguem doze pedras como memorial.', ref: 'Js 4.19-20' },
      { place: 'jerico', text: 'Rodeiam Jericó uma vez por dia durante seis dias e sete vezes no sétimo dia. Os muros caem.', ref: 'Js 6.3-20' },
      { place: 'ai', text: 'Depois de Jericó, a campanha segue para Ai.', ref: 'Js 7.2' },
    ],
    note: 'As localizações de Sitim, Gilgal e Ai não são certas; aparecem nos locais mais aceitos.',
    chapters: ['JOS 2', 'JOS 3', 'JOS 4', 'JOS 5', 'JOS 6', 'JOS 7', 'JOS 8'],
  },
  {
    id: 'ministerio-na-galileia',
    title: 'O ministério de Jesus na Galileia',
    period: 'Por volta de 28–30 d.C.',
    summary: 'As cidades ao redor do mar da Galileia, onde Jesus chamou os discípulos, ensinou e realizou muitos milagres.',
    icon: 'water',
    bounds: [35.18, 32.62, 35.78, 32.98],
    route: false,
    places: [
      { id: 'nazare', name: 'Nazaré', lon: 35.3, lat: 32.7, label: 'r' },
      { id: 'cana', name: 'Caná', lon: 35.34, lat: 32.75, label: 'r', uncertain: true },
      { id: 'cafarnaum', name: 'Cafarnaum', lon: 35.575, lat: 32.88, label: 'l' },
      { id: 'betsaida', name: 'Betsaida', lon: 35.63, lat: 32.91, label: 'r', uncertain: true },
      { id: 'corazim', name: 'Corazim', lon: 35.565, lat: 32.91, label: 'l' },
      { id: 'magdala', name: 'Magdala', lon: 35.515, lat: 32.825, label: 'l' },
      { id: 'tiberiades', name: 'Tiberíades', lon: 35.53, lat: 32.79, label: 'l' },
      { id: 'gadara', name: 'Gerasenos', lon: 35.65, lat: 32.83, label: 'r', uncertain: true },
      { id: 'mar-galileia', name: 'Mar da Galileia', lon: 35.59, lat: 32.8, region: true },
    ],
    steps: [
      { place: 'nazare', text: 'Nazaré, onde Jesus foi criado, o rejeita na sinagoga.', ref: 'Lc 4.16-30' },
      { place: 'cana', text: 'Em Caná, o primeiro sinal: a água transformada em vinho.', ref: 'Jo 2.1-11' },
      { place: 'cafarnaum', text: 'Cafarnaum se torna a base do ministério; ali chama Pedro, André, Tiago e João.', ref: 'Mt 4.13-22' },
      { place: 'corazim', text: 'Corazim e Betsaida viram muitos milagres e não se arrependeram.', ref: 'Mt 11.21' },
      { place: 'betsaida', text: 'Perto de Betsaida, a multiplicação dos pães para cinco mil.', ref: 'Lc 9.10-17' },
      { place: 'magdala', text: 'Região de Magdala (Magadã), terra de Maria Madalena.', ref: 'Mt 15.39' },
      { place: 'gadara', text: 'Na outra margem, Jesus liberta o endemoninhado.', ref: 'Mc 5.1-20' },
    ],
    note: 'Os pontos não seguem uma ordem de viagem. Caná, Betsaida e a região dos gerasenos têm localização debatida.',
    chapters: ['MAT 4', 'MAT 8', 'MAT 11', 'MAT 14', 'MRK 1', 'MRK 5', 'MRK 6', 'LUK 4', 'LUK 5', 'LUK 8', 'LUK 9', 'JHN 2', 'JHN 6', 'JHN 21'],
  },
  {
    id: 'nascimento-de-jesus',
    title: 'O nascimento e a infância de Jesus',
    period: 'Por volta de 6–4 a.C.',
    summary: 'De Nazaré a Belém para o recenseamento, a fuga para o Egito e a volta para Nazaré.',
    icon: 'star',
    bounds: [30.6, 29.4, 36.3, 33.2],
    places: [
      { id: 'nazare', name: 'Nazaré', lon: 35.3, lat: 32.7, label: 'r' },
      { id: 'belem', name: 'Belém', lon: 35.2, lat: 31.7, label: 'r' },
      { id: 'jerusalem', name: 'Jerusalém', lon: 35.23, lat: 31.78, label: 't' },
      { id: 'egito', name: 'Egito', lon: 31.3, lat: 30.2, label: 'r' },
      { id: 'galileia', name: 'Galileia', lon: 35.55, lat: 33.0, region: true },
      { id: 'judeia', name: 'Judeia', lon: 34.75, lat: 31.4, region: true },
    ],
    steps: [
      { place: 'nazare', text: 'José e Maria saem de Nazaré por causa do recenseamento.', ref: 'Lc 2.1-5' },
      { place: 'belem', text: 'Jesus nasce em Belém e é deitado numa manjedoura.', ref: 'Lc 2.6-7' },
      { place: 'jerusalem', text: 'É apresentado no templo de Jerusalém.', ref: 'Lc 2.22-38' },
      { place: 'egito', text: 'Avisado em sonho, José foge com a família para o Egito.', ref: 'Mt 2.13-15' },
      { place: 'nazare', text: 'Depois da morte de Herodes, voltam e habitam em Nazaré.', ref: 'Mt 2.19-23' },
    ],
    note: 'Trajeto aproximado. A Bíblia não diz em que lugar do Egito a família ficou.',
    chapters: ['MAT 1', 'MAT 2', 'LUK 1', 'LUK 2'],
  },
  {
    id: 'exilio-na-babilonia',
    title: 'O exílio na Babilônia',
    period: '605–538 a.C.',
    summary: 'Nabucodonosor conquista Jerusalém e leva o povo cativo; décadas depois, Ciro permite o retorno.',
    icon: 'account_balance',
    bounds: [34.0, 30.2, 46.2, 37.8],
    places: [
      { id: 'jerusalem', name: 'Jerusalém', lon: 35.23, lat: 31.78, label: 'l' },
      { id: 'ribla', name: 'Ribla', lon: 36.55, lat: 34.45, label: 'l' },
      { id: 'carquemis', name: 'Carquemis', lon: 38.01, lat: 36.83, label: 't' },
      { id: 'babilonia', name: 'Babilônia', lon: 44.42, lat: 32.54, label: 'l' },
      { id: 'mesopotamia', name: 'Mesopotâmia', lon: 41.5, lat: 34.6, region: true },
    ],
    steps: [
      { place: 'jerusalem', text: 'Jerusalém é sitiada e o templo é queimado.', ref: '2Rs 25.1-10' },
      { place: 'ribla', text: 'Em Ribla, Zedequias é julgado diante de Nabucodonosor.', ref: '2Rs 25.6-7' },
      { place: 'carquemis', text: 'A rota segue o Crescente Fértil, passando pela região de Carquemis, onde Nabucodonosor vencera o Egito.', ref: 'Jr 46.2' },
      { place: 'babilonia', text: 'O povo é levado cativo para a Babilônia. Ali vivem Daniel e Ezequiel.', ref: '2Rs 25.11; Dn 1.1-6' },
    ],
    note: 'Rota provável pelo Crescente Fértil: os exércitos evitavam atravessar o deserto. O retorno, sob Ciro, é narrado em Esdras 1.',
    chapters: ['2KI 24', '2KI 25', 'JER 39', 'JER 52', 'DAN 1', 'EZK 1', 'EZR 1', 'PSA 137'],
  },
  {
    id: 'vida-de-jesus',
    title: 'A vida de Jesus: do anúncio à ascensão',
    period: 'Por volta de 6 a.C. – 30 d.C.',
    summary: 'O caminho de Jesus desde o anúncio a Maria, passando pela infância, o ministério e os milagres, até a cruz, a ressurreição e a volta ao céu.',
    icon: 'auto_stories',
    bounds: [30.9, 29.7, 36.3, 33.5],
    zoom: 0.006,
    places: [
      { id: 'nazare', name: 'Nazaré', lon: 35.3, lat: 32.7, label: 'l', group: 'Galileia' },
      { id: 'ein-karem', name: 'Montanhas de Judá', lon: 35.16, lat: 31.768, label: 'l', uncertain: true, group: 'Jerusalém' },
      { id: 'belem', name: 'Belém', lon: 35.2026, lat: 31.7049, label: 'b', group: 'Judeia' },
      { id: 'templo', name: 'Templo', lon: 35.2354, lat: 31.7781, label: 'r', group: 'Jerusalém' },
      { id: 'egito', name: 'Egito', lon: 31.4, lat: 30.3, label: 'r', uncertain: true },
      { id: 'batismo', name: 'Betânia além do Jordão', lon: 35.555, lat: 31.837, label: 'r', uncertain: true, group: 'Judeia' },
      { id: 'deserto', name: 'Deserto da Judeia', lon: 35.4, lat: 31.6, label: 'r', uncertain: true, group: 'Judeia' },
      { id: 'cana', name: 'Caná', lon: 35.34, lat: 32.75, label: 'r', uncertain: true, group: 'Galileia' },
      { id: 'sicar', name: 'Sicar (poço de Jacó)', lon: 35.285, lat: 32.209, label: 'r' },
      { id: 'cafarnaum', name: 'Cafarnaum', lon: 35.575, lat: 32.881, label: 't', group: 'Galileia' },
      { id: 'mar', name: 'Mar da Galileia', lon: 35.59, lat: 32.8, label: 'r', group: 'Galileia' },
      { id: 'betsaida', name: 'Betsaida', lon: 35.63, lat: 32.91, label: 'r', uncertain: true, group: 'Galileia' },
      { id: 'cesareia', name: 'Cesareia de Filipe', lon: 35.694, lat: 33.248, label: 'r' },
      { id: 'tabor', name: 'Monte Tabor', lon: 35.39, lat: 32.687, label: 'b', uncertain: true, group: 'Galileia' },
      { id: 'betania', name: 'Betânia', lon: 35.2614, lat: 31.771, label: 'r', group: 'Jerusalém' },
      { id: 'jerico', name: 'Jericó', lon: 35.444, lat: 31.871, label: 'r', group: 'Judeia' },
      { id: 'oliveiras', name: 'Monte das Oliveiras', lon: 35.2449, lat: 31.7785, label: 'r', group: 'Jerusalém' },
      { id: 'cenaculo', name: 'Cenáculo', lon: 35.229, lat: 31.7716, label: 'l', uncertain: true, group: 'Jerusalém' },
      { id: 'getsemani', name: 'Getsêmani', lon: 35.2397, lat: 31.7794, label: 'r', group: 'Jerusalém' },
      { id: 'caifas', name: 'Casa de Caifás', lon: 35.2312, lat: 31.7712, label: 'b', uncertain: true, group: 'Jerusalém' },
      { id: 'pretorio', name: 'Pretório (Pilatos)', lon: 35.2333, lat: 31.7806, label: 't', uncertain: true, group: 'Jerusalém' },
      { id: 'golgota', name: 'Gólgota e o sepulcro', lon: 35.2296, lat: 31.7785, label: 'l', uncertain: true, group: 'Jerusalém' },
      { id: 'emaus', name: 'Emaús', lon: 35.153, lat: 31.843, label: 'l', uncertain: true, group: 'Judeia' },
      { id: 'galileia', name: 'Galileia', lon: 35.05, lat: 32.95, region: true },
      { id: 'samaria', name: 'Samaria', lon: 35.05, lat: 32.25, region: true },
      { id: 'judeia', name: 'Judeia', lon: 34.85, lat: 31.45, region: true },
      { id: 'cedrom', name: 'Vale do Cedrom', lon: 35.2372, lat: 31.7745, region: true, detail: true },
    ],
    steps: [
      { place: 'nazare', text: 'O anjo Gabriel anuncia a Maria que ela será mãe do Filho do Altíssimo.', ref: 'Lc 1.26-38' },
      { place: 'ein-karem', text: 'Maria vai às montanhas de Judá visitar Isabel; a criança salta no ventre de Isabel.', ref: 'Lc 1.39-45' },
      { place: 'belem', text: 'Por causa do recenseamento, José e Maria vão a Belém. Jesus nasce e os pastores o visitam.', ref: 'Lc 2.4-16' },
      { place: 'templo', text: 'É apresentado no templo; Simeão e Ana reconhecem nele o Salvador.', ref: 'Lc 2.22-38' },
      { place: 'belem', text: 'Os magos do oriente encontram o menino “na casa” e o adoram.', ref: 'Mt 2.1-11' },
      { place: 'egito', text: 'Avisado em sonho, José foge com a família para o Egito.', ref: 'Mt 2.13-15' },
      { place: 'nazare', text: 'Depois da morte de Herodes, voltam e moram em Nazaré. O menino cresce em sabedoria.', ref: 'Mt 2.19-23' },
      { place: 'templo', text: 'Aos doze anos, Jesus fica no templo entre os doutores: “Devo estar na casa de meu Pai”.', ref: 'Lc 2.41-52' },
      { place: 'batismo', text: 'É batizado por João no Jordão; o Espírito desce como pomba.', ref: 'Mt 3.13-17' },
      { place: 'deserto', text: 'Quarenta dias no deserto, tentado pelo diabo, vence com a Palavra.', ref: 'Mt 4.1-11' },
      { place: 'cana', text: 'Nas bodas de Caná, o primeiro sinal: a água vira vinho.', ref: 'Jo 2.1-11' },
      { place: 'sicar', text: 'No poço de Jacó, conversa com a mulher samaritana sobre a água viva.', ref: 'Jo 4.5-42' },
      { place: 'nazare', text: 'Na sinagoga de Nazaré lê Isaías 61 e é rejeitado pelos seus.', ref: 'Lc 4.16-30' },
      { place: 'cafarnaum', text: 'Cafarnaum vira sua base: chama os primeiros discípulos e cura muitos enfermos.', ref: 'Mt 4.13-22' },
      { place: 'mar', text: 'No mar da Galileia acalma a tempestade: “Cala-te, aquieta-te”.', ref: 'Mc 4.35-41' },
      { place: 'betsaida', text: 'Perto de Betsaida, alimenta cinco mil com cinco pães e dois peixes.', ref: 'Lc 9.10-17' },
      { place: 'cesareia', text: 'Em Cesareia de Filipe, Pedro confessa: “Tu és o Cristo, o Filho do Deus vivo”.', ref: 'Mt 16.13-16' },
      { place: 'tabor', text: 'Num alto monte, é transfigurado diante de Pedro, Tiago e João.', ref: 'Mt 17.1-8' },
      { place: 'betania', text: 'Em Betânia, ressuscita Lázaro, morto havia quatro dias.', ref: 'Jo 11.1-44' },
      { place: 'jerico', text: 'Em Jericó, cura o cego Bartimeu e entra na casa de Zaqueu.', ref: 'Lc 18.35-43; 19.1-10' },
      { place: 'oliveiras', text: 'Do monte das Oliveiras entra em Jerusalém montado num jumentinho, aclamado: “Hosana!”', ref: 'Mt 21.1-11' },
      { place: 'templo', text: 'Expulsa os cambistas do templo: “A minha casa será chamada casa de oração”.', ref: 'Mt 21.12-13' },
      { place: 'cenaculo', text: 'Na última ceia, parte o pão e institui a nova aliança no seu sangue.', ref: 'Lc 22.7-20' },
      { place: 'getsemani', text: 'No Getsêmani ora em agonia: “Não seja como eu quero, mas como tu queres”. Ali é preso.', ref: 'Mt 26.36-56' },
      { place: 'caifas', text: 'Diante de Caifás e do Sinédrio é acusado; no pátio, Pedro o nega três vezes.', ref: 'Mt 26.57-75' },
      { place: 'pretorio', text: 'No pretório, Pilatos o interroga, manda açoitá-lo e o entrega para ser crucificado.', ref: 'Jo 18.28-40; 19.1-16' },
      { place: 'golgota', text: 'No Gólgota é crucificado. “Está consumado” — e entrega o espírito.', ref: 'Jo 19.17-30' },
      { place: 'golgota', text: 'José de Arimateia e Nicodemos o sepultam num túmulo novo, num jardim ali perto.', ref: 'Jo 19.38-42' },
      { place: 'golgota', text: 'Ao terceiro dia, o túmulo está vazio: “Não está aqui, porque ressuscitou”.', ref: 'Mt 28.1-7' },
      { place: 'emaus', text: 'No caminho de Emaús, explica as Escrituras a dois discípulos e é reconhecido ao partir o pão.', ref: 'Lc 24.13-35' },
      { place: 'mar', text: 'Junto ao mar da Galileia, aparece aos discípulos e restaura Pedro.', ref: 'Jo 21.1-17' },
      { place: 'oliveiras', text: 'No monte das Oliveiras, perto de Betânia, é elevado ao céu diante dos discípulos.', ref: 'At 1.9-12' },
    ],
    note: 'Ordem aproximada: os evangelhos não seguem sempre a cronologia. Locais tradicionais ou debatidos estão marcados com (?), como o Cenáculo, a casa de Caifás, o Pretório (Fortaleza Antônia ou palácio de Herodes), o Gólgota (Santo Sepulcro), o monte da transfiguração e Emaús.',
    chapters: ['LUK 1', 'LUK 2', 'MAT 1', 'MAT 2', 'MAT 3', 'MAT 4', 'MRK 1', 'MRK 4', 'JHN 1', 'JHN 2', 'JHN 4', 'LUK 4', 'LUK 9', 'MAT 16', 'MAT 17', 'JHN 11', 'LUK 18', 'LUK 19', 'MAT 21', 'MRK 11', 'JHN 12', 'LUK 22', 'MAT 26', 'MRK 14', 'JHN 18', 'JHN 19', 'MAT 27', 'MRK 15', 'LUK 23', 'MAT 28', 'MRK 16', 'LUK 24', 'JHN 20', 'JHN 21', 'ACT 1'],
  },
  {
    id: 'discipulos-apos-a-cruz',
    title: 'Os discípulos depois da cruz',
    period: 'Por volta de 30 d.C.',
    summary: 'Da fuga no Getsêmani às portas trancadas, das mulheres no sepulcro ao caminho de Emaús, da Galileia à ascensão e ao Pentecostes.',
    icon: 'groups',
    bounds: [34.95, 31.66, 35.78, 33.02],
    zoom: 0.012,
    places: [
      { id: 'getsemani', name: 'Getsêmani', lon: 35.2397, lat: 31.7794, label: 'r', group: 'Jerusalém' },
      { id: 'caifas', name: 'Pátio de Caifás', lon: 35.2312, lat: 31.7712, label: 'b', uncertain: true, group: 'Jerusalém' },
      { id: 'golgota', name: 'Gólgota', lon: 35.2296, lat: 31.7785, label: 'l', uncertain: true, group: 'Jerusalém' },
      { id: 'sepulcro', name: 'Sepulcro no jardim', lon: 35.2299, lat: 31.7781, label: 'b', uncertain: true, group: 'Jerusalém' },
      { id: 'reuniao', name: 'Onde estavam reunidos', lon: 35.229, lat: 31.7716, label: 'l', uncertain: true, group: 'Jerusalém' },
      { id: 'oliveiras', name: 'Monte das Oliveiras', lon: 35.2449, lat: 31.7785, label: 'r', group: 'Jerusalém' },
      { id: 'emaus', name: 'Emaús', lon: 35.153, lat: 31.843, label: 'l', uncertain: true },
      { id: 'mar', name: 'Mar de Tiberíades', lon: 35.59, lat: 32.8, label: 'r' },
      { id: 'monte-galileia', name: 'Monte na Galileia', lon: 35.48, lat: 32.86, label: 'l', uncertain: true },
      { id: 'galileia', name: 'Galileia', lon: 35.25, lat: 32.95, region: true },
      { id: 'judeia', name: 'Judeia', lon: 35.05, lat: 31.72, region: true },
      { id: 'cedrom', name: 'Vale do Cedrom', lon: 35.2372, lat: 31.7745, region: true, detail: true },
    ],
    steps: [
      { place: 'getsemani', text: 'Quando Jesus é preso, todos o deixam e fogem.', ref: 'Mc 14.50' },
      { place: 'caifas', text: 'Pedro segue de longe até o pátio do sumo sacerdote e ali nega Jesus três vezes. O galo canta e ele chora amargamente.', ref: 'Lc 22.54-62' },
      { place: 'golgota', text: 'Junto à cruz ficam Maria, mãe de Jesus, a irmã dela, Maria de Clopas, Maria Madalena e o discípulo amado. Jesus entrega sua mãe aos cuidados de João.', ref: 'Jo 19.25-27' },
      { place: 'sepulcro', text: 'José de Arimateia e Nicodemos sepultam o corpo num túmulo novo, num jardim perto do Gólgota.', ref: 'Jo 19.38-42' },
      { place: 'sepulcro', text: 'As mulheres que vieram da Galileia veem onde o corpo foi posto, preparam especiarias e descansam no sábado.', ref: 'Lc 23.55-56' },
      { place: 'sepulcro', text: 'No domingo de madrugada, Maria Madalena, Maria, mãe de Tiago, e Salomé vão ao sepulcro com especiarias: a pedra já tinha sido removida.', ref: 'Mc 16.1-4' },
      { place: 'sepulcro', text: 'Um anjo anuncia: “Ele ressuscitou; não está aqui”, e manda avisar os discípulos e Pedro.', ref: 'Mc 16.5-7' },
      { place: 'reuniao', text: 'Maria Madalena corre até Simão Pedro e o outro discípulo: “Levaram o Senhor do sepulcro”.', ref: 'Jo 20.2' },
      { place: 'sepulcro', text: 'Pedro e João correm ao sepulcro e veem os lençóis e o lenço dobrado. João vê e crê.', ref: 'Jo 20.3-10' },
      { place: 'sepulcro', text: 'Chorando junto ao sepulcro, Maria Madalena vê Jesus ressuscitado: “Maria!” — “Raboni!”', ref: 'Jo 20.11-18' },
      { place: 'emaus', text: 'Dois discípulos caminham para Emaús; Jesus os acompanha e é reconhecido ao partir o pão.', ref: 'Lc 24.13-31' },
      { place: 'reuniao', text: 'Eles voltam correndo a Jerusalém. Com as portas trancadas por medo, os discípulos estão reunidos quando Jesus aparece: “Paz seja convosco”.', ref: 'Lc 24.33-36; Jo 20.19-20' },
      { place: 'reuniao', text: 'Oito dias depois, Tomé vê as marcas e confessa: “Senhor meu, e Deus meu!”', ref: 'Jo 20.26-29' },
      { place: 'mar', text: 'Na Galileia, voltam a pescar. Jesus aparece na praia, faz a pesca maravilhosa e restaura Pedro: “Apascenta as minhas ovelhas”.', ref: 'Jo 21.1-17' },
      { place: 'monte-galileia', text: 'No monte que Jesus indicou, recebem a Grande Comissão: “Ide, fazei discípulos de todas as nações”.', ref: 'Mt 28.16-20' },
      { place: 'oliveiras', text: 'De volta a Jerusalém, veem Jesus ser elevado ao céu do monte das Oliveiras.', ref: 'At 1.9-12' },
      { place: 'reuniao', text: 'No cenáculo, perseveram em oração com as mulheres e Maria, mãe de Jesus.', ref: 'At 1.13-14' },
      { place: 'reuniao', text: 'No dia de Pentecostes, todos ficam cheios do Espírito Santo.', ref: 'At 2.1-4' },
    ],
    note: 'O lugar onde os discípulos se escondiam não é informado; a tradição o associa ao Cenáculo, no monte Sião. O monte da Grande Comissão também não é identificado. Emaús tem localização debatida (aqui, a 60 estádios, cerca de 11 km, de Jerusalém, conforme Lc 24.13).',
    chapters: ['MRK 14', 'LUK 22', 'JHN 19', 'LUK 23', 'MRK 16', 'JHN 20', 'LUK 24', 'JHN 21', 'MAT 28', 'ACT 1', 'ACT 2'],
  },
  {
    id: 'fuga-e-retorno-de-moises',
    title: 'Moisés: a fuga e o retorno ao Egito',
    period: 'Datação debatida (séc. XV ou XIII a.C.)',
    summary: 'Depois de matar um egípcio, Moisés foge para Midiã. Quarenta anos depois, Deus o chama na sarça ardente e o envia de volta ao Egito.',
    icon: 'local_fire_department',
    bounds: [30.6, 27.1, 36.9, 31.4],
    places: [
      { id: 'egito', name: 'Egito (terra de Gósen)', lon: 31.83, lat: 30.8, label: 'r' },
      { id: 'midia', name: 'Midiã', lon: 35.1, lat: 28.4, label: 'r', uncertain: true },
      { id: 'horebe', name: 'Horebe, o monte de Deus', lon: 33.97, lat: 28.54, label: 'b', uncertain: true },
      { id: 'deserto', name: 'Deserto', lon: 34.0, lat: 30.0, region: true },
      { id: 'mar', name: 'Mar Vermelho', lon: 33.4, lat: 27.7, region: true },
    ],
    steps: [
      { place: 'egito', text: 'Já adulto, Moisés defende um hebreu e mata um egípcio. Faraó procura matá-lo, e ele foge.', ref: 'Êx 2.11-15' },
      { place: 'midia', text: 'Em Midiã, defende as filhas do sacerdote junto a um poço, é acolhido por Reuel (Jetro) e se casa com Zípora.', ref: 'Êx 2.15-22' },
      { place: 'midia', text: 'Passa quarenta anos ali como pastor do rebanho de Jetro.', ref: 'At 7.29-30' },
      { place: 'horebe', text: 'Levando o rebanho ao Horebe, vê a sarça que arde sem se consumir. Deus o chama: “Eu Sou o que Sou”, e o envia ao faraó.', ref: 'Êx 3.1-14' },
      { place: 'midia', text: 'Volta a Jetro e pede para retornar ao Egito; parte com a mulher, os filhos e a vara de Deus na mão.', ref: 'Êx 4.18-20' },
      { place: 'horebe', text: 'Arão vem ao seu encontro no monte de Deus, e Moisés lhe conta tudo o que o Senhor dissera.', ref: 'Êx 4.27-28' },
      { place: 'egito', text: 'No Egito, reúnem os anciãos; o povo crê e adora ao ver que Deus havia visitado Israel.', ref: 'Êx 4.29-31' },
    ],
    note: 'Midiã ficava a leste do golfo de Ácaba, no noroeste da Arábia. A localização do Horebe é debatida: aqui está em Jebel Musa, no Sinai (tradição); outra hipótese é Jabal al-Lawz, em Midiã. A saída do Egito com todo o povo está no mapa “O Êxodo”.',
    chapters: ['EXO 2', 'EXO 3', 'EXO 4', 'ACT 7'],
  },
  {
    id: 'cativeiros-de-israel',
    title: 'Os cativeiros de Israel',
    distances: false,
    period: 'c. 732–445 a.C.',
    summary: 'Do Egito à Assíria e à Babilônia: para onde o povo de Deus foi levado em cada cativeiro — e o caminho de volta com Zorobabel, Esdras e Neemias.',
    icon: 'link_off',
    bounds: [30.0, 28.6, 50.0, 38.4],
    zoom: 0.16,
    places: [
      { id: 'gosen', name: 'Gósen (Egito)', lon: 31.8, lat: 30.75, label: 'b', group: 'Egito' },
      { id: 'tafnes', name: 'Tafnes', lon: 32.18, lat: 30.97, label: 'r', group: 'Egito' },
      { id: 'jerusalem', name: 'Jerusalém', lon: 35.23, lat: 31.78, label: 'r', group: 'Judá' },
      { id: 'laquis', name: 'Laquis', lon: 34.85, lat: 31.56, label: 'l', group: 'Judá' },
      { id: 'samaria', name: 'Samaria', lon: 35.19, lat: 32.28, label: 'l', group: 'Israel' },
      { id: 'naftali', name: 'Naftali (Galileia)', lon: 35.45, lat: 33.0, label: 'r', group: 'Israel' },
      { id: 'ribla', name: 'Ribla', lon: 36.55, lat: 34.45, label: 'r' },
      { id: 'goza', name: 'Habor, junto ao rio Gozã', lon: 40.04, lat: 36.83, label: 't' },
      { id: 'ninive', name: 'Nínive', lon: 43.15, lat: 36.36, label: 'r', group: 'Assíria' },
      { id: 'hala', name: 'Hala', lon: 43.7, lat: 36.85, label: 't', uncertain: true, group: 'Assíria' },
      { id: 'medos', name: 'Cidades dos medos', lon: 48.52, lat: 34.8, label: 'l', uncertain: true },
      { id: 'babilonia', name: 'Babilônia', lon: 44.42, lat: 32.54, label: 'l', group: 'Babilônia' },
      { id: 'quebar', name: 'Rio Quebar (Tel-Abibe)', lon: 45.23, lat: 32.13, label: 'r', uncertain: true, group: 'Babilônia' },
      { id: 'susa', name: 'Susã', lon: 48.25, lat: 32.19, label: 'l' },
      { id: 'egito', name: 'Egito', lon: 30.9, lat: 29.3, region: true },
      { id: 'assiria', name: 'Assíria', lon: 43.4, lat: 35.5, region: true },
      { id: 'mesopotamia', name: 'Mesopotâmia', lon: 41.2, lat: 34.1, region: true },
      { id: 'media', name: 'Média', lon: 48.0, lat: 36.0, region: true },
      { id: 'persia', name: 'Elão (Pérsia)', lon: 49.2, lat: 31.0, region: true },
      { id: 'arabia', name: 'Deserto da Arábia', lon: 39.8, lat: 30.6, region: true },
    ],
    steps: [
      { place: 'gosen', text: 'O primeiro cativeiro: no Egito, os filhos de Jacó se multiplicam e são escravizados por um faraó que “não conhecera José”. Deus já tinha avisado Abraão que o povo seria oprimido em terra alheia.', ref: 'Êx 1.8-14; Gn 15.13-14' },
      { place: 'gosen', text: 'Depois de 430 anos, na noite da Páscoa, Deus tira Israel do Egito com mão forte.', ref: 'Êx 12.40-42' },
      { place: 'naftali', text: 'c. 732 a.C. — Começa o cativeiro assírio: Tiglate-Pileser III toma a Galileia e leva cativos os de Naftali.', ref: '2Rs 15.29' },
      { place: 'goza', text: 'Também as tribos do leste do Jordão — Rúben, Gade e a meia tribo de Manassés — são levadas para Hala, Habor, Hara e o rio Gozã.', ref: '1Cr 5.26' },
      { place: 'samaria', text: '722 a.C. — Depois de três anos de cerco, Samaria cai. É o fim do Reino do Norte, as dez tribos de Israel.', ref: '2Rs 17.5-6' },
      { place: 'goza', text: 'Os israelitas são espalhados pelo império assírio: em Hala, em Habor, junto ao rio Gozã…', ref: '2Rs 17.6' },
      { place: 'medos', text: '…e nas cidades dos medos, no atual Irã, a mais de 1.000 km de casa.', ref: '2Rs 18.11' },
      { place: 'samaria', text: 'O motivo: “porque não obedeceram à voz do Senhor”. A Assíria traz outros povos para Samaria — é a origem dos samaritanos.', ref: '2Rs 17.7,24' },
      { place: 'laquis', text: '701 a.C. — Senaqueribe invade Judá e toma as cidades fortificadas, como Laquis.', ref: '2Rs 18.13-14' },
      { place: 'jerusalem', text: 'Ezequias ora no templo, e Deus livra Jerusalém: naquela noite, o anjo do Senhor fere o exército assírio.', ref: '2Rs 19.14-15,35-36' },
      { place: 'babilonia', text: 'O rei Manassés, de Judá, é levado preso com ganchos para a Babilônia. Ali se humilha diante de Deus, que o traz de volta.', ref: '2Cr 33.11-13' },
      { place: 'ribla', text: '609 a.C. — Faraó Neco prende o rei Jeoacaz em Ribla e o leva para o Egito, onde ele morre.', ref: '2Rs 23.33-34' },
      { place: 'babilonia', text: '605 a.C. — 1ª deportação para a Babilônia: Nabucodonosor leva jovens da nobreza, entre eles Daniel, Hananias, Misael e Azarias.', ref: 'Dn 1.1-6' },
      { place: 'babilonia', text: '597 a.C. — 2ª deportação: o rei Joaquim, os príncipes, os guerreiros e os artesãos — 10 mil cativos, entre eles o sacerdote Ezequiel.', ref: '2Rs 24.10-16' },
      { place: 'quebar', text: 'Junto ao rio Quebar, em Tel-Abibe, Ezequiel vê a glória de Deus e profetiza aos exilados.', ref: 'Ez 1.1-3; 3.15' },
      { place: 'jerusalem', text: '586 a.C. — 3ª deportação: depois de um cerco de quase dois anos, Jerusalém é queimada, o templo é destruído e o povo é levado.', ref: '2Rs 25.1-11' },
      { place: 'ribla', text: 'Em Ribla, diante de Nabucodonosor, o rei Zedequias vê seus filhos serem mortos; tem os olhos vazados e é levado acorrentado.', ref: '2Rs 25.6-7' },
      { place: 'tafnes', text: 'Contra a palavra do Senhor, um grupo foge para o Egito e leva o profeta Jeremias à força para Tafnes.', ref: 'Jr 43.4-7' },
      { place: 'babilonia', text: '“Junto aos rios da Babilônia nos assentamos e choramos.” Jeremias escreve aos exilados: edificai casas, orai pela paz da cidade — serão 70 anos.', ref: 'Sl 137.1; Jr 29.4-10' },
      { place: 'babilonia', text: '539 a.C. — Na noite do banquete de Belsazar, a Babilônia cai diante dos medos e persas.', ref: 'Dn 5.30-31' },
      { place: 'babilonia', text: '538 a.C. — Ciro, rei da Pérsia, decreta que os judeus podem voltar e reconstruir o templo, como Isaías tinha anunciado.', ref: 'Ed 1.1-4; Is 44.28' },
      { place: 'jerusalem', text: '1º retorno: com Zorobabel e o sumo sacerdote Josué voltam 42.360 pessoas. O templo é reconstruído e concluído em 516 a.C.', ref: 'Ed 2.64; 6.15' },
      { place: 'susa', text: 'Em Susã, capital persa, a rainha Ester arrisca a vida, e Deus livra os judeus que ficaram no império.', ref: 'Et 4.14-16' },
      { place: 'jerusalem', text: '458 a.C. — 2º retorno: o escriba Esdras volta para ensinar a Lei ao povo.', ref: 'Ed 7.6-10' },
      { place: 'susa', text: 'Em Susã, Neemias, copeiro do rei, chora ao saber dos muros caídos de Jerusalém e pede para voltar.', ref: 'Ne 1.1-4; 2.1-6' },
      { place: 'jerusalem', text: '445 a.C. — 3º retorno: Neemias reconstrói os muros de Jerusalém em 52 dias.', ref: 'Ne 6.15' },
    ],
    note: 'Hala e Habor ficavam no norte da Mesopotâmia (Gozã é a atual Tell Halaf, na Síria); a posição exata de Hala e do rio Quebar é estimada. As dez tribos do Norte nunca voltaram como reino; de Judá, voltaram os que quiseram, em três grupos.',
    chapters: ['2KI 15', '1CH 5', '2KI 17', '2KI 18', '2KI 19', '2CH 33', '2KI 23', 'DAN 1', '2KI 24', 'EZK 1', '2KI 25', 'JER 43', 'PSA 137', 'JER 29', 'DAN 5', 'EZR 1', 'EZR 2', 'EST 4', 'EZR 7', 'NEH 1', 'NEH 6'],
  },
  TRIBES_MAP,
];

export const findMap = (id: string) => BIBLE_MAPS.find((m) => m.id === id) ?? CHURCH_MAPS.find((m) => m.id === id);

/** Mapa da história da Igreja (sem capítulos da Bíblia; as etapas têm datas). */
export const isChurchMap = (map: BibleMap) => CHURCH_MAPS.includes(map);

/** Posição de um capítulo na ordem da Bíblia ("GEN 11" → 11, "EXO 2" → 1002…). */
const position = (chapter: string) => {
  const [bookId, n] = chapter.split(' ');
  return BOOKS.findIndex((b) => b.id === bookId) * 1000 + Number(n);
};

/** Referência resumida de um mapa: "Gênesis 11–13" ou "Mateus 1 – Atos 1". */
export function mapReference(map: BibleMap): string {
  const sorted = [...map.chapters].sort((a, b) => position(a) - position(b));
  const label = (c: string) => {
    const [bookId, n] = c.split(' ');
    return { book: BOOKS.find((b) => b.id === bookId)!.name, n };
  };
  const first = label(sorted[0]);
  const last = label(sorted.at(-1)!);
  if (sorted.length === 1) return `${first.book} ${first.n}`;
  return first.book === last.book ? `${first.book} ${first.n}–${last.n}` : `${first.book} ${first.n} – ${last.book} ${last.n}`;
}

/** Testamento de um mapa (pelo primeiro capítulo). */
export const mapTestament = (map: BibleMap): Testament =>
  BOOKS.find((b) => b.id === [...map.chapters].sort((a, c) => position(a) - position(c))[0].split(' ')[0])!.testament;

/** Mapas na ordem dos livros da Bíblia (pelo primeiro capítulo de cada um). */
export const MAPS_IN_ORDER: BibleMap[] = [...BIBLE_MAPS].sort((a, b) => {
  const first = (m: BibleMap) => Math.min(...m.chapters.map(position));
  // Empate (ex.: dois mapas que começam em Mateus 1): o mais abrangente vem primeiro
  return first(a) - first(b) || b.steps.length - a.steps.length;
});

/** Mapas ligados a um capítulo, ex.: mapsFor('ACT', 16). */
export const mapsFor = (bookId: string, chapter: number) =>
  BIBLE_MAPS.filter((m) => m.chapters.includes(`${bookId} ${chapter}`));

/** Projeção usada pelo app e pelo gerador de geografia (mesma fórmula). */
export const MAP_WIDTH = 1000;

export function projector(bounds: BibleMap['bounds']) {
  const [lonMin, latMin, lonMax, latMax] = bounds;
  const cos = Math.cos((((latMin + latMax) / 2) * Math.PI) / 180);
  const k = MAP_WIDTH / ((lonMax - lonMin) * cos);
  return {
    width: MAP_WIDTH,
    height: (latMax - latMin) * k,
    x: (lon: number) => (lon - lonMin) * cos * k,
    y: (lat: number) => (latMax - lat) * k,
  };
}
