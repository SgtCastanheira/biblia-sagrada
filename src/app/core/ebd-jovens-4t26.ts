import type { IbucLesson } from './teaching';

/**
 * EBD — apoio ao professor da classe de Jovens no 4º trimestre de 2026: a carta de Paulo aos Filipenses.
 * Texto próprio (escrito a partir da Bíblia e de obras de referência); da revista, só o tema de cada lição serve de guia.
 */
const BASE = { classes: ['jovens'], quarter: '2026-4' };

export const EBD_JOVENS_4T26: IbucLesson[] = [
  {
    ...BASE,
    number: 1,
    id: 'jovens-4t26-01-carta-de-alegria',
    title: 'Uma carta de alegria escrita na prisão',
    theme: 'Paulo, preso, escreve a uma igreja amada para agradecer, orar e confirmar que Deus termina o que começa',
    refs: 'Fp 1.1-11; At 16.11-40',
    memoryVerse: 'Fp 1.6',
    reminders: [
      'Leia **Fp 1** de uma vez e depois **At 16.11-40**: a carta só se entende com a história da igreja de Filipos.',
      'Conte as vezes em que aparecem “alegria”, “alegrar-se” e “regozijar-se” na carta toda: é a palavra-chave. Leve o número anotado.',
      'Leve um mapa do Mediterrâneo (ou use o do app) para mostrar Filipos, na Macedônia, e Roma, onde Paulo estava preso.',
    ],
    opening:
      'Pergunte: “Qual foi a última mensagem que você recebeu que fez o seu dia melhorar?”. Deixe contarem. Depois diga: **Filipenses é a carta mais alegre do Novo Testamento, e foi escrita por um homem preso, acorrentado a um soldado romano**. Pergunte: “Como é possível?”. Esse é o assunto do trimestre.',
    curiosities: [
      { title: 'Uma igreja nascida numa cadeia', text: 'A igreja de Filipos nasceu da primeira pregação de Paulo na Europa ([[At 16.9-12]]): Lídia abriu o coração ([[At 16.14]]), uma jovem escrava foi libertada ([[At 16.16-18]]) e o carcereiro se converteu depois de um terremoto ([[At 16.25-34]]). Agora, quem estava preso era Paulo de novo.' },
      { title: 'Uma colônia de Roma', text: 'Filipos era uma **colônia romana**: os seus moradores tinham os direitos de cidadãos de Roma ([[At 16.12]]). Paulo vai usar isso na carta, quando falar da cidadania do céu ([[Fp 3.20]]).' },
      { title: 'Bispos e diáconos', text: 'A carta é dirigida “a todos os santos... com os bispos e diáconos” ([[Fp 1.1]]): é o único texto de Paulo a uma igreja que menciona os líderes na saudação.' },
      { title: 'Deus termina o que começa', text: 'A confiança de Paulo não está nos filipenses, mas em Deus: ele **começou a boa obra** e a “aperfeiçoará até o dia de Cristo Jesus” ([[Fp 1.6]]).' },
    ],
    context:
      'Paulo escreve da prisão, provavelmente em **Roma**, por volta dos anos 60–62 d.C. ([[At 28.30-31]]; [[Fp 1.13]]). Os filipenses lhe enviaram uma oferta por meio de **Epafrodito** ([[Fp 4.18]]), e a carta é a sua resposta: agradece, informa como vai, pede unidade e alerta contra falsos mestres. É uma carta de amizade, escrita a quem Paulo ama: “vos retenho em meu coração” ([[Fp 1.7]]).',
    activities: [
      {
        name: 'Contando as alegrias',
        kind: 'dinâmica',
        time: '10 min',
        material: 'Folhas com o texto de Fp 1 e canetas',
        steps: [
          'Em duplas, cada grupo sublinha no capítulo 1 tudo o que Paulo tem para agradecer ou se alegrar, mesmo preso ([[Fp 1.3-5]], [[Fp 1.12-14]], [[Fp 1.18]]).',
          'Pergunte: o que Paulo **não** coloca como motivo de alegria? (Liberdade, conforto, saúde.)',
          'Compare com a lista de vocês: de onde vem a alegria que cada um busca hoje?',
        ],
      },
      {
        name: 'Carta para uma igreja amada',
        kind: 'trabalho em grupo',
        time: '15 min',
        material: 'Papel e caneta',
        steps: [
          'Em grupos, escrevam a saudação de uma carta para a sua igreja, copiando a forma de [[Fp 1.3-8]]: gratidão, oração e confiança.',
          'Cada grupo lê a sua carta.',
          'Conclusão: gratidão e oração pelos outros são o começo de uma comunhão saudável.',
        ],
      },
    ],
    questions: [
      { q: 'Em que situação Paulo estava quando escreveu a carta?', ref: 'Fp 1.13' },
      { q: 'Por que Paulo agradecia a Deus pelos filipenses?', ref: 'Fp 1.3-5' },
      { q: 'Em quem Paulo confia para completar a obra?', ref: 'Fp 1.6' },
      { q: 'Pelo que Paulo ora em relação ao amor dos filipenses?', ref: 'Fp 1.9-11' },
      { q: 'O que significa dizer que Deus “começou” a boa obra em você?' },
    ],
    application:
      'A alegria cristã não depende das circunstâncias. **Esta semana**, escreva uma mensagem de gratidão a alguém que foi parceiro no evangelho na sua vida e mande para essa pessoa.',
    deepen: 'Veja a viagem de Paulo à Europa no mapa [Segunda viagem de Paulo](/mapas/segunda-viagem-de-paulo) e o fim da história no mapa [Viagem a Roma](/mapas/viagem-a-roma).',
  },
  {
    ...BASE,
    number: 2,
    id: 'jovens-4t26-02-vida-digna',
    title: 'Uma vida digna do evangelho',
    theme: 'Viver como cidadãos do céu, firmes e unidos, mesmo no sofrimento',
    refs: 'Fp 1.27-30; Fp 2.1-4',
    memoryVerse: 'Fp 1.27',
    reminders: [
      'Leia **Fp 1.12-30** e **Fp 2.1-4**. Observe como Paulo passa do seu caso (preso) para o caso da igreja (unidade).',
      'Tenha em mãos exemplos reais de unidade e de divisão na vida da juventude da sua igreja, **sem citar nomes**.',
      'Leve papel para a atividade da “cidadania”.',
    ],
    opening:
      'Pergunte: “O que significa ser cidadão de um país?”. Anote: direitos, deveres, documento, orgulho. Depois leia [[Fp 1.27]] e diga: Paulo usa uma palavra que vem da vida **dos cidadãos**, e os filipenses, moradores de uma colônia romana, entendiam bem.',
    curiosities: [
      { title: 'Viver como cidadãos', text: 'A palavra de [[Fp 1.27]] vem de *politeuomai*: portar-se como cidadão. Filipos era orgulhosa da sua cidadania romana; Paulo diz que a cidadania que vale vive **no céu** ([[Fp 3.20]]).' },
      { title: 'Firmes num só espírito', text: 'Paulo pede que estejam “firmes num só espírito, combatendo juntamente” ([[Fp 1.27]]). A imagem é de **soldados lado a lado**, nada solitário.' },
      { title: 'Sofrer por Cristo é graça', text: 'Para Paulo, não só crer, mas também **sofrer por Cristo** foi concedido ([[Fp 1.29]]). A mesma luta que os filipenses viram em Paulo agora enfrentam ([[Fp 1.30]]).' },
      { title: 'Quatro motivos para a unidade', text: 'Em [[Fp 2.1]], Paulo dá quatro razões: o encorajamento em Cristo, o consolo do amor, a comunhão do Espírito e a ternura e compaixão. A unidade vem de uma **experiência comum com Cristo**.' },
    ],
    context:
      'Os filipenses enfrentavam pressão da sociedade romana e, dentro da igreja, o risco de divisão ([[Fp 2.2-4]]; [[Fp 4.2]]). Paulo, mesmo na prisão, mostra que o evangelho avançou por causa da sua cadeia ([[Fp 1.12-14]]) e pede que a igreja viva de modo “digno do evangelho de Cristo”, isto é, **de acordo com o evangelho que professa**: unidade, firmeza e coragem diante dos opositores.',
    activities: [
      {
        name: 'Minha cidadania',
        kind: 'dinâmica',
        time: '10 min',
        material: 'Folha, canetas',
        steps: [
          'Cada um desenha o seu “documento de cidadão do céu”, com nome, data de “naturalização” (conversão) e três deveres.',
          'Em duplas, contem um dever que mais está custando cumprir.',
          'Leia [[Fp 3.20]] e orem um pelo outro.',
        ],
      },
      {
        name: 'Estudo de caso: o grupo dividido',
        kind: 'estudo de caso',
        time: '15 min',
        material: 'Caso escrito: um grupo de jovens se divide por causa de dois líderes que não se falam',
        steps: [
          'Divida em grupos. Cada um lê o caso e [[Fp 2.1-4]] e propõe três atitudes concretas para restaurar a unidade.',
          'Cada grupo apresenta. Pergunte: qual delas exige **humildade**?',
          'Conclua: a unidade começa com o conselho de [[Fp 2.3]]: “nada façais por contenda ou por vanglória, mas com humildade”.',
        ],
      },
    ],
    questions: [
      { q: 'Que palavra Paulo usa em Fp 1.27 e o que ela significa?', ref: 'Fp 1.27' },
      { q: 'Como Paulo descreve a unidade que pede?', ref: 'Fp 2.2' },
      { q: 'O que Paulo diz sobre o sofrimento por Cristo?', ref: 'Fp 1.29-30' },
      { q: 'Quais as quatro razões para a unidade?', ref: 'Fp 2.1' },
      { q: 'O que significa “cada um considere os outros superiores a si mesmo”?', ref: 'Fp 2.3' },
    ],
    application:
      'Há uma pessoa do seu grupo com quem você está distante? **Procure-a esta semana**, tome a iniciativa de uma conversa e peça a Deus humildade para ouvir.',
    deepen: 'Para entender a cidade de Filipos, leia o mapa [Segunda viagem de Paulo](/mapas/segunda-viagem-de-paulo). Para a vida de uma igreja local, veja o verbete [igreja](/dicionario/igreja).',
  },
  {
    ...BASE,
    number: 3,
    id: 'jovens-4t26-03-humildade-de-cristo',
    title: 'A humildade de Cristo: o exemplo supremo',
    theme: 'O hino de Filipenses 2: Cristo se esvaziou, obedeceu até a cruz e foi exaltado',
    refs: 'Fp 2.5-11',
    memoryVerse: 'Fp 2.5',
    reminders: [
      'Leia **Fp 2.5-11** em voz alta, devagar, três vezes. É provavelmente um **hino cristão primitivo**, e merece ser lido como poesia.',
      'Compare com [[Jo 13.1-17]] (o lava-pés) e [[Is 45.22-23]], que Paulo cita no verso 10-11.',
      'Se a turma gosta de música, peça que alguém cante um hino que fale da cruz.',
    ],
    opening:
      'Pergunte: “Quem é a pessoa mais humilde que você conhece? O que ela faz que mostra isso?”. Depois leia [[Fp 2.5]]: “Tende em vós aquele sentimento que houve também em Cristo Jesus”. Diga: Paulo vai mostrar **a humildade mais radical que já existiu**.',
    curiosities: [
      { title: 'Um hino', text: 'Muitos estudiosos veem em [[Fp 2.6-11]] um hino da igreja primitiva, com a forma de uma curva: **desce** (v. 6-8) e **sobe** (v. 9-11). É um dos mais antigos textos cristãos sobre quem é Jesus.' },
      { title: 'Ele se esvaziou', text: 'Cristo “esvaziou-se a si mesmo” ([[Fp 2.7]]): não deixou de ser Deus, mas abriu mão dos seus direitos e **assumiu a forma de servo**.' },
      { title: 'Até à morte de cruz', text: 'A cruz era a morte dos escravos e dos rebeldes. Paulo acrescenta: “e morte de cruz” ([[Fp 2.8]]), o ponto mais baixo possível. Depois dela vem a exaltação.' },
      { title: 'Todo joelho se dobrará', text: 'O verso 10-11 aplica a Jesus o que Isaías disse do Senhor ([[Is 45.23]]): diante dele se dobra **todo joelho**. Chamar Jesus de **Senhor** era dar a ele o nome de Deus.' },
    ],
    context:
      'O hino aparece no meio de um pedido de unidade ([[Fp 2.1-4]]) e serve de **modelo**: se Cristo, sendo Deus, serviu, ninguém tem motivo para se achar acima dos outros. Em Roma, o imperador era chamado “Senhor”, e os filipenses viviam numa colônia romana; confessar “Jesus Cristo é Senhor” ([[Fp 2.11]]) era uma declaração de lealdade que podia custar caro.',
    activities: [
      {
        name: 'Lava-pés',
        kind: 'dramatização',
        time: '10 min',
        material: 'Uma bacia, uma toalha e água morna (opcional)',
        steps: [
          'Leia [[Jo 13.3-5]]. Convide dois voluntários a representar a cena: um lava os pés do outro.',
          'Pergunte aos dois: o que sentiram? E à turma: o que significa para um líder servir?',
          'Conclua ligando a [[Fp 2.7]]: “forma de servo”.',
        ],
      },
      {
        name: 'Descendo e subindo',
        kind: 'trabalho em grupo',
        time: '10 min',
        material: 'Cartolina e canetas',
        steps: [
          'Divida a cartolina em duas colunas: “Desceu” (v. 6-8) e “Subiu” (v. 9-11).',
          'Cada grupo escreve, em palavras simples, cada passo do hino.',
          'Pergunte: o que o texto ensina sobre o caminho de Deus para a glória? (Passa pela humildade.)',
        ],
      },
    ],
    questions: [
      { q: 'Qual era a “forma” de Cristo antes de se esvaziar?', ref: 'Fp 2.6' },
      { q: 'O que significa “esvaziou-se a si mesmo”?', ref: 'Fp 2.7' },
      { q: 'Até onde foi a obediência de Jesus?', ref: 'Fp 2.8' },
      { q: 'O que Deus fez depois?', ref: 'Fp 2.9-11' },
      { q: 'Como o hino é usado por Paulo para falar da vida da igreja?', ref: 'Fp 2.1-5' },
    ],
    application:
      'Jesus não exigiu seus direitos. **Esta semana**, escolha uma situação em que você tem “razão” e abra mão dela para servir alguém. Depois conte a um amigo o que sentiu.',
    deepen: 'Veja a cruz nos mapas da [vida de Jesus](/mapas/vida-de-jesus).',
  },
  {
    ...BASE,
    number: 4,
    id: 'jovens-4t26-04-luz-na-geracao',
    title: 'Brilhar como luzeiros em meio à geração corrompida',
    theme: 'Salvação que se vive: sem murmuração, sem contendas, brilhando no mundo',
    refs: 'Fp 2.12-18',
    memoryVerse: 'Fp 2.15',
    reminders: [
      'Leia **Fp 2.12-18** e **Mt 5.14-16** (a luz do mundo). Note a conexão: o testemunho vem de uma vida visível.',
      'Cuidado com o verso 12: “efetuai a vossa salvação” **não** quer dizer que a salvação se ganha por obras. Leia junto o verso 13 e [[Ef 2.8-10]].',
      'Leve velas pequenas ou lanternas de celular para a atividade.',
    ],
    opening:
      'Apague as luzes (ou feche as cortinas) e acenda uma única lanterna. Pergunte: “Fez diferença?”. Diga: **a luz só tem valor onde há escuridão**. Leia [[Fp 2.15]]: “resplandeceis como luminares no mundo”.',
    curiosities: [
      { title: 'Operai com temor e tremor', text: 'Paulo diz “efetuai a vossa salvação” ([[Fp 2.12]]), isto é, vivam e façam crescer o que receberam, e explica logo: “Deus é o que opera em vós tanto o querer como o efetuar” ([[Fp 2.13]]). A obra é de Deus, e a responsabilidade é nossa.' },
      { title: 'Sem murmurações', text: 'O pedido de [[Fp 2.14]] lembra o povo no deserto, que murmurou contra Deus e Moisés ([[Êx 16.2]]). Paulo quer uma igreja que **não repita o deserto**.' },
      { title: 'Astros no mundo', text: 'A palavra para “luminares” é a das estrelas e dos astros no céu. Paulo pensa em [[Dn 12.3]]: os que conduzem outros à justiça brilham como estrelas.' },
      { title: 'Paulo, uma oferta derramada', text: 'Paulo diz que, mesmo que o seu sangue seja derramado como libação sobre o sacrifício dos filipenses, ele se alegra ([[Fp 2.17]]). Ele vê a própria morte como parte do serviço.' },
    ],
    context:
      'Os filipenses viviam numa sociedade de muitos deuses, imperador divinizado e costumes imorais. Paulo os chama de “geração corrupta e perversa” ([[Fp 2.15]]), uma expressão de [[Dt 32.5]], e pede que sejam **irrepreensíveis e inocentes**. Ele liga isso à mensagem: eles seguram “a palavra da vida” ([[Fp 2.16]]), a luz que mostra o caminho.',
    activities: [
      {
        name: 'Luz na sala escura',
        kind: 'dinâmica',
        time: '10 min',
        material: 'Lanternas de celular ou velas pequenas',
        steps: [
          'Com a sala escura, cada jovem acende a sua luz e diz onde pretende “brilhar” na semana: escola, trabalho, família, rede social.',
          'Leia [[Mt 5.14-16]]. Pergunte: o que faz a luz “sumir”? (Murmuração, mentira, atitude.)',
          'Orem juntos pedindo coragem para serem vistos.',
        ],
      },
      {
        name: 'Detox de murmuração',
        kind: 'debate',
        time: '10 min',
        material: 'Nenhum',
        steps: [
          'Leia [[Fp 2.14]]. Peça que listem os assuntos que mais geram murmuração entre os jovens (igreja, escola, família).',
          'Pergunte: como falar de um problema **sem** murmurar? (Com quem pode ajudar, com respeito, com proposta.)',
          'Cada um escolhe uma situação para “jejuar de murmuração” por uma semana.',
        ],
      },
    ],
    questions: [
      { q: 'Quem opera em nós tanto o querer como o realizar?', ref: 'Fp 2.13' },
      { q: 'Que pedido Paulo faz sobre murmurações e contendas?', ref: 'Fp 2.14' },
      { q: 'Como Paulo descreve a geração em que viviam?', ref: 'Fp 2.15' },
      { q: 'O que a igreja segura enquanto brilha?', ref: 'Fp 2.16' },
      { q: 'O que Paulo quer dizer quando fala em “libação”?', ref: 'Fp 2.17' },
    ],
    application:
      'Você é a única “Bíblia” que algumas pessoas leem. **Escolha um lugar** onde você é a única luz e pense numa atitude concreta de integridade para esta semana.',
    deepen: 'Veja como a luz aparece no ensino de Jesus no mapa do [ministério na Galileia](/mapas/ministerio-na-galileia).',
  },
  {
    ...BASE,
    number: 5,
    id: 'jovens-4t26-05-servos-fieis',
    title: 'Exemplos de servos fiéis: Timóteo e Epafrodito',
    theme: 'Dois homens que serviram sem buscar o que era seu',
    refs: 'Fp 2.19-30',
    memoryVerse: 'Fp 2.20',
    reminders: [
      'Leia **Fp 2.19-30** e **At 16.1-3** (Timóteo) e **Fp 4.18** (a oferta que Epafrodito levou).',
      'Aproveite para falar de **quem serviu você**: um catequista, um pai, um líder. Prepare uma história pessoal curta.',
      'Leve cartões para a atividade de agradecimento.',
    ],
    opening:
      'Pergunte: “Quem foi a pessoa que mais cuidou de você na fé, sem nunca pedir nada em troca?”. Deixe contarem. Diga: a Bíblia tem **dois nomes** que Paulo coloca como modelos de serviço: Timóteo e Epafrodito.',
    curiosities: [
      { title: 'Ninguém igual a Timóteo', text: 'Paulo diz que não tem ninguém “de igual sentimento” que se interesse sinceramente por eles ([[Fp 2.20]]). Os outros, diz, “buscam o que é seu” ([[Fp 2.21]]).' },
      { title: 'Como um filho com o pai', text: 'Timóteo serviu a Paulo “como filho ao pai” no evangelho ([[Fp 2.22]]). Ele era jovem, filho de mãe judia e pai grego ([[At 16.1]]).' },
      { title: 'Quatro títulos de Epafrodito', text: 'Epafrodito é “meu irmão, e cooperador, e companheiro nas lutas, e vosso enviado” ([[Fp 2.25]]). Foi enviado pelos filipenses para levar a oferta e acabou adoecendo.' },
      { title: 'Quase morreu pela obra', text: 'Epafrodito “esteve doente e quase à morte” ([[Fp 2.27]]) e “chegou até as portas da morte” pela obra de Cristo ([[Fp 2.30]]). Paulo pede à igreja: “tende em honra a homens tais como ele” ([[Fp 2.29]]).' },
    ],
    context:
      'Paulo, depois de falar de Cristo, passa a mostrar **como é a humildade na prática**, com pessoas de carne e osso. Os dois homens têm em comum o serviço sem interesse próprio. Timóteo seria enviado a Filipos para saber como a igreja estava, e Epafrodito voltaria antes, porque os filipenses estavam preocupados com a sua doença. Ninguém é exaltado pela posição: Paulo valoriza quem **serve**.',
    activities: [
      {
        name: 'Cartão de gratidão',
        kind: 'dinâmica',
        time: '10 min',
        material: 'Cartões e canetas',
        steps: [
          'Cada jovem escreve um cartão para alguém que serve na igreja sem aparecer (louvor, recepção, limpeza, cozinha).',
          'Leia [[Fp 2.29]] e diga: Paulo manda **honrar** os que servem.',
          'Combinem de entregar os cartões na semana seguinte.',
        ],
      },
      {
        name: 'Quem eu seria?',
        kind: 'debate',
        time: '10 min',
        material: 'Nenhum',
        steps: [
          'Pergunte: a quem você se parece mais, a Timóteo (cuida dos outros com sinceridade) ou ao grupo de quem Paulo diz que “todos buscam o que é seu” ([[Fp 2.21]])?',
          'Peça que cada um diga **uma situação** em que buscou o que era seu.',
          'Conclua: o chamado é imitar o serviço de Cristo ([[Fp 2.5-8]]).',
        ],
      },
    ],
    questions: [
      { q: 'O que Paulo elogia em Timóteo?', ref: 'Fp 2.20-22' },
      { q: 'O que a maioria buscava, segundo Paulo?', ref: 'Fp 2.21' },
      { q: 'Quem era Epafrodito e o que ele fez?', ref: 'Fp 2.25-26' },
      { q: 'Como a igreja deve tratar quem serve com sacrifício?', ref: 'Fp 2.29-30' },
      { q: 'Quem na sua vida é um Timóteo ou um Epafrodito?' },
    ],
    application:
      'Ninguém aparece nos holofotes por servir, mas Deus vê. **Esta semana**, ofereça-se para uma tarefa invisível na sua igreja ou em casa e faça-a sem comentar com ninguém.',
    deepen: 'Conheça o contexto de Timóteo na segunda viagem de Paulo, no mapa [Segunda viagem de Paulo](/mapas/segunda-viagem-de-paulo). Para outros servos fiéis, leia o [Memorial](/memorial).',
  },
  {
    ...BASE,
    number: 6,
    id: 'jovens-4t26-06-falsos-mestres',
    title: 'Guardando-se dos falsos mestres',
    theme: 'A confiança não está na carne, mas em Cristo: cuidado com quem acrescenta algo à cruz',
    refs: 'Fp 3.1-3; Fp 3.17-21',
    memoryVerse: 'Fp 3.3',
    reminders: [
      'Leia **Fp 3.1-3** e **3.17-21**, e [[At 15.1-11]] (a questão dos que exigiam a circuncisão).',
      'Evite transformar a aula em caça a bruxas: o assunto é **a suficiência de Cristo**, e não rotular pessoas.',
      'Leve exemplos atuais de “Cristo + algo” (Cristo + obras, Cristo + posição, Cristo + conquistas) para a dinâmica.',
    ],
    opening:
      'Escreva no quadro: “Cristo + ____”. Pergunte: “O que as pessoas costumam colocar depois do sinal de ‘mais’ para se sentirem aceitas por Deus?”. Anote as respostas. Diga: Paulo avisa os filipenses contra quem faz exatamente isso.',
    curiosities: [
      { title: 'Cães, maus obreiros, falsa circuncisão', text: 'Os judaizantes ensinavam que, para ser salvo, o gentio também precisava ser circuncidado ([[At 15.1]]). Paulo usa palavras duras: “cães”, “maus obreiros” e “falsa circuncisão” ([[Fp 3.2]]).' },
      { title: 'A verdadeira circuncisão', text: 'Paulo responde: “a circuncisão somos nós, que servimos a Deus em espírito, e nos gloriamos em Cristo Jesus, e não confiamos na carne” ([[Fp 3.3]]).' },
      { title: 'Inimigos da cruz', text: 'Em [[Fp 3.18-19]], Paulo chora ao falar dos que vivem como “inimigos da cruz de Cristo”: o seu deus é o ventre, a sua glória, a vergonha.' },
      { title: 'A cidadania do céu', text: 'Contra isso, Paulo lembra: “a nossa pátria está nos céus” ([[Fp 3.20]]), de onde esperamos o Salvador, que transformará o nosso corpo ([[Fp 3.21]]).' },
    ],
    context:
      'A carta tem agora uma virada de tom. Depois de falar de unidade e de servos, Paulo avisa contra os que pregam outro evangelho: um evangelho **“Cristo mais”**. A mesma discussão aparece em Gálatas ([[Gl 5.1-6]]). A resposta é sempre a mesma: a salvação é pela graça, mediante a fé, e a nossa glória é só Cristo.',
    activities: [
      {
        name: 'Cristo + ___',
        kind: 'dinâmica',
        time: '10 min',
        material: 'Quadro e canetas',
        steps: [
          'No quadro, escreva as respostas da abertura (Cristo + obras, + igreja, + dons...).',
          'Leia [[Gl 2.16]] e [[Ef 2.8-9]]. Risque o sinal de “mais” de cada resposta e escreva “Cristo, e só Cristo”.',
          'Converse: por que a mensagem “Cristo + algo” é tão atraente, e tão perigosa?',
        ],
      },
      {
        name: 'Como reconhecer um mestre fiel',
        kind: 'trabalho em grupo',
        time: '15 min',
        material: 'Folhas com [[Fp 3.2-3,18-19]] e [[1Jo 4.1]]',
        steps: [
          'Cada grupo anota critérios para avaliar um ensino: Exalta a cruz? Leva à humildade? Está de acordo com a Escritura?',
          'Pergunte: como testar o que ouvimos na internet, em vídeos ou pregações?',
          'Conclusão: o critério final é a Palavra ([[At 17.11]]).',
        ],
      },
    ],
    questions: [
      { q: 'Quem Paulo chama de “cães” e “maus obreiros”?', ref: 'Fp 3.2' },
      { q: 'Quem é a circuncisão, segundo Paulo?', ref: 'Fp 3.3' },
      { q: 'Como Paulo descreve os inimigos da cruz?', ref: 'Fp 3.18-19' },
      { q: 'Onde está a nossa cidadania?', ref: 'Fp 3.20' },
      { q: 'O que o Senhor Jesus fará com o nosso corpo?', ref: 'Fp 3.21' },
    ],
    application:
      'Examine o que você ouve e lê. **Escolha um conteúdo** que você acompanha com frequência e faça três perguntas: ele exalta Cristo? Está de acordo com a Bíblia? Me leva à santidade e à humildade?',
    deepen: 'Veja como o debate sobre a circuncisão aconteceu na igreja primitiva em [A História da Igreja em Resumo](/artigo/panorama-da-igreja) e na primeira viagem missionária, no mapa [Primeira viagem de Paulo](/mapas/primeira-viagem-de-paulo).',
  },
  {
    ...BASE,
    number: 7,
    id: 'jovens-4t26-07-conhecer-a-cristo',
    title: 'O alvo supremo: conhecer a Cristo',
    theme: 'Paulo troca todas as suas conquistas pelo valor de conhecer a Cristo e corre para o alvo',
    refs: 'Fp 3.4-16',
    memoryVerse: 'Fp 3.13-14',
    reminders: [
      'Leia **Fp 3.4-16** com atenção ao vocabulário de “ganho” e “perda”, como numa conta bancária.',
      'Pense numa pessoa conhecida que “tinha tudo” e disse que Cristo valia mais. Se possível, convide-a para um testemunho curto.',
      'Leve folhas para a atividade do “currículo”.',
    ],
    opening:
      'Peça que cada jovem pense em três coisas que o orgulham (notas, talentos, família, fé, igreja). Depois leia [[Fp 3.4-6]]: o **currículo de Paulo**. Diga: é um currículo impressionante, e agora vem a surpresa.',
    curiosities: [
      { title: 'O currículo de Paulo', text: 'Circuncidado ao oitavo dia, da tribo de Benjamim, hebreu de hebreus, fariseu, perseguidor da igreja e, quanto à lei, irrepreensível ([[Fp 3.5-6]]). Poucos podiam se comparar a ele.' },
      { title: 'Tudo por perda', text: 'Paulo faz uma “contabilidade”: o que era **lucro** passou a ser **perda** por causa de Cristo ([[Fp 3.7]]). Ele considera tudo isso “refugo” ([[Fp 3.8]]), palavra forte (também traduzida por “esterco” ou “lixo”) para dizer que não vale nada perto de Cristo.' },
      { title: 'Conhecê-lo', text: '“Para conhecê-lo, e o poder da sua ressurreição e a participação dos seus sofrimentos” ([[Fp 3.10]]). Conhecer, na Bíblia, é um conhecimento **relacional**, não só de informação.' },
      { title: 'Correndo para o alvo', text: 'Paulo usa a imagem de um corredor: esquece o que ficou para trás, avança para o que está adiante e prossegue “para o alvo” ([[Fp 3.13-14]]).' },
    ],
    context:
      'Paulo dá o seu testemunho pessoal. Antes de conhecer a Cristo, a sua **justiça** vinha da lei; agora ela vem da fé em Cristo ([[Fp 3.9]]). Ele não diz que já chegou: “Não que já a tenha alcançado, ou que seja perfeito” ([[Fp 3.12]]), e esse realismo é consolo para os jovens que sabem que ainda estão a caminho. A vida cristã é uma **corrida**, com a meta já definida pelo próprio Deus.',
    activities: [
      {
        name: 'O meu currículo e a minha perda',
        kind: 'dinâmica',
        time: '10 min',
        material: 'Folhas e canetas',
        steps: [
          'Divida a folha em duas colunas. Na da esquerda, escreva o que o orgulha (como Paulo em Fp 3.5-6).',
          'Na da direita, escreva o que Cristo dá que nenhuma dessas coisas dá: perdão, paz, esperança, propósito.',
          'Leia [[Fp 3.7-8]] e pergunte: o que seria, na sua vida, “considerar perda” por Cristo?',
        ],
      },
      {
        name: 'A corrida da fé',
        kind: 'brincadeira',
        time: '10 min',
        material: 'Um corredor marcado no chão com fita (10 metros)',
        steps: [
          'Em duplas: um corre para o alvo olhando para a frente; o outro, olhando para trás (andando de costas, com cuidado). Quem chega primeiro?',
          'Leia [[Fp 3.13-14]]: “esquecendo-me das coisas que atrás ficam”.',
          'Converse: o que no passado (erros, vitórias) está te impedindo de correr hoje?',
        ],
      },
    ],
    questions: [
      { q: 'Quais as credenciais de Paulo antes de conhecer a Cristo?', ref: 'Fp 3.4-6' },
      { q: 'O que Paulo considerou perda e por quê?', ref: 'Fp 3.7-8' },
      { q: 'De onde vem a justiça que Paulo recebeu?', ref: 'Fp 3.9' },
      { q: 'O que Paulo quer conhecer?', ref: 'Fp 3.10' },
      { q: 'Qual é o “alvo” da corrida cristã?', ref: 'Fp 3.14' },
    ],
    application:
      'O que você tem colocado antes de Cristo? **Escreva uma coisa** que tem ocupado o lugar de conhecer a Cristo e dê, em oração, um passo para colocá-la no lugar certo.',
    deepen: 'Veja a conversão de Paulo e o resto da sua história nos mapas da [primeira viagem](/mapas/primeira-viagem-de-paulo) e da [viagem a Roma](/mapas/viagem-a-roma).',
  },
  {
    ...BASE,
    number: 8,
    id: 'jovens-4t26-08-unidade-e-alegria',
    title: 'Unidade e alegria no Senhor',
    theme: 'Duas mulheres em desacordo, uma igreja que precisa de paz e uma alegria que se escolhe',
    refs: 'Fp 4.1-5',
    memoryVerse: 'Fp 4.4',
    reminders: [
      'Leia **Fp 4.1-5**. É curto, mas cheio: um conflito concreto, um chamado à alegria e uma ordem sobre a moderação.',
      'Não use esta aula para apontar conflitos reais do grupo. Fale de conflito **em geral**.',
      'Leve papel de presente (ou papel colorido) para a atividade.',
    ],
    opening:
      'Pergunte: “Você já esteve num grupo em que duas pessoas importantes não se falavam? Como era o clima?”. Deixe respostas curtas. Depois diga: **a igreja de Filipos tinha dois nomes, citados na carta, num conflito** ([[Fp 4.2]]).',
    curiosities: [
      { title: 'Evódia e Síntique', text: 'Duas mulheres que “trabalharam comigo no evangelho” ([[Fp 4.3]]) estavam em desacordo. Paulo as cita **pelo nome**, na carta lida a toda a igreja, e as exorta a que “sintam o mesmo no Senhor” ([[Fp 4.2]]).' },
      { title: 'O verdadeiro companheiro', text: 'Paulo pede a um “verdadeiro companheiro” que as ajude ([[Fp 4.3]]): resolver conflitos é tarefa da comunidade, não só dos envolvidos.' },
      { title: 'O livro da vida', text: 'Os nomes delas estão “no livro da vida” ([[Fp 4.3]]). Um desentendimento não apaga a salvação, mas atrapalha o testemunho.' },
      { title: 'Alegrai-vos sempre', text: '“Regozijai-vos sempre no Senhor; outra vez digo, regozijai-vos” ([[Fp 4.4]]). Paulo repete, porque a alegria é uma **decisão**, não um sentimento que cai do céu.' },
    ],
    context:
      'Esta é a conclusão do tema da unidade, iniciado em Fp 1.27 e 2.1-4. Agora há um caso concreto. O texto grego de [[Fp 4.5]] pede que a **“moderação”** (ou “amabilidade”, “gentileza”) seja “conhecida de todos os homens”, e acrescenta: “perto está o Senhor”. A alegria e a gentileza são o antídoto para o orgulho e a briga.',
    activities: [
      {
        name: 'Fazendo as pazes',
        kind: 'dramatização',
        time: '10 min',
        material: 'Roteiros curtos (dois jovens em conflito por um motivo simples)',
        steps: [
          'Dois voluntários representam um desentendimento do dia a dia (um grupo de WhatsApp, um mal-entendido na igreja).',
          'A turma sugere como um “verdadeiro companheiro” ajudaria, seguindo [[Fp 4.2-3]].',
          'Repitam a cena com a reconciliação. Pergunte: qual o primeiro passo?',
        ],
      },
      {
        name: 'A alegria que se escolhe',
        kind: 'dinâmica',
        time: '10 min',
        material: 'Papel colorido e canetas',
        steps: [
          'Cada aluno escreve, num papel, três motivos para se alegrar “no Senhor” (não nas circunstâncias).',
          'Leia [[Fp 4.4]] em voz alta, todos juntos.',
          'Troquem os papéis e leiam o do colega como uma oração de gratidão.',
        ],
      },
    ],
    questions: [
      { q: 'Por que Paulo cita Evódia e Síntique pelo nome?', ref: 'Fp 4.2' },
      { q: 'Quem Paulo pede que as ajude?', ref: 'Fp 4.3' },
      { q: 'Onde estão os nomes dos que combateram com Paulo?', ref: 'Fp 4.3' },
      { q: 'O que Paulo pede duas vezes?', ref: 'Fp 4.4' },
      { q: 'O que deve ser conhecido de todas as pessoas?', ref: 'Fp 4.5' },
    ],
    application:
      'Há alguém com quem você não conversa direito? **Dê o primeiro passo** esta semana: uma mensagem, um convite, um pedido de desculpas. A paz do grupo começa pela atitude de um.',
    deepen: 'Veja como as primeiras igrejas lidaram com divisões em [A Igreja Nasce](/artigo/igreja-primitiva) e o verbete [paz](/dicionario/paz).',
  },
  {
    ...BASE,
    number: 9,
    id: 'jovens-4t26-09-paz-de-deus',
    title: 'A paz de Deus guarda o coração',
    theme: 'Em vez de ansiedade, oração com gratidão; em troca, uma paz que guarda como uma sentinela',
    refs: 'Fp 4.6-7',
    memoryVerse: 'Fp 4.6-7',
    reminders: [
      'Leia **Fp 4.6-7** e **Mt 6.25-34** (o ensino de Jesus sobre a ansiedade).',
      'A ansiedade é real e, para alguns jovens, é um problema de saúde. Diga com clareza que **buscar ajuda profissional não é falta de fé**.',
      'Prepare pedaços de papel e um recipiente para a atividade “entregando as preocupações”.',
    ],
    opening:
      'Pergunte: “Qual foi a última coisa que tirou o seu sono?”. Anote algumas respostas no quadro, sem comentar. Depois diga: Paulo, na prisão, diz: **“Não andeis ansiosos por coisa alguma”** ([[Fp 4.6]]). E dá o caminho, não só a ordem.',
    curiosities: [
      { title: 'Uma receita em três palavras', text: 'Oração (falar com Deus), súplica (pedir) e ação de graças (agradecer) ([[Fp 4.6]]). A gratidão está **dentro** do pedido, e muda o tom da oração.' },
      { title: 'Uma sentinela no coração', text: 'A paz de Deus “guardará” os corações ([[Fp 4.7]]): a palavra é usada para **soldados que montam guarda**. Filipos, colônia romana, tinha guarnição. A paz de Deus faz o mesmo no coração e nos pensamentos.' },
      { title: 'A paz que ultrapassa o entendimento', text: 'É uma paz que “excede todo o entendimento” ([[Fp 4.7]]): não depende de a situação melhorar ou de entendermos tudo.' },
      { title: 'Ansiedade na Bíblia', text: 'Jesus fala do assunto em [[Mt 6.25-34]], e Pedro aconselha: “lançando sobre ele toda a vossa ansiedade, porque ele tem cuidado de vós” ([[1Pe 5.7]]).' },
    ],
    context:
      'Paulo, que estava preso, tinha motivos de sobra para a ansiedade: julgamento incerto, saúde, igrejas distantes. Mesmo assim, ele escreve que a resposta é **levar tudo a Deus**. Isso não é pensamento positivo: é **entregar** o que preocupa a Quem pode agir. Ao ler a carta, os filipenses percebiam que Paulo vivia o que ensinava.',
    activities: [
      {
        name: 'Entregando as preocupações',
        kind: 'dinâmica',
        time: '10 min',
        material: 'Papéis pequenos, canetas e uma caixa',
        steps: [
          'Cada jovem escreve em segredo uma preocupação num papel, dobra e coloca na caixa.',
          'Leia [[Fp 4.6-7]] e [[1Pe 5.7]]. Misture os papéis e distribua; cada um lê em silêncio o do colega e ora por ele, sem identificar.',
          'Conclua com uma oração de gratidão pela paz que Deus dá.',
        ],
      },
      {
        name: 'O sentinela',
        kind: 'brincadeira',
        time: '5 min',
        material: 'Nenhum',
        steps: [
          'Um jovem é o “coração”, de olhos fechados; outros, os “pensamentos”, tentam se aproximar fazendo barulho. Um “sentinela” protege.',
          'Pergunte: o que o sentinela fez? Como a paz de Deus faz isso por nós?',
          'Ligue a [[Fp 4.7]].',
        ],
      },
    ],
    questions: [
      { q: 'O que Paulo manda fazer em lugar de ficar ansioso?', ref: 'Fp 4.6' },
      { q: 'Qual o lugar da gratidão na oração?', ref: 'Fp 4.6' },
      { q: 'O que a paz de Deus guarda?', ref: 'Fp 4.7' },
      { q: 'Como Jesus ensinou sobre a ansiedade?', ref: 'Mt 6.25-34' },
      { q: 'Quando é necessário procurar ajuda de um profissional além da oração?' },
    ],
    application:
      'Quando a ansiedade chegar nesta semana, **pare e ore** com os três passos: falar, pedir, agradecer. Anote o que mudou. Se ela for constante, converse com alguém de confiança e procure ajuda.',
    deepen: 'Leia o Salmo 23 em [[Sl 23]] e o verbete [paz](/dicionario/paz).',
  },
  {
    ...BASE,
    number: 10,
    id: 'jovens-4t26-10-pensar-cristao',
    title: 'O pensar cristão: o que ocupa a sua mente?',
    theme: 'Paulo lista oito qualidades para pensar e pede que se pratique o que se aprendeu',
    refs: 'Fp 4.8-9',
    memoryVerse: 'Fp 4.8',
    reminders: [
      'Leia **Fp 4.8-9** e [[Rm 12.2]] (a mente renovada). Os dois textos formam um par.',
      'Pense numa pergunta honesta sobre redes sociais, jogos, séries e música: **o que alimenta ou envenena a mente?** Prepare-se para um debate sem moralismo.',
      'Leve folhas para a atividade da “dieta mental”.',
    ],
    opening:
      'Pergunte: “O que você viu, ouviu ou leu nas últimas 24 horas que ficou na sua cabeça?”. Deixe contarem. Diga: **o que entra, fica**. Paulo diz o que devemos colocar na mente.',
    curiosities: [
      { title: 'Oito qualidades', text: 'Paulo lista: o que é verdadeiro, honesto, justo, puro, amável, de boa fama, virtuoso e digno de louvor ([[Fp 4.8]]). É uma **lista de filtros** para o que escolhemos ver e pensar.' },
      { title: 'Pensar é calcular', text: 'A palavra “pensai” (“nisso pensai”) de [[Fp 4.8]] vem de um termo de **contabilidade**: considerar, avaliar com cuidado. Pensar é uma ação voluntária.' },
      { title: 'Aprender, receber, ouvir, ver', text: 'Em [[Fp 4.9]], Paulo une teoria e prática: o que “aprendestes, e recebestes, e ouvistes, e vistes em mim, isso praticai”. Uma vida que ensina vale tanto quanto uma palavra.' },
      { title: 'A mente renovada', text: 'Para Paulo, a transformação passa pela “renovação da vossa mente” ([[Rm 12.2]]). A mudança começa na mente.' },
    ],
    context:
      'Depois de falar de alegria, gentileza e paz, Paulo chega à **mente**. O cristão não precisa fugir do mundo, mas precisa de critérios. A lista de Fp 4.8 era conhecida também entre os filósofos gregos; Paulo a recebe e a dá novo peso: o que é verdadeiro, bom e belo tem sua fonte em Deus. O final da passagem promete que **o Deus de paz será com os que praticam** ([[Fp 4.9]]).',
    activities: [
      {
        name: 'Dieta mental',
        kind: 'dinâmica',
        time: '10 min',
        material: 'Folhas e canetas',
        steps: [
          'Cada um faz duas colunas: “O que alimenta” e “O que envenena”, com exemplos do que consome (vídeos, músicas, conversas).',
          'Leia [[Fp 4.8]] e marque os itens que passam pelas oito qualidades.',
          'Cada um escolhe **um** item para reduzir e **um** para acrescentar nesta semana.',
        ],
      },
      {
        name: 'Debate: tudo pode?',
        kind: 'debate',
        time: '10 min',
        material: 'Nenhum',
        steps: [
          'Metade da turma defende “assistir/ouvir de tudo, porque sou maduro”; a outra, “escolher com cuidado”.',
          'Depois de três minutos, leia [[1Co 10.23]] e [[Fp 4.8]].',
          'Conclusão: a pergunta não é só “é pecado?”, mas “me edifica?”.',
        ],
      },
    ],
    questions: [
      { q: 'Quais as oito qualidades de Fp 4.8?', ref: 'Fp 4.8' },
      { q: 'O que Paulo quer dizer com “nisso pensai”?', ref: 'Fp 4.8' },
      { q: 'Como Paulo une o aprender e o praticar?', ref: 'Fp 4.9' },
      { q: 'O que acontece com a mente em Romanos 12?', ref: 'Rm 12.2' },
      { q: 'Quais hábitos de consumo você precisa rever?' },
    ],
    application:
      '**Faça um jejum de mídia** de 24 horas (redes sociais, jogos ou séries) esta semana. Use o tempo para ler um capítulo de Filipenses e anote o que mudou na sua mente.',
    deepen: 'Leia o Salmo 119 ([[Sl 119.9-16]]) sobre guardar a Palavra no coração.',
  },
  {
    ...BASE,
    number: 11,
    id: 'jovens-4t26-11-contentamento',
    title: 'Contentamento em toda e qualquer situação',
    theme: 'Paulo aprendeu o segredo de viver bem na fartura e na escassez',
    refs: 'Fp 4.10-13',
    memoryVerse: 'Fp 4.13',
    reminders: [
      'Leia **Fp 4.10-13** e lembre-se de **2Co 11.23-28**, a lista dos sofrimentos de Paulo.',
      'Atenção ao uso de **Fp 4.13**: no contexto, não fala de conquistar tudo, mas de **suportar tudo** com a força de Cristo.',
      'Prepare exemplos de “contentamento” e de “consumismo” da cultura dos jovens.',
    ],
    opening:
      'Pergunte: “Quando você pensa ‘eu estaria feliz se eu tivesse ____’, o que vem?”. Anote no quadro. Depois diga: Paulo viveu nas duas pontas, e diz que **aprendeu** o contentamento ([[Fp 4.11]]).',
    curiosities: [
      { title: 'Aprendi', text: 'Paulo diz: “já aprendi a contentar-me com as circunstâncias em que me encontre” ([[Fp 4.11]]). O contentamento é uma **escola**, não um dom natural.' },
      { title: 'Escassez e abundância', text: 'Ele sabe “passar falta” e “ter abundância”, “tanto em ter fartura, como em passar fome” ([[Fp 4.12]]). O segredo é o mesmo nos dois extremos.' },
      { title: 'O segredo', text: '“Posso todas as coisas naquele que me fortalece” ([[Fp 4.13]]) é a conclusão de uma passagem sobre **suportar** a necessidade ou a fartura, não sobre ter sucesso.' },
      { title: 'Autossuficiente', text: 'A palavra de “contentar-me” era usada pelos filósofos estoicos para o homem “bastante em si”. Paulo a muda: a sua suficiência vem **de Cristo** ([[Fp 4.13]]).' },
    ],
    context:
      'Paulo agradece a oferta dos filipenses, mas faz questão de dizer que **não estava reclamando de falta** ([[Fp 4.10-11]]). Aos olhos do mundo, ele estava preso e sem recursos; aos olhos dele, estava completo. Ele já tinha provado muita escassez ([[2Co 11.27]]) e abundância. A paz dele vinha da relação com Cristo, e não de fora.',
    activities: [
      {
        name: 'Lista de gratidão',
        kind: 'dinâmica',
        time: '10 min',
        material: 'Papel e canetas',
        steps: [
          'Cada jovem escreve dez coisas pelas quais é grato que não custaram dinheiro.',
          'Em duplas, leiam as listas. Pergunte: o que a lista diz sobre aquilo que realmente importa?',
          'Leia [[Fp 4.11-12]] e orem agradecendo.',
        ],
      },
      {
        name: 'Estudo de caso: o celular novo',
        kind: 'estudo de caso',
        time: '10 min',
        material: 'Caso escrito: Lucas quer um celular de última geração e se sente menos que os amigos',
        steps: [
          'Em grupos, leiam o caso e [[Fp 4.11-13]]. Como Paulo aconselharia o Lucas?',
          'Pergunte: qual a diferença entre **querer melhorar** e **viver insatisfeito**?',
          'Conclua: contentamento não é acomodação; é paz no meio de qualquer situação.',
        ],
      },
    ],
    questions: [
      { q: 'O que Paulo aprendeu?', ref: 'Fp 4.11' },
      { q: 'Em quais situações Paulo viveu?', ref: 'Fp 4.12' },
      { q: 'De onde vem a força de Paulo?', ref: 'Fp 4.13' },
      { q: 'Por que Fp 4.13 não é uma promessa de sucesso garantido?' },
      { q: 'Quais comparações com os outros mais te deixam descontente?' },
    ],
    application:
      'Reduza o tempo em que você se compara com os outros. **Esta semana**, a cada vez que pensar “queria ter ___”, responda em voz baixa: “Obrigado, Senhor, por ___”.',
    deepen: 'Leia o Salmo 37 ([[Sl 37.1-11]]).',
  },
  {
    ...BASE,
    number: 12,
    id: 'jovens-4t26-12-generosidade',
    title: 'Generosidade e cuidado com a obra de Deus',
    theme: 'Os filipenses sustentaram Paulo de longe, e Deus promete suprir quem dá',
    refs: 'Fp 4.14-20; 2Co 8.1-5',
    memoryVerse: 'Fp 4.19',
    reminders: [
      'Leia **Fp 4.14-20** e **2Co 8.1-5** (a generosidade dos macedônios, entre eles os filipenses).',
      'Evite transformar a aula em pedido de dinheiro. O assunto é **o coração generoso**, que inclui tempo, talento e oração.',
      'Leve o relatório da ação social ou missionária da igreja, se houver, para mostrar onde a generosidade de todos chega.',
    ],
    opening:
      'Pergunte: “Quem de vocês já recebeu uma ajuda que veio na hora exata?”. Deixe contarem. Diga: Paulo tinha **uma igreja que o sustentou muitas vezes**, e a carta lhes agradece e lhes faz uma promessa.',
    curiosities: [
      { title: 'A única igreja', text: 'Paulo diz que nenhuma outra igreja teve parte com ele em dar e receber, a não ser a de Filipos ([[Fp 4.15]]). Eles o ajudaram em Tessalônica, mais de uma vez ([[Fp 4.16]]).' },
      { title: 'Generosos na pobreza', text: 'Os macedônios, entre eles os filipenses, deram “acima das suas posses” apesar de uma “profunda pobreza” ([[2Co 8.1-3]]). Pediram como favor poder participar.' },
      { title: 'Cheiro suave', text: 'Paulo chama a oferta de “cheiro suave, como sacrifício aceitável e aprazível a Deus” ([[Fp 4.18]]), com a linguagem dos sacrifícios do templo.' },
      { title: 'Deus supre segundo as suas riquezas', text: '“Meu Deus suprirá todas as vossas necessidades segundo as suas riquezas na glória em Cristo Jesus” ([[Fp 4.19]]). A promessa é a quem **deu**, e não a todos de modo geral.' },
    ],
    context:
      'A igreja de Filipos tinha uma parceria **ativa**: enviava ofertas para Paulo mesmo à distância. Epafrodito trouxe a última. Paulo agradece, mas deixa claro que o que mais lhe importa é o **fruto que cresce na conta deles** ([[Fp 4.17]]): a generosidade é um investimento no que Deus faz. A passagem termina com uma doxologia: “a nosso Deus e Pai seja dada glória pelos séculos dos séculos” ([[Fp 4.20]]).',
    activities: [
      {
        name: 'Quem sustenta a obra?',
        kind: 'trabalho em grupo',
        time: '10 min',
        material: 'Papel e canetas',
        steps: [
          'Peça que os grupos listem as maneiras pelas quais podem apoiar a obra de Deus (dinheiro, tempo, oração, talentos, presença).',
          'Cada grupo escolhe **uma** ação concreta da igreja ou do grupo e diz como pode participar.',
          'Leia [[Fp 4.17-18]] e conclua: o que damos sobe como oferta a Deus.',
        ],
      },
      {
        name: 'Doação silenciosa',
        kind: 'dinâmica',
        time: '10 min',
        material: 'Uma caixa e papéis',
        steps: [
          'Cada jovem escreve, sem nome, uma coisa que pode **dar** nesta semana (tempo, objeto, ajuda).',
          'Dobre os papéis e coloque na caixa. O professor lê alguns em voz alta, sem identificar.',
          'Leia [[At 20.35]]: “Coisa mais bem-aventurada é dar do que receber”.',
        ],
      },
    ],
    questions: [
      { q: 'O que os filipenses fizeram por Paulo?', ref: 'Fp 4.15-16' },
      { q: 'Como Paulo chama a oferta?', ref: 'Fp 4.18' },
      { q: 'Qual é a promessa de Deus aos que dão?', ref: 'Fp 4.19' },
      { q: 'Como os macedônios deram, apesar da pobreza?', ref: '2Co 8.1-3' },
      { q: 'De que maneira você pode participar da obra de Deus hoje?' },
    ],
    application:
      'Você tem algo que pode dar, mesmo sem ter muito. **Escolha uma ação** de generosidade (um alimento, uma visita, um tempo de serviço) e faça-a esta semana, sem esperar retorno.',
    deepen: 'Veja como as primeiras igrejas partilhavam em [A Igreja Nasce](/artigo/igreja-primitiva) e como o evangelho chegou à Europa no mapa [Segunda viagem de Paulo](/mapas/segunda-viagem-de-paulo).',
  },
  {
    ...BASE,
    number: 13,
    id: 'jovens-4t26-13-saudacoes-finais',
    title: 'Saudações finais, comunhão e bênçãos',
    theme: 'Paulo termina com saudações e com a graça: até a casa de César tem cristãos',
    refs: 'Fp 4.21-23',
    memoryVerse: 'Fp 4.23',
    reminders: [
      'Leia **Fp 4.21-23** e faça uma **revisão do trimestre**: coloque as 12 lições anteriores no quadro e peça uma frase de cada.',
      'Reserve tempo para **agradecer pelo grupo** e para pensar no próximo trimestre.',
      'Leve cartões para a atividade de saudação final.',
    ],
    opening:
      'Pergunte: “Como vocês terminam uma mensagem para um amigo querido?”. Deixe respostas curtas. Depois leia [[Fp 4.21-23]]: **saudações, nomes e a graça**. Diga: o fim da carta mostra o clima da obra toda.',
    curiosities: [
      { title: 'Saudai a todos os santos', text: 'Paulo pede que saúdem “todos os santos em Cristo Jesus” ([[Fp 4.21]]): cada pessoa conta. Ele mesmo está cercado por “os irmãos que estão comigo”.' },
      { title: 'Os da casa de César', text: 'Entre os que saúdam estão “especialmente os que são da casa de César” ([[Fp 4.22]]): cristãos na **casa do imperador**, provavelmente escravos e funcionários. O evangelho tinha chegado ao centro do poder.' },
      { title: 'A graça, do começo ao fim', text: 'A carta começa com graça ([[Fp 1.2]]) e termina com graça: “A graça do Senhor Jesus Cristo seja com o vosso espírito” ([[Fp 4.23]]).' },
      { title: 'Da prisão à casa de César', text: 'A prisão de Paulo levou o evangelho “a toda a guarda pretoriana” ([[Fp 1.13]]). Deus fez da cadeia um púlpito.' },
    ],
    context:
      'Falar dos que “são da casa de César” ([[Fp 4.22]]) é uma pista de que o evangelho estava se espalhando entre os que trabalhavam para o imperador. Em um mundo em que o imperador era divinizado, havia cristãos servindo no palácio, lembrando que **Jesus é Senhor**. O encerramento da carta lembra que a igreja é uma **comunhão** de pessoas concretas, com nome, rosto e história.',
    activities: [
      {
        name: 'Revisão em cartões',
        kind: 'dinâmica',
        time: '15 min',
        material: '13 papéis, um por lição, fita adesiva',
        steps: [
          'Escreva o tema de cada lição em um papel, e cole-os no quadro fora de ordem.',
          'Peça que a turma os coloque na ordem e diga **uma frase** que ficou de cada um.',
          'Pergunte: qual lição mexeu mais com você?',
        ],
      },
      {
        name: 'Saudações de despedida',
        kind: 'trabalho em grupo',
        time: '10 min',
        material: 'Cartões e canetas',
        steps: [
          'Cada aluno escreve uma saudação para um colega, no estilo de [[Fp 4.21-23]]: o nome, algo que admira e uma bênção.',
          'Entreguem os cartões em silêncio e leiam.',
          'Terminem com a bênção de [[Fp 4.23]].',
        ],
      },
    ],
    questions: [
      { q: 'Quem enviava saudações aos filipenses?', ref: 'Fp 4.21-22' },
      { q: 'Quem eram os que “são da casa de César”?', ref: 'Fp 4.22' },
      { q: 'Com que palavra a carta começa e termina?', ref: 'Fp 4.23' },
      { q: 'Como a prisão de Paulo ajudou o evangelho?', ref: 'Fp 1.12-13' },
      { q: 'Qual o maior aprendizado que você leva do trimestre?' },
    ],
    application:
      'Termine o trimestre com um **compromisso**: escolha o texto de Filipenses que mais falou com você e decore até o fim do ano. Agradeça a Deus pelo grupo e por quem lhe ensinou o evangelho.',
    deepen: 'Veja o fim da história de Paulo no mapa [Viagem a Roma](/mapas/viagem-a-roma) e leia sobre a igreja em Roma em [A Igreja Nasce](/artigo/igreja-primitiva).',
  },
];
