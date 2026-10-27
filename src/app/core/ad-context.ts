/**
 * O tempo em que cada história aconteceu: guerras, epidemias, secas, crises, leis e migrações do Brasil e do mundo.
 * Os pioneiros não viviam fora do seu tempo: a fome, a guerra e a política também moldaram o que fizeram.
 * Cada fato é curto e confirmado em obras de história (veja TOPIC_SOURCES.contexto-ad). Mostrado nas páginas dos
 * estados (contextFor) e na linha do tempo (/assembleia-de-deus/linha-do-tempo).
 */

export type ContextKind = 'guerra' | 'saude' | 'economia' | 'politica' | 'clima' | 'violencia' | 'migracao' | 'lei' | 'igreja';

export const CONTEXT_ICONS: Record<ContextKind, string> = {
  guerra: 'shield',
  saude: 'medical_services',
  economia: 'payments',
  politica: 'account_balance',
  clima: 'water_drop',
  violencia: 'warning',
  migracao: 'luggage',
  lei: 'gavel',
  igreja: 'church',
};

export const CONTEXT_KIND_NAMES: Record<ContextKind, string> = {
  guerra: 'Guerra',
  saude: 'Saúde',
  economia: 'Economia',
  politica: 'Política',
  clima: 'Clima',
  violencia: 'Violência',
  migracao: 'Migração',
  lei: 'Lei',
  igreja: 'Igreja e sociedade',
};

export type Scope = 'mundo' | 'brasil' | 'norte' | 'nordeste' | 'sudeste' | 'sul' | 'centro-oeste';

export interface ContextEvent {
  id: string;
  /** Ano em que começa (para ordenar) e, se durou, em que termina. */
  from: number;
  to?: number;
  /** Como aparece escrito ("22 a 27 de novembro de 1910", "1914–1918"). */
  when: string;
  kind: ContextKind;
  /** Onde vale: o mundo, o país inteiro ou regiões. */
  scope: Scope[];
  /** Estados em que o fato pesou mais (siglas minúsculas); sobem na lista daqueles estados. */
  states?: string[];
  title: string;
  text: string;
}

export const CONTEXT_EVENTS: ContextEvent[] = [
  { id: 'lei-1890', from: 1890, when: '1890–1891', kind: 'lei', scope: ['brasil'], title: 'A lei separa a Igreja do Estado',
    text: 'Desde 1890 o Brasil não tem religião oficial. O Código Penal daquele ano já punia quem impedisse ou perturbasse o culto de qualquer religião (arts. 185 a 188), e a Constituição de 1891 tornou os cemitérios públicos laicos. Na prática, o poder dos padres e dos coronéis locais continuou grande.' },
  { id: 'chibata', from: 1910, when: '22 a 27 de novembro de 1910', kind: 'politica', scope: ['brasil'], title: 'A Revolta da Chibata',
    text: 'Três dias depois de Vingren e Berg chegarem a Belém, marinheiros se rebelaram no Rio de Janeiro contra os castigos de chibata na Marinha.' },
  { id: 'borracha-fim', from: 1912, to: 1920, when: 'a partir de 1912', kind: 'economia', scope: ['norte'], title: 'O fim do auge da borracha',
    text: 'A borracha da Amazônia, que enriquecera Belém e Manaus, perdeu mercado para as plantações da Ásia. A economia da região entrou em crise e muita gente ficou sem trabalho.' },
  { id: 'contestado', from: 1912, to: 1916, when: '1912–1916', kind: 'guerra', scope: ['sul'], states: ['pr', 'sc'], title: 'A Guerra do Contestado',
    text: 'No planalto entre o Paraná e Santa Catarina, sertanejos que seguiam um líder religioso, o “monge” José Maria, lutaram contra o Exército por terra e por fé. As estimativas de mortos vão de 5 mil a 25 mil.' },
  { id: 'ww1', from: 1914, to: 1918, when: '1914–1918', kind: 'guerra', scope: ['mundo'], title: 'A Primeira Guerra Mundial',
    text: 'A guerra abalou a Europa e o comércio do mundo. A Suécia, terra de Vingren, Berg e dos primeiros missionários, ficou neutra.' },
  { id: 'seca-1915', from: 1915, when: '1915', kind: 'clima', scope: ['nordeste'], states: ['ce'], title: 'A grande seca de 1915',
    text: 'No sertão do Ceará, a seca empurrou famílias para as cidades e para as frentes de obras públicas.' },
  { id: 'brasil-ww1', from: 1917, when: 'abril a outubro de 1917', kind: 'guerra', scope: ['brasil'], title: 'O Brasil entra na guerra',
    text: 'Depois que submarinos alemães afundaram navios brasileiros, o Brasil rompeu com a Alemanha (abril) e declarou guerra (26 de outubro de 1917). Estrangeiros passaram a ser vistos com desconfiança.' },
  { id: 'gripe', from: 1918, to: 1919, when: 'setembro de 1918 a 1919', kind: 'saude', scope: ['brasil'], title: 'A gripe espanhola',
    text: 'A epidemia chegou ao Brasil em setembro de 1918, num navio que parou em Recife, Salvador e Rio de Janeiro, e se espalhou pelas cidades do país. Matou até o presidente eleito, Rodrigues Alves, em janeiro de 1919.' },
  { id: 'cangaco', from: 1920, to: 1938, when: 'anos 1920 e 1930', kind: 'violencia', scope: ['nordeste'], states: ['al', 'pe', 'pb', 'ce', 'ba', 'se', 'rn'], title: 'O cangaço de Lampião',
    text: 'O bando de Lampião percorreu o sertão de vários estados do Nordeste até 1938, quando ele foi morto em Sergipe (28 de julho).' },
  { id: 'rj-1922', from: 1922, when: '1922', kind: 'politica', scope: ['sudeste'], states: ['rj', 'sp'], title: '1922: um ano de agitação no Rio e em São Paulo',
    text: 'O centenário da Independência reuniu a Semana de Arte Moderna (fevereiro) e a revolta dos Dezoito do Forte (5 de julho).' },
  { id: 'rs-1923', from: 1923, when: '1923', kind: 'guerra', scope: ['sul'], states: ['rs'], title: 'A revolução gaúcha de 1923',
    text: 'No Rio Grande do Sul, a luta entre os partidários do governador Borges de Medeiros e a oposição só terminou com o Pacto de Pedras Altas, em dezembro de 1923.' },
  { id: 'sp-1924', from: 1924, when: 'julho de 1924', kind: 'guerra', scope: ['sudeste'], states: ['sp'], title: 'A revolta de 1924 em São Paulo',
    text: 'Militares rebelados tomaram a cidade de São Paulo por cerca de três semanas, e ela foi bombardeada pelas tropas do governo.' },
  { id: 'coluna', from: 1925, to: 1927, when: '1925–1927', kind: 'guerra', scope: ['brasil'], title: 'A Coluna Prestes',
    text: 'Militares rebeldes marcharam cerca de 25 mil quilômetros pelo interior do país, atravessando treze estados e fugindo das tropas do governo.' },
  { id: 'crash', from: 1929, to: 1933, when: '1929–1933', kind: 'economia', scope: ['mundo'], title: 'A crise de 1929',
    text: 'A quebra da Bolsa de Nova York derrubou o preço do café, principal produto do Brasil, e arrastou a economia do país.' },
  { id: 'rev-1930', from: 1930, when: '3 de outubro de 1930', kind: 'politica', scope: ['brasil'], title: 'A Revolução de 1930',
    text: 'Semanas depois da primeira Convenção Geral das Assembleias de Deus (setembro, em Natal), começou a revolução que levou Getúlio Vargas ao poder.' },
  { id: 'leme', from: 1930, to: 1945, when: 'anos 1930 e 1940', kind: 'igreja', scope: ['brasil'], title: 'A Igreja Católica se reorganiza',
    text: 'Separada do Estado desde 1890, a Igreja Católica passou a se organizar para recuperar influência, sob a liderança do cardeal Dom Sebastião Leme. Os estudos mostram que, em muitas cidades, a chegada dos pentecostais era vista por padres e fiéis como uma disputa pelo campo religioso.' },
  { id: '1932-sp', from: 1932, when: 'julho a outubro de 1932', kind: 'guerra', scope: ['sudeste'], states: ['sp'], title: 'A Revolução Constitucionalista',
    text: 'São Paulo se levantou em armas contra o governo de Vargas e foi derrotado depois de quase três meses.' },
  { id: '1932-seca', from: 1932, when: '1932', kind: 'clima', scope: ['nordeste'], title: 'Uma nova seca no Nordeste',
    text: 'A seca de 1932 castigou o sertão nordestino, com fome e levas de retirantes.' },
  { id: 'estado-novo', from: 1937, to: 1945, when: '1937–1945', kind: 'politica', scope: ['brasil'], title: 'O Estado Novo',
    text: 'Em 10 de novembro de 1937, Getúlio Vargas fechou o Congresso e governou como ditador até 1945. O governo reforçou o nacionalismo e a vigilância sobre os estrangeiros.' },
  { id: 'oeste', from: 1938, to: 1950, when: 'a partir de 1938', kind: 'migracao', scope: ['centro-oeste'], states: ['go', 'mt', 'ms', 'df'], title: 'A Marcha para o Oeste',
    text: 'O governo de Vargas incentivou a ocupação do interior. Goiânia começou a ser construída em 1933, e em 1943 partiu a Expedição Roncador-Xingu.' },
  { id: 'ww2', from: 1939, to: 1945, when: '1939–1945', kind: 'guerra', scope: ['mundo'], title: 'A Segunda Guerra Mundial',
    text: 'O Brasil entrou na guerra em agosto de 1942, depois que submarinos alemães afundaram navios perto da costa de Sergipe e da Bahia, e enviou soldados à Itália em 1944.' },
  { id: 'borracha-2', from: 1942, to: 1945, when: '1942–1945', kind: 'migracao', scope: ['norte'], states: ['am', 'pa', 'ac'], title: 'A Batalha da Borracha',
    text: 'Com a guerra, o Brasil voltou a produzir borracha para os aliados, e dezenas de milhares de nordestinos foram levados para os seringais da Amazônia.' },
  { id: 'territorios', from: 1943, when: '13 de setembro de 1943', kind: 'politica', scope: ['norte'], states: ['ap', 'rr', 'ro'], title: 'Os territórios federais',
    text: 'O governo criou os territórios federais do Amapá, do Rio Branco (hoje Roraima) e do Guaporé (hoje Rondônia), para ocupar a fronteira.' },
  { id: 'vargas-1954', from: 1954, when: '24 de agosto de 1954', kind: 'politica', scope: ['brasil'], title: 'A morte de Getúlio Vargas',
    text: 'Presidente de novo desde 1951, escolhido pelo voto, Vargas se matou no auge de uma grave crise política.' },
  { id: 'exodo', from: 1950, to: 1975, when: 'anos 1950 a 1970', kind: 'migracao', scope: ['brasil'], title: 'O êxodo do campo',
    text: 'Milhões de brasileiros deixaram o campo, sobretudo do Nordeste, rumo às cidades do Sudeste, a Brasília e, depois, à fronteira agrícola do Centro-Oeste e do Norte.' },
  { id: 'brasilia', from: 1956, to: 1960, when: '1956–1960', kind: 'migracao', scope: ['centro-oeste'], states: ['df', 'go'], title: 'A construção de Brasília',
    text: 'O presidente Juscelino Kubitschek construiu a nova capital em poucos anos; ela foi inaugurada em 21 de abril de 1960. Milhares de trabalhadores, os candangos, vieram de todo o país.' },
  { id: 'militares', from: 1964, to: 1985, when: '1964–1985', kind: 'politica', scope: ['brasil'], title: 'O regime militar',
    text: 'De 1964 a 1985, o Brasil foi governado por militares. Nos anos 1970, o governo abriu estradas e projetos de colonização na Amazônia e no Centro-Oeste.' },
  { id: 'colonizacao-mt', from: 1970, to: 1986, when: 'anos 1970 e 1980', kind: 'migracao', scope: ['centro-oeste', 'norte'], states: ['mt', 'ro'], title: 'A colonização do norte de Mato Grosso',
    text: 'Com a BR-163 (Cuiabá–Santarém) e projetos de colonização privados, milhares de famílias do Sul do país, em sua maioria agricultores, chegaram ao norte de Mato Grosso. Sinop foi fundada em 14 de setembro de 1974, e Sorriso nasceu da colonização dos anos 1970.' },
  { id: 'ms-1977', from: 1977, to: 1979, when: '1977–1979', kind: 'politica', scope: ['centro-oeste'], states: ['ms', 'mt'], title: 'Nasce o Mato Grosso do Sul',
    text: 'O estado foi criado em 1977, dividindo-se de Mato Grosso, e instalado em 1979.' },
  { id: 'inflacao', from: 1980, to: 1994, when: '1980–1994', kind: 'economia', scope: ['brasil'], title: 'Inflação e crise',
    text: 'Nos anos 1980 e no começo dos anos 1990, a inflação alta corroía o salário das famílias. Só o Plano Real, em 1994, a controlou.' },
  { id: 'const-88', from: 1988, when: '5 de outubro de 1988', kind: 'lei', scope: ['brasil'], states: ['to'], title: 'A Constituição de 1988',
    text: 'Garantiu a liberdade de crença e de culto e criou o estado do Tocantins, antes o norte de Goiás.' },
];

/** Região de cada estado (siglas minúsculas). */
export const REGION_SCOPE: Record<string, Scope> = {
  ac: 'norte', ap: 'norte', am: 'norte', pa: 'norte', ro: 'norte', rr: 'norte', to: 'norte',
  al: 'nordeste', ba: 'nordeste', ce: 'nordeste', ma: 'nordeste', pb: 'nordeste', pe: 'nordeste', pi: 'nordeste', rn: 'nordeste', se: 'nordeste',
  es: 'sudeste', mg: 'sudeste', rj: 'sudeste', sp: 'sudeste',
  pr: 'sul', rs: 'sul', sc: 'sul',
  df: 'centro-oeste', go: 'centro-oeste', mt: 'centro-oeste', ms: 'centro-oeste',
};

/**
 * Fatos do tempo de um estado. Um fato vale para o estado se citar o estado, se for do país ou do mundo, ou se for da
 * região do estado e não restringir a estados. Os do próprio estado vêm primeiro, depois os da região, do país e do mundo;
 * só entram os que caem no período da história (com folga de seis anos, para dar o clima da época) e, se houver muitos, os mais próximos.
 */
export function contextFor(uf: string, span: [number, number], max = 8): ContextEvent[] {
  const region = REGION_SCOPE[uf];
  const [start, end] = [span[0] - 6, span[1] + 6];
  const fits = (e: ContextEvent) => e.from <= end && (e.to ?? e.from) >= start;
  const applies = (e: ContextEvent) =>
    !!e.states?.includes(uf) || e.scope.includes('brasil') || e.scope.includes('mundo') || (e.scope.includes(region) && !e.states);
  const score = (e: ContextEvent) => (e.states?.includes(uf) ? 3 : e.scope.includes(region) ? 2 : e.scope.includes('brasil') ? 1 : 0);
  return CONTEXT_EVENTS.filter((e) => fits(e) && applies(e))
    .sort((a, b) => score(b) - score(a) || a.from - b.from)
    .slice(0, max)
    .sort((a, b) => a.from - b.from);
}
