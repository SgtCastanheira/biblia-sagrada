import type { IbucClass, IbucLesson } from './teaching';

/**
 * IBUC — Instituto Bíblico Único Caminho (Sede): apoio ao professor, por faixa etária.
 * O app não reproduz as revistas nem os PDFs (direitos autorais): traz curiosidades, contexto histórico,
 * brincadeiras e perguntas sobre os temas, para ajudar quem tem pouco tempo para preparar a aula.
 * Os textos usam [[referências]] (abrem o versículo) e **negrito**.
 */

export const IBUC_NAME = 'IBUC';
export const IBUC_FULL_NAME = 'Instituto Bíblico Único Caminho';
export const IBUC_UNIT = 'Sede';

/** Turmas por idade (nomes e faixas podem ser ajustados à organização do IBUC). */
export const IBUC_CLASSES: IbucClass[] = [
  {
    id: 'maternal',
    name: 'Maternal',
    ages: '3 e 4 anos',
    icon: 'child_care',
    tips: [
      'A atenção dura poucos minutos: troque de atividade a cada 5 a 10 minutos.',
      'Conte a história com objetos, fantoches e gestos; repita as mesmas frases-chave.',
      'Cânticos curtos com coreografia fixam melhor do que explicações.',
      'Uma ideia só por aula: “Deus cuida de mim”, “Deus me ama”.',
    ],
  },
  {
    id: 'jardim',
    name: 'Jardim',
    ages: '5 e 6 anos',
    icon: 'local_florist',
    tips: [
      'Histórias com figuras grandes e perguntas simples (“quem?”, “o que fez?”).',
      'Deixe a criança participar: repetir falas, imitar sons, segurar as figuras.',
      'Atividades manuais rápidas, com cola, recorte e pintura.',
      'O versículo para decorar deve ser curto e repetido com gestos.',
    ],
  },
  {
    id: 'primarios',
    name: 'Primários',
    ages: '7 e 8 anos',
    icon: 'auto_stories',
    tips: [
      'Começam a ler: peça que encontrem e leiam um versículo curto na Bíblia.',
      'Gostam de brincadeiras com regras e de pequenas competições em equipe.',
      'Use números e medidas concretas (“Golias tinha quase 3 metros”) — eles adoram comparar.',
      'Termine com uma aplicação prática para a semana.',
    ],
  },
  {
    id: 'juniores',
    name: 'Juniores',
    ages: '9 e 10 anos',
    icon: 'explore',
    tips: [
      'Mapas, linhas do tempo e curiosidades chamam a atenção nessa idade.',
      'Desafios bíblicos (achar referências, quiz) funcionam muito bem.',
      'Deixe que contem a história com as próprias palavras.',
      'Relacione os heróis da Bíblia com situações da escola e da família.',
    ],
  },
  {
    id: 'pre-adolescentes',
    name: 'Pré-adolescentes',
    ages: '11 e 12 anos',
    icon: 'psychology',
    tips: [
      'Perguntam “por quê?”: traga o contexto histórico e deixe espaço para dúvidas.',
      'Conversas em pequenos grupos rendem mais do que exposição longa.',
      'Mostre que a Bíblia fala de sentimentos reais: medo, inveja, coragem.',
      'Valorize quem participa; evite expor quem erra uma resposta.',
    ],
  },
  {
    id: 'adolescentes',
    name: 'Adolescentes',
    ages: '13 a 15 anos',
    icon: 'groups',
    tips: [
      'Identidade e pertencimento: mostre como a fé responde a “quem eu sou?”.',
      'Debates, estudos de caso e perguntas abertas envolvem mais do que respostas prontas.',
      'Use o contexto histórico para mostrar que a Bíblia é confiável e coerente.',
      'Proponha um desafio concreto e retome na aula seguinte.',
    ],
  },
  {
    id: 'juvenis',
    name: 'Juvenis',
    ages: '16 e 17 anos',
    icon: 'diversity_3',
    tips: [
      'Aprofunde: idiomas originais, contexto cultural e as perguntas difíceis do texto.',
      'Dê responsabilidades: um aluno pode trazer uma curiosidade ou conduzir a dinâmica.',
      'Ligue o tema a decisões reais: vocação, namoro, estudos, serviço na igreja.',
      'Ore com eles e por eles: a aula é discipulado, não só informação.',
    ],
  },
];


/** Aulas (o conteúdo de cada tema do IBUC será acrescentado aqui). */
export const IBUC_LESSONS: IbucLesson[] = [
  {
    id: 'modelo-davi-e-golias',
    classes: ['primarios', 'juniores'],
    example: true,
    title: 'Davi e Golias',
    theme: 'Do Senhor é a batalha: coragem que vem da confiança em Deus',
    refs: '1Sm 17.1-50',
    memoryVerse: '1Sm 17.47',
    opening:
      'Leve uma fita métrica e pergunte: “Qual é a pessoa mais alta que vocês já viram?”. Depois marque na parede, com fita crepe, a altura de Golias — quase 3 metros. Deixe as crianças ficarem embaixo da marca e olharem para cima. Pergunte: “Vocês teriam coragem de enfrentar alguém assim?”.',
    curiosities: [
      { title: 'Quase três metros', text: 'Golias tinha “seis côvados e um palmo” [[1Sm 17.4]]. O côvado era a medida do cotovelo à ponta dos dedos, cerca de 45 cm: dá perto de **2,90 m**. Alguns manuscritos antigos falam em quatro côvados (uns 2 m) — de todo jeito, um gigante para a época.' },
      { title: 'Uma armadura de quase 60 kg', text: 'A couraça pesava cinco mil siclos de bronze [[1Sm 17.5]], perto de **57 kg** — mais do que muitas crianças da sala juntas. Só a ponta da lança pesava uns 7 kg [[1Sm 17.7]].' },
      { title: '40 dias de provocação', text: 'Golias desafiou Israel de manhã e à tarde durante **quarenta dias** [[1Sm 17.16]], e os soldados fugiam de medo [[1Sm 17.24]].' },
      { title: 'Davi foi levar queijo', text: 'Davi não foi à batalha para lutar: o pai o mandou levar grãos, pães e **dez queijos** para os irmãos e o comandante [[1Sm 17.17-18]].' },
      { title: 'A funda não era brinquedo', text: 'A funda era uma arma de guerra: em Benjamim havia setecentos soldados que acertavam “a um fio de cabelo” [[Jz 20.16]]. Uma pedra bem atirada chegava a mais de 100 km/h, segundo estimativas de estudiosos.' },
      { title: 'Por que cinco pedras?', text: 'Davi escolheu cinco seixos lisos [[1Sm 17.40]], mas usou um só [[1Sm 17.49]]. A Bíblia não explica a escolha. Alguns lembram que Golias tinha parentes gigantes em Gate [[2Sm 21.22]] — é uma ideia possível, não algo que o texto diga.' },
    ],
    context:
      'Os filisteus eram o grande inimigo de Israel naquela época: tinham armas de ferro e cidades fortes no litoral. Os dois exércitos acamparam em dois montes, um de cada lado do **vale de Elá**, a uns 25 km de Belém [[1Sm 17.1-3]]. Na guerra antiga, às vezes um “campeão” de cada lado lutava sozinho, e o resultado decidia a batalha — por isso Golias desafiava Israel a mandar um homem. Davi já tinha sido ungido por Samuel, em segredo, para ser o futuro rei [[1Sm 16.13]], mas ainda era um jovem pastor. A coragem dele vinha da experiência com Deus: o Senhor o tinha livrado do leão e do urso [[1Sm 17.34-37]].',
    activities: [
      {
        name: 'Acerte o gigante',
        kind: 'brincadeira',
        time: '10 min',
        material: 'Papel pardo, fita crepe, jornal para fazer bolinhas',
        steps: [
          'Desenhe um Golias no papel pardo e cole na parede na altura real (2,90 m).',
          'Cada criança atira uma bolinha de jornal tentando acertar a testa.',
          'Quem acerta diz um “gigante” da vida (medo do escuro, prova, briga em casa) e a turma responde: “Do Senhor é a batalha!”.',
        ],
      },
      {
        name: 'Quantas crianças fazem um Golias?',
        kind: 'dinâmica',
        time: '5 min',
        material: 'Fita crepe e fita métrica',
        steps: [
          'Marque no chão 2,90 m com fita crepe.',
          'Peça que as crianças deitem uma depois da outra ao longo da marca.',
          'Contem juntos quantas crianças cabem: assim todos “sentem” o tamanho do gigante.',
        ],
        classes: ['primarios'],
      },
      {
        name: 'Cinco pedras lisas',
        kind: 'trabalho manual',
        time: '15 min',
        material: 'Pedrinhas (ou pedras de papel), canetinha, saquinho de pano ou papel',
        steps: [
          'Cada criança recebe cinco “pedras” e um saquinho — o “alforje de pastor” [[1Sm 17.40]].',
          'Em cada pedra escreve ou desenha uma arma de Deus: fé, oração, Palavra, louvor e coragem.',
          'Leva o saquinho para casa e escolhe uma “pedra” para usar a cada dia da semana.',
        ],
      },
      {
        name: 'Dramatização relâmpago',
        kind: 'dramatização',
        time: '10 min',
        material: 'Uma coroa de papel para Saul e um cajado',
        steps: [
          'Distribua os papéis: Golias, Davi, Saul, Eliabe e o exército.',
          'O professor narra e as crianças fazem as falas principais de [[1Sm 17.32-37]] e [[1Sm 17.45-47]].',
          'Termine com todos dizendo juntos o versículo para decorar.',
        ],
        classes: ['juniores'],
      },
    ],
    questions: [
      { q: 'Por que os soldados de Israel tinham tanto medo?', ref: '1Sm 17.11' },
      { q: 'O que Davi lembrou que Deus já tinha feito por ele?', ref: '1Sm 17.34-37' },
      { q: 'Em nome de quem Davi foi lutar?', ref: '1Sm 17.45' },
      { q: 'Davi venceu com espada? Com o quê?', ref: '1Sm 17.50' },
      { q: 'Qual é o “gigante” que você enfrenta hoje — e o que Deus já fez por você antes?' },
    ],
    application:
      'Coragem não é não sentir medo: é confiar em Deus mesmo com medo. Davi lembrou o que Deus já tinha feito (o leão e o urso) e por isso confiou para o desafio novo. Nesta semana, cada um vai lembrar uma vez em que Deus o ajudou e contar para alguém.',
  },
];

