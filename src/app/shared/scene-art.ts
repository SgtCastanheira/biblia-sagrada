import { Component, computed, input } from '@angular/core';
import { Scene, SceneObject } from '../core/scenes';

/**
 * Desenho de uma cena: paisagem e até três objetos (arca, cruz, estrela, pomba, chama…), nas cores do app.
 * Cores fixas e suaves, como numa ilustração de livro: funciona igual no claro e no escuro.
 */
@Component({
  selector: 'app-scene-art',
  template: `
    <svg [attr.viewBox]="box()" role="img" [attr.aria-label]="label()" preserveAspectRatio="xMidYMid slice">
      @switch (scene().setting) {
        @case ('noite') { <rect width="240" height="140" fill="#263447" /><rect y="70" width="240" height="70" fill="#3b4d63" opacity=".55" />
          <circle cx="196" cy="30" r="13" fill="#f3ecd2" /><circle cx="201" cy="26" r="11" fill="#263447" />
          <g fill="#f3ecd2"><circle cx="30" cy="22" r="1.6" /><circle cx="70" cy="40" r="1.2" /><circle cx="110" cy="16" r="1.8" /><circle cx="150" cy="36" r="1.2" /><circle cx="52" cy="60" r="1.2" /><circle cx="170" cy="62" r="1.5" /></g>
          <path d="M0 112 Q70 92 140 110 T240 106 V140 H0Z" fill="#35493f" /> }
        @case ('ceu') { <rect width="240" height="140" fill="#f3e3b8" /><rect y="60" width="240" height="80" fill="#fff3d4" opacity=".7" />
          <g stroke="#e8b95a" stroke-width="3" opacity=".45"><path d="M120 -10 L30 140 M120 -10 L75 140 M120 -10 L120 140 M120 -10 L165 140 M120 -10 L210 140" /></g>
          <g fill="#fff"><ellipse cx="46" cy="34" rx="26" ry="10" /><ellipse cx="62" cy="28" rx="18" ry="10" /><ellipse cx="190" cy="40" rx="28" ry="11" /><ellipse cx="172" cy="34" rx="16" ry="9" /></g> }
        @default { <rect width="240" height="140" fill="#cfe3d6" /><rect y="64" width="240" height="76" fill="#f3ead3" opacity=".8" />
          @if (scene().setting !== 'mar' && scene().setting !== 'monte') { <circle cx="196" cy="32" r="14" fill="#e8b95a" /> } }
      }
      @switch (scene().setting) {
        @case ('deserto') { <path d="M0 100 Q60 72 120 100 T240 96 V140 H0Z" fill="#e3c58a" /><path d="M0 120 Q80 96 160 120 T240 114 V140 H0Z" fill="#d2ad6c" /> }
        @case ('campo') { <path d="M0 104 Q70 72 140 100 T240 92 V140 H0Z" fill="#9bbd9f" /><path d="M0 122 Q90 100 180 120 T240 116 V140 H0Z" fill="#7da588" /> }
        @case ('mar') { <circle cx="196" cy="34" r="14" fill="#e8b95a" /><rect y="88" width="240" height="52" fill="#7ea6b8" />
          <g fill="none" stroke="#e7f1f4" stroke-width="2" opacity=".8"><path d="M10 104 q10 -8 20 0 t20 0 t20 0" /><path d="M120 118 q10 -8 20 0 t20 0 t20 0" /><path d="M170 100 q10 -8 20 0 t20 0" /></g> }
        @case ('monte') { <path d="M0 122 L72 36 L146 122Z" fill="#a8a395" /><path d="M96 122 L168 52 L240 122Z" fill="#8e9a8e" /><path d="M60 52 L72 36 L84 52 L76 48 L72 54 L68 48Z" fill="#fff" /><path d="M156 66 L168 52 L180 66 L172 62 L168 68 L164 62Z" fill="#fff" /><path d="M0 120 Q80 108 160 120 T240 118 V140 H0Z" fill="#9bbd9f" /> }
        @case ('cidade') { <rect x="30" y="82" width="180" height="40" fill="#c9b894" /><g fill="#c9b894"><rect x="30" y="76" width="12" height="8" /><rect x="52" y="76" width="12" height="8" /><rect x="74" y="76" width="12" height="8" /><rect x="96" y="76" width="12" height="8" /><rect x="118" y="76" width="12" height="8" /><rect x="140" y="76" width="12" height="8" /><rect x="162" y="76" width="12" height="8" /><rect x="184" y="76" width="12" height="8" /></g>
          <rect x="14" y="58" width="30" height="64" fill="#b8a77f" /><rect x="196" y="58" width="30" height="64" fill="#b8a77f" /><path d="M14 58 L29 44 L44 58Z M196 58 L211 44 L226 58Z" fill="#a8654b" /><path d="M0 120 Q100 112 240 120 V140 H0Z" fill="#b9a479" /> }
        @case ('templo') { <path d="M0 122 Q100 114 240 122 V140 H0Z" fill="#b9a479" /><rect x="36" y="108" width="168" height="12" fill="#d8c79c" /><rect x="46" y="96" width="148" height="12" fill="#e6d8b4" />
          <g fill="#f6efdc" stroke="#cdbb90"><rect x="56" y="52" width="14" height="44" /><rect x="86" y="52" width="14" height="44" /><rect x="113" y="52" width="14" height="44" /><rect x="140" y="52" width="14" height="44" /><rect x="170" y="52" width="14" height="44" /></g><path d="M46 52 L120 22 L194 52Z" fill="#d8c79c" stroke="#cdbb90" /> }
        @case ('jardim') { <path d="M0 108 Q80 88 160 106 T240 100 V140 H0Z" fill="#9bbd9f" /><path d="M0 124 Q100 106 240 122 V140 H0Z" fill="#7da588" />
          <g><rect x="30" y="64" width="8" height="40" fill="#8a6a47" /><circle cx="34" cy="56" r="22" fill="#6d9a7b" /><rect x="200" y="70" width="8" height="34" fill="#8a6a47" /><circle cx="204" cy="62" r="18" fill="#7da588" /></g> }
        @case ('casa') { <path d="M0 112 Q90 100 240 112 V140 H0Z" fill="#9bbd9f" /><rect x="38" y="70" width="52" height="42" fill="#e6d8b4" stroke="#b8a37a" /><path d="M32 72 L64 44 L96 72Z" fill="#a8654b" /><rect x="58" y="92" width="12" height="20" fill="#8a6a47" /><rect x="76" y="80" width="10" height="10" fill="#cfe3d6" /> }
      }
      @for (o of scene().objects; track $index) {
        <g [attr.transform]="slot($index)">
          @switch (o) {
            @case ('arca') { <path d="M-34 0 L34 0 L26 14 L-26 14Z" fill="#8a6a47" /><rect x="-14" y="-18" width="28" height="18" fill="#a9825a" /><path d="M-18 -18 L0 -30 L18 -18Z" fill="#7a5a3a" /><rect x="-4" y="-12" width="8" height="8" fill="#e7f1f4" /> }
            @case ('arco-iris') { <g fill="none" stroke-width="5" opacity=".9"><path d="M-44 24 A44 44 0 0 1 44 24" stroke="#c0705a" /><path d="M-38 24 A38 38 0 0 1 38 24" stroke="#e8b95a" /><path d="M-32 24 A32 32 0 0 1 32 24" stroke="#9bbd9f" /><path d="M-26 24 A26 26 0 0 1 26 24" stroke="#7ea6b8" /></g> }
            @case ('cruz') { <rect x="-4" y="-36" width="8" height="64" fill="#8a6a47" /><rect x="-20" y="-22" width="40" height="8" fill="#8a6a47" /> }
            @case ('estrela') { <polygon points="0,-22 6,-7 22,-7 9,3 14,19 0,10 -14,19 -9,3 -22,-7 -6,-7" fill="#e8b95a" stroke="#c99a4a" /> }
            @case ('pergaminho') { <rect x="-24" y="-16" width="48" height="32" rx="3" fill="#f3ead3" stroke="#b8a37a" /><ellipse cx="-24" cy="0" rx="4" ry="16" fill="#e6d8b4" stroke="#b8a37a" /><ellipse cx="24" cy="0" rx="4" ry="16" fill="#e6d8b4" stroke="#b8a37a" /><g stroke="#b8a37a"><path d="M-16 -8 H16 M-16 -1 H16 M-16 6 H10" /></g> }
            @case ('coroa') { <path d="M-22 14 L-26 -10 L-11 2 L0 -18 L11 2 L26 -10 L22 14Z" fill="#e8b95a" stroke="#c99a4a" stroke-width="2" /><circle cx="0" cy="-18" r="3" fill="#c0705a" /> }
            @case ('pomba') { <ellipse cx="0" cy="2" rx="18" ry="9" fill="#fbf7ee" stroke="#b8b0a0" /><path d="M-4 0 Q-16 -22 -30 -14 Q-12 -10 4 4Z" fill="#fff" stroke="#b8b0a0" /><circle cx="17" cy="-6" r="6" fill="#fbf7ee" stroke="#b8b0a0" /><path d="M22 -6 L29 -4 L22 -3Z" fill="#e8b95a" /><path d="M-18 4 L-30 12 L-16 8Z" fill="#fbf7ee" stroke="#b8b0a0" /> }
            @case ('chama') { <path d="M0 -26 C16 -8 16 8 0 18 C-16 8 -16 -8 0 -26Z" fill="#e08a3c" /><path d="M0 -10 C8 -2 8 6 0 12 C-8 6 -8 -2 0 -10Z" fill="#f3c35a" /> }
            @case ('ovelha') { <g fill="#fbf7ee" stroke="#c9c0ae"><circle cx="-8" cy="0" r="10" /><circle cx="4" cy="-4" r="11" /><circle cx="14" cy="2" r="9" /><circle cx="0" cy="6" r="10" /></g><circle cx="24" cy="2" r="6" fill="#4a4a42" /><path d="M-6 14 V22 M8 14 V22" stroke="#4a4a42" stroke-width="3" /> }
            @case ('pessoas') { <g><circle cx="-22" cy="-6" r="6" fill="#e8c9a0" /><rect x="-29" y="1" width="14" height="22" rx="6" fill="#6d9a7b" /><circle cx="0" cy="-10" r="7" fill="#e8c9a0" /><rect x="-8" y="-2" width="16" height="26" rx="7" fill="#e8b95a" /><circle cx="22" cy="-6" r="6" fill="#e8c9a0" /><rect x="15" y="1" width="14" height="22" rx="6" fill="#b5654b" /></g> }
            @case ('coracao') { <path d="M0 16 C-28 -4 -14 -24 0 -8 C14 -24 28 -4 0 16Z" fill="#b5654b" /> }
            @case ('livro') { <path d="M-28 -12 L0 -6 L0 18 L-28 12Z" fill="#f3ead3" stroke="#8a6a47" /><path d="M28 -12 L0 -6 L0 18 L28 12Z" fill="#fbf4e2" stroke="#8a6a47" /><g stroke="#b8a37a"><path d="M-22 -4 L-6 0 M-22 3 L-6 7 M22 -4 L6 0 M22 3 L6 7" /></g> }
            @case ('maos') { <g fill="#e8c9a0" stroke="#b8956a"><ellipse cx="-7" cy="0" rx="7" ry="18" transform="rotate(14 -7 0)" /><ellipse cx="7" cy="0" rx="7" ry="18" transform="rotate(-14 7 0)" /></g> }
            @case ('lampada') { <path d="M-18 8 Q0 22 18 8 L12 -2 H-12Z" fill="#c9a85f" stroke="#8a6a47" /><path d="M12 -2 L22 -6" stroke="#8a6a47" stroke-width="3" /><path d="M0 -4 C6 -12 6 -18 0 -26 C-6 -18 -6 -12 0 -4Z" fill="#f3c35a" /> }
            @case ('barco') { <path d="M-30 6 L30 6 L22 20 L-22 20Z" fill="#8a6a47" /><rect x="-1" y="-26" width="3" height="32" fill="#7a5a3a" /><path d="M2 -26 L24 2 L2 2Z" fill="#fbf4e2" stroke="#b8a37a" /> }
            @case ('tenda') { <path d="M-30 16 L0 -24 L30 16Z" fill="#c9a85f" stroke="#8a6a47" /><path d="M0 -24 L-8 16 H8Z" fill="#8a6a47" /> }
            @case ('arvore') { <rect x="-4" y="-2" width="8" height="26" fill="#8a6a47" /><circle cx="0" cy="-14" r="20" fill="#6d9a7b" /><circle cx="-8" cy="-10" r="3" fill="#b5654b" /><circle cx="8" cy="-18" r="3" fill="#b5654b" /> }
            @case ('paes') { <ellipse cx="-12" cy="6" rx="16" ry="9" fill="#d9a85f" stroke="#a8753a" /><ellipse cx="10" cy="0" rx="16" ry="9" fill="#e2b56a" stroke="#a8753a" /><path d="M-22 -10 Q-6 -22 8 -12 Q-6 -6 -22 -10Z M8 -12 L16 -18 L16 -6Z" fill="#7ea6b8" /> }
            @case ('cajado') { <path d="M0 24 V-18 Q0 -34 -14 -30 Q-22 -26 -18 -18" fill="none" stroke="#8a6a47" stroke-width="5" stroke-linecap="round" /> }
            @case ('trigo') { <g stroke="#c9a85f" stroke-width="3" fill="#e2b56a"><path d="M-14 24 V-6 M0 24 V-14 M14 24 V-6" /><ellipse cx="-14" cy="-10" rx="4" ry="9" /><ellipse cx="0" cy="-18" rx="4" ry="9" /><ellipse cx="14" cy="-10" rx="4" ry="9" /></g> }
            @case ('muro') { <rect x="-30" y="-6" width="60" height="26" fill="#b8a77f" /><g fill="#b8a77f"><rect x="-30" y="-14" width="10" height="8" /><rect x="-10" y="-14" width="10" height="8" /><rect x="10" y="-14" width="10" height="8" /></g> }
            @case ('luz') { <circle cx="0" cy="0" r="16" fill="#f3d58a" opacity=".55" /><circle cx="0" cy="0" r="8" fill="#fff3d4" /><g stroke="#e8b95a" stroke-width="2.5" stroke-linecap="round"><path d="M0 -26 V-20 M0 20 V26 M-26 0 H-20 M20 0 H26 M-18 -18 L-14 -14 M14 14 L18 18 M18 -18 L14 -14 M-14 14 L-18 18" /></g> }
          }
        </g>
      }
    </svg>
  `,
  styles: `
    :host { display: block; }
    svg { display: block; width: 100%; height: 100%; border-radius: inherit; }
  `,
})
export class SceneArt {
  readonly scene = input.required<Scene>();
  /** Descrição para leitores de tela. */
  readonly description = input('');
  /** Recorte: inteira, em faixa larga (2,4:1) ou na capa (3:1). Os objetos ficam sempre à vista. */
  readonly fit = input<'full' | 'banner' | 'cover'>('full');
  protected readonly box = computed(() => ({ full: '0 0 240 140', banner: '0 40 240 100', cover: '0 52 240 80' })[this.fit()]);
  protected readonly label = computed(() => this.description() || `Ilustração: ${this.scene().setting}, com ${this.scene().objects.join(' e ')}`);

  protected slot(i: number): string {
    const slots = ['translate(120 92)', 'translate(60 100)', 'translate(182 100)'];
    return slots[i] ?? slots[0];
  }
}

export type { SceneObject };
