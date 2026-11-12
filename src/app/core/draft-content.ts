import type { Article } from './library';
import type { SourceSet, Work } from './sources';
import type { Trail } from './trails';

/**
 * O aplicativo público não distribui rascunhos.
 * A prévia local substitui este módulo por um catálogo fora do Git.
 */
export const DRAFT_ARTICLES: Article[] = [];
export const DRAFT_PREVIEW = false;
export const DRAFT_TRAILS: Trail[] = [];
export const DRAFT_WORKS: Record<string, Work> = {};
export const DRAFT_ARTICLE_SOURCES: Record<string, SourceSet> = {};

/** Apresentação das figuras privadas: faixa compacta ou esquema inline. Vazio no aplicativo público. */
export interface DraftFigureInfo {
  kind: string;
  title: string;
  /** Caminho da miniatura dentro de public/conteudo; sem ela, vale o ícone. */
  thumb?: string;
  icon?: string;
  /** Esquema essencial à leitura: aparece inteiro, sem a faixa recolhível. */
  inline?: boolean;
}
export const DRAFT_FIGURES: Record<string, DraftFigureInfo> = {};
