import { BEACH_EDGE } from './city.js';
import { hash, TAU } from './math.js';

function shoreline(y) {
  return BEACH_EDGE + Math.sin(y * .014) * 9 + Math.sin(y * .032) * 4;
}

export function drawWaterfront(p, state) {
  const { ctx, project, ground, poly, line } = p;
  const deep = state.night > .45 ? '#245967' : '#2b929c';
  ctx.fillStyle = deep;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const shore = project(BEACH_EDGE, 1000);
  const shallows = ctx.createLinearGradient(shore.x - 99, shore.y - 176, shore.x, shore.y);
  shallows.addColorStop(0, deep);
  shallows.addColorStop(.45, state.night > .45 ? '#377e80' : '#46b8af');
  shallows.addColorStop(1, state.night > .45 ? '#67a69b' : '#87d8b8');
  ground(-900, 245, 1050, 2225, shallows);

  for (let i = 0; i < 1050; i++) {
    const y = 230 + hash(i, 17) * 3770, x = -1560 + hash(i, 29) * 1440;
    const length = 5 + hash(i, 63) ** 3 * 83;
    line(x, y, x + 1, y + length, i % 5 ? '#d8f4cd43' : '#fff2c695', i % 11 ? .8 : 2.2);
  }

  const ys = Array.from({ length: 112 }, (_, i) => 245 + i * 20);
  const shoreRibbon = (left, right, color) => {
    const edge = ys.map(y => project(shoreline(y) + left, y));
    const other = ys.map(y => project(shoreline(y) + right, y)).reverse();
    poly([...edge, ...other], color);
  };
  shoreRibbon(-25, 275, '#b6dfb3a9');
  shoreRibbon(-10, 275, '#edf2c3cb');
  shoreRibbon(-3, 275, '#fff8d4');
  shoreRibbon(4, 275, '#d5a773');
  shoreRibbon(23, 275, '#f0cb97');
  for (let i = 0; i < 440; i++) {
    const y = 253 + hash(i, 13) * 2200;
    const x = shoreline(y) + 31 + hash(i, 28) * 242;
    line(x, y, x + 1, y + 3 + hash(i, 8) * 11, i % 2 ? '#c5814c33' : '#fff4c46e', 1.2);
  }

}

export function drawPromenade(p) {
  const { ground, line } = p;
  ground(156, 227, 78, 2274, '#b77556', -1);
  ground(160, 227, 74, 2274, '#eac39a', 2);
  ground(221, 227, 13, 2274, '#f9e0b3', 3);
  for (let y = 233; y < 2490; y += 14) line(160, y, 223, y, '#a8755a3b', 1, 3);
  for (let y = 250; y < 2490; y += 54) {
    line(188, y, 188, y + 14, '#fff0c55a', 1.5, 3);
    ground(159, y, 3, 22, '#8e75628c', 2);
  }
}

export function drawBeachProp(p, prop, state) {
  const { x, y, type } = prop, { ctx, project, poly, prism } = p;
  if (type === 'parasol') {
    const radius = 24 + hash(y, x) * 8, height = 36;
    const center = project(x, y, height + 9), foot = project(x, y);
    const shade = project(x + state.light.dx * height, y + state.light.dy * height);
    ctx.fillStyle = '#60424b30'; ctx.beginPath(); ctx.ellipse(shade.x, shade.y, radius * .9 * p.view.zoom, radius * .44 * p.view.zoom, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#875e4f'; ctx.lineWidth = 2 * p.view.zoom; ctx.beginPath(); ctx.moveTo(foot.x, foot.y); ctx.lineTo(center.x, center.y); ctx.stroke();
    const color = y % 3 === 0 ? '#40aaa5' : y % 3 === 1 ? '#ed8164' : '#edb65a';
    for (let n = 0; n < 10; n++) {
      const a = n * TAU / 10, b = (n + 1) * TAU / 10;
      poly([center, project(x + Math.cos(a) * radius, y + Math.sin(a) * radius, height), project(x + Math.cos(b) * radius, y + Math.sin(b) * radius, height)], n % 2 ? color : '#fff3cd');
    }
    p.ground(x + radius * .7, y + 12, 16, 9, color, 3, '#fff6d6');
    p.ground(x + radius * .7, y - 13, 16, 9, '#fff0c9', 3, color);
  } else if (type === 'sailboat') {
    const z = Math.sin(state.elapsed * 1.6 + y) * 1.8;
    poly([project(x - 23, y + 30), project(x + 6, y + 57), project(x + 16, y - 35)], '#1b726b4a');
    poly([project(x - 10, y + 30, 3 + z), project(x + 10, y + 34, 3 + z), project(x + 15, y - 18, 5 + z), project(x + 4, y - 42, 9 + z), project(x - 12, y - 18, 5 + z)], '#fff1d6', '#408a86');
    p.ground(x - 6, y + 5, 13, 19, '#598e89', 6 + z);
    const height = 48 + hash(x, y) * 26;
    poly([project(x, y + 3, height + z), project(x + 1, y + 1, 12 + z), project(x + 2, y + 29, 9 + z)], '#e4d6a7', '#508682');
    poly([project(x, y + 1, height + z), project(x - 3, y - 2, 13 + z), project(x + 2, y - 34, 9 + z)], y % 2 ? '#fff4cc' : '#ffc587', '#fff1d2');
  } else {
    for (const dx of [-14, 14]) for (const dy of [-19, 19]) prism(x + dx, y + dy, 4, 4, 23, '#f8d3a9', '#a36353');
    prism(x - 20, y - 24, 43, 48, 23, '#f5e3ba', '#df7863', '#b96c61', 20);
    p.ground(x - 25, y - 29, 53, 58, '#f4d594', 45, '#f9efd1');
    p.line(x - 19, y + 25, x + 10, y + 25, '#fff3c2', 3, 33);
  }
}

export function drawSurf(p, elapsed) {
  for (let i = 0; i < 74; i++) {
    const y = 260 + i * 29, x = shoreline(y);
    if (!p.visible(x, y, 100)) continue;
    const wave = (elapsed * 19 + hash(i, 79) * 42) % 42;
    const start = x - 47 + wave;
    const end = shoreline(y + 10) - 47 + wave;
    const alpha = Math.sin(wave / 42 * Math.PI) * .58;
    p.line(start, y, end, y + 12 + hash(i, 42) * 15, 'rgba(244,255,211,' + alpha + ')', 1.25);
  }
}
