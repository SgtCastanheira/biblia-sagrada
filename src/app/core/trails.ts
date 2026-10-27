import { ARTICLES, type ArticleCollection } from './library';

/** Um atalho para outra tela do app, mostrado junto das histórias da trilha. */
export interface TrailLink {
  link: string;
  icon: string;
  name: string;
  description: string;
}

/** Um ramo da trilha: um grupo de histórias (e, se houver, atalhos) sob um título. */
export interface TrailBranch {
  title: string;
  ids: string[];
  links?: TrailLink[];
}

/**
 * Trilha de histórias: um assunto com o seu círculo na tela de histórias (como os destaques do Instagram).
 * Só organiza a apresentação; cada artigo continua na sua coleção de `library.ts`.
 */
export interface Trail {
  id: string;
  name: string;
  /** Nome curto, sob o círculo. */
  short: string;
  description: string;
  icon: string;
  branches: TrailBranch[];
  /** Coleções antigas que levam a esta trilha (links com ?colecao=). */
  collections?: ArticleCollection[];
}

export const TRAILS: Trail[] = [
  {
    id: 'historias-da-biblia',
    name: 'Histórias da Bíblia',
    short: 'Histórias da Bíblia',
    description: 'Povos, personagens e acontecimentos da própria Bíblia, com mapas e linhas do tempo.',
    icon: 'menu_book',
    collections: ['estudos'],
    branches: [
      { title: 'Estudos', ids: ['ministerios-na-biblia', 'cativeiros-de-israel'] },
      {
        title: 'Para explorar',
        ids: [],
        links: [
          { link: '/memorial', icon: 'groups', name: 'Personagens e reis', description: 'Quem foi quem, em ordem cronológica.' },
          { link: '/tribos', icon: 'diversity_3', name: 'As doze tribos', description: 'Onde cada tribo morou e o que a Bíblia diz dela.' },
          { link: '/genealogia', icon: 'account_tree', name: 'Árvore genealógica', description: 'De Adão a Jesus.' },
          { link: '/curiosidades', icon: 'lightbulb', name: 'Curiosidades', description: 'Detalhes que passam despercebidos na leitura.' },
        ],
      },
    ],
  },
  {
    id: 'sobre-a-biblia',
    name: 'De onde veio a Bíblia',
    short: 'Sobre a Bíblia',
    description: 'Como os livros foram escritos, reunidos, copiados e traduzidos até a Almeida.',
    icon: 'auto_stories',
    collections: ['biblia'],
    branches: [
      { title: 'Como foi escrita e reunida', ids: ['formacao-do-antigo-testamento', 'septuaginta', 'formacao-do-novo-testamento', 'apocrifos'] },
      { title: 'Os textos e as línguas', ids: ['manuscritos', 'idiomas-da-biblia', 'capitulos-e-versiculos'] },
      { title: 'As traduções', ids: ['vulgata-e-traducoes', 'biblia-em-portugues'] },
    ],
  },
  {
    id: 'contexto',
    name: 'Contexto histórico',
    short: 'Contexto histórico',
    description: 'O que as palavras, os costumes e a vida da época significavam para os primeiros ouvintes.',
    icon: 'school',
    collections: ['contexto'],
    branches: [
      { title: 'Roma e o poder', ids: ['legiao-e-o-exercito-romano', 'crucificacao-romana', 'a-familia-de-herodes'] },
      { title: 'A fé e a família', ids: ['casamento-judaico', 'o-templo-de-herodes'] },
      { title: 'O trabalho e o dinheiro', ids: ['dinheiro-e-salarios', 'pastores-e-ovelhas', 'agricultura-no-tempo-de-jesus'] },
    ],
  },
  {
    id: 'profecias',
    name: 'Profecias',
    short: 'Profecias',
    description: 'Como ler as profecias, Daniel e Apocalipse, com o contexto histórico e as principais interpretações.',
    icon: 'visibility',
    collections: ['profecias'],
    branches: [
      { title: 'Comece por aqui', ids: ['como-interpretar-profecias'] },
      { title: 'Daniel e Apocalipse', ids: ['profecias-de-daniel', 'apocalipse'], links: [{ link: '/profecias', icon: 'visibility', name: 'Todas as profecias', description: 'Cumpridas, em debate e futuras.' }] },
    ],
  },
  {
    id: 'igreja',
    name: 'História da Igreja',
    short: 'História da Igreja',
    description: 'De Pentecostes às reformas e às missões: como a fé chegou até nós.',
    icon: 'history_edu',
    collections: ['igreja'],
    branches: [
      { title: 'Os primeiros séculos', ids: ['panorama-da-igreja', 'igreja-primitiva', 'perseguicoes', 'constantino-e-os-concilios'] },
      { title: 'A Idade Média', ids: ['idade-media', 'pre-reformadores'] },
      { title: 'A Reforma', ids: ['reforma-protestante', 'reformadores', 'reforma-inglesa', 'contrarreforma'] },
      { title: 'Despertamentos e missões', ids: ['pietismo-e-moravios', 'grandes-despertamentos', 'escola-dominical', 'missoes-modernas'] },
    ],
  },
  {
    id: 'pentecostalismo',
    name: 'Pentecostalismo e avivamentos',
    short: 'Pentecostalismo',
    description: 'De Azusa Street aos grandes avivamentos: como começaram, por quem, como terminaram e o que mudaram.',
    icon: 'local_fire_department',
    collections: ['avivamentos'],
    branches: [
      { title: 'O movimento pentecostal', ids: ['movimento-pentecostal'] },
      { title: 'Os grandes avivamentos', ids: ['avivamentos-desde-atos', 'avivamento-de-oracao-1857', 'avivamento-do-pais-de-gales', 'avivamento-da-coreia', 'avivamento-da-africa-oriental', 'avivamento-das-hebridas'] },
    ],
  },
  {
    id: 'evangelho-no-brasil',
    name: 'O evangelho no Brasil',
    short: 'Evangelho no Brasil',
    description: 'Os pioneiros, a igreja em cada estado, as perseguições e as convenções: o pentecostalismo brasileiro.',
    icon: 'flag',
    branches: [
      { title: 'Os pioneiros', ids: ['pentecostes-no-brasil', 'daniel-berg-e-gunnar-vingren', 'frida-vingren'] },
      {
        title: 'A igreja pelo país',
        ids: ['assembleia-de-deus-no-brasil'],
        links: [
          { link: '/assembleia-de-deus', icon: 'pin_drop', name: 'Estado por estado', description: 'Quando e por quem a igreja chegou a cada estado.' },
          { link: '/assembleia-de-deus/linha-do-tempo', icon: 'timeline', name: 'Linha do tempo', description: 'A igreja e o que acontecia no Brasil, ano a ano.' },
          { link: '/mapas/assembleia-de-deus-estados', icon: 'map', name: 'No mapa', description: 'De onde saiu cada pioneiro.' },
        ],
      },
      { title: 'Perseguições e convenções', ids: ['irmaos-perseguidos', 'madureira-e-a-separacao'] },
    ],
  },
  {
    id: 'harpa',
    name: 'Harpa Cristã',
    short: 'Harpa Cristã',
    description: 'A história do hinário que acompanha os cultos da Assembleia de Deus.',
    icon: 'music_note',
    branches: [{
      title: 'A história e os hinos',
      ids: ['harpa-crista'],
      links: [{ link: '/harpa', icon: 'library_music', name: 'Os hinos', description: 'Número, título, autor e a origem de cada hino.' }],
    }],
  },
];

export const findTrail = (id: string | undefined) => TRAILS.find((t) => t.id === id);

/** Trilha de um link antigo (?colecao=…). */
export const trailOfCollection = (collection: string | undefined) => TRAILS.find((t) => t.collections?.includes(collection as ArticleCollection));

/** Trilha em que um artigo aparece. */
export const trailOfArticle = (articleId: string) => TRAILS.find((t) => t.branches.some((b) => b.ids.includes(articleId)));

export const trailArticleIds = (t: Trail) => t.branches.flatMap((b) => b.ids);

/** Artigos que não estão em nenhuma trilha (deve ser vazio: o teste confere). */
export const articlesWithoutTrail = () => ARTICLES.filter((a) => !trailOfArticle(a.id));
