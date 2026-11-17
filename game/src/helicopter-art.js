import { TAU } from './math.js';

export function drawAirShadow(p, h, state) {
  const { ctx, project } = p, z = p.view.zoom;
  const x = h.x + state.light.dx * h.altitude, y = h.y + state.light.dy * h.altitude;
  const q = project(x, y);
  ctx.fillStyle = '#24294438';
  ctx.beginPath(); ctx.ellipse(q.x, q.y, 35 * z, 10 * z, -.28, 0, TAU); ctx.fill();
  p.line(x, y - 50, x, y + 36, '#24294437', 5);
}

export function drawAirUnit(p, h, state) {
  const z = h.altitude, cs = Math.cos(h.angle), sn = Math.sin(h.angle);
  const pt = (a, b, height) => p.project(h.x + a * cs - b * sn, h.y + a * sn + b * cs, z + height);
  const { ctx, poly } = p, zoom = p.view.zoom;
  const nozzle = pt(19, 7, -6);
  if (!h.departing) {
    const q = p.project(h.beam.x, h.beam.y, 4);
    const r = 36 * zoom;
    const beam = ctx.createLinearGradient(nozzle.x, nozzle.y, q.x, q.y);
    beam.addColorStop(0, '#fffae79f');
    beam.addColorStop(.55, '#fff5c947');
    beam.addColorStop(1, '#fff4c663');
    poly([nozzle, { x: q.x - r, y: q.y - 2 }, { x: q.x, y: q.y + r * .43 }, { x: q.x + r, y: q.y }], beam);
    ctx.beginPath(); ctx.ellipse(q.x, q.y, r, r * .43, 0, 0, TAU);
    ctx.fillStyle = '#fff4c858'; ctx.fill();
    ctx.strokeStyle = '#fff7d3a0'; ctx.lineWidth = 1.5; ctx.stroke();
  }

  const hull = (points, fill, border = '#293e48') => poly(points.map(args => pt(...args)), fill, border, .8);
  for (const v of [-13, 13]) {
    hull([[-20, v, -6], [22, v, -6], [27, v, -3], [22, v, -9], [-21, v, -9]], '#263741');
  }
  hull([[-16, -7, 8], [-62, -4, 9], [-62, 4, 9], [-16, 8, 8]], '#eeeee0');
  hull([[-20, 8, 8], [-62, 4, 9], [-62, 4, 5], [-20, 9, 2]], '#687f83');
  hull([[-58, 0, 8], [-67, 0, 7], [-70, 0, 26], [-61, 0, 24]], '#eee5cd');
  hull([[-28, -8, 8], [-21, -14, 17], [12, -14, 18], [25, -9, 12], [30, 0, 6], [25, 11, 7], [10, 14, 13], [-24, 12, 12]], '#f1efd8');
  hull([[-25, 11, 11], [11, 14, 13], [25, 11, 7], [22, 11, 1], [7, 14, -2], [-21, 10, 1]], '#385368');
  hull([[11, -13, 17], [23, -9, 12], [30, 0, 6], [24, 10, 7], [11, 12, 16]], '#508297');
  hull([[11, -12, 17], [21, -9, 13], [26, -4, 9], [16, -7, 15]], '#8bbab8');
  hull([[-11, 13, 10], [5, 14, 12], [6, 14, 5], [-10, 13, 5]], '#6c9fa7');
  hull([[-19, -7, 16], [-13, -8, 22], [4, -8, 22], [10, 7, 19], [-19, 9, 17]], '#f2ddac');
  const mark = pt(-19, 12, 5); p.text('1', mark.x, mark.y, 8 * zoom, '#e6f0df', '900', 'center');

  const rotor = pt(-5, 0, 26);
  ctx.beginPath(); ctx.ellipse(rotor.x, rotor.y, 82 * zoom, 37 * zoom, 0, 0, TAU);
  ctx.strokeStyle = '#2d435452'; ctx.lineWidth = 1.5; ctx.stroke();
  for (let i = 0; i < 4; i++) {
    const a = state.elapsed * 36 + i * TAU / 4;
    const tip = pt(-5 + Math.cos(a) * 83, Math.sin(a) * 83, 26);
    const edge = pt(-5 + Math.cos(a + .06) * 80, Math.sin(a + .06) * 80, 26);
    poly([rotor, tip, edge], '#304656b3');
  }
  p.circle(rotor.x, rotor.y, 3.8 * zoom, '#314758');
  const light = pt(-28, 8, 10);
  p.glow(light.x, light.y, 25 * zoom, '#ff6975', .6);
  p.circle(light.x, light.y, 2.5 * zoom, '#ff706a');
}
