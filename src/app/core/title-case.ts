/**
 * Padrão dos títulos do app, pela norma culta para títulos de obras (uso facultativo previsto no Acordo Ortográfico):
 * inicial maiúscula em todas as palavras, menos artigos, preposições e conjunções, que ficam em minúscula
 * (“A Lógica da Fé e a Lógica Grega”). A primeira palavra e a primeira depois de “:”, “?”, “!”, de travessão ou de “·” começam sempre em maiúscula.
 *
 * Ficam como estão: algarismos, siglas e numerais romanos (IBUC, XIX), abreviações com ponto (c., a.C., séc.) e
 * nomes com maiúscula no meio (McGrath). `logica/titulos.spec.ts` confere que todo título do app já está assim.
 */
const SMALL_WORDS = new Set([
  // artigos
  'a', 'as', 'o', 'os', 'um', 'uns', 'uma', 'umas',
  // preposições e contrações
  'ao', 'aos', 'à', 'às', 'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas', 'num', 'numa', 'nuns', 'numas',
  'dum', 'duma', 'por', 'pelo', 'pela', 'pelos', 'pelas', 'para', 'pra', 'com', 'sem', 'sob', 'sobre', 'entre',
  'até', 'ante', 'após', 'contra', 'desde', 'perante', 'durante',
  // conjunções
  'e', 'ou', 'mas', 'nem', 'que', 'se', 'pois', 'porque',
]);

/** Pronomes que se ligam ao verbo por hífen (“Dobra-me”, “Apegar-se”) e ficam em minúscula. */
const HYPHEN_CLITICS = new Set(['me', 'te', 'se', 'lhe', 'lhes', 'nos', 'vos', 'o', 'a', 'os', 'as', 'lo', 'la', 'los', 'las']);

/** Depois de “(” ou de aspas, o artigo abre uma frase: “(O Filho Como Criatura)”; a conjunção continua em minúscula: “(ou Quatro)”. */
const CONJUNCTIONS = new Set(['e', 'ou', 'mas', 'nem', 'que', 'se', 'pois', 'porque']);

const upperFirst = (word: string) => word.charAt(0).toLocaleUpperCase('pt-BR') + word.slice(1);
const lowerFirst = (word: string) => word.charAt(0).toLocaleLowerCase('pt-BR') + word.slice(1);

/** Uma palavra (sem espaços) do título; `start` diz se ela abre o título ou uma frase dele. */
function caseWord(word: string, start: boolean): string {
  // Aspas e parênteses antes da palavra não contam: “desejos → “Desejos
  const at = word.search(/[\p{L}\p{N}]/u);
  if (at < 0) return word;
  const prefix = word.slice(0, at);
  const rest = word.slice(at);
  if (/^\p{N}/u.test(rest)) return word;
  // Abreviações com ponto (c., a.C., séc.) ficam como o autor escreveu
  if (/\p{L}\./u.test(rest)) return word;
  if (rest.includes('-')) {
    const parts = rest.split('-').map((part, i) => {
      const bare = /^\p{L}*/u.exec(part)![0].toLocaleLowerCase('pt-BR');
      return i > 0 && HYPHEN_CLITICS.has(bare) ? lowerFirst(part) : caseWord(part, start && i === 0);
    });
    return prefix + parts.join('-');
  }
  // Siglas, numerais romanos e nomes com maiúscula no meio (IBUC, XIX, McGrath) também
  if (/\p{Lu}/u.test(rest.slice(1))) return word;
  const bare = /^\p{L}*/u.exec(rest)![0].toLocaleLowerCase('pt-BR');
  const opensPhrase = /[(“"«‘]/.test(prefix) && !CONJUNCTIONS.has(bare);
  return prefix + (!start && !opensPhrase && SMALL_WORDS.has(bare) ? lowerFirst(rest) : upperFirst(rest));
}

/** Título no padrão do app (ver acima). É idempotente: aplicar de novo não muda nada. */
export function titleCase(title: string): string {
  let start = true;
  return title
    .split(/(\s+)/)
    .map((token) => {
      if (!token.trim()) return token;
      // “3.”, “II.” ou “4)” antes do título não contam como palavra: a próxima é a primeira
      const isNumbering = /^(\d+|[IVXLCDM]+)[.)]$/.test(token);
      const out = caseWord(token, start);
      if (!isNumbering) start = /[:?!…]["”’')\]]*$/.test(token) || /^[—–·]$/.test(token);
      return out;
    })
    .join('');
}
