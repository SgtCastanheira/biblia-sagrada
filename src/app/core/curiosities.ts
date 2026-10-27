import { BOOKS } from './books';
export interface VerseRange {
  bookId: string;
  chapter: number;
  from: number;
  to?: number;
}

const BOOK_INDEX = (id: string) => BOOKS.findIndex((b) => b.id === id);

export interface Curiosity {
  id: string;
  icon: string;
  /** Livro ou tema, mostrado acima do título. */
  topic: string;
  question: string;
  answer: string;
  body: string[];
  /** Passos/itens destacados (ex.: a sequência de voltas em Jericó). */
  points?: { label: string; text: string }[];
  closing?: string;
  refs: VerseRange[];
}

export const CURIOSITIES: Curiosity[] = [
  {
    id: 'voltas-em-jerico',
    icon: 'fort',
    topic: 'Josué',
    question: 'Você sabia que Israel não deu apenas 7 voltas em Jericó?',
    answer: 'Foram 13 voltas ao todo, ao longo de 7 dias.',
    body: [
      'Muita gente imagina que o povo rodeou a cidade sete vezes de uma só vez. Mas o plano que Deus deu a Josué durou uma semana inteira:',
    ],
    points: [
      { label: 'Do 1º ao 6º dia', text: '1 volta por dia ao redor da cidade — 6 voltas no total.' },
      { label: 'No 7º dia', text: '7 voltas no mesmo dia, seguidas do toque das trombetas e do grito do povo.' },
      { label: 'Total', text: '6 + 7 = 13 voltas.' },
    ],
    closing: 'Só depois da sétima volta do sétimo dia os muros caíram.',
    refs: [
      { bookId: 'JOS', chapter: 6, from: 3, to: 4 },
      { bookId: 'JOS', chapter: 6, from: 14, to: 15 },
    ],
  },
  {
    id: 'jonas-e-a-baleia',
    icon: 'phishing',
    topic: 'Jonas',
    question: 'Você sabia que a Bíblia não diz que Jonas foi engolido por uma baleia?',
    answer: 'O texto fala de um “grande peixe”.',
    body: [
      'Em hebraico, o livro de Jonas usa “dag gadol”, que significa simplesmente “grande peixe”.',
      'Quando Jesus cita o episódio, o grego usa “kētos”, palavra para um grande animal marinho. A ideia de “baleia” se popularizou por causa de traduções antigas, que usaram esse termo.',
    ],
    refs: [
      { bookId: 'JON', chapter: 1, from: 17 },
      { bookId: 'MAT', chapter: 12, from: 40 },
    ],
  },
  {
    id: 'fruto-proibido',
    icon: 'nutrition',
    topic: 'Gênesis',
    question: 'Você sabia que a Bíblia nunca diz que o fruto proibido era uma maçã?',
    answer: 'O texto diz apenas “fruto”.',
    body: [
      'Gênesis não identifica qual era a fruta da árvore do conhecimento do bem e do mal.',
      'A associação com a maçã surgiu muito depois, na tradição cristã ocidental. Uma das explicações é um jogo de palavras do latim: “malum” pode significar tanto “mal” quanto “maçã”.',
    ],
    refs: [{ bookId: 'GEN', chapter: 3, from: 6 }],
  },
  {
    id: 'reis-magos',
    icon: 'star',
    topic: 'Mateus',
    question: 'Você sabia que a Bíblia não diz que eram três reis magos?',
    answer: 'Não diz quantos eram — nem que eram reis.',
    body: [
      'Mateus fala apenas em “uns magos” vindos do oriente. O número três vem da quantidade de presentes: ouro, incenso e mirra.',
      'Outro detalhe: eles encontraram Jesus “na casa”, e não na manjedoura. Provavelmente a visita aconteceu algum tempo depois do nascimento.',
    ],
    refs: [
      { bookId: 'MAT', chapter: 2, from: 1 },
      { bookId: 'MAT', chapter: 2, from: 11 },
    ],
  },
  {
    id: 'matusalem-e-o-diluvio',
    icon: 'hourglass_empty',
    topic: 'Gênesis',
    question: 'Você sabia que Matusalém morreu no ano do Dilúvio?',
    answer: 'As idades registradas em Gênesis se encaixam exatamente.',
    body: ['Matusalém é a pessoa mais velha registrada na Bíblia. Somando as idades do texto:'],
    points: [
      { label: 'Matusalém gerou Lameque', text: 'aos 187 anos.' },
      { label: 'Lameque gerou Noé', text: 'aos 182 anos.' },
      { label: 'O Dilúvio veio', text: 'quando Noé tinha 600 anos.' },
      { label: '187 + 182 + 600', text: '= 969 anos — exatamente a idade com que Matusalém morreu.' },
    ],
    refs: [
      { bookId: 'GEN', chapter: 5, from: 25, to: 29 },
      { bookId: 'GEN', chapter: 7, from: 6 },
    ],
  },
  {
    id: 'animais-na-arca',
    icon: 'sailing',
    topic: 'Gênesis',
    question: 'Você sabia que nem todos os animais entraram na arca de dois em dois?',
    answer: 'Dos animais limpos e das aves, Noé levou “sete e sete”.',
    body: [
      'O casal de cada espécie valia para os animais impuros. Dos animais limpos e das aves, Deus mandou levar “sete e sete” — expressão que muitos estudiosos entendem como sete pares.',
      'Os animais limpos seriam usados depois do Dilúvio, quando Noé ofereceu sacrifícios a Deus (Gênesis 8:20).',
    ],
    refs: [{ bookId: 'GEN', chapter: 7, from: 2, to: 3 }],
  },
  {
    id: 'jesus-chorou',
    icon: 'water_drop',
    topic: 'João',
    question: 'Você sabia que o versículo mais curto da Bíblia é “Jesus chorou”?',
    answer: 'João 11:35 — apenas duas palavras em português.',
    body: [
      'Jesus chorou diante do túmulo de Lázaro, mesmo sabendo que iria ressuscitá-lo logo em seguida. O versículo mostra a humanidade e a compaixão de Cristo.',
      'Curiosidade extra: no grego original, o versículo mais curto é 1 Tessalonicenses 5:16, “Regozijai-vos sempre”.',
    ],
    refs: [{ bookId: 'JHN', chapter: 11, from: 35 }],
  },
  {
    id: 'salmos-117-e-119',
    icon: 'straighten',
    topic: 'Salmos',
    question: 'Você sabia que o menor e o maior capítulo da Bíblia são quase vizinhos?',
    answer: 'Salmo 117 (2 versículos) e Salmo 119 (176 versículos).',
    body: [
      'Os dois estão separados apenas pelo Salmo 118.',
      'O Salmo 119 é um acróstico: tem 22 estrofes de 8 versículos, uma para cada letra do alfabeto hebraico (22 × 8 = 176).',
    ],
    refs: [
      { bookId: 'PSA', chapter: 117, from: 1, to: 2 },
      { bookId: 'PSA', chapter: 119, from: 176 },
    ],
  },
  {
    id: 'deus-em-ester',
    icon: 'visibility_off',
    topic: 'Ester',
    question: 'Você sabia que o nome de Deus não aparece no livro de Ester?',
    answer: 'Nem uma vez — mas a ação dEle está em toda a história.',
    body: [
      'Ester é o único livro da Bíblia hebraica em que Deus não é mencionado diretamente.',
      'Ainda assim, a providência divina aparece nas “coincidências” da narrativa, como na famosa pergunta de Mardoqueu à rainha:',
    ],
    refs: [{ bookId: 'EST', chapter: 4, from: 14 }],
  },
  {
    id: 'paulo-e-o-cavalo',
    icon: 'bolt',
    topic: 'Atos',
    question: 'Você sabia que a Bíblia não diz que Paulo caiu de um cavalo?',
    answer: 'O texto diz apenas que ele “caiu por terra”.',
    body: [
      'A imagem de Saulo derrubado do cavalo no caminho de Damasco é muito comum na arte, como na famosa pintura de Caravaggio.',
      'Mas o relato de Atos não menciona nenhum animal — só a luz do céu, a queda e a voz de Jesus.',
    ],
    refs: [{ bookId: 'ACT', chapter: 9, from: 3, to: 4 }],
  },
  {
    id: 'moises-na-terra-prometida',
    icon: 'landscape',
    topic: 'Números · Mateus',
    question: 'Você sabia que Moisés não entrou na Terra Prometida… mas apareceu nela séculos depois?',
    answer: 'Na Transfiguração de Jesus.',
    body: [
      'Por causa da desobediência nas águas de Meribá, Deus disse a Moisés que ele veria a terra, mas não entraria nela.',
      'Mais de mil anos depois, Moisés aparece ao lado de Elias, conversando com Jesus no monte da Transfiguração — em Israel.',
    ],
    refs: [
      { bookId: 'NUM', chapter: 20, from: 12 },
      { bookId: 'DEU', chapter: 34, from: 4 },
      { bookId: 'MAT', chapter: 17, from: 3 },
    ],
  },
  {
    id: 'enoque-e-elias',
    icon: 'cyclone',
    topic: 'Gênesis · 2 Reis',
    question: 'Você sabia que a Bíblia registra duas pessoas que não passaram pela morte?',
    answer: 'Enoque e Elias.',
    body: [
      'Enoque “andou com Deus” e “não apareceu mais, porquanto Deus o tomou”.',
      'Elias foi levado ao céu. Um detalhe que pouca gente nota: ele subiu num redemoinho — o carro de fogo apenas o separou de Eliseu.',
    ],
    refs: [
      { bookId: 'GEN', chapter: 5, from: 24 },
      { bookId: '2KI', chapter: 2, from: 11 },
    ],
  },
  {
    id: 'tres-idiomas',
    icon: 'translate',
    topic: 'Daniel · Esdras',
    question: 'Você sabia que a Bíblia foi escrita em três idiomas?',
    answer: 'Hebraico, aramaico e grego.',
    body: [
      'Quase todo o Antigo Testamento está em hebraico, mas alguns trechos estão em aramaico: Daniel 2:4 a 7:28 e partes de Esdras (4:8 a 6:18 e 7:12-26). Em Daniel, o próprio texto avisa a mudança de idioma.',
      'O Novo Testamento foi escrito em grego.',
    ],
    refs: [{ bookId: 'DAN', chapter: 2, from: 4 }],
  },
  {
    id: 'amor-ao-dinheiro',
    icon: 'payments',
    topic: '1 Timóteo',
    question: 'Você sabia que a Bíblia não diz que o dinheiro é a raiz de todos os males?',
    answer: 'O que ela diz é: “o amor ao dinheiro”.',
    body: [
      'A frase costuma ser citada pela metade. Paulo não condena o dinheiro em si, mas a cobiça — o desejo que faz alguém se desviar da fé.',
    ],
    refs: [{ bookId: '1TI', chapter: 6, from: 10 }],
  },
  {
    id: 'davi-ruivo',
    icon: 'face',
    topic: '1 Samuel',
    question: 'Você sabia que Davi era ruivo?',
    answer: 'É o que diz 1 Samuel 16:12.',
    body: [
      'A palavra hebraica “admoni” indica cabelo ou pele avermelhados. É a mesma palavra usada para descrever Esaú ao nascer (Gênesis 25:25).',
    ],
    refs: [{ bookId: '1SA', chapter: 16, from: 12 }],
  },
  {
    id: 'cinco-pedras',
    icon: 'circle',
    topic: '1 Samuel',
    question: 'Você sabia que Davi pegou cinco pedras, mas precisou de apenas uma?',
    answer: 'Uma só pedra derrubou Golias.',
    body: [
      'Antes de enfrentar o gigante, Davi escolheu cinco seixos lisos do ribeiro. Bastou a primeira, lançada com a funda, para acertar a testa de Golias (1 Samuel 17:49).',
    ],
    refs: [{ bookId: '1SA', chapter: 17, from: 40 }],
  },
  {
    id: 'quarenta-dias',
    icon: 'calendar_month',
    topic: 'Atos',
    question: 'Você sabia que Jesus ficou 40 dias com os discípulos depois de ressuscitar?',
    answer: 'Só depois disso Ele subiu ao céu.',
    body: [
      'Nesse período, Jesus apareceu várias vezes aos discípulos, comeu com eles e falou sobre o Reino de Deus.',
      'A ascensão aconteceu 40 dias depois da ressurreição, e o Pentecostes, cerca de 10 dias depois da ascensão.',
    ],
    refs: [{ bookId: 'ACT', chapter: 1, from: 3 }],
  },
  {
    id: 'nomes-dos-discipulos',
    icon: 'badge',
    topic: 'Mateus',
    question: 'Você sabia que o Tiago de um país tem outro nome em outro país?',
    answer: 'Os nomes dos discípulos mudam de língua para língua, mas quase todos vêm do hebraico e do aramaico.',
    body: [
      'Os doze falavam aramaico e tinham nomes hebraicos ou gregos. O Novo Testamento foi escrito em grego, a Bíblia foi para o latim e dali para o português, o espanhol, o italiano, o inglês… Em cada passagem, o nome mudou um pouco, como acontece com qualquer nome que viaja.',
      'O exemplo mais curioso é o de Tiago. Em hebraico, o seu nome é Yaakov, o mesmo de Jacó, o patriarca: no grego do Novo Testamento, os dois são Iákōbos. Em latim virou Iacobus; do latim, Sant’Iago (“São Tiago”) deu Tiago, em português, e Santiago, em espanhol; Giacomo, em italiano; Jacques, em francês; James, em inglês. É tudo o mesmo nome.',
      'Isso não é erro de tradução: é a história da língua. Por isso, quando um irmão de outro país fala do “Giacomo” ou do “James”, está falando do nosso Tiago.',
    ],
    points: [
      { label: 'Tiago', text: 'Hebraico Yaakov (o mesmo nome de Jacó). Espanhol Santiago, italiano Giacomo, francês Jacques, inglês James.' },
      { label: 'João', text: 'Hebraico Yohanan (“Deus é gracioso”). Espanhol Juan, italiano Giovanni, francês Jean, inglês John.' },
      { label: 'Pedro', text: 'Chamava-se Simão (Shimon). Jesus lhe deu o nome aramaico Cefas (“rocha”), traduzido em grego por Pétros. Espanhol Pedro, italiano Pietro, inglês Peter.' },
      { label: 'Tomé', text: 'Vem do aramaico Teoma, “gêmeo”. O evangelho de João o chama também de Dídimo, que é “gêmeo” em grego.' },
      { label: 'Mateus', text: 'Hebraico Matityahu (“dom de Deus”). Era também chamado Levi (Marcos 2.14).' },
      { label: 'Bartolomeu', text: 'Vem do aramaico Bar-Talmai, “filho de Talmai”: é um sobrenome. Muitos estudiosos o identificam com Natanael, de João 1.45-49.' },
      { label: 'Judas Tadeu', text: 'Lucas o chama de Judas, filho de Tiago; Mateus e Marcos, de Tadeu. Judas é Yehudá (“Judá”), nome comum na época, e por isso se acrescentava um apelido.' },
      { label: 'André e Filipe', text: 'São nomes gregos (“viril” e “amigo dos cavalos”), prova de que a Galileia, de onde eles vieram, já tinha forte influência grega.' },
      { label: 'Em resumo', text: 'O mesmo nome muda de forma em cada língua, e quase sempre guarda o seu significado hebraico.' },
    ],
    closing: 'Quase todos os nomes tinham um significado em hebraico. Saber o nome original ajuda a ler a Bíblia com mais atenção, e a entender os irmãos de outras línguas.',
    refs: [{ bookId: 'MAT', chapter: 10, from: 2 }],
  },
  {
    id: 'palavra-trindade',
    icon: 'change_history',
    topic: 'Mateus',
    question: 'Você sabia que a palavra “Trindade” não aparece na Bíblia?',
    answer: 'A palavra não aparece — mas o ensino sim.',
    body: [
      'O termo latino “Trinitas” foi popularizado por Tertuliano, por volta do ano 200, para resumir o que as Escrituras ensinam: um só Deus em três pessoas.',
      'Jesus manda batizar “em nome” — no singular — do Pai, do Filho e do Espírito Santo.',
    ],
    refs: [{ bookId: 'MAT', chapter: 28, from: 19 }],
  },
];

export const findCuriosity = (id: string) => CURIOSITIES.find((c) => c.id === id);

/** As curiosidades na ordem da Bíblia (pelo primeiro texto). */
export const CURIOSITIES_IN_ORDER: Curiosity[] = [...CURIOSITIES]
  .map((c, i) => ({ c, i }))
  .sort((a, b) => {
    const pos = (c: Curiosity) => {
      const r = c.refs[0];
      return r ? BOOK_INDEX(r.bookId) * 1_000_000 + r.chapter * 1000 + r.from : 1e12;
    };
    return pos(a.c) - pos(b.c) || a.i - b.i;
  })
  .map((x) => x.c);
