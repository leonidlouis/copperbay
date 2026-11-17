import { tint } from './painter.js';

// District landmarks are drawn from geometry: working port, radio mast and civic art.
export function drawHarborCrane(p, crane) {
  const { ctx, project, prism } = p;
  const link = (a, b, color, width) => { const u = project(...a), v = project(...b); ctx.strokeStyle = color; ctx.lineWidth = width * p.view.zoom; ctx.beginPath(); ctx.moveTo(u.x, u.y); ctx.lineTo(v.x, v.y); ctx.stroke(); };
  const { x, y } = crane;
  prism(x - 25, y - 28, 50, 55, 12, '#a1b6ad', '#6f9191', '#4e747d');
  for (const dx of [-16, 16]) link([x + dx, y, 10], [x + dx, y, 170], '#dea96a', 5);
  for (let z = 15; z < 170; z += 28) { link([x - 16, y, z], [x + 16, y, z + 28], '#bb956b', 2); link([x + 16, y, z], [x - 16, y, z + 28], '#bb956b', 2); }
  link([x + 85, y, 170], [x - 220, y, 170], '#e9b976', 8);
  link([x + 85, y, 188], [x - 220, y, 188], '#e9b976', 3);
  for (let dx = -220; dx < 85; dx += 31) { link([x + dx, y, 170], [x + dx + 30, y, 188], '#cf9f6b', 2); link([x + dx + 30, y, 188], [x + dx + 30, y, 170], '#cf9f6b', 1); }
  link([x - 170, y, 170], [x - 170, y, 35], '#b0c6c1', 1.3);
  link([x - 170, y, 35], [x - 178, y, 27], '#e7bc78', 3);
  prism(x + 12, y - 13, 28, 25, 26, '#c9ad7e', '#ae9470', '#717f7b', 130);
  const q = project(x - 10, y, 195); p.circle(q.x, q.y, 3, '#ff8e82'); p.glow(q.x, q.y, 17, '#ff8e82', .5);
}
export function drawRadioMast(p, mast, state) {
  const { x, y } = mast, { ctx, project } = p;
  const a = project(x, y), b = project(x, y, 180);
  ctx.strokeStyle = '#b9b6a4'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(a.x - 17, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(a.x + 17, a.y); ctx.stroke();
  for (let i = 1; i < 9; i++) {
    const z = i * 19, r = 17 * (1 - z / 180), q = project(x, y, z);
    ctx.strokeStyle = i % 2 ? '#db8b7f' : '#bdc4b0'; ctx.beginPath(); ctx.moveTo(q.x - r, q.y); ctx.lineTo(q.x + r, q.y - 14); ctx.stroke();
  }
  for (const side of [-1, 1]) {
    ctx.strokeStyle = '#70b4b7'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(b.x, b.y + 25); ctx.lineTo(a.x + side * 63, a.y + 15); ctx.stroke();
  }
  p.glow(b.x, b.y, 17, '#ff8d86', .5); p.circle(b.x, b.y, 3, '#ffd4aa');
}
export function drawShippingContainer(p, cargo) {
  const { x, y, color } = cargo;
  p.prism(x, y, 100, 39, 28, color, tint(color, .78), tint(color, .68));
  for (let k = 5; k < 98; k += 6) {
    const a = p.project(x + k, y + 39.5, 2), b = p.project(x + k, y + 39.5, 26);
    p.ctx.strokeStyle = k % 2 ? '#f2cf9942' : '#32273b23'; p.ctx.lineWidth = 1;
    p.ctx.beginPath(); p.ctx.moveTo(a.x, a.y); p.ctx.lineTo(b.x, b.y); p.ctx.stroke();
  }
  p.ground(x + 3, y + 3, 94, 33, color, 28.5, '#f5d9a67c');
  const q = p.project(x + 50, y + 19, 29);
  const z = p.view.zoom;
  p.ctx.save(); p.ctx.translate(q.x, q.y);
  p.ctx.transform(.86 * z, .48 * z, -.86 * z, .48 * z, 0, 0);
  p.text(color === '#cb7156' ? 'MERIDIAN' : color === '#559e99' ? 'BAY LINE' : 'PIER 09', 0, 3.5, 13, '#f9e7bead', '900', 'center');
  p.ctx.restore();
}

export function drawPortGround(p) {
  p.ground(-84, 2680, 273, 1020, '#baaa8b', -1);
  for (let y = 2688; y < 3700; y += 38) p.line(-78, y, 191, y, '#8e81704f');
  p.line(-84, 2680, -84, 3700, '#f1ce96', 5);
  for (let y = 2694; y < 3700; y += 27) {
    p.line(-76, y, -61, y + 9, '#f6d185', 4);
    p.line(175, y, 190, y + 9, '#f3cd81', 3);
  }
  for (let y = 2740; y <= 3530; y += 260) {
    p.ground(-328, y, 258, 76, '#b3a083', 7, '#e3cca3');
    for (let x = -320; x < -75; x += 28) p.line(x, y, x, y + 76, '#776d624d', 1.4, 8);
    p.ground(-282, y + 99, 155, 41, '#f5e1bc', 5, '#638c87');
    p.ground(-259, y + 105, 94, 29, '#668a85', 9);
    p.ground(-221, y + 110, 32, 20, '#dfba92', 12);
  }
}
