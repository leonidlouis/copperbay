import { ROAD_CENTERS } from './city.js';
import { hash } from './math.js';
import { createMesh } from './mesh.js';
// Static architecture, road furniture, waterfront and palms, batched once for WebGL.
export function buildCityGeometry(city) {
  const m = createMesh(), { box, flat, quad, tri, beam } = m;
  flat(-14000, -14000, 30000, 30000, -3, '#4faaa8');
  for (let i = 0; i < 700; i++) {
    const x = -2200 + hash(i, 8) * 2350, y = -1500 + hash(i, 11) * 6500;
    flat(x, y, 8 + hash(i, 5) * 90, 1.2, -2.8, i % 5 ? '#7bc5ba' : '#efdca1', .45);
  }
  box(-170, 2780, -3, 330, 650, 9, '#bea67e');
  flat(160, 175, 3820, 3805, 0, '#dfd2ad');
  box(155, 175, -3, 13, 3780, 11, '#e5d7b3');
  for (let y = 195; y < 3930; y += 52) {
    box(164, y, 7, 3, 3, 17, '#faf0ce');
    beam([165, y, 21], [165, y + 52, 21], .8, '#c0d8c1');
  }
  for (const r of ROAD_CENTERS) {
    flat(r - 75, 190, 150, 3790, .1, '#586568'); flat(190, r - 75, 3790, 150, .12, '#586568');
    for (const side of [-76, 75]) { flat(r + side, 190, 1.5, 3790, .25, '#f7e7be'); flat(190, r + side, 3790, 1.5, .26, '#f7e7be'); }
    for (let v = 205; v < 3920; v += 48) {
      if (ROAD_CENTERS.some(c => Math.abs(v - c) < 113)) continue;
      for (const side of [-2.5, 2.5]) { flat(r + side, v, 1, 26, .3, '#eac57c'); flat(v, r + side, 26, 1, .3, '#eac57c'); }
      for (const side of [-51, 51]) { flat(r + side, v, 1, 24, .3, '#b6c0af'); flat(v, r + side, 24, 1, .3, '#b6c0af'); }
    }
  }
  for (const x of ROAD_CENTERS) for (const y of ROAD_CENTERS) {
    flat(x - 74, y - 74, 148, 148, .35, '#586568');
    for (let k = -62; k < 62; k += 15) {
      for (const s of [-105, 79]) { flat(x + k, y + s, 8, 26, .4, '#f8ebc9'); flat(x + s, y + k, 26, 8, .4, '#f8ebc9'); }
    }
  }
  for (const b of city.buildings) {
    const { x, y, w, d, h } = b;
    // Long blue-green ground shadows give the architecture weight in warm light.
    quad([x, y + d, .48], [x + w, y + d, .48], [x + w + h * .43, y + d + h * .38, .48], [x + h * .43, y + d + h * .38, .48], '#7c8980');
    box(x, y, 0, w, d, h, b.color, '#eee0bd');
    box(x - 2, y - 2, 0, w + 4, d + 4, 5, '#eee2c5');
    box(x - 2, y - 2, h - 4, w + 4, d + 4, 4, '#f7ddba');
    // Windows on all four faces, with inset teal glazing and scattered warm interiors.
    for (let z = 18; z < h - 10; z += 22) {
      for (let k = 12; k < w - 15; k += 23) {
        const color = hash(b.id + k, z) > .66 ? '#ffe2a1' : '#507f88';
        quad([x + k, y - .2, z], [x + k + 11, y - .2, z], [x + k + 11, y - .2, z + 12], [x + k, y - .2, z + 12], color, .25);
        quad([x + k + 11, y + d + .2, z], [x + k, y + d + .2, z], [x + k, y + d + .2, z + 12], [x + k + 11, y + d + .2, z + 12], color, .25);
      }
      for (let k = 14; k < d - 15; k += 25) {
        const color = hash(b.id + k, z) > .64 ? '#ffe2a1' : '#588d94';
        quad([x - .2, y + k + 13, z], [x - .2, y + k, z], [x - .2, y + k, z + 12], [x - .2, y + k + 13, z + 12], color, .25);
        quad([x + w + .2, y + k, z], [x + w + .2, y + k + 13, z], [x + w + .2, y + k + 13, z + 12], [x + w + .2, y + k, z + 12], color, .25);
      }
      if (b.variant === 'tower' && Math.round(z / 22) % 3 === 0) box(x - 1, y - 1, z + 15, w + 2, d + 2, 2, '#ddcdb1');
    }
    if (b.id === 99) {
      for (const v of [10,60]) { box(x-.8,y+v,0,1,36,22,'#365d64'); for (let z=3;z<22;z+=3) box(x-1,y+v,z,.4,36,.5,'#84ada7'); }
      box(x-2,y+5,24,2,d-10,7,'#153f4b');
    }
    // Ground-floor glazing, cornices, doors and striped cafe awnings.
    for (let k = 8; b.id !== 99 && k < d - 22; k += 38) {
      box(x - .7, y + k, 3, 1, 29, 13, '#285661');
      box(x - 9, y + k, 15, 11, 29, 1.6, b.id % 2 ? '#ecaa82' : '#79b7a6');
      box(x - 9, y + k + 10, 15.1, 11, 4, 1.7, '#f4dfb5');
    }
    box(x + 12, y + 15, h, Math.min(48, w - 25), 34, 12, '#9aa9a1');
    box(x + 15, y + 18, h + 12, Math.min(42, w - 31), 28, 1, '#4f6971');
    if (b.variant === 'tower') box(x + w * .4, y + d * .4, h, w * .2, d * .2, 14, '#93ada8');
    if (b.variant === 'villa') { flat(x + 25, y + 72, 70, 90, h + .5, '#2e9eaa'); box(x + 25, y + 72, h, 70, 3, 2, '#f7e9cd'); }
  }
  for (const park of city.parks) {
    flat(park.x, park.y, park.w, park.d, .55, '#92b189');
    flat(park.x + 119, park.y, 30, park.d, .6, '#e3d2ac'); flat(park.x, park.y + 119, park.w, 30, .6, '#e3d2ac');
    box(park.x + 95, park.y + 95, 0, 78, 78, 7, '#f5e6bf'); flat(park.x + 101, park.y + 101, 66, 66, 7.2, '#4bc8c5');
    beam([park.x + 134, park.y + 134, 7], [park.x + 134, park.y + 134, 32], 1.5, '#cef3da');
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; beam([park.x + 134, park.y + 134, 30], [park.x + 134 + Math.cos(a) * 16, park.y + 134 + Math.sin(a) * 16, 8], .5, '#d4f4df'); }
  }
  for (const t of city.palms) {
    const h = 72 + hash(t.x, t.y) * 32;
    const x = t.x, y = t.y;
    flat(x, y, 3, h * .65, .7, '#9b9c78');
    beam([x, y, 0], [x + 4, y, h], 2.3, '#b8a471', 7);
    for (let z = 8; z < h; z += 9) beam([x + z / h * 4, y, z], [x + z / h * 4, y, z + .6], 2.7, '#c4af7d');
    for (let k = 0; k < 8; k++) {
      const a = k * Math.PI / 4 + hash(x, y), dx = Math.cos(a), dy = Math.sin(a), sx = -dy, sy = dx;
      const root = [x + 4, y, h], mid = [x + 4 + dx * 23, y + dy * 23, h + 7], tip = [x + 4 + dx * 46, y + dy * 46, h - 18];
      tri(root, [mid[0] + sx * 7, mid[1] + sy * 7, mid[2] - 2], mid, '#71a779');
      tri(root, mid, [mid[0] - sx * 7, mid[1] - sy * 7, mid[2] - 2], '#4b8c6c');
      tri(mid, [mid[0] + sx * 7, mid[1] + sy * 7, mid[2] - 2], tip, '#559768');
      tri(mid, tip, [mid[0] - sx * 7, mid[1] - sy * 7, mid[2] - 2], '#397d62');
    }
  }
  for (const l of city.lamps) {
    beam([l.x, l.y, 0], [l.x, l.y, 70], 1, '#6c7c76');
    beam([l.x, l.y, 70], [l.x - 13, l.y, 70], .9, '#6c7c76');
    box(l.x - 16, l.y - 2, 69, 7, 4, 1.5, '#fff1b8');
  }
  for (const p of city.props) {
    if (p.type === 'signal') { beam([p.x, p.y, 0], [p.x, p.y, 37], 1.1, '#63766d'); box(p.x - 2, p.y - 2, 30, 4, 4, 12, '#243b43'); box(p.x - 2.2, p.y - 2.3, 31, 4.5, .5, 3, '#8ee9ae'); }
    else { box(p.x, p.y, 5, 25, 10, 2, '#b79a73'); box(p.x, p.y + 9, 6, 25, 2, 9, '#bc9f78'); box(p.x + 35, p.y, 0, 8, 8, 13, '#5b9b89'); }
  }
  for (const l of city.landmarks) {
    if (l.type === 'boat') {
      const x=l.x,y=l.y;
      quad([x-14,y+31,1],[x+14,y+31,1],[x+14,y-22,1],[x-14,y-22,1],'#eee8cb');tri([x-14,y-22,1],[x+14,y-22,1],[x,y-45,1],'#f8efd2');
      box(x-8,y-10,1,16,26,9,'#f2e6c4');box(x-7,y-8,10,14,18,2,'#38667a');
      beam([x,y+8,10],[x,y+8,48],.45,'#ead6b4');tri([x+1,y+8,46],[x+1,y+8,15],[x+1,y-23,15],'#fff1cb');
    }
    if (l.type === 'container') { box(l.x, l.y, 0, 100, 39, 28, l.color); for (let k = 5; k < 98; k += 10) box(l.x + k, l.y - .2, 0, 1.5, 40, 27, '#ad987f'); }
    if (l.type === 'crane') {
      for (const side of [-16, 16]) beam([l.x + side, l.y, 0], [l.x + side, l.y, 170], 2.5, '#edb868');
      for (let z = 10; z < 160; z += 24) beam([l.x - 16, l.y, z], [l.x + 16, l.y, z + 24], 1, '#d3a86c');
      beam([l.x - 230, l.y, 170], [l.x + 65, l.y, 170], 3.5, '#eabb71'); beam([l.x - 180, l.y, 170], [l.x - 180, l.y, 30], .5, '#485f63');
      box(l.x, l.y - 10, 140, 30, 22, 22, '#dac493');
    }
    if (l.type === 'radio') { for (const dx of [-17, 17]) beam([l.x + dx, l.y, 0], [l.x, l.y, 180], 1.4, '#bba88f'); for (let z = 10; z < 160; z += 20) beam([l.x - 12, l.y, z], [l.x + 12, l.y, z + 18], .6, '#e5be98'); }
  }
  return m;
}
