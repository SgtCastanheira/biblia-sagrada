import { Component, input } from '@angular/core';
import { CalendarArt } from './calendar-art';
import { TanakhShelf } from './tanakh-shelf';

/**
 * Ilustrações desenhadas pelo app para os estudos (":::figura id" no texto).
 * São SVG com as cores do tema, para funcionar no claro, no escuro e sem internet.
 */
@Component({
  selector: 'app-figure',
  imports: [TanakhShelf, CalendarArt],
  template: `
    @switch (id()) {
      @case ('biblia-judaica') { <app-tanakh-shelf /> }
      @case ('visao-joao-9') {
        <svg viewBox="0 0 360 350" role="img" aria-label="Diagrama da visão: a luz passa pela córnea e pelo cristalino, chega à retina, e sinais seguem pelo nervo óptico ao cérebro. O relato de João 9 não identifica a causa médica da cegueira">
          <defs>
            <linearGradient id="vision-bg" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stop-color="var(--mat-sys-primary)" stop-opacity=".1" />
              <stop offset="1" stop-color="var(--accent-gold)" stop-opacity=".16" />
            </linearGradient>
            <marker id="vision-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M0 0 L10 5 L0 10Z" fill="var(--accent-gold)" />
            </marker>
          </defs>
          <rect x="4" y="4" width="352" height="342" rx="24" fill="url(#vision-bg)" />
          <text x="180" y="31" class="label">O CAMINHO DA VISÃO</text>
          <text x="180" y="50" class="tiny">Esquema simplificado do funcionamento comum do olho</text>
          <g class="eye">
            <path d="M35 134 Q110 68 191 134 Q110 200 35 134Z" fill="var(--mat-sys-surface)" stroke="var(--mat-sys-primary)" stroke-width="3" />
            <path d="M43 134 Q58 102 78 94 Q69 133 78 174 Q57 165 43 134Z" fill="#8bc7dc" fill-opacity=".72" stroke="#4297c9" stroke-width="2" />
            <ellipse cx="108" cy="134" rx="15" ry="31" fill="#e1c170" fill-opacity=".8" stroke="#9b7541" stroke-width="2" />
            <circle cx="158" cy="134" r="13" fill="#7893a2" stroke="var(--mat-sys-on-surface-variant)" stroke-width="2" />
            <path d="M181 134 C198 134 196 148 213 148" fill="none" stroke="var(--mat-sys-primary)" stroke-width="8" stroke-linecap="round" />
            <path d="M43 134 H178" class="light-ray" />
            <circle cx="34" cy="134" r="6" class="light-particle" />
            <circle cx="158" cy="134" r="5" class="signal-particle" />
          </g>
          <g class="brain">
            <path d="M247 113 C237 94 259 83 274 91 C287 76 311 87 310 103 C330 108 328 130 315 137 C323 155 304 168 290 160 C275 176 252 164 255 148 C237 143 236 126 247 113Z" fill="color-mix(in srgb, var(--accent-gold) 25%, var(--mat-sys-surface))" stroke="var(--accent-gold)" stroke-width="2" />
            <path d="M268 96 Q255 108 270 119 M292 94 Q306 106 292 119 M260 139 Q276 126 282 143 M300 137 Q288 151 299 159" fill="none" stroke="var(--mat-sys-outline)" stroke-width="1.5" />
            <text x="284" y="188" class="tiny">cérebro</text>
          </g>
          <text x="52" y="220" class="small">Córnea</text>
          <text x="106" y="220" class="small">Cristalino</text>
          <text x="160" y="220" class="small">Retina</text>
          <path d="M42 228 H183" class="label-line" />
          <text x="180" y="251" class="tiny">Luz → sinais elétricos → cérebro</text>
          <rect x="20" y="270" width="320" height="54" rx="14" class="caption-box" />
          <text x="180" y="290" class="label">JOÃO 9 NÃO DÁ UM DIAGNÓSTICO</text>
          <text x="180" y="309" class="tiny">Não sabemos qual estrutura ou causa foi envolvida.</text>
        </svg>
      }
      @case ('corpo-e-vida-lucas-7') {
        <svg viewBox="0 0 360 340" role="img" aria-label="Esquema didático da respiração, circulação e funcionamento dos órgãos. Lucas 7 não apresenta dados clínicos para reconstruir a morte ou o sinal em Naim">
          <defs>
            <marker id="naim-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M0 0 L10 5 L0 10Z" fill="var(--accent-gold)" />
            </marker>
          </defs>
          <rect x="4" y="4" width="352" height="332" rx="24" fill="color-mix(in srgb, var(--mat-sys-primary) 8%, var(--mat-sys-surface))" />
          <text x="180" y="31" class="label">RESPIRAÇÃO E CIRCULAÇÃO</text>
          <text x="180" y="51" class="tiny">O funcionamento comum do corpo vivo</text>
          <g class="naim-lungs">
            <path d="M75 91 V132 M75 112 L57 133 M75 112 L93 133" fill="none" stroke="var(--mat-sys-outline)" stroke-width="5" stroke-linecap="round" />
            <path d="M66 110 C49 111 42 129 44 154 C46 171 62 174 72 158 L72 119Z" fill="#8bc7dc" fill-opacity=".72" stroke="#4297c9" stroke-width="2" />
            <path d="M84 110 C101 111 108 129 106 154 C104 171 88 174 78 158 L78 119Z" fill="#8bc7dc" fill-opacity=".72" stroke="#4297c9" stroke-width="2" />
          </g>
          <path d="M113 140 H143" class="naim-flow" />
          <g class="naim-heart">
            <path d="M180 164 C167 153 149 143 149 127 C149 113 167 109 180 124 C193 109 211 113 211 127 C211 143 193 153 180 164Z" fill="color-mix(in srgb, #ba6262 70%, var(--mat-sys-surface))" stroke="#9e4f50" stroke-width="2" />
          </g>
          <path d="M218 140 H248" class="naim-flow" />
          <g class="naim-brain">
            <path d="M266 123 C258 111 273 102 282 109 C292 98 308 107 306 119 C320 124 316 140 307 144 C311 158 295 165 286 158 C275 167 260 158 264 147 C253 143 255 130 266 123Z" fill="color-mix(in srgb, var(--accent-gold) 25%, var(--mat-sys-surface))" stroke="var(--accent-gold)" stroke-width="2" />
            <path d="M277 112 Q270 121 280 128 M293 111 Q302 120 293 128 M270 140 Q281 132 285 144 M301 140 Q293 149 300 154" fill="none" stroke="var(--mat-sys-outline)" stroke-width="1.5" />
          </g>
          <circle cx="115" cy="140" r="4" class="naim-oxygen" />
          <circle cx="220" cy="140" r="4" class="naim-oxygen naim-oxygen-late" />
          <text x="75" y="194" class="small">PULMÕES</text>
          <text x="180" y="194" class="small">CORAÇÃO</text>
          <text x="285" y="194" class="small">CÉREBRO</text>
          <text x="180" y="223" class="tiny">O sangue transporta oxigênio aos órgãos.</text>
          <rect x="20" y="255" width="320" height="57" rx="14" class="caption-box" />
          <text x="180" y="276" class="label">LUCAS NÃO TRAZ UM PRONTUÁRIO</text>
          <text x="180" y="296" class="tiny">O esquema não reconstrói o que ocorreu em Naim.</text>
        </svg>
      }
      @case ('tempestade-acalmada') {
        <svg viewBox="0 0 360 340" role="img" aria-label="Ilustração simbólica da tempestade acalmada: vento e ondas agitadas diminuem e o mar fica tranquilo, como narram Mateus, Marcos e Lucas">
          <defs>
            <linearGradient id="storm-sky" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stop-color="var(--mat-sys-primary)" stop-opacity=".08" />
              <stop offset="1" stop-color="#28718e" stop-opacity=".2" />
            </linearGradient>
            <linearGradient id="storm-sea" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stop-color="#4f9fc1" stop-opacity=".42" />
              <stop offset="1" stop-color="#28718e" stop-opacity=".7" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="352" height="332" rx="24" fill="url(#storm-sky)" />
          <text x="180" y="30" class="label">MATEUS 8 · MARCOS 4 · LUCAS 8</text>
          <text x="180" y="50" class="tiny">“Quem é este, que até o vento e o mar lhe obedecem?”</text>
          <g class="wind-lines">
            <path d="M37 91 C76 67 114 111 150 87 S220 72 249 91" />
            <path d="M55 111 C87 91 120 126 148 107" />
            <path d="M232 72 C258 56 283 74 308 62" />
          </g>
          <path d="M18 146 Q48 128 78 146 T138 146 T198 146 T258 146 T318 146 T378 146 V279 H18Z" fill="url(#storm-sea)" />
          <g class="storm-waves">
            <path d="M18 146 Q48 128 78 146 T138 146 T198 146 T258 146 T318 146 T378 146" />
            <path d="M18 174 Q48 157 78 174 T138 174 T198 174 T258 174 T318 174 T378 174" />
            <path d="M18 202 Q48 186 78 202 T138 202 T198 202 T258 202 T318 202 T378 202" />
          </g>
          <g class="calm-waves">
            <path d="M18 175 Q48 169 78 175 T138 175 T198 175 T258 175 T318 175 T378 175" />
            <path d="M18 197 Q48 191 78 197 T138 197 T198 197 T258 197 T318 197 T378 197" />
            <path d="M18 219 Q48 213 78 219 T138 219 T198 219 T258 219 T318 219 T378 219" />
          </g>
          <g class="boat">
            <path d="M127 166 H232 L216 188 H145Z" fill="#9b7541" stroke="#573f28" stroke-width="2" />
            <path d="M179 164 V118 M179 121 L211 156 H179Z" fill="var(--mat-sys-surface)" stroke="var(--mat-sys-primary)" stroke-width="2" />
            <circle cx="159" cy="158" r="5" class="disciple" />
            <circle cx="180" cy="156" r="5" class="disciple" />
            <circle cx="201" cy="158" r="5" class="disciple" />
          </g>
          <text x="180" y="249" class="small storm-label">VENTO E ONDAS AGITADAS</text>
          <text x="180" y="249" class="small calm-label">“GRANDE BONANÇA”</text>
          <rect x="20" y="278" width="320" height="43" rx="14" class="caption-box" />
          <text x="180" y="297" class="label">O TEXTO NÃO EXPLICA O MECANISMO</text>
          <text x="180" y="313" class="tiny">Animação simbólica, não meteorológica.</text>
        </svg>
      }
      @case ('multiplicacao-paes') {
        <svg viewBox="0 0 360 365" role="img" aria-label="Infográfico simbólico: cinco pães e dois peixes diante da multidão de cinco mil homens; os Evangelhos contam que Jesus deu graças, partiu e distribuiu o alimento até todos comerem">
          <defs>
            <linearGradient id="bread-sky" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stop-color="var(--mat-sys-primary)" stop-opacity=".08" />
              <stop offset="1" stop-color="var(--accent-gold)" stop-opacity=".16" />
            </linearGradient>
            <marker id="bread-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M0 0 L10 5 L0 10Z" fill="var(--accent-gold)" />
            </marker>
          </defs>
          <rect x="4" y="4" width="352" height="357" rx="24" fill="url(#bread-sky)" />
          <text x="180" y="31" class="label">O SINAL DOS PÃES E DOS PEIXES</text>
          <text x="180" y="50" class="tiny">Mt 14 · Mc 6 · Lc 9 · Jo 6</text>
          <g class="crowd">
            @for (person of crowd; track $index) {
              <circle [attr.cx]="person.x" [attr.cy]="person.y" r="4" class="crowd-head" />
              <path [attr.d]="'M' + person.x + ' ' + (person.y + 5) + ' v9'" class="crowd-body" />
            }
          </g>
          <text x="180" y="110" class="small">5.000 homens contados</text>
          <text x="180" y="126" class="tiny">além de mulheres e crianças, segundo Mateus</text>
          <path d="M180 141 V164" class="distribution-arrow" marker-end="url(#bread-arrow)" />
          <g class="basket">
            <path d="M83 250 Q180 230 277 250 L265 301 Q180 317 95 301Z" fill="color-mix(in srgb, var(--accent-gold) 22%, var(--mat-sys-surface))" stroke="var(--accent-gold)" stroke-width="2" />
            <path d="M95 264 H265 M100 279 H260 M106 294 H254" stroke="var(--accent-gold)" stroke-opacity=".65" stroke-width="2" />
            <path d="M120 248 Q180 224 240 248" fill="none" stroke="var(--mat-sys-outline)" stroke-width="3" />
            <text x="180" y="282" class="label">TODOS COMERAM</text>
            <text x="180" y="299" class="tiny">e ainda recolheram sobras</text>
          </g>
          <g class="starter-food">
            @for (loaf of loaves; track $index) {
              <g [attr.transform]="'translate(' + loaf.x + ' ' + loaf.y + ')'">
                <rect x="-15" y="-8" width="30" height="16" rx="8" class="loaf" />
                <path d="M-5 -5 Q-2 0 -5 5 M4 -5 Q7 0 4 5" class="bread-mark" />
              </g>
            }
            <path d="M142 205 Q158 194 173 205 Q158 216 142 205Z M187 205 Q203 194 218 205 Q203 216 187 205Z" class="fish" />
            <path d="M142 205 l-6 -5 v10Z M187 205 l-6 -5 v10Z" class="fish-tail" />
          </g>
          <text x="180" y="235" class="tiny">5 pães + 2 peixes</text>
          <text x="180" y="333" class="label">O RELATO NÃO DESCREVE UM PROCESSO FÍSICO</text>
          <text x="180" y="350" class="tiny">Animação simbólica; não é uma reconstrução.</text>
        </svg>
      }
      @case ('jesus-sobre-as-aguas') {
        <svg viewBox="0 0 360 360" role="img" aria-label="Comparação ilustrativa entre uma pessoa sustentada pela água ao ficar parcialmente submersa e Jesus caminhando sobre a superfície no relato dos Evangelhos; a animação não propõe um mecanismo">
          <defs>
            <linearGradient id="walk-water" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stop-color="#4f9fc1" stop-opacity=".24" />
              <stop offset="1" stop-color="#28718e" stop-opacity=".7" />
            </linearGradient>
            <marker id="walk-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M0 0 L10 5 L0 10Z" fill="var(--accent-gold)" />
            </marker>
          </defs>
          <rect x="4" y="4" width="352" height="352" rx="24" fill="color-mix(in srgb, var(--mat-sys-primary) 8%, var(--mat-sys-surface))" />
          <text x="180" y="31" class="label">FÍSICA COMUM E RELATO BÍBLICO</text>
          <path d="M20 155 Q50 147 80 155 T140 155 T200 155 T260 155 T320 155 T380 155 V292 H20Z" fill="url(#walk-water)" />
          <path d="M20 155 Q50 147 80 155 T140 155 T200 155 T260 155 T320 155 T380 155" fill="none" stroke="#4297c9" stroke-width="3" />
          <g class="ordinary-person">
            <circle cx="92" cy="112" r="13" class="person-head" />
            <path d="M92 127 V178 M92 140 L71 160 M92 140 L110 159 M92 178 L76 205 M92 178 L107 204" class="person-body" />
            <path d="M62 164 Q92 157 120 164" fill="none" stroke="#f1d9a8" stroke-width="3" />
          </g>
          <path d="M52 136 V111" class="buoyancy" marker-end="url(#walk-arrow)" />
          <text x="92" y="222" class="small">FÍSICA COMUM</text>
          <text x="92" y="239" class="tiny">a água sustenta o corpo</text>
          <text x="92" y="254" class="tiny">quando ele desloca água</text>
          <g class="walking-person">
            <circle cx="260" cy="91" r="13" class="person-head" />
            <path d="M260 106 V157 M260 120 L240 140 M260 120 L281 137 M260 157 L244 181 M260 157 L284 174" class="person-body" />
            <path d="M240 183 Q260 188 284 176" class="step-glow" />
          </g>
          <text x="260" y="222" class="small">NOS EVANGELHOS</text>
          <text x="260" y="239" class="tiny">Jesus caminha sobre</text>
          <text x="260" y="254" class="tiny">a superfície (Mt 14)</text>
          <path d="M26 274 Q58 267 90 274 T154 274 T218 274 T282 274 T346 274" fill="none" stroke="#82c7d8" stroke-opacity=".7" stroke-width="2" class="ripple" />
          <rect x="20" y="294" width="320" height="45" rx="14" class="caption-box" />
          <text x="180" y="313" class="label">O TEXTO NÃO EXPLICA O MECANISMO</text>
          <text x="180" y="330" class="tiny">A animação é simbólica, não uma reconstrução.</text>
        </svg>
      }
      @case ('machado-flutuando') {
        <svg viewBox="0 0 360 330" role="img" aria-label="Representação simbólica: uma cabeça de machado de ferro desce na água e depois aparece flutuando, como no relato de 2 Reis 6">
          <defs>
            <linearGradient id="machado-water" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stop-color="#4f9fc1" stop-opacity=".3" />
              <stop offset="1" stop-color="#28718e" stop-opacity=".62" />
            </linearGradient>
            <marker id="machado-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M0 0 L10 5 L0 10Z" fill="var(--accent-gold)" />
            </marker>
          </defs>
          <rect x="4" y="4" width="352" height="322" rx="24" fill="color-mix(in srgb, var(--mat-sys-primary) 8%, var(--mat-sys-surface))" />
          <text x="180" y="31" class="label">2 REIS 6.1–7</text>
          <text x="180" y="52" class="sub">O que a física prevê em condições comuns</text>
          <path d="M22 124 Q50 116 78 124 T134 124 T190 124 T246 124 T302 124 T358 124 V281 H22Z" fill="url(#machado-water)" />
          <path d="M22 124 Q50 116 78 124 T134 124 T190 124 T246 124 T302 124 T358 124" fill="none" stroke="#4297c9" stroke-width="3" />
          <text x="180" y="105" class="tiny">SUPERFÍCIE DA ÁGUA</text>
          <g class="falling-head">
            <path d="M153 83 L199 83 L209 96 L198 108 L154 108Z" fill="#cbd4d8" stroke="#39434a" stroke-width="2.5" />
            <path d="M155 108 L174 128" stroke="#9b7541" stroke-width="9" stroke-linecap="round" />
            <path d="M160 88 H194" stroke="#fff" stroke-opacity=".8" stroke-width="2" />
          </g>
          <g class="floating-head">
            <path d="M153 112 L199 112 L209 125 L198 137 L154 137Z" fill="#cbd4d8" stroke="#39434a" stroke-width="2.5" />
            <path d="M155 112 L174 92" stroke="#9b7541" stroke-width="9" stroke-linecap="round" />
            <path d="M160 117 H194" stroke="#fff" stroke-opacity=".8" stroke-width="2" />
          </g>
          <g class="sunk-head">
            <path d="M153 236 L199 236 L209 249 L198 261 L154 261Z" fill="#cbd4d8" stroke="#39434a" stroke-width="2.5" />
            <path d="M155 261 L174 281" stroke="#9b7541" stroke-width="9" stroke-linecap="round" />
            <path d="M160 241 H194" stroke="#fff" stroke-opacity=".8" stroke-width="2" />
          </g>
          <path d="M225 154 V218" class="force-arrow" marker-end="url(#machado-arrow)" />
          <text x="245" y="180" class="small start">peso do ferro</text>
          <text x="245" y="197" class="tiny start">maior que o empuxo</text>
          <text x="180" y="297" class="label">NA NARRATIVA: “O FERRO FLUTUOU”</text>
          <text x="180" y="314" class="tiny">Animação simbólica — não mostra como ocorreu.</text>
        </svg>
      }
      @case ('cana-quimica') {
        <svg viewBox="0 0 360 430" role="img" aria-label="Infográfico: a água é H dois O e não contém carbono. Na fermentação comum, glicose e levedura produzem etanol e gás carbônico. João narra água transformada em vinho, mas não descreve o mecanismo">
          <defs>
            <linearGradient id="cana-backdrop" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stop-color="var(--mat-sys-primary)" stop-opacity=".16" />
              <stop offset="1" stop-color="var(--accent-gold)" stop-opacity=".2" />
            </linearGradient>
            <linearGradient id="cana-wine" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stop-color="#b44b68" />
              <stop offset="1" stop-color="#681e3b" />
            </linearGradient>
            <marker id="cana-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10Z" fill="var(--accent-gold)" />
            </marker>
          </defs>
          <rect x="4" y="4" width="352" height="422" rx="24" fill="url(#cana-backdrop)" />
          <text x="180" y="32" class="label">DUAS PERGUNTAS DIFERENTES</text>
          <g class="node">
            <rect x="18" y="48" width="150" height="126" rx="18" />
            <text x="93" y="73" class="label">ÁGUA</text>
            <path d="M92 78 C82 93 69 107 69 120 A24 24 0 0 0 117 120 C117 107 104 93 92 78Z" fill="#4297c9" />
            <text x="93" y="157" class="formula">H₂O</text>
            <text x="93" y="170" class="tiny">0 átomos de carbono</text>
          </g>
          <g class="node">
            <rect x="192" y="48" width="150" height="126" rx="18" />
            <text x="267" y="73" class="label">VINHO</text>
            <path class="water-state" d="M247 91 H287 L282 122 Q280 133 267 137 Q254 133 252 122Z" fill="#4297c9" />
            <path class="wine-state" d="M247 91 H287 L282 122 Q280 133 267 137 Q254 133 252 122Z" fill="url(#cana-wine)" />
            <path d="M251 112 H283" stroke="#f1d9a8" stroke-opacity=".8" stroke-width="2" />
            <path d="M267 137 V146 M253 149 H281" fill="none" stroke="var(--mat-sys-on-surface-variant)" stroke-width="3" stroke-linecap="round" />
            <text x="267" y="165" class="tiny">mistura: água, etanol…</text>
          </g>
          <text x="180" y="198" class="section-label">COMO O VINHO SE FORMA EM CONDIÇÕES COMUNS</text>
          <g class="process">
            <rect x="18" y="214" width="102" height="52" rx="14" />
            <text x="69" y="235" class="small">Açúcar da uva</text>
            <text x="69" y="254" class="formula-small">C₆H₁₂O₆</text>
            <path d="M124 240 H151" class="arrow" />
            <rect x="154" y="214" width="74" height="52" rx="14" />
            <text x="191" y="235" class="small">Levedura</text>
            <text x="191" y="254" class="tiny">fermentação</text>
            <path d="M232 240 H258" class="arrow" />
            <rect x="261" y="214" width="81" height="52" rx="14" />
            <text x="301" y="235" class="small">Produtos</text>
            <text x="301" y="254" class="tiny">etanol + CO₂</text>
          </g>
          <text x="180" y="287" class="equation">C₆H₁₂O₆ → 2 C₂H₆O + 2 CO₂</text>
          <text x="180" y="305" class="tiny">A equação resume a fermentação alcoólica.</text>
          <g class="story-box">
            <rect x="18" y="323" width="324" height="84" rx="18" />
            <text x="180" y="348" class="label">E EM CANÁ? (JOÃO 2.1–11)</text>
            <text x="180" y="373" class="story-text">Água → vinho: João chama de sinal.</text>
            <text x="180" y="392" class="tiny">Animação simbólica; sem mecanismo químico.</text>
          </g>
        </svg>
      }
      @case ('calendario-outubro-1582') { <app-calendar-art kind="outubro-1582" /> }
      @case ('calendario-meses-romanos') { <app-calendar-art kind="meses-romanos" /> }
      @case ('calendario-ano-judaico') { <app-calendar-art kind="ano-judaico" /> }
      @case ('calendario-natal-13-dias') { <app-calendar-art kind="natal-13-dias" /> }
      @case ('calendario-ano-2026') { <app-calendar-art kind="ano-2026" /> }
      @case ('tsc-plano') {
        <svg viewBox="0 0 340 352" role="img" aria-label="O plano da Teologia Sistemático-Carismática: a primeira parte tem dois capítulos de método e a segunda tem oito capítulos de doutrina; o do Espírito Santo vem logo depois do de Deus">
          <text x="170" y="20" class="label">PRIMEIRA PARTE</text>
          <text x="170" y="38" class="sub">questões teórico-metodológicas</text>
          <g class="node"><rect x="8" y="46" width="160" height="64" rx="10" />
            <text x="88" y="65" class="year">Capítulo 1</text><text x="88" y="82" class="sub">O porquê de uma</text><text x="88" y="99" class="sub">teologia carismática</text></g>
          <g class="node"><rect x="172" y="46" width="160" height="64" rx="10" />
            <text x="252" y="65" class="year">Capítulo 2</text><text x="252" y="82" class="sub">Da experiência de fé</text><text x="252" y="99" class="sub">à teologia sistemática</text></g>
          <text x="170" y="138" class="label">SEGUNDA PARTE</text>
          <text x="170" y="156" class="sub">análises doutrinárias</text>
          @for (d of tscDoctrines; track d.n; let i = $index) {
            <g class="node" [class.key]="d.n === 4">
              <rect [attr.x]="8 + (i % 2) * 164" [attr.y]="166 + floor(i / 2) * 46" width="160" height="38" rx="10" />
              <text [attr.x]="88 + (i % 2) * 164" [attr.y]="182 + floor(i / 2) * 46" class="year">{{ d.n }} · {{ d.name }}</text>
              <text [attr.x]="88 + (i % 2) * 164" [attr.y]="197 + floor(i / 2) * 46" class="sub">{{ d.about }}</text>
            </g>
          }
        </svg>
      }
      @case ('tsc-historia') {
        <svg viewBox="0 0 340 268" role="img" aria-label="A experiência com o Espírito Santo ao longo da história: Antigo Testamento, Novo Testamento, primeiros séculos da Igreja e hoje">
          <g class="links"><path d="M36 34 V234" /></g>
          @for (s of tscSteps; track s.title; let i = $index) {
            <g class="place"><circle cx="36" [attr.cy]="34 + i * 66" r="9" /></g>
            <text x="62" [attr.y]="30 + i * 66" class="year start">{{ s.title }}</text>
            <text x="62" [attr.y]="50 + i * 66" class="sub start">{{ s.text }}</text>
          }
        </svg>
      }
      @case ('ad-arvore') {
        <svg viewBox="0 0 340 618" role="img" aria-label="Árvore das Assembleias de Deus no Brasil, de 1911 até hoje">
          <g class="links">
            <path d="M170 74 V104 M170 152 V182 M170 230 V252 H88 V272 M170 252 H252 V272 M252 336 V366" />
            <path class="dashed" d="M88 336 V478 M252 430 V478" />
            <path d="M170 542 V560" />
          </g>
          <g class="node key"><rect x="40" y="10" width="260" height="64" rx="12" />
            <text x="170" y="32" class="year">1911 · Belém (PA)</text>
            <text x="170" y="50">Missão da Fé Apostólica</text>
            <text x="170" y="66" class="sub">Gunnar Vingren e Daniel Berg</text></g>
          <g class="node"><rect x="40" y="104" width="260" height="48" rx="12" />
            <text x="170" y="125" class="year">1918 · Assembleia de Deus</text>
            <text x="170" y="142" class="sub">a igreja é registrada com o novo nome</text></g>
          <g class="node"><rect x="40" y="182" width="260" height="48" rx="12" />
            <text x="170" y="203" class="year">1924 · Rio de Janeiro</text>
            <text x="170" y="220" class="sub">Vingren pastoreia em São Cristóvão</text></g>
          <g class="node"><rect x="10" y="272" width="156" height="64" rx="12" />
            <text x="88" y="294" class="year">1930 · CGADB</text>
            <text x="88" y="311">Convenção Geral</text>
            <text x="88" y="327" class="sub">1ª assembleia em Natal</text></g>
          <g class="node madureira"><rect x="174" y="272" width="156" height="64" rx="12" />
            <text x="252" y="294" class="year">1929 · Madureira</text>
            <text x="252" y="311">Ministério</text>
            <text x="252" y="327" class="sub">no subúrbio do Rio</text></g>
          <g class="node madureira"><rect x="174" y="366" width="156" height="64" rx="12" />
            <text x="252" y="388" class="year">1958 · Convenção</text>
            <text x="252" y="405">de Madureira</text>
            <text x="252" y="421" class="sub">hoje CONAMAD</text></g>
          <g class="node event"><rect x="20" y="478" width="300" height="64" rx="12" />
            <text x="170" y="500" class="year">1989 · Assembleia em Salvador</text>
            <text x="170" y="517">Madureira deixa a CGADB</text>
            <text x="170" y="533" class="sub">e a CONAMAD segue independente</text></g>
          <g class="node key"><rect x="20" y="560" width="300" height="52" rx="12" />
            <text x="170" y="582">Hoje: “Missão” (CGADB e CADB)</text>
            <text x="170" y="600">e “Madureira” (CONAMAD)</text></g>
        </svg>
      }
      @case ('frida-caminho') {
        <svg viewBox="0 0 340 320" role="img" aria-label="O caminho de Frida Vingren: da Suécia a Belém, ao Rio de Janeiro e de volta à Suécia">
          <g class="region"><rect x="186" y="8" width="146" height="128" rx="18" /><text x="259" y="30" class="label">SUÉCIA</text></g>
          <g class="region"><rect x="8" y="150" width="170" height="162" rx="18" /><text x="93" y="172" class="label">BRASIL</text></g>
          <g class="links">
            <path class="route" d="M232 100 C 150 80, 120 120, 92 198" />
            <path d="M92 210 V262" />
            <path class="route back" d="M96 274 C 190 300, 246 230, 246 110" />
          </g>
          <text x="152" y="96" class="year">1917</text>
          <text x="102" y="242" class="year">1924</text>
          <text x="276" y="214" class="year">1932</text>
          <g class="place"><circle cx="270" cy="52" r="6" /><text x="270" y="72" class="sub">Själevad · 1891</text></g>
          <g class="place"><circle cx="246" cy="100" r="7" /><text x="258" y="105" class="sub start">Estocolmo</text></g>
          <g class="place"><circle cx="92" cy="204" r="7" /><text x="106" y="209" class="sub start">Belém</text></g>
          <g class="place"><circle cx="92" cy="268" r="7" /><text x="78" y="294" class="sub">Rio de Janeiro</text></g>
        </svg>
      }
      @case ('duas-maos') {
        <svg viewBox="0 0 340 330" role="img" aria-label="O que a igreja e o Estado levam para a cidade">
          <g class="node key"><rect x="6" y="8" width="158" height="206" rx="14" />
            <text x="85" y="34" class="label">IGREJA</text>
            <text x="85" y="52" class="sub">forma a comunidade</text></g>
          <g class="node madureira"><rect x="176" y="8" width="158" height="206" rx="14" />
            <text x="255" y="34" class="label">ESTADO</text>
            <text x="255" y="52" class="sub">constrói a estrutura</text></g>
          @for (t of churchGives; track t; let i = $index) {
            <circle class="dot gold" cx="22" [attr.cy]="80 + i * 27" r="4" />
            <text x="32" [attr.y]="85 + i * 27" class="start">{{ t }}</text>
          }
          @for (t of stateGives; track t; let i = $index) {
            <circle class="dot" cx="192" [attr.cy]="80 + i * 27" r="4" />
            <text x="202" [attr.y]="85 + i * 27" class="start">{{ t }}</text>
          }
          <g class="links"><path d="M85 214 C 85 244, 150 238, 160 262 M255 214 C 255 244, 190 238, 180 262" /></g>
          <g class="node event"><rect x="60" y="262" width="220" height="60" rx="14" />
            <text x="170" y="286" class="year">A CIDADE</text>
            <text x="170" y="306">comunidade + estrutura</text></g>
        </svg>
      }
      @case ('cidade-capela') {
        <svg viewBox="0 0 340 568" role="img" aria-label="Como uma cidade do interior nascia em volta da capela, em quatro etapas">
          <defs>
            <g id="fig-capela"><rect class="bldg chapel" x="-22" y="-40" width="44" height="40" /><polygon class="roof" points="-27,-40 0,-61 27,-40" />
              <rect class="door" x="-6" y="-18" width="12" height="18" /><path class="cross" d="M0 -76 V-61 M-6 -70 H6" /></g>
            <g id="fig-casa"><rect class="bldg" x="-11" y="-18" width="22" height="18" /><polygon class="roof" points="-14,-18 0,-30 14,-18" /></g>
            <g id="fig-arvore"><path class="trunk" d="M0 0 V-14" /><circle class="tree" cy="-24" r="11" /></g>
            <g id="fig-camara"><polygon class="roof" points="-31,-34 0,-47 31,-34" /><rect class="bldg" x="-27" y="-34" width="54" height="34" />
              <path class="cols" d="M-17 -30 V-3 M-6 -30 V-3 M6 -30 V-3 M17 -30 V-3" /></g>
            <g id="fig-escola"><rect class="bldg" x="-25" y="-28" width="50" height="28" /><path class="pole" d="M20 -28 V-52" /><polygon class="flag" points="20,-52 33,-47 20,-42" />
              <rect class="win" x="-18" y="-20" width="9" height="9" /><rect class="win" x="-4" y="-20" width="9" height="9" /></g>
            <g id="fig-poste"><path class="pole" d="M0 0 V-58 M-9 -52 H9" /></g>
            <g id="fig-caixa"><path class="pole" d="M-8 0 L-5 -36 M8 0 L5 -36" /><rect class="bldg" x="-12" y="-54" width="24" height="18" rx="3" /></g>
          </defs>
          @for (p of cityStages; track p.title; let i = $index) {
            <g [attr.transform]="'translate(0 ' + i * 140 + ')'">
              <rect class="panel" x="4" y="4" width="332" height="132" rx="14" />
              <text x="18" y="26" class="year start">{{ i + 1 }} · {{ p.title }}</text>
              <text x="18" y="44" class="sub start">{{ p.text }}</text>
              @if (i >= 2) { <rect class="road" [class.asphalt]="i === 3" x="14" y="124" width="312" height="7" rx="2" /> }
              <path class="ground" d="M14 124 H326" />
              @if (i === 3) { <path class="wire" d="M264 68 Q 277 76 290 68" /> }
              @for (e of p.items; track $index) {
                <use [attr.href]="'#fig-' + e[0]" [attr.x]="e[1]" y="124" />
              }
            </g>
          }
        </svg>
      }
      @case ('linhagem-de-davi') {
        <svg viewBox="0 0 340 440" role="img" aria-label="A casa de Davi e quem mandava em Jerusalém, de 586 a.C. ao nascimento de Jesus: a linhagem de Davi segue com Jeconias e Zorobabel, mas sem trono, enquanto a cidade é governada por babilônios, persas, gregos, asmoneus, romanos e Herodes">
          <text x="88" y="18" class="label">CASA DE DAVI</text>
          <text x="252" y="18" class="label">QUEM MANDAVA</text>
          @for (r of davidRows; track r.year; let i = $index) {
            @if (i < davidRows.length - 1) {
              <g class="links">
                <path [class.dashed]="i > 0" [attr.d]="'M88 ' + (90 + i * 68) + ' V' + (114 + i * 68)" />
                <path [attr.d]="'M252 ' + (90 + i * 68) + ' V' + (114 + i * 68)" />
              </g>
            }
            <text x="170" [attr.y]="40 + i * 68" class="year">{{ r.year }}</text>
            <g class="node key"><rect x="8" [attr.y]="46 + i * 68" width="160" height="44" rx="10" />
              <text x="88" [attr.y]="64 + i * 68">{{ r.house[0] }}</text><text x="88" [attr.y]="81 + i * 68" class="sub">{{ r.house[1] }}</text></g>
            <g class="node"><rect x="172" [attr.y]="46 + i * 68" width="160" height="44" rx="10" />
              <text x="252" [attr.y]="64 + i * 68">{{ r.ruler[0] }}</text><text x="252" [attr.y]="81 + i * 68" class="sub">{{ r.ruler[1] }}</text></g>
          }
        </svg>
      }
      @case ('berg-vingren-viagem') {
        <svg viewBox="0 0 340 330" role="img" aria-label="A viagem de Gunnar Vingren e Daniel Berg: da Suécia aos Estados Unidos e de Nova York a Belém do Pará">
          <g class="region"><rect x="8" y="8" width="186" height="150" rx="18" /><text x="101" y="30" class="label">ESTADOS UNIDOS</text></g>
          <g class="region"><rect x="214" y="8" width="118" height="120" rx="18" /><text x="273" y="30" class="label">SUÉCIA</text></g>
          <g class="region"><rect x="96" y="196" width="236" height="126" rx="18" /><text x="214" y="218" class="label">BRASIL</text></g>
          <g class="links">
            <path class="route" d="M262 72 C 220 56, 110 56, 52 72" />
            <path d="M48 82 C 66 112, 104 124, 150 116" />
            <path class="route back" d="M158 122 C 200 150, 230 200, 210 262" />
          </g>
          <text x="200" y="50" class="year">1902–1903</text>
          <text x="248" y="186" class="year">nov. 1910</text>
          <g class="place"><circle cx="268" cy="72" r="7" /><text x="273" y="96" class="sub">Östra Husby</text><text x="273" y="112" class="sub">e Vargön</text></g>
          <g class="place"><circle cx="46" cy="76" r="7" /><text x="60" y="94" class="sub start">Chicago e</text><text x="60" y="110" class="sub start">South Bend</text></g>
          <g class="place"><circle cx="154" cy="118" r="7" /><text x="140" y="144" class="sub">Nova York</text></g>
          <g class="place"><circle cx="208" cy="268" r="8" /><text x="224" y="273" class="sub start">Belém do Pará</text><text x="224" y="290" class="sub start">1910–1911</text></g>
        </svg>
      }
    }
  `,
  styles: `
    :host { display: block; }
    svg { display: block; width: 100%; max-width: 420px; height: auto; margin: 0 auto; }
    text { font-family: Inter, sans-serif; font-size: 13px; text-anchor: middle; fill: var(--mat-sys-on-surface); }
    .year { font-weight: 700; fill: var(--accent-gold); }
    .sub { fill: var(--mat-sys-on-surface-variant); }
    .start { text-anchor: start; }
    .label { font-weight: 700; letter-spacing: 2px; fill: var(--mat-sys-on-surface-variant); }
    .node rect { fill: var(--mat-sys-surface); stroke: var(--mat-sys-outline-variant); stroke-width: 1.5; }
    .node.key rect { stroke: var(--accent-gold); }
    .node.madureira rect { stroke: var(--mat-sys-primary); }
    .node.event rect { fill: color-mix(in srgb, var(--accent-gold) 12%, var(--mat-sys-surface)); stroke: var(--accent-gold); }
    .links path { fill: none; stroke: var(--mat-sys-outline); stroke-width: 2; }
    .links .dashed { stroke-dasharray: 6 5; }
    .links .route { stroke: var(--accent-gold); stroke-dasharray: 7 6; stroke-width: 2.5; }
    .links .back { stroke: var(--mat-sys-primary); }
    .region rect { fill: var(--mat-sys-surface-container); stroke: var(--mat-sys-outline-variant); }
    .place circle { fill: var(--mat-sys-primary); stroke: var(--mat-sys-surface); stroke-width: 2; }
    .dot { fill: var(--mat-sys-primary); }
    .dot.gold { fill: var(--accent-gold); }
    .panel { fill: var(--mat-sys-surface); stroke: var(--mat-sys-outline-variant); }
    .ground { stroke: var(--mat-sys-outline); stroke-width: 1.5; }
    .road { fill: color-mix(in srgb, var(--accent-gold) 30%, var(--mat-sys-surface)); }
    .road.asphalt { fill: var(--mat-sys-on-surface-variant); }
    .bldg { fill: var(--mat-sys-surface-container-high); stroke: var(--mat-sys-on-surface-variant); stroke-width: 1.2; }
    .bldg.chapel { fill: var(--mat-sys-surface); stroke: var(--accent-gold); stroke-width: 1.8; }
    .roof { fill: color-mix(in srgb, var(--accent-gold) 55%, var(--mat-sys-surface)); stroke: var(--accent-gold); stroke-width: 1.2; }
    .door, .win { fill: var(--mat-sys-on-surface-variant); }
    .cross, .pole, .cols, .trunk { fill: none; stroke: var(--mat-sys-on-surface-variant); stroke-width: 2; }
    .cross { stroke: var(--accent-gold); }
    .flag { fill: var(--mat-sys-primary); }
    .tree { fill: color-mix(in srgb, var(--mat-sys-primary) 45%, var(--mat-sys-surface)); }
    .wire { fill: none; stroke: var(--mat-sys-on-surface-variant); stroke-width: 1; }
    .formula { font-size: 19px; font-weight: 700; fill: var(--mat-sys-on-surface); }
    .formula-small { font-size: 13px; font-weight: 700; fill: var(--mat-sys-on-surface); }
    .small { font-size: 11px; font-weight: 600; }
    .tiny { font-size: 10px; fill: var(--mat-sys-on-surface-variant); }
    .section-label { font-size: 10px; font-weight: 700; letter-spacing: .5px; fill: var(--mat-sys-on-surface-variant); }
    .process rect, .story-box rect { fill: var(--mat-sys-surface); stroke: var(--mat-sys-outline-variant); stroke-width: 1.2; }
    .arrow { fill: none; stroke: var(--accent-gold); stroke-width: 2; marker-end: url(#cana-arrow); }
    .equation { font-size: 13px; font-weight: 700; fill: var(--mat-sys-primary); }
    .story-box rect { fill: color-mix(in srgb, var(--accent-gold) 12%, var(--mat-sys-surface)); stroke: var(--accent-gold); }
    .story-text { font-size: 13px; font-weight: 700; }
    .light-ray { stroke: #f0bf55; stroke-opacity: .55; stroke-width: 2; stroke-dasharray: 4 5; }
    .light-particle { fill: #f0bf55; filter: drop-shadow(0 0 4px #f0bf55); }
    .signal-particle { fill: var(--accent-gold); filter: drop-shadow(0 0 4px var(--accent-gold)); }
    .label-line { stroke: var(--mat-sys-outline-variant); stroke-width: 1; }
    .naim-flow { fill: none; stroke: var(--accent-gold); stroke-width: 2; marker-end: url(#naim-arrow); }
    .naim-heart { transform-box: fill-box; transform-origin: center; animation: naim-pulse 1.8s ease-in-out infinite; }
    .naim-oxygen { fill: var(--accent-gold); filter: drop-shadow(0 0 3px var(--accent-gold)); animation: naim-oxygen-flow 3.6s linear infinite; }
    .naim-oxygen-late { animation-delay: 1.8s; }
    @keyframes naim-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.06); }
    }
    @keyframes naim-oxygen-flow {
      0% { opacity: 0; transform: translateX(0); }
      15%, 65% { opacity: 1; }
      85%, 100% { opacity: 0; transform: translateX(96px); }
    }
    @media (prefers-reduced-motion: reduce) {
      .naim-heart, .naim-oxygen { animation: none; }
      .naim-heart { transform: none; }
    }
    .light-particle { animation: light-through-eye 3.8s ease-in-out infinite; }
    .signal-particle { animation: signal-to-brain 3.8s ease-in-out 1.8s infinite; }
    @keyframes light-through-eye {
      0%, 5% { opacity: 0; transform: translateX(0); }
      12%, 70% { opacity: 1; }
      78%, 100% { opacity: 0; transform: translateX(122px); }
    }
    @keyframes signal-to-brain {
      0%, 10% { opacity: 0; transform: translate(0, 0); }
      18%, 72% { opacity: 1; }
      84%, 100% { opacity: 0; transform: translate(54px, 14px); }
    }
    @media (prefers-reduced-motion: reduce) {
      .light-particle, .signal-particle { animation: none; display: none; }
    }
    .wind-lines path { fill: none; stroke: var(--mat-sys-on-surface-variant); stroke-width: 2; stroke-linecap: round; animation: gusts 5s ease-in-out infinite; }
    .wind-lines path:nth-child(2) { animation-delay: .2s; }
    .wind-lines path:nth-child(3) { animation-delay: .4s; }
    .storm-waves path { fill: none; stroke: #b6e2eb; stroke-opacity: .85; stroke-width: 3; stroke-linecap: round; transform-box: fill-box; transform-origin: center; animation: storm-wave 5s ease-in-out infinite; }
    .storm-waves path:nth-child(2) { animation-delay: .12s; }
    .storm-waves path:nth-child(3) { animation-delay: .24s; }
    .calm-waves path { fill: none; stroke: #d3edf0; stroke-opacity: .8; stroke-width: 2; animation: calm-sea 5s ease-in-out infinite; }
    .calm-waves path:nth-child(2) { animation-delay: .12s; }
    .calm-waves path:nth-child(3) { animation-delay: .24s; }
    .boat { transform-box: fill-box; transform-origin: center; animation: boat-motion 5s ease-in-out infinite; }
    .disciple { fill: var(--mat-sys-on-primary-container); stroke: var(--mat-sys-surface); stroke-width: 1.5; }
    .storm-label { animation: storm-copy 5s ease-in-out infinite; }
    .calm-label { opacity: 0; animation: calm-copy 5s ease-in-out infinite; }
    @keyframes gusts {
      0%, 12% { opacity: .9; transform: translateX(0); }
      45%, 100% { opacity: 0; transform: translateX(18px); }
    }
    @keyframes storm-wave {
      0%, 20% { opacity: .9; transform: scaleY(1); }
      45%, 100% { opacity: 0; transform: scaleY(.35); }
    }
    @keyframes calm-sea {
      0%, 36% { opacity: 0; }
      55%, 100% { opacity: .9; }
    }
    @keyframes boat-motion {
      0%, 25% { transform: translateY(0) rotate(-2deg); }
      50%, 100% { transform: translateY(0) rotate(0); }
      10% { transform: translateY(-5px) rotate(2deg); }
    }
    @keyframes storm-copy {
      0%, 40% { opacity: 1; }
      55%, 100% { opacity: 0; }
    }
    @keyframes calm-copy {
      0%, 45% { opacity: 0; }
      60%, 100% { opacity: 1; }
    }
    @media (prefers-reduced-motion: reduce) {
      .wind-lines path, .storm-waves path, .calm-waves path, .boat, .storm-label, .calm-label { animation: none; }
      .wind-lines path, .storm-waves path, .storm-label { opacity: 0; }
      .calm-waves path, .calm-label { opacity: 1; }
    }
    .crowd-head { fill: var(--mat-sys-primary); }
    .crowd-body { stroke: var(--mat-sys-primary); stroke-width: 3; stroke-linecap: round; }
    .distribution-arrow { fill: none; stroke: var(--accent-gold); stroke-width: 2; }
    .loaf { fill: color-mix(in srgb, #d79a45 72%, var(--mat-sys-surface)); stroke: #9b6530; stroke-width: 1.5; }
    .bread-mark { fill: none; stroke: #9b6530; stroke-width: 1.2; }
    .fish { fill: #819ba7; stroke: var(--mat-sys-on-surface-variant); stroke-width: 1.5; }
    .fish-tail { fill: #819ba7; }
    .starter-food { animation: bread-share 5s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
    @keyframes bread-share {
      0%, 12%, 100% { transform: translateY(0) scale(1); opacity: 1; }
      52%, 70% { transform: translateY(24px) scale(.86); opacity: .35; }
    }
    @media (prefers-reduced-motion: reduce) {
      .starter-food { animation: none; }
    }
    .person-head { fill: #9b7541; }
    .person-body { fill: none; stroke: #344957; stroke-width: 8; stroke-linecap: round; stroke-linejoin: round; }
    .buoyancy { fill: none; stroke: var(--accent-gold); stroke-width: 2; }
    .step-glow { fill: none; stroke: var(--accent-gold); stroke-width: 4; stroke-linecap: round; }
    .caption-box { fill: color-mix(in srgb, var(--accent-gold) 12%, var(--mat-sys-surface)); stroke: var(--accent-gold); }
    .walking-person { animation: walk-across 4s ease-in-out infinite; }
    .step-glow { animation: step-light 4s ease-in-out infinite; }
    .ripple { animation: ripple 4s ease-in-out infinite; }
    @keyframes walk-across {
      0%, 15% { transform: translateX(-8px); }
      65%, 85% { transform: translateX(8px); }
      100% { transform: translateX(-8px); }
    }
    @keyframes step-light {
      0%, 45%, 100% { opacity: .35; }
      55%, 75% { opacity: 1; }
    }
    @keyframes ripple {
      0%, 100% { opacity: .3; transform: translateX(0); }
      50% { opacity: .9; transform: translateX(5px); }
    }
    @media (prefers-reduced-motion: reduce) {
      .walking-person, .step-glow, .ripple { animation: none; }
    }
    .falling-head { animation: axe-fall 6s ease-in-out infinite; }
    .floating-head { opacity: 0; animation: axe-float 6s ease-in-out infinite; }
    .sunk-head { opacity: 0; animation: axe-sink 6s ease-in-out infinite; }
    .force-arrow { fill: none; stroke: var(--accent-gold); stroke-width: 2; }
    @keyframes axe-fall {
      0%, 8% { opacity: 1; transform: translateY(0); }
      30%, 64% { opacity: 0; transform: translateY(140px); }
      65%, 100% { opacity: 0; transform: translateY(140px); }
    }
    @keyframes axe-sink {
      0%, 25% { opacity: 0; }
      30%, 58% { opacity: 1; }
      66%, 100% { opacity: 0; }
    }
    @keyframes axe-float {
      0%, 50% { opacity: 0; transform: translateY(30px); }
      64%, 86% { opacity: 1; transform: translateY(0); }
      100% { opacity: 1; transform: translateY(0); }
    }
    @media (prefers-reduced-motion: reduce) {
      .falling-head, .sunk-head { display: none; }
      .floating-head { animation: none; opacity: 1; }
    }
    .water-state { animation: cana-water 5s ease-in-out infinite; }
    .wine-state { animation: cana-wine 5s ease-in-out infinite; }
    @keyframes cana-water { 0%, 12%, 88%, 100% { opacity: 1; } 48%, 56% { opacity: 0; } }
    @keyframes cana-wine { 0%, 12%, 88%, 100% { opacity: 0; } 48%, 56% { opacity: 1; } }
    @media (prefers-reduced-motion: reduce) {
      .water-state { animation: none; }
      .wine-state { animation: none; opacity: 1; }
    }
  `,
})
export class Figure {
  readonly id = input.required<string>();
  /** Os oito capítulos de doutrina da Teologia Sistemático-Carismática, na ordem da introdução geral. */
  protected readonly tscDoctrines = [
    { n: 3, name: 'Teologia', about: 'Deus' }, { n: 4, name: 'Pneumatologia', about: 'o Espírito Santo' },
    { n: 5, name: 'Cristologia', about: 'Jesus Cristo' }, { n: 6, name: 'Antropologia', about: 'o ser humano' },
    { n: 7, name: 'Hamartiologia', about: 'o pecado' }, { n: 8, name: 'Soteriologia', about: 'a salvação' },
    { n: 9, name: 'Eclesiologia', about: 'a Igreja' }, { n: 10, name: 'Escatologia', about: 'as últimas coisas' },
  ];
  protected readonly crowd = Array.from({ length: 28 }, (_, i) => ({
    x: 54 + (i % 7) * 42 + (Math.floor(i / 7) % 2) * 18,
    y: 68 + Math.floor(i / 7) * 13,
  }));
  protected readonly loaves = Array.from({ length: 5 }, (_, i) => ({
    x: 132 + i * 24,
    y: 183 + (i % 2) * 8,
  }));
  /** A casa de Davi e quem mandava em Jerusalém, linha a linha: [casa de Davi, quem mandava]. */
  protected readonly davidRows: { year: string; house: [string, string]; ruler: [string, string] }[] = [
    { year: '586 a.C.', house: ['Zedequias', 'último rei de Judá'], ruler: ['Babilônia', 'destrói o Templo'] },
    { year: '538 a.C.', house: ['Zorobabel', 'neto do rei Jeconias'], ruler: ['Persas', 'o Templo é refeito'] },
    { year: '333 a.C.', house: ['A linhagem continua', 'sem trono nem exército'], ruler: ['Gregos', 'Egito e Síria mandam'] },
    { year: '142 a.C.', house: ['Sem registros', 'na Bíblia hebraica'], ruler: ['Asmoneus', 'sacerdotes que viram reis'] },
    { year: '63 a.C.', house: ['Sem trono', 'a promessa continua'], ruler: ['Roma', 'Pompeu toma Jerusalém'] },
    { year: 'c. 5 a.C.', house: ['José e Maria', 'da casa de Davi'], ruler: ['Herodes', 'rei escolhido por Roma'] },
  ];
  protected floor(n: number): number {
    return Math.floor(n);
  }
  /** A experiência com o Espírito ao longo da história, como a Teologia Sistemático-Carismática a apresenta. */
  protected readonly tscSteps = [
    { title: 'Antigo Testamento', text: 'o Espírito sobre juízes, reis e profetas' },
    { title: 'Novo Testamento', text: 'Jesus ungido, Pentecostes e Atos' },
    { title: 'Primeiros séculos', text: 'os pais da Igreja (patrística)' },
    { title: 'Movimentos de renovação', text: 'do fim do século XIX em diante' },
  ];

  protected readonly churchGives = ['Reúne as pessoas', 'Ensina a Palavra', 'Acolhe quem chega', 'Cuida de quem sofre', 'Ora pela cidade'];
  protected readonly stateGives = ['Água e esgoto', 'Energia elétrica', 'Estrada e asfalto', 'Escola e saúde', 'Leis e segurança'];
  /** Etapas da cidade: [desenho, posição x] sobre a linha do chão. */
  protected readonly cityStages: { title: string; text: string; items: [string, number][] }[] = [
    { title: 'A capela', text: 'Terra doada ao santo e uma capela', items: [['arvore', 70], ['arvore', 96], ['capela', 170], ['arvore', 250], ['arvore', 278]] },
    { title: 'O arraial', text: 'Casas em volta da praça da igreja', items: [['casa', 84], ['casa', 114], ['capela', 170], ['casa', 226], ['casa', 256], ['arvore', 296]] },
    { title: 'A vila', text: 'Câmara municipal e estrada', items: [['casa', 50], ['casa', 78], ['capela', 136], ['camara', 220], ['casa', 274], ['casa', 302]] },
    { title: 'A cidade', text: 'Escola, água, luz e asfalto', items: [['escola', 40], ['casa', 82], ['capela', 122], ['camara', 186], ['casa', 236], ['poste', 264], ['poste', 290], ['caixa', 316]] },
  ];
}
