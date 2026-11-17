import { clamp } from './math.js';

export function daylight(time) {
  const hour = Math.abs(time - 12);
  const night = clamp((hour - 5.6) / 2.45, 0, 1);
  const gold = clamp((hour - 2.5) / 3.25, 0, 1) * (1 - night);
  const morning = time < 12;
  return { night, gold, dx: (morning ? -.88 : 1.04) * (.48 + gold), dy: .62 + gold * .48 };
}

export function drawBuildingShadow(p, b, light) {
  const { x, y, w, d, h } = b;
  const dx = h * light.dx, dy = h * light.dy;
  const corners = [[x, y], [x + w, y], [x + w, y + d], [x, y + d]];
  const [a, c, e, f] = corners.map(([x, y]) => p.project(x, y));
  const [j, k, l, m] = corners.map(([x, y]) => p.project(x + dx, y + dy));
  const outline = dx > 0 ? [a, c, k, l, m, f] : [a, c, e, l, m, j];
  const start = p.project(x + w / 2, y + d / 2), end = p.project(x + w / 2 + dx * 1.6, y + d / 2 + dy * 1.6);
  const shade = p.ctx.createLinearGradient(start.x, start.y, end.x, end.y);
  shade.addColorStop(0, '#302b483f'); shade.addColorStop(1, '#302b4815');
  p.poly(outline, shade, '#4037520c', 7);
}

export function drawPalmShadow(p, palm, light) {
  const h = palm.coastal ? 94 : palm.park ? 45 : 64;
  const x = palm.x + h * light.dx, y = palm.y + h * light.dy;
  p.line(palm.x, palm.y, x, y, '#40344d42', 4);
  for (let i = 0; i < 7; i++) {
    const a = i * Math.PI * 2 / 7;
    p.line(x, y, x + Math.cos(a) * 25, y + Math.sin(a) * 24, '#40344d27', 6);
  }
}

export function gradeWorld(p, light) {
  const { ctx } = p;
  if (light.night > 0) {
    ctx.fillStyle = `rgba(17,32,72,${light.night * .36})`;
    ctx.fillRect(0, 0, 1280, 800);
  }
  const sun = ctx.createLinearGradient(0, 0, 950, 660);
  sun.addColorStop(0, `rgba(255,179,102,${.04 + light.gold * .15})`);
  sun.addColorStop(.65, 'rgba(255,213,161,.018)');
  sun.addColorStop(1, 'rgba(31,39,84,.04)');
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, 1280, 800);
}
