# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"Bíblia Sagrada": a Portuguese (pt-BR) Bible reading and study PWA built with Angular 21 and Angular Material 3, deployed to GitHub Pages at https://sgtcastanheira.github.io/biblia-sagrada/. The audience is Brazilian (Pentecostal) church members.

The code uses English identifiers. Everything else is in Brazilian Portuguese: UI text, code comments, content, docs (README.md, TESTES.md, CREDITOS.md, tools/LEIA-ME.md) and commit messages. Keep it that way.

## Project diary (DIARIO.md)

Before every commit, add an entry at the top of `DIARIO.md` and stage it in the same commit. Use the format at the top of that file: date and local time from `date '+%Y-%m-%d %H:%M %z'`, author, what was done, decisions (what was chosen, why, what was left out), files, open items. Write it in Portuguese. When an open item of an older entry gets done, say so in the new entry instead of editing the old one.

## Commands

```bash
npx ng serve                         # dev server at http://localhost:4200 (service worker disabled in dev)
npx ng build                         # production build -> dist/biblia-sagrada/browser
npm run test:e2e                     # all Playwright projects: logica + celular + computador
npm run test:e2e:celular             # faster: logica + celular
npx playwright test -g "jornada"     # a single test by name (add --headed to watch)
npx playwright test e2e/logica/referencias.spec.ts --project=logica
npm run test:offline                 # PROD=1: builds, serves dist on :4400 (e2e/servir-build.mjs), runs offline.spec.ts
npm run test:e2e:relatorio           # open the HTML report (traces/screenshots of failures)
npm run test:e2e:ui                  # Playwright UI mode
```

- **Windows:** npm runs scripts with cmd.exe here, so `npm run test:offline` (`PROD=1 …`) fails. Run it as `PROD=1 npx playwright test --project=producao` from the Bash tool, or `$env:PROD='1'; npx playwright test --project=producao` in PowerShell. `python3` usually opens the Microsoft Store stub, so run the `tools/*.py` scripts with `python` or `py` instead of the `python3` shown in tools/LEIA-ME.md (Python 3, standard library only).

- **No unit tests or linter.** `ng test` has no specs. All testing is Playwright, documented in TESTES.md.
- **Browser:** the tests use the installed Google Chrome (`channel: 'chrome'`). A standalone Playwright script needs `chromium.launch({ channel: 'chrome' })`; the bundled Chromium is not downloaded.
- **Dev server:** the tests reuse an `ng serve` already running on 4200.
- **Style budget:** component styles warn at 12kB and error at 16kB (`angular.json`). The build fails if a component SCSS grows past it.
- **Deploy:** `.github/workflows/publicar.yml` publishes every push to `main` to Pages. It first runs the `logica` tests (`SO_LOGICA=1` skips the `webServer` in `playwright.config.ts`); a failure blocks the deploy. It builds with `--base-href /biblia-sagrada/` and copies `index.html` to `404.html` so deep links work. All asset URLs in code must therefore be relative (`conteudo/x.json`, never `/conteudo/x.json`).

## Test harness (e2e/base.ts)

Browser specs import `test`/`expect` from `e2e/base.ts`, not from `@playwright/test`. The fixture:
- Fails the test on any page error, console error, failed request or HTTP 4xx/5xx. To allow an expected error: `problems.allow(/regex/)`.
- Mocks bible-api.com with fixed text. For the real API: `test.use({ realApi: true })`.
- Starts each test with clean localStorage and the automatic popups suppressed.

Specs in `e2e/logica/` are pure-logic tests that import `src/app/core/*.ts` directly. Code they need must therefore be plain TS in `core/` without Angular JIT dependencies; that is why `rich-text-parser.ts` lives in core. `conteudo-estudo.spec.ts` checks that every Bible reference in all content files parses and that every cross-linked id (person, map, article, prophecy) exists. Run it after editing content.

`acessibilidade.spec.ts` enforces:
- text of at least 13px;
- contrast of at least 4.5:1;
- touch targets of at least 40px;
- every Material Symbol actually rendered. The icon font is subset: after using a new icon name, run `python3 tools/baixar-fontes.py`. It finds names in `<mat-icon>` text, in `icon: '…'` and in `*_ICONS = { … }` tables.

`navegacao.spec.ts` lists every route and fails on horizontal scroll. Add new routes there.

## Architecture

**Standalone Angular with signals.** Uses the new control flow and lazy `loadComponent` routes (`app.routes.ts`). `withComponentInputBinding()` delivers route params as component inputs. Layout:
- `src/app/core/`: services and static data/types.
- `src/app/shared/`: reusable components and bottom sheets.
- `src/app/pages/`: one folder per route.

**Bible text** (`core/bible.service.ts`):
- The Almeida is bundled as `public/bible/almeida/<BOOK>.json`. Book ids are USFM-style (`GEN`, `JHN`, `1CO`).
- `public/bible/index.json` lists which books are local. Only listed books are fetched locally; other versions come from bible-api.com through a rate-limited queue (≈12 requests per 30s).
- Portuguese open-license versions (`blivre`, `nbv`, `bpm`, `blt`, `nva`, `alm1911`) are bundled the same way, generated by `tools/gerar-versoes.py`. Their sources are eBible.org VPL files and CrossWire SWORD modules (converted by `tools/sword-para-vpl.py`). They are in `LOCAL_ONLY` (`bible.service.ts`): they never fall back to the API. They are cached lazily by the service worker; only the Almeida is prefetched.
- Copyrighted versions (ARA, ARC, NVI, NTLH, NAA, NVT) are never bundled. `EXTERNAL_VERSIONS` in `versions.ts` only links to the verse on bible.com, using the YouVersion ids.
- Cross-references (OpenBible.info) are lazy-loaded from `public/bible/referencias/`.

**Study content.** Two kinds of sources:
- **Hand-written** in `public/conteudo/`, loaded and cached by `ContentService`:
  - JSON files: `dicionario.json`, `memorial.json`, `profecias.json`, `citacoes.json`, `livros.json`, and `notas.json` (keyed `"JHN 3"`).
  - Markdown articles and sermons in `artigos/` and `sermoes/`.
- **TS data modules** in `core/`:
  - `library.ts` is the article/sermon index.
  - Also `maps.ts`, `atlas.ts`, `genealogy.ts`, `curiosities.ts` and `credits.ts`.
  - Types for the JSON files live in `dictionary.ts`, `memorial.ts`, `prophecy.ts` and `content.service.ts`.

**Titles** (`core/title-case.ts`, `logica/titulos.spec.ts`): every content title uses a capital initial on each word except articles, prepositions and conjunctions ("A Lógica da Fé e a Lógica Grega", "Jesus Nasceu Mesmo em 25 de Dezembro?"; the optional norma culta rule for titles of works). It covers `title` of articles and sermons in `library.ts`, each `topics` entry, trail `name`/`short`/branch `title` in `trails.ts`, every `##`/`###` heading and `:::ficha` title in the Markdown of `artigos/`, `sermoes/` and `ad-estados/` (a `:::ficha Lugar · data · fato` label is exempt). Not covered: subtitles, descriptions, UI labels and tool names (e.g. "Linha do tempo", "Meu espaço"), dictionary, memorial, prophecies and hymn data. Run the spec after adding content; it prints the expected form of each title. When an inline mention names a story (`*Título*` or `[Título](/artigo/id)`), write it exactly like the story's title. Heading lookups (`SPECIAL_SECTIONS`) ignore case.

**Linking content to the text:**
- `reference-parser.ts` parses Brazilian-style references (`Js 6.1-20`, `At 16.9,10`, `I Coríntios 13`, `Jó` vs `Jo`). It also handles chapter-spanning ranges, using `END_OF_CHAPTER = 999` internally.
- `rich-text-parser.ts` and `shared/rich-text.ts` render the content Markdown:
  - `[[Jo 3.16]]` or `[[Ref|texto]]` become tappable passages.
  - `:::tempo` and `:::nota` blocks render as a timeline and a callout.
  - `![alt](imagens/x.jpg "legenda com crédito")` shows a photo from `public/conteudo/imagens/`; add ` {larga}` after it for paintings and landscapes that should take the full width. Only use public-domain or open-license photos, and credit them in the caption, `credits.ts` and CREDITOS.md.
  - `:::figura id` shows a drawn SVG illustration from `shared/figure.ts`; the lines inside the block are its caption.
  - `logica/ilustracoes.spec.ts` checks that every photo exists and has a caption, and that every figure id exists.
  - Story blocks for history articles:
    - `:::cena Lugar · data` is a dark "scene" panel that places the reader in the moment.
    - `:::destaque` is a pull-quote; a last line starting with `— ` is the attribution.
    - `:::pessoas` lists the characters, one per line: `- Nome | papel | imagens/foto.jpg` (photo optional; initials otherwise).
    - Scenes must only restate facts already in the article and its sources; no invented details.
    - `:::leia article-id` is a "read the full story" card linking to another article; the text inside (optional) says how the two stories connect. Use it where stories cross, so they interweave but each still stands alone.
  - `:::ficha Título` is a fact sheet: lines `- Rótulo | texto` (used for each revival: Como começou, Por quê, Por meio de quem, A trajetória, O fim, Impacto na sociedade, A mensagem). `:::sermao id` is a card to a historical sermon in `CLASSIC_SERMONS`; each sermon's `revival` points back to the study of its revival.
  - A collection can have one overview article (`overview: true` in `library.ts`), like the book of Acts: a light summary of every story with a `:::leia` card for each. The history page features it first, and every story's cover links back to it. `ilustracoes.spec.ts` checks that every `:::leia` id exists and that the Igreja overview links to every Igreja article, so add a card there when adding a church-history article.
  - Story mode (`<app-rich-text [story]="true">`, used for the `STORY_COLLECTIONS` in `library.ts`, i.e. Igreja and Bíblia) adds numbered chapters, a drop cap, photos as tilted period prints, an alternating timeline on wide screens and reveal-on-scroll (CSS scroll-driven animations, off with reduced motion). The article page adds a dark cover (`portraits` in `Article`) and a reading progress bar.
- `DictionaryMatcher` (`dictionary.ts`) marks dictionary `forms` in the reader. Each entry is marked once per chapter, and the longest form wins.
- `bible-order.ts` and `study-index.ts` order and group everything in canonical order (Genesis to Revelation) per book and chapter. Lists shown to users should follow Bible order.

**IBUC module** (`core/ibuc.ts`, `pages/ibuc/`) supports teachers by age group (`IBUC_CLASSES`). Lessons (`IBUC_LESSONS`) hold curiosities, historical context, activities and questions; `example: true` marks the model lesson. A lesson with `quarter` ("2026-4") and `number` fills that slot in the class's list of lessons 1–13 and is linked from the user's EBD lesson with the same number. Never reproduce the IBUC magazines or PDFs.

**Harpa Cristã** (`core/harpa.ts`, `public/conteudo/harpa.json`, `pages/harpa/`):
- Each hymn has its number, title and author, plus the origin when documented.
- Every hymn lists the sources that confirm its number and author, and every origin lists its sources.
- Never store lyrics (copyright of CPAD and the authors).
- Only add hymns confirmed in public sources. Do not scrape sites that protect themselves against bots (hymnary.org does).

**Narration voice** (`core/voice.ts`): the map journey speaks with the Web Speech API. It prefers Microsoft's Francisca (`pt-BR-FranciscaNeural`, available in the Edge browser as "Microsoft Francisca Online (Natural)"), then other natural pt-BR voices, then any Brazilian voice. Ranking is `voiceQuality`/`rankVoices` (pure, tested in `logica/voz.spec.ts`): neural/Premium first, local Microsoft next, Google last (it sounds mechanical); the player marks natural voices with ★ and shows a tip when the device has none. The Azure voice itself would need a server with a secret key, so the app does not call it.

**Histórias por assunto** (`core/trails.ts`, `shared/story-rings.ts`, `pages/history/`): `/historia` and the home screen show one ring per subject (`TRAILS`: Histórias da Bíblia, Um Só Deus (the Trinity and the pagan gods), De Onde Veio a Bíblia, Contexto Histórico, Profecias, História da Igreja, Pentecostalismo e Avivamentos, O Evangelho no Brasil, Harpa Cristã, Teologia (book modules such as `teologia-sistematico-carismatica`) and A Igreja e o Estado (`igreja-e-estado`: how the church gathers the people and the State brings the structure, from the first mass of 1500 to the interior of Brazil); the rings follow the order of `TRAILS`). Each trail has branches (`ids` of articles + `links` to other screens). Every article must be in exactly one trail (`links-internos.spec.ts` checks); a new article goes in `library.ts` AND in a trail branch. `?colecao=` still works (legacy), the article's back button uses `?trilha=`. Colour rule: one family (sage + gold accent), no per-subject rainbow; subjects differ by icon.

**Connected stories** (`core/story-graph.ts` pure, `core/story-progress.service.ts`, `shared/story-journey.ts`): stories connect by structure, not by repeating text. The end of every article shows its place in its trail (`trailStep`: position, previous, next; at the end of a trail, the next trail) and up to 3 stories of *other* trails in the same era (`sameEra`: periods must overlap, ranked by how close the start years are, up to 450 years), never repeating ids the text already links (`linkedArticles`) nor the previous/next. `periodYears` reads `period` ("séc. I", "c. 430 a.C. – 4 a.C.", "1910–hoje"); a period with a number must parse (`logica/historias-ligadas.spec.ts`). Content rule, also tested: an article never links twice to the same story (keep the `:::leia` card, write an inline mention as *título*), and a `:::leia` card text is never copied into another article (each says how *those* two stories connect). An article can have `topics` (in `library.ts`): they are its h2 titles, in order, labelled “Tópico 1 de 5” in the text (`sectionLabels`), written as questions and clues that make the reader curious, never as the answer; the cover then shows only the title (no subtitle, no list, no index), so the reader discovers each topic while reading (`logica/historias-ligadas.spec.ts` checks topics and sections match). Reading progress (`biblia.historias` in localStorage, in the backup) saves where the reader stopped and marks a story read at the end of the text: "Continuar de onde parou" in the article, the current chapter pill at the bottom, checks and "Continuar a trilha" in `/historia`, and "Continuar a história" on the home screen.

**Timeline of history** (`core/epochs.ts` pure, `core/world-events.ts`, `pages/epochs/`, `shared/era-chip.ts`, routes `/epocas` and `/epocas/:id`, under the Estudo tab): the whole app organised by time, in 16 epochs from the Creation to today (`EPOCHS`; each has a `from` year, negative = a.C., and lasts until the next one starts; the BC ones follow the Atlas `ERAS`). Everything dated falls in exactly one epoch: a story by the year its `period` starts (`epochOfArticle`; overview articles and undated studies have none; `ARTICLE_EPOCH` fixes biographies and long subjects), a Bible chapter by `BIBLE_EPOCHS` (every chapter of every book belongs to one epoch; `logica/epocas.spec.ts` checks the sum), and people, curiosities, prophecies and maps by their first reference or most common chapter. The world layer is `WORLD_TIMELINE` = `WORLD_EVENTS` (before 1890) + `CONTEXT_EVENTS` (from 1890, also the AD timeline's source): crises and turning points (famines, plagues, wars, falls of empires, crashes, Brazilian laws), each short, with `ref` when the Bible tells it and `article` when the app has the story. Every epoch needs at least one (the spec fails otherwise), and the sources go in `TOPIC_SOURCES.epocas` (or `contexto-ad` for the post-1890 ones): only facts you can source, with approximate dates marked when scholars disagree. The era page merges stories and world events year by year (a story that began before the epoch enters at its start); `<app-era-chip>` on the person, curiosity, prophecy, map and book pages, the "Época" link on the story cover and at the story end, the card at the top of `/estudo`, the home and `/historia`, and the study search (kinds `epoca` and `fato`) all lead to it. A new story with a `period` lands in its epoch by itself; when it connects with a crisis, add the crisis to `world-events.ts` (or `ad-context.ts`) and link it with `article`. **The church in the crises:** the user wants the timeline to show that the church was not apart from the hardships of life. A crisis can carry `church` (`ChurchNote`: text, `link` to an app story and/or `source`), shown as the box “A igreja nesse tempo” (`shared/church-note.ts`) on the era page (filter “A igreja nas crises”), in the AD timeline and counted on `/epocas`. Only documented facts: the text says which church it was (the 1929 and WWII notes are about the Baptists, from Paulo Julião da Silva's UFES article; no source was found for the AD) and keeps the hedges of the story it comes from.

**Libras** (`core/libras.service.ts`, Ajustes › Acessibilidade): opt-in VLibras widget (government + UFPB), loaded from `https://vlibras.gov.br/app/vlibras-plugin.js` only when turned on (it auto-initialises; needs internet; the chosen text goes to their service); off hides it with `.libras-off [vw]`. Tests must stub that URL (`page.route`). Nothing in the app depends on hearing or speaking: keep every audio feature paired with on-screen text.

**Reader feel** (`pages/reader/`, `shared/book-ribbon.ts`, `.book-page` in `styles.scss`): dragging the page sideways follows the finger and turns to the next/previous chapter; the new page arrives with a turning animation (off with reduced motion). The gold ribbon (`SettingsService.bookmark`) marks the chapter where the reader stopped; the home screen links back to it.

**Story page** (`pages/article/article.ts`): `cover` in `library.ts` puts a painting or photo behind the story cover (it must also appear in the text, with the credit); without it the cover keeps the icon watermark. The cover has an "Ouvir a história" button. On phones, `/artigo/` pages hide the top bar and the bottom nav while scrolling down and bring them back on scroll up (`UiService.barsHidden`, as in the Bible reader; reset on every navigation), and the chapter pill drops with them. A tap on a text photo opens `shared/photo-viewer.ts` (full screen, tap to zoom and pan, Esc closes). When a story is finished, `StoryJourney` shows "História concluída" with how many stories the person has read.

**Daily reminders** (`core/reminders.ts` pure, `core/reminders.service.ts`, `shared/reminder-card.ts`, `public/sw.js`): three calls a day to pray, read and think about God (morning 07:00–10:30, afternoon 12:00–17:30, night 20:30–22:30), each day at a minute drawn from the date, so the page, the service worker and Ajustes agree. Each slot rotates its messages with no repeat on consecutive days; a quote in a message must be the exact Almeida text (`logica/lembretes.spec.ts` checks). With the app open, the due one shows on time (in-app banner and, if "Avisar no sistema" is on, a system notification) and stays as the card on the home screen until "Já fiz"; one that passed without being shown is skipped. With the app closed, `public/sw.js` (it imports `ngsw-worker.js` and is the script registered in `app.config.ts`) shows the due one on `periodicsync` from the agenda the app writes in the Cache Storage `biblia-lembretes` (Chrome/Edge with the PWA installed; the browser decides how often). There is no push server: an exact schedule with the app closed would need Web Push with a server and secret keys. On by default (toggle in Ajustes); `e2e/base.ts` turns them off (`biblia.lembretes=false`) and `lembretes.spec.ts` turns them on with a fixed clock. Notification click URLs go without the leading `/`: ngsw resolves them against the worker scope (`/biblia-sagrada/`).

**Listen** (`core/listen.service.ts`, `shared/listen-player.ts`): "Ouvir" reads a Bible chapter (verse by verse, then continues to the next chapter) or a story (headings and paragraphs of `app-rich-text`) with the Web Speech API: best pt-BR voice from `voice.ts`, rate 0.92 by default, pause between parts, current part highlighted (`.speaking`). `splitForSpeech` is pure (`core/speech-split.ts`). The voice quality depends on the device. Stories (articles and AD state pages) can also have recorded neural-voice audio: `tools/gerar-audio.mjs` (Azure Speech, key in `AZURE_SPEECH_KEY`, never committed; see tools/LEIA-ME.md) writes `public/audio/<artigos|estados>/<id>.mp3` and `public/audio/index.json` (start second + `textKey` of each paragraph, from `core/audio-text.ts`). `ListenService.startStory` plays the recording when the index has it (highlighting the matching paragraph) and falls back to the device voice. The tool reads paragraphs with the same parser as the app, and `shared/listen-dom.ts` selects the same elements on screen: change one, change the other. Audio is not in `ngsw-config.json` (network only).

**EBD support** (`core/ebd-support.ts`, `core/ebd-builder.ts` (`ebdLessons` turns `CompactLesson` lists into lessons; one `ebd-<turma>-4t26.ts` per class, all 10 classes have 13 lessons), `core/ebd-adultos-4t26.ts`, `pages/ibuc/ibuc-lesson.ts`): lessons by class and quarter (`quarter: '2026-4'`, `number: 1–13`) with `reminders` (teacher to-do), `opening`, `curiosities`, `context`, `activities` (dinâmicas/brincadeiras with steps), `questions`, `application` and `deepen` (links to study pages of the app). Texts are original; the CPAD magazines only guide the theme of each lesson. Quotes inside “…” must match the bundled Almeida (check with the script idea in `links-internos.spec.ts`: every `[[ref]]` and internal link of Adultos is validated). The folder `EBD - Revista/` holds the magazines for local reference only: it is git-ignored and must never be committed or published (copyright).

**Eras map and bridge study** (`core/atlas.ts` `ERAS`, `shared/era-map.ts`): `:::mapa-epocas id1,id2,…` embeds the atlas map that steps through eras (used in `entre-os-testamentos`). The atlas geography is pre-projected for `ATLAS_MAP.bounds`: never change the bounds of a map that reuses `maps/atlas.json`; zoom with `focus` places instead (`BRIDGE_MAP`).

**Colour themes** (`styles.scss`, `SettingsService.theme/warmth`, `shared/reading-settings.ts`): `auto | light | sepia | mist | dark | ember | forest`, plus a "luz quente" amber veil (`.warmth` in `app.html`). All palettes use the same sage + gold family; `logica/temas.spec.ts` and `temas.spec.ts` enforce 4.5:1 contrast on tokens and on real rendered text. Colours that come from data (e.g. book category `--c`) must be mixed with `--mat-sys-on-surface` to stay readable in every theme.

**Bible versions in other languages**: Spanish (`rv1909`, `vbl`, `nbv-es`, `bes`, `bll`) and German (`luther1912`, `elo`, `schlachter`) and Russian (`synodal`, from eBible `russyn`; the bible-api.com copy only had Genesis) are bundled like the Portuguese ones (`tools/gerar-versoes.py`, `LOCAL_ONLY`, ngsw group). Only public-domain or openly licensed texts: Reina-Valera Gómez and Valera 1602 Purificada were rejected (all rights reserved).

**Incomplete translations:** `BibleVersion.ntOnly` / `partial` (`versions.ts`) say when a version lacks the Old Testament (YLT, Cherokee, most indigenous ones; Open English Bible has only 17 OT books), and when a version lacks the book the reader shows the chapter in the Almeida under a notice (`state().fallback`, with a button to the NT in the chosen version) instead of an error, and lists the verses a translation skips in a chapter (`gap-note`; Xavante, Guajajára, Kaiwá, Kayabí and the Biblica Spanish NBV have source gaps). Before listing a version as complete, check every book (local: `public/bible/index.json`; bible-api.com: request chapters of several books, its book index lies).

**Indigenous languages of Brazil** (`mbya`, `guajajara` full Bibles; `kaiwa`, `kayabi`, `kaapor`, `munduruku`, `satere`, `ticuna`, `kaingang`, `terena`, `xavante` NT only): Wycliffe texts from eBible.org under CC BY-NC-ND 3.0, which allows porting to other formats but no change to words or punctuation and no commercial use. `tools/gerar-versoes.py` keeps them as is (`KEEP_AS_IS`, only whitespace is collapsed); the app must stay free. Each version's `copyright` (in `versions.ts`) is shown at the end of every chapter (`p.source`; versions without it show "domínio público"), so put the license there for any non-public-domain version. eBible has ~27 more redistributable indigenous NTs (Apinayé, Apurinã, Bakairí, Kadiwéu, Karajá, Kayapó, Macuxi, Maxakalí, Mundurukú…); Apalaí, Borôro, Canela, Desano, Jamamadí and Kulina are not redistributable. The reading fonts include the "vietnamese" Google Fonts subset (`tools/baixar-fontes.py`) for ẽ, ỹ and the combining tilde.

**Hebrew Bible** (`hebraico` version, `core/tanakh.ts`, `shared/tanakh-shelf.ts`, article `biblia-judaica`): Franz Delitzsch's Hebrew Bible (public domain, consonantal, same versification as the other bundled versions) is a normal local version with `rtl: true`; the reader sets `dir="rtl"`/`lang="he"` on verses. The Westminster Leningrad Codex (`hboWLC`) was not bundled because its Hebrew versification differs from the app's chapters. `TANAKH` has the 24 scrolls mapped to the 39 books (`logica/tanakh.spec.ts` checks every book appears once); `:::figura biblia-judaica` draws the shelves and the Christian order.

**Convention facts** (`madureira-e-a-separacao`, `cargos-na-assembleia-de-deus`): only state who presides a convention or what a rule is when a source was found; otherwise say "não consegui confirmar" with the check date. Rules for ministerial posts live in each convention's/ministry's statute: do not generalise one church's regimento to the whole denomination.

**What's new** (`core/whats-new.ts`): when publishing user-visible features, add a new entry at the top of `RELEASES` with a new `id`. Every device sees it once (first visits included), in a bottom sheet (`WhatsNewService`, checked at startup before the daily reminders). It is also listed at `/novidades`, which has a share button.

**Study search** (`core/study-search.ts` pure, `core/study-search.service.ts`, field at the top of `/estudo`, `?q=`): searches title and full text of articles, AD states, historical sermons, memorial, dictionary, prophecies, curiosities and hymns (no lyrics). Terms are accent-folded, `de/da/o` ignored, matched as word prefixes, with synonyms (`SYNONYM_GROUPS`: conselho ↔ concílio). Add a new content kind in the service and `KIND_INFO`.

**Navigation:** the bottom menu has five tabs, and each screen belongs to exactly one of them (`tab` in `app.ts`):
- Início (`/`)
- Bíblia (reader, `/livros`, `/busca`)
- Estudo (`/estudo` library in seven sections, and every study page)
- Ensino (`/ensino`: EBD, `/ebd/apoio`, IBUC, sermons)
- Meu espaço (`/meu-espaco`: devotional, notes, favorites, settings)

Add a new screen to the right tab regex and to the right hub; don't list the same item in two hubs. Same for data: each fact lives in one place. `/estudo` lists tools and reference (Memorial, tribes, genealogy, maps, atlas, books, curiosities, quiz, prophecies, dictionary); stories (articles, Igreja, Harpa, AD states) live only in the `TRAILS` of `/historia`, which `/estudo` links to once. The steps of the `assembleia-de-deus-estados` map take year, origin and link from `AD_STATES` (`stateStep` in `church-maps.ts`); only the step text is written there. Persecution cases are told in `irmaos-perseguidos`; state pages link to it instead of retelling.

**Navigation and UI:**
- Detail pages use `<app-back>` / `NavigationService.back(fallback)`, never hard-coded links back.
- Destructive or exit flows use `replaceUrl` so the history stays clean.
- Bottom sheets open through the `Sheets` service (`shared/sheets.ts`).

**Maps.** SVG, no tile server:
- `tools/gerar-mapas.py` turns Natural Earth GeoJSON into `public/maps/*.json`, driven by the map definitions in `core/maps.ts` and `core/atlas.ts`.
- Rerun it whenever a map is added or its bounds change. Pass map ids at the end to regenerate only those maps.
- The Assembleia de Deus state stories: `core/ad-states.ts` (`AD_STATES`, one per state, id = state abbreviation) with the text in `public/conteudo/ad-estados/<id>.md`, pages `/assembleia-de-deus` (list by region) and `/assembleia-de-deus/:id`. Each state is also a step of the `assembleia-de-deus-estados` church map, with `link` to its page and `from` = where its pioneers came from; `logica/ilustracoes.spec.ts` checks that the two agree. The state page frames origin and destination with the map's `focus` input.
- Church-history maps (outside the Bible) live in `core/church-maps.ts` (`CHURCH_MAPS`), use the same viewer and are listed in their own section of `/mapas`. Their steps use `ref` for the date (shown as text, never a Bible reference), they have no `chapters`, and the page always shows today's Brazilian state borders (from `ne_50m_admin_1_states_provinces_lines`).
- `shared/bible-map.ts` draws:
  - era polygons;
  - optional layers (nearby cities, modern borders);
  - label collision avoidance;
  - a scale bar and haversine distances.

**User data.** Notes, sermons, EBD (Sunday school), favorites and settings live in `localStorage`, one service per feature. `backup.service.ts` exports and imports all keys. Write through `saveLocal` (`core/storage.service.ts`), never a bare `localStorage.setItem` in a silent `try/catch`: a failed write counts in `storageFailures`, and the app shows a snackbar once per visit plus a warning in Ajustes › Seus dados. `StorageService` asks the browser for persistent storage (`navigator.storage.persist()`) at startup when the person already has notes, sermons, devotional, favorites or EBD data, and Ajustes shows the protection status, the space used and a "Proteger" button. `restore()` validates that every value is a string and, if the backup does not fit, puts the previous data back and throws (tested in `dados.spec.ts`). IndexedDB was deliberately not adopted yet (see DIARIO.md).

**PWA** (`ngsw-config.json`):
- The asset groups `app`, `assets`, `bible-almeida` and `conteudo` are prefetched, so the Almeida and all study content work offline.
- `referencias` is cached lazily.
- New content files under those globs are picked up automatically.

**Sources** (`core/sources.ts`, rendered by `<app-sources>` and the `/fontes` page):
- Every article needs an `ARTICLE_SOURCES` entry; `logica/fontes.spec.ts` fails otherwise.
- The other study parts use `TOPIC_SOURCES`.
- Only cite works that really exist and ancient sources the text actually draws on. The study texts are written for the app and are not copied from those works.

## Content and copyright rules

These rules are deliberate; keep them. Licenses are tracked in CREDITOS.md and in the in-app credits screen (`core/credits.ts`).
- **Allowed sources:** only public-domain or openly licensed material.
- **No copyrighted study-Bible text:** do not add commentary from CPAD, the Pentecostal Study Bible or similar.
- **Book modules** (e.g. `teologia-sistematico-carismatica`): write a *síntese* in formal Portuguese (norma culta), organised by theme and not chapter by chapter, with short comments, not a treatise and not a list of "os autores dizem": state the ideas directly and name the book once (intro); mark a contested thesis with an impersonal "segundo essa leitura" / "teria", never by repeating the authors' names. Use your own words, with quotes of a few words at most and the source named; say which parts were actually read (the module may only claim what the pages show); keep the author's life out unless the user asks; if a buy card (`:::comprar`) is used, it links to the publisher's page without affiliate code.
- **Modern sermons** (Billy Graham etc.) appear only as metadata plus a YouTube search link, never as text.
- **Historical sermons** are in the public domain and are translated and condensed.
- **Bible text changes** go through `tools/gerar-almeida.py`, which applies `VERSE_FIXES` and the 1990 orthography. To fix a verse without re-downloading the source, add it to `VERSE_FIXES` and run `tools/corrigir-almeida.py`. Do not edit `public/bible/almeida/*.json` by hand.
- **Disputed prophecies:** `profecias.json` tags each prophecy with a status (`cumprida | parcial | debatida | futura`) and a kind (`direta | tipologica | dupla`). Disputed ones present several `views` instead of one position.
