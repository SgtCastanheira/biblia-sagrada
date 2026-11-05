# Revisão de conteúdo: o que se repete e quem é o dono de cada assunto

**Data:** 5 de novembro de 2026. **Motivo:** o dono do app notou que pesquisar “Coreia do Norte” trazia quatro ou cinco resultados sem necessidade, e pediu duas coisas: (1) que, antes de escrever qualquer história, se confira o que a base já conta, e se complete ou ramifique em vez de recontar; (2) uma revisão geral do que está repetido, unificando em conteúdo único e completo.

## Como a revisão foi feita

Com `tools/verificar-base.py` (veja `tools/LEIA-ME.md`):

- `python3 tools/verificar-base.py "<assunto>"` mostra onde o assunto aparece e se já há estudo dedicado;
- `--repetidos` compara todas as histórias duas a duas, por sequências de nove palavras iguais;
- `--par a b` mostra os trechos exatos que dois estudos têm em comum.

A regra ficou escrita em `CLAUDE.md` (“Check the base before writing”).

## O que se achou

1. **A busca era a maior fonte do ruído.** Uma pesquisa de várias palavras trazia todo estudo que citasse *uma* delas. Agora (`core/study-search.ts`) ela mostra primeiro os estudos que têm a expressão inteira e descarta os de pontuação muito baixa: “Coreia do Norte” traz só o estudo da Coreia (`logica/busca-estudo.spec.ts` confere).
2. **A Coreia já tinha dono.** `avivamento-da-coreia` conta a Coreia unida, a do Sul e a do Norte, cada capítulo dizendo de qual fala (`logica/coreia.spec.ts`). Os outros estudos só a citam e apontam para ele (`avivamentos-desde-atos` traz uma ficha curta e o cartão).
3. **A repetição literal é pequena.** Dos 44 pares com cinco ou mais sequências iguais, quase tudo é versículo citado nos dois (Js 24.15, Pv 22.6, 2Cr 7.14), título de cartão ou a nota “o que é certo e o que é debatido”. Os pares mais altos, vistos de perto:

| Par | Sequências iguais | O que é de fato |
|---|---|---|
| `a-palavra-no-coracao` × `reforma-inglesa` | 54 | Duas falas de Tyndale e o fim dele, contados nos dois |
| `a-geracao-que-nao-conheceu-o-senhor` × `avivamentos-na-biblia` | 50 | Citações de Josué e de Jeoiada, e o ciclo dos Juízes tocado nos dois |
| `avivamentos-desde-atos` × `marcas-de-um-avivamento` | 49 | Versículos e a frase de Finney, citados nos dois |
| `da-volta-do-exilio-a-jesus` × `livros-dos-macabeus` | 15 | Duas frases dos livros, a nota e o cartão dos apócrifos (o cartão foi reescrito) |
| `ferguson-*` × `miller-*` | até 15 | Os dois livros contam os mesmos séculos; os textos são próprios, só coincidem nomes, datas e títulos de obra |

## O que foi unificado

- **`entre-os-testamentos` + `grupos-do-tempo-de-jesus` → `da-volta-do-exilio-a-jesus`.** As duas histórias contavam o mesmo período por dois lados (os Macabeus, os Asmoneus, os fariseus e os saduceus apareciam nas duas). Viraram uma só, em ordem: Zorobabel, Esdras, Neemias, os samaritanos, Malaquias, Alexandre, os Macabeus, os grupos (de onde vieram e se existem hoje), Roma e Herodes, a casa de Davi, as sinagogas, a esperança do Messias, João Batista. Os endereços antigos continuam valendo (`app.routes.ts` redireciona), e os cartões, o mapa das épocas, as fontes e o roteiro foram para o endereço novo. A quarta parte (“Os Grupos Existem Hoje?”) é nova, e as linhas “Depois” dos quadros dos grupos foram para lá, para a resposta não ficar espalhada.
- **O que os textos antigos diziam do exílio** (`cativeiros-de-israel`) ficou com o decreto de Ciro e a conta dos setenta anos; o que aconteceu depois da ordem está agora na história nova, com cartão de um para o outro.
- **Novos estudos ramificados, não repetidos:** `flavio-josefo` (quem foi e como ler; os outros estudos citam Josefo e apontam para ele) e `livros-dos-macabeus` (guia de leitura dos dois livros; a revolta em si continua na história única).

## Dono de cada assunto

Um estudo canônico por assunto; os outros apontam para ele com um cartão `:::leia` ou uma menção em itálico.

| Assunto | Estudo dono | Quem aponta |
|---|---|---|
| A Coreia (unida, do Sul, do Norte) | `avivamento-da-coreia` | `avivamentos-desde-atos`, `marcas-de-um-avivamento` |
| Da volta do exílio a Jesus; Esdras, Neemias, Zorobabel; samaritanos; grupos do tempo de Jesus; casa de Davi | `da-volta-do-exilio-a-jesus` | Memorial (pessoas), `cativeiros-de-israel`, `septuaginta`, `apocrifos`, `a-familia-de-herodes`, `o-templo-de-herodes`, `os-faraos-da-biblia` |
| Os dois livros dos Macabeus | `livros-dos-macabeus` | `da-volta-do-exilio-a-jesus`, `apocrifos` |
| Flávio Josefo e o que ele conta | `flavio-josefo` | `da-volta-do-exilio-a-jesus`, `a-familia-de-herodes`, `o-templo-de-herodes` |
| Tyndale e a Bíblia em inglês | `reforma-inglesa` | `a-palavra-no-coracao`, `vulgata-e-traducoes` |
| Avivamentos da Bíblia (reis, Neemias, Nínive, Atos) | `avivamentos-na-biblia` | `avivamentos-desde-atos`, `marcas-de-um-avivamento` |
| Por que o fogo esfria de uma geração para a outra | `a-geracao-que-nao-conheceu-o-senhor` | `avivamentos-na-biblia`, `marcas-de-um-avivamento` |
| Pentecostalismo no Brasil: a chegada de Berg e Vingren | `daniel-berg-e-gunnar-vingren` (as pessoas) e `assembleia-de-deus-no-brasil` (a igreja) | `pentecostes-no-brasil`, `nome-assembleia-de-deus`, `madureira-e-a-separacao`, as páginas dos estados |

## Decisões em aberto

1. **A fundação da Assembleia de Deus** é contada, em parte, em quatro estudos (`daniel-berg-e-gunnar-vingren`, `assembleia-de-deus-no-brasil`, `pentecostes-no-brasil`, `nome-assembleia-de-deus`) e na página do Pará. A sobreposição é pequena (nomes e o porão da casa batista), mas o ideal é que a história da chegada, dia por dia, fique em **um** deles e os outros só a resumam, com cartão. Falta decidir qual: o das pessoas (`daniel-berg-e-gunnar-vingren`) é o candidato natural.
2. **Miller × Ferguson.** Os dois livros de história da Igreja têm um módulo por parte e cobrem os mesmos séculos. Foi pedido manter os dois (“mantenha os dois”); as sobreposições medidas são nomes e datas, sem texto copiado. Se um dia se quiser unificar, a unidade seria a época, não o livro.
3. **Os livros dos Macabeus em texto.** O guia não traz o texto, porque não se achou tradução em português de licença livre. Duas saídas: traduzir de uma edição em inglês de domínio público (a Brenton, da Septuaginta, ou a Douay-Rheims), ou deixar só o guia.
4. **Fotos repetidas.** Algumas fotos (Massada, Herodium, Judas Macabeu, a moeda de Antíoco IV) aparecem em mais de uma história. Não é cópia de texto, e o crédito é um só, mas vale rever se alguma deve ficar só na dona do assunto.

## Como manter

- Antes de escrever: `python3 tools/verificar-base.py "<assunto>"` e, se houver estudo, `--ler <id>`.
- Depois de uma leva de textos: `--repetidos --minimo 6` e `--par a b` nos pares mais altos.
- Ao unificar dois estudos: mova os cartões, as fontes, as épocas e os testes, e deixe o endereço antigo redirecionando em `app.routes.ts`.
