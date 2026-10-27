/**
 * Cenas desenhadas das lições: uma paisagem e até três objetos, escolhidos pelo assunto do texto.
 * Código puro (sem Angular): as regras ficam aqui, o desenho em shared/scene-art.ts.
 */
export type Setting = 'deserto' | 'campo' | 'mar' | 'noite' | 'monte' | 'cidade' | 'templo' | 'ceu' | 'jardim' | 'casa';
export type SceneObject =
  | 'arca' | 'arco-iris' | 'cruz' | 'estrela' | 'pergaminho' | 'coroa' | 'pomba' | 'chama' | 'ovelha' | 'pessoas'
  | 'coracao' | 'livro' | 'maos' | 'lampada' | 'barco' | 'tenda' | 'arvore' | 'paes' | 'cajado' | 'trigo' | 'muro' | 'luz';

export interface Scene {
  setting: Setting;
  objects: SceneObject[];
}

/** Regras: a primeira que casar com o texto (sem acentos, em minúsculas) vence. */
const RULES: [RegExp, Scene][] = [
  [/\b(noe|arca|diluvio|arco-iris)\b/, { setting: 'mar', objects: ['arca', 'arco-iris'] }],
  [/\b(pentecostes|espirito santo|batismo no espirito|fogo do espirito|linguas)\b/, { setting: 'ceu', objects: ['chama', 'pomba'] }],
  [/\b(cruz|crucific|ressurre|ressuscit|sepulcro|calvario|morrer para o pecado)\b/, { setting: 'monte', objects: ['cruz', 'luz'] }],
  [/\b(natal|nasc(e|imento) de jesus|belem|manjedoura|salvador|magos|estrela)\b/, { setting: 'noite', objects: ['estrela', 'pessoas'] }],
  [/\b(criou|criacao|criador|principio)\b/, { setting: 'jardim', objects: ['arvore', 'luz'] }],
  [/\b(pecado|queda|jardim do eden|fruto proibido|adao|eva)\b/, { setting: 'jardim', objects: ['arvore', 'coracao'] }],
  [/\b(exodo|moises|maná|mana|mar vermelho|faraó|farao|egito|deserto)\b/, { setting: 'deserto', objects: ['cajado', 'tenda'] }],
  [/\b(pastor|ovelha|salmo 23|bom pastor)\b/, { setting: 'campo', objects: ['ovelha', 'cajado'] }],
  [/\b(templo|casa do papai|casa do senhor|casa de deus|igreja|tabernaculo)\b/, { setting: 'templo', objects: ['lampada', 'pessoas'] }],
  [/\b(rei|reino|coroa|davi|salomao|josias|ezequias|manasses|jero|acabe|jeu|asa|rob)/, { setting: 'cidade', objects: ['coroa', 'muro'] }],
  [/\b(oracao|orar|orou|oram|clamar)\b/, { setting: 'noite', objects: ['maos', 'estrela'] }],
  [/\b(biblia|palavra|lei|escritura|deuteronomio|leu|ler|livro|conhecimento)\b/, { setting: 'templo', objects: ['pergaminho', 'luz'] }],
  [/\b(sabedoria|proverbios|conselho)\b/, { setting: 'campo', objects: ['lampada', 'livro'] }],
  [/\b(amigo|amizade|amar|amor|bondoso|proximo|samaritano|misericordia)\b/, { setting: 'campo', objects: ['pessoas', 'coracao'] }],
  [/\b(familia|pais|lar|casa)\b/, { setting: 'casa', objects: ['coracao', 'pessoas'] }],
  [/\b(pao|paes|peixe|alimenta|comida|fome|maná)\b/, { setting: 'campo', objects: ['paes', 'trigo'] }],
  [/\b(viagem|barco|mar|navio|tempestade)\b/, { setting: 'mar', objects: ['barco', 'estrela'] }],
  [/\b(missao|missionari|ide|evangelho|mundo)\b/, { setting: 'monte', objects: ['pessoas', 'estrela'] }],
  [/\b(alegria|louvor|cantem|cantar|cancao|musica|salmo)\b/, { setting: 'campo', objects: ['estrela', 'pessoas'] }],
  [/\b(protetor|protege|socorro|ajuda|medo|coragem|forte)\b/, { setting: 'monte', objects: ['luz', 'pessoas'] }],
];

const fold = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const DEFAULTS: Scene[] = [
  { setting: 'campo', objects: ['livro', 'luz'] },
  { setting: 'monte', objects: ['pergaminho', 'estrela'] },
  { setting: 'jardim', objects: ['livro', 'pessoas'] },
];

/** Escolhe a cena de um texto; sem assunto reconhecido, usa uma cena tranquila, sempre a mesma para o mesmo texto. */
export function sceneFor(text: string): Scene {
  const t = fold(text);
  for (const [re, scene] of RULES) if (re.test(t)) return scene;
  let h = 0;
  for (const ch of t) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return DEFAULTS[h % DEFAULTS.length];
}

/** Quadros da "história desenhada": uma cena para cada passo, sem repetir a paisagem em quadros seguidos. */
export function storyboard(steps: string[], fallback: Scene): Scene[] {
  let last = '';
  return steps.map((s, i) => {
    let scene = sceneFor(s);
    const unknown = DEFAULTS.includes(scene);
    if (unknown) scene = { setting: i % 2 ? fallback.setting : 'campo', objects: fallback.objects.slice(i % 2) };
    if (scene.setting === last) scene = { ...scene, setting: (['campo', 'monte', 'jardim', 'noite'] as Setting[]).find((x) => x !== last && x !== scene.setting) ?? scene.setting };
    last = scene.setting;
    return scene;
  });
}
