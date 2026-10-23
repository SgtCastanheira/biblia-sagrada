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
