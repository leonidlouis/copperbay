import { VEHICLE_TYPES } from './vehicles.js';
import { tint } from './painter.js';
import { TAU } from './math.js';
export function drawVehicle(p, car, state) {
  const spec = VEHICLE_TYPES[car.type], L = spec.d / 2, W = spec.w / 2;
  const cs = Math.cos(car.angle), sn = Math.sin(car.angle), zoom = p.view.zoom;
  const pt = (u, v, z = 0) => p.project(car.x + cs * u - sn * v, car.y + sn * u + cs * v, z);
  const quad = (a, b, c, d, z, fill, stroke) => p.poly([pt(a, c, z), pt(b, c, z), pt(b, d, z), pt(a, d, z)], fill, stroke);
  const shadow = state.light;
  const dx = shadow.dx * 14, dy = shadow.dy * 14;
  p.poly([pt(-L - 5, -W - 4), pt(L + 5, -W - 5), pt(L + 6, W + 6), pt(-L - 6, W + 5)].map(q => ({ x: q.x + dx * zoom, y: q.y + dy * zoom })), '#30283f4f');
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
  for (let i = 0; i < 4; i++) p.poly([bottom[i], bottom[(i + 1) % 4], top[(i + 1) % 4], top[i]], tint(body, .65 + i * .06));
  const paint = p.ctx.createLinearGradient(top[0].x, top[0].y, top[2].x, top[2].y);
  paint.addColorStop(0, tint(body, .92)); paint.addColorStop(.62, body); paint.addColorStop(1, tint(body, 1.12));
  p.poly(top, paint, '#f8ebbc99', .9);
  quad(-L + 3, -L + 8, -W + 2, W - 2, 14, '#ddd2b3');
  quad(L - 6, L - 2, -W + 3, -W + 10, 14, '#fff4c0'); quad(L - 6, L - 2, W - 10, W - 3, 14, '#fff4c0');
  quad(-L + 2, -L + 5, -W + 2, -W + 10, 14, '#ff756d'); quad(-L + 2, -L + 5, W - 10, W - 2, 14, '#ff756d');
  const cabL = car.type === 'van' ? -L + 4 : -L * .48, cabR = car.type === 'van' ? L * .7 : L * .36;
  const cabH = car.type === 'van' ? 29 : 25;
  p.poly([pt(cabR, -W + 3, 13), pt(cabR - 5, -W + 5, cabH), pt(cabR - 5, W - 5, cabH), pt(cabR, W - 3, 13)], '#82b7c0', '#36596a9c');
  p.poly([pt(cabR, -W + 7, 13), pt(cabR - 5, -W + 8, cabH), pt(cabR - 5, -W + 13, cabH), pt(cabR, -W + 13, 13)], '#d4e4cd8f');
  p.poly([pt(cabL, -W + 3, 13), pt(cabL + 5, -W + 5, cabH), pt(cabR - 5, -W + 5, cabH), pt(cabR, -W + 3, 13)], '#244b60');
  p.poly([pt(cabL, W - 3, 13), pt(cabL + 5, W - 5, cabH), pt(cabR - 5, W - 5, cabH), pt(cabR, W - 3, 13)], '#3d7182');
  quad(cabL + 5, cabR - 5, -W + 5, W - 5, cabH, car.police ? '#edf0df' : tint(body, 1.15), '#f4e4bd55');
  if (spec.sport && !car.wreck) {
    for (const side of [-4, 4]) quad(L * .45, L - 7, side - 1.4, side + 1.4, 14.2, '#fff0ccbb');
    quad(-L + 4, -L + 8, -W - 2, W + 2, 19, tint(body, .72));
    quad(-L + 8, -L + 13, -7, 7, 14, '#2c4a58');
    for (let k = 0; k < 3; k++) quad(-L + 10 + k * 4, -L + 11 + k * 4, -7, 7, 14.5, '#aac3bc');
  }
  if (car.type === 'mistral') quad(cabL + 5, cabR - 5, -2, 4, cabH + .2, '#d6e0bb');
  if (car.type === 'caldera') quad(cabL + 5, cabR - 5, -8, 8, cabH + .2, '#3a5960');
  if (car.door > 0 && !car.wreck) {
    const side = car.doorSide || 1, swing = Math.min(1, car.door * 3);
    const a = pt(8, W * side, 6), b = pt(-10 + swing * 9, (W + swing * 24) * side, 6);
    const c = pt(-10 + swing * 9, (W + swing * 24) * side, 15), d = pt(8, W * side, 15);
    p.poly([a, b, c, d], body, '#542f2b');
    p.poly([d, c, pt(-10 + swing * 9, (W - 3 + swing * 24) * side, 22), pt(7, (W - 3) * side, 22)], '#6c9ba6bb', '#324c5a');
  }
  if (car.type === 'taxi') quad(-5, 7, -6, 6, cabH + 4, '#f7d16d', '#213b46');
  if (car.police) {
    quad(-L + 6, -L + 16, -W + 1, W - 1, 14, '#203e53');
    quad(L - 18, L - 7, -W + 1, W - 1, 14, '#203e53');
    const alternate = Math.floor(state.elapsed * 8 + car.x) % 2;
    for (const side of [-1, 1]) {
      const color = side === -1 ? '#ff597c' : '#68bfff';
      quad(-5, 4, side * 7 - 6, side * 7 + 6, cabH + 3, color, '#233a57');
      const light = pt(0, side * 8, cabH + 5);
      p.glow(light.x, light.y, 29 * zoom, color, .54);
      if ((side === -1) === !!alternate) {
        p.glow(light.x, light.y, 48 * zoom, color, .81); p.circle(light.x, light.y, 3 * zoom, '#fff6de');
        const g = pt(10, side * 24, 1); p.glow(g.x, g.y, 70 * zoom, color, .18);
      }
    }
    const roof = pt(-10, 0, cabH + 1); p.text('09', roof.x, roof.y, 9 * zoom, '#263e52', '900', 'center');
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
  const z = p.view.zoom, base = p.project(actor.x, actor.y), { ctx } = p;
  const direction = Math.cos(actor.angle) - Math.sin(actor.angle);
  const facing = direction < 0 ? -1 : 1;
  const moving = player ? state.walking : !actor.enemy && !actor.police || !!actor.flee;
  const running = actor.flee > 0;
  const phase = Math.sin(state.elapsed * (running ? 13.5 : 8) + (actor.seed || 0));
  const step = moving ? phase * (running || player ? 6 : 2.7) : 0;
  const lean = running ? facing * 4 : 0;
  const armed = player ? actor.weapon !== 'FISTS' : actor.police || actor.enemy;
  const skin = player ? '#e2aa81' : ['#dfad83', '#965b47', '#f1c3a1', '#b77c60'][Math.abs(actor.seed || 0) % 4];
  const shirt = player ? '#ee8051' : actor.police ? '#527891' : actor.enemy ? '#a74255' : actor.color;
  const hair = player ? '#392e3a' : actor.police ? '#264859' : ['#473834', '#3d2f34', '#7f5b45'][Math.abs(actor.seed || 0) % 3];

  ctx.fillStyle = '#352f4845';
  ctx.beginPath(); ctx.ellipse(base.x + 6 * z, base.y + 3 * z, 12 * z, 4.2 * z, .12, 0, TAU); ctx.fill();
  if (actor.hp <= 0) {
    ctx.save(); ctx.translate(base.x, base.y); ctx.rotate(.4); ctx.fillStyle = skin; ctx.fillRect(-11 * z, -3 * z, 24 * z, 6 * z);
    ctx.fillStyle = shirt; ctx.fillRect(-6 * z, -5 * z, 13 * z, 9 * z); ctx.restore(); return;
  }
  if (player && actor.invincible > 0 && Math.floor(state.elapsed * 18) % 2 === 0) return;
  const a = (x, y) => ({ x: base.x + x * z, y: base.y + y * z });
  const segment = (points, width, color) => {
    ctx.beginPath();
    points.forEach(([x, y], i) => i ? ctx.lineTo(base.x + x * z, base.y + y * z) : ctx.moveTo(base.x + x * z, base.y + y * z));
    ctx.strokeStyle = color; ctx.lineWidth = width * z; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke();
  };
  const hip = lean * .48;
  const footA = -3 + step, footB = 3 - step + (armed && !moving ? facing * 3 : 0);
  segment([[hip - 2, -12], [-3 + step * .44, -6], [footA, -1]], 4.7, '#293c50');
  segment([[hip + 2, -12], [3 - step * .51, -6], [footB, -1]], 4.8, '#364d5b');
  segment([[footA, -1], [footA + facing * 3, -1]], 2.8, '#213039');
  segment([[footB, -1], [footB + facing * 3, -1]], 2.8, '#213039');

  p.poly([a(lean - 5, -24), a(lean + 4.6, -24), a(hip + 6, -15), a(hip + 3.4, -11), a(hip - 4.4, -11), a(lean - 7, -17)], shirt, '#2e344d57', .75 * z);
  segment([[lean - 3, -23], [hip - 2, -13]], 1.05, '#ffecbf7a');
  const head = a(lean + facing * 1.7, -28);
  p.circle(head.x, head.y, 5.3 * z, skin);
  p.circle(head.x - facing * 1.5 * z, head.y - 2.1 * z, 4.6 * z, hair);
  if (player) {
    const ponytail = a(lean - facing * 4.6, -23);
    p.circle(ponytail.x, ponytail.y, 3 * z, hair);
    segment([[lean - 3, -20], [lean, -21], [lean + 3, -20]], 1.7, '#ffdf92');
  }
  if (actor.police) segment([[lean - 4, -29], [lean + facing * 7, -29]], 2.1, '#203b54');
  const eye = a(lean + facing * 5, -28); p.circle(eye.x, eye.y, .7 * z, '#433c40');
  if (armed || actor.punch > 0) {
    const reach = actor.punch > 0 ? 25 : 21;
    const hand = p.project(actor.x + Math.cos(actor.angle) * reach, actor.y + Math.sin(actor.angle) * reach, 19);
    const end = p.project(actor.x + Math.cos(actor.angle) * (reach + 10), actor.y + Math.sin(actor.angle) * (reach + 10), 20);
    const handX = (hand.x - base.x) / z, handY = (hand.y - base.y) / z;
    segment([[lean - facing * 3, -20], [handX * .58 - facing * 2, handY + 4], [handX, handY]], 4.1, shirt);
    segment([[lean + facing * 4, -22], [handX * .56 + facing, handY - 1], [handX, handY]], 3.5, skin);
    if (armed) {
      segment([[handX, handY], [(end.x - base.x) / z, (end.y - base.y) / z]], 4.5, '#1a2f3c');
      segment([[handX, handY - 1], [(end.x - base.x) / z, (end.y - base.y) / z - 1]], 1.5, '#a1ada9');
      if (actor.muzzle > 0) drawMuzzleFlash(p, hand, end, z);
    }
  } else {
    const swing = step * .61;
    segment([[lean + 4, -21], [lean + 7 + (running ? facing * 3 : 0), -16], [lean + 5 + swing, running ? -19 : -13]], 3, skin);
    segment([[lean - 5, -21], [lean - 7, -17], [lean - 6 - swing, -13]], 3, skin);
  }

  if (player) {
    const q = a(0, -46);
    p.poly([{ x: q.x - 8, y: q.y - 6 }, { x: q.x + 8, y: q.y - 6 }, { x: q.x, y: q.y + 3 }], '#9bf3ce', '#274a4b', 1);
    ctx.strokeStyle = '#a2f1c6bd'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(base.x, base.y + 1, 16 * z, 8 * z, 0, 0, TAU); ctx.stroke();
  } else if (actor.enemy || actor.police) {
    const q = a(0, -43);
    p.text('▼', q.x, q.y, 14, actor.enemy ? '#e96550' : '#4897c8', '900', 'center');
    ctx.fillStyle = '#283d47'; ctx.fillRect(q.x - 14 * z, q.y - 15 * z, 28 * z, 3.5 * z);
    ctx.fillStyle = actor.enemy ? '#f4866b' : '#83c6ef'; ctx.fillRect(q.x - 14 * z, q.y - 15 * z, 28 * z * Math.min(1, actor.hp / 100), 3.5 * z);
  }
  if (actor.ally && actor.sceneActor) {
    const q = a(0, -43);
    p.text(actor.ally, q.x, q.y, 13, '#16656b', '900', 'center');
  }
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'miter';
}

function drawMuzzleFlash(p, hand, end, zoom) {
  const angle = Math.atan2(end.y - hand.y, end.x - hand.x);
  const dx = Math.cos(angle), dy = Math.sin(angle);
  const tip = (u, v) => ({ x: end.x + (u * dx - v * dy) * zoom, y: end.y + (u * dy + v * dx) * zoom });
  p.glow(end.x, end.y, 26 * zoom, '#ffc55e', .72);
  p.poly([tip(-3, -3), tip(8, -3), tip(17, -8), tip(15, -2), tip(25, 0), tip(13, 3), tip(15, 6), tip(5, 3), tip(-3, 3)], '#ffce64');
  p.poly([tip(-1, -2), tip(7, -2), tip(16, 0), tip(5, 2), tip(-2, 2)], '#fff7d6');
}

export function drawMissionMarker(p, target, state, label = 'M', color = '#ffd080') {
  const { ctx } = p, pulse = 1 + Math.sin(state.elapsed * 3) * .10;
  const q = p.project(target.x, target.y, 3);
  p.glow(q.x, q.y, 60, color, .2);
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(q.x, q.y, 32 * p.view.zoom * pulse, 17 * p.view.zoom * pulse, 0, 0, TAU); ctx.stroke();
  const top = p.project(target.x, target.y, 75 + Math.sin(state.elapsed * 3) * 5);
  p.poly([{ x: top.x, y: top.y - 20 }, { x: top.x + 17, y: top.y }, { x: top.x, y: top.y + 20 }, { x: top.x - 17, y: top.y }], color, '#fff1bf');
  p.text(label, top.x, top.y + 6, 17, '#28414a', '900', 'center');
  ctx.strokeStyle = '#ffcf7b66'; ctx.setLineDash([3, 5]); ctx.beginPath(); ctx.moveTo(top.x, top.y + 23); ctx.lineTo(q.x, q.y - 10); ctx.stroke(); ctx.setLineDash([]);
}
