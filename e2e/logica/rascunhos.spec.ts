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
  'cego-de-nascenca', 'filho-da-viuva-de-naim', 'jesus-acalma-tempestade', 'multiplicacao-dos-paes',
  'jesus-sobre-as-aguas', 'o-machado-que-flutuou', 'o-sinal-de-cana',
];
// Volume 4 · A Paixão, da Ceia à Ressurreição: publicado; os volumes 1 a 3 da trilha continuam privados
const PAIXAO_VOLUME = 'Volume 4 · A Paixão, da Ceia à Ressurreição';
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
  expect(TRAILS.find((trail) => trail.id === 'como-a-ciencia-explica')?.branches.map((branch) => branch.title)).toEqual([PAIXAO_VOLUME]);
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
    ['chunk-paixao.js', 'do-getsemani-a-ressurreicao'],
    ['chunk-figura.js', 'visao-joao-9'],
    ['chunk.js.map', 'corpo-e-vida-lucas-7'],
    ['chunk-vinho.js', 'o-sinal-de-cana'],
    ['chunk-machado.js', 'o-machado-que-flutuou'],
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
  for (const name of ['cana-quimica.png', 'cego-de-nascenca.webp', 'o-sinal-de-cana.jpg']) {
    withBuild((directory) => {
      writeFileSync(join(directory, name), new Uint8Array([137, 80, 78, 71]));
      expect(verify(directory).status, name).toBe(1);
    });
  }
});

test('publicação: aceita os livros da Paixão e suas imagens, que agora são públicos', () => {
  withBuild((directory) => {
    mkdirSync(join(directory, 'conteudo', 'artigos'), { recursive: true });
    mkdirSync(join(directory, 'conteudo', 'imagens'), { recursive: true });
    writeFileSync(join(directory, 'conteudo', 'artigos', 'paixao-crucificacao.md'), '# Crucificação');
    writeFileSync(join(directory, 'conteudo', 'imagens', 'paixao-anatomia-pele-v2.webp'), new Uint8Array([82, 73, 70, 70]));
    writeFileSync(join(directory, 'chunk-paixao-lanca.js'), JSON.stringify({ id: 'paixao-lanca', trilha: 'como-a-ciencia-explica' }));
    expect(verify(directory).status).toBe(0);
  });
});
