import type { Article } from './library';
import type { DraftFigureInfo } from './draft-content';
import type { SourceSet, Work } from './sources';
import type { Trail } from './trails';

/**
 * Volume 4 · A Paixão, da Ceia à Ressurreição: sete livros da trilha “Como a Ciência Explica”.
 * Os textos ficam em public/conteudo/artigos/paixao-*.md; as figuras, em shared/paixao/.
 * Os demais volumes da trilha não foram publicados.
 */
/** Faixas compactas das figuras (rótulo, título e miniatura); `inline` mantém o esquema inteiro na leitura. */
export const PAIXAO_FIGURES: Record<string, DraftFigureInfo> = {
  'paixao-percurso': { kind: 'Ilustração', title: 'O Getsêmani, de noite', thumb: 'imagens/paixao-anatomia-mini-percurso.jpg' },
  'paixao-corpo': { kind: 'Prancha de anatomia', title: 'O corpo diante da angústia', thumb: 'imagens/paixao-anatomia-mini-corpo.jpg' },
  'paixao-malco': { kind: 'Quatro cenas', title: 'A espada é interrompida; a orelha é curada', thumb: 'imagens/paixao-anatomia-mini-malco.jpg' },
  'paixao-anas': { kind: 'Quatro cenas', title: 'Diante de Anás: a pergunta e a bofetada', thumb: 'imagens/paixao-anatomia-mini-anas.jpg' },
  'paixao-rosto': { kind: 'Quatro cenas', title: 'O rosto coberto e a zombaria', thumb: 'imagens/paixao-anatomia-mini-rosto.jpg' },
  'paixao-mapa': { kind: 'Mapa interativo', title: 'Do cenáculo ao sepulcro, em Jerusalém', icon: 'map' },
  'paixao-chicote': { kind: 'Ilustração', title: 'O instrumento do açoite', thumb: 'imagens/paixao-anatomia-mini-chicote.jpg' },
  'paixao-ferimentos': { kind: 'Prancha de anatomia', title: 'O trauma, camada por camada', thumb: 'imagens/paixao-anatomia-mini-ferimentos.jpg' },
  'paixao-coroa': { kind: 'Ilustração', title: 'Uma coroa usada para zombar', thumb: 'imagens/paixao-anatomia-mini-coroa.jpg' },
  'paixao-placa': { kind: 'Texto reconstituído', title: 'A placa de Pilatos', icon: 'menu_book' },
  'paixao-morte': { kind: 'Prancha de anatomia', title: 'Circulação, respiração e morte', thumb: 'imagens/paixao-anatomia-mini-morte.jpg' },
  'paixao-lanca': { kind: 'Seis imagens-chave', title: 'A lança, depois da morte', thumb: 'imagens/paixao-anatomia-mini-lanca-agua-sangue-v6.jpg' },
  'paixao-oliveiras': { kind: 'Mapa', title: 'O Monte das Oliveiras e o Getsêmani', icon: 'map' },
  'paixao-regioes': { kind: 'Mapa', title: 'Quem mandava em cada região', icon: 'map' },
  'paixao-poder': { kind: 'Hierarquia', title: 'Quem respondia a quem', icon: 'menu_book', inline: true },
};

export const PAIXAO_ARTICLES: Article[] = [
  {
    id: 'paixao-quem-mandava',
    collection: 'estudos',
    title: 'Quem Mandava e Onde Mandava',
    subtitle: '',
    period: 'séc. I',
    icon: 'science',
    minutes: 8,
    story: true,
    passages: ['LUK 3', 'LUK 23', 'MAT 26', 'MAT 27', 'JHN 18', 'JHN 19'],
    topics: [
      'Um Versículo Desenha o Mapa',
      'Quem Mandava, Onde e com que Poder',
      'Herodes em Jerusalém',
      'Por que Jesus Passou de Mão em Mão',
    ],
  },
  {
    id: 'paixao-santa-ceia',
    collection: 'estudos',
    title: 'Santa Ceia',
    subtitle: '',
    period: 'séc. I',
    icon: 'science',
    minutes: 9,
    story: true,
    passages: ['MAT 26', 'MRK 14', 'LUK 22', 'JHN 13', 'JHN 14', 'JHN 17'],
    topics: [
      'Os Preparativos da Páscoa',
      'A Última Ceia',
      'À Mesa com o Traidor',
      'Do Cenáculo ao Jardim',
    ],
  },
  {
    id: 'paixao-getsemani',
    collection: 'estudos',
    title: 'Getsêmani',
    subtitle: '',
    period: 'séc. I',
    icon: 'science',
    minutes: 6,
    story: true,
    cover: 'imagens/paixao-getsemani.webp',
    passages: ['MAT 26', 'MRK 14', 'LUK 22'],
    topics: [
      'A Prensa de Azeite',
      'O Monte das Oliveiras e o Getsêmani',
      'A Minha Alma Está Triste até a Morte',
      'O que Houve com os Discípulos',
    ],
  },
  {
    id: 'paixao-prisao-e-interrogatorio',
    collection: 'estudos',
    title: 'Prisão e Interrogatório',
    subtitle: '',
    period: 'séc. I',
    icon: 'science',
    minutes: 20,
    story: true,
    passages: ['MAT 26', 'MAT 27', 'MRK 14', 'MRK 15', 'LUK 22', 'LUK 23', 'JHN 18'],
    topics: [
      'O Beijo e a Espada',
      'Vendado, Cuspido, Esbofeteado',
      'Quem Julgou Jesus?',
    ],
  },
  {
    id: 'paixao-acoite-e-condenacao',
    collection: 'estudos',
    title: 'Açoite e Condenação',
    subtitle: '',
    period: 'séc. I',
    icon: 'science',
    minutes: 9,
    story: true,
    passages: ['MAT 27', 'MRK 15', 'LUK 23', 'JHN 19'],
    topics: [
      'O Açoite que Abriu as Costas',
      'A Coroa e a Cana',
    ],
  },
  {
    id: 'paixao-crucificacao',
    collection: 'estudos',
    title: 'Crucificação',
    subtitle: '',
    period: 'séc. I',
    icon: 'science',
    minutes: 26,
    story: true,
    cover: 'imagens/paixao-golgota.webp',
    passages: ['MAT 27', 'MRK 15', 'LUK 23', 'JHN 19'],
    topics: [
      'Quantos Passos até o Gólgota?',
      'Simão, o Homem que Vinha do Campo',
      'Rei dos Judeus, em Três Línguas',
      'Meu Deus, Meu Deus, por que Me Desamparaste?',
    ],
  },
  {
    id: 'paixao-sepultamento-e-ressurreicao',
    collection: 'estudos',
    title: 'Sepultamento e Ressurreição',
    subtitle: '',
    period: 'séc. I',
    icon: 'science',
    minutes: 9,
    story: true,
    cover: 'imagens/paixao-tumulo-vazio.webp',
    passages: ['MAT 27', 'MAT 28', 'MRK 15', 'MRK 16', 'LUK 23', 'LUK 24', 'JHN 19', 'JHN 20', 'JHN 21'],
    topics: [
      'Os que Ficaram e os que Fugiram',
      'Ao Raiar do Primeiro Dia',
    ],
  },
];

export const PAIXAO_TRAILS: Trail[] = [
  {
    id: 'como-a-ciencia-explica',
    name: 'Como a Ciência Explica',
    short: 'Como a Ciência Explica',
    description: 'A Paixão, da Ceia à Ressurreição: o relato dos Evangelhos, seu contexto histórico e as ilustrações que acompanham o estudo.',
    icon: 'science',
    tone: '#3e4a3e',
    branches: [
      {
        title: 'Volume 4 · A Paixão, da Ceia à Ressurreição',
        // Ordem escolhida pelo dono do app em 13 nov 2026: a posição aqui é o número do livro na estante e na imagem de compartilhar
        ids: ['paixao-getsemani', 'paixao-santa-ceia', 'paixao-prisao-e-interrogatorio', 'paixao-acoite-e-condenacao', 'paixao-crucificacao', 'paixao-sepultamento-e-ressurreicao', 'paixao-quem-mandava'],
        about: 'O relato dos Evangelhos, o contexto histórico e as ilustrações que acompanham o estudo.',
      },
    ],
  },
];

export const PAIXAO_WORKS: Record<string, Work> = {
  'paixao-jaubert': { author: 'Annie Jaubert', title: 'La date de la Cène: calendrier biblique et liturgie chrétienne', publisher: 'Paris: J. Gabalda, 1957 (Études bibliques). Propõe uma ceia na terça-feira, pelo calendário solar usado em Qumran; hipótese discutida, citada aqui só para situar o debate sobre os dias da semana', kind: 'referencia' },
  'paixao-maslen-mitchell': { author: 'Matthew W. Maslen e Piers D. Mitchell', title: 'Medical Theories on the Cause of Death in Crucifixion', publisher: 'Journal of the Royal Society of Medicine, 99(4), 185–188, 2006. DOI: 10.1258/jrsm.99.4.185', kind: 'referencia' },
  'paixao-mcgovern': { author: 'Thomas W. McGovern, David A. Kaminskas e Eustace S. Fernandes', title: 'Did Jesus Die by Suffocation?: An Appraisal of the Evidence', publisher: 'The Linacre Quarterly, 90(1), 64–79; online em 2022, edição de 2023. DOI: 10.1177/00243639221116217', kind: 'referencia' },
  'paixao-edwards': { author: 'William D. Edwards, Wesley J. Gabel e Floyd E. Hosmer', title: 'On the Physical Death of Jesus Christ', publisher: 'JAMA, 255(11), 1455–1463, 1986. DOI: 10.1001/jama.1986.03370110077025. Reconstrução discutida à luz das revisões posteriores', kind: 'referencia' },
  'paixao-openstax': { author: 'J. Gordon Betts e colaboradores', title: 'Anatomy and Physiology 2e', publisher: 'OpenStax, 2022: 5.1–5.2, pele e glândulas; 13.2, sistema nervoso central; 14.1, percepção sensorial; 17.6, estresse; 19.1 e 19.3, coração e ciclo cardíaco; 20.2 e 20.4, circulação; 21.2, inflamação; 22.1 e 22.3, respiração. Explicações gerais, sem diagnóstico retrospectivo. Links dos capítulos nas pranchas', kind: 'referencia' },
  'paixao-hematidrose': { author: 'H. R. Jerajani, Bhagyashri Jaju, M. M. Phiske e Nitin Lade', title: 'Hematohidrosis — A Rare Clinical Phenomenon', publisher: 'Indian Journal of Dermatology, 54(3), 290–292, 2009. DOI: 10.4103/0019-5154.55645. O caso médico documenta a condição; sua aplicação a Lucas permanece interpretativa', kind: 'referencia' },
  'paixao-nicolotti': { author: 'Andrea Nicolotti', title: 'The Scourge of Jesus and the Roman Scourge. Historical and Archaeological Evidence', publisher: 'Journal for the Study of the Historical Jesus, 15(1), 1–59, 2017. DOI: 10.1163/17455197-01501006. Forma e materiais do instrumento de Jesus não identificados', kind: 'referencia' },
  'paixao-topografia': { author: 'Terra Sancta Museum; Custódia da Terra Santa; Tower of David Jerusalem Museum', title: 'O pretório, as tradições de Jerusalém e o Santo Sepulcro', publisher: 'Páginas institucionais consultadas em 10 de novembro de 2026. O mapa usa marcos aproximados e distingue tradição, hipótese e local desconhecido', kind: 'referencia' },
  'paixao-zias-sekeles': { author: 'Joseph Zias e Eliezer Sekeles', title: 'The Crucified Man from Giv\'at ha-Mivtar: A Reappraisal', publisher: 'Israel Exploration Journal, 35(1), 22–27, 1985. Reavaliação do esqueleto de Yehohanan: mantém o cravo no calcanhar e descarta a leitura de um cravo no antebraço', kind: 'referencia' },
  'paixao-gray': { author: 'Susan Standring (org.)', title: 'Gray\'s Anatomy: The Anatomical Basis of Clinical Practice', publisher: 'Elsevier, 42ª ed., 2020. Couro cabeludo, face e punho: explicações anatômicas gerais', kind: 'referencia' },
  'paixao-barbet': { author: 'Pierre Barbet', title: 'La Passion de N.-S. Jésus-Christ selon le chirurgien', publisher: 'Paris, 1950; em inglês, A Doctor at Calvary, 1953. Hipótese anatômica do cravo no punho e do nervo mediano, apresentada como hipótese', kind: 'referencia' },
  'paixao-moulton-milligan': { author: 'James H. Moulton e George Milligan', title: 'The Vocabulary of the Greek Testament Illustrated from the Papyri and Other Non-Literary Sources', publisher: 'Londres, 1914–1930. Origem da ideia de tetelestai como “pago” em recibos; a leitura é contestada pelos estudiosos', kind: 'referencia' },
  'paixao-pdf-consulta': { author: 'Ednei Fernando dos Santos, Renato da Silva Fernandez e Marcelo Donizeti Silva', title: 'Anatomofisiologia da Crucificação de Jesus: Revisão Crítica sob a Perspectiva Médico-Científica', publisher: 'Brazilian Journal of Biological Sciences, 12(27), 2025. DOI: 10.21472/bjbs.v12n27-014. PDF de consulta lido criticamente; a atribuição da morte ao golpe de lança e a certeza de algumas reconstruções não foram adotadas', kind: 'referencia' },
  'paixao-humphreys': { author: 'Colin J. Humphreys e W. Graeme Waddington', title: 'Dating the Crucifixion', publisher: 'Nature, 306, 743–746, 1983. Citado para as duas sextas-feiras de 14 de nisã possíveis no governo de Pilatos (7 de abril do ano 30 e 3 de abril do ano 33); a escolha entre elas é debatida. Artigo conferido por resumos, não lido na íntegra', kind: 'referencia' },
  'paixao-meeus': { author: 'Jean Meeus', title: 'Astronomical Algorithms', publisher: 'Richmond (Virgínia): Willmann-Bell, 2ª ed., 1998: cap. 7 (dia juliano), 25 (coordenadas do Sol) e 28 (equação do tempo). Método usado no cálculo do nascer e do pôr do sol em Jerusalém na Páscoa do século I', kind: 'referencia' },
  'paixao-noaa-sol': { author: 'NOAA Global Monitoring Laboratory', title: 'General Solar Position Calculations', publisher: 'gml.noaa.gov/grad/solcalc/solareqns.PDF, lido em 12 de novembro de 2026. Usado só para conferir o cálculo numa data de hoje (7 de abril de 2026): diferença de um minuto', kind: 'referencia' },
  'paixao-usno-sol': { author: 'Nautical Almanac Office, United States Naval Observatory', title: 'Almanac for Computers, 1990: Sunrise/Sunset Algorithm', publisher: 'Página reproduzida em edwilliams.org/sunrise_sunset_algorithm.htm, lida em 12 de novembro de 2026. Usado só para conferir o cálculo numa data de hoje: diferença de um minuto', kind: 'referencia' },
  'paixao-espenak-meeus': { author: 'Fred Espenak e Jean Meeus', title: 'Polynomial Expressions for Delta T (ΔT)', publisher: 'NASA, eclipse.gsfc.nasa.gov/SEhelp/deltatpoly2004.html, lido em 12 de novembro de 2026, adaptado de Five Millennium Canon of Solar Eclipses. Correção entre o tempo da Terra e o tempo uniforme no ano 30 (cerca de 3 horas), que muda o nascer do sol em menos de um minuto', kind: 'referencia' },
  'paixao-bratcher-nida': { author: 'Robert G. Bratcher e Eugene A. Nida', title: 'A Handbook on the Gospel of Mark (UBS Handbook Series)', publisher: 'Nova York: United Bible Societies, 1961. Comentário a Marcos 13.35, lido em tips.translation.bible em 12 de novembro de 2026: lista as quatro vigílias da noite pelo sistema romano, de três horas cada (18h às 21h, 21h à meia-noite, meia-noite às 3h, 3h às 6h), e põe o canto do galo na terceira. As horas são aproximadas', kind: 'referencia' },
  'paixao-pilatos-inscricao': { author: 'Inscrição de Cesareia Marítima', title: 'Inscrição de Pôncio Pilatos (26–36 d.C.)', publisher: 'Museu de Israel, registro em artsandculture.google.com/asset/SgGV0ad7K8m3BQ, consultado em 12 de novembro de 2026. O texto da inscrição identifica Pilatos como prefeito da Judeia (praefectus Iudaeae). Usado para distinguir o título romano de sua função de governador territorial; nenhuma fotografia foi reproduzida', kind: 'historia' },
  'paixao-josefo-ant20': { author: 'Flávio Josefo', title: 'The Antiquities of the Jews, Livro XX (tradução de William Whiston)', publisher: 'penelope.uchicago.edu/josephus/ant-20.html, cap. 10, §5 (20.251), conferido em 12 de novembro de 2026. Síntese da liderança judaica confiada aos sumos sacerdotes sob o domínio romano. Não descreve uma prefeitura municipal nem identifica um prefeito de Jerusalém', kind: 'historia' },
  'paixao-josefo-ant17': { author: 'Flávio Josefo', title: 'The Antiquities of the Jews, Livro XVII (tradução de William Whiston)', publisher: 'penelope.uchicago.edu/josephus/ant-17.html, cap. 11, §4 (17.317–318), conferido em 12 de novembro de 2026. Augusto confirma a divisão dos territórios e concede Galileia e Pereia a Herodes Antipas. Base para sua dependência política de Roma, em ramo separado do governador da Judeia', kind: 'historia' },
  'paixao-josefo-ant18': { author: 'Flávio Josefo', title: 'The Antiquities of the Jews, Livro XVIII (tradução de William Whiston)', publisher: 'Wikisource, en.wikisource.org/wiki/The_Antiquities_of_the_Jews/Book_XVIII; cap. 4 também conferido em penelope.uchicago.edu/josephus/ant-18.html em 12 de novembro de 2026. Base: Grato remove Anás e nomeia sucessores até Caifás (cap. 2, §2; 18.33–35); Antipas funda Tiberíades (cap. 2, §3); Pilatos leva o exército de Cesareia a Jerusalém para o inverno (cap. 3, §1); Vitélio envia Pilatos a Roma para responder ao imperador e destitui Caifás (cap. 4, §§2–3; 18.88–95). Esses últimos fatos são posteriores à Paixão e ilustram a intervenção romana', kind: 'historia' },
  'paixao-eob': { author: 'Zondervan', title: 'Encyclopedia of the Bible, verbete “Crucifixion”', publisher: 'Texto lido em biblegateway.com/resources/encyclopedia-of-the-bible/Crucifixion em 12 de novembro de 2026 (a página não traz o autor do verbete). Diz que a trave era levada pelo condenado até o lugar da execução, onde a estaca já estava fincada no chão; que, para prender as mãos à trave, usavam-se cordas, ou cravos e cordas, e às vezes também se cravavam os pés; que não havia método uniforme; que às vezes um calço ou uma cavilha era cravado na estaca como assento e que às vezes se fixava um degrau para os pés; e que a altura da estaca “era em geral pouco mais que a de um homem”. Estima a cruz de Jesus em sete a nove pés (de 2,1 a 2,7 m) pelo comprimento da cana de Jo 19.29, de cerca de três pés. É estimativa, não medida. A página não diz como a trave era erguida nem fala em buraco ou cunhas', kind: 'referencia' },
  'paixao-eob-coroa': { author: 'Zondervan', title: 'Encyclopedia of the Bible, verbete “Crown of Thorns”', publisher: 'Texto lido em biblegateway.com/resources/encyclopedia-of-the-bible/Crown-Thorns em 12 de novembro de 2026 (a página não traz o autor do verbete). Diz que a coroa “pode ter sido feita” do espinheiro-de-cristo sírio (Zizyphus spina-christi), que tem “dois espinhos grandes, afiados e curvos na base de cada folha”, e cita o Paliurus spina-christi, de espinhos “rígidos, pontiagudos e em pares de comprimento desigual”. Nenhuma das sete páginas lidas sobre as plantas candidatas dá o comprimento dos espinhos em centímetros; por isso o estudo não traz número', kind: 'referencia' },
  'paixao-wikipedia-crucificacao': { author: 'Colaboradores da Wikipédia', title: 'Crucifixion (Wikipédia em inglês), seção “Ancient Rome”', publisher: 'Texto lido por inteiro em en.wikipedia.org (action=raw) em 12 de novembro de 2026. Usado só para a ordem das etapas quando o lugar da execução era fixo: o condenado despido, as mãos presas à trave no chão, a trave içada com cordas e fixada ao poste, os pés presos depois; o peso da trave, de cerca de 45 kg; o assento preso ao poste. Fonte de segunda mão, sob licença CC BY-SA; o que ela afirma sobre o costume romano não vem dos Evangelhos', kind: 'referencia' },
  'paixao-osm': { author: 'Colaboradores do OpenStreetMap', title: 'Roteador a pé (routing.openstreetmap.de, perfil de pedestre)', publisher: 'Distâncias a pé entre os marcos do mapa da Paixão, consultadas em 10 e 12 de novembro de 2026 (licença ODbL). São os caminhos de hoje, não os da Jerusalém do século I; a ida e a volta a Herodes Antipas, de endereço desconhecido, é uma conta de ordem de grandeza feita a partir da distância entre a Fortaleza Antônia e o palácio de Herodes (cerca de 1,1 km a pé)', kind: 'referencia' },
  'paixao-nicodemos': { author: 'Escrito apócrifo, atribuído a Nicodemos', title: 'Evangelho de Nicodemos (Atos de Pilatos), Parte I, primeira forma grega (tradução inglesa de Roberts e Donaldson, Ante-Nicene Fathers, vol. 8)', publisher: 'Texto lido em earlychristianwritings.com/text/gospelnicodemus-roberts.html em 12 de novembro de 2026. No capítulo 9, antes do capítulo 10, Pilatos manda correr a cortina do tribunal e diz a Jesus que o sentencia a ser açoitado e fixado na cruz no jardim onde foi preso, e que Dismas (Dimas) e Gestas, os dois malfeitores, serão crucificados com ele. A tradução inglesa não numera os versículos; a numeração “cap. 9, v. 5”, de edições em português, não foi conferida. O prólogo da própria obra data a tradução grega no reinado de Teodósio. Não é Escritura: é citado só pelos nomes dos dois condenados, que os Evangelhos não trazem', kind: 'historia' },
  'paixao-wikipedia-nicodemos': { author: 'Colaboradores da Wikipédia', title: 'Gospel of Nicodemus e Penitent thief (Wikipédia em inglês)', publisher: 'Textos lidos por inteiro em en.wikipedia.org (action=raw) em 12 de novembro de 2026. Dizem que o Evangelho de Nicodemos é apócrifo, que as datas de suas partes são incertas e que a obra, na forma atual, é do século IV ou V; que os dois criminosos são nomeados Dismas (em português, Dimas) e Gestas nessa obra, e que o ladrão arrependido não tem nome nos Evangelhos canônicos. Há quem fale em século III; as fontes lidas dizem IV ou V, e foi isso que o estudo adotou. Fonte de segunda mão, sob licença CC BY-SA', kind: 'referencia' },
  'paixao-wikipedia-estadio': { author: 'Colaboradores da Wikipédia', title: 'Stadion (unit) (Wikipédia em inglês)', publisher: 'Texto lido por inteiro em en.wikipedia.org (action=raw) em 12 de novembro de 2026. O estádio era uma medida grega de comprimento, de 600 pés gregos; o valor exato não é consensual (as estimativas listadas vão de cerca de 157 a cerca de 209 metros), e o estádio ático ou ptolemaico, de cerca de 185 m, é o de maior convergência. Sessenta estádios dão, portanto, cerca de 11 km (de cerca de 9,4 a 12,5 km conforme a medida). Fonte de segunda mão, sob licença CC BY-SA', kind: 'referencia' },
  'paixao-bc-cruzes': { author: 'Boston College, School of Theology and Ministry (Crossroads)', title: 'The Death of Jesus: Execution Reconstruction', publisher: 'bc.edu/bc-web/schools/stm/sites/crossroads/resources/mini-course/death-of-jesus/execution-reconstruction.html, lido em 12 de novembro de 2026. Texto didático, sem autor indicado na página; diz que as cruzes concluídas ficavam “um pé ou dois” acima do chão. Usado só para a faixa baixa da estimativa. A Britannica, apontada por uma busca como fonte de alturas maiores (trave a 9–12 pés), bloqueia a leitura automática e não foi lida', kind: 'referencia' },
};

export const PAIXAO_ARTICLE_SOURCES: Record<string, SourceSet> = {
  'paixao-quem-mandava': {
    ancientLabel: 'Passagens bíblicas, Josefo e inscrição antiga',
    ancient: [
      'Lucas 3.1–2, 13.31–32, 22.52, 22.66 e 23.2–25; Mateus 26.3, 26.57–66, 27.2, 27.15 e 27.27; Marcos 6.14–27, 14.53, 15.1 e 15.10; João 11.47–55, 18.3–31, 19.10–22 e 21.1; Atos 4.6, 5.17, 23.6 e 23.33–35, na Almeida do aplicativo. Os detalhes de cada Evangelho são identificados sem impor uma harmonização cronológica completa',
      'Josefo, Antiguidades Judaicas, livros 17.317–318 e 18.33–38, 55 e 88–95 (tradução de Whiston, domínio público): concessão dos territórios a Antipas, nomeação e destituição dos sumos sacerdotes, fundação de Tiberíades, sede e deslocamento militar de Pilatos e intervenção do governador da Síria. Os episódios de Vitélio são posteriores à Paixão',
    ],
    works: ['paixao-josefo-ant17', 'paixao-josefo-ant18', 'paixao-josefo-ant20', 'paixao-pilatos-inscricao'],
  },
  'paixao-santa-ceia': {
    ancientLabel: 'Passagens bíblicas',
    ancient: [
      'Mateus 26.14–35; Marcos 11.1–20, 13.35, 14.1–25, 15.34 e 16.1–2; Lucas 22.8–32, 23.56 e 24.21; João 13–14, 17 e 18.1; Êxodo 12.5–9 e 12.15; 1 Coríntios 5.7, na Almeida do aplicativo. Os detalhes de cada Evangelho são identificados sem impor uma harmonização cronológica completa',
    ],
    works: ['paixao-topografia', 'paixao-bratcher-nida', 'paixao-meeus', 'paixao-noaa-sol', 'paixao-usno-sol', 'paixao-espenak-meeus'],
  },
  'paixao-getsemani': {
    ancientLabel: 'Passagens bíblicas',
    ancient: [
      'Mateus 26.23, 26.30–45, 26.56 e 26.58; Marcos 14.32 e 14.51–52; Lucas 19.37, 21.37, 22.6, 22.37–44; João 16.32, 18.1–15, 19.26 e 20.19; Atos 1.12; Isaías 53.5; Salmos 22.15, na Almeida do aplicativo. Os detalhes de cada Evangelho são identificados sem impor uma harmonização cronológica completa',
    ],
    works: ['paixao-openstax', 'paixao-hematidrose', 'paixao-topografia'],
  },
  'paixao-prisao-e-interrogatorio': {
    ancientLabel: 'Passagens bíblicas',
    ancient: [
      'Mateus 26.30, 26.52–75 e 27.1–26; Marcos 14.17–25, 14.65 e 15.8–25; Lucas 3.1, 20.25, 22.46–71 e 23.1–33; João 18.1–40, 19.1–16 e 21.9–17; Atos 1.18–19; Isaías 50.6 e 52.14; Zacarias 11.12–13; Levítico 16.8–22; 1 Pedro 2.24, na Almeida do aplicativo. Os detalhes de cada Evangelho são identificados sem impor uma harmonização cronológica completa',
    ],
    works: ['paixao-openstax', 'paixao-gray', 'paixao-topografia'],
  },
  'paixao-acoite-e-condenacao': {
    ancientLabel: 'Passagens bíblicas',
    ancient: [
      'Mateus 27.26–31; Marcos 15.15–20 e 15.25; Lucas 23.26; João 10.18, 19.1–16 e 19.28; Deuteronômio 25.3; Salmos 22.6–7; Isaías 50.6 e 53.5, na Almeida do aplicativo. Os detalhes de cada Evangelho são identificados sem impor uma harmonização cronológica completa',
    ],
    works: ['paixao-openstax', 'paixao-gray', 'paixao-pdf-consulta', 'paixao-eob-coroa'],
  },
  'paixao-crucificacao': {
    ancientLabel: 'Passagens bíblicas e imagem',
    ancient: [
      'Mateus 26.29, 26.56 e 27.26–51; Marcos 15.15–45; Lucas 22.37 e 23.1–54; João 10.18, 12.32–33, 18.11, 18.28 e 19.1–37; Atos 5.30; Êxodo 12.5–7 e 12.46; Levítico 1.9, 16.14–27 e 17.11; Números 19.9; Salmos 22, 49.7 e 69.21; Provérbios 31.6–7; Isaías 53.6 e 53.12; Hebreus 9.7–28, 10.1–20 e 13.11–12; e, em menor medida, Mateus 4.18, 5.41, 10.4 e 26.6, Lucas 2.35 e 9.23, João 1.29, 6.71 e 20.25, Atos 2.10, 6.9, 11.20 e 13.1, 1 Coríntios 5.7, Efésios 5.2, Colossenses 2.14 e 1 Pedro 2.24, na Almeida do aplicativo. Os detalhes de cada Evangelho são identificados sem impor uma harmonização cronológica completa. As explicações para a recusa do vinho (Provérbios 31.6–7, Mateus 26.29, João 18.11 e Salmos 69.21) são pistas de leitura, e os Evangelhos não dizem o motivo',
      'Pintura: James Tissot (1836–1902), Simão, o Cireneu, obrigado a carregar a cruz com Jesus (entre 1886 e 1894), Brooklyn Museum; domínio público, reproduzida do Wikimedia Commons',
      'Pintura: James Tissot (1836–1902), As filhas de Jerusalém (entre 1886 e 1894), Brooklyn Museum; domínio público, reproduzida do Wikimedia Commons. A corrente desenhada pelo pintor não está nos Evangelhos',
    ],
    works: ['paixao-openstax', 'paixao-gray', 'paixao-pdf-consulta', 'paixao-topografia', 'paixao-osm', 'paixao-eob', 'paixao-wikipedia-crucificacao', 'paixao-nicodemos', 'paixao-wikipedia-nicodemos', 'paixao-meeus', 'paixao-noaa-sol', 'paixao-usno-sol', 'paixao-espenak-meeus'],
  },
  'paixao-sepultamento-e-ressurreicao': {
    ancientLabel: 'Passagens bíblicas',
    ancient: [
      'Mateus 27.60–66 e 28.6–20; Marcos 14.28 e 15.40–47; Lucas 23.48–56 e 24.1–32; João 10.17, 11.25, 18.18, 19.38–42, 20.1–29 e 21.3–17; Zacarias 13.7; 1 Coríntios 15.5–6; 2 Coríntios 5.15; Gálatas 2.20; Apocalipse 1.17–18, na Almeida do aplicativo. Os detalhes de cada Evangelho são identificados sem impor uma harmonização cronológica completa',
    ],
    works: ['paixao-wikipedia-estadio'],
  },
};

/** Ids dos livros: neles ficam ligados o grifo das falas, as faixas compactas, a sanfona e as linhas “Saiba mais”. */
export const PAIXAO_IDS = new Set(PAIXAO_ARTICLES.map((article) => article.id));
