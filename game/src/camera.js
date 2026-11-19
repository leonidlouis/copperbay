import { angleDelta } from './math.js';
// One camera and projection contract for rendering, aiming and movement.
export function updateChaseCamera(state, input, dt) {
  const c = state.camera, p = state.player;
  if (c.heading === undefined) c.heading = p.angle;
  if (p.car) c.heading += angleDelta(p.car.angle, c.heading) * (1 - Math.exp(-dt * 5));
  else c.heading += ((input.key('KeyR') ? 1 : 0) - (input.key('KeyQ') ? 1 : 0)) * dt * 1.7;
}
export function perspectiveCamera(state) {
  const p = state.player, a = state.camera.heading ?? p.angle, car = !!p.car;
  let eye = [p.x - Math.cos(a) * (car ? 160 : 102), p.y - Math.sin(a) * (car ? 160 : 102), car ? 65 : 50];
  let target = [p.x + Math.cos(a) * 180, p.y + Math.sin(a) * 180, car ? 19 : 22], shift = car ? 0 : .10;
  if (state.screen === 'title') { eye = [-130, 2730, 155]; target = [950, 2050, 100]; }
  if (state.garageOpen) { eye = [p.x - 112, p.y + 85, 60]; target = [p.x, p.y, 18]; shift = -.32; }
  if (state.screen !== 'title' && !state.garageOpen) {
    const desired = eye.slice();
    for (let t=.12;t<=1;t+=.06) {
      const x=p.x+(desired[0]-p.x)*t, y=p.y+(desired[1]-p.y)*t, z=24+(desired[2]-24)*t;
      if (state.city.buildings.some(b=>x>b.x-3&&x<b.x+b.w+3&&y>b.y-3&&y<b.y+b.d+3&&z<b.h+3)) {
        eye=[p.x+(desired[0]-p.x)*Math.max(.2,t-.08),p.y+(desired[1]-p.y)*Math.max(.2,t-.08),desired[2]+8]; break;
      }
    }
  }
  const forward = target.map((v, i) => v - eye[i]);
  const len = Math.hypot(...forward); for (let i = 0; i < 3; i++) forward[i] /= len;
  const right = [-forward[1], forward[0], 0], rl = Math.hypot(...right); for (let i = 0; i < 3; i++) right[i] /= rl;
  const up = [-forward[2] * right[1], forward[2] * right[0], forward[0] * right[1] - forward[1] * right[0]];
  return { eye, forward, right, up, focal: 880, shift };
}
export function projectPerspective(c, x, y, z = 0) {
  const v = [x - c.eye[0], y - c.eye[1], z - c.eye[2]], dot = a => a.reduce((s, n, i) => s + n * v[i], 0), d = dot(c.forward);
  return { x: 640 + dot(c.right) * c.focal / d + c.shift * 640, y: 400 - dot(c.up) * c.focal / d, d };
}
export function aimPerspective(c, x, y) {
  const sx = (x - 640 - c.shift * 640) / c.focal, sy = (400 - y) / c.focal;
  const ray = c.forward.map((n, i) => n + c.right[i] * sx + c.up[i] * sy);
  const t = Math.max(30, Math.min(1800, (17 - c.eye[2]) / Math.min(-.01, ray[2])));
  return { x: c.eye[0] + ray[0] * t, y: c.eye[1] + ray[1] * t };
}
