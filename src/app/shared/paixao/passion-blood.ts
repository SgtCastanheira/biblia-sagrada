import { Component, input } from '@angular/core';

let nextBloodPlate = 0;

@Component({
  selector: 'app-passion-blood',
  host: { 'aria-hidden': 'true', '[class.paused]': '!playing()' },
  template: `
    <svg viewBox="0 0 1448 1086" preserveAspectRatio="xMidYMid meet" focusable="false">
      <defs>
        <linearGradient [attr.id]="filmId" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#43030a" />
          <stop offset=".42" stop-color="#9e0716" />
          <stop offset=".68" stop-color="#d32b32" />
          <stop offset="1" stop-color="#58010c" />
        </linearGradient>
        <radialGradient [attr.id]="dropId" cx=".34" cy=".25" r=".8">
          <stop offset="0" stop-color="#f89485" />
          <stop offset=".2" stop-color="#c2242b" />
          <stop offset=".6" stop-color="#8a0614" />
          <stop offset="1" stop-color="#39010a" />
        </radialGradient>
      </defs>
      <!-- Coordinates follow the existing 1448 × 1086 teaching plate. -->
      <g class="vessels" fill="none" stroke-linecap="round">
        <path class="vessel-flow" d="M224 697 C289 678 335 651 381 677 S527 677 616 656 S734 617 779 618 C804 580 796 552 803 512 S813 438 839 400 S891 354 931 360" />
        <path class="vessel-flow branch" d="M1054 373 C1111 342 1188 327 1240 301 S1302 260 1347 265" />
      </g>
      @if (bleeding()) {
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path class="wound-bed" d="M1183 76 C1149 93 1119 119 1103 150 S1062 214 1047 248 S1034 292 1008 330 S985 383 961 418 S942 454 929 477" />
        <path class="wound-film" [attr.stroke]="'url(#' + filmId + ')'" d="M1183 76 C1149 93 1119 119 1103 150 S1062 214 1047 248 S1034 292 1008 330 S985 383 961 418 S942 454 929 477" />
        <path class="wet-edge" d="M1106 153 C1085 186 1062 218 1050 251 M1009 330 Q990 366 982 388 M957 425 L942 452" />
        <path class="seep seep-one" [attr.stroke]="'url(#' + filmId + ')'" d="M1044 264 C1040 286 1034 313 1021 338 S1007 366 1005 380" pathLength="100" />
        <path class="seep seep-two" [attr.stroke]="'url(#' + filmId + ')'" d="M979 386 C979 407 980 431 981 451 S982 474 979 487" pathLength="100" />
      </g>
      @for (drop of drops; track $index) {
        <g [attr.transform]="'translate(' + drop.x + ' ' + drop.y + ')'">
          <g class="blood-drop" [style.--delay]="drop.delay" [style.--dx]="drop.dx" [style.--dy]="drop.dy">
            <path d="M0 -10 C-1 -3 -8 3 -8 10 C-8 22 9 23 9 10 C9 4 2 -3 0 -10Z" [attr.fill]="'url(#' + dropId + ')'" />
            <ellipse cx="-2" cy="7" rx="1.5" ry="4" fill="#ffd5c4" opacity=".55" />
          </g>
        </g>
      }
      }
    </svg>
  `,
  styleUrl: './passion-blood.scss',
})
export class PassionBlood {
  readonly playing = input(true);
  readonly bleeding = input(true);
  private readonly plateId = nextBloodPlate++;
  protected readonly filmId = 'paixao-sangue-filme-' + this.plateId;
  protected readonly dropId = 'paixao-sangue-gota-' + this.plateId;
  protected readonly drops = [
    { x: 1071, y: 218, dx: '-35px', dy: '83px', delay: '-1.1s' },
    { x: 1036, y: 290, dx: '-36px', dy: '90px', delay: '-3.2s' },
    { x: 1006, y: 354, dx: '-39px', dy: '90px', delay: '-2.1s' },
    { x: 979, y: 435, dx: '2px', dy: '66px', delay: '-.3s' },
  ];
}
