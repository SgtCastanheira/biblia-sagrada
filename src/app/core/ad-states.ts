/**
 * A Assembleia de Deus em cada estado: a cidade onde começou, de onde saíram os pioneiros e a história
 * completa (public/conteudo/ad-estados/<id>.md). O id é a sigla do estado, a mesma dos lugares do mapa
 * "assembleia-de-deus-estados" (church-maps.ts).
 */

export type Region = 'Norte' | 'Nordeste' | 'Sudeste' | 'Sul' | 'Centro-Oeste';

export interface AdState {
  /** Sigla em minúsculas (ex.: "ce"). */
  id: string;
  state: string;
  region: Region;
  /** Cidade onde a igreja começou no estado. */
  city: string;
  year: string;
  /** Sigla do estado de onde saíram os pioneiros, quando as fontes dizem. */
  from?: string;
  /** De onde vieram os pioneiros, em uma linha. */
  origin: string;
  summary: string;
  /** Anos que a história cobre (para escolher o contexto do tempo). */
  span: [number, number];
  /** Fontes específicas deste estado (além da lista do Mensageiro da Paz). */
  sources: string[];
}

/** Convenção nacional a que um ministério pertence. */
export type Body = 'CGADB' | 'CONAMAD' | 'CADB' | 'Outro';

export interface StateMinistry {
  name: string;
  body: Body;
  text: string;
}

export const BODIES: Record<Body, { name: string; text: string }> = {
  CGADB: { name: 'Convenção Geral (CGADB) · “Missão”', text: 'Nascida em 1930, em Natal, herdeira dos missionários suecos. Reúne cerca de 63 convenções estaduais e regionais; cada igreja-sede tem o seu pastor-presidente.' },
  CONAMAD: { name: 'Ministério de Madureira (CONAMAD)', text: 'Nascido em 1929 no Rio de Janeiro, com convenção nacional desde 1958 e independente da CGADB desde 1989. Tem 28 convenções estaduais e sede em Brasília; o governo é episcopal, com bispos.' },
  CADB: { name: 'Convenção da Assembleia de Deus no Brasil (CADB)', text: 'Fundada em Belém em dezembro de 2017, quando cerca de 10 mil pastores deixaram a CGADB com Samuel Câmara. Ordena mulheres e tem sede em São Cristóvão, no Rio.' },
  Outro: { name: 'Ministério independente', text: 'Igrejas que se organizaram fora das grandes convenções nacionais.' },
};

/**
 * Convenções estaduais e regionais filiadas à CGADB, por estado (lista oficial em cgadb.org.br/convencoes).
 * A CONAMAD tem convenção em todos os estados; a CADB disse estar em 26 unidades da federação ao ser fundada.
 */
export const CGADB_CONVENTIONS: Record<string, string[]> = {
  ac: ['CEIMADAC — Convenção Estadual de Igrejas e Ministros das Assembleias de Deus no Acre'],
  ap: ['CEMEADAP — Convenção Estadual dos Ministros das Igrejas Assembleias de Deus no Amapá'],
  am: ['CEADTAM — Convenção Estadual da Assembleia de Deus Tradicional no Amazonas'],
  pa: ['COMIEADEPA — Convenção Estadual das Igrejas Assembleias de Deus no Pará', 'CIADSETA-PA/MT — Convenção Interestadual das Assembleias de Deus do SETA no Pará e em Mato Grosso', 'CIMADMUBE — Convenção das Assembleias de Deus do Utinga, em Belém', 'CONFRADESPA'],
  ro: ['CEMADERON — Convenção Estadual dos Ministros das Assembleias de Deus em Rondônia'],
  rr: ['CEDADER — Convenção Estadual das Assembleias de Deus em Roraima', 'COMADER — Convenção de Ministros das Assembleias de Deus em Roraima'],
  to: ['CIADSETA-TO — Convenção Interestadual das Assembleias de Deus do SETA', 'COIMADETINS — Convenção de Igrejas e Ministros das Assembleias de Deus no Tocantins'],
  al: ['COMADAL — Convenção das Assembleias de Deus em Alagoas'],
  ba: ['CEADEB — Convenção Estadual das Assembleias de Deus na Bahia', 'CONFRAMADEB — Convenção Fraternal dos Ministros das Assembleias de Deus na Bahia'],
  ce: ['CONADEC — Convenção das Assembleias de Deus no Ceará', 'CIMADEC — Convenção de Igrejas e Ministros das Assembleias de Deus no Ceará', 'CONFRADECE — Convenção Fraternal de Ministros das Assembleias de Deus no Ceará', 'COMADECE — Convenção de Ministros da Assembleia de Deus Bela Vista no Ceará'],
  ma: ['CEADEMA — Convenção Estadual da Assembleia de Deus no Maranhão', 'COMADESMA — Convenção das Assembleias de Deus do SETA no Sul do Maranhão'],
  pb: ['COMEAD — Convenção de Ministros da Assembleia de Deus de Campina Grande e da Paraíba', 'COMADEP — Convenção de Ministros das Assembleias de Deus na Paraíba'],
  pe: ['CONADEPE — Convenção da Assembleia de Deus de Pernambuco', 'COMADALPE — Convenção Estadual de Ministros da Assembleia de Deus (sede em Abreu e Lima)'],
  pi: ['CEADEP — Convenção das Igrejas Assembleias de Deus do Piauí'],
  rn: ['CEMADERN — Convenção Estadual das Assembleias de Deus no Rio Grande do Norte'],
  se: ['CMIADESE — Convenção das Assembleias de Deus em Sergipe'],
  df: ['CEADDIF — Convenção Evangélica das Assembleias de Deus no Distrito Federal', 'COMADEBG — Convenção dos Ministros das Assembleias de Deus de Brasília e Goiás', 'COMADEPLAN — Convenção dos Ministros das Assembleias de Deus do Planalto Central'],
  mt: ['COMADEMAT — Convenção dos Ministros das Assembleias de Deus em Mato Grosso (Cuiabá)', 'CIADSETA-PA/MT — Convenção Interestadual do SETA no Pará e em Mato Grosso'],
  ms: ['COMADEMS — Convenção dos Ministros das Assembleias de Deus em Mato Grosso do Sul', 'CONFRADEMS'],
  go: ['CADESGO — Convenção das Assembleias de Deus em Goiás', 'CONFRAMADEGO — Convenção Fraternal das Assembleias de Deus em Goiás', 'CIMADSETA — Convenção Interestadual das Assembleias de Deus do SETA'],
  es: ['CADEESO — Convenção das Assembleias de Deus no Espírito Santo e outros', 'CEMADES — Convenção Evangélica dos Ministros das Assembleias de Deus no Espírito Santo', 'COMADEESO', 'CONFRADEESTO', 'CEADES — Convenção de Pastores e Evangelistas das Assembleias de Deus no Espírito Santo'],
  mg: ['COMADEMG — Convenção dos Ministros das Assembleias de Deus em Minas Gerais', 'COMADETRIM — Triângulo Mineiro', 'COMADVARDO — Vale do Rio Doce', 'COMADELESTE — Leste de Minas', 'CIMADEMIGO', 'CONFRADEMGO'],
  rj: ['CEADER — Convenção Evangélica das Assembleias de Deus no Rio de Janeiro', 'CONFRADERJ', 'COMADERJ', 'CEADERJ', 'CPEADERJ', 'COMAERJ', 'COMIADEF — Assembleia de Deus Fluminense'],
  sp: ['CONFRADESP', 'COMADESPE', 'CIEADESPEL — Convenção das Assembleias de Deus em São Paulo e estados limítrofes', 'COMOESPO'],
  pr: ['CIEADEP — Convenção das Igrejas Assembleias de Deus no Paraná'],
  rs: ['CIEPADERGS — Convenção das Igrejas e Pastores da Assembleia de Deus no Rio Grande do Sul'],
  sc: ['CIADESCP — Convenção da Assembleia de Deus de Santa Catarina e Sudoeste do Paraná'],
};

/** O que se sabe, com fonte, sobre os ministérios de cada estado além da lista de convenções. */
export const STATE_MINISTRIES: Record<string, StateMinistry[]> = {
  pa: [
    { name: 'A igreja-mãe de Belém', body: 'CADB', text: 'A primeira Assembleia de Deus do Brasil, pastoreada por Samuel Câmara. Em novembro de 2017, os pastores da sua convenção aprovaram por unanimidade a saída da CGADB, e em 2 de dezembro de 2017 foi fundada, no Templo Central de Belém, a CADB.' },
    { name: 'As convenções da CGADB no Pará', body: 'CGADB', text: 'Depois de 2017, continuaram no Pará convenções filiadas à CGADB, como a COMIEADEPA e as convenções do SETA.' },
  ],
  am: [
    { name: 'IEADAM — a igreja pioneira de Manaus', body: 'CADB', text: 'Liderada por Jônatas Câmara. A sua convenção, a CEADAM, deixou a CGADB em novembro de 2017 e ajudou a fundar a CADB. Depois da separação, a igreja passou a ordenar mulheres.' },
    { name: 'CEADTAM', body: 'CGADB', text: 'A Assembleia de Deus Tradicional no Amazonas continuou ligada à CGADB.' },
  ],
  ap: [{ name: 'A separação de 2017', body: 'CADB', text: 'Em 2017, líderes das Assembleias de Deus do Amapá, com cerca de 2.500 obreiros, anunciaram a saída da CGADB para a CADB. A CEMEADAP continua na lista da CGADB.' }],
  to: [{ name: 'A Assembleia de Deus do SETA', body: 'CGADB', text: 'O Serviço de Evangelização dos Rios Araguaia e Tocantins virou a convenção CIADSETA, com sede em Palmas, mais de 1.200 ministros e cerca de 70 mil membros (2023). Dela nasceram convenções no sul do Maranhão, no Pará, em Mato Grosso, em Goiás e em Brasília.' }],
  mt: [{ name: 'A Assembleia de Deus em Cuiabá', body: 'CGADB', text: 'A igreja pioneira, liderada de 1974 a 2020 pelo pastor Sebastião Rodrigues de Souza, que foi vice-presidente da CGADB.' }],
  go: [
    { name: 'A igreja nascida de Madureira', body: 'CONAMAD', text: 'A igreja pioneira de Goiânia nasceu em 1936 de um grupo de crentes da igreja de Madureira, com o diácono Antônio Moreira. A Assembleia de Deus Campo de Campinas, em Goiânia, está ligada à CONAMAD; o seu líder, Oídes José do Carmo, é bispo da convenção.' },
    { name: 'As convenções da CGADB em Goiás', body: 'CGADB', text: 'A CADESGO, a CONFRAMADEGO e a convenção do SETA reúnem as igrejas ligadas à Convenção Geral.' },
  ],
  df: [
    { name: 'A sede nacional de Madureira', body: 'CONAMAD', text: 'Desde 1999, a CONAMAD tem sede em Brasília; a igreja-sede é a Catedral Baleia, na Asa Sul.' },
    { name: 'As convenções da CGADB no DF', body: 'CGADB', text: 'A CEADDIF, a COMADEBG e a COMADEPLAN reúnem as igrejas ligadas à Convenção Geral no Distrito Federal e no entorno.' },
  ],
  rj: [
    { name: 'São Cristóvão', body: 'CADB', text: 'A igreja pioneira do Rio, onde Gunnar Vingren foi pastor, é hoje a sede da CADB no Rio de Janeiro. Em 2006 passou a se chamar Assembleia de Deus Missão Apostólica da Fé, o nome original de 1911.' },
    { name: 'Madureira', body: 'CONAMAD', text: 'O ministério começado em 1929 no subúrbio do Rio deu origem à CONAMAD. A igreja-mãe de Madureira é pastoreada desde 2006 por Abner Ferreira.' },
    { name: 'Vitória em Cristo', body: 'Outro', text: 'A antiga Assembleia de Deus da Penha, fundada em 1959, passou a se chamar Assembleia de Deus Vitória em Cristo em 2010, sob o pastor Silas Malafaia.' },
    { name: 'As convenções da CGADB no Rio', body: 'CGADB', text: 'Sete convenções estaduais e regionais ligadas à Convenção Geral, que tem a sua sede no Rio de Janeiro.' },
  ],
  sp: [
    { name: 'Ministério do Belém', body: 'CGADB', text: 'Com sede no Belenzinho, na capital, nasceu do trabalho dos missionários suecos; foi presidido por Daniel Berg, Samuel Nyström e Bruno Skolimowski, por Cícero Canuto de Lima a partir de 1946 e depois por José Wellington Bezerra da Costa, que presidiu também a CGADB por cerca de 25 anos. Tem cerca de 2.200 igrejas, sobretudo no Centro-Sul.' },
    { name: 'Ministério do Brás (ADBrás)', body: 'CONAMAD', text: 'Fundado em 13 de julho de 1938, foi a primeira congregação de Madureira no estado de São Paulo. É liderado desde 2006 pelo bispo Samuel Ferreira.' },
    { name: 'Ministérios que saíram de Madureira', body: 'Outro', text: 'Da CONAMAD separaram-se, entre outros, os ministérios de São Bernardo do Campo (1993), Nova Gerty (2002), Santo Amaro (2003) e Perus (2006).' },
  ],
};


export const REGIONS: Region[] = ['Norte', 'Nordeste', 'Sudeste', 'Sul', 'Centro-Oeste'];

export const AD_STATES: AdState[] = [
  // Norte
  { id: 'pa', state: 'Pará', region: 'Norte', city: 'Belém', year: '1911', origin: 'Gunnar Vingren e Daniel Berg vieram dos Estados Unidos', summary: 'A igreja-mãe: da casa de Celina de Albuquerque às vilas da Estrada de Ferro Belém–Bragança e à Ilha de Marajó.', span: [1910, 1919], sources: ['Ivar Vingren, O diário do pioneiro Gunnar Vingren (CPAD)', 'Daniel Berg, Enviado por Deus (CPAD)'] },
  { id: 'rr', state: 'Roraima', region: 'Norte', city: 'Boa Vista', year: '1915', from: 'pa', origin: 'Saiu de Belém: Cordolino Teixeira Bastos e a família', summary: 'Uma família de onze pessoas leva a fé de Belém para a região do rio Branco.', span: [1915, 1948], sources: ['Folha de Boa Vista: os 100 anos da Assembleia de Deus em Roraima'] },
  { id: 'ap', state: 'Amapá', region: 'Norte', city: 'Macapá', year: '1916–1917', from: 'pa', origin: 'Saiu de Belém: o colombiano Clímaco Bueno Aza', summary: 'Bíblias vendidas de casa em casa, uma prisão, Bíblias queimadas — e a primeira igreja evangélica do Amapá.', span: [1916, 1920], sources: ['Governo do Amapá e jornais locais sobre o centenário da Assembleia de Deus no Amapá', 'Besaliel Rodrigues, História da Assembleia de Deus — a pioneira (2001)'] },
  { id: 'am', state: 'Amazonas', region: 'Norte', city: 'Manaus', year: '1917–1918', from: 'pa', origin: 'Saiu de Belém: Severino Moreno de Araújo', summary: 'Um pequeno grupo lendo a Bíblia pede a Belém que envie um pastor, e os Nyström organizam a igreja.', span: [1917, 1936], sources: ['Jornal do Commercio (Manaus): os 100 anos da Assembleia de Deus', 'Centenário IEADAM'] },
  { id: 'ro', state: 'Rondônia', region: 'Norte', city: 'Porto Velho', year: '1922', origin: 'O missionário americano Paul Aenis', summary: 'Às margens da Estrada de Ferro Madeira–Mamoré, seis pessoas começam a igreja de Porto Velho.', span: [1922, 1943], sources: ['Senado Federal (2002) e Prefeitura de Porto Velho: aniversário da Assembleia de Deus em Rondônia'] },
  { id: 'ac', state: 'Acre', region: 'Norte', city: 'Cruzeiro do Sul', year: '1932', origin: 'Manoel Pirabas dos Santos', summary: 'No extremo oeste do Brasil, a igreja começa em Cruzeiro do Sul.', span: [1932, 1943], sources: ['José Batista de Oliveira, dissertação (PUC Goiás) sobre as Assembleias de Deus no Acre'] },
  { id: 'to', state: 'Tocantins', region: 'Norte', city: 'Rios Tocantins e Araguaia', year: '1948–1952', origin: 'O SETA, serviço de evangelização pelos rios', summary: 'A evangelização pelos rios — o SETA —, numa região que só se tornaria estado em 1988.', span: [1948, 1988], sources: ['Assembleia Legislativa do Tocantins e Conexão Tocantins: os 75 anos da CIADSETA (2023)'] },
  // Nordeste
  { id: 'ce', state: 'Ceará', region: 'Nordeste', city: 'Uruburetama (Itapajé)', year: '1914', from: 'pa', origin: 'Saiu de Belém: Maria de Jesus Nazaré Araújo, de volta à sua terra', summary: 'Uma mulher volta sozinha de navio, é expulsa pela família — e a semente cresce num sítio do sertão.', span: [1914, 1922], sources: ['Assembleia Legislativa do Ceará: projeto de lei 368/2021', 'O Povo (2022) e centenário da Assembleia de Deus em Fortaleza'] },
  { id: 'pb', state: 'Paraíba', region: 'Nordeste', city: 'Campina Grande', year: '1914', origin: 'O paraibano Manoel Francisco do Bu, de volta à sua cidade', summary: 'Um filho da terra traz a mensagem a Campina Grande; um alfaiate mantém os cultos em casa.', span: [1914, 1927], sources: ['Igreja Assembleia de Deus em Campina Grande: história e centenário', 'Revista Religare (UFPB), v. 21, 2024'] },
  { id: 'al', state: 'Alagoas', region: 'Nordeste', city: 'Maceió', year: '1915', from: 'pa', origin: 'Saíram de Belém: Gunnar Vingren e o missionário Otto Nelson', summary: 'Um missionário sueco desembarca, hospeda-se com um pescador e faz o primeiro culto quatro dias depois.', span: [1915, 1945], sources: ['Assembleia de Deus no Estado de Alagoas: história', 'UFAL: o papel dos missionários suecos na fundação da Assembleia de Deus em Alagoas (1915–1930)'] },
  { id: 'pe', state: 'Pernambuco', region: 'Nordeste', city: 'Recife', year: '1916–1918', from: 'pa', origin: 'Saiu de Belém: Adriano Nobre', summary: 'Batismos no Capibaribe, a chegada dos Carlson e o primeiro templo na Encruzilhada.', span: [1916, 1928], sources: ['Wikipédia: Assembleia de Deus em Pernambuco', 'IEADPE: história'] },
  { id: 'rn', state: 'Rio Grande do Norte', region: 'Nordeste', city: 'Natal', year: '1918', from: 'pe', origin: 'Adriano Nobre, enviado pelos missionários a pedido de Francisco Cézar', summary: 'Um culto na casa de um soldado, seis batismos no Potengi e, anos depois, a primeira Convenção Geral.', span: [1918, 1937], sources: ['IEADERN: centenário', 'Assembleia Legislativa do RN e Câmara Municipal de Natal: homenagens à Assembleia de Deus'] },
  { id: 'ma', state: 'Maranhão', region: 'Nordeste', city: 'São Luís', year: '1921–1922', from: 'pa', origin: 'Saiu de Belém: Clímaco Bueno Aza', summary: 'Dois dias de mar, pregação de casa em casa e a fundação na Rua Sete de Setembro.', span: [1920, 1957], sources: ['IADESL: história da Assembleia de Deus em São Luís', 'Revista Cristão Alerta: quem foi Clímaco Bueno Aza'] },
  { id: 'ba', state: 'Bahia', region: 'Nordeste', city: 'Canavieiras', year: '1926', from: 'pa', origin: 'Saiu do Pará: a baiana Joaquina de Souza Carvalho, de volta à sua terra', summary: 'Uma mulher de Canavieiras traz a mensagem do Pará; Belém envia um pastor para batizar.', span: [1926, 1930], sources: ['Assembleia Legislativa da Bahia: sessões sobre a Assembleia de Deus', 'Sistema EBD: biografia do pastor Teodoro Feliciano Santana'] },
  { id: 'se', state: 'Sergipe', region: 'Nordeste', city: 'Aracaju', year: '1927', from: 'pa', origin: 'Saiu da igreja do Pará: o sargento do Exército Ormínio', summary: 'Um sargento que não podia batizar pede ajuda a Maceió — e a igreja nasce na Avenida Maranhão.', span: [1927, 1949], sources: ['IEADSE: 91 anos das Assembleias de Deus em Sergipe', 'Augusto César Santiago Teixeira, dissertação (UFS)'] },
  { id: 'pi', state: 'Piauí', region: 'Nordeste', city: 'Teresina', year: '1927–1936', from: 'ma', origin: 'Saíram de São Luís: obreiros da igreja do Maranhão', summary: 'De São Luís para Teresina: os primeiros passos em 1927 e a organização em 1936.', span: [1927, 1953], sources: ['IADESL: linha do tempo dos presidentes'] },
  // Sudeste
  { id: 'es', state: 'Espírito Santo', region: 'Sudeste', city: 'Vitória', year: '1922', from: 'pa', origin: 'Saíram de Belém: Francisco Galdino Sobrinho e a esposa; depois, Daniel e Sara Berg', summary: 'Um casal enviado de Belém e os Berg começam a obra na capital capixaba.', span: [1922, 1924], sources: ['Assembleia de Deus em Santo Antônio (Vitória): história'] },
  { id: 'rj', state: 'Rio de Janeiro', region: 'Sudeste', city: 'Rio de Janeiro (São Cristóvão)', year: '1922–1924', from: 'pa', origin: 'Saíram do Pará: crentes de Belém e, em 1924, Gunnar e Frida Vingren', summary: 'Da casa de Florinda e Eduardo Brito ao salão da Rua Escobar: São Cristóvão, mãe de muitos ministérios.', span: [1920, 1924], sources: ['Portal CADB: a histórica igreja de São Cristóvão', 'Rádio Betel e SENAMI: o centenário da Assembleia de Deus no Rio'] },
  { id: 'sp', state: 'São Paulo', region: 'Sudeste', city: 'Santos', year: '1924', from: 'pe', origin: 'Saíram do Recife: Vicente e Hermínia Lameira e Manoel Garcês', summary: 'Pentecostais vindos do Recife começam na Ponta da Praia; os Berg chegam e, em 1927, vão para a capital.', span: [1923, 1927], sources: ['Histórias da Assembleia de Deus em Santos e na cidade de São Paulo'] },
  { id: 'mg', state: 'Minas Gerais', region: 'Sudeste', city: 'Belo Horizonte', year: '1927', origin: 'O colombiano Clímaco Bueno Aza, o mesmo de Macapá e São Luís', summary: 'O pioneiro de três capitais abre a igreja na própria casa, no bairro Carlos Prates.', span: [1927, 1927], sources: ['Memorial AD-BH e Assembleia de Deus em Belo Horizonte: 96 anos de história'] },
  // Sul
  { id: 'rs', state: 'Rio Grande do Sul', region: 'Sul', city: 'Porto Alegre', year: '1924', from: 'pa', origin: 'Saiu de Belém: o missionário sueco Gustav Nordlund e a família', summary: 'O primeiro culto teve um único ouvinte, abrigado da chuva. O missionário ficou trinta anos.', span: [1924, 1955], sources: ['Assembleia de Deus de Porto Alegre: nossas raízes e centenário'] },
  { id: 'pr', state: 'Paraná', region: 'Sul', city: 'Curitiba', year: '1928', origin: 'Bruno Skolimowski, um dos primeiros pastores separados em Belém', summary: 'Um pastor que pregava aos imigrantes poloneses na língua deles.', span: [1928, 1928], sources: ['Histórias das igrejas locais (lista dos primeiros passos)'] },
  { id: 'sc', state: 'Santa Catarina', region: 'Sul', city: 'Itajaí', year: '1931', from: 'rj', origin: 'Saiu do Rio: André Bernardino da Silva, convertido em São Cristóvão', summary: 'Um jovem convertido no Rio começa na casa de uma tia, perto do porto de Itajaí.', span: [1931, 1932], sources: ['Mário Sérgio de Santana: os 80 e os 90 anos da Assembleia de Deus em Santa Catarina', 'Rádio Educadora: 94 anos da Assembleia de Deus em Santa Catarina'] },
  // Centro-Oeste
  { id: 'go', state: 'Goiás', region: 'Centro-Oeste', city: 'Goiânia', year: '1936', from: 'rj', origin: 'Saiu do Rio: o diácono Antônio do Carmo Moreira, da igreja de Madureira', summary: 'Um pedreiro das obras da nova capital começa a igreja em Goiânia.', span: [1936, 1940], sources: ['Jornal Opção: a Assembleia de Deus em Goiás', 'Oeste Goiano: quando a Assembleia de Deus chega a Goiás', 'AD Anápolis: nossa história'] },
  { id: 'mt', state: 'Mato Grosso', region: 'Centro-Oeste', city: 'Cuiabá', year: '1936', origin: 'O pastor itinerante Eduardo Pablo Joerck', summary: 'Um pregador itinerante planta a igreja em Cuiabá; de 1974 a 2020, o pastor Sebastião Rodrigues de Souza a vê crescer de sete congregações para mais de duas mil.', span: [1936, 1986], sources: ['Assembleia Legislativa de Mato Grosso: documentos sobre a Assembleia de Deus em Cuiabá e a Comenda Pastor Sebastião Rodrigues de Souza', 'MidiaNews, Folha Gospel e A Tribuna MT (julho de 2020): a morte do pastor Sebastião Rodrigues de Souza'] },
  { id: 'ms', state: 'Mato Grosso do Sul', region: 'Centro-Oeste', city: 'Campo Grande', year: '1944', origin: 'Juvenal Roque de Andrade', summary: 'A igreja começa em Campo Grande, quando a cidade ainda era parte de Mato Grosso.', span: [1944, 1979], sources: ['Portal CADB: história da Assembleia de Deus'] },
  { id: 'df', state: 'Distrito Federal', region: 'Centro-Oeste', city: 'Taguatinga', year: '1957–1959', origin: 'Irmãos de vários estados, trabalhadores da construção de Brasília', summary: 'Candangos crentes montam o primeiro salão enquanto a capital é construída.', span: [1957, 1960], sources: ['Assembleia de Deus de Brasília (ADEB): história'] },
];

/** Bandeira do estado (public/conteudo/bandeiras/<sigla>.webp, Wikimedia Commons, domínio público). */
export const stateFlag = (id: string) => `conteudo/bandeiras/${id}.webp`;

export const findAdState = (id: string) => AD_STATES.find((s) => s.id === id);
