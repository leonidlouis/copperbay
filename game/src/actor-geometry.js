import { VEHICLE_TYPES } from './vehicles.js';
import { createMesh } from './mesh.js';
import { distance } from './math.js';
// Live vehicles, articulated citizens, weapons, pursuit helicopter and effects.
export function buildActorGeometry(state,camera) {
  const m = createMesh(), { box, quad, flat, beam, tri } = m;
  function visible(a,r=60) { if(!camera)return true;const x=a.x-camera.eye[0],y=a.y-camera.eye[1],d=x*camera.forward[0]+y*camera.forward[1],side=x*camera.right[0]+y*camera.right[1];return d>-r&&d<2000&&Math.abs(side)<Math.max(0,d)*.78+r; }
  for (const car of state.cars) {
    if (!visible(car)) continue;
    const spec = VEHICLE_TYPES[car.type], L = spec.d / 2, W = spec.w / 2;
    m.transform(car.x, car.y, 0, car.angle);
    flat(-L - 3, -W - 2, L * 2 + 9, W * 2 + 7, .6, '#435b59');
    if(distance(car,state.player)>750) { box(-L,-W,5,L*2,W*2,10,car.color);box(-L*.4,-W+2,15,L*.8,W*2-4,11,'#315966'); if(car.police){box(-2,-12,26,4,12,3,'#fa7f87');box(-2,0,26,4,12,3,'#7cdaef');} continue; }
    const body = car.wreck ? '#586567' : car.flash > 0 ? '#ffe5b0' : car.color;
    for (const x of [-L * .64, L * .62]) for (const y of [-W - .6, W + .6]) {
      beam([x, y - 2.2, 6], [x, y + 2.2, 6], 6.2, '#263a42', 10);
      beam([x, y - 2.5, 6], [x, y + 2.5, 6], 4.1, '#bfd2cb', 10);
      beam([x, y - 2.7, 6], [x, y + 2.7, 6], 1.2, '#4c6f77');
    }
    box(-L, -W, 6, L * 2, W * 2, 9, body);
    box(-L + 2, -W + 1, 15, L * 2 - 5, W * 2 - 2, 1.5, body);
    const rear = car.type === 'van' ? -L + 3 : -L * .46, front = car.type === 'van' ? L * .75 : L * .40, h = car.type === 'van' ? 32 : 26;
    const a = [rear, -W + 2, 16], b = [front, -W + 2, 16], c = [front, W - 2, 16], d = [rear, W - 2, 16];
    const A = [rear + 4, -W + 3.5, h], B = [front - 7, -W + 3.5, h], C = [front - 7, W - 3.5, h], D = [rear + 4, W - 3.5, h];
    quad(a, b, B, A, '#1d4859', .16); quad(b, c, C, B, '#396f7b', .2); quad(c, d, D, C, '#244d5c', .16); quad(d, a, A, D, '#173e4f', .2); quad(A, B, C, D, body);
    for (const y of [-W + 1, W - 1]) { box(-1, y, 16, 2, 1, 10, body); box(-7, y, 12, 5, .8, 1.1, '#e9dbc2'); box(front - 2, y < 0 ? y - 3 : y, 17, 4, 4, 2, body); }
    box(-L - 1.3, -W + 1, 5, 2, W * 2 - 2, 3, '#344e56');
    box(L - 1, -W + 1, 5, 2, W * 2 - 2, 3, '#344e56');
    box(-L - 1.6, -5, 8, .5, 10, 4, '#f9f0cf');
    box(-L - .7, -W + 2, 14, .6, W * 2 - 4, .7, '#f3c6a2');
    box(-L - .7, -4, 13, .7, 8, .6, '#dae1cc');
    for (const y of [-W + 4, W - 5]) { box(-L - 2, y, 3.6, 3, 3.2, 2, '#bdcbc4'); box(-L - 2.1, y + .4, 3.9, .2, 2.3, 1.2, '#263e47'); }
    quad([rear+4,-W+3.6,h-.2],[rear+4,-W+3.6,h-2.4],[front-7,-W+3.6,h-2.4],[front-7,-W+3.6,h-.2],'#8cc4c2',.25);
    for (const y of [-W + 2, W - 10]) {
      box(-L - .4, y, 10, .8, 8, 3.5, '#f47e72');
      box(L - .3, y, 11, .8, 8, 3, '#fff4c9');
    }
    if (car.type === 'coupe') {
      for (const y of [-W + 3, W - 4]) box(-L + 5, y, 16, 2, 1.2, 7, '#324d55');
      box(-L + 4, -W - 3, 23, 5, W * 2 + 6, 2.3, '#34555b');
      for (const y of [-4, 3]) flat(L * .42, y, L * .5, 1.3, 16.6, '#f9dcb0');
    }
    if (car.type === 'taxi') box(-4, -6, h, 8, 12, 4, '#f2c466');
    if (car.police) {
      box(-L + 4, -W - .2, 8, L * .6, W * 2 + .4, 6, '#284d60');
      box(-2, -12, h, 5, 24, 1.5, '#2b4654');
      box(-1.8, -11, h + 1.6, 4.7, 10, 2.6, '#ff6278'); box(-1.8, 1, h + 1.6, 4.7, 10, 2.6, '#5be3ff');
      box(-3, -W - .5, 10, 10, 1, 4, '#f6df9c'); box(-3, W - .5, 10, 10, 1, 4, '#f6df9c');
    }
    if (car.boosting) for (const y of [-9, 9]) { tri([-L, y - 2, 6], [-L - 23, y, 5], [-L, y + 2, 6], '#75e5ff', 1); }
    if (car.hp < 30) for (let i = 0; i < 4; i++) box(L - 8 + Math.sin(i + state.elapsed) * 3, -5, 20 + i * 10, 8 + i * 3, 9, 8, '#73837e');
  }
  const actors = [...state.peds]; if (!state.player.car) actors.push(state.player);
  for (const a of actors) {
    if (!visible(a,30)) continue;
    const player = a === state.player, skin = player ? '#d9a07d' : ['#d7a17f', '#885d49', '#e5ba92'][Math.abs(a.seed || 0) % 3];
    m.transform(a.x, a.y, 0, a.angle);
    if(distance(a,state.player)>480) { if(a.hp<=0)continue;box(-3,-5,14,6,10,13,a.color||'#6899a5');box(-3,-3,28,6,6,7,skin);for(const y of [-4,2])box(-2,y,0,4,3,14,'#344955');continue; }
    flat(-4, -5, 15, 14, .65, '#8c967d');
    if (a.hp <= 0 && !player) { box(-12, -5, 1, 23, 10, 5, a.color || '#b77769'); continue; }
    const stride = (player ? state.walking : !a.enemy) ? Math.sin(state.elapsed * 9 + (a.seed || 0)) * 3 : 0;
    for (const side of [-1, 1]) {
      const y = side * 3;
      beam([0, y, 17], [stride * side, y, 8], 2.4, '#304853'); beam([stride * side, y, 8], [-stride * side, y, 2], 2.1, '#2e4553');
      box(-stride * side - 2, y - 2, 0, 6, 4, 2.8, '#263e49');
    }
    box(-4, -5, 16, 8, 10, 12, player ? '#eea17c' : a.police ? '#527a91' : a.enemy ? '#a75558' : a.color);
    beam([0, 0, 28], [0, 0, 30], 2.3, skin);
    box(-3.3, -3.5, 29, 6.7, 7, 7, skin);
    box(-3.7, -3.8, 34, 7, 7.6, 3, player ? '#463b32' : a.police ? '#244a60' : '#58473a');
    if (player) { beam([-3, 0, 34], [-6, 0, 25], 2.6, '#463b32'); box(-4.3, -5.2, 16, 1, 10.4, 9, '#d9c597'); }
    const armed = player ? a.weapon !== 'FISTS' : a.enemy || (a.police && state.heat > 0);
    for (const side of [-1, 1]) {
      const shoulder = [0, side * 6, 26], elbow = armed ? [6, side * 6, 23] : [stride * side, side * 6, 20], hand = armed ? [13, side * 2, 25] : [0, side * 6, 16];
      beam(shoulder, elbow, 2.1, player ? '#e5a380' : a.color || '#628fa2'); beam(elbow, hand, 1.7, skin);
    }
    if (armed) {
      box(12, -2, 24, player && a.weapon === 'SCATTERGUN' ? 13 : 8, 2.3, 2.3, '#243f4a'); box(13, -2, 21, 2, 2, 4, '#263c45');
      if (a.muzzle > 0 || (!player && a.enemy && a.cooldown < .1)) {
        for (let i = 0; i < 6; i++) { const t = i * Math.PI / 3; tri([22, 0, 25], [25, Math.sin(t) * 5, 25 + Math.cos(t) * 5], [32, 0, 25], '#ffe5a0', 1); }
      }
    }
  }
  if (state.helicopter && state.heat >= 3) {
    const h = state.helicopter; m.transform(h.x, h.y, h.z, h.angle, 1.4);
    box(-22, -9, 0, 37, 18, 14, '#365562'); box(-12, -8, 14, 22, 16, 4, '#456b75');
    quad([15, -9, 0], [24, -6, 2], [22, -6, 11], [15, -9, 14], '#9cccd0', .4);
    quad([15, 9, 0], [15, 9, 14], [22, 6, 11], [24, 6, 2], '#3a7585', .4);
    beam([-20, 0, 7], [-62, 0, 13], 2.7, '#3b606c'); box(-61, -2, 12, 5, 4, 17, '#4b7079');
    for (const y of [-10, 10]) { beam([-17, y, -7], [18, y, -7], 1, '#c2cfbe'); beam([-9, y, -7], [-9, y / 2, 0], 1, '#c2cfbe'); }
    beam([-5, 0, 17], [-5, 0, 22], 1.3, '#cdd4bf');
    const a = state.elapsed * 15, x = Math.cos(a) * 60, y = Math.sin(a) * 60;
    quad([-5 - x, -y, 22], [-3 - x, -y + 2, 22], [-3 + x, y + 2, 22], [-5 + x, y, 22], '#263c47');
    quad([-5 + y, -x, 22.1], [-3 + y, -x + 2, 22.1], [-3 - y, x + 2, 22.1], [-5 - y, x, 22.1], '#526f72');
  }
  m.transform();
  for (const pickup of state.pickups) { box(pickup.x - 4, pickup.y - 3, 3, 8, 6, 5, pickup.kind === 'cash' ? '#76dcb0' : '#b4efcb'); }
  for (const b of state.bullets) beam([b.x, b.y, 24], [b.x - Math.cos(b.angle) * 29, b.y - Math.sin(b.angle) * 29, 24], .45, '#ffe6a8');
  for (const p of state.effects.particles) box(p.x, p.y, p.z, p.size, p.size, p.size, p.color);
  for (const s of state.effects.skids) {
    if (distance(s, state.player) > 650) continue;
    m.transform(s.x, s.y, 0, s.angle); for (const y of [-10, 10]) flat(-7, y, 14, 1.5, .55, '#3f5152');
  }
  m.transform();
  for (const r of state.roadblocks) for (const dx of [-50, 0, 50]) { box(r.x + dx, r.y + 150, 0, 32, 8, 15, '#e2bc79'); for (let k = 3; k < 30; k += 10) box(r.x + dx + k, r.y + 149.8, 4, 4, .4, 8, '#344d55'); }
  return m;
}
