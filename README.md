# Bíblia Sagrada

Aplicativo da Bíblia em português, feito com **Angular** e **Angular Material**, para ler, estudar e preparar aulas — no celular ou no computador, com ou sem internet.

**Abrir o app:** https://sgtcastanheira.github.io/biblia-sagrada/ — no celular, use “Adicionar à tela inicial” para instalar.

## O que o app tem

- **Leitura**: em português, a Almeida, a Bíblia Livre, a Nova Bíblia Viva, a Bíblia Portuguesa Mundial e a Bíblia Livre Para Todos (NT), todas embutidas e de licença livre; outras versões em domínio público; links para abrir o versículo na ARA, ARC, NVI, NTLH, NAA e NVT (no site do YouVersion); comparação de versões; destaques e favoritos; busca por palavra.
- **Estudo**, sempre ligado ao texto e organizado de Gênesis a Apocalipse:
  - painel “Estudar este capítulo” com contexto histórico, notas, aulas, mapas e profecias;
  - dicionário com o hebraico, o aramaico, o grego e o latim — as palavras ficam marcadas no texto;
  - referências cruzadas (citações do AT no NT e textos relacionados);
  - **linha do tempo da história**, da Criação aos nossos dias, em 16 épocas: cada uma reúne os livros da Bíblia, as histórias, os personagens, as curiosidades, as profecias, os mapas e as crises do mundo (a fome do tempo de José, a peste de Cipriano, a Peste Negra, a crise de 1929…);
  - Memorial da Fé (personagens, reis, profetas) e genealogia de Jesus;
  - as doze tribos de Israel: patriarcas, bênçãos, líderes, censos, acampamento e o mapa da divisão da terra, com a distância até o templo;
  - mapas das jornadas e atlas histórico por época;
  - promessas e profecias, Daniel e Apocalipse;
  - aulas de contexto histórico e cultural, História da Igreja e de onde veio a Bíblia;
  - sermões históricos de avivamento.
- **IBUC** (Instituto Bíblico Único Caminho — Sede): apoio ao professor por faixa etária, com curiosidades, contexto histórico e brincadeiras para cada tema.
- **Igreja**: Escola Bíblica Dominical (organizar a revista e as lições), devocional, anotações de culto e um editor de sermões com modo púlpito.
- **PWA**: pode ser instalado no celular e funciona sem internet.

## Como rodar

Requisitos: [Node.js](https://nodejs.org) 20 ou superior.

```bash
npm install
npx ng serve
```

Abra http://localhost:4200.

Para gerar a versão de produção (pasta `dist/`):

```bash
npx ng build
```

> O app só pode ser instalado no celular e funcionar offline quando publicado com **HTTPS** (Firebase Hosting, Netlify, Vercel…).

## Testes

O protocolo completo de testes (Playwright) está em [TESTES.md](TESTES.md).

```bash
npm run test:e2e        # tudo: lógica + celular + computador
npm run test:offline    # build de produção e modo sem internet
```

### Acompanhar os testes

| Para… | Use |
|---|---|
| ver cada teste passar (`✓`) ou falhar (`✘`) na hora, no terminal | `npx playwright test` |
| escolher um teste e ver a tela dele passo a passo | `npm run test:e2e:ui` |
| ver o navegador abrindo durante o teste | acrescente `--headed` (ex.: `npx playwright test -g "backup" --headed`) |
| ver o que falhou na última execução (capturas e passo a passo) | `npm run test:e2e:relatorio` |
| acompanhar um teste que está rodando em segundo plano (pelo Claude Code, por exemplo) | `Get-Content "<arquivo de saída>" -Wait` no PowerShell, ou `tail -f "<arquivo de saída>"` no Git Bash |

Não rode duas suítes ao mesmo tempo: elas disputam o mesmo `ng serve` e o mesmo Chrome, e o resultado pode sair errado.

**No Windows**, `npm run test:offline` não funciona (o cmd.exe não entende o `PROD=1` do script). Use, no PowerShell: `$env:PROD='1'; npx playwright test --project=producao`.

### Lint

```bash
npm run lint
```

Confere o código TypeScript e os templates (inclusive regras de acessibilidade) com o `angular-eslint`. O código está sem nenhum problema; o CI falha se aparecer algum.

## Branches: desenvolvimento e produção

| Branch | Para quê | O que acontece a cada envio |
|---|---|---|
| `dev` | Desenvolvimento e homologação (branch padrão) | O GitHub Actions roda lint, testes de lógica e build (workflow **Testes**). Não publica nada. |
| `main` | Produção: o app no ar | Roda lint e testes de lógica e, se passarem, publica no GitHub Pages (workflow **Publicar no GitHub Pages**). Se algo falhar, o site continua na versão anterior. |

Como trabalhar:

1. Desenvolva na `dev` (ou numa branch criada a partir dela).
2. Quando a `dev` estiver testada e aprovada, abra um **pull request da `dev` para a `main`**.
3. Com os testes verdes no pull request, faça o merge: a `main` publica sozinha.

Nunca envie direto para a `main`. Para ver o resultado dos testes, abra a aba **Actions** do repositório no GitHub. Os testes de tela (celular e computador) ainda rodam só no computador de quem desenvolve.

## Dados e conteúdo

- `public/bible/` — a Almeida embutida e as referências cruzadas.
- `public/maps/` — a geografia dos mapas.
- `public/conteudo/` — dicionário, memorial, notas, profecias, artigos e sermões (texto editável).
- `tools/` — scripts que geram os dados; veja [tools/LEIA-ME.md](tools/LEIA-ME.md).

## Créditos

Textos, mapas e dados de terceiros mantêm as suas licenças. Veja [CREDITOS.md](CREDITOS.md) — e a tela **Ajustes → Créditos e licenças** no app.

## Licença

O código do app está sob a licença [MIT](LICENSE). A licença vale só para o código: os textos, mapas e dados de terceiros seguem as licenças de cada um, listadas em [CREDITOS.md](CREDITOS.md).
