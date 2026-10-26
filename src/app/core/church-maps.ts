import type { BibleMap } from './maps';

/**
 * Mapas da história da Igreja (fora da Bíblia). Usam o mesmo mapa interativo dos mapas bíblicos;
 * em cada etapa, "ref" é a data (aparece como texto, não como referência bíblica).
 * Geografia gerada por tools/gerar-mapas.py, com as divisas dos estados brasileiros.
 */
export const CHURCH_MAPS: BibleMap[] = [
  {
    id: 'assembleia-de-deus-no-brasil',
    title: 'A Assembleia de Deus pelo Brasil',
    period: '1910–1930',
    summary: 'De Belém do Pará ao Nordeste, ao Rio de Janeiro e a São Paulo: o caminho da mensagem pentecostal nos primeiros vinte anos.',
    icon: 'church',
    bounds: [-74, -34, -32, 6],
    places: [
      { id: 'belem', name: 'Belém', lon: -48.49, lat: -1.46, label: 't' },
      { id: 'manaus', name: 'Manaus', lon: -60.02, lat: -3.12, label: 't' },
      { id: 'fortaleza', name: 'Fortaleza', lon: -38.54, lat: -3.73, label: 't' },
      { id: 'natal', name: 'Natal', lon: -35.21, lat: -5.79, label: 'r' },
      { id: 'recife', name: 'Recife', lon: -34.88, lat: -8.05, label: 'r' },
      { id: 'maceio', name: 'Maceió', lon: -35.74, lat: -9.67, label: 'r' },
      { id: 'salvador', name: 'Salvador', lon: -38.5, lat: -12.97, label: 'r' },
      { id: 'vitoria', name: 'Vitória', lon: -40.31, lat: -20.32, label: 'r' },
      { id: 'rio', name: 'Rio de Janeiro', lon: -43.21, lat: -22.9, label: 'r' },
      { id: 'santos', name: 'Santos', lon: -46.33, lat: -23.96, label: 'b' },
      { id: 'sao-paulo', name: 'São Paulo', lon: -46.63, lat: -23.55, label: 'l' },
      { id: 'porto-alegre', name: 'Porto Alegre', lon: -51.23, lat: -30.03, label: 'l' },
      { id: 'brasilia', name: 'Brasília', lon: -47.88, lat: -15.79, label: 'l' },
      { id: 'amazonia', name: 'Amazônia', lon: -62, lat: -7, region: true },
      { id: 'nordeste', name: 'Nordeste', lon: -40.5, lat: -7.5, region: true },
      { id: 'atlantico', name: 'Oceano Atlântico', lon: -37, lat: -26, region: true },
    ],
    steps: [
      { place: 'belem', ref: '1910–1911', text: 'Gunnar Vingren e Daniel Berg chegam em 19 de novembro de 1910. Em 18 de junho de 1911 nasce a Missão da Fé Apostólica. Pelos rios, a mensagem chega a Manaus em 1917.' },
      { place: 'fortaleza', ref: 'c. 1914', text: 'Crentes que migravam levam a mensagem ao Nordeste: Ceará, Paraíba e Alagoas recebem os primeiros trabalhos.' },
      { place: 'recife', ref: '1916–1918', text: 'Adriano Nobre é enviado ao Recife em 1916; em 1918 chegam os missionários Joel e Signe Carlson. As fontes locais divergem sobre o começo.' },
      { place: 'vitoria', ref: '1922', text: 'Daniel Berg e a esposa, Sara, fundam a igreja em Vitória, no Espírito Santo.' },
      { place: 'rio', ref: '1922–1924', text: 'A igreja se estabelece em São Cristóvão (1922). Em 1924 chegam Gunnar e Frida Vingren, e o Rio vira o novo centro da obra.' },
      { place: 'santos', ref: '1924', text: 'Os Berg iniciam a primeira Assembleia de Deus do estado de São Paulo.' },
      { place: 'sao-paulo', ref: '1927–1930', text: 'Daniel Berg trabalha na capital paulista. Do Sudeste, a igreja avança para o Sul e o interior. Em 1930, em Natal, a primeira Convenção Geral passa a liderança aos pastores brasileiros.' },
    ],
    distances: true,
    zoom: 0.4,
    chapters: [],
    note: 'Datas segundo a história oficial e as igrejas de cada estado; algumas fontes locais divergem. Linhas retas, só para mostrar a ordem do caminho.',
  },
];
