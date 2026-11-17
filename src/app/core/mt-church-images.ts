import type { MtImage } from './mt-church-map-types';

/**
 * Bandeiras e fotos do mapa mental de MT, do Wikimedia Commons (só domínio público e licenças abertas).
 * Arquivo GERADO: cada imagem tem o crédito e o endereço do original. Para trocar uma imagem, baixe outra e gere de novo.
 */
export const MT_IMAGES: Record<string, { flag?: MtImage; photo?: MtImage; epoch?: MtImage }> = {
  'alta-floresta': {
    flag: { src: 'bandeiras/mt-alta-floresta.webp', alt: 'Bandeira de Alta Floresta', caption: 'Bandeira de Alta Floresta.', credit: 'Alta Floresta City Hall, Public domain (Wikimedia Commons)', w: 160, h: 111, source: 'https://commons.wikimedia.org/wiki/File:Bandeira_de_Alta_Floresta.jpg' },
    photo: { src: 'imagens/mt-alta-floresta-cidade.webp', alt: 'Vista de Alta Floresta', caption: 'Alta Floresta, em Mato Grosso.', credit: 'maysamedeiros, CC BY-SA 3.0 (Wikimedia Commons)', w: 900, h: 675, source: 'https://commons.wikimedia.org/wiki/File:Alta_Floresta_-_State_of_Mato_Grosso,_Brazil_-_panoramio.jpg' },
  },
  'araguaia': {
    photo: { src: 'imagens/mt-araguaia-cidade.webp', alt: 'O rio Araguaia em Aruanã, na divisa entre Goiás e Mato Grosso', caption: 'O rio Araguaia em Aruanã (GO), na divisa com Mato Grosso.', credit: 'Fronteira, CC BY-SA 4.0 (Wikimedia Commons)', w: 900, h: 675, source: 'https://commons.wikimedia.org/wiki/File:Rio_Araguaia,_Aruan%C3%A3,_fronteira_entre_Goi%C3%A1s_e_Mato_Grosso,_agosto_de_2025_(1).jpg' },
  },
  'barra-do-garcas': {
    flag: { src: 'bandeiras/mt-barra-do-garcas.webp', alt: 'Bandeira de Barra do Garças', caption: 'Bandeira de Barra do Garças.', credit: 'Preifeitura de Barra do Garças - MT, Public domain (Wikimedia Commons)', w: 160, h: 112, source: 'https://commons.wikimedia.org/wiki/File:Bandeira_Barra_do_Garcas.jpg' },
    photo: { src: 'imagens/mt-barra-do-garcas-cidade.webp', alt: 'A orla do rio das Garças, em Barra do Garças', caption: 'A orla do rio das Garças, em Barra do Garças.', credit: 'Túllio F, CC BY-SA 4.0 (Wikimedia Commons)', w: 900, h: 675, source: 'https://commons.wikimedia.org/wiki/File:Orla_do_Rio_Gar%C3%A7as_-_Barra_do_Gar%C3%A7as_-_Mato_Grosso_-_BR_12.jpg' },
  },
  'brasnorte': {
    flag: { src: 'bandeiras/mt-brasnorte.webp', alt: 'Bandeira de Brasnorte', caption: 'Bandeira de Brasnorte.', credit: 'Prefeitura Municipal de Brasnorte, CC BY-SA 4.0 (Wikimedia Commons)', w: 160, h: 123, source: 'https://commons.wikimedia.org/wiki/File:Bandeira_Brasnorte.png' },
    photo: { src: 'imagens/mt-brasnorte-cidade.webp', alt: 'Plantação de soja em Brasnorte', caption: 'Plantação de soja em Brasnorte.', credit: 'Marcelo Camargo/Agência Brasil, CC BY 3.0 br (Wikimedia Commons)', w: 900, h: 599, source: 'https://commons.wikimedia.org/wiki/File:SojaBrasnorte.jpg' },
  },
  'caceres': {
    flag: { src: 'bandeiras/mt-caceres.webp', alt: 'Bandeira de Cáceres', caption: 'Bandeira de Cáceres.', credit: 'Cáceres City Hall, Public domain (Wikimedia Commons)', w: 160, h: 101, source: 'https://commons.wikimedia.org/wiki/File:Bandeira-caceres.jpg' },
    photo: { src: 'imagens/mt-caceres-cidade.webp', alt: 'O rio Paraguai em Cáceres', caption: 'O rio Paraguai em Cáceres.', credit: 'Túllio F, CC BY-SA 4.0 (Wikimedia Commons)', w: 900, h: 675, source: 'https://commons.wikimedia.org/wiki/File:Rio_Paraguai_em_C%C3%A1ceres_(Mato_Grosso)_02.jpg' },
  },
  'campo-novo': {
    flag: { src: 'bandeiras/mt-campo-novo.webp', alt: 'Bandeira de Campo Novo do Parecis', caption: 'Bandeira de Campo Novo do Parecis.', credit: 'Nehemiah Joseph, CC BY-SA 3.0 (Wikimedia Commons)', w: 160, h: 108, source: 'https://commons.wikimedia.org/wiki/File:Bandeira_de_Campo_Novo_do_Parecis.jpeg' },
    photo: { src: 'imagens/mt-campo-novo-cidade.webp', alt: 'O Salto Utiariti, na Chapada dos Parecis', caption: 'O Salto Utiariti, na Chapada dos Parecis, em Campo Novo do Parecis.', credit: 'Caio Vilela, CC BY-SA 3.0 (Wikimedia Commons)', w: 900, h: 598, source: 'https://commons.wikimedia.org/wiki/File:Salto_Utiariti,_Chapada_dos_Parecis,_Campo_Novo_dos_Parecis,_MT.jpg' },
  },
  'chapada': {
    flag: { src: 'bandeiras/mt-chapada.webp', alt: 'Bandeira de Chapada dos Guimarães', caption: 'Bandeira de Chapada dos Guimarães.', credit: 'https://www.querencia.mt.gov.br/Nossa-Cidade/Hino-Bandeira-Brasao/ htt, CC BY-SA 4.0 (Wikimedia Commons)', w: 160, h: 108, source: 'https://commons.wikimedia.org/wiki/File:Bandeira_de_chapada_dos_guimaraes.jpg' },
    photo: { src: 'imagens/mt-chapada-cidade.webp', alt: 'O planalto da Chapada dos Guimarães', caption: 'O planalto da Chapada dos Guimarães.', credit: 'Henrique Schneider Marx, CC BY-SA 4.0 (Wikimedia Commons)', w: 900, h: 506, source: 'https://commons.wikimedia.org/wiki/File:Vista_do_planalto_de_Chapada_dos_Guimar%C3%A3es.jpg' },
  },
  'colniza': {
    photo: { src: 'imagens/mt-colniza-cidade.webp', alt: 'Vista de Colniza', caption: 'Colniza, em Mato Grosso.', credit: 'Marcelo Camargo/Agência Brasil, CC BY 3.0 br (Wikimedia Commons)', w: 900, h: 613, source: 'https://commons.wikimedia.org/wiki/File:Colniza.jpg' },
  },
  'comodoro': {
    flag: { src: 'bandeiras/mt-comodoro.webp', alt: 'Bandeira de Comodoro', caption: 'Bandeira de Comodoro.', credit: 'André Felipe da Silva (talk), Public domain (Wikimedia Commons)', w: 160, h: 104, source: 'https://commons.wikimedia.org/wiki/File:Bandeiracomodoromt.png' },
    photo: { src: 'imagens/mt-comodoro-cidade.webp', alt: 'Vista de Comodoro', caption: 'Comodoro, em Mato Grosso.', credit: 'Daniel Belem Pereira, CC BY-SA 4.0 (Wikimedia Commons)', w: 900, h: 505, source: 'https://commons.wikimedia.org/wiki/File:Comodoro_mt.jpg' },
  },
  'cuiaba': {
    flag: { src: 'bandeiras/mt-cuiaba.webp', alt: 'Bandeira de Cuiabá', caption: 'Bandeira de Cuiabá.', credit: 'Franklinbaldo 21:27, 30 December 2006 (UTC), Public domain (Wikimedia Commons)', w: 160, h: 112, source: 'https://commons.wikimedia.org/wiki/File:Bandeira_de_Cuiab%C3%A1.svg' },
    photo: { src: 'imagens/mt-cuiaba-cidade.webp', alt: 'O Grande Templo da Assembleia de Deus, em Cuiabá', caption: 'O Grande Templo da Assembleia de Deus, em Cuiabá (2012).', credit: 'Weberson Grizoste, CC BY-SA 3.0 (Wikimedia Commons)', w: 900, h: 675, source: 'https://commons.wikimedia.org/wiki/File:Grande_Templo.jpg' },
    epoch: { src: 'imagens/mt-cuiaba-epoca.webp', alt: 'A Catedral do Senhor Bom Jesus de Cuiabá em 1941', caption: 'A Catedral do Senhor Bom Jesus de Cuiabá em 1941, quando Joerke já pregava na cidade (Arquivo Nacional).', credit: 'BR_RJANRIO_PH_0_FOT_04635_004, CC BY-SA 4.0 (Wikimedia Commons)', w: 884, h: 571, source: 'https://commons.wikimedia.org/wiki/File:Catedral_do_Senhor_Bom_Jesus_de_Cuiab%C3%A1,_Mato_Grosso,_1941.jpg' },
  },
  'guaranta': {
    flag: { src: 'bandeiras/mt-guaranta.webp', alt: 'Bandeira de Guarantã do Norte', caption: 'Bandeira de Guarantã do Norte.', credit: 'Amantedeviagens, CC BY-SA 4.0 (Wikimedia Commons)', w: 160, h: 108, source: 'https://commons.wikimedia.org/wiki/File:Bandeira_de_guarant%C3%A3_do_norte.png' },
  },
  'juara': {
    flag: { src: 'bandeiras/mt-juara.webp', alt: 'Bandeira de Juara', caption: 'Bandeira de Juara.', credit: 'Prefeitura de Juara, Public domain (Wikimedia Commons)', w: 160, h: 108, source: 'https://commons.wikimedia.org/wiki/File:Bandeira_de_Juara_(Mato_Grosso).png' },
    photo: { src: 'imagens/mt-juara-cidade.webp', alt: 'Vista de Juara', caption: 'Juara, em Mato Grosso.', credit: 'LUIS BELO, CC BY-SA 3.0 (Wikimedia Commons)', w: 900, h: 675, source: 'https://commons.wikimedia.org/wiki/File:Juara_-_State_of_Mato_Grosso,_Brazil_-_panoramio_-_LUIS_BELO.jpg' },
  },
  'juina': {
    flag: { src: 'bandeiras/mt-juina.webp', alt: 'Bandeira de Juína', caption: 'Bandeira de Juína.', credit: 'Prefeitura de Juína-MT, CC0 (Wikimedia Commons)', w: 160, h: 108, source: 'https://commons.wikimedia.org/wiki/File:Bandeira_de_Ju%C3%ADna_(Mato_Grosso).png' },
  },
  'juruena': {
    photo: { src: 'imagens/mt-juruena-cidade.webp', alt: 'O rio Juruena', caption: 'O rio Juruena, em Mato Grosso.', credit: 'Coordenação-Geral de Observação da Terra/INPE, CC BY-SA 2.0 (Wikimedia Commons)', w: 900, h: 506, source: 'https://commons.wikimedia.org/wiki/File:Rio_Juruena,_Mato_Grosso.jpg' },
  },
  'lucas': {
    flag: { src: 'bandeiras/mt-lucas.webp', alt: 'Bandeira de Lucas do Rio Verde', caption: 'Bandeira de Lucas do Rio Verde.', credit: 'Prefeitura de Lucas do Rio Verde, Public domain (Wikimedia Commons)', w: 160, h: 108, source: 'https://commons.wikimedia.org/wiki/File:Bandeira_de_Lucas_do_Rio_Verde,_MT.png' },
    photo: { src: 'imagens/mt-lucas-cidade.webp', alt: 'Vista de Lucas do Rio Verde', caption: 'Lucas do Rio Verde, em Mato Grosso.', credit: 'Caique Santana Candeiense, CC BY-SA 4.0 (Wikimedia Commons)', w: 900, h: 589, source: 'https://commons.wikimedia.org/wiki/File:Lucas_do_Rio_Verde_MT.jpg' },
  },
  'nobres': {
    photo: { src: 'imagens/mt-nobres-cidade.webp', alt: 'Nobres vista do alto', caption: 'Nobres vista do alto.', credit: 'MKBRA, CC BY-SA 4.0 (Wikimedia Commons)', w: 900, h: 506, source: 'https://commons.wikimedia.org/wiki/File:Cidade_de_Nobres_vista_do_alto.jpg' },
  },
  'nova-mutum': {
    flag: { src: 'bandeiras/mt-nova-mutum.webp', alt: 'Bandeira de Nova Mutum', caption: 'Bandeira de Nova Mutum.', credit: 'Laismara Tasca, Public domain (Wikimedia Commons)', w: 160, h: 107, source: 'https://commons.wikimedia.org/wiki/File:Bandeira_de_Nova_Mutum_(MT).svg' },
    photo: { src: 'imagens/mt-nova-mutum-cidade.webp', alt: 'Vista de Nova Mutum', caption: 'Nova Mutum, em Mato Grosso.', credit: 'LUIS BELO, CC BY-SA 3.0 (Wikimedia Commons)', w: 900, h: 675, source: 'https://commons.wikimedia.org/wiki/File:Nova_Mutum_-_State_of_Mato_Grosso,_Brazil_-_panoramio.jpg' },
  },
  'peixoto': {
    flag: { src: 'bandeiras/mt-peixoto.webp', alt: 'Bandeira de Peixoto de Azevedo', caption: 'Bandeira de Peixoto de Azevedo.', credit: 'Emmanuel Lucas Vieira, CC BY-SA 2.5 (Wikimedia Commons)', w: 160, h: 106, source: 'https://commons.wikimedia.org/wiki/File:Bandeira_Peixoto_de_Azevedo.png' },
    photo: { src: 'imagens/mt-peixoto-cidade.webp', alt: 'Ponte sobre o rio Peixoto', caption: 'Ponte sobre o rio Peixoto de Azevedo.', credit: 'James Deann, CC BY-SA 4.0 (Wikimedia Commons)', w: 900, h: 453, source: 'https://commons.wikimedia.org/wiki/File:Ponte_Rio_Peixoto.JPG' },
  },
  'pocone': {
    flag: { src: 'bandeiras/mt-pocone.webp', alt: 'Bandeira de Poconé', caption: 'Bandeira de Poconé.', credit: 'FelipeRM2008, CC0 (Wikimedia Commons)', w: 160, h: 108, source: 'https://commons.wikimedia.org/wiki/File:Bandeira_Pocon%C3%A9.png' },
    photo: { src: 'imagens/mt-pocone-cidade.webp', alt: 'Vista de Poconé', caption: 'Poconé, em Mato Grosso.', credit: 'francisco souza dias, CC BY 3.0 (Wikimedia Commons)', w: 900, h: 675, source: 'https://commons.wikimedia.org/wiki/File:Pocon%C3%A9_-_State_of_Mato_Grosso,_Brazil_-_panoramio.jpg' },
  },
  'porto-esperidiao': {
    photo: { src: 'imagens/mt-porto-esperidiao-cidade.webp', alt: 'Entrada de Porto Esperidião', caption: 'Entrada principal de Porto Esperidião.', credit: 'Brasão de Municípios, CC BY-SA 4.0 (Wikimedia Commons)', w: 700, h: 445, source: 'https://commons.wikimedia.org/wiki/File:Principal_entrada_de_acesso_%C3%A0_cidade_de_Porto_Esperidi%C3%A3o-MT.jpg' },
  },
  'poxoreu': {
    photo: { src: 'imagens/mt-poxoreu-cidade.webp', alt: 'Vista de Poxoréu', caption: 'Poxoréu, em Mato Grosso.', credit: 'LUIS BELO, CC BY-SA 3.0 (Wikimedia Commons)', w: 900, h: 505, source: 'https://commons.wikimedia.org/wiki/File:Poxor%C3%A9o_-_State_of_Mato_Grosso,_Brazil_-_panoramio.jpg' },
  },
  'primavera': {
    flag: { src: 'bandeiras/mt-primavera.webp', alt: 'Bandeira de Primavera do Leste', caption: 'Bandeira de Primavera do Leste.', credit: 'Prefeitura de Primavera do Leste, Public domain (Wikimedia Commons)', w: 160, h: 105, source: 'https://commons.wikimedia.org/wiki/File:Bandeira_de_Primavera_do_Leste.jpg' },
    photo: { src: 'imagens/mt-primavera-cidade.webp', alt: 'Vista de Primavera do Leste', caption: 'Primavera do Leste, em Mato Grosso.', credit: 'Narciso Silva, CC BY-SA 3.0 (Wikimedia Commons)', w: 900, h: 675, source: 'https://commons.wikimedia.org/wiki/File:Primavera_do_Leste_-_State_of_Mato_Grosso,_Brazil_-_panoramio.jpg' },
  },
  'rio-cuiaba': {
    photo: { src: 'imagens/mt-rio-cuiaba-cidade.webp', alt: 'O rio Cuiabá', caption: 'O rio Cuiabá (2010).', credit: 'Eduardo P, Public domain (Wikimedia Commons)', w: 900, h: 675, source: 'https://commons.wikimedia.org/wiki/File:Cuiab%C3%A1_River_02.JPG' },
    epoch: { src: 'imagens/mt-rio-cuiaba-epoca.webp', alt: 'O porto de Cuiabá em 1863', caption: 'O porto de Cuiabá em 1863. Em 1936, Joerke ainda chegava aos portos do rio.', credit: 'Fotograph by Bartolomé Bossi, engraving to publish by Lacoste Aine, Public domain (Wikimedia Commons)', w: 900, h: 322, source: 'https://commons.wikimedia.org/wiki/File:Porto_de_Cuiaba_(1863).jpg' },
  },
  'rio-paraguai': {
    flag: { src: 'bandeiras/mt-rio-paraguai.webp', alt: 'Bandeira de Corumbá (MS)', caption: 'Bandeira de Corumbá (MS).', credit: 'LH658, CC BY-SA 4.0 (Wikimedia Commons)', w: 160, h: 113, source: 'https://commons.wikimedia.org/wiki/File:Bandeira_de_corumba_ms.png' },
    photo: { src: 'imagens/mt-rio-paraguai-cidade.webp', alt: 'O rio Paraguai no Pantanal, perto de Corumbá', caption: 'O rio Paraguai no Pantanal, perto de Corumbá.', credit: 'Kaliewhite, CC BY-SA 4.0 (Wikimedia Commons)', w: 900, h: 675, source: 'https://commons.wikimedia.org/wiki/File:Rio_Paraguai_Pantanal_Corumb%C3%A1.jpg' },
    epoch: { src: 'imagens/mt-rio-paraguai-epoca.webp', alt: 'O marechal Rondon ao lado de um marco da fronteira, no rio Paraguai', caption: 'O marechal Rondon ao lado de um marco da fronteira Brasil–Bolívia, no rio Paraguai (foto antiga do Arquivo Nacional, sem data indicada).', credit: 'B. Rondon, Public domain (Wikimedia Commons)', w: 900, h: 368, source: 'https://commons.wikimedia.org/wiki/File:Marechal_Rondon_ao_lado_do_Marco_de_Sudeste_da_Ba%C3%ADa_Uberava,_Rio_Paraguai,_na_fronteira_Brasil-Bol%C3%ADvia.jpg' },
  },
  'rondonopolis': {
    flag: { src: 'bandeiras/mt-rondonopolis.webp', alt: 'Bandeira de Rondonópolis', caption: 'Bandeira de Rondonópolis.', credit: 'Autor desconhecido, Public domain (Wikimedia Commons)', w: 160, h: 107, source: 'https://commons.wikimedia.org/wiki/File:Bandeira_de_Rondonopolis.png' },
    photo: { src: 'imagens/mt-rondonopolis-cidade.webp', alt: 'Vista de Rondonópolis', caption: 'Rondonópolis, em Mato Grosso.', credit: 'Túllio F, CC BY-SA 4.0 (Wikimedia Commons)', w: 900, h: 600, source: 'https://commons.wikimedia.org/wiki/File:Fotos_em_Rondon%C3%B3polis_-_MT_21.jpg' },
  },
  'sinop': {
    flag: { src: 'bandeiras/mt-sinop.webp', alt: 'Bandeira de Sinop', caption: 'Bandeira de Sinop.', credit: 'Autor desconhecido, Public domain (Wikimedia Commons)', w: 160, h: 111, source: 'https://commons.wikimedia.org/wiki/File:Bandeira_sinop_mt.png' },
    photo: { src: 'imagens/mt-sinop-cidade.webp', alt: 'O Parque Ecológico de Sinop', caption: 'O Parque Ecológico de Sinop.', credit: 'Guilmann, CC BY-SA 4.0 (Wikimedia Commons)', w: 900, h: 506, source: 'https://commons.wikimedia.org/wiki/File:Parque_Ecol%C3%B3gico_de_Sinop_3.jpg' },
  },
  'sorriso': {
    flag: { src: 'bandeiras/mt-sorriso.webp', alt: 'Bandeira de Sorriso', caption: 'Bandeira de Sorriso.', credit: 'Prefeitura de Sorriso (Mato Grosso), Public domain (Wikimedia Commons)', w: 160, h: 104, source: 'https://commons.wikimedia.org/wiki/File:Bandeira_de_Sorriso_(Mato_Grosso).jpg' },
    photo: { src: 'imagens/mt-sorriso-cidade.webp', alt: 'Vista de Sorriso', caption: 'Sorriso, em Mato Grosso.', credit: 'Weriton N. R. Queiros, CC BY-SA 4.0 (Wikimedia Commons)', w: 900, h: 720, source: 'https://commons.wikimedia.org/wiki/File:Imagem_de_Sorriso_-_MT.jpg' },
  },
  'tangara': {
    flag: { src: 'bandeiras/mt-tangara.webp', alt: 'Bandeira de Tangará da Serra', caption: 'Bandeira de Tangará da Serra.', credit: 'Autor desconhecido, Public domain (Wikimedia Commons)', w: 160, h: 100, source: 'https://commons.wikimedia.org/wiki/File:Bandeira_de_Tangar%C3%A1_da_Serra.jpg' },
    photo: { src: 'imagens/mt-tangara-cidade.webp', alt: 'Vista de Tangará da Serra', caption: 'Tangará da Serra, em Mato Grosso.', credit: 'José Henrique Kautzmann = Panoramio user José Henrique Kautzmann, CC BY-SA 3.0 (Wikimedia Commons)', w: 900, h: 612, source: 'https://commons.wikimedia.org/wiki/File:Tangar%C3%A1_da_Serra_-_Mato_Grosso.jpg' },
  },
  'varzea-grande': {
    flag: { src: 'bandeiras/mt-varzea-grande.webp', alt: 'Bandeira de Várzea Grande', caption: 'Bandeira de Várzea Grande.', credit: 'Prefeitura de Várzea Grande MT, Public domain (Wikimedia Commons)', w: 160, h: 108, source: 'https://commons.wikimedia.org/wiki/File:V%C3%A1rzea_Grande_Flag.jpg' },
    photo: { src: 'imagens/mt-varzea-grande-cidade.webp', alt: 'Vista aérea de Várzea Grande', caption: 'Vista aérea de Várzea Grande.', credit: 'Kililla, CC BY 3.0 (Wikimedia Commons)', w: 900, h: 569, source: 'https://commons.wikimedia.org/wiki/File:Imagem_A%C3%A9rea_de_V%C3%A1rzea_Grande_MT.png' },
  },
};
