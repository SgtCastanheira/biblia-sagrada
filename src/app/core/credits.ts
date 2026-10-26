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
      { name: 'Bíblia Livre (BLIVRE)', use: 'Texto embutido no app. Copyright © 2018 Diego Santos, Mario Sérgio e Marco Teles.', license: 'Creative Commons Atribuição 4.0 Brasil (CC BY 4.0)', url: 'https://ebible.org/porbr2018/copyright.htm' },
      { name: 'Biblica® Open Nova Bíblia Viva™', use: 'Texto embutido no app, sem alterações. Copyright © 2007, 2010 by Biblica, Inc. “Biblica” é uma marca registrada na Oficina de Patentes e Marcas dos Estados Unidos por Biblica, Inc. Usado com permissão. O original está disponível gratuitamente em www.biblica.com e open.bible.', license: 'Creative Commons Atribuição-CompartilhaIgual 4.0 (CC BY-SA 4.0)', url: 'https://open.bible' },
      { name: 'Bíblia Portuguesa Mundial (BPM)', use: 'Texto embutido no app (versão em revisão, sem os livros deuterocanônicos).', license: 'Domínio público', url: 'https://ebible.org/porbrbsl/' },
      { name: 'Bíblia Livre Para Todos (BLT)', use: 'Novo Testamento embutido no app. Copyright © 2022 Free Bible Ministry, Inc.', license: 'Creative Commons Atribuição-CompartilhaIgual 4.0 (CC BY-SA 4.0)', url: 'https://ebible.org/porblt/copyright.htm' },
      { name: 'Bíblia Nova Versão de Acesso Livre (NVA)', use: 'Texto embutido no app, do módulo da CrossWire. Baseada na Unlocked Literal Bible; biblianva.com.br.', license: 'Creative Commons Atribuição-CompartilhaIgual 4.0 (CC BY-SA 4.0)', url: 'https://www.biblianva.com.br' },
      { name: 'Almeida 1911', use: 'Reimpressão de 1911 da tradução de João Ferreira de Almeida, com a ortografia original. Texto embutido, do módulo PorAlmeida1911 da CrossWire.', license: 'Texto em domínio público; módulo distribuído sob GPL', url: 'https://www.crosswire.org/sword/modules/ModInfo.jsp?modName=PorAlmeida1911' },
      { name: 'CrossWire Bible Society e pysword', use: 'Fonte dos módulos SWORD da NVA e da Almeida 1911, convertidos com o pysword.', license: 'Serviço gratuito; pysword sob licença MIT', url: 'https://www.crosswire.org' },
      { name: 'Louis Segond (1910)', use: 'Bíblia em francês, texto embutido no app, do eBible.org (fraLSG).', license: 'Domínio público', url: 'https://ebible.org/fraLSG/' },
      { name: 'eBible.org', use: 'Fonte dos arquivos das versões em português de licença livre.', license: 'Serviço gratuito', url: 'https://ebible.org' },
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
    group: 'Fotos',
    items: [
      { name: 'Gunnar Vingren (1908)', use: 'Foto nos estudos da história da Igreja.', license: 'Domínio público (autor desconhecido)', url: 'https://commons.wikimedia.org/wiki/File:Gunnar_Vingren.jpg' },
      { name: 'Paulo Leivas Macalão', use: 'Foto no estudo sobre Madureira.', license: 'Domínio público', url: 'https://commons.wikimedia.org/wiki/File:Paulo_Leivas_Macal%C3%A3o.jpg' },
      { name: 'Frida Vingren', use: 'Foto no estudo sobre Frida Vingren. Acervo do Centro de Estudos Pentecostais da CPAD.', license: 'Creative Commons Atribuição-CompartilhaIgual 3.0 (CC BY-SA 3.0)', url: 'https://commons.wikimedia.org/wiki/File:Frida_Vingren.jpg' },
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
