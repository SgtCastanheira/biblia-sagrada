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
  'grudem-ts': { author: 'Wayne Grudem', title: 'Teologia sistemática', publisher: 'Vida Nova', kind: 'referencia' },
  'horton-ts': { author: 'Stanley M. Horton (org.)', title: 'Teologia sistemática: uma perspectiva pentecostal', publisher: 'CPAD', kind: 'referencia' },
  'ddd': { author: 'Karel van der Toorn, Bob Becking e Pieter W. van der Horst (orgs.)', title: 'Dictionary of Deities and Demons in the Bible', publisher: 'Brill e Eerdmans, 2ª ed., 1999', kind: 'referencia' },
  'day-gods': { author: 'John Day', title: 'Yahweh and the Gods and Goddesses of Canaan', publisher: 'Sheffield Academic Press, 2000', kind: 'historia' },
  'sanders-judaism': { author: 'E. P. Sanders', title: 'Judaism: Practice and Belief, 63 BCE–66 CE', publisher: 'SCM Press e Trinity Press International, 1992', kind: 'historia' },
  saldarini: { author: 'Anthony J. Saldarini', title: 'Pharisees, Scribes and Sadducees in Palestinian Society', publisher: 'Michael Glazier, 1988', kind: 'historia' },
  'vanderkam-dss': { author: 'James C. VanderKam', title: 'The Dead Sea Scrolls Today', publisher: 'Eerdmans, 2ª ed., 2010', kind: 'historia' },
  'hengel-zealots': { author: 'Martin Hengel', title: 'The Zealots: Investigations into the Jewish Freedom Movement in the Period from Herod I until 70 A.D.', publisher: 'T&T Clark, 1989 (original alemão de 1961)', kind: 'historia' },
  schurer: { author: 'Emil Schürer (rev. Geza Vermes, Fergus Millar e outros)', title: 'The History of the Jewish People in the Age of Jesus Christ (175 B.C.–A.D. 135)', publisher: 'T&T Clark, 1973–1987', kind: 'historia' },
  grabbe: { author: 'Lester L. Grabbe', title: 'Judaism from Cyrus to Hadrian', publisher: 'Fortress Press, 1992', kind: 'historia' },
  russell: { author: 'D. S. Russell', title: 'Between the Testaments', publisher: 'SCM Press, 1960', kind: 'historia' },
  shaw: { author: 'Ian Shaw (org.)', title: 'The Oxford History of Ancient Egypt', publisher: 'Oxford University Press, 2000', kind: 'historia' },
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
  freston: { author: 'Paul Freston', title: 'Protestantes e política no Brasil: da Constituinte ao impeachment (tese de doutorado)', publisher: 'Unicamp, 1993', kind: 'historia' },
  alencar: { author: 'Gedeon Freire de Alencar', title: 'Matriz pentecostal brasileira: Assembleias de Deus (1911–2011)', publisher: 'Novos Diálogos, 2013', kind: 'historia' },
  'orr-fervent': { author: 'J. Edwin Orr', title: 'The Fervent Prayer: The Worldwide Impact of the Great Awakening of 1858', publisher: 'Moody Press, 1974', kind: 'historia' },
  'long-1857': { author: 'Kathryn Teresa Long', title: 'The Revival of 1857–58: Interpreting an American Religious Awakening', publisher: 'Oxford University Press, 1998', kind: 'historia' },
  'gibson-ulster': { author: 'William Gibson', title: 'The Year of Grace: A History of the Ulster Revival of 1859', publisher: '1860 (domínio público)', kind: 'historia' },
  'murray-revival': { author: 'Iain H. Murray', title: 'Revival and Revivalism: The Making and Marring of American Evangelicalism, 1750–1858', publisher: 'Banner of Truth, 1994', kind: 'historia' },
  'edwards-revival': { author: 'Brian H. Edwards', title: 'Revival: A People Saturated with God', publisher: 'Evangelical Press, 1990', kind: 'historia' },
  'evans-welsh': { author: 'Eifion Evans', title: 'The Welsh Revival of 1904', publisher: 'Evangelical Press of Wales, 1969', kind: 'historia' },
  'lee-korea': { author: 'Young-Hoon Lee', title: 'Korean Pentecost: The Great Revival of 1907', publisher: 'Asian Journal of Pentecostal Studies, v. 4, n. 1, 2001', kind: 'historia' },
  'ward-east-africa': { author: 'Kevin Ward e Emma Wild-Wood (orgs.)', title: 'The East African Revival: History and Legacies', publisher: 'Ashgate, 2012', kind: 'historia' },
  'peckham-lewis': { author: 'Colin e Mary Peckham', title: 'Sounds from Heaven: The Revival on the Isle of Lewis, 1949–1952', publisher: 'Christian Focus, 2004', kind: 'historia' },
  'campbell-lewis': { author: 'Duncan Campbell', title: 'The Lewis Awakening, 1949–1953', publisher: 'The Faith Mission, 1954', kind: 'historia' },
  fausto: { author: 'Boris Fausto', title: 'História do Brasil', publisher: 'EDUSP', kind: 'historia' },
  'schwarcz-starling': { author: 'Lilia M. Schwarcz e Heloisa M. Starling', title: 'Brasil: uma biografia', publisher: 'Companhia das Letras, 2015', kind: 'historia' },
  hobsbawm: { author: 'Eric Hobsbawm', title: 'Era dos Extremos: o breve século XX (1914–1991)', publisher: 'Companhia das Letras', kind: 'historia' },
  'oliveira-2012': { author: 'Sérgio Batista de Oliveira', title: 'O lugar da hermenêutica bíblica na formação teológica da Igreja Evangélica Assembleia de Deus (dissertação)', publisher: 'PUC Goiás, 2012', kind: 'historia' },
  laqueur: { author: 'Thomas W. Laqueur', title: 'Religion and Respectability: Sunday Schools and Working Class Culture, 1780–1850', publisher: 'Yale University Press, 1976', kind: 'historia' },
  'gilberto-ebd': { author: 'Antonio Gilberto', title: 'Manual da Escola Dominical', publisher: 'CPAD', kind: 'historia' },
  'manual-harpa': { author: 'CPAD', title: 'Manual da Harpa Cristã', publisher: 'CPAD, 1999', kind: 'historia' },
  osbeck: { author: 'Kenneth W. Osbeck', title: '101 Hymn Stories', publisher: 'Kregel, 1982', kind: 'historia' },
  julian: { author: 'John Julian', title: 'A Dictionary of Hymnology', publisher: '1892 (domínio público)', kind: 'historia' },
  // Formação, texto e tradução da Bíblia
  beckwith: { author: 'Roger Beckwith', title: 'The Old Testament Canon of the New Testament Church', publisher: 'Eerdmans, 1985', kind: 'biblia' },
  'bruce-canon': { author: 'F. F. Bruce', title: 'O cânon das Escrituras', publisher: 'Hagnos', kind: 'biblia' },
  'bruce-confianca': { author: 'F. F. Bruce', title: 'Merece confiança o Novo Testamento?', publisher: 'Vida Nova', kind: 'biblia' },
  'metzger-canon': { author: 'Bruce M. Metzger', title: 'The Canon of the New Testament', publisher: 'Oxford University Press, 1987', kind: 'biblia' },
  'metzger-ehrman': { author: 'Bruce M. Metzger e Bart D. Ehrman', title: 'The Text of the New Testament', publisher: 'Oxford University Press, 4ª ed., 2005', kind: 'biblia' },
  dines: { author: 'Jennifer M. Dines', title: 'The Septuagint', publisher: 'T&T Clark, 2004', kind: 'biblia' },
  'law-septuagint': { author: 'Timothy Michael Law', title: 'When God Spoke Greek: The Septuagint and the Making of the Christian Bible', publisher: 'Oxford University Press, 2013', kind: 'biblia' },
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
  'os-faraos-da-biblia': {
    ancient: [
      'Estela de Mernepta (c. 1208 a.C.), a menção mais antiga a “Israel” fora da Bíblia',
      'Relevo de Sheshonq I (Sisaque) no templo de Carnaque; cartas de Amarna (séc. XIV a.C.)',
      'Crônica babilônica sobre a batalha de Carquêmis (605 a.C.)',
    ],
    works: ['kitchen', 'shaw', 'walton-at', 'ndb'],
  },
  'biblia-judaica': {
    ancient: [
      'Flávio Josefo, Contra Ápion 1.37–43 (os 22 livros dos judeus)',
      'Talmude Babilônico, Baba Batra 13b–15a (a ordem dos livros)',
      'Grande Rolo de Isaías (1QIsaᵃ), Mar Morto; Códice de Aleppo (c. 930) e Códice de Leningrado (1008)',
    ],
    works: ['beckwith', 'tov', 'dillard-longman', 'bruce-canon'],
  },
  'entre-os-testamentos': {
    ancient: [
      '1 Macabeus 1–4, 8, 9.27 e 13.41, e 2 Macabeus 4–6 e 10 (livros deuterocanônicos, fonte histórica do período)',
      'Flávio Josefo, Antiguidades Judaicas, livros 11–14, e Guerra dos Judeus, livro 1; Contra Ápion 1.37–43',
      'Carta de Aristeias (sobre a origem da Septuaginta)',
      'Salmos de Salomão (séc. I a.C.) e os manuscritos do Mar Morto',
    ],
    works: ['schurer', 'grabbe', 'russell', 'bruce-nt-history', 'ferguson', 'keener-nt'],
  },
  trindade: {
    ancient: [
      'Teófilo de Antioquia, A Autólico 2.15 (a palavra “tríade”, c. 180)',
      'Tertuliano, Contra Práxeas (a palavra “Trindade” e “uma substância, três pessoas”, c. 213)',
      'Credo de Niceia (325) e Credo Niceno-Constantinopolitano (381)',
      'Basílio de Cesareia, Sobre o Espírito Santo (c. 375), e Agostinho, A Trindade (c. 400–420)',
      'Símbolo Quicumque, o chamado Credo Atanasiano (séc. V–VI)',
    ],
    works: ['kelly', 'gonzalez', 'grudem-ts', 'horton-ts', 'synan'],
  },
  'deuses-pagaos': {
    ancient: [
      'Textos de Ugarit (Ras Shamra, Síria, séc. XIV–XIII a.C.): os mitos de Baal',
      'Estela de Mesa, a Pedra Moabita (c. 840 a.C., Museu do Louvre), que cita Quemós',
      'Martinho de Dume, Sobre a correção dos rústicos (c. 572), sobre os nomes dos dias da semana',
    ],
    works: ['ddd', 'day-gods', 'walton-at', 'ndb', 'keener-nt'],
  },
  'grupos-do-tempo-de-jesus': {
    ancient: [
      'Flávio Josefo, Antiguidades Judaicas 13.171–173, 13.288–298, 13.311, 13.399–409, 17.42 e 18.4–25, e Guerra dos Judeus 2.118–166 e 4.160–161',
      '1 Macabeus 2.24–27, 2.42 e 7.12–16, e Eclesiástico 38–39 (livros deuterocanônicos, fontes históricas do período)',
      'Fílon de Alexandria, Todo homem bom é livre 75–91, e Plínio, o Velho, História Natural 5.73 (os essênios)',
      'Manuscritos do Mar Morto: Regra da Comunidade (1QS), Documento de Damasco e Comentário de Habacuque (1QpHab)',
      'Mishná, tratado Avot 1.1 (a corrente da tradição)',
    ],
    works: ['schurer', 'sanders-judaism', 'saldarini', 'vanderkam-dss', 'hengel-zealots', 'jeremias', 'ferguson'],
  },
  'a-familia-de-herodes': { ancient: ['Flávio Josefo, Antiguidades Judaicas, livros 14–20 (em especial 16.290, a carta de Augusto), e Guerra dos Judeus, livros 1–2', 'Tácito, Anais 15.44, e a inscrição de Pilatos, achada em Cesareia'], works: ['richardson', 'bruce-nt-history', 'keener-nt'] },
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
  'assembleia-de-deus-no-brasil': {
    ancientLabel: 'Documentos e estudos consultados',
    ancient: [
      'Marina A. O. S. Correa, “Pastores das Assembleias de Deus: do apoliticismo escatológico ao aparelhamento moralista”, Interações, v. 14, n. 25, 2019',
      'Wikipédia: Assembleias de Deus no Brasil e Convenção Geral das Assembleias de Deus no Brasil (pt.wikipedia.org)',
      'Histórias das Assembleias de Deus no Amazonas, em Pernambuco, no Ceará e na Paraíba, publicadas pelas próprias igrejas',
      'IBAD: histórico institucional (ibad.com.br)',
      'ADEB: “A Assembleia de Deus no Brasil”, lista da chegada a cada estado (adeb.com.br)',
      'Jornal Mensageiro da Paz: “Os primeiros passos da Assembleia de Deus no Brasil” (republicado por Shalom e Congregação Gamaliel)',
      'Assembleia Legislativa do Ceará: projeto de lei sobre Maria de Jesus Nazaré Araújo e o começo da Assembleia de Deus no Ceará',
      'Assembleia Legislativa de Mato Grosso: documentos sobre a Assembleia de Deus em Cuiabá (Eduardo Pablo Joerck)',
      'Folha de Boa Vista: os 100 anos da Assembleia de Deus em Roraima',
      'Histórias das igrejas e convenções estaduais (Amapá, Roraima, Maranhão/CEADEMA, Bahia, Goiás/Jornal Opção, Brasília) e Portal CADB',
      'IBGE: Censos demográficos de 2000 e 2010 (religião)',
    ],
    works: ['conde', 'araujo-dicionario', 'araujo-100', 'vingren-diario', 'berg-enviado', 'freston', 'alencar'],
  },
  'avivamentos-desde-atos': {
    ancient: ['Atos dos Apóstolos 2–4', 'Jonathan Edwards, Narrativa fiel da surpreendente obra de Deus (1737)', 'John Wesley, Diário', 'Charles G. Finney, Palestras sobre avivamentos (1835)'],
    works: ['edwards-revival', 'murray-revival', 'kidd', 'noll', 'orr-fervent', 'synan', 'cairns'],
  },
  'avivamento-de-oracao-1857': {
    ancientLabel: 'Documentos e sites consultados',
    ancient: ['Jornais de Nova York de 1858 (relatos das reuniões diárias)', 'Christian History Institute: “A prayer meeting that went viral”', 'Revival Library: 1857 e o avivamento de Nova York'],
    works: ['long-1857', 'orr-fervent', 'gibson-ulster', 'murray-revival'],
  },
  'avivamento-do-pais-de-gales': {
    ancientLabel: 'Documentos consultados',
    ancient: ['Relatos dos jornais galeses de 1904–1905 (Western Mail)', 'Evan Roberts, cartas e as “quatro condições”'],
    works: ['evans-welsh', 'edwards-revival', 'orr-fervent'],
  },
  'avivamento-da-coreia': {
    ancientLabel: 'Documentos e sites consultados',
    ancient: ['Wikipédia: Pyongyang Revival (en.wikipedia.org)', 'Relatos dos missionários Robert A. Hardie e William Blair', 'The Gospel Coalition: “The North Korean revival of 1907”'],
    works: ['lee-korea', 'orr-fervent', 'noll'],
  },
  'avivamento-da-africa-oriental': {
    ancientLabel: 'Documentos e sites consultados',
    ancient: ['Wikipédia: East African Revival (en.wikipedia.org)', 'Dictionary of African Christian Biography: Joe Church e “Tukutendereza Yesu”', 'Christian History Institute: “New Dawn in East Africa”'],
    works: ['ward-east-africa', 'edwards-revival'],
  },
  'avivamento-das-hebridas': {
    ancientLabel: 'Documentos e sites consultados',
    ancient: ['Revival Library: 1949 Hebrides Islands Revival e “The 1949 Hebrides Intercessors”'],
    works: ['campbell-lewis', 'peckham-lewis', 'edwards-revival'],
  },
  'irmaos-perseguidos': {
    ancientLabel: 'Documentos e sites consultados',
    ancient: [
      'Decreto nº 847, de 11 de outubro de 1890 (Código Penal), arts. 185 a 188: crimes contra o livre exercício dos cultos (Câmara dos Deputados, Legislação Informatizada)',
      'Constituição de 1891, art. 72 (cemitérios laicos e municipais) e Decreto nº 789, de 1890',
      'Sérgio Batista de Oliveira, dissertação (PUC Goiás, 2012), com os relatos de Emílio Conde (2000) e de Daniel Berg (1987 e 1995)',
      'Assembleia de Deus no Estado de Alagoas: “Na centenária Assembleia de Deus, uma parte ainda pouco conhecida da história de Alagoas” (2015)',
      'IADESL, Assembleia de Deus de São Luís: linha do tempo; Assembleia Legislativa de Mato Grosso: moção de aplausos (2019); Assembleia Legislativa do Ceará: projeto de lei 368/2021',
      'Biografias de Otto Nelson: Sistema EBD e blog de história (2019)',
      'Artigo da revista Tint (Mackenzie): migração e missão na Assembleia de Deus',
    ],
    works: ['conde', 'berg-enviado', 'vingren-diario', 'alencar', 'oliveira-2012', 'mariano'],
  },
  'panorama-da-igreja': { works: ['gonzalez', 'cairns', 'noll', 'conde'] },
  'escola-dominical': {
    ancientLabel: 'Documentos e sites consultados',
    ancient: [
      'Dictionary of National Biography: Thomas Stock e Robert Raikes (via victorianweb.org)',
      'Wikipédia: Sunday school (en.wikipedia.org/wiki/Sunday_school) e Sarah Poulton Kalley',
      'Anais da ANPUH (2024): as Lições Bíblicas e os Estudos Dominicais do Boa Semente',
      'Universidade Metodista de São Paulo: Teologia para a vida cotidiana — uma análise das Lições Bíblicas das Assembleias de Deus',
    ],
    works: ['laqueur', 'gilberto-ebd', 'conde', 'araujo-dicionario'],
  },
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
  'cargos-na-assembleia-de-deus': {
    ancientLabel: 'Documentos consultados',
    ancient: [
      'Regimento interno da Assembleia de Deus Filadélfia de Luziânia (GO): requisitos para o pastorado (exemplo de uma igreja local)',
      'Sul21 (2012): a Convenção das Assembleias de Deus do Distrito Federal aprova a consagração de mulheres ao pastorado (2011)',
      'Marina Correa, “Assembleias de Deus, suas convenções e ministérios” (ISER/Nexo, 2024)',
      'Estatuto e regimento de cada convenção estadual e de cada ministério: são eles que valem para a igreja',
    ],
    works: ['araujo-dicionario', 'mariano', 'alencar', 'conde'],
  },
  'madureira-e-a-separacao': {
    ancientLabel: 'Documentos e sites consultados',
    ancient: [
      'Wikipédia: Paulo Leivas Macalão; Convenção Nacional das Assembleias de Deus no Brasil (CONAMAD); Convenção Geral das Assembleias de Deus no Brasil (CGADB); Assembleias de Deus no Brasil',
      'Harpa Cristã (CPAD): história, em harpacrista.com.br',
      'Marina Correa, “Assembleias de Deus, suas convenções e ministérios” (ISER/Nexo, 2024)',
      'Wikipédia: Convenção da Assembleia de Deus no Brasil (CADB) e CONAMAD',
      'Point Rhema e Comunhão (2017): a saída da igreja-mãe de Belém da CGADB e a fundação da CADB',
      'CGADB: lista oficial das convenções (cgadb.org.br)',
    ],
    works: ['araujo-dicionario', 'araujo-100', 'conde', 'mariano', 'alencar'],
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
  septuaginta: {
    ancient: [
      'Carta de Aristeias (séc. II a.C.); Fílon de Alexandria, Vida de Moisés 2.25–44',
      'Prólogo de Eclesiástico (Sirácida), c. 132 a.C.',
      'Papiros Rylands Gr. 458 e Fouad 266 (Deuteronômio); manuscritos do Mar Morto (4QJerᵇ)',
      'Orígenes, Héxapla (séc. III); códices Vaticano, Sinaítico e Alexandrino',
    ],
    works: ['jobes-silva', 'dines', 'law-septuagint', 'tov', 'bruce-canon'],
  },
  'formacao-do-novo-testamento': { ancient: ['Fragmento Muratoriano (séc. II)', 'Atanásio, Carta Festal 39 (367)', 'Eusébio, História Eclesiástica 3.25 (CPAD)'], works: ['metzger-canon', 'bruce-canon', 'carson-moo'] },
  manuscritos: { ancient: ['Manuscritos do Mar Morto, como o Grande Rolo de Isaías (1QIsaᵃ)', 'Papiro P52 (Biblioteca John Rylands), o fragmento mais antigo do Novo Testamento', 'Códices Sinaítico e Vaticano (séc. IV)'], works: ['metzger-ehrman', 'tov', 'bruce-confianca'] },
  apocrifos: { ancient: ['Jerônimo, prefácios da Vulgata (Prologus Galeatus)', 'Concílio de Trento, sessão IV (1546)'], works: ['beckwith', 'bruce-canon', 'geisler-nix'] },
  'vulgata-e-traducoes': { works: ['bruce-canon', 'daniell', 'mcgrath', 'metzger-ehrman'] },
  'biblia-em-portugues': { ancient: ['Novo Testamento de João Ferreira de Almeida (Amsterdã, 1681)'], works: ['giraldi', 'geisler-nix'] },
  'idiomas-da-biblia': { works: ['kelley', 'mounce', 'strong', 'ditat', 'ditnt'] },
  'capitulos-e-versiculos': { ancient: ['Capítulos de Stephen Langton (c. 1227)', 'Novo Testamento grego de Robert Estienne, com versículos (1551)', 'Bíblia de Genebra (1560), a primeira inglesa com versículos em toda a Bíblia'], works: ['metzger-ehrman', 'geisler-nix'] },
};

export type SourceTopic = 'livros' | 'notas' | 'memorial' | 'genealogia' | 'tribos' | 'mapas' | 'profecias' | 'dicionario' | 'curiosidades' | 'ibuc' | 'ebd' | 'harpa' | 'contexto-ad';

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
  'contexto-ad': {
    title: 'O Brasil e o mundo no tempo da igreja',
    note: 'Cada fato é curto e confirmado nas obras de história abaixo e nos documentos citados. As estimativas de mortos e de datas variam entre os historiadores; onde há divergência, o texto diz.',
    ancientLabel: 'Documentos e sites consultados',
    ancient: [
      'Decreto nº 847, de 11 de outubro de 1890 (Código Penal), cap. III: “Dos crimes contra o livre exercício dos cultos” (Câmara dos Deputados, Legislação Informatizada)',
      'Decreto nº 789, de 27 de setembro de 1890, e Constituição de 1891, art. 72 (cemitérios laicos e municipais)',
      'Fiocruz (Invivo): a pandemia de gripe de 1918 no Brasil; O Povo (2018): a gripe espanhola e o Ceará',
      'Portal da Marinha e Revista do Exército: o Brasil na Primeira Guerra Mundial',
      'Câmara Municipal de Sorriso e Diário do Estado de MT: a colonização de Sorriso; Assembleia Legislativa de Mato Grosso: a fundação de Sinop',
    ],
    works: ['fausto', 'schwarcz-starling', 'hobsbawm', 'oliveira-2012'],
  },
  ibuc: { title: 'IBUC', note: 'As aulas não reproduzem as revistas do IBUC: o contexto e as curiosidades vêm da Bíblia e das obras abaixo.', works: ['walton-at', 'keener-nt', 'ndb'] },
};

export const workOf = (id: string): Work => WORKS[id];
