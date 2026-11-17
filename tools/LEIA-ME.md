# Ferramentas de dados

Scripts que geram os arquivos estáticos do app. Rode a partir da raiz do projeto.

| Script | Gera | Uso |
|---|---|---|
| `baixar-fontes.py` | `public/fonts/` (fontes e só os ícones usados) | `python3 tools/baixar-fontes.py` — rode de novo ao usar um ícone novo |
| `baixar-almeida.py` | Capítulos brutos da Almeida (bible-api.com, domínio público) | `python3 tools/baixar-almeida.py /tmp/almeida-bruto` (≈ 90 min; respeita o limite da API e retoma de onde parou) |
| `gerar-almeida.py` | `public/bible/almeida/*.json` + `public/bible/index.json`, com correções de caracteres corrompidos e ortografia do Acordo de 1990 | `python3 tools/gerar-almeida.py /tmp/almeida-bruto public/bible/almeida` |
| `corrigir-almeida.py` | Aplica as listas `VERSE_FIXES` (verso a verso), `VERSE_FILLS` (versículo vazio) e `WORD_FIXES` (palavra inteira com erro de leitura) do `gerar-almeida.py` aos arquivos da Almeida já gerados, sem baixar a fonte de novo | Acrescente a correção na lista certa e rode `python3 -I tools/corrigir-almeida.py public/bible/almeida` (pode rodar mais de uma vez) |
| `gerar-versoes.py` | `public/bible/{blivre,nbv,bpm,blt}/*.json` e o índice — as versões em português de licença livre do eBible.org | Baixe e descompacte `https://eBible.org/Scriptures/<id>_vpl.zip` (`porbr2018`, `poronbv`, `porbrbsl`, `porblt`; as línguas indígenas: `gun`, `gubBl`, `kgkNT`, `kyzNT`, `urbNT`, `myu`, `mavNT`, `tcaNT`, `kgpNT`, `terNT`, `xavNT`, `bkqNT`, `txuNT`), cada um na sua pasta, e rode `python3 -I tools/gerar-versoes.py <pasta> public/bible` |
| `sword-para-vpl.py` | Texto no formato VPL a partir de um módulo SWORD da CrossWire (NVA e Almeida 1911) | Baixe `https://www.crosswire.org/ftpmirror/pub/sword/packages/rawzip/<Nome>.zip` e o [pysword](https://pypi.org/project/pysword) (MIT), e rode `python3 -I tools/sword-para-vpl.py <pasta_do_pysword> <Nome>.zip <Nome> <pasta>/<Nome>/<Nome>_vpl.txt`; depois o `gerar-versoes.py` |
| `gerar-referencias.py` | `public/bible/referencias/*.json` (textos relacionados de cada versículo, da OpenBible.info, CC BY) | Baixe `https://a.openbible.info/data/cross-references.zip` e rode `python3 -I tools/gerar-referencias.py cross-references.zip public/bible/referencias` |
| `gerar-conexoes.py` | `public/bible/conexoes.json` (as ligações entre os capítulos da Bíblia, para a tela “A Bíblia Conectada”, feitas a partir de `public/bible/referencias`) | Rode `python3 -I tools/gerar-conexoes.py` sempre que `gerar-referencias.py` gerar as referências de novo. O teste `logica/conexoes.spec.ts` avisa quando o arquivo está velho |
| `gerar-mapas.py` | `public/maps/*.json` (geografia do Natural Earth, domínio público, com as fronteiras atuais); inclui o mapa do atlas (`src/app/core/atlas.ts`) | Baixe `ne_50m_land`, `ne_10m_land`, `ne_10m_lakes`, `ne_10m_rivers_lake_centerlines` e `ne_50m_admin_0_boundary_lines_land` (GeoJSON) em uma pasta e rode `python3 tools/gerar-mapas.py src/app/core/maps.ts <pasta> public/maps` — sempre que criar um mapa ou mudar os limites |

## Notícias do Mundo Cristão (tools/noticias)

`tools/noticias/buscar-noticias.mjs` lê os feeds do Mundo Cristão e grava `public/data/noticias.json`, a reserva que a tela `/mundo-cristao` mostra quando a busca ao vivo falha. Usa `rss-parser` (pacote só desta pasta, com `package.json` próprio, para o app não ganhar dependência). A lista de fontes, o filtro por palavras-chave, a limpeza do texto, a remoção de repetidas e o limite de 20 estão em `src/app/core/christian-world.ts`, a mesma lista que o app usa ao vivo (o Node 24 lê o `.ts` direto); para trocar uma fonte ou um proxy, edite só lá.

```bash
cd tools/noticias
npm install
npm run buscar     # lê os feeds e grava public/data/noticias.json (só se houver novidade)
```

Um feed que falhar não derruba os outros: as matérias dele no arquivo anterior ficam. Se nenhuma fonte responder, o arquivo não é alterado e o comando termina com erro. O GitHub Actions roda isso todo dia (`.github/workflows/noticias.yml`).

## Conteúdo de estudo (`public/conteudo/`)

Escrito à mão, sem script: `dicionario.json` (com `senses` e `inflections`), `profecias.json`, `citacoes.json` (AT no NT), `livros.json` (contexto dos 66 livros), `notas.json` (notas por capítulo, chave `"JHN 3"`), `memorial.json`, e os textos em Markdown simples de `artigos/` e `sermoes/` (o índice de cada um fica em `src/app/core/library.ts`). Nos textos, `[[Jo 3.16]]` vira um versículo que abre ao tocar; `:::tempo` e `:::nota` criam linha do tempo e destaque.

Depois de gerar dados, rode `npm run test:e2e` (o protocolo confere referências, mapas e ícones).

## verificar-base.py — conferir o que o app já conta, antes de escrever

Não gera nada: só lê `public/conteudo/` e `src/app/core/`. Serve para cumprir a regra do projeto de **olhar a base antes de escrever uma história, um personagem ou um assunto** (se já existe, completa-se ou ramifica-se; não se conta de novo, em outro formato e resumido).

```bash
python3 tools/verificar-base.py "Coreia do Norte"             # onde o assunto aparece e se já há estudo dedicado
python3 tools/verificar-base.py "Neemias" "Esdras"             # vários de uma vez
python3 tools/verificar-base.py --ler avivamento-da-coreia     # o roteiro de um estudo: capítulos, cartões e quadros
python3 tools/verificar-base.py --repetidos --minimo 6         # revisão geral: pares de estudos com trechos iguais
python3 tools/verificar-base.py --par estudo-a estudo-b        # os trechos que dois estudos têm em comum
```

O veredito é um de três: “já existe estudo dedicado” (complete ou ramifique), “aparece de passagem” (veja onde e escreva só o que falta) ou “não aparece” (pode escrever, ligando aos estudos vizinhos). A revisão geral mais recente está em `REVISAO-DE-CONTEUDO.md`.

## gerar-audio.mjs — a narração em voz neural das histórias

Grava, com Gemini TTS, Azure Speech ou ElevenLabs, a narração de cada história e de cada estado da Assembleia de Deus. O app toca esses áudios no botão "Ouvir" (em qualquer navegador) e destaca o parágrafo que está sendo falado; onde não há áudio, usa a voz do aparelho.

### Com Gemini TTS — amostra para testar no celular

A geração acontece no computador; o celular recebe somente o MP3. O modelo padrão é `gemini-2.5-flash-preview-tts`, com voz `Kore` e instrução de leitura fiel em português brasileiro. A [tabela de preços do Google](https://aistudio.google.com/docs/pricing#gemini-2.5-flash-preview-tts) prevê um nível gratuito com limites por projeto. Confira o plano no AI Studio antes de gerar; a ferramenta não ativa faturamento nem troca de modelo automaticamente quando a cota acaba. Nos serviços gratuitos, os termos do Google permitem usar entradas e saídas para melhorar seus produtos.

1. Crie uma chave em [Google AI Studio](https://aistudio.google.com/apikey) e mantenha o projeto no nível gratuito.
2. Configure `GEMINI_API_KEY` no ambiente. No Linux, pode usar um arquivo **fora do projeto**, como `/tmp/biblia-gemini-tts.env`, com permissão `600` e uma linha `GEMINI_API_KEY=sua-chave`. Esse arquivo é temporário: não o coloque em `public/`, no código ou no Git.
3. Confira a estimativa e gere apenas uma amostra:

```bash
node tools/gerar-audio.mjs --provedor gemini --only paixao-quem-mandava --amostra --dry-run
node --env-file=/tmp/biblia-gemini-tts.env tools/gerar-audio.mjs --provedor gemini --only paixao-quem-mandava --amostra --limite 1500
```

- `--amostra` reúne os três primeiros trechos em **uma única chamada** e grava `tools/amostra-gemini-Kore.mp3`, fora do Git. Não substitui a narração completa nem altera `public/audio/index.json`.
- O MP3 é mono de **48 kbit/s**, convertido em JavaScript no gerador, sem exigir FFmpeg no sistema nem processamento de IA no celular.
- `--voz Charon` escolhe outra voz; `--modelo`, `GEMINI_TTS_MODEL`, `--estilo`, `GEMINI_TTS_STYLE` e `--nome-voz` são configuráveis. Modelo, voz, estilo e formato fazem parte do cache: repetir a mesma geração reutiliza o arquivo local.
- `--limite` e `--cota` contam somente os caracteres da amostra quando `--amostra` está presente. Essas opções limitam o texto enviado; a cota real do Gemini é controlada pelo Google.
- Erros `401/403` pedem conferir chave e permissões; `429` pede conferir os limites no AI Studio. A ferramenta encerra sem repetir pedidos Gemini nem migrar para uma opção paga.
- Depois de aprovar a voz, retire `--amostra` para gerar a história completa e seus tempos por parágrafo. A chave continua somente no gerador; o app recebe os arquivos de áudio.

### Com a voz do Azure (padrão)

**Uma vez só: criar a chave (grátis)**

1. Crie uma conta em https://portal.azure.com (pede um cartão para confirmar a identidade; o nível gratuito não cobra).
2. Pesquise **"Serviços de fala"** (Speech) → **Criar**. Escolha um grupo de recursos novo, a região **Brazil South** (`brazilsouth`) e o **nível de preço Free F0** (500 mil caracteres por mês de voz neural).
3. Depois de criado, abra o recurso → **Chaves e Ponto de Extremidade**: copie a **Chave 1** e a **Localização/Região**.

**Gerar**

```bash
export AZURE_SPEECH_KEY="cole-a-chave-aqui"      # só neste terminal; nunca em arquivo do projeto
export AZURE_SPEECH_REGION="brazilsouth"

node tools/gerar-audio.mjs --dry-run             # quantos caracteres e MB, sem gastar nada
node tools/gerar-audio.mjs --only igreja-primitiva   # uma história para ouvir e aprovar a voz
node tools/gerar-audio.mjs                       # todas (cerca de 290 mil caracteres, 320 min, ~115 MB)
```

- `--only` aceita ids de artigo (`igreja-primitiva`) e siglas de estado (`mt,pi`), separados por vírgula.
- `--rate -12%` deixa a fala mais lenta (padrão `-8%`); `--voice pt-BR-AntonioNeural` troca para a voz masculina; `--limite 100000` recusa gastar mais que isso numa rodada; `--force` regrava tudo.
- Gravações prontas ficam em `tools/.audio-cache` (fora do Git): rodar de novo só paga o que mudou. Se o texto de uma história mudar, o app deixa de usar a gravação antiga e volta à voz do aparelho até você gerar de novo.
- Saída: `public/audio/artigos/*.mp3`, `public/audio/estados/*.mp3` e `public/audio/index.json` (de que segundo começa cada parágrafo). **Commite esses arquivos.** Não entram no cache offline do app (tocam pela internet).
- A chave nunca é gravada em lugar nenhum pela ferramenta. Se ela vazar, gere outra no portal (Chaves e Ponto de Extremidade → Regenerar).

### Com a voz da ElevenLabs (opcional)

A mesma ferramenta grava com a ElevenLabs no lugar do Azure. O app não muda: ele só toca os MP3 e destaca o parágrafo.

1. Em https://elevenlabs.io/app/speech-synthesis/ (a tela de Text to Speech), cole um trecho de uma história e **teste vozes em português do Brasil**. Escolha a que soar melhor.
2. Copie o **ID da voz** (em *Voices*, no menu da voz: *Copy voice ID*). Se a voz for da Biblioteca de Vozes, adicione-a à sua conta primeiro.
3. Crie uma **chave de API** (conta → *API Keys*; o nome do botão pode mudar no site).
4. Rode:

```bash
export ELEVENLABS_API_KEY="cole-a-chave-aqui"     # só neste terminal; nunca em arquivo do projeto
export ELEVENLABS_VOICE_ID="id-da-voz"

node tools/gerar-audio.mjs --provedor elevenlabs --only igreja-primitiva --dry-run   # estimativa de créditos, sem gastar
node tools/gerar-audio.mjs --provedor elevenlabs --only igreja-primitiva --amostra   # grava só o começo em tools/amostra-*.mp3 para ouvir
node tools/gerar-audio.mjs --provedor elevenlabs --only igreja-primitiva             # a história inteira, dentro do app
```

- `--velocidade 0.9` deixa a fala mais lenta (padrão `0.95`; vai de 0,7 a 1,2); `--modelo eleven_multilingual_v2` é o padrão (o `eleven_v3` não aceita a marca de pausa nem o contexto entre parágrafos, que a ferramenta usa para a entonação seguir de um trecho ao outro).
- O consumo é de cerca de **1 crédito por caractere** no modelo padrão; o `--dry-run` mostra o total. Todas as histórias passam de 290 mil caracteres: gere aos poucos com `--only` e `--limite`, e confira no site a franquia do seu plano.
- **Antes de publicar áudios da ElevenLabs, confira nos termos do plano se o uso comercial e a atribuição estão liberados** (os planos gratuitos costumam ter restrições). O app é gratuito e para igrejas; se os termos pedirem crédito, inclua em `core/credits.ts` e no CREDITOS.md.
- **Revezar provedores e vozes dentro da franquia grátis** (ElevenLabs tem uns 10 mil créditos por mês; o Azure, 500 mil caracteres). Cada gravação guarda a própria voz no `index.json` e o player mostra quem narra aquela história. Use `--completar` (só gera o que não tem áudio de nenhuma voz ou cujo texto mudou, sem regravar o que outro provedor já fez) e `--cota` (grava até esse tanto de caracteres e deixa o resto para a próxima rodada):

```bash
# este mês, com a franquia da ElevenLabs (voz Brian, id nPczCjzI2devNBz1zQrb):
node tools/gerar-audio.mjs --provedor elevenlabs --voz nPczCjzI2devNBz1zQrb --nome-voz Brian --completar --cota 9000
# na rodada seguinte, com o Azure, as que faltam:
node tools/gerar-audio.mjs --completar --cota 450000
```

  `--nome-voz` é o nome que aparece no player (padrão "ElevenLabs"). Uma história maior que a cota nunca entra: gere-a sozinha com `--only` e um provedor de franquia maior. Sem `--completar`, trocar de voz regrava tudo, como antes.
- O texto das histórias vai para o serviço da ElevenLabs só quando você gera o áudio; o app em uso não fala com ela.
- A chave nunca é gravada em lugar nenhum pela ferramenta. As gravações ficam no mesmo cache (`tools/.audio-cache`), separadas por voz: trocar de voz regrava, trocar de volta não gasta de novo.
- A duração de cada trecho é medida no próprio MP3 (soma dos quadros), então o destaque do parágrafo acompanha a voz mesmo com outra taxa de bits.
