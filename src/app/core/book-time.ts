/**
 * Como cada livro da Bíblia marca o tempo. Código puro (sem Angular), para os testes.
 *
 * Cada marca é um versículo do próprio livro, com o trecho exato da Almeida do app (`almeida`, conferido no teste), e uma frase do app que diz
 * o que ele mostra. Só se afirma a palavra original (`words`: cronos, kairós, aion, hora…) quando o versículo está em `TIME_VERIFIED`, ou seja,
 * quando a página de interlinear dele mostra essa palavra. “A abertura não dá data” diz só o que o primeiro versículo traz (sem rei nem ano), e não
 * que o livro inteiro não tenha nenhum marco de tempo. Os livros que o app ainda não marcou (Cânticos, Lamentações, Filipenses, 2 Tessalonicenses,
 * Filemom, Tiago, 2 e 3 João) ficam sem marca em vez de ter uma inventada.
 */

export type TimeKind = 'datas' | 'contagem' | 'calendario' | 'palavra' | 'profecia' | 'medida' | 'sem-data';

export const TIME_KINDS: Record<TimeKind, { label: string; hint: string }> = {
  datas: { label: 'Dá a data do que conta', hint: 'pelo reinado de um rei, por um governante ou por um ano do exílio' },
  contagem: { label: 'Conta anos e gerações', hint: 'idades, anos de reinado, tempo de espera' },
  calendario: { label: 'Marca meses e festas', hint: 'o calendário de Israel e das igrejas' },
  palavra: { label: 'Fala do tempo com uma palavra própria', hint: 'cronos, kairós, aion, hora, et, zeman, moed, olam' },
  profecia: { label: 'Fala em tempos da profecia', hint: '“um tempo, e tempos, e metade de um tempo”, semanas, mil anos' },
  medida: { label: 'Diz como se mede o tempo', hint: 'a tarde e a manhã, o dia e os mil anos' },
  'sem-data': { label: 'A abertura não dá data', hint: 'o primeiro versículo não traz rei nem ano' },
};

export interface BookTime {
  /** Id do livro (GEN, 1KI…). */
  book: string;
  kind: TimeKind;
  ref: string;
  /** O trecho da Almeida onde a marca aparece. */
  almeida: string;
  /** O que o versículo mostra, com palavras do app. */
  note: string;
  /** As palavras do tempo (ids de `TIME_WORDS`) que o grego ou o hebraico traz neste versículo. */
  words?: string[];
}

export const BOOK_TIME: BookTime[] = [
  // a Lei
  { book: 'GEN', kind: 'contagem', ref: 'Gn 5.3', almeida: 'viveu cento e trinta anos, e gerou um filho', note: 'Conta o tempo em gerações: a idade de cada pai ao gerar o filho.' },
  { book: 'GEN', kind: 'medida', ref: 'Gn 1.5', almeida: 'a tarde e a manhã, o dia primeiro', note: 'Cada dia da criação fecha com a tarde e a manhã: o dia primeiro, o segundo…' },
  { book: 'GEN', kind: 'palavra', ref: 'Gn 1.14', almeida: 'para dias e anos', note: 'Os astros são postos como sinais para estações (moed), dias e anos.', words: ['moed'] },
  { book: 'EXO', kind: 'calendario', ref: 'Êx 12.2', almeida: 'o princípio dos meses', note: 'A saída do Egito muda o calendário: este mês passa a ser o primeiro do ano.' },
  { book: 'EXO', kind: 'contagem', ref: 'Êx 12.40', almeida: 'foi de quatrocentos e trinta anos', note: 'Diz quanto tempo os filhos de Israel moraram no Egito.' },
  { book: 'LEV', kind: 'calendario', ref: 'Lv 23.2', almeida: 'As festas fixas do Senhor', note: 'As festas são encontros marcados (moed) no calendário.', words: ['moed'] },
  { book: 'LEV', kind: 'calendario', ref: 'Lv 25.10', almeida: 'ano de jubileu', note: 'O quinquagésimo ano é de jubileu: liberdade e volta de cada um à sua herança.' },
  { book: 'NUM', kind: 'datas', ref: 'Nm 1.1', almeida: 'no primeiro dia do segundo mês, no segundo ano depois da saída dos filhos de Israel', note: 'Abre com data: mês e ano contados desde a saída do Egito.' },
  { book: 'DEU', kind: 'datas', ref: 'Dt 1.3', almeida: 'No ano quadragésimo, no mês undécimo, no primeiro dia do mês', note: 'Dá o dia dos discursos de Moisés, no fim dos quarenta anos no deserto.' },
  // a conquista, os juízes e os reis
  { book: 'JOS', kind: 'contagem', ref: 'Js 14.10', almeida: 'tenho já oitenta e cinco anos', note: 'Calebe conta os anos desde a palavra que o Senhor falou a Moisés.' },
  { book: 'JDG', kind: 'contagem', ref: 'Jz 3.11', almeida: 'a terra teve sossego por quarenta anos', note: 'Conta o tempo em ciclos: opressão, juiz e os anos de descanso.' },
  { book: 'JDG', kind: 'datas', ref: 'Jz 21.25', almeida: 'Naqueles dias não havia rei em Israel', note: 'Situa o tempo pelo que faltava: ainda não havia rei.' },
  { book: 'RUT', kind: 'datas', ref: 'Rt 1.1', almeida: 'Nos dias em que os juízes governavam', note: 'Situa a história no tempo dos juízes, sem dar um ano.' },
  { book: '1SA', kind: 'contagem', ref: '1Sm 7.2', almeida: 'passou-se muito tempo, chegando até vinte anos', note: 'A arca fica vinte anos em Quiriate-Jearim antes de Israel voltar ao Senhor.' },
  { book: '2SA', kind: 'contagem', ref: '2Sm 5.4', almeida: 'Trinta anos tinha Davi quando começou a reinar, e reinou quarenta anos', note: 'Dá a idade de Davi ao começar a reinar e o tamanho do reinado.' },
  { book: '1KI', kind: 'datas', ref: '1Rs 6.1', almeida: 'no ano quatrocentos e oitenta depois de saírem os filhos de Israel da terra do Egito', note: 'Conta do Êxodo e do reinado: o templo começa no quarto ano de Salomão.' },
  { book: '2KI', kind: 'datas', ref: '2Rs 25.27', almeida: 'no ano trinta e sete do cativeiro de Joaquim', note: 'Termina contando os anos do exílio, a partir do cativeiro do rei.' },
  { book: '1CH', kind: 'contagem', ref: '1Cr 29.27', almeida: 'O tempo que reinou sobre Israel foi quarenta anos', note: 'Fecha o reinado de Davi com a soma dos anos.' },
  { book: '2CH', kind: 'contagem', ref: '2Cr 36.21', almeida: 'até que os setenta anos se cumpriram', note: 'Mede o exílio em setenta anos, segundo a palavra de Jeremias.' },
  { book: '2CH', kind: 'datas', ref: '2Cr 36.22', almeida: 'no primeiro ano de Ciro', note: 'Termina na volta do exílio, datada pelo reinado de Ciro.' },
  // depois do exílio
  { book: 'EZR', kind: 'datas', ref: 'Ed 1.1', almeida: 'No primeiro ano de Ciro, rei da Pérsia', note: 'Abre com o reinado do rei da Pérsia que deixou os judeus voltarem.' },
  { book: 'NEH', kind: 'datas', ref: 'Ne 2.1', almeida: 'no mês de nisã', note: 'Dá o mês e o ano do rei Artaxerxes em que Neemias fala com o rei.' },
  { book: 'NEH', kind: 'palavra', ref: 'Ne 2.6', almeida: 'certo prazo', note: 'Neemias fixa com o rei um prazo para a viagem; a palavra hebraica é zeman.', words: ['zeman'] },
  { book: 'EST', kind: 'datas', ref: 'Et 1.1', almeida: 'nos dias de Assuero', note: 'Situa a história no reinado de Assuero, da Índia até a Etiópia.' },
  // poesia e sabedoria
  { book: 'JOB', kind: 'sem-data', ref: 'Jó 1.1', almeida: 'Havia um homem na terra de Uz', note: 'A abertura não traz rei nem ano; por isso o app o coloca com os patriarcas como uma escolha.' },
  { book: 'PSA', kind: 'palavra', ref: 'Sl 90.2', almeida: 'de eternidade a eternidade', note: 'Olam: o tempo sem começo nem fim à vista, no salmo atribuído a Moisés.', words: ['olam'] },
  { book: 'PRO', kind: 'datas', ref: 'Pv 25.1', almeida: 'os quais transcreveram os homens de Ezequias, rei de Judá', note: 'Situa uma coleção no tempo de Ezequias, cerca de dois séculos depois de Salomão.' },
  { book: 'ECC', kind: 'palavra', ref: 'Ec 3.1', almeida: 'há tempo para todo propósito debaixo do céu', note: 'A passagem do tempo em hebraico: zeman, a ocasião própria, e et, o tempo.', words: ['et', 'zeman'] },
  // os profetas
  { book: 'ISA', kind: 'datas', ref: 'Is 1.1', almeida: 'nos dias de Uzias, Jotão, Acaz, e Ezequias', note: 'Situa a visão nos dias de quatro reis de Judá.' },
  { book: 'ISA', kind: 'datas', ref: 'Is 6.1', almeida: 'No ano em que morreu o rei Uzias', note: 'Data a visão do trono pela morte de um rei.' },
  { book: 'JER', kind: 'datas', ref: 'Jr 1.2', almeida: 'no décimo terceiro ano do seu reinado', note: 'A palavra vem no ano 13 de Josias, e o livro segue até a queda de Jerusalém.' },
  { book: 'JER', kind: 'datas', ref: 'Jr 25.1', almeida: 'no ano quarto de Jeoiaquim', note: 'Cruza dois reinos: o ano 4 de Jeoaquim é o primeiro de Nabucodonosor.' },
  { book: 'EZK', kind: 'datas', ref: 'Ez 1.2', almeida: 'no quinto ano do cativeiro do rei Joaquim', note: 'Conta os anos a partir do exílio do rei, e não do reinado dele.' },
  { book: 'EZK', kind: 'datas', ref: 'Ez 40.1', almeida: 'No ano vinte e cinco do nosso cativeiro', note: 'Na visão do templo, conta o exílio do próprio povo.' },
  { book: 'DAN', kind: 'datas', ref: 'Dn 1.1', almeida: 'No ano terceiro do reinado de Jeoiaquim', note: 'Abre com o reinado de um rei de Judá e a chegada de Nabucodonosor.' },
  { book: 'DAN', kind: 'profecia', ref: 'Dn 7.25', almeida: 'por um tempo, e tempos, e metade de um tempo', note: 'Um período da profecia que o Apocalipse retoma (Ap 12.14).' },
  { book: 'DAN', kind: 'profecia', ref: 'Dn 9.24', almeida: 'Setenta semanas estão decretadas', note: 'Conta a profecia em semanas decretadas sobre o povo e a cidade.' },
  { book: 'HOS', kind: 'datas', ref: 'Os 1.1', almeida: 'nos dias de Uzias, Jotão, Acaz e Ezequias, reis de Judá', note: 'Situa o profeta nos reinados de Judá e no de Jeroboão, em Israel.' },
  { book: 'JOL', kind: 'sem-data', ref: 'Jl 1.1', almeida: 'Palavra do Senhor, que foi dirigida a Joel', note: 'A abertura não traz rei nem ano; por isso a data de Joel é discutida.' },
  { book: 'AMO', kind: 'datas', ref: 'Am 1.1', almeida: 'dois anos antes do terremoto', note: 'Data a profecia por um fato: dois anos antes de um terremoto, nos reinados de Uzias e Jeroboão.' },
  { book: 'OBA', kind: 'sem-data', ref: 'Ob 1.1', almeida: 'Visão de Abdias', note: 'A abertura, uma visão sobre Edom, não traz rei nem ano.' },
  { book: 'JON', kind: 'sem-data', ref: 'Jn 1.1', almeida: 'veio a palavra do Senhor a Jonas, filho de Amitai', note: 'A abertura não traz rei nem ano; 2 Reis 14.25 liga Jonas ao tempo de Jeroboão II.' },
  { book: 'MIC', kind: 'datas', ref: 'Mq 1.1', almeida: 'nos dias de Jotão Acaz e Ezequias reis de Judá', note: 'Situa o profeta nos dias de três reis de Judá.' },
  { book: 'NAM', kind: 'sem-data', ref: 'Na 1.1', almeida: 'Oráculo acerca de Nínive', note: 'A abertura, um oráculo sobre Nínive, não traz rei nem ano.' },
  { book: 'HAB', kind: 'sem-data', ref: 'Hc 1.1', almeida: 'O oráculo que o profeta Habacuque viu', note: 'A abertura não traz rei nem ano.' },
  { book: 'ZEP', kind: 'datas', ref: 'Sf 1.1', almeida: 'nos dias de Josias, filho de Amom, rei de Judá', note: 'Situa a palavra no reinado de Josias.' },
  { book: 'HAG', kind: 'datas', ref: 'Ag 1.1', almeida: 'No segundo ano do rei Dario, no sexto mês, no primeiro dia do mês', note: 'A data mais exata: ano do rei, mês e dia.' },
  { book: 'ZEC', kind: 'datas', ref: 'Zc 1.1', almeida: 'No oitavo mês do segundo ano de Dario', note: 'Data pelo mês e pelo ano do rei, dois meses depois de Ageu.' },
  { book: 'MAL', kind: 'sem-data', ref: 'Ml 1.1', almeida: 'A palavra do Senhor a Israel, por intermédio de Malaquias', note: 'A abertura não traz rei nem ano.' },
  // os Evangelhos e Atos
  { book: 'MAT', kind: 'contagem', ref: 'Mt 1.17', almeida: 'catorze gerações', note: 'Divide a história até Jesus em três grupos de catorze gerações.' },
  { book: 'MAT', kind: 'datas', ref: 'Mt 2.1', almeida: 'no tempo do rei Herodes', note: 'Situa o nascimento de Jesus no reinado de Herodes.' },
  { book: 'MRK', kind: 'palavra', ref: 'Mc 1.15', almeida: 'O tempo está cumprido', note: 'A primeira fala de Jesus em Marcos usa kairós: o tempo certo chegou.', words: ['kairos'] },
  { book: 'LUK', kind: 'datas', ref: 'Lc 3.1', almeida: 'No décimo quinto ano do reinado de Tibério César', note: 'Data o começo da pregação de João pelos governantes do tempo, de Tibério a Pilatos e Herodes.' },
  { book: 'JHN', kind: 'palavra', ref: 'Jo 2.4', almeida: 'Ainda não é chegada a minha hora', note: 'Em João, “a hora” de Jesus é marcada: aqui ainda não chegou.', words: ['hora'] },
  { book: 'JHN', kind: 'palavra', ref: 'Jo 17.1', almeida: 'é chegada a hora', note: 'E aqui, na oração, chegou.', words: ['hora'] },
  { book: 'ACT', kind: 'datas', ref: 'At 18.12', almeida: 'Sendo Gálio procônsul da Acaia', note: 'Amarra a estada de Paulo em Corinto ao governo de Gálio, procônsul da Acaia.' },
  { book: 'ACT', kind: 'contagem', ref: 'At 18.11', almeida: 'um ano e seis meses', note: 'Conta quanto tempo Paulo ficou em Corinto.' },
  { book: 'ACT', kind: 'palavra', ref: 'At 1.7', almeida: 'os tempos ou as épocas', note: 'Jesus fala dos tempos (cronos) e das épocas (kairós) que o Pai reservou.', words: ['cronos', 'kairos'] },
  // as cartas
  { book: 'ROM', kind: 'palavra', ref: 'Rm 13.11', almeida: 'conhecendo o tempo, que já é hora de despertardes', note: 'Junta o tempo (kairós) e a hora.', words: ['kairos', 'hora'] },
  { book: '1CO', kind: 'calendario', ref: '1Co 16.8', almeida: 'até o Pentecostes', note: 'Marca a estada em Éfeso pelo calendário das festas.' },
  { book: '2CO', kind: 'palavra', ref: '2Co 6.2', almeida: 'eis aqui agora o tempo aceitável', note: 'O “agora” da salvação: o tempo aceitável é kairós.', words: ['kairos'] },
  { book: 'GAL', kind: 'contagem', ref: 'Gl 1.18', almeida: 'passados três anos', note: 'Paulo conta os anos até a sua primeira visita a Jerusalém.' },
  { book: 'GAL', kind: 'contagem', ref: 'Gl 2.1', almeida: 'passados catorze anos', note: 'E, de novo, catorze anos até a segunda subida.' },
  { book: 'GAL', kind: 'palavra', ref: 'Gl 4.4', almeida: 'vindo a plenitude dos tempos', note: 'A plenitude do tempo é cronos, no singular no grego.', words: ['cronos'] },
  { book: 'EPH', kind: 'palavra', ref: 'Ef 1.10', almeida: 'dispensação da plenitude dos tempos', note: 'Aqui a plenitude vem com kairós, no plural.', words: ['kairos'] },
  { book: 'EPH', kind: 'palavra', ref: 'Ef 5.16', almeida: 'usando bem cada oportunidade', note: 'A “oportunidade” é kairós.', words: ['kairos'] },
  { book: 'COL', kind: 'calendario', ref: 'Cl 2.16', almeida: 'dias de festa, ou de lua nova, ou de sábados', note: 'Cita o calendário religioso: festas, luas novas e sábados.' },
  { book: '1TH', kind: 'palavra', ref: '1Ts 5.1', almeida: 'acerca dos tempos e das épocas', note: 'De novo os dois juntos: tempos (cronos) e épocas (kairós).', words: ['cronos', 'kairos'] },
  { book: '1TI', kind: 'palavra', ref: '1Tm 4.1', almeida: 'em tempos posteriores', note: 'Fala dos tempos posteriores com kairós.', words: ['kairos'] },
  { book: '2TI', kind: 'palavra', ref: '2Tm 4.6', almeida: 'o tempo da minha partida está próximo', note: 'Paulo usa kairós para o momento da sua partida.', words: ['kairos'] },
  { book: 'TIT', kind: 'palavra', ref: 'Tt 1.3', almeida: 'no tempo próprio manifestou a sua palavra', note: 'O “tempo próprio” é kairós, no plural no grego.', words: ['kairos'] },
  { book: 'HEB', kind: 'palavra', ref: 'Hb 1.2', almeida: 'por quem fez também o mundo', note: 'A Almeida traduz aion por “mundo”: no grego são as eras.', words: ['aion'] },
  { book: 'HEB', kind: 'palavra', ref: 'Hb 11.32', almeida: 'me faltará o tempo', note: 'O autor diz que lhe faltaria o tempo (cronos) para contar todos.', words: ['cronos'] },
  { book: '1PE', kind: 'palavra', ref: '1Pe 1.20', almeida: 'manifesto no fim dos tempos', note: 'O fim dos tempos é cronos, no plural.', words: ['cronos'] },
  { book: '2PE', kind: 'medida', ref: '2Pe 3.8', almeida: 'um dia para o Senhor é como mil anos, e mil anos como um dia', note: 'Diz que o tempo de Deus não se mede como o dos homens.' },
  { book: '1JN', kind: 'palavra', ref: '1Jo 2.18', almeida: 'esta é a última hora', note: 'A “última hora” é hora, a palavra de João para o tempo marcado.', words: ['hora'] },
  { book: 'JUD', kind: 'palavra', ref: 'Jd 1.18', almeida: 'Nos últimos tempos haverá escarnecedores', note: 'Os “últimos tempos” são cronos.', words: ['cronos'] },
  { book: 'REV', kind: 'palavra', ref: 'Ap 1.3', almeida: 'porque o tempo está próximo', note: 'O livro abre com kairós: o tempo certo está perto.', words: ['kairos'] },
  { book: 'REV', kind: 'profecia', ref: 'Ap 12.14', almeida: 'por um tempo, e tempos, e metade de um tempo', note: 'A mesma expressão de Daniel 7.25; aqui “tempo” é kairós.', words: ['kairos'] },
  { book: 'REV', kind: 'profecia', ref: 'Ap 20.4', almeida: 'durante mil anos', note: 'Conta o reinado com Cristo em mil anos.' },
];

export const timeMarksOf = (book: string): BookTime[] => BOOK_TIME.filter((m) => m.book === book);

/**
 * O ano em que o livro foi escrito, lido do texto de `livros.json` (“c. 1440–1400 a.C. (escrito); relata…”). Devolve o primeiro ano (negativo = a.C.)
 * ou `null` quando o texto só diz o que o livro relata, que a data é incerta ou “antes de 70”: esses ficam sem ano, em vez de ganhar um chutado.
 */
export function writtenYear(date: string): number | null {
  const text = date.trim();
  if (/^relata/i.test(text) || /data incerta/i.test(text) || /^antes de/i.test(text) || /^escrito no tempo de/i.test(text)) return null;
  let segment = text.split(/[;(]/)[0];
  if (!/\d/.test(segment)) segment = text.match(/\(([^)]*\d[^)]*)\)/)?.[1] ?? ''; // “Séc. VI a.C. (605–536 a.C.)”
  const first = segment.match(/\d+/);
  if (!first) return null;
  const bc = /a\.c\./i.test(segment) || (!/d\.c\./i.test(segment) && /a\.c\./i.test(text));
  return bc ? -Number(first[0]) : Number(first[0]);
}

export type BookOrderMode = 'fatos' | 'escrita';

/**
 * O lugar (1 a 66) de cada livro numa das duas ordens: pelos fatos (a posição do primeiro capítulo na leitura cronológica) ou pelo ano em que o
 * livro foi escrito. Quem não tem ano de escrita fica no fim, na ordem dos fatos entre si.
 */
export function bookPlaces(books: { id: string; position: number }[], years: Record<string, number | null>, mode: BookOrderMode): Record<string, number> {
  const sorted =
    mode === 'fatos'
      ? [...books].sort((a, b) => a.position - b.position)
      : [...books].sort((a, b) => {
          const ya = years[a.id] ?? null;
          const yb = years[b.id] ?? null;
          if (ya === null && yb === null) return a.position - b.position;
          if (ya === null) return 1;
          if (yb === null) return -1;
          return ya - yb || a.position - b.position;
        });
  return Object.fromEntries(sorted.map((b, i) => [b.id, i + 1]));
}

export interface BookShift {
  id: string;
  /** O lugar na ordem de agora e na de antes. */
  now: number;
  was: number;
  /** Quantos lugares o livro subiu (positivo) ou desceu (negativo) ao trocar de ordem. */
  delta: number;
}

/** O que mudou de uma ordem para a outra, livro a livro. */
export const bookShifts = (now: Record<string, number>, was: Record<string, number>): BookShift[] =>
  Object.keys(now).map((id) => ({ id, now: now[id], was: was[id], delta: was[id] - now[id] }));

/** Quantos livros mudaram de lugar, quantos subiram e desceram, e os três que mais mudaram. */
export function shiftSummary(shifts: BookShift[]): { moved: number; up: number; down: number; same: number; top: BookShift[] } {
  const up = shifts.filter((x) => x.delta > 0).length;
  const down = shifts.filter((x) => x.delta < 0).length;
  const top = [...shifts]
    .filter((x) => x.delta !== 0)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta) || a.now - b.now)
    .slice(0, 3);
  return { moved: up + down, up, down, same: shifts.length - up - down, top };
}

