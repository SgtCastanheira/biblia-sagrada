/**
 * Genealogia de Jesus (Mateus 1 e Lucas 3), de Adão até José e Maria, com os reis, os profetas de cada tempo
 * e os ramos laterais mais importantes. Os nomes seguem a grafia da Almeida; quando o Antigo Testamento
 * usa outra forma, ela aparece em "alt".
 */

export interface GenNode {
  name: string;
  /** Forma do nome no Antigo Testamento (ex.: Ozias → Uzias). */
  alt?: string;
  /** Página no Memorial da Fé. */
  person?: string;
  ref?: string;
  note?: string;
  /** Mãe citada na genealogia de Mateus. */
  mother?: { name: string; person?: string };
  king?: boolean;
  /** Rei que Mateus não cita (para formar 3 grupos de 14). */
  omitted?: boolean;
  /** Profetas e personagens do mesmo tempo. */
  contemporaries?: { name: string; person?: string }[];
}

export interface GenSection {
  id: string;
  title: string;
  period: string;
  text: string;
  refs: string;
  /** Linha única (nodes) ou duas linhas paralelas (mt e lk). */
  nodes?: GenNode[];
  mt?: GenNode[];
  lk?: GenNode[];
  branches?: { title: string; items: { name: string; note: string; person?: string; ref?: string }[] };
}

const p = (id: string) => ({ person: id });

export const GENEALOGY: GenSection[] = [
  {
    id: 'adao-noe',
    title: 'De Adão a Noé',
    period: 'Antes do Dilúvio',
    text: 'Dez gerações ligam o primeiro homem a Noé. Gênesis 5 repete um refrão — “e morreu” —, mostrando a consequência do pecado; a exceção é Enoque, que “andou com Deus”. Lucas é o único evangelista que leva a genealogia de Jesus até Adão, “filho de Deus”: Jesus é o Salvador de toda a humanidade.',
    refs: 'Gn 5.1-32; Lc 3.36-38',
    nodes: [
      { name: 'Adão', ...p('adao'), ref: 'Gn 5.1-5', note: 'Criado à imagem de Deus; viveu 930 anos.' },
      { name: 'Sete', ref: 'Gn 4.25-26', note: 'Dado no lugar de Abel. “Então se começou a invocar o nome do Senhor.”' },
      { name: 'Enos', ref: 'Gn 5.6-11' },
      { name: 'Cainã', alt: 'Quenã', ref: 'Gn 5.9-14' },
      { name: 'Maleleel', alt: 'Maalalel', ref: 'Gn 5.12-17' },
      { name: 'Jarede', ref: 'Gn 5.15-20' },
      { name: 'Enoque', ...p('enoque'), ref: 'Gn 5.21-24', note: 'Andou com Deus e foi tomado por Ele.' },
      { name: 'Matusalém', ref: 'Gn 5.25-27', note: 'O homem mais longevo da Bíblia: 969 anos.' },
      { name: 'Lameque', ref: 'Gn 5.28-31' },
      { name: 'Noé', ...p('noe'), ref: 'Gn 5.32', note: 'Salvo na arca com a família.' },
    ],
    branches: {
      title: 'Ramos da família',
      items: [
        { name: 'Caim e Abel', note: 'Os primeiros filhos de Adão e Eva. Caim matou Abel; a sua descendência fundou cidades e inventou ofícios (Gn 4.17-22).', person: 'abel', ref: 'Gn 4.1-16' },
        { name: 'Eva', note: '“Mãe de todos os viventes”. A promessa de Gn 3.15 fala da sua descendência.', person: 'eva', ref: 'Gn 3.15-20' },
      ],
    },
  },
  {
    id: 'sem-abraao',
    title: 'De Sem a Abraão',
    period: 'Depois do Dilúvio',
    text: 'Dos três filhos de Noé, a linha da promessa segue por Sem. De Éber vem, provavelmente, o nome “hebreu”. Nos dias de Faleque “a terra foi repartida” — talvez uma referência à dispersão de Babel. Lucas inclui um segundo Cainã entre Arfaxade e Salá, que não está no texto hebraico de Gênesis, mas aparece na Septuaginta.',
    refs: 'Gn 11.10-26; Lc 3.34-36',
    nodes: [
      { name: 'Sem', ref: 'Gn 11.10-11', note: 'Filho de Noé; os povos semitas descendem dele.' },
      { name: 'Arfaxade', ref: 'Gn 11.12-13' },
      { name: 'Cainã', ref: 'Lc 3.36', note: 'Só em Lucas (e na Septuaginta).' },
      { name: 'Salá', alt: 'Selá', ref: 'Gn 11.14-15' },
      { name: 'Éber', ref: 'Gn 11.16-17', note: 'Origem provável do nome “hebreus”.' },
      { name: 'Faleque', alt: 'Pelegue', ref: 'Gn 10.25', note: 'Nos seus dias, a terra foi repartida.' },
      { name: 'Ragaú', alt: 'Reú', ref: 'Gn 11.18-21' },
      { name: 'Seruque', alt: 'Serugue', ref: 'Gn 11.20-23' },
      { name: 'Naor', ref: 'Gn 11.24-25' },
      { name: 'Tará', alt: 'Terá', ref: 'Gn 11.26-32', note: 'Saiu de Ur com a família e parou em Harã. Servia a outros deuses (Js 24.2).' },
    ],
    branches: {
      title: 'Os outros filhos de Noé',
      items: [
        { name: 'Cam', note: 'Pai de Cuxe, Mizraim (Egito), Pute e Canaã.', ref: 'Gn 10.6' },
        { name: 'Jafé', note: 'Pai dos povos do norte e das ilhas: gregos (Javã), medos (Madai) e outros.', ref: 'Gn 10.2-5' },
      ],
    },
  },
  {
    id: 'abraao-davi',
    title: 'De Abraão a Davi',
    period: 'c. 2000–1010 a.C.',
    text: 'É o primeiro grupo de 14 gerações de Mateus. A promessa feita a Abraão passa por Isaque (e não Ismael), por Jacó (e não Esaú) e por Judá, de quem Jacó profetizou que “não se arredará o cetro” [[Gn 49.10]]. Mateus cita, contra o costume, quatro mulheres na genealogia — três delas estrangeiras ou com histórias de escândalo —, mostrando a graça de Deus.',
    refs: 'Mt 1.1-6; Lc 3.31-34; Rt 4.18-22',
    nodes: [
      { name: 'Abraão', ...p('abraao'), ref: 'Gn 12.1-3', note: 'O pai da fé; a ele foi feita a promessa.' },
      { name: 'Isaque', ...p('isaque'), ref: 'Gn 21.1-3' },
      { name: 'Jacó (Israel)', ...p('jaco'), ref: 'Gn 25.24-26' },
      { name: 'Judá', ...p('juda'), ref: 'Gn 49.8-10', note: 'A tribo real: “o cetro não se arredará de Judá”.' },
      { name: 'Farés', alt: 'Perez', ref: 'Gn 38.27-30', mother: { name: 'Tamar', person: 'tamar' }, note: 'Gêmeo de Zará.' },
      { name: 'Esrom', ref: 'Rt 4.18' },
      { name: 'Arão', alt: 'Rão (Lucas: Arni e Admim)', ref: 'Rt 4.19', note: 'Não é o irmão de Moisés.' },
      { name: 'Aminadabe', ref: 'Rt 4.19-20', note: 'Sua filha Eliseba casou-se com Arão, irmão de Moisés (Êx 6.23).' },
      { name: 'Nasom', ref: 'Nm 1.7', note: 'Príncipe da tribo de Judá no deserto.' },
      { name: 'Salmom', alt: 'Salá (em Lucas)', ref: 'Rt 4.20-21' },
      { name: 'Booz', alt: 'Boaz', person: 'boaz', ref: 'Rt 4.13', mother: { name: 'Raabe', person: 'raabe' }, note: 'O remidor de Rute, em Belém.' },
      { name: 'Obede', ref: 'Rt 4.17', mother: { name: 'Rute', person: 'rute' } },
      { name: 'Jessé', person: 'jesse', ref: '1Sm 16.1', note: 'De Belém. “Do tronco de Jessé sairá um rebento” (Is 11.1).' },
      { name: 'Davi', ...p('davi'), king: true, ref: '2Sm 7.12-16', note: 'O rei a quem Deus prometeu um trono eterno.' },
    ],
    branches: {
      title: 'Ramos da família',
      items: [
        { name: 'Ismael', note: 'Filho de Abraão com Agar; pai de doze príncipes árabes.', ref: 'Gn 17.20' },
        { name: 'Esaú (Edom)', note: 'Irmão gêmeo de Jacó; pai dos edomitas.', ref: 'Gn 36.1' },
        { name: 'Os doze filhos de Jacó', note: 'Rúben, Simeão, Levi, Judá, Dã, Naftali, Gade, Aser, Issacar, Zebulom, José e Benjamim — as doze tribos.', person: 'jose', ref: 'Gn 35.22-26' },
        { name: 'Levi → Moisés e Arão', note: 'Da tribo de Levi vieram Moisés, Arão e os sacerdotes.', person: 'moises', ref: 'Êx 6.16-20' },
      ],
    },
  },
  {
    id: 'davi-exilio',
    title: 'De Davi ao exílio',
    period: 'c. 1010–586 a.C.',
    text: 'Aqui as genealogias se separam. Mateus segue a linha real: os reis de Judá, de Salomão a Jeconias — mas omite quatro reis (Acazias, Joás, Amazias e Jeoaquim) para formar o segundo grupo de 14 gerações. Lucas segue por Natã, outro filho de Davi e Bate-Seba, uma linha de pessoas comuns. Isso importa: Deus amaldiçoou a descendência de Jeconias, dizendo que nenhum filho dele se sentaria no trono [[Jr 22.30]].',
    refs: 'Mt 1.6-11; Lc 3.27-31; 1Cr 3.1-16',
    mt: [
      { name: 'Salomão', ...p('salomao'), king: true, mother: { name: 'Bate-Seba', person: 'bate-seba' }, ref: '1Rs 1.39', contemporaries: [{ name: 'Natã', person: 'nata' }, { name: 'Gade', person: 'gade' }] },
      { name: 'Roboão', ...p('roboao'), king: true, contemporaries: [{ name: 'Aías', person: 'aias' }] },
      { name: 'Abias', ...p('abias'), king: true },
      { name: 'Asafe', alt: 'Asa', ...p('asa'), king: true },
      { name: 'Josafá', ...p('josafa'), king: true, contemporaries: [{ name: 'Elias', person: 'elias' }, { name: 'Micaías', person: 'micaias' }, { name: 'Eliseu', person: 'eliseu' }] },
      { name: 'Jorão', alt: 'Jeorão', ...p('jeorao-de-juda'), king: true },
      { name: 'Acazias', ...p('acazias-de-juda'), king: true, omitted: true },
      { name: 'Joás', ...p('joas-de-juda'), king: true, omitted: true, contemporaries: [{ name: 'Joel (?)', person: 'joel' }] },
      { name: 'Amazias', ...p('amazias'), king: true, omitted: true, contemporaries: [{ name: 'Jonas', person: 'jonas' }] },
      { name: 'Ozias', alt: 'Uzias', ...p('uzias'), king: true, contemporaries: [{ name: 'Amós', person: 'amos' }, { name: 'Oseias', person: 'oseias-profeta' }, { name: 'Isaías', person: 'isaias' }] },
      { name: 'Joatão', alt: 'Jotão', ...p('jotao'), king: true, contemporaries: [{ name: 'Miqueias', person: 'miqueias' }] },
      { name: 'Acaz', ...p('acaz'), king: true, contemporaries: [{ name: 'Isaías', person: 'isaias' }] },
      { name: 'Ezequias', ...p('ezequias'), king: true, contemporaries: [{ name: 'Isaías', person: 'isaias' }, { name: 'Miqueias', person: 'miqueias' }] },
      { name: 'Manassés', ...p('manasses'), king: true, contemporaries: [{ name: 'Naum', person: 'naum' }] },
      { name: 'Amom', ...p('amom'), king: true },
      { name: 'Josias', ...p('josias'), king: true, contemporaries: [{ name: 'Jeremias', person: 'jeremias' }, { name: 'Sofonias', person: 'sofonias' }, { name: 'Hulda', person: 'hulda' }] },
      { name: 'Jeoaquim', ...p('jeoaquim'), king: true, omitted: true, contemporaries: [{ name: 'Habacuque', person: 'habacuque' }, { name: 'Daniel', person: 'daniel' }] },
      { name: 'Jeconias', alt: 'Joaquim', ...p('joaquim'), king: true, note: 'Levado para a Babilônia em 597 a.C.', contemporaries: [{ name: 'Ezequiel', person: 'ezequiel' }] },
    ],
    lk: [
      { name: 'Natã', ref: '2Sm 5.14', note: 'Filho de Davi e Bate-Seba, irmão de Salomão (não é o profeta).' },
      { name: 'Matatá' },
      { name: 'Mená' },
      { name: 'Meleá' },
      { name: 'Eliaquim' },
      { name: 'Jonã' },
      { name: 'José' },
      { name: 'Judá' },
      { name: 'Simeão' },
      { name: 'Levi' },
      { name: 'Matate' },
      { name: 'Jorim' },
      { name: 'Eliézer' },
      { name: 'Josué' },
      { name: 'Er' },
      { name: 'Elmodã' },
      { name: 'Cosão' },
      { name: 'Adi' },
      { name: 'Melqui' },
      { name: 'Neri' },
    ],
  },
  {
    id: 'exilio-jose',
    title: 'Do exílio a José',
    period: 'c. 586 a.C. – séc. I a.C.',
    text: 'As duas listas se encontram em Salatiel e no seu filho Zorobabel, o governador que liderou a volta da Babilônia e reconstruiu o templo. Depois, separam-se de novo até chegar a José. Os nomes deste trecho não aparecem no Antigo Testamento: vinham dos registros de família, que os judeus guardavam com cuidado.',
    refs: 'Mt 1.12-16; Lc 3.23-27; Ed 3.8',
    nodes: [
      { name: 'Salatiel', alt: 'Sealtiel', ref: '1Cr 3.17', note: 'Em Mateus, filho de Jeconias; em Lucas, de Neri — talvez por adoção ou casamento de levirato.' },
      { name: 'Zorobabel', person: 'zorobabel', ref: 'Ag 2.23', note: 'Líder do retorno do exílio. Deus o chamou de “anel de selar”.', contemporaries: [{ name: 'Ageu', person: 'ageu' }, { name: 'Zacarias', person: 'zacarias-profeta' }] },
    ],
    mt: [
      { name: 'Abiúde' },
      { name: 'Eliaquim' },
      { name: 'Azor' },
      { name: 'Sadoque' },
      { name: 'Aquim' },
      { name: 'Eliúde' },
      { name: 'Eleazar' },
      { name: 'Matã' },
      { name: 'Jacó' },
      { name: 'José', person: 'jose-de-nazare', note: '“Marido de Maria, da qual nasceu Jesus.”', ref: 'Mt 1.16' },
    ],
    lk: [
      { name: 'Resa' },
      { name: 'Joanã' },
      { name: 'Jodá' },
      { name: 'Joseque' },
      { name: 'Semei' },
      { name: 'Matatias' },
      { name: 'Maate' },
      { name: 'Nagai' },
      { name: 'Esli' },
      { name: 'Naum' },
      { name: 'Amós' },
      { name: 'Matatias' },
      { name: 'José' },
      { name: 'Janai' },
      { name: 'Melqui' },
      { name: 'Levi' },
      { name: 'Matate' },
      { name: 'Eli', note: 'Para muitos intérpretes, o pai de Maria (José seria seu genro).' },
      { name: 'José', person: 'jose-de-nazare', note: '“Sendo, como se cuidava, filho de José.”', ref: 'Lc 3.23' },
    ],
  },
  {
    id: 'jesus',
    title: 'Jesus, o Cristo',
    period: 'c. 6–4 a.C.',
    text: 'As duas genealogias terminam de modo diferente de todas as outras. Mateus não diz “a José nasceu Jesus”, mas “José, marido de Maria, da qual nasceu Jesus” [[Mt 1.16]]. Lucas escreve “sendo, como se cuidava, filho de José” [[Lc 3.23]]. Jesus foi concebido pelo Espírito Santo na virgem Maria [[Lc 1.35]], cumprindo a promessa de Isaías [[Is 7.14]]. Legalmente, como filho de José, era herdeiro do trono de Davi; por Maria, também era da descendência de Davi segundo a carne [[Rm 1.3]].',
    refs: 'Mt 1.18-25; Lc 1.26-38; Gl 4.4',
    nodes: [
      { name: 'Maria', person: 'maria-mae-de-jesus', ref: 'Lc 1.38', note: '“Eis aqui a serva do Senhor.”' },
      { name: 'JESUS, que se chama Cristo', ref: 'Mt 1.21-23', note: 'Emanuel, Deus conosco: Filho de Deus e Filho de Davi.' },
    ],
  },
];

/** Perguntas frequentes sobre as genealogias. */
export const GENEALOGY_QUESTIONS: { q: string; a: string }[] = [
  {
    q: 'Por que Mateus e Lucas trazem listas diferentes?',
    a: 'Mateus, escrevendo a judeus, começa em Abraão e segue a linha real de Salomão, mostrando Jesus como herdeiro legal do trono de Davi pela família de José. Lucas, escrevendo a gentios, vai até Adão e segue por Natã. A explicação mais antiga (Júlio Africano, séc. III) é o casamento de levirato: um parente se casava com a viúva e o filho era registrado em nome do falecido, de modo que José teria um pai biológico e outro legal. Outra explicação muito aceita é que Lucas dá a genealogia de Maria, e Eli seria o sogro de José.',
  },
  {
    q: 'Por que Mateus fala em “três vezes catorze gerações”?',
    a: 'Mateus organiza a lista em três blocos — de Abraão a Davi, de Davi ao exílio e do exílio a Cristo —, deixando de fora alguns reis (Acazias, Joás, Amazias e Jeoaquim). Nas genealogias judaicas, “gerou” podia significar “foi antepassado de”. Muitos lembram que, em hebraico, as letras do nome Davi (DVD) somam 14: a própria lista apontaria para o Filho de Davi.',
  },
  {
    q: 'Quem são as mulheres citadas por Mateus?',
    a: 'Tamar, Raabe, Rute e Bate-Seba (“a que fora mulher de Urias”), além de Maria. Tamar e Raabe eram cananeias, Rute era moabita, e Bate-Seba era casada com um hitita. Todas têm histórias inesperadas. Já no primeiro capítulo do Novo Testamento, a graça de Deus inclui estrangeiros e pecadores na família do Messias.',
  },
  {
    q: 'Por que a linha de Natã importa?',
    a: 'Por causa do pecado de Jeconias, Deus disse que nenhum dos seus descendentes se sentaria no trono de Davi [[Jr 22.30]]. Jesus é herdeiro legal do trono por José (linha de Salomão e Jeconias), mas não descende fisicamente de Jeconias, porque nasceu da virgem Maria. Se Lucas traz a linha de Maria, por Natã, Jesus é descendente de Davi segundo a carne sem estar debaixo dessa maldição.',
  },
  {
    q: 'Quantas gerações há de Adão a Jesus?',
    a: 'Na lista de Lucas, são cerca de 77 nomes de Jesus até Adão — um número que muitos ligam a 11 vezes 7, a plenitude. As datas exatas de cada geração não são dadas: as genealogias bíblicas querem mostrar a linha da promessa, e não fazer um calendário completo.',
  },
];
