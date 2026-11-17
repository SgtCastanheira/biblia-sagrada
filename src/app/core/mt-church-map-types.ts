/**
 * Tipos do mapa mental “A Igreja em Mato Grosso, cidade por cidade” (página /assembleia-de-deus/mt).
 * Código puro, sem Angular: os testes de lógica leem estes dados direto.
 */

/** Uma foto ou bandeira, sempre com a legenda e o crédito que a licença exige. O arquivo fica em public/conteudo/. */
export interface MtImage {
  /** Caminho dentro de public/conteudo/ (ex.: "imagens/mt-sinop-cidade.webp"). */
  src: string;
  alt: string;
  /** O que a imagem mostra, em uma frase. */
  caption: string;
  /** Autor e licença (ex.: "Fulano, CC BY-SA 4.0 (Wikimedia Commons)"). Obrigatório. */
  credit: string;
  /** Tamanho real, para a página não pular quando a imagem carrega. */
  w: number;
  h: number;
  /** Página do arquivo original (Wikimedia Commons), para quem quiser conferir a licença. */
  source?: string;
}

/** Quem fez a história naquele lugar. A foto só entra com licença aberta ou com a autorização de quem aparece. */
export interface MtPerson {
  name: string;
  /** O que a pessoa foi ou é naquele lugar, em poucas palavras. */
  role: string;
  photo?: MtImage;
}

export interface MtFact {
  /** Ano ou período (“1952”, “1984–1986”, “desde 2014”). */
  year: string;
  text: string;
}

/** Uma cidade (ou um rio, ou uma região) do mapa. */
export interface MtPlace {
  id: string;
  name: string;
  /** A bandeira do município. Rios e regiões não têm: aparece um ícone. */
  flag?: MtImage;
  /** Ícone do Material Symbols para quando não há bandeira. */
  icon?: string;
  /** Foto do lugar hoje. */
  photo?: MtImage;
  /** Foto da época em que a igreja chegou, se existir com licença aberta. */
  epoch?: MtImage;
  /** O chão onde a igreja chegou: quando e como o lugar nasceu (contexto, não história da igreja). */
  place: string;
  /** Fonte do parágrafo “O lugar”. */
  placeSource: string;
  /** A igreja chega: o que as fontes registram, em ordem. Vazio quando não há registro. */
  facts: MtFact[];
  people: MtPerson[];
  /** O que ficou de bom para a cidade. Só o que a fonte registra; se ela só fala em geral, diz isso. */
  benefit: string;
  /** O que ainda não foi confirmado. Nunca vazio: é onde a pessoa de lá pode ajudar. */
  missing: string;
  /** De onde vêm os fatos da igreja (documentos, datas). */
  sources: string;
  /** Ano do primeiro registro da igreja ali (aparece no nó). */
  since?: string;
  /** Título exato do capítulo (## ...) do texto onde a história completa está; a página o troca pela âncora. */
  chapter?: string;
}

/** Um ramo do mapa: uma região do estado, ou o ramo dos rios. */
export interface MtBranch {
  id: string;
  name: string;
  /** Uma frase que situa a região, sem afirmar fatos da igreja. */
  hint: string;
  /** Cor do ramo (hexadecimal). Na tela ela é misturada com a cor do texto do tema, para continuar legível. */
  color: string;
  icon: string;
  places: MtPlace[];
}
