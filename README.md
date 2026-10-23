# Bíblia Sagrada

Aplicativo da Bíblia em português, feito com **Angular** e **Angular Material**, para ler, estudar e preparar aulas — no celular ou no computador, com ou sem internet.

**Abrir o app:** https://sgtcastanheira.github.io/biblia-sagrada/ — no celular, use “Adicionar à tela inicial” para instalar.

## O que o app tem

- **Leitura**: a Almeida embutida (funciona offline) e outras versões em domínio público; comparação de versões; destaques e favoritos; busca por palavra.
- **Estudo**, sempre ligado ao texto e organizado de Gênesis a Apocalipse:
  - painel “Estudar este capítulo” com contexto histórico, notas, aulas, mapas e profecias;
  - dicionário com o hebraico, o aramaico, o grego e o latim — as palavras ficam marcadas no texto;
  - referências cruzadas (citações do AT no NT e textos relacionados);
  - Memorial da Fé (personagens, reis, profetas), genealogia de Jesus e linha do tempo;
  - mapas das jornadas e atlas histórico por época;
  - promessas e profecias, Daniel e Apocalipse;
  - aulas de contexto histórico e cultural, História da Igreja e de onde veio a Bíblia;
  - sermões históricos de avivamento.
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

## Dados e conteúdo

- `public/bible/` — a Almeida embutida e as referências cruzadas.
- `public/maps/` — a geografia dos mapas.
- `public/conteudo/` — dicionário, memorial, notas, profecias, artigos e sermões (texto editável).
- `tools/` — scripts que geram os dados; veja [tools/LEIA-ME.md](tools/LEIA-ME.md).

## Créditos

Textos, mapas e dados de terceiros mantêm as suas licenças. Veja [CREDITOS.md](CREDITOS.md) — e a tela **Ajustes → Créditos e licenças** no app.

## Licença

O código do app está sob a licença [MIT](LICENSE). A licença vale só para o código: os textos, mapas e dados de terceiros seguem as licenças de cada um, listadas em [CREDITOS.md](CREDITOS.md).
