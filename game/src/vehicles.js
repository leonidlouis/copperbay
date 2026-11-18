import { clamp, angleDelta, distance, randomGenerator } from './math.js';
import { ROAD_CENTERS, ROAD_GAP } from './city.js';
export const VEHICLE_TYPES = {
  coupe: { name: 'CAVELL XR', max: 455, accel: 245, turn: 2.75, grip: 6, w: 29, d: 62, hp: 120 },
  sedan: { name: 'BAYLINER', max: 315, accel: 170, turn: 2.3, grip: 8, w: 31, d: 65, hp: 150 },
  van: { name: 'PORTER VAN', max: 260, accel: 125, turn: 1.7, grip: 9, w: 35, d: 77, hp: 210 },
  taxi: { name: 'SUN CAB', max: 335, accel: 180, turn: 2.4, grip: 7, w: 31, d: 65, hp: 150 },
  patrol: { name: 'CBPD INTERCEPTOR', max: 405, accel: 220, turn: 2.6, grip: 8, w: 33, d: 68, hp: 185 },
};
export function makeCar(x, y, type = 'sedan', color = '#f3c96b', angle = -Math.PI / 2) {
  return { x, y, type, color, angle, speed: 0, vx: 0, vy: 0, hp: VEHICLE_TYPES[type].hp, police: type === 'patrol', driver: false, parked: false, cooldown: 0, wreck: false, route: null, flash: 0 };
}
export function spawnTraffic() {
  const r = randomGenerator(891), cars = [];
  const types = ['coupe', 'sedan', 'van', 'taxi'];
  const colors = ['#e5be6c', '#4baeb3', '#dc6b79', '#dedbd0', '#7876a0', '#a0ba91'];
  for (let i = 0; i < 80; i++) {
    const cx = ROAD_CENTERS[1 + Math.floor(r() * 6)], cy = ROAD_CENTERS[1 + Math.floor(r() * 6)];
    const horizontal = r() > .5, dir = r() > .5 ? 1 : -1;
    const car = makeCar(horizontal ? cx + r() * 380 : cx - dir * 28, horizontal ? cy + dir * 28 : cy + r() * 380, types[i % 4], colors[i % colors.length], horizontal ? (dir > 0 ? 0 : Math.PI) : (dir > 0 ? Math.PI / 2 : -Math.PI / 2));
    car.driver = true; car.cruise = 80 + r() * 55; car.speed = car.cruise; car.seed = i; cars.push(car);
  }
  for (let i = 0; i < 28; i++) {
    const x = ROAD_CENTERS[i % 7], y = ROAD_CENTERS[1 + Math.floor(i / 7)];
    const car = makeCar(x + 63, y + 135 + (i % 3) * 80, types[i % 4], colors[(i + 2) % 6]);
    car.parked = true; cars.push(car);
  }
  // The first getaway car is always just outside Mara's garage.
  const starter = makeCar(825, 825, 'coupe', '#f58a69', -Math.PI / 2); starter.parked = true; cars.push(starter);
  return cars;
}
export function moveCar(state, car, throttle, steering, brake, dt) {
  if (car.wreck) return;
  const spec = VEHICLE_TYPES[car.type];
  const tuned = car === state.player.car && state.progression.turbo ? 1.2 : 1;
  car.speed += throttle * spec.accel * tuned * dt;
  car.speed *= Math.exp(-(brake ? 3.2 : throttle ? .12 : .85) * dt);
  car.speed = clamp(car.speed, -spec.max * .35, spec.max * tuned);
  const steerPower = Math.min(1, Math.abs(car.speed) / 70);
  car.angle += steering * spec.turn * steerPower * dt * (car.speed < 0 ? -1 : 1) * (brake ? 1.55 : 1);
  const grip = brake ? 1.8 : spec.grip;
  car.vx += (Math.cos(car.angle) * car.speed - car.vx) * Math.min(1, dt * grip);
  car.vy += (Math.sin(car.angle) * car.speed - car.vy) * Math.min(1, dt * grip);
  const nx = car.x + car.vx * dt, ny = car.y + car.vy * dt;
  if (state.city.blocked(nx, ny, 17)) {
    if (Math.abs(car.speed) > 75) {
      car.hp -= Math.abs(car.speed) * .08;
      state.effects.burst(car.x, car.y, '#ffc579', 10, 80);
      if (car === state.player.car) { state.shake = 6; state.audio.sound('hit'); }
    }
    car.speed *= -.24; car.vx *= -.3; car.vy *= -.3;
  } else { car.x = nx; car.y = ny; }
  if ((brake || Math.abs(steering) > .5) && Math.abs(car.speed) > 140) {
    state.effects.skid(car.x, car.y, car.angle);
    if (brake) state.effects.burst(car.x, car.y, '#c4c9c1', 1, 15);
  }
}
export function updateTraffic(state, dt) {
  const playerCar = state.player.car;
  for (const car of state.cars) {
    car.cooldown = Math.max(0, car.cooldown - dt); car.flash = Math.max(0, car.flash - dt);
    if (car === playerCar || car.rival || car.police || car.wreck || !car.driver || car.parked) continue;
    let targetSpeed = car.cruise;
    // Brake for cars ahead in the same lane, and for pedestrians crossing close by.
    const forwardX = Math.cos(car.angle), forwardY = Math.sin(car.angle);
    for (const other of state.cars) {
      if (other === car || distance(car, other) > 100) continue;
      const dx = other.x - car.x, dy = other.y - car.y;
      if (dx * forwardX + dy * forwardY > 0 && Math.abs(dx * forwardY - dy * forwardX) < 27) targetSpeed = 0;
    }
    for (const ped of state.peds) {
      if (ped.hp <= 0 || Math.abs(ped.x - car.x) > 85 || Math.abs(ped.y - car.y) > 85) continue;
      const dx = ped.x - car.x, dy = ped.y - car.y;
      if (dx * forwardX + dy * forwardY > 0 && Math.abs(dx * forwardY - dy * forwardX) < 27) targetSpeed = 0;
    }
    const horizontal = Math.abs(forwardX) > .7;
    const axis = horizontal ? car.x : car.y;
    const nearest = ROAD_CENTERS.reduce((a, b) => Math.abs(axis - a) < Math.abs(axis - b) ? a : b);
    // Signals alternate every six seconds; cars stop at the entry line.
    const phase = (Math.floor(state.elapsed / 6) + Math.round(nearest / 480)) % 2;
    const before = (nearest - axis) * (horizontal ? forwardX : forwardY);
    if (before > 55 && before < 105 && (horizontal ? phase === 0 : phase === 1)) targetSpeed = 0;
    car.speed += clamp(targetSpeed - car.speed, -dt * 220, dt * 100);
    car.x += forwardX * car.speed * dt; car.y += forwardY * car.speed * dt;
    if (car.x < 245) car.x = 3840;
    if (car.x > 3870) car.x = 260;
    if (car.y < 245) car.y = 3840;
    if (car.y > 3870) car.y = 260;
  }
}
export function interactWithCar(state) {
  const p = state.player;
  if (p.car) {
    const car = p.car;
    const offsets = [Math.PI / 2, -Math.PI / 2, Math.PI];
    for (const offset of offsets) {
      const x = car.x + Math.cos(car.angle + offset) * 49, y = car.y + Math.sin(car.angle + offset) * 49;
      if (!state.city.blocked(x, y, 9)) { p.x = x; p.y = y; p.car = null; car.driver = false; car.parked = true; state.toast = { text: 'On foot · click to fire / F to punch', time: 3 }; return true; }
    }
    return true;
  }
  const car = state.cars.filter(c => !c.wreck && distance(c, p) < 90).sort((a, b) => distance(a, p) - distance(b, p))[0];
  if (!car) return false;
  if (car.driver || car.police) {
    state.crime(car.police ? 1.5 : .8);
    state.peds.push({ x: car.x + 40, y: car.y, angle: 0, hp: 60, flee: 10, color: '#db9d75', police: false, seed: 99 });
  }
  if (state.progression.chassis && !car.reinforced) { car.hp += 80; car.reinforced = true; }
  p.car = car; car.driver = false; car.parked = false; if (!car.stolen) { state.stats.carsStolen++; car.stolen = true; }
  p.x = car.x; p.y = car.y; state.audio.sound('click');
  state.toast = { text: VEHICLE_TYPES[car.type].name + ' · WASD drive · SPACE handbrake · E exit', time: 4 };
  return true;
}
export function updateCarCollisions(state, dt) {
  const car = state.player.car;
  if (!car || Math.abs(car.speed) < 35) return;
  for (const other of state.cars) {
    if (other === car || distance(car, other) > 44 || other.cooldown > 0) continue;
    other.cooldown = .65; other.hp -= Math.abs(car.speed) * .17; car.hp -= Math.abs(car.speed) * .07;
    other.x += Math.cos(car.angle) * 18; other.y += Math.sin(car.angle) * 18;
    car.speed *= .58; state.shake = 6; state.effects.burst(car.x, car.y, '#ffd393', 16, 130); state.audio.sound('hit');
    if (other.police) state.crime(.25);
  }
  for (const ped of state.peds) {
    if (ped.hp > 0 && distance(car, ped) < 28) { ped.hp = 0; state.crime(ped.police ? .8 : .45); state.effects.burst(ped.x, ped.y, '#e6a38d', 8, 60); }
  }
}
