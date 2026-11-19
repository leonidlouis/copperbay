import { distance, clamp, TAU } from './math.js';
import { ROAD_CENTERS, roadDistance } from './city.js';
export function spawnPedestrians() {
  const peds = [];
  const shirts = ['#ea8c75', '#f2d5aa', '#6ec2bd', '#ddbc64', '#b398cf', '#8297b8'];
  for (let i = 0; i < 165; i++) {
    const vertical = i % 2, road = ROAD_CENTERS[i % 8], cross = 300 + ((i * 193) % 3500);
    peds.push({ x: vertical ? road + (i % 3 ? 95 : -96) : cross, y: vertical ? cross : road + (i % 3 ? 97 : -95), angle: vertical ? (i % 3 ? Math.PI / 2 : -Math.PI / 2) : (i % 3 ? 0 : Math.PI), hp: 65, flee: 0, color: shirts[i % 6], seed: i, police: false, enemy: false, cooldown: 0 });
  }
  return peds;
}
export function fireWeapon(state, x, y, angle, owner = 'player') {
  const p = state.player;
  if (owner === 'player') {
    if (p.cooldown > 0 || p.ammo <= 0) return;
    p.ammo--; p.cooldown = p.weapon === 'SCATTERGUN' ? .7 : .19; p.muzzle = .10; state.shake = 2.7; state.crime(.11); state.audio.sound('gun');
  }
  const pellets = owner === 'player' && p.weapon === 'SCATTERGUN' ? 5 : 1;
  for (let i = 0; i < pellets; i++) { const a = angle + (i - (pellets - 1) / 2) * .065; state.bullets.push({ x: x + Math.cos(a) * 6, y: y + Math.sin(a) * 6, angle: a, life: pellets > 1 ? .4 : .8, owner, speed: 1050 }); }
  state.effects.burst(x + Math.cos(angle) * 22, y + Math.sin(angle) * 22, '#ffdc8a', 5, 80, 15);
  for (const ped of state.peds) if (!ped.police && !ped.enemy && distance(ped, { x, y }) < 340) ped.flee = 7;
}
function awardTakedown(state){state.stats.takedowns++;state.styleScore+=250;state.stylePopup={text:'TAKEDOWN',score:250,time:2.5};}
export function punch(state) {
  const p = state.player;
  if (p.car || p.cooldown > 0) return;
  p.cooldown = .45; p.punch = .22; state.audio.sound('hit');
  for (const ped of state.peds) if (ped.hp > 0 && distance(p, ped) < 62) {
    ped.hp -= 35; ped.flee = 5; ped.x += Math.cos(p.angle) * 12; ped.y += Math.sin(p.angle) * 12;
    state.crime(ped.police ? .7 : .25); state.effects.burst(ped.x, ped.y, '#ffc09b', 8, 60);
    if (ped.hp <= 0) awardTakedown(state);
  }
}
export function damagePlayer(state, damage) {
  const p = state.player;
  if (p.invincible > 0 || state.screen !== 'play') return;
  if (p.car) { p.car.hp -= damage * .7 / (1+(p.car.armorLevel||0)*.4); return; }
  const absorbed = Math.min(p.armor, damage * .7); p.armor -= absorbed; p.health -= damage - absorbed;
  p.invincible = .25; state.shake = 5;
  if (p.health <= 0) { p.health = 0; state.screen = 'wasted'; state.audio.sound('boom'); }
}
export function updateCombat(state, dt) {
  const p = state.player;
  p.cooldown = Math.max(0, p.cooldown - dt); p.invincible = Math.max(0, p.invincible - dt); p.muzzle = Math.max(0, p.muzzle - dt); p.punch = Math.max(0, p.punch - dt);
  for (let i = state.bullets.length - 1; i >= 0; i--) {
    const b = state.bullets[i]; b.life -= dt;
    b.x += Math.cos(b.angle) * b.speed * dt; b.y += Math.sin(b.angle) * b.speed * dt;
    let hit = b.life <= 0 || state.city.blocked(b.x, b.y, 0);
    if (!hit && b.owner === 'player') {
      for (const ped of state.peds) if (ped.hp > 0 && distance(b, ped) < 20) {
        ped.hp -= 38; ped.flee = 8; hit = true; state.effects.burst(ped.x, ped.y, '#f8b790', 8, 75);
        if (ped.police) state.crime(.6);
        if (ped.hp <= 0) { awardTakedown(state); state.pickups.push({ x: ped.x, y: ped.y, kind: 'cash', value: ped.enemy ? 100 : 20 }); }
        break;
      }
      for (const car of state.cars) if (car !== p.car && !car.wreck && distance(b, car) < 29) { car.hp -= 28; car.flash = .12; hit = true; break; }
    }
    if (!hit && b.owner !== 'player' && distance(b, p) < (p.car ? 33 : 17)) { damagePlayer(state, 8); hit = true; }
    if (hit) { if (b.life > 0) state.effects.burst(b.x, b.y, '#ffdc91', 3, 45); state.bullets.splice(i, 1); }
  }
  for (const car of state.cars) {
    if (car.hp <= 0 && !car.wreck) {
      car.wreck = true; car.speed = 0; state.effects.burst(car.x, car.y, '#ff9f45', 65, 230, 30); state.audio.sound('boom'); state.shake = 13;
      state.stats.wrecks++;
      if (p.car === car) { p.car = null; p.x = car.x + 45; p.y = car.y; damagePlayer(state, 36); }
      if (distance(p, car) < 400) state.crime(.5);
    }
  }
  for (let i = state.pickups.length - 1; i >= 0; i--) {
    const item = state.pickups[i];
    if (distance(item, p) < 35) {
      if (item.kind === 'cash') p.money += item.value;
      if (item.kind === 'ammo') p.ammo += item.value;
      if (item.kind === 'health') p.health = Math.min(100, p.health + item.value);
      if (item.kind === 'weapon') { p.shotgun = true; p.weapon = 'SCATTERGUN'; p.ammo += item.value; state.toast = { text: 'WEAPON CACHE · Scattergun acquired · 3 to equip', time: 4 }; }
      state.audio.sound('cash'); state.pickups.splice(i, 1);
    }
  }
}
export function updatePedestrians(state, dt) {
  const p = state.player;
  for (const ped of state.peds) {
    if (ped.hp <= 0) continue;
    ped.cooldown = Math.max(0, (ped.cooldown || 0) - dt);
    const dist = distance(ped, p);
    if (ped.police || ped.enemy) {
      if (dist < 700 && (ped.enemy || state.heat > 0)) {
        ped.angle = Math.atan2(p.y - ped.y, p.x - ped.x);
        if (dist > 155) {
          const x = ped.x + Math.cos(ped.angle) * dt * 90, y = ped.y + Math.sin(ped.angle) * dt * 90;
          if (!state.city.blocked(x, y, 7)) { ped.x = x; ped.y = y; }
        }
        if (dist < 340 && ped.cooldown <= 0 && !state.city.blocked((p.x + ped.x) / 2, (p.y + ped.y) / 2, 0)) { fireWeapon(state, ped.x, ped.y, ped.angle + (Math.sin(state.elapsed * 3 + ped.seed) * .14), 'enemy'); ped.cooldown = ped.enemy ? 1.2 : 1.8; }
        if (ped.police && dist < 30 && !p.car) { state.bust += dt; if (state.bust > 3) state.screen = 'busted'; }
      }
      continue;
    }
    if (p.car && Math.abs(p.car.speed) > 90 && dist < 140) ped.flee = 3;
    ped.flee = Math.max(0, ped.flee - dt);
    let speed = 26 + ped.seed % 13;
    if (ped.flee > 0) { ped.angle = Math.atan2(ped.y - p.y, ped.x - p.x); speed = 112; }
    const nx = ped.x + Math.cos(ped.angle) * speed * dt, ny = ped.y + Math.sin(ped.angle) * speed * dt;
    if (!state.city.blocked(nx, ny, 7)) { ped.x = nx; ped.y = ny; }
    else ped.angle += Math.PI / 2;
    if (ped.x < 230 || ped.y < 230 || ped.x > 3870 || ped.y > 3870) { ped.angle += Math.PI; ped.x = clamp(ped.x, 235, 3865); ped.y = clamp(ped.y, 235, 3865); }
  }
  state.bust = Math.max(0, state.bust - dt * .25);
}
