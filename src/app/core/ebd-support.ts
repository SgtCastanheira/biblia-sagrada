import { EBD_ADULTOS_4T26 } from './ebd-adultos-4t26';
import { EBD_ADOLESCENTES_4T26 } from './ebd-adolescentes-4t26';
import { EBD_JOVENS_4T26 } from './ebd-jovens-4t26';
import { EBD_JUNIORES_4T26 } from './ebd-juniores-4t26';
import { EBD_PRIMARIOS_4T26 } from './ebd-primarios-4t26';
import { EBD_JARDIM_4T26 } from './ebd-jardim-4t26';
import { EBD_MATERNAL_4T26 } from './ebd-maternal-4t26';
import { EBD_BERCARIO_4T26 } from './ebd-bercario-4t26';
import { EBD_JUVENIS_4T26 } from './ebd-juvenis-4t26';
import { EBD_PRE_ADOLESCENTES_4T26 } from './ebd-pre-adolescentes-4t26';
import type { IbucClass, IbucLesson } from './teaching';

/**
 * EBD — apoio ao professor de todas as classes: Berçário, Maternal, Jardim de Infância, Primários, Juniores,
 * Pré-adolescentes, Adolescentes, Juvenis, Jovens e Adultos.
 * As revistas servem só de inspiração para os temas: nada do texto delas é reproduzido.
 * Os textos usam [[referências]] (abrem o versículo) e **negrito**.
 */

export const EBD_SUPPORT_CLASSES: IbucClass[] = [
  {
    id: 'bercario',
    name: 'Berçário',
    ages: 'Bebês até 2 anos',
    icon: 'child_care',
    tips: [
      'Ritmo calmo e rotina igual em todo domingo: música, história curta, momento de colo.',
      'Fale devagar, olhando nos olhos, e repita as mesmas palavras: o bebê aprende pela repetição e pelo carinho.',
      'Use objetos para tocar e ver (bichinhos de pano, figuras grandes) e cuide da higiene e da segurança antes de tudo.',
      'Converse com os pais ao entregar: dizer o que foi vivido na aula leva a mensagem para casa.',
    ],
  },
  {
    id: 'maternal',
    name: 'Maternal',
    ages: 'De 2 a 3 anos',
    icon: 'toys',
    tips: [
      'Atividades curtas, de 3 a 5 minutos, que usam o corpo: bater palmas, cantar, andar, imitar bichos.',
      'Uma ideia por aula, repetida de várias formas: “Deus cuida de mim”, “a Bíblia é o livro de Deus”.',
      'Use cartazes, figuras e músicas simples. Eles amam repetir e pedem “de novo”.',
      'Dê pequenas tarefas (guardar, distribuir) para se sentirem importantes.',
    ],
  },
  {
    id: 'jardim',
    name: 'Jardim de Infância',
    ages: 'De 4 a 5 anos',
    icon: 'local_florist',
    tips: [
      'Conte a história com voz, gestos e objetos; deixe que ajudem a contar, mostrando e imitando.',
      'Eles perguntam muito: acolha as perguntas, mesmo as engraçadas, e responda com frases curtas e verdadeiras.',
      'Alterne momentos calmos e de movimento: história, música, brincadeira, desenho.',
      'Ensine um versículo curto por vez, com mímica.',
    ],
  },
  {
    id: 'primarios',
    name: 'Primários',
    ages: 'De 6 a 8 anos',
    icon: 'edit',
    tips: [
      'Eles começam a ler e a escrever: aproveite com atividades de ligar, completar e desenhar.',
      'Histórias bíblicas com personagens e ação funcionam melhor do que explicações longas.',
      'Brincadeiras com regras simples e trabalho em grupos pequenos ensinam a conviver.',
      'Elogie o esforço e valorize cada resposta, mesmo a incompleta.',
    ],
  },
  {
    id: 'juniores',
    name: 'Juniores',
    ages: 'De 9 a 11 anos',
    icon: 'explore',
    tips: [
      'Eles gostam de desafios, de competir em equipes e de descobrir: use enigmas, jogos de perguntas e missões.',
      'Estimule a pesquisa na Bíblia: procurar versículos, completar quadros e mapas.',
      'Mostre que as histórias bíblicas aconteceram de verdade, com lugares, datas e pessoas.',
      'Cuide da inclusão: ninguém deve ser escolhido por último nem ficar de fora.',
    ],
  },
  {
    id: 'pre-adolescentes',
    name: 'Pré-adolescentes',
    ages: 'De 12 a 14 anos',
    icon: 'diversity_2',
    tips: [
      'Estão mudando por dentro e por fora: acolha sem exposição e deixe falar sem rir de ninguém.',
      'Perguntas abertas e debates curtos funcionam melhor do que preleções.',
      'Mostre a Bíblia como guia para o que vivem: amizades, escola, tentações, família, redes sociais.',
      'Dê responsabilidades (ler, orar, conduzir uma dinâmica) para que se sintam respeitados.',
    ],
  },
  {
    id: 'adolescentes',
    name: 'Adolescentes',
    ages: 'Classe de Adolescentes',
    icon: 'bolt',
    tips: [
      'Blocos curtos e variados: explicação, pergunta, atividade — ninguém fica muito tempo só ouvindo.',
      'Eles querem pertencer: trabalhe em duplas e grupos pequenos e chame cada um pelo nome.',
      'Mostre que a Bíblia trata do que eles vivem: medo, pressão do grupo, identidade, redes sociais.',
      'Perguntas abertas valem mais do que respostas prontas; acolha a dúvida sem expor ninguém.',
    ],
  },
  {
    id: 'juvenis',
    name: 'Juvenis',
    ages: 'De 15 a 17 anos',
    icon: 'sports_esports',
    tips: [
      'Eles querem ser levados a sério: conte com a opinião deles e evite tratá-los como crianças.',
      'Fale de fé, escolhas, identidade, vocação e relacionamentos com honestidade, sem fórmulas prontas.',
      'Dinâmicas de estudo de caso e debate funcionam bem; termine sempre com uma decisão prática.',
      'Mostre que a doutrina e a vida andam juntas: aprender para viver.',
    ],
  },
  {
    id: 'jovens',
    name: 'Jovens',
    ages: 'Classe de Jovens',
    icon: 'rocket_launch',
    tips: [
      'Autenticidade conta mais do que eloquência: fale de como o texto mexe com você.',
      'Traga o contexto histórico e cultural — eles gostam de entender o “porquê”.',
      'Debates e estudos de caso sobre decisões reais: vocação, trabalho, namoro, fé na faculdade.',
      'Termine com um desafio prático para a semana e retome no domingo seguinte.',
    ],
  },
  {
    id: 'adultos',
    name: 'Adultos',
    ages: 'Classe de Adultos',
    icon: 'diversity_1',
    tips: [
      'Adultos aprendem a partir da experiência: peça que contem como viveram o tema.',
      'Parta de um problema real (família, trabalho, perdas) e leve ao texto bíblico.',
      'Valorize quem já conhece a Bíblia: dê espaço para testemunhos curtos e para quem lê pouco.',
      'Aplicação concreta: o que muda nesta semana, em casa e no trabalho?',
    ],
  },
];

/** Aulas de apoio (o conteúdo de cada tema da revista será acrescentado aqui). */
export const EBD_SUPPORT_LESSONS: IbucLesson[] = [
  ...EBD_ADULTOS_4T26,
  ...EBD_JOVENS_4T26,
  ...EBD_ADOLESCENTES_4T26,
  ...EBD_JUVENIS_4T26,
  ...EBD_JUNIORES_4T26,
  ...EBD_PRIMARIOS_4T26,
  ...EBD_JARDIM_4T26,
  ...EBD_MATERNAL_4T26,
  ...EBD_BERCARIO_4T26,
  ...EBD_PRE_ADOLESCENTES_4T26,
  {
    id: 'modelo-neemias-reconstroi-os-muros',
    classes: ['adolescentes', 'jovens', 'adultos'],
    example: true,
    title: 'Neemias reconstrói os muros',
    theme: 'Oração, planejamento e coragem para reconstruir o que está em ruínas',
    refs: 'Ne 1.1-11; Ne 2.1-20; Ne 4.1-23; Ne 6.15-16',
    memoryVerse: 'Ne 2.20',
    opening:
      'Mostre a foto de uma casa ou de um muro em ruínas (ou desenhe no quadro) e pergunte: “O que leva alguém a reconstruir algo que está destruído há mais de cem anos?”. Depois conte que Jerusalém estava com os muros no chão desde 586 a.C. — e que um funcionário do palácio persa decidiu mudar isso em **52 dias** [[Ne 6.15]].',
    curiosities: [
      { title: 'Quatro meses de oração', text: 'Neemias recebeu a notícia no mês de quisleu [[Ne 1.1]] e só falou com o rei no mês de nisã [[Ne 2.1]]: cerca de **quatro meses** orando e jejuando antes de agir [[Ne 1.4]].' },
      { title: 'A oração relâmpago', text: 'Quando o rei perguntou “Que me pedes agora?”, Neemias “orou ao Deus do céu” antes de responder [[Ne 2.4-5]] — uma oração de segundos, apoiada em meses de oração anterior.' },
      { title: 'Copeiro do rei', text: 'Neemias era o copeiro de Artaxerxes [[Ne 1.11]] [[Ne 2.1]]: provava e servia o vinho do rei. Era um cargo de **muita confiança** — e por isso a tristeza no rosto dele assustou [[Ne 2.2]].' },
      { title: 'O inimigo aparece fora da Bíblia', text: 'Sambalate, que zombou da obra [[Ne 4.1-2]], aparece também nos **papiros de Elefantina**, no Egito (c. 407 a.C.), como governador de Samaria — um dos achados que confirmam o cenário de Neemias.' },
      { title: 'Com uma mão na obra e a outra na arma', text: 'Sob ameaça, cada construtor trabalhava com uma mão e segurava a arma com a outra [[Ne 4.17-18]]. Oração e vigilância andaram juntas: “oramos ao nosso Deus, e pusemos guarda” [[Ne 4.9]].' },
      { title: 'A origem da pregação expositiva', text: 'Com os muros prontos, Esdras leu a Lei para o povo, e os levitas “deram o sentido, de modo que se entendesse a leitura” [[Ne 8.8]] — ler, explicar e aplicar, como se faz até hoje na EBD.' },
    ],
    context:
      'Depois do exílio na Babilônia, o Império Persa deixou os judeus voltarem [[Ed 1.1-4]]. O templo foi reconstruído em 516 a.C., mas Jerusalém continuou sem muros — e uma cidade sem muros, na Antiguidade, ficava exposta a ataques e desonra [[Ne 1.3]]. Em 445 a.C., no vigésimo ano de Artaxerxes I [[Ne 2.1]], Neemias estava em Susã, uma das capitais persas. O rei deu cartas e madeira para a obra [[Ne 2.7-8]] e o nomeou governador de Judá [[Ne 5.14]]. Os vizinhos — Sambalate, de Samaria; Tobias, o amonita; e Gesém, o árabe — viam um Judá forte como ameaça política e tentaram de tudo: zombaria, ameaças e intrigas [[Ne 2.19]] [[Ne 4.1-3]] [[Ne 6.1-3]]. Mesmo assim o muro ficou pronto em 52 dias, e até os inimigos “perceberam que fizemos esta obra com o auxílio do nosso Deus” [[Ne 6.15-16]].',
    activities: [
      {
        name: 'Construa o muro',
        kind: 'dinâmica',
        time: '10 min',
        material: 'Copos plásticos ou caixas de fósforo; papéis com “ataques” escritos',
        steps: [
          'Divida a turma em duas equipes e dê 3 minutos para cada uma levantar um muro de copos.',
          'No meio do tempo, o professor “ataca” com papéis: zombaria, desânimo, distração — a equipe precisa pôr um vigia para recolher os papéis enquanto os outros constroem [[Ne 4.9]].',
          'Converse: o que nos faz parar uma obra de Deus? Quem é o “vigia” na nossa vida?',
        ],
        classes: ['adolescentes'],
      },
      {
        name: 'Estudo de caso: a ruína de hoje',
        kind: 'estudo de caso',
        time: '15 min',
        material: 'Três casos escritos em papel, um por grupo',
        steps: [
          'Entregue a cada grupo um caso: uma família em crise, um jovem afastado da igreja, um ministério que parou.',
          'Os grupos respondem seguindo os passos de Neemias: o que precisa ser ouvido e chorado [[Ne 1.4]]? O que orar [[Ne 1.5-11]]? Que plano fazer [[Ne 2.11-17]]? Quem chamar para ajudar [[Ne 2.18]]?',
          'Cada grupo apresenta em dois minutos.',
        ],
        classes: ['jovens', 'adultos'],
      },
      {
        name: 'Debate: oração ou planejamento?',
        kind: 'debate',
        time: '10 min',
        material: 'Nenhum',
        steps: [
          'Metade da turma defende “basta orar”; a outra, “é preciso planejar e trabalhar”.',
          'Depois de três minutos para cada lado, leia [[Ne 4.9]] e [[Ne 2.4-5]].',
          'Conclusão: em Neemias, oração e ação não competem — uma sustenta a outra.',
        ],
        classes: ['jovens'],
      },
      {
        name: 'Cada família na sua parte do muro',
        kind: 'trabalho em grupo',
        time: '10 min',
        material: 'Papel pardo com um muro desenhado em blocos; canetas',
        steps: [
          'Leia [[Ne 3.10]] e [[Ne 3.28-30]]: cada um consertou a parte do muro diante da própria casa.',
          'Cada aluno escreve num bloco do muro uma “parte” que pode reconstruir: a família, um amigo, um serviço na igreja.',
          'Orem juntos pelos nomes e pedidos escritos no muro.',
        ],
        classes: ['adultos', 'adolescentes'],
      },
    ],
    questions: [
      { q: 'O que Neemias fez assim que soube da situação de Jerusalém?', ref: 'Ne 1.4' },
      { q: 'Por que a tristeza de Neemias diante do rei era perigosa?', ref: 'Ne 2.1-2' },
      { q: 'Como Neemias respondeu à zombaria de Sambalate e Tobias?', ref: 'Ne 2.19-20' },
      { q: 'O que o povo fez quando a ameaça aumentou?', ref: 'Ne 4.9' },
      { q: 'Por que Neemias se recusou a descer para conversar com os inimigos?', ref: 'Ne 6.3' },
      { q: 'Que “muro” Deus está chamando você para reconstruir hoje?' },
    ],
    application:
      'Neemias não começou pelo tijolo: começou chorando, orando e ouvindo [[Ne 1.4]]. Depois planejou, chamou o povo e não parou diante da zombaria. Nesta semana, escolha uma “ruína” perto de você — um relacionamento, um hábito espiritual, um serviço que parou — ore por ela todos os dias e dê um primeiro passo concreto.',
  },
];
