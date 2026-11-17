import { clamp } from './math.js';
export function createPainter(canvas, transparent = false) {
  const ctx = canvas.getContext('2d', { alpha: transparent, willReadFrequently: true });
  const view = { x: 1760, y: 1760, zoom: 1, shakeX: 0, shakeY: 0 };
  function project(x, y, z = 0) { return { x: 640 + (x - y - view.x + view.y) * .86 * view.zoom + view.shakeX, y: 415 + (x + y - view.x - view.y) * .48 * view.zoom - z * view.zoom + view.shakeY }; }
  function unproject(x, y) {
    const a = (x - 640 - view.shakeX) / (.86 * view.zoom), b = (y - 415 - view.shakeY) / (.48 * view.zoom);
    return { x: (a + b) / 2 + view.x, y: (b - a) / 2 + view.y };
  }
  function poly(points, fill, stroke, width = 1) {
    ctx.beginPath(); points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(); }
  }
  function ground(x, y, w, d, color, z = 0, stroke = null) { poly([project(x, y, z), project(x + w, y, z), project(x + w, y + d, z), project(x, y + d, z)], color, stroke); }
  function line(x1, y1, x2, y2, color, width = 1, z = 0) {
    const a = project(x1, y1, z), b = project(x2, y2, z); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.strokeStyle = color; ctx.lineWidth = width * view.zoom; ctx.stroke();
  }
  function circle(x, y, r, color) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill(); }
  function glow(x, y, r, color, strength = .5) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, color); g.addColorStop(1, 'transparent'); ctx.globalAlpha = strength; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.globalAlpha = 1;
  }
  function text(value, x, y, size = 16, color = '#fff3dc', weight = '700', align = 'left', font = 'Arial') {
    ctx.fillStyle = color; ctx.font = `${weight} ${size}px ${font}`; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillText(value, x, y);
  }
  function visible(x, y, margin = 220) { const p = project(x, y); return p.x > -margin && p.x < 1280 + margin && p.y > -margin && p.y < 800 + margin; }
  function prism(x, y, w, d, h, top, front = '#456169', side = '#314b59', z = 0) {
    const a = project(x, y, z + h), b = project(x + w, y, z + h), c = project(x + w, y + d, z + h), e = project(x, y + d, z + h);
    poly([b, project(x + w, y, z), project(x + w, y + d, z), c], side);
    poly([e, c, project(x + w, y + d, z), project(x, y + d, z)], front);
    poly([a, b, c, e], top, 'rgba(255,239,210,.15)', .7);
  }
  return { ctx, view, project, unproject, poly, ground, line, circle, glow, text, visible, prism };
}
export function tint(hex, amount) {
  const n = parseInt(hex.slice(1), 16); const f = v => clamp(Math.round(v * amount), 0, 255);
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
}
