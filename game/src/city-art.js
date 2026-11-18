import { drawCoast } from './seaside.js';
import { ROAD_CENTERS, CITY_SIZE } from './city.js';
import { hash, TAU } from './math.js';
import { tint } from './painter.js';
export function drawCityGround(p, state) {
  const { ctx, project, poly, ground, line, visible } = p;
  ctx.fillStyle = state.night > .5 ? '#173645' : '#45b9b5'; ctx.fillRect(0, 0, 1280, 800);
  // Sea and little gold reflections extend beyond the explorable coastline.
  for (let i = 0; i < 90; i++) {
    const x = -500 + hash(i, 6) * 900, y = hash(i, 3) * 4900;
    line(x, y, x + 30 + hash(i, 5) * 70, y, '#629e9d66', 1);
  }
  ground(190, 190, 3790, 3790, state.night > .5 ? '#627c7c' : '#e5c9a0');
  drawCoast(p, state);
  // Seawall and boardwalk.
  ground(163, 170, 27, 3800, '#b5b59d', 5); ground(190, 3945, 3780, 27, '#c0b397', 5);
  for (let y = 200; y < 3900; y += 25) line(165, y, 191, y, '#7d8a83', 1, 6);
  for (let i = 0; i < 4; i++) {
    const y = 2720 + i * 260;
    ground(-155, y, 345, 85, '#7f8f86', 8);
    for (let k = 0; k < 12; k++) line(-150 + k * 28, y, -150 + k * 28, y + 85, '#536f72', 1, 9);
    ground(-85, y + 105, 115, 43, '#eef2dc', 5); ground(-65, y + 115, 70, 23, '#3d6877', 11);
  }
  for (const c of ROAD_CENTERS) {
    ground(c - 75, 190, 150, 3790, '#687c79'); ground(190, c - 75, 3790, 150, '#687c79');
    line(c - 76, 200, c - 76, 3940, '#cbd2b2', 2); line(c + 76, 200, c + 76, 3940, '#cbd2b2', 2);
    line(200, c - 76, 3940, c - 76, '#cbd2b2', 2); line(200, c + 76, 3940, c + 76, '#cbd2b2', 2);
    for (let v = 200; v < 3940; v += 52) {
      if (ROAD_CENTERS.some(r => Math.abs(v - r) < 105)) continue;
      line(c - 3, v, c - 3, v + 27, '#e2b56c', 1.3); line(c + 3, v, c + 3, v + 27, '#e2b56c', 1.3);
      line(v, c - 3, v + 27, c - 3, '#e2b56c', 1.3); line(v, c + 3, v + 27, c + 3, '#e2b56c', 1.3);
      line(c - 54, v, c - 54, v + 27, '#b9cac74a', 1); line(c + 54, v, c + 54, v + 27, '#b9cac74a', 1);
      line(v, c - 54, v + 27, c - 54, '#b9cac74a', 1); line(v, c + 54, v + 27, c + 54, '#b9cac74a', 1);
    }
  }
  for (const x of ROAD_CENTERS) for (const y of ROAD_CENTERS) {
    if (!visible(x, y, 180)) continue;
    ground(x - 72, y - 72, 144, 144, '#6c807c');
    for (let k = -56; k <= 56; k += 16) {
      ground(x + k, y - 104, 9, 27, '#d7d6bf'); ground(x + k, y + 77, 9, 27, '#d7d6bf');
      ground(x - 104, y + k, 27, 9, '#d7d6bf'); ground(x + 77, y + k, 27, 9, '#d7d6bf');
    }
    line(x - 70, y - 112, x - 8, y - 112, '#c5d1c7', 2);
    line(x + 70, y + 112, x + 8, y + 112, '#c5d1c7', 2);
    // Small turn arrows and traffic islands make the junctions legible.
    poly([project(x - 33, y - 145), project(x - 42, y - 130), project(x - 25, y - 130)], '#c6cdb7');
    poly([project(x + 33, y + 145), project(x + 42, y + 130), project(x + 25, y + 130)], '#c6cdb7');
  }
  for (const park of state.city.parks) {
    ground(park.x, park.y, park.w, park.d, '#4a7771');
    ground(park.x + 119, park.y + 8, 30, 264, '#a8a88c');
    ground(park.x + 8, park.y + 119, 264, 30, '#a8a88c');
    p.prism(park.x + 103, park.y + 103, 62, 62, 8, '#b9c9ad', '#829e94', '#698c89');
    ground(park.x + 111, park.y + 111, 46, 46, '#62c9c0', 9);
    const q = project(park.x + 134, park.y + 134, 16); p.glow(q.x, q.y, 35, '#81e8dc', .25);
  }
  for (let i = 0; i < 100; i++) {
    const x = 230 + hash(i, 13) * 3650, y = 230 + hash(i, 15) * 3650;
    if (!visible(x, y)) continue;
    const q = project(x, y); ctx.fillStyle = '#102d3c15'; ctx.fillRect(q.x, q.y, 15 + hash(i, 2) * 20, 1);
  }

}
export function drawBuilding(p, b, state) {
  const { ctx, project, poly, ground, line, prism } = p;
  const light = 1 - state.night * .23;
  const shadow = b.h * .78;
  poly([project(b.x, b.y + b.d), project(b.x + b.w, b.y), project(b.x + b.w + shadow, b.y + shadow), project(b.x + b.w + shadow, b.y + b.d + shadow), project(b.x + shadow, b.y + b.d + shadow)], '#736b7c32');
  prism(b.x, b.y, b.w, b.d, b.h, tint(b.roof, light), tint(b.color, light * 1.02), tint(b.color, light * .84));
  // Colored shop-front panels, lit windows, and repeated floors on both visible walls.
  for (let f = 0; f < b.floors; f++) {
    const z = 12 + f * 23;
    for (let k = 15; k < b.w - 12; k += 24) {
      const color = hash(b.id * 3 + k, f) > .35 ? (f === 0 ? b.neon : '#ffdc9b') : '#63999d';
      poly([project(b.x + k, b.y + b.d + .4, z), project(b.x + k + 13, b.y + b.d + .4, z), project(b.x + k + 13, b.y + b.d + .4, z + 11), project(b.x + k, b.y + b.d + .4, z + 11)], color);
    }
    for (let k = 17; k < b.d - 10; k += 30) {
      const color = hash(b.id + k, f * 7) > .5 ? '#eacfa0' : '#4f858b';
      poly([project(b.x + b.w + .4, b.y + k, z), project(b.x + b.w + .4, b.y + k + 14, z), project(b.x + b.w + .4, b.y + k + 14, z + 11), project(b.x + b.w + .4, b.y + k, z + 11)], color);
    }
  }
  line(b.x, b.y + b.d, b.x + b.w, b.y + b.d, '#f8d0a2', 2, b.h + 1);
  line(b.x + b.w, b.y, b.x + b.w, b.y + b.d, '#e5b795', 2, b.h + 1);
  // Parapets, rooftop utility rooms, fans and ducting.
  ground(b.x + 7, b.y + 7, b.w - 14, b.d - 14, tint(b.roof, light * 1.02), b.h + 1, '#d6bca177');
  prism(b.x + 16, b.y + 18, Math.min(53, b.w - 30), 42, 10, '#8ca3a1', '#657e83', '#4c6775', b.h + 2);
  for (let k = 0; k < 2; k++) {
    const q = project(b.x + 28 + k * 22, b.y + 36, b.h + 14); p.circle(q.x, q.y, 6 * p.view.zoom, '#435e69');
    const t = state.elapsed * 2 + k;
    ctx.strokeStyle = '#9badaa'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(q.x - Math.cos(t) * 5, q.y - Math.sin(t) * 3); ctx.lineTo(q.x + Math.cos(t) * 5, q.y + Math.sin(t) * 3); ctx.stroke();
  }
  if (b.w > 200) {
    ground(b.x + 110, b.y + 50, 100, 65, '#244c61', b.h + 2, '#8ab4ad');
    for (let k = 1; k < 5; k++) line(b.x + 110 + k * 20, b.y + 50, b.x + 110 + k * 20, b.y + 115, '#6e9fa4', 1, b.h + 3);
    line(b.x + 110, b.y + 83, b.x + 210, b.y + 83, '#6e9fa4', 1, b.h + 3);
  }
  if (b.id % 4 === 0) {
    prism(b.x + b.w - 50, b.y + b.d - 65, 28, 33, 17, '#d5c7a5', '#988f82', '#797e7e', b.h + 2);
    line(b.x + b.w - 33, b.y + b.d - 50, b.x + b.w - 33, b.y + b.d - 50, '#d2c4a7', 1, b.h + 40);
  }
  // Rooftop terraces, pools and storefront awnings distinguish the neighborhoods.
  if (b.variant === 'villa') {
    ground(b.x + 22, b.y + 94, Math.min(75, b.w - 35), 75, '#d4c7a1', b.h + 3);
    ground(b.x + 28, b.y + 101, Math.min(62, b.w - 47), 60, '#50bcb6', b.h + 4, '#a9e4d2');
    for (let k = 0; k < 3; k++) ground(b.x + 31, b.y + 108 + k * 17, Math.min(48, b.w - 55), 2, '#b3e9ca80', b.h + 5);
  } else if (b.id % 3 === 0) {
    for (let k = 0; k < 3; k++) {
      prism(b.x + 17 + k * 25, b.y + b.d - 40, 19, 19, 6, '#b4a785', '#8b8570', '#6a796d', b.h + 2);
      const q = project(b.x + 26 + k * 25, b.y + b.d - 30, b.h + 13); p.circle(q.x, q.y, 7 * p.view.zoom, '#4e8871'); p.circle(q.x - 3, q.y - 3, 4 * p.view.zoom, '#72a782');
    }
    ground(b.x + b.w - 46, b.y + b.d - 105, 24, 46, '#e8c997', b.h + 3);
  }
  if (b.variant === 'warehouse') {
    for (let k = 12; k < b.w - 10; k += 7) line(b.x + k, b.y + 15, b.x + k, b.y + b.d - 15, '#d9b89335', 1, b.h + 3);
    for (let k = 9; k < b.w - 45; k += 52) {
      poly([project(b.x + k, b.y + b.d + .5, 0), project(b.x + k + 42, b.y + b.d + .5, 0), project(b.x + k + 42, b.y + b.d + .5, 23), project(b.x + k, b.y + b.d + .5, 23)], '#3d626e');
      for (let z = 4; z < 23; z += 4) line(b.x + k, b.y + b.d + 1, b.x + k + 42, b.y + b.d + 1, '#7b9695', 1, z);
    }
  } else {
    const awningW = Math.min(85, b.w - 20), ax = b.x + 10, ay = b.y + b.d;
    for (let k = 0; k < awningW; k += 12) {
      poly([project(ax + k, ay, 21), project(ax + Math.min(k + 12, awningW), ay, 21), project(ax + Math.min(k + 12, awningW), ay + 22, 16), project(ax + k, ay + 22, 16)], (k / 12) % 2 < 1 ? b.neon : '#e2d9b8');
    }
    for (let k = 6; k < awningW; k += 20) ground(ax + k, ay + 6, 9, 9, '#796c62', 2);
    // Individual lintels and recessed doors give the facades a human scale.
    poly([project(b.x + b.w - 27, ay + 1, 0), project(b.x + b.w - 12, ay + 1, 0), project(b.x + b.w - 12, ay + 1, 22), project(b.x + b.w - 27, ay + 1, 22)], '#183e50');
    ground(b.x + b.w - 31, ay + 1, 24, 10, '#b9ab90', 2);
  }
  // Roof antennas and a few tall commercial billboards break the skyline.
  if (b.id % 7 === 1) {
    const q = project(b.x + b.w / 2, b.y + 30, b.h + 42);
    const base = project(b.x + b.w / 2, b.y + 30, b.h + 1);
    ctx.strokeStyle = '#687d7e'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(q.x - 24, q.y + 23); ctx.lineTo(base.x - 24, base.y); ctx.moveTo(q.x + 24, q.y + 23); ctx.lineTo(base.x + 24, base.y); ctx.stroke();
    ctx.fillStyle = '#1a414f'; ctx.fillRect(q.x - 51, q.y - 16, 102, 37); ctx.strokeStyle = b.neon; ctx.lineWidth = 2; ctx.strokeRect(q.x - 49, q.y - 14, 98, 33);
    p.text(b.variant === 'strip' ? 'GOOD TIMES' : 'BAY 88.4', q.x, q.y + 7, 12, b.neon, '900', 'center');
  }
  // A hanging sign on the street-facing facade, painted in the same projection.
  const q = project(b.x + 7, b.y + b.d + 1, Math.min(b.h - 4, 28));
  ctx.save(); ctx.translate(q.x, q.y); ctx.transform(.86 * p.view.zoom, .48 * p.view.zoom, 0, p.view.zoom, 0, 0);
  const sw = b.w - 14;
  ctx.fillStyle = '#173240'; ctx.fillRect(0, -20, sw, 23);
  ctx.strokeStyle = b.neon; ctx.lineWidth = 1.5; ctx.strokeRect(2, -18, sw - 4, 19);
  ctx.shadowBlur = 7; ctx.shadowColor = b.neon;
  p.text(b.sign, sw / 2, -3, Math.min(16, sw / (b.sign.length * .62)), b.neon, '800', 'center');
  ctx.restore();
  if (state.night > .2) {
    const g = project(b.x + b.w / 2, b.y + b.d + 25); p.glow(g.x, g.y, b.w * .45, b.neon, .10 * state.night);
  }
}
export function drawPalm(p, t) {
  const { ctx, project, line, poly } = p;
  const h = t.park ? 37 : 56, q = project(t.x, t.y, h), base = project(t.x, t.y);
  poly([project(t.x, t.y), project(t.x + 82, t.y + 63), project(t.x + 104, t.y + 48)], '#153a3f33');
  ctx.strokeStyle = '#8a8b67'; ctx.lineWidth = 5 * p.view.zoom; ctx.beginPath(); ctx.moveTo(base.x, base.y); ctx.quadraticCurveTo(base.x - 5, base.y - h * .5 * p.view.zoom, q.x + 3, q.y); ctx.stroke();
  p.circle(q.x, q.y, 7 * p.view.zoom, '#376e63');
  for (let k = 0; k < 7; k++) {
    const a = k * TAU / 7 + hash(t.x, t.y) * 3;
    const dx = Math.cos(a) * 29 * p.view.zoom, dy = Math.sin(a) * 15 * p.view.zoom;
    poly([{ x: q.x, y: q.y }, { x: q.x + dx * .6 - dy * .3, y: q.y + dy * .4 - 8 }, { x: q.x + dx, y: q.y + dy + 7 }, { x: q.x + dx * .45 + dy * .2, y: q.y + dy * .7 }], k % 2 ? '#407f6b' : '#66a07c');
  }
}
export function drawLamp(p, lamp, state) {
  const b = p.project(lamp.x, lamp.y), t = p.project(lamp.x, lamp.y, 66);
  p.ctx.strokeStyle = '#344f5a'; p.ctx.lineWidth = 3 * p.view.zoom; p.ctx.beginPath(); p.ctx.moveTo(b.x, b.y); p.ctx.lineTo(t.x, t.y); p.ctx.lineTo(t.x + 13, t.y - 3); p.ctx.stroke();
  if (state.night > .1) { p.glow(t.x + 13, t.y - 3, 29 * p.view.zoom, '#ffce82', .62); p.glow(b.x + 12, b.y + 5, 65 * p.view.zoom, '#ffcd75', .15); }
  p.circle(t.x + 13, t.y - 3, 3 * p.view.zoom, '#ffdf9c');
}
export function drawStreetProp(p, prop, state) {
  if (prop.type === 'signal') {
    const q = p.project(prop.x, prop.y, 35);
    const b = p.project(prop.x, prop.y); p.ctx.strokeStyle = '#47636a'; p.ctx.lineWidth = 2; p.ctx.beginPath(); p.ctx.moveTo(q.x, q.y); p.ctx.lineTo(b.x, b.y); p.ctx.stroke();
    p.ctx.fillStyle = '#162e3b'; p.ctx.fillRect(q.x - 4, q.y - 9, 8, 19);
    const green = Math.floor(state.elapsed / 6 + prop.x / 480) % 2;
    p.circle(q.x, q.y + (green ? 5 : -4), 2.5, green ? '#8ce3a9' : '#ff7e78');
  } else {
    p.prism(prop.x, prop.y, 28, 13, 8, '#bf9b7b', '#7f7e71', '#616e6c');
    p.prism(prop.x + 40, prop.y + 5, 11, 11, 14, '#7e9d91', '#496d68', '#345a60');
  }
}
