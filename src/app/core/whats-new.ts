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
    id: 'escola-dominical-panorama',
    date: '26 de outubro de 2026',
    title: 'A Escola Dominical e a história em resumo',
    items: [
      { icon: 'school', title: 'A história da Escola Dominical', text: 'De Robert Raikes, na Inglaterra (1780), a Sarah Kalley, em Petrópolis (1855), e às Lições Bíblicas das Assembleias de Deus.', link: '/artigo/escola-dominical', tip: 'Em Estudo → História da Igreja.' },
      { icon: 'auto_stories', title: 'A história da Igreja em resumo', text: 'Como o livro de Atos: um panorama de dois mil anos, com cartões que levam a cada história completa. As histórias agora se cruzam.', link: '/artigo/panorama-da-igreja' },
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
    title: 'Os ministérios na Bíblia',
    items: [
      { icon: 'diversity_3', title: 'Apóstolos, profetas, evangelistas, pastores…', text: 'Um estudo de cada ministério: a palavra original, quem foi na Bíblia, o que fazia, as qualificações e como as igrejas se organizam hoje.', link: '/artigo/ministerios-na-biblia', tip: 'Em Estudo, na nova seção Igreja e ministérios.' },
    ],
  },
  {
    id: 'harpa-crista',
    date: '26 de outubro de 2026',
    title: 'A história da Harpa Cristã',
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
