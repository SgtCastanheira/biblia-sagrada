#!/usr/bin/env node
/** Impede que uma prévia local de rascunhos seja publicada como aplicativo público. */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

// A lista fica aqui para que a proteção funcione também num checkout sem os arquivos privados.
const PRIVATE_IDS = [
  'como-a-ciencia-explica',
  'do-getsemani-a-ressurreicao',
  'paixao-santa-ceia',
  'paixao-prisao-e-interrogatorio',
  'paixao-acoite-e-condenacao',
  'paixao-crucificacao',
  'paixao-sepultamento-e-ressurreicao',
  'paixao-percurso',
  'paixao-corpo',
  'paixao-ferimentos',
  'paixao-morte',
  'paixao-mapa',
  'paixao-malco',
  'paixao-anas',
  'paixao-rosto',
  'paixao-chicote',
  'paixao-coroa',
  'paixao-getsemani',
  'paixao-golgota',
  'paixao-tumulo-vazio',
  'paixao-placa',
  'paixao-lanca',
  'paixao-oliveiras',
  'paixao-regioes',
  'paixao-poder',
  'paixao-quem-mandava',
  'paixao-anatomia-',
  'paixao-sangue-',
  'cego-de-nascenca',
  'filho-da-viuva-de-naim',
  'jesus-acalma-tempestade',
  'multiplicacao-dos-paes',
  'jesus-sobre-as-aguas',
  'o-machado-que-flutuou',
  'o-sinal-de-cana',
  'visao-joao-9',
  'corpo-e-vida-lucas-7',
  'tempestade-acalmada',
  'multiplicacao-paes',
  'machado-flutuando',
  'cana-quimica',
];
const TEXT_EXTENSIONS = new Set(['.js', '.map', '.json', '.html', '.css', '.md']);
const root = resolve(process.argv[2] ?? 'dist/biblia-sagrada/browser');

function privateId(text) {
  const normalized = text.toLowerCase();
  return PRIVATE_IDS.find((id) => normalized.includes(id));
}

function inspect(directory, relative = '') {
  const problems = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    const name = relative ? `${relative}/${entry.name}` : entry.name;
    const pathId = privateId(name);
    if (pathId) problems.push(`${name}: identificador privado no caminho (${pathId})`);
    if (entry.isDirectory()) {
      problems.push(...inspect(path, name));
    } else if (entry.isFile() && TEXT_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
      const contentId = privateId(readFileSync(path, 'utf8'));
      if (contentId) problems.push(`${name}: identificador privado no conteúdo (${contentId})`);
    }
  }
  return problems;
}

try {
  if (!statSync(root).isDirectory()) throw new Error('A saída do build não é um diretório.');
  for (const required of ['index.html', 'ngsw.json']) {
    if (!statSync(join(root, required)).isFile()) throw new Error(`Falta o arquivo obrigatório ${required}.`);
  }
  const problems = inspect(root);
  if (problems.length) {
    console.error(`Publicação bloqueada: o build contém rascunhos locais.\n${problems.join('\n')}`);
    process.exitCode = 1;
  } else {
    console.log('Publicação conferida: nenhum identificador dos rascunhos encontrado.');
  }
} catch (error) {
  console.error(`Publicação bloqueada: não foi possível verificar o build em ${root}.\n${error.message}`);
  process.exitCode = 1;
}
