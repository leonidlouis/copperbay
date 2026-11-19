import { angleDelta, lerp } from './math.js';
// One world-space camera serves projection, aiming and screen-relative walking.
export function updateChaseCamera(state, dt = 1) {
  const p = state.player, c = state.camera;
  const desired = state.viewMode === '3d' && !p.car ? (c.heading ?? p.angle) : p.angle;
  c.heading = c.heading === undefined ? desired : c.heading + angleDelta(desired, c.heading) * Math.min(1, dt * 4);
}
export function createPerspectiveCamera(state) {
  const p = state.screen === 'title' ? { x:1400,y:2400,angle:-.96 } : state.player, c = state.camera;
  const angle = state.screen === 'title' ? -.96 : c.heading ?? p.angle;
  const forward = { x: Math.cos(angle), y: Math.sin(angle) };
  const right = { x: -forward.y, y: forward.x };
  const distance = state.screen === 'title' ? 520 : state.garageOpen ? 120 : p.car ? 145 : 94;
  const height = state.screen === 'title' ? 180 : state.garageOpen ? 48 : p.car ? 64 : 48;
  const side = p.car ? 6 : -17;
  const x = p.x - forward.x * distance + right.x * side;
  const y = p.y - forward.y * distance + right.y * side;
  const pitch = state.screen === 'title' ? .10 : p.car ? .105 : .085;
  const cs = Math.cos(pitch), sn = Math.sin(pitch), focal = 820;
  function cameraPoint(v) {
    const dx = v[0] - x, dy = v[1] - y, dz = (v[2] || 0) - height;
    const depth = dx * forward.x + dy * forward.y;
    return [dx * right.x + dy * right.y, dz * cs + depth * sn, depth * cs - dz * sn];
  }
  function project(x, y, z = 0) {
    const a = cameraPoint([x, y, z]);
    return { x: 640 + a[0] * focal / a[2], y: 360 - a[1] * focal / a[2], depth: a[2], scale: focal / a[2] };
  }
  function unproject(sx, sy) {
    const rx = (sx - 640) / focal, ry = (360 - sy) / focal;
    const vz = ry * cs - sn, groundDistance = (23-height) / Math.min(-.025, vz);
    const f = (ry * sn + cs) * groundDistance;
    return { x: x + right.x * rx * groundDistance + forward.x * f, y: y + right.y * rx * groundDistance + forward.y * f };
  }
  return { x, y, height, angle, pitch, forward, right, focal, cameraPoint, project, unproject };
}
