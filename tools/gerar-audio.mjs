#!/usr/bin/env node
/**
 * Gera a narração em áudio das histórias do app, com a voz neural do Azure (padrão) ou da ElevenLabs.
 *
 *   AZURE_SPEECH_KEY=... AZURE_SPEECH_REGION=brazilsouth node tools/gerar-audio.mjs --dry-run
 *   AZURE_SPEECH_KEY=... AZURE_SPEECH_REGION=brazilsouth node tools/gerar-audio.mjs --only igreja-primitiva
 *   ELEVENLABS_API_KEY=... ELEVENLABS_VOICE_ID=... node tools/gerar-audio.mjs --provedor elevenlabs --only igreja-primitiva --amostra
 *   node tools/gerar-audio.mjs                       (todas as histórias e todos os estados)
 *
 * A chave fica só no seu computador (variável de ambiente): nunca vai para o código nem para o Git.
 * Os trechos são os mesmos que o app lê na tela (títulos, parágrafos, listas). Cada trecho é gravado à parte,
 * as gravações são coladas num único MP3 por história e o índice (public/audio/index.json) guarda de que
 * segundo começa cada trecho, para o app destacar o parágrafo que está sendo falado.
 * Gravações já feitas ficam em tools/.audio-cache: rodar de novo só paga o que mudou.
 */
import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};

const PROVIDER = option('provedor', process.env.AUDIO_PROVEDOR ?? 'azure');
if (!['azure', 'elevenlabs'].includes(PROVIDER)) {
  console.error('--provedor deve ser azure ou elevenlabs.');
  process.exit(1);
}
const ELEVEN = PROVIDER === 'elevenlabs';
// Azure: nome da voz. ElevenLabs: o ID da voz (copie em "Voices" > Copy voice ID, depois de testá-la em Speech Synthesis).
const VOICE = ELEVEN ? option('voz', process.env.ELEVENLABS_VOICE_ID ?? '') : option('voice', 'pt-BR-FranciscaNeural');
const RATE = option('rate', '-8%'); // Azure: um pouco mais devagar que a fala normal, soa calmo
const SPEED = Number(option('velocidade', '0.95')); // ElevenLabs: 1 é a velocidade normal (aceita de 0,7 a 1,2)
const MODEL = option('modelo', process.env.ELEVENLABS_MODEL ?? 'eleven_multilingual_v2');
const FORMAT = ELEVEN ? 'mp3_44100_128' : 'audio-24khz-48kbitrate-mono-mp3';
const BITRATE = ELEVEN ? 128000 : 48000;
const BYTES_PER_SECOND = BITRATE / 8; // só para a estimativa; a duração real vem de mp3Seconds
const PAUSE_MS = 500;
/** Tudo o que muda o som: entra no cache e na "assinatura" de cada história. */
const CONFIG = ELEVEN ? `elevenlabs|${VOICE}|${MODEL}|${SPEED}|${FORMAT}|${PAUSE_MS}` : `azure|${VOICE}|${RATE}|${FORMAT}|${PAUSE_MS}`;
// Nome mostrado no player ("Brian (voz neural)"); na ElevenLabs o ID da voz não diz nada a quem ouve
const VOICE_LABEL = ELEVEN ? option('nome-voz', 'ElevenLabs') : VOICE;
const ONLY = option('only', '')?.split(',').filter(Boolean) ?? [];
const FREE_MONTHLY_CHARS = 500_000;

// O mesmo código do app (leitor de Markdown, biblioteca, referências) empacotado para o Node
const bundle = await build({
  stdin: {
    contents: `
      export { parseBlocks } from './src/app/core/rich-text-parser';
      export { ARTICLES } from './src/app/core/library';
      export { AD_STATES } from './src/app/core/ad-states';
      export { parseReferences } from './src/app/core/reference-parser';
      export { findBook } from './src/app/core/books';
      export { textKey } from './src/app/core/audio-text';`,
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
    if (['h2', 'h3', 'p', 'quote', 'note', 'scene', 'pullquote'].includes(b.type)) add(b.inlines);
    else if (b.type === 'ul' || b.type === 'ol') for (const it of b.items ?? []) add(it);
  }
  return items;
}

const jobs = [];
const read = (path) => readFileSync(join(root, 'public/conteudo', path), 'utf8');
for (const a of app.ARTICLES) {
  if (ONLY.length && !ONLY.includes(a.id)) continue;
  jobs.push({ key: `artigos/${a.id}`, items: itemsOf(read(`artigos/${a.id}.md`), a.title, a.subtitle) });
}
for (const s of app.AD_STATES) {
  if (ONLY.length && !ONLY.includes(`estado-${s.id}`) && !ONLY.includes(s.id)) continue;
  jobs.push({ key: `estados/${s.id}`, items: itemsOf(read(`ad-estados/${s.id}.md`), `A Assembleia de Deus em ${s.state}`, s.summary) });
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
const charsOf = (job) => job.items.reduce((m, i) => m + i.text.length, 0);
let pending = jobs.filter((j) => {
  if (flag('force')) return true;
  const entry = index.files[j.key];
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

console.log(`${jobs.length} histórias · ${pending.length} para gerar · ${chars.toLocaleString('pt-BR')} caracteres${postponed ? ` · ${postponed} ficam para a próxima rodada (passam da cota de ${quota.toLocaleString('pt-BR')})` : ''}`);
console.log(`Estimativa: ${Math.round(chars / 900)} minutos de áudio, ${Math.round((chars / 900) * 60 * BYTES_PER_SECOND / 1048576)} MB.`);
if (ELEVEN) {
  console.log(`Voz ${VOICE || '(defina ELEVENLABS_VOICE_ID ou --voz)'}, modelo ${MODEL}, velocidade ${SPEED}.`);
  console.log(`Consumo: cerca de ${chars.toLocaleString('pt-BR')} créditos (1 por caractere no modelo multilingual v2; confira a franquia e as regras de uso do seu plano no site da ElevenLabs).`);
} else {
  console.log(`Voz ${VOICE}, velocidade ${RATE}. Plano gratuito do Azure: ${FREE_MONTHLY_CHARS.toLocaleString('pt-BR')} caracteres por mês (${Math.round((chars / FREE_MONTHLY_CHARS) * 100)}% dele).`);
}
if (flag('dry-run') || (!pending.length && !flag('amostra'))) process.exit(0);

const KEY = ELEVEN ? process.env.ELEVENLABS_API_KEY : process.env.AZURE_SPEECH_KEY;
const REGION = process.env.AZURE_SPEECH_REGION;
if (ELEVEN ? !KEY || !VOICE : !KEY || !REGION) {
  console.error(ELEVEN ? 'Defina ELEVENLABS_API_KEY e ELEVENLABS_VOICE_ID (veja tools/LEIA-ME.md).' : 'Defina AZURE_SPEECH_KEY e AZURE_SPEECH_REGION (veja tools/LEIA-ME.md).');
  process.exit(1);
}
const limit = Number(option('limite', '0'));
if (limit && chars > limit) {
  console.error(`Isso passa do limite de ${limit} caracteres que você pediu (--limite). Use --only para gerar aos poucos.`);
  process.exit(1);
}

const cacheDir = join(root, 'tools/.audio-cache');
mkdirSync(cacheDir, { recursive: true });
const escapeXml = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Duração exata de um MP3, somando os quadros (MPEG 1, 2 e 2.5, camada III). Assim o "segundo em que cada
 * trecho começa" não depende de a taxa de bits ser constante nem de haver cabeçalhos.
 */
export function mp3Seconds(buf) {
  let pos = 0;
  if (buf.length > 10 && buf.toString('latin1', 0, 3) === 'ID3') pos = 10 + ((buf[6] & 0x7f) << 21 | (buf[7] & 0x7f) << 14 | (buf[8] & 0x7f) << 7 | (buf[9] & 0x7f));
  const rates = { 3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000] };
  const kbps1 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
  const kbps2 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];
  let seconds = 0;
  while (pos + 4 <= buf.length) {
    if (buf[pos] !== 0xff || (buf[pos + 1] & 0xe0) !== 0xe0) { pos++; continue; }
    const version = (buf[pos + 1] >> 3) & 3; // 3 = MPEG 1, 2 = MPEG 2, 0 = MPEG 2.5
    const layer = (buf[pos + 1] >> 1) & 3; // 1 = camada III
    const bitrateIndex = buf[pos + 2] >> 4;
    const rateIndex = (buf[pos + 2] >> 2) & 3;
    if (version === 1 || layer !== 1 || bitrateIndex === 0 || bitrateIndex === 15 || rateIndex === 3) { pos++; continue; }
    const rate = rates[version][rateIndex];
    const kbps = (version === 3 ? kbps1 : kbps2)[bitrateIndex];
    const padding = (buf[pos + 2] >> 1) & 1;
    const samples = version === 3 ? 1152 : 576;
    const length = Math.floor(((version === 3 ? 144 : 72) * kbps * 1000) / rate) + padding;
    seconds += samples / rate;
    pos += length;
  }
  return seconds;
}

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
    if (res.status === 429 || res.status >= 500) { await wait(1500 * attempt); continue; }
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
  if (existsSync(file)) return readFileSync(file);
  const bytes = ELEVEN ? await synthesizeEleven(text, before, after) : await synthesizeAzure(text);
  writeFileSync(file, bytes);
  return bytes;
}

if (flag('amostra')) {
  // Para escolher a voz antes de gastar: grava só o começo de uma história, fora do app (tools/amostra-*.mp3)
  const job = jobs[0];
  if (!job || jobs.length > 1) {
    console.error('Use --amostra com --only e uma só história (ex.: --only igreja-primitiva).');
    process.exit(1);
  }
  const texts = job.items.slice(0, 3).map((i) => i.text);
  const audio = [];
  for (const [k, t] of texts.entries()) audio.push(await synthesize(t, texts[k - 1] ?? '', texts[k + 1] ?? ''));
  const out = join(root, 'tools', `amostra-${PROVIDER}-${VOICE.replace(/[^\w-]+/g, '_') || 'voz'}.mp3`);
  writeFileSync(out, Buffer.concat(audio));
  console.log(`Amostra gravada em ${out} (${Math.round(mp3Seconds(Buffer.concat(audio)))} s). Ouça e, se gostar, rode sem --amostra.`);
  process.exit(0);
}

for (const [n, job] of pending.entries()) {
  const parts = [];
  const items = [];
  let seconds = 0;
  for (const [k, item] of job.items.entries()) {
    const audio = await synthesize(item.text, job.items[k - 1]?.text ?? '', job.items[k + 1]?.text ?? '');
    items.push({ t: Math.round(seconds * 100) / 100, k: app.textKey(item.shown) });
    parts.push(audio);
    seconds += mp3Seconds(audio);
  }
  const out = join(root, 'public/audio', `${job.key}.mp3`);
  mkdirSync(dirname(out), { recursive: true });
  const all = Buffer.concat(parts);
  writeFileSync(out, all);
  index.files[job.key] = { source: sourceOf(job), text: textOf(job), voice: VOICE_LABEL, seconds: Math.round(seconds), items };
  index.voice = VOICE_LABEL;
  mkdirSync(dirname(indexPath), { recursive: true });
  writeFileSync(indexPath, JSON.stringify(index));
  console.log(`[${n + 1}/${pending.length}] ${job.key} · ${Math.round(seconds / 60)} min · ${(all.length / 1048576).toFixed(1)} MB`);
}
console.log('Pronto. Confira com "npx ng serve" e commite public/audio.');
