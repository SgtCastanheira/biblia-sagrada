# Protocolo de testes — Bíblia Sagrada

Testes automáticos de ponta a ponta com [Playwright](https://playwright.dev). Eles abrem o app no Chrome
(como celular e como computador), usam as telas como uma pessoa usaria e **falham se aparecer qualquer
erro** — inclusive erros que não aparecem na tela, como um `404` de um arquivo JSON.

## Como rodar

| Comando | O que faz |
|---|---|
| `npm run test:e2e` | Roda tudo: lógica + celular + computador (~1 min) |
| `npm run test:e2e:celular` | Só lógica + celular (mais rápido) |
| `npm run test:e2e:ui` | Abre o painel visual: escolha um teste e veja-o rodar passo a passo |
| `npm run test:e2e:relatorio` | Abre o relatório da última execução (com capturas das falhas) |
| `npm run test:offline` | Gera o build de produção e testa o modo offline (service worker) |

Rodar um teste específico: `npx playwright test -g "jornada"` · ver o navegador: acrescente `--headed`.

**Pré-requisitos:** Google Chrome instalado (os testes usam o Chrome do computador, nada a baixar).
Se o `ng serve` já estiver rodando na porta 4200 ele é reaproveitado; senão os testes o iniciam sozinhos.

**Acompanhar uma execução em segundo plano** (por exemplo, iniciada pelo Claude Code): siga o arquivo de saída com `Get-Content "<arquivo>" -Wait` (PowerShell) ou `tail -f "<arquivo>"` (Git Bash). Só funciona se o comando não terminar em `| tail`, que segura toda a saída até o fim. Não rode duas suítes ao mesmo tempo.

**No CI:** o workflow de publicação roda o projeto `logica` antes do build (`SO_LOGICA=1` dispensa o `ng serve`); se algum teste falhar, o app não é publicado.

## O vigia automático

Todo teste de navegador passa por um **vigia** (`e2e/base.ts`) que registra:

- erros de JavaScript na página;
- mensagens de erro no console;
- **respostas HTTP 400+** do próprio app ou da bible-api.com (ex.: `HTTP 404 em /bible/almeida/JOS.json`);
- requisições que falharam.

Se algo for registrado, o teste falha e a mensagem lista exatamente o quê. Para um erro *esperado*
num teste específico, use `problems.allow(/padrão/)`.

O vigia também:

- **simula a bible-api.com** com texto de teste estável — os testes não dependem da internet nem do limite
  de requisições. Para usar a API real num teste: `test.use({ realApi: true })`;
- começa cada teste com **dados limpos** e sem os avisos automáticos (curiosidade/devocional) cobrindo a tela.

## O que é testado

| Arquivo | Cobertura |
|---|---|
| `logica/referencias.spec.ts` | Leitor de referências: `Js 6.1-20`, `At 16.9,10`, `At 22.29; 23.27`, `I Coríntios 13`, `Jó` × `Jo`… e recusa de inválidas |
| `logica/importacao-revista.spec.ts` | "Colar da revista": extrai só título, tema e referências |
| `logica/mapas-dados.spec.ts` | Cada etapa de cada mapa tem lugar existente e versículo válido; geografia gerada |
| `logica/mapas-ordem.spec.ts` | Mapas na ordem dos livros da Bíblia |
| `logica/conteudo-estudo.spec.ts` | Dicionário (sentidos e conjugações), contexto dos 66 livros, notas, memorial, genealogia, profecias, citações do AT no NT, atlas, artigos e sermões: **toda referência bíblica precisa ser válida**, todo personagem, mapa e estudo citado precisa existir |
| `logica/tribos.spec.ts` | As 12 tribos: **toda referência existe na Almeida** (até o versículo), censos somam o que Números diz, grupos do acampamento, personagens do memorial, número de cada território dentro do polígono e distâncias |
| `logica/ibuc.spec.ts` | IBUC: turmas e aulas ligadas a turmas existentes, referências válidas |
| `navegacao.spec.ts` | Todas as telas (40 rotas) abrem sem erros e **sem rolagem lateral**; barra de navegação; rota inexistente |
| `varredura.spec.ts` | **Toda tela gerada pelos dados** (cada estudo, estado da Assembleia de Deus, mapa, sermão, tribo e curiosidade) abre sem erro no console nem requisição falha, sem rolagem lateral, com texto ≥ 13px e **fotos carregando** |
| `logica/epocas.spec.ts` | **Linha do tempo da história**: 16 épocas em ordem e sem buracos, fronteiras (`-6`, `30`, `64`, `1500`, `1945`…); **todo capítulo de todo livro da Bíblia cai em uma época só**; toda história datada, personagem, curiosidade, profecia e mapa tem época; todo fato do mundo tem ícone, referência bíblica válida e história existente, e **toda época tem ao menos um fato** (a crise de 1929, a Peste Negra, a fome do tempo de José…) |
| `epocas.spec.ts` | Índice e página de cada época: Bíblia, personagens e mapa; a crise de 1929 no meio das histórias e o filtro; a história leva à sua época; chips de época em curiosidade, personagem, profecia, mapa e livro; a busca do Estudo acha o fato e a época; entradas no Estudo, na tela inicial e em Histórias |
| `logica/links-internos.spec.ts` | Todo **link interno** escrito nos textos (`[texto](/artigo/x)`) e nos dados (novidades, mapas) leva a uma tela que existe; toda foto citada existe |
| `logica/lembretes.spec.ts` | **Lembretes do dia**: três por dia, cada um na sua faixa, iguais para a mesma data, sem repetir a mensagem no dia seguinte; as frases pedidas estão lá, cabem na notificação, e toda citação é o texto da Almeida |
| `lembretes.spec.ts` | Com o relógio fixo: o chamado da vez aparece na tela inicial e como aviso uma vez só, "Já fiz" esconde, o que passou sem aviso não volta; Ajustes mostram os horários de hoje e desligam |
| `leitura-historia.spec.ts` | Página da história: capa com quadro e botão de ouvir, barras que saem ao descer no celular, foto em tela cheia (amplia, fecha com Esc), "História concluída" no fim |
| `logica/titulos.spec.ts` | **Padrão dos títulos** (norma culta para títulos de obras): inicial maiúscula em cada palavra, menos artigos, preposições e conjunções. Confere os títulos de histórias e sermões, os tópicos, as trilhas e todo `##`, `###` e `:::ficha` dos textos; mostra a forma esperada de cada título errado |
| `leitor.spec.ts` | Um versículo por linha; texto corrido; **sem 404 de arquivos locais**; destacar/favoritar; próximo capítulo; comparação; cartão de mapa |
| `busca.spec.ts` | "Ir para" por referência; busca por palavra (quando a Almeida embutida existir) |
| `ebd.spec.ts` | Criar trimestre; colar lição; conferir que o texto da revista **não é salvo**; mapas da lição |
| `devocional.spec.ts` | Devocional do dia e sequência; pedidos de oração |
| `anotacoes.spec.ts` | Anotação com indicação; nova indicação; anotação em branco descartada |
| `sermoes.spec.ts` | Criar sermão por modelo, tópicos (reordenar/adicionar), modo púlpito; sermão em branco descartado |
| `mapas.spec.ts` | Lista; "Viver a jornada" (abrir, avançar, fechar); zoom com mouse |
| `estudo.spec.ts` | Palavras do dicionário no leitor (com o sentido daquele versículo), contexto e notas, aulas no capítulo, referências cruzadas, memorial, genealogia, atlas, camadas e distâncias dos mapas, profecias, sermões históricos, busca no dicionário |
| `dados.spec.ts` | Backup: exportar, apagar, restaurar |
| `acessibilidade.spec.ts` | Textos ≥ 13px; contraste ≥ 4,5:1; botões de toque ≥ 40px; **todos os ícones desenhados** |
| `offline.spec.ts` | Sem internet: capítulo lido, **capítulo nunca aberto**, busca, fontes e **conteúdo de estudo** (só com `npm run test:offline`) |

## Solução de problemas

### 1. Um teste falhou — por onde começar
1. Leia a mensagem: o vigia diz o erro exato (`HTTP 404 em …`, `Erro de JavaScript: …`).
2. `npm run test:e2e:relatorio` → clique no teste → veja a **captura de tela** e o **trace**
   (linha do tempo com cada clique, a tela em cada passo, a rede e o console).
3. Reproduza olhando: `npx playwright test -g "nome do teste" --headed`.

### 2. Problemas conhecidos e como resolver

> **Vários testes do celular falham ao mesmo tempo, mas passam quando rodados sozinhos?** É quase sempre falta de CPU:
> o servidor de desenvolvimento ainda compilando, ou outra coisa pesada rodando ao lado. Feche o que não precisa e rode de novo
> com `--workers=2`.

| Sintoma | Causa provável | Solução |
|---|---|---|
| `HTTP 404 em /bible/almeida/XXX.json` | O app pediu um livro que não está embutido | Confira `public/bible/index.json`: só livros listados nele são pedidos. Regere com `build_almeida.py` |
| `HTTP 404 em /bible/index.json` | Índice ausente no build | Deve existir em `public/bible/index.json` (mesmo vazio: `{"almeida":[]}`) |
| Capítulos falham após muitas leituras seguidas (outras versões) | Limite da bible-api.com (~15 req/30 s) | O app já faz fila e tenta de novo; nos testes a API é simulada |
| Mudança não aparece no app instalado | Service worker serviu a versão antiga | Aparece o aviso "Nova versão disponível → Atualizar"; ou feche e abra o app |
| `Textos menores que 13px: …` | Algum estilo novo com letra pequena | Corrija o `font`/`font-size` do elemento listado |
| `A página tem rolagem horizontal` | Elemento mais largo que a tela | Use `min-width: 0` / `minmax(0, 1fr)` no elemento |
| `Ícones sem desenho em …: nome_do_icone` | Ícone novo que não está no arquivo de ícones do app | Rode `python3 tools/baixar-fontes.py` (baixa só os ícones usados) |
| `HTTP 504 em /fonts/...` ou `/bible/...` (offline) | Arquivo fora do cache do service worker | Confira os grupos em `ngsw-config.json` |
| `Referências inválidas em artigos/…` | Um `[[Livro 1.2]]` que o app não entende | Use o formato `Jo 3.16`, `Jo 3.16-18` ou `1Sm 9.15-10.1`; confira a abreviação |
| `Chromium distribution 'chrome' is not found` | Chrome não instalado | Instale o Google Chrome, ou troque `channel: 'chrome'` no `playwright.config.ts` |
| `Timed out waiting for webServer` | Porta 4200 ocupada por outro programa | Feche o outro programa ou rode `npx ng serve --port 4200` antes |

### 3. Escrevendo um teste novo
```ts
import { expect, test } from './base';

test('descrição do que deve acontecer', async ({ page }) => {
  await page.goto('/ler/JHN/3');
  await page.getByRole('button', { name: 'Aparência da leitura' }).click();
  await expect(page.getByText('Versículos')).toBeVisible();
});
```
Prefira localizar elementos como a pessoa os vê (`getByRole`, `getByText`, `getByLabel`), e importe
`test` de `./base` para ganhar o vigia automático.
