import { Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ATLAS_MAP, findEra } from '../../core/atlas';
import type { Era, Lonlat } from '../../core/atlas';
import type { BibleMap, MapPlace, MapTerritory } from '../../core/maps';
import { BibleMapView } from '../bible-map';
import * as GEO from './jerusalem-geo';
import { BOUNDS, GOLD, LANDMARK, ROUTE, WALL, WATER, area, ribbon, thin } from './passion-route';

/**
 * Figuras de contexto dos livros da Paixão: o Monte das Oliveiras e o Getsêmani, as regiões do tempo de Jesus
 * e o esquema de quem respondia a quem. Os dois mapas usam o visualizador de mapas do app; o esquema é HTML e CSS, com
 * texto de pelo menos 13 px.
 */

// ── O Monte das Oliveiras e o Getsêmani ────────────────────────────────────
/** Contorno aproximado do Monte das Oliveiras, a leste do vale do Cedrom: um esboço para situar o leitor, não um levantamento. */
const MOUNT_OF_OLIVES: Lonlat[] = [
  [35.2404, 31.785], [35.247, 31.786], [35.25, 31.782], [35.25, 31.774], [35.247, 31.77], [35.2415, 31.7712], [35.2405, 31.7765],
];
const OLIVE = 'color-mix(in srgb, var(--mat-sys-primary) 65%, var(--accent-gold))';

const OLIVEIRAS_PLACES: MapPlace[] = [
  { id: 'cenaculo', name: 'Cenáculo', lon: 35.22927, lat: 31.77191, label: 'l', uncertain: true, group: 'Jerusalém' },
  { id: 'getsemani', name: 'Getsêmani', lon: 35.23977, lat: 31.7793, label: 'r', group: 'Jerusalém' },
  { id: 'oliveiras', name: 'Monte das Oliveiras', lon: 35.2452, lat: 31.7772, region: true },
  { id: 'cedrom', name: 'Vale do Cedrom', lon: 35.2417, lat: 31.7742, region: true, detail: true },
  // Pontos sem nome, só para a câmera enquadrar do cenáculo ao alto do monte
  { id: 'enquadra-leste', name: '', lon: 35.2492, lat: 31.7795, region: true },
  { id: 'enquadra-norte', name: '', lon: 35.2292, lat: 31.7838, region: true },
];
const OLIVEIRAS_FOCUS = ['cenaculo', 'getsemani', 'enquadra-leste', 'enquadra-norte'];

function oliveirasMap(): BibleMap {
  const territories: MapTerritory[] = [area('monte-das-oliveiras', MOUNT_OF_OLIVES, OLIVE)];
  GEO.KIDRON.forEach((line, i) => territories.push(thin(`cedrom-${i}`, line, WATER)));
  territories.push(area('monte-do-templo', GEO.TEMPLE_MOUNT, GOLD));
  GEO.OLD_CITY_WALL.forEach((line, i) => territories.push(thin(`muralha-${i}`, line, WALL)));
  // O mapa preenche regiões com 30% de opacidade: três camadas iguais deixam o caminho firme
  for (let k = 0; k < 3; k++) territories.push(area(`caminho-${k}`, ribbon(GEO.WALKS['cenaculo-getsemani'].line, 24), ROUTE));
  return {
    id: 'vida-de-jesus',
    title: 'O Monte das Oliveiras e o Getsêmani',
    period: 'Páscoa · século I',
    summary: 'O templo, o vale do Cedrom e o Monte das Oliveiras.',
    icon: 'public',
    bounds: BOUNDS,
    zoom: 0.003,
    focusZoom: 0.0033,
    route: false,
    chapters: [],
    landmark: LANDMARK,
    places: OLIVEIRAS_PLACES,
    steps: [],
    territories,
  };
}

@Component({
  selector: 'app-passion-oliveiras',
  imports: [MatIconModule, BibleMapView],
  template: `
    <figure class="ctx">
      <figcaption class="head"><mat-icon>public</mat-icon> O Monte das Oliveiras e o Getsêmani</figcaption>
      <div class="frame">
        <app-bible-map [map]="map" [focus]="focus" [interactive]="interactive()" />
      </div>
      <div class="layers" role="group" aria-label="Opções do mapa">
        <button type="button" class="chip" [attr.aria-pressed]="interactive()" (click)="interactive.set(!interactive())">Mover e aproximar</button>
      </div>
      <ul class="key" aria-label="O que o mapa mostra">
        <li><i class="sw gold"></i><span><b>Dourado</b>: o monte do templo.</span></li>
        <li><i class="sw water"></i><span><b>Linha azul</b>: o ribeiro de Cedrom, no fundo do vale.</span></li>
        <li><i class="sw olive"></i><span><b>Verde</b>: o Monte das Oliveiras, do outro lado do vale (contorno aproximado).</span></li>
        <li><i class="sw route"></i><span><b>Faixa</b>: o caminho a pé de hoje do cenáculo ao jardim, cerca de 1,8 km (João 18.1).</span></li>
      </ul>
      <p class="credit">Fundo e caminho a pé: © colaboradores do <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> (licença ODbL). As muralhas são as de hoje, só de referência. <b>(?)</b>: local debatido.</p>
    </figure>
  `,
  styleUrl: './passion-contexto.scss',
})
export class PassionOliveiras {
  protected readonly map = oliveirasMap();
  protected readonly focus = OLIVEIRAS_FOCUS;
  protected readonly interactive = signal(false);
}

// ── As regiões do tempo de Jesus ───────────────────────────────────────────
const ROMA = findEra('roma')!;
/** Só as divisões da terra de Israel; os reinos distantes da época "O mundo romano" ficam fora do enquadramento. */
const REGIOES: Era = { ...ROMA, powers: ROMA.powers.filter((p) => /Galileia|Pereia|Judeia|Decápolis|Filipe/.test(p.name)) };
const REGIOES_MAP: BibleMap = {
  ...ATLAS_MAP,
  focusZoom: 0.05,
  places: [
    { id: 'jerusalem', name: 'Jerusalém', lon: 35.23, lat: 31.78, label: 'r' },
    { id: 'cesareia', name: 'Cesareia', lon: 34.89, lat: 32.5, label: 'l' },
    { id: 'tiberiades', name: 'Tiberíades', lon: 35.53, lat: 32.79, label: 'r' },
    { id: 'galileia', name: 'Galileia', lon: 35.28, lat: 32.98, region: true },
    { id: 'judeia', name: 'Judeia', lon: 35.1, lat: 31.5, region: true },
    { id: 'filipe', name: 'Filipe', lon: 36.02, lat: 33.17, region: true },
    { id: 'canto-oeste', name: '', lon: 34.4, lat: 33.5, region: true },
    { id: 'canto-leste', name: '', lon: 36.5, lat: 31.0, region: true },
  ],
};
const REGIOES_FOCUS = ['canto-oeste', 'canto-leste'];

interface Poder {
  match: RegExp;
  quem: string;
  onde: string;
}
/** Quem mandava em cada divisão (os nomes de Lucas 3.1), na mesma ordem da legenda. */
const PODERES: Poder[] = [
  { match: /Judeia/, quem: 'Pôncio Pilatos, governador romano', onde: 'A sede era Cesareia, no litoral' },
  { match: /Galileia/, quem: 'Herodes Antipas, tetrarca', onde: 'Fundou Tiberíades, junto ao lago' },
  { match: /Pereia/, quem: 'Herodes Antipas, tetrarca', onde: 'Do outro lado do Jordão' },
  { match: /Filipe/, quem: 'Filipe, tetrarca', onde: 'Itureia e Traconites (Lc 3.1)' },
  { match: /Decápolis/, quem: 'Cidades de cultura grega', onde: 'Citada em Marcos 7.31' },
];

@Component({
  selector: 'app-passion-regioes',
  imports: [MatIconModule, BibleMapView],
  template: `
    <figure class="ctx">
      <figcaption class="head"><mat-icon>public</mat-icon> Quem mandava em cada região</figcaption>
      <div class="frame tall">
        <app-bible-map [map]="map" [era]="era" [nearby]="false" [focus]="focus" />
      </div>
      <ul class="key rules" aria-label="Quem mandava em cada região">
        @for (r of regioes; track r.nome) {
          <li><i class="sw" [style.background]="r.cor"></i><span><b>{{ r.nome }}</b>: {{ r.quem }}. <span class="muted">{{ r.onde }}.</span></span></li>
        }
      </ul>
      <p class="note">Todos eles respondiam a Tibério César, em Roma (Lucas 3.1). Fronteiras aproximadas, para estudo. Litoral: Natural Earth (domínio público).</p>
    </figure>
  `,
  styleUrl: './passion-contexto.scss',
})
export class PassionRegioes {
  protected readonly map = REGIOES_MAP;
  protected readonly era = REGIOES;
  protected readonly focus = REGIOES_FOCUS;
  protected readonly regioes = REGIOES.powers.map((p) => {
    const poder = PODERES.find((x) => x.match.test(p.name));
    return { nome: p.name.replace(/\s*\(.*\)$/, ''), cor: p.color, quem: poder?.quem ?? '', onde: poder?.onde ?? '' };
  });
}

// ── Quem respondia a quem ──────────────────────────────────────────────────
@Component({
  selector: 'app-passion-poder',
  template: `
    <figure class="poder">
      <figcaption>
        <p class="eyebrow">As autoridades na Paixão</p>
        <h3 class="head">Quem respondia a quem</h3>
      </figcaption>
      <p class="intro">Roma no topo; dois governos locais com poderes diferentes.</p>

      <ul class="legend" aria-label="Tipos de ligação">
        <li><span class="line command" aria-hidden="true"></span>Comando</li>
        <li><span class="line political" aria-hidden="true"></span>Vínculo político</li>
        <li><span class="line influence" aria-hidden="true"></span>Influência</li>
      </ul>

      <div class="node emperor">
        <span class="imperial-seal" aria-hidden="true">T</span>
        <div>
          <p class="tag">Imperador de Roma</p>
          <p class="node-title"><strong>Tibério César</strong></p>
        </div>
      </div>

      <ul class="branches" aria-label="Autoridades políticas sob Roma">
        <li class="judea">
          <p class="relation political">Administração romana</p>
          <div class="node leader">
            <p class="tag"><span class="territory-dot" aria-hidden="true"></span>Judeia · Jerusalém</p>
            <p class="node-title"><strong>Pôncio Pilatos</strong></p>
            <p>Governador da Judeia. Presta contas a César.</p>
          </div>

          <ul class="local-branches" aria-label="Autoridade de Pilatos na Judeia">
            <li>
              <p class="relation command">Comanda pelos oficiais</p>
              <div class="node subordinate military">
                <p class="node-title"><strong>Soldados do governador</strong></p>
                <p>Executam as ordens de Pilatos.</p>
              </div>
            </li>
            <li class="temple">
              <p class="relation political">Controle romano do cargo</p>
              <div class="node subordinate">
                <p class="tag">Templo · Jerusalém</p>
                <p class="node-title"><strong>Caifás</strong></p>
                <p>Sumo sacerdote em exercício.</p>
              </div>
              <ul class="temple-branches" aria-label="Autoridades locais ligadas ao templo">
                <li>
                  <p class="relation command">Preside o conselho</p>
                  <div class="node leaf">
                    <p class="node-title"><strong>Sinédrio</strong></p>
                    <p>Sacerdotes, anciãos e escribas.</p>
                  </div>
                </li>
                <li>
                  <p class="relation command">Autoridades sacerdotais dirigem</p>
                  <div class="node leaf">
                    <p class="node-title"><strong>Guarda do templo</strong></p>
                    <p>Força ligada ao templo.</p>
                  </div>
                </li>
              </ul>
              <aside class="annas">
                <p class="influence-label"><span class="line influence" aria-hidden="true"></span>Influência sobre Caifás</p>
                <p class="node-title"><strong>Anás</strong></p>
                <p>Ex-sumo sacerdote e sogro de Caifás.</p>
              </aside>
            </li>
          </ul>
        </li>
        <li class="antipas">
          <p class="relation political">Governo aliado de Roma</p>
          <div class="node leader">
            <p class="tag"><span class="territory-dot" aria-hidden="true"></span>Galileia e Pereia</p>
            <p class="node-title"><strong>Herodes Antipas</strong></p>
            <p>Tetrarca. Responde a Roma.</p>
          </div>
          <ul class="local-branches" aria-label="Autoridade de Herodes Antipas">
            <li>
              <p class="relation command">Comanda</p>
              <div class="node subordinate">
                <p class="node-title"><strong>Soldados de Antipas</strong></p>
                <p>Servem ao tetrarca.</p>
              </div>
            </li>
          </ul>
          <p class="independent"><b>Governo próprio.</b> Antipas não era subordinado a Pilatos.</p>
        </li>
      </ul>

      <aside class="regional">
        <p class="regional-label">Supervisão regional</p>
        <p><strong>Governador da Síria:</strong> autoridade romana com legiões e poder de intervenção na Judeia.</p>
      </aside>
      <p class="takeaway"><span class="takeaway-mark" aria-hidden="true" data-nolisten>→</span><span><b>Na Paixão, a decisão sobre a execução foi levada a Pilatos.</b></span></p>
      <!-- As fontes ficam fora da narração, como as demais bibliografias do leitor. -->
      <details class="sources context-details">
        <summary>Entenda os vínculos e veja as fontes <span aria-hidden="true">+</span></summary>
        <div class="context-body">
          <p><b>Governador ou prefeito?</b> Pilatos governava a Judeia; seu título romano era prefeito da Judeia, registrado na inscrição de Cesareia. Aqui, prefeito designa o governante romano do território e não um prefeito municipal.</p>
          <p><b>Quem coordenava Jerusalém?</b> Muitos assuntos internos da comunidade judaica eram conduzidos pelo sumo sacerdote Caifás e pelo Sinédrio. A autoridade superior romana, militar e judicial, permanecia com Pilatos. Não havia uma prefeitura equivalente à brasileira.</p>
          <p><b>Caifás e Roma.</b> O cargo de sumo sacerdote estava sujeito à nomeação e destituição pelas autoridades romanas. Isso era controle político; o conselho e a guarda do templo tinham funções próprias.</p>
          <p><b>Anás.</b> Já não ocupava o cargo, mas conservava influência. João relata que Jesus foi levado primeiro a ele e depois enviado a Caifás (João 18.13, 24).</p>
          <p><b>Síria.</b> Mais tarde, Vitélio mandou Pilatos a Roma para responder ao imperador. Esse episódio, posterior à Paixão, mostra o poder de intervenção regional.</p>
          <p><b>A execução.</b> No relato de João, as autoridades sacerdotais levam Jesus a Pilatos para obter a execução (João 18.28–31; 19.16).</p>
          <p class="credit">Base: Lucas 3.1–2; 22.52, 66; 23.7–12; Mateus 26.57–66; 27.27; João 7.32, 45; 18.13, 24; Josefo, <i>Antiguidades Judaicas</i> 17.317–318; 18.33–35, 88–95; 20.251; inscrição de Pilatos, de Cesareia Marítima.</p>
        </div>
      </details>
    </figure>
  `,
  styleUrl: './passion-poder.scss',
})
export class PassionPoder {}
