import { expect, test } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { DRAFT_ARTICLES, DRAFT_ARTICLE_SOURCES, DRAFT_TRAILS, DRAFT_WORKS } from '../../src/app/core/draft-content';
import { ARTICLES } from '../../src/app/core/library';
import { ARTICLE_SOURCES } from '../../src/app/core/sources';
import { TRAILS } from '../../src/app/core/trails';

const ARTICLE_IDS = [
  'do-getsemani-a-ressurreicao',
  'paixao-santa-ceia', 'paixao-getsemani', 'paixao-prisao-e-interrogatorio', 'paixao-acoite-e-condenacao',
  'paixao-crucificacao', 'paixao-sepultamento-e-ressurreicao', 'paixao-quem-mandava',
  'cego-de-nascenca', 'filho-da-viuva-de-naim', 'jesus-acalma-tempestade', 'multiplicacao-dos-paes',
  'jesus-sobre-as-aguas', 'o-machado-que-flutuou', 'o-sinal-de-cana',
];
const verifyScript = resolve('tools/verificar-publicacao.mjs');

function verify(directory: string) {
  const result = spawnSync(process.execPath, [verifyScript, directory], { encoding: 'utf8' });
  expect(result.error, 'o processo de verificação precisa iniciar').toBeUndefined();
  return { status: result.status, output: `${result.stdout}${result.stderr}` };
}

function withBuild(run: (directory: string) => void) {
  const directory = mkdtempSync(join(tmpdir(), 'biblia-publicacao-'));
  try {
    writeFileSync(join(directory, 'index.html'), '<!doctype html><html lang="pt-BR"><body>Aplicativo público</body></html>');
    writeFileSync(join(directory, 'ngsw.json'), JSON.stringify({ assetGroups: [], hashTable: {} }));
    run(directory);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test('rascunhos: os catálogos padrão e a biblioteca pública não incluem a coleção privada', () => {
  expect(DRAFT_ARTICLES).toEqual([]);
  expect(DRAFT_TRAILS).toEqual([]);
  expect(DRAFT_WORKS).toEqual({});
  expect(DRAFT_ARTICLE_SOURCES).toEqual({});
  expect(ARTICLES.filter((article) => ARTICLE_IDS.includes(article.id))).toEqual([]);
  expect(TRAILS.some((trail) => trail.id === 'como-a-ciencia-explica')).toBe(false);
  expect(TRAILS.flatMap((trail) => trail.branches.flatMap((branch) => branch.ids)).filter((id) => ARTICLE_IDS.includes(id))).toEqual([]);
  expect(Object.keys(ARTICLE_SOURCES).filter((id) => ARTICLE_IDS.includes(id))).toEqual([]);
});

test('publicação: aceita um build público sem depender da pasta de rascunhos', () => {
  withBuild((directory) => {
    writeFileSync(join(directory, 'main.js'), 'console.log("Bíblia Sagrada");');
    mkdirSync(join(directory, 'conteudo', 'artigos'), { recursive: true });
    writeFileSync(join(directory, 'conteudo', 'artigos', 'estudo-publico.md'), '# Estudo público\n\nTexto disponível para todos.');
    expect(verify(directory).status).toBe(0);
  });
});

test('publicação: recusa saída inexistente ou sem os arquivos do aplicativo de produção', () => {
  withBuild((directory) => {
    expect(verify(join(directory, 'nao-existe')).status).toBe(1);
    rmSync(join(directory, 'index.html'));
    expect(verify(directory).status).toBe(1);
    writeFileSync(join(directory, 'index.html'), '<!doctype html>');
    rmSync(join(directory, 'ngsw.json'));
    expect(verify(directory).status).toBe(1);
  });
});

test('publicação: recusa Markdown privado mesmo sem o artigo no catálogo JavaScript', () => {
  withBuild((directory) => {
    const file = join(directory, 'conteudo', 'artigos', 'cego-de-nascenca.md');
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, '# Rascunho de teste');
    const result = verify(directory);
    expect(result.status).toBe(1);
    expect(result.output).toContain('cego-de-nascenca');
  });
});

test('publicação: recusa catálogo ou figuras privadas em bundles e mapas de código', () => {
  for (const [file, id] of [
    ['chunk-local.js', 'como-a-ciencia-explica'],
    ['chunk-paixao.js', 'do-getsemani-a-ressurreicao'],
    ['chunk-ceia.js', 'paixao-santa-ceia'],
    ['chunk-prisao.js', 'paixao-prisao-e-interrogatorio'],
    ['chunk-acoite.js', 'paixao-acoite-e-condenacao'],
    ['chunk-cruz.js', 'paixao-crucificacao'],
    ['chunk-ressurreicao.js', 'paixao-sepultamento-e-ressurreicao'],
    ['chunk-figura.js', 'visao-joao-9'],
    ['chunk-sangue.js', 'paixao-sangue-'],
    ['chunk-mapa.js', 'paixao-mapa'],
    ['chunk-malco.js', 'paixao-malco'],
    ['chunk-placa.js', 'paixao-placa'],
    ['chunk-lanca.js', 'paixao-lanca'],
    ['chunk-oliveiras.js', 'paixao-oliveiras'],
    ['chunk-regioes.js', 'paixao-regioes'],
    ['chunk-poder.js', 'paixao-poder'],
    ['chunk-mandava.js', 'paixao-quem-mandava'],
    ['chunk.js.map', 'corpo-e-vida-lucas-7'],
  ]) {
    withBuild((directory) => {
      writeFileSync(join(directory, file), JSON.stringify({ id }));
      const result = verify(directory);
      expect(result.status, `${file} contém ${id}`).toBe(1);
      expect(result.output).toContain(id);
    });
  }
});

test('publicação: também recusa identificador privado no nome de um arquivo de imagem', () => {
  for (const name of ['cana-quimica.png', 'paixao-getsemani.png', 'paixao-anatomia-pele.png', 'paixao-anatomia-torax.webp', 'paixao-anatomia-neuro.png']) {
    withBuild((directory) => {
      writeFileSync(join(directory, name), new Uint8Array([137, 80, 78, 71]));
      expect(verify(directory).status, name).toBe(1);
    });
  }
});
