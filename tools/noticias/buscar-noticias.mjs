// Lê os feeds do Mundo Cristão e grava public/data/noticias.json, a reserva da tela /mundo-cristao.
// Roda todo dia no GitHub Actions (.github/workflows/noticias.yml) e à mão: `npm install && npm run buscar` nesta pasta.
//
// Para trocar de fonte, edite NEWS_SOURCES em src/app/core/christian-world.ts: o app e este script usam a mesma lista,
// o mesmo filtro por palavras-chave, a mesma limpeza e o mesmo limite (o Node 24 lê o .ts direto).
// Um feed que falhar não derruba os outros: as matérias que ele tinha no arquivo anterior ficam.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Parser from 'rss-parser';
import { NEWS_SOURCES, NEWS_LIMIT, fromWordPress, mergeNews, toNewsItem } from '../../src/app/core/christian-world.ts';

const SAIDA = resolve(dirname(fileURLToPath(import.meta.url)), '../../public/data/noticias.json');
const AGENTE = 'BibliaSagradaApp-NoticiasBot/1.0 (+https://sgtcastanheira.github.io/biblia-sagrada/)';
const TEMPO_MS = 25_000;

const parser = new Parser({
  timeout: TEMPO_MS,
  headers: { 'User-Agent': AGENTE, Accept: 'application/rss+xml, application/xml, text/xml, */*' },
  customFields: {
    item: [
      ['media:content', 'media', { keepArray: true }],
      ['media:thumbnail', 'mediaThumb'],
      ['content:encoded', 'contentEncoded'],
    ],
  },
});

/** Entradas cruas de uma fonte, no formato comum do app. */
async function ler(fonte) {
  if (fonte.kind === 'wp') {
    const resposta = await fetch(fonte.url, { headers: { 'User-Agent': AGENTE }, signal: AbortSignal.timeout(TEMPO_MS) });
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
    return fromWordPress(await resposta.json());
  }
  const feed = await parser.parseURL(fonte.url);
  return feed.items.map((i) => ({
    title: i.title,
    link: i.link,
    date: i.isoDate ?? i.pubDate,
    html: i.contentEncoded || i.content || i.summary || '',
    summary: '',
    image: i.enclosure?.type?.startsWith('image') ? i.enclosure.url : (i.mediaThumb?.$?.url ?? i.media?.find((m) => m.$?.url)?.$.url ?? ''),
    categories: i.categories ?? [],
  }));
}

let anterior = { geradoEm: '', itens: [] };
try {
  anterior = JSON.parse(await readFile(SAIDA, 'utf8'));
} catch {
  // Primeira vez: sem arquivo anterior
}

const listas = [];
const falhas = [];
for (const fonte of NEWS_SOURCES) {
  try {
    const itens = (await ler(fonte)).map((e) => toNewsItem(e, fonte)).filter(Boolean);
    console.log(`✔ ${fonte.name}: ${itens.length} matéria(s) do assunto`);
    listas.push(itens);
  } catch (erro) {
    console.warn(`✘ ${fonte.name}: ${erro.message} (ficam as matérias do arquivo anterior)`);
    falhas.push(fonte.name);
    listas.push((anterior.itens ?? []).filter((i) => i.fonte === fonte.name));
  }
}

if (falhas.length === NEWS_SOURCES.length) {
  console.error('Nenhuma fonte respondeu: o arquivo não foi alterado.');
  process.exit(1);
}

const itens = mergeNews(listas, NEWS_LIMIT);
if (!itens.length) {
  console.error('Nenhuma matéria do assunto: o arquivo não foi alterado.');
  process.exit(1);
}

// Sem mudança nas matérias, o arquivo fica como está (e o Actions não faz commit à toa)
if (JSON.stringify(itens) === JSON.stringify(anterior.itens)) {
  console.log('Sem novidade: o arquivo continua igual.');
  process.exit(0);
}

await mkdir(dirname(SAIDA), { recursive: true });
await writeFile(SAIDA, `${JSON.stringify({ geradoEm: new Date().toISOString(), itens }, null, 2)}\n`, 'utf8');
console.log(`Gravado: ${itens.length} matéria(s) em public/data/noticias.json`);
