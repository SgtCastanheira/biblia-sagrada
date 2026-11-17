# Diário do projeto

Registro de rastreabilidade: cada decisão tomada, o que foi feito, quando e por quê. A entrada mais recente fica no topo.

Regras:
- Toda mudança commitada tem uma entrada aqui, no mesmo commit.
- Data e hora no horário local da máquina, com o fuso (ex.: `2026-10-29 18:43 -0400`). Quando o horário exato não foi registrado, marque com `~`.
- **Decisões** dizem o que foi escolhido, por quê e o que ficou de fora. **Pendências** são o que ficou para depois.
- O hash do commit não entra na entrada (ele ainda não existe ao escrever); `git log -- DIARIO.md` liga cada entrada ao seu commit.

## 2026-11-17 17:27 -0400 — Prisão e Interrogatório: a cena “A quem buscais?” e o Talmude

**Autor:** Valter, com Claude. O dono pediu para ajustar a história da prisão (Jesus pergunta quem eles procuram, diz que é ele e os guardas caem) e para trazer o assunto do Talmude judaico. Entendi “a história lá” como o livro `paixao-prisao-e-interrogatorio`, onde a prisão é contada.

**O que entra:**
1. **A cena de João (Jo 18.3-9)** no começo do livro, antes do beijo e da espada: o diálogo `A Quem Buscais?` com as falas exatas da Almeida (a pergunta, “Sou eu”, os guardas que recuam e caem por terra, a segunda pergunta e o pedido “deixai ir estes”), com o texto de ligação (lanternas, archotes e armas; a única ponte com Jo 8.58 é o *egō eimi* grego; Judas “também estava com eles”; Jo 18.9). O beijo (Mt 26.48-49, Lc 22.47-48) vem depois, e o texto diz que os Evangelhos contam lados da mesma noite e que ele não afirma o que veio primeiro.
2. **A seção “O que o Talmude Diz sobre o Julgamento de Jesus?”**, depois de Herodes e antes de “As Idas e Vindas”: o que é o Talmude e de quando (Mishná do século II, Talmude da Babilônia do III ao VI; nenhum Evangelho o cita); Sanhedrin 43a (Yeshu ha-Notzri, a véspera da Páscoa, o pregoeiro de quarenta dias, a acusação de feitiçaria e de desviar Israel, “próximo do governo”); a ficha `O Talmude e os Evangelhos Lado a Lado` (o dia, a acusação, quem pune e como, a defesa, o governo); a Mishná Sanhedrin 4.1 (causas de morte julgadas de dia, condenação só no dia seguinte, nada na véspera de sábado ou festa); e Sanhedrin 41a (o Sinédrio sem a pena de morte quarenta anos antes do Templo, cruzado com Jo 18.31).
3. **Fontes:** `paixao-talmude` (os trechos, lidos em aramaico e inglês no sefaria.org, edição William Davidson, em 17/11/2026) e `paixao-wikipedia-talmude` (datas, censura e a divisão dos estudiosos) em `PAIXAO_WORKS`; o livro lista as duas e os versículos novos. O livro passou de 20 para 25 minutos.
4. **Teste novo** em `logica/paixao.spec.ts`: a cena “A quem buscais?” (as falas, a queda, antes da espada), a seção do Talmude (origem e data antes do conteúdo, as ressalvas, nenhum nome de estudioso, nenhum “…” que não seja Almeida) e as obras registradas.
5. **CLAUDE.md:** as duas exceções pedidas pelo dono ficaram anotadas no parágrafo da Paixão.

**Decisões:** (a) o Talmude é a segunda exceção à regra “só os Evangelhos” (a primeira foram os nomes Dimas e Gestas): origem e data antes do conteúdo, nenhum nome de estudioso, o Talmude nunca corrige os Evangelhos, e o texto só diz que “muitos leitores” entendem Yeshu como Jesus; (b) a tradução inglesa do Sefaria é CC BY-NC e não foi copiada: tudo do Talmude está em palavras próprias, e nenhuma aspa “…” guarda nada que não seja a Almeida exata (o teste confere); (c) “os guardas” segue a palavra do dono e Jo 18.3 (a coorte e uns guardas), e o texto não dá a causa da queda, só diz que caíram quando Jesus falou; (d) escolhi os três pontos do Talmude que mais se ligam ao julgamento (43a, 4.1 e 41a), porque o pedido não dizia qual; ficou de fora o que o Talmude diz do nascimento de Jesus, por não ser do julgamento; (e) a seção ficou aberta, não numa dobra “Saiba mais”, porque o dono pediu para “trazer o assunto”; basta uma linha `:::dobra` abaixo do título para recolhê-la.

**Pendências:** nada foi publicado; o estudo está só no `dev`. Para subir, usar o roteiro de sempre (ramo à parte saído de `origin/main`, `DIARIO.md` refeito sobre a versão de lá). Se o dono quiser outro ponto do Talmude, é outra seção ou outro livro.

## 2026-11-16 07:40 -0400 — A Bíblia Conectada e cinco estudos de Teologia e Provérbios vão para a `main`

**Autor:** Valter, com Claude. O dono viu a tela de leitura de A Bíblia Conectada pronta e mandou levar para a `main` o que estava no `dev` desde 13/11, de várias sessões, num só envio.

**O que sobe:**
1. **A Bíblia Conectada** (`/conexoes`, `/conexoes/:livro`, `/conexoes/:livro/:capítulo`, `?mostrar=`): os 1.189 capítulos numa só linha e um arco para cada ligação entre dois capítulos, feitos com as referências cruzadas da OpenBible.info (CC BY) que o leitor já embute (`public/bible/conexoes.json`, gerado por `tools/gerar-conexoes.py`; `logica/conexoes.spec.ts` falha se estiver defasado). Livro na estante “Para Entender a Bíblia”; o botão “Ver as conexões deste capítulo” na folha do versículo; imagem de compartilhar com os arcos (`connectionsCard`, `ShareCard.art`); cinco artes de fundo criadas com IA, no cache preguiçoso `imagens-das-conexoes`. A ideia vem de *Bible Cross-References*, de Chris Harrison e Christoph Römhild (2007): o crédito aparece sob o desenho, em “Como ler este desenho”, em `credits.ts` e em `CREDITOS.md`, e nem a imagem nem os dados deles são usados.
2. **Painel “Leia as passagens conectadas”** (feito hoje): abaixo do desenho, o capítulo em foco lista os capítulos mais ligados a ele em botões, e o painel mostra o texto dos versículos dos dois lados, e não só a referência, na versão escolhida em Ajustes. Duas vistas: “Cartões lado a lado” (padrão) e “Mapa mental” (a passagem no centro, livros, capítulos e pares de versículos como ramos que abrem e fecham; em tela estreita os ramos descem em degraus, sem rolagem lateral). Tocar num par abre os dois textos inteiros. O carregamento das referências por livro ficou num serviço só (`connection-references.ts`), usado pelas duas vistas.
3. **Cinco estudos novos:** *Acreditar e Crer* em duas vozes, a pentecostal e a presbiteriana (prateleira “A Fé em Duas Vozes”, livros 1 e 2); *Os Dois Ferros: O Ferro que Fere* e *O Ferro que Levanta* (Pv 27.17, trilha Histórias da Bíblia, prateleira “Os Dois Ferros”); e *Deus de Perto, Deus de Longe* (trilha Teologia, prateleira “Conhecer a Deus de Perto”, ao lado de “A Fé em Duas Vozes”). Todos têm fontes em `sources.ts` e testes de lógica que conferem, entre outras coisas, que toda citação entre aspas é idêntica à Almeida do app.
4. **Compartilhar:** quando o estudo tem tópicos na capa, a imagem lista só esses tópicos (a conclusão e a oração ficam de fora), como na capa.
5. **Narração com Gemini (ferramenta, sem áudio novo):** `tools/gemini-tts.mjs` e a opção `--provedor gemini` de `tools/gerar-audio.mjs`, com `--amostra`; a chave fica só no ambiente do computador. O MP3 é feito em JavaScript (`@breezystack/lamejs`, só para desenvolvimento). Nenhum áudio foi gerado nem publicado: `public/audio` não muda.
6. **Novidade** `biblia-conectada-e-cinco-estudos` em `whats-new.ts`, e a fonte de ícones subconjuntada de novo (`tools/baixar-fontes.py`) com os ícones novos.

**Decisões:** (a) O campo `added` dos cinco estudos passou de 13/11 para 16/11: ele marca o dia em que o livro chega ao leitor, e é por ele que a estante “Novidades” os mostra em “Hoje”. (b) A vista padrão do painel é a dos cartões, porque mostra o texto inteiro dos dois lados de cara; o mapa mental é a segunda vista, uma linha de código para inverter (`mode`, em `connection-readings.ts`). (c) Os dados dizem *que* dois versículos se ligam, não *por quê*: só as notas curadas de `citacoes.json` explicam, e o painel não inventa explicação. (d) O repositório é público: o `CLAUDE.md` e o `DIARIO.md` que sobem não levam as anotações da coleção privada, que ficam só no computador do dono. (e) Ficaram de fora do envio os arquivos soltos da raiz (os textos e prompts de origem dos estudos, `Teologos/`, `RECONHECIMENTO-DO-SISTEMA.md`) e a pasta `.playwright-mcp/`.

**Validação:** num checkout limpo, sem a pasta privada: lint sem problemas; 243 testes de lógica; build de produção com `--base-href` e trava de publicação sem achados; bateria `celular` e `computador` (porta própria, 4 trabalhadores): 1.214 passaram e 4 foram ignorados, como antes; teste offline do PWA contra o build de produção: 8 passaram. O build avisa, sem falhar, que o pacote inicial passou 1,86 kB do alerta de 1,05 MB (o limite que quebra o build é 2 MB) e que um `?.` de `connection-readings.ts` parece desnecessário para o compilador (ele protege o caso de a lista de capítulos vir vazia, então ficou).

**Pendências:** (1) Erros de digitação na Almeida embutida, achados ao conferir as citações e ainda não corrigidos (candidatos a `VERSE_FIXES`): Mt 7.23, Êx 13.21, Êx 17.6, Fp 3.10, 1Co 8.3, Jo 12.25, At 21.13, Ap 3.14, e **Nm 11.27, que está corrompido**. (2) Escrever, para os pares mais lidos, o “porquê” da ligação, se o dono quiser. (3) A camada visual de A Bíblia Conectada (abertura, brilho, imersão) pode crescer por cima sem mexer nos dados nem nos seletores dos testes. (4) Decidir se *Deus de Perto, Deus de Longe* fica em Teologia ou vai para Histórias da Bíblia (uma linha em `trails.ts`). (5) Gemini: escolher a voz e só então gerar áudio completo. (6) O pacote inicial está 1,86 kB acima do alerta de 1,05 MB: se o aviso incomodar, subir o alerta em `angular.json` ou tirar dados do pacote inicial.

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

## 2026-11-12 18:45 -0400 — Volume 4 publicado: o que mudou neste computador

**Autor:** Valter, com Claude. Depois do PR #12, arrumação local (nada disto vai ao Git):
1. Os sete livros agora vivem em `public/conteudo/artigos/paixao-*.md`; a cópia privada foi movida para `rascunhos/como-a-ciencia-explica/analises/copias-12-11-noite/md-publicados/` (backup de como estavam antes de subir). **Daqui em diante, edite os livros em `public/`** e publique por PR.
2. A prévia (`npm run start:rascunhos`) passou a mostrar o Volume 4 pelo próprio app: `VISIBLE_VOLUMES` do catálogo privado ficou vazio (os volumes 1 a 3 continuam escondidos) e a trilha vazia é filtrada para não duplicar a trilha publicada.
3. `CLAUDE.md` e `DIARIO.md` locais = versão do repositório + as notas completas de elaboração (parágrafos longos do CLAUDE.md e as entradas privadas daqui); cópias de antes em `rascunhos/como-a-ciencia-explica/analises/copias-12-11-noite/`.
4. Nada mais mudou fora do Git: `Teologos/`, `RECONHECIMENTO-DO-SISTEMA.md` e `.playwright-mcp/` seguem soltos.

## 2026-11-12 17:42 -0400 — Volumes 1 a 3 escondidos na prévia; só o Volume 4 (A Paixão) fica

**Autor:** Valter, com Claude. O dono pediu para ocultar “Como a Ciência Explica” dos Volumes 1 (Química e Matéria), 2 (Física e Movimento) e 3 (Corpo e Vida) e manter o Volume 4 (A Paixão, da Ceia à Ressurreição).

**O que já estava feito:** às 17:11, uma edição de `rascunhos/como-a-ciencia-explica/catalog.ts` feita fora desta conversa já escondia os volumes: `LOCAL_ARTICLES` e `LOCAL_TRAILS` guardam tudo, e `VISIBLE_VOLUMES` (só o Volume 4) filtra as prateleiras e os estudos; a descrição da trilha passou a falar só da Paixão.

**O que faltava e foi feito:** a página `/fontes` ainda listava as obras que só os volumes guardados usam (*Chemistry 2e*, *College Physics 2e*, *How the Eyes Work*, *What are waves?*, *The Oxford Companion to Wine* e um segundo *Anatomy and Physiology 2e*). Agora `DRAFT_ARTICLE_SOURCES` tem só as fontes dos estudos visíveis e `DRAFT_WORKS` tira as obras usadas só pelos volumes guardados; as obras da Paixão, citadas ou só consultadas, ficam. Cópia do catálogo antes: `analises/copias-12-11-noite/catalog.antes-das-fontes-ocultas.ts`.

**Conferido no navegador (prévia, celular):** biblioteca e página da trilha sem menção aos volumes 1 a 3 (a trilha mostra “7 histórias”); busca por machado, cego de nascença, tempestade, água em vinho e Naim sem resultado; `/artigo/cego-de-nascenca`, `/artigo/o-sinal-de-cana` e `/artigo/jesus-acalma-tempestade` não abrem; `/fontes` sem as cinco obras dos volumes guardados e com uma só *Anatomy and Physiology 2e* (a da Paixão); nenhum erro. Os textos e as figuras dos três volumes continuam na pasta `rascunhos/` e na trava de publicação.

**Como mostrar de novo:** incluir o título do volume em `VISIBLE_VOLUMES`.

**Pendências:** a prévia não recarrega sozinha; F5 para ver.

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

## 2026-11-12 16:36 -0400 — Estádios de Emaús, nomes dos dois condenados (Evangelho de Nicodemos), Simeão e a altura da cruz

**Autor:** Valter, com Claude. O dono continuou lendo a Crucificação e o Sepultamento e anotou: (1) “a sessenta estádios,? explica isso direito ou muda unidade de medida”; (2) “coloca isso aqui e pesquisa lá e só cita, não precisa baixar a Bíblia católica”, com um trecho que dá a Dimas e Gestas como os nomes dos dois malfeitores, tirados do Evangelho de Nicodemos (cap. 9, v. 5); (3) “Simeão ou Lucas”; (4) “A que altura ficava o lado de Jesus? Seria, na verdade, a que altura ficava a cruz de Jesus”.

**O que foi feito:**
1. **Estádios (Sepultamento e Ressurreição):** a frase agora cita Lc 24.13 (“distava de Jerusalém sessenta estádios”), diz que o estádio era uma medida da época, de uns 185 metros, e dá a conta: uns 11 quilômetros. Fonte lida por inteiro (Wikipédia em inglês, *Stadion (unit)*): o estádio grego tinha 600 pés gregos, o valor exato não é consensual (as estimativas vão de uns 157 a uns 209 metros) e o ático, de uns 185 m, é o que mais reúne acordo; com isso, sessenta estádios ficam entre 9,4 e 12,5 km, e o texto usa o valor central.
2. **Nomes dos dois condenados (Crucificação, “Os Dois Condenados”):** parágrafo novo, curto e com a origem dita na frente: Dimas e Gestas vêm de um escrito apócrifo, o *Evangelho de Nicodemos* (também *Atos de Pilatos*), que não faz parte da Bíblia e, na forma atual, é do século IV ou V; no capítulo 9, Pilatos diz a Jesus que será açoitado e crucificado no jardim onde foi preso e que os dois malfeitores serão crucificados com ele. Os Evangelhos seguem sem os nomes. Lido na tradução inglesa de Roberts e Donaldson (*Ante-Nicene Fathers*, vol. 8, em earlychristianwritings.com): o trecho está no capítulo 9, logo antes do 10, com “Dysmas e Gestas”. O texto colado pelo dono dizia “século III”; as fontes lidas (Wikipédia, *Gospel of Nicodemus* e *Penitent thief*) dizem IV ou V, e foi o que entrou. Não baixei nem anexei nenhuma Bíblia: só citei. O “verso 5” veio da edição em português que o dono colou; a tradução inglesa lida não numera versículos, e o estudo diz só “capítulo 9”. Não citei o trecho em português (de tradução de terceiros): contei com minhas palavras.
3. **Simeão e Lucas:** quem disse que uma espada traspassaria a alma de Maria foi Simeão, e Lucas é o Evangelho que conta (Lc 2.34-35). A frase já dizia Simeão; ficou sem dúvida: “a quem Simeão, no templo, quando ela levou o menino Jesus, disse que uma espada lhe traspassaria a alma”, com a referência ampliada para Lc 2.34-35.
4. **Altura:** a pergunta agora é “A que altura ficava a cruz de Jesus?” (o parágrafo já falava do poste, dos pés e depois do lado do corpo).

**Fontes novas** (`catalog.ts`): `paixao-nicodemos` (o próprio escrito, com o aviso de que não é Escritura e de que o “v. 5” não foi lido), `paixao-wikipedia-nicodemos` (data e nomes) e `paixao-wikipedia-estadio`; a primeira e a segunda entram na Crucificação, a terceira no Sepultamento.

**Decisões:** (a) os nomes Dimas e Gestas entram porque o dono pediu, abertos no texto (não numa dobra) e com a origem dita antes; é uma exceção à regra de ficar só nos Evangelhos, e vale só para essa informação; (b) a datação é a das fontes lidas (IV ou V), e não a do texto colado (III); (c) sem citar o trecho em português.

**Validação:** teste temporário (apagado): referências, citações com referência, falas, títulos, blocos, imagens e ligações sem problema; tempo de leitura igual ao do catálogo (Crucificação 26 min, Sepultamento 9 min). Capturas dos quatro trechos no celular, sem erro de página (`analises/previas-12-nov-noite/`, de `r-` a `u-`).

**Pendências:** o dono dizer se quer a ficha “Dimas e Gestas” também em outro lugar; a conta de Herodes continua em aberto, como na entrada seguinte.

## 2026-11-12 ~16:30 -0400 — Açoite e coroa sem repetição, espinhos, quilômetros com Herodes, Simão de Cirene, Gólgota, vinho, como se erguia o condenado, os dois condenados e a lança V6

**Autor:** Valter, com Claude. O dono leu Açoite e Condenação e Crucificação na prévia e pediu: **Açoite:** os dois parágrafos do açoite repetiam a mesma cena; quantos centímetros tinham os espinhos, “se tem, eu quero que coloque”. **Crucificação:** fazer a conta aproximada, em km, até o Gólgota e com as idas e vindas (“indo e voltando até fulano”); explicar a diferença entre Gólgota e “o monte chamado Caveira” e por que se chama assim; qual parte da cruz o cireneu leva e quem é esse Simão (“tá bagunçado cirineu, Simão”); uma imagem de Jesus falando com as mulheres de Jerusalém; mais explicação histórica de como a cruz era erguida, “do buraco até lá no alto no madeiro”; trazer os dois bandidos presos com ele; achar na Bíblia uma explicação para a recusa do vinho (“os Evangelhos não explicam”); e o final do livro não tocava (“recarrega sozinho”). O Codex entregou a lança V6 e as instruções de integração.

**O que foi feito:**
1. **Açoite:** os dois parágrafos viraram um, na ordem em que acontece (o estalo antes da dor, os vergões, a pele cede, o sangue, a conta que se perde). A cena da coroa seguia fora de ordem e repetia o manto, a coroa e a cana; agora segue Mt 27.27-31 (manto, coroa, saudação, golpes na coroa, manto tirado).
2. **Espinhos:** nenhuma fonte lida dá o comprimento em centímetros (sete páginas sobre as plantas candidatas, nenhuma com medida). O texto diz o que as fontes dizem (o espinheiro-de-cristo tem dois espinhos grandes, afiados e curvos na base de cada folha; o *Paliurus*, espinhos rígidos em pares de comprimento desigual) e que o comprimento “não consegui confirmar”. Não entrou número inventado.
3. **Quilômetros:** o primeiro tópico da Crucificação ganhou uma tabela com os mesmos números da figura do mapa (pretório na Antônia, 5,87 km; no palácio, 5,03 km) e a ida e volta a Herodes como estimativa: duas vezes 1,114 km (distância a pé entre a Antônia e o palácio, roteador do OpenStreetMap), o que leva o total a 7 ou 8 km. O endereço de Antipas é desconhecido e o texto diz isso. A nota do mapa (`passion-route.ts`) mostra a mesma faixa (7,26 a 8,10 km).
4. **Simão de Cirene:** o texto agora diz que os Evangelhos falam em “a cruz” e que, pelo costume romano, o condenado levava a trave (*patibulum*, de 30 a 50 kg), que é o que Simão carrega, atrás de Jesus. A ficha o separa dos outros Simões (Pedro, o cananeu, o leproso, Iscariotes), explica *cireneu* (“de Cirene”, também dito *cirineu*), lista onde aparecem cireneus na Bíblia e diz o que o texto não diz. O trecho que ligava Rufo a Rm 16.13 saiu: o texto não diz que é o mesmo Rufo. Dois parágrafos que repetiam a ideia de Lc 9.23 viraram um.
5. **Mulheres de Jerusalém:** pintura de James Tissot, *As filhas de Jerusalém* (domínio público, Brooklyn Museum, via Wikimedia Commons), `paixao-anatomia-filhas-de-jerusalem-tissot.jpg`, com Lc 23.27-28. O pintor desenhou uma corrente na cintura de Jesus; a legenda diz que ela não está nos Evangelhos.
6. **Gólgota e Caveira:** é um só lugar; *Gólgota* é o nome em hebraico e *Caveira* o que ele quer dizer (Mt 27.33, Jo 19.17); *Calvário* vem do latim *calvaria* (como já diz o dicionário do app, com link); os Evangelhos dizem “lugar”, e não “monte”; o motivo do nome não está no texto (duas explicações lembradas: o formato e o lugar de execuções).
7. **Recusa do vinho:** os Evangelhos não dão o motivo, e o texto diz isso. Três pistas da própria Bíblia, marcadas como leitura e não como texto: para que servia a bebida (Pv 31.6-7), a promessa da ceia de não beber do fruto da videira até o reino (Mt 26.29) e o cálice que ele não recusa (Jo 18.11); o fel e o vinagre lembram o Sl 69.21.
8. **Como o condenado era erguido:** só o que duas fontes lidas por inteiro dizem, em lista numerada (poste já fincado; mãos presas à trave no chão com cordas ou cravos; a trave içada com cordas e fixada ao poste; os pés depois), mais o calço ou a cavilha como assento, o degrau para os pés e a altura “pouco mais que um homem”. As fontes não dizem como o poste era firmado nem falam em buraco ou cunhas, e o texto diz isso. A nota de medicina deixou de afirmar que o cravo entra nos punhos (os Evangelhos dizem “mãos”).
9. **Os dois condenados:** seção nova “Os Dois Condenados” (Lc 23.32-33, Mt 27.38, Mc 15.27, Jo 19.18; Mateus e Marcos dizem que os dois o insultavam; Lucas guarda a conversa, e o texto não harmoniza) e o diálogo “O Pedido do Malfeitor” (Lc 23.39-43, na Almeida exata) em “Três Palavras de Graça”. Com Lc 22.37 (“E com os malfeitores foi contado”) e Is 53.12.
10. **Lança V6** na figura `paixao-lanca` (`passion-spear.ts` e `.scss` reescritos): folha de seis quadros, tempos 3/3/3/4/4/4 s no mesmo relógio, pausa exata, ampliação que compartilha o relógio, GIF só para baixar, miniatura e rótulo novos (“Seis imagens-chave”). Proporções em pixels e testes de interface em `analises/lanca-v6-integracao.md`.
11. **Ouvir até o fim, “recarrega sozinho”:** o aplicativo não recarregava; o servidor de desenvolvimento empurrava um recarregamento a cada arquivo que eu salvava e derrubava a leitura em voz alta. `npm run start:rascunhos` agora roda com `--live-reload=false`: depois de uma mudança, F5.
12. **Tempo de leitura:** Crucificação 26 min (era 21; 5158 palavras), Açoite e Condenação 9 min. “Quem Mandava e Onde Mandava” passou a 8 min porque alguém editou o texto durante a sessão (notas sobre “prefeito” nas fichas de Pilatos e de Caifás, com a inscrição de Cesareia e Josefo 20 no catálogo); mantive como estava e só atualizei o tempo e a maiúscula do título “Caifás e Anás: O Cargo e a Influência”.

**Decisões:** (a) sem centímetros, porque não há fonte; (b) a cruz que Simão leva é a trave, dito como costume e não como texto; (c) o que o condenado sofria ao ser erguido só entra com fonte lida por inteiro, e o que não está nas fontes (buraco, cunhas) é dito como lacuna; (d) as pistas do vinho ficam como leitura; (e) a Britannica (403) e uma página da Oxford (erro de certificado) não puderam ser lidas e não foram citadas; (f) a Wikipédia entra só como fonte de segunda mão para a ordem das etapas e o peso da trave, e isso está dito na lista de fontes; (g) o nome “Cirineu” aparece só como a forma que muita gente usa.

**Fontes novas** (`catalog.ts`): `paixao-eob-coroa` (Encyclopedia of the Bible, “Crown of Thorns”), `paixao-wikipedia-crucificacao`, `paixao-osm`; `paixao-eob` ganhou o que a página diz sobre a trave, o poste, as cordas e cravos, o assento e a altura; passagens da Crucificação atualizadas e a segunda pintura de Tissot listada.

**Validação:** teste temporário (apagado): 572 referências existem, 257 citações com referência e 96 falas idênticas à Almeida do app; títulos na regra de maiúsculas; blocos fechados; imagens existem; tópicos e minutos do catálogo iguais aos do texto; cartões de continuação no fim de cada livro. Lint limpo (também nos três arquivos privados que mudei); 184 testes de lógica passam; build de produção e trava de publicação sem achados. No navegador (celular de 390 px, movimento reduzido e computador), a lança toca 3/3/3/4/4/4 s, pausa exata, quadros nas posições certas, reinício, ampliação pelo teclado com Escape e foco de volta, sem rolagem horizontal nem erro; o primeiro cabeçalho da tabela de quilômetros estava cortado no celular e foi encurtado. As capturas estão em `analises/previas-12-nov-noite/`; cópias dos textos de antes em `analises/copias-12-11-noite/`.

**Pendências:** o dono dizer se a conta de Herodes (estimativa) fica no texto ou só no mapa; a imagem do monte das Oliveiras (Codex); o “prefeito” nos estudos públicos; a continuidade entre os quadros da lança foi conferida a olho, e a medição final em pixels é aproximada (erro de uns 6%); a Crucificação ficou longa (26 min) e o dono pode querer dividi-la.

## 2026-11-12 14:08 -0400 — Monte das Oliveiras, discípulos e mapa nos livros; “governador”; Campo de Sangue; multidão; fogo de brasas; estudo novo “Quem Mandava e Onde Mandava”

**Autor:** Valter, com Claude. O dono continuou lendo os livros na prévia e pediu, **Getsêmani:** explicar o Monte das Oliveiras e o Getsêmani, com uma imagem, e explicar de novo o que houve com os discípulos depois da prisão. **Prisão e Interrogatório:** apagar “As cordas apertaram-lhe os punhos” (não se sabe se cordas ou correntes); pôr o mapa de um lugar para o outro; a fogueira “é importante para outro momento da história”; confirmar que os guardas são os do templo; explicar melhor o Campo de Sangue; trocar “prefeito” por “governador”; esclarecer quem é a multidão que “os chefes reuniram”; e **um estudo** que explique, ligado a estes, quem mandava e onde, os poderes de cada um, a quem cada um respondia e o que eram (romano, judeu), desenhado, e o que Herodes fazia em Jerusalém. Nada commitado nem publicado. Cópias antes da mexida em `analises/*-copia-antes-das-correcoes-das-17h.md`, `catalog-copia-antes-do-estudo-quem-mandava.ts.txt`, `figure-…` e `passion-route-…`.

**O que foi feito:**
1. **Getsêmani** (agora com 4 tópicos e 6 min): nova seção “O Monte das Oliveiras e o Getsêmani”, só com o que o texto diz (o monte do outro lado do Cedrom, Lc 21.37, Lc 19.37, At 1.12; o nome em Mateus e Marcos, o jardim em João, o monte em Lucas, que Mateus junta em 26.30 e 26.36; por que Judas sabia onde achá-lo, Jo 18.2 e Lc 22.6) e a figura nova `paixao-oliveiras` (mapa do templo, do vale do Cedrom, do Getsêmani e do monte; o contorno do monte é um esboço, dito na legenda). Seção final “O que Houve com os Discípulos”: ficaram à entrada e dormiram, Jesus os protegeu na prisão (Jo 18.8), todos fugiram (Mt 26.56, Mc 14.51-52), Pedro e outro discípulo seguiram de longe, só um aparece na cruz, e no domingo estavam trancados; aponta para os livros em que cada parte é contada. A frase “a dor viera antes do chicote e das cordas” passou a “antes do açoite e da prisão”.
2. **Cordas:** sai a frase; a prisão diz só que o “maniataram” (Jo 18.12); a nota de medicina fala de “mãos atadas”, sem corda, corrente nem punho.
3. **Mapa** (`paixao-mapa`) agora está em “As Idas e Vindas da Ceia ao Gólgota”, que **deixou de ser dobra** para o dono ver a linha do tempo e o mapa sem abrir nada.
4. **Fogueira:** nota “Guarde Este Fogo” na cena das negações (o braseiro de Jo 18.18 volta como as brasas de Jo 21.9, onde Pedro é perguntado três vezes, Jo 21.15-17) e **cena nova “Pedro e as Brasas”** em Sepultamento e Ressurreição, com a pergunta três vezes em diálogo; “Vou pescar” não se repete.
5. **Guardas:** os que guardam Jesus são os guardas do templo, a serviço dos sacerdotes (“guardas dos judeus”, Jo 18.12; “oficiais do templo”, Lc 22.52).
6. **Campo de Sangue:** o parágrafo agora explica o preço de sangue (Mt 27.6), a compra do campo do oleiro para cemitério de estrangeiros (Mt 27.7), o nome (Mt 27.8; At 1.19) e há uma ficha (nome, quem comprou, para que servia, o que lembra com Zc 11.12-13, o que o texto não diz). Não entrou a descrição de como Judas morreu em Atos.
7. **“Governador”:** trocado em toda a coleção (Prisão e Açoite); a frase que explicava a palavra foi simplificada. O estudo público “Quem Eram os Herodes?” ainda diz “prefeito” e não foi tocado.
8. **A multidão:** parágrafo novo que diz quem a moveu (Mt 27.20, Mc 15.11), que “subiu” até Pilatos de manhã cedo (Mc 15.8, Jo 18.28), que João põe “os guardas” ao lado (Jo 19.6), o que Mateus quer dizer com “todo o povo respondeu” (Mt 27.25: o povo da cena, diante de Pilatos) e que não era a cidade inteira (Lc 23.27). A afirmação antiga de que “os chefes reuniram” a multidão saiu: os textos dizem “persuadiram” e “incitaram”.
9. **Estudo novo, `paixao-quem-mandava`** (7 min, abre o Volume 4 como prólogo; Prisão e Interrogatório liga a ele com o cartão “Para entender o cenário”): (a) “Um Versículo Desenha o Mapa” (Lc 3.1-2) com a figura `paixao-regioes`, um mapa das divisões da terra no tempo de Jesus feito com os polígonos da época “O mundo romano” do atlas do app; (b) quatro fichas (Pilatos, Caifás e Anás, o sinédrio e a guarda do templo, Herodes Antipas), cada uma com quem era, onde mandava, o que podia, o que não podia e a quem respondia, mais a figura `paixao-poder`, um esquema em três faixas (Roma, os judeus sob Roma, o tetrarca aliado); (c) “Herodes em Jerusalém” (Lc 23.6-12, Lc 13.31-32, Mc 6.17-27); (d) “Por que Jesus Passou de Mão em Mão”. Termina com cartões para “Quem Eram os Herodes?”, “Flávio Josefo”, “Legião” e para a Santa Ceia.
10. **Imagem:** a paisagem do monte ficou como pedido para o Codex (`analises/pedidos-de-imagem-para-o-chatgpt.md`, item 8); o mapa já está feito.

**Fontes do estudo novo:** as passagens bíblicas saem das referências do texto; fora da Bíblia, só três fatos de Josefo, lidos no Wikisource (tradução de Whiston, domínio público): Antipas fundou Tiberíades, junto ao lago, com o nome do imperador (cap. 2 §3); o governador Valério Grato tirou Anás do cargo e pôs outros, até José Caifás (cap. 2 §2); Pilatos levou o exército de Cesareia a Jerusalém para o inverno (cap. 3 §1). **Não afirmado por falta de conferência:** que Tiberíades fosse a capital de Antipas (a página não diz isso), que Vitélio tirou Caifás do cargo e que as vestes do sumo sacerdote ficavam sob guarda romana. A sede do governador em Cesareia está em Atos (Félix, “no pretório de Herodes”, At 23.33-35). Obra nova `paixao-josefo-ant18` no catálogo.

**Código:** `:::leia id apoio` (rótulo “Para entender o cenário”) em `rich-text-parser.ts` e `rich-text.ts`, no lugar do campo `next` (agora `mode`: continua ou apoio); teste em `ilustracoes.spec.ts`; componentes novos `passion-contexto.ts` e `.scss` (privados; `passion-route.ts` passou a exportar os auxiliares do mapa); a trava de publicação e o teste dela ganharam os ids novos.

**Validação:** teste temporário (apagado): 546 referências existem, 242 citações com referência e 92 falas idênticas à Almeida do app; títulos na regra de maiúsculas (a regra manda “Por que”, “O que”, “com que” em minúscula); blocos fechados; cartões de continuação no fim dos sete livros e fora de dobra; nenhuma figura sem faixa e sem caso; nenhum “prefeito” nem “cordas”. Lint limpo; 184 testes de lógica; 63 testes de navegador de leitura, voz, histórias ligadas e compartilhar; build de produção (1,01 MB) e trava limpos, nenhum id novo no build. Chrome em 390 e 360 px: sem rolagem lateral nem erro, botões de 44 px, “Ouvir” sem lixo. Capturas em `analises/previas-contexto-12-nov/`.

**Pendências:** o dono dizer se troca “prefeito” também nos estudos públicos (“Quem Eram os Herodes?”, “Flávio Josefo”, “Legião”); a imagem do monte (Codex); juntar livros ou não; os avisos que restam (“tudo indica” no lava-pés etc.); o seletor do pretório no mapa. O contorno do Monte das Oliveiras e as fronteiras das regiões são esboços aproximados.

## 2026-11-12 13:17 -0400 — Santa Ceia depois da leitura do dono: horas das vigílias, quem preparou a páscoa, pão e cálice antes do anúncio, cartão “A história continua”

**Autor:** Valter, com Claude. O dono leu a Santa Ceia na prévia e pediu: (1) especificar as horas de “se à tarde, se à meia-noite, se ao cantar do galo, se pela manhã”; (2) o parágrafo “Os Evangelhos não descrevem a cozinha nem o serviço; dizem só isto, que prepararam a páscoa” estava incorreto: o texto acabava de dizer que Pedro e João (Lc 22.8) prepararam a ceia, e os outros Evangelhos não trazem o mesmo detalhe; (3) dizer que Jesus morre à tarde e cumpre o pedido do cordeiro morto à tardinha (Êx 12.5-9); (4) “última ceia”, e não “última mesa”; (5) “O Pão e o Cálice” deve vir antes de “O Anúncio da Traição”; (6) no fim do livro, uma continuação para o Getsêmani; (7) apagar “Ninguém ali mente: cada um diz o que sente.” Nada commitado nem publicado. Cópias antes da mexida: `analises/paixao-santa-ceia-copia-antes-das-correcoes-do-dono.md` e `analises/catalog-copia-antes-das-correcoes-da-ceia.ts.txt`.

**O que foi feito:**
1. **Vigílias** (na dobra “Quando Foi Tudo Isso?”): quatro itens, só aproximados: à tarde, 1ª vigília, das 18h às 21h; à meia-noite, 2ª, das 21h à meia-noite; ao cantar do galo, 3ª, da meia-noite às 3h; pela manhã, 4ª, das 3h ao amanhecer. Fonte lida por inteiro: Bratcher e Nida, *A Handbook on the Gospel of Mark* (UBS, 1961), comentário a Mc 13.35, que dá a divisão romana em quatro vigílias de três horas e põe o canto do galo na terceira; uma busca antes mostrou comentários e dicionários bíblicos no mesmo sentido. A fonte dá as horas como fixas; o texto diz “só aproximadas”. Obra nova `paixao-bratcher-nida` no catálogo, nas fontes da Santa Ceia.
2. **Quem preparou a páscoa:** cada Evangelho com o seu detalhe (Lucas: Pedro e João e “Ide, preparai-nos a páscoa, para que a comamos”; Marcos: “dois dos seus discípulos”; Mateus: “os discípulos”), e os três fecham a cena com “prepararam a páscoa”. O parágrafo seguinte agora começa “Preparar a páscoa era providenciar o que a Lei pedia”: o cordeiro “sem defeito”, morto “à tardinha” (a Almeida do app diz exatamente isso em Êx 12.6), assado, com pães ázimos e ervas amargosas, e o fermento fora de casa. O que os Evangelhos dizem depois da mesa (cálice, água na bacia) segue. Fica uma única imaginação marcada (“segundo se pode imaginar”).
3. **O cordeiro à tardinha:** “É à tarde que Jesus morrerá, ‘à hora nona’ [Mc 15.34], por volta das 15h: cumpre também esse pedido, o do cordeiro morto à tardinha. ‘Cristo, nossa páscoa, já foi sacrificado’ [1Co 5.7].”
4. **“Última ceia”** no lugar de “última mesa”.
5. **Ordem:** A Última Ceia (A Mesa da Páscoa, O Lava-Pés, O Pão e o Cálice) → À Mesa com o Traidor (o anúncio e o diálogo) → Do Cenáculo ao Jardim. Os tópicos do catálogo mudaram para os mesmos nomes. Atenção: essa é a ordem de Lucas (a mão do traidor “à mesa” vem depois do cálice, Lc 22.20-21); Mateus e Marcos põem o anúncio antes do pão. O texto não afirma sequência (“Ainda à mesa…”) e segue citando Mateus.
6. **Cartão de continuação:** `:::leia paixao-getsemani continua`, com o rótulo novo “A história continua” (em vez de “História completa”), no lugar marcado na captura. Código: `rich-text-parser.ts` (campo `next`) e `rich-text.ts` (o rótulo); teste novo em `e2e/logica/ilustracoes.spec.ts`; `CLAUDE.md` descreve. Fiz o mesmo no fim dos livros 2 a 5, cada um apontando para o seguinte (o 6 não tem). Um cartão dentro de uma seção `:::dobra` ficaria escondido; por isso “Que Horas Eram?” saiu do fim de Açoite e Condenação e foi para o fim do primeiro tópico da Crucificação, onde as horas da cruz (terceira, sexta, nona, pôr do sol) fazem mais sentido. A referência da tabela da Santa Ceia agora leva ao livro Crucificação, e as fontes do sol mudaram de livro junto.
7. Frase “Ninguém ali mente: cada um diz o que sente.” apagada.

**Tempo de leitura:** Getsêmani 4 min, Açoite e Condenação 9 min, Crucificação 21 min (os outros não mudaram).

**Validação:** teste temporário (apagado) sobre os seis livros: 424 referências existem, 192 citações com referência e 83 falas idênticas à Almeida do app, títulos na regra de maiúsculas, blocos fechados, ordem exata das seções da Santa Ceia, cada livro termina no cartão do próximo e fora de qualquer dobra, “Que Horas Eram?” só na Crucificação. Lint limpo; 184 testes de lógica; 13 testes de navegador (leitura, ouvir, histórias ligadas); build de produção sem aviso (inicial 1,01 MB) e trava limpa. No Chrome em 390 px: as vigílias, o preparo, a ordem das cenas e o cartão, sem erro de console nem rolagem lateral (capturas `analises/previas-livros-12-nov/ceia2-*.png`).

**Pendências:** as da entrada anterior continuam (juntar livros ou não; avisos que restam; seletor do pretório no mapa). Observado: na Santa Ceia ainda há “tudo indica, os de Judas” no lava-pés.

## 2026-11-12 12:48 -0400 — A Paixão vira seis livros; a ceia segue só Mateus 26.20-35 e Judas fica à mesa

**Autor:** Valter, com Claude. Pedidos do dono, a partir de uma captura do diálogo “Quem É o Traidor?”: (1) separar as histórias “como livros” (Santa Ceia, Getsêmani, Prisão e Interrogatório, Crucificação); (2) na linha “Jesus molha um bocado de pão e o dá a Judas” (Jo 13.26), “ser conservador” e pôr “o que põe comigo a mão no prato” (Mt 26.23); (3) apagar a seção “Judas Sai”; (4) arrumar a ceia, “muito bagunçada”: “Judas participa da ceia ou não? Tem ali muita divergência”. Nada commitado nem publicado. Cópias antes da mexida, em `analises/*-copia-antes-de-separar-em-livros.*`: o estudo inteiro, o catálogo, `rich-text.ts`, `article.ts`, a trava de publicação, o teste da trava e o mapa.

**Os seis livros** (prateleira “Volume 4 · A Paixão, da Ceia à Ressurreição”, na trilha Como a Ciência Explica, depois do Volume 3; ids `paixao-…`; textos em `conteudo/artigos/paixao-*.md`; o estudo único `do-getsemani-a-ressurreicao` deixou de existir, e o progresso de leitura que o navegador guardava dele é ignorado sem erro). Minutos pela mesma conta dos tópicos (200 palavras por minuto):
1. **Santa Ceia** (9 min): Os Preparativos da Páscoa · À Mesa com o Traidor · O Pão e o Cálice · Do Cenáculo ao Jardim.
2. **Getsêmani** (3 min, com a pintura do olival na capa): A Prensa de Azeite · A Minha Alma Está Triste até a Morte.
3. **Prisão e Interrogatório** (17 min): O Beijo e a Espada · Vendado, Cuspido, Esbofeteado · Quem Julgou Jesus?
4. **Açoite e Condenação** (11 min): O Açoite que Abriu as Costas · A Coroa e a Cana.
5. **Crucificação** (19 min, capa com a pintura das cruzes): Quantos Passos até o Gólgota? · Simão, o Homem que Vinha do Campo · Rei dos Judeus, em Três Línguas · Meu Deus, Meu Deus, por que Me Desamparaste?
6. **Sepultamento e Ressurreição** (8 min, capa com o sepulcro vazio): Os que Ficaram e os que Fugiram · Ao Raiar do Primeiro Dia.
Os livros 4 e 6 vão além dos quatro nomes do dono: sem eles, o açoite, a coroa e a sentença, e o sepultamento e a ressurreição, não tinham onde morar, e a Crucificação ficaria com 31 minutos. A prisão (o beijo, Malco) abre o livro 3 e não o Getsêmani, para o nome “Prisão e Interrogatório” fazer sentido; por isso o Getsêmani ficou curto. Juntar dois livros é concatenar os arquivos e ajustar o catálogo. O texto é o mesmo de antes, cortado nas emendas dos tópicos; o Getsêmani e a Santa Ceia ganharam novos títulos de tópico (a sanfona antiga tinha um só para cada), com a linha de hora no lugar. Cada livro tem as suas fontes (as passagens bíblicas saem das referências do próprio livro, e só entram as obras que ele realmente usa; o quadro de fontes não mostra mais o título “Para conferir e aprofundar” quando a lista é vazia, caso do livro 6).

**A ceia, só com Mateus 26.20-35:** (1) o diálogo “Quem É o Traidor?” agora é Mt 26.21-25: um de vós me trairá; “Porventura sou eu, Senhor?”; “O que mete comigo a mão no prato, esse me trairá” (a Almeida do app diz “mete”; a ACF que o dono colou diz “põe”, e a regra do app é citar a Almeida dele); o “ai” de Mt 26.24; Judas pergunta “Porventura sou eu, Rabí?” e Jesus responde “Tu o disseste”. Saíram o pedaço de pão molhado e o “O que fazes, faze-o depressa” (Jo 13.26-27). (2) Apagadas a seção “Judas Sai” e a ficha que comparava os Evangelhos (“A Ordem da Ceia nos Evangelhos”), mais a ordem “depois da ceia” de Lucas e de Paulo no pão e cálice. (3) **Resposta ao “Judas participa da ceia?”:** sim, segundo Mateus: “reclinou-se à mesa com os doze” (Mt 26.20), Judas é um dos doze e já combinara a entrega (Mt 26.14-16), e ele pergunta ali mesmo (Mt 26.25). O texto diz isso numa linha e não conta a saída dele; nada fala de “onze” (o Getsêmani passou a dizer que Jesus deixou “os discípulos” à entrada, Mt 26.36-37) nem de “depois que Judas saiu”. (4) Depois do hino (Mt 26.30), no caminho, vem o aviso de que todos se escandalizarão e a promessa da Galileia (Mt 26.31-35), no lugar do diálogo de Lucas à mesa; de Lucas ficou só “eu roguei por ti” (Lc 22.32). João entra no lava-pés e nas palavras de despedida. (5) O mapa da Paixão (`passion-route.ts`) também deixou de dizer “Judas sai” e “os onze”. (6) Sobra um só aviso sobre o lava-pés, “tudo indica, os de Judas” (Jo 13.2), que o dono pode mandar firmar ou cortar.

**Outros ajustes:** (1) saiu a frase “Alguns comentaristas antigos acrescentaram que o documento cancelado era perfurado com um prego…” (Cl 2.14), que escapou da limpeza de debate das 11h50. (2) Conferido que a Almeida do app tinha um único “traido” sem acento, em Mt 26.24 (Mc 14.21 e Lc 22.22 têm “traído!”); corrigido pela rota oficial (`VERSE_FIXES` em `tools/gerar-almeida.py` e `tools/corrigir-almeida.py`), porque a fala de Jesus no diálogo precisa ser idêntica ao texto do app. (3) A referência “A hora de cada passo está em *Que Horas Eram?*” (Santa Ceia) agora leva ao livro Açoite e Condenação, onde essa seção está.

**Leitor (arquivos públicos, uma mudança pequena):** `RichText` ganhou a entrada `foldable`, ligada pela página do artigo em todo estudo privado: as notas de medicina e as seções `###` + `:::dobra` ficam em linhas “Saiba mais” mesmo sem a sanfona por tópico (que só liga com 8 tópicos ou mais, e nenhum livro chega a isso). Sem ela, o primeiro que o leitor veria em Santa Ceia seria a tabela inteira do calendário. A letra capitular passou a ignorar parágrafos dentro de seções dobradas (antes caía num parágrafo escondido), e o “aguarde assentar” do progresso vale para toda dobra. Os outros estudos privados não têm nota de medicina nem `:::dobra`, então nada muda neles. Trava de publicação e `e2e/logica/rascunhos.spec.ts` ganharam os cinco ids novos (`paixao-getsemani` já estava na lista por causa da imagem da capa). Também nos arquivos públicos: as listas de obras do quadro de fontes (`sources-box.ts` e a página `/fontes`) passaram a quebrar endereços longos (`overflow-wrap: anywhere`), porque obras privadas com URL sem espaço faziam `/fontes` passar de 360 px; vale igualmente para o app público. Teste novo em `e2e/logica/sanfona.spec.ts`: sem tópicos, só a dobra fechada esconde o corpo.

**Validação:** teste temporário (apagado) sobre os seis arquivos: 417 referências existem, 187 citações com referência e 83 falas dos diálogos idênticas à Almeida do app, títulos na regra de maiúsculas, blocos `:::` fechados, imagens e cartões `:::leia` existentes, nenhum termo de debate nem restos de “saiu logo”, “bocado”, “onze homens”, “Jo 13.26”, “Lc 22.21”; tópicos do catálogo iguais aos títulos `##`; fontes e trilha coerentes. No Chrome em 390 px: prateleira e lista da trilha mostram o Volume 4; cada livro abre sem erro de console nem de rede e sem rolagem lateral; “Saiba mais” fechado e abrindo ao toque (a tabela do calendário tem o link para o outro livro e ele navega); fim do livro com “A seguir · Getsêmani”; cartão de compartilhar com os tópicos e as horas; “Ouvir” abre as dobras e lê sem nome de ícone nem rótulo. Capturas em `analises/previas-livros-12-nov/`.

**Testes finais:** lint limpo; 183 testes de lógica passam (um novo); build de produção sem aviso (inicial 1,01 MB, como antes), trava de publicação limpa e nenhum dos ids novos no build. Testes de navegador (leitura, ouvir, histórias ligadas, compartilhar, estante, estudo e navegação, celular e computador): 391 passaram, 2 ignorados e 13 falharam, todos explicados: 6 porque a prévia de rascunhos mostra a coleção privada (48 prateleiras em vez de 44; 12 anéis em vez de 11), e passam num servidor limpo; 6 por erro de arquivo de rastro do próprio Playwright (ENOENT), porque eu havia interrompido uma execução anterior que dividia a mesma pasta de resultados; 1 real, `/fontes` com 395 px de largura num aparelho de 360, corrigido como descrito acima. Num servidor limpo (porta 4201, sem rascunhos) rodei de novo estante, biblioteca, bolinhas, as seis telas de navegação e “celular pequeno (360 px)”: 31 passam, 1 ignorado. Com as fontes abertas, os seis livros cabem em 360 px.

**Decisões:** (1) Seis livros e não quatro, para ficarem entre 3 e 19 minutos; o dono diz se quer juntar. (2) Os livros não usam a sanfona por tópico, mas usam o “Saiba mais”: o dono aprovou dobrar sem cortar. (3) A ceia fica com um Evangelho por cena, como ele pediu; comparar os Evangelhos entre si só volta se ele pedir. (4) Fora de escopo e como estava: a figura da lança, as imagens e os GIFs do Codex, o seletor “Onde ficava o pretório?” do mapa.

**Pendências:** o dono dizer se junta livros; se tira os avisos que restam (“tudo indica” no lava-pés; “ao que tudo indica” no nome de Barrabás; “muitos leitores cristãos veem aí” no bode vivo; “segundo se pode imaginar” nos preparativos e no olival); o seletor do pretório no mapa. Observado e não mexido: o leitor de voz corta uma passagem em “Mc 16.” e “1 e…” (o divisor de frases quebra no ponto de “16.1”), defeito antigo do `splitForSpeech` que atinge toda história com referências. A imagem da lança, a sanfona em estudos públicos e os vídeos continuam como na entrada anterior. Nenhum commit, push ou publicação.

## 2026-11-12 11:50 -0400 — Estudo da Paixão só com os Evangelhos: sem “discutível” nem “fulano disse”, e a ceia separada em cenas

**Autor:** Valter, com Claude. Pedidos do dono: (1) tirar as partes que dizem que algo é discutível ou o que tal autor falou, “quero focar nos Evangelhos”; (2) acrescentar o que os discípulos fizeram para preparar a Páscoa (pães, vinho, quem cuidava da cozinha), “veja nos Evangelhos”, sem inventar; (3) separar bem os assuntos da ceia (“antes da ceia teve comes e bebes? não entendi”); (4) responder se Judas participa da ceia. Tudo no material privado (`rascunhos/`); nada de código público mudou. Cópias antes da mexida: `analises/do-getsemani-copia-antes-de-focar-nos-evangelhos.md` e `analises/catalog-copia-antes-de-focar-nos-evangelhos.ts.txt`.

**O que saiu do estudo (13.924 → 13.188 palavras):** a hipótese do calendário de Jaubert e as “hipóteses discutidas” da data; a Mishná e o Halel; o ossuário de Caifás e Josefo; a “tradição” sobre a morte de Judas; Tácito e a inscrição de Pilatos; a seção inteira “O Testemunho das Fontes Antigas” (Josefo, Fílon, Suetônio, Eusébio, Talmude, Yehohanan/Zias); o flagrum de osso e chumbo como reconstrução (agora “O Instrumento” diz só que os Evangelhos contam que Pilatos mandou açoitar, sem descrever o objeto); a espécie do espinho; “deve ter sido a capa”; o debate das horas em João; a frase do cálculo de Humphreys; o debate sobre onde ficava o pretório (o texto traz só a medida da Fortaleza Antônia: 4,1 km do jardim ao Gólgota e ≈ 5,9 km no total); “segundo os estudiosos/historiadores”, “alguns entendem”, “pela tradição”; o debate sobre o *tetelestai*. Duas notas de medicina foram reescritas sem citar autores. O parágrafo da altura da cruz ficou sem nome de obra e diz que é “conta de ordem de grandeza, feita para este estudo”. Uma busca por 25 termos de debate no texto (debatid, discutid, estudiosos, Josefo, Tácito, Mishná, Talmude, Jaubert, Nicolotti, Zias, Barbet, Humphreys, hipótese, a tradição…) não acha mais nada.

**O que entrou, em cenas separadas (cada uma com a sua linha de hora):** “Os Preparativos da Páscoa” (Mc 14.12-16 e Mt 26.17-19, Lc 22.7-13: o envio de Pedro e João, o homem do cântaro, o cenáculo “mobiliado e pronto”, “prepararam a páscoa”; a Lei diz o que a refeição pedia, Êx 12.5-9 e 12.15; os Evangelhos não descrevem a cozinha e há **uma** imaginação marcada, “segundo se pode imaginar”), “A Mesa da Páscoa”, “O Lava-Pés” (já existia), “O Anúncio da Traição” (o diálogo `Quem É o Traidor?`), “Judas Sai” e “O Pão e o Cálice”, com a ficha **A Ordem da Ceia nos Evangelhos** (Mateus e Marcos / Lucas / João / Paulo / E Judas?). O que a ficha mostra: a refeição da Páscoa é a ceia inteira; o pão e o cálice acontecem **dentro** dela (“enquanto comiam”, Mt 26.26; Mc 14.22), e o cálice é o “depois da ceia” (Lc 22.20; 1Co 11.25).

**Sobre Judas (resposta ao dono):** os Evangelhos não dizem com todas as letras se ele estava na hora do pão e do cálice. João registra que ele recebeu o bocado e “saiu logo” (Jo 13.30), antes do que Jesus diz a seguir; Mateus e Marcos não contam a saída; Lucas põe “a mão do que me trai está comigo à mesa” depois do cálice (Lc 22.21). A ficha e o texto mostram cada Evangelho com as suas palavras, sem harmonizar por conta própria; a ordem das cenas segue Mateus e João.

**Catálogo privado:** saíram as seis linhas de fontes antigas (Josefo, Mishná, Tácito, Fílon, Suetônio/Eusébio/Talmude, achados) e as obras que só elas usavam (de 20 para 10 em `works`; as definições seguem em `DRAFT_WORKS`, sem uso). O título do quadro de fontes dizia “Fontes antigas e arqueologia”, errado para uma lista de passagens bíblicas e uma pintura: passou a “Passagens bíblicas e imagem”, e a lista ganhou Êx 12.15, 1Co 11.23-25 e 15.5-6, Dt 25.3 e Zc 13.7. Tempo de leitura da capa: 58 → 55 min (≈ 11 mil palavras de texto corrido a 200 por minuto). No mapa, saiu de `passion-route.ts` (etapa 1) a frase de que o lugar do cenáculo é debatido.

**Validação:** (1) teste temporário (já apagado) que conferiu 427 referências, 193 citações com referência e 83 falas dos diálogos contra a Almeida do aplicativo, mais 19 citações da ceia e da ficha conferidas à parte: tudo exato; ordem das cenas, ficha com 5 linhas, quatro dobras (`Quando Foi Tudo Isso?`, `As Idas e Vindas da Ceia ao Gólgota`, `A Lei Judaica e o Costume Romano`, `Que Horas Eram?`), blocos `:::` fechados, títulos na regra de maiúsculas, cartões `:::leia` e imagens existentes. (2) Lint limpo; 182 testes de lógica passam (inclui sanfona, rascunhos e fontes); trava de publicação limpa. (3) No Chrome em 390 px, no estudo real: tópico 1 aberto, as cinco cenas e a ficha legíveis, sem rolagem lateral, sem erro de console nem de rede (capturas em `analises/previas-evangelhos-12-nov/`).

**Decisões:** (1) “Discutível” e “fulano disse” saem inteiros em vez de ficarem dobrados em “Saiba mais”: o dono quer o estudo nos Evangelhos, e dobrar manteria o assunto. (2) A Lei (Êx 12) continua, porque é Escritura e é o que explica o que a Páscoa pedia; ficou apenas uma imaginação marcada. (3) Foram mantidos os cálculos do próprio estudo (nascer e pôr do sol, altura da cruz), cada um dito como cálculo; se o dono quiser tirar também, é só pedir. (4) Fora de escopo: nada mudou nas figuras nem na lança.

**Pendências:** o dono decidir se o mapa perde o seletor “Onde ficava o pretório?” (tradição/hipótese), que ainda mostra a Fortaleza Antônia ou o Palácio de Herodes; e se saem também os outros rótulos de “hipótese” (notas de medicina, cálculo do sol, altura da cruz) e o quadro de fontes (hoje com 10 obras). Observado e não mexido: no componente público, um ponto final logo depois de uma passagem pode cair sozinho na linha de baixo quando a passagem termina a linha. Imagem da lança, sanfona em estudos públicos e vídeos continuam como na entrada anterior. Nenhum commit, push ou publicação.

## 2026-11-12 11:22 -0400 — “Ouvir” lia o que não se vê e podia seguir por trechos que sumiam da página

**Autor:** Valter, com Claude. O dono, ouvindo o estudo, disse que havia parte que ele ouvia e não via na tela, e perguntou onde estava. Toca arquivos públicos do leitor (`listen-dom.ts`, `topic-head.ts`, `rich-text.ts`, `article.ts`, `e2e/ouvir.spec.ts`, `CLAUDE.md`).

**Diagnóstico (no navegador, com um sintetizador de voz simulado):** (1) Com tudo aberto pelo “Ouvir”, os 315 trechos lidos estão visíveis; nenhum escondido. (2) **Causa 1, achada e provada:** a narração lia o texto inteiro dos novos cabeçalhos da sanfona, inclusive o tempo e o nome do ícone: “À Mesa com o Traidor, 8 min, expand more” (12 tópicos) e “Saiba mais, Quando Foi Tudo Isso?, expand more” (6 seções). O “expand more” é o nome da seta, que na tela aparece só como desenho, então a pessoa ouvia o que não via. (3) **Causa 2, deduzida do código (não consegui reproduzir o caso exato do dono, que não disse qual trecho):** durante a leitura, tocar no título de um tópico fechava os outros; como a sanfona destrói os blocos fechados, a narração seguia por trechos que já não estavam na página, e o destaque e a rolagem do “Ouvir” não tinham onde acontecer.

**Correções:** (1) `storyText` (em `listen-dom.ts`) tira os nomes de ícones (`mat-icon`) e tudo o que leva `data-nolisten` do texto falado; o tempo de leitura e os rótulos “Saiba mais” e “Próximo tópico” ganharam essa marca. (2) Com o “Ouvir” ligado, `RichText [keepOpen]` impede que qualquer coisa feche: um toque no título só leva até ele, e uma dobra aberta não fecha. (3) Fora da leitura, tocar num tópico aberto agora fecha **só ele** (antes fechava todos, o que surpreendia quando vários estavam abertos).

**Validação:** no estudo real, celular e computador: fala “À Mesa com o Traidor” e “Quando Foi Tudo Isso?” sem ícone, tempo nem rótulo; durante a leitura, tocar em dois títulos e numa dobra deixa os 12 tópicos abertos e a dobra aberta, e o trecho destacado continua na página e visível; depois de parar, fechar o 5º deixa 11 abertos. Teste novo permanente em `e2e/ouvir.spec.ts` (numa história pública: o título com ícone e rótulo marcado é falado sem eles). Lint limpo; 182 testes de lógica e 17 de navegador (ouvir e leitura) passam, 1 ignorado de antes.

**Pendências:** o dono dizer qual trecho ouviu sem ver, se o problema persistir (para eu reproduzir o caso exato); integrar a imagem da lança quando ele decidir; oferecer a sanfona a estudos públicos longos; vídeos em pausa. Nenhum commit, push ou publicação.

## 2026-11-12 10:42 -0400 — Pedido de imagem realista da lança, com a altura correta, para o Codex

**Autor:** Valter, com Claude. O dono avisou que o Codex está fazendo uma imagem e um GIF da lança na cruz com a altura correta e pediu que eu desse recomendações de dados para ele chegar perto do realismo, inclusive o sangue escorrendo depois da lança. Só foi escrito um pedido no arquivo privado `analises/pedidos-de-imagem-para-o-chatgpt.md` (novo item 7, que substitui o item 6); nada de código, imagem ou estudo foi alterado, e a figura da lança atual não foi tocada.

**O que o pedido traz:** a tabela de medidas do parágrafo do estudo em proporção ao soldado (poste de 2,4 m com o topo ≈ 0,7 m acima do capacete; pés a 30–60 cm do chão; lado do corpo a 1,4–1,8 m, ao alcance de um soldado de pé sem escada; lança de cerca de 2 m como escolha artística, sem fonte), o enquadramento (câmera de lado, à altura dos olhos do soldado, do chão ao topo do poste), o realismo de corpo, pele, madeira, pano, armadura e luz (fim de tarde, céu grosso, antes do pôr do sol), as duas outras cruzes uma de cada lado (Jo 19.18), mãos sem cravo visível, e uma sequência de seis quadros para o sangue e a água de Jo 19.34: gota no flanco, filete escuro de 20 a 30 cm descendo por gravidade com um fio claro e aquoso ao lado, e a gota na borda do pano. GIF de 6 quadros, 3 s nos três primeiros e 4 s nos três últimos, com pausa no fim. Inclui um prompt em inglês, o plano B se o gerador recusar (só uma linha fina de sangue, pintura a óleo, proporções acima de tudo) e a lista do que o Claude vai medir em pixels na chegada.

**Decisões:** (1) a regra do projeto foi mantida no pedido: realismo na pele, na madeira, na luz e no escorrer lento, mas sem ferida aberta, tecido à mostra, corte anatômico, trajetória interna, jorro nem diagnóstico. (2) O pedido diz que as proporções importam mais que a quantidade de sangue, para a altura continuar batendo com o texto. (3) O comprimento da lança e a altura de 1,70 m do soldado são parâmetros artísticos e estão marcados assim.

**Pendências:** receber a imagem e o GIF do Codex, integrar na figura da lança com a miniatura, ajustar a legenda (tirar o aviso dos cravos se a imagem não mostrar mais cravo), medir as proporções, refazer os testes da figura e registrar. Vídeos em pausa. Nenhum commit, push ou publicação.

## 2026-11-12 09:58 -0400 — Sanfona, passo 2: “Saiba mais” nas notas de medicina e nas seções de análise

**Autor:** Valter, com Claude, a pedido do dono (“faz ai e me mostra”), continuando a entrada anterior. Cópia do estudo antes das marcas em `analises/do-getsemani-copia-antes-das-dobras.md`. Toca arquivos públicos (`rich-text-parser.ts`, `rich-text.ts`, `topic-sections.ts`, `topic-head.ts`, `article.ts`, `e2e/logica/sanfona.spec.ts`, `CLAUDE.md`), mas só tem efeito na sanfona, que só liga em estudos privados longos.

**O que foi feito:** (1) As 10 notas de medicina viram uma linha “SAIBA MAIS · A medicina explica” no mesmo lugar do texto; ao tocar, a nota abre logo abaixo. (2) Nova linha `:::dobra` (uma linha, sem fechar), logo abaixo de um título `###`, que dobra a seção dele até o próximo título (`foldRanges`); fora da sanfona o bloco não desenha nada. Marquei seis seções de contexto e de fontes: “Quando Foi Tudo Isso?”, “As Idas e Vindas da Ceia ao Gólgota”, “A Lei Judaica e o Costume Romano”, “O Testemunho das Fontes Antigas”, “O Instrumento” e “Que Horas Eram?”. Ficaram à vista “O Relato dos Evangelhos” (é o relato), “A Lei Cumprida na Cruz” (conteúdo que o dono pediu) e “A Razão de Tudo Isso” (o fecho); cada dobra é uma linha, e o dono troca quando quiser. (3) O “Ouvir” abre também as dobras (`openAll`), porque lê tudo.

**Medida no celular:** com um tópico aberto por vez e as dobras fechadas, os tópicos têm de 1,3 a 10,3 telas (soma 62,8; eram 75 com tudo aberto). O ganho maior continua sendo a sanfona dos tópicos (4,2 telas com tudo fechado); as dobras tiram cerca de 12 telas do que a pessoa não abre.

**Defeito achado e corrigido (importante):** abrir o último tópico marcava a história como **lida** sem ninguém ler. O rastro de gravações mostrou a causa: ao tocar no 12º, o 1º (grande) fecha no mesmo instante, a página encolhe uns 7 telas e, por um quadro, a posição de rolagem fica além do fim do texto; nesse quadro a conta concluía “fim alcançado”. Remédio: `RichText.settling` pausa a gravação do progresso por 900 ms a cada abrir ou fechar (tópico, dobra, “Próximo”, retomar, “Ouvir”), e um tópico sem o texto desenhado conta como fechado. Conferido: abrir o 12º deixa o progresso em ≈ 0,95 e sem o banner “Você já leu”, abrir os tópicos de 1 a 11 também, e chegar ao fim do 12º marca como lida. Registrado no CLAUDE.md.

**Validação:** lint limpo; 182 testes de lógica passam (4 da sanfona, incluindo as dobras); 61 testes de navegador (leitura, ouvir, histórias ligadas, compartilhar) passam no celular e no computador, com 1 ignorado de antes; build de produção sem aviso (inicial 1,01 MB) e trava de publicação limpa. No Chrome, no estudo real: 6 dobras de análise e 10 de medicina (16 linhas “Saiba mais”), todas fechadas ao abrir, alvos de 52 px ou mais, letra de 13 px ou mais, “Ouvir” abre os 12 tópicos e as 16 dobras, sem erro e sem rolagem horizontal. Capturas em `analises/previas-sanfona/` (5 a 8).

**Pendências:** oferecer a sanfona a estudos públicos longos; o dono dizer se prefere a variante da lança sem cravo visível; vídeos em pausa. Nenhum commit, push ou publicação.

## 2026-11-12 09:40 -0400 — Sanfona por tópico no estudo da Paixão e a altura da cruz

**Autor:** Valter, com Claude. Dois pedidos do dono: (1) o estudo cansa no celular (“a pessoa rola muito”) e ele sugeriu sanfona por tema, abas ou outra ideia; (2) acrescentar a que altura ficava a cruz e o condenado, para a cena da lança, em metros ou altura média. Esta entrada toca arquivos públicos (`rich-text.ts`, `article.ts`, `topic-sections.ts`, `topic-head.ts`, `e2e/logica/sanfona.spec.ts`, `CLAUDE.md`), mas a sanfona só liga em estudos privados com 8 tópicos ou mais; nenhuma história pública muda.

**Medida que motivou:** no celular (412 × 839 px, letra de 19 px) o estudo tinha 75 telas de rolagem; 71% eram parágrafos corridos, 15% diálogos, 6% notas de medicina. As 35 cenas somavam 43,6 telas e as 12 subseções de análise 18,2. Há 25 parágrafos com mais de 100 palavras.

**Sanfona por tópico:** cada `##` virou um cartão (título, tempo de leitura, seta) que abre e fecha o trecho dele. O primeiro tópico começa aberto; abrir outro fecha o anterior e leva o título a 84 px do alto, abaixo da barra; no fim de cada tópico aberto há “Próximo tópico”. Resultado medido no celular: 13,3 telas com o primeiro aberto, 4,2 telas com tudo fechado (eram 75). Decisões: (1) os blocos fechados não são desenhados (um `@if`, sem caixas em volta), para o CSS do modo história, que seleciona filhos diretos, continuar valendo. (2) O progresso (“Continuar de onde parou”, “faltam N min”, história lida) passou a ser medido pelas **palavras**, e não pela altura da página, que muda quando os tópicos abrem e fecham; com a medida antiga, tudo fechado marcaria a história como lida. Conferido: no 5º tópico de 12 o progresso salvo fica em ≈ 0,42 e a história não fica “lida”. (3) “Ouvir” abre todos os tópicos antes de começar, porque lê o texto inteiro. (4) O estilo do cartão ficou num componente próprio (`topic-head.ts`), porque o `rich-text.scss` já está perto do limite de 16 kB. (5) A sanfona mostra os 12 títulos de uma vez, o que difere da regra da capa de história (“sem índice, o leitor descobre cada tópico”); foi escolha do dono para o estudo longo, e ficou escrito no CLAUDE.md. Não feito ainda: dobrar as notas de medicina e as subseções de análise dentro de cada tópico (“Saiba mais”), e oferecer a sanfona a estudos públicos longos.

**Altura da cruz (texto novo em “A Lança”):** os Evangelhos não dão a altura. Fontes lidas hoje: a *Encyclopedia of the Bible* (Zondervan, verbete “Crucifixion”, no BibleGateway) diz que o poste era em geral pouco mais alto que um homem e estima a cruz de Jesus em sete a nove pés (2,1 a 2,7 m) pelo comprimento da cana de cerca de três pés (Jo 19.29); uma página didática do Boston College fala em cruzes com os pés “um pé ou dois” acima do chão (30 a 60 cm). A Britannica, que a busca apontou com trave a 9–12 pés, bloqueia leitura automática (403) e **não foi lida**; não foi contornado. O parágrafo dá as duas estimativas, a média de 2,4 m para o poste e, supondo um homem de 1,65 m, pés a algumas dezenas de centímetros do chão e o lado do corpo a 1,4 a 1,8 m, ao alcance de um soldado de pé; diz que é conta de ordem de grandeza feita para o estudo, não dado dos textos. As duas fontes entraram no catálogo privado, com o que foi lido e o que não foi.

**Validação:** lint limpo; 181 testes de lógica passam (3 novos, da sanfona); 113 testes de navegador das histórias (leitura, ouvir, histórias ligadas, estudo) passam no celular e no computador; build de produção sem aviso (inicial 1,01 MB) e trava de publicação limpa. No Chrome, no estudo real: 12 cartões, só o 1º aberto, abrir o 4º fecha o 1º, “Próximo tópico” abre o 5º, fechar deixa tudo fechado, “Ouvir” abre os 12, alvos de 56 px e letra de 13 px ou mais, sem erro nem rolagem horizontal. Capturas em `analises/previas-sanfona/`.

**Pendências:** o segundo passo da sanfona (dobras “Saiba mais”) e se ela vale para estudos públicos; o dono dizer se prefere a variante da lança sem cravo visível; vídeos em pausa. Nenhum commit, push ou publicação.

## 2026-11-12 09:05 -0400 — Revisão da figura “A Lança” (de outra mão)

**Autor:** Valter, com Claude, a pedido do dono de revisar a figura `paixao-lanca`, acrescentada hoje de manhã por outro agente (notas em `analises/lanca-ilustracao-gif.md`). Cópia do estilo anterior em `analises/passion-story-copia-antes-do-piso-de-13px.scss.txt`.

**O que está certo:** os quatro momentos seguem João 19.31–37 (Jesus já morto e imóvel desde o primeiro quadro; a lança vem depois; contato discreto; “sangue e água” só como traço mínimo no último), as quatro fases batem com as imagens, o texto de cada fase diz o que o Evangelho diz e declina de dar causa médica, a legenda no estudo e o aviso de “Ilustração gerada por IA” estão corretos, a ordem no estudo (depois do parágrafo de A Lança, antes da nota de medicina) é a pedida. O GIF tem os mesmos quatro quadros da folha (diferença média de 1,6/255, só da paleta), 768 × 512, 4 s por quadro e repete sem parar; o link de baixar responde 200 com `image/gif`. No Chrome a cena avança sozinha, a pausa segura o quadro, “Recomeçar” volta ao primeiro, os botões de fase trocam a explicação e, com movimento reduzido, ela começa pausada.

**Três problemas achados e tratados:** (1) **Acessibilidade:** o componente compartilhado `passion-story` (Malco, Anás, rosto, chicote, coroa e lança) tinha texto de 10 a 12 px e o link “Baixar GIF da cena” com 29 px de altura, abaixo dos pisos do projeto (13 px e 40 px; esses testes só rodam nas páginas públicas, por isso nada acusava). Subi todos os tamanhos para 13 px ou mais e o link passou a 44 px; conferido nas seis figuras, nos dois tamanhos de tela, com contraste de 8,6:1 a 11,8:1. (2) **Trava de publicação:** `paixao-lanca` e `paixao-placa` não estavam na lista de identificadores privados de `tools/verificar-publicacao.mjs`, então o código dessas figuras não seria barrado se vazasse para um build público sem as imagens; entraram na lista, com dois casos novos em `e2e/logica/rascunhos.spec.ts`. (3) **Cravos:** a folha mostra a cabeça do cravo atravessando a palma das duas mãos; o estudo diz que os pregos entravam “nos pulsos (ou antebraços)” e a regra do projeto é não representar posição específica de cravo. Por ora a legenda da figura da lança ganhou o aviso “Os cravos aparecem nas mãos, como na imagem tradicional; a posição exata não é conhecida, e o estudo discute pulsos e antebraços”; a imagem não foi alterada e o pedido de uma variante sem cravo visível ficou pronto, como opcional, em `analises/pedidos-de-imagem-para-o-chatgpt.md` (item 6).

**Observação sem correção:** as duas outras cruzes aparecem juntas ao fundo, à direita, e não uma de cada lado de Jesus (Jo 19.18); é escolha de composição da imagem, coberta pela legenda “reconstituição artística”.

**Validação:** lint limpo; 178 testes de lógica passam; trava de publicação limpa no build recente (sem falso alarme com os ids novos); verificações no Chrome já descritas, sem erro de console nem de rede e sem rolagem horizontal.

**Pendências:** o dono decidir se pede a variante da lança sem cravo visível. Vídeos em pausa. Nenhum commit, push ou publicação.

## 2026-11-12 08:55 -0400 — A hora das cenas entra no cartão de compartilhar

**Autor:** Valter, com Claude, a partir do pedido “linha de hora no cartão” (pendência de 11/11: decidir se a linha de hora aparece no cartão de compartilhar). Esta entrada toca arquivos públicos (`src/app/core/share-card.ts`, `src/app/shared/share-render.ts`, `e2e/logica/compartilhar.spec.ts`, `CLAUDE.md`), mas só o estudo da Paixão usa `:::hora`, então nenhum outro cartão muda.

**O que foi feito:** (1) `shortWhen` (puro, em `share-card.ts`) encurta a linha de hora, que é texto livre, para dia e primeira marca de hora: “Quinta-feira · ao anoitecer, por volta das 18h” → “Quinta, 18h”; “antes das 9h”; “entre a meia-noite e as 3h” → “0h–3h”; “das 9h ao meio-dia” → “9h–12h”; sem hora marcada, fica o período (“de noite”, “à tarde”); “De sexta a domingo” → “Sexta a domingo”. (2) `articleCard`: um subtópico (`###`) logo seguido de `:::hora` ganha a hora **na frente** (“Quinta, 18h · O Cenáculo”); os tópicos (`##`) nunca levam hora, para continuarem sendo as perguntas que despertam curiosidade, e as fichas também não. (3) `share-render.ts`: o desenhista não limitava a largura de um subtópico de uma linha só (`clampLines` devolve a linha inteira quando ela é única), então uma linha longa vazaria da imagem; ganhou `oneLine`, que corta com reticências pela largura medida. (4) Dois testes novos no mesmo arquivo dos outros do cartão: a forma curta de 14 linhas de hora reais e o cartão com hora, com título comprido.

**Decisões:** (1) A hora vai antes do título porque, se a linha estourar, o que se corta é o fim do título e não a hora; foi o que se viu na imagem real: com a hora no fim, o Anás perdia “0h–3h”. (2) O limite de letras por subtópico (`SUB_CHARS = 67`) saiu de medir a imagem de verdade (cabem uns 66 a 69 caracteres na largura de 876 px); o único corte que sobra é o do título de Anás (“…o Sumo Sac…”). (3) Só os dois primeiros subtópicos de cada tópico aparecem (regra antiga do cartão), então nem toda cena aparece. (4) Não houve entrada em `RELEASES`: não há mudança visível no app público.

**Validação:** lint limpo; 178 testes de lógica passam (um novo); os 19 testes do painel de compartilhar no celular passam; build de produção sem aviso (inicial 1,01 MB, abaixo do aviso de 1,05 MB) e trava de publicação limpa. Imagem real do estudo gerada no Chrome, feed 1080 × 1350 e Stories 1080 × 1920, com as horas de 14 cenas; capturas em `analises/previas-cartao/`.

**Pendências:** a figura `paixao-lanca` (de outra mão) sem revisão minha. Vídeos em pausa por decisão do dono. Nenhum commit, push ou publicação.

## 2026-11-12 08:46 -0400 — Vídeos contínuos em pausa por decisão do dono

**Autor:** Valter, com Claude. O dono disse “vamos deixar o vídeo quieto”. Os cinco vídeos contínuos (sistema nervoso, Malco, Anás, rosto coberto, açoites) deixam de ser pendência: nada foi gerado, enviado ou cobrado, e os pedidos prontos ficam guardados em `analises/pedidos-de-video-weave.md`, agora marcado como “em pausa”. Só retomam se o dono pedir; as imagens e animações atuais da coleção seguem como estão. Pendências que continuam abertas: se a linha de hora aparece no cartão de compartilhar; a figura `paixao-lanca` (de outra mão) sem revisão minha. Nenhum commit, push ou publicação.

## 2026-11-12 08:45 -0400 — “Salve, rei dos judeus!” ganha fala e referências próprias

**Autor:** Valter, com Claude, a partir do “sim” do dono à pendência “dar a referência própria a ‘Salve, rei dos judeus!’” (entrada de 11/11 09:10, em que a citação estava certa mas sem referência dela). Só o estudo privado foi tocado.

**O que foi feito:** a saudação dos soldados está nos três Evangelhos que contam a zombaria, com as mesmas palavras na Almeida do app: Mt 27.29, Mc 15.18 e Jo 19.3. Em “A Coroa e a Cana” ela virou uma fala própria, no formato dos outros diálogos do estudo (`:::dialogo A Saudação dos Soldados`, falante “Os soldados”), com as três referências, uma por Evangelho: o parágrafo da visão de Jesus termina em “…e se ajoelha para saudá-lo:”, vem a fala, e o parágrafo continua em “Depois toma a cana de volta…”. O trecho de análise, que citava Mt 27.29 inteiro e repetia a saudação, passou a terminar a citação em “…o escarneciam”, para a saudação ter um lugar só (hoje aparece uma vez no estudo).

**Decisões:** (1) a fala tem as três referências porque as três dizem exatamente isso; Mt 27.29 vem primeiro por ser o relato mais completo da cena. (2) Diálogo de uma fala só já tinha precedente no estudo (Judas, Mt 27.4). (3) O “Ouvir” lê “Os soldados: Salve, rei dos judeus!”.

**Validação:** o estudo passou a ter 18 diálogos e 83 falas, todas trecho exato da Almeida; as citações entre aspas seguidas de referência continuam exatas; 50 blocos `:::` abertos e 50 fechados; lint limpo e 177 testes de lógica passam; no Chrome, a 412 e 1366 px, o bloco aparece com as três referências clicáveis, sem erro de console ou de rede e sem rolagem horizontal. Captura privada em `analises/previas-saudacao/`.

**Pendências:** o dono habilitar um plano de vídeo para os cinco vídeos; se a linha de hora aparece no cartão de compartilhar; a figura `paixao-lanca` (de outra mão) sem revisão minha. Nenhum commit, push ou publicação.

## 2026-11-12 08:35 -0400 — Mt 26.63 corrigido na Almeida; vídeos do Weave continuam bloqueados pelo plano

**Autor:** Valter, com Claude, a partir do pedido do dono de tratar o Mt 26.63 e os vídeos do Weave. Este é o único item do dia que toca arquivos públicos (`public/bible/almeida/MAT.json` e `tools/gerar-almeida.py`), por ser texto bíblico.

**Mt 26.63:** o app dizia “se tu és o Cristo, o Filho do Deus.” Comparei com as outras seis versões em português que o app embute (Almeida 1911, BLivre, NBV, BPM, BLT, NVA): todas dizem “o Filho de Deus”, e “do Deus” só aparece onde Deus leva adjetivo (Mt 16.16 “do Deus vivo”). Os outros seis “Filho(s) do Deus” da Almeida do app (Mc 5.7, Lc 8.28, Mc 14.61, Os 1.10, Rm 9.26 e Mt 16.16) têm adjetivo e ficam como estão; só o Mt 26.63 destoa. Entrou em `VERSE_FIXES` (“o Filho do Deus.” → “o Filho de Deus.”, com o motivo em comentário) e foi aplicado por `tools/corrigir-almeida.py`; a comparação com o último commit mostra uma única diferença nova, em Mt 26.63. No estudo, a fala de Caifás, que estava cortada em “…o Cristo…” por causa do erro, voltou inteira: “Conjuro-te pelo Deus vivo que nos digas se tu és o Cristo, o Filho de Deus.” (trecho exato do versículo). Nenhuma citação da redação antiga em `public/`, `src/` ou `e2e/`.

**Vídeos do Weave:** nada foi gerado, enviado ou cobrado. (1) Nova cotação de Veo 3.1 Image to Video, sem `acknowledgedCost` e com uma imagem pública (Tissot, domínio público) para não enviar nada privado, voltou com o mesmo erro de 10/11: modelos de vídeo só em plano pago. (2) A alternativa avaliada, o vídeo do ElevenLabs (Veo, Kling, Seedance, Runway), também foi recusada por plano; as duas cotações tentadas deixaram dois fluxos vazios na conta dele (ids no relatório) que o dono pode apagar. (3) O registro do envio de 10/11 sumiu do `/tmp` nas quedas de energia: rodar exigirá reenviar a prancha, com nova autorização. (4) Assinar plano é decisão do dono; não foi feito. Ficou pronto `analises/pedidos-de-video-weave.md`: estado, ordem para retomar (cotar, pedir aprovação do custo a cada execução, pedir autorização por arquivo, assistir ao vídeo inteiro), parâmetros comuns, quadros inicial e final de cada um dos cinco vídeos (grade 2 × 2 de 768 × 512) e rascunhos de prompt para Malco, Anás, rosto coberto e açoites, nunca executados.

**Validação:** lint limpo e 177 testes de lógica passam com o texto novo da Almeida; a fala de Caifás é trecho exato de Mt 26.63; 50 blocos `:::` abertos e 50 fechados.

**Pendências:** o dono habilitar um plano de vídeo (Weave ou ElevenLabs) para os cinco vídeos; se a linha de hora aparece no cartão de compartilhar; a referência própria de “Salve, rei dos judeus!”; a figura `paixao-lanca` (de outra mão) sem revisão minha. Nenhum commit, push ou publicação.

## 2026-11-12 08:35 -0400 — Nascer e pôr do sol de Jerusalém calculados, com fonte

**Autor:** Valter, com Claude, a partir do “sim” do dono à pendência “achar uma fonte lida para o nascer e o pôr do sol de Jerusalém”. Nada disto toca `src/` nem `public/`. O relatório completo está em `analises/sol-em-jerusalem.md` e o cálculo em `analises/sol-em-jerusalem.py` (só biblioteca padrão).

**O que foi feito:** o estudo dizia “o sol nasce por volta das seis e se põe por volta das seis”, sem fonte. No século I a hora era solar e o dia ia do nascer ao pôr do sol em 12 partes, então o que importa é a posição do Sol na data, não tabela de relógio de hoje. Calculei com as coordenadas do Sol de Meeus (*Astronomical Algorithms*, caps. 7, 25 e 28), ΔT do polinômio de Espenak e Meeus (NASA) e altura de −50′ no horizonte. Conferi o método numa data de hoje (7/4/2026) com duas fontes abertas lidas hoje, as equações do NOAA e o *Almanac for Computers* do USNO: os três ficam a um minuto uns dos outros (nascer 05h39–05h40, pôr 18h20–18h21). Resultado para as duas sextas-feiras de 14 de nisã possíveis no governo de Pilatos: 7 de abril do ano 30, nascer 05h41, pôr 18h19; 3 de abril do ano 33, nascer 05h45, pôr 18h16; dia de cerca de 12h35, “hora” de 63 minutos, fim da hora terceira por volta das 8h50, sexta ao meio-dia, nona por volta das 15h10. Uma semana de diferença na data muda o horário em cerca de sete minutos; ΔT (2,9 h no ano 30) muda o nascer em 7 segundos.

**No estudo:** (1) “Que Horas Eram?”: o parágrafo agora diz 5h40 e 18h20 em hora solar, as marcas das horas terceira, sexta e nona, que os títulos arredondam, e que o cálculo vale para as duas datas (Humphreys e Waddington, 1983); (2) as linhas da tabela passaram a “cerca das 5h40” e “cerca das 18h20”; (3) a introdução do quadro de dias e a cena “As Trevas ao Meio-Dia” trocaram “seis” por 5h40; (4) o catálogo privado ganhou cinco fontes (Humphreys e Waddington, Meeus, NOAA, USNO, Espenak e Meeus), cada uma dizendo o que foi lido.

**Decisões:** (1) as linhas de hora dos títulos continuam em horas cheias (“por volta das 6h”, “por volta das 9h”…), porque o estudo agora diz que arredondam; “amanhecer” (a luz começa por volta das 5h15) e “manhã cedo” cabem entre 5h15 e 6h. (2) O livro de Meeus não foi lido nesta sessão, só as fórmulas que dele vêm (por isso a conferência com NOAA e USNO) e o artigo de Humphreys e Waddington foi conferido por resumos; as duas coisas estão ditas na ficha da fonte. (3) O estudo não escolhe entre os anos 30 e 33, e o cálculo não prova data nenhuma.

**Validação:** lint limpo e 177 testes de lógica passam; no Chrome, a 412 e 1366 px, o texto novo aparece (5h40 em quatro pontos, 18h20 em dois), as cinco fontes aparecem na lista, nenhum “por volta das seis” sobrou, sem erro de console ou de rede e sem rolagem horizontal; 50 blocos `:::` abertos e 50 fechados.

**Pendências:** decidir se a linha de hora aparece no cartão de compartilhar; Mt 26.63 e a referência própria de “Salve, rei dos judeus!”; vídeos do Weave; a figura `paixao-lanca` (de outra mão) segue sem revisão minha; ler o livro de Meeus ou outra fonte impressa de astronomia se o dono quiser a citação sem a ressalva. Nenhum commit, push ou publicação.

## 2026-11-12 08:20 -0400 — O estudo passa a se chamar “Da Ceia à Ressurreição” e o mapa começa no cenáculo

**Autor:** Valter, com Claude, a partir do “sim” do dono às duas pendências abertas na entrada anterior (título e cenáculo no mapa). Cópias anteriores em `analises/passion-route-copia-antes-do-cenaculo.ts.txt`, `analises/jerusalem-geo-copia-antes-do-cenaculo.ts.txt` e `analises/gerar-jerusalem-copia-antes-do-cenaculo.py`. Nada disto toca `src/` nem `public/`.

**O que foi feito:** (1) Título: “Do Getsêmani à Ressurreição” virou “Da Ceia à Ressurreição” no catálogo, no cabeçalho e na linha de apoio da figura de abertura; o id `do-getsemani-a-ressurreicao` ficou como estava, porque a trava de publicação e os arquivos dependem dele. A faixa do mapa passou a “Do cenáculo ao sepulcro, em Jerusalém”. (2) Mapa: o Cenáculo deixou de ser só ponto de referência e virou a etapa 1 (“A ceia no cenáculo”); o trecho a pé do cenáculo ao Getsêmani veio do roteador do OpenStreetMap (perfil a pé), pedido em 12/11/2026 e guardado em `analises/dados-jerusalem/rota-cenaculo-getsemani.json`; o gerador `gerar-jerusalem.py` ganhou esse caminho e regerou `jerusalem-geo.ts` (a diferença para o arquivo anterior é só a linha nova; os outros cinco trechos saíram idênticos). O mapa tem agora nove etapas, quatro trechos (`LEG_END = [1, 2, 3, 6]`) e cinco linhas na tabela de quilômetros. Números: cenáculo ao jardim, 1,77 km a pé (1,29 em linha reta); do cenáculo ao Gólgota, 5,87 km a pé com o pretório na Fortaleza Antônia (3,90 em linha reta) e 5,03 km com o pretório no palácio de Herodes (3,41); do jardim ao Gólgota continua em 3,3 a 4,1 km, como o texto já dizia. (3) Texto: a legenda do mapa (“nove etapas, do cenáculo ao sepulcro”), o parágrafo dos quilômetros (agora com o trecho do cenáculo e o total de 5,0 a 5,9 km) e a cena “O Hino e o Caminho” (“1,3 km em linha reta e 1,8 km a pé”).

**Erro achado e corrigido no caminho:** a cena “O Cenáculo” dizia que o cenáculo fica no monte Sião “dentro dos muros de hoje”. Pelas coordenadas do próprio mapa, ele fica a cerca de 110 m ao sul da muralha de hoje, ou seja, do lado de fora; o texto agora diz “do lado de fora das muralhas de hoje, ao sul da Cidade Antiga”.

**Decisões:** (1) o cenáculo e a casa de Caifás continuam marcados como localização debatida (“?”). (2) O caminho do cenáculo ao jardim é o das ruas de hoje, como os outros; a tradição de uma escadaria antiga ao lado da igreja de Gallicantu não foi usada, porque o roteador não a conhece. (3) O título de cena “O Getsêmani, de noite” da figura de abertura não mudou: só o rótulo do estudo.

**Validação:** lint limpo e 177 testes de lógica passam; a prévia compilou sem erro; no Chrome a 412 e 1366 px o mapa mostra nove etapas, a etapa 1 com “Começa no cenáculo · até o Gólgota ≈ 5,87 km a pé”, a tabela com cinco linhas nas duas hipóteses do pretório, nenhum erro de console ou de rede e nenhuma rolagem horizontal; 50 blocos `:::` abertos e 50 fechados. Capturas em `analises/previas-cenaculo/`.

**Pendências:** achar uma fonte lida para o nascer e o pôr do sol de Jerusalém; decidir se a linha de hora aparece no cartão de compartilhar; Mt 26.63 e a referência própria de “Salve, rei dos judeus!”; vídeos do Weave. A figura `paixao-lanca` (de outra mão) continua sem revisão minha. Nenhum commit, push ou publicação.

## 2026-11-12 08:12 -0400 — Horas completas, a lei da expiação cumprida, coroa com base, peso em kg e Simão de Cirene em destaque

**Autor:** Valter, com Claude, a partir de seis pedidos do dono sobre o estudo privado da Paixão. Cópia anterior em `analises/do-getsemani-copia-antes-das-correcoes-de-12-nov.md`. Nada disto toca `src/` nem `public/`; tudo está em `rascunhos/` (fora do Git) e neste diário.

**O que foi feito:** (1) “o texto não dá a hora” saiu das três linhas de hora e da frase da introdução do quadro de dias; a linha do tempo “As Idas e Vindas…” deixou de usar “Noite” em quatro marcadores e passou a ter dia e hora iguais aos dos títulos das cenas (“Quinta · por volta das 18h”, “Antes do galo · entre 0h e 3h”… “Sexta · por volta das 9h”); Herodes e Pilatos pela segunda vez ficaram com “de manhã, antes das 9h”. (2) A lei da expiação entrou em cinco pontos: em “Quem Julgou Jesus?”, o rito dos dois bodes do Dia da Expiação ao lado da troca de Barrabás (Lv 16.8-10, 21-22); no fim de “Simão, o Homem que Vinha do Campo”, Jesus crucificado fora da cidade (Jo 19.20; Hb 13.11-12; Lv 16.27); em “O Véu e o Centurião”, o véu e o sangue levado uma vez por ano ao Santo dos Santos (Hb 9.7, 9.12, 10.19-20); em “A Lança”, o osso não quebrado como o cordeiro da páscoa (Êx 12.46; Jo 19.36); e uma subseção nova, “A Lei Cumprida na Cruz”, com um cartão `:::ficha` que lista o que a lei pedia e o que o Novo Testamento diz de Jesus: a páscoa, a oferta do Dia da Expiação, o bode vivo, o corpo levado para fora, a novilha vermelha e o holocausto. (3) Coroa de espinhos: o trecho de Mt 27.29 é a Almeida exata; o parágrafo foi reescrito com a base (Mt 27.29, Mc 15.17, Fílon sobre Carabás em Alexandria, ano 38, com o papiro por diadema e por cetro) e perdeu o que nenhum texto traz (“paródia calculada”, “Ave, Caesar”, “ramos secos e duros”, “trançados por mãos que conhecem o ofício”, a cana “como cetro”, o salmo que “lhe volta à memória”); o manto escarlate ganhou “deve ter sido” a capa do soldado, por ser identificação e não dado. (4) O peso da trave passou a “30 a 50 kg” nas duas menções. (5) Simão de Cirene: pintura de James Tissot (Brooklyn Museum, domínio público, via Wikimedia Commons; arquivo `paixao-anatomia-simao-cirene-tissot.jpg`, moldura cinza do museu cortada) antes do parágrafo que a ilustra, e o cartão “Simão de Cirene” (quem era, onde estava, Cirene em Jerusalém, o que vem depois, o que o texto não diz); os parágrafos que repetiam Cirene e Rufo foram enxugados. (6) O catálogo privado ganhou as passagens novas nas fontes e o crédito da pintura.

**Decisões:** (1) A comparação Barrabás–bode vivo é leitura de leitores cristãos, dita uma vez como tal; o Novo Testamento não cita o bode vivo, e o cartão diz isso. O que tem base direta no texto é o corpo levado para fora (Hb 13.11-12), a páscoa (1Co 5.7), o Dia da Expiação (Hb 9) e a novilha (Hb 9.13-14). (2) O cartão substituiu uma tabela de três colunas: no celular a terceira coluna saía cortada e exigia rolar de lado. (3) Os verbetes do app (Dia da Expiação, expiação, Cordeiro de Deus, páscoa, propiciatório) e a profecia do osso não quebrado entram como ligação, sem recontar, e cada destino é ligado uma vez só. (4) O crédito da pintura vai na legenda e nas fontes privadas; `credits.ts` e `CREDITOS.md` são públicos e só ganham a linha na hora de publicar. (5) “Aqui seria 30 e 50 quilos” foi lido como a unidade do peso da trave (kg); o “tiro de pedra” segue em metros. Se o dono falava de outro ponto, é só dizer.

**Validação:** lint e 177 testes de lógica passam (feitos antes desta etapa, sem mudança em `src/`); verificação provisória, já apagada: 408 referências existem na Almeida, 186 citações e 82 falas são texto exato dela (29 citações a mais que antes), 50 blocos `:::` abertos e 50 fechados, links internos existem e cada um aparece uma vez, títulos e tópicos no padrão, foto e miniaturas existem; Chrome a 412 e 1366 px: 39 linhas de hora, nenhum “o texto não dá a hora” na tela, foto carregada, cartões legíveis, sem rolagem horizontal e sem erro de console ou de rede. Capturas privadas em `analises/previas-pedidos-12-nov/`.

**Pendências:** a figura `paixao-lanca` e a miniatura dela foram acrescentadas por outra mão (provavelmente o Codex) no meio desta sessão; conferi que existem e abrem, mas não revisei a imagem. O título ainda é “Do Getsêmani à Ressurreição”. As demais pendências do dia continuam abertas. Nenhum commit, push ou publicação.

## 2026-11-12 07:35 -0400 — Revisão geral depois das quedas de energia

**Autor:** Valter, com Claude, a pedido do dono: conferir se alguma coisa ficou pela metade nas quedas de energia dos dias 10 e 11.

**O que foi conferido (tudo sem mexer no que já estava certo):** (1) lint limpo, 177 testes de lógica e build de produção sem aviso (feito fora do `dist/`); a trava de publicação não achou nenhum identificador privado no build. (2) As 12 correções de `VERSE_FIXES` estão aplicadas nos cinco livros da Almeida e nada mais mudou: comparação versículo a versículo com o `HEAD`, mesma numeração, JSON válido. (3) No estudo privado, os 47 blocos `:::` que pedem fechamento fecham, nenhum trecho cortado ou parágrafo repetido, as 364 referências existem na Almeida, as 157 citações entre “…” seguidas de referência e as 82 falas dos diálogos são texto exato dela. Figuras, cartões `:::leia`, fotos, capa e miniaturas existem; os 12 títulos de seção batem com os tópicos do catálogo; 39 linhas de hora. (4) No Chrome, a 390 e 1366 px, o estudo abre, rola inteiro, abre as 11 figuras, não tem rolagem horizontal nem texto abaixo de 13 px, e não deu nenhum erro de console ou de rede.

**O que estava fora do lugar e foi corrigido:** (1) dois títulos de tópico fora da regra de maiúsculas (`title-case.ts`), que o teste dos títulos não pega porque só olha o catálogo público: “Quantos Passos Até o Gólgota?” virou “Quantos Passos até o Gólgota?” e “…por que me Desamparaste?” virou “…por que Me Desamparaste?”, no Markdown e no catálogo. (2) O tempo de leitura do catálogo privado estava em 38 minutos; o texto tem cerca de 11,6 mil palavras (≈ 58 min a 200 palavras por minuto), então passou a 58.

**Decisões:** (1) as oito subseções `###` sem linha de hora (o quadro de dias, as idas e vindas, o relato, a lei, as fontes, o instrumento, “Que Horas Eram?” e “A Razão de Tudo Isso”) ficam como estão: não são cenas. (2) A última frase do estudo começa em minúscula (“eis que eu estou convosco…”) porque o versículo continua uma frase (“; e eis que…”); fica fiel à Almeida. (3) Os arquivos provisórios de verificação foram apagados; a checagem das citações do estudo privado não virou teste fixo (o teste público não vê os rascunhos).

**Pendências:** as de antes seguem abertas (título “Da Ceia à Ressurreição”, cenáculo no mapa, fonte do nascer e do pôr do sol, linha de hora no cartão de compartilhar, Mt 26.63, vídeos do Weave). Arquivos não rastreados que não são deste trabalho e não foram tocados: `.playwright-mcp/`, `RECONHECIMENTO-DO-SISTEMA.md` e `Teologos/`. Nenhum commit, push ou publicação.

## 2026-11-11 14:45 -0400 — Horas sob cada título, a saída para o Gólgota, o sol e as três da tarde

**Autor:** Valter, com Claude, a partir de dois pedidos: faltava dizer a que horas Jesus saiu para o Gólgota, como estava o sol, se a saída veio logo depois do julgamento diante da multidão e que Jesus expirou às três da tarde; e cada título de cena deveria trazer o dia, o período e a hora aproximada (por exemplo, “Jesus Diante de Anás, o Sumo Sacerdote: quinta-feira à noite, de madrugada, por volta de tais horas”). Cópia anterior em `analises/do-getsemani-copia-antes-das-horas.md`.

**Código:** novo bloco `:::hora …` (uma linha, sem fechar), que desenha `p.when` logo abaixo do título (`rich-text-parser.ts`, `rich-text.ts`, `rich-text.scss`); o gerador de áudio o inclui. Para o estilo do `rich-text` não passar de 12 kB, os diálogos saíram para um componente próprio (`shared/dialog-turns.ts` e `.scss`), sem mudar o que aparece. Teste novo em `e2e/logica/dialogos.spec.ts`.

**Texto:** (1) 39 títulos de cena ganharam a linha de hora, só com o que o texto permite: ao anoitecer (~18h), o canto do galo (entre a meia-noite e as 3h, pelas vigílias de Mc 13.35), o amanhecer (~6h) e as horas terceira, sexta e nona (≈ 9h, 12h e 15h, contadas do nascer do sol); onde o texto não dá a hora, a linha diz só o período ou “o texto não dá a hora”. (2) O quadro “Quando Foi Tudo Isso?” explica como ler essas horas e a sexta passou a ser uma linha só, que aponta para a nova seção. (3) Nova seção “Que Horas Eram?” depois do veredito: a saída vem logo depois da sentença em João, e em Mateus e Marcos entre elas ficam o açoite e a zombaria; os Evangelhos não dão a hora da saída, mas pela conta de Marcos (crucificação às 9h) foi antes das nove, com o dia já claro; o sol nasce por volta das 6h e se põe por volta das 18h nessa época; tabela do nascer ao pôr do sol. (4) “As Trevas ao Meio-Dia”: o sol nasceu às 6h e o dia foi claro até o meio-dia; o texto não fala em eclipse, que não combinaria com a lua cheia da páscoa. (5) “O Clamor e a Entrega”: “cerca das três da tarde”; seis horas na cruz, da terceira à nona, as três últimas na escuridão; pouco mais de três horas até o pôr do sol, que traria o sábado.

**Decisões:** (1) as horas de ao anoitecer, nascer e pôr do sol são aproximações astronômicas e da contagem judaica, ditas como tais; o canto do galo entre a meia-noite e as 3h é a leitura das vigílias de Mc 13.35, e não um dado dos Evangelhos. (2) Não dei hora à prisão, a Anás nem a Herodes: o texto não dá. (3) A discordância entre João (cerca da hora sexta) e Marcos (hora terceira) segue dita uma vez só, no veredito.

**Validação:** 177 testes de lógica; lint limpo; build de produção sem aviso; trava de publicação limpa; 82 falas e 180 citações conferidas com o Almeida, 0 divergências; Chrome a 390 e 1280 px com 39 linhas de hora, 17 diálogos, texto mínimo de 13 px, sem erros nem rolagem horizontal. Capturas privadas em `analises/previas-horas/`.

**Pendências:** achar uma fonte lida para o nascer e o pôr do sol de Jerusalém nessa época (hoje são aproximações); decidir se a linha de hora também deve aparecer no cartão de compartilhar.

## 2026-11-11 13:30 -0400 — O estudo passa a abrir pela ceia

**Autor:** Valter, com Claude, a partir do pedido de pegar “Jesus na ceia dali em diante” como base; o dono escolheu as duas coisas: uma seção de abertura sobre a ceia e a linha do tempo e o quadro de dias partindo dela. Cópia anterior em `analises/do-getsemani-copia-antes-da-ceia.md`.

**O que foi feito:** (1) Nova primeira seção, “À Mesa com o Traidor” (Tópico 1), com o quadro “Quando Foi Tudo Isso?” (agora com a ceia como ponto de partida: uma linha de tradição para domingo a quarta, depois quinta ao anoitecer, a noite, o amanhecer, a sexta, o sábado e o domingo), e as cenas O Cenáculo, O Lava-Pés (conversa com Pedro, Jo 13.6-10), O Traidor à Mesa (anúncio da traição, Jo 13 e Mt 26), O Pão e o Cálice (Mt 26 e Lc 22), A Negação Anunciada (Lc 22.31-34) e O Hino e o Caminho (Jo 13.34; 14.27; 17.1; Mt 26.30; Jo 18.1). Três diálogos novos, com as falas separadas. (2) O Getsêmani, que era a abertura sem número, virou o Tópico 2, “A Prensa de Azeite”; o estudo passa de 10 para 12 tópicos (o catálogo e `passages` foram atualizados). (3) A linha do tempo ganhou as linhas “A ceia” e “Do cenáculo ao jardim” e se chama “As Idas e Vindas da Ceia ao Gólgota”.

**Decisões:** (1) a ordem das cenas da ceia difere entre os Evangelhos (Mateus e Marcos põem a traição antes do pão e do cálice; Lucas, depois; João não narra o pão e o cálice): o texto diz isso e segue Mateus e João. (2) A seção não tem “A medicina explica” (a ceia não tem o que explicar do corpo sem inventar) nem imagem (as imagens são pedidas ao ChatGPT/Codex). (3) O Halel (salmos 113 a 118) vai como tradição judaica registrada na Mishná, que entrou nas fontes antigas do catálogo; a distância do cenáculo ao jardim (1,3 km em linha reta, entre pontos tradicionais) foi calculada com as coordenadas do mapa. (4) O quadro de dias abre a seção, antes do relato; se o dono preferir o relato primeiro, basta trocá-los de lugar.

**Validação:** 176 testes de lógica; build de produção sem aviso; trava de publicação limpa; 82 falas e 177 citações conferidas com o Almeida, 0 divergências; títulos conferidos por `title-case.ts`; Chrome a 390 e 1280 px sem erros nem rolagem horizontal; “Tópico 1 de 12”. Capturas privadas em `analises/previas-ceia/`.

**Pendências:** o título do estudo ainda é “Do Getsêmani à Ressurreição” (e a figura de abertura e o mapa dizem o mesmo); decidir se passa a “Da Ceia à Ressurreição”. O mapa ainda começa no Getsêmani: incluir o cenáculo como primeira etapa pede o caminho a pé do cenáculo ao jardim.

## 2026-11-11 12:20 -0400 — Quadro “Quando Foi Tudo Isso?” e títulos de cena da cruz à ressurreição

**Autor:** Valter, com Claude, a partir da dúvida do dono: a audiência diante de Caifás foi no dia seguinte à prisão? Dá para saber os dias da semana (segunda, terça)? Cópia anterior em `analises/do-getsemani-copia-antes-do-quadro-quando.md`.

**O que foi feito:** (1) Nova seção “Quando Foi Tudo Isso?” no começo de “Vendado, Cuspido, Esbofeteado”: o que o texto fixa (só o sábado e “o primeiro dia da semana” são nomeados; a morte na “véspera do sábado”, uma sexta; a prisão na noite anterior, que pelo calendário judaico já é a sexta; da prisão à crucificação, uma noite e uma manhã) e uma tabela de dez linhas, domingo a domingo, em que cada linha diz se é **Tradição** (domingo, segunda e terça vêm de “no dia seguinte” e “na manhã seguinte”, Mc 11), **Pouco dito** (quarta, Mc 14.1), ou o texto marca a hora. Depois, as outras semanas propostas (crucificação na quarta ou na quinta, por “três dias e três noites” e “grande aquele dia de sábado”; a ceia na terça, de Annie Jaubert, 1957), ditas como hipóteses discutidas, e a conta dos discípulos de Emaús (Lc 24.21) como apoio da leitura de sexta a domingo. O parágrafo antes da linha do tempo das idas e vindas perdeu o calendário (agora só “entre a noite de quinta e a manhã de sexta”): cada fato fica num lugar. (2) Títulos de cena na cruz (O Lugar da Caveira, A Crucificação, A Placa Acima da Cruz, Despojado e Escarnecido, Três Palavras de Graça), na morte (As Trevas ao Meio-Dia, O Clamor e a Entrega, O Véu e o Centurião, A Lança), no sepultamento (As Mulheres e a Multidão, O Sepultamento, O Sepulcro Selado, E os Discípulos?) e na ressurreição (O Sepulcro Vazio, Jesus e Maria Madalena, Jesus Aparece aos Discípulos e a Tomé, Emaús e as Outras Aparições, A Razão de Tudo Isso). (3) Na seção da morte, a narração do clamor e do “está consumado” passou para antes do véu e do centurião, que vêm depois da morte.

**Decisões:** (1) a obra de Jaubert entrou em `DRAFT_WORKS`/`DRAFT_ARTICLE_SOURCES` do catálogo privado como referência de uma tese discutida; não afirmei proporção de estudiosos a favor de cada semana (não há fonte lida para isso): a leitura de sexta a domingo é apresentada como a que concorda diretamente com os marcos do texto. (2) Uma regra de largura da primeira coluna da tabela foi tentada e retirada: estourava o aviso de 12 kB do `rich-text.scss` por 24 bytes e o ganho era pequeno.

**Validação:** 176 testes de lógica; lint limpo; build de produção sem aviso; trava de publicação limpa; 66 falas e 157 citações conferidas com o Almeida, 0 divergências; títulos conferidos pela regra de `title-case.ts`; Chrome a 390 e 1280 px sem erros nem rolagem horizontal. Capturas privadas em `analises/previas-quando/`.

**Pendências:** achar uma fonte lida (por exemplo, um comentário sobre a cronologia da Paixão) para poder dizer quantos estudiosos seguem cada semana; hoje o texto não afirma isso.

## 2026-11-11 11:30 -0400 — Mapa da Paixão enxuto, contagem das audiências de Pilatos e açoite em partes

**Autor:** Valter, com Claude, a partir de cinco observações do dono: a frase “De Anás, maniatado” soa mal; quantas vezes Jesus foi diante de Pilatos; o mapa ainda não estava bom; os quilômetros estavam bagunçados; a seção do açoite também.

**Texto:** (1) “Na mesma noite, Anás o envia, ainda atado, a Caifás [Jo 18.24], onde os escribas e os anciãos já estão reunidos [Mt 26.57]” (sem “de madrugada”, que os textos não dizem; o “Na mesma noite” veio de uma dúvida do dono: a audiência diante de Caifás não é do dia seguinte à prisão). (2) Jesus comparece **duas vezes** diante de Pilatos (antes e depois de Herodes; Lc 23.1-7 e 23.13); João conta tudo como um só julgamento, com Pilatos entrando e saindo do pretório. Os títulos passaram a “Jesus Diante de Pilatos, pela Primeira Vez” e “…, pela Segunda Vez”, e o mapa a “Pilatos, 1ª vez” e “Pilatos, 2ª vez”. (3) O parágrafo dos quilômetros dizia 1,2 + 1,1 + 0,4 = 2,7 km em linha reta e “3 a 4 km” a pé; o mapa calcula 1,15 + 1,03 + 0,43 = 2,61 km e 4,10 km a pé (Fortaleza Antônia) ou 2,12 e 3,26 km (palácio). Agora o texto traz só a faixa, de 3,3 a 4,1 km a pé e de 2,1 a 2,6 km em linha reta, e manda para a tabela do mapa. Se o mapa ou o GEO mudarem, esse parágrafo precisa ser refeito à mão. (4) “O Açoite que Abriu as Costas” ganhou subtítulos e ordem: O Relato dos Evangelhos, A Lei Judaica e o Costume Romano, O Testemunho das Fontes Antigas (Josefo na ordem do tempo: o caso de uns 30 anos depois de Jesus, depois o cerco), O Instrumento e O Açoite, de Perto. Cópia anterior em `analises/do-getsemani-copia-antes-do-mapa-v3.md`.

**Mapa** (`passion-route.ts`/`.scss`; cópias anteriores em `analises/passion-route-copia-antes-do-mapa-v3.*.txt`): os totais saíram de cima do mapa para uma faixa abaixo dele; os dois grupos de botões viraram dois pares do mesmo tamanho; “Viver a jornada” virou uma opção ao lado das outras; a legenda ficou curta; a conta dos quilômetros ficou só na tabela (saiu a seção repetida) e uma frase compara com a outra hipótese do pretório; Cenáculo, Túmulo do Jardim, portões e igrejas só aparecem com “Igrejas e portões de hoje” (desligado por padrão; a muralha e o Templo ficam sempre); os quilômetros no mapa mostram só o trecho da etapa atual; nomes de região mais curtos; no celular a moldura é mais alta (5:6) e a aproximação é maior (~1,8 km de largura). Altura do componente a 390 px: de 2.311 para 2.211 px; o mapa em si ocupa mais da moldura.

**Validação:** 176 testes de lógica; build de produção sem aviso; trava de publicação limpa; 66 falas e 145 citações conferidas com o Almeida, 0 divergências; sem erros de página nem rolagem horizontal a 390 e 1280 px. Capturas privadas em `analises/previas-mapa/` (`antes` e `depois3`).

**Pendências:** o mapa em si (fundo e rotas) ainda não tem a rota da ida e volta a Herodes, por falta de endereço dele; título de cena para a cruz e a ressurreição.

## 2026-11-11 10:00 -0400 — Paixão reordenada na sequência de João e imagens compactas

**Autor:** Valter, com Claude, a partir do pedido de contextualizar e ajustar a informação de “Pilatos outra vez” para baixo, que estava bagunçada, e de enxugar as imagens, juntando-as ao texto.

**O que estava errado:** a conversa “Donde és tu?” (Jo 19.9-11) vinha antes do açoite, mas em João ela é posterior ao “Eis o homem”; a sentença no Pavimento (Jo 19.13-16) não aparecia como cena; o resumo de Pilatos (Lc 23.13-16) e o costume da festa não eram explicados; um parágrafo repetia Pilatos e Herodes; Judas vinha depois de Pilatos (em Mateus vem antes); o mapa ficava antes do açoite; em Simão, a requisição vinha depois das mulheres de Jerusalém, e a narração do encontro repetia o que já se dissera.

**O que foi feito no texto** (cópia anterior em `analises/do-getsemani-copia-antes-da-reordenacao.md`): Judas passa para depois do conselho; Pilatos outra vez ganha o resumo de Pilatos, o costume da festa e quem era Barrabás (Mt 27.16; Lc 23.19; Jo 18.40), e termina em Mt 27.26. “A Coroa e a Cana” segue a ordem de João, com as cenas “Eis o Homem” (Jo 19.4-8), “O Poder de Crucificar” (Jo 19.9-12, movido para cá) e “O Veredito no Pavimento” (Jo 19.13-16), com a diferença entre as horas de João e Marcos dita uma vez, sem harmonização forçada. O mapa “Quantos Passos Até o Gólgota?” vem depois da sentença (o catálogo acompanha a nova ordem dos tópicos). Simão: peso da trave, requisição, quem era Simão, as mulheres. A linha do tempo diz que tudo cabe numa noite e numa manhã (Mc 14.17; 15.1; 15.25; 15.42) e ganhou a linha das 9h. As falas de silêncio de Herodes e a de Pilatos “como quem escuta uma língua estrangeira” foram para o lugar de cada cena.

**O que foi feito nas imagens:** `<app-rich-text [compactFigures]>` (só estudos privados): cada `:::figura` vira uma faixa de 56 px (`shared/compact-figure.ts`, miniatura de ~5 KB, rótulo e título) que abre a figura inteira ao toque, e só então a carrega; as duas fotos grandes ficam pequenas ao lado do texto, com legenda mais curta que mantém o aviso de IA. Dados das faixas em `DRAFT_FIGURES` (vazio no app público; o catálogo privado o substitui). Medida a 390 px: a página caiu de 63.309 para 48.784 px (as figuras ocupavam 25% dela); a 1280 px, de 42.298 para 30.770 px.

**Validação:** 176 testes de lógica passam; lint limpo; build de produção sem aviso de orçamento (a faixa virou componente próprio para o `rich-text.scss` não passar de 12 kB); `verificar-publicacao.mjs` limpo. O script de citações confere 66 falas e 145 citações com o Almeida, 0 divergências (“Salve, rei dos judeus!” ganhou a referência Mt 27.29). Chrome a 390 e 1280 px sem erros nem rolagem horizontal. Capturas privadas em `analises/previas-compacto/`.

**Decisões:** (1) o texto de Barrabás (“filho do pai”, do aramaico *bar abbá*) vai sem aspas, porque não é fala bíblica; (2) Mt 27.25 segue fora; (3) as cenas da cruz, da morte e da ressurreição não foram reescritas, só conferidas: a ordem delas já segue os Evangelhos; (4) as figuras vêm fechadas por padrão: quem quiser vê-las abre; as faixas não lembram o estado ao recarregar.

**Pendências:** decidir se as faixas devem abrir já para quem chega de um link direto; título de cena para a cruz e a ressurreição; se as figuras mais importantes (mapa, anatomia) merecem miniatura maior.

## 2026-11-11 09:10 -0400 — Diálogos do estudo da Paixão separados por quem fala

**Autor:** Valter, com Claude, a partir do pedido de separar os diálogos e as perguntas, dizendo quem perguntou (modelo: “Pilatos”).

**O que foi feito:** novo bloco `:::dialogo Título` no leitor de Markdown (`rich-text-parser.ts`, `rich-text.ts`, `rich-text.scss`): uma fala por linha, `Nome | fala [[ref]]`; a linha sem nome é indicação de cena. O nome fica em maiúsculas sobre a fala (à esquerda em tela larga), as falas de Jesus levam barra dourada e as indicações de cena vão em itálico. O “Ouvir” lê “Nome: fala” (os dois pontos ficam escondidos na tela) e `tools/gerar-audio.mjs` segue a mesma regra. No estudo privado, 12 trocas viraram diálogo: Anás, Caifás, o conselho ao amanhecer, as negações de Pedro, Pilatos fora e dentro do pretório, a escolha de Barrabás, o poder de crucificar, Judas e os sacerdotes, o pedido de uma guarda, Maria no jardim e Tomé. Cópia anterior em `rascunhos/como-a-ciencia-explica/analises/do-getsemani-copia-antes-dos-dialogos.md`. A pedido do dono, cada passagem também ganhou um título de cena (`###`, no padrão “Jesus Diante de…”): Anás, o Sumo Sacerdote; Caifás e o Sinédrio; Pedro no pátio; os guardas; o Sinédrio ao amanhecer; Pilatos; Herodes Antipas; “As Idas e Vindas do Jardim ao Gólgota” (a linha do tempo); Pilatos outra vez; o remorso de Judas. Quatro rótulos de diálogo que repetiam o título foram trocados (“O Interrogatório”, “A Pergunta Decisiva”, “As Três Negações”, “A Pergunta Repetida”). Os títulos seguem a regra de `title-case.ts`. As cenas da cruz e da ressurreição ainda não têm título de cena.

**Validação:** um script confere 57 falas de diálogo e 137 citações entre aspas com o Almeida empacotado, sem divergência de texto; uma citação (“Salve, rei dos judeus!”, Mt 27.29 e Jo 19.3) está certa, mas sem a referência dela, como já estava antes. Teste novo `e2e/logica/dialogos.spec.ts`; 176 testes de lógica passam, lint limpo, build de produção sem aviso de orçamento de estilo e `verificar-publicacao.mjs` limpo. No Chrome, a 390 e 1280 px: 12 diálogos, 57 falas, texto mínimo de 13 px, sem rolagem horizontal nem erros. Capturas privadas em `analises/previas-dialogos/` e `analises/previas-retomada/`.

**Decisões:** (1) as falas são só do Almeida empacotado, sem palavra acrescentada; as indicações de cena parafraseiam, sem aspas. (2) No texto empacotado, Mt 26.63 diz “o Filho do Deus” (provável erro da fonte): a fala de Caifás termina em “…se tu és o Cristo…” e o texto bíblico não foi mexido. (3) Mt 27.25 segue de fora, como já era escolha do estudo (a multidão que os chefes reuniram, não o povo judeu). (4) Falas de uma pessoa só (as palavras da cruz, Emaús, “Profetiza-nos”) ficaram na prosa, porque não são conversa. (5) Foram incluídas, para completar a troca, falas que o estudo só resumia: Jo 18.29-35, Jo 20.29 e Mt 27.65.

**Registrado nesta retomada (trabalho de ontem à tarde, sem entrada na época; datas pelos arquivos):** reescrita do estudo em terceira pessoa (cópia `do-getsemani-copia-antes-da-reescrita.md`), redução para 10 tópicos (cópia `…com-12-topicos.md`), 10 caixas `:::nota Medicina`, “A medicina explica” (cópia `…antes-das-caixas-de-medicina.md`), a opção `markQuotes` do `RichText` e a rota com a ida a Herodes e a volta a Pilatos em `passion-route.ts`.

**Arquivos:** `src/app/core/rich-text-parser.ts`, `src/app/shared/rich-text.ts`, `src/app/shared/rich-text.scss`, `tools/gerar-audio.mjs`, `e2e/logica/dialogos.spec.ts`, `CLAUDE.md`, estudo `do-getsemani-a-ressurreicao.md` (privado); este diário.

**Pendências:** decidir se se corrige Mt 26.63 pelo `VERSE_FIXES` de `tools/gerar-almeida.py`; dar a referência própria a “Salve, rei dos judeus!”; no mapa da rota, o rótulo “Casa de Caifás (?)” fica parcialmente sob a barra de escala; os vídeos contínuos seguem à espera de plano pago no Weave. Nenhum commit, push ou publicação.

## 2026-11-10 13:21 -0400 — Abertura da Paixão simplificada conforme a marcação do dono

**Autor:** Valter, com Codex, a partir da captura com as áreas a retirar.

**O que foi feito:** removidos “Atravesse Cada Cena”, a contagem “Cena 01/12”, o seletor das doze cenas e o resumo com o botão “Ler esta cena”. Preservada a imagem do Getsêmani na abertura. Retiradas as instruções de escolher cenas; a legenda mantém a identificação da ilustração gerada por IA e a explicação dos painéis do estudo. Excluídos o estado, a navegação e os estilos que só serviam ao seletor.

**Validação:** lint do componente sem problemas; Chrome confirmou a remoção dos controles e o carregamento da imagem. Permanecem as 12 seções do texto e os três painéis anatômicos. Sem erros de página nem rolagem horizontal a 390 e 1280 px. Capturas privadas em `analises/previas-abertura-simples/`.

**Arquivos:** `rascunhos/como-a-ciencia-explica/passion-scene.ts`, `passion-scene.scss`, artigo `do-getsemani-a-ressurreicao.md`; este diário.

**Pendências:** os vídeos contínuos seguem aguardando acesso a vídeo no plano do Weave. Nenhum commit, push ou publicação.

## 2026-11-10 13:15 -0400 — Prancha enviada com autorização; vídeo exige plano pago

**Autor:** Valter, com Codex.

**O que foi feito:** Valter autorizou explicitamente enviar somente `paixao-anatomia-neuro-vascular.png` ao Weave/Figma para cotar o vídeo. Após a autorização, o upload foi concluído com token novo. Solicitada a cotação de Veo 3.1 Image to Video, seis segundos, Fast, 1080p, sem áudio, sem `acknowledgedCost`.

**Resultado:** o serviço recusou a cotação informando que modelos de vídeo só estão disponíveis em planos pagos. O vínculo está funcionando; a pendência de envio da entrada anterior foi resolvida. Não houve orçamento final, geração de vídeo, cobrança ou alteração de assinatura.

**Arquivos:** estado e parâmetros registrados em `rascunhos/como-a-ciencia-explica/analises/video-neuro-weave.md`; este diário. A prancha original e os componentes foram preservados.

**Pendências:** habilitar acesso a vídeo em plano pago do Weave; depois obter cotação e aprovação estruturada do custo de cada geração. Nenhum commit, push ou publicação.

## 2026-11-10 13:13 -0400 — Vínculo Weave funcionando; envio da prancha aguarda autorização

**Autor:** Valter, com Codex.

**O que foi feito:** nova consulta confirmou o vínculo Figma–Weave. Não há workflows publicados na conta, mas a consulta direta encontrou Veo 3.1 Image to Video. Preparado o primeiro pedido: animação contínua de seis segundos da prancha do sistema nervoso, com circulação contida nos vasos e sinais nervosos ilustrativos, sem áudio.

**Decisões:** o catálogo informa estimativa de 90 créditos; ainda falta cotação dos parâmetros finais. Nenhuma execução paga foi iniciada. A autorização de enviar a referência e a aprovação do custo são etapas distintas.

**Bloqueio:** a revisão automática rejeitou transferir `paixao-anatomia-neuro-vascular.png` ao Weave porque é uma imagem do rascunho privado e requer autorização explícita para esse arquivo. O upload não foi concluído; não repetir por outro caminho sem a autorização do dono.

**Arquivos:** pedido e critérios em `rascunhos/como-a-ciencia-explica/analises/video-neuro-weave.md`; este diário. Texto, imagens e componentes do app preservados.

**Pendências:** autorização para enviar somente a prancha ao Weave/Figma; depois obter cotação e aprovação estruturada do custo de cada geração. Nenhum vídeo gerado, cobrança, commit, push ou publicação.

## 2026-11-10 13:09 -0400 — Retomada após queda de energia

**Autor:** Valter, com Codex.

**O que foi feito:** conferidos os arquivos recentes da Paixão e reiniciada a prévia privada em `http://127.0.0.1:4307/artigo/do-getsemani-a-ressurreicao`. As 16 imagens referenciadas estão presentes; os PNGs passaram na verificação de estrutura e CRC. Texto, imagens e componentes preservados.

**Validação:** compilação da prévia concluída; Chrome com 12 seções e 12 etapas, cinco imagens recentes disponíveis, sem erros de página nem rolagem horizontal a 390 e 1280 px. Os seis testes de isolamento e trava de publicação passaram.

**Pendências:** nova consulta ao Weave ainda informa que falta vincular a conta Figma em `https://app.weavy.ai/settings?section=profile`. Depois do vínculo, consultar o orçamento antes de cada geração paga dos vídeos contínuos. Nenhum vídeo gerado, cobrança, commit, push ou publicação nesta retomada.

## 2026-11-10 09:35 -0400 — Chicote com pesos e ossículos; nova visão posterior

**Autor:** Valter, com Codex, a partir das referências de imagens enviadas pelo dono.

**O que foi feito:** substituída a ilustração de tiras vazias por `paixao-anatomia-chicote-v2.png`, com pesos metálicos e ossículos visíveis nas pontas, couro mais fino e materiais distinguíveis. `paixao-anatomia-costas-v2.png` traz hematomas mais extensos, inchaço e vergões irregulares sobre pele fechada; aparece na visão posterior e na ampliação. Originais preservados.

**Limitação:** a primeira solicitação com referências de ferimentos foi rejeitada pelo sistema de segurança do gerador (`violence`). A versão integrada das costas é uma alternativa sem sangue ou feridas abertas; não foi apresentada como a versão bloqueada. O chicote foi gerado como objeto isolado. Nenhuma imagem externa foi copiada diretamente para o app, e a afirmação de 39 golpes de uma referência não foi importada para o estudo.

**Validação:** inspeção visual dos dois arquivos; lint dos componentes limpo. Chrome: novo chicote, costas e diálogo ampliado carregados, Escape funcional, 390/1280 px sem transbordamento nem erro de página. Ambos os PNGs continuam ignorados pelo Git e cobertos pelo prefixo privado `paixao-anatomia-`.

**Arquivos:** `passion-story.ts`, `passion-impact.ts`, dois PNGs; prompts finais e registro do bloqueio em `analises/flagrum-e-costas-v2.md`, capturas em `analises/previas-flagrum-costas-v2/`.

**Pendências:** a representação com feridas abertas não foi produzida; os vídeos contínuos seguem separados destas imagens estáticas. Nada publicado ou enviado ao Git.

## 2026-11-10 09:30 -0400 — Mão direita do guarda na cena de Anás

**Autor:** Valter, com Codex.

**O que foi feito:** editada a folha de quatro poses de Anás para corrigir a mão aparentemente esquerda ligada ao braço direito. A aproximação e o contato agora usam uma mão direita com punho e polegar coerentes. Nova imagem privada `paixao-anatomia-anas-cenas-v2.png`, referenciada em `passion-story.ts`; original preservado.

**Decisões:** a mão usada é uma escolha visual, sem afirmar que o Evangelho especifica o lado. Mantidos os personagens, cenário e recortes das quatro poses. Nenhuma alteração nos textos, mapas ou nas outras cenas.

**Validação:** inspeção visual da imagem e da pose na página; lint limpo. Chrome: nova folha carregada, quatro poses selecionáveis com recorte correto, capturas de aproximação e contato, 390/1280 px sem transbordamento nem erro de página. PNG ignorado pelo Git; continua somente na prévia privada.

**Arquivos:** PNG, `passion-story.ts`, `analises/mao-direita-anas.md` (prompt completo), `analises/previas-mao-anas/`.

**Pendências:** os vídeos contínuos anteriores continuam separados desta correção de imagem. Nada publicado ou enviado ao Git.

## 2026-11-10 09:27 -0400 — Cérebro com circulação e mãos corrigidas na cura de Malco

**Autor:** Valter, com Codex.

**O que foi feito:** nova prancha privada `paixao-anatomia-neuro-vascular.png`, com vasos realistas e uma camada de fluxo sanguíneo animado separada dos sinais nervosos. Pausa e retomada compartilhadas com a ampliação; movimento reduzido inicia pausado. A quarta pose de Malco usa `paixao-anatomia-malco-cura-v2.png`: uma mão de Jesus toca a orelha direita, a outra está ao lado do próprio corpo. Imagens originais e outras poses preservadas.

**Decisões:** circulação normal contida nos vasos, sem sugerir lesão cerebral de Jesus. Fonte OpenStax 13.3 ligada na aula. A primeira correção das mãos ainda mostrou a orelha esquerda; uma segunda edição corrigiu o lado e foi inspecionada. A cena usa a imagem inteira, sem recortar como sprite. Essas alterações não geram os vídeos contínuos solicitados anteriormente.

**Validação:** lint dos quatro componentes limpo; builds privado e público concluídos; trava de publicação aprovada. Chrome: fluxo muda ao reproduzir e fica imóvel ao pausar, ampliação sincronizada, imagem da cura carregada, retorno às poses anteriores, 390/1280 px sem transbordamento nem erro de página. Prévia local reiniciada em 4307 para reconhecer os novos assets. Os dois PNGs estão ignorados pelo Git.

**Arquivos:** `passion-anatomy.ts`, `passion-neuro.ts`, `passion-scene.ts`, `passion-story.ts` e `.scss`, dois PNGs privados; prompts completos em `analises/cerebro-vascular-e-maos-malco.md`, capturas em `analises/previas-neuro-malco/`.

**Pendências:** os vídeos contínuos permanecem no fluxo de vínculo e orçamento do Weave. Nada publicado, enviado ao Git ou cobrado pelo serviço de vídeo.

## 2026-11-10 09:06 -0400 — Imagem repetida retirada e novo retrato cinematográfico da coroa

**Autor:** Valter, com Codex.

**O que foi feito:** retirada a imagem redundante do Getsêmani no corpo da primeira seção, mantendo a abertura. Gerado, inspecionado e integrado o retrato privado `paixao-anatomia-coroa-cinema.png`, com iluminação cinematográfica, suor e marcas superficiais; a imagem anterior foi preservada.

**Decisões:** os vídeos solicitados precisam de movimento contínuo e continuidade dos personagens. Exportar as quatro poses existentes como GIF não atende ao pedido. Malco é ferido na orelha direita; a representação deve mostrar a ausência antes do toque e uma única orelha íntegra depois. Nenhum vídeo foi gerado nem cobrado. Valter escolheu vincular Figma ao Weave; a consulta ainda informa que falta o vínculo. O texto, o mapa e as alterações de Claude foram preservados.

**Validação:** builds privado e público concluídos, lint do componente limpo, trava de publicação aprovada sem identificadores privados. Conferido no Chrome: doze tópicos, duplicata ausente, abertura preservada, nova coroa carregada, sem erros de página nem rolagem horizontal a 390 e 1280 px.

**Arquivos:** artigo privado, `passion-story.ts`, novo PNG e `analises/videos-continuos-e-coroa.md`, com o prompt completo e critérios de continuidade.

**Pendências:** vínculo Weave, orçamento e aprovação de cada execução paga; geração e revisão dos vídeos contínuos de sistema nervoso, Malco, Anás, rosto coberto e açoites/anatomia/costas. Nada foi publicado.

## 2026-11-10 09:51 -0400 — Mapa da Paixão melhorado (moldura, contexto, hipóteses e nomes)

**Autor:** Claude (Sonnet 5.5), a pedido de Valter (“melhora aquele mapa”).

**O que estava fraco:** o mapa ficava vazio e pequeno no celular, a rota não preenchia a moldura, mostrava só um dos dois locais possíveis do pretório e tinha pouca referência de lugar; no computador a moldura larga cortava a Casa de Caifás; e um ponto ficava sem nome porque o visualizador descarta rótulos que não cabem.

**O que foi feito** (`passion-route.ts` / `.scss`):
- Moldura em **retrato** (4:5), também no computador (centralizada, até 540 px), e aproximação ajustada (cerca de 2,1 km de largura): a rota enche a moldura e nenhum nome é cortado.
- **Mais contexto:** Cenáculo (tradição), Templo, Cidade de Davi, monte Sião, vale do Cedrom e monte das Oliveiras.
- **As duas hipóteses do pretório ficam no mapa:** a escolhida é a etapa numerada e a outra aparece como ponto pequeno, com nome (“Fortaleza Antônia” e “Palácio de Herodes”); o cartão da etapa e a tabela continuam dizendo “Pretório”. Nomes curtos, para o rótulo caber.
- **Legenda** sob o mapa (números, “(?)”, ponto pequeno, como mover e aproximar).
- **Quilômetros nos botões das etapas** (“Anás e Caifás + 1,2 km”) e **linhas da tabela clicáveis**, que levam à etapa.

**Decisões:** o visualizador do app tem o modo “visão geral” pensado para mapas regionais (enquadra no mínimo 22% da largura do mapa), então não serve para uma cidade; o leitor pode afastar com dois dedos. A rota continua em linhas retas entre pontos tradicionais, dito na legenda e na tabela; o traçado real das ruas não é conhecido. Nada foi alterado em `src/`: o visualizador público ficou igual.

**Validação:** no Chrome, a 390 e 1280 px, as seis etapas, a troca de hipótese (2,7 km e 2,1 km), o clique na tabela e os botões, sem erro de console e sem rolagem horizontal; lint limpo; testes de isolamento aprovados.

**Pendências:** o rótulo “Monte das Oliveiras” aparece cortado na borda em algumas etapas (o monte fica além da moldura); sem imagens novas do ChatGPT ainda; fonte de Rodrigo Silva.

## 2026-11-10 08:57 -0400 — Quilômetros de cada trecho dentro do mapa da Paixão

**Autor:** Claude (Sonnet 5.5), a pedido de Valter (“faltou colocar quantos km foi de cada lugar no mapa e ao todo até o Gólgota”).

**O que foi feito:** os quilômetros já existiam, mas numa seção abaixo dos controles, fora da vista. Agora aparecem **no mapa**: (1) uma etiqueta sobre a moldura, que muda a cada etapa (“Este trecho: 1,2 km · Percorrido: 1,2 km de 2,7 km” e, na chegada, “Chegada ao Gólgota · Total: ≈ 2,7 km em linha reta”, com borda dourada); (2) uma tabela logo abaixo, com cada lugar, o trecho, a soma e o total do Getsêmani ao Gólgota, com a linha da etapa atual destacada; (3) o cartão da etapa também mostra o trecho e o percorrido. A lista de trechos do painel de baixo foi removida para não repetir; ficaram o total e a estimativa pelas ruas.

**Decisões:** os números continuam em linha reta entre pontos tradicionais (1,2 + 1,1 + 0,4 = 2,7 km; 2,1 km se o pretório era o palácio de Herodes) e mudam sozinhos quando o leitor troca a hipótese do pretório. A estimativa de 3 a 4 km pelas ruas continua marcada como estimativa, porque nenhum Evangelho dá o número. Os três servidores da prévia (4200, 4307 e 4308) já serviam o mapa novo.

**Arquivos:** `rascunhos/como-a-ciencia-explica/passion-route.ts` e `passion-route.scss`; `DIARIO.md`.

**Validação:** no Chrome a 390 e 1280 px, as três etiquetas (partida, meio, chegada), a tabela e a hipótese do palácio (2,1 km), sem erro de console e sem rolagem horizontal; lint limpo.

**Pendências:** as mesmas da entrada anterior (imagens do ChatGPT; fonte de Rodrigo Silva).

## 2026-11-10 08:45 -0400 — Dívida cancelada e *tetelestai* com fonte, chicote como reconstrução e “tochas” no lugar de “lanternas”

**Autor:** Claude (Sonnet 5.5), a pedido de Valter.

**O que foi feito:**
- **“Lanternas” virou “tochas”,** a pedido do dono: título da seção 3 (“Tochas, Espadas e um Beijo”), tópicos do catálogo, `STAGES`, o parágrafo da prisão e a legenda da cena de Malco. Em Jo 18.3 a Almeida lista “lanternas, archotes e armas”; o texto agora diz tochas e armas, sem aspas, e o botão da referência continua abrindo o versículo como está na Almeida.
- **Dívida cancelada e Colossenses 2.14:** o dono trouxe um resumo de pesquisa (documento de dívida quitado, riscado, pregado no alto no mercado, com a palavra *tetelestai*). Conferi: *cheirógrafo* é a promissória de próprio punho (certo); contratos quitados eram cancelados com traços em X ou com a tinta lavada, e o verbo de Paulo é o de apagar (papiros do Egito; certo, escrito no estudo sem citar um papiro específico, porque a página do registro não abriu); o documento pregado e exposto é uma sugestão de comentaristas antigos, sem fonte primária; *tetelestai* escrito no documento e lido como “pago” é contestado (os recibos conhecidos são de alfândega, séculos II e III, e a sigla pode ser de outra palavra). O estudo ensina o que está comprovado, marca o que é sugestão e liga tudo a Cl 2.14, que diz o que o dono queria dizer. Entrou em `catalog.ts` a obra de Moulton e Milligan.
- **Chicote:** o dono aceitou “uma representação mais próxima do real, não precisa ser o real”. Legenda e texto agora trazem a reconstrução tradicional com ossículos, chumbo e **ganchos de metal**, dita aproximação; `passion-story.ts` ficou coerente com isso. Pedido de imagem reescrito (ossículos, chumbo, ganchos, ferrugem e marcas de uso).
- **Retrato da coroa:** o dono pediu algo **parecido** com os fotogramas, sem ser igual. Prompt reescrito com o mesmo nível de realismo e de crueza, mas ângulo, rosto, fundo e cabelo próprios, sem citar o filme nem o ator, e com plano B se o gerador recusar.

**Decisões:** os fotogramas continuam fora do app e fora dos prompts (direitos autorais e retrato de ator); o “parecido” vem do nível de realismo, nunca da cópia. Rodrigo Silva continua sem fonte; o dono não tem material agora.

**Arquivos:** `rascunhos/como-a-ciencia-explica/` (`conteudo/artigos/do-getsemani-a-ressurreicao.md`, `catalog.ts`, `passion-scene.ts`, `passion-story.ts`, `analises/pedidos-de-imagem-para-o-chatgpt.md`) e `DIARIO.md`.

**Validação:** 175 trechos entre aspas conferidos na Almeida, 166 referências existentes; prévia na porta 4308 no Chrome sem erro de console e sem rolagem horizontal; lint limpo.

**Pendências:** imagens do pedido ao ChatGPT (ou geradas aqui, se o dono quiser gastar créditos do ElevenLabs); fonte de Rodrigo Silva; servidor da 4307 ainda com o pacote antigo.

## 2026-11-10 08:38 -0400 — Almeida corrigida, mapa antigo removido e placa de Pilatos em três línguas

**Autor:** Claude (Sonnet 5.5), a pedido de Valter, que aprovou as três pendências da entrada anterior (08:18), que ficam resolvidas aqui.

**O que foi feito:**
- **Almeida:** 12 erros de digitação corrigidos por `VERSE_FIXES` (`tools/gerar-almeida.py`) e aplicados com `tools/corrigir-almeida.py`, sem editar os JSON à mão. Os três aprovados: Lc 22.46 (“Lenvantai”), Jo 18.3 (vírgula entre lanternas e archotes) e Jo 18.6 (“caíram”). Os outros nove, achados ao conferir as citações do estudo e do mesmo tipo (erros inequívocos de letra, palavra repetida ou acento): Mt 26.64, Jo 19.3, Jo 19.42, Jo 20.23, Jo 20.25, Mc 15.32, Mc 15.43, Lc 24.20 e 2Co 5.21. Conferido versículo a versículo contra o `HEAD`: só esses 12 mudaram, em 5 arquivos (`2CO`, `JHN`, `LUK`, `MAT`, `MRK`). Rodar o corretor de novo não altera nada.
- `passion-map.ts` e `passion-map.scss` (mapa feito à mão pelo Codex) apagados; nada os referenciava.
- Nova figura `paixao-placa` (`passion-placa.ts` / `.scss`): a placa de Pilatos em hebraico, latim e grego, na ordem de Jo 19.20, escrita como texto (com `lang` em cada linha, não como imagem), a tradução, a sigla INRI e as quatro redações dos Evangelhos com botão para cada passagem.
- No estudo, Jo 18.3 e Jo 18.6 voltaram a ser citados literalmente, agora que a Almeida está certa (175 trechos entre aspas conferidos, nenhum fora da Almeida).

**Decisões:**
- Os nove versículos além dos três aprovados foram incluídos por serem o mesmo tipo de erro e estarem nos trechos lidos para o estudo; ficam listados aqui para o dono poder reverter algum.
- O hebraico da placa é a forma moderna (*Yeshua ha-Notzri melekh ha-Yehudim*); a figura diz que a forma exata do século I não se conhece. Grego segue Jo 19.19 e o latim, a Vulgata.
- Erros que ficaram de fora, por serem só de maiúscula ou de pontuação no limite entre versículos (ex.: Mt 27.54 “ora”, Mt 28.3 “o seu aspecto”): não mexi.

**Arquivos:** `tools/gerar-almeida.py`; `public/bible/almeida/{2CO,JHN,LUK,MAT,MRK}.json`; `rascunhos/como-a-ciencia-explica/` (`passion-placa.ts`, `passion-placa.scss`, `figure.ts`, `conteudo/artigos/do-getsemani-a-ressurreicao.md`); `CLAUDE.md`, `DIARIO.md`.

**Validação:** 174 testes de lógica aprovados; lint dos arquivos novos limpo; build avulso da configuração privada compilado; no Chrome (390 e 1280 px), placa renderizada com as três línguas, sem erro de console e sem rolagem horizontal, e cada botão de passagem abrindo a folha. Servidor da prévia na porta 4308. O da 4307 estava com o pacote antigo (o Angular não registra arquivos novos sem reiniciar) e não pude reiniciá-lo: o sistema bloqueou encerrar um processo aberto por outra sessão. Sem commit, push ou deploy.

**Pendências:** reiniciar o servidor da 4307 (ou usar a 4308); a placa em imagem de tábua de madeira é opcional (o ChatGPT só precisaria da textura, sem letras).

## 2026-11-10 08:18 -0400 — Paixão reescrita: voz de Jesus, medicina por etapa e mapa no visualizador do app

**Autor:** Claude (Sonnet 5.5), a pedido de Valter, depois de revisar o que o Codex tinha feito.

**O que foi feito:**
- Revisei o texto do Codex: cuidadoso com as fontes, mas defensivo. Falava mais *sobre* o texto (“não será apresentado”, “não numeramos cada golpe”) do que contava a cena, e por isso não envolvia nem fazia sentir o sofrimento.
- Reescrevi `do-getsemani-a-ressurreicao.md` (cerca de 8.700 palavras, antes 3.000), com as mesmas 12 seções (as figuras interativas se ligam a elas pela ordem), em três camadas: prosa realista no presente; onze painéis escuros com Jesus em **primeira pessoa**; oito quadros “O que o corpo sofre” com a medicina de cada etapa. Entraram o suor de sangue, a prisão e a fuga, a violência contra o rosto (“Profetiza”), o açoite, a coroa e a cana, Simão de Cirene e sua família (Mc 15.21; Rm 16.13), a placa de Pilatos em três línguas, o abandono (Sl 22), a sede, a morte, o sepultamento, o panorama dos discípulos e a ressurreição, até o convite final.
- Troquei o mapa SVG feito à mão por `passion-route.ts` / `.scss`, em cima do `app-bible-map` (mesma geografia, câmera, viajante, marcadores e escala do mapa “A vida de Jesus”), com seis etapas, escolha entre Fortaleza Antônia e palácio de Herodes para o pretório e quilômetros calculados (1,2 + 1,1 + 0,4 = 2,7 km em linha reta; 2,1 km com o palácio).
- Atualizei `STAGES` (`passion-scene.ts`), tópicos, tempo de leitura (38 min), subtítulo e fontes (`catalog.ts`): Josefo, Tácito, Fílon, Martírio de Policarpo, Suetônio, Eusébio, Sanhedrin 43a, Zias e Sekeles, Barbet e Gray.
- Escrevi `analises/pedidos-de-imagem-para-o-chatgpt.md` com prompts e regras de nome (prefixo `paixao-anatomia-`) para a divisão: o ChatGPT faz imagens e GIFs; o Claude, texto, mapa e componentes.

**Decisões:**
- O dono pediu primeira pessoa e mais realismo, e isso substitui, só para esta coleção privada, a regra da voz impessoal. A voz de Jesus fica **dentro dos painéis escuros** e é tecida só com Evangelhos, Salmos e Isaías; toda citação entre aspas é texto exato da Almeida do app (173 trechos conferidos por script, 166 referências existentes). A legenda da primeira figura explica ao leitor o que é cada tipo de quadro.
- **Chicote:** o dono quer o açoite “com cravos, ossos e pregos”. As fontes não permitem afirmar isso. Nicolotti (2017) conclui que quase nada se sabe do instrumento, e Josefo (Guerra 6.304) e o Martírio de Policarpo (2.2) documentam o *efeito* (ossos à mostra; veias e artérias visíveis). O texto apoia o realismo nos efeitos documentados e apresenta o *flagrum* com ossículos e chumbo como reconstrução tradicional, declarada hipótese.
- **Placa como “dívida paga”:** não há costume romano documentado de afixar aviso de dívida quitada, e a leitura de *tetelestai* como recibo “pago” é contestada. O texto liga a placa (a causa da condenação, atestada por Suetônio e Eusébio) a Colossenses 2.14, em que Paulo diz que o escrito de dívida foi cravado na cruz.
- **Artigo de 2025 (PDF de consulta):** não adotei o que contradiz João 19.33-34 (a lança como causa da morte), nem o Sudário como prova, nem a certeza sobre trajetos de cravos. A morte vem antes da lança; as hipóteses sobre a causa aparecem como hipóteses.
- **Rodrigo Silva:** não citei nada dele de memória. Falta fonte (vídeo, livro ou trecho) para parafrasear com atribuição correta.
- **Os dois fotogramas do filme enviados como referência** não entram no app (direitos autorais e retrato de um ator); servem de régua de realismo para os pedidos de imagem.
- O mapa não inclui o Cenáculo (a ~200 m da casa de Caifás, o visualizador os funde num marcador só) nem Herodes Antipas (endereço desconhecido).

**Arquivos:** `rascunhos/como-a-ciencia-explica/` (`conteudo/artigos/do-getsemani-a-ressurreicao.md`, `passion-route.ts`, `passion-route.scss`, `figure.ts`, `passion-scene.ts`, `catalog.ts`, `analises/pedidos-de-imagem-para-o-chatgpt.md`), `CLAUDE.md` e `DIARIO.md`. Nada em `src/` nem em `public/`.

**Validação:** citações e referências por script; prévia privada (porta 4307) no Chrome a 360, 390 e 1280 px sem erro de console, sem rolagem horizontal, com as 12 seções, 11 painéis, 8 quadros, 10 figuras e o mapa percorrendo as etapas; lint dos arquivos tocados; 6 testes de isolamento e trava de publicação aprovados. Sem commit, push ou deploy.

**Pendências:** leitura e ajuste do texto com o dono (sobretudo os painéis em primeira pessoa); imagens do pedido ao ChatGPT; placa em três línguas como figura SVG; `passion-map.ts` do Codex ficou sem uso; Lucas 22.46 da Almeida tem erro de digitação (“Lenvantai”) e Jo 18.3 e Jo 18.6 também (corrigir por `tools/gerar-almeida.py`, `VERSE_FIXES`).

## 2026-11-10 ~07:40 -0400 — Mapa, impulsos nervosos e novas cenas privadas

**Autor:** Codex, a pedido de Valter.

**O que foi feito:** acrescentado mapa animado no tópico das autoridades, com oito etapas do Getsêmani ao sepultamento e ao anúncio da ressurreição, hipóteses oriental/ocidental do pretório, norte, escala e aproximação. Acrescentados impulsos esquemáticos sobre encéfalo e medula, com pausa e ampliação. Esclarecidos os archotes como tochas em João 18.3. Integradas três sequências visuais de quatro momentos: Pedro/Malco e o toque de cura, Jesus diante de Anás e a bofetada, rosto coberto e zombaria. Acrescentadas imagens nítidas de um modelo ilustrativo de açoite e de uma coroa sobre a cabeça, com fontes e legendas. Os cinco novos arquivos foram gerados com a ferramenta integrada imagegen e mantidos privados. Criado relógio comum de reprodução com visibilidade, pausa manual, reinício e movimento reduzido.

**Decisões:** os 2,7 km e 2,1 km do mapa são somas geométricas em linha reta entre marcos aproximados conforme o pretório escolhido, não a distância que Jesus efetivamente caminhou. O endereço de Herodes não foi inventado; sepultamento é transporte do corpo, e a ressurreição não recebe deslocamento fictício. A pesquisa de Andrea Nicolotti impede apresentar forma e materiais do açoite como identificação da arma exata. Lucas descreve toque e cura da orelha, sem cirurgia de recolocação; os episódios de João e dos sinóticos permanecem distintos. A geração da coroa com feridas mais intensas foi bloqueada pelo gerador; foi criada uma alternativa de retrato sem ferimentos novos. A imagem anterior das costas foi preservada e não foi produzida carne exposta.

**Validação:** builds privado e público, lint, seis testes de isolamento e diff conferidos. No Chrome, confirmados impulsos em movimento, pausa e ampliação; três sequências com quatro imagens-chave; mapa com oito etapas, duas medidas, aproximação, pausa e reinício; imagens, limites históricos, movimento reduzido e larguras 360/390/1280. Regressão das nove explicações e seus controles aprovada. Artigo ausente do catálogo público; Markdown e dezesseis imagens retornam 404 na produção. Guard ampliado para os novos identificadores de figuras e aprovado. As doze seções do artigo foram preservadas. Prompts, fontes, caminhos e capturas ficam em `rascunhos/como-a-ciencia-explica/analises/cenas-mapa-e-objetos.md` e `analises/previas-cenas-mapa/`. Nenhum commit, push ou deploy.

## 2026-11-09 ~14:59 -0400 — Circulação, ciclo automático, órgãos em movimento e costas

**Autor:** Codex, a pedido de Valter, com base nas telas marcadas.

**O que foi feito:** circulação visível nas duas pranchas de pele, com maior contraste do fluxo; o suor anima apenas os vasos e os ferimentos também animam o sangramento. Simulação de ação/anatomia agora começa e repete quando está à vista, preservando pausa manual, inspeção pela linha do tempo e movimento reduzido. Acrescentados movimentos ilustrativos de coração, pulmões, diafragma e ar na prancha do tórax e em sua ampliação. A opção A lança mantém a anatomia estática. Acrescentada visão posterior das costas após os açoites, com imagem gerada por imagegen, legenda sobre os limites históricos e ampliação. As doze cenas passaram a uma grade responsiva, sem barra horizontal.

**Decisões:** os movimentos do tórax representam fisiologia normal, com ritmos e amplitudes didáticos, sem reconstruir sinais vitais de Jesus. A visão posterior é uma possibilidade artística, não um mapa comprovado das feridas. O pedido atual autoriza reprodução automática, substituindo a escolha inicial de reprodução apenas manual. Movimento reduzido continua começando pausado, com ativação disponível. Nenhum conteúdo foi publicado.

**Validação:** builds privado e público, lint dos componentes privados e diff conferidos. Chrome: repetição, pausa, retomada por visibilidade, preservação da pausa manual, sangue nos dois painéis, coração/pulmões/diafragma, controles na ampliação, visão posterior e Escape, movimento reduzido e larguras 360/390/1280 aprovados. Regressão das nove explicações e marcadores aprovada. Catálogo público sem o estudo; Markdown e onze imagens retornam 404. Guard de publicação aprovado, componentes e imagem ignorados pelo Git. Notas, prompt e referências em `analises/fisiologia-e-costas.md`; capturas em `analises/previas-fisiologia/`. Sem commit, push ou deploy.

## 2026-11-09 14:24 -0400 — Mais realismo e sangue na simulação privada

**Autor:** Codex, a pedido de Valter.

**O que foi feito:** criadas versões `v2` das imagens de ação e de pele com a ferramenta integrada imagegen. Na cena de contato aparece uma marca com sangue; na resposta aparecem sangue acumulado e escorrimento pelo torso. O corte anatômico tem sangue mais visível e textura úmida na lesão existente. Os primeiros momentos continuam com pele íntegra. A versão nova é usada na simulação, no atlas dos ferimentos e na ampliação; a explicação sobre suor conserva a prancha anterior. Os arquivos originais foram preservados.

**Validação:** builds privado e público, lint dos componentes privados e conferência visual aprovados. Chrome: quatro momentos, imagens, sincronização, pausa, retomada, reinício, velocidades, teclado e larguras 360/390/1280; explicações e marcadores existentes também aprovados. O artigo, Markdown e dez imagens continuam ausentes da versão pública por HTTP. Guard de publicação aprovado e imagens ignoradas pelo Git. Prompts, caminhos e capturas em `analises/realismo-sangue-v2.md` e `analises/previas-impacto-v2/`. Sem commit, push ou deploy.

## 2026-11-09 ~14:14 -0400 — Ação do carrasco e anatomia sincronizadas

**Autor:** Codex, a pedido de Valter.

**O que foi feito:** acrescentada sequência visual privada em quatro momentos: preparação, aproximação, contato e resposta. Uma reconstituição do carrasco com torso de treinamento acompanha um corte da pele, que passa de íntegro para uma lesão ilustrativa, com deformação ampliada, sangue e sinal nervoso esquemático. Criadas duas imagens com imagegen: folha de quatro poses e versão íntegra da prancha de pele, preservando a original. Reprodução, pausa, reinício, linha do tempo por teclado e velocidades normal/lenta. Sem reprodução automática; pausa ao ocultar a aba e limpeza do ciclo de animação ao sair.

**Decisões:** sequência de imagens-chave sincronizadas, sem apresentá-la como vídeo contínuo, simulação biomecânica validada ou reprodução dos ferimentos individuais de Jesus. Tempos e deformação são didáticos, sem fornecer força, profundidade ou um medidor de dor. Material permanece na pasta ignorada `rascunhos/`; nomes das novas imagens já são cobertos pela proteção de publicação existente.

**Validação:** builds privado e público, lint e conferência visual aprovados. Chrome: quatro poses distintas, transição íntegra/lesionada, deformação, sangue, indicação nervosa, pausa estável, retomada, reinício, velocidades, teclado, movimento reduzido e larguras 360/390/1280. Regressão das nove explicações e seus marcadores, ampliação e teclado aprovada. Artigo, Markdown e oito imagens ausentes da versão pública por HTTP; proteção de publicação aprovada. Servidor privado reiniciado em 127.0.0.1:4307 para registrar os novos arquivos. Prompts, fontes e capturas em `analises/simulacao-impacto.md` e `analises/previas-impacto/`. Nenhum commit, push ou deploy.

## 2026-11-09 14:07 -0400 — Sangue animado na prancha privada

**Autor:** Codex, a pedido de Valter.

**O que foi feito:** acrescentado sangue em movimento contínuo sobre a lesão e os vasos da prancha de pele, com reflexos, escorrimento e gotas em SVG/CSS, como um GIF integrado à imagem. Botão de pausa/retomada sincronizado com a ampliação. O efeito aparece no painel dos ferimentos; não foi acrescentado ao painel do suor de Getsêmani. Nenhum novo arquivo de imagem foi necessário.

**Validação:** build privado e lint aprovados. Chrome: avanço real e pausa estável das animações, retomada, ampliação sincronizada, identificadores SVG únicos, pontos clicáveis e larguras 360/390/1280 conferidos. Movimento reduzido inicia pausado e permite ativação voluntária. Proteção de publicação e seus seis testes conferidos; tudo permanece privado e ignorado pelo Git. Captura em `rascunhos/como-a-ciencia-explica/analises/previas-sangue/`. Nenhum commit, push ou deploy.

## 2026-11-09 14:03 -0400 — Realismo anatômico na prévia privada

**Autor:** Codex, a pedido de Valter.

**O que foi feito:** substituídos os desenhos simplificados por três pranchas anatômicas realistas geradas com imagegen: sistema nervoso central, corte da pele com lesão ilustrativa e tórax. Acrescentadas nove explicações sobre estrutura, mecanismo e consequências possíveis, marcadores acessíveis, legendas e ampliação com diálogo nativo. A visão geral das doze cenas passou a usar a arte narrativa. Prompts, fontes e capturas ficaram na pasta privada.

**Decisões:** apresentação de atlas médico, preservando a diferença entre anatomia geral e hipóteses sobre Jesus. O gerador rejeitou o corte de cabeça; foi usada uma ilustração isolada do sistema nervoso central. As imagens não são fotografias clínicas nem passaram por validação médica independente. Nenhum conteúdo foi movido para `public/` ou para o catálogo público.

**Validação:** builds privado e público, lint e seis testes de isolamento aprovados. Chrome: nove explicações, todos os marcadores, imagens, ampliação, Escape, retorno do foco, teclado e larguras 360/390/1280 conferidos. Artigo ausente do catálogo público; Markdown e seis imagens retornam 404 no artefato de produção. Proteção de publicação ampliada para os novos arquivos e aprovada. Nenhum commit, push ou deploy.

**Pendências:** avaliação visual/editorial com o dono. Publicação continua dependente de pedido explícito.

## 2026-11-09 13:39 -0400 — Narrativa privada do Getsêmani à ressurreição

**Autor:** Codex, a pedido de Valter.

**O que foi feito:**
- Desenvolvi a primeira versão de “Do Getsêmani à Ressurreição”, na coleção privada, cobrindo oração, prisão, interrogatórios, agressões, açoites, zombaria, caminho, cruz, morte, sepultamento e os encontros narrados após a ressurreição.
- Acrescentei doze cenas navegáveis, três painéis interativos de fisiologia, imagens artísticas de Getsêmani/Gólgota/sepulcro aberto e apresentação própria para celular e computador. As imagens foram geradas com imagegen e seus prompts ficaram registrados na pasta privada.
- Mantive o conteúdo fora de `public/` e do Git. Ampliei os identificadores bloqueados na verificação de publicação e o teste de exclusão do catálogo padrão. A configuração de rascunhos passou a servir as imagens privadas junto dos Markdown.

**Decisões:**
- O dono confirmou que o percurso deve ir até a ressurreição. A narrativa distingue detalhes de cada Evangelho, explicações gerais do corpo e reconstituição artística.
- Preservar João 19: morte constatada antes do golpe de lança; não apresentar hipótese respiratória como fato estabelecido nem criar um mecanismo médico da ressurreição.
- Não alterar o artigo público “A Crucificação Romana”. A nova narrativa o referencia como contexto histórico.
- Abrir a prévia privada na porta 4307, pois 4200 e 4201 já estavam ocupadas.

**Arquivos:** conteúdo, catálogo, componentes, estilos, ilustrações, fontes e notas dentro de `rascunhos/como-a-ciencia-explica/`; `angular.json`; `tools/verificar-publicacao.mjs`; `e2e/logica/rascunhos.spec.ts`; `CLAUDE.md` e `DIARIO.md`.

**Validação:** builds da prévia e de produção, lint e 174 testes de lógica aprovados. Conferidas 55 referências e duas citações na Almeida local. No Chrome, conferidos os doze capítulos, três imagens, quatro interativos, botões, teclado e salto entre cenas, sem rolagem horizontal a 360/390/1280 px. O build público não contém o estudo; o Markdown e as três imagens retornaram 404 e o guard de publicação aprovou o artefato. Nenhum commit, push ou deploy foi feito.

**Pendências:** avaliação editorial da primeira versão com o dono; publicação depende de pedido futuro explícito.

## 2026-11-09 08:47 -0400 — Como a Ciência Explica em prévia local privada

**Autor:** Codex, a pedido de Valter.

**O que foi feito:**
- Recuperei do commit `f62e1e9` somente a coleção “Como a Ciência Explica”: sete artigos, três volumes, fontes e figuras, na pasta local `rascunhos/`, ignorada pelo Git.
- Acrescentei `npm run start:rascunhos`, restrito a `127.0.0.1`, com substituições de módulos, estilos e arquivos próprios da prévia. O aplicativo padrão usa catálogos vazios, e a prévia mostra “Rascunhos locais · não publicados”.
- Acrescentei verificação dos artefatos públicos e seis testes para impedir inclusão acidental dos identificadores, textos ou figuras da coleção; os workflows chamam a proteção antes da publicação.

**Decisões:**
- Trabalhar na coleção sem disponibilizá-la ao público. Os textos ficam fora de `public/` e do Git, e a saída da prévia fica separada de `dist/`.
- Recuperar somente a coleção, conforme resposta expressa do dono; menu lateral, modo de foco e anotações de trechos não foram recuperados.
- Restaurar os textos sem revisão científica nesta etapa. A decisão de publicar fica para um pedido futuro.

**Arquivos:** `.gitignore`, `angular.json`, `package.json`, `README.md`, `CLAUDE.md`, `DIARIO.md`; integração de rascunhos em `app.*`, `core/library.ts`, `core/trails.ts`, `core/sources.ts`, `core/draft-content.ts`, `shared/figure.ts`, `shared/draft-figure.ts`; `tools/verificar-publicacao.mjs`, `e2e/logica/rascunhos.spec.ts` e os dois workflows. O conteúdo recuperado fica somente na pasta ignorada `rascunhos/`.

**Validação:** lint aprovado; 174 testes de lógica aprovados; builds da prévia e de produção aprovados; build de produção aprovado também em cópia sem a pasta privada. A proteção aprovou o artefato público. No Chrome, conferi os três volumes, sete artigos, sete figuras, busca e largura de celular na prévia. No artefato público, confirmei ausência na biblioteca/busca, as sete rotas sem conteúdo e os sete Markdown indisponíveis por HTTP. Os subprocessos Node de cinco testes foram bloqueados pelo sandbox na primeira rodada e passaram na execução autorizada fora dessa restrição.

**Pendências:** revisar e desenvolver o conteúdo da coleção com o dono. Nenhum commit, push ou deploy foi feito nesta etapa.

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
