# Ferramentas de dados

Scripts que geram os arquivos estáticos do app. Rode a partir da raiz do projeto.

| Script | Gera | Uso |
|---|---|---|
| `baixar-fontes.py` | `public/fonts/` (fontes e só os ícones usados) | `python3 tools/baixar-fontes.py` — rode de novo ao usar um ícone novo |
| `baixar-almeida.py` | Capítulos brutos da Almeida (bible-api.com, domínio público) | `python3 tools/baixar-almeida.py /tmp/almeida-bruto` (≈ 90 min; respeita o limite da API e retoma de onde parou) |
| `gerar-almeida.py` | `public/bible/almeida/*.json` + `public/bible/index.json`, com correções de caracteres corrompidos e ortografia do Acordo de 1990 | `python3 tools/gerar-almeida.py /tmp/almeida-bruto public/bible/almeida` |
| `corrigir-almeida.py` | Aplica a lista `VERSE_FIXES` do `gerar-almeida.py` aos arquivos da Almeida já gerados, sem baixar a fonte de novo | Acrescente a correção em `VERSE_FIXES` e rode `python3 -I tools/corrigir-almeida.py public/bible/almeida` (pode rodar mais de uma vez) |
| `gerar-versoes.py` | `public/bible/{blivre,nbv,bpm,blt}/*.json` e o índice — as versões em português de licença livre do eBible.org | Baixe e descompacte `https://eBible.org/Scriptures/<id>_vpl.zip` (`porbr2018`, `poronbv`, `porbrbsl`, `porblt`; as línguas indígenas: `gun`, `gubBl`, `kgkNT`, `kyzNT`, `urbNT`, `myu`, `mavNT`, `tcaNT`, `kgpNT`, `terNT`, `xavNT`), cada um na sua pasta, e rode `python3 -I tools/gerar-versoes.py <pasta> public/bible` |
| `sword-para-vpl.py` | Texto no formato VPL a partir de um módulo SWORD da CrossWire (NVA e Almeida 1911) | Baixe `https://www.crosswire.org/ftpmirror/pub/sword/packages/rawzip/<Nome>.zip` e o [pysword](https://pypi.org/project/pysword) (MIT), e rode `python3 -I tools/sword-para-vpl.py <pasta_do_pysword> <Nome>.zip <Nome> <pasta>/<Nome>/<Nome>_vpl.txt`; depois o `gerar-versoes.py` |
| `gerar-referencias.py` | `public/bible/referencias/*.json` (textos relacionados de cada versículo, da OpenBible.info, CC BY) | Baixe `https://a.openbible.info/data/cross-references.zip` e rode `python3 -I tools/gerar-referencias.py cross-references.zip public/bible/referencias` |
| `gerar-mapas.py` | `public/maps/*.json` (geografia do Natural Earth, domínio público, com as fronteiras atuais); inclui o mapa do atlas (`src/app/core/atlas.ts`) | Baixe `ne_50m_land`, `ne_10m_land`, `ne_10m_lakes`, `ne_10m_rivers_lake_centerlines` e `ne_50m_admin_0_boundary_lines_land` (GeoJSON) em uma pasta e rode `python3 tools/gerar-mapas.py src/app/core/maps.ts <pasta> public/maps` — sempre que criar um mapa ou mudar os limites |

## Conteúdo de estudo (`public/conteudo/`)

Escrito à mão, sem script: `dicionario.json` (com `senses` e `inflections`), `profecias.json`, `citacoes.json` (AT no NT), `livros.json` (contexto dos 66 livros), `notas.json` (notas por capítulo, chave `"JHN 3"`), `memorial.json`, e os textos em Markdown simples de `artigos/` e `sermoes/` (o índice de cada um fica em `src/app/core/library.ts`). Nos textos, `[[Jo 3.16]]` vira um versículo que abre ao tocar; `:::tempo` e `:::nota` criam linha do tempo e destaque.

Depois de gerar dados, rode `npm run test:e2e` (o protocolo confere referências, mapas e ícones).

## gerar-audio.mjs — a narração em voz neural das histórias

Grava, com a voz neural da Microsoft (Francisca, pt-BR) ou, se preferir, da ElevenLabs (veja abaixo), a narração de cada história e de cada estado da Assembleia de Deus. O app toca esses áudios no botão "Ouvir" (em qualquer navegador) e destaca o parágrafo que está sendo falado; onde não há áudio, usa a voz do aparelho.

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
- O texto das histórias vai para o serviço da ElevenLabs só quando você gera o áudio; o app em uso não fala com ela.
- A chave nunca é gravada em lugar nenhum pela ferramenta. As gravações ficam no mesmo cache (`tools/.audio-cache`), separadas por voz: trocar de voz regrava, trocar de volta não gasta de novo.
- A duração de cada trecho é medida no próprio MP3 (soma dos quadros), então o destaque do parágrafo acompanha a voz mesmo com outra taxa de bits.
