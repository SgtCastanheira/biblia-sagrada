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
