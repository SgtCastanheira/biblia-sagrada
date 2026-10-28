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
      { title: 'A Ponte entre os Testamentos', ids: ['entre-os-testamentos', 'grupos-do-tempo-de-jesus'] },
      { title: 'Estudos', ids: ['ministerios-na-biblia', 'cativeiros-de-israel', 'os-faraos-da-biblia'] },
    ],
  },
  {
    id: 'um-so-deus',
    name: 'Um Só Deus',
    short: 'Um Só Deus',
    description: 'Quem é o Deus da Bíblia, Pai, Filho e Espírito Santo, e por que a Bíblia rejeita os outros deuses.',
    icon: 'church',
    branches: [
      { title: 'Quem É Deus', ids: ['trindade'] },
      { title: 'Os Falsos Deuses', ids: ['deuses-pagaos'] },
    ],
  },
  {
    id: 'sobre-a-biblia',
    name: 'De Onde Veio a Bíblia',
    short: 'Sobre a Bíblia',
    description: 'Como os livros foram escritos, reunidos, copiados e traduzidos até a Almeida.',
    icon: 'auto_stories',
    collections: ['biblia'],
    branches: [
      { title: 'A Bíblia dos Judeus', ids: ['biblia-judaica'] },
      { title: 'Como Foi Escrita e Reunida', ids: ['formacao-do-antigo-testamento', 'septuaginta', 'formacao-do-novo-testamento', 'apocrifos'] },
      { title: 'Os Textos e as Línguas', ids: ['manuscritos', 'idiomas-da-biblia', 'capitulos-e-versiculos'] },
      { title: 'As Traduções', ids: ['vulgata-e-traducoes', 'biblia-em-portugues'] },
    ],
  },
  {
    id: 'contexto',
    name: 'Contexto Histórico',
    short: 'Contexto Histórico',
    description: 'O que as palavras, os costumes e a vida da época significavam para os primeiros ouvintes.',
    icon: 'school',
    collections: ['contexto'],
    branches: [
      { title: 'Roma e o Poder', ids: ['legiao-e-o-exercito-romano', 'crucificacao-romana', 'a-familia-de-herodes'] },
      { title: 'A Fé e a Família', ids: ['casamento-judaico', 'o-templo-de-herodes'] },
      { title: 'O Trabalho e o Dinheiro', ids: ['dinheiro-e-salarios', 'pastores-e-ovelhas', 'agricultura-no-tempo-de-jesus'] },
      { title: 'O Tempo e as Festas', ids: ['natal-e-os-calendarios'] },
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
      { title: 'Comece por Aqui', ids: ['como-interpretar-profecias'] },
      { title: 'Daniel e Apocalipse', ids: ['profecias-de-daniel', 'apocalipse'] },
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
      { title: 'Os Primeiros Séculos', ids: ['panorama-da-igreja', 'igreja-primitiva', 'perseguicoes', 'constantino-e-os-concilios'] },
      { title: 'A Idade Média', ids: ['idade-media', 'pre-reformadores'] },
      { title: 'A Reforma', ids: ['reforma-protestante', 'reformadores', 'reforma-inglesa', 'contrarreforma'] },
      { title: 'Despertamentos e Missões', ids: ['pietismo-e-moravios', 'grandes-despertamentos', 'escola-dominical', 'missoes-modernas'] },
    ],
  },
  {
    id: 'pentecostalismo',
    name: 'Pentecostalismo e Avivamentos',
    short: 'Pentecostalismo',
    description: 'De Azusa Street aos grandes avivamentos: como começaram, por quem, como terminaram e o que mudaram.',
    icon: 'local_fire_department',
    collections: ['avivamentos'],
    branches: [
      { title: 'O Movimento Pentecostal', ids: ['movimento-pentecostal'] },
      { title: 'Os Grandes Avivamentos', ids: ['avivamentos-desde-atos', 'avivamento-de-oracao-1857', 'avivamento-do-pais-de-gales', 'avivamento-da-coreia', 'avivamento-da-africa-oriental', 'avivamento-das-hebridas'] },
      { title: 'A Teologia Pentecostal', ids: ['teologia-sistematico-carismatica'] },
    ],
  },
  {
    id: 'evangelho-no-brasil',
    name: 'O Evangelho no Brasil',
    short: 'Evangelho no Brasil',
    description: 'Os pioneiros, a igreja em cada estado, as perseguições e as convenções: o pentecostalismo brasileiro.',
    icon: 'flag',
    branches: [
      { title: 'Os Pioneiros', ids: ['pentecostes-no-brasil', 'daniel-berg-e-gunnar-vingren', 'frida-vingren'] },
      {
        title: 'A Igreja pelo País',
        ids: ['assembleia-de-deus-no-brasil'],
        links: [
          { link: '/assembleia-de-deus', icon: 'pin_drop', name: 'Estado por estado', description: 'Quando e por quem a igreja chegou a cada estado.' },
          { link: '/assembleia-de-deus/linha-do-tempo', icon: 'timeline', name: 'Linha do tempo', description: 'A igreja e o que acontecia no Brasil, ano a ano.' },
          { link: '/mapas/assembleia-de-deus-estados', icon: 'map', name: 'No mapa', description: 'De onde saiu cada pioneiro.' },
        ],
      },
      { title: 'Perseguições, Convenções e Cargos', ids: ['irmaos-perseguidos', 'madureira-e-a-separacao', 'cargos-na-assembleia-de-deus'] },
    ],
  },
  {
    id: 'harpa',
    name: 'Harpa Cristã',
    short: 'Harpa Cristã',
    description: 'A história do hinário que acompanha os cultos da Assembleia de Deus.',
    icon: 'music_note',
    branches: [{
      title: 'A História e os Hinos',
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
