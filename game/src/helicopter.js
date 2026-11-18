// Air support tracks a moving search cone; roofs and speed can break contact.
import { distance, angleDelta } from './math.js';
export function updateHelicopter(state, dt) {
  if (Math.ceil(state.heat) < 4) { state.helicopter = null; return; }
  const player = state.player;
  if (!state.helicopter) {
    state.helicopter = { x: player.x + 600, y: player.y - 550, angle: 2, seen: false };
    state.toast = { text: 'AIR ONE · Air support inbound. Use the rooftops to break sight.', time: 5 };
  }
  const h = state.helicopter, orbit = state.elapsed * .28;
  const tx = player.x + Math.cos(orbit) * 200, ty = player.y + Math.sin(orbit) * 180;
  h.x += (tx - h.x) * dt * .65; h.y += (ty - h.y) * dt * .65;
  const angle = Math.atan2(player.y - h.y, player.x - h.x);
  h.angle += angleDelta(angle, h.angle) * dt * 1.4;
  h.seen = distance(h, player) < 450 && !state.city.blocked(player.x + 25, player.y + 25, 0) && Math.abs(angleDelta(angle, h.angle)) < .4;
  if (h.seen) state.unseen = 0;
}
export function drawHelicopter(p, state) {
  const h = state.helicopter; if (!h) return;
  const { ctx, project, poly } = p, z = 165 + Math.sin(state.elapsed * 2) * 4;
  const cs = Math.cos(h.angle), sn = Math.sin(h.angle);
  const pt = (u, v, height = z) => project(h.x + cs * u - sn * v, h.y + sn * u + cs * v, height);
  const shadow = project(h.x + 95, h.y + 110);
  ctx.save(); ctx.translate(shadow.x, shadow.y); ctx.rotate(.3); ctx.fillStyle = '#274b4a38'; ctx.beginPath(); ctx.ellipse(0, 0, 69 * p.view.zoom, 23 * p.view.zoom, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  const a = pt(23, 0, z - 14), b = project(state.player.x, state.player.y, 1);
  const cone = ctx.createLinearGradient(a.x, a.y, b.x, b.y); cone.addColorStop(0, '#fff6ca70'); cone.addColorStop(1, '#fff6ca08');
  poly([a, { x: b.x - 50, y: b.y }, { x: b.x, y: b.y + 22 }, { x: b.x + 50, y: b.y }], cone);
  ctx.strokeStyle = '#fff1b45c'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(b.x, b.y, 48, 23, 0, 0, Math.PI * 2); ctx.stroke();
  const link = (a, b, color, width) => { ctx.strokeStyle = color; ctx.lineWidth = width * p.view.zoom; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); };
  for (const side of [-17, 17]) { link(pt(-26, side, z - 19), pt(30, side, z - 19), '#203f49', 4); link(pt(-15, side, z - 19), pt(-10, side, z), '#acc5bd', 2); }
  poly([pt(-19, -15), pt(24, -15), pt(42, 0), pt(27, 17), pt(-20, 15)], '#e7e7d7', '#395e67');
  poly([pt(-19, 15), pt(27, 17), pt(30, 17, z - 12), pt(-19, 15, z - 12)], '#547985');
  poly([pt(17, -13, z + 1), pt(32, -5, z + 1), pt(35, 5, z + 1), pt(18, 12, z + 1)], '#3da3b5', '#a6e2df');
  poly([pt(-16, -8), pt(-79, -4, z + 5), pt(-79, 4, z + 5), pt(-16, 9)], '#425f6b');
  poly([pt(-78, -4, z + 5), pt(-82, -5, z + 27), pt(-64, -4, z + 15)], '#e7ddc2');
  link(pt(-76, -20, z + 8), pt(-76, 20, z + 8), '#c6d8cb', 3);
  const roof = pt(-2, 0, z + 8); p.text('CBPD', roof.x, roof.y, 9 * p.view.zoom, '#234653', '900', 'center');
  const rotor = state.elapsed * 41;
  for (const offset of [0, Math.PI / 2]) {
    const u = Math.cos(rotor + offset) * 83, v = Math.sin(rotor + offset) * 83;
    link(pt(-3 - u, -v, z + 17), pt(-3 + u, v, z + 17), '#284650b5', 4);
  }
  const hub = pt(-3, 0, z + 17); p.circle(hub.x, hub.y, 4, '#e3dbc1');
  const beacon = pt(-25, 0, z + 9); p.glow(beacon.x, beacon.y, 16, '#ff6b62', .8);
}
