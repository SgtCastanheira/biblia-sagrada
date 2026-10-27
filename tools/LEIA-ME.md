# Ferramentas de dados

Scripts que geram os arquivos estáticos do app. Rode a partir da raiz do projeto.

| Script | Gera | Uso |
|---|---|---|
| `baixar-fontes.py` | `public/fonts/` (fontes e só os ícones usados) | `python3 tools/baixar-fontes.py` — rode de novo ao usar um ícone novo |
| `baixar-almeida.py` | Capítulos brutos da Almeida (bible-api.com, domínio público) | `python3 tools/baixar-almeida.py /tmp/almeida-bruto` (≈ 90 min; respeita o limite da API e retoma de onde parou) |
| `gerar-almeida.py` | `public/bible/almeida/*.json` + `public/bible/index.json`, com correções de caracteres corrompidos e ortografia do Acordo de 1990 | `python3 tools/gerar-almeida.py /tmp/almeida-bruto public/bible/almeida` |
| `gerar-versoes.py` | `public/bible/{blivre,nbv,bpm,blt}/*.json` e o índice — as versões em português de licença livre do eBible.org | Baixe e descompacte `https://eBible.org/Scriptures/<id>_vpl.zip` (`porbr2018`, `poronbv`, `porbrbsl`, `porblt`; as línguas indígenas: `gun`, `gubBl`, `kgkNT`, `kyzNT`, `urbNT`, `myu`, `mavNT`, `tcaNT`, `kgpNT`, `terNT`, `xavNT`), cada um na sua pasta, e rode `python3 -I tools/gerar-versoes.py <pasta> public/bible` |
| `sword-para-vpl.py` | Texto no formato VPL a partir de um módulo SWORD da CrossWire (NVA e Almeida 1911) | Baixe `https://www.crosswire.org/ftpmirror/pub/sword/packages/rawzip/<Nome>.zip` e o [pysword](https://pypi.org/project/pysword) (MIT), e rode `python3 -I tools/sword-para-vpl.py <pasta_do_pysword> <Nome>.zip <Nome> <pasta>/<Nome>/<Nome>_vpl.txt`; depois o `gerar-versoes.py` |
| `gerar-referencias.py` | `public/bible/referencias/*.json` (textos relacionados de cada versículo, da OpenBible.info, CC BY) | Baixe `https://a.openbible.info/data/cross-references.zip` e rode `python3 -I tools/gerar-referencias.py cross-references.zip public/bible/referencias` |
| `gerar-mapas.py` | `public/maps/*.json` (geografia do Natural Earth, domínio público, com as fronteiras atuais); inclui o mapa do atlas (`src/app/core/atlas.ts`) | Baixe `ne_50m_land`, `ne_10m_land`, `ne_10m_lakes`, `ne_10m_rivers_lake_centerlines` e `ne_50m_admin_0_boundary_lines_land` (GeoJSON) em uma pasta e rode `python3 tools/gerar-mapas.py src/app/core/maps.ts <pasta> public/maps` — sempre que criar um mapa ou mudar os limites |

## Conteúdo de estudo (`public/conteudo/`)

Escrito à mão, sem script: `dicionario.json` (com `senses` e `inflections`), `profecias.json`, `citacoes.json` (AT no NT), `livros.json` (contexto dos 66 livros), `notas.json` (notas por capítulo, chave `"JHN 3"`), `memorial.json`, e os textos em Markdown simples de `artigos/` e `sermoes/` (o índice de cada um fica em `src/app/core/library.ts`). Nos textos, `[[Jo 3.16]]` vira um versículo que abre ao tocar; `:::tempo` e `:::nota` criam linha do tempo e destaque.

Depois de gerar dados, rode `npm run test:e2e` (o protocolo confere referências, mapas e ícones).

## gerar-audio.mjs — a narração em voz neural das histórias

Grava, com a voz neural da Microsoft (Francisca, pt-BR), a narração de cada história e de cada estado da Assembleia de Deus. O app toca esses áudios no botão "Ouvir" (em qualquer navegador) e destaca o parágrafo que está sendo falado; onde não há áudio, usa a voz do aparelho.

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
