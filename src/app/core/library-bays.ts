import { CHURCH_MAPS } from './church-maps';
import { MAPS_IN_ORDER, mapTestament } from './maps';

/** Um livro das estantes de ferramentas: leva a uma tela de estudo (mapa, memorial, dicionário...). */
export interface ToolBook {
  title: string;
  subtitle: string;
  icon: string;
  /** Endereço completo, com os parâmetros (ex.: `/memorial?grupo=dois-reinos`). */
  url: string;
  /** Linha pequena sobre o livro (a época de um mapa, por exemplo). */
  period?: string;
}

export interface ToolShelf {
  title: string;
  books: ToolBook[];
}

/** Uma estante (tópico) que não é uma trilha de histórias: reúne as ferramentas e os mapas do estudo. */
export interface ToolBay {
  id: string;
  name: string;
  short: string;
  icon: string;
  /** Cor da capa: escura, com texto creme e dourado a 4,5:1 (veja logica/estante.spec.ts). */
  tone: string;
  shelves: ToolShelf[];
}

const mapBook = (m: (typeof MAPS_IN_ORDER)[number]): ToolBook => ({ title: m.title, subtitle: m.summary, icon: m.icon, url: `/mapas/${m.id}`, period: m.period });

/**
 * As estantes do que era a tela Estudo: mapas, personagens, contexto e palavras. Cada mapa é um livro, e
 * cada ferramenta também. As histórias ficam nas trilhas (`trails.ts`); nada aparece nos dois lugares.
 */
export const TOOL_BAYS: ToolBay[] = [
  {
    id: 'mapas',
    name: 'Mapas e Lugares',
    short: 'Mapas e Lugares',
    icon: 'map',
    tone: '#135e75',
    shelves: [
      { title: 'Antigo Testamento', books: MAPS_IN_ORDER.filter((m) => mapTestament(m) === 'AT').map(mapBook) },
      { title: 'Novo Testamento', books: MAPS_IN_ORDER.filter((m) => mapTestament(m) === 'NT').map(mapBook) },
      { title: 'História da Igreja', books: CHURCH_MAPS.map(mapBook) },
      {
        title: 'O Mundo da Bíblia',
        books: [{ title: 'Atlas Histórico', subtitle: 'Reinos, impérios e povos, de antes de Abraão ao Império Romano, época por época.', icon: 'public', url: '/atlas' }],
      },
    ],
  },
  {
    id: 'personagens',
    name: 'Personagens e Famílias',
    short: 'Personagens',
    icon: 'groups',
    tone: '#8f4a2e',
    shelves: [
      {
        title: 'Heróis da Fé',
        books: [
          { title: 'Memorial da Fé', subtitle: 'Patriarcas, juízes, profetas, reis, nazireus, mulheres de fé e apóstolos.', icon: 'military_tech', url: '/memorial' },
          { title: 'Personagens na Ordem do Tempo', subtitle: 'Todos os personagens na ordem da história, de Adão aos apóstolos.', icon: 'timeline', url: '/memorial?grupo=linha-do-tempo' },
          { title: 'Os Dois Reinos', subtitle: 'Os reis de Israel e de Judá lado a lado, com a avaliação de cada um.', icon: 'compare_arrows', url: '/memorial?grupo=dois-reinos' },
        ],
      },
      {
        title: 'Famílias de Israel',
        books: [
          { title: 'As Doze Tribos de Israel', subtitle: 'Os filhos de Jacó, as bênçãos, os líderes e a vocação de cada tribo.', icon: 'diversity_3', url: '/tribos' },
          { title: 'Genealogia de Jesus', subtitle: 'De Adão a Maria: as linhas de Mateus e de Lucas, com os reis.', icon: 'account_tree', url: '/genealogia' },
        ],
      },
    ],
  },
  {
    id: 'contexto-cultural',
    name: 'Contexto e Cultura',
    short: 'Contexto e Cultura',
    icon: 'history_edu',
    tone: '#4a5f3a',
    shelves: [
      {
        title: 'Para Entender a Bíblia',
        books: [
          { title: 'Contexto dos Livros', subtitle: 'Autor, data e cenário de cada livro, de Gênesis a Apocalipse, com tudo o que há para estudar nele.', icon: 'menu_book', url: '/estudo/livros' },
          { title: 'Você Sabia?', subtitle: 'Curiosidades bíblicas, com os versículos.', icon: 'lightbulb', url: '/curiosidades' },
          { title: 'Você Lembra o que Leu?', subtitle: 'Jogo de perguntas com alternativas A, B, C e D sobre um capítulo, um livro inteiro ou uma história.', icon: 'quiz', url: '/quiz' },
        ],
      },
      {
        title: 'O Tempo',
        books: [{ title: 'A Linha do Tempo', subtitle: 'Da Criação aos nossos dias, em 16 épocas: as histórias, os personagens e as crises do mundo, tudo junto.', icon: 'timeline', url: '/epocas' }],
      },
    ],
  },
  {
    id: 'palavras-e-promessas',
    name: 'Palavras e Promessas',
    short: 'Palavras e Promessas',
    icon: 'translate',
    tone: '#6f3b5c',
    shelves: [
      {
        title: 'Promessas e Pregações',
        books: [
          { title: 'Promessas e Profecias', subtitle: 'Do anúncio ao cumprimento, e o que ainda é esperado.', icon: 'star', url: '/profecias' },
          { title: 'Sermões que Marcaram a História', subtitle: 'Wesley, Edwards, Spurgeon, Moody e pregadores de hoje.', icon: 'campaign', url: '/avivamento' },
        ],
      },
      {
        title: 'Dicionário por Idioma',
        books: [
          { title: 'Dicionário de Hebraico', subtitle: 'Os termos do Antigo Testamento que vêm do hebraico, com a palavra original, a leitura e os sentidos.', icon: 'translate', url: '/dicionario?lingua=he' },
          { title: 'Dicionário de Aramaico', subtitle: 'As palavras aramaicas da Bíblia, como Talita cumi, Efatá, Aba e Maranata, com a palavra original e os sentidos.', icon: 'translate', url: '/dicionario?lingua=ar' },
          { title: 'Dicionário de Grego', subtitle: 'Os termos do Novo Testamento que vêm do grego, com a palavra original, a leitura e os sentidos.', icon: 'translate', url: '/dicionario?lingua=gr' },
          { title: 'Dicionário de Latim', subtitle: 'O latim por trás de palavras que a igreja usa até hoje, como gratia, fides e ecclesia.', icon: 'translate', url: '/dicionario?lingua=la' },
        ],
      },
      {
        title: 'Dicionário do Seu Jeito',
        books: [
          { title: 'Dicionário Bíblico de A a Z', subtitle: 'Todos os verbetes em ordem alfabética, com pesquisa.', icon: 'sort_by_alpha', url: '/dicionario' },
          { title: 'Dicionário pela Ordem da Bíblia', subtitle: 'Os verbetes na ordem em que aparecem, de Gênesis a Apocalipse.', icon: 'menu_book', url: '/dicionario?ordem=biblia' },
          { title: 'Dicionário por Assunto', subtitle: 'Nomes, lugares, festas, medidas, expressões e termos, cada grupo no seu lugar.', icon: 'category', url: '/dicionario?ordem=assunto' },
          { title: 'Dicionário dos Verbos', subtitle: 'Os verbos da Bíblia, com as conjugações e os sentidos.', icon: 'format_list_bulleted', url: '/dicionario?lingua=verbos' },
        ],
      },
    ],
  },
];
