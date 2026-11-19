/**
 * Os nomes do tempo na Bíblia: cronos, kairós e os outros. Código puro (sem Angular), para os testes.
 *
 * Os significados vêm dos verbetes do Strong’s Exhaustive Concordance e das definições de Thayer (grego) e de Brown-Driver-Briggs
 * (hebraico), que são de domínio público, lidos em 18 de novembro de 2026 no biblehub.com e contados com palavras do app. Cada
 * versículo citado foi conferido na página de interlinear dele: só se diz que um verso traz uma palavra quando a página mostra essa
 * palavra naquele verso. `almeida` é como a Almeida do app a traduz ali (o teste confere que o trecho está no versículo).
 */

export interface TimeWordVerse {
  ref: string;
  /** O trecho da Almeida onde a palavra aparece. */
  almeida: string;
  /** Uma observação curta sobre este verso (quando a tradução esconde algo). */
  note?: string;
}

export interface TimeWord {
  id: string;
  lang: 'grego' | 'hebraico';
  /** A palavra na escrita original. */
  script: string;
  /** Como se lê (transliteração usada no app). */
  translit: string;
  /** Número do Strong’s (G5550, H6256). */
  strong: string;
  /** Em poucas palavras. */
  short: string;
  /** O que a palavra quer dizer, com palavras do app. */
  text: string;
  verses: TimeWordVerse[];
}

export const TIME_WORDS: TimeWord[] = [
  {
    id: 'cronos', lang: 'grego', script: 'χρόνος', translit: 'cronos', strong: 'G5550',
    short: 'O tempo que passa',
    text: 'O tempo como duração: o intervalo entre um ponto e outro, o que se conta em dias, anos e séculos. Dele vêm “cronologia” e “cronômetro”. Strong’s o descreve como um espaço de tempo em geral, e o distingue do kairós, que é a ocasião marcada.',
    verses: [
      { ref: 'At 1.7', almeida: 'os tempos ou as épocas', note: 'Cronos e kairós juntos: aqui, “tempos” é cronos.' },
      { ref: '1Ts 5.1', almeida: 'acerca dos tempos e das épocas', note: 'De novo os dois juntos: “tempos” é cronos.' },
      { ref: 'Gl 4.4', almeida: 'plenitude dos tempos', note: 'O grego traz cronos no singular; a Almeida põe “tempos”.' },
      { ref: 'Hb 11.32', almeida: 'me faltará o tempo' },
      { ref: 'Ap 10.6', almeida: 'não haveria mais demora', note: 'A Almeida traduz cronos por “demora”, um sentido que Strong’s registra.' },
    ],
  },
  {
    id: 'kairos', lang: 'grego', script: 'καιρός', translit: 'kairós', strong: 'G2540',
    short: 'O tempo certo',
    text: 'O tempo como ocasião: um momento marcado ou oportuno, que importa pelo que acontece nele, e não por quanto dura. Thayer anota que a tradução grega do Antigo Testamento (a Septuaginta) usa kairós para as palavras hebraicas et e moed.',
    verses: [
      { ref: 'Mc 1.15', almeida: 'O tempo está cumprido' },
      { ref: 'Ef 1.10', almeida: 'plenitude dos tempos', note: 'Aqui o grego traz kairós, no plural.' },
      { ref: '2Co 6.2', almeida: 'tempo aceitável' },
      { ref: 'Ef 5.16', almeida: 'usando bem cada oportunidade' },
      { ref: 'At 1.7', almeida: 'as épocas', note: 'Cronos e kairós juntos: aqui, “épocas” é kairós.' },
      { ref: '1Ts 5.1', almeida: 'das épocas', note: 'Aqui também, “épocas” é kairós.' },
    ],
  },
  {
    id: 'aion', lang: 'grego', script: 'αἰών', translit: 'aion', strong: 'G165',
    short: 'Uma era',
    text: 'O tempo como era: um período longo, com caráter próprio. Por isso a tradução varia entre “século”, “mundo” e “eternidade”. No plural repetido, “os séculos dos séculos” é o modo de dizer para sempre. Strong’s inclui o sentido judaico de período messiânico, presente ou futuro.',
    verses: [
      { ref: 'Mt 28.20', almeida: 'consumação dos séculos' },
      { ref: 'Ef 2.7', almeida: 'séculos vindouros' },
      { ref: 'Hb 1.2', almeida: 'fez também o mundo', note: 'Aqui a Almeida traduz aion por “mundo”.' },
      { ref: 'Ap 10.6', almeida: 'pelos séculos dos séculos' },
    ],
  },
  {
    id: 'hora', lang: 'grego', script: 'ὥρα', translit: 'hora', strong: 'G5610',
    short: 'A hora marcada',
    text: 'Nos léxicos, é a estação do ano, o dia e a hora. Nos Evangelhos vale também como a hora de algo decisivo: Jesus diz que a sua ainda não chegara (Jo 2.4) e, mais tarde, que chegara (Jo 17.1).',
    verses: [
      { ref: 'Jo 2.4', almeida: 'Ainda não é chegada a minha hora' },
      { ref: 'Jo 17.1', almeida: 'é chegada a hora' },
      { ref: 'Rm 13.11', almeida: 'já é hora de despertardes', note: 'Neste verso aparecem kairós (“o tempo”) e hora.' },
    ],
  },
  {
    id: 'et', lang: 'hebraico', script: 'עֵת', translit: 'et', strong: 'H6256',
    short: 'Tempo, ocasião',
    text: 'A palavra mais usada para tempo no hebraico: cerca de trezentas vezes, para o tempo de algo, a ocasião, a estação. É a de “há tempo para todo propósito debaixo do céu”.',
    verses: [{ ref: 'Ec 3.1', almeida: 'há tempo para todo propósito debaixo do céu' }],
  },
  {
    id: 'zeman', lang: 'hebraico', script: 'זְמָן', translit: 'zeman', strong: 'H2165',
    short: 'Tempo marcado',
    text: 'Um tempo fixado de antemão, um prazo. É rara: no hebraico aparece só quatro vezes, em Neemias 2.6, Eclesiastes 3.1 e Ester 9.27 e 9.31. Em Eclesiastes 3.1 vem junto de et: tudo tem o seu zeman, e há et para todo propósito.',
    verses: [
      { ref: 'Ec 3.1', almeida: 'Tudo tem a sua ocasião própria', note: 'Zeman é a “ocasião própria”; et é o “tempo” da segunda metade do verso.' },
      { ref: 'Ne 2.6', almeida: 'certo prazo' },
    ],
  },
  {
    id: 'moed', lang: 'hebraico', script: 'מוֹעֵד', translit: 'moed', strong: 'H4150',
    short: 'Encontro marcado',
    text: 'Vem de uma raiz que quer dizer marcar um encontro: é a hora combinada. Por isso diz também a festa, a assembleia e o lugar do encontro. Em Gênesis 1.14 são as estações que os astros marcam; em Levítico 23.2, as festas do Senhor.',
    verses: [
      { ref: 'Gn 1.14', almeida: 'sinais e para estações' },
      { ref: 'Lv 23.2', almeida: 'As festas fixas do Senhor' },
    ],
  },
  {
    id: 'olam', lang: 'hebraico', script: 'עוֹלָם', translit: 'olam', strong: 'H5769',
    short: 'Tempo sem fim à vista',
    text: 'Vem de uma raiz que quer dizer estar escondido: é o tempo cujo começo ou fim não se enxerga, como o horizonte. Diz o passado remoto e o futuro sem fim, e por isso se traduz por eterno, perpétuo ou para sempre.',
    verses: [
      { ref: 'Sl 90.2', almeida: 'de eternidade a eternidade' },
      { ref: 'Gn 9.12', almeida: 'gerações perpétuas' },
    ],
  },
];

/**
 * Em que versículos cada palavra aparece, conferido em 18 de novembro de 2026 nas páginas de interlinear do biblehub.com (que mostram o
 * número de Strong de cada palavra do verso) e, para Hb 11.32 (cronos), Ne 2.6, Lv 23.2 e Gn 9.12, nas listas de ocorrências dos verbetes de
 * Thayer e de Brown-Driver-Briggs. O app só diz que um versículo traz uma palavra quando ele está aqui, para aquela palavra.
 */
export const TIME_VERIFIED: Record<string, string[]> = {
  cronos: ['Gl 4.4', 'At 1.7', '1Ts 5.1', 'Ap 10.6', 'Hb 11.32', 'Jd 1.18', '1Pe 1.20'],
  kairos: ['Mc 1.15', 'Ef 1.10', 'At 1.7', '1Ts 5.1', 'Rm 13.11', '2Co 6.2', 'Ef 5.16', '1Tm 4.1', '2Tm 4.6', 'Tt 1.3', 'Ap 1.3', 'Ap 12.14'],
  aion: ['Mt 28.20', 'Hb 1.2', 'Ef 2.7', 'Ap 10.6'],
  hora: ['Jo 2.4', 'Jo 17.1', 'Rm 13.11', '1Jo 2.18'],
  et: ['Ec 3.1'],
  zeman: ['Ec 3.1', 'Ne 2.6'],
  moed: ['Gn 1.14', 'Lv 23.2'],
  olam: ['Sl 90.2', 'Gn 9.12'],
};

/** Versículos onde duas palavras aparecem juntas, ou onde o tempo “se completa” por palavras diferentes. */
export interface TimeCompare {
  id: string;
  title: string;
  text: string;
  /** As palavras (ids de TIME_WORDS) e os versículos. */
  words: string[];
  refs: string[];
}

export const TIME_COMPARES: TimeCompare[] = [
  {
    id: 'juntos', title: 'Cronos e Kairós no Mesmo Verso',
    text: 'Atos 1.7 traz “os tempos ou as épocas”, e 1 Tessalonicenses 5.1, “dos tempos e das épocas”. Quem lê só a tradução vê dois sinônimos; no grego são cronos e kairós lado a lado.',
    words: ['cronos', 'kairos'], refs: ['At 1.7', '1Ts 5.1'],
  },
  {
    id: 'cumprido', title: 'Quando o Tempo Se Completou',
    text: 'Gálatas 4.4 fala da plenitude do tempo com cronos; Marcos 1.15 e Efésios 1.10 falam do tempo cumprido e da plenitude dos tempos com kairós. O Novo Testamento usa as duas palavras ao falar do tempo em que Deus agiu em Cristo.',
    words: ['cronos', 'kairos'], refs: ['Gl 4.4', 'Mc 1.15', 'Ef 1.10'],
  },
  {
    id: 'hora-kairos', title: 'O Tempo e a Hora',
    text: 'Romanos 13.11 junta kairós e hora: conhecer o tempo e saber que já é hora de despertar.',
    words: ['kairos', 'hora'], refs: ['Rm 13.11'],
  },
  {
    id: 'cronos-aion', title: 'O Tempo e os Séculos',
    text: 'Apocalipse 10.6 traz aion (“pelos séculos dos séculos”) e cronos (“demora”) no mesmo versículo.',
    words: ['aion', 'cronos'], refs: ['Ap 10.6'],
  },
  {
    id: 'et-zeman', title: 'Et e Zeman em Eclesiastes',
    text: 'Eclesiastes 3.1 repete a ideia com duas palavras hebraicas: tudo tem o seu zeman (a ocasião própria), e há et (tempo) para todo propósito.',
    words: ['zeman', 'et'], refs: ['Ec 3.1'],
  },
];

/** O cuidado que a conversa popular costuma esquecer. */
export const TIME_CAUTION =
  'A diferença entre cronos e kairós é de ênfase, não uma regra sem exceção: Strong’s distingue as duas palavras, mas o uso varia de verso para verso (em Apocalipse 10.6, por exemplo, é cronos que a Almeida traduz por “demora”). Por isso o app mostra cada palavra em versículos que se podem ler, em vez de dar uma regra pronta.';
