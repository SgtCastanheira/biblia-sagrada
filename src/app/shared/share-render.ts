import { CARD_CREAM, CARD_GOLD, DEFAULT_TONE, pageUrl, plain, shortSiteUrl, SITE_NAME, type ShareCard } from '../core/share-card';

export type ShareFormat = 'feed' | 'stories';

/** Os dois tamanhos que o Instagram e o WhatsApp mostram sem cortar: retrato 4:5 e tela cheia 9:16. */
export const SHARE_FORMATS: Record<ShareFormat, { width: number; height: number; label: string; hint: string }> = {
  feed: { width: 1080, height: 1350, label: 'Feed e WhatsApp', hint: '4:5' },
  stories: { width: 1080, height: 1920, label: 'Stories', hint: '9:16' },
};

const SERIF = '"Source Serif 4", Georgia, serif';
const SANS = 'Inter, system-ui, sans-serif';
const PAD = 84;

/** Quebra o texto em linhas que cabem em `max` pixels (a fonte já precisa estar no contexto). */
export function wrapLines(ctx: CanvasRenderingContext2D, text: string, max: number): string[] {
  const words = plain(text).split(' ').filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (line && ctx.measureText(test).width > max) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Limita a `max` linhas; a última termina em reticências quando o texto não coube. */
function clampLines(ctx: CanvasRenderingContext2D, lines: string[], max: number, width: number): string[] {
  if (lines.length <= max) return lines;
  const kept = lines.slice(0, max);
  let last = `${kept[max - 1]}…`;
  while (last.length > 2 && ctx.measureText(last).width > width) last = `${last.slice(0, -2).trimEnd()}…`;
  kept[max - 1] = last;
  return kept;
}

/** Uma linha só: corta com reticências quando passa da largura (o `clampLines` de uma linha devolve o texto inteiro). */
function oneLine(ctx: CanvasRenderingContext2D, text: string, width: number): string {
  if (ctx.measureText(text).width <= width) return text;
  let s = text;
  while (s.length > 2 && ctx.measureText(`${s}…`).width > width) s = s.slice(0, -1).trimEnd();
  return `${s}…`;
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

async function ensureFonts(): Promise<void> {
  const sample = 'Áé ção — 0123 ABC';
  try {
    await Promise.all(
      ['400 40px "Source Serif 4"', '700 40px "Source Serif 4"', '400 italic 40px "Source Serif 4"', '500 30px Inter', '600 30px Inter', '700 30px Inter'].map((f) => document.fonts.load(f, sample)),
    );
    await document.fonts.ready;
  } catch {
    // sem as fontes do app, a imagem sai com as do sistema
  }
}

/** Desenha o QR code (módulos escuros sobre um quadro claro) com o endereço da página. */
async function drawQr(ctx: CanvasRenderingContext2D, url: string, x: number, y: number, size: number, tone: string): Promise<void> {
  const { default: qrcode } = await import('qrcode-generator');
  const qr = qrcode(0, 'M');
  qr.addData(url);
  qr.make();
  const n = qr.getModuleCount();
  const quiet = 14;
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, x, y, size, size, 22);
  ctx.fill();
  const cell = (size - quiet * 2) / n;
  ctx.fillStyle = tone;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (qr.isDark(r, c)) ctx.fillRect(x + quiet + c * cell, y + quiet + r * cell, Math.ceil(cell), Math.ceil(cell));
    }
  }
}

/** Fundo de uma imagem mostrada inteira: ela mesma, reduzida a poucos pontos e esticada de volta (fica borrada em qualquer navegador), mais escura. */
function drawBackdrop(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number): void {
  const small = document.createElement('canvas');
  small.width = 10;
  small.height = Math.max(2, Math.round((10 * h) / w));
  small.getContext('2d')!.drawImage(img, 0, 0, small.width, small.height);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(small, x, y, w, h);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
  ctx.fillRect(x, y, w, h);
}

/** Desenha uma foto cortada para caber no quadro (sem deformar), com cantos redondos; a linha de crédito vem logo abaixo. Com `fit: 'contain'` a foto aparece inteira, sem corte. */
async function drawPhoto(ctx: CanvasRenderingContext2D, photo: NonNullable<ShareCard['photo']>, x: number, y: number, w: number, h: number, withCredit = true): Promise<number> {
  const img = await loadImage(photo.src);
  if (img) {
    ctx.save();
    roundRect(ctx, x, y, w, h, 24);
    ctx.clip();
    // “inteira” (fit: 'contain') só quando preencher o quadro cortaria mais de um quinto da imagem; se quase cabe, preenche
    const fit = Math.min(w / img.naturalWidth, h / img.naturalHeight);
    const fill = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const whole = photo.fit === 'contain' && fit < fill * 0.8;
    const dw = img.naturalWidth * (whole ? fit : fill);
    const dh = img.naturalHeight * (whole ? fit : fill);
    if (whole) {
      drawBackdrop(ctx, img, x, y, w, h);
      roundRect(ctx, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh, 18);
      ctx.clip();
      ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
      // filete claro em volta: a imagem inteira fica como um quadro sobre o fundo
      ctx.strokeStyle = 'rgba(241, 217, 168, 0.5)';
      ctx.lineWidth = 4;
      ctx.stroke();
    } else {
      // retratos ficam com o rosto no quadro: alinhados mais ao alto
      ctx.drawImage(img, x + (w - dw) / 2, y - Math.max(0, (dh - h) * (photo.focusY ?? 0.04)), dw, dh);
    }
    ctx.restore();
  } else {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    roundRect(ctx, x, y, w, h, 24);
    ctx.fill();
  }
  if (!withCredit) return h;
  ctx.font = `500 23px ${SANS}`;
  ctx.fillStyle = 'rgba(255, 248, 236, 0.82)';
  const lines = clampLines(ctx, wrapLines(ctx, `${photo.label ?? 'Foto'}: ${photo.credit}`, w), 2, w);
  let ty = y + h + 32;
  for (const line of lines) {
    ctx.fillText(line, x, ty);
    ty += 28;
  }
  return h + 12 + lines.length * 28;
}

/** Várias fotos lado a lado (o compilado de um dia), cada uma com o ano no canto, e uma linha de crédito por foto. */
async function drawPhotoRow(ctx: CanvasRenderingContext2D, photos: NonNullable<ShareCard['photos']>, x: number, y: number, w: number, h: number): Promise<number> {
  const gap = 16;
  const tileW = (w - gap * (photos.length - 1)) / photos.length;
  for (const [i, photo] of photos.entries()) {
    const tx = x + i * (tileW + gap);
    await drawPhoto(ctx, photo, tx, y, tileW, h, false);
    if (photo.tag) {
      ctx.font = `700 30px ${SERIF}`;
      const tw = ctx.measureText(photo.tag).width + 30;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      roundRect(ctx, tx + 14, y + 14, tw, 46, 23);
      ctx.fill();
      ctx.fillStyle = CARD_GOLD;
      ctx.fillText(photo.tag, tx + 29, y + 46);
    }
  }
  ctx.font = `500 21px ${SANS}`;
  ctx.fillStyle = 'rgba(255, 248, 236, 0.82)';
  let ty = y + h + 30;
  for (const photo of photos) {
    const credit = photo.credit.replace(' (Wikimedia Commons)', '');
    ctx.fillText(clampLines(ctx, wrapLines(ctx, `${photo.tag ? photo.tag + ': ' : ''}${photo.label ?? 'Foto'}: ${credit}`, w), 1, w)[0], x, ty);
    ty += 28;
  }
  return h + 12 + photos.length * 28;
}

/**
 * Desenha a imagem de compartilhar: assunto, título, tópicos e subtópicos, e embaixo o nome do app, o endereço
 * e um QR code que abre a própria página. Tudo em um canvas, sem servidor; funciona sem internet.
 */
export async function renderShareImage(card: ShareCard, format: ShareFormat): Promise<Blob> {
  await ensureFonts();
  const { width: W, height: H } = SHARE_FORMATS[format];
  const stories = format === 'stories';
  const tone = card.tone ?? DEFAULT_TONE;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const textW = W - PAD * 2;

  // fundo: a cor do assunto com um brilho suave no alto
  ctx.fillStyle = tone;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W * 0.8, 0, 40, W * 0.8, 0, H * 0.7);
  glow.addColorStop(0, 'rgba(255, 248, 236, 0.16)');
  glow.addColorStop(1, 'rgba(255, 248, 236, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(241, 217, 168, 0.45)';
  ctx.lineWidth = 3;
  roundRect(ctx, 30, 30, W - 60, H - 60, 28);
  ctx.stroke();

  // rodapé: reservamos o espaço antes de encher o resto
  const footerH = 262;
  const footerTop = H - 52 - footerH;
  const listBottom = footerTop - 22;

  // marca: ícone do app e nome
  const logo = await loadImage('icons/icon-192x192.png');
  let y = 78;
  if (logo) {
    ctx.save();
    roundRect(ctx, PAD, y, 72, 72, 18);
    ctx.clip();
    ctx.drawImage(logo, PAD, y, 72, 72);
    ctx.restore();
  }
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = CARD_CREAM;
  ctx.font = `700 38px ${SANS}`;
  ctx.fillText(SITE_NAME, PAD + 92, y + 32);
  ctx.fillStyle = CARD_GOLD;
  ctx.font = `500 26px ${SANS}`;
  ctx.fillText('estudo bíblico no celular', PAD + 92, y + 66);
  y += 72 + (stories ? 64 : 44);

  // assunto e linha de detalhes
  ctx.fillStyle = CARD_GOLD;
  ctx.font = `700 30px ${SANS}`;
  y += 24;
  ctx.fillText(clampLines(ctx, [card.theme.toUpperCase()], 1, textW)[0], PAD, y);
  // data da história: o selo com os anos, a data e a foto
  const com = !!card.badge;
  let dateText: { size: number; titleLines: string[]; sub: string[]; hook: string[] } | null = null;
  if (com) {
    ctx.fillStyle = CARD_GOLD;
    ctx.font = `700 ${stories ? 150 : 108}px ${SERIF}`;
    y += stories ? 128 : 92;
    ctx.fillText(card.badge!, PAD, y);
    if (card.meta) {
      ctx.fillStyle = CARD_CREAM;
      ctx.font = `600 32px ${SANS}`;
      y += 48;
      ctx.fillText(clampLines(ctx, [plain(card.meta)], 1, textW)[0], PAD, y);
    }
    y += 26;
    // o texto de baixo (título, explicação e gancho) é medido antes: a foto fica com o espaço que sobrar
    const titleMax = stories ? 3 : 2;
    let tSize = stories ? 80 : 62;
    let tLines: string[] = [];
    for (; tSize >= 44; tSize -= 4) {
      ctx.font = `700 ${tSize}px ${SERIF}`;
      tLines = wrapLines(ctx, card.title, textW);
      if (tLines.length <= titleMax) break;
    }
    ctx.font = `700 ${tSize}px ${SERIF}`;
    tLines = card.hideTitle ? [] : clampLines(ctx, tLines, titleMax, textW);
    ctx.font = `400 italic 32px ${SERIF}`;
    const subAll = card.subtitle ? wrapLines(ctx, card.subtitle, textW) : [];
    ctx.font = `700 38px ${SERIF}`;
    const hookAll = card.hook ? wrapLines(ctx, card.hook, textW) : [];
    const hookN = Math.min(hookAll.length, stories ? 3 : 2);
    const photos = card.photos?.length ? card.photos : card.photo ? [card.photo] : [];
    const creditH = photos.length ? (card.photos?.length ? photos.length * 28 + 12 : 12 + 56) : 0;
    const minPhoto = photos.length ? (card.photos?.length ? 130 : 170) : 0;
    let subN = Math.min(subAll.length, stories ? 8 : 6);
    // a lista de tópicos (no compilado de um dia, os fatos) também precisa caber abaixo
    let topicsH = 0;
    if (card.topics.length) {
      ctx.font = `600 35px ${SERIF}`;
      const innerW = textW - 60 - 16;
      topicsH = (card.topicsLabel === '' ? 50 : 72) + card.topics.reduce((acc, tp) => acc + clampLines(ctx, wrapLines(ctx, tp.title, innerW), 2, innerW).length * 43 + 22, 0);
    }
    const textH = (n: number) => tLines.length * tSize * 1.1 + (tLines.length ? 14 : 0) + n * 42 + (hookN ? 46 + hookN * 48 : 0) + 30 + topicsH;
    while (subN > (card.topics.length ? 1 : 2) && y + 8 + minPhoto + creditH + textH(subN) > listBottom) subN--;
    // no feed a foto é uma faixa; a que aparece inteira (fit: 'contain') pode usar o espaço que sobra
    const photoMax = stories ? 740 : card.photo?.fit === 'contain' ? 380 : 290;
    const photoH = photos.length ? Math.max(minPhoto, Math.min(photoMax, listBottom - (y + 8) - creditH - textH(subN))) : 0;
    dateText = { size: tSize, titleLines: tLines, sub: clampLines(ctx, subAll, subN, textW), hook: clampLines(ctx, hookAll, hookN, textW) };
    if (card.photos?.length) y += await drawPhotoRow(ctx, card.photos, PAD, y, textW, photoH);
    else if (card.photo) y += await drawPhoto(ctx, card.photo, PAD, y, textW, photoH);
    y += 8;
  } else {
    if (card.meta) {
      ctx.fillStyle = 'rgba(255, 248, 236, 0.78)';
      ctx.font = `500 27px ${SANS}`;
      y += 40;
      ctx.fillText(clampLines(ctx, [plain(card.meta)], 1, textW)[0], PAD, y);
    }
    y += 22;
  }

  // título: o maior tamanho que cabe em poucas linhas
  const titleMax = com ? (stories ? 3 : 2) : stories ? 5 : 3;
  let size = com ? (stories ? 80 : 62) : stories ? 88 : 76;
  let titleLines: string[] = [];
  if (dateText) {
    size = dateText.size;
    titleLines = dateText.titleLines;
  } else {
    for (; size >= (com ? 44 : 52); size -= 4) {
      ctx.font = `700 ${size}px ${SERIF}`;
      titleLines = wrapLines(ctx, card.title, textW);
      if (titleLines.length <= titleMax) break;
    }
    ctx.font = `700 ${size}px ${SERIF}`;
    titleLines = clampLines(ctx, titleLines, titleMax, textW);
  }
  ctx.font = `700 ${size}px ${SERIF}`;
  ctx.fillStyle = CARD_CREAM;
  for (const line of titleLines) {
    y += size * 1.1;
    ctx.fillText(line, PAD, y);
  }
  if (titleLines.length) y += 14;

  // subtítulo
  if (card.subtitle) {
    ctx.font = `400 italic ${com ? 32 : 34}px ${SERIF}`;
    ctx.fillStyle = 'rgba(255, 248, 236, 0.88)';
    for (const line of dateText ? dateText.sub : clampLines(ctx, wrapLines(ctx, card.subtitle, textW), stories ? 4 : 2, textW)) {
      y += com ? 42 : 44;
      ctx.fillText(line, PAD, y);
    }
  }

  // gancho: uma frase em dourado que deixa a pessoa com vontade de ler a história
  if (dateText?.hook.length) {
    y += 46;
    ctx.fillStyle = CARD_GOLD;
    ctx.fillRect(PAD, y - 28, 90, 5);
    ctx.font = `700 38px ${SERIF}`;
    for (const line of dateText.hook) {
      y += 48;
      ctx.fillText(line, PAD, y);
    }
  }

  // filete dourado (só quando vem uma lista de tópicos depois)
  y += 30;
  if (card.topics.length) {
    ctx.fillStyle = CARD_GOLD;
    ctx.fillRect(PAD, y, 140, 5);
    y += 50;
  }

  // tópicos e subtópicos: se não couberem pelo menos quatro com os subtópicos, mostramos mais tópicos sem eles
  if (card.topics.length) {
    ctx.fillStyle = CARD_GOLD;
    ctx.font = `700 27px ${SANS}`;
    if (card.topicsLabel === '') {
      y -= 6;
    } else {
      ctx.fillText(card.topicsLabel ?? 'O QUE VOCÊ VAI ENCONTRAR', PAD, y);
      y += 22;
    }
    const numW = 60;
    const innerW = textW - numW - 16;
    const topicFont = `600 35px ${SERIF}`;
    const subFont = `400 27px ${SANS}`;
    const measure = (withSubs: boolean) =>
      card.topics.map((t) => {
        ctx.font = topicFont;
        const lines = clampLines(ctx, wrapLines(ctx, t.title, innerW), 2, innerW);
        ctx.font = subFont;
        const subs = withSubs ? (t.subs ?? []).map((sub) => oneLine(ctx, `› ${plain(sub)}`, innerW)) : [];
        return { lines, subs, h: lines.length * 43 + subs.length * 35 + 22 };
      });
    const total = card.total ?? card.topics.length;
    const fit = (blocks: { h: number }[]) => {
      let n = blocks.length;
      const sum = (k: number) => blocks.slice(0, k).reduce((acc, b) => acc + b.h, 0);
      while (n > 1 && y + sum(n) + (n < total ? 48 : 0) > listBottom) n--;
      return n;
    };
    let blocks = measure(true);
    let shown = fit(blocks);
    if (shown < Math.min(4, total)) {
      const plainBlocks = measure(false);
      const plainShown = fit(plainBlocks);
      if (plainShown > shown) {
        blocks = plainBlocks;
        shown = plainShown;
      }
    }
    for (let i = 0; i < shown; i++) {
      const b = blocks[i];
      ctx.fillStyle = CARD_GOLD;
      ctx.beginPath();
      ctx.arc(PAD + 22, y + 20, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = tone;
      ctx.font = `700 26px ${SANS}`;
      ctx.textAlign = 'center';
      ctx.fillText(String(i + 1), PAD + 22, y + 29);
      ctx.textAlign = 'left';
      ctx.fillStyle = CARD_CREAM;
      ctx.font = topicFont;
      let ty = y + 31;
      for (const line of b.lines) {
        ctx.fillText(line, PAD + numW, ty);
        ty += 43;
      }
      ctx.fillStyle = 'rgba(255, 248, 236, 0.78)';
      ctx.font = subFont;
      for (const sub of b.subs) {
        ctx.fillText(sub, PAD + numW, ty - 8);
        ty += 35;
      }
      y += b.h;
    }
    if (shown < total) {
      ctx.fillStyle = CARD_GOLD;
      ctx.font = `600 29px ${SANS}`;
      ctx.fillText(`+ ${total - shown} ${total - shown === 1 ? 'tópico' : 'tópicos'} no app`, PAD + numW, y + 30);
    }
  }

  // rodapé: convite, nome, endereço e QR code
  ctx.fillStyle = 'rgba(0, 0, 0, 0.26)';
  roundRect(ctx, 56, footerTop, W - 112, footerH, 28);
  ctx.fill();
  const qrSize = 206;
  const qrX = W - 56 - 28 - qrSize;
  const qrY = footerTop + (footerH - qrSize) / 2;
  await drawQr(ctx, pageUrl(card.path), qrX, qrY, qrSize, tone);
  const leftX = 56 + 34;
  const leftW = qrX - leftX - 26;
  ctx.fillStyle = CARD_GOLD;
  ctx.font = `700 29px ${SANS}`;
  ctx.fillText(clampLines(ctx, [card.cta ?? 'Leia no app'], 1, leftW)[0], leftX, footerTop + 60);
  ctx.fillStyle = CARD_CREAM;
  ctx.font = `700 50px ${SERIF}`;
  ctx.fillText(SITE_NAME, leftX, footerTop + 120);
  let linkSize = 30;
  const link = shortSiteUrl();
  for (; linkSize >= 22; linkSize--) {
    ctx.font = `600 ${linkSize}px ${SANS}`;
    if (ctx.measureText(link).width <= leftW) break;
  }
  ctx.fillText(link, leftX, footerTop + 170);
  ctx.fillStyle = 'rgba(255, 248, 236, 0.8)';
  ctx.font = `500 25px ${SANS}`;
  ctx.fillText('Grátis · funciona sem internet', leftX, footerTop + 216);

  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Não foi possível gerar a imagem'))), 'image/png');
  });
}
