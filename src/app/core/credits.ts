/** Fontes de dados, textos e programas usados no app, com as suas licenças. */
export interface Credit {
  name: string;
  use: string;
  license: string;
  url?: string;
}

export const CREDITS: { group: string; items: Credit[] }[] = [
  {
    group: 'Texto bíblico',
    items: [
      { name: 'Bíblia de João Ferreira de Almeida', use: 'Texto embutido no app, com correções de caracteres e a ortografia do Acordo de 1990.', license: 'Domínio público' },
      { name: 'bible-api.com', use: 'As demais versões, todas em domínio público, carregadas pela internet.', license: 'Serviço gratuito; textos em domínio público', url: 'https://bible-api.com' },
    ],
  },
  {
    group: 'Estudo',
    items: [
      { name: 'OpenBible.info — Cross References', use: 'Textos relacionados de cada versículo (referências cruzadas automáticas).', license: 'Creative Commons Atribuição (CC BY)', url: 'https://www.openbible.info/labs/cross-references/' },
      { name: 'Números de Strong', use: 'Numeração das palavras hebraicas e gregas, de James Strong (1890).', license: 'Domínio público' },
      { name: 'Dicionário, memorial, notas, aulas, profecias e artigos', use: 'Textos escritos para este aplicativo.', license: 'Conteúdo do app' },
    ],
  },
  {
    group: 'Sermões históricos',
    items: [
      { name: 'Wikisource', use: 'Textos originais de Jonathan Edwards, John Wesley e George Whitefield.', license: 'Domínio público', url: 'https://en.wikisource.org' },
      { name: 'The Spurgeon Center', use: 'Texto original do sermão de C. H. Spurgeon.', license: 'Domínio público', url: 'https://www.spurgeon.org' },
      { name: 'Projeto Gutenberg', use: 'The Way to God, de D. L. Moody.', license: 'Domínio público', url: 'https://www.gutenberg.org/ebooks/30449' },
      { name: 'Pregações recomendadas', use: 'Só o tema e um link de busca: os sermões pertencem aos seus autores.', license: 'Direitos dos autores' },
    ],
  },
  {
    group: 'Mapas',
    items: [
      { name: 'Natural Earth', use: 'Litoral, rios, lagos e fronteiras atuais dos mapas e do atlas.', license: 'Domínio público', url: 'https://www.naturalearthdata.com' },
      { name: 'Fronteiras antigas e lugares', use: 'Traçados aproximados feitos para o app, para fins de estudo.', license: 'Conteúdo do app' },
    ],
  },
  {
    group: 'Fontes e programas',
    items: [
      { name: 'Inter, Source Serif 4 e Lora', use: 'Fontes do texto.', license: 'SIL Open Font License 1.1', url: 'https://fonts.google.com' },
      { name: 'Material Symbols', use: 'Ícones.', license: 'Apache 2.0', url: 'https://fonts.google.com/icons' },
      { name: 'Angular e Angular Material', use: 'Estrutura do aplicativo.', license: 'MIT', url: 'https://angular.dev' },
    ],
  },
];
