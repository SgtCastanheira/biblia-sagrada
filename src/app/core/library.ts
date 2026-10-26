/** Biblioteca de estudo: artigos (história, estudos) e sermões históricos. Os textos ficam em public/conteudo. */

import { inBibleOrder, positionOfChapter, positionOfRef } from './bible-order';

export type ArticleCollection = 'estudos' | 'contexto' | 'profecias' | 'igreja' | 'biblia';

export interface Article {
  id: string;
  collection: ArticleCollection;
  title: string;
  subtitle: string;
  period: string;
  icon: string;
  minutes: number;
  /** Mapa ligado ao artigo. */
  map?: string;
  /** Capítulos em que o leitor oferece este estudo (ex.: "MRK 5"). */
  passages?: string[];
}

export const COLLECTIONS: Record<ArticleCollection, { name: string; description: string; icon: string }> = {
  estudos: {
    name: 'Estudos bíblicos',
    description: 'Temas da Bíblia estudados a fundo, com mapas e linha do tempo.',
    icon: 'travel_explore',
  },
  contexto: {
    name: 'Contexto histórico e cultural',
    description: 'Aulas que explicam palavras, costumes, a organização militar e a vida da época — o que o texto significava para os primeiros ouvintes.',
    icon: 'school',
  },
  profecias: {
    name: 'Profecias',
    description: 'Como ler as profecias, Daniel e Apocalipse — com o contexto histórico e as principais interpretações cristãs.',
    icon: 'visibility',
  },
  igreja: {
    name: 'História da Igreja',
    description: 'De Pentecostes às reformas e aos avivamentos: como a fé chegou até nós.',
    icon: 'history_edu',
  },
  biblia: {
    name: 'De onde veio a Bíblia',
    description: 'Como os livros foram escritos, reunidos, copiados e traduzidos — até a Almeida.',
    icon: 'auto_stories',
  },
};

export const ARTICLES: Article[] = [
  {
    id: 'ministerios-na-biblia',
    collection: 'estudos',
    passages: ['EPH 4', '1TI 3', 'TIT 1', 'ACT 6', 'ACT 13', 'ACT 14', 'ACT 20', 'ACT 21', '1CO 12', '1CO 14', '2TI 4', 'JAS 5', '1TI 5', '1PE 5'],
    title: 'Os ministérios na Bíblia',
    subtitle: 'Apóstolos, profetas, evangelistas, pastores, mestres, presbíteros e diáconos: o que cada um fazia, as qualificações e como as igrejas se organizam hoje.',
    period: 'Antigo e Novo Testamento',
    icon: 'diversity_3',
    minutes: 12,
  },
  {
    id: 'cativeiros-de-israel',
    collection: 'estudos',
    passages: ['2KI 17', '2KI 24', '2KI 25', 'JER 29', 'PSA 137', 'EZR 1', 'NEH 1', 'DAN 1'],
    title: 'Os cativeiros de Israel',
    subtitle: 'Egito, Assíria, Babilônia e o retorno: para onde o povo foi levado, por quê, e o que Deus fez em cada cativeiro.',
    period: 'c. 1700 a.C. – 445 a.C.',
    icon: 'link_off',
    minutes: 14,
    map: 'cativeiros-de-israel',
  },
  // Contexto histórico e cultural
  {
    id: 'legiao-e-o-exercito-romano',
    collection: 'contexto',
    title: 'Legião: o exército romano no Novo Testamento',
    subtitle: 'O que era uma legião, como o exército se organizava, a comparação com hoje — e o endemoninhado gadareno.',
    period: 'séc. I',
    icon: 'shield',
    minutes: 8,
    passages: ['MRK 5', 'LUK 8', 'MAT 8', 'MAT 26', 'ACT 10', 'ACT 21', 'ACT 23', 'ACT 27', 'MRK 15'],
  },
  {
    id: 'crucificacao-romana',
    collection: 'contexto',
    title: 'A crucificação romana',
    subtitle: 'Como era a execução mais temida do Império, o que diz a arqueologia e por que a cruz era escândalo.',
    period: 'séc. I',
    icon: 'church',
    minutes: 7,
    passages: ['MAT 27', 'MRK 15', 'LUK 23', 'JHN 19', 'GAL 3', '1CO 1'],
  },
  {
    id: 'casamento-judaico',
    collection: 'contexto',
    title: 'O casamento judaico',
    subtitle: 'O desposório de Maria e José, as bodas de Caná, as dez virgens e as bodas do Cordeiro.',
    period: 'séc. I',
    icon: 'favorite',
    minutes: 6,
    passages: ['MAT 1', 'MAT 25', 'JHN 2', 'JHN 3', 'MAT 22', 'REV 19', 'EPH 5'],
  },
  {
    id: 'a-familia-de-herodes',
    collection: 'contexto',
    title: 'Quem eram os Herodes?',
    subtitle: 'Cinco governantes com o mesmo nome: do massacre de Belém ao julgamento de Paulo.',
    period: '37 a.C. – 100 d.C.',
    icon: 'crown',
    minutes: 6,
    passages: ['MAT 2', 'MAT 14', 'MRK 6', 'LUK 3', 'LUK 13', 'LUK 23', 'ACT 12', 'ACT 25', 'ACT 26'],
  },
  {
    id: 'dinheiro-e-salarios',
    collection: 'contexto',
    title: 'Moedas, salários e dívidas',
    subtitle: 'Quanto valiam o denário, o talento e a oferta da viúva — em dias de trabalho.',
    period: 'séc. I',
    icon: 'payments',
    minutes: 6,
    passages: ['MAT 18', 'MAT 20', 'MAT 22', 'MAT 25', 'MRK 12', 'LUK 15', 'LUK 19', 'MAT 17', 'JHN 12'],
  },
  {
    id: 'o-templo-de-herodes',
    collection: 'contexto',
    title: 'O templo que Jesus conheceu',
    subtitle: 'A esplanada, os pátios, a barreira dos gentios e o véu rasgado.',
    period: '20 a.C. – 70 d.C.',
    icon: 'temple_buddhist',
    minutes: 7,
    passages: ['JHN 2', 'MRK 11', 'MRK 13', 'MAT 24', 'LUK 1', 'ACT 3', 'ACT 21', 'MAT 27', 'EPH 2', 'HEB 10'],
  },
  {
    id: 'pastores-e-ovelhas',
    collection: 'contexto',
    title: 'Pastores e ovelhas',
    subtitle: 'O aprisco, a porta, a voz do pastor e o Salmo 23 no dia a dia do Oriente.',
    period: 'Toda a Bíblia',
    icon: 'pets',
    minutes: 6,
    passages: ['JHN 10', 'PSA 23', 'LUK 15', 'LUK 2', 'EZK 34', 'MAT 25', 'JHN 21'],
  },
  {
    id: 'agricultura-no-tempo-de-jesus',
    collection: 'contexto',
    title: 'O campo nas parábolas',
    subtitle: 'O calendário das chuvas e das festas, o semeador, o joio, a vinha e a eira.',
    period: 'Toda a Bíblia',
    icon: 'grass',
    minutes: 7,
    passages: ['MAT 13', 'MRK 4', 'LUK 8', 'JHN 15', 'MRK 12', 'RUT 3', 'MAT 3', 'JAS 5', 'ISA 5'],
  },
  // Profecias
  {
    id: 'como-interpretar-profecias',
    collection: 'profecias',
    title: 'Como interpretar as profecias',
    subtitle: 'Princípios de leitura, tipos de cumprimento, as escolas do Apocalipse e as visões do milênio.',
    period: 'Toda a Bíblia',
    icon: 'explore',
    minutes: 8,
  },
  {
    id: 'profecias-de-daniel',
    collection: 'profecias',
    title: 'As profecias de Daniel',
    subtitle: 'A estátua, os quatro animais, o carneiro e o bode, as setenta semanas e os reis do Norte e do Sul.',
    period: '605–536 a.C.',
    icon: 'visibility',
    minutes: 14,
    passages: ['DAN 2', 'DAN 7', 'DAN 8', 'DAN 9', 'DAN 10', 'DAN 11', 'DAN 12'],
  },
  {
    id: 'apocalipse',
    collection: 'profecias',
    title: 'O Apocalipse de João',
    subtitle: 'Patmos, as sete igrejas, os símbolos, as quatro escolas de interpretação e a vitória do Cordeiro.',
    period: 'c. 95 d.C.',
    icon: 'wb_twilight',
    minutes: 15,
    passages: ['REV 1', 'REV 2', 'REV 3', 'REV 4', 'REV 5', 'REV 6', 'REV 12', 'REV 13', 'REV 17', 'REV 20', 'REV 21'],
  },
  // História da Igreja
  {
    id: 'igreja-primitiva',
    collection: 'igreja',
    title: 'A Igreja nasce',
    subtitle: 'De Pentecostes ao fim do primeiro século: Jerusalém, Antioquia e as viagens de Paulo.',
    period: '30–100 d.C.',
    icon: 'local_fire_department',
    minutes: 5,
  },
  {
    id: 'perseguicoes',
    collection: 'igreja',
    title: 'O sangue dos mártires',
    subtitle: 'De Nero a Diocleciano: como a Igreja cresceu debaixo de perseguição.',
    period: '64–313',
    icon: 'heart_broken',
    minutes: 5,
  },
  {
    id: 'constantino-e-os-concilios',
    collection: 'igreja',
    title: 'Constantino, Niceia e os credos',
    subtitle: 'A liberdade de culto, os grandes concílios e a defesa da divindade de Cristo.',
    period: '313–451',
    icon: 'account_balance',
    minutes: 5,
  },
  {
    id: 'idade-media',
    collection: 'igreja',
    title: 'A Igreja na Idade Média',
    subtitle: 'Mosteiros, papado, o Grande Cisma de 1054 e as Cruzadas.',
    period: '500–1500',
    icon: 'castle',
    minutes: 5,
  },
  {
    id: 'pre-reformadores',
    collection: 'igreja',
    title: 'Antes de Lutero',
    subtitle: 'Valdo, Wycliffe e Hus: as vozes que pediram a Bíblia na língua do povo.',
    period: '1170–1415',
    icon: 'flare',
    minutes: 4,
  },
  {
    id: 'reforma-protestante',
    collection: 'igreja',
    title: 'Lutero e a Reforma Protestante',
    subtitle: 'As 95 teses, a Dieta de Worms e os cinco “solas”.',
    period: '1517–1546',
    icon: 'gavel',
    minutes: 6,
  },
  {
    id: 'reformadores',
    collection: 'igreja',
    title: 'Zuínglio, Calvino e os anabatistas',
    subtitle: 'A Reforma na Suíça, em Genebra e entre os que pediam o batismo de crentes.',
    period: '1519–1564',
    icon: 'diversity_3',
    minutes: 5,
  },
  {
    id: 'reforma-inglesa',
    collection: 'igreja',
    title: 'A Reforma inglesa e os puritanos',
    subtitle: 'Tyndale, a Bíblia King James e os peregrinos do Mayflower.',
    period: '1526–1689',
    icon: 'sailing',
    minutes: 5,
  },
  {
    id: 'contrarreforma',
    collection: 'igreja',
    title: 'A Contrarreforma',
    subtitle: 'A resposta católica: o Concílio de Trento e os jesuítas.',
    period: '1545–1648',
    icon: 'shield',
    minutes: 4,
  },
  {
    id: 'pietismo-e-moravios',
    collection: 'igreja',
    title: 'Pietismo e morávios',
    subtitle: 'Uma fé do coração: Spener, Zinzendorf e a reunião de oração que durou cem anos.',
    period: '1675–1760',
    icon: 'self_improvement',
    minutes: 4,
  },
  {
    id: 'grandes-despertamentos',
    collection: 'igreja',
    title: 'Os Grandes Despertamentos',
    subtitle: 'Wesley, Whitefield, Edwards e Finney: avivamentos que mudaram nações.',
    period: '1730–1850',
    icon: 'campaign',
    minutes: 6,
  },
  {
    id: 'missoes-modernas',
    collection: 'igreja',
    title: 'O século das missões',
    subtitle: 'Carey, Hudson Taylor, Livingstone — e os primeiros missionários protestantes no Brasil.',
    period: '1792–1900',
    icon: 'public',
    minutes: 5,
  },
  {
    id: 'movimento-pentecostal',
    collection: 'igreja',
    title: 'Azusa Street e o movimento pentecostal',
    subtitle: 'Topeka, Los Angeles e o batismo no Espírito Santo que se espalhou pelo mundo.',
    period: '1901–1915',
    icon: 'air',
    minutes: 5,
  },
  {
    id: 'pentecostes-no-brasil',
    collection: 'igreja',
    title: 'O pentecostalismo no Brasil',
    subtitle: 'De Belém do Pará, em 1911, às igrejas de todo o país.',
    period: '1910–hoje',
    icon: 'flag',
    minutes: 5,
  },
  {
    id: 'daniel-berg-e-gunnar-vingren',
    collection: 'igreja',
    title: 'Daniel Berg e Gunnar Vingren',
    subtitle: 'Os dois suecos que chegaram a Belém em 1910 e deram início à Assembleia de Deus no Brasil: a vida, o chamado, o trabalho e o legado.',
    period: '1879–1963',
    icon: 'sailing',
    minutes: 8,
  },
  {
    id: 'harpa-crista',
    collection: 'igreja',
    title: 'A história da Harpa Cristã',
    subtitle: 'Do Cantor Pentecostal de 1921 aos 640 hinos: quem organizou, traduziu e escreveu o hinário das Assembleias de Deus.',
    period: '1921–hoje',
    icon: 'music_note',
    minutes: 5,
  },
  // De onde veio a Bíblia
  {
    id: 'formacao-do-antigo-testamento',
    collection: 'biblia',
    title: 'Como se formou o Antigo Testamento',
    subtitle: 'A Lei, os Profetas e os Escritos: os 39 livros da Bíblia hebraica.',
    period: 'c. 1400–400 a.C.',
    icon: 'history_edu',
    minutes: 5,
  },
  {
    id: 'septuaginta',
    collection: 'biblia',
    title: 'A Septuaginta, a Bíblia grega',
    subtitle: 'A tradução feita em Alexandria que os apóstolos citavam.',
    period: 'séc. III–I a.C.',
    icon: 'translate',
    minutes: 3,
  },
  {
    id: 'formacao-do-novo-testamento',
    collection: 'biblia',
    title: 'Como se formou o Novo Testamento',
    subtitle: 'Das cartas de Paulo à lista de Atanásio, em 367: os 27 livros.',
    period: '50–397 d.C.',
    icon: 'mail',
    minutes: 5,
  },
  {
    id: 'manuscritos',
    collection: 'biblia',
    title: 'Os manuscritos da Bíblia',
    subtitle: 'Dos rolos do Mar Morto ao Códice Sinaítico: como sabemos que o texto foi preservado.',
    period: 'séc. III a.C. – séc. IV d.C.',
    icon: 'description',
    minutes: 5,
  },
  {
    id: 'apocrifos',
    collection: 'biblia',
    title: 'Por que a Bíblia católica tem mais livros?',
    subtitle: 'Os deuterocanônicos (apócrifos), a Septuaginta e o Concílio de Trento.',
    period: 'séc. II a.C. – 1546',
    icon: 'library_books',
    minutes: 4,
  },
  {
    id: 'vulgata-e-traducoes',
    collection: 'biblia',
    title: 'Da Vulgata à King James',
    subtitle: 'Jerônimo, Gutenberg, Lutero e Tyndale: a Bíblia na língua do povo.',
    period: '382–1611',
    icon: 'print',
    minutes: 5,
  },
  {
    id: 'biblia-em-portugues',
    collection: 'biblia',
    title: 'A Bíblia em português',
    subtitle: 'A história de João Ferreira de Almeida e das traduções que vieram depois.',
    period: '1681–hoje',
    icon: 'menu_book',
    minutes: 5,
  },
  {
    id: 'idiomas-da-biblia',
    collection: 'biblia',
    title: 'Hebraico, aramaico e grego',
    subtitle: 'Como ler as palavras originais: alfabetos, raízes, tempos verbais e o que eles acrescentam ao sentido.',
    period: 'Toda a Bíblia',
    icon: 'translate',
    minutes: 8,
  },
  {
    id: 'capitulos-e-versiculos',
    collection: 'biblia',
    title: 'Quem dividiu a Bíblia em capítulos e versículos?',
    subtitle: 'Stephen Langton, Robert Estienne — e por que as divisões não são inspiradas.',
    period: '1227–1560',
    icon: 'format_list_numbered',
    minutes: 3,
  },
];

export const findArticle = (id: string) => ARTICLES.find((a) => a.id === id);
/**
 * Artigos de uma coleção. Aulas de contexto, profecias e estudos bíblicos seguem a ordem da Bíblia
 * (pelo primeiro capítulo); a história segue a ordem cronológica.
 */
export const articlesOf = (collection: ArticleCollection) => {
  const list = ARTICLES.filter((a) => a.collection === collection);
  if (collection === 'igreja' || collection === 'biblia') return list;
  const first = (a: Article) => (a.passages?.length ? Math.min(...a.passages.map(positionOfChapter)) : -1);
  return inBibleOrder(list, first);
};
/** Estudos oferecidos num capítulo do leitor. */
export const articlesFor = (bookId: string, chapter: number) => ARTICLES.filter((a) => a.passages?.includes(`${bookId} ${chapter}`));
/** Estudos ligados a um livro (em algum capítulo). */
export const articlesOfBook = (bookId: string) => ARTICLES.filter((a) => a.passages?.some((c) => c.startsWith(`${bookId} `)));

/** Sermões históricos: como o texto foi preparado para o app. */
export type ClassicKind = 'condensado' | 'sintese' | 'perfil';

export const CLASSIC_KINDS: Record<ClassicKind, { label: string; note: string }> = {
  condensado: {
    label: 'Tradução condensada',
    note: 'Traduzido do original em inglês (domínio público) e condensado para leitura no celular. As frases mais conhecidas foram mantidas.',
  },
  sintese: {
    label: 'Síntese',
    note: 'Síntese da mensagem, com as ideias e palavras-chave do pregador, a partir dos registros da época (domínio público).',
  },
  perfil: {
    label: 'Perfil e mensagem',
    note: 'Os sermões deste pregador são protegidos por direitos autorais. Aqui está um perfil com a mensagem central dele, em palavras nossas.',
  },
};

export interface ClassicSermon {
  id: string;
  title: string;
  originalTitle?: string;
  preacher: string;
  /** Anos de vida do pregador. */
  lived: string;
  year: string;
  place: string;
  /** Texto bíblico do sermão. */
  text: string;
  movement: string;
  kind: ClassicKind;
  /** Quem foi o pregador (curto). */
  bio: string;
  /** Por que este sermão ficou famoso. */
  context: string;
  source?: { label: string; url: string };
}

export const CLASSIC_SERMONS: ClassicSermon[] = [
  {
    id: 'wesley-salvacao-pela-fe',
    title: 'Salvação pela fé',
    originalTitle: 'Salvation by Faith',
    preacher: 'John Wesley',
    lived: '1703–1791',
    year: '1738',
    place: 'Igreja de Santa Maria, Universidade de Oxford (Inglaterra)',
    text: 'Ef 2.8',
    movement: 'Avivamento metodista',
    kind: 'condensado',
    bio: 'Sacerdote anglicano, fundador do movimento metodista. Pregou cerca de 40 mil sermões e percorreu a cavalo cerca de 400 mil quilômetros pela Grã-Bretanha.',
    context: 'Pregado em 18 de junho de 1738, menos de um mês depois da noite em que Wesley sentiu o “coração estranhamente aquecido” numa reunião em Aldersgate, Londres. É o primeiro sermão da coleção que se tornou o padrão de doutrina do metodismo.',
    source: { label: 'Original em inglês (Wikisource)', url: 'https://en.wikisource.org/wiki/Salvation_by_Faith' },
  },
  {
    id: 'edwards-pecadores',
    title: 'Pecadores nas mãos de um Deus irado',
    originalTitle: 'Sinners in the Hands of an Angry God',
    preacher: 'Jonathan Edwards',
    lived: '1703–1758',
    year: '1741',
    place: 'Enfield, Connecticut (Estados Unidos)',
    text: 'Dt 32.35',
    movement: 'Primeiro Grande Despertamento',
    kind: 'condensado',
    bio: 'Pastor congregacional em Northampton e um dos maiores teólogos dos Estados Unidos. Morreu pouco depois de assumir a presidência da faculdade que hoje é a Universidade de Princeton.',
    context: 'Em 8 de julho de 1741, Edwards leu este sermão com voz calma, quase sem gestos. Testemunhas contaram que o povo gemia e clamava “Que farei para ser salvo?”, a ponto de ele precisar parar. É o sermão mais conhecido da história dos Estados Unidos.',
    source: { label: 'Original em inglês (Wikisource)', url: 'https://en.wikisource.org/wiki/Sinners_in_the_Hands_of_an_Angry_God' },
  },
  {
    id: 'whitefield-metodo-da-graca',
    title: 'O método da graça',
    originalTitle: 'The Method of Grace',
    preacher: 'George Whitefield',
    lived: '1714–1770',
    year: 'c. 1741',
    place: 'Escócia, ao ar livre',
    text: 'Jr 6.14',
    movement: 'Primeiro Grande Despertamento',
    kind: 'condensado',
    bio: 'Companheiro de Wesley em Oxford, foi o pregador mais famoso do século XVIII. Pregava ao ar livre para multidões de até 30 mil pessoas, na Inglaterra e nas colônias americanas, que visitou sete vezes.',
    context: 'Whitefield pregou este sermão muitas vezes. Contra uma fé apenas exterior, ele mostra o que Deus precisa fazer no coração antes que alguém possa dizer “tenho paz”.',
    source: { label: 'Versão resumida em inglês (Wikisource)', url: "https://en.wikisource.org/wiki/The_World%27s_Famous_Orations/Volume_3/On_the_Method_of_Grace" },
  },
  {
    id: 'finney-o-que-e-avivamento',
    title: 'O que é um avivamento',
    originalTitle: 'What a Revival of Religion Is',
    preacher: 'Charles G. Finney',
    lived: '1792–1875',
    year: '1835',
    place: 'Nova York (Estados Unidos)',
    text: 'Hc 3.2',
    movement: 'Segundo Grande Despertamento',
    kind: 'sintese',
    bio: 'Advogado convertido em 1821, tornou-se o maior evangelista do Segundo Grande Despertamento. Depois foi professor e reitor do Oberlin College, que aceitava alunos negros e mulheres.',
    context: 'Primeira das “Palestras sobre avivamentos”, pregadas em 1834–1835 e publicadas em 1835. O livro foi lido no mundo inteiro e influenciou gerações de pregadores e de igrejas que oravam por avivamento.',
  },
  {
    id: 'spurgeon-olhai-para-mim',
    title: 'Olhai para mim e sede salvos',
    originalTitle: 'Sovereignty and Salvation',
    preacher: 'Charles H. Spurgeon',
    lived: '1834–1892',
    year: '1856',
    place: 'Capela de New Park Street, Londres (Inglaterra)',
    text: 'Is 45.22',
    movement: 'Avivamento vitoriano',
    kind: 'condensado',
    bio: 'O “príncipe dos pregadores”. Pastor batista em Londres por 38 anos, reunia 6 mil pessoas todo domingo no Tabernáculo Metropolitano. Seus sermões, impressos toda semana, somam 63 volumes.',
    context: 'Pregado em 6 de janeiro de 1856, exatamente seis anos depois da conversão de Spurgeon, aos 15 anos, ao ouvir este mesmo versículo numa capelinha metodista, num domingo de neve.',
    source: { label: 'Original em inglês (The Spurgeon Center)', url: 'https://www.spurgeon.org/resource-library/sermons/sovereignty-and-salvation/' },
  },
  {
    id: 'moody-novo-nascimento',
    title: 'A porta de entrada do Reino',
    originalTitle: 'The Gateway into the Kingdom',
    preacher: 'Dwight L. Moody',
    lived: '1837–1899',
    year: '1884',
    place: 'Estados Unidos e Reino Unido',
    text: 'Jo 3.3',
    movement: 'Evangelismo de massa',
    kind: 'condensado',
    bio: 'Vendedor de sapatos em Chicago, sem estudo formal, tornou-se o maior evangelista do século XIX. Com o cantor Ira Sankey, pregou para milhões nos Estados Unidos e na Grã-Bretanha.',
    context: 'Capítulo do livro “O caminho para Deus” (The Way to God, 1884), que reúne as mensagens que Moody pregava nas suas campanhas. O tema é o novo nascimento, a partir da conversa de Jesus com Nicodemos.',
    source: { label: 'Livro original em inglês (Projeto Gutenberg)', url: 'https://www.gutenberg.org/ebooks/30449' },
  },
  {
    id: 'evan-roberts-quatro-condicoes',
    title: 'As quatro condições do avivamento',
    preacher: 'Evan Roberts',
    lived: '1878–1951',
    year: '1904',
    place: 'Loughor e vales do País de Gales',
    text: 'Sl 85.6',
    movement: 'Avivamento do País de Gales',
    kind: 'sintese',
    bio: 'Mineiro de carvão e ferreiro galês, orava havia anos por um avivamento. Aos 26 anos, tornou-se a figura central do avivamento de 1904–1905, que alcançou cerca de 100 mil conversões em poucos meses.',
    context: 'Em setembro de 1904, numa reunião em Blaenannerch, Roberts orou: “Dobra-me, ó Senhor!”. Voltou à sua cidade e começou a reunir os jovens da igreja com uma mensagem simples, de quatro pontos, repetida em todas as reuniões.',
  },
  {
    id: 'seymour-batismo-no-espirito',
    title: 'O batismo com o Espírito Santo',
    preacher: 'William J. Seymour',
    lived: '1870–1922',
    year: '1906–1908',
    place: 'Missão da Rua Azusa, Los Angeles (Estados Unidos)',
    text: 'At 2.4',
    movement: 'Movimento pentecostal',
    kind: 'sintese',
    bio: 'Filho de ex-escravizados, cego de um olho, pregador do movimento de santidade. Liderou o avivamento da Rua Azusa, de onde o pentecostalismo se espalhou pelo mundo, inclusive para o Brasil.',
    context: 'De 1906 a 1909, a missão da Rua Azusa fez cultos quase sem parar. Brancos, negros, latinos e asiáticos oravam juntos, algo raro na época da segregação racial. O ensino de Seymour saía no jornal da missão, “The Apostolic Faith”, que chegou a ter 50 mil exemplares.',
  },
  {
    id: 'billy-graham',
    title: 'A mensagem de Billy Graham',
    preacher: 'Billy Graham',
    lived: '1918–2018',
    year: '1949–2005',
    place: 'Cruzadas em mais de 180 países',
    text: 'Jo 3.16',
    movement: 'Evangelismo do século XX',
    kind: 'perfil',
    bio: 'Evangelista batista norte-americano. Pregou pessoalmente para cerca de 215 milhões de pessoas em mais de 400 cruzadas, além de milhões pelo rádio e pela TV. Conselheiro de presidentes, nunca deixou de pregar a mesma mensagem simples.',
    context: 'A cruzada de Los Angeles, em 1949, o tornou conhecido no mundo todo. No Brasil, pregou no Congresso da Aliança Batista Mundial, no Rio de Janeiro, em 1960, e em 1974 reuniu uma multidão no Maracanã.',
    source: { label: 'Associação Evangelística Billy Graham', url: 'https://billygraham.org' },
  },
];

export const findClassic = (id: string) => CLASSIC_SERMONS.find((s) => s.id === id);

/**
 * Pregações recomendadas (de pregadores de hoje). Os sermões são protegidos por direitos autorais:
 * o app traz só o pregador, o tema e o texto bíblico, e leva à busca pelo vídeo ou áudio.
 */
export interface RecommendedSermon {
  preacher: string;
  title: string;
  /** Onde o sermão se situa na Bíblia (para ordenar e mostrar), quando se sabe. */
  where?: { label: string; ref: string };
  theme: string;
  note: string;
  /** Termos para a busca no YouTube. */
  search: string;
}

const RECOMMENDED: RecommendedSermon[] = [
  { preacher: 'Nelson Abreu Júnior', title: 'Sermão sobre Jacó', where: { label: 'A história de Jacó (Gênesis 25–35)', ref: 'Gn 25.19' }, theme: 'Sermão temático', note: 'Pastor em Cuiabá. Indicado como um sermão temático marcante.', search: 'Nelson Abreu Júnior sermão Jacó' },
  { preacher: 'Paulo Brasil', title: 'Sermão sobre Ester', where: { label: 'De Juízes a Ester', ref: 'Et 1.1' }, theme: 'Exposição', note: 'Pregado numa conferência: começa no livro de Juízes e faz a ponte até Ester.', search: 'Paulo Brasil sermão Ester' },
  { preacher: 'Caio Fábio', title: 'Sermão sobre Absalão', where: { label: 'Davi e Absalão (2 Samuel 13–18)', ref: '2Sm 13.1' }, theme: 'Paternidade', note: 'Pregado nos anos 1980. Leva a pensar em que tipo de pai você quer ser.', search: 'Caio Fábio sermão Absalão' },
  { preacher: 'Yago Martins', title: 'A fé num caco de telha', where: { label: 'O livro de Jó', ref: 'Jó 2.8' }, theme: 'Fé no sofrimento', note: 'O título lembra Jó, que se raspava com um caco de telha no meio da dor.', search: 'Yago Martins a fé num caco de telha' },
  { preacher: 'Augustus Nicodemus', title: 'Romanos 8', where: { label: 'Romanos 8', ref: 'Rm 8.1' }, theme: 'Exposição', note: 'A vida no Espírito e a segurança de quem está em Cristo.', search: 'Augustus Nicodemus Romanos 8' },
  { preacher: 'Martyn Lloyd-Jones', title: 'Sermões em Romanos', where: { label: 'A carta aos Romanos', ref: 'Rm 1.1' }, theme: 'Exposição', note: 'Série pregada na Westminster Chapel, em Londres, entre 1955 e 1968, e publicada em vários volumes. Qualquer um deles vale a pena.', search: 'Lloyd-Jones Romanos sermão' },
  { preacher: 'Paul Washer', title: 'Pregação chocante (Shocking Youth Message)', theme: 'O verdadeiro evangelho', note: 'Pregada a jovens nos Estados Unidos, em 2002, tornou-se uma das pregações mais vistas na internet. Há versões legendadas em português.', search: 'Paul Washer pregação chocante legendado' },
  { preacher: 'John Piper', title: 'Sermão sobre o sofrimento', theme: 'Sermão temático', note: 'Indicado como “Você vai sofrer”: trata o sofrimento cristão a partir de muitos textos e ângulos.', search: 'John Piper sermão sofrimento legendado' },
  { preacher: 'Emilio Garofalo Neto', title: 'Isto é protetor solar (partes 1 e 2)', theme: 'Vida cristã', note: 'Ministério Fiel. Indicado pela comunicação e pela edificação.', search: 'Emilio Garofalo isto é protetor solar' },
  { preacher: 'Heber Campos', title: 'Os atributos de Deus', theme: 'Quem é Deus', note: 'Ensino sobre os atributos de Deus.', search: 'Heber Campos atributos de Deus' },
  { preacher: 'Jonas Madureira', title: 'Pregações e palestras', theme: 'Fé e pensamento cristão', note: 'Indicado como pregador e professor.', search: 'Jonas Madureira pregação' },
];

/** Na ordem da Bíblia (pelo texto); as temáticas, sem texto principal, no fim. */
export const RECOMMENDED_SERMONS: RecommendedSermon[] = inBibleOrder(RECOMMENDED, (s) => positionOfRef(s.where?.ref));
