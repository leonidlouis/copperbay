import { VEHICLE_TYPES } from './vehicles.js';
import { tint } from './painter.js';
import { TAU } from './math.js';
export function drawVehicle(p, car, state) {
  const spec = VEHICLE_TYPES[car.type], L = spec.d / 2, W = spec.w / 2;
  const cs = Math.cos(car.angle), sn = Math.sin(car.angle), zoom = p.view.zoom;
  const pt = (u, v, z = 0) => p.project(car.x + cs * u - sn * v, car.y + sn * u + cs * v, z);
  const quad = (a, b, c, d, z, fill, stroke) => p.poly([pt(a, c, z), pt(b, c, z), pt(b, d, z), pt(a, d, z)], fill, stroke);
  quad(-L - 5, L + 5, -W - 4, W + 4, 0, '#0b263b55');
  if (!car.wreck && state.night > .15) {
    for (const side of [-W + 4, W - 4]) {
      p.poly([pt(L - 3, side - 2, 5), pt(L + 145, side - 28, 0), pt(L + 145, side + 28, 0), pt(L - 3, side + 2, 5)], '#fbe5a81c');
      const q = pt(L + 100, side); p.glow(q.x, q.y, 57 * zoom, '#dceca5', .10);
    }
    const tail = pt(-L - 10, 0); p.glow(tail.x, tail.y, 21 * zoom, '#ff6d68', .28);
  }
  // Wheels are real silhouettes beside the body rather than a single flat sprite.
  for (const u of [-L * .62, L * .59]) for (const v of [-W, W]) {
    quad(u - 7, u + 7, v - 3, v + 3, 4, '#10232f', '#0a1a24');
  }
  const body = car.wreck ? '#4c5b62' : car.flash > 0 ? '#ffe0a0' : car.color;
  const bottom = [pt(-L, -W, 4), pt(L - 3, -W, 4), pt(L, W, 4), pt(-L, W, 4)];
  const top = [pt(-L + 2, -W, 13), pt(L - 3, -W + 2, 13), pt(L, W - 2, 13), pt(-L + 2, W, 13)];
  p.poly([...bottom, ...top.slice().reverse()], tint(body, .62));
  for (let i = 0; i < 4; i++) p.poly([bottom[i], bottom[(i + 1) % 4], top[(i + 1) % 4], top[i]], tint(body, .65 + i * .06));
  p.poly(top, body, '#f4ead055', .8);
  quad(-L + 3, -L + 8, -W + 2, W - 2, 14, '#ddd2b3');
  quad(L - 6, L - 2, -W + 3, -W + 10, 14, '#fff4c0'); quad(L - 6, L - 2, W - 10, W - 3, 14, '#fff4c0');
  quad(-L + 2, -L + 5, -W + 2, -W + 10, 14, '#ff756d'); quad(-L + 2, -L + 5, W - 10, W - 2, 14, '#ff756d');
  const cabL = car.type === 'van' ? -L + 4 : -L * .48, cabR = car.type === 'van' ? L * .7 : L * .36;
  const cabH = car.type === 'van' ? 29 : 25;
  p.poly([pt(cabR, -W + 3, 13), pt(cabR - 5, -W + 5, cabH), pt(cabR - 5, W - 5, cabH), pt(cabR, W - 3, 13)], '#a1d3d4');
  p.poly([pt(cabL, -W + 3, 13), pt(cabL + 5, -W + 5, cabH), pt(cabR - 5, -W + 5, cabH), pt(cabR, -W + 3, 13)], '#244b60');
  p.poly([pt(cabL, W - 3, 13), pt(cabL + 5, W - 5, cabH), pt(cabR - 5, W - 5, cabH), pt(cabR, W - 3, 13)], '#3d7182');
  quad(cabL + 5, cabR - 5, -W + 5, W - 5, cabH, car.police ? '#edf0df' : tint(body, 1.15), '#f4e4bd55');
  if (car.type === 'coupe' && !car.wreck) {
    for (const side of [-4, 4]) quad(L * .45, L - 7, side - 1.4, side + 1.4, 14.2, '#fff0ccbb');
    quad(-L + 4, -L + 8, -W - 2, W + 2, 19, tint(body, .72));
    quad(-L + 8, -L + 13, -7, 7, 14, '#2c4a58');
    for (let k = 0; k < 3; k++) quad(-L + 10 + k * 4, -L + 11 + k * 4, -7, 7, 14.5, '#aac3bc');
  }
  if (car.type === 'taxi') quad(-5, 7, -6, 6, cabH + 4, '#f7d16d', '#213b46');
  if (car.police) {
    quad(-L + 6, -L + 16, -W + 1, W - 1, 14, '#203e53');
    quad(L - 18, L - 7, -W + 1, W - 1, 14, '#203e53');
    const alternate = Math.floor(state.elapsed * 8 + car.x) % 2;
    for (const side of [-1, 1]) {
      const color = side === -1 ? '#ff597c' : '#68bfff';
      quad(-3, 3, side * 7 - 5, side * 7 + 5, cabH + 3, color);
      if ((side === -1) === !!alternate) {
        const light = pt(0, side * 7, cabH + 5); p.glow(light.x, light.y, 42 * zoom, color, .8); p.circle(light.x, light.y, 3 * zoom, '#fff6de');
        const g = pt(10, side * 24, 1); p.glow(g.x, g.y, 70 * zoom, color, .18);
      }
    }
    const roof = pt(-12, 0, cabH + 1); p.text('09', roof.x, roof.y, 10 * zoom, '#263e52', '900', 'center');
  }
  if (car.jammer && !car.wreck) {
    const a = pt(0, 0, cabH), b = pt(0, 0, cabH + 30); p.ctx.strokeStyle = '#8ce9d9'; p.ctx.lineWidth = 2; p.ctx.beginPath(); p.ctx.moveTo(a.x, a.y); p.ctx.lineTo(b.x, b.y); p.ctx.stroke(); p.circle(b.x, b.y, 5, '#ff9b7b');
  }
  if (car === state.player.car) {
    const q = pt(0, 0, cabH + 23);
    p.poly([{ x: q.x - 6, y: q.y - 5 }, { x: q.x + 6, y: q.y - 5 }, { x: q.x, y: q.y + 3 }], '#81f0d1');
  }
  if (car.wreck || car.hp < 35) {
    for (let i = 0; i < 4; i++) {
      const q = pt(L - 5, 0, 24 + i * 10 + Math.sin(state.elapsed * 2 + i) * 3);
      p.circle(q.x + Math.sin(i + state.elapsed) * 6, q.y, (8 + i * 3) * zoom, car.wreck ? '#304753b0' : '#49606c9a');
    }
    if (car.wreck) { const q = pt(L / 2, 0, 15); p.glow(q.x, q.y, 40 * zoom, '#ff984e', .5); p.circle(q.x, q.y - 3, 8 * zoom, '#ffb862'); }
  }
}
export function drawPerson(p, actor, state, player = false) {
  const zoom = p.view.zoom, base = p.project(actor.x, actor.y), head = p.project(actor.x, actor.y, 27);
  const { ctx } = p;
  ctx.fillStyle = '#0b233b66'; ctx.beginPath(); ctx.ellipse(base.x + 3, base.y + 1, 9 * zoom, 4 * zoom, 0, 0, TAU); ctx.fill();
  if (actor.hp <= 0) {
    ctx.save(); ctx.translate(base.x, base.y); ctx.rotate(.4); ctx.fillStyle = '#c58b7c'; ctx.fillRect(-11 * zoom, -3 * zoom, 22 * zoom, 6 * zoom); ctx.fillStyle = actor.color; ctx.fillRect(-6 * zoom, -5 * zoom, 13 * zoom, 9 * zoom); ctx.restore(); return;
  }
  if (player && actor.invincible > 0 && Math.floor(state.elapsed * 18) % 2 === 0) return;
  const moving = player ? state.walking : true;
  const stride = moving ? Math.sin(state.elapsed * (actor.flee ? 14 : 9) + (actor.seed || 0)) * (actor.flee ? 8 : 4) : 0;
  ctx.strokeStyle = player ? '#203c52' : '#2e4757'; ctx.lineWidth = 4.5 * zoom; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(base.x - 3 * zoom, base.y - 10 * zoom); ctx.lineTo(base.x - 4 * zoom + stride, base.y); ctx.moveTo(base.x + 3 * zoom, base.y - 10 * zoom); ctx.lineTo(base.x + 4 * zoom - stride, base.y); ctx.stroke();
  ctx.strokeStyle = player ? '#f09677' : actor.police ? '#547e98' : actor.enemy ? '#ae5966' : actor.color; ctx.lineWidth = 10 * zoom;
  ctx.beginPath(); ctx.moveTo(base.x, base.y - 11 * zoom); ctx.lineTo(base.x, base.y - 21 * zoom); ctx.stroke();
  p.circle(head.x, head.y, 5.5 * zoom, '#e4b493');
  p.circle(head.x - 1.5 * zoom, head.y - 3 * zoom, 4.6 * zoom, player ? '#453d42' : actor.police ? '#24435c' : '#56504b');
  if (player) { p.circle(head.x - 5 * zoom, head.y + 1 * zoom, 3 * zoom, '#453d42'); ctx.fillStyle = '#f4d9af'; ctx.fillRect(base.x - 4 * zoom, base.y - 19 * zoom, 8 * zoom, 2 * zoom); }
  const armed = player ? actor.weapon !== 'FISTS' : actor.police || actor.enemy;
  if (!armed) {
    ctx.strokeStyle = '#e4b493'; ctx.lineWidth = 3.3 * zoom;
    ctx.beginPath(); ctx.moveTo(base.x - 5 * zoom, base.y - 19 * zoom); ctx.lineTo(base.x - (9 + stride * .5) * zoom, base.y - 9 * zoom);
    ctx.moveTo(base.x + 5 * zoom, base.y - 19 * zoom); ctx.lineTo(base.x + (9 - stride * .5) * zoom, base.y - 10 * zoom); ctx.stroke();
  }
  if (armed || (player && actor.punch > 0)) {
    const reach = actor.punch > 0 ? 28 : 19;
    const hand = p.project(actor.x + Math.cos(actor.angle) * reach, actor.y + Math.sin(actor.angle) * reach, 17);
    ctx.strokeStyle = '#e6b799'; ctx.lineWidth = 4 * zoom; ctx.beginPath(); ctx.moveTo(base.x, base.y - 18 * zoom); ctx.lineTo(hand.x, hand.y); ctx.stroke();
    if (armed) {
      const end = p.project(actor.x + Math.cos(actor.angle) * (reach + 10), actor.y + Math.sin(actor.angle) * (reach + 10), 17);
      ctx.strokeStyle = '#183241'; ctx.lineWidth = 4 * zoom; ctx.beginPath(); ctx.moveTo(hand.x, hand.y); ctx.lineTo(end.x, end.y); ctx.stroke();
      if (player && actor.muzzle > 0) {
        p.glow(end.x, end.y, 42, '#ffd585', .85);
        const points = Array.from({ length: 12 }, (_, i) => { const a = i * TAU / 12, r = (i % 2 ? 4 : 14) * zoom; return { x: end.x + Math.cos(a) * r, y: end.y + Math.sin(a) * r }; });
        p.poly(points, '#fff1b1'); p.circle(end.x, end.y, 4 * zoom, '#ffffff');
      }
    }
  }
  if (player) {
    const q = p.project(actor.x, actor.y, 47); p.poly([{ x: q.x - 6, y: q.y - 5 }, { x: q.x + 6, y: q.y - 5 }, { x: q.x, y: q.y + 2 }], '#80efcf');
    ctx.strokeStyle = '#83e7cc99'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(base.x, base.y + 1, 18 * zoom, 9 * zoom, 0, 0, TAU); ctx.stroke();
  } else if (actor.enemy || actor.police) {
    const q = p.project(actor.x, actor.y, 43); p.text(actor.enemy ? '▼' : '•', q.x, q.y, actor.enemy ? 13 : 16, actor.enemy ? '#ff927e' : '#8fceff', '900', 'center');
    if (actor.enemy || actor.hp < 90) { ctx.fillStyle = '#143342'; ctx.fillRect(q.x - 14 * zoom, q.y - 16 * zoom, 28 * zoom, 3 * zoom); ctx.fillStyle = actor.enemy ? '#ff9c8b' : '#93c7eb'; ctx.fillRect(q.x - 14 * zoom, q.y - 16 * zoom, 28 * zoom * Math.min(1, actor.hp / 100), 3 * zoom); }
  }
  ctx.lineCap = 'butt';
}
export function drawMissionMarker(p, target, state, label = 'M') {
  const { ctx } = p, pulse = 1 + Math.sin(state.elapsed * 3) * .10;
  const q = p.project(target.x, target.y, 3);
  p.glow(q.x, q.y, 60, '#f7c46b', .2);
  ctx.strokeStyle = '#ffcf7b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(q.x, q.y, 32 * p.view.zoom * pulse, 17 * p.view.zoom * pulse, 0, 0, TAU); ctx.stroke();
  const top = p.project(target.x, target.y, 75 + Math.sin(state.elapsed * 3) * 5);
  p.poly([{ x: top.x, y: top.y - 20 }, { x: top.x + 17, y: top.y }, { x: top.x, y: top.y + 20 }, { x: top.x - 17, y: top.y }], '#ffd080', '#fff1bf');
  p.text(label, top.x, top.y + 6, 17, '#28414a', '900', 'center');
  ctx.strokeStyle = '#ffcf7b66'; ctx.setLineDash([3, 5]); ctx.beginPath(); ctx.moveTo(top.x, top.y + 23); ctx.lineTo(q.x, q.y - 10); ctx.stroke(); ctx.setLineDash([]);
}
