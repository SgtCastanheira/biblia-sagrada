/**
 * O Talmude: a Mishná (os seis “ordens” e 63 tratados) e a Guemará do Talmude Babilônico (37 desses tratados).
 * Código puro (sem Angular), para os testes.
 *
 * A lista de ordens e de tratados, e quais deles têm Guemará no Talmude Babilônico, vem do índice da Sefaria
 * (sefaria.org, lido em 17 de novembro de 2026); o tema de cada tratado é escrito aqui com palavras do app.
 * O texto do Talmude NÃO está no app: não há tradução livre em português, e a inglesa da Sefaria (William Davidson) é
 * CC BY-NC. O app leva ao texto completo, na Sefaria (gratuita), e conta com as próprias palavras o que os trechos dizem.
 */

export interface Tractate {
  /** Nome transliterado, como na Sefaria e nas edições. */
  name: string;
  he: string;
  /** O que o nome quer dizer. */
  pt: string;
  /** Do que o tratado trata. */
  theme: string;
  /** Endereço do tratado da Mishná na Sefaria. */
  mishnah: string;
  /** Endereço da Guemará do Talmude Babilônico, quando o tratado a tem. */
  bavli?: string;
}

export interface Seder {
  id: string;
  name: string;
  he: string;
  /** O que o nome quer dizer. */
  pt: string;
  summary: string;
  tractates: Tractate[];
}

const SEFARIA = 'https://www.sefaria.org/';
const t = (name: string, he: string, pt: string, theme: string, mishnah: string, bavli?: string): Tractate => ({
  name, he, pt, theme, mishnah: SEFARIA + mishnah, bavli: bavli ? SEFARIA + bavli : undefined,
});

export const SEDARIM: Seder[] = [
  {
    id: 'zeraim', name: 'Zeraim', he: 'זרעים', pt: 'Sementes',
    summary: 'A terra e o que ela dá: as colheitas, os dízimos e a parte dos pobres. O primeiro tratado, porém, é sobre orações.',
    tractates: [
      t('Berakhot', 'ברכות', 'Bênçãos', 'As orações e as bênçãos: o Shemá, a oração de pé e as bênçãos antes e depois das refeições.', 'Mishnah_Berakhot', 'Berakhot'),
      t('Peá', 'פאה', 'O canto do campo', 'O que fica na beira do campo e na colheita para os pobres.', 'Mishnah_Peah'),
      t('Demai', 'דמאי', 'O duvidoso', 'Produtos de quem talvez não tenha separado o dízimo, e o que fazer com eles.', 'Mishnah_Demai'),
      t('Kilayim', 'כלאים', 'Misturas', 'As misturas proibidas de sementes, plantas, animais e tecidos.', 'Mishnah_Kilayim'),
      t('Shevi’it', 'שביעית', 'O sétimo ano', 'O ano sabático, em que a terra descansa e as dívidas são perdoadas.', 'Mishnah_Sheviit'),
      t('Terumot', 'תרומות', 'Ofertas separadas', 'A parte da colheita que se separa para os sacerdotes e a sua santidade.', 'Mishnah_Terumot'),
      t('Maasrot', 'מעשרות', 'Dízimos', 'Como e quando se separam os dízimos.', 'Mishnah_Maasrot'),
      t('Maaser Sheni', 'מעשר שני', 'O segundo dízimo', 'O dízimo que se come em Jerusalém ou se troca por dinheiro para comprar comida lá.', 'Mishnah_Maaser_Sheni'),
      t('Chalá', 'חלה', 'A porção da massa', 'A parte da massa do pão que se separa e se dá aos sacerdotes.', 'Mishnah_Challah'),
      t('Orlá', 'ערלה', 'Os frutos dos três primeiros anos', 'Os frutos de árvore nova, que não se comem nos três primeiros anos.', 'Mishnah_Orlah'),
      t('Bikurim', 'ביכורים', 'Primícias', 'Os primeiros frutos levados ao Templo em procissão.', 'Mishnah_Bikkurim'),
    ],
  },
  {
    id: 'moed', name: 'Moed', he: 'מועד', pt: 'Festas',
    summary: 'O tempo sagrado: o sábado, as festas, os jejuns e o Dia da Expiação.',
    tractates: [
      t('Shabbat', 'שבת', 'Sábado', 'Os trabalhos proibidos no sábado e as regras que guardam o dia.', 'Mishnah_Shabbat', 'Shabbat'),
      t('Eruvin', 'עירובין', 'Combinações do sábado', 'Os limites dentro dos quais se pode andar e carregar coisas no sábado.', 'Mishnah_Eruvin', 'Eruvin'),
      t('Pesachim', 'פסחים', 'Páscoas', 'A Páscoa: tirar o fermento, o cordeiro, o pão sem fermento, as ervas amargas e o seder.', 'Mishnah_Pesachim', 'Pesachim'),
      t('Shekalim', 'שקלים', 'Siclos', 'A contribuição anual de meio siclo para o Templo e a administração dele.', 'Mishnah_Shekalim'),
      t('Yomá', 'יומא', 'O Dia', 'O Yom Kippur: o preparo do sumo sacerdote, o serviço no Templo e o jejum.', 'Mishnah_Yoma', 'Yoma'),
      t('Sucá', 'סוכה', 'A cabana', 'A cabana da Festa dos Tabernáculos, os quatro vegetais e a festa no Templo.', 'Mishnah_Sukkah', 'Sukkah'),
      t('Betsá', 'ביצה', 'O ovo', 'As regras dos dias de festa: o que se pode usar e preparar.', 'Mishnah_Beitzah', 'Beitzah'),
      t('Rosh Hashaná', 'ראש השנה', 'O ano-novo', 'A proclamação da lua nova, o toque do shofar e a liturgia do Ano-Novo.', 'Mishnah_Rosh_Hashanah', 'Rosh_Hashanah'),
      t('Taanit', 'תענית', 'Jejuns', 'As orações por chuva, os jejuns de seca e os jejuns da destruição de Jerusalém.', 'Mishnah_Ta\'anit', 'Taanit'),
      t('Meguilá', 'מגילה', 'O rolo', 'A leitura do rolo de Ester no Purim e o culto da sinagoga.', 'Mishnah_Megillah', 'Megillah'),
      t('Moed Katan', 'מועד קטן', 'A festa menor', 'Os dias do meio da Páscoa e dos Tabernáculos, e o luto.', 'Mishnah_Moed_Katan', 'Moed_Katan'),
      t('Chaguigá', 'חגיגה', 'A oferta de festa', 'As ofertas da peregrinação a Jerusalém e as regras de pureza.', 'Mishnah_Chagigah', 'Chagigah'),
    ],
  },
  {
    id: 'nashim', name: 'Nashim', he: 'נשים', pt: 'Mulheres',
    summary: 'A família: o casamento, o divórcio, os votos e a viúva sem filhos.',
    tractates: [
      t('Yevamot', 'יבמות', 'Cunhados', 'A viúva sem filhos e o casamento com o irmão do marido, ou o rito que o dispensa.', 'Mishnah_Yevamot', 'Yevamot'),
      t('Ketubot', 'כתובות', 'Contratos de casamento', 'O contrato de casamento e os deveres entre marido e mulher.', 'Mishnah_Ketubot', 'Ketubot'),
      t('Nedarim', 'נדרים', 'Votos', 'Os votos feitos por vontade própria, sobretudo os que proíbem algo.', 'Mishnah_Nedarim', 'Nedarim'),
      t('Nazir', 'נזיר', 'O nazireu', 'O nazireu, que faz voto de não beber vinho, não cortar o cabelo e não tocar em mortos.', 'Mishnah_Nazir', 'Nazir'),
      t('Sotá', 'סוטה', 'A suspeita', 'A mulher suspeita de adultério e o rito que decide o caso.', 'Mishnah_Sotah', 'Sotah'),
      t('Guitin', 'גיטין', 'Cartas de divórcio', 'O divórcio: a carta (guet) e a sua entrega.', 'Mishnah_Gittin', 'Gittin'),
      t('Kidushin', 'קידושין', 'Noivado', 'O noivado, o casamento, as aquisições e a linhagem.', 'Mishnah_Kiddushin', 'Kiddushin'),
    ],
  },
  {
    id: 'nezikin', name: 'Nezikin', he: 'נזיקין', pt: 'Danos',
    summary: 'O direito e a justiça: indenizações, contratos, tribunais, juramentos e idolatria. É aqui que está o tratado dos Ditos dos Pais.',
    tractates: [
      t('Bava Kamma', 'בבא קמא', 'A primeira porta', 'A responsabilidade por danos a pessoas e a bens, e a indenização.', 'Mishnah_Bava_Kamma', 'Bava_Kamma'),
      t('Bava Metzia', 'בבא מציעא', 'A porta do meio', 'Coisa achada, empréstimo, aluguel, depósito e os direitos de empregados e patrões.', 'Mishnah_Bava_Metzia', 'Bava_Metzia'),
      t('Bava Batra', 'בבא בתרא', 'A última porta', 'Vizinhos, propriedade de terra, vendas e herança.', 'Mishnah_Bava_Batra', 'Bava_Batra'),
      t('Sanedrin', 'סנהדרין', 'O Sinédrio', 'O sistema de tribunais, o testemunho e a pena de morte.', 'Mishnah_Sanhedrin', 'Sanhedrin'),
      t('Makot', 'מכות', 'Açoites', 'A pena de açoites, as testemunhas falsas e as cidades de refúgio.', 'Mishnah_Makkot', 'Makkot'),
      t('Shevuot', 'שבועות', 'Juramentos', 'Os juramentos e a expiação de quem entra no Templo em impureza.', 'Mishnah_Shevuot', 'Shevuot'),
      t('Eduyot', 'עדיות', 'Testemunhos', 'Decisões dos sábios reunidas por assunto, sem um tema só.', 'Mishnah_Eduyot'),
      t('Avodá Zará', 'עבודה זרה', 'Idolatria', 'Como se afastar da idolatria e o comércio com os que a praticam.', 'Mishnah_Avodah_Zarah', 'Avodah_Zarah'),
      t('Avot', 'אבות', 'Pais (Ditos dos Pais)', 'Ditos curtos de ética e sabedoria, de Simão, o Justo, a Hillel e aos sábios depois dele.', 'Pirkei_Avot'),
      t('Horayot', 'הוריות', 'Decisões', 'Os erros do tribunal e os pecados sem intenção dos líderes.', 'Mishnah_Horayot', 'Horayot'),
    ],
  },
  {
    id: 'kodashim', name: 'Kodashim', he: 'קדשים', pt: 'Coisas sagradas',
    summary: 'O Templo: os sacrifícios, as ofertas, o abate de animais e a descrição do próprio edifício.',
    tractates: [
      t('Zevachim', 'זבחים', 'Sacrifícios', 'Os sacrifícios de animais e de aves no Templo.', 'Mishnah_Zevachim', 'Zevachim'),
      t('Menachot', 'מנחות', 'Ofertas de cereais', 'As ofertas de farinha com azeite, de vinho e de pães.', 'Mishnah_Menachot', 'Menachot'),
      t('Chulin', 'חולין', 'O comum', 'O abate de animais para uso comum e as regras do que se pode comer.', 'Mishnah_Chullin', 'Chullin'),
      t('Bechorot', 'בכורות', 'Primogênitos', 'Os primogênitos dos animais, dados aos sacerdotes, e o resgate do primogênito.', 'Mishnah_Bekhorot', 'Bekhorot'),
      t('Arachin', 'ערכין', 'Avaliações', 'O valor que se promete ao Templo e as doações de terra.', 'Mishnah_Arakhin', 'Arakhin'),
      t('Temurá', 'תמורה', 'Troca', 'O animal separado para o sacrifício e a proibição de trocá-lo.', 'Mishnah_Temurah', 'Temurah'),
      t('Keritot', 'כריתות', 'Cortes', 'As faltas punidas com o “corte” do povo e os sacrifícios pelo pecado sem intenção.', 'Mishnah_Keritot', 'Keritot'),
      t('Meilá', 'מעילה', 'Abuso do sagrado', 'O uso indevido de bens do Templo e a restituição.', 'Mishnah_Meilah', 'Meilah'),
      t('Tamid', 'תמיד', 'O contínuo', 'O serviço diário do Templo: o holocausto da manhã e o da tarde.', 'Mishnah_Tamid', 'Tamid'),
      t('Midot', 'מדות', 'Medidas', 'As medidas e a descrição do Templo e do monte do Templo.', 'Mishnah_Middot'),
      t('Kinim', 'קינים', 'Ninhos', 'As ofertas de aves que se misturam e a conta que decide o que vale.', 'Mishnah_Kinnim'),
    ],
  },
  {
    id: 'tohorot', name: 'Tohorot', he: 'טהרות', pt: 'Purezas',
    summary: 'O puro e o impuro: os utensílios, os mortos, a lepra, a água de purificação. Só um tratado tem Guemará no Talmude Babilônico: Nidá.',
    tractates: [
      t('Kelim', 'כלים', 'Utensílios', 'Utensílios, ferramentas, móveis e roupas, e a sua condição nas leis de pureza.', 'Mishnah_Kelim'),
      t('Ohalot', 'אהלות', 'Tendas', 'Como a impureza de um morto se espalha: pelo toque, por carregá-lo ou por estar sob o mesmo teto.', 'Mishnah_Oholot'),
      t('Negaim', 'נגעים', 'Manchas', 'A tsaraat, a “lepra” da pele, da casa e da roupa, e a purificação de quem a teve.', 'Mishnah_Negaim'),
      t('Pará', 'פרה', 'A novilha', 'A novilha vermelha e as cinzas misturadas com água para purificar.', 'Mishnah_Parah'),
      t('Tohorot', 'טהרות', 'Purezas', 'Como alimentos, bebidas, objetos e pessoas ficam impuros e passam a impureza adiante.', 'Mishnah_Tahorot'),
      t('Mikvaot', 'מקואות', 'Banhos', 'Os banhos rituais e a imersão que purifica.', 'Mishnah_Mikvaot'),
      t('Nidá', 'נדה', 'A mulher em impureza', 'A impureza ritual da mulher em seu ciclo e em certos fluxos.', 'Mishnah_Niddah', 'Niddah'),
      t('Machshirin', 'מכשירין', 'Os que preparam', 'Líquidos que, ao tocar um alimento, o deixam sujeito à impureza.', 'Mishnah_Makhshirin'),
      t('Zavim', 'זבים', 'Fluxos', 'Os fluxos anormais do corpo e a impureza que causam.', 'Mishnah_Zavim'),
      t('Tevul Yom', 'טבול יום', 'Imerso do dia', 'A condição de quem se imergiu, mas ainda espera o pôr do sol para ficar puro.', 'Mishnah_Tevul_Yom'),
      t('Yadaim', 'ידים', 'As mãos', 'O decreto dos sábios de lavar as mãos, por se supor que elas estejam impuras.', 'Mishnah_Yadayim'),
      t('Uktzin', 'עוקצים', 'Hastes', 'Cabos e talos ligados à comida, e a sua suscetibilidade à impureza.', 'Mishnah_Oktzin'),
    ],
  },
];

/** Os 63 tratados da Mishná, na ordem. */
export const TRACTATES: Tractate[] = SEDARIM.flatMap((s) => s.tractates);

/** Os 37 tratados que têm Guemará no Talmude Babilônico. */
export const BAVLI_TRACTATES: Tractate[] = TRACTATES.filter((x) => x.bavli);

/** Um trecho do Talmude (ou da Mishná) contado com as palavras do app. */
export interface TalmudPassage {
  id: string;
  title: string;
  /** Onde está: tratado e folha. */
  where: string;
  /** Endereço do texto completo na Sefaria. */
  link: string;
  /** O que o trecho conta, com palavras do app. */
  summary: string[];
  /** Referências da nossa Bíblia que ajudam a ler (texto para `app-rich-text`). */
  bible?: string;
}

export const PASSAGES: TalmudPassage[] = [
  {
    id: 'hillel-um-pe',
    title: 'Hillel e a Torá em um Pé Só',
    where: 'Talmude Babilônico, Shabbat 31a',
    link: 'https://www.sefaria.org/Shabbat.31a',
    summary: [
      'Um não judeu procura o sábio Shamai e pede que o converta com uma condição: que lhe ensine toda a Torá enquanto ele fica num pé só. Shamai, que era construtor, o afasta com a vara de medir que tinha na mão.',
      'O mesmo homem procura Hillel. Hillel o recebe e lhe diz que o que é odioso para ti não o faças ao outro: isso é a Torá inteira, e o resto é explicação. “Vai e estuda.”',
      'A mesma página traz duas outras histórias do mesmo tipo: o homem que apostou quatrocentas moedas que irritaria Hillel, e não conseguiu, e o que não aceitava a Torá oral, e que Hillel convenceu ensinando o alfabeto de trás para a frente, para mostrar que até ler depende de uma tradição que se recebe de alguém.',
    ],
    bible: 'Compare com [[Lv 19.18]] e com a regra de ouro de Jesus em [[Mt 7.12]].',
  },
  {
    id: 'um-mundo',
    title: 'Quem Salva uma Vida, Salva um Mundo',
    where: 'Mishná Sanhedrin 4:5, e Talmude Babilônico, Sanhedrin 37a',
    link: 'https://www.sefaria.org/Mishnah_Sanhedrin.4.5',
    summary: [
      'O trecho descreve como o tribunal advertia as testemunhas num caso de pena de morte: antes de depor, elas eram lembradas de que um erro delas custaria uma vida inteira, e todos os descendentes que ela teria.',
      'A razão dada é que Deus criou o homem sozinho, Adão. Por isso, quem destrói uma vida é tratado como se tivesse destruído um mundo inteiro, e quem sustenta uma vida, como se tivesse sustentado um mundo inteiro. A criação de um só também serve para a paz, para que ninguém diga ao outro: “Meu pai é maior que o teu”.',
      'Há um detalhe de texto. A edição impressa de Vilna diz “uma alma de Israel”; o manuscrito antigo de Kaufmann, em domínio público, diz apenas “uma alma”. As duas formas existem, e a segunda é a mais ampla.',
    ],
    bible: 'O ponto de partida é [[Gn 4.10]] (“a voz do sangue de teu irmão”) e [[Gn 1.27]].',
  },
  {
    id: 'cadeia',
    title: 'Moisés Recebeu a Torá no Sinai',
    where: 'Mishná, Avot 1:1',
    link: 'https://www.sefaria.org/Pirkei_Avot.1.1',
    summary: [
      'É a primeira frase do tratado dos Ditos dos Pais. Ela diz que Moisés recebeu a Torá no Sinai e a transmitiu a Josué, Josué aos anciãos, os anciãos aos profetas e os profetas aos homens da Grande Assembleia.',
      'Esses últimos deixaram três conselhos: ser paciente no julgamento, formar muitos discípulos e “fazer uma cerca em volta da Torá”, isto é, criar proteções que impeçam de chegar perto de quebrar um mandamento.',
      'É assim que o judaísmo rabínico explica de onde vem a Torá oral: ela teria sido entregue junto com a escrita e passada de mestre a discípulo.',
    ],
    bible: 'Compare com a “tradição dos anciãos” que os fariseus citam em [[Mc 7.3-5]].',
  },
  {
    id: 'tres-coisas',
    title: 'O Mundo se Sustenta em Três Coisas',
    where: 'Mishná, Avot 1:2 e 1:14',
    link: 'https://www.sefaria.org/Pirkei_Avot.1.2',
    summary: [
      'Simão, o Justo, um dos últimos da Grande Assembleia, dizia que o mundo se sustenta sobre três coisas: a Torá, o serviço (do Templo) e os atos de bondade.',
      'Mais adiante, o mestre Hillel pergunta: se eu não for por mim, quem será por mim? E se eu for só por mim, o que sou? E se não agora, quando?',
    ],
    bible: 'Compare com [[Mq 6.8]] e com [[Tg 1.27]].',
  },
  {
    id: 'forno',
    title: 'O Forno de Akhnai: “Não Está no Céu”',
    where: 'Talmude Babilônico, Bava Metzia 59b',
    link: 'https://www.sefaria.org/Bava_Metzia.59b',
    summary: [
      'Os sábios discutem se um tipo de forno pode ficar impuro. Rabi Eliezer, sozinho contra a maioria, chama quatro provas: uma alfarrobeira sai do lugar, um riacho corre para trás, as paredes da casa de estudo se inclinam e uma voz do céu lhe dá razão.',
      'Rabi Josué se levanta e diz que a Torá “não está no céu” (Dt 30.12). Depois do Sinai, explica um sábio, o que vale é a decisão da maioria dos mestres, e não a voz do céu.',
      'Anos depois, o profeta Elias conta a um rabino que Deus sorriu naquela hora e disse: “Meus filhos me venceram”. A história segue com os colegas queimando o que Eliezer tinha declarado puro e o excluindo do grupo, e com o choro dele.',
    ],
    bible: 'O texto citado é [[Dt 30.11-14]]. Para a regra da maioria, os sábios apelam a [[Êx 23.2]], que eles leem de um jeito diferente do que a Almeida traz.',
  },
];
