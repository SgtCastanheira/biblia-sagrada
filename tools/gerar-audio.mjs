#!/usr/bin/env node
/**
 * Gera a narração em áudio (voz neural do Azure) das histórias do app.
 *
 *   AZURE_SPEECH_KEY=... AZURE_SPEECH_REGION=brazilsouth node tools/gerar-audio.mjs --dry-run
 *   AZURE_SPEECH_KEY=... AZURE_SPEECH_REGION=brazilsouth node tools/gerar-audio.mjs --only igreja-primitiva
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

const VOICE = option('voice', 'pt-BR-FranciscaNeural');
const RATE = option('rate', '-8%'); // um pouco mais devagar que a fala normal: soa calmo
const FORMAT = 'audio-24khz-48kbitrate-mono-mp3';
const BYTES_PER_SECOND = 48000 / 8;
const PAUSE_MS = 500;
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
const sourceOf = (job) => createHash('sha1').update(`${VOICE}|${RATE}|${FORMAT}|${job.items.map((i) => i.text).join('\n')}`).digest('hex').slice(0, 16);
const pending = jobs.filter((j) => flag('force') || index.files[j.key]?.source !== sourceOf(j));
const chars = pending.reduce((n, j) => n + j.items.reduce((m, i) => m + i.text.length, 0), 0);

console.log(`${jobs.length} histórias · ${pending.length} para gerar · ${chars.toLocaleString('pt-BR')} caracteres`);
console.log(`Estimativa: ${Math.round(chars / 900)} minutos de áudio, ${Math.round((chars / 900) * 60 * BYTES_PER_SECOND / 1048576)} MB.`);
console.log(`Voz ${VOICE}, velocidade ${RATE}. Plano gratuito do Azure: ${FREE_MONTHLY_CHARS.toLocaleString('pt-BR')} caracteres por mês (${Math.round((chars / FREE_MONTHLY_CHARS) * 100)}% dele).`);
if (flag('dry-run') || !pending.length) process.exit(0);

const KEY = process.env.AZURE_SPEECH_KEY;
const REGION = process.env.AZURE_SPEECH_REGION;
if (!KEY || !REGION) {
  console.error('Defina AZURE_SPEECH_KEY e AZURE_SPEECH_REGION (veja tools/LEIA-ME.md).');
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

async function synthesize(text) {
  const id = createHash('sha1').update(`${VOICE}|${RATE}|${FORMAT}|${PAUSE_MS}|${text}`).digest('hex');
  const file = join(cacheDir, `${id}.mp3`);
  if (existsSync(file)) return readFileSync(file);
  const ssml = `<speak version="1.0" xml:lang="pt-BR"><voice name="${VOICE}"><prosody rate="${RATE}">${escapeXml(text)}</prosody><break time="${PAUSE_MS}ms"/></voice></speak>`;
  for (let attempt = 1; attempt <= 5; attempt++) {
    const res = await fetch(`https://${REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST',
      headers: { 'Ocp-Apim-Subscription-Key': KEY, 'Content-Type': 'application/ssml+xml', 'X-Microsoft-OutputFormat': FORMAT, 'User-Agent': 'biblia-sagrada-audio' },
      body: ssml,
    });
    if (res.ok) {
      const bytes = Buffer.from(await res.arrayBuffer());
      writeFileSync(file, bytes);
      return bytes;
    }
    if (res.status === 429 || res.status >= 500) {
      await new Promise((r) => setTimeout(r, 1500 * attempt));
      continue;
    }
    throw new Error(`Azure respondeu ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  throw new Error('O Azure não respondeu depois de 5 tentativas.');
}

for (const [n, job] of pending.entries()) {
  const parts = [];
  const items = [];
  let bytes = 0;
  for (const item of job.items) {
    const audio = await synthesize(item.text);
    items.push({ t: Math.round((bytes / BYTES_PER_SECOND) * 100) / 100, k: app.textKey(item.shown) });
    parts.push(audio);
    bytes += audio.length;
  }
  const out = join(root, 'public/audio', `${job.key}.mp3`);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, Buffer.concat(parts));
  index.files[job.key] = { source: sourceOf(job), seconds: Math.round(bytes / BYTES_PER_SECOND), items };
  index.voice = VOICE;
  mkdirSync(dirname(indexPath), { recursive: true });
  writeFileSync(indexPath, JSON.stringify(index));
  console.log(`[${n + 1}/${pending.length}] ${job.key} · ${Math.round(bytes / BYTES_PER_SECOND / 60)} min · ${(bytes / 1048576).toFixed(1)} MB`);
}
console.log('Pronto. Confira com "npx ng serve" e commite public/audio.');
