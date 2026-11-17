#!/usr/bin/env node
/**
 * Gera a narração das histórias com Azure (padrão), ElevenLabs ou Gemini.
 *
 *   AZURE_SPEECH_KEY=... AZURE_SPEECH_REGION=brazilsouth node tools/gerar-audio.mjs --dry-run
 *   AZURE_SPEECH_KEY=... AZURE_SPEECH_REGION=brazilsouth node tools/gerar-audio.mjs --only igreja-primitiva
 *   ELEVENLABS_API_KEY=... node tools/gerar-audio.mjs --provedor elevenlabs --only igreja-primitiva --amostra   (voz Leonardo por padrão)
 *   node --env-file=/tmp/biblia-gemini-tts.env tools/gerar-audio.mjs --provedor gemini --only paixao-quem-mandava --amostra
 *   node tools/gerar-audio.mjs                       (todas as histórias e todos os estados)
 *
 * A BÍBLIA (Almeida), um MP3 por capítulo, com a mesma voz:
 *   ELEVENLABS_API_KEY=... node tools/gerar-audio.mjs --provedor elevenlabs --biblia --livros JHN --capitulos 3 --amostra
 *   ELEVENLABS_API_KEY=... node tools/gerar-audio.mjs --provedor elevenlabs --biblia --livros FASE-A --paralelo 4 --dry-run
 *   ELEVENLABS_API_KEY=... node tools/gerar-audio.mjs --provedor elevenlabs --biblia --livros NT --paralelo 4 --completar
 *   (--livros aceita códigos como JHN,PSA e os apelidos NT, AT, EVANGELHOS, FASE-A, FASE-B e FASE-C; --capitulos "1-3,7" com um só livro)
 *   Sai em tools/audio-biblia/ (--saida muda), fora do Git: a Bíblia gravada é grande demais para o GitHub Pages e vai para
 *   um armazém de arquivos (veja tools/LEIA-ME.md). Cada capítulo tem <LIVRO>-<n>.mp3 e <LIVRO>-<n>.json, e a lista dos
 *   gravados fica em biblia/almeida/cobertura.json.
 *
 * A chave fica só no seu computador (variável de ambiente): nunca vai para o código nem para o Git.
 * Os trechos são os mesmos que o app lê na tela (títulos, parágrafos, listas). Cada trecho é gravado à parte,
 * as gravações são coladas num único MP3 por história e o índice (public/audio/index.json) guarda de que
 * segundo começa cada trecho, para o app destacar o parágrafo que está sendo falado.
 * Gravações já feitas ficam em tools/.audio-cache: rodar de novo só paga o que mudou.
 */
import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GEMINI_TTS_MODEL, GEMINI_TTS_STYLE, GEMINI_TTS_VOICE, synthesizeGemini } from './gemini-tts.mjs';
import { mp3Seconds, stripMp3Tags } from './mp3.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};

const PROVIDER = option('provedor', process.env.AUDIO_PROVEDOR ?? 'azure');
if (!['azure', 'elevenlabs', 'gemini'].includes(PROVIDER)) {
  console.error('--provedor deve ser azure, elevenlabs ou gemini.');
  process.exit(1);
}
const ELEVEN = PROVIDER === 'elevenlabs';
const GEMINI = PROVIDER === 'gemini';
const SAMPLE = flag('amostra');
// Voz padrão da ElevenLabs: Leonardo (pt-BR, grave, voltada a narrativa histórica), escolhida pelo dono do app em 17/11/2026
// depois de ouvir as amostras de Cajó e Leonardo. Outra voz: --voz <ID> (em "Voices" > Copy voice ID) e --nome-voz.
const ELEVEN_DEFAULT_VOICE = '4XmhZ74tBbUVCXIYNMMo';
// Azure: nome da voz. ElevenLabs: o ID da voz.
const VOICE = GEMINI ? option('voz', option('voice', process.env.GEMINI_TTS_VOICE ?? GEMINI_TTS_VOICE)) : ELEVEN ? option('voz', process.env.ELEVENLABS_VOICE_ID ?? ELEVEN_DEFAULT_VOICE) : option('voice', 'pt-BR-FranciscaNeural');
const RATE = option('rate', '-8%'); // Azure: um pouco mais devagar que a fala normal, soa calmo
// ElevenLabs: 1 é a velocidade normal (aceita de 0,7 a 1,2). O padrão é 1 porque foi com ela que a amostra do Leonardo foi aprovada.
const SPEED = Number(option('velocidade', '1'));
const MODEL = option('modelo', GEMINI ? process.env.GEMINI_TTS_MODEL ?? GEMINI_TTS_MODEL : process.env.ELEVENLABS_MODEL ?? 'eleven_multilingual_v2');
const STYLE = option('estilo', process.env.GEMINI_TTS_STYLE ?? GEMINI_TTS_STYLE);
// ElevenLabs: MP3 mono de 44,1 kHz; 64 kbit/s é bom para voz e deixa o arquivo pela metade do de 128 (140 histórias: ~0,7 GB em vez de ~1,4 GB)
const ELEVEN_KBPS = Number(option('kbps', '64'));
if (ELEVEN && ![32, 64, 96, 128, 192].includes(ELEVEN_KBPS)) {
  console.error('--kbps deve ser 32, 64, 96, 128 ou 192 (formatos mp3_44100_* da ElevenLabs).');
  process.exit(1);
}
const FORMAT = GEMINI ? 'mp3-mono-source-rate-48k' : ELEVEN ? `mp3_44100_${ELEVEN_KBPS}` : 'audio-24khz-48kbitrate-mono-mp3';
const BITRATE = ELEVEN ? ELEVEN_KBPS * 1000 : 48000;
const BYTES_PER_SECOND = BITRATE / 8; // só para a estimativa; a duração real vem de mp3Seconds
const PAUSE_MS = 500;
/** Tudo o que muda o som: entra no cache e na "assinatura" de cada história. */
const CONFIG = GEMINI ? JSON.stringify({ provider: PROVIDER, voice: VOICE, model: MODEL, style: STYLE, format: FORMAT, pauseMs: PAUSE_MS }) : ELEVEN ? `elevenlabs|${VOICE}|${MODEL}|${SPEED}|${FORMAT}|${PAUSE_MS}` : `azure|${VOICE}|${RATE}|${FORMAT}|${PAUSE_MS}`;
// Nome mostrado no player ("Brian (voz neural)"); na ElevenLabs o ID da voz não diz nada a quem ouve
const VOICE_LABEL = option('nome-voz', GEMINI ? `${VOICE} (Gemini)` : ELEVEN ? (VOICE === ELEVEN_DEFAULT_VOICE ? 'Leonardo' : 'ElevenLabs') : VOICE);
const ONLY = option('only', '')?.split(',').filter(Boolean) ?? [];
const FREE_MONTHLY_CHARS = 500_000;
const BIBLIA = flag('biblia');
// Pedidos ao mesmo tempo (um por vez é o padrão e o que as histórias sempre usaram; a Bíblia tem 31 mil versículos e pede 4 ou mais,
// dentro do limite de pedidos simultâneos do plano da ElevenLabs: acima dele a API responde 429 e o script espera e tenta de novo)
const PARALLEL = Math.max(1, Math.min(8, Number(option('paralelo', '1')) || 1));
// Onde saem os arquivos: as histórias, dentro do app (public/audio); a Bíblia, numa pasta à parte, para subir ao armazém
const OUT_DIR = resolve(root, option('saida', BIBLIA ? 'tools/audio-biblia' : 'public/audio'));
const UNIT = BIBLIA ? 'capítulos' : 'histórias';

// O mesmo código do app (leitor de Markdown, biblioteca, referências) empacotado para o Node
const bundle = await build({
  stdin: {
    contents: `
      export { parseBlocks } from './src/app/core/rich-text-parser';
      export { ARTICLES } from './src/app/core/library';
      export { AD_STATES } from './src/app/core/ad-states';
      export { parseReferences } from './src/app/core/reference-parser';
      export { findBook, BOOKS } from './src/app/core/books';
      export { textKey } from './src/app/core/audio-text';
      export { BIBLE_AUDIO_DIR, chapterAudioFile, chapterIntro, coverageFromFiles, expandBookSelection, parseChapterSelection } from './src/app/core/bible-audio';`,
    resolveDir: root,
    loader: 'ts',
  },
  bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent',
});
const app = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);

/** Como se fala uma referência bíblica: "Jo 3.16" vira "João, capítulo 3, versículo 16". */
function spokenRef(ref, shown) {
  const parsed = app.parseReferences(ref).refs[0];
  if (!parsed) return shown;
  const name = app.findBook(parsed.bookId)?.name ?? parsed.label;
  let out = `${name}, capítulo ${parsed.chapter}`;
  if (parsed.from && parsed.to && parsed.to !== parsed.from && parsed.to < 999) out += `, versículos ${parsed.from} a ${parsed.to}`;
  else if (parsed.from) out += `, versículo ${parsed.from}`;
  return out;
}

const plain = (inlines = []) =>
  inlines.map((p) => (p.t === 'ref' ? spokenRef(p.href, p.text) : p.text)).join('').replace(/\s+/g, ' ').trim();

/** Os trechos lidos, na ordem da tela: o mesmo conjunto que o botão "Ouvir" do app seleciona. */
function itemsOf(markdown, title, subtitle) {
  const items = [{ text: `${title}. ${subtitle}`.replace(/\s+/g, ' ').trim(), shown: `${title}. ${subtitle}` }];
  const add = (inlines) => {
    const text = plain(inlines);
    // `shown` é o texto como aparece na tela (para casar com o parágrafo); `text` é como se fala
    const shown = inlines.map((p) => p.text).join('').replace(/\s+/g, ' ').trim();
    if (text) items.push({ text, shown });
  };
  for (const b of app.parseBlocks(markdown)) {
    if (['h2', 'h3', 'p', 'quote', 'note', 'scene', 'pullquote', 'when'].includes(b.type)) add(b.inlines);
    else if (b.type === 'ul' || b.type === 'ol') for (const it of b.items ?? []) add(it);
    // Diálogo: cada fala é um trecho, com o nome de quem fala ("Pilatos: …"), como na tela (shared/rich-text.ts)
    else if (b.type === 'dialog') for (const t of b.turns ?? []) add(t.who ? [{ t: 'text', text: `${t.who}: ` }, ...t.text] : t.text);
  }
  return items;
}

const jobs = [];
const read = (path) => readFileSync(join(root, 'public/conteudo', path), 'utf8');
if (BIBLIA) {
  // Um capítulo por trabalho: "Livro, capítulo N" e depois um trecho por versículo, o mesmo que o leitor lê (reader.ts: startListening)
  const spec = option('livros', '');
  let wanted = [];
  try {
    wanted = spec ? app.expandBookSelection(spec, app.BOOKS.map((b) => b.id)) : [];
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
  if (!wanted.length) {
    console.error('Use --livros com o que gravar: códigos (JHN,PSA) ou NT, AT, EVANGELHOS, FASE-A, FASE-B, FASE-C. Exemplo: --livros JHN --capitulos 3');
    process.exit(1);
  }
  const chapterSpec = option('capitulos', '');
  if (chapterSpec && wanted.length !== 1) {
    console.error('--capitulos só vale com um livro (ex.: --livros JHN --capitulos 1-3).');
    process.exit(1);
  }
  const onlyChapters = chapterSpec ? app.parseChapterSelection(chapterSpec) : null;
  for (const id of wanted) {
    const book = app.findBook(id);
    const data = JSON.parse(readFileSync(join(root, 'public/bible/almeida', `${id}.json`), 'utf8'));
    for (const [i, verses] of data.entries()) {
      const chapter = i + 1;
      if (onlyChapters && !onlyChapters.includes(chapter)) continue;
      const intro = app.chapterIntro(book.name, chapter);
      // O leitor pula versículo sem texto (há um na Almeida embutida: Ez 8.18); a gravação tem de ter os mesmos trechos
      const texts = verses.map(([, text]) => String(text).replace(/\s+/g, ' ').trim()).filter(Boolean);
      jobs.push({ key: `${id}-${chapter}`, book: id, chapter, items: [{ text: intro, shown: intro }, ...texts.map((text) => ({ text, shown: text }))] });
    }
  }
  if (!jobs.length) {
    console.error('Nenhum capítulo encontrado para esse pedido. Confira --livros e --capitulos.');
    process.exit(1);
  }
} else {
  for (const a of app.ARTICLES) {
    if (ONLY.length && !ONLY.includes(a.id)) continue;
    jobs.push({ key: `artigos/${a.id}`, items: itemsOf(read(`artigos/${a.id}.md`), a.title, a.subtitle) });
  }
  for (const s of app.AD_STATES) {
    if (ONLY.length && !ONLY.includes(`estado-${s.id}`) && !ONLY.includes(s.id)) continue;
    jobs.push({ key: `estados/${s.id}`, items: itemsOf(read(`ad-estados/${s.id}.md`), `A Assembleia de Deus em ${s.state}`, s.summary) });
  }
}

if (flag('itens')) {
  // Para conferir: os trechos (como aparecem na tela) de cada história escolhida com --only
  console.log(JSON.stringify(Object.fromEntries(jobs.map((j) => [j.key, j.items.map((i) => i.shown)]))));
  process.exit(0);
}

const indexPath = join(root, 'public/audio/index.json');
const index = existsSync(indexPath) ? JSON.parse(readFileSync(indexPath, 'utf8')) : { voice: '', files: {} };
const sourceOf = (job) => createHash('sha1').update(`${CONFIG}|${job.items.map((i) => i.text).join('\n')}`).digest('hex').slice(0, 16);
const textOf = (job) => createHash('sha1').update(job.items.map((i) => i.text).join('\n')).digest('hex').slice(0, 16);
/** Arquivo de um capítulo da Bíblia na pasta de saída (mp3 ou json). */
const chapterFile = (job, ext) => join(OUT_DIR, app.chapterAudioFile(job.book, job.chapter, ext));
/** O que já foi gravado desse trabalho: o índice das histórias, ou o json do capítulo (só vale se o mp3 também existe). */
const entryOf = (job) => {
  if (!BIBLIA) return index.files[job.key];
  if (!existsSync(chapterFile(job, 'json')) || !existsSync(chapterFile(job, 'mp3'))) return undefined;
  try {
    return JSON.parse(readFileSync(chapterFile(job, 'json'), 'utf8'));
  } catch {
    return undefined;
  }
};
if (SAMPLE && (BIBLIA ? jobs.length !== 1 : !ONLY.length || jobs.length !== 1)) {
  console.error(BIBLIA ? 'Use --amostra com um só capítulo (ex.: --livros JHN --capitulos 3).' : 'Use --amostra com --only e uma só história (ex.: --only paixao-quem-mandava).');
  process.exit(1);
}
const selectedItems = (job) => SAMPLE ? job.items.slice(0, 3) : job.items;
const sampleText = (job) => selectedItems(job).map(item => item.text).join('\n\n');
const charsOf = (job) => SAMPLE && GEMINI ? sampleText(job).length : selectedItems(job).reduce((m, i) => m + i.text.length, 0);
let pending = SAMPLE ? [...jobs] : jobs.filter((j) => {
  if (flag('force')) return true;
  const entry = entryOf(j);
  // --completar: serve a gravação de qualquer voz; só falta o que não tem áudio ou cujo texto mudou
  if (flag('completar')) return !entry || entry.text !== textOf(j);
  return entry?.source !== sourceOf(j);
});
// --cota: grava até esse tanto de caracteres (a franquia grátis do provedor) e deixa o resto para a próxima rodada
const quota = Number(option('cota', '0'));
let postponed = 0;
if (quota) {
  let used = 0;
  const fit = pending.filter((j) => (used + charsOf(j) <= quota ? ((used += charsOf(j)), true) : false));
  postponed = pending.length - fit.length;
  pending = fit;
}
const chars = pending.reduce((n, j) => n + charsOf(j), 0);

console.log(`${jobs.length} ${UNIT} · ${pending.length} para gerar · ${chars.toLocaleString('pt-BR')} caracteres${postponed ? ` · ${postponed} ficam para a próxima rodada (passam da cota de ${quota.toLocaleString('pt-BR')})` : ''}`);
// Caracteres falados por minuto: 900 é a fala das vozes do Azure; a Leonardo (ElevenLabs) foi medida em 17/11/2026
// com 389 caracteres em 30,5 s, ou seja, ~770 por minuto, mais devagar.
const CHARS_PER_MINUTE = ELEVEN ? 770 : 900;
const estimatedMegabytes = (chars / CHARS_PER_MINUTE) * 60 * BYTES_PER_SECOND / 1048576;
console.log(`Estimativa: ${Math.round(chars / CHARS_PER_MINUTE)} minutos de áudio, ${SAMPLE ? estimatedMegabytes.toFixed(1).replace('.', ',') : Math.round(estimatedMegabytes)} MB.`);
if (GEMINI) {
  console.log(`Voz ${VOICE}, modelo ${MODEL}, MP3 mono de 48 kbit/s. A cota gratuita depende do projeto no Google AI Studio.`);
  if (SAMPLE) console.log('Amostra: três trechos iniciais em uma única requisição, sem alterar o índice de áudios do app.');
} else if (ELEVEN) {
  console.log(`Voz ${VOICE_LABEL} (${VOICE}), modelo ${MODEL}, velocidade ${SPEED}, MP3 de ${ELEVEN_KBPS} kbit/s.`);
  console.log(`Consumo: cerca de ${chars.toLocaleString('pt-BR')} créditos (1 por caractere no modelo multilingual v2; confira a franquia e as regras de uso do seu plano no site da ElevenLabs).`);
} else {
  console.log(`Voz ${VOICE}, velocidade ${RATE}. Plano gratuito do Azure: ${FREE_MONTHLY_CHARS.toLocaleString('pt-BR')} caracteres por mês (${Math.round((chars / FREE_MONTHLY_CHARS) * 100)}% dele).`);
}
const limit = Number(option('limite', '0'));
if (limit && chars > limit) {
  console.error(`Isso passa do limite de ${limit} caracteres que você pediu (--limite). Use --only para gerar aos poucos.`);
  process.exit(1);
}
if (flag('dry-run') || !pending.length) process.exit(0);

const KEY = GEMINI ? process.env.GEMINI_API_KEY : ELEVEN ? process.env.ELEVENLABS_API_KEY : process.env.AZURE_SPEECH_KEY;
const REGION = process.env.AZURE_SPEECH_REGION;
if (GEMINI ? !KEY?.trim() : ELEVEN ? !KEY || !VOICE : !KEY || !REGION) {
  console.error(GEMINI ? 'Defina GEMINI_API_KEY no ambiente local para gerar a narração.' : ELEVEN ? 'Defina ELEVENLABS_API_KEY e ELEVENLABS_VOICE_ID (veja tools/LEIA-ME.md).' : 'Defina AZURE_SPEECH_KEY e AZURE_SPEECH_REGION (veja tools/LEIA-ME.md).');
  process.exit(1);
}

const cacheDir = join(root, 'tools/.audio-cache');
mkdirSync(cacheDir, { recursive: true });
const escapeXml = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** Divide um texto muito longo em pedaços (nas frases) para caber no limite de cada pedido. */
function chunksOf(text, max = 4000) {
  if (text.length <= max) return [text];
  const out = [];
  let current = '';
  for (const sentence of text.split(/(?<=[.!?…])\s+/)) {
    if (current && (current + ' ' + sentence).length > max) { out.push(current); current = sentence; }
    else current = current ? `${current} ${sentence}` : sentence;
  }
  if (current) out.push(current);
  return out;
}

async function request(label, doFetch) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    const res = await doFetch();
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    const body = (await res.text()).slice(0, 300);
    // 429 = pedidos simultâneos demais para o plano: espera mais antes de tentar de novo
    if (res.status === 429 || res.status >= 500) { await wait((res.status === 429 ? 4000 : 1500) * attempt); continue; }
    if (res.status === 401) throw new Error(`${label} recusou a chave (401). Confira a chave e, no Azure, a região.`);
    if (res.status === 402 || /quota/i.test(body)) throw new Error(`${label}: acabaram os créditos ou a franquia do plano (${res.status}). ${body}`);
    throw new Error(`${label} respondeu ${res.status}: ${body}`);
  }
  throw new Error(`${label} não respondeu depois de 5 tentativas.`);
}

async function synthesizeAzure(text) {
  const ssml = `<speak version="1.0" xml:lang="pt-BR"><voice name="${VOICE}"><prosody rate="${RATE}">${escapeXml(text)}</prosody><break time="${PAUSE_MS}ms"/></voice></speak>`;
  return request('O Azure', () => fetch(`https://${REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: 'POST',
    headers: { 'Ocp-Apim-Subscription-Key': KEY, 'Content-Type': 'application/ssml+xml', 'X-Microsoft-OutputFormat': FORMAT, 'User-Agent': 'biblia-sagrada-audio' },
    body: ssml,
  }));
}

/** ElevenLabs: previous_text/next_text dão à voz o que vem antes e depois, para a entonação seguir de um parágrafo ao outro. */
async function synthesizeEleven(text, before, after) {
  const pause = MODEL.includes('v3') ? '' : ` <break time="${PAUSE_MS / 1000}s" />`; // o modelo v3 não aceita a marca de pausa
  const parts = [];
  for (const chunk of chunksOf(text)) {
    const body = { text: chunk + pause, model_id: MODEL, voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0, use_speaker_boost: true, speed: SPEED } };
    if (!MODEL.includes('v3')) {
      if (before) body.previous_text = before.slice(-400);
      if (after) body.next_text = after.slice(0, 400);
    }
    parts.push(await request('A ElevenLabs', () => fetch(`${process.env.ELEVENLABS_URL ?? 'https://api.elevenlabs.io'}/v1/text-to-speech/${encodeURIComponent(VOICE)}?output_format=${FORMAT}`, {
      method: 'POST',
      headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify(body),
    })));
  }
  return Buffer.concat(parts);
}

/** Uma gravação por trecho; as que já foram feitas (mesma voz, mesmo texto) vêm do cache, sem gastar de novo. */
async function synthesize(text, before = '', after = '') {
  const id = createHash('sha1').update(`${CONFIG}|${ELEVEN ? `${before.slice(-400)}|${after.slice(0, 400)}|` : ''}${text}`).digest('hex');
  const file = join(cacheDir, `${id}.mp3`);
  if (existsSync(file)) return stripMp3Tags(readFileSync(file));
  // A ElevenLabs entrega cada trecho com ~17 KB de etiqueta ID3 e um quadro "Info": tirados aqui, não se repetem ao colar os trechos
  const bytes = stripMp3Tags(GEMINI ? await synthesizeGemini(text, { apiKey: KEY, model: MODEL, voice: VOICE, style: STYLE, pauseMs: PAUSE_MS }) : ELEVEN ? await synthesizeEleven(text, before, after) : await synthesizeAzure(text));
  writeFileSync(file, bytes);
  return bytes;
}

/** Roda `fn` sobre a lista com no máximo `limit` pedidos ao mesmo tempo, devolvendo os resultados na ordem da lista. */
async function mapLimit(list, limit, fn) {
  const out = new Array(list.length);
  let next = 0;
  let failed = false;
  await Promise.all(Array.from({ length: Math.min(limit, list.length) }, async () => {
    while (!failed && next < list.length) {
      const i = next++;
      try {
        out[i] = await fn(list[i], i);
      } catch (error) {
        failed = true; // os outros não começam trecho novo (cada um gasta crédito)
        throw error;
      }
    }
  }));
  return out;
}

/** Lista dos capítulos gravados na pasta de saída, para o app saber o que pedir (biblia/almeida/cobertura.json). */
function writeCoverage() {
  const dir = join(OUT_DIR, app.BIBLE_AUDIO_DIR);
  const names = readdirSync(dir);
  const files = names.filter((n) => n.endsWith('.json') && names.includes(n.replace(/\.json$/, '.mp3')));
  const out = join(dir, 'cobertura.json');
  writeFileSync(out, JSON.stringify(app.coverageFromFiles(files, VOICE_LABEL)));
  return files.length;
}

try {
  if (SAMPLE) {
    // Para escolher a voz antes de gastar: grava só o começo de uma história, fora do app (tools/amostra-*.mp3)
    const job = jobs[0];
    const texts = selectedItems(job).map((i) => i.text);
    const audio = [];
    if (GEMINI) audio.push(await synthesize(sampleText(job)));
    else for (const [k, t] of texts.entries()) audio.push(await synthesize(t, texts[k - 1] ?? '', texts[k + 1] ?? ''));
    const out = join(root, 'tools', `amostra-${PROVIDER}-${VOICE.replace(/[^\w-]+/g, '_') || 'voz'}.mp3`);
    writeFileSync(out, Buffer.concat(audio));
    console.log(`Amostra gravada em ${out} (${Math.round(mp3Seconds(Buffer.concat(audio)))} s). Ouça e, se gostar, rode sem --amostra.`);
    process.exit(0);
  }

  for (const [n, job] of pending.entries()) {
    // Os pedidos de um capítulo/história correm ao mesmo tempo (--paralelo); cada trecho leva o que vem antes e depois, para a entonação
    const audios = await mapLimit(job.items, PARALLEL, (item, k) => synthesize(item.text, job.items[k - 1]?.text ?? '', job.items[k + 1]?.text ?? ''));
    const items = [];
    let seconds = 0;
    for (const [k, audio] of audios.entries()) {
      items.push({ t: Math.round(seconds * 100) / 100, k: app.textKey(job.items[k].shown) });
      seconds += mp3Seconds(audio);
    }
    const all = Buffer.concat(audios);
    if (BIBLIA) {
      // Um MP3 e um json por capítulo; a lista de capítulos gravados é refeita a cada um, então dá para parar e continuar
      mkdirSync(join(OUT_DIR, app.BIBLE_AUDIO_DIR), { recursive: true });
      writeFileSync(chapterFile(job, 'mp3'), all);
      writeFileSync(chapterFile(job, 'json'), JSON.stringify({ source: sourceOf(job), text: textOf(job), voice: VOICE_LABEL, seconds: Math.round(seconds), items }));
      writeCoverage();
    } else {
      const out = join(OUT_DIR, `${job.key}.mp3`);
      mkdirSync(dirname(out), { recursive: true });
      writeFileSync(out, all);
      index.files[job.key] = { source: sourceOf(job), text: textOf(job), voice: VOICE_LABEL, seconds: Math.round(seconds), items };
      index.voice = VOICE_LABEL;
      mkdirSync(dirname(indexPath), { recursive: true });
      writeFileSync(indexPath, JSON.stringify(index));
    }
    console.log(`[${n + 1}/${pending.length}] ${job.key} · ${Math.round(seconds / 60)} min · ${(all.length / 1048576).toFixed(1)} MB`);
  }
  console.log(BIBLIA
    ? `Pronto. Os capítulos estão em ${join(OUT_DIR, app.BIBLE_AUDIO_DIR)}. Envie a pasta "${OUT_DIR}" para o armazém de arquivos (veja tools/LEIA-ME.md).`
    : 'Pronto. Confira com "npx ng serve" e commite public/audio.');
} catch (error) {
  const message = (error instanceof Error ? error.message : 'Não foi possível concluir a geração.').replaceAll(KEY, '[chave ocultada]').replace(/\s+/g, ' ').slice(0, 600);
  console.error(`Falha ao gerar áudio: ${message}`);
  process.exitCode = 1;
}
