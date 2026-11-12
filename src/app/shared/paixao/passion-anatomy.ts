export type PlateId = 'neuro' | 'pele' | 'torax';
export interface Structure { name: string; detail: string; x: number; y: number; }
export interface Plate { title: string; subtitle: string; alt: string; image: string; structures: Structure[]; sourceUrl: string; source: string; }
export interface Lesson {
  label: string; title: string; plate: PlateId; focus: number;
  mechanism: string; consequence: string; steps: string[];
  limit: string; ref: string; source: string; sourceUrl: string;
}
const openstax = 'https://openstax.org/books/anatomy-and-physiology-2e/pages/';

export const PLATES: Record<PlateId, Plate> = {
  neuro: {
    title: 'Sistema nervoso central', subtitle: 'Encéfalo e segmento da medula · vista oblíqua',
    alt: 'Modelo anatômico digital realista do encéfalo com vasos sanguíneos na superfície, giros cerebrais, cerebelo, tronco encefálico e um segmento da medula espinal com raízes nervosas.',
    image: 'paixao-anatomia-neuro-vascular.webp',
    source: 'Anatomia de referência · OpenStax, 13.2', sourceUrl: openstax + '13-2-the-central-nervous-system',
    structures: [
      { name: 'Cérebro', detail: 'A percepção consciente depende do processamento de sinais pelo sistema nervoso central. Os giros são as dobras visíveis na superfície cerebral.', x: 48, y: 29 },
      { name: 'Medula espinal', detail: 'Integra o sistema nervoso central e se comunica com nervos periféricos. A prancha mostra apenas um segmento, sem mapear uma via autonômica completa.', x: 50, y: 76 },
      { name: 'Cerebelo', detail: 'Estrutura posterior do encéfalo que participa da coordenação motora. Sua superfície apresenta pregas finas, diferentes dos giros cerebrais.', x: 70, y: 49 },
    ],
  },
  pele: {
    title: 'Pele e planos profundos', subtitle: 'Corte ampliado · proporções didáticas',
    alt: 'Corte tridimensional realista com epiderme, derme, vasos, nervos, glândula sudorípara, tecido adiposo, fáscia e músculo; uma lesão ilustrativa alcança a derme.',
    image: 'paixao-anatomia-pele.webp',
    source: 'Anatomia de referência · OpenStax, 5.1', sourceUrl: openstax + '5-1-layers-of-the-skin',
    structures: [
      { name: 'Epiderme', detail: 'Camada externa de proteção. Não contém vasos sanguíneos.', x: 80, y: 22 },
      { name: 'Derme e vasos', detail: 'Tecido de sustentação com vasos e terminações nervosas. Uma lesão vascular pode sangrar.', x: 70, y: 39 },
      { name: 'Glândula sudorípara', detail: 'A porção enovelada produz suor, conduzido por um ducto até a superfície.', x: 41, y: 55 },
      { name: 'Hipoderme', detail: 'Tecido subcutâneo com gordura, abaixo da derme. A pele propriamente dita é formada por epiderme e derme.', x: 65, y: 72 },
      { name: 'Fáscia e músculo', detail: 'Sob o tecido subcutâneo, a fáscia se relaciona com os planos musculares. A profundidade de uma lesão muda as estruturas envolvidas.', x: 71, y: 87 },
    ],
  },
  torax: {
    title: 'Tórax e órgãos vitais', subtitle: 'Vista anterior · parede torácica parcialmente removida',
    alt: 'Prancha realista do tórax aberto para estudo, mostrando traqueia, brônquios, pulmões, coração e diafragma, sem simular ferimento de lança.',
    image: 'paixao-anatomia-torax.webp',
    source: 'Anatomia de referência · OpenStax, 19.1', sourceUrl: openstax + '19-1-heart-anatomy',
    structures: [
      { name: 'Traqueia e brônquios', detail: 'Conduzem o ar em direção aos pulmões. A ventilação movimenta o ar; a circulação transporta o sangue.', x: 48, y: 31 },
      { name: 'Pulmões', detail: 'Nos alvéolos ocorrem as trocas gasosas entre ar e sangue. A prancha mostra a posição dos órgãos, sem ampliar os alvéolos.', x: 72, y: 46 },
      { name: 'Coração', detail: 'Entre os pulmões, impulsiona o sangue. O transporte de oxigênio depende também de uma circulação suficiente.', x: 54, y: 58 },
      { name: 'Diafragma', detail: 'Músculo em cúpula abaixo dos pulmões. Sua contração participa da inspiração.', x: 50, y: 76 },
    ],
  },
};

export const LESSONS: Record<'corpo' | 'ferimentos' | 'morte', Lesson[]> = {
  corpo: [
    { label: 'Angústia', title: 'A ameaça mobiliza o organismo', plate: 'neuro', focus: 0,
      mechanism: 'Diante de uma ameaça, respostas simpáticas e a liberação de adrenalina podem aumentar a atividade cardíaca e mobilizar energia. A experiência emocional tem expressão corporal.',
      consequence: 'Alerta e alterações autonômicas ajudam a compreender a dimensão física da angústia descrita no jardim.',
      steps: ['Ameaça percebida', 'Resposta nervosa e hormonal', 'Mobilização do organismo'],
      limit: 'Marcos descreve pavor e angústia. Não há registro de pulso, pressão ou dosagens hormonais de Jesus. A prancha é um modelo genérico.',
      ref: 'Mc 14.33–36', source: 'Fisiologia do estresse · OpenStax, 17.6', sourceUrl: openstax + '17-6-the-adrenal-glands' },
    { label: 'Suor', title: 'Da glândula à superfície da pele', plate: 'pele', focus: 2,
      mechanism: 'A glândula sudorípara écrina tem uma porção secretora enovelada e um ducto que conduz suor à superfície. Suor e sangramento têm origens anatômicas diferentes.',
      consequence: 'Explore a glândula e os vasos separadamente. A presença de ambos na derme não demonstra mistura entre sangue e suor.',
      steps: ['Porção secretora', 'Ducto sudoríparo', 'Superfície da pele'],
      limit: 'Lucas compara o suor a gotas de sangue. Existem relatos médicos de hematidrose, mas essa leitura não estabelece o diagnóstico de Jesus. A lesão desenhada na prancha não representa o Getsêmani.',
      ref: 'Lc 22.44 · Jerajani e colaboradores, 2009', source: 'Glândulas da pele · OpenStax, 5.2', sourceUrl: openstax + '5-2-accessory-structures-of-the-skin' },
    { label: 'Vigília', title: 'Alerta, cansaço e companhia', plate: 'neuro', focus: 0,
      mechanism: 'O sistema nervoso integra sinais e organiza respostas. A leitura anatômica situa o corpo; o relato bíblico situa a oração e os discípulos que adormecem.',
      consequence: 'Acompanhe os retornos de Jesus aos amigos. A solidão aparece na cena sem depender de um diagnóstico de privação de sono.',
      steps: ['Oração', 'Retorno aos discípulos', 'Pedido de vigilância'],
      limit: 'Não sabemos há quantas horas Jesus estava acordado. Não atribuímos a ele confusão mental, alucinações ou uma lesão cerebral.',
      ref: 'Mc 14.37–41 · Lc 22.45', source: 'Integração sensorial · OpenStax, 14.1', sourceUrl: openstax + '14-1-sensory-perception' },
  ],
  ferimentos: [
    { label: 'Pele e dor', title: 'Da lesão à percepção da dor', plate: 'pele', focus: 1,
      mechanism: 'Terminações nervosas sensíveis a estímulos lesivos iniciam sinais elétricos. Esses sinais seguem por vias nervosas e são processados pelo sistema nervoso central, participando da experiência da dor.',
      consequence: 'Observe a relação entre a abertura na pele, o tecido vascularizado e os nervos. Profundidade, extensão e contexto alteram a experiência; a imagem não mede sua intensidade.',
      steps: ['Estímulo lesivo', 'Sinal nervoso', 'Processamento e percepção'],
      limit: 'João registra a flagelação, sem mapear cada ferida. O corte é uma demonstração geral de lesão dérmica, não uma reprodução dos açoites ou das costas de Jesus.',
      ref: 'Jo 19.1 · Mt 27.26', source: 'Percepção sensorial · OpenStax, 14.1', sourceUrl: openstax + '14-1-sensory-perception' },
    { label: 'Movimento', title: 'O tecido ferido continua em movimento', plate: 'pele', focus: 4,
      mechanism: 'A inflamação pode aumentar o fluxo local e a permeabilidade dos vasos, com edema e dor. Pressão e deslocamento sobre tecidos lesionados podem tornar o movimento doloroso.',
      consequence: 'Na prancha, acompanhe pele, tecido subcutâneo e músculo. Eles se relacionam no movimento, mas uma ferida na derme não significa que o músculo foi rompido.',
      steps: ['Lesão tecidual', 'Resposta inflamatória', 'Dor e limitação possíveis'],
      limit: 'Os Evangelhos narram o caminho após as agressões. Não informam quais músculos foram lesionados nem descrevem uma sequência de quedas.',
      ref: 'Mt 27.26–32 · Lc 23.26', source: 'Inflamação · OpenStax, 21.2', sourceUrl: openstax + '21-2-barrier-defenses-and-the-innate-immune-response' },
    { label: 'Circulação', title: 'Perda de sangue e perfusão dos tecidos', plate: 'pele', focus: 1,
      mechanism: 'Sangrar exige lesão de vasos. Se a perda for importante, o volume circulante pode diminuir e comprometer a perfusão: a passagem de sangue que fornece oxigênio aos tecidos.',
      consequence: 'O organismo tenta compensar alterações circulatórias. A perda persistente pode superar essa resposta; isso não pode ser calculado pela aparência de uma ferida.',
      steps: ['Lesão vascular', 'Possível redução de volume', 'Perfusão ameaçada'],
      limit: 'Não há medição do volume perdido por Jesus. Hipovolemia é uma hipótese discutida na literatura, sem permitir atribuir litros, pressão ou uma classe de choque.',
      ref: 'Edwards e colaboradores, 1986 · Maslen e Mitchell, 2006', source: 'Regulação vascular · OpenStax, 20.4', sourceUrl: openstax + '20-4-homeostatic-regulation-of-the-vascular-system' },
  ],
  morte: [
    { label: 'Circulação', title: 'O coração depende de sangue suficiente', plate: 'torax', focus: 2,
      mechanism: 'O coração bombeia o sangue pelos circuitos pulmonar e sistêmico. O fornecimento de oxigênio depende da circulação e da troca gasosa, que são funções relacionadas.',
      consequence: 'Trauma e perda de sangue participam de hipóteses sobre a crucificação. Identificar órgãos ajuda a compreender os mecanismos propostos; não resolve a causa individual da morte.',
      steps: ['Coração e vasos', 'Fluxo sanguíneo', 'Oxigênio aos tecidos'],
      limit: 'As revisões médicas apresentam mecanismos diferentes. Sem dados clínicos, não é possível escolher uma causa única ou reproduzir os instantes finais do funcionamento cardíaco.',
      ref: 'Maslen e Mitchell, 2006', source: 'Fluxo sanguíneo · OpenStax, 20.2', sourceUrl: openstax + '20-2-blood-flow-blood-pressure-and-resistance' },
    { label: 'Respiração', title: 'Respirar exige movimento e diferença de pressão', plate: 'torax', focus: 3,
      mechanism: 'Na inspiração, a contração do diafragma amplia o volume torácico e favorece a entrada de ar. A ventilação depende de diferenças de pressão e da mecânica da parede torácica.',
      consequence: 'Dor e limitações mecânicas podem dificultar movimentos respiratórios. O funcionamento normal explica o que está em discussão, sem provar asfixia como causa da morte de Jesus.',
      steps: ['Contração do diafragma', 'Expansão torácica', 'Entrada de ar'],
      limit: 'A hipótese de asfixia na crucificação é debatida. Não apresentamos como fato um ciclo obrigatório de subir sobre os pés para conseguir respirar.',
      ref: 'Edwards, 1986 · McGovern, Kaminskas e Fernandes, 2022/2023', source: 'Mecânica respiratória · OpenStax, 22.3', sourceUrl: openstax + '22-3-the-process-of-breathing' },
    { label: 'A lança', title: 'Primeiro a morte; depois a perfuração', plate: 'torax', focus: 2,
      mechanism: 'O tórax abriga pulmões, coração, vasos e membranas. Nomear essas estruturas não identifica o trajeto de uma perfuração descrita apenas como no lado.',
      consequence: 'Em João, a constatação da morte vem antes do golpe de lança. Essa ordem orienta a leitura da passagem e das reconstruções médicas.',
      steps: ['Jesus já está morto', 'As pernas não são quebradas', 'Perfuração do lado'],
      limit: 'Sangue e água não equivalem a uma autópsia. Não traçamos um trajeto da lança nem identificamos com certeza um órgão perfurado. A prancha mostra anatomia geral, sem lesão simulada.',
      ref: 'Jo 19.30–34', source: 'Texto de João · capítulo 19', sourceUrl: '/ler/JHN/19' },
  ],
};
