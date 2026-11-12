import { Component, input } from '@angular/core';

@Component({
  selector: 'app-passion-neuro',
  host: { 'aria-hidden': 'true', '[class.paused]': '!playing()' },
  template: `
    <svg viewBox="0 0 1086 1448" focusable="false">
      <g class="circulation" fill="none" stroke-linecap="round" stroke-linejoin="round">
        @for (vessel of vessels; track $index) {
          <g [class.vein]="vessel.vein">
            <path class="vessel-shadow" [attr.d]="vessel.path" [attr.stroke-width]="vessel.width + 2" />
            <path class="vessel-body" [attr.d]="vessel.path" [attr.stroke-width]="vessel.width" />
            <path class="vessel-light" [attr.d]="vessel.path" [attr.stroke-width]="vessel.width / 3" />
            <path class="blood-flow" [attr.d]="vessel.path" [attr.stroke-width]="vessel.width * .6" [style.animation-delay.s]="-$index * .37" />
          </g>
        }
      </g>
      <g fill="none" stroke-linecap="round">
        <path class="track" d="M509 1296 L518 990 Q523 866 517 784 Q510 715 465 673 Q415 631 390 555 Q369 492 411 414 Q460 330 581 286" />
        <path class="impulse" d="M509 1296 L518 990 Q523 866 517 784 Q510 715 465 673 Q415 631 390 555 Q369 492 411 414 Q460 330 581 286" />
        <path class="response" d="M581 286 Q682 304 708 398 Q727 474 679 543 Q620 624 539 723 L531 983" />
      </g>
    </svg>
    <span class="signal-caption"><span class="blood-key">Sangue nos vasos</span><span class="nerve-key">Impulsos nervosos</span><small>Fluxo e sinais ilustrativos</small></span>
  `,
  styles: `
    :host { position:absolute; inset:0; display:block; pointer-events:none; overflow:hidden; }
    svg { display:block; width:100%; height:100%; }
    .vessel-shadow { stroke:#361016; opacity:.55; }
    .vessel-body { stroke:#831e2b; }
    .vessel-light { stroke:#cb7268; opacity:.65; }
    .blood-flow { stroke:#df5756; stroke-dasharray:22 78; opacity:.9; animation:blood-flow 4.8s linear infinite; }
    .vein .vessel-body { stroke:#522032; }
    .vein .vessel-light { stroke:#ac6677; opacity:.5; }
    .vein .blood-flow { stroke:#ad4357; animation-direction:reverse; animation-duration:6.4s; }
    .track { stroke:#493629; stroke-width:5; opacity:.45; }
    .impulse { stroke:#ffe0a0; stroke-width:5; stroke-dasharray:10 105; animation:afferent 4s linear infinite; }
    .response { stroke:#ffc4a0; stroke-width:4; stroke-dasharray:9 135; animation:afferent 5s linear reverse infinite; opacity:.8; }
    .signal-caption { position:absolute; bottom:8px; left:8px; right:8px; display:flex; flex-wrap:wrap; gap:3px 12px; padding:6px 7px; background:#151b1eeb; color:#f2e3d1; font:500 13px/1.5 Inter,sans-serif; }
    .signal-caption > span::before { content:''; display:inline-block; vertical-align:middle; width:14px; height:3px; margin-right:5px; border-radius:2px; background:#cf5b65; }
    .signal-caption > .nerve-key::before { background:#ffe0a0; }
    .signal-caption small { flex-basis:100%; color:#d0c8bd; font-size:13px; }
    :host.paused * { animation-play-state:paused !important; }
    @keyframes afferent { to { stroke-dashoffset:-680; } }
    @keyframes blood-flow { to { stroke-dashoffset:-400; } }
  `,
})
export class PassionNeuro {
  readonly playing = input(true);
  // Rede ilustrativa ajustada à silhueta da prancha; não é uma angiografia.
  protected readonly vessels = [
    { path: 'M483 707 C475 650 448 622 407 581 S360 515 370 467 Q384 423 423 400 C474 370 505 330 511 281 Q516 237 554 199', width: 7, vein: false },
    { path: 'M408 581 Q344 589 291 551 Q247 524 230 468 Q212 426 233 384', width: 5, vein: false },
    { path: 'M372 469 Q316 456 309 405 Q298 359 321 319 L346 284', width: 4, vein: false },
    { path: 'M425 400 Q423 351 388 327 Q365 302 381 263', width: 3, vein: false },
    { path: 'M495 329 Q553 355 586 327 Q617 301 622 262 Q628 216 676 201', width: 4, vein: false },
    { path: 'M585 327 Q650 372 705 357 Q752 344 776 299', width: 3, vein: false },
    { path: 'M479 658 Q549 640 577 604 C600 565 633 544 691 533 Q760 519 791 471 Q823 429 860 414', width: 6, vein: false },
    { path: 'M693 533 Q699 489 674 455 Q653 429 669 395', width: 3, vein: false },
    { path: 'M792 471 Q805 511 842 526 L874 539', width: 3, vein: false },
    { path: 'M535 816 Q542 774 584 739 Q627 707 691 697 Q751 683 800 711', width: 4, vein: false },
    { path: 'M625 717 Q683 747 735 739 L788 753', width: 2, vein: false },
    { path: 'M509 1253 Q518 1117 513 979 Q512 886 535 816', width: 3, vein: false },
    { path: 'M285 507 Q281 431 339 395 Q395 357 423 293 Q441 242 475 210', width: 4, vein: true },
    { path: 'M555 607 Q600 528 578 459 Q561 417 597 371 Q646 322 656 242', width: 4, vein: true },
    { path: 'M734 593 Q789 574 820 611 Q845 630 852 658', width: 3, vein: true },
  ];
}
