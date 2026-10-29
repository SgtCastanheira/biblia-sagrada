/**
 * Novidades de cada atualização. A mais recente (a primeira da lista) aparece uma vez, sozinha,
 * para quem já usava o app; todas ficam em /novidades. Ao publicar algo novo, acrescente no topo.
 */

export interface WhatsNewItem {
  icon: string;
  title: string;
  text: string;
  link: string;
  /** Como chegar lá, quando não é óbvio ("Toque num versículo"). */
  tip?: string;
}

export interface Release {
  /** Identificador único: mude a cada publicação com novidades. */
  id: string;
  date: string;
  title: string;
  items: WhatsNewItem[];
}

export const RELEASES: Release[] = [
  {
    id: 'biblia-russa-e-versiculos-faltando',
    date: '29 de outubro de 2026',
    title: 'Bíblia em Russo e Aviso de Versículos que Faltam',
    items: [
      { icon: 'translate', title: 'Bíblia em russo, inteira e sem internet', text: 'A Tradução Sinodal agora vem dentro do app, com os 66 livros. Antes ela só abria o Gênesis.', link: '/ler/JHN/3', tip: 'Toque na sigla da versão, no alto do capítulo.' },
      { icon: 'info', title: 'Versículos que a tradução não traz', text: 'Algumas traduções, como as das línguas indígenas e a Nueva Biblia Viva, pulam versículos. Agora o fim do capítulo diz quais faltam. A Open English Bible também avisa que o Antigo Testamento dela ainda está incompleto.', link: '/ler/JHN/1' },
    ],
  },
  {
    id: 'lembretes-e-leitura-imersiva',
    date: '28 de outubro de 2026',
    title: 'Lembretes do Dia e Histórias para Mergulhar',
    items: [
      { icon: 'self_improvement', title: 'Lembretes do dia', text: 'Três vezes por dia, em horários diferentes, o app chama você: “Já orou hoje?”, “Vamos orar pela sua família?”, “E se Jesus voltar hoje, você sobe?”. O chamado da vez fica na tela inicial; ative a notificação para vê-lo na tela do celular ou do computador.', link: '/ajustes', tip: 'Em Ajustes › Lembretes do dia.' },
      { icon: 'headphones', title: 'Histórias para mergulhar', text: 'Capa com o quadro da história, menu que sai da frente enquanto você lê no celular, fotos que ampliam com um toque, o botão “Ouvir a história” na capa e um aviso quando você termina de ler.', link: '/artigo/igreja-e-estado' },
    ],
  },
  {
    id: 'igreja-e-estado-teologia-natal',
    date: '28 de outubro de 2026',
    title: 'A Igreja e o Estado, a Teologia e o Natal',
    items: [
      { icon: 'location_city', title: 'A Igreja e o Estado no Brasil', text: 'Como a fé reuniu o povo, o governo levou a estrutura e as cidades nasceram em volta da igreja: da primeira missa, em 1500, aos jesuítas, às capelas que viraram cidades, à separação de 1890, a Brasília e ao interior. Com quadros, cenas e desenhos.', link: '/artigo/igreja-e-estado', tip: 'Também em Histórias › A Igreja e o Estado.' },
      { icon: 'bubble_chart', title: 'Dois assuntos novos nos círculos', text: 'Teologia e A Igreja e o Estado ganharam o seu círculo na tela inicial e em Histórias, ao lado dos outros assuntos.', link: '/historia' },
      { icon: 'local_library', title: 'Teologia Sistemático-Carismática', text: 'Síntese da introdução geral e dos dois primeiros capítulos da obra de César Moisés Carvalho e Céfora Carvalho: a pergunta “teologia pode ser pública?”, o conceito de sinergista, a lógica da fé e a lógica grega, o Espírito Santo como locus e o sujeito da teologia.', link: '/artigo/teologia-sistematico-carismatica', tip: 'Também em Histórias › Teologia.' },
      { icon: 'calendar_month', title: 'O Natal e os calendários', text: 'Uma data que todo mundo conhece e uma pergunta que quase ninguém faz. Siga as pistas do Evangelho, os dois suspeitos do 25 de dezembro e a noite de 1582 em que dez dias desapareceram do calendário.', link: '/artigo/natal-e-os-calendarios', tip: 'Também em Histórias › Contexto Histórico.' },
    ],
  },
  {
    id: 'linguas-indigenas-trindade-deuses',
    date: '27 de outubro de 2026',
    title: 'A Bíblia em línguas indígenas, a Trindade e os deuses pagãos',
    items: [
      { icon: 'translate', title: 'A Bíblia em línguas indígenas do Brasil', text: 'A Bíblia inteira em Guarani Mbyá e em Guajajára, e o Novo Testamento em Kaiwá (Guarani Kaiowá), Kayabí, Kaapor, Mundurukú, Sateré-Mawé, Ticuna, Kaingang, Terena e Xavante, das traduções da Wycliffe.', link: '/ler/JHN/3', tip: 'Toque na sigla da versão, no alto do capítulo.' },
      { icon: 'change_history', title: 'A Trindade', text: 'Um só Deus, Pai, Filho e Espírito Santo: o que a Bíblia ensina, onde está escrito, os erros mais comuns e por que isso muda a oração e a vida no Espírito.', link: '/artigo/trindade' },
      { icon: 'shield', title: 'Os Deuses Pagãos na Bíblia', text: 'Baal, Astarote, Moloque, Dagom, Júpiter, Diana e outros: onde aparecem, os nomes que ganharam, o que pediam e por que a Bíblia manda rejeitá-los. Com os nomes deles que ainda usamos hoje.', link: '/artigo/deuses-pagaos' },
      { icon: 'check_circle', title: 'Lições com cores mais leves', text: 'Nas lições da EBD, as aulas que já foram ficam em verde-claro, com um check; as próximas, em marrom-claro; e a da vez pisca em dourado suave.', link: '/ebd/apoio' },
    ],
  },
  {
    id: 'historias-ligadas',
    date: '27 de outubro de 2026',
    title: 'Histórias ligadas: continue de onde parou',
    items: [
      { icon: 'route', title: 'Trilhas como uma série', text: 'No fim de cada história aparece a próxima da trilha, como o próximo episódio, com quantas você já leu. No fim da trilha, o app leva à trilha seguinte.', link: '/historia?trilha=igreja' },
      { icon: 'schedule', title: 'Na mesma época', text: 'Também no fim de cada história: o que acontecia no mesmo tempo em outras trilhas. O app não repete as histórias que o próprio texto já indicou.', link: '/artigo/constantino-e-os-concilios' },
      { icon: 'bookmark', title: 'Continue de onde parou', text: 'O app lembra onde você parou em cada história. Ao voltar, um toque leva ao ponto certo, e a tela inicial mostra a última história começada.', link: '/' },
      { icon: 'check_circle', title: 'Histórias lidas', text: 'As histórias que você terminou ganham um check, e cada trilha mostra quantas já leu e qual é a próxima. Enquanto lê, o capítulo atual aparece embaixo da tela, com o tempo que falta.', link: '/historia' },
    ],
  },
  {
    id: 'ebd-todas-as-turmas-e-historias-desenhadas',
    date: '27 de outubro de 2026',
    title: 'EBD de todas as turmas, bolinhas e histórias desenhadas',
    items: [
      { icon: 'record_voice_over', title: 'Voz mais natural para ouvir', text: 'O app agora escolhe primeiro as vozes neurais da Microsoft (Francisca) e as vozes Premium da Apple, e deixa a voz do Google, que soa mais mecânica, por último. As melhores levam uma estrela na lista de vozes.', link: '/ler/JHN/1', tip: 'Toque em Ouvir no capítulo e escolha a voz.' },
      { icon: 'search', title: 'Pesquisar no Estudo', text: 'Procure um assunto, como “conselho de Niceia”, e o app busca no título e no texto das histórias, dos estados, dos sermões, dos personagens, do dicionário, das profecias, das curiosidades e da Harpa.', link: '/estudo', tip: 'Campo de pesquisa no alto da aba Estudo.' },
      { icon: 'school', title: 'As 13 lições de todas as turmas', text: 'Do Berçário aos Adultos, as 10 turmas têm as 13 lições do 4º trimestre, com lembretes, dinâmicas, brincadeiras e perguntas para o professor.', link: '/ebd/apoio' },
      { icon: 'counter_1', title: 'Lições em bolinhas', text: 'Os números das lições agora são bolinhas, como as das histórias. A lição da vez pisca em dourado, e as aulas que já passaram ganham um check.', link: '/ebd/apoio/primarios' },
      { icon: 'flag', title: 'A bandeira de cada estado', text: 'Na lista dos estados, na página de cada um e nas etapas do mapa da Assembleia de Deus.', link: '/assembleia-de-deus' },
    ],
  },
  {
    id: 'biblia-hebraica-e-ebd-em-cartoes',
    date: '27 de outubro de 2026',
    title: 'A Bíblia em hebraico, a Bíblia judaica e a EBD em cartões',
    items: [
      { icon: 'quiz', title: 'Você lembra o que leu?', text: 'Um jogo de perguntas com as alternativas A, B, C e D: 5 perguntas sobre o capítulo e a sua história, 10 sobre o livro todo, ou 5 sobre uma história. Aparece no fim de cada capítulo e de cada história.', link: '/quiz', tip: 'Também em Estudo › Você lembra o que leu?' },
      { icon: 'translate', title: 'A Bíblia em hebraico', text: 'Antigo e Novo Testamento em hebraico, da direita para a esquerda, para comparar com a Almeida. Escolha “Bíblia hebraica” na sigla da versão.', link: '/ler/GEN/1', tip: 'Toque na sigla da versão, no alto do capítulo.' },
      { icon: 'menu_book', title: 'A Bíblia judaica', text: 'Como era a Bíblia no tempo de Jesus: rolos, três partes, 24 livros e outra ordem. Veja os livros em estantes e como eles mudam de lugar na nossa Bíblia.', link: '/artigo/biblia-judaica' },
      { icon: 'swipe', title: 'EBD em cartões, com datas', text: 'Cada lição virou cartões que se deslizam, como os stories. A data de cada aula aparece, e o número da lição da semana pisca. Todas as turmas, do Berçário aos Adultos, e as 13 lições de Jovens (Filipenses).', link: '/ebd/apoio/jovens' },
      { icon: 'account_balance', title: 'Os Faraós da Bíblia', text: 'Quem foram, quando governaram, a quem respondiam e quem estava debaixo deles. E, no estudo dos Herodes, quem mandava em quem: o César, o governador da Síria e o prefeito da Judeia.', link: '/artigo/os-faraos-da-biblia' },
      { icon: 'badge', title: 'Os cargos na Assembleia de Deus', text: 'Cooperador, diácono, presbítero, evangelista e pastor: o que a Bíblia pede, o que se encontra por escrito e o que só se ouve dizer. Também: a Congregação Cristã faz parte da Assembleia de Deus?', link: '/artigo/cargos-na-assembleia-de-deus' },
    ],
  },
  {
    id: 'ponte-entre-os-testamentos',
    date: '27 de outubro de 2026',
    title: 'A ponte entre os Testamentos, a Septuaginta e a Bíblia em outras línguas',
    items: [
      { icon: 'checklist', title: 'EBD: as 13 lições de Adultos, em Deuteronômio', text: 'Para o professor, em cada lição: lembretes do que preparar, como abrir a aula, curiosidades, contexto, dinâmicas e brincadeiras passo a passo, perguntas e as ligações com os estudos do app.', link: '/ebd/apoio/adultos', tip: 'Em Ensino › EBD › Apoio ao professor.' },
      { icon: 'palette', title: 'Novas cores e luz quente', text: 'Noite quente, Floresta, Névoa e o modo Automático, além de um controle de luz quente que tira o azul da tela. Toque em Aparência da leitura.', link: '/ler/JHN/3', tip: 'No alto do capítulo, o ícone de letras.' },
      { icon: 'public', title: 'Mapa entre os Testamentos', text: 'De Alexandre a Herodes, época por época, com Israel em destaque no meio dos impérios e as referências de Daniel.', link: '/artigo/entre-os-testamentos' },
      { icon: 'translate', title: 'A Bíblia em espanhol e em alemão', text: 'Reina-Valera 1909, Versión Biblia Libre, Nueva Biblia Viva e outras em espanhol; Lutero 1912, Elberfelder e Schlachter em alemão. Todas funcionam sem internet e podem ser comparadas com a Almeida.', link: '/ler/JHN/3', tip: 'Toque na sigla da versão, no alto do capítulo.' },
      { icon: 'menu_book', title: 'A Septuaginta, em detalhe', text: 'A lenda dos 72 sábios, o que se sabe de verdade, a ordem e os nomes dos livros da sua Bíblia, e por que o Novo Testamento cita o Antigo do jeito que cita.', link: '/artigo/septuaginta' },
      { icon: 'swap_horiz', title: 'Os 400 Anos entre os Testamentos', text: 'De Malaquias a Mateus: Alexandre, os Macabeus, a chegada dos romanos, fariseus e saduceus, as sinagogas e a esperança do Messias. A história que explica o mundo em que Jesus nasceu.', link: '/artigo/entre-os-testamentos', tip: 'Também aparece ao ler Malaquias 4 e Mateus 1.' },
    ],
  },
  {
    id: 'ad-linha-do-tempo-e-perseguidos',
    date: '27 de outubro de 2026',
    title: 'A linha do tempo e os irmãos perseguidos',
    items: [
      { icon: 'timeline', title: 'Linha do tempo da Assembleia de Deus', text: 'Ano a ano, em ordem cronológica: a igreja em cada estado ao lado das guerras, secas, epidemias e crises do Brasil e do mundo.', link: '/assembleia-de-deus/linha-do-tempo' },
      { icon: 'history_edu', title: 'Os Irmãos Perseguidos', text: 'O cotidiano, quem perseguia, o que a lei dizia e o que não se sabe — contado sem inventar o que as fontes não registram.', link: '/artigo/irmaos-perseguidos' },
      { icon: 'headphones', title: 'Ouvir a Bíblia e as histórias', text: 'Sem poder ler agora? Toque no fone de ouvido e uma voz calma lê o capítulo ou a história para você, trecho por trecho, com pausa, velocidade e o texto destacado na tela. Na Bíblia, ao terminar um capítulo ela segue para o próximo.', link: '/ler/PSA/23', tip: 'O fone fica no alto do capítulo e da história.' },
      { icon: 'bookmark', title: 'A fitinha e a página que vira', text: 'Na Bíblia, arraste a página para o lado e ela vira como uma folha de papel. A fitinha no alto marca onde você parou; toque nela para colocar ou tirar, e ache o caminho de volta na tela inicial.', link: '/ler/JHN/3', tip: 'Toque na fitinha no canto de cima da página.' },
      { icon: 'bubble_chart', title: 'Histórias por assunto, em círculos', text: 'Na tela inicial e em Histórias, um círculo para cada assunto: Histórias da Bíblia, Sobre a Bíblia, Contexto histórico, Profecias, História da Igreja, Pentecostalismo, Evangelho no Brasil e Harpa Cristã.', link: '/historia' },
      { icon: 'near_me', title: 'Quem enviou quem', text: 'Nas histórias dos estados, um quadro mostra de onde saíram os pastores e para onde foram. Em Mato Grosso, a história de Sebastião Rodrigues de Souza e de Eduardo Joerke foi refeita.', link: '/assembleia-de-deus/mt' },
      { icon: 'list', title: 'Índice ao lado do texto', text: 'No computador, o índice e o mapa ficam fixos ao lado da leitura; no celular, abrem com um toque.', link: '/assembleia-de-deus' },
    ],
  },
  {
    id: 'ad-ministerios-em-cada-estado',
    date: '26 de outubro de 2026',
    title: 'Os ministérios em cada estado',
    items: [
      { icon: 'account_tree', title: 'Missão, Madureira e CADB, lado a lado', text: 'Em cada estado: a quem pertence hoje a igreja pioneira, as convenções e os grandes ministérios — como Belém e Brás, em São Paulo, e São Cristóvão e Madureira, no Rio.', link: '/assembleia-de-deus' },
      { icon: 'history_edu', title: 'A CADB e como cada convenção se organiza', text: 'A separação de 2017 e as diferenças entre a CGADB, a CONAMAD e a CADB.', link: '/artigo/madureira-e-a-separacao' },
      { icon: 'person', title: 'Mato Grosso: o pastor Sebastião Rodrigues de Souza', text: 'De sete congregações a mais de duas mil igrejas (1974–2020).', link: '/assembleia-de-deus/mt' },
    ],
  },
  {
    id: 'ad-de-onde-saiu-cada-pioneiro',
    date: '26 de outubro de 2026',
    title: 'A Assembleia de Deus em cada estado',
    items: [
      { icon: 'pin_drop', title: 'A história completa de cada estado', text: 'Escolha o estado: veja no mapa, com a seta, de onde saíram os pioneiros e leia como o evangelho foi construído ali.', link: '/assembleia-de-deus', tip: 'Em Estudo → História da Igreja e da Bíblia.' },
      { icon: 'help', title: 'Por que as histórias divergem', text: 'O caso de Mato Grosso e de outros estados: o que cada fonte conta e por quê.', link: '/artigo/assembleia-de-deus-no-brasil' },
    ],
  },
  {
    id: 'avivamentos-e-ad-pelo-brasil',
    date: '26 de outubro de 2026',
    title: 'Os avivamentos desde Atos e a Assembleia de Deus pelo Brasil',
    items: [
      { icon: 'local_fire_department', title: 'Os Avivamentos desde Atos', text: 'Época por época: como começou cada avivamento, por quem, como terminou, o que mudou na sociedade e os sermões de cada tempo.', link: '/artigo/avivamentos-desde-atos', tip: 'Em Estudo → Avivamentos.' },
      { icon: 'church', title: 'A História da Assembleia de Deus no Brasil', text: 'Como os obreiros eram separados em cada época, o casamento dos pioneiros, os costumes, o ensino e as mulheres na obra.', link: '/artigo/assembleia-de-deus-no-brasil' },
      { icon: 'map', title: 'Mapa interativo: do Pará ao Rio e a São Paulo', text: 'O caminho da igreja, etapa por etapa, com as datas e as distâncias.', link: '/mapas/assembleia-de-deus-estados', tip: 'Toque em “Viver a jornada”.' },
      { icon: 'pin_drop', title: 'Estado por estado', text: 'Quando e por quem a Assembleia de Deus chegou a cada estado, de Belém a Brasília, num mapa.', link: '/mapas/assembleia-de-deus-estados' },
    ],
  },
  {
    id: 'escola-dominical-panorama',
    date: '26 de outubro de 2026',
    title: 'A Escola Dominical e a história em resumo',
    items: [
      { icon: 'school', title: 'A História da Escola Dominical', text: 'De Robert Raikes, na Inglaterra (1780), a Sarah Kalley, em Petrópolis (1855), e às Lições Bíblicas das Assembleias de Deus.', link: '/artigo/escola-dominical', tip: 'Em Estudo → História da Igreja.' },
      { icon: 'auto_stories', title: 'A História da Igreja em Resumo', text: 'Como o livro de Atos: um panorama de dois mil anos, com cartões que levam a cada história completa. As histórias agora se cruzam.', link: '/artigo/panorama-da-igreja' },
    ],
  },
  {
    id: 'historias-imersivas',
    date: '26 de outubro de 2026',
    title: 'Entre na história',
    items: [
      { icon: 'movie', title: 'Histórias com cara de documentário', text: 'Capa com os retratos, capítulos numerados, cenas que levam você ao lugar e à data, os personagens de cada história e uma linha do tempo nova.', link: '/artigo/daniel-berg-e-gunnar-vingren', tip: 'Em Estudo → História da Igreja.' },
      { icon: 'route', title: 'A viagem dos pioneiros', text: 'Uma ilustração do caminho de Daniel Berg e Gunnar Vingren: da Suécia aos Estados Unidos e de Nova York a Belém do Pará.', link: '/artigo/daniel-berg-e-gunnar-vingren' },
    ],
  },
  {
    id: 'frida-madureira-frances',
    date: '26 de outubro de 2026',
    title: 'Frida Vingren, Madureira e a Bíblia em francês',
    items: [
      { icon: 'woman', title: 'Frida Vingren', text: 'A missionária, pregadora e compositora que ajudou a construir a Assembleia de Deus — e foi esquecida por décadas.', link: '/artigo/frida-vingren', tip: 'Em Estudo → História da Igreja.' },
      { icon: 'account_tree', title: 'Macalão e a separação de 1989', text: 'De Gunnar Vingren no Rio ao Ministério de Madureira e às convenções de hoje, com a árvore das Assembleias de Deus.', link: '/artigo/madureira-e-a-separacao' },
      { icon: 'translate', title: 'Bíblia em francês', text: 'A Louis Segond (1910), funcionando sem internet.', link: '/ler/JHN/3', tip: 'Toque na sigla da versão, no alto da tela.' },
    ],
  },
  {
    id: 'berg-e-vingren',
    date: '26 de outubro de 2026',
    title: 'Daniel Berg e Gunnar Vingren',
    items: [
      { icon: 'sailing', title: 'Os pioneiros da Assembleia de Deus', text: 'A vida dos dois suecos que chegaram a Belém em 1910: o chamado para o “Pará”, o trabalho na fundição, o nascimento da igreja em 1911 e o legado.', link: '/artigo/daniel-berg-e-gunnar-vingren', tip: 'Em Estudo → História da Igreja.' },
    ],
  },
  {
    id: 'ministerios-na-biblia',
    date: '26 de outubro de 2026',
    title: 'Os Ministérios na Bíblia',
    items: [
      { icon: 'diversity_3', title: 'Apóstolos, profetas, evangelistas, pastores…', text: 'Um estudo de cada ministério: a palavra original, quem foi na Bíblia, o que fazia, as qualificações e como as igrejas se organizam hoje.', link: '/artigo/ministerios-na-biblia', tip: 'Em Estudo, na nova seção Igreja e ministérios.' },
    ],
  },
  {
    id: 'harpa-crista',
    date: '26 de outubro de 2026',
    title: 'A História da Harpa Cristã',
    items: [
      { icon: 'music_note', title: 'Harpa Cristã', text: 'A história do hinário das Assembleias de Deus, de 1921 aos 640 hinos — e de cada hino: quem escreveu, traduziu, quando e por quê.', link: '/harpa', tip: 'Em Estudo, na seção História da Igreja e da Bíblia.' },
      { icon: 'auto_stories', title: 'A origem dos hinos', text: 'Chuvas de Graça, Noite de Paz, Grandioso És Tu, O Pão da Vida e outros, com o hino original e o texto bíblico.', link: '/harpa' },
      { icon: 'library_books', title: 'Sempre com a fonte', text: 'Cada hino mostra onde se confirmam o número, o autor e a história. As letras não ficam no app.', link: '/harpa/1' },
    ],
  },
  {
    id: 'app-organizado',
    date: '23 de outubro de 2026',
    title: 'O app ficou mais organizado',
    items: [
      { icon: 'import_contacts', title: 'Bíblia', text: 'A aba “Ler” agora se chama Bíblia: abre o leitor onde você parou.', link: '/livros' },
      { icon: 'local_library', title: 'Estudo organizado por seções', text: 'Personagens, Mapas, Contexto, Profecias, Idiomas, Ministérios e História — cada estudo em um só lugar, com um índice no topo.', link: '/estudo' },
      { icon: 'school', title: 'Nova aba Ensino', text: 'A EBD, o apoio ao professor, o IBUC e os seus sermões com o modo púlpito ficam juntos.', link: '/ensino' },
      { icon: 'person', title: 'Nova aba Meu espaço', text: 'O devocional, as anotações de culto, os favoritos e a sua leitura — o que é seu, num lugar só.', link: '/meu-espaco' },
      { icon: 'home', title: 'Início mais simples', text: 'Só o essencial do dia: o versículo, o devocional, a leitura e a aula da semana.', link: '/' },
    ],
  },
  {
    id: 'ebd-apoio-ao-professor',
    date: '23 de outubro de 2026',
    title: 'Apoio ao professor da EBD',
    items: [
      { icon: 'volunteer_activism', title: 'EBD: Adolescentes, Jovens e Adultos', text: 'Para cada tema da revista: como abrir a aula, curiosidades, contexto histórico, dinâmicas para a idade da turma, perguntas e aplicação.', link: '/ebd/apoio' },
      { icon: 'school', title: 'Para preparar a aula', text: 'Cada lição da sua EBD mostra o que o app tem sobre os textos: contexto do livro, estudos, profecias, personagens e mapas.', link: '/ebd', tip: 'Abra uma lição e preencha o Texto Áureo e a Leitura Bíblica.' },
      { icon: 'visibility', title: 'Aula-modelo: Neemias', text: 'Veja como cada tema vai aparecer, com uma dinâmica diferente para cada turma.', link: '/ebd/apoio/aula/modelo-neemias-reconstroi-os-muros' },
    ],
  },
  {
    id: 'reinos-templo-fontes',
    date: '23 de outubro de 2026',
    title: 'Os dois reinos, o templo no mapa e as fontes',
    items: [
      { icon: 'compare_arrows', title: 'Os dois reinos lado a lado', text: 'Os reis de Israel e de Judá numa só linha do tempo, com a avaliação de cada um e os fatos que ligam os dois reinos.', link: '/memorial', tip: 'No Memorial da Fé, toque na aba “Os dois reinos”.' },
      { icon: 'account_balance', title: 'O templo no mapa das tribos', text: 'O templo aparece no mapa, e cada tribo mostra a distância do seu território até ele.', link: '/tribos', tip: 'Toque no nome de uma tribo, embaixo do mapa.' },
      { icon: 'library_books', title: 'Fontes das informações', text: 'Cada estudo mostra de onde vêm as informações: a Bíblia, fontes antigas, arqueologia e obras de referência.', link: '/fontes' },
    ],
  },
  {
    id: 'tribos-ibuc-versoes',
    date: '23 de outubro de 2026',
    title: 'Tribos de Israel, IBUC e novas versões',
    items: [
      { icon: 'groups', title: 'As doze tribos de Israel', text: 'Cada tribo com o patriarca, as bênçãos de Jacó e de Moisés, os líderes e curiosidades — e o mapa da divisão da terra com a distância até o templo.', link: '/tribos' },
      { icon: 'child_care', title: 'IBUC: apoio ao professor', text: 'Turmas por idade, com curiosidades, contexto histórico e brincadeiras para preparar a aula.', link: '/ibuc' },
      { icon: 'translate', title: '7 versões em português', text: 'Bíblia Livre, Nova Bíblia Viva, NVA, Bíblia Portuguesa Mundial, Almeida 1911 e mais — todas funcionando sem internet.', link: '/ler/JHN/3', tip: 'Toque na sigla da versão (ALM), no alto da tela.' },
      { icon: 'open_in_new', title: 'Compare com ARA, NVI e NTLH', text: 'Abra o mesmo versículo em outras versões conhecidas, no site do YouVersion.', link: '/ler/PSA/23', tip: 'Toque num versículo e escolha a versão.' },
      { icon: 'edit_note', title: 'Anotações mais rápidas', text: 'Digite “Mat” e o app sugere Mateus; com o capítulo e o versículo, o texto aparece para você anotar embaixo.', link: '/anotacoes' },
      { icon: 'refresh', title: 'Um versículo novo a cada visita', text: 'A tela inicial traz um versículo diferente cada vez que você abre o app.', link: '/' },
    ],
  },
  {
    id: 'lancamento',
    date: '23 de outubro de 2026',
    title: 'Lançamento do app',
    items: [
      { icon: 'menu_book', title: 'Bíblia offline', text: 'A Almeida inteira no aparelho, com busca, destaques e favoritos.', link: '/livros' },
      { icon: 'local_library', title: 'Estudo de Gênesis a Apocalipse', text: 'Dicionário com hebraico e grego, Memorial da Fé, mapas, atlas, profecias e história da Igreja.', link: '/estudo' },
      { icon: 'school', title: 'EBD, devocional e sermões', text: 'Organize as aulas da revista, o devocional diário, as anotações de culto e os sermões com modo púlpito.', link: '/ebd' },
    ],
  },
];

export const LATEST_RELEASE = RELEASES[0];

/** Texto para compartilhar a atualização (WhatsApp, redes sociais). */
export function shareText(release: Release, url: string): string {
  return [
    `📖 *Bíblia Sagrada* — novidades: ${release.title}`,
    '',
    ...release.items.map((i) => `• *${i.title}*: ${i.text}`),
    '',
    `Abra e instale no celular: ${url}`,
  ].join('\n');
}
