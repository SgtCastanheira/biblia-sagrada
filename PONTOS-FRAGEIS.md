# Pontos frágeis do projeto

Análise feita em 29/10/2026, no commit `e2f147d`. O build de produção (`npx ng build`) passa sem avisos nem erros; os pontos abaixo são riscos de projeto e de código, do mais grave para o menos grave.

## Resumo

| # | Ponto | Gravidade | Esforço para corrigir |
|---|---|---|---|
| 1 | O site é publicado sem rodar os testes (**resolvido em parte**: testes de lógica no CI) | Alta | Baixo |
| 2 | Falhas ao salvar os dados do usuário são silenciosas (**resolvido**) | Alta | Médio |
| 3 | Restaurar um backup pode apagar tudo (**resolvido**) | Alta | Baixo |
| 4 | Commits grandes e direto na `main` (**resolvido em parte**: branch `dev` e PR para a `main`) | Média | Combinado da equipe |
| 5 | Conteúdo de estudo sem revisão de fatos | Média | Contínuo |
| 6 | Dependência da API gratuita bible-api.com | Média | Médio |
| 7 | Primeira visita baixa cerca de 10 MB | Baixa | Médio |
| 8 | Sem testes unitários nem linter (**linter resolvido**) | Baixa | Médio |

## 1. O site é publicado sem rodar os testes

`.github/workflows/publicar.yml` faz só `npm ci` → `ng build` → copia o `404.html` → publica (linhas 27–30). Os testes Playwright, que cobrem acessibilidade, contraste, links, referências bíblicas e fontes, só rodam quando alguém lembra de rodar na própria máquina. Qualquer push na `main` com defeito chega direto aos usuários.

**Feito em 29/10/2026:** o workflow roda `npx playwright test --project=logica` (130 testes, cerca de 20 s) antes do build; se algum falhar, o app não é publicado. A variável `SO_LOGICA=1` faz o `playwright.config.ts` não subir o `ng serve`, que esses testes não usam.

**Falta:** os testes de tela (projetos `celular` e `computador`) ainda não rodam no CI. Eles precisam do Google Chrome no runner e do `ng serve`, e demoram bem mais.

## 2. Falhas ao salvar os dados do usuário são silenciosas

Sermões, anotações, EBD, devocional, favoritos e ajustes ficam apenas no `localStorage`. Todos os serviços gravam com o mesmo padrão, que engole o erro:

```ts
try {
  localStorage.setItem(...);
} catch {
  // armazenamento indisponível
}
```

Exemplos: `src/app/core/sermons.service.ts:83`, `src/app/core/notes.service.ts:129`, `src/app/core/ebd.service.ts:159`, `src/app/core/devotional.service.ts:206`.

Se o espaço acabar (cerca de 5 MB por site), a pessoa continua escrevendo, a tela mostra tudo normal e nada é salvo. Além disso, o Safari no iPhone costuma apagar os dados de sites não instalados que ficam alguns dias sem uso. O único backup é exportar o arquivo à mão.

**Sugestão:** centralizar a gravação num único serviço que, ao falhar, mostre um aviso ("Não foi possível salvar. Faça um backup.") e lembrar o backup com mais insistência para quem tem sermões e anotações.

**Feito em 29/10/2026:** toda gravação passa por `saveLocal` (`src/app/core/storage.service.ts`). Se falhar, o app avisa uma vez por visita (com o botão "Ajustes") e Ajustes › Seus dados mostra o alerta. O app também pede ao navegador armazenamento persistente (`navigator.storage.persist()`) para quem já tem dados pessoais, e Ajustes mostra se os dados estão protegidos, quanto espaço ocupam e um botão "Proteger".

**Falta:** a troca do `localStorage` por IndexedDB (mais espaço) ficou para depois; veja o `DIARIO.md`.

## 3. Restaurar um backup pode apagar tudo

Em `src/app/core/backup.service.ts:67`, o `restore()` primeiro remove todos os dados atuais e só depois grava os do arquivo, sem `try` e sem como desfazer. Se a gravação falhar no meio (por exemplo, por falta de espaço), a pessoa perde os dados antigos e os novos. O `parse()` confere só o campo `app` e se `data` é um objeto; o conteúdo de cada chave não é validado (um valor que não seja texto é gravado como `"[object Object]"`).

**Sugestão:** validar que todo valor é texto, guardar uma cópia dos dados atuais, gravar os novos dentro de `try` e, se falhar, devolver a cópia.

**Feito em 29/10/2026:** exatamente isso. Um backup danificado é recusado sem mexer em nada, e um backup que não cabe devolve os dados que estavam no aparelho. Os dois casos têm teste em `e2e/dados.spec.ts`.

## 4. Commits grandes e direto na `main`

São 83 commits entre 23/10 e 29/10/2026, cada um com várias funcionalidades juntas. O último, por exemplo: *"Linha do tempo da história, o Coliseu e as Catacumbas de Roma, a igreja nas crises e Libras"*. Não há branches nem pull requests. Fica difícil revisar, achar onde um defeito entrou ou desfazer só uma parte.

**Sugestão:** uma funcionalidade por branch e por pull request; o CI do item 1 roda no PR antes de entrar na `main`.

**Feito em 29/10/2026:** a branch `dev` é a de desenvolvimento e homologação; a `main` é produção e só recebe pull request vindo da `dev`. O workflow `testes.yml` roda lint, testes de lógica e build em todo envio para a `dev` e em todo PR. **Falta:** ligar no GitHub a proteção da `main` e tornar a `dev` a branch padrão (precisa de permissão de administrador); combinar com a equipe uma funcionalidade por commit.

## 5. Conteúdo de estudo sem revisão de fatos

Boa parte do conteúdo é texto escrito dentro do TypeScript: `src/app/core/library.ts` (983 linhas), `tribes.ts` (863), os 10 arquivos `ebd-*-4t26.ts`, `sources.ts`, além dos 66 artigos em `public/conteudo/artigos/`. Os testes conferem a **estrutura** (a referência bíblica existe, o link funciona, a fonte está cadastrada, o título segue a regra), mas não se o **fato** está certo. Num app de estudo para igreja, um erro histórico ou teológico é o risco mais sério para a credibilidade.

**Sugestão:** definir alguém (pastor, professor de EBD) para revisar o conteúdo novo antes de publicar, e registrar no próprio artigo quando foi revisado.

## 6. Dependência da API gratuita bible-api.com

As versões que não vêm embutidas no app vêm do bible-api.com, com limite de cerca de 12 pedidos a cada 30 segundos (fila em `src/app/core/bible.service.ts`). O código considera "limite atingido" qualquer erro com status 0 quando há internet (`isRateLimit`, `bible.service.ts:27`), uma suposição que pode esconder outros problemas, como a API fora do ar ou um bloqueio de CORS. Se o serviço acabar, essas versões param de funcionar. A Almeida e as versões embutidas continuam funcionando.

**Sugestão:** mostrar uma mensagem clara quando a API falha e, onde a licença permitir, embutir as versões mais usadas.

## 7. Primeira visita baixa cerca de 10 MB

O service worker (`ngsw-config.json`) baixa adiantado a Almeida (4,1 MB), todo o conteúdo de estudo (3,1 MB) e todas as imagens e fontes (2,6 MB). É o que garante o uso sem internet, mas pesa no plano de dados de quem abre o link pela primeira vez no celular.

**Sugestão:** deixar as imagens dos artigos (`/conteudo/imagens/`) em modo `lazy` e manter adiantado só o essencial.

## 8. Sem testes unitários nem linter

`ng test` não tem specs, e não há ESLint. Toda a verificação é Playwright, que depende do Google Chrome instalado e do `ng serve` rodando. O código Angular é moderno e organizado (componentes standalone, signals, rotas lazy), mas cerca de 28 mil linhas sem lint tendem a acumular inconsistências.

**Sugestão:** adicionar `ng add @angular-eslint/schematics` e rodar o lint no CI.

**Feito em 29/10/2026:** `angular-eslint` 21 instalado (`npm run lint`), com as regras recomendadas e as de acessibilidade dos templates. Havia 24 problemas, todos resolvidos; o lint roda no CI antes dos testes. **Falta:** os versículos do leitor abrem as opções só com toque ou clique, não pelo teclado (exceção comentada em `reader.html`).

## Ambiente de desenvolvimento (Windows)

- Python 3.13 foi instalado em 29/10/2026. Use `python` ou `py`, não `python3`: no Windows, `python3` abre a Microsoft Store. O `tools/LEIA-ME.md` ainda mostra os comandos com `python3`.
- `npm run test:offline` não funciona no Windows (o `PROD=1` do script não é entendido pelo cmd.exe). No PowerShell: `$env:PROD='1'; npx playwright test --project=producao`.

## Ordem sugerida

1. Testes no CI antes de publicar (item 1).
2. Restaurar backup com segurança (item 3) e avisar quando a gravação falhar (item 2).
3. Combinar com a equipe: branches, PRs e revisão de conteúdo (itens 4 e 5).
