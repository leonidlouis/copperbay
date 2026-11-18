// Solaris Beach: swimmable-looking shallows, a public promenade and marina furniture.
import { hash, TAU } from './math.js';
export function drawCoast(p, state) {
  const { ground, line, project, ctx } = p, night = state.night > .5;
  ground(-1800, 100, 1960, 3900, night ? '#255f6c' : '#45b9b5');
  ground(-420, 650, 270, 1930, night ? '#428b8b' : '#74d9ca');
  ground(-205, 680, 75, 1870, night ? '#70a49b' : '#b1ebd3');
  ground(-165, 690, 340, 1850, night ? '#a29f85' : '#f4d4a0');
  ground(-145, 710, 310, 1810, night ? '#b0a58a' : '#ffe2aa');
  ground(135, 650, 98, 1950, night ? '#a28d77' : '#e9b98c', 3);
  for (let y = 660; y < 2600; y += 17) line(138, y, 230, y, '#b88a6244', 1, 4);
  for (let y = 680; y < 2590; y += 42) {
    line(138, y, 138, y + 32, '#fff0c6', 2, 15);
    line(139, y, 139, y, '#fff0c6', 3, 27);
  }
  // Quiet foam lines curl into the sand; short highlights read at a distance.
  for (let i = 0; i < 170; i++) {
    const x = -980 + hash(i, 7) * 800, y = 400 + hash(i, 9) * 2400;
    line(x, y, x + 12 + hash(i, 5) * 45, y, i % 4 ? '#e4fff064' : '#ffe5a6ba', i % 4 ? 1 : 2);
  }
  for (let i = 0; i < 46; i++) {
    const y = 700 + i * 39, x = -173 + Math.sin(i * .7) * 12;
    line(x, y, x + 15, y + 29, '#fffbe2b0', 3);
    const q = project(-90 + hash(i, 4) * 200, y + 10);
    ctx.fillStyle = '#c7975a55'; ctx.fillRect(q.x, q.y, 2, 1);
  }
  ground(-235, 2260, 390, 65, '#d6aa7d', 5);
  for (let x = -230; x < 155; x += 17) line(x, 2260, x, 2325, '#ab7f5c', 1, 6);
  // A raised freight apron keeps the container yard clear of Ocean Drive.
  ground(-130, 2750, 320, 740, '#c8b598', 5);
  line(-130, 2750, -130, 3490, '#f8e1ab', 3, 6);
  for (let y = 2770; y < 3490; y += 85) {
    ground(-125, y, 8, 12, '#536d6b', 8);
    line(-126, y + 8, -153, y + 30, '#d9c49c', 2, 6);
  }
  const sign = project(180, 1575, 1);
  ctx.save(); ctx.translate(sign.x, sign.y); ctx.transform(.86, .48, -.86, .48, 0, 0);
  p.text('SOLARIS  •  OCEAN DRIVE', 0, 0, 19, '#886849', '900', 'center'); ctx.restore();
}
export function coastObjects() {
  const objects = [];
  for (let i = 0; i < 12; i++) objects.push({ x: -65 + (i % 2) * 105, y: 820 + i * 137, type: 'umbrella', color: ['#f77966', '#49b9ac', '#f8c95c'][i % 3] });
  objects.push({ x: 98, y: 1380, type: 'lifeguard' }, { x: 210, y: 2010, type: 'kiosk' });
  for (let i = 0; i < 5; i++) objects.push({ x: -310 - (i % 2) * 70, y: 2600 + i * 205, type: 'yacht', color: '#fff5db' });
  return objects;
}
export function drawCoastObject(p, o) {
  const { x, y } = o, { ground, project, poly, line } = p;
  if (o.type === 'umbrella') {
    poly([project(x - 30, y - 20), project(x + 30, y - 20), project(x + 94, y + 67), project(x + 52, y + 96), project(x + 16, y + 72)], '#9f80552b');
    ground(x - 12, y + 24, 18, 40, '#fff1cf', 3); ground(x + 14, y + 24, 18, 40, '#f2bb86', 3);
    const top = project(x, y, 49); line(x, y, x, y, '#9c7853', 2, 48);
    const base = project(x, y); p.ctx.strokeStyle = '#a37d50'; p.ctx.lineWidth = 2; p.ctx.beginPath(); p.ctx.moveTo(top.x, top.y); p.ctx.lineTo(base.x, base.y); p.ctx.stroke();
    for (let i = 0; i < 8; i++) {
      const a = i * TAU / 8, b = (i + 1) * TAU / 8;
      poly([top, project(x + Math.cos(a) * 35, y + Math.sin(a) * 35, 35), project(x + Math.cos(b) * 35, y + Math.sin(b) * 35, 35)], i % 2 ? '#fff2cf' : o.color);
    }
  } else if (o.type === 'lifeguard' || o.type === 'kiosk') {
    const h = o.type === 'lifeguard' ? 28 : 0;
    for (const dx of [-16, 16]) for (const dy of [-14, 14]) p.prism(x + dx, y + dy, 4, 4, h + 5, '#ebcaa1', '#ac805c', '#95734f');
    p.prism(x - 25, y - 20, 50, 40, 29, '#ffddaf', '#efb28c', '#d58d79', h);
    ground(x - 29, y - 24, 58, 48, '#fc836d', h + 31);
    ground(x - 18, y + 21, 25, 4, '#51a9ad', h + 18);
    const q = project(x, y + 22, h + 23); p.text(o.type === 'lifeguard' ? 'LIFEGUARD' : 'SURF & SIP', q.x, q.y, 8 * p.view.zoom, '#fff2cf', '900', 'center');
    if (h) {
      const base = project(x + 25, y + 60), top = project(x + 25, y + 21, 28);
      for (const dx of [-5, 5]) { p.ctx.strokeStyle = '#f9dfae'; p.ctx.lineWidth = 2; p.ctx.beginPath(); p.ctx.moveTo(base.x + dx, base.y); p.ctx.lineTo(top.x + dx, top.y); p.ctx.stroke(); }
      for (let i = 1; i < 6; i++) { const f = i / 6; p.ctx.beginPath(); p.ctx.moveTo(base.x + (top.x - base.x) * f - 5, base.y + (top.y - base.y) * f); p.ctx.lineTo(base.x + (top.x - base.x) * f + 5, base.y + (top.y - base.y) * f); p.ctx.stroke(); }
      const cross = project(x, y + 21, 39); p.text('+', cross.x, cross.y, 20 * p.view.zoom, '#fff0cf', '900', 'center');
    }
  } else {
    poly([project(x - 23, y - 55, 5), project(x + 23, y - 55, 5), project(x + 26, y + 40, 5), project(x, y + 78, 5), project(x - 26, y + 40, 5)], '#fff5dd', '#bdd7cc');
    p.prism(x - 15, y - 25, 30, 52, 15, '#ffddab', '#e8d6b4', '#c9d4c6', 7);
    ground(x - 12, y - 18, 24, 30, '#397c8d', 24);
    ground(x - 11, y + 33, 22, 18, '#dcb28b', 7);
  }
}
