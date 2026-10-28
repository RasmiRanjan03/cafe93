import * as THREE from 'three';

const CHARCOAL = '#151515';
const CREAM = '#F6F0E8';
const CHILI = '#E53935';
const GOLD = '#FFC857';

function paperGrain(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * amount;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
}

/** Simple pleated momo glyph used in the logo. */
function momoGlyph(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, fill: string, line: string) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = fill;
  ctx.strokeStyle = line;
  ctx.lineWidth = s * 0.07;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(-s, s * 0.45);
  ctx.quadraticCurveTo(-s * 1.05, -s * 0.2, -s * 0.15, -s * 0.85);
  ctx.quadraticCurveTo(0, -s * 1.05, s * 0.15, -s * 0.85);
  ctx.quadraticCurveTo(s * 1.05, -s * 0.2, s, s * 0.45);
  ctx.quadraticCurveTo(0, s * 0.75, -s, s * 0.45);
  ctx.fill();
  ctx.stroke();
  // pleats
  ctx.lineWidth = s * 0.06;
  for (const k of [-0.5, -0.17, 0.17, 0.5]) {
    ctx.beginPath();
    ctx.moveTo(k * s * 0.35, -s * 0.8);
    ctx.quadraticCurveTo(k * s * 1.2, -s * 0.3, k * s * 1.35, s * 0.15);
    ctx.stroke();
  }
  ctx.restore();
}

function logoBlock(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  // red badge behind "93"
  ctx.fillStyle = CHILI;
  ctx.beginPath();
  ctx.arc(0, -10, 150, 0, Math.PI * 2);
  ctx.fill();

  momoGlyph(ctx, 0, -95, 46, CREAM, CHARCOAL);

  ctx.fillStyle = CREAM;
  ctx.font = '700 150px "Space Grotesk", "Arial Black", Arial, sans-serif';
  ctx.fillText('93', 0, 85);

  ctx.fillStyle = CHARCOAL;
  ctx.font = '700 84px "Space Grotesk", "Arial Black", Arial, sans-serif';
  ctx.fillText('CAFE', 0, -190);

  ctx.font = '600 26px "Space Grotesk", Arial, sans-serif';
  ctx.fillStyle = CHARCOAL;
  ctx.fillText('STEAMED · STUFFED · UNFORGETTABLE', 0, 205);
  ctx.restore();
}

/**
 * Wrap-around print for the bucket body.
 * u = 0.5 is the front (faces the camera), u = 0 / 1 is the back.
 */
export function createBucketTexture(anisotropy = 4): THREE.CanvasTexture {
  const w = 2048;
  const h = 680;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

  const draw = () => {
    ctx.fillStyle = CREAM;
    ctx.fillRect(0, 0, w, h);

    // top and bottom bands
    ctx.fillStyle = CHARCOAL;
    ctx.fillRect(0, 0, w, 46);
    ctx.fillStyle = CHILI;
    ctx.fillRect(0, h - 120, w, 120);
    ctx.fillStyle = GOLD;
    ctx.fillRect(0, h - 132, w, 12);

    // repeating small text in the bottom band
    ctx.fillStyle = CREAM;
    ctx.font = '700 40px "Space Grotesk", Arial, sans-serif';
    ctx.textBaseline = 'middle';
    const tag = 'MOMO BUCKET  ✦  CAFE 93  ✦  ';
    const tw = ctx.measureText(tag).width;
    for (let x = -tw / 2; x < w; x += tw) ctx.fillText(tag, x, h - 60);

    // faint scattered momo icons for texture
    ctx.globalAlpha = 0.08;
    for (let i = 0; i < 26; i++) {
      const x = (i * 211) % w;
      const y = 110 + ((i * 97) % 380);
      if (Math.abs(x - w / 2) < 360) continue; // keep the front logo clean
      momoGlyph(ctx, x, y, 34, CHARCOAL, CHARCOAL);
    }
    ctx.globalAlpha = 1;

    // front logo (u = 0.5) and smaller back logo (u = 0 wraps to 1)
    logoBlock(ctx, w / 2, 330, 1);
    logoBlock(ctx, 0, 330, 0.62);
    logoBlock(ctx, w, 330, 0.62);

    paperGrain(ctx, w, h, 10);
  };

  draw();
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = anisotropy;
  // redraw once web fonts are ready so the wordmark uses Space Grotesk
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      draw();
      tex.needsUpdate = true;
    });
  }
  return tex;
}

/** Round print for the top of the lid. */
export function createLidTexture(): THREE.CanvasTexture {
  const s = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = s;
  canvas.height = s;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

  const draw = () => {
    ctx.clearRect(0, 0, s, s);
    ctx.fillStyle = CHILI;
    ctx.beginPath();
    ctx.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = CREAM;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(s / 2, s / 2, s / 2 - 40, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = CREAM;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '700 330px "Space Grotesk", "Arial Black", Arial, sans-serif';
    ctx.fillText('93', s / 2, s / 2 + 40);
    ctx.font = '700 92px "Space Grotesk", Arial, sans-serif';
    ctx.fillText('CAFE', s / 2, s / 2 - 220);
    ctx.font = '600 50px "Space Grotesk", Arial, sans-serif';
    ctx.fillText('HOT · FRESH · MOMOS', s / 2, s / 2 + 260);
    paperGrain(ctx, s, s, 8);
  };
  draw();
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      draw();
      tex.needsUpdate = true;
    });
  }
  return tex;
}

/** Soft radial blob used for cheap ground shadows and glows. */
export function createRadialTexture(inner = 'rgba(0,0,0,0.75)', outer = 'rgba(0,0,0,0)'): THREE.CanvasTexture {
  const s = 256;
  const canvas = document.createElement('canvas');
  canvas.width = s;
  canvas.height = s;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  return new THREE.CanvasTexture(canvas);
}
