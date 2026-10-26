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
  /** Fontes específicas deste estado (além da lista do Mensageiro da Paz). */
  sources: string[];
}

export const REGIONS: Region[] = ['Norte', 'Nordeste', 'Sudeste', 'Sul', 'Centro-Oeste'];

export const AD_STATES: AdState[] = [
  // Norte
  { id: 'pa', state: 'Pará', region: 'Norte', city: 'Belém', year: '1911', origin: 'Gunnar Vingren e Daniel Berg vieram dos Estados Unidos', summary: 'A igreja-mãe: da casa de Celina de Albuquerque às vilas da Estrada de Ferro Belém–Bragança e à Ilha de Marajó.', sources: ['Ivar Vingren, O diário do pioneiro Gunnar Vingren (CPAD)', 'Daniel Berg, Enviado por Deus (CPAD)'] },
  { id: 'rr', state: 'Roraima', region: 'Norte', city: 'Boa Vista', year: '1915', from: 'pa', origin: 'Saiu de Belém: Cordolino Teixeira Bastos e a família', summary: 'Uma família de onze pessoas leva a fé de Belém para a região do rio Branco.', sources: ['Folha de Boa Vista: os 100 anos da Assembleia de Deus em Roraima'] },
  { id: 'ap', state: 'Amapá', region: 'Norte', city: 'Macapá', year: '1916–1917', from: 'pa', origin: 'Saiu de Belém: o colombiano Clímaco Bueno Aza', summary: 'Bíblias vendidas de casa em casa, uma prisão, Bíblias queimadas — e a primeira igreja evangélica do Amapá.', sources: ['Governo do Amapá e jornais locais sobre o centenário da Assembleia de Deus no Amapá', 'Besaliel Rodrigues, História da Assembleia de Deus — a pioneira (2001)'] },
  { id: 'am', state: 'Amazonas', region: 'Norte', city: 'Manaus', year: '1917–1918', from: 'pa', origin: 'Saiu de Belém: Severino Moreno de Araújo', summary: 'Um pequeno grupo lendo a Bíblia pede a Belém que envie um pastor, e os Nyström organizam a igreja.', sources: ['Jornal do Commercio (Manaus): os 100 anos da Assembleia de Deus', 'Centenário IEADAM'] },
  { id: 'ro', state: 'Rondônia', region: 'Norte', city: 'Porto Velho', year: '1922', origin: 'O missionário americano Paul Aenis', summary: 'Às margens da Estrada de Ferro Madeira–Mamoré, seis pessoas começam a igreja de Porto Velho.', sources: ['Senado Federal (2002) e Prefeitura de Porto Velho: aniversário da Assembleia de Deus em Rondônia'] },
  { id: 'ac', state: 'Acre', region: 'Norte', city: 'Cruzeiro do Sul', year: '1932', origin: 'Manoel Pirabas dos Santos', summary: 'No extremo oeste do Brasil, a igreja começa em Cruzeiro do Sul.', sources: ['José Batista de Oliveira, dissertação (PUC Goiás) sobre as Assembleias de Deus no Acre'] },
  { id: 'to', state: 'Tocantins', region: 'Norte', city: 'Rios Tocantins e Araguaia', year: '1952', origin: 'Armando Chaves Cohen', summary: 'A evangelização pelos rios, numa região que só se tornaria estado em 1988.', sources: ['Histórias das igrejas locais do Tocantins'] },
  // Nordeste
  { id: 'ce', state: 'Ceará', region: 'Nordeste', city: 'Uruburetama (Itapajé)', year: '1914', from: 'pa', origin: 'Saiu de Belém: Maria de Jesus Nazaré Araújo, de volta à sua terra', summary: 'Uma mulher volta sozinha de navio, é expulsa pela família — e a semente cresce num sítio do sertão.', sources: ['Assembleia Legislativa do Ceará: projeto de lei 368/2021', 'O Povo (2022) e centenário da Assembleia de Deus em Fortaleza'] },
  { id: 'pb', state: 'Paraíba', region: 'Nordeste', city: 'Campina Grande', year: '1914', origin: 'O paraibano Manoel Francisco do Bu, de volta à sua cidade', summary: 'Um filho da terra traz a mensagem a Campina Grande; um alfaiate mantém os cultos em casa.', sources: ['Igreja Assembleia de Deus em Campina Grande: história e centenário', 'Revista Religare (UFPB), v. 21, 2024'] },
  { id: 'al', state: 'Alagoas', region: 'Nordeste', city: 'Maceió', year: '1915', from: 'pa', origin: 'Saíram de Belém: Gunnar Vingren e o missionário Otto Nelson', summary: 'Um missionário sueco desembarca, hospeda-se com um pescador e faz o primeiro culto quatro dias depois.', sources: ['Assembleia de Deus no Estado de Alagoas: história', 'UFAL: o papel dos missionários suecos na fundação da Assembleia de Deus em Alagoas (1915–1930)'] },
  { id: 'pe', state: 'Pernambuco', region: 'Nordeste', city: 'Recife', year: '1916–1918', from: 'pa', origin: 'Saiu de Belém: Adriano Nobre', summary: 'Batismos no Capibaribe, a chegada dos Carlson e o primeiro templo na Encruzilhada.', sources: ['Wikipédia: Assembleia de Deus em Pernambuco', 'IEADPE: história'] },
  { id: 'rn', state: 'Rio Grande do Norte', region: 'Nordeste', city: 'Natal', year: '1918', from: 'pe', origin: 'Adriano Nobre, enviado pelos missionários a pedido de Francisco Cézar', summary: 'Um culto na casa de um soldado, seis batismos no Potengi e, anos depois, a primeira Convenção Geral.', sources: ['IEADERN: centenário', 'Assembleia Legislativa do RN e Câmara Municipal de Natal: homenagens à Assembleia de Deus'] },
  { id: 'ma', state: 'Maranhão', region: 'Nordeste', city: 'São Luís', year: '1921–1922', from: 'pa', origin: 'Saiu de Belém: Clímaco Bueno Aza', summary: 'Dois dias de mar, pregação de casa em casa e a fundação na Rua Sete de Setembro.', sources: ['IADESL: história da Assembleia de Deus em São Luís', 'Revista Cristão Alerta: quem foi Clímaco Bueno Aza'] },
  { id: 'ba', state: 'Bahia', region: 'Nordeste', city: 'Canavieiras', year: '1926', from: 'pa', origin: 'Saiu do Pará: a baiana Joaquina de Souza Carvalho, de volta à sua terra', summary: 'Uma mulher de Canavieiras traz a mensagem do Pará; Belém envia um pastor para batizar.', sources: ['Assembleia Legislativa da Bahia: sessões sobre a Assembleia de Deus', 'Sistema EBD: biografia do pastor Teodoro Feliciano Santana'] },
  { id: 'se', state: 'Sergipe', region: 'Nordeste', city: 'Aracaju', year: '1927', from: 'pa', origin: 'Saiu da igreja do Pará: o sargento do Exército Ormínio', summary: 'Um sargento que não podia batizar pede ajuda a Maceió — e a igreja nasce na Avenida Maranhão.', sources: ['IEADSE: 91 anos das Assembleias de Deus em Sergipe', 'Augusto César Santiago Teixeira, dissertação (UFS)'] },
  { id: 'pi', state: 'Piauí', region: 'Nordeste', city: 'Teresina', year: '1927–1936', from: 'ma', origin: 'Saíram de São Luís: obreiros da igreja do Maranhão', summary: 'De São Luís para Teresina: os primeiros passos em 1927 e a organização em 1936.', sources: ['IADESL: linha do tempo dos presidentes'] },
  // Sudeste
  { id: 'es', state: 'Espírito Santo', region: 'Sudeste', city: 'Vitória', year: '1922', from: 'pa', origin: 'Saíram de Belém: Francisco Galdino Sobrinho e a esposa; depois, Daniel e Sara Berg', summary: 'Um casal enviado de Belém e os Berg começam a obra na capital capixaba.', sources: ['Assembleia de Deus em Santo Antônio (Vitória): história'] },
  { id: 'rj', state: 'Rio de Janeiro', region: 'Sudeste', city: 'Rio de Janeiro (São Cristóvão)', year: '1922–1924', from: 'pa', origin: 'Saíram do Pará: crentes de Belém e, em 1924, Gunnar e Frida Vingren', summary: 'Da casa de Florinda e Eduardo Brito ao salão da Rua Escobar: São Cristóvão, mãe de muitos ministérios.', sources: ['Portal CADB: a histórica igreja de São Cristóvão', 'Rádio Betel e SENAMI: o centenário da Assembleia de Deus no Rio'] },
  { id: 'sp', state: 'São Paulo', region: 'Sudeste', city: 'Santos', year: '1924', from: 'pe', origin: 'Saíram do Recife: Vicente e Hermínia Lameira e Manoel Garcês', summary: 'Pentecostais vindos do Recife começam na Ponta da Praia; os Berg chegam e, em 1927, vão para a capital.', sources: ['Histórias da Assembleia de Deus em Santos e na cidade de São Paulo'] },
  { id: 'mg', state: 'Minas Gerais', region: 'Sudeste', city: 'Belo Horizonte', year: '1927', origin: 'O colombiano Clímaco Bueno Aza, o mesmo de Macapá e São Luís', summary: 'O pioneiro de três capitais abre a igreja na própria casa, no bairro Carlos Prates.', sources: ['Memorial AD-BH e Assembleia de Deus em Belo Horizonte: 96 anos de história'] },
  // Sul
  { id: 'rs', state: 'Rio Grande do Sul', region: 'Sul', city: 'Porto Alegre', year: '1924', from: 'pa', origin: 'Saiu de Belém: o missionário sueco Gustav Nordlund e a família', summary: 'O primeiro culto teve um único ouvinte, abrigado da chuva. O missionário ficou trinta anos.', sources: ['Assembleia de Deus de Porto Alegre: nossas raízes e centenário'] },
  { id: 'pr', state: 'Paraná', region: 'Sul', city: 'Curitiba', year: '1928', origin: 'Bruno Skolimowski, um dos primeiros pastores separados em Belém', summary: 'Um pastor que pregava aos imigrantes poloneses na língua deles.', sources: ['Histórias das igrejas locais (lista dos primeiros passos)'] },
  { id: 'sc', state: 'Santa Catarina', region: 'Sul', city: 'Itajaí', year: '1931', from: 'rj', origin: 'Saiu do Rio: André Bernardino da Silva, convertido em São Cristóvão', summary: 'Um jovem convertido no Rio começa na casa de uma tia, perto do porto de Itajaí.', sources: ['Mário Sérgio de Santana: os 80 e os 90 anos da Assembleia de Deus em Santa Catarina', 'Rádio Educadora: 94 anos da Assembleia de Deus em Santa Catarina'] },
  // Centro-Oeste
  { id: 'go', state: 'Goiás', region: 'Centro-Oeste', city: 'Goiânia', year: '1936', from: 'rj', origin: 'Saiu do Rio: o diácono Antônio do Carmo Moreira, da igreja de Madureira', summary: 'Um pedreiro das obras da nova capital começa a igreja em Goiânia.', sources: ['Jornal Opção: a Assembleia de Deus em Goiás', 'Oeste Goiano: quando a Assembleia de Deus chega a Goiás', 'AD Anápolis: nossa história'] },
  { id: 'mt', state: 'Mato Grosso', region: 'Centro-Oeste', city: 'Cuiabá', year: '1936', origin: 'O pastor itinerante Eduardo Pablo Joerck', summary: 'Um pregador itinerante enfrenta oposição e planta a igreja em Cuiabá.', sources: ['Assembleia Legislativa de Mato Grosso: documentos sobre a Assembleia de Deus em Cuiabá'] },
  { id: 'ms', state: 'Mato Grosso do Sul', region: 'Centro-Oeste', city: 'Campo Grande', year: '1944', origin: 'Juvenal Roque de Andrade', summary: 'A igreja começa em Campo Grande, quando a cidade ainda era parte de Mato Grosso.', sources: ['Portal CADB: história da Assembleia de Deus'] },
  { id: 'df', state: 'Distrito Federal', region: 'Centro-Oeste', city: 'Taguatinga', year: '1957–1959', origin: 'Irmãos de vários estados, trabalhadores da construção de Brasília', summary: 'Candangos crentes montam o primeiro salão enquanto a capital é construída.', sources: ['Assembleia de Deus de Brasília (ADEB): história'] },
];

export const findAdState = (id: string) => AD_STATES.find((s) => s.id === id);
