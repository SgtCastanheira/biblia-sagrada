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
