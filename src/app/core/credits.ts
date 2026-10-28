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
      { name: 'Reina-Valera 1909', use: 'Bíblia em espanhol, texto embutido no app, do eBible.org (spaRV1909).', license: 'Domínio público', url: 'https://ebible.org/spaRV1909/' },
      { name: 'Versión Biblia Libre (VBL)', use: 'Bíblia em espanhol, texto embutido no app. Copyright © 2018–2020 Jonathan Gallagher e Shelly Barrios de Avila.', license: 'Creative Commons Atribuição-CompartilhaIgual 4.0 (CC BY-SA 4.0)', url: 'https://ebible.org/spavbl/' },
      { name: 'Biblica® Open Nueva Biblia Viva™', use: 'Bíblia em espanhol, texto embutido no app, sem alterações. Copyright © 2006, 2008 by Biblica, Inc. “Biblica” é uma marca registrada na Oficina de Patentes e Marcas dos Estados Unidos por Biblica, Inc. Usado com permissão.', license: 'Creative Commons Atribuição-CompartilhaIgual 4.0 (CC BY-SA 4.0)', url: 'https://ebible.org/spaonbv/' },
      { name: 'La Biblia en Español Sencillo', use: 'Bíblia em espanhol simples, texto embutido no app, do eBible.org (spabes).', license: 'Domínio público', url: 'https://ebible.org/spabes/' },
      { name: 'Santa Biblia libre Latinoamericano', use: 'Bíblia em espanhol latino-americano, texto embutido no app (sem os livros deuterocanônicos), do eBible.org (spabll).', license: 'Domínio público', url: 'https://ebible.org/spabll/' },
      { name: 'Lutherbibel 1912', use: 'Bíblia em alemão, texto embutido no app, do eBible.org (deu1912).', license: 'Domínio público', url: 'https://ebible.org/deu1912/' },
      { name: 'Elberfelder 1905 (Unrevidierte)', use: 'Bíblia em alemão, texto embutido no app, do eBible.org (deuelo).', license: 'Domínio público', url: 'https://ebible.org/deuelo/' },
      { name: 'Schlachter 1951', use: 'Bíblia em alemão, texto embutido no app, do eBible.org (deu1951). Copyright © 1951 Genfer Bibelgesellschaft (Sociedade Bíblica de Genebra).', license: 'Creative Commons Atribuição 4.0 (CC BY 4.0)', url: 'https://ebible.org/deu1951/' },
      { name: 'Bíblia hebraica (Franz Delitzsch)', use: 'Antigo e Novo Testamento em hebraico, texto consonantal (sem vogais), embutido no app, do eBible.org (heb).', license: 'Domínio público', url: 'https://ebible.org/heb/' },
      { name: 'Guarani Mbyá: Nhanderuete ayvu iky’a e’ỹ va’e', use: 'Bíblia completa embutido no app, sem nenhuma mudança no texto ou na pontuação, do eBible.org (gun). Copyright © 2004 Wycliffe Bible Translators, Inc.', license: 'Creative Commons Atribuição-NãoComercial-SemDerivações 3.0 (CC BY-NC-ND 3.0)', url: 'https://ebible.org/gun/' },
      { name: 'Guajajára: Tupàn ze’eg', use: 'Bíblia completa embutido no app, sem nenhuma mudança no texto ou na pontuação, do eBible.org (gubBl). Copyright © 2007 Wycliffe Bible Translators, Inc.', license: 'Creative Commons Atribuição-NãoComercial-SemDerivações 3.0 (CC BY-NC-ND 3.0)', url: 'https://ebible.org/gubBl/' },
      { name: 'Kaiwá (Guarani Kaiowá): Nhandejáry Nhe’ẽ', use: 'Novo Testamento embutido no app, sem nenhuma mudança no texto ou na pontuação, do eBible.org (kgkNT). Copyright © 2006 Wycliffe Bible Translators, Inc.', license: 'Creative Commons Atribuição-NãoComercial-SemDerivações 3.0 (CC BY-NC-ND 3.0)', url: 'https://ebible.org/kgkNT/' },
      { name: 'Kayabí: Janeruwarete ’Ga Je’eg', use: 'Novo Testamento embutido no app, sem nenhuma mudança no texto ou na pontuação, do eBible.org (kyzNT). Copyright © 2012 Wycliffe Bible Translators, Inc.', license: 'Creative Commons Atribuição-NãoComercial-SemDerivações 3.0 (CC BY-NC-ND 3.0)', url: 'https://ebible.org/kyzNT/' },
      { name: 'Kaapor: Tupã Je’ẽha', use: 'Novo Testamento embutido no app, sem nenhuma mudança no texto ou na pontuação, do eBible.org (urbNT). Copyright © 2012 Wycliffe Bible Translators, Inc.', license: 'Creative Commons Atribuição-NãoComercial-SemDerivações 3.0 (CC BY-NC-ND 3.0)', url: 'https://ebible.org/urbNT/' },
      { name: 'Mundurukú: Deus ekawẽntup Kawẽn iisuat ekawẽn', use: 'Novo Testamento embutido no app, sem nenhuma mudança no texto ou na pontuação, do eBible.org (myu). Copyright © 2010 Wycliffe Bible Translators, Inc.', license: 'Creative Commons Atribuição-NãoComercial-SemDerivações 3.0 (CC BY-NC-ND 3.0)', url: 'https://ebible.org/myu/' },
      { name: 'Sateré-Mawé: Tupana Ehay Satere Mawe Pusupuo', use: 'Novo Testamento embutido no app, sem nenhuma mudança no texto ou na pontuação, do eBible.org (mavNT). Copyright © 2011 Wycliffe Bible Translators, Inc.', license: 'Creative Commons Atribuição-NãoComercial-SemDerivações 3.0 (CC BY-NC-ND 3.0)', url: 'https://ebible.org/mavNT/' },
      { name: 'Ticuna: Tupanaarü Ore i Tórü Cori ya Ngechuchu ya Cristuchiga', use: 'Novo Testamento embutido no app, sem nenhuma mudança no texto ou na pontuação, do eBible.org (tcaNT). Copyright © 2008 Wycliffe Bible Translators, Inc.', license: 'Creative Commons Atribuição-NãoComercial-SemDerivações 3.0 (CC BY-NC-ND 3.0)', url: 'https://ebible.org/tcaNT/' },
      { name: 'Kaingang: Topẽ vĩ rá', use: 'Novo Testamento embutido no app, sem nenhuma mudança no texto ou na pontuação, do eBible.org (kgpNT). Copyright © 2011 Wycliffe Bible Translators, Inc.', license: 'Creative Commons Atribuição-NãoComercial-SemDerivações 3.0 (CC BY-NC-ND 3.0)', url: 'https://ebible.org/kgpNT/' },
      { name: 'Terêna: Emo’u Itukó’oviti', use: 'Novo Testamento embutido no app, sem nenhuma mudança no texto ou na pontuação, do eBible.org (terNT). Copyright © 2012 Wycliffe Bible Translators, Inc.', license: 'Creative Commons Atribuição-NãoComercial-SemDerivações 3.0 (CC BY-NC-ND 3.0)', url: 'https://ebible.org/terNT/' },
      { name: 'Xavánte: ’Re ĩhâimana u’âsi mono zadawa wasu’u', use: 'Novo Testamento embutido no app, sem nenhuma mudança no texto ou na pontuação, do eBible.org (xavNT). Copyright © 2004 Wycliffe Bible Translators, Inc.', license: 'Creative Commons Atribuição-NãoComercial-SemDerivações 3.0 (CC BY-NC-ND 3.0)', url: 'https://ebible.org/xavNT/' },
      { name: 'eBible.org', use: 'Fonte dos arquivos das versões em português, espanhol e alemão de licença livre e das línguas indígenas do Brasil.', license: 'Serviço gratuito', url: 'https://ebible.org' },
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
      { name: 'Bandeiras dos estados brasileiros', use: 'Bandeira de cada estado, nas páginas e nos mapas da Assembleia de Deus por estado (imagens reduzidas).', license: 'Domínio público (símbolos oficiais; arquivos do Wikimedia Commons marcados como domínio público)', url: 'https://commons.wikimedia.org/wiki/Category:Flags_of_the_states_of_Brazil' },
      { name: 'Cronógrafo de 354: o mês de dezembro', use: 'Ilustração no estudo do Natal e dos calendários.', license: 'Domínio público', url: 'https://commons.wikimedia.org/wiki/File:Chronography_of_354_Mensis_December.png' },
      { name: 'Calendário de Gezer (foto de Ana al’ain)', use: 'Foto no estudo do Natal e dos calendários.', license: 'CC BY-SA 3.0', url: 'https://commons.wikimedia.org/wiki/File:Gezer_tablet_-_original.jpg' },
      { name: 'Fasti Antiates (foto de Juliana Bastos Marques)', use: 'Foto no estudo do Natal e dos calendários.', license: 'CC BY-SA 3.0', url: 'https://commons.wikimedia.org/wiki/File:Fasti_Antiates,_Palazzo_Massimo_alle_Terme,_Rome..jpg' },
      { name: 'Bula Inter gravissimas (1582), primeira página', use: 'Ilustração no estudo do Natal e dos calendários.', license: 'Domínio público', url: 'https://commons.wikimedia.org/wiki/File:Inter-grav.jpg' },
      { name: 'Gunnar Vingren (1908)', use: 'Foto nos estudos da história da Igreja.', license: 'Domínio público (autor desconhecido)', url: 'https://commons.wikimedia.org/wiki/File:Gunnar_Vingren.jpg' },
      { name: 'Paulo Leivas Macalão', use: 'Foto no estudo sobre Madureira.', license: 'Domínio público', url: 'https://commons.wikimedia.org/wiki/File:Paulo_Leivas_Macal%C3%A3o.jpg' },
      { name: 'A Primeira Missa no Brasil, de Victor Meirelles (1860)', use: 'Quadro no estudo A Igreja e o Estado no Brasil. Museu Nacional de Belas Artes.', license: 'Domínio público', url: 'https://commons.wikimedia.org/wiki/File:Meirelles-primeiramissa2.jpg' },
      { name: 'Fundação de São Paulo, de Oscar Pereira da Silva (1909)', use: 'Quadro no estudo A Igreja e o Estado no Brasil. Museu Paulista.', license: 'Domínio público', url: 'https://commons.wikimedia.org/wiki/File:Oscar_Pereira_da_Silva_-_Funda%C3%A7%C3%A3o_de_S%C3%A3o_Paulo,_1909.jpg' },
      { name: 'Construção do Congresso Nacional (1959)', use: 'Foto no estudo A Igreja e o Estado no Brasil. Arquivo Nacional, Fundo Agência Nacional.', license: 'Domínio público', url: 'https://commons.wikimedia.org/wiki/File:Constru%C3%A7%C3%A3o_do_Congresso_Nacional_1959-1.jpg' },
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
