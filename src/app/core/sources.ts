/**
 * Fontes das informações de estudo. Os textos do app foram escritos para ele, a partir da Bíblia
 * (citada no próprio texto), de fontes antigas e achados arqueológicos, e de obras de referência —
 * que ficam indicadas para quem quiser conferir e aprofundar.
 */

export type WorkKind = 'referencia' | 'historia' | 'biblia' | 'idiomas';

export interface Work {
  author: string;
  title: string;
  /** Editora (de preferência a edição em português) e ano, quando conhecidos. */
  publisher: string;
  kind: WorkKind;
}

export interface SourceSet {
  /** Fontes antigas, documentos e achados arqueológicos citados. */
  ancient?: string[];
  /** Título desse grupo, quando não são fontes antigas ("Documentos consultados"). */
  ancientLabel?: string;
  /** Obras de referência (ids de WORKS). */
  works: string[];
}

export const WORKS: Record<string, Work> = {
  // Referência geral
  'walton-at': { author: 'John H. Walton, Victor H. Matthews e Mark W. Chavalas', title: 'Comentário histórico-cultural da Bíblia: Antigo Testamento', publisher: 'Vida Nova', kind: 'referencia' },
  'keener-nt': { author: 'Craig S. Keener', title: 'Comentário histórico-cultural da Bíblia: Novo Testamento', publisher: 'Vida Nova', kind: 'referencia' },
  ndb: { author: 'J. D. Douglas (org.)', title: 'O Novo Dicionário da Bíblia', publisher: 'Vida Nova', kind: 'referencia' },
  'dillard-longman': { author: 'Raymond B. Dillard e Tremper Longman III', title: 'Introdução ao Antigo Testamento', publisher: 'Vida Nova', kind: 'referencia' },
  'carson-moo': { author: 'D. A. Carson e Douglas J. Moo', title: 'Introdução ao Novo Testamento', publisher: 'Vida Nova', kind: 'referencia' },
  jeremias: { author: 'Joachim Jeremias', title: 'Jerusalém no tempo de Jesus', publisher: 'Paulus', kind: 'referencia' },
  'bailey': { author: 'Kenneth E. Bailey', title: 'Jesus pelos olhos do Oriente Médio', publisher: 'Vida Nova', kind: 'referencia' },
  ferguson: { author: 'Everett Ferguson', title: 'Backgrounds of Early Christianity', publisher: 'Eerdmans, 3ª ed., 2003', kind: 'referencia' },
  'bruce-nt-history': { author: 'F. F. Bruce', title: 'New Testament History', publisher: 'Doubleday, 1980', kind: 'referencia' },
  kitchen: { author: 'K. A. Kitchen', title: 'On the Reliability of the Old Testament', publisher: 'Eerdmans, 2003', kind: 'referencia' },
  thiele: { author: 'Edwin R. Thiele', title: 'The Mysterious Numbers of the Hebrew Kings', publisher: 'Kregel, 1983', kind: 'referencia' },
  'rainey-notley': { author: 'Anson F. Rainey e R. Steven Notley', title: 'The Sacred Bridge: Carta’s Atlas of the Biblical World', publisher: 'Carta, 2006', kind: 'referencia' },
  aharoni: { author: 'Yohanan Aharoni, Michael Avi-Yonah e outros', title: 'The Carta Bible Atlas', publisher: 'Carta', kind: 'referencia' },
  goldsworthy: { author: 'Adrian Goldsworthy', title: 'The Complete Roman Army', publisher: 'Thames & Hudson, 2003', kind: 'referencia' },
  hengel: { author: 'Martin Hengel', title: 'Crucifixion in the Ancient World and the Folly of the Message of the Cross', publisher: 'Fortress, 1977', kind: 'referencia' },
  hendin: { author: 'David Hendin', title: 'Guide to Biblical Coins', publisher: 'Amphora', kind: 'referencia' },
  ritmeyer: { author: 'Leen Ritmeyer', title: 'The Quest: Revealing the Temple Mount in Jerusalem', publisher: 'Carta, 2006', kind: 'referencia' },
  richardson: { author: 'Peter Richardson', title: 'Herod: King of the Jews and Friend of the Romans', publisher: 'University of South Carolina Press, 1996', kind: 'referencia' },
  borowski: { author: 'Oded Borowski', title: 'Agriculture in Iron Age Israel', publisher: 'Eisenbrauns, 1987', kind: 'referencia' },
  keller: { author: 'W. Phillip Keller', title: 'Nada me faltará: o Salmo 23 à luz das experiências de um pastor de ovelhas', publisher: 'Betânia', kind: 'referencia' },
  // Profecias
  'fee-stuart': { author: 'Gordon D. Fee e Douglas Stuart', title: 'Entendes o que lês?', publisher: 'Vida Nova', kind: 'referencia' },
  clouse: { author: 'Robert G. Clouse (org.)', title: 'Milênio: significado e interpretações', publisher: 'Luz para o Caminho', kind: 'referencia' },
  baldwin: { author: 'Joyce G. Baldwin', title: 'Daniel: introdução e comentário', publisher: 'Vida Nova (Série Cultura Bíblica)', kind: 'referencia' },
  ladd: { author: 'George E. Ladd', title: 'Apocalipse: introdução e comentário', publisher: 'Vida Nova', kind: 'referencia' },
  // História da Igreja
  gonzalez: { author: 'Justo L. González', title: 'Uma história ilustrada do cristianismo', publisher: 'Vida Nova', kind: 'historia' },
  cairns: { author: 'Earle E. Cairns', title: 'O cristianismo através dos séculos', publisher: 'Vida Nova', kind: 'historia' },
  noll: { author: 'Mark A. Noll', title: 'Momentos decisivos na história do cristianismo', publisher: 'Cultura Cristã', kind: 'historia' },
  kelly: { author: 'J. N. D. Kelly', title: 'Patrística: origem e desenvolvimento das doutrinas centrais da fé cristã', publisher: 'Vida Nova', kind: 'historia' },
  bainton: { author: 'Roland H. Bainton', title: 'Cativo à Palavra: a vida de Martinho Lutero', publisher: 'Vida Nova', kind: 'historia' },
  george: { author: 'Timothy George', title: 'Teologia dos reformadores', publisher: 'Vida Nova', kind: 'historia' },
  ryken: { author: 'Leland Ryken', title: 'Santos no mundo: os puritanos como realmente eram', publisher: 'Fiel', kind: 'historia' },
  omalley: { author: 'John W. O’Malley', title: 'Trent: What Happened at the Council', publisher: 'Harvard University Press, 2013', kind: 'historia' },
  hutton: { author: 'J. E. Hutton', title: 'A History of the Moravian Church', publisher: '1909 (domínio público)', kind: 'historia' },
  kidd: { author: 'Thomas S. Kidd', title: 'The Great Awakening: The Roots of Evangelical Christianity in Colonial America', publisher: 'Yale University Press, 2007', kind: 'historia' },
  tucker: { author: 'Ruth A. Tucker', title: '...até aos confins da terra: uma história biográfica das missões cristãs', publisher: 'Vida Nova', kind: 'historia' },
  neill: { author: 'Stephen Neill', title: 'A History of Christian Missions', publisher: 'Penguin', kind: 'historia' },
  robeck: { author: 'Cecil M. Robeck Jr.', title: 'The Azusa Street Mission and Revival', publisher: 'Thomas Nelson, 2006', kind: 'historia' },
  synan: { author: 'Vinson Synan', title: 'The Holiness-Pentecostal Tradition', publisher: 'Eerdmans, 1997', kind: 'historia' },
  conde: { author: 'Emílio Conde', title: 'História das Assembleias de Deus no Brasil', publisher: 'CPAD', kind: 'historia' },
  mariano: { author: 'Ricardo Mariano', title: 'Neopentecostais: sociologia do novo pentecostalismo no Brasil', publisher: 'Loyola, 1999', kind: 'historia' },
  // Igreja e ministérios
  'vingren-diario': { author: 'Ivar Vingren', title: 'O diário do pioneiro Gunnar Vingren', publisher: 'CPAD, 1973', kind: 'historia' },
  'berg-enviado': { author: 'Daniel Berg', title: 'Enviado por Deus: memórias de Daniel Berg', publisher: 'CPAD', kind: 'historia' },
  'declaracao-fe-ad': { author: 'Convenção Geral das Assembleias de Deus no Brasil (CGADB)', title: 'Declaração de Fé das Assembleias de Deus', publisher: 'CPAD, 2017', kind: 'historia' },
  // Hinos e Harpa Cristã
  'araujo-dicionario': { author: 'Isael de Araujo', title: 'Dicionário do Movimento Pentecostal', publisher: 'CPAD, 2007', kind: 'historia' },
  'araujo-100': { author: 'Isael de Araujo', title: '100 acontecimentos que marcaram a história das Assembleias de Deus no Brasil', publisher: 'CPAD, 2011', kind: 'historia' },
  'manual-harpa': { author: 'CPAD', title: 'Manual da Harpa Cristã', publisher: 'CPAD, 1999', kind: 'historia' },
  osbeck: { author: 'Kenneth W. Osbeck', title: '101 Hymn Stories', publisher: 'Kregel, 1982', kind: 'historia' },
  julian: { author: 'John Julian', title: 'A Dictionary of Hymnology', publisher: '1892 (domínio público)', kind: 'historia' },
  // Formação, texto e tradução da Bíblia
  beckwith: { author: 'Roger Beckwith', title: 'The Old Testament Canon of the New Testament Church', publisher: 'Eerdmans, 1985', kind: 'biblia' },
  'bruce-canon': { author: 'F. F. Bruce', title: 'O cânon das Escrituras', publisher: 'Hagnos', kind: 'biblia' },
  'bruce-confianca': { author: 'F. F. Bruce', title: 'Merece confiança o Novo Testamento?', publisher: 'Vida Nova', kind: 'biblia' },
  'metzger-canon': { author: 'Bruce M. Metzger', title: 'The Canon of the New Testament', publisher: 'Oxford University Press, 1987', kind: 'biblia' },
  'metzger-ehrman': { author: 'Bruce M. Metzger e Bart D. Ehrman', title: 'The Text of the New Testament', publisher: 'Oxford University Press, 4ª ed., 2005', kind: 'biblia' },
  tov: { author: 'Emanuel Tov', title: 'Textual Criticism of the Hebrew Bible', publisher: 'Fortress', kind: 'biblia' },
  'jobes-silva': { author: 'Karen H. Jobes e Moisés Silva', title: 'Invitation to the Septuagint', publisher: 'Baker, 2000', kind: 'biblia' },
  'geisler-nix': { author: 'Norman Geisler e William Nix', title: 'Introdução bíblica: como a Bíblia chegou até nós', publisher: 'Vida', kind: 'biblia' },
  daniell: { author: 'David Daniell', title: 'The Bible in English', publisher: 'Yale University Press, 2003', kind: 'biblia' },
  mcgrath: { author: 'Alister McGrath', title: 'In the Beginning: The Story of the King James Bible', publisher: 'Doubleday, 2001', kind: 'biblia' },
  giraldi: { author: 'Luiz Antonio Giraldi', title: 'História da Bíblia no Brasil', publisher: 'Sociedade Bíblica do Brasil, 2008', kind: 'biblia' },
  // Idiomas
  strong: { author: 'James Strong', title: 'Strong’s Exhaustive Concordance of the Bible (números de Strong)', publisher: '1890 (domínio público)', kind: 'idiomas' },
  ditat: { author: 'R. Laird Harris, Gleason L. Archer e Bruce K. Waltke (orgs.)', title: 'Dicionário Internacional de Teologia do Antigo Testamento', publisher: 'Vida Nova', kind: 'idiomas' },
  ditnt: { author: 'Colin Brown e Lothar Coenen (orgs.)', title: 'Dicionário Internacional de Teologia do Novo Testamento', publisher: 'Vida Nova', kind: 'idiomas' },
  kelley: { author: 'Page H. Kelley', title: 'Hebraico bíblico: uma gramática introdutória', publisher: 'Sinodal', kind: 'idiomas' },
  mounce: { author: 'William D. Mounce', title: 'Fundamentos do grego bíblico', publisher: 'Vida', kind: 'idiomas' },
};

export const WORK_KINDS: Record<WorkKind, string> = {
  referencia: 'Contexto histórico, cultural e geográfico',
  historia: 'História da Igreja',
  biblia: 'Formação, texto e tradução da Bíblia',
  idiomas: 'Idiomas originais',
};

/** Fontes de cada estudo (id do artigo em library.ts). */
export const ARTICLE_SOURCES: Record<string, SourceSet> = {
  'cativeiros-de-israel': {
    ancient: [
      'Inscrições de Sargão II (Khorsabad): a deportação de Samaria',
      'Prisma de Senaqueribe: o cerco de Jerusalém no tempo de Ezequias',
      'Crônicas Babilônicas (Museu Britânico): a tomada de Jerusalém em 597 a.C.',
      'Tabuinhas de rações da Babilônia, que citam o rei Joaquim de Judá',
      'Cartas de Laquis (c. 588 a.C.)',
      'Cilindro de Ciro (Museu Britânico): a volta dos povos exilados',
      'Flávio Josefo, Antiguidades Judaicas, livros 9–11',
    ],
    works: ['walton-at', 'kitchen', 'rainey-notley', 'thiele'],
  },
  'legiao-e-o-exercito-romano': { ancient: ['Flávio Josefo, Guerra dos Judeus 3.70–109 (o exército romano em marcha e no acampamento)', 'Tácito, Anais'], works: ['goldsworthy', 'keener-nt', 'ferguson'] },
  'crucificacao-romana': {
    ancient: ['Cícero, Contra Verres 2.5.165 (“o mais cruel e horrendo dos suplícios”)', 'Flávio Josefo, Guerra dos Judeus 5.449–451', 'Calcanhar de Yehohanan, com o cravo, achado em Giv’at ha-Mivtar, Jerusalém (1968)'],
    works: ['hengel', 'keener-nt', 'ferguson'],
  },
  'casamento-judaico': { ancient: ['Mishná, tratado Ketubot (o contrato de casamento)'], works: ['jeremias', 'keener-nt', 'bailey'] },
  'a-familia-de-herodes': { ancient: ['Flávio Josefo, Antiguidades Judaicas, livros 14–20, e Guerra dos Judeus, livros 1–2'], works: ['richardson', 'bruce-nt-history', 'keener-nt'] },
  'dinheiro-e-salarios': { ancient: ['Moedas antigas (denário, siclo de Tiro, leptos) estudadas pela numismática'], works: ['hendin', 'jeremias', 'keener-nt'] },
  'o-templo-de-herodes': {
    ancient: ['Flávio Josefo, Antiguidades Judaicas 15.380–425 e Guerra dos Judeus 5.184–247', 'Mishná, tratado Middot (as medidas do templo)', 'Inscrição de advertência do templo, que proibia a entrada dos gentios (Museu Arqueológico de Istambul)'],
    works: ['ritmeyer', 'jeremias', 'keener-nt'],
  },
  'pastores-e-ovelhas': { works: ['bailey', 'keller', 'walton-at', 'keener-nt'] },
  'agricultura-no-tempo-de-jesus': { ancient: ['Calendário de Gezer (séc. X a.C.): o ano agrícola de Israel'], works: ['borowski', 'bailey', 'keener-nt'] },
  'como-interpretar-profecias': { works: ['fee-stuart', 'clouse', 'ndb'] },
  'profecias-de-daniel': { ancient: ['Flávio Josefo, Antiguidades Judaicas 11.336–337 (Alexandre e o livro de Daniel)'], works: ['baldwin', 'walton-at', 'dillard-longman'] },
  apocalipse: { ancient: ['Irineu, Contra as Heresias 5.30.3 (data no fim do reinado de Domiciano)', 'Eusébio, História Eclesiástica 3.18 (CPAD)'], works: ['ladd', 'fee-stuart', 'carson-moo', 'clouse'] },
  'igreja-primitiva': { ancient: ['Didaquê (séc. I–II)', 'Eusébio, História Eclesiástica (CPAD)'], works: ['ferguson', 'gonzalez', 'cairns'] },
  perseguicoes: { ancient: ['Tácito, Anais 15.44 (Nero e os cristãos)', 'Plínio, o Jovem, Cartas 10.96–97 (a Trajano)', 'Martírio de Policarpo (séc. II)', 'Eusébio, História Eclesiástica (CPAD)'], works: ['gonzalez', 'cairns', 'ferguson'] },
  'constantino-e-os-concilios': { ancient: ['Eusébio, Vida de Constantino', 'O Credo de Niceia (325) e o de Constantinopla (381)'], works: ['kelly', 'gonzalez', 'noll'] },
  'idade-media': { ancient: ['Regra de São Bento (séc. VI)'], works: ['gonzalez', 'cairns', 'noll'] },
  'pre-reformadores': { ancient: ['Jan Hus, Da Igreja (1413)', 'Erasmo de Roterdã, Novum Instrumentum (1516)'], works: ['gonzalez', 'cairns', 'george'] },
  'reforma-protestante': { ancient: ['Martinho Lutero, as 95 Teses (1517)', 'Discurso de Lutero na Dieta de Worms (1521)'], works: ['bainton', 'george', 'gonzalez'] },
  reformadores: { ancient: ['João Calvino, Institutas da Religião Cristã (1536–1559)', 'Confissão de Schleitheim (1527), dos anabatistas'], works: ['george', 'gonzalez', 'cairns'] },
  'reforma-inglesa': { ancient: ['Ato de Supremacia (1534)', 'Confissão de Fé de Westminster (1646)'], works: ['ryken', 'daniell', 'gonzalez'] },
  contrarreforma: { ancient: ['Cânones e decretos do Concílio de Trento (1545–1563)'], works: ['omalley', 'gonzalez', 'noll'] },
  'pietismo-e-moravios': { ancient: ['Philipp Jakob Spener, Pia Desideria (1675)', 'John Wesley, Diário (24 de maio de 1738)'], works: ['hutton', 'gonzalez', 'noll'] },
  'grandes-despertamentos': { ancient: ['Jonathan Edwards, Narrativa fiel da surpreendente obra de Deus (1737)', 'John Wesley, Diário'], works: ['kidd', 'noll', 'cairns'] },
  'missoes-modernas': { ancient: ['William Carey, An Enquiry into the Obligations of Christians (1792)'], works: ['tucker', 'neill', 'noll'] },
  'movimento-pentecostal': { ancient: ['The Apostolic Faith, jornal da missão da Rua Azusa (1906–1908)'], works: ['robeck', 'synan', 'noll'] },
  'pentecostes-no-brasil': { works: ['conde', 'mariano', 'synan'] },
  'daniel-berg-e-gunnar-vingren': {
    ancientLabel: 'Documentos e sites consultados',
    ancient: ['Wikipédia: Gunnar Vingren (pt.wikipedia.org/wiki/Gunnar_Vingren)', 'Wikipédia: Daniel Berg (pt.wikipedia.org/wiki/Daniel_Berg)', 'Svenskt kvinnobiografiskt lexikon: Frida Strandberg (Vingren)'],
    works: ['vingren-diario', 'berg-enviado', 'conde', 'araujo-dicionario', 'araujo-100'],
  },
  'frida-vingren': {
    ancientLabel: 'Documentos e sites consultados',
    ancient: [
      'Svenskt kvinnobiografiskt lexikon: Frida Strandberg, por Jan-Åke Alvarsson (skbl.se)',
      'Wikipédia: Frida Vingren (pt.wikipedia.org/wiki/Frida_Vingren)',
      'Itatiaia, 15/10/2024: sanção da lei do Dia Nacional da Música Gospel (9 de junho)',
      'Kajsa Norell, Halleluja, Brasilien! (Bladh by Bladh, 2011)',
      'Isael de Araujo, Frida Vingren: uma biografia da mulher de Deus, esposa de Gunnar Vingren (CPAD, 2016)',
    ],
    works: ['vingren-diario', 'araujo-dicionario'],
  },
  'madureira-e-a-separacao': {
    ancientLabel: 'Documentos e sites consultados',
    ancient: [
      'Wikipédia: Paulo Leivas Macalão; Convenção Nacional das Assembleias de Deus no Brasil (CONAMAD); Convenção Geral das Assembleias de Deus no Brasil (CGADB); Assembleias de Deus no Brasil',
      'Harpa Cristã (CPAD): história, em harpacrista.com.br',
    ],
    works: ['araujo-dicionario', 'araujo-100', 'conde', 'mariano'],
  },
  'ministerios-na-biblia': {
    ancient: ['Didaquê, capítulos 11–15 (apóstolos, profetas, bispos e diáconos)', 'Clemente de Roma, Carta aos Coríntios 42–44 (c. 96)', 'Inácio de Antioquia, Cartas aos Magnésios 6 e aos Esmirnenses 8 (c. 110)'],
    works: ['ditnt', 'ndb', 'carson-moo', 'keener-nt', 'ferguson', 'kelly', 'declaracao-fe-ad'],
  },
  'harpa-crista': {
    ancientLabel: 'Documentos consultados',
    ancient: ['Site oficial da Harpa Cristã (CPAD): harpacrista.com.br — história, lançamento e edição com música', 'Jornal Boa Semente, dezembro de 1923, p. 4', 'Jornal Mensageiro da Paz, julho de 1939, p. 2', 'Samuel Nyström, Despertamento apostólico no Brasil', 'Hinologia.org: biografia de Adriano Nobre (Jacó Rodrigues Santiago)'],
    works: ['araujo-dicionario', 'araujo-100', 'manual-harpa', 'conde'],
  },
  'formacao-do-antigo-testamento': { ancient: ['Flávio Josefo, Contra Ápion 1.37–43 (os 22 livros dos judeus)', 'Talmude Babilônico, Baba Batra 14b–15a'], works: ['beckwith', 'dillard-longman', 'bruce-canon'] },
  septuaginta: { ancient: ['Carta de Aristeias (séc. II a.C.)'], works: ['jobes-silva', 'tov', 'bruce-canon'] },
  'formacao-do-novo-testamento': { ancient: ['Fragmento Muratoriano (séc. II)', 'Atanásio, Carta Festal 39 (367)', 'Eusébio, História Eclesiástica 3.25 (CPAD)'], works: ['metzger-canon', 'bruce-canon', 'carson-moo'] },
  manuscritos: { ancient: ['Manuscritos do Mar Morto, como o Grande Rolo de Isaías (1QIsaᵃ)', 'Papiro P52 (Biblioteca John Rylands), o fragmento mais antigo do Novo Testamento', 'Códices Sinaítico e Vaticano (séc. IV)'], works: ['metzger-ehrman', 'tov', 'bruce-confianca'] },
  apocrifos: { ancient: ['Jerônimo, prefácios da Vulgata (Prologus Galeatus)', 'Concílio de Trento, sessão IV (1546)'], works: ['beckwith', 'bruce-canon', 'geisler-nix'] },
  'vulgata-e-traducoes': { works: ['bruce-canon', 'daniell', 'mcgrath', 'metzger-ehrman'] },
  'biblia-em-portugues': { ancient: ['Novo Testamento de João Ferreira de Almeida (Amsterdã, 1681)'], works: ['giraldi', 'geisler-nix'] },
  'idiomas-da-biblia': { works: ['kelley', 'mounce', 'strong', 'ditat', 'ditnt'] },
  'capitulos-e-versiculos': { ancient: ['Capítulos de Stephen Langton (c. 1227)', 'Novo Testamento grego de Robert Estienne, com versículos (1551)', 'Bíblia de Genebra (1560), a primeira inglesa com versículos em toda a Bíblia'], works: ['metzger-ehrman', 'geisler-nix'] },
};

export type SourceTopic = 'livros' | 'notas' | 'memorial' | 'genealogia' | 'tribos' | 'mapas' | 'profecias' | 'dicionario' | 'curiosidades' | 'ibuc' | 'ebd' | 'harpa';

/** Fontes de cada parte do app (o que não é um artigo). */
export const TOPIC_SOURCES: Record<SourceTopic, SourceSet & { title: string; note?: string }> = {
  livros: { title: 'Contexto dos livros', note: 'Autor e data seguem a posição tradicional, com as alternativas indicadas quando há debate.', works: ['dillard-longman', 'carson-moo', 'walton-at', 'keener-nt', 'ndb'] },
  notas: { title: 'Notas de estudo nos capítulos', works: ['walton-at', 'keener-nt', 'ndb'] },
  memorial: { title: 'Memorial da Fé', note: 'As datas dos reis seguem a cronologia de Edwin R. Thiele; a avaliação de cada rei é a do próprio texto bíblico.', works: ['thiele', 'ndb', 'kitchen'] },
  genealogia: { title: 'Genealogia de Jesus', works: ['carson-moo', 'keener-nt', 'ndb'] },
  tribos: { title: 'As doze tribos de Israel', note: 'Fronteiras traçadas a partir de Josué 13–19, com o apoio dos atlas bíblicos.', works: ['rainey-notley', 'aharoni', 'walton-at', 'ndb'] },
  mapas: { title: 'Mapas e atlas', note: 'Geografia do Natural Earth (domínio público); fronteiras antigas e lugares a partir dos atlas bíblicos.', works: ['rainey-notley', 'aharoni', 'kitchen'] },
  profecias: { title: 'Promessas e profecias', note: 'As interpretações são apresentadas como as principais tradições cristãs as entendem.', works: ['fee-stuart', 'clouse', 'baldwin', 'ladd'] },
  dicionario: { title: 'Dicionário bíblico', works: ['strong', 'ditat', 'ditnt', 'ndb', 'kelley', 'mounce'] },
  curiosidades: { title: 'Curiosidades', works: ['walton-at', 'keener-nt', 'ndb'] },
  harpa: {
    title: 'Harpa Cristã',
    note: 'Cada hino indica onde se confirmam o número, o título e o autor; a origem dos hinos traduzidos vem das obras de hinologia abaixo e das fontes indicadas em cada hino. As letras não são reproduzidas.',
    ancientLabel: 'Catálogos e sites consultados',
    ancient: ['Hymnary.org: Harpa Cristã, 10ª ed., CPAD, 1999 (hymnary.org/hymnal/HC1999)', 'Hinologia.org: Harpa Cristã', 'Site oficial da Harpa Cristã (CPAD): harpacrista.com.br'],
    works: ['araujo-dicionario', 'manual-harpa', 'osbeck', 'julian'],
  },
  ebd: { title: 'EBD — Apoio ao professor', note: 'A revista é só a inspiração dos temas: o contexto e as curiosidades vêm da Bíblia, de achados arqueológicos (como os papiros de Elefantina) e das obras abaixo.', works: ['walton-at', 'keener-nt', 'ndb', 'dillard-longman', 'carson-moo'] },
  ibuc: { title: 'IBUC', note: 'As aulas não reproduzem as revistas do IBUC: o contexto e as curiosidades vêm da Bíblia e das obras abaixo.', works: ['walton-at', 'keener-nt', 'ndb'] },
};

export const workOf = (id: string): Work => WORKS[id];
