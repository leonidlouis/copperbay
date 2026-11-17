import { angleDelta, clamp, distance } from './math.js';

export function dispatchAirUnit(state, x, y) {
  const p = state.player;
  state.air = {
    x, y, altitude: 165, angle: Math.atan2(p.y - y, p.x - x),
    fix: { x: p.x, y: p.y }, beam: { x: p.x, y: p.y },
    tracking: false, departing: false,
  };
  return state.air;
}

export function updateAirUnit(state, dt, groundContact) {
  const level = Math.ceil(state.heat), p = state.player;
  if (level >= 4 && !state.air) {
    dispatchAirUnit(state, p.x - 640, p.y - 490);
    state.toast = { text: 'CBPD AIR ONE · Helicopter dispatched', time: 5 };
  }
  const heli = state.air;
  if (!heli) return false;
  heli.departing = level < 4;
  if (!heli.departing && (groundContact || state.elapsed - state.lastCrime < 2.5 || heli.tracking)) {
    heli.fix.x = p.x;
    heli.fix.y = p.y;
  }
  const sweep = state.elapsed * .86;
  const tx = heli.fix.x + Math.cos(sweep) * 210;
  const ty = heli.fix.y + Math.sin(sweep) * 170;
  const heading = heli.departing ? -2.44 : Math.atan2(ty - heli.y, tx - heli.x);
  heli.angle += clamp(angleDelta(heading, heli.angle), -1.65 * dt, 1.65 * dt);
  const speed = heli.departing ? 345 : clamp(Math.hypot(heli.x - tx, heli.y - ty) * 1.5, 86, 292);
  heli.x += Math.cos(heli.angle) * speed * dt;
  heli.y += Math.sin(heli.angle) * speed * dt;
  if (heli.departing) {
    heli.tracking = false;
    if (distance(heli, p) > 1100) state.air = null;
    return false;
  }
  const groundDistance = distance(heli, p);
  const covered = state.city.buildings.some(b => {
    const t = Math.min(.95, b.h / heli.altitude);
    const x = p.x + (heli.x - p.x) * t * .65;
    const y = p.y + (heli.y - p.y) * t * .65;
    return x > b.x - 3 && x < b.x + b.w + 3 && y > b.y - 3 && y < b.y + b.d + 3;
  });
  heli.tracking = groundDistance < (heli.tracking ? 380 : 285) && !covered;
  const desiredX = heli.tracking ? p.x : heli.fix.x + Math.cos(sweep * 1.73) * 121;
  const desiredY = heli.tracking ? p.y : heli.fix.y + Math.sin(sweep * 1.73) * 121;
  heli.beam.x += (desiredX - heli.beam.x) * Math.min(1, dt * 4.5);
  heli.beam.y += (desiredY - heli.beam.y) * Math.min(1, dt * 4.5);
  return heli.tracking;
}
