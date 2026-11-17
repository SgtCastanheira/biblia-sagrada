/**
 * A Torá: os cinco livros de Moisés e as 54 porções semanais (parashot) em que a leitura judaica os divide.
 * Código puro (sem Angular), para os testes.
 *
 * Os limites de cada porção seguem a divisão tradicional (conferida no índice de parashot da Sefaria, em 17 de novembro de 2026),
 * mas escritos na NUMERAÇÃO DA NOSSA BÍBLIA (a da Almeida). A Bíblia hebraica numera alguns versículos de outro jeito
 * (Gn 31.55 é 32.1; Lv 5.20 é 6.1; Nm 17.1-15 é 16.36-50; Nm 30.1 é 29.40; Dt 29.1 é 28.69), e por isso o começo e o fim
 * de algumas porções mudam de número, mas não de lugar: Gn 32.3 é o 32.4 do hebraico, e Dt 29.10 é o 29.9.
 */

export type TorahBookId = 'GEN' | 'EXO' | 'LEV' | 'NUM' | 'DEU';

export interface TorahBook {
  id: TorahBookId;
  /** Nome em hebraico: as primeiras palavras do livro. */
  he: string;
  /** Nome transliterado. */
  name: string;
  /** Nome na nossa Bíblia. */
  pt: string;
  /** O que o nome hebraico quer dizer. */
  meaning: string;
  /** De onde vem o nome que usamos (do grego da Septuaginta). */
  origin: string;
  /** Uma linha sobre o livro. */
  theme: string;
}

export const TORAH_BOOKS: TorahBook[] = [
  { id: 'GEN', he: 'בראשית', name: 'Bereshit', pt: 'Gênesis', meaning: 'No princípio', origin: 'Gênesis vem do grego génesis, “origem”.', theme: 'A criação do mundo, a queda, o dilúvio e a família de Abraão, Isaque, Jacó e José.' },
  { id: 'EXO', he: 'שמות', name: 'Shemot', pt: 'Êxodo', meaning: 'Nomes', origin: 'Êxodo vem do grego éxodos, “saída”.', theme: 'A escravidão no Egito, a saída com Moisés, a aliança no Sinai e a construção do tabernáculo.' },
  { id: 'LEV', he: 'ויקרא', name: 'Vayikra', pt: 'Levítico', meaning: 'E chamou', origin: 'Levítico vem do grego leuitikón, “o que é dos levitas”.', theme: 'As ofertas, os sacerdotes, o puro e o impuro, o Dia da Expiação e a santidade do povo.' },
  { id: 'NUM', he: 'במדבר', name: 'Bamidbar', pt: 'Números', meaning: 'No deserto', origin: 'Números vem do grego arithmoí, “números”, por causa dos censos.', theme: 'Os censos, a partida do Sinai e os quarenta anos no deserto, até as planícies de Moabe.' },
  { id: 'DEU', he: 'דברים', name: 'Devarim', pt: 'Deuteronômio', meaning: 'Palavras', origin: 'Deuteronômio vem do grego deuteronómion, “segunda lei”.', theme: 'Os discursos de Moisés antes de entrar na terra, a renovação da aliança e a sua morte.' },
];

/** Uma posição na nossa Bíblia: capítulo e versículo. */
export type Spot = [chapter: number, verse: number];

export interface Parasha {
  /** Posição no ano, de 1 a 54. */
  n: number;
  book: TorahBookId;
  /** Nome transliterado, como se vê nos calendários. */
  name: string;
  he: string;
  /** O que a palavra quer dizer (ou de quem a porção fala). */
  meaning: string;
  from: Spot;
  to: Spot;
  /** O que a porção conta, em uma frase. */
  summary: string;
  /** Lida junto com a porção seguinte em alguns anos (veja `COMBINED`). */
  joinsNext?: boolean;
}

export const PARASHOT: Parasha[] = [
  // ———— Gênesis ————
  { n: 1, book: 'GEN', name: 'Bereshit', he: 'בראשית', meaning: 'No princípio', from: [1, 1], to: [6, 8], summary: 'A criação, o jardim do Éden, Caim e Abel e a maldade que enche a terra.' },
  { n: 2, book: 'GEN', name: 'Noach', he: 'נח', meaning: 'Noé', from: [6, 9], to: [11, 32], summary: 'Noé e a arca, o dilúvio, a aliança do arco-íris e a torre de Babel.' },
  { n: 3, book: 'GEN', name: 'Lech Lecha', he: 'לך לך', meaning: 'Vai-te', from: [12, 1], to: [17, 27], summary: 'Deus chama Abrão, faz aliança com ele, nasce Ismael e vem a circuncisão.' },
  { n: 4, book: 'GEN', name: 'Vayera', he: 'וירא', meaning: 'E apareceu', from: [18, 1], to: [22, 24], summary: 'Os três visitantes, Sodoma e Gomorra, o nascimento de Isaque e a ordem de oferecê-lo no monte Moriá.' },
  { n: 5, book: 'GEN', name: 'Chayei Sarah', he: 'חיי שרה', meaning: 'A vida de Sara', from: [23, 1], to: [25, 18], summary: 'A morte de Sara, a caverna de Macpela, Rebeca é buscada para Isaque e Abraão morre.' },
  { n: 6, book: 'GEN', name: 'Toldot', he: 'תולדות', meaning: 'As gerações', from: [25, 19], to: [28, 9], summary: 'Esaú e Jacó, o prato de lentilhas, a bênção de Isaque e a fuga de Jacó.' },
  { n: 7, book: 'GEN', name: 'Vayetzei', he: 'ויצא', meaning: 'E saiu', from: [28, 10], to: [32, 2], summary: 'O sonho da escada em Betel, Jacó em Harã com Lia e Raquel, os filhos e a partida para Canaã.' },
  { n: 8, book: 'GEN', name: 'Vayishlach', he: 'וישלח', meaning: 'E enviou', from: [32, 3], to: [36, 43], summary: 'O reencontro com Esaú, a luta com o anjo em Peniel, Diná, a morte de Raquel e os filhos de Esaú.' },
  { n: 9, book: 'GEN', name: 'Vayeshev', he: 'וישב', meaning: 'E habitou', from: [37, 1], to: [40, 23], summary: 'José e os seus sonhos, vendido pelos irmãos; Judá e Tamar; José na casa de Potifar e na prisão.' },
  { n: 10, book: 'GEN', name: 'Miketz', he: 'מקץ', meaning: 'Ao fim de', from: [41, 1], to: [44, 17], summary: 'Os sonhos de Faraó, José governador do Egito, os irmãos que descem e a taça de prata.' },
  { n: 11, book: 'GEN', name: 'Vayigash', he: 'ויגש', meaning: 'E se aproximou', from: [44, 18], to: [47, 27], summary: 'Judá se oferece no lugar de Benjamim, José se revela e Jacó desce ao Egito.' },
  { n: 12, book: 'GEN', name: 'Vayechi', he: 'ויחי', meaning: 'E viveu', from: [47, 28], to: [50, 26], summary: 'Jacó abençoa os netos e os doze filhos e morre; José também morre, no Egito.' },
  // ———— Êxodo ————
  { n: 13, book: 'EXO', name: 'Shemot', he: 'שמות', meaning: 'Nomes', from: [1, 1], to: [6, 1], summary: 'A escravidão, o nascimento de Moisés, a sarça ardente e o primeiro pedido a Faraó.' },
  { n: 14, book: 'EXO', name: 'Vaera', he: 'וארא', meaning: 'E eu apareci', from: [6, 2], to: [9, 35], summary: 'Deus renova a promessa e vêm as sete primeiras pragas.' },
  { n: 15, book: 'EXO', name: 'Bo', he: 'בא', meaning: 'Vai (a Faraó)', from: [10, 1], to: [13, 16], summary: 'As três últimas pragas, a Páscoa e a saída do Egito.' },
  { n: 16, book: 'EXO', name: 'Beshalach', he: 'בשלח', meaning: 'Quando deixou ir', from: [13, 17], to: [17, 16], summary: 'A travessia do mar, o cântico de Moisés, o maná, a água da rocha e a luta contra Amaleque.' },
  { n: 17, book: 'EXO', name: 'Yitro', he: 'יתרו', meaning: 'Jetro', from: [18, 1], to: [20, 26], summary: 'Jetro aconselha Moisés, o povo chega ao Sinai e Deus dá os Dez Mandamentos.' },
  { n: 18, book: 'EXO', name: 'Mishpatim', he: 'משפטים', meaning: 'Ordenanças', from: [21, 1], to: [24, 18], summary: 'As leis da aliança, sobre servos, danos, justiça e festas, e a aliança selada.' },
  { n: 19, book: 'EXO', name: 'Terumah', he: 'תרומה', meaning: 'Oferta', from: [25, 1], to: [27, 19], summary: 'A oferta do povo e o plano do tabernáculo: arca, mesa, candelabro e altar.' },
  { n: 20, book: 'EXO', name: 'Tetzaveh', he: 'תצוה', meaning: 'Tu ordenarás', from: [27, 20], to: [30, 10], summary: 'O azeite da lâmpada, as vestes dos sacerdotes, a sua consagração e o altar do incenso.' },
  { n: 21, book: 'EXO', name: 'Ki Tisa', he: 'כי תשא', meaning: 'Quando tomares', from: [30, 11], to: [34, 35], summary: 'O censo, o bezerro de ouro, as tábuas quebradas e a aliança renovada.' },
  { n: 22, book: 'EXO', name: 'Vayakhel', he: 'ויקהל', meaning: 'E reuniu', from: [35, 1], to: [38, 20], summary: 'O sábado e a construção do tabernáculo por Bezalel e Aoliabe.', joinsNext: true },
  { n: 23, book: 'EXO', name: 'Pekudei', he: 'פקודי', meaning: 'As contas', from: [38, 21], to: [40, 38], summary: 'As contas do tabernáculo, a obra concluída e a glória do Senhor enchendo a tenda.' },
  // ———— Levítico ————
  { n: 24, book: 'LEV', name: 'Vayikra', he: 'ויקרא', meaning: 'E chamou', from: [1, 1], to: [6, 7], summary: 'As ofertas: o holocausto, a de cereais, a de paz, a pelo pecado e a pela culpa.' },
  { n: 25, book: 'LEV', name: 'Tzav', he: 'צו', meaning: 'Ordena', from: [6, 8], to: [8, 36], summary: 'As instruções aos sacerdotes sobre as ofertas e a consagração de Arão e dos seus filhos.' },
  { n: 26, book: 'LEV', name: 'Shemini', he: 'שמיני', meaning: 'Oitavo', from: [9, 1], to: [11, 47], summary: 'O oitavo dia, a morte de Nadabe e Abiú e os animais que se podem e não se podem comer.' },
  { n: 27, book: 'LEV', name: 'Tazria', he: 'תזריע', meaning: 'Quando conceber', from: [12, 1], to: [13, 59], summary: 'O parto e a purificação, e as leis sobre a lepra da pele e das roupas.', joinsNext: true },
  { n: 28, book: 'LEV', name: 'Metzora', he: 'מצורע', meaning: 'O leproso', from: [14, 1], to: [15, 33], summary: 'A purificação do leproso e da casa, e as impurezas do corpo.' },
  { n: 29, book: 'LEV', name: 'Acharei Mot', he: 'אחרי מות', meaning: 'Depois da morte', from: [16, 1], to: [18, 30], summary: 'O Dia da Expiação, o sangue e as proibições de práticas pagãs e sexuais.', joinsNext: true },
  { n: 30, book: 'LEV', name: 'Kedoshim', he: 'קדושים', meaning: 'Santos', from: [19, 1], to: [20, 27], summary: '“Santos sereis”: leis morais e sociais, entre elas “amarás o teu próximo como a ti mesmo” (19.18).' },
  { n: 31, book: 'LEV', name: 'Emor', he: 'אמור', meaning: 'Fala', from: [21, 1], to: [24, 23], summary: 'As regras dos sacerdotes, as festas do Senhor e o caso do blasfemo.' },
  { n: 32, book: 'LEV', name: 'Behar', he: 'בהר', meaning: 'No monte', from: [25, 1], to: [26, 2], summary: 'O ano sabático, o jubileu e o resgate da terra e das pessoas.', joinsNext: true },
  { n: 33, book: 'LEV', name: 'Bechukotai', he: 'בחוקתי', meaning: 'Nos meus estatutos', from: [26, 3], to: [27, 34], summary: 'As bênçãos e as maldições da aliança, e as regras dos votos e dos dízimos.' },
  // ———— Números ————
  { n: 34, book: 'NUM', name: 'Bamidbar', he: 'במדבר', meaning: 'No deserto', from: [1, 1], to: [4, 20], summary: 'O censo, o acampamento das tribos ao redor da tenda e os levitas.' },
  { n: 35, book: 'NUM', name: 'Nasso', he: 'נשא', meaning: 'Levanta (a soma)', from: [4, 21], to: [7, 89], summary: 'O serviço dos levitas, o nazireu, a bênção sacerdotal (6.24-26) e as ofertas dos chefes.' },
  { n: 36, book: 'NUM', name: 'Beha’alotcha', he: 'בהעלתך', meaning: 'Quando acenderes', from: [8, 1], to: [12, 16], summary: 'As lâmpadas, as trombetas, a partida do Sinai, o povo que murmura e os setenta anciãos.' },
  { n: 37, book: 'NUM', name: 'Shelach', he: 'שלח', meaning: 'Envia', from: [13, 1], to: [15, 41], summary: 'Os doze espias, o povo que se recusa a entrar e as franjas nas roupas.' },
  { n: 38, book: 'NUM', name: 'Korach', he: 'קרח', meaning: 'Corá', from: [16, 1], to: [18, 32], summary: 'A rebelião de Corá e o cajado de Arão que floresce.' },
  { n: 39, book: 'NUM', name: 'Chukat', he: 'חקת', meaning: 'O estatuto', from: [19, 1], to: [22, 1], summary: 'A novilha vermelha, a água da rocha em Meribá, a morte de Arão e a serpente de bronze.', joinsNext: true },
  { n: 40, book: 'NUM', name: 'Balak', he: 'בלק', meaning: 'Balaque', from: [22, 2], to: [25, 9], summary: 'Balaque chama Balaão para amaldiçoar Israel, a jumenta que fala e o pecado em Peor.' },
  { n: 41, book: 'NUM', name: 'Pinchas', he: 'פנחס', meaning: 'Finéias', from: [25, 10], to: [29, 40], summary: 'Finéias, o segundo censo, as filhas de Zelofeade, Josué escolhido e as ofertas das festas.' },
  { n: 42, book: 'NUM', name: 'Matot', he: 'מטות', meaning: 'As tribos', from: [30, 1], to: [32, 42], summary: 'Os votos, a guerra contra Midiã e as tribos que pedem terra a leste do Jordão.', joinsNext: true },
  { n: 43, book: 'NUM', name: 'Masei', he: 'מסעי', meaning: 'As jornadas', from: [33, 1], to: [36, 13], summary: 'A lista das paradas no deserto, as fronteiras da terra e as cidades de refúgio.' },
  // ———— Deuteronômio ————
  { n: 44, book: 'DEU', name: 'Devarim', he: 'דברים', meaning: 'Palavras', from: [1, 1], to: [3, 22], summary: 'Moisés recorda a caminhada desde o Horebe: os chefes, os espias e as primeiras vitórias.' },
  { n: 45, book: 'DEU', name: 'Vaetchanan', he: 'ואתחנן', meaning: 'E eu supliquei', from: [3, 23], to: [7, 11], summary: 'Moisés pede para entrar na terra; os Dez Mandamentos de novo e o Shemá (6.4).' },
  { n: 46, book: 'DEU', name: 'Ekev', he: 'עקב', meaning: 'Em consequência', from: [7, 12], to: [11, 25], summary: 'A bênção da obediência, o bezerro de ouro lembrado e “nem só de pão viverá o homem” (8.3).' },
  { n: 47, book: 'DEU', name: 'Re’eh', he: 'ראה', meaning: 'Vê', from: [11, 26], to: [16, 17], summary: 'A bênção e a maldição, um só lugar de culto, os falsos profetas, os pobres e as festas.' },
  { n: 48, book: 'DEU', name: 'Shoftim', he: 'שפטים', meaning: 'Juízes', from: [16, 18], to: [21, 9], summary: 'Juízes, reis, sacerdotes e profetas, as cidades de refúgio e as leis da guerra.' },
  { n: 49, book: 'DEU', name: 'Ki Tetze', he: 'כי תצא', meaning: 'Quando saíres', from: [21, 10], to: [25, 19], summary: 'Muitas leis do dia a dia: família, casa, dívidas, trabalhadores e justiça.' },
  { n: 50, book: 'DEU', name: 'Ki Tavo', he: 'כי תבוא', meaning: 'Quando entrares', from: [26, 1], to: [29, 9], summary: 'As primícias, as bênçãos e as maldições no monte Ebal e a aliança em Moabe.' },
  { n: 51, book: 'DEU', name: 'Nitzavim', he: 'נצבים', meaning: 'Os que estão de pé', from: [29, 10], to: [30, 20], summary: 'Todo o povo diante de Deus e a escolha entre a vida e a morte.', joinsNext: true },
  { n: 52, book: 'DEU', name: 'Vayelech', he: 'וילך', meaning: 'E foi', from: [31, 1], to: [31, 30], summary: 'Moisés entrega a liderança a Josué e deixa a lei escrita para ser lida ao povo.' },
  { n: 53, book: 'DEU', name: 'Haazinu', he: 'האזינו', meaning: 'Escutai', from: [32, 1], to: [32, 52], summary: 'O cântico de Moisés e a ordem de subir ao monte Nebo.' },
  { n: 54, book: 'DEU', name: 'Vezot Haberachah', he: 'וזאת הברכה', meaning: 'E esta é a bênção', from: [33, 1], to: [34, 12], summary: 'A bênção de Moisés às tribos e a sua morte. É lida na Simchat Torá.' },
];

/** As porções lidas juntas em alguns anos, para o ciclo caber nas semanas do ano. */
export const COMBINED: [string, string][] = PARASHOT.filter((p) => p.joinsNext).map((p) => [p.name, PARASHOT[p.n].name]);

export const parashotOf = (book: TorahBookId): Parasha[] => PARASHOT.filter((p) => p.book === book);

/** “Gn 1.1 – 6.8”: o trecho da porção, na numeração da nossa Bíblia. */
export function parashaRange(p: Parasha, abbrev: string): string {
  const [c1, v1] = p.from;
  const [c2, v2] = p.to;
  if (c1 === c2) return `${abbrev} ${c1}.${v1}-${v2}`;
  return `${abbrev} ${c1}.${v1} – ${c2}.${v2}`;
}

/** A porção em que um versículo está (ou null fora da Torá). */
export function parashaOfVerse(book: string, chapter: number, verse: number): Parasha | null {
  const key = chapter * 1000 + verse;
  return PARASHOT.find((p) => p.book === book && p.from[0] * 1000 + p.from[1] <= key && key <= p.to[0] * 1000 + p.to[1]) ?? null;
}

/** Quantos capítulos (inteiros ou em parte) a porção toca. */
export const parashaChapters = (p: Parasha): number => p.to[0] - p.from[0] + 1;
