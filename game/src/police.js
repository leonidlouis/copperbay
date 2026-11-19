import { ROAD_CENTERS, roadDistance } from './city.js';
import { makeCar, moveCar } from './vehicles.js';
import { angleDelta, clamp, distance } from './math.js';
const nearestRoad = v => ROAD_CENTERS.reduce((a, b) => Math.abs(v - a) < Math.abs(v - b) ? a : b);
export function commitCrime(state, severity = 1) {
  state.heat = clamp(state.heat + severity, 0, 5); state.lastCrime = state.elapsed; state.unseen = 0;
}
export function spawnPolice(state) {
  const p = state.player, n = state.stats.policeSpawned++;
  const x = nearestRoad(p.x + (n % 2 ? 480 : -480)) + 28;
  const y = clamp(nearestRoad(p.y + (n % 3 ? 0 : 480)), 320, 3680);
  const car = makeCar(x, y, 'patrol', '#e5e7d9', -Math.PI / 2); car.driver = true; car.speed = 100;
  state.cars.push(car);
  if (Math.ceil(state.heat) >= 2) state.peds.push({ x: x + 65, y: y + 88, hp: 100, angle: 0, police: true, color: '#6a9db0', flee: 0, seed: n, cooldown: 1 });
}
function chaseWaypoint(car, p) {
  const rx = nearestRoad(car.x), ry = nearestRoad(car.y);
  const tx = nearestRoad(p.x), ty = nearestRoad(p.y);
  if (distance(car, p) < 230 && (Math.abs(car.x - p.x) < 110 || Math.abs(car.y - p.y) < 110)) return p;
  if (Math.abs(car.x - rx) < 60 && Math.abs(car.y - ry) < 65) {
    if (Math.abs(tx - rx) > Math.abs(ty - ry)) return { x: rx + Math.sign(tx - rx) * 480, y: ry + Math.sign(tx - rx) * 28 };
    return { x: rx - Math.sign(ty - ry) * 28, y: ry + Math.sign(ty - ry) * 480 };
  }
  if (roadDistance(car.x) < roadDistance(car.y)) return { x: rx + (p.y > car.y ? -28 : 28), y: p.y > car.y ? ROAD_CENTERS.find(v => v > car.y + 50) || 3680 : [...ROAD_CENTERS].reverse().find(v => v < car.y - 50) || 320 };
  return { x: p.x > car.x ? ROAD_CENTERS.find(v => v > car.x + 50) || 3680 : [...ROAD_CENTERS].reverse().find(v => v < car.x - 50) || 320, y: ry + (p.x > car.x ? 28 : -28) };
}
export function updatePolice(state, dt) {
  const level = Math.ceil(state.heat), p = state.player;
  const active = state.cars.filter(c => c.police && !c.wreck);
  let seen = false;
  for (const car of active) {
    const d = distance(car, p);
    if (car.parked) continue;
    if (level <= 0) { car.driver = false; continue; }
    if (d < 570 && !state.city.blocked((car.x + p.x) / 2, (car.y + p.y) / 2, 0)) seen = true;
    if (d > 2000) { car.wreck = true; continue; }
    if (!car.waypoint || distance(car, car.waypoint) < 75 || (car.wayTimer || 0) <= 0) { car.waypoint = chaseWaypoint(car, p); car.wayTimer = 1.5; }
    car.wayTimer -= dt;
    const desired = Math.atan2(car.waypoint.y - car.y, car.waypoint.x - car.x);
    const turn = angleDelta(desired, car.angle);
    const desiredSpeed = d < 90 ? 95 : Math.abs(turn) > .8 ? 95 : 215 + level * 25;
    const throttle = car.speed < desiredSpeed ? 1 : 0;
    moveCar(state, car, throttle, clamp(turn * 2.3, -1, 1), Math.abs(turn) > 1.2, dt);
    if (d < 70 && !p.car) { car.speed *= .92; if (d < 45) { state.bust += dt * 1.4; if (state.bust > 3) state.screen = 'busted'; } }
  }
  if (level > 0) {
    state.policeTimer -= dt;
    if (state.policeTimer <= 0 && active.length < Math.min(10, level * 2)) { spawnPolice(state); state.policeTimer = 4.5; }
    if (seen || state.elapsed - state.lastCrime < 6) state.unseen = 0;
    else state.unseen += dt;
    if (state.unseen > 8 + level * 2) {
      state.heat = Math.max(0, Math.ceil(state.heat) - 1); state.unseen = 3;
      if (state.heat === 0) { state.stats.escapes = (state.stats.escapes || 0) + 1; state.toast = { text: 'HEAT LOST · You disappeared into Copper Bay', time: 4 }; state.audio.sound('cash'); }
    }
    if (level >= 4 && !state.roadblocks.length) {
      const x = nearestRoad(p.x + 480), y = nearestRoad(p.y);
      state.roadblocks.push({ x, y });
      for (const dx of [-45, 10, 65]) { const c = makeCar(x + dx, y + 115, 'patrol', '#e5e7d9', 0); c.parked = true; state.cars.push(c); }
      state.toast = { text: 'DISPATCH · Roadblocks authorized. Find another route.', time: 5 };
    }
  }
  if (state.heat === 0 && state.roadblocks.length) state.roadblocks.length = 0;
}
