import { expect, test } from '@playwright/test';
import { ARTICLES } from '../../src/app/core/library';
import { ARTICLE_SOURCES, TOPIC_SOURCES, WORKS } from '../../src/app/core/sources';

test('fontes: todo estudo tem fontes e toda obra citada existe no catálogo', () => {
  const missing = ARTICLES.filter((a) => !ARTICLE_SOURCES[a.id]).map((a) => a.id);
  expect(missing, 'estudos sem fontes').toEqual([]);
  const extra = Object.keys(ARTICLE_SOURCES).filter((id) => !ARTICLES.some((a) => a.id === id));
  expect(extra, 'fontes de estudos que não existem').toEqual([]);
  const sets = [...Object.entries(ARTICLE_SOURCES), ...Object.entries(TOPIC_SOURCES)];
  for (const [id, set] of sets) {
    expect(set.works.length, `${id}: sem obras`).toBeGreaterThan(0);
    for (const w of set.works) expect(WORKS[w], `${id}: obra "${w}"`).toBeTruthy();
  }
});
