import { DRAFT_FIGURES, type DraftFigureInfo } from './draft-content';
import { PAIXAO_FIGURES } from './paixao';

/** Dados das faixas compactas de figuras: as dos livros publicados e, na prévia local, as dos rascunhos. */
export const FIGURE_INFO: Record<string, DraftFigureInfo> = { ...PAIXAO_FIGURES, ...DRAFT_FIGURES };
