import { findAdState, stateFlag } from './ad-states';
import type { BibleMap, MapStep } from './maps';

/** Etapa do mapa dos estados: ano, origem e página vêm de AD_STATES (um só lugar); aqui só o texto da etapa. */
function stateStep(id: string, text: string): MapStep {
  const s = findAdState(id)!;
  return { place: id, ...(s.from ? { from: s.from } : {}), ref: s.year, link: '/assembleia-de-deus/' + id, flag: stateFlag(id), text };
}

/**
 * Mapas da história da Igreja (fora da Bíblia). Usam o mesmo mapa interativo dos mapas bíblicos;
 * em cada etapa, "ref" é a data (aparece como texto, não como referência bíblica).
 * Geografia gerada por tools/gerar-mapas.py, com as divisas dos estados brasileiros.
 */
export const CHURCH_MAPS: BibleMap[] = [
  {
    id: 'assembleia-de-deus-estados',
    title: 'A Assembleia de Deus estado por estado',
    period: '1911–1959',
    summary: 'Em que cidade, quando e por quem a igreja chegou a cada estado — e de onde saiu cada pessoa —, de Belém (1911) a Brasília (1959).',
    icon: 'pin_drop',
    bounds: [-74, -34, -32, 6],
    places: [
      { id: 'pa', name: 'Belém (PA)', lon: -48.49, lat: -1.46, label: 't' },
      { id: 'ce', name: 'Uruburetama (CE)', lon: -39.51, lat: -3.62, label: 't' },
      { id: 'al', name: 'Maceió (AL)', lon: -35.74, lat: -9.67, label: 'r' },
      { id: 'pb', name: 'Campina Grande (PB)', lon: -35.88, lat: -7.23, label: 'r' },
      { id: 'rr', name: 'Boa Vista (RR)', lon: -60.67, lat: 2.82, label: 'r' },
      { id: 'pe', name: 'Recife (PE)', lon: -34.88, lat: -8.05, label: 'r' },
      { id: 'ap', name: 'Macapá (AP)', lon: -51.07, lat: 0.03, label: 't' },
      { id: 'am', name: 'Manaus (AM)', lon: -60.02, lat: -3.12, label: 'b' },
      { id: 'rn', name: 'Natal (RN)', lon: -35.21, lat: -5.79, label: 'r' },
      { id: 'rj', name: 'Rio de Janeiro (RJ)', lon: -43.21, lat: -22.9, label: 'r' },
      { id: 'sc', name: 'Itajaí (SC)', lon: -48.66, lat: -26.91, label: 'r' },
      { id: 'ma', name: 'São Luís (MA)', lon: -44.3, lat: -2.53, label: 't' },
      { id: 'ro', name: 'Porto Velho (RO)', lon: -63.9, lat: -8.76, label: 'b' },
      { id: 'es', name: 'Vitória (ES)', lon: -40.31, lat: -20.32, label: 'r' },
      { id: 'sp', name: 'Santos (SP)', lon: -46.33, lat: -23.96, label: 'b' },
      { id: 'rs', name: 'Porto Alegre (RS)', lon: -51.23, lat: -30.03, label: 'l' },
      { id: 'ba', name: 'Canavieiras (BA)', lon: -38.95, lat: -15.68, label: 'r' },
      { id: 'mg', name: 'Belo Horizonte (MG)', lon: -43.94, lat: -19.92, label: 'l' },
      { id: 'se', name: 'Aracaju (SE)', lon: -37.07, lat: -10.91, label: 'r' },
      { id: 'pi', name: 'Teresina (PI)', lon: -42.8, lat: -5.09, label: 'b' },
      { id: 'pr', name: 'Curitiba (PR)', lon: -49.27, lat: -25.43, label: 'l' },
      { id: 'ac', name: 'Cruzeiro do Sul (AC)', lon: -72.67, lat: -7.63, label: 'r' },
      { id: 'go', name: 'Goiânia (GO)', lon: -49.25, lat: -16.68, label: 'l' },
      { id: 'mt', name: 'Cuiabá (MT)', lon: -56.1, lat: -15.6, label: 't' },
      { id: 'ms', name: 'Campo Grande (MS)', lon: -54.65, lat: -20.47, label: 'l' },
      { id: 'to', name: 'Tocantins', lon: -48.33, lat: -10.18, label: 'r' },
      { id: 'df', name: 'Brasília (DF)', lon: -47.88, lat: -15.79, label: 'r' },
    ],
    steps: [
      stateStep('pa', 'Gunnar Vingren e Daniel Berg vieram dos Estados Unidos. Na casa de Celina de Albuquerque, na Rua Siqueira Mendes, nasce em 18 de junho a Missão da Fé Apostólica.'),
      stateStep('ce', 'Saiu de Belém: Maria de Jesus Nazaré Araújo volta sozinha, de navio, para Uruburetama. É expulsa pela família, mas é acolhida no Sítio Santana; em 20 de julho, Adriano Nobre oficializa o trabalho.'),
      stateStep('pb', 'O paraibano Manoel Francisco do Bu volta a Campina Grande em dezembro trazendo a mensagem pentecostal; em 1922, o alfaiate Felipe Nery Fernandes mantém os cultos na sua casa.'),
      stateStep('al', 'Saíram de Belém: Gunnar Vingren desembarca em Jaraguá em maio; Otto Nelson chega em 21 de agosto, hospeda-se com o pescador Balbino Gomes e faz o primeiro culto quatro dias depois.'),
      stateStep('rr', 'Saiu de Belém: Cordolino Teixeira Bastos, que conheceu a fé pentecostal em Belém, chega à região do rio Branco com a família, onze pessoas.'),
      stateStep('pe', 'Saiu de Belém: Adriano Nobre é enviado ao Recife em 1916 e batiza os primeiros no Capibaribe; em outubro de 1918 entrega a igreja ao missionário sueco Joel Carlson.'),
      stateStep('ap', 'Saiu de Belém: o colombiano Clímaco Bueno Aza vende Bíblias em Macapá, é preso e tem as Bíblias queimadas. Em 27 de junho de 1917, com José de Matos Caravela, a igreja é fundada.'),
      stateStep('am', 'Saiu de Belém: Severino Moreno de Araújo reúne um pequeno grupo para ler a Bíblia e pede a Belém um pastor; Samuel e Lina Nyström organizam a igreja em 1º de janeiro de 1918.'),
      stateStep('rn', 'Primeiro culto na casa do soldado Luiz de França, em janeiro; a pedido de Francisco Cézar, os missionários enviam Adriano Nobre, que batiza seis crentes no rio Potengi.'),
      stateStep('rj', 'Saíram do Pará: crentes de Belém se reúnem na casa de Florinda e Eduardo Brito, em São Cristóvão; em 1924 chegam Gunnar e Frida Vingren, e a igreja é oficializada.'),
      stateStep('ma', 'Saiu de Belém: Clímaco Bueno Aza viaja dois dias pelo mar e prega de casa em casa em São Luís; a igreja é oficializada em 15 de janeiro de 1922, na Rua Sete de Setembro.'),
      stateStep('ro', 'O missionário americano Paul Aenis funda a igreja em Porto Velho, em 28 de fevereiro, com um grupo de seis pessoas, ao lado da Estrada de Ferro Madeira–Mamoré.'),
      stateStep('es', 'Saíram de Belém: Francisco Galdino Sobrinho e a esposa começam em Vitória; Daniel e Sara Berg trabalham com eles.'),
      stateStep('sp', 'Saíram do Recife: Vicente e Hermínia Lameira e Manoel Garcês começam na Ponta da Praia, em Santos, em maio; dias depois chegam Berg e Vingren. Em 1927, os Berg abrem o trabalho na capital.'),
      stateStep('rs', 'Saiu de Belém: o missionário sueco Gustav Nordlund. O primeiro culto em Porto Alegre, em 15 de abril, tem um só ouvinte, que entrou para fugir da chuva.'),
      stateStep('ba', 'Saiu do Pará: a baiana Joaquina de Souza Carvalho volta a Canavieiras com a mensagem pentecostal; em 1927 Belém envia o pastor João Pedro da Silva para batizar.'),
      stateStep('se', 'Saiu da igreja do Pará: o sargento Ormínio começa os cultos em Aracaju; como não podia batizar, Maceió envia o pastor João Pedro da Silva.'),
      stateStep('pi', 'Saíram de São Luís: obreiros da igreja do Maranhão. Raimundo Prudente de Almeida é lembrado em 1927; a igreja de Teresina é organizada em 1936.'),
      stateStep('mg', 'Clímaco Bueno Aza — o mesmo de Macapá e de São Luís — abre a igreja na sua casa alugada, no bairro Carlos Prates, em Belo Horizonte, em 17 de março.'),
      stateStep('pr', 'Bruno Skolimowski chega a Curitiba em outubro e prega aos imigrantes poloneses na língua deles.'),
      stateStep('sc', 'Saiu do Rio: André Bernardino da Silva, convertido em São Cristóvão, começa em 15 de março na casa de uma tia, perto do porto de Itajaí.'),
      stateStep('ac', 'Manoel Pirabas dos Santos começa a igreja em Cruzeiro do Sul, no extremo oeste do Brasil.'),
      stateStep('go', 'Saiu do Rio: Antônio do Carmo Moreira, diácono da igreja de Madureira e pedreiro nas obras da nova capital, começa a igreja em Goiânia.'),
      stateStep('mt', 'O pastor itinerante Eduardo Pablo Joerck é o primeiro a pregar a mensagem pentecostal em Cuiabá, debaixo de oposição. De 1974 a 2020, o pastor Sebastião Rodrigues de Souza, vindo de Minas Gerais, lidera a igreja. Algumas listas dão 1944 para Mato Grosso: provavelmente falam de Campo Grande, que fazia parte do estado até 1977.'),
      stateStep('ms', 'Juvenal Roque de Andrade começa a igreja em Campo Grande — na época, ainda no estado de Mato Grosso; o Mato Grosso do Sul só foi criado em 1977.'),
      stateStep('to', 'O SETA, Serviço de Evangelização dos Rios Araguaia e Tocantins, leva o evangelho às povoações das margens; uma fonte atribui a organização a Armando Chaves Cohen, em 1952.'),
      stateStep('df', 'Irmãos de vários estados chegam em 1957 para trabalhar na construção de Brasília; a igreja é fundada em Taguatinga, em maio de 1959.'),
    ],
    route: false,
    distances: false,
    zoom: 0.35,
    chapters: [],
    note: 'Cidades, nomes e datas da lista publicada pelo jornal Mensageiro da Paz e das histórias das igrejas estaduais. As linhas douradas ligam a cidade de onde a pessoa saiu à cidade aonde chegou, quando as fontes dizem. Algumas fontes divergem.',
  },
];
