/**
 * Fontes das informações de estudo. Os textos do app foram escritos para ele, a partir da Bíblia
 * (citada no próprio texto), de fontes antigas e achados arqueológicos, e de obras de referência —
 * que ficam indicadas para quem quiser conferir e aprofundar.
 */

import { DRAFT_ARTICLE_SOURCES, DRAFT_WORKS } from './draft-content';
import { PAIXAO_ARTICLE_SOURCES, PAIXAO_WORKS } from './paixao';

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
  ...DRAFT_WORKS,
  ...PAIXAO_WORKS,
  // A Bíblia Conectada (as ligações entre os capítulos)
  'openbible-cross-references': { author: 'OpenBible.info', title: 'Cross References', publisher: 'https://www.openbible.info/labs/cross-references/ (licença Creative Commons Atribuição). Reúne sobretudo o Treasury of Scripture Knowledge, em domínio público, e votos de leitores; consultado em 13 de novembro de 2026', kind: 'referencia' },
  'harrison-romhild': { author: 'Chris Harrison e Christoph Römhild', title: 'Bible Cross-References', publisher: 'https://www.chrisharrison.net/index.php/Visualizations/BibleViz, desde 2007. A ideia de ligar os capítulos da Bíblia por arcos vem desta obra; a imagem tem direitos reservados e não é usada no app, e os dados dela não foram usados', kind: 'referencia' },
  // A Torá e o Talmude
  sefaria: { author: 'Sefaria', title: 'Biblioteca digital de textos judaicos (sefaria.org): índice de parashot e do Talmude, textos da Torá, da Mishná e do Talmude', publisher: 'organização sem fins lucrativos; lida em 17 de novembro de 2026. Os textos em inglês (William Davidson) são CC BY-NC e não são republicados no app, só recontados', kind: 'referencia' },
  'wikipedia-judaismo': { author: 'Wikipédia', title: 'Artigos Torah, Weekly Torah portion, Sefer Torah, Talmud e Mishnah (en.wikipedia.org)', publisher: 'lidos em 17 de novembro de 2026; datas de composição, estrutura, edições impressas, censura e recepção cristã', kind: 'referencia' },
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
  'andrade-diacono': { author: 'Claudionor Corrêa de Andrade', title: 'Manual do Diácono', publisher: 'CPAD, 1999', kind: 'referencia' },
  'manual-pastor-pentecostal': { author: 'Raymond Carlson, Thomas E. Trask e outros', title: 'Manual do Pastor Pentecostal: Teologia e Práticas Pastorais (reedição de O Pastor Pentecostal; original The Pentecostal Pastor, 1997)', publisher: 'CPAD, 1999 (3ª ed., 2005)', kind: 'referencia' },
  'ferreira-manual-igreja': { author: 'Ebenézer Soares Ferreira', title: 'Manual da Igreja e do Obreiro (antes Vade-Mécum do Obreiro e da Igreja)', publisher: 'JUERP, 1993 (7ª ed.)', kind: 'referencia' },
  'miller-historia-igreja': { author: 'Andrew Miller', title: 'A História da Igreja (Church History), tradução em português, volumes 1 e 2', publisher: 'tradução de 2022 sob licença CC BY-NC-SA 4.0, a partir do texto de stempublishing.com', kind: 'historia' },
  'ferguson-historia-igreja': { author: 'Everett Ferguson', title: 'História da Igreja, volume 1: dos dias de Cristo à Pré-Reforma', publisher: 'Central Gospel, 2017', kind: 'historia' },
  'carvalho-tsc': { author: 'César Moisés Carvalho e Céfora Carvalho', title: 'Teologia Sistemático-Carismática (2 volumes)', publisher: 'Thomas Nelson Brasil, 2022', kind: 'referencia' },
  'talley': { author: 'Thomas J. Talley', title: 'The Origins of the Liturgical Year', publisher: 'Liturgical Press, 2ª ed., 1991', kind: 'historia' },
  'bradshaw-johnson': { author: 'Paul F. Bradshaw e Maxwell E. Johnson', title: 'The Origins of Feasts, Fasts and Seasons in Early Christianity', publisher: 'Liturgical Press e SPCK, 2011', kind: 'historia' },
  'richards-calendar': { author: 'E. G. Richards', title: 'Mapping Time: The Calendar and Its History', publisher: 'Oxford University Press, 1998', kind: 'historia' },
  'finegan': { author: 'Jack Finegan', title: 'Handbook of Biblical Chronology', publisher: 'Hendrickson, ed. revista, 1998', kind: 'referencia' },
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
  'williamson-ezra': { author: 'H. G. M. Williamson', title: 'Ezra, Nehemiah (Word Biblical Commentary 16)', publisher: 'Word Books, 1985', kind: 'referencia' },
  'blenkinsopp-ezra': { author: 'Joseph Blenkinsopp', title: 'Ezra–Nehemiah: A Commentary (Old Testament Library)', publisher: 'Westminster Press, 1988', kind: 'referencia' },
  'knoppers-samaritans': { author: 'Gary N. Knoppers', title: 'Jews and Samaritans: The Origins and History of Their Early Relations', publisher: 'Oxford University Press, 2013', kind: 'historia' },
  'pummer-samaritans': { author: 'Reinhard Pummer', title: 'The Samaritans: A Profile', publisher: 'Eerdmans, 2016', kind: 'historia' },
  'brown-birth': { author: 'Raymond E. Brown', title: 'The Birth of the Messiah', publisher: 'Doubleday, ed. atualizada, 1993', kind: 'referencia' },
  'bauckham-jude': { author: 'Richard Bauckham', title: 'Jude and the Relatives of Jesus in the Early Church', publisher: 'T&T Clark, 1990', kind: 'historia' },
  'mason-josephus-nt': { author: 'Steve Mason', title: 'Josephus and the New Testament', publisher: 'Hendrickson, 2ª ed., 2003', kind: 'historia' },
  rajak: { author: 'Tessa Rajak', title: 'Josephus: The Historian and His Society', publisher: 'Duckworth, 1983 (2ª ed., 2002)', kind: 'historia' },
  'goodman-rome': { author: 'Martin Goodman', title: 'Rome and Jerusalem: The Clash of Ancient Civilizations', publisher: 'Allen Lane, 2007', kind: 'historia' },
  'bartlett-maccabees': { author: 'John R. Bartlett', title: 'The First and Second Books of the Maccabees (Cambridge Bible Commentary)', publisher: 'Cambridge University Press, 1973', kind: 'referencia' },
  'goldstein-maccabees': { author: 'Jonathan A. Goldstein', title: 'I Maccabees e II Maccabees (Anchor Bible 41 e 41A)', publisher: 'Doubleday, 1976 e 1983', kind: 'referencia' },
  'schwartz-2mac': { author: 'Daniel R. Schwartz', title: '2 Maccabees (Commentaries on Early Jewish Literature)', publisher: 'De Gruyter, 2008', kind: 'referencia' },
  shaw: { author: 'Ian Shaw (org.)', title: 'The Oxford History of Ancient Egypt', publisher: 'Oxford University Press, 2000', kind: 'historia' },
  richardson: { author: 'Peter Richardson', title: 'Herod: King of the Jews and Friend of the Romans', publisher: 'University of South Carolina Press, 1996', kind: 'referencia' },
  borowski: { author: 'Oded Borowski', title: 'Agriculture in Iron Age Israel', publisher: 'Eisenbrauns, 1987', kind: 'referencia' },
  keller: { author: 'W. Phillip Keller', title: 'Nada me faltará: o Salmo 23 à luz das experiências de um pastor de ovelhas', publisher: 'Betânia', kind: 'referencia' },
  // Profecias
  'collins-daniel': { author: 'John J. Collins', title: 'Daniel: A Commentary on the Book of Daniel (Hermeneia)', publisher: 'Fortress Press, 1993', kind: 'referencia' },
  hoehner: { author: 'Harold W. Hoehner', title: 'Chronological Aspects of the Life of Christ', publisher: 'Zondervan, 1977', kind: 'referencia' },
  'anderson-prince': { author: 'Robert Anderson', title: 'The Coming Prince', publisher: '1894 (domínio público)', kind: 'referencia' },
  'ladd-hope': { author: 'George E. Ladd', title: 'The Blessed Hope', publisher: 'Eerdmans, 1956', kind: 'referencia' },
  'fee-stuart': { author: 'Gordon D. Fee e Douglas Stuart', title: 'Entendes o que lês?', publisher: 'Vida Nova', kind: 'referencia' },
  clouse: { author: 'Robert G. Clouse (org.)', title: 'Milênio: significado e interpretações', publisher: 'Luz para o Caminho', kind: 'referencia' },
  baldwin: { author: 'Joyce G. Baldwin', title: 'Daniel: introdução e comentário', publisher: 'Vida Nova (Série Cultura Bíblica)', kind: 'referencia' },
  ladd: { author: 'George E. Ladd', title: 'Apocalipse: introdução e comentário', publisher: 'Vida Nova', kind: 'referencia' },
  // História da Igreja
  gonzalez: { author: 'Justo L. González', title: 'Uma história ilustrada do cristianismo', publisher: 'Vida Nova', kind: 'historia' },
  cairns: { author: 'Earle E. Cairns', title: 'O cristianismo através dos séculos', publisher: 'Vida Nova', kind: 'historia' },
  noll: { author: 'Mark A. Noll', title: 'Momentos decisivos na história do cristianismo', publisher: 'Cultura Cristã', kind: 'historia' },
  'thomson-letters': { author: 'James Thomson', title: 'Letters on the Moral and Religious State of South America', publisher: 'James Nisbet, Londres, 1827 (domínio público, Projeto Gutenberg)', kind: 'historia' },
  'shaw-villa-miseria': { author: 'Mark Shaw', title: 'God in the villa miseria', publisher: 'Christian History, nº 153, 2024', kind: 'historia' },
  'pew-chile-2006': { author: 'Pew Research Center', title: 'Historical Overview of Pentecostalism in Chile', publisher: 'Pew Forum on Religion & Public Life, 2006', kind: 'historia' },
  'pew-korea-2006': { author: 'Pew Research Center', title: 'Historical Overview of Pentecostalism in South Korea', publisher: 'Pew Forum on Religion & Public Life, 2006', kind: 'historia' },
  'pew-2017': { author: 'Neha Sahgal (Pew Research Center)', title: '500 years after the Reformation, 5 facts about Protestants around the world', publisher: 'Pew Research Center, 2017', kind: 'historia' },
  'hopkins-beard': { author: 'Keith Hopkins e Mary Beard', title: 'The Colosseum', publisher: 'Profile Books e Harvard University Press, 2005', kind: 'historia' },
  futrell: { author: 'Alison Futrell', title: 'The Roman Games: A Sourcebook', publisher: 'Blackwell, 2006', kind: 'historia' },
  snyder: { author: 'Graydon F. Snyder', title: 'Ante Pacem: Archaeological Evidence of Church Life Before Constantine', publisher: 'Mercer University Press, ed. revista, 2003', kind: 'historia' },
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
  roberts: { author: 'J. M. Roberts e Odd Arne Westad', title: 'The Penguin History of the World', publisher: 'Penguin, 6ª ed., 2013', kind: 'historia' },
  'harper-fate': { author: 'Kyle Harper', title: 'The Fate of Rome: Climate, Disease, and the End of an Empire', publisher: 'Princeton University Press, 2017', kind: 'historia' },
  'ward-perkins': { author: 'Bryan Ward-Perkins', title: 'The Fall of Rome and the End of Civilization', publisher: 'Oxford University Press, 2005', kind: 'historia' },
  'kelly-mortality': { author: 'John Kelly', title: 'The Great Mortality: An Intimate History of the Black Death', publisher: 'HarperCollins, 2005', kind: 'historia' },
  'wilson-thirty': { author: 'Peter H. Wilson', title: 'Europe’s Tragedy: A History of the Thirty Years War', publisher: 'Allen Lane, 2009', kind: 'historia' },
  'oliveira-2012': { author: 'Sérgio Batista de Oliveira', title: 'O lugar da hermenêutica bíblica na formação teológica da Igreja Evangélica Assembleia de Deus (dissertação)', publisher: 'PUC Goiás, 2012', kind: 'historia' },
  'marx-nosso-chao': { author: 'Murillo Marx', title: 'Nosso chão: do sagrado ao profano', publisher: 'EDUSP, 1988', kind: 'historia' },
  'marx-cidade': { author: 'Murillo Marx', title: 'Cidade no Brasil: terra de quem?', publisher: 'Nobel/EDUSP, 1991', kind: 'historia' },
  'leite-sj': { author: 'Serafim Leite', title: 'História da Companhia de Jesus no Brasil', publisher: '1938–1950', kind: 'historia' },
  hoornaert: { author: 'Eduardo Hoornaert e outros', title: 'História da Igreja no Brasil (CEHILA)', publisher: 'Vozes', kind: 'historia' },
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
  ...DRAFT_ARTICLE_SOURCES,
  ...PAIXAO_ARTICLE_SOURCES,
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
  tora: {
    ancientLabel: 'Fontes antigas',
    ancient: [
      'Septuaginta: os nomes gregos dos cinco livros (Génesis, Éxodos, Leuitikón, Arithmoí, Deuteronómion)',
      'Talmude Babilônico, Bava Batra 15a: a atribuição dos últimos versículos de Deuteronômio a Josué, como a cita a Wikipédia (Torah)',
    ],
    works: ['sefaria', 'wikipedia-judaismo'],
  },
  talmude: {
    ancientLabel: 'Textos lidos',
    ancient: [
      'Talmude Babilônico, Shabbat 31a, Bava Metzia 59b e Sanhedrin 37a; Mishná, Avot 1:1, 1:2 e 1:14 e Sanhedrin 4:5 (lida também no manuscrito Kaufmann, em domínio público, e na edição de Vilna de 1913)',
    ],
    works: ['sefaria', 'wikipedia-judaismo'],
  },
  'da-volta-do-exilio-a-jesus': {
    ancient: [
      'Esdras e Neemias; Ageu, Zacarias e Malaquias; Cilindro de Ciro (Museu Britânico): a volta dos povos exilados',
      '1 Macabeus 1–4, 7–9, 13–14 e 2 Macabeus 4–6 e 10 (livros deuterocanônicos, fonte histórica do período), e Eclesiástico 38–39',
      'Flávio Josefo, Antiguidades Judaicas 11.321–324, 13.171–173, 13.254–256, 13.288–311, 13.399–409, 17.42, 18.1–25 e 18.116–119, Guerra dos Judeus 1.673 e 2.118–166 e 4.160–161, e Contra Ápion 1.37–43',
      'Eusébio de Cesareia, História Eclesiástica 1.7 (Júlio Africano sobre as duas genealogias de Jesus) e 3.12, 3.19–20 (Hegésipo sobre os descendentes de Davi)',
      'Carta de Aristeias (sobre a origem da Septuaginta), Salmos de Salomão (séc. I a.C.) e os manuscritos do Mar Morto: Regra da Comunidade (1QS), Documento de Damasco e Comentário de Habacuque (1QpHab)',
      'Fílon de Alexandria, Todo homem bom é livre 75–91, e Plínio, o Velho, História Natural 5.73 (os essênios)',
      'Mishná, tratado Avot 1.1 (a corrente da tradição)',
    ],
    works: ['williamson-ezra', 'blenkinsopp-ezra', 'schurer', 'grabbe', 'russell', 'sanders-judaism', 'saldarini', 'vanderkam-dss', 'hengel-zealots', 'knoppers-samaritans', 'pummer-samaritans', 'brown-birth', 'bauckham-jude', 'bruce-nt-history', 'jeremias', 'ferguson', 'keener-nt'],
  },
  'livros-dos-macabeus': {
    ancient: [
      '1 Macabeus e 2 Macabeus (livros deuterocanônicos, em grego; o primeiro foi escrito em hebraico e só chegou em grego)',
      'Flávio Josefo, Antiguidades Judaicas 12.237–13.214 (o mesmo período, contado de outro modo)',
    ],
    works: ['bartlett-maccabees', 'goldstein-maccabees', 'schwartz-2mac', 'schurer', 'grabbe'],
  },
  'flavio-josefo': {
    ancient: [
      'Flávio Josefo: A Vida; Guerra dos Judeus, livros 1–7; Antiguidades Judaicas, livros 1–20; Contra Ápion, livros 1–2',
      'Eusébio de Cesareia, História Eclesiástica 1.11 e 3.9–10 (citações de Josefo e o testemunho sobre Jesus)',
      'Suetônio, Vespasiano 5, e Díon Cássio, História Romana 66.1 (o prisioneiro judeu que anunciou o império a Vespasiano)',
      'Inscrição de Pilatos, achada em Cesareia (1961), e o ossuário de Caifás, achado em Jerusalém (1990)',
    ],
    works: ['mason-josephus-nt', 'rajak', 'goodman-rome', 'schurer', 'bruce-nt-history', 'keener-nt'],
  },
  'teologia-sistematico-carismatica': {
    ancientLabel: 'Documentos consultados',
    ancient: [
      'César Moisés Carvalho e Céfora Carvalho, Teologia Sistemático-Carismática: introdução geral e capítulos 1 e 2, na prévia do Google Livros (Thomas Nelson Brasil, 2022)',
      'Descrição da obra no Google Livros e na página da editora Thomas Nelson Brasil',
    ],
    works: ['carvalho-tsc'],
  },
  'acreditar-e-crer-pentecostal': {
    ancientLabel: 'Documentos consultados',
    ancient: [
      'A Bíblia, na Almeida do app: Gênesis 15 e 21–22; Êxodo 13, 14, 16 e 17; Números 14; Habacuque 2; Mateus 7; Marcos 1, 4, 5 e 9; Lucas 17; João 14 e 16; Romanos 1 e 10; 1 Coríntios 13; Gálatas 5; Efésios 2 e 4; 2 Timóteo 4; Tiago 1 e 2; Hebreus 3, 4 e 11; Apocalipse 2, 6, 13 e 14',
      'Verbetes H539 (ʾāman), H543 (ʾāmēn), H530 (ʾĕmûnāh), G4100 (pisteúō) e G570 (apistía) do Strong’s Exhaustive Concordance, com as definições de Thayer (grego) e de Brown-Driver-Briggs (hebraico) que o site biblehub.com reproduz, consultados em 13 de novembro de 2026: o verbo pisteúō serve à fé que só reconhece (Tiago 2.19) e à que confia, e ʾĕmûnāh é a palavra de Habacuque 2.4',
    ],
    works: ['strong'],
  },
  'acreditar-e-crer-presbiteriano': {
    ancientLabel: 'Documentos consultados',
    ancient: [
      'A Bíblia, na Almeida do app: Gênesis 15, 17 e 22; Êxodo 13, 14, 16 e 17; Números 14; Josué 24; Habacuque 2; Mateus 13 e 17; Marcos 4 e 9; Lucas 8 e 17; João 3, 6, 10 e 15; Atos 7; Romanos 1, 3, 8 e 10; 2 Coríntios 13; Efésios 2 e 4; Filipenses 1 e 2; 1 Tessalonicenses 5; Tiago 1 e 2; Hebreus 3, 4 e 11; 1 Pedro 1; Apocalipse 2, 6, 13 e 14',
      'Catecismo de Heidelberg (1563), pergunta 21 (“O que é a fé verdadeira?”), na tradução inglesa do Christian Classics Ethereal Library (ccel.org), consultada em 13 de novembro de 2026',
      'Confissão de Fé de Westminster (1646), capítulo 14 (“Da fé salvadora”), parágrafos 1 a 3, em inglês, no site A Puritan’s Mind (apuritansmind.com), consultada em 13 de novembro de 2026',
      'A. W. Pink, Studies on Saving Faith, parte 2, capítulo 2, em reformedperspectives.org, consultado em 13 de novembro de 2026: a fé histórica como o crer a respeito de Cristo sem crer nele',
      'Os termos latinos notitia, assensus e fiducia não constam do Catecismo nem da Confissão lidos, e não consegui confirmar em fonte lida a origem exata desse resumo; por isso o texto o apresenta só como o costume da teologia reformada',
      'Verbetes H539 (ʾāman), H543 (ʾāmēn), H530 (ʾĕmûnāh), G4100 (pisteúō) e G570 (apistía) do Strong’s Exhaustive Concordance, com as definições de Thayer (grego) e de Brown-Driver-Briggs (hebraico) que o site biblehub.com reproduz, consultados em 13 de novembro de 2026: o verbo pisteúō serve à fé que só reconhece (Tiago 2.19) e à que confia, e ʾĕmûnāh é a palavra de Habacuque 2.4',
    ],
    works: ['strong'],
  },
  'o-ferro-que-fere': {
    ancientLabel: 'Documentos consultados',
    ancient: [
      'A Bíblia, na Almeida do app: Gênesis 12, 16, 21, 22, 32, 37, 39, 41, 45 e 50; Êxodo 1, 2 e 5; Números 12 e 20; Deuteronômio 8; Juízes 3; 1 Samuel 1, 2, 18, 24, 26 e 31; 2 Samuel 12 e 16; 1 Reis 19; Rute 1 e 4; Jó 1, 2, 5 e 23; Salmos 37, 66, 105, 119 e 139; Provérbios 27 e 31; Isaías 1 e 53; Jeremias 20; Oseias 6; Mateus 5, 10 e 26; João 19; Atos 2, 4, 7 e 25; Romanos 5, 8 e 12; 1 e 2 Coríntios; Gálatas 2; Filipenses 1; 2 Timóteo 4; Hebreus 5 e 12; Tiago 1; 1 Pedro 1, 2 e 5; Apocalipse 2, 12, 20 e 21',
      'Verbetes H1270 (barzel), H2300 (chadad), H6869 (tsarah), H7481 (ra‘am) e H7592 (sha’al), do hebraico, e G2852 (kolaphízō) e G3129 (manthánō), do grego, do Strong’s Exhaustive Concordance, com as definições que o site biblehub.com reproduz, consultados em 13 de novembro de 2026: chadad é “ser agudo”, tsarah vem de tsar (“aperto”) e é a rival, ra‘am é a raiz do trovão e, no sentido figurado, irritar, kolaphízō é bater com o punho',
      'O texto separa o que a Bíblia diz do que se infere dela e do que se aplica: que o Senhor enviou Penina a Ana é inferência (1 Samuel 1.5-6 diz só que ele fechou a madre), e levar Provérbios 27.17, que fala de amigo, ao adversário é aplicação',
    ],
    works: ['strong'],
  },
  'o-ferro-que-levanta': {
    ancientLabel: 'Documentos consultados',
    ancient: [
      'A Bíblia, na Almeida do app: Gênesis 12, 14 e 41; Êxodo 3, 18 e 33; Números 27; Deuteronômio 21 e 34; Juízes 6; Rute 1 a 4; 1 Samuel 2, 3, 8, 16, 18, 19, 23 e 25; 1 Reis 12, 19 e 22; 2 Reis 1, 2, 3, 5 e 13; Ester 2 e 4; Provérbios 13 e 27; Mateus 4, 9, 23 e 25; Marcos 3; Lucas 6, 16, 24; João 1, 14, 15, 16 e 21; Atos 1, 4, 7, 9, 11, 13, 15 e 18; 1 Coríntios 3 e 11; Gálatas 1 e 2; Filipenses 2; 1 e 2 Timóteo; Hebreus 7; Apocalipse 1 e 7',
      'Verbetes H452 (Eliyah) e H477 (Elisha) do Strong’s Exhaustive Concordance, com as definições que o site biblehub.com reproduz, consultados em 13 de novembro de 2026: Elias quer dizer “Yahweh é Deus” e Eliseu, “Deus é salvação”',
      'A Almeida do app não traz, em Lucas 9, o versículo do pedido de despedida (o 61 das Bíblias impressas) e numera a resposta de Jesus sobre o arado como 61; por isso o texto cita a passagem pelo intervalo 57 a 62 e conta o pedido sem aspas',
      'O texto separa o que a Bíblia diz do que se infere dela e do que se aplica ou é tipologia: o que não consta de 1 Reis 19 (o azeite, uma palavra de Elias ao lançar a capa, o tempo que Eliseu serviu) fica dito como silêncio do texto, e ligar a capa de Elias ao Espírito prometido por Jesus é leitura',
    ],
    works: ['strong'],
  },
  'deus-de-perto-deus-de-longe': {
    ancientLabel: 'Documentos consultados',
    ancient: [
      'A Bíblia, na Almeida do app: Gênesis 17, 18, 27, 28 e 32; Êxodo 3 e 33; Números 12; Deuteronômio 4, 29 e 34; Josué 24; 1 Samuel 3, 13, 16 e 17; 2 Samuel 5 e 24; 2 Crônicas 3 e 16; Jó 1, 19, 38 e 42; Salmos 27, 32, 34 e 145; Isaías 6, 29, 53, 55 e 59; Jeremias 23 e 29; Ezequiel 34; Daniel 3; Habacuque 3; Amós 3; Mateus 4, 7, 10, 13, 15, 19, 25 e 26; Marcos 6, 8, 9 e 10; Lucas 4, 9, 10, 11, 14, 15, 16 e 24; João 1, 5, 9, 10, 11, 12, 14, 15, 16, 17, 18, 20 e 21; Atos 1, 4, 5, 7, 8, 9, 11, 12, 17, 19, 20, 21, 22 e 28; Romanos 12; 1 Coríntios 1, 6, 12 e 15; 2 Coríntios 11 e 12; Gálatas 4; Efésios 1 e 2; Filipenses 1, 2 e 3; 1 e 2 Timóteo; Hebreus 2, 10, 11 e 13; Tiago 2 e 4; 1 e 2 Pedro; 1 João 1; Apocalipse 1, 2, 3, 12 e 17',
      'Verbetes G3144 (mártys), G1097 (ginōskō) e H3045 (yāda‘) do Strong’s Exhaustive Concordance, com as definições de Thayer e de Brown-Driver-Briggs que o site biblehub.com reproduz, consultados em 13 de novembro de 2026: mártys é “testemunha” e, por analogia, “mártir” (o verbete lista Atos 1.8 e 22.20 e Apocalipse 2.13 e 17.6); ginōskō é “vir a conhecer, reconhecer, perceber” e o verbete lista João 10.14 e 17.3, Gálatas 4.9 e Mateus 7.23; yāda‘ é o “conhecer” do hebraico, o verbo de Deuteronômio 34.10',
      'Clemente de Roma, Primeira Carta aos Coríntios, capítulo 5 (c. 96), na tradução inglesa de Roberts e Donaldson, no site New Advent (newadvent.org/fathers/1010.htm), consultada em 13 de novembro de 2026: diz que Pedro e Paulo foram perseguidos até a morte e que cada um “sofreu o martírio”; a Bíblia não conta a morte de nenhum dos dois (João 21.18-19 só anuncia a de Pedro), e o texto diz isso',
      'Open Doors, “World Watch List” (opendoors.org/en-US/persecution/countries), consultada em 13 de novembro de 2026: a organização classifica, a cada ano, os 50 países onde os cristãos enfrentam a perseguição mais extrema; o texto cita só essa classificação e nenhum número de vítimas',
      'O texto separa o que a Bíblia diz do que se infere dela e do que se aplica: Jeremias 23.23 é uma pergunta sobre falsos profetas e sobre o olhar de Deus, e não sobre a intimidade do crente (a aplicação é feita à luz de Jó 42.5, Atos 17.27 e Tiago 4.8); “bode” e “ovelha” são a imagem de pregação, e a Almeida traz “cabritos” em Mateus 25.32-33 e “bodes” em Ezequiel 34.17; morrer por uma convicção prova sinceridade e não verdade, e o texto diz isso; e que a intimidade não explica todo milagre, nem todo uso, é dito com Mateus 7.22-23, 1 Coríntios 12.11, João 9.3 e Hebreus 11.35-39',
    ],
    works: ['strong'],
  },
  'miller-estevao-apostolos-e-paulo': {
    ancientLabel: 'Partes lidas',
    ancient: [
      'Andrew Miller, A História da Igreja: capítulos 3 (De Estêvão ao Apostolado de Paulo), 4 (Os Apóstolos e os Pioneiros), 5 (As Duas Primeiras Viagens de Paulo) e 6 (A Terceira Viagem de Paulo), páginas 49 a 162 da tradução de 2022',
      'Everett Ferguson, História da Igreja, volume 1: capítulo 2 (Jesus e os primórdios da Igreja), p. 28–44, para conferir cinco pontos de Miller',
    ],
    works: ['miller-historia-igreja', 'ferguson-historia-igreja'],
  },
  'miller-roma-e-as-perseguicoes': {
    ancientLabel: 'Partes lidas',
    ancient: [
      'Andrew Miller, A História da Igreja: capítulos 7 (Roma e Seus Governantes, 64–177), 8 (A História Interna da Igreja, 107–245) e 9 (De Cômodo à Ascensão de Constantino, 180–313), páginas 163 a 248 da tradução de 2022',
      'Everett Ferguson, História da Igreja, volume 1: capítulos 4 (A Igreja e o Império), 6 (monepiscopado e cânon) e 9 (perseguições do século III), para conferir seis pontos de Miller',
    ],
    works: ['miller-historia-igreja', 'ferguson-historia-igreja'],
  },
  'miller-constantino-e-os-concilios': {
    ancientLabel: 'Partes lidas',
    ancient: [
      'Andrew Miller, A História da Igreja: capítulos 10 (O Período de Pérgamo, 313–606), 11 (Roma e Seus Governantes, 313–397) e 12 (A História Interna da Igreja, 245–451), páginas 249 a 330 da tradução de 2022',
      'Everett Ferguson, História da Igreja, volume 1: capítulos 8 (iniciação cristã), 10 e 11 (Constantino, Niceia, Atanásio, Ambrósio) e 14 (Pelágio), para conferir sete pontos de Miller',
    ],
    works: ['miller-historia-igreja', 'ferguson-historia-igreja'],
  },
  'miller-gregorio-o-islamismo-e-carlos-magno': {
    ancientLabel: 'Partes lidas',
    ancient: [
      'Andrew Miller, A História da Igreja: capítulos 13 (Roma e a Expansão de Sua Influência, 397–590), 14 (Europa, 372–814), 15 (Islamismo e Iconoclastia, 569–741) e 16 (Europa, 653–855), páginas 331 a 422 da tradução de 2022',
      'Everett Ferguson, História da Igreja, volume 1: capítulos 16 a 19 (Gregório, o Grande; igrejas orientais; Ocidente do século VII ao IX; Doação de Constantino), para conferir oito pontos de Miller',
    ],
    works: ['miller-historia-igreja', 'ferguson-historia-igreja'],
  },
  'miller-gregorio-vii-e-as-cruzadas': {
    ancientLabel: 'Partes lidas',
    ancient: [
      'Andrew Miller, A História da Igreja: capítulos 17 (Europa, 814–1000), 18 (Europa, 1000–1110), 19 (O Papa Gregório VII, 1049–1085) e 20 (As Cruzadas, 1093–1213), páginas 423 a 496 da tradução de 2022',
      'Everett Ferguson, História da Igreja, volume 1: capítulos 19 e 20 (declínio e renovação no Ocidente, reforma papal e Primeira Cruzada), para conferir sete pontos de Miller',
    ],
    works: ['miller-historia-igreja', 'ferguson-historia-igreja'],
  },
  'miller-bernardo-becket-e-inocencio-iii': {
    ancientLabel: 'Partes lidas',
    ancient: [
      'Andrew Miller, A História da Igreja: capítulos 21 (Roma, 1106–1190), 22 (Inglaterra, 1162–1174), 23 (A Teologia de Roma) e 24 (O Papa Inocêncio III, 1190–1216), páginas 497 a 586 da tradução de 2022',
      'Everett Ferguson, História da Igreja, volume 1: capítulos 20 a 23 (reforma papal e Concordata de Worms, Escolástica, século XII e Inocêncio III), para conferir dez pontos de Miller',
    ],
    works: ['miller-historia-igreja', 'ferguson-historia-igreja'],
  },
  'miller-albigenses-inquisicao-e-frades': {
    ancientLabel: 'Partes lidas',
    ancient: [
      'Andrew Miller, A História da Igreja: capítulos 25 (França, 814–1229) e 26 (A Ordem Monástica, 480–1275), páginas 587 a 652 da tradução de 2022',
      'Everett Ferguson, História da Igreja, volume 1: capítulos 16, 23 e 24 (Bento de Núrsia, ordens mendicantes, valdenses, cátaros, cruzada albigense e Inquisição), para conferir nove pontos de Miller',
    ],
    works: ['miller-historia-igreja', 'ferguson-historia-igreja'],
  },
  'miller-declinio-do-papado-e-wycliffe': {
    ancientLabel: 'Partes lidas',
    ancient: [
      'Andrew Miller, A História da Igreja: capítulos 27 (O Amanhecer da Reforma, 1155–1386), 28 (O Declínio do Poder Papal, 1216–1314), 29 (Os Precursores da Reforma, 1150–1594) e 30 (O Testemunho e o Triunfo de Wycliffe, 1324–1417), páginas 653 a 723 da tradução de 2022',
      'Everett Ferguson, História da Igreja, volume 1: capítulos 23 e 24 (Frederico II, Luís IX, Carlos de Anjou, Bonifácio VIII, Avignon e escolásticos), para conferir os pontos de Miller que o volume alcança',
    ],
    works: ['miller-historia-igreja', 'ferguson-historia-igreja'],
  },
  'miller-hus-gutenberg-e-os-ultimos-precursores': {
    ancientLabel: 'Partes lidas',
    ancient: [
      'Andrew Miller, A História da Igreja: capítulos 31 (Boêmia, 1409–1471) e 32 (A Palavra de Deus Impressa, 1397–1516), páginas 724 a 783 da tradução de 2022',
      'Everett Ferguson, História da Igreja, volume 1: consultado para esta parte, mas o volume termina no século XIII e início do XIV e não cobre o período',
    ],
    works: ['miller-historia-igreja', 'ferguson-historia-igreja'],
  },
  'historia-da-igreja-everett-ferguson': {
    ancientLabel: 'Partes lidas',
    ancient: [
      'Everett Ferguson, História da Igreja, volume 1 (Central Gospel, 2017): prefácio e capítulos 1 a 3, páginas 21 a 65',
      'Andrew Miller, A História da Igreja: capítulos 1 a 6, para comparar alguns pontos',
    ],
    works: ['miller-historia-igreja', 'ferguson-historia-igreja'],
  },
  'ferguson-perseguicoes-heresias-e-canon': {
    ancientLabel: 'Partes lidas',
    ancient: [
      'Everett Ferguson, História da Igreja, volume 1 (Central Gospel, 2017): capítulos 4 a 6, páginas 66 a 139',
      'Andrew Miller, A História da Igreja: capítulos 7 a 9, para comparar as perseguições',
    ],
    works: ['miller-historia-igreja', 'ferguson-historia-igreja'],
  },
  'ferguson-pais-da-igreja-e-terceiro-seculo': {
    ancientLabel: 'Partes lidas',
    ancient: [
      'Everett Ferguson, História da Igreja, volume 1 (Central Gospel, 2017): capítulos 7 a 9, páginas 140 a 204',
      'Andrew Miller, A História da Igreja: capítulos 9 e 12, para comparar o batismo e as perseguições',
    ],
    works: ['miller-historia-igreja', 'ferguson-historia-igreja'],
  },
  'ferguson-constantino-e-o-quarto-seculo': {
    ancientLabel: 'Partes lidas',
    ancient: [
      'Everett Ferguson, História da Igreja, volume 1 (Central Gospel, 2017): capítulos 10 e 11, páginas 205 a 265',
      'Andrew Miller, A História da Igreja: capítulos 10 a 12, para comparar Constantino e os concílios',
    ],
    works: ['miller-historia-igreja', 'ferguson-historia-igreja'],
  },
  'ferguson-monges-cristologia-e-agostinho': {
    ancientLabel: 'Partes lidas',
    ancient: [
      'Everett Ferguson, História da Igreja, volume 1 (Central Gospel, 2017): capítulos 12 a 14, páginas 266 a 338',
      'Andrew Miller, A História da Igreja: capítulo 12, para comparar monges, Pelágio e Nestório',
    ],
    works: ['miller-historia-igreja', 'ferguson-historia-igreja'],
  },
  'ferguson-migracoes-papado-e-igrejas-orientais': {
    ancientLabel: 'Partes lidas',
    ancient: [
      'Everett Ferguson, História da Igreja, volume 1 (Central Gospel, 2017): capítulos 15 a 17, páginas 339 a 419',
      'Andrew Miller, A História da Igreja: capítulos 13 a 16, para comparar Gregório, os paulicianos e a iconoclastia',
    ],
    works: ['miller-historia-igreja', 'ferguson-historia-igreja'],
  },
  'ferguson-ocidente-medieval-e-cruzadas': {
    ancientLabel: 'Partes lidas',
    ancient: [
      'Everett Ferguson, História da Igreja, volume 1 (Central Gospel, 2017): capítulos 18 a 20, páginas 420 a 509',
      'Andrew Miller, A História da Igreja: capítulos 17 a 20, para comparar Canossa, Urbano II e os Templários',
    ],
    works: ['miller-historia-igreja', 'ferguson-historia-igreja'],
  },
  'ferguson-escolastica-cister-e-seculo-xii': {
    ancientLabel: 'Partes lidas',
    ancient: [
      'Everett Ferguson, História da Igreja, volume 1 (Central Gospel, 2017): capítulos 21 e 22, páginas 510 a 564',
      'Andrew Miller, A História da Igreja: capítulos 21 a 24, para comparar Bernardo, Abelardo, Becket e os sacramentos',
    ],
    works: ['miller-historia-igreja', 'ferguson-historia-igreja'],
  },
  'ferguson-inocencio-iii-frades-e-aquino': {
    ancientLabel: 'Partes lidas',
    ancient: [
      'Everett Ferguson, História da Igreja, volume 1 (Central Gospel, 2017): capítulo 23, páginas 565 a 602',
      'Andrew Miller, A História da Igreja: capítulos 25 e 26, para comparar Domingos, Francisco e a Inquisição',
    ],
    works: ['miller-historia-igreja', 'ferguson-historia-igreja'],
  },
  'ferguson-presagios-de-declinio-e-fim-da-idade-media': {
    ancientLabel: 'Partes lidas',
    ancient: [
      'Everett Ferguson, História da Igreja, volume 1 (Central Gospel, 2017): capítulo 24, páginas 603 a 632',
      'Andrew Miller, A História da Igreja: capítulos 27 a 30, para comparar Celestino V, Bonifácio VIII e Avinhão',
    ],
    works: ['miller-historia-igreja', 'ferguson-historia-igreja'],
  },
  'historia-da-igreja-andrew-miller': {
    ancientLabel: 'Partes lidas',
    ancient: [
      'Andrew Miller, A História da Igreja: prefácio, introdução e capítulos 1 (Verdades Fundamentais) e 2 (De Pentecostes ao Martírio de Estêvão), páginas 3 a 48 da tradução de 2022. Os capítulos 3 a 32 só foram vistos pelo sumário',
      'Everett Ferguson, História da Igreja, volume 1: o uso do título “papa” e a ascensão do bispo de Roma (p. 357–358), só para conferir as notas de Miller',
    ],
    works: ['miller-historia-igreja', 'ferguson-historia-igreja'],
  },
  'manual-do-diacono': {
    ancientLabel: 'Partes lidas',
    ancient: [
      'Claudionor Corrêa de Andrade, Manual do Diácono (CPAD, 1999): introdução e capítulos 1 (natureza do diaconato), 2 (qualificações, só o começo), 3 (provação), 4 (deveres eclesiásticos), 9 (ordenação) e o começo do 11 (ética). Os capítulos 5 a 8, 10 e 12 só foram vistos pelo sumário',
    ],
    works: ['andrade-diacono'],
  },
  'manual-do-pastor-pentecostal': {
    ancientLabel: 'Partes lidas',
    ancient: [
      'Manual do Pastor Pentecostal (CPAD, 3ª ed., 2005): prefácio, sumário e os capítulos “Treinando e Comissionando Presbíteros e Diáconos”, “Trabalhando com Corpos Ministeriais” e “Prestação de Contas Bíblica na Igreja”. O restante do livro não foi lido',
    ],
    works: ['manual-pastor-pentecostal'],
  },
  'manual-da-igreja-e-do-obreiro': {
    ancientLabel: 'Partes lidas',
    ancient: [
      'Ebenézer Soares Ferreira, Manual da Igreja e do Obreiro (JUERP, 1993, 7ª ed.): prefácio, sumário e os capítulos sobre o pastor (6) e os diáconos (7). O restante só foi visto pelo sumário',
    ],
    works: ['ferreira-manual-igreja'],
  },
  'diacono-presbitero-e-pastor-nos-manuais': {
    ancientLabel: 'Documentos consultados',
    ancient: [
      'Os três manuais comparados, nas partes lidas descritas em cada estudo',
      'Estatuto e regimento de cada convenção e de cada ministério: não foram encontrados publicamente e são eles que valem para a igreja',
    ],
    works: ['andrade-diacono', 'manual-pastor-pentecostal', 'ferreira-manual-igreja'],
  },
  'natal-e-os-calendarios': {
    ancient: [
      'Clemente de Alexandria, Stromata 1.21 (as datas propostas para o nascimento, c. 200)',
      'Cronógrafo de 354, ou Calendário Filocaliano (o Natal em 25 de dezembro numa lista de 336, e a festa do “Invicto”)',
      'João Crisóstomo, Sermão no dia do Natal (Antioquia, 386); Agostinho, A Trindade 4.5; o tratado Sobre os solstícios e os equinócios (séc. IV)',
      'Macróbio, Saturnais 1.14, e Censorino, Sobre o dia do nascimento 20 (a reforma de Júlio César)',
      'Gregório XIII, bula Inter gravissimas (24 de fevereiro de 1582)',
      'Calendário de Gezer (séc. X a.C., Museu Arqueológico de Istambul) e Fasti Antiates (88–55 a.C., Museu Nacional Romano)',
    ],
    works: ['talley', 'bradshaw-johnson', 'finegan', 'richards-calendar'],
  },
  trindade: {
    ancient: [
      'Teófilo de Antioquia, A Autólico 2.15 (a palavra “tríade”, c. 180)',
      'Tertuliano, Contra Práxeas (a palavra “Trindade” e “uma substância, três pessoas”, c. 213)',
      'Credo de Niceia (325) e Credo Niceno-Constantinopolitano (381)',
      'Basílio de Cesareia, Sobre o Espírito Santo (c. 375), e Agostinho, A Trindade (c. 400–420)',
      'Símbolo Quicumque, o chamado Credo Atanasiano (séc. V–VI)',
      'CGADB: Manifesto contra o Unicismo, aprovado na 46ª AGO (2023), cgadb.org.br/manifesto-contra-o-unicismo',
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
  'setenta-semanas': {
    ancient: ['Júlio Africano, Cronografia, citada por Eusébio, Demonstração Evangélica 8.2 (a conta a partir de Artaxerxes)', 'Jerônimo, Comentário a Daniel, cap. 9 (as interpretações dos antigos)', 'Ireneu, Contra as Heresias 5.25, e Hipólito, Comentário a Daniel (a última semana e o Anticristo)'],
    works: ['baldwin', 'collins-daniel', 'hoehner', 'anderson-prince', 'walton-at'],
  },
  arrebatamento: {
    ancient: ['Credo Niceno-Constantinopolitano (381): “há de vir para julgar os vivos e os mortos”', 'Vulgata, 1 Tessalonicenses 4.17 (*rapiemur*)'],
    works: ['ladd-hope', 'clouse', 'carson-moo', 'fee-stuart'],
  },
  'trindade-satanica': { ancient: ['Irineu, Contra as Heresias 5.25–30 (o anticristo e o número da besta)'], works: ['ladd', 'fee-stuart', 'carson-moo', 'clouse'] },
  'juizo-final': { ancient: ['Credo Apostólico e Credo Niceno-Constantinopolitano: “há de vir para julgar os vivos e os mortos”', 'Agostinho, A Cidade de Deus, livro 20 (o juízo final)'], works: ['grudem-ts', 'horton-ts', 'clouse', 'ladd'] },
  'nova-jerusalem': { ancient: ['Agostinho, A Cidade de Deus, livros 19–22 (a cidade de Deus e o fim da história)'], works: ['ladd', 'fee-stuart', 'clouse', 'carson-moo'] },
  'selos-trombetas-e-tacas': { ancient: ['Vitorino de Pettau, Comentário ao Apocalipse (c. 300): a leitura em ciclos mais antiga que se conservou'], works: ['ladd', 'fee-stuart', 'carson-moo', 'clouse'] },
  'a-mulher-o-dragao-e-miguel': {
    ancientLabel: 'Documentos consultados',
    ancient: [
      'A Bíblia, na Almeida do app: Gênesis 3, 37; Êxodo 19; Jó 1; Salmos 2; Isaías 14 e 66; Daniel 7, 10 e 12; Miqueias 5; Zacarias 3; Mateus 2; Lucas 10; João 12; Romanos 16; 2 Coríntios 11; Gálatas 4; Colossenses 2; 1 Tessalonicenses 4; 2 Pedro 2; Judas 9; Apocalipse 1, 2, 5, 12, 13, 17, 19, 20, 21 e 22',
      'Verbetes H4317 (Mikha’el), H2332 (Chavvah), G726 (harpázō), G743 (archángelos) e G1404 (drákōn) do Strong’s Exhaustive Concordance, com as definições de Thayer (grego) e de Brown-Driver-Briggs (hebraico) que o site biblehub.com reproduz, consultados em 17 de novembro de 2026: Miguel é “Quem é como Deus?”; Eva é “vida” e “a que dá vida”, e Gênesis 3.20 a liga a “mãe de todos os viventes”; harpázō, em Apocalipse 12.5 e em 1 Tessalonicenses 4.17, é tomar de repente, com força; “arcanjo” aparece duas vezes no Novo Testamento (1 Tessalonicenses 4.16 e Judas 9); Thayer diz que a descrição do diabo como dragão em Apocalipse 12.3-17 vem da serpente de Gênesis 3.1 em diante',
      'Vatican News, “Word of the day”, 15 de agosto de 2024 (vaticannews.va), consultado em 17 de novembro de 2026: a primeira leitura da missa do dia da Assunção de Maria é Apocalipse 11.19a; 12.1-6a, 10ab; o texto diz só isso da leitura mariana, e não afirma o que a tradição católica pensa de cada versículo',
      'O texto separa o que o capítulo diz do que se lê nele: a ordem dos fatos (a criança arrebatada, a mulher no deserto, só então a guerra no céu) é a do capítulo, e a cena em que o dragão sobe atrás do filho é a maneira de contar, não está no texto; o nome “Quem é como Deus?” respondendo ao “sereis como Deus” de Gênesis 3.5 é leitura de pregadores, e o texto o diz; as estrelas como anjos, a mulher como o povo de Deus ou como Maria, o dragão como Roma e o momento da queda são leituras, apresentadas como tais. Roma não é nomeada no Apocalipse da Almeida do app (conferido no texto); o livro diz Babilônia',
    ],
    works: ['strong'],
  },
  apocalipse: { ancient: ['Irineu, Contra as Heresias 5.30.3 (data no fim do reinado de Domiciano)', 'Eusébio, História Eclesiástica 3.18 (CPAD)'], works: ['ladd', 'fee-stuart', 'carson-moo', 'clouse'] },
  'igreja-primitiva': { ancient: ['Didaquê (séc. I–II)', 'Eusébio, História Eclesiástica (CPAD)'], works: ['ferguson', 'gonzalez', 'cairns'] },
  perseguicoes: { ancient: ['Tácito, Anais 15.44 (Nero e os cristãos)', 'Plínio, o Jovem, Cartas 10.96–97 (a Trajano)', 'Martírio de Policarpo (séc. II)', 'Eusébio, História Eclesiástica (CPAD)'], works: ['gonzalez', 'cairns', 'ferguson'] },
  'coliseu-de-roma': {
    ancientLabel: 'Fontes antigas e sites consultados',
    ancient: [
      'Marcial, Livro dos Espetáculos (os jogos de inauguração do Coliseu)',
      'Dião Cássio, História Romana 66.25, e Suetônio, Vida de Tito (a inauguração, no ano 80)',
      'Flávio Josefo, A Guerra dos Judeus 7.5 (o triunfo de Vespasiano e Tito, com os despojos do Templo)',
      'Inscrição reconstituída do Coliseu: o anfiteatro erguido com a parte do butim que cabia ao general',
      'Tácito, Anais 15.44 (os cristãos e o incêndio de Roma, em 64)',
      'Eusébio, História Eclesiástica 3.36 (a viagem de Inácio a Roma) e 5.1 (os mártires de Lião e Viena, em 177)',
      'Tertuliano, Dos Espetáculos; Agostinho, Confissões 6.8 (Alípio no anfiteatro); Teodoreto, História Eclesiástica 5.26 (Telêmaco)',
      'Wikipédia (en): Colosseum, Gladiator e Inaugural games of the Colosseum',
    ],
    works: ['hopkins-beard', 'futrell', 'keener-nt'],
  },
  'catacumbas-de-roma': {
    ancientLabel: 'Fontes antigas e sites consultados',
    ancient: [
      'Tertuliano, Apologético 39 (as ofertas da igreja, para sustentar e sepultar os pobres)',
      'Hipólito, Refutação de Todas as Heresias, livro 9 (Calisto posto à frente do cemitério da igreja)',
      'Eusébio, História Eclesiástica 7.11 (o édito de Valeriano e os cemitérios, em 257)',
      'Cipriano, Carta 80 (a morte de Sisto II, em 258)',
      'Giovanni Battista de Rossi, Roma Sotterranea Cristiana (1864–1877), e Joseph Wilpert, Die Malereien der Katakomben Roms (1903)',
      'Antonio Bosio, Roma Sotterranea (1632)',
      'Enciclopédia Católica, v. 3 (1908): Roman Catacombs (newadvent.org/cathen/03417b.htm)',
      'Wikipédia (en): Catacombs of Rome, Catacomb of Callixtus, Catacomb of Domitilla, Catacomb of Priscilla e Antonio Bosio',
    ],
    works: ['snyder', 'ferguson', 'gonzalez'],
  },
  'constantino-e-os-concilios': { ancient: ['Eusébio, Vida de Constantino', 'O Credo de Niceia (325) e o de Constantinopla (381)'], works: ['kelly', 'gonzalez', 'noll'] },
  'idade-media': { ancient: ['Regra de São Bento (séc. VI)'], works: ['gonzalez', 'cairns', 'noll'] },
  'pre-reformadores': { ancient: ['Jan Hus, Da Igreja (1413)', 'Erasmo de Roterdã, Novum Instrumentum (1516)'], works: ['gonzalez', 'cairns', 'george'] },
  'reforma-protestante': { ancient: ['Martinho Lutero, as 95 Teses (1517)', 'Discurso de Lutero na Dieta de Worms (1521)', 'Christian History Institute (“1521: The Diet of Worms”): a resposta de Lutero em 18 de abril de 1521; as fontes divergem sobre o dia da primeira audiência (17 ou 16 a 18)', 'Encyclopaedia Britannica: Martin Luther, a viagem a Eisleben e a morte em 18 de fevereiro de 1546'], works: ['bainton', 'george', 'gonzalez'] },
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
      '“O campo religioso em Belém do Pará: reflexões sobre o evento fundador da Igreja Assembleia de Deus no Brasil”, Revista Mneme (UFRN)',
      '“O campo religioso brasileiro, o Estado republicano e a implantação da Assembleia de Deus em 1911”, Revista Religare (UFPB)',
      '“Eurico Alfredo Nelson (1862–1939) e a inserção dos batistas em Belém do Pará” (Universidade Metodista de São Paulo)',
      'Eric Alfred Nelson: the first Baptist missionary on the Amazon, 1891–1939 (Texas Christian University)',
      'Wikipédia: Brazilian Baptist Convention (a origem e a Convenção de 1907)',
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
    ancient: [
      'Wikipédia: Pyongyang Revival (en.wikipedia.org)',
      'Relatos dos missionários Robert A. Hardie e William Blair',
      'The Gospel Coalition: “The North Korean revival of 1907”',
      'Pew Research Center (2006): Historical Overview of Pentecostalism in South Korea',
      'Wikipédia (en): Christianity in Korea; Yoido Full Gospel Church; Youngnak Presbyterian Church; May 16 coup; 1979 South Korean coup d’état; Gwangju Uprising; Minjung theology; National Council of Churches in Korea; June Democratic Struggle; 2024 South Korean martial law crisis; Chu Ki-chol; Kosin Presbyterian Church in Korea; State Shinto',
      'Timothy S. Lee, Born Again: Evangelicalism in Korea (University of Hawai‘i Press, 2010), p. 58: o culto sob o xintoísmo e o fim das igrejas livres em 1945, pelo trecho citado no blog Far Outliers; o livro não foi lido',
      'Encyclopaedia Britannica: Chu Ki-chol (morte em 21 de abril de 1944)',
      'Wikipédia (en), sobre a Coreia do Norte: Religion in North Korea; Freedom of religion in North Korea; Persecution of Christians in North Korea; Bongsu Church; Chilgol Church; Changchung Cathedral; Korean Christian Federation; Juche; Kim Il Sung; Kim Jong Il; Kim Jong Un; Jang Song-thaek; Kim Jong-nam; August faction incident',
      'Billy Graham Library e Wikipédia (en), lista das cruzadas de Billy Graham: Seul, 1973; Christianity Today (1973): relatos da cruzada de Seul e do Explo ’74',
      'Adrian Jonas Gasser Monterrubio, “May God protect Korea from the deluge”: análise do apoio protestante a Yoon Suk Yeol (Graduate Institute, Genebra, 2025); só o resumo foi lido',
      'AFP, via Arab News (19/02/2026): condenação de Yoon Suk Yeol; Don Baker, “Why were they arrested? Religious leaders and the Gwangju democratization movement” (Royal Asiatic Society Korea Branch, 2023)',
      'Korea Times (2026) e USC Center for Religion and Civic Culture: a fundação da Igreja Youngnak, em 1945',
      'Wikimedia Commons: as fotos do estudo, cada uma com a licença conferida na página do arquivo (domínio público, CC BY-SA ou licença aberta do governo coreano, KOGL Tipo 1)',
    ],
    works: ['lee-korea', 'orr-fervent', 'noll', 'pew-korea-2006'],
  },
  'avivamentos-na-biblia': {
    ancientLabel: 'Textos consultados',
    ancient: ['A Bíblia (Almeida), citada ao longo do texto: Gênesis 35, Josué 24, 1 Samuel 7, 2 Crônicas 15–17 e 29–34, 2 Reis 22–23, Neemias 8–9, Ageu 1, Jonas 3, Atos e as cartas aos tessalonicenses e aos coríntios'],
    works: ['dillard-longman', 'thiele', 'walton-at', 'keener-nt', 'bruce-nt-history'],
  },
  'marcas-de-um-avivamento': {
    ancientLabel: 'Documentos consultados',
    ancient: ['Jonathan Edwards, The Distinguishing Marks of a Work of the Spirit of God (1741), pelas referências e resumos; o texto inteiro não foi lido', 'Os estudos de avivamento deste app, dos quais vêm todos os exemplos'],
    works: ['orr-fervent', 'edwards-revival', 'noll', 'evans-welsh', 'campbell-lewis', 'ward-east-africa'],
  },
  'a-geracao-que-nao-conheceu-o-senhor': {
    ancientLabel: 'Documentos e sites consultados',
    ancient: [
      'A Bíblia (Almeida), citada ao longo do texto: Josué 24, Juízes 2 e 10–11, 2 Reis 21–23, 2 Crônicas 17, 24 e 33, Deuteronômio 4, 6 e 31, Salmo 78, Provérbios 1 e 31, Efésios 6, 2 Timóteo 1 e 3, Atos 10, 16 e 17',
      'John Wesley, Thoughts Upon Methodism (1786), na edição de Thomas Jackson (vol. 13); a frase foi conferida em citações de fontes metodistas, e a tradução é livre',
      'Christianity Today e Encyclopaedia Britannica: o Pacto pela Metade (1662) e a demissão de Jonathan Edwards de Northampton (22 de junho de 1750); Yale Jonathan Edwards Studies: novas leituras da demissão',
      'Christian History Institute (“Like Mother, Like Son”) e Epworth Old Rectory: Susanna Wesley e as reuniões da cozinha, em 1712; os relatos variam nos números',
      'CGADB: Estatuto Social, versões de 2023 e de 2025 (art. 5º e 8º), com a exigência de observar a Declaração de Fé das Assembleias de Deus; os estudos do app sobre as Assembleias de Deus, de onde vêm os fatos da igreja',
    ],
    works: ['dillard-longman', 'walton-at', 'thiele', 'edwards-revival', 'keener-nt', 'conde', 'synan', 'alencar'],
  },
  'a-palavra-no-coracao': {
    ancientLabel: 'Textos e registros consultados',
    ancient: [
      'A Bíblia (Almeida), citada ao longo do texto: Gênesis 2 e 3, Êxodo 20, Deuteronômio 4 e 6, Salmos 91 e 119, Provérbios 7, 22 e 30, Isaías 8 e 53, Oseias 4, Mateus 4 e 5, Lucas 23, Atos 8, Gálatas 1, 2 Timóteo 3, Hebreus 5, 2 Pedro 3, Apocalipse 22',
      'Wikipédia (en): Wicked Bible, a edição de 1631 da Bíblia do rei Jaime que omitiu o “não” de Êxodo 20.14; as fontes divergem quanto ao valor da multa, por isso o texto não o cita',
      'Lista VERSE_FIXES de tools/gerar-almeida.py: as correções de erros de digitação feitas no texto digital da Almeida do app (as primeiras 23 são de onde vêm os exemplos)',
      'Os estudos do app Os Manuscritos da Bíblia e A Bíblia em Português, sobre a preservação do texto e as diferenças entre traduções',
    ],
    works: ['carson-moo', 'dillard-longman', 'keener-nt', 'ndb'],
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
  'igreja-e-estado': {
    ancientLabel: 'Documentos consultados',
    ancient: [
      'Carta de Pero Vaz de Caminha a el-rei D. Manuel (1500)',
      'Cartas jesuíticas: José de Anchieta sobre a missa de 25 de janeiro de 1554, dia da conversão de São Paulo',
      'Constituição Política do Império do Brasil (1824), art. 5º',
      'Decreto nº 119-A, de 7 de janeiro de 1890 (separação entre a Igreja e o Estado)',
      'Constituição da República (1891), arts. 3º e 72',
      'Decreto-Lei nº 3.059, de 14 de fevereiro de 1941 (colônias agrícolas nacionais)',
      'Revista Brasília (Novacap), maio de 1957: a primeira missa de Brasília',
      'Memorie Biografiche di San Giovanni Bosco: o sonho de 30 de agosto de 1883',
      'Constituição Federal (1988), arts. 5º, VI; 19, I; e 150, VI, b',
      'Artigos sobre os patrimônios religiosos e a formação das cidades (Revista Risco/USP; Cadernos Proarq/UFRJ)',
    ],
    works: ['marx-nosso-chao', 'marx-cidade', 'fausto', 'leite-sj', 'hoornaert', 'mariano'],
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
      'CGADB: Estatuto Social (2025) e Resolução nº 001/2011, sobre divórcio dos ministros (cgadb.org.br/documentos)',
      'Estatuto e regimento de cada convenção estadual e de cada ministério: são eles que valem para a igreja',
    ],
    works: ['araujo-dicionario', 'mariano', 'alencar', 'conde'],
  },
  'estatuto-da-cgadb': {
    ancientLabel: 'Documentos consultados',
    ancient: [
      'CGADB: Estatuto Social, consolidação aprovada em 29/04/2023 (cgadb.org.br/wp-content/uploads/2023/07/consolidacao-estatuto-2023.pdf)',
      'CGADB: Estatuto Social, texto reformado em 19/04/2025 (cgadb.org.br/wp-content/uploads/2026/08/EstatutoCGADB2025.pdf)',
      'CGADB: Resolução do Plenário nº 001/2011, 40ª AGO, Cuiabá (MT), sobre união estável e divórcio (cgadb.org.br/wp-content/uploads/2025/12/resolucao-2011.pdf)',
      'CGADB: Resolução do Plenário nº 001/2019, 44ª AGO, Belém (PA) (cgadb.org.br/wp-content/uploads/2025/12/resolucao-2019-1.pdf)',
      'CGADB: Manifesto contra o Unicismo, aprovado na 46ª AGO, Novo Hamburgo (RS), notícia de 17/05/2023 (cgadb.org.br/manifesto-contra-o-unicismo)',
      'CGADB: Edital de Retificação ao Edital de Convocação da 48ª AGO, 04/08/2026 (cgadb.org.br/wp-content/uploads/2026/08/RetificacaoEdital48AGO.pdf)',
      'Página de documentos da CGADB (cgadb.org.br/documentos): o regimento interno e os estatutos de outras convenções não foram consultados',
    ],
    works: ['declaracao-fe-ad', 'alencar'],
  },
  'igreja-na-america-do-sul': {
    ancientLabel: 'Documentos e sites consultados',
    ancient: [
      'Wikipédia (en): Jesuit missions among the Guaraní; Bartolomé de las Casas; Peruvian Inquisition; James Thomson (pastor); Allen Francis Gardiner; Thomas Bridges (missionary); Y Wladfa; Protestantism in Bolivia; Protestantism in Colombia; La Violencia',
      'Corporación Universitaria Reformada (Colômbia), livro sobre as igrejas evangélicas e o conflito armado (2024), que resume o levantamento de James Goff, The Persecution of Protestant Christians in Colombia, 1948–1958 (CIDOC, 1968), e a tese de Augusto Libreros (1969)',
      'Clyde W. Taylor, “The Fate of Protestants in Colombia, Part II”, Christianity Today, 11/11/1957 (posição de uma associação evangélica; traz as respostas católicas de 1957)',
      'Pew Research Center, pesquisa de 2014 sobre religião em 19 países da América Latina, como resumida em 2017',
    ],
    works: ['thomson-letters', 'shaw-villa-miseria', 'pew-2017'],
  },
  'avivamentos-na-america-do-sul': {
    ancientLabel: 'Documentos e sites consultados',
    ancient: [
      'Memoria Chilena (Biblioteca Nacional do Chile): Fundación de la Iglesia Metodista Pentecostal en Chile (1909)',
      'Pew Research Center (2006): Historical Overview of Pentecostalism in Chile',
      'Wikipédia (en): Pentecostal revival movement in Chile; Operation Auca; Protestantism in Bolivia',
      'Willis C. Hoover, Historia del avivamiento pentecostal en Chile (Valparaíso, 1948), citado pelos estudos como a fonte principal; não foi lido',
    ],
    works: ['shaw-villa-miseria', 'pew-chile-2006', 'pew-2017'],
  },
  'nome-assembleia-de-deus': { ancientLabel: 'Documentos e sites consultados', ancient: ['Registro em cartório da Assembleia de Deus em Belém, em 1918, como citado nos estudos de Gunnar Vingren e Daniel Berg do app', 'Wikipédia (en): Assembleias de Deus; Assemblies of God (o concílio de Hot Springs, 1914)'], works: ['conde', 'synan', 'alencar'] },
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

export type SourceTopic = 'livros' | 'notas' | 'memorial' | 'genealogia' | 'tribos' | 'mapas' | 'profecias' | 'dicionario' | 'curiosidades' | 'ibuc' | 'ebd' | 'harpa' | 'contexto-ad' | 'epocas' | 'conexoes' | 'cronologica' | 'tora' | 'talmude';

/** Fontes de cada parte do app (o que não é um artigo). */
export const TOPIC_SOURCES: Record<SourceTopic, SourceSet & { title: string; note?: string }> = {
  livros: { title: 'Contexto dos livros', note: 'Autor e data seguem a posição tradicional, com as alternativas indicadas quando há debate.', works: ['dillard-longman', 'carson-moo', 'walton-at', 'keener-nt', 'ndb'] },
  notas: { title: 'Notas de estudo nos capítulos', works: ['walton-at', 'keener-nt', 'ndb'] },
  memorial: { title: 'Memorial da Fé', note: 'As datas dos reis seguem a cronologia de Edwin R. Thiele; a avaliação de cada rei é a do próprio texto bíblico.', works: ['thiele', 'ndb', 'kitchen'] },
  conexoes: { title: 'A Bíblia Conectada', note: 'Cada ligação é uma referência cruzada entre dois capítulos; o desenho junta citações diretas, alusões e assuntos parecidos. As explicações das citações são as do próprio app.', works: ['openbible-cross-references', 'harrison-romhild'] },
  cronologica: {
    title: 'A Bíblia em ordem cronológica',
    note: 'A ordem foi montada para o app, a partir do que os próprios livros dizem sobre o tempo em que se passam e do que os estudiosos costumam aceitar; onde há debate, a seção avisa. O texto é o da Almeida, sem nenhuma mudança.',
    ancientLabel: 'Textos e verbetes lidos',
    ancient: [
      'Os anos de quem viveu na mesma época são os do Memorial da Fé (a data dos reis segue Thiele); os dos patriarcas foram calculados com as idades que o próprio Gênesis dá (Gn 17.17; 21.5; 23.1; 25.7 e 25.26; 35.28; 41.46; 47.9 e 47.28; 50.26), a partir do ano que o Memorial dá a Abraão. Cada encontro vem de um trecho da Almeida, conferido pelo nome de quem ele liga',
      'Verbetes G5550 (chrónos), G2540 (kairós), G165 (aiṓn), G5610 (hṓra), H6256 (ʿēt), H2165 (zĕmān), H4150 (môʿēd) e H5769 (ʿôlām) do Strong’s Exhaustive Concordance, com as definições de Thayer (grego) e de Brown-Driver-Briggs (hebraico) que o site biblehub.com reproduz, e as páginas de interlinear dos versículos citados (Gl 4.4, Mc 1.15, Ef 1.10, At 1.7, 1Ts 5.1, Rm 13.11, 2Co 6.2, Mt 28.20, Hb 1.2, Ef 2.7, Jo 2.4, Jo 17.1, Ap 10.6, Ec 3.1, Gn 1.14, Sl 90.2, Ap 1.3, Ap 12.14, 2Tm 4.6, Tt 1.3, 1Tm 4.1, Jd 18, 1Pe 1.20 e 1Jo 2.18), consultados em 18 de novembro de 2026: o app só diz que um versículo traz uma palavra quando a página mostra essa palavra nele',
      'A ordem dos 66 livros é a do primeiro capítulo de cada um na leitura cronológica (uma regra que se confere, sem escolha à mão); o ano de escrita de cada livro vem do texto que o app já traz em “Contexto dos livros”. Como cada livro marca o tempo: um versículo do próprio livro, com o trecho exato da Almeida do app, conferido por teste; onde o primeiro versículo não traz rei nem ano, o app diz só isso, e não que o livro inteiro não tenha nenhum marco de tempo',
    ],
    works: ['thiele', 'dillard-longman', 'carson-moo', 'walton-at', 'keener-nt', 'ndb', 'strong'],
  },
  tora: {
    title: 'A Torá e as porções semanais',
    note: 'Os limites das 54 porções seguem a divisão tradicional, conferida no índice de parashot da Sefaria, e foram escritos na numeração da nossa Bíblia (a da Almeida). O resumo de cada porção é do app.',
    works: ['sefaria', 'wikipedia-judaismo'],
  },
  talmude: {
    title: 'O Talmude',
    note: 'O texto do Talmude não está no app (sem tradução livre em português; a inglesa da Sefaria é CC BY-NC). A estrutura (6 ordens, 63 tratados, 37 com Guemará) vem do índice da Sefaria, e os trechos foram lidos lá e contados com palavras do app.',
    ancientLabel: 'Textos lidos',
    ancient: ['Shabbat 31a, Sanhedrin 37a, Bava Metzia 59b e Avot 1 (edição William Davidson e Mishnah Yomit, de Joshua Kulp); Mishná Sanhedrin 4:5 segundo o manuscrito Kaufmann (domínio público) e a edição de Vilna (Romm, 1913)'],
    works: ['sefaria', 'wikipedia-judaismo'],
  },
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
  epocas: {
    title: 'A linha do tempo da história',
    note: 'Cada fato é curto e vem das fontes abaixo e da própria Bíblia, citada em cada fato que ela conta. As datas antigas são aproximadas, e onde os estudiosos divergem o texto diz. As épocas são uma divisão deste app, para organizar o estudo, e não uma divisão oficial da história.',
    ancientLabel: 'Fontes antigas e documentos',
    ancient: [
      'Prisma de Senaqueribe e Crônicas Babilônicas: o cerco de Jerusalém em 701 a.C. e a tomada da cidade em 597 a.C.',
      'Flávio Josefo, A Guerra dos Judeus (a revolta de 66–73 e o cerco de Jerusalém) e Antiguidades Judaicas 20 (a fome no tempo de Cláudio)',
      'Suetônio, Vida de Cláudio 25 (a expulsão dos judeus de Roma) e Tácito, Anais 15.38–44 (o incêndio de Roma, em 64)',
      'Eusébio, História Eclesiástica 3.5 (a igreja de Jerusalém antes do cerco) e 7.22 (a peste e os cristãos de Alexandria)',
      'Procópio, Guerras 2.22–23 (a peste em Constantinopla, em 542) e Agostinho, A Cidade de Deus (resposta ao saque de Roma, em 410)',
      'Os fatos do mundo todo antes de Cristo (o vulcão de Santorini, o colapso da Idade do Bronze, a queda de Nínive, o eclipse de 585 a.C., as moedas de Creso, a peste de Atenas, Alexandre, as Guerras Púnicas, a China de Qin, o calendário juliano e Augusto) foram lidos em 19 de novembro de 2026 nos verbetes da Wikipédia em inglês “Minoan eruption”, “Late Bronze Age collapse”, “Fall of Nineveh”, “Eclipse of Thales”, “Croeseid”, “Plague of Athens”, “Battle of Gaugamela”, “Punic Wars”, “Qin Shi Huang”, “Julian calendar” e “Augustus”, que resumem os estudos e os autores antigos (Heródoto 1.74, Tucídides 2.47–54): o texto do app só afirma o que esses verbetes dizem e marca como discutida a data de Santorini, a causa do colapso e a previsão de Tales',
      'Decreto nº 847, de 1890, e Constituição de 1824, art. 5 (a religião do Império e o culto doméstico)',
    ],
    works: ['harper-fate', 'ward-perkins', 'kelly-mortality', 'wilson-thirty', 'roberts', 'gonzalez', 'cairns', 'fausto', 'keener-nt', 'walton-at', 'kitchen'],
  },
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
      'Resolução 181 da Assembleia Geral da ONU (29 de novembro de 1947), sobre a partilha da Palestina',
      'Organização Mundial da Saúde: declaração da pandemia de covid-19 (11 de março de 2020); Ministério da Saúde: painel de óbitos por covid-19 no Brasil',
      'The 9/11 Commission Report (2004) e Financial Crisis Inquiry Commission, Final Report (2011)',
      'Paulo Julião da Silva, “Os missionários batistas norte-americanos no Brasil e os relatos de dificuldades na expansão evangélica entre os anos de 1930 e 1945”, Dimensões: Revista de História da UFES, n. 50, p. 227–247, 2023 (a igreja batista na crise de 1929 e na Segunda Guerra)',
    ],
    works: ['fausto', 'schwarcz-starling', 'hobsbawm', 'oliveira-2012'],
  },
  ibuc: { title: 'IBUC', note: 'As aulas não reproduzem as revistas do IBUC: o contexto e as curiosidades vêm da Bíblia e das obras abaixo.', works: ['walton-at', 'keener-nt', 'ndb'] },
};

export const workOf = (id: string): Work => WORKS[id];
