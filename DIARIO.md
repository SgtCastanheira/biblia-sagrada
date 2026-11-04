# Diário do projeto

Registro de rastreabilidade: cada decisão tomada, o que foi feito, quando e por quê. A entrada mais recente fica no topo.

Regras:
- Toda mudança commitada tem uma entrada aqui, no mesmo commit.
- Data e hora no horário local da máquina, com o fuso (ex.: `2026-10-29 18:43 -0400`). Quando o horário exato não foi registrado, marque com `~`.
- **Decisões** dizem o que foi escolhido, por quê e o que ficou de fora. **Pendências** são o que ficou para depois.
- O hash do commit não entra na entrada (ele ainda não existe ao escrever); `git log -- DIARIO.md` liga cada entrada ao seu commit.

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
