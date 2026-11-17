import { BOOKS, findBook } from './books';

/**
 * A Bíblia em ordem cronológica: os mesmos 1.189 capítulos da Almeida, lidos na ordem em que as coisas
 * aconteceram, e não na ordem em que os livros foram encadernados. Código puro (sem Angular), para os testes.
 *
 * Como foi montada (a leitura só funciona se isto ficar claro para quem lê):
 * - A ordem é a dos ACONTECIMENTOS que cada livro conta, não a da escrita. Samuel, Reis e Crônicas contam a mesma
 *   história, e os profetas entram no reinado em que o próprio livro os situa.
 * - Cada capítulo aparece UMA vez (o teste confere os 1.189). Quando um capítulo junta épocas diferentes (os
 *   Evangelhos, Jeremias, Isaías), ele fica onde começa a parte principal dele.
 * - Quando os estudiosos discordam da data (Jó, Joel, Tiago, Gálatas, Hebreus), a seção diz que a posição é uma escolha.
 * - Os Salmos entram onde o próprio título os liga a um fato (Sl 51: “quando o profeta Natã veio a ele”); os demais
 *   ficam juntos, e `PSA *` quer dizer “os salmos que nenhuma seção pediu”.
 */

/** Um trecho contínuo de um livro, em capítulos. */
export interface ChronoPart {
  bookId: string;
  from: number;
  to: number;
}

export interface ChronoSection {
  /** Posição da seção na leitura (1 a N). */
  n: number;
  group: string;
  title: string;
  /** Uma frase sobre o que acontece. */
  summary: string;
  /** Aviso quando a posição é uma escolha entre várias possíveis. */
  note?: string;
  parts: ChronoPart[];
}

export interface ChronoGroup {
  id: string;
  name: string;
  period: string;
  icon: string;
  /** Texto que vem ANTES do grupo (os 400 anos sem livros, por exemplo). */
  before?: { title: string; text: string; link: string };
}

export const CHRONO_GROUPS: ChronoGroup[] = [
  { id: 'comeco', name: 'No Princípio', period: 'Antes de Abraão', icon: 'public' },
  { id: 'patriarcas', name: 'Jó e os Patriarcas', period: 'c. 2000–1700 a.C.', icon: 'family_history' },
  { id: 'exodo', name: 'O Êxodo, a Lei e o Deserto', period: 'c. 1700–1400 a.C.', icon: 'hiking' },
  { id: 'conquista', name: 'A Conquista e os Juízes', period: 'c. 1400–1050 a.C.', icon: 'flag' },
  { id: 'reino-unido', name: 'Samuel, Saul, Davi e Salomão', period: 'c. 1100–930 a.C.', icon: 'military_tech' },
  { id: 'reino-dividido', name: 'Israel e Judá: Reis e Profetas', period: '930–586 a.C.', icon: 'compare_arrows' },
  { id: 'exilio', name: 'A Queda de Jerusalém e o Exílio', period: '605–536 a.C.', icon: 'luggage' },
  { id: 'retorno', name: 'A Volta do Exílio', period: '538–430 a.C.', icon: 'home_work' },
  {
    id: 'jesus', name: 'A Vida de Jesus', period: 'c. 6 a.C. – 30 d.C.', icon: 'star',
    before: {
      title: 'Os 400 Anos de Silêncio',
      text: 'Entre Malaquias e o nascimento de Jesus passam-se cerca de quatrocentos anos sem nenhum livro da Bíblia. A história continuou: Persas, Alexandre, os Macabeus e Roma.',
      link: '/epocas/entre-testamentos',
    },
  },
  { id: 'igreja', name: 'A Igreja Nasce: Atos e as Cartas', period: '30–68', icon: 'local_fire_department' },
  { id: 'fim', name: 'Os Últimos Escritos', period: 'c. 85–95', icon: 'auto_awesome' },
];

/** `GEN 1-11; JOB 1-42` → partes. `PSA *` vira o que sobrar do livro (resolvido por `build`). */
type Source = [group: string, title: string, summary: string, parts: string, note?: string];

const SOURCES: Source[] = [
  // ———— No Princípio ————
  ['comeco', 'A Criação, a Queda, o Dilúvio e Babel', 'Deus cria o céu e a terra; a humanidade se afasta dele; vêm o dilúvio, Noé e a torre de Babel.', 'GEN 1-11'],

  // ———— Jó e os Patriarcas ————
  ['patriarcas', 'Jó, o Justo que Sofreu', 'Um homem íntegro perde tudo e discute com os amigos e com Deus.', 'JOB 1-42', 'O livro não diz quando se passa; o cenário (riqueza em rebanhos, sacrifícios feitos pelo próprio pai de família) lembra o tempo dos patriarcas, e por isso entra aqui. É uma escolha.'],
  ['patriarcas', 'Abraão', 'Deus chama Abrão, faz a promessa, e nasce Isaque.', 'GEN 12-25'],
  ['patriarcas', 'Isaque e Jacó', 'Os gêmeos Esaú e Jacó, a bênção, a fuga para Harã, a família e o retorno a Canaã.', 'GEN 26-36'],
  ['patriarcas', 'José e a Descida ao Egito', 'Vendido pelos irmãos, José chega a governador do Egito e leva a família para lá.', 'GEN 37-50'],

  // ———— O Êxodo, a Lei e o Deserto ————
  ['exodo', 'A Escravidão, as Pragas e a Saída', 'Moisés, as dez pragas, a Páscoa e a travessia do mar.', 'EXO 1-18'],
  ['exodo', 'A Aliança no Sinai', 'Os Dez Mandamentos e as leis da aliança.', 'EXO 19-24'],
  ['exodo', 'O Tabernáculo e o Bezerro de Ouro', 'As instruções da tenda da presença de Deus, o pecado do povo e a renovação da aliança.', 'EXO 25-40'],
  ['exodo', 'O Levítico: Sacrifícios, Pureza e Santidade', 'As leis das ofertas, dos sacerdotes, do puro e do impuro e das festas.', 'LEV 1-27'],
  ['exodo', 'O Censo e a Partida do Sinai', 'O povo é contado e organizado em volta da tenda; a nuvem se levanta.', 'NUM 1-10'],
  ['exodo', 'Quarenta Anos no Deserto', 'Murmurações, os espias, a rebelião de Corá e a serpente de bronze.', 'NUM 11-21'],
  ['exodo', 'Balaão e as Planícies de Moabe', 'Balaque contrata Balaão; o povo peca em Peor; o segundo censo e a divisão da terra.', 'NUM 22-36'],
  ['exodo', 'Os Discursos de Moisés', 'Moisés repete a lei ao povo antes de entrar em Canaã e morre no monte Nebo.', 'DEU 1-34'],
  ['exodo', 'A Oração de Moisés', 'O salmo que o título atribui a Moisés.', 'PSA 90', 'A tradição liga este salmo ao tempo do deserto, pelo título. É uma escolha.'],

  // ———— A Conquista e os Juízes ————
  ['conquista', 'A Conquista de Canaã', 'Josué atravessa o Jordão, Jericó cai e a terra é repartida entre as tribos.', 'JOS 1-24'],
  ['conquista', 'Os Juízes', 'Ciclos de queda, opressão e livramento: Débora, Gideão, Sansão e outros.', 'JDG 1-21'],
  ['conquista', 'Rute', 'Uma moabita fiel a Noemi encontra Boaz, e dela vem o avô de Davi.', 'RUT 1-4'],

  // ———— Samuel, Saul, Davi e Salomão ————
  ['reino-unido', 'Samuel e o Primeiro Rei', 'O nascimento de Samuel, a arca entre os filisteus e o povo que pede um rei.', '1SA 1-15'],
  ['reino-unido', 'Davi e Golias, e a Fúria de Saul', 'Davi é ungido, vence Golias e passa a fugir de Saul.', '1SA 16-24'],
  ['reino-unido', 'Os Salmos da Fuga', 'Os salmos cujo título os liga a Davi fugindo de Saul.', 'PSA 34; PSA 52; PSA 54; PSA 56; PSA 57; PSA 59; PSA 63; PSA 142', 'O título de cada salmo fala do episódio; o Salmo 63 (o deserto de Judá) também pode ser do tempo de Absalão.'],
  ['reino-unido', 'Nabal, Ziclague e a Morte de Saul', 'Davi entre os filisteus; a médium de Endor e a batalha do monte Gilboa.', '1SA 25-31'],
  ['reino-unido', 'As Genealogias de Crônicas', 'De Adão aos que voltaram do exílio: os nomes com que Crônicas abre a sua história.', '1CH 1-9', 'Estas listas cobrem toda a história, e não só este tempo. Ficam aqui porque é daqui que Crônicas começa a contar.'],
  ['reino-unido', 'Davi Reina em Hebrom', 'A morte de Saul (também em 1 Crônicas 10), o lamento de Davi e a guerra entre as duas casas.', '1CH 10; 2SA 1-4'],
  ['reino-unido', 'Davi Rei de Todo o Israel', 'As tribos o aceitam, Jerusalém é tomada e os seus valentes são contados.', '2SA 5; 1CH 11-12'],
  ['reino-unido', 'A Arca em Jerusalém', 'A arca é levada para a cidade de Davi entre cânticos e danças.', '2SA 6; 1CH 13-16'],
  ['reino-unido', 'A Aliança com Davi', 'Deus promete a Davi uma casa e um trono que não acabam.', '2SA 7; 1CH 17'],
  ['reino-unido', 'As Vitórias de Davi', 'As guerras do reino e a bondade de Davi com Mefibosete.', '2SA 8-10; 1CH 18-19; PSA 60'],
  ['reino-unido', 'Bate-Seba, Natã e o Arrependimento', 'O pecado de Davi, a parábola do profeta Natã e o salmo do perdão.', '2SA 11-12; 1CH 20; PSA 51'],
  ['reino-unido', 'Amnom, Tamar e Absalão', 'A violência dentro da família do rei.', '2SA 13-14'],
  ['reino-unido', 'A Rebelião de Absalão', 'Davi foge de Jerusalém, e o filho rebelde morre.', '2SA 15-19; PSA 3'],
  ['reino-unido', 'Seba e a Fome', 'Uma nova revolta e três anos de fome por causa de uma culpa antiga.', '2SA 20-21'],
  ['reino-unido', 'O Cântico de Davi', 'O mesmo cântico de livramento, como história e como salmo.', '2SA 22; PSA 18'],
  ['reino-unido', 'O Recenseamento e o Lugar do Templo', 'As últimas palavras de Davi, o censo, a peste e o terreno de Araúna.', '2SA 23-24; 1CH 21'],
  ['reino-unido', 'Davi Prepara o Templo e Entrega o Reino', 'Os preparativos, a coroação de Salomão e a morte de Davi.', '1CH 22-29; 1KI 1-2'],
  ['reino-unido', 'Os Salmos', 'O hinário de Israel: louvores, lamentos, orações e cânticos de peregrinação.', 'PSA *', 'Os salmos que nenhuma seção pediu ficam juntos aqui, porque o texto não permite datar cada um. Muitos são de Davi; outros são de Asafe, dos filhos de Corá e de Salomão, e vários são posteriores ao reinado de Davi.'],
  ['reino-unido', 'A Sabedoria de Salomão', 'Salomão pede sabedoria e governa com justiça.', '1KI 3-4; 2CH 1'],
  ['reino-unido', 'O Cântico dos Cânticos', 'O poema de amor atribuído a Salomão.', 'SNG 1-8', 'A tradição põe Cânticos na juventude de Salomão, Provérbios na maturidade e Eclesiastes na velhice. É uma escolha.'],
  ['reino-unido', 'O Templo de Salomão', 'A construção e a dedicação do Templo.', '1KI 5-8; 2CH 2-7'],
  ['reino-unido', 'Salomão no Auge', 'A rainha de Sebá, as riquezas e as obras do reino.', '1KI 9-10; 2CH 8-9'],
  ['reino-unido', 'Os Provérbios de Salomão', 'Os ditos de sabedoria atribuídos a Salomão.', 'PRO 1-24', 'Em Provérbios 25.1 o livro diz que os homens do rei Ezequias copiaram os provérbios seguintes; por isso eles ficam mais adiante.'],
  ['reino-unido', 'O Pregador', 'Eclesiastes: tudo é vaidade sem Deus.', 'ECC 1-12'],
  ['reino-unido', 'O Fim de Salomão', 'As mulheres estrangeiras, os deuses falsos e o anúncio da divisão.', '1KI 11'],

  // ———— Israel e Judá ————
  ['reino-dividido', 'O Reino se Divide', 'Roboão responde duro ao povo, e Jeroboão faz os bezerros de Betel e de Dã.', '1KI 12-14; 2CH 10-12'],
  ['reino-dividido', 'Os Primeiros Reis dos Dois Reinos', 'Abias e Asa em Judá; as casas que se sucedem no norte.', '1KI 15-16; 2CH 13-16'],
  ['reino-dividido', 'Elias', 'A seca, a viúva de Sarepta, o monte Carmelo e a voz mansa no Horebe.', '1KI 17-19'],
  ['reino-dividido', 'Acabe, Josafá e Micaías', 'A vinha de Nabote, a guerra contra os sírios e o profeta que disse a verdade ao rei.', '1KI 20-22; 2CH 17-20'],
  ['reino-dividido', 'Eliseu e os Reis Depois de Acabe', 'O manto de Elias, os milagres de Eliseu e a cura de Naamã.', '2KI 1-8; 2CH 21-22'],
  ['reino-dividido', 'Jeú', 'A casa de Acabe cai, e Jeú toma o trono do norte.', '2KI 9-10'],
  ['reino-dividido', 'Atalia e Joás', 'A rainha que quase acabou com a linhagem de Davi e o menino que a salvou.', '2KI 11-12; 2CH 23-24'],
  ['reino-dividido', 'Joel', 'O dia do Senhor e a promessa do Espírito derramado.', 'JOL 1-3', 'Os estudiosos discutem se Joel é do século IX ou do V a.C. Aqui ele fica no tempo de Joás. É uma escolha.'],
  ['reino-dividido', 'Os Últimos Anos de Eliseu e Amazias', 'Joás de Israel visita o profeta moribundo; Amazias reina em Judá.', '2KI 13-14; 2CH 25'],
  ['reino-dividido', 'Jonas', 'O profeta que fugiu de Nínive e a cidade que se arrependeu.', 'JON 1-4', '2 Reis 14.25 situa Jonas no reinado de Jeroboão II.'],
  ['reino-dividido', 'Amós', 'O boieiro de Tecoa denuncia a injustiça num reino próspero.', 'AMO 1-9'],
  ['reino-dividido', 'Oseias', 'O profeta casado com uma mulher infiel mostra o amor de Deus por Israel.', 'HOS 1-14'],
  ['reino-dividido', 'Uzias e Jotão', 'Dois reis de Judá: um poderoso que se ensoberbeceu e outro que andou direito.', '2KI 15; 2CH 26-27'],
  ['reino-dividido', 'O Chamado de Isaías', 'Isaías vê o Senhor no Templo “no ano em que morreu o rei Uzias” e começa a profetizar.', 'ISA 1-6'],
  ['reino-dividido', 'Acaz, o Emanuel e Miqueias', 'O sinal da virgem, as palavras de Miqueias sobre Belém e o rei que buscou ajuda na Assíria.', '2KI 16; 2CH 28; ISA 7-12; MIC 1-7'],
  ['reino-dividido', 'A Queda de Samaria', 'A Assíria leva o reino do norte para o cativeiro, em 722 a.C.', '2KI 17'],
  ['reino-dividido', 'Isaías e as Nações', 'Os oráculos sobre os povos vizinhos, o dia do Senhor e as promessas de salvação.', 'ISA 13-35', 'Estes capítulos não trazem data. Eles ficam aqui, antes do cerco de Senaqueribe, que é o fato com que o livro volta à história (Isaías 36).'],
  ['reino-dividido', 'Ezequias Restaura o Templo', 'O rei reabre o Templo, purifica o culto e celebra a Páscoa.', '2CH 29-31'],
  ['reino-dividido', 'Senaqueribe Cerca Jerusalém', 'O exército assírio chega, e o anjo do Senhor livra a cidade.', '2KI 18-19; 2CH 32; ISA 36-37'],
  ['reino-dividido', 'A Doença de Ezequias', 'O rei adoece, ora e recebe mais quinze anos; os mensageiros de Babilônia chegam.', '2KI 20; ISA 38-39'],
  ['reino-dividido', 'Os Provérbios de Ezequias', 'Os provérbios que os homens do rei copiaram, e as palavras de Agur e de Lemuel.', 'PRO 25-31', 'Provérbios 25.1 liga a coleção a Ezequias. Os capítulos 30 e 31 (Agur e Lemuel) não têm data.'],
  ['reino-dividido', 'Manassés e Amom', 'O pior rei de Judá, seu arrependimento tardio e o breve reinado do filho.', '2KI 21; 2CH 33'],
  ['reino-dividido', 'Naum', 'O anúncio da queda de Nínive.', 'NAM 1-3'],
  ['reino-dividido', 'Sofonias', 'O dia do Senhor e o resto fiel.', 'ZEP 1-3'],
  ['reino-dividido', 'Josias e o Livro da Lei', 'O livro achado no Templo, a reforma e a morte do rei em Megido.', '2KI 22-23; 2CH 34-35'],

  // ———— A Queda de Jerusalém e o Exílio ————
  ['exilio', 'Jeremias: Do Chamado ao Tempo de Jeoaquim', 'O profeta chamado ainda jovem anuncia a ruína de Judá e é perseguido.', 'JER 1-20', 'O livro de Jeremias não segue a ordem do tempo. Aqui ele aparece dividido em blocos, cada um no ponto da história em que se passa a maior parte dele.'],
  ['exilio', 'Habacuque', 'O profeta pergunta a Deus por que o mal prospera, e aprende que o justo viverá pela sua fé.', 'HAB 1-3'],
  ['exilio', 'A Primeira Deportação', 'Nabucodonosor domina Judá; Joaquim é levado para a Babilônia em 597 a.C.', '2KI 24'],
  ['exilio', 'Daniel e os Três Amigos', 'Os jovens de Judá na corte da Babilônia, o sonho da estátua e a fornalha.', 'DAN 1-3'],
  ['exilio', 'Ezequiel no Exílio', 'A visão do carro de Deus, os sinais e o anúncio da destruição de Jerusalém.', 'EZK 1-24'],
  ['exilio', 'Os Últimos Anos de Judá', 'Zedequias, o cerco, o novo pacto e a compra do campo de Anatote.', 'JER 21-39'],
  ['exilio', 'A Queda de Jerusalém', 'Em 586 a.C. a cidade e o Templo são destruídos.', '2KI 25; 2CH 36; JER 52'],
  ['exilio', 'As Lamentações', 'Cinco poemas de luto sobre Jerusalém destruída.', 'LAM 1-5'],
  ['exilio', 'Junto aos Rios da Babilônia', 'O salmo dos exilados.', 'PSA 137'],
  ['exilio', 'Obadias', 'O juízo sobre Edom, que se alegrou com a queda de Jerusalém.', 'OBA 1', 'Escolha comum: Obadias fala de Jerusalém tomada e saqueada, e o mais provável é que seja logo depois de 586 a.C.'],
  ['exilio', 'Os que Ficaram e a Fuga para o Egito', 'Gedalias é morto, e o povo leva Jeremias para o Egito.', 'JER 40-44'],
  ['exilio', 'Baruque e as Palavras para as Nações', 'Os oráculos de Jeremias contra o Egito, os filisteus, Moabe, Edom e a Babilônia.', 'JER 45-51'],
  ['exilio', 'Ezequiel: As Nações e a Esperança', 'O atalaia, o vale dos ossos secos e a promessa de um coração novo.', 'EZK 25-39'],
  ['exilio', 'A Visão do Novo Templo', 'Ezequiel vê o Templo restaurado e a água que sai debaixo dele.', 'EZK 40-48'],
  ['exilio', 'O Sonho de Nabucodonosor sobre a Árvore', 'O rei que se achou grande e a lição que Deus lhe deu.', 'DAN 4'],
  ['exilio', 'Os Animais e o Carneiro', 'As visões de Daniel sobre os reinos que viriam.', 'DAN 7-8'],
  ['exilio', 'A Noite em que a Babilônia Caiu', 'A escrita na parede e a cova dos leões.', 'DAN 5-6'],
  ['exilio', 'A Oração de Daniel e as Setenta Semanas', 'Daniel lê Jeremias, ora pelo povo e recebe a visão.', 'DAN 9'],
  ['exilio', 'A Última Visão de Daniel', 'A visão do homem vestido de linho e o fim dos tempos.', 'DAN 10-12'],
  ['exilio', 'O Consolo de Isaías', 'A palavra de ânimo a quem está longe de casa: o Servo sofredor, Ciro e a volta a Sião.', 'ISA 40-66', 'O livro se apresenta como de Isaías, filho de Amoz, do século VIII a.C., e esses capítulos falam a quem está no exílio e até nomeiam Ciro (Isaías 44.28; 45.1). Por isso ficam aqui, antes da volta. Os estudiosos discutem como o livro foi composto; é uma escolha de leitura, e não uma tese sobre a autoria.'],

  // ———— A Volta do Exílio ————
  ['retorno', 'O Decreto de Ciro e a Primeira Volta', 'Os judeus voltam com Zorobabel, levantam o altar e lançam o alicerce do Templo.', 'EZR 1-3; PSA 126'],
  ['retorno', 'Ageu e Zacarias', 'Os dois profetas animam o povo a reconstruir o Templo, parado havia anos.', 'HAG 1-2; ZEC 1-14', 'Zacarias 9–14 não traz data; fica junto do resto do livro.'],
  ['retorno', 'O Templo Terminado', 'A oposição dos inimigos, o decreto de Dario e a dedicação do segundo Templo.', 'EZR 4-6'],
  ['retorno', 'Ester', 'A rainha judia que salvou o seu povo na Pérsia.', 'EST 1-10'],
  ['retorno', 'Esdras Volta com a Lei', 'Esdras ensina a lei e corrige os casamentos misturados.', 'EZR 7-10'],
  ['retorno', 'Neemias e os Muros', 'A reconstrução dos muros de Jerusalém e a leitura pública da lei.', 'NEH 1-13'],
  ['retorno', 'Malaquias', 'O último profeta anuncia o mensageiro que prepararia o caminho do Senhor.', 'MAL 1-4'],

  // ———— A Vida de Jesus ————
  ['jesus', 'O Nascimento e a Infância', 'Os anúncios a Zacarias e a Maria, Belém, os pastores, os magos e o menino de doze anos no Templo.', 'LUK 1; MAT 1; LUK 2; MAT 2', 'Cada Evangelho conta um pedaço da infância; os capítulos ficam alternados para seguir a ordem dos fatos.'],
  ['jesus', 'O Verbo, João Batista e o Batismo', 'A Palavra que se fez carne, a pregação no deserto e o batismo no Jordão.', 'JHN 1; MAT 3; LUK 3; MRK 1', 'João 1.19-51 vem depois do batismo e da tentação, mas o capítulo inteiro fica junto do prólogo.'],
  ['jesus', 'A Tentação', 'Quarenta dias no deserto e três tentações.', 'MAT 4'],
  ['jesus', 'Os Primeiros Sinais', 'Caná, a purificação do Templo, Nicodemos e a mulher de Samaria.', 'JHN 2-4'],
  ['jesus', 'Nazaré e Cafarnaum', 'A sinagoga de Nazaré, a pesca maravilhosa e os primeiros conflitos.', 'LUK 4-5; MRK 2'],
  ['jesus', 'O Tanque de Betesda', 'Uma cura no sábado em Jerusalém e a discussão sobre a autoridade de Jesus.', 'JHN 5'],
  ['jesus', 'Os Doze e o Sermão da Planície', 'Jesus escolhe os doze apóstolos e ensina o povo.', 'MRK 3; LUK 6'],
  ['jesus', 'O Sermão do Monte', 'As bem-aventuranças, o Pai Nosso e a casa sobre a rocha.', 'MAT 5-7'],
  ['jesus', 'Milagres em Cafarnaum', 'O leproso, o centurião, a tempestade e o paralítico, em Mateus.', 'MAT 8-9'],
  ['jesus', 'O Filho da Viúva e a Pergunta de João', 'Jesus ressuscita o filho da viúva de Naim e responde aos discípulos de João.', 'LUK 7; MAT 11'],
  ['jesus', 'O Envio dos Doze', 'Jesus manda os discípulos de dois em dois.', 'MAT 10'],
  ['jesus', 'Conflitos e o Sinal de Jonas', 'Sábado, Belzebu e o pedido de um sinal.', 'MAT 12'],
  ['jesus', 'As Parábolas', 'O semeador, o trigo e o joio, a semente de mostarda e o tesouro escondido.', 'LUK 8; MAT 13; MRK 4'],
  ['jesus', 'O Endemoninhado e a Filha de Jairo', 'Jesus liberta o gadareno e ressuscita a menina.', 'MRK 5'],
  ['jesus', 'A Morte de João e a Multiplicação dos Pães', 'Herodes manda matar João; cinco mil comem; Jesus anda sobre o mar.', 'MAT 14; MRK 6; LUK 9', 'Lucas 9 conta também a confissão de Pedro e a transfiguração, que aparecem mais adiante nos outros Evangelhos. O capítulo inteiro fica aqui, onde ele começa.'],
  ['jesus', 'O Pão da Vida', 'Depois dos pães, Jesus diz que é o pão que desceu do céu.', 'JHN 6'],
  ['jesus', 'A Tradição dos Anciãos e a Mulher Cananeia', 'O que contamina de verdade e a fé de uma estrangeira.', 'MAT 15; MRK 7'],
  ['jesus', 'A Confissão de Pedro e a Transfiguração', 'Em Cesareia de Filipe, Pedro diz “Tu és o Cristo”; no monte, Jesus é transfigurado.', 'MAT 16; MRK 8; MAT 17; MRK 9'],
  ['jesus', 'A Vida na Comunidade', 'Quem é o maior, a ovelha perdida e o perdão sem conta.', 'MAT 18'],
  ['jesus', 'A Festa dos Tabernáculos e o Cego de Nascença', 'Jesus ensina em Jerusalém, perdoa a mulher adúltera e cura o cego.', 'JHN 7-10'],
  ['jesus', 'O Caminho para Jerusalém', 'O bom samaritano, Marta e Maria e as parábolas do perdido: a ovelha, a moeda e o filho.', 'LUK 10-17', 'Lucas 10–17 junta ensinos de tempos diferentes; o capítulo todo fica aqui, como o próprio Evangelho o põe, “a caminho de Jerusalém”.'],
  ['jesus', 'Lázaro', 'Jesus ressuscita o amigo que estava morto havia quatro dias.', 'JHN 11'],
  ['jesus', 'Para Jerusalém, pela Última Vez', 'A viúva que insiste, o jovem rico, os trabalhadores da vinha e Zaqueu.', 'LUK 18; MAT 19; MRK 10; MAT 20; LUK 19'],
  ['jesus', 'A Entrada Triunfal e os Dias no Templo', 'Jesus entra em Jerusalém, purifica o Templo e discute com os líderes.', 'JHN 12; MAT 21; MRK 11; LUK 20; MAT 22; MRK 12; MAT 23'],
  ['jesus', 'O Discurso do Monte das Oliveiras', 'Jesus fala do fim do Templo e da sua volta.', 'MAT 24; MRK 13; LUK 21; MAT 25'],
  ['jesus', 'A Última Ceia', 'A ceia, o lava-pés e as palavras de despedida.', 'MAT 26; MRK 14; LUK 22; JHN 13-17', 'Mateus 26, Marcos 14 e Lucas 22 contam também Getsêmani, a prisão e a negação de Pedro. Os capítulos ficam inteiros aqui, onde começam.'],
  ['jesus', 'A Prisão, o Julgamento e a Cruz', 'Getsêmani, o tribunal, a crucificação e a sepultura.', 'JHN 18; MAT 27; MRK 15; LUK 23; JHN 19'],
  ['jesus', 'A Ressurreição', 'O túmulo vazio, o caminho de Emaús, Tomé e Pedro na praia.', 'MAT 28; MRK 16; LUK 24; JHN 20-21'],

  // ———— A Igreja Nasce ————
  ['igreja', 'Pentecostes e os Primeiros Dias da Igreja', 'O Espírito Santo desce, Pedro prega e Estêvão é apedrejado.', 'ACT 1-7'],
  ['igreja', 'Samaria, a Conversão de Paulo e Cornélio', 'O evangelho sai de Jerusalém e chega aos gentios.', 'ACT 8-12'],
  ['igreja', 'A Carta de Tiago', 'Uma carta sobre a fé que se mostra nas obras.', 'JAS 1-5', 'Tiago é das cartas mais antigas segundo muitos estudiosos (c. 45–50), mas outros a datam mais tarde. É uma escolha.'],
  ['igreja', 'A Primeira Viagem Missionária', 'Paulo e Barnabé em Chipre e na Galácia.', 'ACT 13-14'],
  ['igreja', 'A Carta aos Gálatas', 'Paulo defende que somos salvos pela graça, e não pela lei.', 'GAL 1-6', 'A data de Gálatas é discutida (antes ou depois do concílio de Atos 15). Aqui ela fica antes. É uma escolha.'],
  ['igreja', 'O Concílio de Jerusalém e a Segunda Viagem', 'Os apóstolos decidem sobre os gentios; Paulo passa por Filipos, Tessalônica e Atenas.', 'ACT 15-17'],
  ['igreja', 'Corinto', 'Um ano e meio de ensino na cidade, de onde Paulo escreve aos tessalonicenses.', 'ACT 18'],
  ['igreja', 'As Cartas aos Tessalonicenses', 'A esperança da volta do Senhor.', '1TH 1-5; 2TH 1-3'],
  ['igreja', 'Éfeso', 'Dois anos de ensino na escola de Tirano.', 'ACT 19'],
  ['igreja', 'As Cartas aos Coríntios', 'Problemas de uma igreja viva: divisões, dons, amor e ressurreição.', '1CO 1-16; 2CO 1-13'],
  ['igreja', 'Grécia, Trôade e Mileto', 'A despedida de Paulo aos presbíteros de Éfeso.', 'ACT 20'],
  ['igreja', 'A Carta aos Romanos', 'O evangelho da justiça de Deus, escrito em Corinto.', 'ROM 1-16'],
  ['igreja', 'A Prisão de Paulo', 'Paulo preso em Jerusalém, depois em Cesareia, diante de Félix, Festo e Agripa.', 'ACT 21-26'],
  ['igreja', 'A Viagem a Roma', 'A tempestade, o naufrágio em Malta e a chegada a Roma.', 'ACT 27-28'],
  ['igreja', 'As Cartas da Prisão', 'Paulo escreve a Colossos, a Filemom, aos efésios e aos filipenses.', 'COL 1-4; PHM 1; EPH 1-6; PHP 1-4', 'A ordem entre as quatro cartas é uma escolha: os estudiosos a discutem.'],
  ['igreja', 'A Carta aos Hebreus', 'Cristo é maior que os anjos, que Moisés e que o sacerdócio de Arão.', 'HEB 1-13', 'O autor é desconhecido; a carta é de antes de 70, e esta é uma posição aproximada.'],
  ['igreja', 'Pedro, Timóteo e Tito', 'Cartas aos que sofrem e aos que lideram a igreja.', '1PE 1-5; 1TI 1-6; TIT 1-3'],
  ['igreja', 'As Últimas Cartas de Pedro e Paulo', 'Palavras de despedida, perto do fim da vida dos dois.', '2PE 1-3; 2TI 1-4; JUD 1', 'A data de Judas é incerta (c. 65–80). Aqui ele fica ao lado de 2 Pedro, que tem trechos parecidos.'],

  // ———— Os Últimos Escritos ————
  ['fim', 'As Cartas de João', 'Amor, verdade e a comunhão que Deus dá.', '1JN 1-5; 2JN 1; 3JN 1'],
  ['fim', 'O Apocalipse', 'A revelação que João recebeu em Patmos: as sete igrejas, o trono, o cordeiro e a nova Jerusalém.', 'REV 1-22'],
];

// ———— Montagem ————

const SPAN = /^([1-3]?[A-Z]{2,3}) (\*|\d+(?:-\d+)?)$/;

function parse(text: string): { bookId: string; from: number; to: number; rest: boolean }[] {
  return text.split(';').map((piece) => {
    const m = SPAN.exec(piece.trim());
    if (!m) throw new Error(`Trecho inválido: "${piece}"`);
    const [, bookId, range] = m;
    if (range === '*') return { bookId, from: 0, to: 0, rest: true };
    const [from, to] = range.split('-').map(Number);
    return { bookId, from, to: to ?? from, rest: false };
  });
}

function build(): ChronoSection[] {
  const parsed = SOURCES.map((s) => parse(s[3]));
  const used = new Set<string>();
  for (const parts of parsed) for (const p of parts) if (!p.rest) for (let c = p.from; c <= p.to; c++) used.add(`${p.bookId} ${c}`);
  return SOURCES.map(([group, title, summary, , note], i) => {
    const parts: ChronoPart[] = [];
    for (const p of parsed[i]) {
      if (!p.rest) {
        parts.push({ bookId: p.bookId, from: p.from, to: p.to });
        continue;
      }
      // “o que sobrar do livro”: junta os capítulos que nenhuma seção pediu, em trechos contínuos
      const book = findBook(p.bookId)!;
      let start = 0;
      for (let c = 1; c <= book.chapters + 1; c++) {
        const free = c <= book.chapters && !used.has(`${p.bookId} ${c}`);
        if (free && !start) start = c;
        if (!free && start) {
          parts.push({ bookId: p.bookId, from: start, to: c - 1 });
          start = 0;
        }
      }
    }
    return { n: i + 1, group, title, summary, note, parts };
  });
}

/** As seções, na ordem da leitura. */
export const CHRONO_SECTIONS: ChronoSection[] = build();

export interface ChronoChapter {
  bookId: string;
  chapter: number;
  /** Posição na leitura, de 0 a 1.188. */
  index: number;
  /** Número da seção (1 a N). */
  section: number;
}

/** Os 1.189 capítulos, na ordem cronológica. */
export const CHRONO_CHAPTERS: ChronoChapter[] = (() => {
  const out: ChronoChapter[] = [];
  for (const s of CHRONO_SECTIONS) {
    for (const p of s.parts) for (let c = p.from; c <= p.to; c++) out.push({ bookId: p.bookId, chapter: c, index: out.length, section: s.n });
  }
  return out;
})();

const INDEX = new Map(CHRONO_CHAPTERS.map((c) => [`${c.bookId} ${c.chapter}`, c.index]));

/** Posição de um capítulo na ordem cronológica (0 a 1.188), ou -1 se o capítulo não existe. */
export const chronoIndex = (bookId: string, chapter: number): number => INDEX.get(`${bookId} ${chapter}`) ?? -1;

/** O capítulo vizinho na ordem cronológica (-1 anterior, 1 próximo), ou null nas pontas. */
export function chronoNeighbour(bookId: string, chapter: number, direction: 1 | -1): ChronoChapter | null {
  const i = chronoIndex(bookId, chapter);
  return i < 0 ? null : (CHRONO_CHAPTERS[i + direction] ?? null);
}

/** A seção de um capítulo. */
export function chronoSectionOf(bookId: string, chapter: number): ChronoSection | null {
  const i = chronoIndex(bookId, chapter);
  return i < 0 ? null : CHRONO_SECTIONS[CHRONO_CHAPTERS[i].section - 1];
}

/** Quantos capítulos tem uma seção. */
export const sectionSize = (s: ChronoSection): number => s.parts.reduce((sum, p) => sum + (p.to - p.from + 1), 0);

/** Os trechos de uma seção escritos como “Gn 1–11; Jó 1–42”. */
export function sectionRefs(s: ChronoSection): string {
  return s.parts
    .map((p) => {
      const abbrev = BOOKS.find((b) => b.id === p.bookId)?.abbrev ?? p.bookId;
      return p.from === p.to ? `${abbrev} ${p.from}` : `${abbrev} ${p.from}–${p.to}`;
    })
    .join('; ');
}

/** O primeiro capítulo de uma seção. */
export const sectionStart = (s: ChronoSection): ChronoPart => s.parts[0];
