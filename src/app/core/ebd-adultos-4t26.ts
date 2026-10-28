import type { IbucLesson } from './teaching';

/**
 * EBD — apoio ao professor da classe de Adultos no 4º trimestre de 2026: o livro de Deuteronômio.
 * O texto é próprio (escrito a partir da Bíblia e de obras de referência); da revista, só o tema de cada lição serve de guia.
 * Cada lição ocupa o número da lição do trimestre ("2026-4") e aparece na lição do professor com o mesmo número.
 */
const BASE = { classes: ['adultos'], quarter: '2026-4' };

export const EBD_ADULTOS_4T26: IbucLesson[] = [
  {
    ...BASE,
    number: 1,
    id: 'adultos-4t26-01-livro-da-alianca',
    title: 'O livro da aliança',
    theme: 'Moisés, no fim da vida, lembra ao povo quem é o seu Deus antes de entrar na terra prometida',
    refs: 'Dt 1.1-8; Dt 4.1-14; Dt 29.1-15',
    memoryVerse: 'Dt 6.4-5',
    reminders: [
      'Leia **Dt 1 a 4** antes da aula e marque, no seu texto, as palavras “ouve”, “guarda” e “lembra-te”: elas se repetem no livro inteiro.',
      'Traga um mapa do Oriente Médio (ou use o do app) para mostrar onde o povo estava: **nas campinas de Moabe**, do outro lado do Jordão ([[Dt 1.1,5]]).',
      'Reserve cinco minutos finais para o grupo contar quem terminou de ler o trecho da semana. Sem constranger: quem não leu, conta o que gostaria de entender.',
      'Combine com um aluno a leitura de [[Dt 6.4-5]] em voz alta no início, e com outro a oração final.',
    ],
    opening:
      'Pergunte: “Se você soubesse que ia se despedir de alguém que ama e só pudesse dar um último recado, o que diria?”. Deixe três ou quatro responderem. Depois conte que Deuteronômio é isso: **os últimos discursos de Moisés**, aos 120 anos, ao povo que vai entrar na terra sem ele. É um livro de despedida, de memória e de escolha.',
    curiosities: [
      { title: 'O nome vem do grego', text: '“Deuteronômio” significa **“segunda lei”**. O nome vem da Septuaginta, a Bíblia grega, que traduziu assim a expressão “uma cópia desta lei” de [[Dt 17.18]]. Em hebraico, o livro se chama *Devarim*, “palavras”, por causa da primeira frase: “Estas são as palavras...” ([[Dt 1.1]]).' },
      { title: 'Um tratado entre um rei e o seu povo', text: 'O livro segue o modelo dos tratados da época entre um grande rei e um povo ligado a ele: o **passado em comum** ([[Dt 1.1-4.43|Dt 1–4]]), as **cláusulas** ([[Dt 5.1-26.19|Dt 5–26]]), as **bênçãos e maldições** ([[Dt 27.1-30.20|Dt 27–30]]) e a **sucessão** ([[Dt 31.1-34.12|Dt 31–34]]). Deus se apresenta como o Rei da aliança.' },
      { title: 'O livro mais citado por Jesus', text: 'Na tentação no deserto, Jesus respondeu ao diabo **três vezes** com Deuteronômio ([[Mt 4.4]], [[Mt 4.7]], [[Mt 4.10]]). O Novo Testamento cita o livro dezenas de vezes.' },
      { title: 'Quarenta anos depois', text: 'Os discursos acontecem “no ano quadragésimo, no mês undécimo, no primeiro dia do mês” ([[Dt 1.3]]), contados desde a saída do Egito. Quase todos os que ouviram a Lei no Sinai já tinham morrido: Moisés fala à **geração seguinte**.' },
    ],
    context:
      'O povo está do outro lado do rio Jordão, nas campinas de Moabe, prestes a entrar em Canaã ([[Dt 1.5]]). A geração que saiu do Egito caiu no deserto por causa da incredulidade ([[Nm 14.26-35]]), e agora os filhos precisam **ouvir de novo** a Lei: na terra, haverá cidades, colheitas, vizinhos pagãos e a tentação de esquecer. Moisés não vai entrar com eles ([[Dt 3.23-28]]); por isso, faz de Deuteronômio o seu testamento espiritual. Quem lê hoje deve ter em mente que o centro do livro **não é a lista de regras, e sim o relacionamento**: “Amarás, pois, ao Senhor teu Deus de todo o teu coração” ([[Dt 6.5]]).',
    activities: [
      {
        name: 'A carta de despedida',
        kind: 'dinâmica',
        time: '10 min',
        material: 'Papel e caneta para cada aluno',
        steps: [
          'Peça que cada aluno escreva, em três linhas, o recado mais importante que gostaria de deixar aos filhos, netos ou irmãos mais novos na fé.',
          'Convide três voluntários a ler. Depois pergunte: o que Moisés repete mais vezes? (“Lembra-te”, “ouve”, “não te esqueças”: [[Dt 4.9]], [[Dt 6.12]], [[Dt 8.11]]).',
          'Conclua: despedidas revelam o que de fato importa. Para Moisés, é **lembrar quem Deus é e o que ele fez**.',
        ],
      },
      {
        name: 'Os quatro blocos do livro',
        kind: 'trabalho em grupo',
        time: '15 min',
        material: 'Quatro cartolinas ou folhas grandes, canetas',
        steps: [
          'Divida a turma em quatro grupos e dê a cada um um bloco: [[Dt 1.1-4.43]] (o passado), [[Dt 5.1-26.19|Dt 5–26]] (as cláusulas), [[Dt 27.1-30.20|Dt 27–30]] (bênçãos e maldições) e [[Dt 31.1-34.12|Dt 31–34]] (a sucessão).',
          'Cada grupo lê o começo do seu bloco e escreve numa frase o assunto.',
          'Monte o “mapa” do livro no quadro, na ordem. Mostre que o livro vai do **passado** (o que Deus fez) ao **futuro** (a escolha diante do povo).',
        ],
      },
    ],
    questions: [
      { q: 'Onde estava o povo quando Moisés falou, e por que aquele momento era decisivo?', ref: 'Dt 1.1-5' },
      { q: 'Quantos anos tinham passado desde a saída do Egito?', ref: 'Dt 1.3' },
      { q: 'O que Moisés pede ao povo que nunca se esqueça?', ref: 'Dt 4.9' },
      { q: 'Por que Deus fez aliança com a geração que estava ali, e não só com os pais?', ref: 'Dt 5.2-3' },
      { q: 'O que significa dizer que a Lei é um relacionamento, e não apenas uma lista de regras?', ref: 'Dt 6.5' },
    ],
    application:
      'Deuteronômio começa lembrando e termina escolhendo. **Esta semana**, escreva três coisas que Deus fez por você e que você não quer esquecer, e conte uma delas a alguém da sua casa. Quem lembra do que Deus fez tem mais facilidade para obedecer ao que ele manda.',
    deepen:
      'Veja como o nome “Deuteronômio” nasceu na tradução grega em [A Septuaginta, a Bíblia Grega](/artigo/septuaginta). Para entender o mundo em que a Lei foi guardada e lida depois, leia [Os 400 Anos entre os Testamentos](/artigo/entre-os-testamentos). O livro aparece também no mapa do [Êxodo](/mapas/exodo).',
  },
  {
    ...BASE,
    number: 2,
    id: 'adultos-4t26-02-jornada-no-deserto',
    title: 'Recapitulando a jornada no deserto',
    theme: 'Moisés conta de novo o caminho percorrido, com as vitórias e com o fracasso de Cades-Barneia',
    refs: 'Dt 1.1-46; Dt 2.1-37; Dt 3.1-29',
    memoryVerse: 'Dt 2.7',
    reminders: [
      'Leia **Dt 1 a 3** e, ao lado, [[Nm 13.1-14.45|Nm 13–14]] (os espias), para comparar os dois relatos.',
      'Prepare um mapa simples no quadro: **Horebe → Cades-Barneia → deserto → Moabe**. Quem vê o caminho entende o discurso.',
      'Tenha em mente que a aula fala de **fracasso e de graça** ao mesmo tempo: não transforme a aula em acusação aos alunos.',
    ],
    opening:
      'Desenhe no quadro uma linha com duas marcas: “Horebe” e “Cades-Barneia”. Pergunte: “Quanto tempo vocês acham que o povo levava para ir de uma a outra?”. Depois leia [[Dt 1.2]]: **onze dias**. E o povo levou quarenta anos para chegar à fronteira. Pergunte: “O que aconteceu no meio?”.',
    curiosities: [
      { title: 'Onze dias que viraram quarenta anos', text: 'A viagem entre o Horebe (Sinai) e Cades-Barneia, pelo caminho do monte Seir, era de **onze dias** ([[Dt 1.2]]). A rebelião dos espias transformou isso numa caminhada de quase quatro décadas ([[Dt 2.14]]).' },
      { title: 'Nada lhes faltou', text: 'Moisés lembra que, em todo o deserto, o Senhor abençoou o trabalho do povo e “nada te há faltado” ([[Dt 2.7]]). Os quarenta anos foram castigo para os rebeldes, mas também **cuidado** para os que ficaram.' },
      { title: 'Terra que não era para eles', text: 'Deus mandou o povo **não atacar** Edom, Moabe e Amom: eram terras que ele tinha dado a outros povos, parentes de Israel ([[Dt 2.4-9,19]]). Deus cuida também de outras nações.' },
      { title: 'A cama de ferro de Ogue', text: 'O rei Ogue, de Basã, era o último dos gigantes refains. A sua cama, de ferro, tinha **nove côvados** de comprimento, uns quatro metros ([[Dt 3.11]]).' },
    ],
    context:
      'Moisés refaz o caminho em ordem: a saída do Horebe ([[Dt 1.6-8]]), a organização de chefes e juízes ([[Dt 1.9-18]]), a recusa de entrar em Cades-Barneia por medo dos moradores de Canaã ([[Dt 1.19-46]]), os longos anos de peregrinação ([[Dt 2.1-15]]) e as vitórias recentes sobre **Seom**, rei de Hesbom, e **Ogue**, rei de Basã ([[Dt 2.24-3.11]]), que já deram ao povo as terras a leste do Jordão. A mensagem é que o **mesmo Deus** que venceu esses reis vai agir em Canaã.',
    activities: [
      {
        name: 'O caminho no chão',
        kind: 'dinâmica',
        time: '10 min',
        material: 'Fita crepe e quatro papéis grandes: “Horebe”, “Cades-Barneia”, “Deserto”, “Moabe”',
        steps: [
          'Marque no chão da sala um caminho com fita e coloque os quatro papéis em ordem.',
          'Convide quatro alunos a ficar sobre cada marca enquanto outro lê o trecho de [[Dt 1.6-8]], [[Dt 1.26-33]], [[Dt 2.14]] e [[Dt 2.7]].',
          'Pergunte em cada parada: **o que Deus fez** e **o que o povo fez**?',
        ],
      },
      {
        name: 'Por que eles recuaram?',
        kind: 'debate',
        time: '10 min',
        material: 'Nenhum',
        steps: [
          'Leia [[Dt 1.26-33]]. Peça que a turma liste as desculpas do povo (o medo de que o Senhor os odiasse e a ideia de que os povos de Canaã eram maiores).',
          'Pergunte: que “desculpas” as pessoas dão hoje para não avançar no que Deus mostrou?',
          'Conclua com [[Dt 1.30-31]]: o mesmo Deus que lutou por eles no Egito e carregou o povo “como um homem leva seu filho”.',
        ],
      },
    ],
    questions: [
      { q: 'Quantos dias de viagem separavam o Horebe de Cades-Barneia?', ref: 'Dt 1.2' },
      { q: 'Quais foram as desculpas do povo para não entrar na terra?', ref: 'Dt 1.26-28' },
      { q: 'Como Moisés descreve o cuidado de Deus no deserto?', ref: 'Dt 1.31' },
      { q: 'Por que Deus proibiu o ataque a Edom, Moabe e Amom?', ref: 'Dt 2.4-9' },
      { q: 'O que as vitórias sobre Seom e Ogue ensinam ao povo sobre Canaã?', ref: 'Dt 3.21-22' },
    ],
    application:
      'Há dias em que Deus nos leva por um caminho mais longo, não por maldade, mas porque **precisamos aprender no caminho**. Nesta semana, releia [[Dt 2.7]] e escreva: “Nestes anos, o Senhor não deixou que me faltasse ______”. Agradeça em voz alta.',
    deepen: 'Acompanhe o trajeto no mapa [O Êxodo](/mapas/exodo) e leia [A conquista de Jericó](/mapas/conquista-de-jerico), o passo seguinte da história.',
  },
  {
    ...BASE,
    number: 3,
    id: 'adultos-4t26-03-fidelidade-de-deus',
    title: 'A fidelidade de Deus diante da infidelidade de Israel',
    theme: 'Deus escolheu Israel por amor, não por mérito, e continuou fiel quando o povo falhou',
    refs: 'Dt 7.6-11; Dt 9.1-29; Dt 4.25-31',
    memoryVerse: 'Dt 7.9',
    reminders: [
      'Leia **Dt 7** e **Dt 9** e compare com o episódio do bezerro de ouro em [[Êx 32]].',
      'Esta lição pode tocar em feridas (falhas, afastamentos). Prepare palavras de **graça**: o assunto central é a fidelidade de Deus.',
      'Traga papel e caneta para a atividade das “pedras de memória”.',
    ],
    opening:
      'Pergunte: “Quem aqui já foi escolhido para um time, uma vaga ou um serviço e ficou pensando: por que eu?”. Deixe contarem. Depois leia [[Dt 7.7-8]] e mostre que Deus responde a essa pergunta sobre o povo: **“nem vos escolheu porque fôsseis mais numerosos [...] mas, porque o Senhor vos amou”**.',
    curiosities: [
      { title: 'Não por mérito', text: 'Moisés diz três vezes que a terra não foi dada por causa da justiça do povo: “não é por causa da tua justiça... és povo **de dura cerviz**” ([[Dt 9.5-6]]). A conquista é obra da fidelidade de Deus à promessa feita a Abraão, Isaque e Jacó ([[Dt 9.5]]).' },
      { title: 'O menor de todos os povos', text: 'Israel não foi escolhido por ser grande: “éreis menos em número do que qualquer povo” ([[Dt 7.7]]). O motivo da escolha é o **amor** e a **fidelidade ao juramento**.' },
      { title: 'Quarenta dias de intercessão', text: 'Depois do bezerro de ouro, Moisés se prostrou diante do Senhor “quarenta dias e quarenta noites” e intercedeu pelo povo e por Arão ([[Dt 9.18-20,25-29]]). A fidelidade de Deus teve um intercessor.' },
      { title: 'Mil gerações', text: 'Deus é o Deus fiel que guarda a aliança “até mil gerações” com os que o amam ([[Dt 7.9]]). Mas a mesma frase avisa que ele **retribui diretamente** aos que o rejeitam ([[Dt 7.10]]).' },
    ],
    context:
      'Dentro do tratado, esta parte responde a uma pergunta natural: se Deus é fiel e o povo falha, o que acontece? Moisés lembra o **bezerro de ouro**, a murmuração em Taberá, Massá e Quibrote-Hataavá e a recusa em Cades ([[Dt 9.7-24]]). Em todos esses casos, o povo mereceu o juízo, mas Deus preservou a aliança. Ao mesmo tempo, Moisés avisa que, se o povo se afastar na terra, vai experimentar a dispersão, e que, se **buscar o Senhor com todo o coração**, ele o achará e se lembrará da aliança ([[Dt 4.25-31]]). A promessa de misericórdia está presente até no aviso.',
    activities: [
      {
        name: 'Pedras de memória',
        kind: 'dinâmica',
        time: '10 min',
        material: 'Pedras pequenas ou papéis em formato de pedra; canetas',
        steps: [
          'Entregue uma pedra (ou papel) a cada aluno. Peça que escreva uma vez em que Deus foi fiel mesmo quando a pessoa falhou.',
          'Faça uma “pilha de memória” no centro da sala, como os israelitas fizeram em [[Js 4.1-9]]. Quem quiser conta a sua história em uma frase.',
          'Termine lendo [[Dt 7.9]] em voz alta, juntos.',
        ],
      },
      {
        name: 'Escolhidos para quê?',
        kind: 'estudo de caso',
        time: '10 min',
        material: 'Um caso escrito: “Pedro cresceu na igreja, falhou feio e acha que Deus desistiu dele”',
        steps: [
          'Divida em duplas. Cada dupla lê o caso e responde: o que [[Dt 7.7-9]] diria a Pedro? E [[Dt 4.29-31]]?',
          'Cada dupla diz uma frase de encorajamento que não minimize o erro, mas apresente a fidelidade de Deus.',
          'Lembre: a fidelidade de Deus não é desculpa para a desobediência; é o motivo para voltar.',
        ],
      },
    ],
    questions: [
      { q: 'Por que Deus escolheu Israel, segundo Moisés?', ref: 'Dt 7.7-8' },
      { q: 'O que quer dizer “povo de dura cerviz”?', ref: 'Dt 9.6' },
      { q: 'Qual foi o papel de Moisés depois do pecado do bezerro?', ref: 'Dt 9.18-20' },
      { q: 'O que Deus promete se o povo o buscar de todo o coração?', ref: 'Dt 4.29-31' },
      { q: 'Como a fidelidade de Deus ao povo aparece em Cristo?', ref: 'Rm 3.3-4' },
    ],
    application:
      'Se Deus foi fiel a quem falhou tanto, ninguém tem motivo para fugir dele. **Esta semana**, procure uma pessoa afastada (ou que se sente indigna) e conte a ela uma vez em que você experimentou a fidelidade de Deus. Sem sermão: apenas o seu testemunho.',
    deepen: 'Leia [O Êxodo](/mapas/exodo) e veja onde ficava o monte Horebe. A fidelidade de Deus na história do povo também é o fio de [Os Cativeiros de Israel](/artigo/cativeiros-de-israel).',
  },
  {
    ...BASE,
    number: 4,
    id: 'adultos-4t26-04-chamado-a-obediencia',
    title: 'O chamado à obediência',
    theme: 'Ouvir, guardar e ensinar: a obediência como resposta ao Deus que se revelou e libertou',
    refs: 'Dt 4.1-40; Dt 5.1-33',
    memoryVerse: 'Dt 4.9',
    reminders: [
      'Leia **Dt 4** e **Dt 5**, e compare a lista dos Dez Mandamentos de [[Dt 5.6-21]] com a de [[Êx 20.2-17]].',
      'Leve uma folha com os Dez Mandamentos para cada aluno marcar as diferenças que encontrar (as **razões** do sábado são diferentes nos dois livros).',
      'Reforce: a obediência vem **depois** da libertação, e não antes ([[Dt 5.6]]).',
    ],
    opening:
      'Pergunte: “Qual é a diferença entre um professor que dá ordens e um pai que dá ordens?”. Ouça as respostas e mostre que, em Deuteronômio, **Deus fala como Pai e como Libertador**. Antes de qualquer mandamento, ele diz: “Eu sou o Senhor teu Deus, que te tirei da terra do Egito” ([[Dt 5.6]]).',
    curiosities: [
      { title: 'Nada a acrescentar, nada a tirar', text: 'Moisés avisa que ninguém deve acrescentar nem tirar nada do que ele ordena ([[Dt 4.2]]). A Lei é um **dom completo**, não uma obra em andamento.' },
      { title: 'Deus falou, mas não se viu', text: 'No Horebe, Deus falou do meio do fogo, mas o povo ouviu a voz, mas “não vistes forma alguma” ([[Dt 4.12,15]]). Por isso a proibição de imagens: o Deus de Israel não cabe em estátua.' },
      { title: 'Duas razões para o sábado', text: 'Em [[Êx 20.11]], o sábado lembra a **criação**. Em [[Dt 5.15]], lembra a **libertação do Egito**: o descanso é para todos, inclusive para o servo e a serva. A Lei tem o rosto da graça.' },
      { title: 'Uma sabedoria à vista das nações', text: 'Moisés diz que guardar os mandamentos seria a “sabedoria” e o “entendimento” de Israel aos olhos dos outros povos ([[Dt 4.5-8]]). A obediência é também **testemunho**.' },
    ],
    context:
      'Aqui Moisés passa da história para a **aplicação**. O capítulo 4 é um apelo; o 5 repete os Dez Mandamentos. A gramática é pessoal: “ouve, ó Israel” ([[Dt 5.1]]), e o povo é lembrado de que a aliança não foi feita só com os pais, mas “conosco, sim, com todos nós que hoje estamos aqui vivos” ([[Dt 5.3]]). A geração que agora ouve precisa **assumir** a aliança como sua.',
    activities: [
      {
        name: 'Encontre as diferenças',
        kind: 'trabalho em grupo',
        time: '15 min',
        material: 'Folhas com [[Êx 20.2-17]] e [[Dt 5.6-21]] lado a lado',
        steps: [
          'Divida em trios. Cada trio encontra as diferenças entre os dois textos (sábado, cobiça da mulher e da casa, “como te ordenou”).',
          'Peça que expliquem por que o sábado tem uma razão diferente em Dt 5.15.',
          'Conclusão: a Lei é uma só, mas Moisés a **aplica** à geração que ouve.',
        ],
      },
      {
        name: 'Ouvir e fazer',
        kind: 'brincadeira',
        time: '5 min',
        material: 'Nenhum',
        steps: [
          'O professor dá comandos rápidos (“levante a mão direita”, “toque o ombro do vizinho”) sem demonstrar. Depois dá comandos **com demonstração**, e depois comandos cansativos e longos.',
          'Pergunte: quando fica mais fácil obedecer? (Quando entendemos quem manda, o motivo e a nossa condição.)',
          'Ligue a [[Dt 4.40]]: obedece-se “para que te vá bem”.',
        ],
      },
    ],
    questions: [
      { q: 'Por que não é permitido acrescentar nem tirar nada da Lei?', ref: 'Dt 4.2' },
      { q: 'O que o povo viu e o que ouviu no Horebe?', ref: 'Dt 4.12' },
      { q: 'Qual a ligação entre os Dez Mandamentos e a libertação do Egito?', ref: 'Dt 5.6' },
      { q: 'Como a razão do sábado muda de Êxodo 20 para Deuteronômio 5?', ref: 'Dt 5.15' },
      { q: 'O que Deus deseja do coração do povo?', ref: 'Dt 5.29' },
    ],
    application:
      'Obedecer não é pagar uma dívida: é responder a quem nos libertou. **Escolha um mandamento** que você reconhece que anda negligenciando e conte a um irmão de confiança o passo concreto que vai dar esta semana.',
    deepen: 'Veja a história da libertação que está por trás da Lei em [O Êxodo](/mapas/exodo) e, para o contexto dos mandamentos, o verbete [aliança](/dicionario/alianca).',
  },
  {
    ...BASE,
    number: 5,
    id: 'adultos-4t26-05-grande-mandamento',
    title: 'O grande mandamento',
    theme: 'Amar o Senhor de todo o coração e ensinar isso aos filhos: o Shemá',
    refs: 'Dt 6.1-25; Dt 10.12-13',
    memoryVerse: 'Dt 6.4-5',
    reminders: [
      'Leia **Dt 6** em voz alta, em casa, antes de preparar a aula. É a página mais conhecida do livro.',
      'Traga duas fitas de papel e um pedaço de fita adesiva, para a atividade “nos umbrais”.',
      'Prepare o diálogo de [[Mc 12.28-34]], em que um escriba pergunta qual é o maior mandamento.',
    ],
    opening:
      'Pergunte: “Se alguém lhe perguntasse, em uma frase, qual é a coisa mais importante da Bíblia, o que você diria?”. Depois leia [[Mc 12.28-30]]: Jesus respondeu **com Deuteronômio 6**. O trecho é o “Shemá” (“Ouve”): a oração que todo judeu piedoso recita de manhã e à noite.',
    curiosities: [
      { title: 'A oração mais antiga de Israel', text: 'O Shemá começa em [[Dt 6.4]]: “Ouve, ó Israel, o Senhor nosso Deus é o único Senhor”. Os judeus o recitam até hoje, de manhã e de noite, e é a primeira coisa que ensinam às crianças.' },
      { title: 'Nos umbrais e na testa', text: 'Moisés manda atar as palavras na mão, trazê-las entre os olhos e escrevê-las “nos umbrais de tua casa” ([[Dt 6.8-9]]). Muitos judeus levam isso ao pé da letra: o **tefilin** (caixinhas no braço e na testa) e a **mezuzá** (um estojo com o texto na porta). Jesus fala dos filactérios em [[Mt 23.5]].' },
      { title: 'Todo o coração, a alma e a força', text: 'Amar a Deus com todo o ser. Em Marcos, Jesus acrescenta “de todo o teu entendimento” ([[Mc 12.30]]): o amor inclui o pensar.' },
      { title: 'Deuteronômio como manual dos pais', text: 'O texto não manda só guardar a Lei: manda **ensinar os filhos**, em casa, andando, deitando e levantando ([[Dt 6.7]]), e responder quando perguntarem “Que significam os testemunhos, estatutos e preceitos que o Senhor nosso Deus vos ordenou?” ([[Dt 6.20-25]]).' },
    ],
    context:
      'O capítulo 6 é o centro espiritual do livro. A ordem é simples: **ouvir** (v. 4), **amar** (v. 5), **guardar no coração** (v. 6), **ensinar** (v. 7) e **lembrar** (v. 8-9). Moisés liga isso à ameaça mais perigosa depois da conquista: a prosperidade. Quando o povo tiver “casas cheias de todo o bem”, vai ser tentado a se esquecer do Senhor ([[Dt 6.10-12]]). O amor é a defesa contra o esquecimento.',
    activities: [
      {
        name: 'Nos umbrais da casa',
        kind: 'trabalho manual',
        time: '10 min',
        material: 'Cartões de papel, canetas, fita adesiva',
        steps: [
          'Cada aluno escreve [[Dt 6.5]] em um cartão, com letra bonita, e decora a borda.',
          'Combine onde cada um vai colocar o cartão em casa (porta do quarto, espelho, geladeira).',
          'Leiam juntos em voz alta e orem: “Senhor, que a minha casa seja um lugar onde a tua palavra seja lida e vivida”.',
        ],
      },
      {
        name: 'Como ensinar os filhos?',
        kind: 'debate',
        time: '10 min',
        material: 'Nenhum',
        steps: [
          'Leia [[Dt 6.7]]: ensinar em casa, no caminho, ao deitar e ao levantar.',
          'Pergunte: quais são hoje os “momentos do caminho” em que dá para falar de Deus? (Carro, mesa, tela, oração antes de dormir.)',
          'Peça que cada um compartilhe uma ideia prática. Anote no quadro e peça que escolham uma para esta semana.',
        ],
      },
    ],
    questions: [
      { q: 'Qual é a primeira palavra do Shemá, e por que ela é tão importante?', ref: 'Dt 6.4' },
      { q: 'Quais partes da pessoa Deus quer que ame a ele?', ref: 'Dt 6.5' },
      { q: 'Onde as palavras de Deus deviam estar?', ref: 'Dt 6.6-9' },
      { q: 'Qual perigo Moisés vê na prosperidade?', ref: 'Dt 6.10-12' },
      { q: 'O que os pais devem responder quando o filho perguntar o sentido da Lei?', ref: 'Dt 6.20-25' },
    ],
    application:
      'Amar a Deus é um **verbo de rotina**: ouvir, guardar, ensinar, lembrar. Escolha um momento fixo do dia, de cinco minutos, para ler uma passagem em voz alta em casa, nesta semana.',
    deepen: 'Veja como Jesus citou esse texto em [[Mt 22.34-40]]. Para o ambiente do tempo de Jesus (sinagogas, escribas), veja [Os 400 Anos entre os Testamentos](/artigo/entre-os-testamentos).',
  },
  {
    ...BASE,
    number: 6,
    id: 'adultos-4t26-06-bencaos-da-obediencia',
    title: 'A aliança e as bênçãos da obediência',
    theme: 'A terra boa, a mesa farta e o perigo de esquecer quem deu tudo',
    refs: 'Dt 8.1-20; Dt 11.8-25',
    memoryVerse: 'Dt 8.3',
    reminders: [
      'Leia **Dt 8** inteiro e **Dt 11.8-25**. Perceba como a promessa de bênção é **condicional** (“se obedecerdes”).',
      'Cuide do tom: bênção, em Deuteronômio, é a **vida debaixo da aliança**. Não é fórmula para obter coisas de Deus. Leia também [[Mt 6.31-33]].',
      'Traga um pão simples para a atividade de abertura.',
    ],
    opening:
      'Leve um pedaço de pão e pergunte: “Do que o ser humano vive?”. Depois leia [[Dt 8.3]]: “o homem não vive só de pão, mas de **tudo o que sai da boca do Senhor**”. Mostre que é o versículo que Jesus usou contra a primeira tentação ([[Mt 4.4]]).',
    curiosities: [
      { title: 'O maná como escola', text: 'O maná serviu para ensinar que a vida vem da palavra de Deus ([[Dt 8.3]]). Durante quarenta anos, o povo dependeu de uma provisão diária que não podia estocar ([[Êx 16.19-20]]).' },
      { title: 'Roupas e pés', text: 'Moisés lembra que, em quarenta anos, as roupas do povo não se gastaram e os pés não incharam ([[Dt 8.4]]). A provisão era também **atenção aos detalhes**.' },
      { title: 'Uma terra de sete frutos', text: 'A terra prometida é descrita com trigo, cevada, vinhas, figueiras, romãs, oliveiras e mel ([[Dt 8.8]]): as “sete espécies” da produção de Israel.' },
      { title: 'Quem dá força para enriquecer', text: '“Antes te lembrarás do Senhor teu Deus, porque ele é o que te dá força para adquirires riquezas” ([[Dt 8.18]]). A riqueza não é pecado; esquecer quem a dá é.' },
    ],
    context:
      'O capítulo 8 faz duas advertências simétricas. A primeira é sobre o **passado**: o deserto foi uma escola de humildade e de dependência ([[Dt 8.2-5]]). A segunda é sobre o **futuro**: a abundância pode ensinar ao povo uma mentira, a de que ele mesmo conquistou tudo ([[Dt 8.11-17]]). A bênção é real, mas a base dela é a aliança, não o esforço humano. O capítulo 11 repete: a terra será dada **se** o povo ouvir, e será tirada se esquecer ([[Dt 11.13-17]]).',
    activities: [
      {
        name: 'Do que você vive?',
        kind: 'dinâmica',
        time: '10 min',
        material: 'Papel, canetas',
        steps: [
          'Divida o papel em duas colunas: “O que eu tenho” e “De onde veio”.',
          'Cada aluno lista cinco coisas boas da sua vida (casa, trabalho, família, saúde, fé) e escreve ao lado quem, concretamente, as deu (pessoas, circunstâncias, Deus).',
          'Leia [[Dt 8.17-18]] e peça que escrevam, no pé da folha, a oração “Senhor, eu me lembro de ti”.',
        ],
      },
      {
        name: 'Estudo de caso: a prosperidade',
        kind: 'estudo de caso',
        time: '15 min',
        material: 'Caso: “João foi promovido e agora falta ao culto de domingo para trabalhar”',
        steps: [
          'Em grupos, leiam [[Dt 8.11-18]] e analisem o caso: onde está o perigo? O que Moisés recomendaria?',
          'Pergunte: o que seria **lembrar-se do Senhor** na prática, nessa situação?',
          'Conclua com [[Mt 6.33]]: buscar primeiro o reino é o antídoto ao esquecimento.',
        ],
      },
    ],
    questions: [
      { q: 'Por que Deus fez o povo passar fome e depois o alimentou com o maná?', ref: 'Dt 8.3' },
      { q: 'O que Jesus disse ao diabo usando Dt 8.3?', ref: 'Mt 4.4' },
      { q: 'Qual o perigo da abundância?', ref: 'Dt 8.11-14' },
      { q: 'Quem dá a força para obter riqueza?', ref: 'Dt 8.18' },
      { q: 'Qual a condição da bênção em Deuteronômio 11?', ref: 'Dt 11.13-15' },
    ],
    application:
      'A bênção de Deus não nos dispensa da gratidão; exige-a. Esta semana, **antes das refeições**, em vez de uma oração apressada, diga em voz alta uma coisa que você não conquistou sozinho. Pratique também a generosidade: separe algo para quem precisa.',
    deepen: 'Veja como a provisão no deserto aparece no mapa do [Êxodo](/mapas/exodo). Para entender o uso de Dt 8.3 por Jesus, leia [[Lc 4.1-13]].',
  },
  {
    ...BASE,
    number: 7,
    id: 'adultos-4t26-07-maldicoes-e-bencaos',
    title: 'Maldições e bênçãos da aliança',
    theme: 'Ebal e Gerizim: as consequências da obediência e da desobediência, e o resgate em Cristo',
    refs: 'Dt 27.1-26; Dt 28.1-68',
    memoryVerse: 'Gl 3.13',
    reminders: [
      'Leia **Dt 27 e 28** com atenção: o capítulo 28 tem **14 versículos de bênção e mais de 50 de maldição**. Não deixe a aula só no medo.',
      'Leve também **Gl 3.10-14** para mostrar como Cristo resolve o problema da maldição.',
      'Prepare dois cartazes, um com “Bênçãos” e outro com “Maldições”, para a atividade de grupo.',
    ],
    opening:
      'Peça que dois alunos fiquem de pé, em lados opostos da sala. Diga: “Um é o monte Gerizim, o outro o monte Ebal”. Explique que, em [[Dt 27.11-13]], metade das tribos devia ficar de frente para cada monte, e os levitas proclamavam as bênçãos e as maldições, e todo o povo respondia **“Amém”**.',
    curiosities: [
      { title: 'A cerimônia que aconteceu', text: 'A ordem de [[Dt 27]] foi cumprida por Josué: o povo, entre os montes Ebal e Gerizim, ouviu a leitura de toda a Lei, “a bênção e a maldição” ([[Js 8.30-35]]).' },
      { title: 'Doze maldições, doze “amém”', text: 'O capítulo 27 traz doze maldições (idolatria, desprezo pelos pais, injustiça etc.), e o povo responde “Amém” a cada uma ([[Dt 27.15-26]]). Concordar publicamente é parte da aliança.' },
      { title: 'Bênçãos que alcançam a vida inteira', text: 'As bênçãos de [[Dt 28.1-14]] cobrem a cidade e o campo, os filhos, as colheitas, o rebanho, as viagens (“entrando e saindo”) e as vitórias.' },
      { title: 'Cristo foi feito maldição', text: 'Paulo cita [[Dt 21.23]] e [[Dt 27.26]]: “Cristo nos resgatou da maldição da lei, fazendo-se maldição por nós” ([[Gl 3.13]]).' },
    ],
    context:
      'No modelo dos tratados da época, a parte final listava **bênçãos pelo cumprimento e maldições pelo rompimento** do acordo. Em Deuteronômio 28, isso toma a forma de uma descrição detalhada: seca, doença, derrota, cativeiro. A história posterior de Israel (o cativeiro na Assíria e na Babilônia) mostra que **o aviso era sério**: o povo foi disperso, mas, como Moisés disse, **não foi abandonado** ([[Dt 30.1-5]]). Em Cristo, a maldição foi levada por ele ([[Gl 3.13-14]]).',
    activities: [
      {
        name: 'Ebal e Gerizim na sala',
        kind: 'dramatização',
        time: '10 min',
        material: 'Dois cartazes; versículos impressos',
        steps: [
          'Divida a turma em dois lados: “Gerizim” (bênçãos) e “Ebal” (maldições).',
          'O professor lê um versículo de [[Dt 28.1-14]]; o lado Gerizim responde “Amém!”. Depois lê um versículo de [[Dt 28.15-24]]; o lado Ebal responde “Amém” em tom grave.',
          'Pergunte: como é viver sob a aliança? E por que o povo precisava concordar em voz alta?',
        ],
      },
      {
        name: 'Do medo à graça',
        kind: 'trabalho em grupo',
        time: '10 min',
        material: 'Folhas, canetas',
        steps: [
          'Cada grupo lê [[Gl 3.10-14]] e responde: de qual maldição fomos libertados? Como isso muda a forma de ler Dt 28?',
          'Peça que escrevam uma frase para uma pessoa que tem medo de “estar debaixo de maldição”.',
          'Conclua: a obediência continua importante, mas o **medo da condenação** foi retirado por Cristo ([[Rm 8.1]]).',
        ],
      },
    ],
    questions: [
      { q: 'O que o povo devia fazer ao atravessar o Jordão, segundo Dt 27?', ref: 'Dt 27.2-8' },
      { q: 'Por que o povo respondia “Amém” às maldições?', ref: 'Dt 27.15' },
      { q: 'Quais as áreas da vida alcançadas pelas bênçãos de Dt 28?', ref: 'Dt 28.3-6' },
      { q: 'Qual foi a origem das maldições que vieram sobre Israel?', ref: 'Dt 28.15' },
      { q: 'Como Cristo tratou a maldição da Lei?', ref: 'Gl 3.13' },
    ],
    application:
      'A aliança leva a sério o que fazemos com o que Deus nos deu. **Pergunte-se**: em qual área da minha vida eu tenho ouvido a voz de Deus, mas não tenho feito? Escreva e ore, agradecendo que em Cristo existe perdão e recomeço.',
    deepen: 'Para ver como o povo foi disperso e voltou, leia [Os Cativeiros de Israel](/artigo/cativeiros-de-israel) e o mapa das [doze tribos](/tribos) (Ebal e Gerizim ficam na região de Efraim e Manassés).',
  },
  {
    ...BASE,
    number: 8,
    id: 'adultos-4t26-08-vida-ou-morte',
    title: 'Escolhendo a vida ou a morte',
    theme: 'Perante o povo, Moisés põe a vida e a morte, a bênção e a maldição: “escolhe, pois, a vida”',
    refs: 'Dt 29.29; Dt 30.1-20',
    memoryVerse: 'Dt 30.19',
    reminders: [
      'Leia **Dt 29 e 30** e compare [[Dt 30.11-14]] com [[Rm 10.6-9]].',
      'Prepare duas cadeiras, uma de frente para a outra, para a atividade de escolha.',
      'É uma boa aula para **convidar** quem ainda não se decidiu por Cristo. Combine com o pastor se for oportuno.',
    ],
    opening:
      'Coloque no chão duas folhas: “Vida” e “Morte”. Convide quem quiser a ficar em pé ao lado de uma. Deixe o silêncio e leia [[Dt 30.19]]: “O céu e a terra tomo hoje por testemunhas contra ti de que te pus diante de ti a vida e a morte, a bênção e a maldição; **escolhe, pois, a vida**”.',
    curiosities: [
      { title: 'Uma palavra perto', text: 'A palavra de Deus “está mui perto de ti, na tua boca e no teu coração” ([[Dt 30.14]]). Paulo aplica a Cristo e à fé em [[Rm 10.6-9]].' },
      { title: 'Coração circuncidado', text: '“O Senhor teu Deus circuncidará o teu coração” ([[Dt 30.6]]): Deus mesmo faz a mudança que pede. Em [[Dt 10.16]], Moisés manda o povo circuncidar o coração; em Dt 30, promete que Deus o fará.' },
      { title: 'O que é de Deus e o que é nosso', text: '“As coisas encobertas pertencem ao Senhor nosso Deus, mas as reveladas nos pertencem a nós e a nossos filhos para sempre” ([[Dt 29.29]]). Não precisamos saber tudo para obedecer ao que já foi mostrado.' },
      { title: 'Céu e terra como testemunhas', text: 'Moisés chama o **céu e a terra** como testemunhas ([[Dt 30.19]]), uma fórmula dos tratados antigos. A escolha tem peso de juramento.' },
    ],
    context:
      'No fim do discurso, Moisés renova a aliança em Moabe ([[Dt 29.1]]) e diz que ela abrange também os que “não estão aqui” ([[Dt 29.14-15]]), isto é, as gerações futuras. No capítulo 30, ele mostra que o **caminho de volta** sempre existe: se o povo, disperso, se arrepender e voltar ao Senhor, ele o reunirá ([[Dt 30.1-10]]). Depois põe a pergunta decisiva: a obediência **não é impossível nem distante** ([[Dt 30.11-14]]). É uma decisão de vida.',
    activities: [
      {
        name: 'A escolha',
        kind: 'dinâmica',
        time: '10 min',
        material: 'Duas folhas grandes: “Vida” e “Morte”',
        steps: [
          'Leia [[Dt 30.15-20]] e deixe um minuto de silêncio.',
          'Peça que cada um anote, em segredo, uma área da vida em que está diante de uma escolha.',
          'Ore pela turma. Quem quiser pode vir à frente e dizer “escolho a vida”, sem precisar explicar.',
        ],
      },
      {
        name: 'Perto na boca e no coração',
        kind: 'trabalho em grupo',
        time: '10 min',
        material: 'Folhas com [[Dt 30.11-14]] e [[Rm 10.6-9]]',
        steps: [
          'Peça que os grupos comparem os dois textos: o que Paulo fez com a palavra de Moisés?',
          'Pergunte: o que “perto” quer dizer para a salvação? (Não é preciso subir ao céu nem atravessar o mar: Cristo veio.)',
          'Cada grupo escreve uma frase para explicar o evangelho a alguém, usando “perto”.',
        ],
      },
    ],
    questions: [
      { q: 'O que Deus promete se o povo disperso se arrepender?', ref: 'Dt 30.1-5' },
      { q: 'O que significa Deus circuncidar o coração?', ref: 'Dt 30.6' },
      { q: 'Por que Moisés diz que a Lei não é “difícil demais”?', ref: 'Dt 30.11-14' },
      { q: 'Quais as duas escolhas colocadas diante do povo?', ref: 'Dt 30.15-19' },
      { q: 'Como Paulo usa Dt 30 em Romanos 10?', ref: 'Rm 10.6-9' },
    ],
    application:
      'A vida cristã é feita de pequenas escolhas diárias. **Hoje**, identifique uma decisão que você vem adiando e dê o primeiro passo. Se alguém na sua família ainda não escolheu a vida, ore por essa pessoa pelo nome.',
    deepen: 'Leia no app o verbete [arrependimento](/dicionario/arrependimento) e, para a ligação entre a Lei e a graça, o verbete [aliança](/dicionario/alianca).',
  },
  {
    ...BASE,
    number: 9,
    id: 'adultos-4t26-09-sucessao-de-moises',
    title: 'A sucessão de Moisés',
    theme: 'A liderança passa de uma geração a outra, e a Lei é entregue para ser lida e guardada',
    refs: 'Dt 31.1-29; Nm 27.15-23; Dt 34.9',
    memoryVerse: 'Dt 31.6',
    reminders: [
      'Leia **Dt 31** e [[Nm 27.15-23]] (a escolha de Josué). Veja também [[Js 1.1-9]].',
      'Convide, se possível, **um jovem e um líder mais velho** para dar um testemunho curto sobre passar o bastão.',
      'Traga um bastão ou uma caneta bonita para ser passada entre os alunos na dinâmica.',
    ],
    opening:
      'Pergunte: “Quem já recebeu de alguém um trabalho, um cargo, uma receita ou uma responsabilidade que a pessoa deixou?”. Peça um exemplo. Depois diga que Moisés sabia que ia morrer e, em vez de fugir do assunto, **preparou o sucessor** diante de todo o povo ([[Dt 31.7-8]]).',
    curiosities: [
      { title: 'Sê forte e corajoso', text: 'Moisés diz ao povo ([[Dt 31.6]]): “Sede fortes e corajosos [...] o Senhor vosso Deus é quem **vai convosco**”, e repete o ânimo a Josué ([[Dt 31.7,23]]). É o mesmo ânimo que Deus dará a Josué no começo do livro seguinte ([[Js 1.6-9]]).' },
      { title: 'A Lei escrita e guardada', text: 'Moisés escreveu a Lei e a entregou aos sacerdotes, para ser lida **a cada sete anos**, na Festa dos Tabernáculos, diante de todo o povo, homens, mulheres, crianças e estrangeiros ([[Dt 31.9-13]]).' },
      { title: 'Josué, cheio do espírito de sabedoria', text: 'Josué foi escolhido por Deus ([[Nm 27.18]]) e foi “cheio do espírito de sabedoria, porquanto Moisés lhe tinha imposto as mãos” ([[Dt 34.9]]).' },
      { title: 'Um aviso difícil', text: 'Deus avisa que o povo se corromperá depois da morte de Moisés ([[Dt 31.16-18,27-29]]). Por isso, a sucessão não é só de pessoas: é de **palavra e de fé**.' },
    ],
    context:
      'No capítulo 31, Moisés tem 120 anos e diz que não pode mais “sair e entrar” ([[Dt 31.2]]). A transição ocorre em três tempos: o **anúncio** ao povo ([[Dt 31.1-6]]), a **comissão** pública de Josué ([[Dt 31.7-8]]) e a **entrega da Lei** aos sacerdotes ([[Dt 31.9-13]]). Em seguida, Deus convoca Moisés e Josué à tenda para entregar um cântico, que servirá de testemunha ([[Dt 31.14-22]]). A liderança passa, mas o centro permanece: a **Palavra** e a presença de Deus.',
    activities: [
      {
        name: 'Passando o bastão',
        kind: 'dinâmica',
        time: '10 min',
        material: 'Um bastão ou caneta',
        steps: [
          'Em roda, cada pessoa recebe o bastão e diz uma coisa que aprendeu de alguém mais velho na fé e quer passar adiante.',
          'Antes de passar, a pessoa dá a quem recebe uma frase de coragem, como em [[Dt 31.6]].',
          'Na volta, pergunte: o que torna a passagem de liderança saudável (preparo, bênção pública, palavra de Deus) e o que a torna difícil?',
        ],
      },
      {
        name: 'Leitura pública da Lei',
        kind: 'dramatização',
        time: '10 min',
        material: 'Versículos de [[Dt 31.10-13]] impressos',
        steps: [
          'Reconstitua a cena: a turma representa homens, mulheres, crianças e estrangeiros; um aluno lê trechos de [[Dt 6.4-9]].',
          'Pergunte: por que Moisés quis que **todos** ouvissem, até as crianças?',
          'Compare com a sua igreja: como a Palavra é lida e ensinada a cada geração?',
        ],
      },
    ],
    questions: [
      { q: 'Por que Moisés não entrou na terra, segundo o próprio livro?', ref: 'Dt 32.48-52' },
      { q: 'O que Moisés diz ao povo e a Josué sobre a presença de Deus?', ref: 'Dt 31.6-8' },
      { q: 'Quem devia ouvir a leitura da Lei a cada sete anos?', ref: 'Dt 31.10-13' },
      { q: 'O que Deus anuncia que o povo fará depois da morte de Moisés?', ref: 'Dt 31.16' },
      { q: 'O que significa dizer que Josué recebeu “o espírito de sabedoria”?', ref: 'Dt 34.9' },
    ],
    application:
      'Quem você está **preparando** para continuar o que Deus colocou nas suas mãos? Esta semana, escolha uma pessoa mais jovem na fé e marque um café para contar o que Deus fez com você e passar a ela uma responsabilidade pequena.',
    deepen: 'Veja a continuação da história no mapa [A conquista de Jericó](/mapas/conquista-de-jerico), com Josué à frente do povo.',
  },
  {
    ...BASE,
    number: 10,
    id: 'adultos-4t26-10-canto-de-moises',
    title: 'O cântico de Moisés: advertência e esperança',
    theme: 'Um poema para ser decorado, que lembra a fidelidade da Rocha e o pecado do povo',
    refs: 'Dt 31.19-30; Dt 32.1-47',
    memoryVerse: 'Dt 32.4',
    reminders: [
      'Leia o cântico em voz alta, **Dt 32.1-43**, procurando a imagem da **Rocha** (v. 4, 15, 18, 30, 31).',
      'Se alguém da turma gosta de música, peça que ajude a criar uma melodia simples para [[Dt 32.3-4]].',
      'Mostre **Ap 15.3** ao final: “o cântico de Moisés” aparece no céu.',
    ],
    opening:
      'Pergunte: “Qual música da sua infância você ainda sabe cantar inteira?”. Depois diga que Deus mandou Moisés **escrever um cântico** e ensiná-lo ao povo ([[Dt 31.19]]): uma canção decorada fixa a verdade melhor do que uma lista de leis.',
    curiosities: [
      { title: 'A Rocha', text: 'O cântico chama Deus de **Rocha** ([[Dt 32.4]]): firme, confiável, perfeita. O povo, porém, “desprezou a Rocha da sua salvação” ([[Dt 32.15]]).' },
      { title: 'Como a menina do olho', text: 'Deus cuidou de Israel no deserto, cuidou dele, “guardando-o como a menina do seu olho” ([[Dt 32.10]]), e o carregou “como a águia” cuida dos filhotes ([[Dt 32.11]]).' },
      { title: 'Citado no Novo Testamento', text: 'Paulo usa o cântico em [[Rm 10.19]] ([[Dt 32.21]]) e em [[Rm 12.19]] ([[Dt 32.35]]: “Minha é a vingança e a recompensa”). Hebreus cita [[Dt 32.35-36]] em [[Hb 10.30]].' },
      { title: 'O cântico de Moisés no céu', text: 'No Apocalipse, os vencedores cantam “o cântico de Moisés, servo de Deus, e o cântico do Cordeiro” ([[Ap 15.3]]).' },
    ],
    context:
      'O cântico foi dado depois da comissão de Josué e antes da bênção final. Tem a forma de uma acusação em tribunal (“Inclinai os ouvidos, ó céus, e falarei”, [[Dt 32.1]]): primeiro, a **grandeza de Deus** (v. 3-4), depois o **cuidado** (v. 7-14), a **infidelidade** do povo (v. 15-18), o **castigo** (v. 19-35) e, por fim, a **compaixão e a vitória** de Deus (v. 36-43). Moisés ordena que seja ensinado aos filhos, porque “esta palavra não vos é vã, mas é a vossa vida” ([[Dt 32.46-47]]).',
    activities: [
      {
        name: 'Musicando a Rocha',
        kind: 'música',
        time: '10 min',
        material: 'Nenhum (ou um instrumento, se houver)',
        steps: [
          'Peça que a turma escolha um versículo do cântico ([[Dt 32.3-4]] ou [[Dt 32.10-11]]) e invente juntos uma melodia curta.',
          'Cantem juntos duas vezes. Peça que tentem lembrar sem ler.',
          'Converse: por que músicas ajudam a guardar a Palavra? (Ligue a [[Ef 5.19]].)',
        ],
      },
      {
        name: 'As cinco estações do cântico',
        kind: 'trabalho em grupo',
        time: '15 min',
        material: 'Cinco cartões com as estações e os trechos',
        steps: [
          'Dê a cada grupo um trecho: **grandeza** ([[Dt 32.1-4]]), **cuidado** ([[Dt 32.7-14]]), **infidelidade** ([[Dt 32.15-18]]), **castigo** ([[Dt 32.19-35]]) e **esperança** ([[Dt 32.36-43]]).',
          'Cada grupo diz com suas palavras o que Deus faz e o que o povo faz.',
          'Junte as cinco estações no quadro: o cântico conta a história completa, em poucas linhas.',
        ],
      },
    ],
    questions: [
      { q: 'Por que Deus mandou Moisés escrever um cântico?', ref: 'Dt 31.19-21' },
      { q: 'Que nome é dado a Deus em Dt 32.4?', ref: 'Dt 32.4' },
      { q: 'Como Deus cuidou do povo no deserto?', ref: 'Dt 32.10-12' },
      { q: 'O que o povo fez diante da prosperidade?', ref: 'Dt 32.15' },
      { q: 'Qual é a esperança no fim do cântico?', ref: 'Dt 32.36-43' },
    ],
    application:
      'Escolha **uma estrofe** do cântico (ou um hino que você ama) e a decore esta semana. Cante-a quando estiver cansado: as verdades cantadas têm uma forma de voltar à memória na hora do aperto.',
    deepen: 'Se a sua igreja tem a Harpa Cristã, veja a [história da Harpa Cristã](/artigo/harpa-crista) e converse sobre como os hinos ajudam a guardar a Palavra, como o cântico de Moisés.',
  },
  {
    ...BASE,
    number: 11,
    id: 'adultos-4t26-11-bencao-final',
    title: 'A bênção final de Moisés',
    theme: 'Antes de morrer, Moisés abençoa cada tribo e proclama a grandeza de Deus',
    refs: 'Dt 33.1-29; Gn 49.1-28',
    memoryVerse: 'Dt 33.27',
    reminders: [
      'Leia **Dt 33** ao lado de **Gn 49**: Jacó abençoou os filhos, Moisés abençoa as tribos.',
      'Tenha em mãos o mapa das doze tribos do app para mostrar onde cada uma morou.',
      'Cada aluno vai receber uma bênção na dinâmica. Escolha pessoas de confiança para receber e para dar, e garanta que ninguém fique de fora.',
    ],
    opening:
      'Pergunte: “Você se lembra de uma bênção que recebeu de um pai, de uma mãe ou de um líder, em um momento marcante?”. Deixe contarem. Depois leia [[Dt 33.1]]: **“Esta é a bênção com que Moisés, homem de Deus, abençoou os filhos de Israel, antes da sua morte”**.',
    curiosities: [
      { title: 'Homem de Deus', text: 'É a primeira vez que a Bíblia chama Moisés de **“homem de Deus”** ([[Dt 33.1]]). O título aparecerá no título do Salmo 90, atribuído a ele.' },
      { title: 'Uma tribo ficou de fora', text: 'Na bênção de Moisés, **Simeão não é mencionado**. A tribo estava dentro do território de Judá ([[Js 19.1-9]]), e a razão do silêncio é debatida pelos estudiosos.' },
      { title: 'Braços eternos', text: '“O Deus eterno é a tua habitação, e por baixo estão os braços eternos” ([[Dt 33.27]]). Uma das imagens mais consoladoras do Antigo Testamento.' },
      { title: 'Israel feliz', text: 'Moisés termina com uma pergunta de admiração: “Feliz és tu, ó Israel! quem é semelhante a ti? um povo salvo pelo Senhor” ([[Dt 33.29]]).' },
    ],
    context:
      'O capítulo 33 lembra a bênção de Jacó ([[Gn 49]]), mas é mais luminoso: Moisés dá a cada tribo uma bênção específica, relacionada ao que ela viveria na terra. Começa e termina com a glória de Deus: Deus que vem do Sinai ([[Dt 33.2-5]]) e Deus que é refúgio e escudo ([[Dt 33.26-29]]). O texto mostra que **a liderança de Moisés termina com bênção, e não com amargura**, ainda que ele não fosse entrar na terra.',
    activities: [
      {
        name: 'Abençoando uns aos outros',
        kind: 'dinâmica',
        time: '15 min',
        material: 'Papéis com o nome de cada aluno; canetas',
        steps: [
          'Cada aluno recebe o nome de um colega (sorteado) e escreve uma bênção pessoal curta, com base no que conhece dele, e inspirada em [[Dt 33.12]], [[Dt 33.24-25]] ou [[Dt 33.27]].',
          'Quem quiser lê em voz alta e entrega o cartão.',
          'Pergunte: o que Moisés fez ao abençoar? (Reconheceu o futuro de cada um e o entregou nas mãos de Deus.)',
        ],
      },
      {
        name: 'As tribos no mapa',
        kind: 'trabalho em grupo',
        time: '10 min',
        material: 'Mapa das doze tribos, canetas',
        steps: [
          'Divida as tribos entre os grupos. Cada grupo lê a bênção da sua tribo ([[Dt 33.6-25]]) e localiza no mapa onde ela habitou.',
          'Observe a relação entre a bênção e o lugar (ex.: Aser, com o azeite, [[Dt 33.24]]; Zebulom e Issacar, junto ao mar, [[Dt 33.18-19]]).',
          'Conclua com [[Dt 33.29]].',
        ],
      },
    ],
    questions: [
      { q: 'Como Moisés é chamado no começo do capítulo?', ref: 'Dt 33.1' },
      { q: 'Qual a bênção para Levi?', ref: 'Dt 33.8-11' },
      { q: 'Que imagem de Deus aparece em Dt 33.27?', ref: 'Dt 33.27' },
      { q: 'Por que Moisés termina com uma pergunta?', ref: 'Dt 33.29' },
      { q: 'O que há de diferente entre esta bênção e a de Jacó em Gênesis 49?', ref: 'Gn 49.1-2' },
    ],
    application:
      'Abençoar é uma forma de **liderança e de amor**. Esta semana, abençoe uma pessoa por escrito (cartão, mensagem) dizendo o que você vê de bom nela e pedindo a Deus que a guarde. Comece pela sua família.',
    deepen: 'Veja onde morou cada tribo no mapa das [doze tribos](/tribos) e compare com [[Gn 49]].',
  },
  {
    ...BASE,
    number: 12,
    id: 'adultos-4t26-12-morte-de-moises',
    title: 'A morte de Moisés e a continuidade da promessa',
    theme: 'Moisés vê a terra de longe, morre e Deus o sepulta: a promessa continua com outro líder',
    refs: 'Dt 32.48-52; Dt 34.1-12',
    memoryVerse: 'Dt 34.10',
    reminders: [
      'Leia **Dt 34** e [[Jd 1.9|Jd 9]] (a disputa sobre o corpo de Moisés); veja também [[Mt 17.1-8]], quando Moisés aparece com Jesus no monte.',
      'Aula com carga emocional: reserve um momento para o silêncio e, se houver alguém de luto na turma, conduza com cuidado.',
      'Prepare um mapa do monte Nebo e da vista que Moisés teve ([[Dt 34.1-4]]).',
    ],
    opening:
      'Leia devagar [[Dt 34.1-4]]. Pergunte: “Como vocês imaginam o que Moisés sentiu?”. Deixe silêncio. Diga: **Moisés viu a terra, mas não entrou**. E mesmo assim o texto não termina com tristeza: termina com a obra de Deus continuando.',
    curiosities: [
      { title: 'Uma vista incrível', text: 'Do monte Nebo, no topo do Pisga, Moisés viu toda a terra, de Gileade a Dã, de Efraim ao mar ocidental, o Neguebe e o vale de Jericó ([[Dt 34.1-3]]).' },
      { title: 'Sepultado por Deus', text: 'O texto diz que Deus “o sepultou no vale [...] e **ninguém soube até hoje o lugar da sua sepultura**” ([[Dt 34.6]]). Judas menciona uma disputa entre o arcanjo Miguel e o diabo pelo corpo de Moisés ([[Jd 1.9|Jd 9]]).' },
      { title: 'Cento e vinte anos de vigor', text: '“Tinha Moisés cento e vinte anos quando morreu; não se lhe escurecera a vista, nem se lhe fugira o vigor” ([[Dt 34.7]]).' },
      { title: 'Trinta dias de luto', text: 'Os israelitas choraram Moisés trinta dias nas campinas de Moabe ([[Dt 34.8]]). Depois, o povo obedeceu a Josué ([[Dt 34.9]]).' },
    ],
    context:
      'A razão de Moisés não entrar na terra é dada em [[Dt 32.48-52]] e em [[Nm 20.1-13]]: no deserto de Zim, ele **bateu na rocha** em vez de falar a ela, como Deus havia ordenado, e não honrou o Senhor diante do povo. É um lembrete de que **a liderança tem peso maior**. Mas a Bíblia não resume Moisés pelo seu erro: o último versículo diz que **nunca mais surgiu em Israel um profeta como Moisés, a quem o Senhor conhecesse face a face** ([[Dt 34.10]]). A promessa não morreu com ele: Josué assume, e o povo entra.',
    activities: [
      {
        name: 'O legado',
        kind: 'dinâmica',
        time: '10 min',
        material: 'Papel e caneta',
        steps: [
          'Peça que cada aluno escreva, em silêncio: “Se eu morresse hoje, três coisas que gostaria que dissessem de mim seriam...”.',
          'Convide quem quiser a compartilhar uma. Depois leia [[Dt 34.10-12]] e compare: como a Bíblia descreve Moisés?',
          'Pergunte: o que torna uma vida **duradoura**? (Fidelidade, serviço, a Palavra de Deus.)',
        ],
      },
      {
        name: 'De longe, mas não em vão',
        kind: 'debate',
        time: '10 min',
        material: 'Nenhum',
        steps: [
          'Pergunte: já passou por algo em que trabalhou muito e não viu o resultado? (Plantadores de igrejas, missionários, pais.)',
          'Leia [[Hb 11.39-40]]: muitos não viram o cumprimento das promessas.',
          'Conclua: o trabalho feito para Deus nunca é em vão ([[1Co 15.58]]).',
        ],
      },
    ],
    questions: [
      { q: 'Por que Moisés não entrou na terra prometida?', ref: 'Dt 32.51' },
      { q: 'O que Moisés viu do monte Nebo?', ref: 'Dt 34.1-4' },
      { q: 'Quem sepultou Moisés?', ref: 'Dt 34.6' },
      { q: 'Como o povo reagiu à morte de Moisés?', ref: 'Dt 34.8-9' },
      { q: 'Como a Bíblia resume a vida de Moisés?', ref: 'Dt 34.10-12' },
    ],
    application:
      'Nem tudo o que plantamos vamos ver florescer. **Pense numa obra** (ministério, família, igreja) em que você tem trabalhado sem ver fruto e entregue-a nas mãos de Deus em oração, lembrando que ele é fiel.',
    deepen: 'Veja a região do monte Nebo e a entrada na terra no mapa [A conquista de Jericó](/mapas/conquista-de-jerico). Para a presença de Moisés junto a Jesus, leia [[Lc 9.28-36]].',
  },
  {
    ...BASE,
    number: 13,
    id: 'adultos-4t26-13-cumprimento-em-cristo',
    title: 'O cumprimento de Deuteronômio em Cristo',
    theme: 'O Profeta como Moisés, o amor ao Senhor e o resgate da maldição: tudo aponta para Jesus',
    refs: 'Dt 18.15-19; Mt 4.1-11; Gl 3.13',
    memoryVerse: 'Dt 18.15',
    reminders: [
      'Faça uma **revisão do trimestre** em forma de roteiro: abra o quadro com 13 colunas simples e peça a lembrança de cada lição.',
      'Leia **Dt 18.15-19** com **At 3.22-26** e **Jo 1.45**. Prepare uma lista dos usos de Deuteronômio por Jesus (Mt 4).',
      'Reserve o final para **agradecimento e oração**, e para falar de como continuar estudando a Bíblia juntos no próximo trimestre.',
    ],
    opening:
      'Pergunte: “Quem se lembra da primeira frase da primeira lição do trimestre?”. Deixe lembrarem. Depois diga: “Este livro de despedida de Moisés termina apontando para **Alguém maior que Moisés**”. Leia [[Dt 18.15]]: “O Senhor teu Deus te suscitará do meio de ti, dentre teus irmãos, **um profeta semelhante a mim**; a ele ouvirás”.',
    curiosities: [
      { title: 'O Profeta como Moisés', text: 'Pedro, em Jerusalém, diz que Jesus é o profeta de quem Moisés falou ([[At 3.22-23]]), e Estêvão repete ([[At 7.37]]). Filipe diz a Natanael: “Acabamos de achar aquele de quem escreveram Moisés na lei, e os profetas” ([[Jo 1.45]]).' },
      { title: 'Três respostas na tentação', text: 'Na tentação, Jesus citou Deuteronômio três vezes: [[Dt 8.3]] ([[Mt 4.4]]), [[Dt 6.16]] ([[Mt 4.7]]) e [[Dt 6.13]] ([[Mt 4.10]]). O **Filho** passou onde o povo caiu no deserto: ficou quarenta dias sem comer e confiou na palavra.' },
      { title: 'Maldito quem pende do madeiro', text: 'Paulo liga [[Dt 21.23]] à cruz: Cristo, “fazendo-se maldição por nós”, levou a maldição para que a bênção de Abraão chegasse aos gentios ([[Gl 3.13-14]]).' },
      { title: 'O maior mandamento', text: 'Quando perguntaram a Jesus qual era o grande mandamento, ele respondeu com [[Dt 6.5]] ([[Mt 22.37-38]]). E disse: “Se me amardes, guardareis os meus mandamentos” ([[Jo 14.15]]), eco de [[Dt 11.1]].' },
    ],
    context:
      'Deuteronômio foi o livro que mais moldou a fé de Israel depois do exílio: lido nas sinagogas, copiado em muitos manuscritos de Qumran e citado por Jesus. O Novo Testamento mostra que ele **não foi substituído**, mas cumprido: o Profeta prometido veio; a maldição foi levada; a aliança foi renovada no sangue de Cristo ([[Lc 22.20]]); e o coração circuncidado ([[Dt 30.6]]) é obra do Espírito ([[Rm 2.28-29]]; [[Cl 2.11]]).',
    activities: [
      {
        name: 'Deuteronômio nos lábios de Jesus',
        kind: 'trabalho em grupo',
        time: '15 min',
        material: 'Folhas com [[Mt 4.1-11]] e [[Mt 22.34-40]]',
        steps: [
          'Cada grupo lê um dos dois trechos e localiza as citações de Deuteronômio (Dt 8.3; 6.16; 6.13; 6.5).',
          'Pergunte: por que Jesus respondeu com a Palavra, e não com argumentos ou força?',
          'Cada grupo diz uma lição para a vida: a Palavra decorada é uma arma na hora da tentação.',
        ],
      },
      {
        name: 'Linha do trimestre',
        kind: 'dinâmica',
        time: '10 min',
        material: 'Treze papéis, um para cada lição, e fita adesiva',
        steps: [
          'Escreva o título de cada lição em um papel e cole-os fora de ordem no quadro.',
          'Peça que a turma os coloque na ordem certa e diga, de cada um, **uma frase que ficou**.',
          'Termine com uma oração em que cada aluno agradece por uma lição.',
        ],
      },
    ],
    questions: [
      { q: 'Qual profeta Moisés prometeu que Deus levantaria?', ref: 'Dt 18.15' },
      { q: 'Como Pedro e Estêvão aplicaram essa promessa a Jesus?', ref: 'At 3.22-23' },
      { q: 'Quais trechos de Deuteronômio Jesus usou contra o diabo?', ref: 'Mt 4.4' },
      { q: 'O que Cristo fez com a maldição da Lei?', ref: 'Gl 3.13' },
      { q: 'Qual é o ponto mais importante que você leva deste trimestre?' },
    ],
    application:
      'Deuteronômio termina e a história continua. Termine o trimestre com um **compromisso concreto**: escolha o texto de Deuteronômio que mais falou com você e o decore até o fim do ano. Agradeça a Deus, em oração, por quem o ensinou a amá-lo.',
    deepen: 'Veja como o Novo Testamento cita o Antigo em [A Septuaginta, a Bíblia Grega](/artigo/septuaginta) e como os Manuscritos do Mar Morto guardaram o livro, em [Os Manuscritos da Bíblia](/artigo/manuscritos).',
  },
];
