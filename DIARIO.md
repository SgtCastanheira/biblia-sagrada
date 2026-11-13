# Diário do projeto

Registro de rastreabilidade: cada decisão tomada, o que foi feito, quando e por quê. A entrada mais recente fica no topo.

Regras:
- Toda mudança commitada tem uma entrada aqui, no mesmo commit.
- Data e hora no horário local da máquina, com o fuso (ex.: `2026-10-29 18:43 -0400`). Quando o horário exato não foi registrado, marque com `~`.
- **Decisões** dizem o que foi escolhido, por quê e o que ficou de fora. **Pendências** são o que ficou para depois.
- O hash do commit não entra na entrada (ele ainda não existe ao escrever); `git log -- DIARIO.md` liga cada entrada ao seu commit.

## 2026-11-13 18:11 -0400 — Os livros mais recentes, em destaque no alto da biblioteca

**Autor:** Valter, com Claude. O dono pediu para organizar a História com os livros mais recentes sempre em destaque lá em cima, e mandou levar para a `main`.

**O que sobe:**
1. **Estante “Novidades”** no alto de `/historia`, acima de todos os assuntos (`shared/bookshelf.ts`): dourada, na largura toda em tela larga (com capas do mesmo tamanho das outras estantes) e com uma prateleira por dia (“Hoje · 13 de novembro”, “Ontem · 12 de novembro”, depois só a data), do mais novo ao mais antigo. Cada livro mantém a cor do seu assunto, abre a história com um toque e tem o nome “Livro: Título, em Assunto”. É uma cópia: o livro continua na sua própria prateleira, e a ordem das trilhas, dos ramos e dos números não mudou.
2. **Data de cada livro:** campo novo `Article.added` (“AAAA-MM-DD”), preenchido nos 108 artigos publicados a partir da data do primeiro commit do texto de cada um (`library.ts` e `paixao.ts`). O teste exige a data em todo artigo e recusa data inexistente ou no futuro, então um livro novo não passa sem ela.
3. **Regra do destaque** (`core/recent-books.ts`, código puro): dias inteiros, do mais novo para o mais antigo, até juntar pelo menos 6 livros, e no máximo 12; no mesmo dia vale a ordem da prateleira (trilha, ramo, posição); livro sem data conta como antigo. Hoje o destaque traz os 7 livros do Volume 4 (12 de novembro).
4. **Novidade:** `novidades-na-estante` em `whats-new.ts`.
5. **Testes:** `logica/novidades.spec.ts` (datas em todos os artigos; o destaque traz o livro mais novo e não deixa de fora nenhum mais novo que o último; a regra com dados inventados; ordem no dia; título do dia, com a virada de mês e de ano) e `estante.spec.ts` (contagens com a estante nova, que é a primeira, uma prateleira por dia, cor do assunto, sem número e sem botão de compartilhar, abre a história, largura em tela larga).

**Decisões:** (a) A data vem do Git, e não de chute: é o dia em que o texto entrou no repositório. (b) Dias inteiros, com mínimo de 6 e máximo de 12: um volume que chegou num dia só não é cortado ao meio, e numa semana calma o destaque ainda mostra os últimos livros, de dias atrás. (c) Sem número nos livros da estante nova, porque o número é o lugar do livro na prateleira dele. (d) Fora desta entrega: ordenar os assuntos pelo livro mais novo (mexeria na ordem de `TRAILS`, que o dono definiu e que a tela inicial também segue), carrossel de rolagem lateral e selo “Novo” nas prateleiras de origem.

**Validação:** num checkout limpo, sem a pasta privada: lint sem problemas; 202 testes de lógica; build de produção com `--base-href` e trava de publicação sem achados (pacote inicial 1,04 MB, sem orçamento estourado); testes de navegador da estante, estudo, histórias ligadas, compartilhar e Paixão no celular e no computador (199 ok; um teste de `historias-ligadas.spec.ts` falhou uma vez no computador, com a máquina carregada, e passou nos dois projetos ao rodar sozinho); acessibilidade, temas, navegação, busca e início no computador (156 ok, 2 ignorados); teste offline com o build de produção (8 ok). A bateria completa do navegador não foi rodada nesta entrega.

**Pendências:** com muitos livros no mesmo dia a estante fica alta no celular (hoje, 12 livros ocupam cerca de uma tela e meia): se incomodar, trocar por uma fileira de rolagem lateral por dia ou baixar o máximo. Ao publicar um livro escrito dias antes, conferir se o `added` dele é o dia em que foi ao ar.

## 2026-11-13 09:34 -0400 — Livros numerados em toda prateleira de estudos e imagem para compartilhar a estante

**Autor:** Valter, com Claude. O dono numerou de 1 a 7, numa captura da estante do Volume 4, os livros de “Como a Ciência Explica” e pediu para poder compartilhar a biblioteca toda numa imagem que represente tudo; depois pediu que o mesmo valesse para os demais estudos (“se tiver só 1, ok; se não, segue a contagem na ordem”) e mandou subir.

**O que sobe:**
1. **Número em toda prateleira de estudos:** cada história de uma prateleira da biblioteca (34 prateleiras, nas trilhas) leva o número da sua posição em `ids` (`shelfBooks`, em `core/trails.ts`): 1, 2, 3…; com um estudo só, o 1 (13 prateleiras são assim). Os atalhos (`links`) e as estantes de ferramentas (mapas, personagens…) ficam sem número. Na capa, o número é um disco na quina (dourado nas capas escuras, escuro nas de creme); na lombada ele ocupa o lugar do ícone, para o título não perder espaço; o nome do botão diz “número 1 de 7” (“número 1”, quando é um só); a lista do assunto (`/historia?trilha=`) mostra “Livro 1 de 7” nas prateleiras com mais de um livro.
2. **Ordem do Volume 4, como o dono marcou:** 1 Getsêmani, 2 Santa Ceia, 3 Prisão e Interrogatório, 4 Açoite e Condenação, 5 Crucificação, 6 Sepultamento e Ressurreição, 7 Quem Mandava e Onde Mandava (antes, Quem Mandava abria a prateleira). Os cartões “A história continua” no fim dos livros não foram mexidos e seguem a história (Santa Ceia → Getsêmani; Quem Mandava → Santa Ceia); o dono foi avisado e escolheu os números como marcou.
3. **Compartilhar a estante:** botão ao lado do título de cada prateleira de estudos. A imagem (feed 1080×1350 e Stories 1080×1920) desenha a estante com as capas numeradas, do jeito do app (`shared/share-shelf.ts`: os mesmos tons e capas de creme, fios dourados, ícone, contorno tracejado nos atalhos): quatro capas por fileira no feed e três nos Stories; o que não cabe vira “+ N livros no app”; com poucos livros as capas crescem e a fileira fica centrada; a letra do título é a maior em que ela e o ícone cabem. O texto que acompanha a imagem lista os livros, em ordem, antes do link.
4. **Link da imagem:** `/historia?estante=<trilha>` abre a biblioteca já rolada até aquela estante (`Bookshelf.focus`); o roteador do app não tem rolagem por âncora.
5. **Código:** `core/book-look.ts` (tom e capa de creme de cada livro, e `mixHex`; a estante e a imagem usam o mesmo), `shared/share-canvas.ts` (auxiliares de desenho que saíram de `share-render.ts`), `shelfCard` e `ShareBook` em `share-card.ts`, `shareText` com a lista, `TrailBranch.about` (frase opcional da prateleira).
6. **Novidade:** `estantes-numeradas` em `whats-new.ts`.
7. **Testes:** `logica/estante.spec.ts` (ordem do Volume 4; contagem na ordem em toda prateleira; jeito das capas; contraste do número e do título), `logica/compartilhar.spec.ts` (o cartão de toda prateleira; um livro só, atalhos, a de 20 livros; texto), `estante.spec.ts` (números em toda história, um livro só, atalhos e ferramentas sem número, 20 livros seguidos, lombadas, “Livro N de M” na lista, `?estante=`) e `compartilhar.spec.ts` (botão em toda prateleira de estudos, imagem nos dois tamanhos, texto com a lista). `logica/paixao.spec.ts` deixou de fixar a ordem antiga da prateleira (a ordem exata está no teste da estante).

**Decisões:** (a) **Ordem exatamente como o dono marcou:** perguntei antes, porque os cartões “A história continua” seguem a história e por isso não batem com os números 1, 2 e 7; ele escolheu “exatamente como marquei”, e os cartões ficaram como estavam. (b) A imagem não desenha a frase de apoio (`about`): as capas ficam com o espaço, e a frase segue no texto que acompanha a imagem. (c) O botão só existe em prateleira de estudos; as de ferramentas (mapas, personagens, contexto, palavras) ficaram de fora, porque não são uma sequência de leitura. (d) Link e QR com `?estante=`: sem ele, o link cairia no alto da biblioteca, longe da estante compartilhada. (e) Lombadas: o número no lugar do ícone, em vez de uma lombada mais alta, que cortaria os títulos. (f) Prateleira grande: os primeiros livros e “+ N livros no app”, como as outras imagens fazem com os tópicos.

**Validação:** num checkout limpo, sem a pasta privada: lint sem problemas; 197 testes de lógica; build de produção com `--base-href` e trava de publicação sem achados; bateria do navegador dos testes relacionados (estante, compartilhar, histórias ligadas, novidades, Paixão, estudo, acessibilidade, busca, leitura), em porta própria: celular e computador, 268 ok e 2 ignorados; teste offline com o build de produção: 8 ok. Bateria completa do navegador (celular e computador) no app comum, sem rascunhos: 1126 ok e 4 ignorados; dois testes de `historias-ligadas.spec.ts` falharam porque o seletor por “Constantino” passou a achar quatro cartões (a lista do assunto ganhou “Livro N de M” nos outros cartões); o seletor passou a usar o título exato e o teste passa nos dois projetos.

**Pendências:** decidir se os cartões “A história continua” dos livros 1, 2 e 7 devem passar a seguir os números; imagem de compartilhar para as estantes de ferramentas, se o dono quiser.

## 2026-11-12 18:20 -0400 — Publicação do Volume 4 · A Paixão, da Ceia à Ressurreição

**Autor:** Valter, com Claude. O dono pediu para ocultar os volumes 1 a 3 da trilha “Como a Ciência Explica”, manter o Volume 4 (A Paixão, da Ceia à Ressurreição) e publicar na `main`. Os volumes 1 a 3 continuam privados.

**O que sobe:**
1. **Sete livros**, numa só prateleira, “Volume 4 · A Paixão, da Ceia à Ressurreição”, da trilha `como-a-ciencia-explica`: `paixao-quem-mandava`, `paixao-santa-ceia`, `paixao-getsemani`, `paixao-prisao-e-interrogatorio`, `paixao-acoite-e-condenacao`, `paixao-crucificacao` e `paixao-sepultamento-e-ressurreicao` (cerca de 17 mil palavras, 87 minutos de leitura). Textos em `public/conteudo/artigos/`; dados (artigos, trilha, fontes e faixas das figuras) em `core/paixao.ts`, ligados em `library.ts`, `trails.ts` e `sources.ts`. A leitura reforçada (grifo das falas, figuras em faixa, “Saiba mais”, sanfona) liga por `PAIXAO_IDS`, em `ArticlePage.enhanced`.
2. **15 figuras** em `shared/paixao/` (mapa do percurso, mapa das regiões e hierarquia de quem mandava, o Monte das Oliveiras, pranchas de anatomia e simulações, cenas em quatro quadros, a placa de Pilatos e a lança em seis quadros), registradas em `shared/figure.ts`; as faixas compactas vêm de `core/figure-info.ts`. A figura antiga da lança (folha de quatro quadros e GIF) não sobe.
3. **Imagens:** 30 arquivos `paixao-*`; 44,5 MB em PNG viraram 6,4 MB em WebP (qualidade 90); o JPEG e o GIF para baixar ficam como eram. Ficam fora do cache de pré-carga e vão para o grupo lazy `imagens-da-paixao` do `ngsw-config.json`: o texto entra no uso offline, e a imagem só baixa para quem abre a figura.
4. **Acessibilidade:** 41 declarações de letra de 8 a 12,5px nas figuras subiram para 13px (os alvos de toque já tinham 40px). `e2e/paixao.spec.ts` abre cada figura de cada livro, no celular e no computador, e mede letras, alvos e rolagem lateral.
5. **Ícones:** o subconjunto da Material Symbols foi refeito com os ícones das figuras (`tools/baixar-fontes.py`); Inter e Lora ficaram como estavam.
6. **Créditos e novidades:** Tissot (dois quadros, domínio público), ilustrações criadas com inteligência artificial e OpenStreetMap (ODbL) em `credits.ts` e `CREDITOS.md`; a novidade “A Paixão, da Ceia à Ressurreição” em `whats-new.ts`.
7. **Trava de publicação:** saem da lista os sete ids, as figuras, `como-a-ciencia-explica` e o prefixo `paixao-anatomia-`; continuam bloqueados os ids dos volumes que não sobem. `e2e/logica/rascunhos.spec.ts` agora exige só o Volume 4 na trilha e aceita os livros.
8. **Testes novos:** `e2e/logica/paixao.spec.ts` (livros, fontes, tópicos e minutos; citações e falas idênticas à Almeida do app; títulos; blocos; imagens, todas em WebP e dentro do peso; cartões de continuação), `e2e/paixao.spec.ts`, um caso em `e2e/offline.spec.ts` (livro aberto sem internet) e `estudo.spec.ts` com 12 bolinhas de assunto na tela inicial.
9. **Estilo:** o estilo global dos livros (só vale com uma cena de anatomia aberta) foi para `styles.scss`; as legendas “para esta prévia” viraram “para este estudo”.

**Decisões:** (a) a trilha fica na frente dos outros assuntos, como na prévia; mudar é uma linha em `trails.ts`; (b) imagens em WebP e cache sob demanda, para não pesar no celular de quem lê; (c) os volumes 1 a 3 seguem fora do app e bloqueados pela trava; (d) `DIARIO.md` e `CLAUDE.md` sobem sem o histórico detalhado de pedidos, só com esta entrada e as regras dos livros.

**Validação:** num checkout limpo, sem a pasta privada: lint sem problemas; 189 testes de lógica; build de produção e trava de publicação sem achados; bateria do navegador com o app em desenvolvimento, em porta própria: celular, 555 ok e 1 ignorado; computador, 553 ok e 3 ignorados; teste offline com o build de produção: 8 ok.

**Pendências:** o dono ver o resultado ao vivo; seguir editando os livros em `public/conteudo/artigos/`; dividir a Crucificação (26 min), se quiser.

## 2026-11-12 17:18 -0400 — Publicação: apoio a rascunhos privados, blocos novos nos estudos e correções da Almeida

**Autor:** Valter, com Claude. O dono pediu para publicar na `main`. A publicação leva só o que é público; o conteúdo em elaboração continua na pasta privada `rascunhos/` (fora do Git), e o registro detalhado dele também fica fora do repositório, que é público.

**O que sobe:**
1. **Texto bíblico (Almeida):** 14 correções de digitação e de acento em `tools/gerar-almeida.py` (`VERSE_FIXES`) e nos arquivos de Lucas, João, Mateus, Marcos e 2 Coríntios: Lc 22.46 (“Levantai-vos”), Lc 24.20 (“o entregaram”), Jo 18.3 (vírgula), Jo 18.6 (“caíram”), Jo 19.3 (“e e”), Jo 19.42 (“véspera”), Jo 20.23 e 2Co 5.21 (crase: “Àqueles”, “Àquele”), Jo 20.25 (“os outros discípulos”), Mt 26.24 (“traído”), Mt 26.63 (“o Filho de Deus”, como nas outras versões em português do app), Mt 26.64 (“Respondeu-lhe”), Mc 15.32 (ponto antes de “Também”) e Mc 15.43 (“foi a Pilatos”). São erros evidentes da fonte, e cada um foi conferido contra o próprio verso.
2. **Blocos novos no Markdown dos estudos** (`core/rich-text-parser.ts`, `shared/rich-text.ts`): `:::dialogo` (falas por pessoa, com “Ouvir” lendo “Nome: fala”), `:::hora` (linha de hora sob o título), `:::leia id continua` e `:::leia id apoio` (rótulos “A história continua” e “Para entender o cenário”), `:::dobra` (linha “Saiba mais”), sanfona por tópico, faixa compacta de figuras e grifo leve de aspas. Só os estudos privados os ligam; nenhum estudo público muda.
3. **Ouvir e compartilhar:** “Ouvir” não lê mais o nome de ícones nem rótulos marcados com `data-nolisten`, e lê falas e linhas de hora; a imagem de compartilhar põe a hora na frente do subtópico e corta o subtópico pela largura (reticências), em vez de por linhas; `tools/gerar-audio.mjs` acompanha. A caixa de fontes e a página de fontes quebram endereços longos, e a caixa não mostra o título “Para conferir e aprofundar” quando não há obras.
4. **Apoio à prévia privada:** catálogos vazios no build público (`core/draft-content.ts`, `shared/draft-figure.ts`) e ganchos em `library.ts`, `trails.ts`, `sources.ts` e `figure.ts`; a faixa “Rascunhos locais · não publicados” só aparece na prévia; `npm run start:rascunhos` (configuração `rascunhos` do `angular.json`, que não recarrega a página sozinha); `maps.ts` ganhou `focusZoom`, para mapas de uma cidade só.
5. **Trava de publicação:** `tools/verificar-publicacao.mjs` (`npm run verificar:publicacao`), rodada pelos dois workflows depois do build, e `e2e/logica/rascunhos.spec.ts` (testa a trava e que a biblioteca pública não inclui a coleção privada). `/rascunhos/` e `/Ciencia explica/` entram no `.gitignore`; o README ganhou a seção “Rascunhos locais”.
6. **Testes novos:** `e2e/logica/dialogos.spec.ts`, `e2e/logica/sanfona.spec.ts` e casos em `compartilhar.spec.ts`, `ilustracoes.spec.ts` e `e2e/ouvir.spec.ts`.

**Decisões:** (a) o conteúdo privado não sobe: está fora do Git, e a trava barra o build se algum identificador dele aparecer; (b) `DIARIO.md` e `CLAUDE.md` sobem sem as anotações da coleção privada, porque o repositório é público, e as versões completas ficam só no computador do dono; (c) não entram os arquivos soltos da raiz (`Teologos/`, `RECONHECIMENTO-DO-SISTEMA.md`, `.playwright-mcp/`); (d) nas páginas públicas, o que muda é o texto bíblico corrigido e o “Ouvir” e a imagem de compartilhar mais limpos; os blocos novos ficam inertes até algum estudo público usá-los.

**Validação:** num checkout limpo do commit, sem a pasta privada: lint sem problemas; 184 testes de lógica; build de produção e trava de publicação sem achados; bateria do navegador com o app em desenvolvimento, em porta própria: celular, 540 testes ok e 1 ignorado; computador, 538 ok e 3 ignorados. Os 14 versículos alterados na Almeida foram comparados com o commit anterior, um a um, e coincidem com `VERSE_FIXES`.

**Pendências:** o dono dizer se e quando a coleção privada vira pública (exige mover textos e figuras para a parte pública, registrar fontes e créditos e tirar a trava); o “prefeito” nos estudos públicos que ainda usam a palavra.

## 2026-11-06 17:30 -0400 — Reversão das publicações de hoje

**Autor:** Valtemir Junior (com Copilot)

**O que foi feito:**
- Preparei a reversão das publicações dos PRs #8 (“Nova foto do autor de A Sanguessuga”) e #9 (“Melhorias do leitor e coleção Como a Ciência Explica”).
- Restaurei os arquivos ao estado do PR #7, a versão que estava publicada antes das mudanças de hoje.

**Decisões:**
- Manter o GitHub Pages e o site no ar; retirar apenas as mudanças publicadas hoje.
- Reverter os merges sem apagar o histórico. As entradas originais deste diário permanecem como registro do que foi publicado.
- Manter fora da reversão os arquivos locais não rastreados em `.playwright-mcp/` e `Teologos/`.

**Arquivos:** arquivos rastreados dos PRs #8 e #9; `DIARIO.md`.

**Validação:** pendente dos checks e da publicação do PR de reversão.

**Pendências:** concluir o PR de `dev` para `main` e confirmar a publicação no Pages.

## 2026-11-06 16:39 -0400 — Estudos científicos em volumes e melhorias no leitor, navegação e anotações

**Autor:** Valtemir Junior (com Copilot)

**O que foi feito:**
- Reuni os sete estudos sobre sinais e milagres na estante própria **Como a Ciência Explica**, em três volumes (Química e Matéria, Física e Movimento, Corpo e Vida). Cada estudo continua sendo um artigo e pertence a uma única trilha.
- Escrevi os estudos sobre Caná, o machado que flutuou, Jesus sobre as águas, a multiplicação dos pães, a tempestade acalmada, o cego de nascença e o filho da viúva de Naim. Acrescentei diagramas SVG com movimento reduzido, fontes e os links entre assuntos; os textos distinguem o que a ciência descreve do que os relatos não permitem reconstruir.
- Corrigi a conversão de metretas no artigo sobre o casamento judaico: litros são estimativa, não medida informada por João.
- No leitor, incluí a seleção de versículos para criar uma anotação com referência, citação, versão e comentário, salvando em Anotações. Anotações bíblicas não aparecem como tipo manual para novas anotações de culto.
- Acrescentei um resumo-piloto autoral de Gênesis 1, com opção de exibição no modo de foco; modelei a preferência de leitura e incluí a validação do conteúdo.
- Implementei menu lateral discreto, acionado por botão ou gesto da borda no celular; incluí modo de foco e ajustes rápidos de tema/tamanho do texto. Reservei o gesto da borda para o menu, sem virar o capítulo.
- Ajustei a quebra de URLs longas na página de fontes para evitar rolagem horizontal em telas estreitas.

**Decisões:**
- **Separar a coleção científica das histórias da Bíblia:** os artigos ficam agrupados por área de conhecimento, sem duplicação. Novos estudos da série poderão entrar como volumes futuros.
- **Limite das explicações:** não atribuir diagnósticos, mecanismos ou detalhes que as fontes bíblicas e clínicas não fornecem.
- **Resumo em piloto:** somente Gênesis 1 por enquanto; a estrutura e a validação permitem ampliar sem presumir cobertura dos outros capítulos.
- **Fluxo de produção:** preparar a publicação em `dev` e abrir PR para `main`; não enviar diretamente à branch de produção.
- **Ficaram fora do commit:** `Teologos/` (imagens originais/auxiliares) e `.playwright-mcp/` (capturas e logs locais).

**Arquivos:** `CLAUDE.md`; `e2e/acessibilidade.spec.ts`, `e2e/base.ts`, `e2e/estante.spec.ts`, `e2e/estudo.spec.ts`, `e2e/leitor.spec.ts`, `e2e/logica/conteudo-estudo.spec.ts`, `e2e/logica/estante.spec.ts`, `e2e/navegacao.spec.ts`, `e2e/temas.spec.ts`, `e2e/vozes.spec.ts`; `public/conteudo/artigos/casamento-judaico.md` e os sete artigos novos; `public/conteudo/resumos.json`; fontes Material Symbols em `public/fonts/`; `src/app/app.html`, `app.scss`, `app.ts`; `src/app/core/content.service.ts`, `library.ts`, `models.ts`, `notes.service.ts`, `settings.service.ts`, `sources.ts`, `trails.ts`, `whats-new.ts`; páginas `note/`, `notes/`, `reader/`, `settings/` e `sources/`; `src/app/shared/bible-note-sheet.ts`, `figure.ts`, `reading-settings.ts`, `sheets.ts`; `src/styles.scss`; `DIARIO.md`.

**Validação:** `npm run lint`, `npx ng build`, 170 testes de lógica, 7 testes de produção offline e a verificação de largura de todas as rotas a 360 px passaram. A bateria completa inicial teve 1.267 aprovados e 6 falhas; após os ajustes, os cenários afetados foram repetidos em celular e computador (9 aprovados, 1 ignorado), e a varredura das rotas a 360 px passou. Também foi corrigido um conflito de gestos no leitor identificado na revisão do diff.

**Pendências:**
- Abrir o PR de `dev` para `main`, aguardar os checks e concluir a publicação no Pages.

## 2026-11-06 07:35 -0400 — Nova foto do autor de “A Sanguessuga”

**Autor:** Valtemir Junior (com Claude Code)

**O que foi feito:**
- Troquei o retrato de Lucas Silva no jornal pela “Lucas Silva Modificado.jpeg”, que o dono deixou na pasta `Teologos/` (foto de estúdio, de corpo inteiro e fundo branco). O recorte é um quadrado de 580 px com a cabeça e o busto, reduzido a 440×440, no mesmo arquivo `public/conteudo/imagens/vozes-lucas-silva.jpg`; o código não mudou.
- A nota “Foto do autor”, que o autor lê na prévia, os créditos (`CREDITOS.md`) e a tela de créditos (`core/credits.ts`) passaram a dizer que a foto é uma versão modificada da foto dele, enviada pelo editor.

**Decisões:**
- **Mesmo nome de arquivo:** o app já aponta para ele, e o cache do app (ngsw) troca por hash, então quem já abriu o app recebe a foto nova.
- **Avisar que é modificada:** o arquivo se chama “Modificado”; a nota diz isso ao autor, com a opção de pedir a original, outra foto ou nenhuma. Não sei como a foto foi modificada, por isso o texto diz só “versão modificada”.
- **Ficou de fora:** a pasta `Teologos/` (cópia da imagem de compartilhar já usada e a foto original do envio) não entra no git.

**Arquivos:** `public/conteudo/imagens/vozes-lucas-silva.jpg`, `src/app/core/guest-sermons.ts`, `src/app/core/credits.ts`, `CREDITOS.md`, `DIARIO.md`.

**Validação:** lint e build limpos (pacote inicial sem aviso); 35 testes do sermão aprovados (lógica, celular e computador); a página foi conferida em capturas nos temas claro e escuro e no celular.

**Pendências:**
- Gerar a versão sem letras da imagem de compartilhar e escolher o novo subtítulo do sermão (continuam da entrada anterior).

---

## 2026-11-05 17:00 -0400 — Jornal com aba própria e ícone que pisca; “A Sanguessuga” no jornal com foto do autor, imagens novas e texto em norma culta; IBUC e “Minhas aulas da revista” fora do menu Ensino

**Autor:** Valtemir Junior (com Claude Code)

**O que foi feito:**
- **Jornal (Novas Vozes da Palavra):** sexta aba “Jornal” na barra de baixo (ícone de jornal, nome embaixo). O fundo do ícone pisca devagar (1,6 s) e um ponto dourado fica parado enquanto houver matéria que a pessoa não abriu (`core/voices-news.service.ts`, `biblia.vozes.vistas`, que entra no backup); abrir a matéria apaga o aviso. A lista (`/vozes`) tem duas seções separadas, “Sermões” e “Pregações” (`GuestSermon.kind`), cada uma só aparece com matéria, e o que não foi aberto leva o selo “Novo”. O cartão do jornal saiu do menu Ensino (cada tela mora em uma aba só). Subtítulo do jornal: “Sermões e pregações das novas gerações”, nos seis idiomas.
- **“A Sanguessuga”** passou de não listado para `publicado` (a pedido do dono: entra no jornal) e ganhou entrada em Novidades (`jornal-novas-vozes`). Foto do autor em círculo à direita do título (`authorPhoto`, recorte 440×440 da foto enviada). Texto em português revisado na norma culta (você + o/lhe/seu, regência, pontuação), com as citações da Almeida intactas; apagada a frase em destaque da parte II, que repetia o título logo acima (a frase de efeito da imagem de compartilhar agora é o título da parte II).
- **Imagens do sermão:** a imagem enviada pelo editor é a base de compartilhar em português e a figura “Dá, Dá”; a sanguessuga sozinha foi gerada a partir dela, no mesmo estilo e sem letras (compartilhar nos outros idiomas e figura do texto). Legenda “criada com inteligência artificial para o app”. O gerador de imagem de compartilhar ganhou `photo.fit: 'contain'` (arte inteira, em quadro sobre fundo desfocado, quando preencher cortaria mais de um quinto).
- **Ensino:** o cartão “Minhas aulas da revista” e a seção IBUC saíram do menu (ocultos, não apagados: telas, endereços e código continuam; voltam recolocando o cartão em `pages/teach/teach.ts`).

**Decisões:**
- **Ocultar, não remover:** IBUC e “Minhas aulas da revista” só deixam o menu Ensino; `/ibuc`, `/ebd` e os atalhos de outras telas seguem funcionando. Foi o que o dono confirmou (“ocultar do menu Ensino”). O cartão “Próxima aula” e o “Apoio ao professor” ficaram, porque não foram pedidos.
- **Aba, não cartão:** o jornal é a sexta aba. Em 360 px os seis botões cabem (testado). O piscar muda só a cor, nunca o tamanho, e fica parado com movimento reduzido (o ponto dourado continua).
- **Sermões e pregações separados:** entendi “só que separados” como duas seções no jornal. Hoje só há sermão; a seção de pregações aparece sozinha quando houver a primeira.
- **Orçamento do pacote inicial:** o aviso subiu de 1 MB para 1,05 MB (`angular.json`; o erro continua em 2 MB). O pacote já estava em 99,99% do limite, e o menu, o serviço e a novidade custam cerca de 3 kB. Os dados dos sermões entram por `import()` depois da abertura (importá-los direto custava uns 22 kB).
- **Imagem enviada em português só:** ela tem “DÁ!” e “SANGUE” escritos; nos outros idiomas a figura continua o desenho com rótulos traduzidos e o compartilhar usa a sanguessuga sem letras.
- **Ficou de fora:** nova versão da imagem enviada sem as letras (o gerador estava ocupado); trocar o subtítulo do sermão (sugestões enviadas, aguardando escolha).

**Arquivos:** `src/app/app.ts`, `app.html`, `app.scss`, `core/voices-news.service.ts`, `core/guest-sermons.ts`, `core/whats-new.ts`, `core/voice-share-card.ts`, `core/share-card.ts`, `core/credits.ts`, `pages/voices/voices.ts`, `pages/voices/voice-sermon.ts`, `pages/teach/teach.ts`, `shared/voice-article.ts`, `shared/voice-article.scss`, `shared/voice-art.ts`, `shared/share-render.ts`, `public/conteudo/vozes/a-sanguessuga*.md`, `public/conteudo/imagens/vozes-*.jpg`, `angular.json`, `e2e/vozes.spec.ts`, `e2e/offline.spec.ts`, `e2e/navegacao.spec.ts`, `e2e/estudo.spec.ts`, `e2e/logica/vozes.spec.ts`, `e2e/logica/links-internos.spec.ts`, `CLAUDE.md`, `CREDITOS.md`, `DIARIO.md`.

**Validação:** lint e build limpos (pacote inicial em 1,00 MB, sem aviso com o novo limite de 1,05 MB). Bateria completa (lógica, celular e computador): 1.238 aprovados, 4 ignorados e 6 reprovados, todos pelo selo “Novo” da lista do jornal (12 px e contraste de 2,69 no tema sépia); o selo passou a usar as cores do tema e 13 px, e os testes de temas e de acessibilidade das telas do jornal foram refeitos e passaram (a bateria inteira não foi repetida depois dessa correção de estilo). Produção offline (porta 4401, build de base `/`): 7 de 7 em duas rodadas. Um teste de produção que abria o sermão por toque falhava quando rodava junto com os outros (o cache do app baixando a Bíblia em seis testes engarrafa o servidor de teste); passou a abrir pelo endereço. Fora da bateria, a página do jornal e do sermão foi conferida em capturas (computador, celular de 390 e 360 px, temas claro e escuro).

**Pendências:**
- Gerar a versão sem letras da imagem enviada (para o compartilhar e a figura “Dá, Dá” nos outros idiomas).
- Escolher o novo subtítulo do sermão (quatro sugestões já enviadas).
- Os cartões “Minhas aulas da revista” e IBUC continuam alcançáveis por outras telas (por exemplo, links de lembretes da EBD); só o menu Ensino foi limpo.

---

## 2026-11-05 14:02 -0400 — Sermão A Sanguessuga não listado

**Autor:** Copilot

**O que foi feito:**
- Configurei “A Sanguessuga” para publicação como sermão não listado, acessível em `/vozes/a-sanguessuga`, fora dos catálogos de Novas Vozes e do hub Ensino.
- A página direta pede `noindex, nofollow`; o antigo link de aprovação deixa de funcionar depois da publicação.
- Acrescentei testes de catálogo, acesso direto e build de produção, e documentei o fluxo.

**Decisões:**
- Usei `status: 'nao-listado'` em vez de `publicado` para manter o sermão fora de listas e novidades, conforme solicitado.
- O sermão continua público para quem tem o endereço; isso não é controle de acesso nem confidencialidade.
- Não anunciei a publicação em Novidades, pois isso a tornaria encontrável.

**Arquivos:** `src/app/core/guest-sermons.ts`, `src/app/pages/voices/voice-sermon.ts`, `src/app/pages/voices/voice-review.ts`, `e2e/logica/vozes.spec.ts`, `e2e/vozes.spec.ts`, `e2e/offline.spec.ts`, `CLAUDE.md`, `DIARIO.md`.

**Validação:** lint aprovado; 14 testes lógicos, 7 testes de navegador e build de produção aprovados. A validação de produção confirmou catálogo vazio, URL direta acessível com `noindex` e link de revisão invalidado. O teste offline padrão encontrou um servidor preexistente na porta 4400; validei o build num servidor isolado na porta 4401.

**Pendências:** nenhuma.

Modelo:

```markdown
## AAAA-MM-DD HH:MM -0400 — Título curto

**Autor:** nome (com Claude Code, se for o caso)

**O que foi feito:**
- …

**Decisões:**
- …: por quê.

**Arquivos:** `caminho/arquivo`, …

**Pendências:**
- …
```

---

## 2026-11-05 13:43 -0400 — Sincronização de main em dev para preparar a integração

**Autor:** Valtemir Junior (com Copilot)

**O que foi feito:**
- Resolvi os conflitos do merge de `main` em `dev`, preservando a versão mais completa de `dev` e o conteúdo já publicado em `main`.
- Mantive os registros publicados das Datas da História e da Geração, acrescentei os avisos antigos de novidades e as rotas que redirecionam os endereços substituídos.
- Removi entradas duplicadas de dois estudos e de suas fontes, que a união automática havia repetido.
- Integrei o relato mais completo de William Tyndale ao estudo da Palavra, mantendo o cartão para a história da Reforma Inglesa.
- Validação local: lint, 165 testes lógicos e build de produção aprovados.

**Decisões:**
- `dev` continua sendo a versão de referência para os conflitos, pois contém os estudos e as datas adicionais; itens que já estavam em `main` foram mantidos onde não duplicavam conteúdo.
- O envio para produção segue por PR de `dev` para `main`, como definido para o projeto.

**Arquivos:** `CLAUDE.md`, `CREDITOS.md`, `DIARIO.md`, `TESTES.md`, `e2e/`, `public/conteudo/artigos/a-palavra-no-coracao.md`, `src/app/core/` (`anniversaries.ts`, `credits.ts`, `library.ts`, `share-card.ts`, `sources.ts`, `trails.ts`, `whats-new.ts`), `src/app/pages/history/history.ts`, `src/app/shared/` (`share-render.ts`, `share-sheet.ts`)

**Pendências:**
- Aguardar os checks da PR `dev` → `main` antes de concluir a publicação.

---

## 2026-11-05 12:06 -0400 — Novas Vozes: imagem de compartilhar com QR code e revisão da concordância

**Autor:** Valtemir Junior (com Claude Code)

**O que foi feito:**
- **Imagem de compartilhar do sermão** (botão “Compartilhar” no jornal, em cada idioma): ilustração desenhada para o app (a sanguessuga e a gota de sangue), o texto-base em letras grandes (“Pv 30.15”), o título, o nome do autor, a frase de efeito do próprio texto em dourado (“A sanguessuga é semelhante ao pecado: nunca diz basta”) e o QR code que abre o sermão no mesmo idioma (`/vozes/a-sanguessuga?idioma=es`, nunca o link de revisão). Feed 1080×1350 e Stories 1080×1920, pelo mesmo painel das outras páginas (`voiceSermonCard`, em `core/voice-share-card.ts`, fora do `share-card.ts` para os dados do sermão não entrarem no pacote inicial).
- **Concordância revisada** nos seis textos: “pessoas entenebrecidas… se entregaram” (a citação de Efésios está no plural), “a terra que nunca se farta de água” (Pv 30.16, antes “a terra sem água”, o que o versículo não diz) e “sugar os outros”. O que ficou no jeito do autor (“te chama”, “te suga”) está dito na lista de mudanças da prévia.
- **Achado no caminho:** `headingKey` descartava letras que não fossem latinas, então todos os títulos em russo viravam a mesma chave e a lista de tópicos do cartão ficava com um só; agora vale para qualquer alfabeto.

**Decisões:**
- **Sem lista de partes na imagem:** o layout de selo, foto e frase (o das datas) não comporta a lista; o pedido era imagem que atraia, frase de efeito e QR code.
- **A frase de efeito é a primeira frase em destaque do texto de cada idioma** (o teste confere palavra por palavra), para a imagem nunca dizer o que o sermão não diz.
- **Ilustração em arquivo (JPEG de 53 KB)** em `public/conteudo/imagens/`, centralizada no recorte (`photo.focusY`), para o feed e o Stories não cortarem a sanguessuga.

**Arquivos:** `core/voice-share-card.ts`, `core/guest-sermons.ts`, `core/rich-text-parser.ts`, `shared/share-render.ts`, `shared/voice-article.ts`, `public/conteudo/vozes/*.md`, `public/conteudo/imagens/vozes-sanguessuga.jpg`, `e2e/logica/vozes.spec.ts`, `e2e/compartilhar.spec.ts`, `CLAUDE.md`, `CREDITOS.md`, `core/credits.ts`

**Pendências:**
- O QR code só abre o sermão depois que ele for publicado (o `status` virar `'publicado'`); antes disso o link cai em “Sermão não encontrado”.
- Busca no estudo para os sermões de convidados.

---

## 2026-11-05 11:30 -0400 — Novas Vozes da Palavra: o sermão “A Sanguessuga”, de Lucas Silva, em jornal, em seis idiomas e com prévia para o autor aprovar

**Autor:** Valtemir Junior (com Claude Code)

**O que foi feito:**
- **Módulo novo “Novas Vozes da Palavra”** (`core/guest-sermons.ts`, `pages/voices/`, rotas `/vozes`, `/vozes/:id` e `/revisao/:token`, cartão em Ensino ao lado de “Meus sermões”): sermões de novos teólogos e estudiosos da Palavra, publicados com a autorização de cada autor. O primeiro é “A Sanguessuga” (Provérbios 30.15), de Lucas Silva, a partir do texto colado e da imagem da anotação dele (o fim do sermão: Jesus no último dia da festa, o pródigo, “nova realidade”).
- **Estilo de jornal** (`shared/news-text.ts`, `shared/voice-article.ts`): título do jornal entre filetes, manchete, subtítulo, autoria e minutos de leitura; duas colunas com fio no computador e uma no celular; letra capitular; partes em algarismo romano; texto-base em caixa; frases do autor em destaque; quadro lateral; ilustrações com legenda.
- **Texto:** a ordem e as frases do Lucas foram mantidas e o que não conferia com a Bíblia ou com os fatos foi ajustado e listado (13 itens, em `GuestSermon.changes`, para o autor ver na prévia): três partes (I, II, III), “Sebna” retirado (Isaías 22 não diz que os filhos o sugaram), “toro selvagem” trocado pelo que Provérbios 30.2-3 diz, “só vive se tiver alguém pra sugar” suavizado (a sanguessuga-medicinal fica até cerca de um ano sem comer), Ló e a planície bem regada, siglas das referências no padrão do app e citações palavra por palavra da Almeida do app. Acrescentados, com aviso: versículos que apoiam o que ele já dizia (Pv 30.14, 30.15-16, Lv 17.11, Pv 14.12, Jo 7.37, Lc 15.14-20) e o quadro “Fatos sobre a sanguessuga” (com fonte no pé).
- **Ilustrações** (`shared/voice-art.ts`, SVG com as cores do tema, sem direitos de terceiros): a sanguessuga, a mãe com as filhas “Dá, Dá”, o caminho do desejo (Tiago 1.14-15) e a fonte de água viva e as cisternas rotas (Jeremias 2.13). Os rótulos mudam com o idioma.
- **Seis idiomas:** português (original), espanhol, inglês, francês, alemão e russo. Os versículos tocados e o texto por extenso (`:::versiculo`) vêm da versão da Bíblia da língua (RV1909, WEB, Louis Segond, Lutero 1912, Sinodal), ou da que a pessoa já escolheu em Ajustes, se for da mesma língua. A página diz que as traduções foram feitas com apoio de IA e sem revisão de falante nativo.
- **Ouvir em cada idioma:** `ListenService` e `voice.ts` aceitam a língua (vozes do aparelho por língua, voz escolhida guardada por língua, aviso de “sem voz em …”); as referências são ditas por extenso (“Provérbios capítulo 30, versículo 1”, `core/speech-ref.ts`); o algarismo romano dos títulos e os números dos versículos não são lidos.
- **Prévia exclusiva para o autor** (`/revisao/<token>`, `pages/voices/voice-review.ts`): página à parte (sem as barras do app, `noindex`), com o jornal como o público vai ler, a lista do que o editor mudou (o que pede resposta vem primeiro), e a decisão: aprovar (com a caixa “autorizo”) ou pedir ajustes (com a descrição). Como o app não tem servidor, a decisão fica guardada no aparelho dele, amarrada à marca da versão do texto (`contentVersion`), e vira uma mensagem para mandar ao editor (WhatsApp, compartilhar ou copiar). Se o texto mudar, a página avisa que a versão mudou.
- **Publicação controlada:** o sermão nasce com `status: 'revisao'`. No app publicado ele não aparece no menu, em `/vozes` nem em `/vozes/a-sanguessuga` (conferido no build de produção); só a prévia abre. No `ng serve` ele aparece com a etiqueta “Em revisão” e um botão para copiar o link do autor.
- **Outros:** `:::versiculo` e `:::nota Título` no leitor de Markdown; `PassageView`/`Sheets.passage` aceitam a versão da Bíblia; ícones novos (script das fontes rodado, 235 ícones); créditos (`credits.ts`, `CREDITOS.md`); `CLAUDE.md` e `TESTES.md`.

**Decisões:**
- **Prévia por link “sem lista”, não por senha:** o app é estático (GitHub Pages), sem servidor; o link tem 16 dígitos aleatórios, não aparece em nenhuma tela, o teste falha se ele aparecer em outro arquivo, e a página pede aos buscadores para não indexar. Quem tem o link lê, e o texto fica no pacote público (o autor concordou com a publicação). Não serve para nada confidencial.
- **O sermão publicado só entra no menu quando o status vira `'publicado'`:** assim dá para subir o app (e o link do autor funcionar) sem mostrar o sermão ao público antes da aprovação.
- **A decisão do autor volta por mensagem, não por servidor:** um servidor (ou formulário externo) pediria conta e chave; a mensagem leva a versão do texto, para não aprovarem uma versão e publicarem outra.
- **A voz do sermão continua a do autor** (fala direta com “você”): é um sermão de convidado, não um texto do app; as regras de voz impessoal do CLAUDE.md valem para os estudos escritos para o app.
- **Traduções com apoio de IA, avisadas na página e na prévia:** em vez de omitir idiomas por falta de revisor. As citações bíblicas vêm da Bíblia embutida de cada língua (e o teste confere palavra por palavra), não da minha tradução.
- **Ficou de fora:** gravação em voz neural (gasta crédito do dono; o “Ouvir” usa a voz do aparelho), busca e imagem de compartilhar para o sermão, e a entrada em “Novidades” (só faz sentido quando o sermão for publicado).

**Arquivos:** `src/app/core/guest-sermons.ts`, `core/speech-ref.ts`, `core/voice.ts`, `core/listen.service.ts`, `core/rich-text-parser.ts`, `shared/{news-text,voice-article,verse-quote,voice-art,listen-dom,listen-player,passage-view,passage-sheet,sheets,verse-sheet}.*`, `pages/voices/*`, `pages/teach/teach.ts`, `app.{ts,html,scss}`, `app.routes.ts`, `public/conteudo/vozes/*.md` (6 arquivos), `public/fonts/*`, `core/credits.ts`, `CREDITOS.md`, `CLAUDE.md`, `TESTES.md`, `e2e/logica/vozes.spec.ts`, `e2e/vozes.spec.ts`, `e2e/{navegacao,acessibilidade,temas}.spec.ts`

**Pendências:**
- **O Lucas precisa aprovar** pela prévia (`SITE_URL/revisao/8f11d02bac34306e`); o link só funciona fora do computador depois que o app for publicado no `main`. Quando ele aprovar: `status: 'publicado'` em `guest-sermons.ts`, entrada em `whats-new.ts` e subir.
- Os pontos que dependem do Lucas: a ordem das partes (os números 11, 22, 33, 1 e 2 do original), a frase “O nome delas já fiz tudo” e a fonte de “Sebna”, se ele quiser manter.
- As traduções (es, en, fr, de, ru) precisam de revisão de quem fala cada língua.
- **Problema antigo achado de passagem:** nos Salmos, a Louis Segond (francês) e a Sinodal (russo) numeram diferente das outras versões embutidas (Sl 42.7 da Almeida é o 42.8 em francês e o 41.8 em russo); no leitor e nos estudos, uma referência a um Salmo cai no versículo errado nessas duas versões. Nas Novas Vozes isso foi tratado à mão; no resto do app, fica por tratar.
- Busca no estudo para os sermões de convidados (a imagem de “Compartilhar” já foi feita, veja a entrada seguinte).

## 2026-11-05 08:08 -0400 — Uma só história da volta do exílio a Jesus, Josefo, Macabeus e a regra de olhar a base antes

**Autor:** Valtemir Junior (com Claude Code)

**O que foi feito:**
- **Regra nova (pedido do dono do app):** antes de escrever qualquer história, personagem ou assunto, conferir o que a base já conta; se já existe, completar ou ramificar, nunca recontar em outro formato e resumido. Escrita em `CLAUDE.md` (“Check the base before writing”), na memória do projeto e na ferramenta nova `tools/verificar-base.py` (`"<assunto>"`, `--ler <id>`, `--repetidos`, `--par a b`), documentada em `tools/LEIA-ME.md`.
- **Busca (`core/study-search.ts`):** uma pesquisa de várias palavras passa a trazer primeiro os estudos que têm a expressão inteira (`exact`) e descarta os de pontuação muito baixa. “Coreia do Norte”, que trazia quatro ou cinco estudos, traz só o da Coreia (`e2e/logica/busca-estudo.spec.ts`).
- **Revisão geral de repetições** (`REVISAO-DE-CONTEUDO.md`): medida com `--repetidos`; a repetição literal é pequena (versículos, cartões, notas), o dono de cada assunto ficou registrado e as decisões em aberto, listadas.
- **Duas histórias viraram uma:** `entre-os-testamentos` e `grupos-do-tempo-de-jesus` → `da-volta-do-exilio-a-jesus` (cerca de 9.000 palavras, 20 capítulos, em ordem): Zorobabel e o segundo Templo, Esdras, Neemias, os samaritanos, Malaquias, Alexandre, os Macabeus, os reis-sacerdotes, Roma e Herodes, de onde vieram os fariseus, os saduceus, os essênios, os zelotes e os herodianos, **a casa de Davi** (do último rei a José, com a figura `linhagem-de-davi`), as sinagogas, a esperança do Messias, João Batista e **“Os Grupos Existem Hoje?”**. O texto antigo foi aproveitado como estava; o novo foi escrito com as fontes (Esdras, Neemias, Josefo, Eusébio, 1 Macabeus, Qumran). Os dois endereços antigos redirecionam (`app.routes.ts`).
- **Estudo novo `flavio-josefo`:** quem foi (de sacerdote de Jerusalém a general na Galileia, prisioneiro e historiador de Roma), as quatro obras, o que ele conta que a Bíblia também conta (Herodes, Pilatos, João Batista, Tiago, Agripa I, a fome, o egípcio), o *Testimonium* com as duas leituras, os pontos em que não bate com o Novo Testamento e como ler com cuidado. Fica em “Contexto Histórico › Roma e o Poder”.
- **Estudo novo `livros-dos-macabeus`:** guia de leitura do Primeiro e do Segundo Macabeus capítulo a capítulo, com o que cada um conta que o outro não conta, os ensinos (ressurreição, oração pelos mortos) lidos por católicos, ortodoxos e protestantes, a Hanucá e uma nota honesta: o texto em si não está no app. Fica na estante, em “A Ponte entre os Testamentos”.
- **Ajustes para não repetir:** `cativeiros-de-israel` (a volta em três ondas virou um parágrafo e um cartão para a história nova), `a-palavra-no-coracao` (Tyndale em duas frases e cartão para `reforma-inglesa`), `avivamentos-na-biblia` (aponta para a cena completa), `apocrifos` (cartão novo para os Macabeus).
- **Ligações:** cartões de `a-familia-de-herodes`, `apocrifos`, `miller-estevao-apostolos-e-paulo`, `os-faraos-da-biblia`, `o-templo-de-herodes` e `septuaginta`; EBD de Adultos; trilha, época (`entre-testamentos`), fontes (`sources.ts`, com 13 obras de referência novas) e a tela Novidades (`da-volta-do-exilio-a-jesus`).
- **Fotos:** 16 novas (Cilindro de Ciro, Doré, Alexandre, Antíoco IV, Janeu, Pompeu, Herodes, Herodium, maquete do Templo, Qumran, Páscoa dos samaritanos, Massada, Grande Rolo de Isaías, Josefo), todas de domínio público ou licença aberta, com crédito na legenda, em `core/credits.ts` e em `CREDITOS.md`. Fonte de ícones refeita (`history_edu`).

**Decisões:**
- **Juntar, não ramificar, as duas histórias antigas:** elas contavam o mesmo período por dois lados; deixar as duas deixaria o leitor com os Macabeus e os fariseus contados duas vezes. Os Macabeus ficaram com um estudo à parte só para os livros (leitura), e a revolta continua na história única.
- **As linhas “Depois” dos quadros dos grupos foram para o último capítulo:** a resposta a “existem hoje?” fica num só lugar.
- **Os livros dos Macabeus em guia, não em texto:** não se achou tradução em português de licença livre. Ficou de fora, por ora, traduzir de uma edição em inglês de domínio público (decisão do dono do app).
- **Josefo com ressalvas:** o *Testimonium Flavianum* aparece com as duas leituras, e os números dele são tratados como exagerados; só entra o que se pode citar das obras dele e de fontes comparadas. Fora: a lenda do “problema de Josefo” e o que não se confirma.
- **Época da história única:** `entre-testamentos` (a maior parte do texto), e não `exilio-retorno`, onde ela começa.

**Arquivos:** `public/conteudo/artigos/{da-volta-do-exilio-a-jesus,flavio-josefo,livros-dos-macabeus}.md` (novos), `entre-os-testamentos.md` e `grupos-do-tempo-de-jesus.md` (removidos), cartões e ajustes em oito estudos, `src/app/core/{library,trails,sources,epochs,whats-new,credits,study-search,ebd-adultos-4t26}.ts`, `src/app/app.routes.ts`, `src/app/shared/figure.ts`, `tools/verificar-base.py`, `tools/LEIA-ME.md`, `REVISAO-DE-CONTEUDO.md`, `CLAUDE.md`, `CREDITOS.md`, 16 fotos em `public/conteudo/imagens/`, `public/fonts/`, testes em `e2e/` (estudo, navegação, acessibilidade, compartilhar, ilustrações, busca).

**Pendências:**
- Publicar só quando o dono do app mandar. Fica no `dev` junto com a Coreia, os batistas, Miller × Ferguson, Avivamentos na Bíblia, Marcas de um Avivamento e as 17 datas retidas.
- Decidir o dono da história da chegada de Berg e Vingren a Belém (hoje contada em parte em quatro estudos) e se vale traduzir os Macabeus de uma edição em inglês de domínio público (`REVISAO-DE-CONTEUDO.md`).

## 2026-11-05 07:19 -0400 — Painel de compartilhar: os botões ficavam escondidos

**Autor:** Valtemir Junior (com Claude Code)

**O que foi feito:**
- **Problema**: ao tocar em Compartilhar, o painel abria, mas os quatro botões (“Compartilhar imagem”, “Baixar a imagem”, “Enviar o link no WhatsApp” e “Copiar o link”) ficavam abaixo da dobra e só apareciam rolando o painel: numa janela de 1080×661 estavam entre 647 e 863 px, e no celular de 390×844 o primeiro ficava na borda e os outros fora da tela. Parecia que o compartilhar não funcionava.
- **Correção** (`shared/share-sheet.ts`): na tela estreita, os botões ficam grudados no pé do painel, em duas colunas, e a imagem encolhe (até 34% da altura); na tela larga (a partir de 760 px), a imagem fica de um lado e os tamanhos, os botões e a dica do outro, tudo à vista, sem rolar. A dica passou a explicar que, no computador, que não tem o menu de compartilhar, a imagem é salva para anexar no WhatsApp ou no Instagram.
- **Teste novo** (`e2e/compartilhar.spec.ts`): os quatro botões ficam inteiros dentro da tela, com pelo menos 40 px de altura, em janela baixa (1080×661) e no celular (390×740).
- Conferido: o botão do alto da página abre o painel em todos os temas de cor (claro, escuro, brasa, floresta, sépia e névoa), sem erro no console.

**Decisões:**
- O botão “Compartilhar imagem” continua com o mesmo nome em todo aparelho. Onde o navegador não manda arquivos (computador no Linux, por exemplo), ele salva a imagem e avisa; trocar o nome por aparelho confundiria mais.

**Arquivos:** `src/app/shared/share-sheet.ts`, `e2e/compartilhar.spec.ts`, `DIARIO.md`

**Pendências:**
- Só no `dev`: a imagem de compartilhar nas outras páginas ainda não foi publicada (nesta correção ela só afeta o painel).

## 2026-11-04 16:07 -0400 — Publicação: “A Geração que Não Conheceu o Senhor” e a data de Edwards

**Autor:** Valtemir Junior (com Claude Code)

**O que foi feito:**
- Ramo `publicar-geracao`, saído do `main`, com o estudo **A Geração que Não Conheceu o Senhor** (o padrão de Josué e Jefté aos nossos avivamentos; o culto no lar; a doutrina, a regra e o costume), aprovado pelo usuário: o texto, a entrada na biblioteca, as fontes, o item de novidades, a entrada na trilha “Reconhecer e Guardar o Avivamento” (agora com este estudo e o da Palavra) e o cartão em `avivamentos-desde-atos` (seção “Guardar o Fogo”, com os dois estudos).
- A data **Edwards é dispensado de Northampton** (22 de junho de 1750) entrou em `anniversaries.ts`: a história que a explica é este estudo. O 22 de junho passa a ter dois fatos (com o do Rio de Janeiro, de 1924), e vira compilado.
- A frase do estudo que citava *Os Avivamentos na Bíblia*, que ainda não está publicado, foi tirada.

**Decisões:**
- As outras 17 datas que o usuário aprovou (11 da Coreia, 3 de Miller e 3 dos batistas) **não** subiram: o texto de cada uma repete fatos que só estão nos estudos reescritos (Coreia, batistas) ou nos livros de Miller, e esses estudos ainda não foram aprovados. Uma data publicada sem o estudo que a explica leva a uma história que não tem o fato. Sobem juntas com os estudos, quando eles forem aprovados.

**Arquivos:** `public/conteudo/artigos/a-geracao-que-nao-conheceu-o-senhor.md`, `public/conteudo/artigos/avivamentos-desde-atos.md`, `src/app/core/library.ts`, `trails.ts`, `sources.ts`, `whats-new.ts`, `anniversaries.ts`, `DIARIO.md`

**Pendências:**
- Aprovar e publicar a Coreia (e as 11 datas), os batistas (e as 3 datas), os livros de Miller e Ferguson (e as 3 datas de Miller), “Avivamentos na Bíblia”, “Marcas de um Avivamento”, a imagem de compartilhar nas outras páginas e as fotos como num jornal.

---

## 2026-11-04 15:28 -0400 — Publicação: Datas da História e o estudo da Palavra no coração

**Autor:** Valtemir Junior (com Claude Code)

**O que foi feito:**
- Ramo à parte (`publicar-palavra-e-datas`, saído do `main`) com só o que o usuário aprovou para publicar: o estudo **A Bíblia Está no Seu Celular, mas Está em Você?** e a página **Datas da História** (`/datas`). O resto do trabalho segue só no `dev`.
- **Estudo da Palavra**: o texto, a entrada na biblioteca (`library.ts`), um ramo novo da trilha dos avivamentos (“Reconhecer e Guardar o Avivamento”, só com este estudo), as fontes, o cartão em `avivamentos-desde-atos` (seção “Guardar o Fogo”) e as sete correções de digitação do Almeida (`tools/gerar-almeida.py` e cinco livros). A frase que citava o estudo ainda não publicado “A Geração que Não Conheceu o Senhor” foi tirada.
- **Datas da História**: a página, o carrossel da tela inicial (só os fatos do mês, um cartão por dia, compilado nos dias com vários fatos), o cartão “Datas de <mês>” no alto da biblioteca, o livro na estante “O Tempo”, a imagem de compartilhar (com o gancho, a explicação simples e as fotos) e o cache preguiçoso das fotos (`imagens-das-datas`). A imagem de compartilhar entrou só para as datas (infraestrutura em `share-card.ts`, `share-render.ts`, `share-sheet.ts` e `Sheets.shareImage`; `qrcode-generator` no `package.json`).
- **72 datas** (das 90 do `dev`), todas ligadas a estudos que já estão no `main`. Ficaram de fora, por dependerem de estudos ainda não publicados, 18 datas: as 11 da Coreia, as 3 de Miller (Diocleciano, Wycliffe, Constança), Edwards em Northampton e as 3 da igreja batista de Belém e de Salvador. Fotos: 49 novas (900 px) mais as que o `main` já tinha, com crédito em `CREDITOS.md` e `credits.ts`.
- `reforma-protestante`: o dia da resposta de Lutero em Worms (18 de abril de 1521) e o da morte dele (18 de fevereiro de 1546) entraram no texto, conferidos em fontes públicas, e as fontes do estudo foram atualizadas.
- Testes de datas e da imagem de compartilhar ajustados ao conjunto menor (meses com poucos fatos); o teste das novidades passou a procurar o botão “Entendi” pelo nome exato.

**Decisões:**
- Publicar por ramo próprio, saído do `main`, e não o `dev` inteiro: o `dev` tem mais de cem arquivos de outras frentes (Coreia, estudos de Miller e de Ferguson, estudo dos batistas, imagem de compartilhar em todas as páginas) que não foram aprovados. Quando forem, o próximo envio do `dev` para o `main` vai ter conflitos nos arquivos que os dois ramos mudaram; vale a versão do `dev`, que é um conjunto maior.
- Só as datas cujo texto está num estudo já publicado entram: o texto de cada data só repete o que o estudo conta.

**Arquivos:** `public/conteudo/artigos/a-palavra-no-coracao.md`, `public/conteudo/artigos/avivamentos-desde-atos.md`, `public/conteudo/artigos/reforma-protestante.md`, `src/app/core/` (`anniversaries.ts`, `share-card.ts`, `library.ts`, `trails.ts`, `sources.ts`, `whats-new.ts`, `credits.ts`, `library-bays.ts`), `src/app/shared/` (`commemorations.ts`, `share-render.ts`, `share-sheet.ts`, `sheets.ts`), `src/app/pages/` (`dates`, `history`, `home`), `public/conteudo/imagens/`, `ngsw-config.json`, `package.json`, `tools/gerar-almeida.py`, `public/bible/almeida/`, testes, `CREDITOS.md`, `CLAUDE.md`, `TESTES.md`, `DIARIO.md`

**Pendências:**
- Publicar o resto (Coreia e as 18 datas, estudos de Miller e de Ferguson, estudo dos batistas, imagem de compartilhar nas outras páginas) quando o usuário aprovar.

---

## 2026-11-04 14:58 -0400 — Gancho e explicação simples em cada data, e uma foto para todos os fatos

**Autor:** Valtemir Junior (com Claude Code)

**O que foi feito:**
- **Gancho e explicação simples**: cada uma das 90 datas ganhou um `hook`, uma pergunta curta que a história responde (“E de que lado ficou a igreja?”), em dourado na imagem de compartilhar, no carrossel e em `/datas`. Os textos mais vagos foram reescritos em linguagem simples: a **lei marcial** agora diz o que é (“quando os militares assumem o comando e direitos, como o de se reunir, ficam suspensos”), e o decreto 119-A, o golpe de 1979, a Constituição Yushin e a crise de Valparaíso também.
- **Imagem de compartilhar das datas**: o texto não é mais cortado em duas linhas (ele pode ter até 6 linhas no feed e 8 nos Stories); a foto ocupa o espaço que sobra, o gancho vem depois, e o rótulo passou a dizer “Foto ilustrativa” quando é o caso.
- **Todos os fatos têm foto**: os 52 que não tinham ganharam uma, do Wikimedia Commons (domínio público ou licença aberta), com 41 imagens novas (`datas-*.jpg`, 900 px, 4,2 MB no total) e mais algumas já existentes no app. Quando não há foto do fato em si, a foto é do lugar, da pessoa ligada ao fato ou da época, e aparece como **Foto ilustrativa** (campo `illustrative`). Exemplos: Fortaleza para o Ceará, a estação de Porto Velho em 1910 para Rondônia, a Catedral Evangélica do Chile, a multidão de Seul em 15 de agosto de 1945, Parham para Agnes Ozman, o avião de Nate Saint para os missionários do Equador.
- **Compilado do dia**: no 1º de janeiro (três fatos), agora cada fato aparece com a sua foto, o seu ano e o seu crédito (antes só a primeira tinha foto). A imagem de compartilhar do dia mostra as três fotos lado a lado, cada uma com o ano no canto, e a lista dos três fatos.
- **Créditos**: `CREDITOS.md` e `credits.ts` ganharam um item por foto nova. O cache offline tem um grupo novo, `imagens-das-datas`, que só baixa as fotos quando alguém as abre (não entram na instalação do app).
- Testes: gancho, foto e crédito em todo fato; a lei marcial; o compilado do 1º de janeiro; a imagem de compartilhar.
- **Teste da busca** (`e2e/busca-estudo.spec.ts`, “conselho de Niceia”): falhava porque um estudo novo (a síntese de Ferguson, ainda fora do commit) também tem Niceia no título e passou na frente do estudo do Concílio. Os dois estudos ficam; o teste agora confere que “Constantino, Niceia e os Credos” está entre os 5 primeiros resultados e abre esse, em vez de exigir o primeiro lugar. Era a pendência da falha antiga de `busca-estudo`.

**Decisões:**
- O gancho é uma pergunta que a história linkada responde, nunca uma afirmação nova: não inventa fatos.
- Foto ilustrativa em vez de nenhuma foto, como pedido (“pode ser genérica, mas que tenha a ver com o assunto”). Fotos de cidades hoje (e não da época) são usadas só quando não há foto histórica livre; o rótulo avisa.
- As fotos ficam fora da instalação (cache preguiçoso) para o app continuar leve e o Almeida e os estudos funcionarem offline como antes.

**Arquivos:** `src/app/core/anniversaries.ts`, `src/app/core/share-card.ts`, `src/app/shared/share-render.ts`, `src/app/shared/commemorations.ts`, `src/app/pages/dates/dates.ts`, `src/app/core/credits.ts`, `src/app/core/whats-new.ts`, `public/conteudo/imagens/datas-*.jpg`, `ngsw-config.json`, `CREDITOS.md`, `CLAUDE.md`, `TESTES.md`, `e2e/datas.spec.ts`, `e2e/logica/datas.spec.ts`, `DIARIO.md`

**Pendências:**
- Trocar as fotos ilustrativas de hoje por fotos da época quando surgirem em acervos livres (Arquivo Nacional, Biblioteca Nacional).
- Foto de Daniel Berg (não achei uma livre).

## 2026-11-04 14:32 -0400 — Compilado dos fatos que caem no mesmo dia

**Autor:** Valtemir Junior (com Claude Code)

**O que foi feito:**
- Quando vários fatos caem no mesmo dia e mês, eles formam um **compilado do dia**. São 9 dias assim hoje: 1º de janeiro (3 fatos), 18 e 24 de fevereiro, 21 de abril, 22 de junho, 15, 19 e 31 de outubro e **15 de novembro** (São Paulo em 1927 e Madureira em 1929).
- **Tela inicial**: o carrossel passou a ter um cartão por dia. O dia com um fato só continua como estava; o dia com vários mostra “2 fatos nesse dia”, a data e a lista dos fatos (ano e título, com o resumo nas telas largas), cada um levando à sua história, e a foto do primeiro fato que tem uma (com o ano no crédito).
- **`/datas`**: um cartão por dia, com os fatos dentro, separados por um filete, e o botão “Compartilhar o dia” nos dias com vários fatos. Cada fato mantém o seu botão de compartilhar. No celular a data vira uma faixa no alto do cartão.
- **Imagem de compartilhar do dia** (`dayCard`): selo “2 fatos”, a data, o título “O que aconteceu em 15 de novembro” e a lista numerada (“1927: …”, “1929: …”), com o QR code de `/datas`. O título da lista de tópicos da imagem ficou configurável (`topicsLabel`).
- O cartão da biblioteca conta fatos, não dias.
- Testes: lógica (agrupamento, ordem, um cartão por dia em todos os dias do ano, o compilado de 15 de novembro, a imagem do dia) e navegador (tela inicial, imagem e `/datas`). `CLAUDE.md`, `TESTES.md` e a novidade do app atualizados.

**Decisões:**
- O compilado vale por dia e mês, sem importar o ano: é o que o calendário de datas mostra a cada ano.
- A imagem do dia leva ao QR code de `/datas` (a lista de todas as datas), porque o dia tem várias histórias. A imagem de um fato só continua levando à sua história.
- O texto de cada fato, o crédito da foto e a ordem (do mais antigo ao mais novo) foram mantidos.

**Arquivos:** `src/app/core/anniversaries.ts`, `src/app/core/share-card.ts`, `src/app/shared/share-render.ts`, `src/app/shared/commemorations.ts`, `src/app/pages/dates/dates.ts`, `src/app/pages/history/history.ts`, `src/app/core/whats-new.ts`, `e2e/logica/datas.spec.ts`, `e2e/datas.spec.ts`, `TESTES.md`, `CLAUDE.md`, `DIARIO.md`

**Pendências:**
- Se um dia tiver muitos fatos no futuro (hoje o máximo é 3), vale pensar numa lista mais compacta.

## 2026-11-04 14:25 -0400 — Coreia unida, fotos das datas, cartão na biblioteca e 22 datas novas

**Autor:** Valtemir Junior (com Claude Code)

**O que foi feito:**
- **Estudo da Coreia**: saiu o quadro “Qual Coreia, a do Norte ou a do Sul?”, que repetia a pergunta do pedido. No lugar, cada capítulo abre com o nome da Coreia em negrito: **Coreia unida** (até 1945, sem divisão), **Coreia do Sul** ou **Coreia do Norte**, e o trecho da divisão diz “Coreia do Norte e Coreia do Sul”. A linha do tempo e as datas da Coreia também. Um teste novo (`logica/coreia.spec.ts`) confere que nenhum capítulo fica sem o nome.
- **Página `/datas`**: as fotos ficavam pequenas e soltas embaixo da data. Agora o cartão tem a foto grande ao lado do texto no computador e em faixa no alto no celular, com a linha de crédito (“Foto: …”, que a licença CC BY-SA exige). O botão de compartilhar continua no canto.
- **Biblioteca (`/historia`)**: o livro “Datas da História” só aparecia no fim da página, na estante “O Tempo”. Entrou um cartão no alto, “Datas de novembro”, com a quantidade de fatos do mês, que leva a `/datas`. O livro continua na estante.
- **Carrossel da tela inicial**: o cartão sem foto, que no computador ficava com uma faixa escura vazia, agora tem um fundo em degradê com o ícone e o ano grande.
- **22 datas novas** (de 68 para 90), todas com a data escrita no estudo ligado: o decreto de Diocleciano (24/2/303), o Natal de 336, Wycliffe (31/12/1384), o Concílio de Constança (5/11/1414), Lutero em Worms (18/4/1521) e a morte dele (18/2/1546), Simonton no Rio (12/8/1859), nascimentos e mortes de Gunnar Vingren, Daniel Berg e Frida Vingren (com o Dia Nacional da Música Gospel, em 9 de junho), a primeira igreja batista em português (15/10/1882), as igrejas de Maranhão e Rondônia (1922), os missionários mortos no Equador (8/1/1956), a primeira missa de Brasília e a chegada dos primeiros irmãos ao Distrito Federal (1957), a catedral metodista pentecostal do Chile (1974), o Dia das Igrejas Evangélicas do Chile (31/10/2005) e a morte de Macalão (26/8/1982). Fotos só as que o app já tinha, com o crédito dos arquivos já listados em `CREDITOS.md`.
- **Reforma**: o estudo `reforma-protestante` ganhou o dia (resposta de Lutero em Worms, em 18 de abril de 1521, e a morte dele em 18 de fevereiro de 1546), conferido em fontes públicas, e as fontes do estudo foram atualizadas.
- Cada mês agora tem de 4 a 10 fatos no carrossel (o limite do teste passou de 8 para 12).

**Decisões:**
- Nenhuma data entrou sem estar escrita no estudo ligado (ou sem eu ter confirmado o dia e escrito no estudo antes): o dia de Lutero em Worms é o da resposta (18/4); a primeira audiência foi no dia anterior, segundo parte das fontes, e isso ficou nas fontes.
- Não repeti fatos que o calendário já tinha (o calendário gregoriano de 24/2/1582, o templo de Bangu, que o texto de Macalão já conta).
- As datas do estudo de Atos dos Apóstolos, do Concílio de Niceia e do estatuto da CGADB ficaram de fora: as primeiras são hipotéticas, e o estatuto é jurídico.
- Datas de estados da Assembleia de Deus sem dia nas páginas (Acre, Tocantins, Espírito Santo, Mato Grosso do Sul) não entraram.

**Arquivos:** `public/conteudo/artigos/avivamento-da-coreia.md`, `public/conteudo/artigos/reforma-protestante.md`, `src/app/core/anniversaries.ts`, `src/app/core/library.ts`, `src/app/core/sources.ts`, `src/app/core/whats-new.ts`, `src/app/pages/dates/dates.ts`, `src/app/pages/history/history.ts`, `src/app/shared/commemorations.ts`, `e2e/datas.spec.ts`, `e2e/logica/datas.spec.ts`, `e2e/logica/coreia.spec.ts`, `TESTES.md`, `CLAUDE.md`, `DIARIO.md`

**Pendências:**
- Mais datas dependem de dar o dia nos estudos que só têm o ano (Wesley em Oxford, os avivamentos do País de Gales e das Hébridas, a Confissão de Augsburgo): só entram se o dia for conferido.
- Datas de nascimento e morte de outros personagens do Memorial, se quiser.

## 2026-11-04 14:08 -0400 — Qual Coreia? E as datas só do mês

**Autor:** Valtemir Junior (com Claude Code)

**O que foi feito:**
- **Estudo da Coreia (`avivamento-da-coreia`)**: cada parte passou a dizer de qual Coreia fala. No começo entrou o quadro “Qual Coreia, a do Norte ou a do Sul?”: até 1945 uma só Coreia; hoje, a do Norte (Pyongyang e Wonsan, onde o avivamento aconteceu) e a do Sul (Seul, os golpes de 1961 e 1979, Gwangju, 1987, a lei marcial de 2024). Também ganharam o país: a lista de personagens, Wonsan e Pyongyang (“hoje na Coreia do Norte”), a divisão de 1945, Seul e a igreja Youngnak, o governo de Rhee, o golpe de 1961, a igreja nos anos de Park, o golpe de 1979, a luta de 1987, a lei marcial de 2024, o capítulo dos números e a linha do tempo inteira. O subtítulo da biblioteca e os textos das datas da Coreia (`anniversaries.ts`) também.
- **Datas da História na tela inicial**: o carrossel agora mostra só os fatos do **mês de hoje** e troca sozinho pela lista do mês seguinte quando o mês vira. O fato do dia vem primeiro, depois os que ainda vêm no mês e, por fim, os que já passaram. O título é “Hoje na História” (quando há fato no dia) ou “Datas de novembro”, “Datas de dezembro” e assim por diante. Cada mês tem de 4 a 8 fatos.
- **Testes**: o teste de lógica passou a conferir que, em todos os dias de 2026, só aparecem fatos do mês, o do dia vem primeiro, a ordem está certa e a virada de outubro para novembro troca a lista; o teste do navegador confere “Datas de novembro” e “Datas de dezembro”. `TESTES.md`, `CLAUDE.md` e a novidade do app foram atualizados.

**Decisões:**
- A tela `/datas` continua com o ano inteiro, começando pelo mês de hoje: ela é a biblioteca das datas, e a limitação por mês foi só no carrossel da tela inicial. Se a ideia era limitar também essa página, é uma mudança pequena.
- A lista do mês é calculada quando a tela inicial abre. Quem deixar o app aberto na virada do mês vê a lista nova ao abrir de novo.
- Em vez de mudar os títulos dos capítulos da Coreia (que ficam como estavam), a clareza entrou no quadro do começo e nas frases de cada parte.

**Arquivos:** `public/conteudo/artigos/avivamento-da-coreia.md`, `src/app/core/anniversaries.ts`, `src/app/core/library.ts`, `src/app/core/whats-new.ts`, `src/app/shared/commemorations.ts`, `e2e/logica/datas.spec.ts`, `e2e/datas.spec.ts`, `TESTES.md`, `CLAUDE.md`, `DIARIO.md`

**Pendências:**
- Perguntar se a página `/datas` também deve mostrar só o mês.

## 2026-11-04 12:55 -0400 — A Coreia do Norte ao lado da do Sul, Atos 8 e a Bíblia de papel

**Autor:** Valtemir Junior (com Claude Code)

**O que foi feito:**
- **Coreia (`avivamento-da-coreia`)**: saiu a nota “O que não consegui confirmar” do capítulo do golpe de 1961, como pedido. Entrou o capítulo **O Outro Lado da Fronteira: A Coreia do Norte**, com quatro partes: como a família Kim chegou ao poder (os soviéticos em 1945, Kim Il-sung, a sucessão de pai para filho), os expurgos e o que o regime chamou de traição (1956, Jang Song-thaek em 2013, Kim Jong-nam em 2017), a igreja no Norte (Federação Cristã Coreana de 1946, Bongsu, Chilgol, Changchung, a Open Doors) e o paralelo, com a ficha “As Duas Coreias”. A abertura do estudo, a linha do tempo, as fontes, o subtítulo e o tempo de leitura (18 min) foram atualizados.
- **A palavra no coração (`a-palavra-no-coracao`)**: nova seção **Entende o que Lê?** com Atos 8.26-39 (o etíope, a estrada deserta entre Jerusalém e Gaza, Filipe levado pelo anjo e pelo Espírito) e a Bíblia de papel junto com a do aplicativo, e não só a do celular: abertura, primeira seção, regras do fim e fecho também falam da Bíblia de papel; um item novo mostra o erro de impressão da edição inglesa de 1631, que esqueceu o “não” de Êxodo 20.14. A passagem de Gênesis 3 ganhou uma **tabela** “O que Deus disse” e “O que a serpente disse”, com as palavras trocadas em negrito, e Lucas 23.43 ganhou as **duas leituras em destaque**, uma abaixo da outra (a da Almeida e a com a vírgula depois de “hoje”). Agora são 8 tópicos; subtítulo, fontes, novidades e tempo de leitura (14 min) atualizados.

- **Teste das novidades** (`e2e/novidades.spec.ts`): o botão “Entendi” era achado por parte do nome e passou a bater também com o cartão das novidades, cujo texto agora diz “não entendia” (o etíope de Atos 8). O teste passou a procurar o nome exato.

**Decisões:**
- O pedido falava em “golpes de Estado” da família Kim. As fontes não mostram nenhum: o poder foi dado pelos soviéticos e passou de pai para filho, e o que há são expurgos, mortes e acusações de traição feitas pelo próprio regime. O capítulo diz isso com clareza e deixa explícito que os golpes contados antes (1961, 1979) são do Sul. O caso de Jang Song-thaek aparece como a acusação do regime, sem chamá-lo de golpe.
- Números de cristãos presos no Norte vão de 50 mil a quase 200 mil e nenhum se verifica: o texto dá a faixa e avisa. Nada de fotos do Norte por ora.
- Sobre a Bíblia de papel, o texto não coloca o papel acima da tela: o aplicativo serve para buscar e comparar, o papel para anotar e ficar à vista dos filhos, e a Palavra guardada confere os dois. O erro de 1631 mostra que o papel também erra. A multa dos impressores não foi citada, porque as fontes divergem (£300 ou £3.000).
- O texto de Atos não diz “rolo”; está escrito assim, com o aviso de que os livros daquele tempo eram copiados à mão. A frase da Almeida usada nas citações é a do texto do app (“Entendes, porventura, o que estás lendo?”).

**Arquivos:** `public/conteudo/artigos/avivamento-da-coreia.md`, `public/conteudo/artigos/a-palavra-no-coracao.md`, `src/app/core/library.ts`, `src/app/core/sources.ts`, `src/app/core/whats-new.ts`, `e2e/novidades.spec.ts`, `DIARIO.md`

**Pendências:**
- Módulo para as pessoas publicarem sermões e teses (nome, redes sociais e foto): proposta em conversa, ainda sem decisão.
- Fotos para a seção do Norte e para Atos 8 (por exemplo, a pintura de Rembrandt sobre o batismo do eunuco, de domínio público) se o usuário quiser.
- A falha de `busca-estudo.spec.ts` (“conselho de Niceia”), que não é desta mudança, continua.

## 2026-11-04 12:23 -0400 — Fotos como num jornal em todas as páginas e o tom do estudo da Palavra

**Autor:** Valtemir Junior (com Claude Code)

**O que foi feito:**
- **Fotos à esquerda, com o texto em volta, em toda página** (`rich-text.scss`, `rich-text.ts`): no computador a foto flutua à esquerda e o texto corre ao lado dela, nas histórias e nos estudos comuns; a alternância esquerda/direita acabou. Quadros e paisagens (`{larga}`) ficam maiores, mas também ao lado do texto. Títulos, cartões, fichas, linhas do tempo e notas começam abaixo da foto. No celular a foto continua entre os parágrafos.
- **Cada foto antes do parágrafo de que fala**: 11 fotos estavam depois do último parágrafo da seção (sem texto ao lado) e foram movidas: Coreia (nove, uma por capítulo), Coliseu (duas), Catacumbas, A Igreja e o Estado (duas), Madureira, Natal e os calendários (duas). Um teste novo (`logica/imagens-no-texto.spec.ts`) falha se uma foto ficar solta ou se houver mais de duas seguidas; outro (`imagens-jornal.spec.ts`) mede no navegador que a foto está à esquerda e o texto começa ao lado dela.
- **Estudo da Palavra no coração**: a abertura passou a ser exatamente o bloco pedido (as duas frases, “Qual é a verdadeira? Você sabe?”); saíram “Vou ser direto, porque o assunto não aceita rodeio”, “Este estudo vai incomodar”, “Seja honesto”, “Pare de se desculpar” e “Este estudo não tem um Natã”, no lugar de frases impessoais. O tom passou a ser o de um pai que desperta e cuida: Provérbios 3.12 e Hebreus 12.11 na abertura, e Oseias 11.3-4 e Salmo 103.13 no fecho. O conteúdo do resto foi mantido.
- `CLAUDE.md` ganhou as duas regras (foto antes do parágrafo; voz impessoal e de pai, sem anúncios nem pedidos de desculpa).

**Decisões:**
- A foto fica sempre à esquerda, como pedido, em vez de alternar de lado.
- Em vez de reordenar as fotos por código na hora de mostrar, o Markdown foi corrigido e um teste impede o problema de voltar: a posição de cada foto é uma escolha de quem escreve.
- Só tirei os anúncios sobre o próprio texto; as notas honestas sobre fontes (“não consegui confirmar”) ficaram.

**Arquivos:** `src/app/shared/rich-text.scss`, `rich-text.ts`, `public/conteudo/artigos/avivamento-da-coreia.md`, `coliseu-de-roma.md`, `catacumbas-de-roma.md`, `igreja-e-estado.md`, `madureira-e-a-separacao.md`, `natal-e-os-calendarios.md`, `a-palavra-no-coracao.md`, `e2e/logica/imagens-no-texto.spec.ts`, `e2e/imagens-jornal.spec.ts`, `TESTES.md`, `CLAUDE.md`

**Pendências:** conferir no celular de verdade; hoje só o computador tem o texto correndo em volta da foto.

---

## 2026-11-04 10:22 -0400 — Duas frases (uma alterada) na abertura e a Reforma no estudo da Palavra

**Autor:** Valtemir Junior (com Claude Code)

**O que foi feito:**
- A abertura de `a-palavra-no-coracao` agora mostra duas frases de Provérbios 3.5, uma verdadeira e outra com o “não” tirado, e pergunta: “Qual é a verdadeira? Você sabe?”. A resposta vem na seção “E se Trocarem uma Letra, uma Vírgula?”, que explica a troca (três letras mudam a frase para o contrário do que Deus manda).
- Confirmado que as frases “Este estudo não está aqui para humilhar ninguém…” e “Feche os olhos por um minuto…”, da primeira versão, já não estão no texto (saíram na reescrita anterior).
- Seção nova, “Quem Pagou para Você Poder Ler a Bíblia?” (agora o 2º dos sete tópicos): a Bíblia fechada em latim, Valdo, Wycliffe e Hus, a imprensa de Gutenberg, Lutero em Worms e em Wartburg (Novo Testamento em onze semanas, Bíblia completa em 1534), o sacerdócio de todos os crentes, Zuínglio, Tyndale e “o menino que guia o arado”, a Almeida e o Brasil colonial; termina no confronto: “o menino do arado hoje é você”. Cartão para *Lutero e a Reforma Protestante*.

**Decisões:**
- Todos os fatos da Reforma vêm dos estudos do app (Lutero e a Reforma Protestante, A Reforma Inglesa e os Puritanos, Antes de Lutero, Da Vulgata à King James, A Bíblia em Português); a frase de Worms e a de Tyndale são as que os estudos já citam.
- “Os reformadores discordaram entre si em muita coisa, mas todos puseram a Escritura acima de tudo”: dito assim, e não como se tivessem pensado igual.
- O Brasil colonial entra como dois fatos que o estudo da Bíblia em português registra, sem ligá-los por “porque”.

**Arquivos:** `public/conteudo/artigos/a-palavra-no-coracao.md`, `src/app/core/library.ts`, `whats-new.ts`

**Pendências:** as mesmas de antes (erros de digitação da Almeida ainda não conferidos no resto do texto).

---

## 2026-11-04 10:18 -0400 — O estudo da Palavra no coração, reescrito para confrontar e não para testar

**Autor:** Valtemir Junior (com Claude Code)

**O que foi feito:**
- O estudo `a-palavra-no-coracao` foi reescrito depois do esclarecimento do usuário: o objetivo não é testar a pessoa, e sim **confrontá-la de frente**. Saíram a ficha “O Teste dos Dez Textos”, a pontuação por faixas, o convite a se testar e o jogo de perguntas. Entrou um tom direto, com a Escritura apontando para a pessoa: “você tem acesso à Palavra, e ter acesso não é ter a Palavra”.
- Título novo: *A Bíblia Está no Seu Celular, mas Está em Você?* (o endereço não mudou). Tópicos: Você Diz que Crê na Bíblia, mas Quanto Dela Está em Você?; E se Trocarem uma Letra, uma Vírgula?; Isso Já Acontece, ou É Exagero?; O que Fez Jesus Quando o Tentador Citou a Bíblia?; Quem Vai Ensinar o Caminho que Você Não Conhece?; O que Fazer a Partir de Hoje?
- Textos novos que sustentam o confronto, todos conferidos na Almeida do app: Provérbios 27.6 (a ferida do amigo), João 5.39 e Mateus 22.29 (os que estudavam a Escritura e erravam), Tiago 1.22-24 (o espelho), Ezequiel 33.32, Amós 8.11, Jeremias 8.8 (a falsa pena dos escribas), Mateus 15.6-9 e 15.14 (a tradição e o cego que guia cego), Lucas 24.25 e 2 Samuel 12.7 (Natã). O fecho passou a ser Tiago 1.22: “feche a tela, escolha um texto, diga-o em voz alta até saber, e então ensine”.

**Decisões:**
- Direto não é inventar: o estudo continua sem números fabricados e sem afirmar o que não sabe sobre o leitor. A força vem de condicionais verdadeiras (“se trocarem, você não vai perceber; quem não sabe o texto não vê a troca”), de perguntas retóricas e dos próprios textos bíblicos.
- Mantive o contrapeso honesto: a Bíblia em si não foi adulterada e traduções diferentes não são fraude. Ele agora serve também para ninguém se esconder atrás do “exagero”.
- Jeremias 8.8 vem com o aviso de que os estudiosos discutem se fala de cópias alteradas ou de ensino torcido.
- A confrontação termina em saída, como no texto de Lucas 24: Jesus chamou os discípulos de “néscios” e depois lhes abriu as Escrituras. O plano de doze semanas ficou como caminho.

**Arquivos:** `public/conteudo/artigos/a-palavra-no-coracao.md`, `avivamentos-desde-atos.md`, `src/app/core/library.ts`, `whats-new.ts`

**Pendências:** as mesmas da entrada anterior sobre os erros de digitação da Almeida.

---

## 2026-11-04 10:11 -0400 — Estudo “Se Mudassem uma Palavra da Bíblia no Seu Celular, Você Perceberia?” e sete correções na Almeida

**Autor:** Valtemir Junior (com Claude Code)

**O que foi feito:**
- Estudo novo `a-palavra-no-coracao`, a pedido do usuário: um estudo que provoca a pessoa a se testar sobre ler e decorar a Palavra num tempo em que um texto digital muda sem ninguém ver, e que parte da pergunta de Provérbios 22.6 (como ensinar o caminho se nós mesmos o desconhecemos?). Seis tópicos em forma de pergunta: o teste dos dez textos; a troca de uma letra ou de uma vírgula (Gênesis 3, o “i” e o “til”, Lucas 23.43); o que já acontece (ditos populares tidos por versículos, memes, inteligência artificial, erros de digitação nos textos digitais); o que Jesus fez quando o tentador citou a Bíblia (o corte de “em todos os teus caminhos” no Salmo 91); como ensinar o caminho que não sabemos (Deuteronômio 6, Oseias 4, Hebreus 5); por onde começar (plano de doze semanas). Entra na trilha *Reconhecer e Guardar o Avivamento*, na visão geral dos avivamentos, nas fontes e na nota de novidades.
- Sete erros de digitação corrigidos no texto da Almeida do app, pela lista `VERSE_FIXES` de `tools/gerar-almeida.py` e por `tools/corrigir-almeida.py` (não à mão): “Mecedônia” (2 Coríntios 8.1), “O senhor é Deus” (1 Reis 18.39), “a fazer e que era mau” (Juízes 10.6), “eu fiz, um voto” (Juízes 11.35), um “Isso não é” solto no fim de Juízes 11.40, “já lhe fiz: saber” (1 Samuel 3.13) e “A Lei e ao Testemunho! se” (Isaías 8.20). A lista passa a ter 23 correções.
- A rota `/datas` entrou na lista de rotas fixas de `logica/links-internos.spec.ts`, que falhava por causa do link da nota de novidades.

**Decisões:**
- O pedido era “mexer com o brio” e “colocar a dúvida” na cabeça das pessoas. Fiz isso como desafio honesto: perguntas de verdade e um teste que a pessoa faz sozinha, sem número inventado (“só 10% acertam”) e sem humilhar. O texto diz isso logo na abertura.
- O estudo equilibra o alarme: afirma que a Bíblia em si não foi “adulterada” (o texto é muito bem atestado, e o estudo sobre os manuscritos é ligado) e que traduções diferentes não são fraude; o risco é a cópia que se lê sem saber conferir.
- A afirmação sobre erros de digitação é verdadeira e conferida: foram achados lendo versículos para escrever os estudos recentes, e agora estão corrigidos. A frase sobre inteligência artificial é cautelosa (“podem citar um versículo que não existe”), sem acusar nenhum programa.
- Lucas 23.43 é apresentado como exemplo de como a posição de uma vírgula muda o sentido, sem decidir a discussão doutrinária.
- Os ditos “Deus ajuda quem cedo madruga”, “Ajuda-te que Deus te ajudará” e “Deus escreve certo por linhas tortas” entram como ditos populares que não estão na Bíblia.

**Arquivos:** `public/conteudo/artigos/a-palavra-no-coracao.md`, `avivamentos-desde-atos.md`, `src/app/core/library.ts`, `trails.ts`, `sources.ts`, `whats-new.ts`, `tools/gerar-almeida.py`, `public/bible/almeida/` (2CO, 1KI, JDG, 1SA e ISA), `e2e/logica/links-internos.spec.ts`

**Pendências:**
- Outros erros de digitação devem existir no resto do texto da Almeida: só se conferiu uma pequena parte. Uma conferência sistemática (por exemplo, palavras que não existem em português) acharia mais.
- Dois pontos para conferir com calma: “espojavam” em Juízes 2.16 (talvez “despojavam”) e a pontuação de 2 Crônicas 33.22; não mexi, porque não tenho certeza do texto certo.

---

## 2026-11-04 10:00 -0400 — Datas da História: destaques com foto na tela inicial e imagem de comemoração

**Autor:** Valtemir Junior (com Claude Code)

**O que foi feito:**
- Módulo `core/anniversaries.ts` com 68 fatos da história que têm dia e mês nos estudos do app (a chegada de Berg e Vingren a Belém em 19 de novembro de 1910; as 95 teses; Herrnhut; o coração aquecido de Wesley; a Escola Dominical de Kalley; a Rua Fulton; a fundação da Assembleia de Deus em cada estado; os golpes e a lei marcial na Coreia…). Cada fato repete só o que o estudo ligado conta, com o link da história e, quando há, a foto com o crédito.
- Tela inicial: o bloco “Hoje na História” (ou “Datas da História”, quando não há fato no dia) com foto, selo dos anos (“116 anos · Hoje”), data, texto, “Ler a história” e compartilhar. Os destaques passam a cada 9 segundos e param ao tocar, ao passar o mouse, ao usar o teclado ou no botão de pausar; com “reduzir movimento” ligado não passam sozinhos. Mostra de uma semana atrás a um mês à frente, o do dia primeiro, sempre de quatro a oito.
- Página `/datas` (Datas da História): o ano inteiro, mês a mês, a partir do mês de hoje, com o fato do dia marcado, miniatura da foto e botão de compartilhar; entra na biblioteca como um livro em Contexto e Cultura › O Tempo.
- Imagem de comemoração (usa o mesmo painel de compartilhar): selo grande com os anos, data, foto com a linha de crédito, título, texto e o QR code da história.
- 12 fotos novas (retratos e gravuras de Hus, Lutero, Zuínglio, Tyndale, Zinzendorf, Wesley, Edwards, Gardiner, Kalley, Dom Bosco, Seymour e Hoover), todas de domínio público conferido no Wikimedia Commons, com crédito em `credits.ts`, em `CREDITOS.md` e em cada fato; mais as 9 da Coreia, que também entram nos fatos.
- Testes: `logica/datas.spec.ts` e `datas.spec.ts`; `TESTES.md`, `CLAUDE.md` e a nota de novidades atualizados.

**Decisões:**
- Os fatos vêm só de datas que os estudos já dizem; onde o estudo diz “por volta de” (a morte de Gardiner, Roraima), o fato leva `approx` e a data sai com “por volta de”. Datas de fundação por estado seguem “segundo a igreja do estado”, como nas páginas dos estados.
- Foto só quando há de domínio público ou licença aberta; o resto fica sem foto e mostra um ícone no lugar. O crédito aparece sempre junto da foto, na tela e na imagem.
- O texto dos destaques fica sobre uma faixa da cor do assunto, e não sobre a foto, para manter o contraste de 4,5:1.
- A troca automática tem botão de pausar (obrigatório para quem não consegue acompanhar) e some com “reduzir movimento”.
- Datas de nascimento e morte de pessoas ficaram de fora de propósito nesta primeira lista: o foco são fatos da história.

**Arquivos:** `src/app/core/anniversaries.ts`, `share-card.ts`, `library-bays.ts`, `credits.ts`, `whats-new.ts`, `src/app/shared/commemorations.ts`, `share-render.ts`, `src/app/pages/dates/dates.ts`, `home/home.html`, `home/home.ts`, `app.routes.ts`, `app.ts`, `public/conteudo/imagens/` (12 fotos novas), `public/fonts/`, `e2e/logica/datas.spec.ts`, `e2e/datas.spec.ts`, `e2e/navegacao.spec.ts`, `TESTES.md`, `CLAUDE.md`, `CREDITOS.md`

**Pendências:**
- Faltam fotos para muitos fatos (Agnes Ozman, a Rua Fulton, Azusa, Daniel Berg sozinho, os estados): só entram com licença livre.
- Mais fatos: toda data nova de estudo novo pode virar um destaque; vale acrescentar quando um estudo ganhar data com dia e mês.
- Conferir no celular de verdade a troca automática e o compartilhar.

---

## 2026-11-04 09:42 -0400 — Coreia: como a pressão funcionou, destaque do Pew e fotos das pessoas

**Autor:** Valtemir Junior (com Claude Code)

**O que foi feito:**
- O capítulo dos santuários xintoístas deixou de dizer só que as igrejas “foram forçadas a ceder” e passou a mostrar como: uma ficha “Como a Pressão Funcionou” (o argumento do governo, as escolas e o seminário, a assembleia de 1938, as prisões, o culto virando cerimônia, o que mais mudou, os missionários e o fim das igrejas livres em 1945) e um parágrafo sobre Chu Ki-chol (quatro prisões, a morte em 1944, a causa registrada).
- O trecho do Pew sobre os cristãos no poder virou a ficha “Os Cristãos e o Poder (1945–1953)”, com os números em negrito (35 de 50 em 1945, 38 de 190 em 1948, a guerra, a reeleição de Rhee) e o que não foi achado.
- Fotos de nove pessoas e lugares, todas de domínio público ou de licença aberta, conferidas na página de cada arquivo do Wikimedia Commons: Kil Sun-ju, Chu Ki-chol, Syngman Rhee (1948), Park Chung-hee (1963), Park e Kennedy na Casa Branca (14 de novembro de 1961), Chun Doo-hwan, o antigo prédio do governo de Jeolla do Sul em Gwangju, a multidão da despedida de Lee Han-yeol (9 de julho de 1987) e a assinatura do impeachment de Yoon (14 de dezembro de 2024). Quatro delas também aparecem nos cartões dos personagens do alto da página. Créditos em `credits.ts`, em `CREDITOS.md` e na legenda de cada foto.
- Uma frase nova no capítulo de Gwangju (em 21 de maio o exército atirou contra a multidão diante do prédio do governo da província) e outra no de 1961 (os Estados Unidos reconheceram o governo em 27 de julho; Park foi a Washington em 14 de novembro), para as fotos terem de que falar.

**Decisões:**
- Nas fontes que li, o local da Assembleia de 1938 (Pyongyang) e a pressão da polícia aparecem só numa; as outras dizem apenas que as autoridades japonesas forçaram a assembleia. O texto diz exatamente isso, em vez de afirmar o local e a polícia como fatos.
- Sem totais de presos, de igrejas fechadas e de mortos nas prisões: as páginas não dão, e o texto avisa. O trecho de Timothy Lee sobre o ritual obrigatório e o fim das igrejas livres vem de uma citação no blog Far Outliers; o livro não foi lido, e a fonte diz isso. A data de 1945 diverge (25 de junho em Lee, 1º de agosto na Wikipédia), e o texto guarda as duas.
- Sem foto de Robert Hardie (nenhuma livre achada) nem de Han Kyung-chik: a única foto livre dele mostra dois homens, e a legenda do Commons não diz quem é quem. Os dois ficam com as iniciais.
- A licença KOGL Tipo 1 (governo coreano) permite uso e adaptação com crédito, e entrou como licença aberta; está dita nas legendas e nos créditos.
- O capítulo “A Igreja durante a Ditadura” ficou sem foto: não achei imagem livre de Yonggi Cho nem da cruzada de Billy Graham.

**Arquivos:** `public/conteudo/artigos/avivamento-da-coreia.md`, `public/conteudo/imagens/coreia-*.jpg` (9 fotos), `src/app/core/credits.ts`, `sources.ts`, `CREDITOS.md`

**Pendências:**
- Foto de Han Kyung-chik e de Hardie, se aparecer uma com licença livre.
- Conferir, nas fontes primárias (Lee, Kim 2002), o que o estudo diz sobre o ritual e as datas de 1945.

---

## 2026-11-04 09:03 -0400 — Compartilhar uma imagem no WhatsApp e no Instagram

**Autor:** Valtemir Junior (com Claude Code)

**O que foi feito:**
- Botão **Compartilhar** em 12 tipos de página: estudo, personagem do memorial, profecia, tribo, estado da Assembleia de Deus, verbete do dicionário, hino da Harpa, época, sermão histórico, curiosidade, mapa e o assunto da biblioteca (`/historia?trilha=`). O botão abre um painel com a imagem pronta (assunto, título, subtítulo, tópicos numerados com até dois subtópicos, o nome Bíblia Sagrada, o endereço e um QR code que abre a própria página) em dois tamanhos: Feed e WhatsApp (1080×1350) e Stories (1080×1920).
- No painel: “Compartilhar imagem” (menu do aparelho, com WhatsApp e Instagram), “Baixar a imagem”, “Enviar o link no WhatsApp” e “Copiar o link”. Sem menu de compartilhar, a imagem é salva.
- Código novo: `core/share-card.ts` (modelo puro de cada página), `shared/share-render.ts` (desenho no canvas), `shared/share-sheet.ts` (painel), `shared/share-image-button.ts` (botão) e `Sheets.shareImage`. O QR code vem do `qrcode-generator` (MIT), carregado só na hora de compartilhar; entra nos créditos.
- O compartilhar de texto do estudo e o da curiosidade foram trocados pelo painel novo; o de sermão do usuário, anotação, devocional e versículo continua como era.
- Ícones novos (`download`, `chat`): `tools/baixar-fontes.py` gerou o arquivo de ícones de novo.
- Testes: `logica/compartilhar.spec.ts` (cartões de todas as páginas, endereço, contraste) e `compartilhar.spec.ts` (12 tipos de página, QR code, Stories, menu do aparelho, baixar, copiar, WhatsApp, tamanho dos botões e das letras). `TESTES.md`, `CLAUDE.md` e a nota de novidades foram atualizados.

**Decisões:**
- Imagem desenhada no próprio aparelho (canvas), sem servidor: funciona sem internet e não manda nada para fora. O endereço da imagem é sempre o do site publicado, mesmo quando se testa em `localhost`.
- Instagram não tem endereço para postar de uma página da web; o caminho é o menu de compartilhar do aparelho (que lista o Instagram) ou baixar a imagem. Por isso o painel diz isso numa frase.
- O QR code leva à página exata, e o endereço escrito é o do site, para quem quiser procurar na internet. A imagem só leva títulos e tópicos, nunca texto de obra com direitos autorais.
- A curiosidade não revela a resposta na imagem, só a pergunta e “a resposta está no app”, para dar vontade de abrir.
- Estudos com muitos tópicos mostram os que cabem e dizem “+ N tópicos no app”; se não couberem quatro com subtópicos, a imagem mostra mais tópicos sem eles.
- Ficaram de fora, por enquanto: página de livro da Bíblia (`/livro/:book`), aulas do IBUC e da EBD (material do professor) e a tela inicial.

**Arquivos:** `src/app/core/share-card.ts`, `src/app/shared/share-render.ts`, `share-sheet.ts`, `share-image-button.ts`, `sheets.ts`, `study.scss`, as páginas `article`, `person`, `prophecy`, `tribe`, `ad-state`, `dictionary-entry`, `hymn`, `epoch`, `classic-sermon`, `curiosity`, `map` e `history`, `credits.ts`, `whats-new.ts`, `public/fonts/`, `package.json`, `package-lock.json`, `e2e/compartilhar.spec.ts`, `e2e/logica/compartilhar.spec.ts`, `TESTES.md`, `CLAUDE.md`, `CREDITOS.md`.

**Pendências:**
- Botão na página de livro da Bíblia e talvez na tela inicial.
- Imagem para versículo (o painel de versículo já compartilha o texto) e para anotações próprias: precisam de decisão sobre direitos de cada versão da Bíblia na imagem.
- Conferir no celular de verdade (WhatsApp e Instagram), porque o menu de compartilhar de arquivos depende do aparelho e do navegador.

---

## 2026-11-04 08:16 -0400 — A história da Coreia num estudo só

**Autor:** Valtemir Junior (com Claude Code)

**O que foi feito:**
- O estudo *A Igreja Coreana Depois do Avivamento* foi incorporado ao *O Grande Avivamento da Coreia* (`avivamento-da-coreia`), a pedido do usuário: uma página só conta o avivamento de 1903–1910 e, em seguida, 1919, os santuários xintoístas, a divisão e a guerra, o golpe de 1961, a igreja durante a ditadura, o golpe de 1979 e Gwangju, 1987, a lei marcial de 2024 e a pergunta sobre o crescimento. A linha do tempo e o “Para a Vida” foram unidos, e os personagens passaram a seis.
- Saíram da biblioteca, da trilha, das fontes, da nota de novidades e da visão geral dos avivamentos a entrada e o cartão do estudo que deixou de existir (`igreja-coreana-depois-do-avivamento`); o cartão da visão geral para o estudo da Coreia ganhou uma frase que diz que ele vai até hoje.

**Decisões:**
- Os títulos dos capítulos novos viraram afirmações (“1919: Os Cristãos e a Independência”, “A Igreja durante a Ditadura”), no estilo do que o estudo já tinha, e não perguntas: este estudo não usa tópicos na capa, e misturar os dois estilos ficaria estranho.
- O título e o endereço do estudo da Coreia não mudaram, para não quebrar nenhum cartão que aponta para ele; o subtítulo, o período (1903–hoje) e a duração (15 minutos) refletem o texto inteiro.
- O capítulo de 1919 parte da anexação de 1910 que o estudo já contou, sem repeti-la.
- O fim do avivamento passou a se chamar “O Fim do Avivamento”, porque o capítulo agora fica no meio do estudo.

**Arquivos:** `public/conteudo/artigos/avivamento-da-coreia.md`, `avivamentos-desde-atos.md`, `src/app/core/library.ts`, `trails.ts`, `sources.ts`, `whats-new.ts`; apagado: `igreja-coreana-depois-do-avivamento.md` (ainda sem commit).

**Pendências:**
- As mesmas da entrada anterior sobre a Coreia: faltam fontes mais fortes sobre a reação das igrejas ao golpe de 1961 e sobre quantos protestantes apoiaram cada lado em 2024; o público real do Explo ’74 não foi achado.

---

## 2026-11-04 08:13 -0400 — Três estudos viram um: a geração que esquece, a casa e a igreja

**Autor:** Valtemir Junior (com Claude Code)

**O que foi feito:**
- Os estudos *A Geração que Não Conheceu o Senhor*, *O Culto no Lar e a Fé que Passa aos Filhos* e *Você Conhece a História e as Regras da Sua Igreja?* foram reunidos numa página só, a pedido do usuário. O estudo fica com o endereço e o título do primeiro (`a-geracao-que-nao-conheceu-o-senhor`), em três partes e 14 tópicos: o padrão (tópicos 1 a 6), a casa (7 a 11) e a igreja (12 a 14).
- Saíram da biblioteca, da trilha, das fontes, da nota de novidades e da visão geral dos avivamentos as entradas e os cartões dos dois estudos que deixaram de existir (`culto-no-lar` e `conhece-a-sua-igreja`); a trilha *Reconhecer e Guardar o Avivamento* agora tem dois estudos.

**Decisões:**
- Reunir cortando a repetição, e não só colando: as passagens que apareciam em mais de um dos três (Deuteronômio 6.20, a Páscoa e as pedras do Jordão, Timóteo e a mãe e a avó, Malaquias 4.6, Juízes 2.10 e a Lei achada por Josias) ficam com o texto completo uma vez só, e as outras partes remetem a elas (“como vimos”). Os dois “Para a Vida” e as duas aberturas viraram uma abertura que explica as três partes e um fecho só.
- O pai e a mãe ficaram no mesmo tópico, em dois subtítulos, e o que era “quem não conhece a própria história” e “de onde vêm as regras” e “como uma regra muda” virou subtítulo dentro de tópicos maiores, para a lista não passar de 14 tópicos.
- Mantive o endereço do primeiro estudo para não quebrar os cartões que já apontavam para ele (estudo dos avivamentos na Bíblia, as marcas de um avivamento e a visão geral).
- Os cartões de leitura de outros estudos (Pentecostes no Brasil, Harpa Cristã, Irmãos Perseguidos, Assembleia de Deus no Brasil, o nome, o estatuto da CGADB e as convenções) continuam, cada um uma vez.

**Arquivos:** `public/conteudo/artigos/a-geracao-que-nao-conheceu-o-senhor.md`, `avivamentos-desde-atos.md`, `marcas-de-um-avivamento.md`, `avivamentos-na-biblia.md`, `src/app/core/library.ts`, `trails.ts`, `sources.ts`, `whats-new.ts`; apagados: `culto-no-lar.md` e `conhece-a-sua-igreja.md` (ainda sem commit).

**Pendências:**
- A entrada anterior, de hoje, ainda fala em seis estudos novos; os três que foram reunidos contam como um. O texto não foi editado, porque as duas entradas vão no mesmo commit.

---

## 2026-11-04 08:06 -0400 — Avivamentos na Bíblia, marcas de um avivamento, a geração que esquece, o culto no lar, a igreja que se conhece e a Coreia depois de 1907

**Autor:** Valtemir Junior (com Claude Code)

**O que foi feito:**
- Seis estudos novos, na trilha Pentecostalismo e Avivamentos: *Os Avivamentos na Bíblia* (de Jacó em Betel e dos reis de Judá a Neemias, Nínive, Atos e a Macedônia, com fichas de Asa, Ezequias, Josias, Neemias e da Macedônia), *As Marcas de um Avivamento* (dez marcas tiradas dos estudos do app, os cinco sinais de Edwards de 1741, o que atrapalha e o que fica), *A Geração que Não Conheceu o Senhor* (Juízes 2, Jefté, os reis, Éfeso e Sardes, o pacto pela metade, Wesley em 1786, e as cinco práticas bíblicas para passar a fé), *O Culto no Lar e a Fé que Passa aos Filhos* (o pai, a mãe, um culto de vinte minutos, o filho que se afastou), *Você Conhece a História e as Regras da Sua Igreja?* (quatro camadas: Bíblia, doutrina, ordem e costume; sete perguntas) e *A Igreja Coreana Depois do Avivamento* (1919, os santuários xintoístas, divisão e guerra, os golpes de 1961 e de 1979, Gwangju, 1987 e a lei marcial de 2024).
- Trilha: dois ramos novos (*Os Avivamentos na Bíblia* e *Reconhecer e Guardar o Avivamento*) e o estudo da Coreia logo depois do avivamento de 1907. A visão geral dos avivamentos ganhou a seção “Antes de Atos”, a seção “Guardar o Fogo” e os cartões dos novos estudos; o estudo do avivamento da Coreia aponta para o novo.
- Fontes de cada estudo, nota de novidades e uma obra nova no catálogo (Pew, 2006, sobre a Coreia).

**Decisões:**
- O pedido sobre a Coreia dizia “o golpe de estado”. Contei os três que as fontes registram (1961, dezembro de 1979 e a tentativa de 2024), cada um com o que a igreja fez e o que não achei. Não achei fonte sobre como as igrejas reagiram ao golpe de 1961, e o estudo diz isso em vez de preencher o espaço.
- Cada fato de igreja, de número ou de data veio de uma página lida ou de resultado de busca citado; onde as fontes divergem (15 ou 16 cristãos entre os 33 signatários de 1919; as sentenças de Yoon em janeiro de 2026; o total de mortos em Gwangju), o estudo guarda as duas versões. Nenhum pastor foi nomeado como apoiador do golpe de 2024, porque as páginas lidas não nomeiam; o estudo só atribui ao resumo de Gasser (2025) a conclusão de que grupos protestantes conservadores o receberam bem.
- A palavra “avivamento” na Macedônia vem com aviso: o texto bíblico não usa a palavra, e o estudo diz o que a Macedônia mostra (casas, estudo da Palavra, generosidade na pobreza).
- Sobre Jefté, o estudo não decide o que o voto significou (os intérpretes divergem) e lembra que Hebreus 11 o lista entre os que tiveram fé.
- Os três estudos de família e igreja usam a Assembleia de Deus só como exemplo, e afirmam sobre ela apenas o que os estudos do app já registram. Nada sobre usos e costumes foi acrescentado sem fonte.
- Susanna Wesley: as fontes divergem em quantos filhos (17 a 19) e em quantas pessoas vinham à cozinha; o estudo guarda o essencial e avisa que os números variam.
- Todos os estudos novos são da coleção Avivamentos, para entrar na visão geral e na trilha sem exceção nos testes.

**Arquivos:** `public/conteudo/artigos/avivamentos-na-biblia.md`, `marcas-de-um-avivamento.md`, `a-geracao-que-nao-conheceu-o-senhor.md`, `culto-no-lar.md`, `conhece-a-sua-igreja.md`, `igreja-coreana-depois-do-avivamento.md`, `avivamentos-desde-atos.md`, `avivamento-da-coreia.md`, `src/app/core/library.ts`, `trails.ts`, `sources.ts`, `whats-new.ts`

**Pendências:**
- Faltam fontes mais fortes sobre a reação das igrejas coreanas ao golpe de 1961 e sobre quantos protestantes apoiaram cada lado em 2024 (o resumo de Gasser, de 2025, só foi lido na página do resumo; o texto completo está no repositório do Graduate Institute).
- O número real de pessoas no Explo ’74 não foi encontrado; o estudo cita só a expectativa.
- Um estudo à parte sobre o que foi proibido, depois tolerado e depois proibido de novo (item 3 do pedido anterior) continua esperando a escolha do usuário entre o estudo histórico e a tese com conclusão definida.
- Quando a lista de arquivos novos for para um commit, conferir que os estudos de Miller e de Ferguson, que já estavam no mesmo diretório sem commit, entram ou ficam de fora de propósito.

---

## 2026-11-04 08:10 -0400 — A exclusão de Belém contada num só lugar, dentro do artigo da Assembleia de Deus

**Autor:** Valtemir Junior (com Claude Code)

**O que foi feito:**
- A história da igreja batista de Belém e da exclusão de 1911 estava repetida em quatro textos. Agora ela é contada por inteiro em um só lugar: a seção "A Origem em Belém: Os Batistas e a Exclusão de 1911", dentro de `assembleia-de-deus-no-brasil`. Ela traz de onde vieram os batistas, no que acreditavam, como a igreja de Belém nasceu (Erik Nelson, 5 de fevereiro de 1897), por que Vingren e Berg foram bem recebidos, os sete meses, a exclusão de 13 de junho, o que veio depois e onde as fontes divergem.
- `pentecostes-no-brasil`, `daniel-berg-e-gunnar-vingren` e `ad-estados/pa.md` guardam só um resumo curto e o cartão que leva ao artigo principal.
- Num primeiro momento tinha sido criado um estudo separado; ele foi desfeito a pedido do dono do app (queria tudo num só lugar), junto com o registro em `library.ts`, `trails.ts`, `sources.ts` e no panorama. As fontes consultadas passaram para `ARTICLE_SOURCES` do artigo principal.
- A lista "Ano a Ano, Estado por Estado" segue em ordem de ano, e as datas conferem com `AD_STATES` e as páginas de estado: Alagoas 1915 (era 1914), Maranhão 1920–1922 (era 1920–1921), Tocantins c. 1948 (era 1952), "Manoel Francisco do Bu" (era "Dubu"). A tabela de casamentos e a linha do tempo também ficaram em ordem de ano. "Missão da Fé Apostólica" ficou igual em todos os textos, e Berg e Vingren receberam o Espírito nos Estados Unidos em 1909 (e não os dois em Chicago).

**Decisões:**
- Tudo na seção do artigo principal, em vez de um estudo à parte, por pedido do dono do app. O artigo ficou maior (cerca de 4.800 palavras, 26 minutos).
- O texto atribui cada ponto contestado ao relato que o traz (quem conduzia a igreja, quantos foram excluídos, datas) e diz que quase tudo vem do diário de Vingren e das memórias de Berg, do lado dos excluídos.
- Ficou de fora um panfleto batista de 20 mil cópias contra os dois, encontrado só em um site sem fonte confiável.

**Arquivos:** `public/conteudo/artigos/assembleia-de-deus-no-brasil.md`, `pentecostes-no-brasil.md`, `daniel-berg-e-gunnar-vingren.md`, `nome-assembleia-de-deus.md`, `public/conteudo/ad-estados/pa.md`, `src/app/core/library.ts`, `trails.ts`, `sources.ts`, `DIARIO.md`

**Pendências:**
- Ler a seção nova com atenção: as fontes batistas de 1911 são escassas, e os artigos acadêmicos foram lidos por trechos. Se houver o diário de Vingren e as memórias de Berg, conferir a sequência de 2 e 13 de junho e os nomes de Nelson e Nobre.
- Nada foi commitado nem publicado.

---

## 2026-11-03 19:54 -0400 — Dois livros de história da igreja, lidos por inteiro e sintetizados em 20 partes

**Autor:** Valtemir Junior (com Claude Code)

**O que foi feito:**
- Os dois livros da pasta `Livros/` (ignorada pelo git) foram lidos do começo ao fim: *A História da Igreja*, de Andrew Miller (tradução de 2022, 783 páginas, 32 capítulos), e *História da Igreja*, volume 1, de Everett Ferguson (Central Gospel, 2017, 639 páginas, 24 capítulos).
- Cada livro virou uma série de 10 partes em `public/conteudo/artigos/`: `historia-da-igreja-andrew-miller` (Parte 1, caps. 1 e 2) e `miller-*` (Partes 2 a 10, caps. 3 a 32); `historia-da-igreja-everett-ferguson` (Parte 1, caps. 1 a 3) e `ferguson-*` (Partes 2 a 10, caps. 4 a 24). Cada parte tem tópicos em forma de pergunta e termina com um cartão `:::leia` para a série do outro livro e uma `:::ficha` que confere pontos concretos entre os dois (datas, números, nomes, o que um traz e o outro não).
- Cada parte entrou em `library.ts` (coleção `igreja`), no ramo "Livros de História da Igreja" de `trails.ts`, em `ARTICLE_SOURCES` (`sources.ts`, rótulo "Partes lidas") e como cartão no fim de `panorama-da-igreja.md`. `credits.ts` e `CREDITOS.md` registram as duas obras.
- O texto da Parte 1 do Miller dizia que os capítulos 3 a 32 só eram conhecidos pelo sumário; foi corrigido, e a Parte 1 do Ferguson deixou de chamar seus três capítulos de "primeiro terço".
- O item de novidades `historia-da-igreja-miller` (`whats-new.ts`) passou a falar dos dois livros completos, com dois itens.
- Testes lógicos: 131 passaram depois de cada parte.

**Decisões:**
- Miller (CC BY-NC-SA 4.0) e Ferguson (todos os direitos reservados) foram sintetizados do mesmo jeito: palavras próprias, organizadas por assunto, sem trechos copiados; do Ferguson só entram poucas palavras entre aspas. Onde Miller interpreta, o texto diz "segundo Miller".
- A conferência entre os livros diz o que cada um afirma e o que ficou sem checagem ("não conferi"), em vez de decidir quem tem razão. Divergências reais ficaram à mostra: os albigenses (cátaros dualistas, para Ferguson; essencialmente iguais aos valdenses, para Miller), a data de morte de Becket (1170 e 1171), Valdo, a origem da Inquisição, a morte de Celestino V, a data de Avignon, Clóvis (496 ou 498) e outras.
- Os capítulos 31 e 32 do Miller (Hus, Gutenberg e os últimos precursores) e parte do 30 (Wycliffe) saem do alcance do volume 1 do Ferguson, que termina por volta de 1300; esses trechos dizem expressamente que não têm segunda fonte.
- A série do Ferguson ficou em 10 partes, e não em 8 como se pensou no início, porque os capítulos 21 a 24 pediam três módulos de tamanho semelhante aos outros.
- O item de novidades manteve o `id` `historia-da-igreja-miller` porque ainda não foi publicado; foi editado no lugar, sem criar outra versão.
- Ficou de fora das sínteses: as páginas finais do Ferguson (cronologia e bibliografia) e as notas e ilustrações dos dois livros.

**Arquivos:** `public/conteudo/artigos/historia-da-igreja-andrew-miller.md`, `miller-*.md` (9), `historia-da-igreja-everett-ferguson.md`, `ferguson-*.md` (9), `panorama-da-igreja.md`, `src/app/core/library.ts`, `trails.ts`, `sources.ts`, `credits.ts`, `whats-new.ts`, `CREDITOS.md`, `DIARIO.md`

**Pendências:**
- Nada foi commitado nem publicado: o dono do app vai ler as 20 partes antes (leitura crítica de fatos e de direitos autorais).
- `npm run lint` (sem problemas), `npx ng build` (sem erros) e os 131 testes lógicos passaram no fim desta sessão; falta só rodar de novo antes do commit, se algo mudar depois da leitura.
- Seguem as pendências da entrada anterior: gravar a amostra da voz Brian com a chave `ELEVENLABS_API_KEY`, conferir as condições do plano grátis da ElevenLabs e gerar os áudios (nenhum foi gravado).

## 2026-11-03 16:41 -0400 — Áudio das histórias: revezar vozes e provedores dentro da franquia grátis

**Autor:** Valtemir Junior (com Claude Code)

**O que foi feito:**
- O servidor MCP da ElevenLabs foi autenticado na sessão e testamos vozes em português do Brasil com o Salmo 23.1-2 (Almeida): George, Sarah e Brian (vozes "premade", liberadas no plano grátis) e Mayla (biblioteca, pt-BR nativa). A escolhida foi a **Brian** (`nPczCjzI2devNBz1zQrb`). O teste com a Leonardo falhou porque as gerações grátis estavam ocupadas (nada foi cobrado). Os testes gastaram 448 créditos.
- `tools/gerar-audio.mjs` ganhou `--completar` (só gera o que não tem áudio de nenhuma voz ou cujo texto mudou, sem regravar o que outro provedor já fez), `--cota N` (grava até N caracteres e deixa o resto para a próxima rodada) e `--nome-voz` (nome mostrado no player). Cada história passa a guardar `text` (resumo só do texto) e `voice` no `public/audio/index.json`.
- O app mostra a voz da história que está tocando: `AudioEntry` ganhou `text?` e `voice?` (`core/audio-text.ts`) e `ListenService.recording` usa `entry.voice` antes de `index.voice` (`core/listen.service.ts`).
- `tools/LEIA-ME.md` documenta o revezamento, com exemplos para ElevenLabs e Azure.

**Decisões:**
- `--completar` é uma flag, não o padrão: sem ela, trocar de voz continua regravando tudo, como o LEIA-ME já dizia. Assim nada muda para quem usa só um provedor.
- Guardar `text` separado de `source`: `source` inclui provedor e voz (era a causa de a ferramenta regravar tudo ao trocar de provedor); `text` só muda quando o texto muda. Campos novos são opcionais, então um `index.json` antigo continua valendo.
- `--cota` pega as histórias em ordem e pula as que passariam da cota, em vez de abortar como o `--limite`. O `--limite` ficou como estava.
- Ficou de fora: ler o saldo de créditos da ElevenLabs pela API (a cota é informada à mão) e escolher o provedor automaticamente por saldo.

**Arquivos:** `tools/gerar-audio.mjs`, `tools/LEIA-ME.md`, `src/app/core/audio-text.ts`, `src/app/core/listen.service.ts`, `DIARIO.md`

**Pendências:**
- Gravar a amostra com a Brian pela API (`--amostra`) quando a `ELEVENLABS_API_KEY` estiver no terminal, e confirmar que a chave gratuita aceita a voz.
- Ouvir a Brian e decidir se o sotaque (voz em inglês falando português) serve; alternativas: Mayla ou Leonardo (pt-BR nativas, da biblioteca, que podem exigir plano pago na API).
- Conferir os termos do plano grátis da ElevenLabs (atribuição, uso comercial) antes de publicar áudios; se pedirem crédito, incluir em `core/credits.ts` e no `CREDITOS.md`.
- Nenhuma história foi gravada ainda: `public/audio/index.json` continua vazio.

---

## 2026-11-03 21:00 -0400 — Livros na tela inicial e voz da ElevenLabs na ferramenta de áudio

**Autor:** Valtemir Junior (com Claude Code)

**O que foi feito:**
- As bolinhas de assuntos (tela inicial e seletor dentro de um assunto) viraram **livros em pé**, com a cor de cada assunto (`Trail.tone`), como na biblioteca. O componente `shared/story-rings.ts` virou `shared/story-books.ts`. Os destinos não mudaram (cada livro abre o assunto em `/historia?trilha=`).
- `tools/gerar-audio.mjs` ganhou a **ElevenLabs** como segunda voz (`--provedor elevenlabs`, `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`), mantendo o Azure como padrão. Também: `--amostra` (grava só o começo de uma história em `tools/amostra-*.mp3` para escolher a voz), `--velocidade`, `--modelo`, estimativa de créditos no `--dry-run`, contexto do parágrafo anterior e seguinte para a entonação, pausa entre trechos, nova tentativa em erro 429/5xx e mensagens claras para chave inválida e créditos esgotados.
- A duração de cada trecho passou a ser medida no próprio MP3 (soma dos quadros), em vez de supor taxa de bits fixa; o destaque do parágrafo no app depende desses tempos.

**Decisões:**
- Não foi gerado nenhum áudio e nenhuma chave foi usada: a ferramenta foi testada contra um servidor falso que imita a API (pedido, cabeçalhos, cache, tempos); o teste com a ElevenLabs de verdade depende da chave e do ID de voz do usuário.
- Os termos do plano da ElevenLabs (uso comercial, atribuição) precisam ser conferidos antes de publicar áudios feitos com ela; está no LEIA-ME. O app continua gratuito.
- A tela inicial manteve o destino antigo dos livros (lista do assunto); levá-los à estante da biblioteca fica como opção.

**Arquivos:** `src/app/shared/story-books.ts`, `pages/home/*`, `pages/history/history.ts`, `tools/gerar-audio.mjs`, `tools/LEIA-ME.md`, `.gitignore`, `CLAUDE.md`, `DIARIO.md`

**Pendências:**
- Usuário: escolher a voz em pt-BR na ElevenLabs, criar a chave e rodar `--amostra`; depois gerar os áudios aos poucos.
- Nada publicado; continua na branch `dev-fim-dos-tempos`.

## 2026-11-03 20:10 -0400 — A Igreja e os avivamentos na América do Sul; dicionários como livros

**Autor:** Valtemir Junior (com Claude Code)

**O que foi feito:**
- Dois estudos novos: `igreja-na-america-do-sul` (coleção Igreja: Las Casas, as reduções jesuíticas e a Inquisição de Lima, James Thomson e as escolas, Allen Gardiner e Thomas Bridges na Terra do Fogo, os galeses na Patagônia, a Bolívia tardia, a Colômbia na Violencia, números de hoje) e `avivamentos-na-america-do-sul` (coleção Avivamentos: Valparaíso 1909, Tommy Hicks 1954, o Avivamento Argentino dos anos 1980–1990, a Bolívia, Operation Auca no Equador e o que não se confirmou nos outros países). Entram na trilha "O Evangelho no Brasil" (ramo novo "Os Vizinhos do Brasil") e na de Pentecostalismo, com cartões no panorama da Igreja e em "Os Avivamentos desde Atos".
- Biblioteca: saiu o índice de bolinhas do alto (a pessoa percorre a lista). O dicionário virou livros por idioma (Hebraico, Aramaico, Grego, Latim) e por ordem (A a Z, pela ordem da Bíblia, por assunto, verbos).

**Decisões:**
- Só entrou o que as fontes abertas confirmam; onde divergem (data de fundação da igreja chilena: 1909, 1910, 1902), o texto diz. Onde não achei fonte (estádio e governo na campanha de 1954; avivamentos no Peru, Paraguai, Uruguai, Venezuela, Colômbia e Equador), o texto diz que não confirmou, sem inventar.
- Colômbia: os números de Goff (126 mortos, mais de 60 templos, mais de 200 escolas) vêm de um levantamento evangélico, resumido num livro universitário de 2024, que avisa do rigor limitado; a leitura de Libreros (intolerância política) e as respostas católicas de 1957 entram ao lado, e a nota diz que a causa é ponto de debate.
- Fontes lidas por subagentes de leitura de páginas; o resumo de busca não foi usado como fonte. O livro de Hoover (1948) é citado como fonte principal dos estudos, mas não foi lido.

**Arquivos:** `public/conteudo/artigos/igreja-na-america-do-sul.md`, `avivamentos-na-america-do-sul.md`, `panorama-da-igreja.md`, `avivamentos-desde-atos.md`, `src/app/core/library.ts`, `trails.ts`, `sources.ts`, `library-bays.ts`, `whats-new.ts`, `shared/bookshelf.ts`, `e2e/*.spec.ts`

**Pendências:**
- Faltam fontes sobre avivamentos no Peru, Paraguai, Uruguai, Venezuela, Colômbia e Equador; Brasil e Congregação Cristã na Argentina (Francescon) não entraram.
- Nada publicado; continua na branch `dev-fim-dos-tempos`.

## 2026-11-03 18:10 -0400 — História e Estudo numa tela só, com os mapas na biblioteca

**Autor:** Valtemir Junior (com Claude Code)

**O que foi feito:**
- A aba **Estudo** e a tela **Histórias** viraram uma só, chamada **História** (`/historia`). `/estudo` redireciona para cá (a pesquisa `?q=` vai junto). A tela antiga `pages/study` saiu; o campo de pesquisa virou `shared/study-finder.ts`.
- Na biblioteca entraram quatro estantes novas (`core/library-bays.ts`): **Mapas e Lugares** (um livro por mapa: Antigo Testamento, Novo Testamento, História da Igreja, Atlas), **Personagens e Famílias**, **Contexto e Cultura** e **Palavras e Promessas** (Memorial, tribos, genealogia, livros, curiosidades, quiz, linha do tempo, profecias, sermões, dicionário). Cada ferramenta e cada mapa é um livro; um mapa novo aparece sozinho.
- A aba de baixo agora é "História" (ícone de livros abertos); o texto "Estudo" some da navegação.

**Decisões:**
- O nome é **História**, como o usuário sugeriu, para não haver dois nomes parecidos para a mesma coisa. Foi mantida a chave interna `estudo` da aba e a URL `/estudo/livros`, para não quebrar endereços.
- Os cartões do Estudo (linha do tempo, atlas em destaque) viraram livros nas estantes; o cartão "Ver por época" saiu da biblioteca (a linha do tempo é um livro) e continua dentro de cada assunto.
- As trilhas continuam na frente; as estantes de ferramentas vêm depois, cada item em um só lugar.

**Arquivos:** `src/app/shared/bookshelf.ts`, `shared/study-finder.ts`, `core/library-bays.ts`, `pages/history/history.ts`, `app.routes.ts`, `app.ts`, `whats-new.ts`, `e2e/*.spec.ts`, `CLAUDE.md`, `DIARIO.md`

**Pendências:**
- A página ficou longa (106 livros); se pesar, dá para recolher cada estante.
- Nada publicado; continua na branch `dev-fim-dos-tempos`.

## 2026-11-03 17:05 -0400 — Biblioteca: capas de frente e livro que abre direto

**Autor:** Valtemir Junior (com Claude Code)

**O que foi feito:**
- O título na vertical das lombadas era difícil de ler. A biblioteca agora tem dois modos, com botões no alto: **Capas** (padrão; o livro de frente, com o título na horizontal, 3 por prateleira no celular e 4 no computador) e **Lombadas** (como antes). A escolha fica guardada (`biblia.estante.modo`, entra no backup).
- Tocar num livro **já o abre**: a capa aparece grande no centro, gira e a tela entra na história. Saiu a janelinha com "Abrir o livro" e "Fechar" (a etapa do meio). Com "reduzir movimento", entra direto.

**Decisões:**
- Capas como padrão, porque o pedido era ler o título de imediato; as lombadas ficam a um toque para quem gosta do visual de estante.
- O resumo (subtítulo) que aparecia na janelinha deixou de aparecer na biblioteca; continua na lista (`Ver em lista`) e na capa da história.
- Ícone novo `view_week`: fonte de ícones regenerada.

**Arquivos:** `src/app/shared/bookshelf.ts`, `src/app/pages/history/history.ts`, `e2e/estante.spec.ts`, `public/fonts/*`, `DIARIO.md`

**Pendências:**
- Nada publicado; continua na branch `dev-fim-dos-tempos`.

## 2026-11-03 16:20 -0400 — Biblioteca: tópicos, subtópicos e todos os livros

**Autor:** Valtemir Junior (com Claude Code)

**O que foi feito:**
- A estante de `/historia` deixou de ter só 11 capas: agora tem **todas as histórias** (e os atalhos das trilhas) como lombadas de livro, organizadas em **tópico → subtópico → livros**. Cada assunto é uma estante com a sua cor, cada ramo da trilha é uma prateleira com o título, e os livros ficam em pé nela.
- Lombadas: largura pela duração da leitura, altura e tom por sorteio fixo do id, uma em cada cinco cor de creme, título na vertical, fios dourados, marca de "lida". Atalhos têm contorno tracejado.
- Ao tocar numa lombada abre uma janela (`<dialog>`) com a capa, o título inteiro e o resumo; "Abrir o livro" faz a capa girar e entra na história. Sem animação com "reduzir movimento".
- As bolinhas do alto viraram o índice da biblioteca (levam à estante do assunto). "Ver em lista" mantém a lista antiga de cada trilha (`?trilha=`).
- No computador, duas estantes lado a lado.

**Decisões:**
- Manter a lista antiga por `?trilha=` (é para onde levam a tela inicial, o botão Voltar e muitos testes) e fazer da biblioteca a tela principal de `/historia`.
- Título da lombada cortado em duas linhas; o título inteiro aparece na capa ao tocar.
- Bug corrigido no caminho: o tom das lombadas usava um deslocamento de bits com sinal e algumas ficavam sem cor.

**Arquivos:** `src/app/shared/bookshelf.ts`, `src/app/pages/history/history.ts`, `src/app/core/whats-new.ts`, `e2e/estante.spec.ts`, `CLAUDE.md`, `DIARIO.md`

**Pendências:**
- A página fica longa no celular (muitas prateleiras); se pesar, dá para recolher cada estante.
- Colocar a mesma biblioteca na tela inicial ou em `/estudo`, se o usuário quiser.
- Nada publicado; continua na branch `dev-fim-dos-tempos`.

## 2026-11-03 15:50 -0400 — Estante de livros em Histórias

**Autor:** Valtemir Junior (com Claude Code)

**O que foi feito:**
- `/historia` sem assunto escolhido mostra uma estante de livros (`shared/bookshelf.ts`): um livro por trilha, cada um com a sua cor (`Trail.tone`), capa com fio dourado, ícone, título e contagem de histórias; fita dourada se o assunto foi começado e barra de progresso. Ao tocar, a capa gira como um livro abrindo e a tela entra no assunto, cujo cabeçalho assume a cor do livro e "abre" também.
- Nas telas largas são 6 livros por prateleira; no celular, 3.
- Testes: `e2e/estante.spec.ts` (um livro por assunto, toque abre, movimento reduzido) e `e2e/logica/estante.spec.ts` (cores distintas e contraste de 4,5:1).
- Novidades: entrada `estudos-do-fim-dos-tempos` ampliada (estante, estatuto da CGADB e "Por que se chama Assembleia de Deus?") e renomeada.

**Decisões:**
- A regra antiga (uma só família de cores, sem arco-íris por assunto) continua nas bolinhas da tela inicial e no seletor dentro do assunto; a estante é a exceção, a pedido do usuário. Cores escuras e terrosas, para parecerem uma estante e não um painel colorido; registrado no CLAUDE.md.
- Botão em vez de link para o livro, para a animação rodar antes de navegar. Com "reduzir movimento", entra direto.
- A tela inicial manteve as bolinhas; trocar por estante lá fica para o usuário decidir.

**Arquivos:** `src/app/shared/bookshelf.ts`, `src/app/pages/history/history.ts`, `src/app/core/trails.ts`, `src/app/core/whats-new.ts`, `e2e/estante.spec.ts`, `e2e/logica/estante.spec.ts`, `CLAUDE.md`, `DIARIO.md`

**Pendências:**
- Decidir se a estante também aparece na tela inicial e em `/estudo`.
- Nada publicado; continua na branch `dev-fim-dos-tempos`.

## 2026-11-03 09:25 -0400 — Resoluções, manifesto e edital da CGADB no estudo do estatuto

**Autor:** Valtemir Junior (com Claude Code)

**O que foi feito:**
- O estudo `estatuto-da-cgadb` ganhou duas seções: "O que a Convenção Já Decidiu?" (Resolução 001/2011 sobre divórcio dos ministros, Resolução 001/2019 sobre união estável e o Manifesto contra o Unicismo, de 2023) e "Como É uma Assembleia na Prática?" (edital da 48ª AGO, de 20 a 23 de abril de 2027, com a retificação de 4/8/2026).
- `cargos-na-assembleia-de-deus`: a seção do divórcio passou a citar a Resolução 001/2011 (antes dizia que não havia documento nacional) e a de "como saber a regra" cita as resoluções da CGADB.
- `trindade`: uma frase sobre o manifesto de 2023 no bloco do modalismo; fontes dos três artigos atualizadas.

**Decisões:**
- As resoluções e o edital são PDFs de imagem; li por OCR e conferi os artigos e números. O manifesto veio como texto da página.
- Tudo é apresentado como regra da CGADB e dos ministros a ela ligados; não foi estendido à CONAMAD, à CADB nem a outras convenções, pois não há texto delas.
- O manifesto cita grupos pelo nome; o estudo diz que é o que o documento afirma e não faz juízo próprio sobre eles.
- Ficou de fora o resto do edital (formas de pagamento, dados pessoais), que não ajuda a entender a estrutura.

**Arquivos:** `public/conteudo/artigos/estatuto-da-cgadb.md`, `cargos-na-assembleia-de-deus.md`, `trindade.md`, `src/app/core/library.ts`, `sources.ts`, `DIARIO.md`

**Pendências:**
- Ainda sem o regimento interno da CGADB e sem estatutos de outras convenções.
- Nada publicado; segue na branch `dev-fim-dos-tempos`.

## 2026-11-03 08:47 -0400 — Estudo do estatuto da CGADB

**Autor:** Valtemir Junior (com Claude Code)

**O que foi feito:**
- Novo estudo `estatuto-da-cgadb` (coleção Igreja): o que é a CGADB, quem pode ser membro (art. 5º), órgãos e quóruns, convenções afiliadas, entidades controladas e o que mudou do estatuto de 2023 para o de 2025.
- O estudo `cargos-na-assembleia-de-deus` passou a citar o estatuto oficial (antes dizia que não havia texto oficial) e ganhou um cartão para o novo estudo; o panorama da Igreja também.

**Decisões:**
- Só os dois PDFs oficiais do site da CGADB foram usados. São imagens escaneadas, lidas por reconhecimento de texto (OCR) e conferidas à mão nos trechos principais; o estudo avisa que os números dos artigos devem ser confirmados no PDF.
- O estudo diz claramente o que não foi lido: regimento interno e código de ética da CGADB, estatutos da CONAMAD, da CADB e de outras convenções. Não se generalizou a regra de uma convenção para as demais.
- Não há versões anteriores a 2023 no site, então a comparação cobre só 2023 → 2025.

**Arquivos:** `public/conteudo/artigos/estatuto-da-cgadb.md`, `cargos-na-assembleia-de-deus.md`, `panorama-da-igreja.md`, `src/app/core/library.ts`, `trails.ts`, `sources.ts`, `DIARIO.md`

**Pendências:**
- Obter o regimento interno e os estatutos das outras convenções, se forem publicados.
- Não publicado: continua na branch `dev-fim-dos-tempos`, à espera do pedido do usuário (agora via pull request dev → main).

## 2026-10-29 19:29 -0400 — Branch `dev` para homologação, `main` só produção, e linter

**Autor:** JacksonLuiz99, com Claude Code

**O que foi feito:**
- Criada a branch `dev` a partir da `main`: desenvolvimento e homologação.
- `.github/workflows/testes.yml` (novo): em todo envio para a `dev` e todo pull request para `main`/`dev`, roda lint, testes de lógica e build. Não publica nada.
- `publicar.yml`: roda o lint antes dos testes; o job só roda na `main`, até quando disparado à mão (antes, disparar a partir de outra branch publicaria essa branch).
- Linter: `angular-eslint` 21 (`npm run lint`, `eslint.config.js`), com as regras recomendadas de TypeScript e Angular e as de acessibilidade dos templates. A primeira passada achou 24 problemas, todos resolvidos:
  - import sem uso (`listen.service.ts`), `!` depois de `?.` (`article.ts`), `type` trocado por `interface` (`memorial.ts`, `bible-map.ts`), ternário usado como comando (`page-toc.ts`);
  - saídas com nome de evento do navegador renomeadas: `toggle` → `toggled` (`book-ribbon.ts`) e `close` → `closed` (`photo-viewer.ts`);
  - as etapas do mapa agora abrem também pelo teclado (Enter e espaço);
  - exceções comentadas onde já existe caminho pelo teclado (visualizador de fotos: Esc e botão Fechar; foto do texto: botão Ampliar) e nos versículos do leitor;
  - configuração: `ignoreRestSiblings` (tirar uma chave com `{ x: _, ...resto }`) e os controles do Angular Material contam como campo de `<label>`.
- `CLAUDE.md`, `README.md` (seções "Lint" e "Branches: desenvolvimento e produção"), `TESTES.md` e `PONTOS-FRAGEIS.md` (itens 4 e 8) atualizados.

**Decisões:**
- Só a `main` publica; homologação, por enquanto, é a `dev` com os testes verdes no GitHub Actions. O GitHub Pages tem um site só por repositório, então um endereço separado para ver a `dev` no ar precisaria de outra hospedagem ou de outra solução; fica para decidir.
- Os versículos do leitor continuam sem acesso pelo teclado: tornar cada versículo focável colocaria centenas de paradas de Tab no capítulo. Precisa de um desenho próprio (por exemplo, setas para andar entre versículos); ficou como exceção comentada.
- Lint só em `src/` (o padrão do schematic); os testes em `e2e/` ficam de fora por ora.

**Testes:** lint sem problemas; build sem avisos; `leitor`, `mapas`, `leitura-historia`, `historias-ligadas`, `acessibilidade` e `estudo` nos dois aparelhos: 189 passaram, 3 pulados.

**Arquivos:** `.github/workflows/testes.yml`, `.github/workflows/publicar.yml`, `eslint.config.js`, `angular.json`, `package.json`, `package-lock.json`, os 10 arquivos de `src/app` corrigidos, `CLAUDE.md`, `README.md`, `TESTES.md`, `PONTOS-FRAGEIS.md`

**Pendências:**
- No GitHub (precisa de administrador do repositório): tornar a `dev` a branch padrão e proteger a `main` (só por pull request, com o check **Testes** obrigatório).
- Login do `gh` vencido nesta máquina (`gh auth login`).
- Endereço de homologação para ver a `dev` no ar, se a equipe quiser.
- Acesso pelo teclado aos versículos do leitor.

## 2026-10-29 19:16 -0400 — Dados do usuário protegidos (opção 1, sem servidor)

**Autor:** JacksonLuiz99, com Claude Code

**O que foi feito:**
- `src/app/core/storage.service.ts` (novo): `saveLocal` grava no `localStorage` e conta as falhas em `storageFailures`; `StorageService` pede armazenamento persistente (`navigator.storage.persist()`), mede o espaço usado e diz se os dados estão protegidos.
- 15 pontos de gravação passaram a usar `saveLocal`, em vez de `try/catch` vazio: os serviços de anotações, sermões, EBD, devocional, favoritos, ajustes, progresso das histórias, curiosidades, quiz, avisos, lembretes e backup, além do púlpito, da narração do mapa e do cartão de lembrete.
- `app.ts`: se uma gravação falhar, aparece um aviso (uma vez por visita) com botão para os Ajustes.
- Ajustes › Seus dados: mostra se os dados estão protegidos, quanto espaço ocupam (de cerca de 5 MB), o alerta de falha e o botão "Proteger".
- `backup.service.ts`: `parse()` recusa backup com valor que não seja texto; `restore()` guarda os dados atuais e, se o backup não couber, devolve esses dados e mostra o erro, em vez de deixar o aparelho vazio.
- Novidade `dados-protegidos` no topo de `RELEASES`.
- 3 testes novos em `e2e/dados.spec.ts`: backup danificado, backup que não cabe e aviso de falha ao salvar.
- `CLAUDE.md` e `PONTOS-FRAGEIS.md` (itens 2 e 3 resolvidos) atualizados.

**Decisões:**
- Opção 1 entre as quatro discutidas (local melhorado, Google Drive do usuário, Firebase/Supabase, servidor próprio): resolve as perdas de dados sem conta, sem custo e sem guardar em servidor dados que revelam convicção religiosa, que a LGPD trata como sensíveis (art. 5º, II).
- **IndexedDB ficou de fora, de propósito.** Todos os serviços leem os dados de forma síncrona ao abrir; passar para IndexedDB (assíncrono) exige reescrever todos eles e os testes que preparam o `localStorage`. O ganho seria só espaço, e os riscos reais (o navegador apagar e a falha silenciosa) já estão cobertos. Fica para quando alguém chegar perto dos 5 MB, e Ajustes agora mostra quanto falta.
- A proteção é pedida sozinha só para quem já tem dados pessoais, porque no Firefox o pedido aparece como pergunta; para os demais, fica o botão em Ajustes.
- O espaço é medido somando as chaves `biblia.*`, e não com `navigator.storage.estimate()`, que inclui o cache do service worker (~10 MB) e confundiria.
- `listenRate`, `listenVoice`, a escolha do Libras e a marca das novidades continuam com o `try/catch` próprio: são preferências sem prefixo `biblia.` ou com fluxo diferente.

**Testes:** suíte completa: 983 passaram e 7 falharam por tempo esgotado ou animação (navegação, acessibilidade, leitor, ouvir, busca), com o computador sobrecarregado. Os 7 rodados de novo com 2 workers: todos passaram. Depois da novidade: build sem avisos, `novidades`, `dados` e `titulos` passaram (15 testes).

**Arquivos:** `src/app/core/storage.service.ts`, `src/app/app.ts`, `src/app/core/backup.service.ts`, `src/app/pages/settings/settings.ts`, `src/app/core/whats-new.ts`, os 14 arquivos com `saveLocal`, `e2e/dados.spec.ts`, `CLAUDE.md`, `PONTOS-FRAGEIS.md`

**Pendências:**
- IndexedDB, se o espaço começar a faltar.
- Testar o pedido de proteção num iPhone e no Firefox de verdade (nos testes, o Chrome sem interface não concede).

## 2026-10-29 19:12 -0400 — Como acompanhar os testes (README e TESTES.md)

**Autor:** JacksonLuiz99, com Claude Code

**O que foi feito:**
- `README.md`: seções "Acompanhar os testes" (terminal, painel visual, `--headed`, relatório, saída em segundo plano, aviso de não rodar duas suítes juntas, `test:offline` no Windows) e "Testes antes de publicar" (o CI e a aba Actions).
- `TESTES.md`: como seguir uma execução em segundo plano e o que o CI roda.

**Decisões:**
- Comandos longos em segundo plano não terminam mais em `| tail`, que segura toda a saída até o fim; o caminho do arquivo de saída é passado para quem quiser acompanhar.

**Arquivos:** `README.md`, `TESTES.md`

## 2026-10-29 18:48 -0400 — Nota do Python no CLAUDE.md genérica

**Autor:** JacksonLuiz99, com Claude Code

**O que foi feito:**
- A nota sobre o Windows no `CLAUDE.md` não diz mais que "o Python 3.13 está instalado" (isso só valia para um PC). Agora diz que, no Windows, `python3` costuma abrir a Microsoft Store e que os scripts de `tools/` rodam com `python` ou `py`.
- Resolve a pendência da entrada de 18:41.

**Decisões:**
- Um commit único para o CI, o diário e esta nota: as mudanças se explicam juntas. Sem push neste momento, porque o push na `main` publica o site.

**Arquivos:** `CLAUDE.md`

## 2026-10-29 18:47 -0400 — Criação do diário de rastreabilidade

**Autor:** JacksonLuiz99, com Claude Code

**O que foi feito:**
- Criado este `DIARIO.md`, com as entradas desta sessão reconstruídas a partir do histórico do git e da hora dos arquivos.
- Acrescentada ao `CLAUDE.md` a regra de atualizar o diário antes de todo commit.

**Decisões:**
- Entrada mais recente no topo: quem abre o arquivo vê primeiro o que mudou por último.
- A regra fica no `CLAUDE.md` (que vai no repositório), e não só na memória local do Claude: assim vale também para o Claude do Valter.

**Arquivos:** `DIARIO.md`, `CLAUDE.md`

## 2026-10-29 18:43 -0400 — Testes de lógica no CI antes de publicar

**Autor:** JacksonLuiz99, com Claude Code

**O que foi feito:**
- `.github/workflows/publicar.yml` roda `npx playwright test --project=logica` depois do `npm ci` e antes do `ng build`. Se algum teste falhar, o site não é publicado.
- `playwright.config.ts`: com `SO_LOGICA=1`, não sobe o `ng serve`.
- Verificado localmente com `SO_LOGICA=1 CI=1` e sem servidor: 130 testes passaram em ~21 s (antes, ~60 s com o servidor).
- `CLAUDE.md` e `PONTOS-FRAGEIS.md` atualizados.

**Decisões:**
- Só o projeto `logica` no CI, por ora: não precisa de navegador e é rápido. Os testes de tela (`celular`, `computador`) precisam do Chrome no runner e demoram mais; ficaram para depois.
- Passo dentro do job `build`, e não num job separado: reaproveita o `npm ci`.
- Variável `SO_LOGICA` em vez de mudar o comportamento padrão: localmente tudo continua como antes.

**Arquivos:** `.github/workflows/publicar.yml`, `playwright.config.ts`, `CLAUDE.md`, `PONTOS-FRAGEIS.md`

**Pendências:**
- Conferir a primeira execução no GitHub Actions depois do push.
- Avisar o Valter de que um teste de lógica falhando agora trava a publicação.
- Testes de tela no CI.

## 2026-10-29 18:41 -0400 — Análise dos pontos frágeis (commit de JacksonLuiz99)

**Autor:** JacksonLuiz99, com Claude Code

**O que foi feito:**
- Criado `PONTOS-FRAGEIS.md` com 8 riscos, do mais grave para o menos grave: deploy sem testes, gravação silenciosa no `localStorage`, restauração de backup que apaga antes de gravar, commits grandes direto na `main`, conteúdo sem revisão de fatos, dependência do bible-api.com, ~10 MB na primeira visita, ausência de testes unitários e de linter.
- Build de produção conferido: passa sem avisos nem erros.
- O mesmo commit tirou os campos `"libc"` de pacotes opcionais no `package-lock.json`. É inofensivo para o `npm ci`, e provavelmente aconteceu porque o lock foi regravado por uma versão do npm diferente da do projeto (`npm@11.12.1`).

**Decisões:**
- Ordem sugerida: CI primeiro (pouco esforço, muita proteção), depois backup e gravação, depois combinados de equipe.

**Arquivos:** `PONTOS-FRAGEIS.md`, `CLAUDE.md`, `package-lock.json`

**Pendências:**
- A nota do `CLAUDE.md` diz "Python 3.13 is installed", o que vale só para o PC de JacksonLuiz99; reescrever de forma genérica.
- Usar todos a mesma versão do npm, para o `package-lock.json` não ficar mudando a cada commit.

## 2026-10-29 ~18:25 -0400 — Instalação do Python no PC de JacksonLuiz99

**Autor:** JacksonLuiz99, com Claude Code

**O que foi feito:**
- Python 3.13.16 instalado com `winget`, só para o usuário. Os 8 scripts de `tools/` foram lidos sem erro por essa versão (nenhum foi executado).

**Decisões:**
- Sem `pip install`: os scripts usam só a biblioteca padrão (exceto o `sword-para-vpl.py`, que usa o pysword baixado à parte).
- No Windows, `python3` continua sendo o atalho da Microsoft Store: usar `python` ou `py`.

## 2026-10-29 (horário não registrado) — Revisão do CLAUDE.md

**Autor:** JacksonLuiz99, com Claude Code

**O que foi feito:**
- `CLAUDE.md` revisado com o `/init`: já estava completo e correto. Acrescentados o script `test:e2e:ui` e a nota sobre o Windows (`npm run test:offline` não funciona no cmd.exe; `python3` é o atalho da Store).

**Arquivos:** `CLAUDE.md`
