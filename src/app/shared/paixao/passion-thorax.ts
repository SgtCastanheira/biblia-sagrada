import { Component, input } from '@angular/core';

let nextThorax = 0;

@Component({
  selector: 'app-passion-thorax',
  host: { 'aria-hidden': 'true', '[class.paused]': '!playing()' },
  template: `
    <svg viewBox="0 0 1122 1402" preserveAspectRatio="xMidYMid meet" focusable="false">
      <defs>
        <clipPath [attr.id]="prefix + 'heart'"><path d="M582 505 C643 501 690 566 718 682 C752 788 725 871 652 929 C584 918 521 850 491 772 C469 700 484 606 530 554Z" /></clipPath>
        <clipPath [attr.id]="prefix + 'right-lung'"><path d="M433 326 C368 275 296 341 269 433 C244 528 231 708 247 826 C258 906 294 936 347 925 C418 889 452 846 466 798 C434 719 443 613 485 545 C485 447 468 367 433 326Z" /></clipPath>
        <clipPath [attr.id]="prefix + 'left-lung'"><path d="M714 307 C781 270 851 321 887 408 C927 520 938 710 912 882 C901 950 866 982 819 948 C782 920 760 887 747 842 C762 733 740 607 672 548 C662 449 675 357 714 307Z" /></clipPath>
        <clipPath [attr.id]="prefix + 'diaphragm'"><path d="M230 1036 C348 927 505 918 659 965 C776 1004 864 1014 931 1086 L891 1140 C727 1069 474 1084 263 1157Z" /></clipPath>
      </defs>
      <g class="lung lung-right" [attr.clip-path]="'url(#' + prefix + 'right-lung)'"><image href="conteudo/imagens/paixao-anatomia-torax.webp" width="1122" height="1402" /></g>
      <g class="lung lung-left" [attr.clip-path]="'url(#' + prefix + 'left-lung)'"><image href="conteudo/imagens/paixao-anatomia-torax.webp" width="1122" height="1402" /></g>
      <g class="diaphragm" [attr.clip-path]="'url(#' + prefix + 'diaphragm)'"><image href="conteudo/imagens/paixao-anatomia-torax.webp" width="1122" height="1402" /></g>
      <g class="heart" [attr.clip-path]="'url(#' + prefix + 'heart)'"><image href="conteudo/imagens/paixao-anatomia-torax.webp" width="1122" height="1402" /></g>
      <g class="airways" fill="none" stroke-linecap="round">
        <path class="air-track" d="M543 170 L543 421 Q541 462 490 489 L384 563" />
        <path class="air-track" d="M543 421 Q561 461 610 486 L768 568" />
      </g>
    </svg>
    <span class="physiology-tag">FISIOLOGIA NORMAL</span>
    <div class="breath-label"><span class="inspiration">Inspiração · expansão pulmonar</span><span class="expiration">Expiração · retorno elástico</span></div>
  `,
  styleUrl: './passion-thorax.scss',
})
export class PassionThorax {
  readonly playing = input(true);
  protected readonly prefix = 'paixao-anatomia-torax-movimento-' + nextThorax++ + '-';
}
