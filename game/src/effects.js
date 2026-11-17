import { randomGenerator, TAU } from './math.js';
export function createEffects() {
  const particles = [], skids = []; const rng = randomGenerator(6701);
  return {
    particles, skids,
    burst(x, y, color, count = 12, speed = 120, z = 9) {
      for (let i = 0; i < count; i++) {
        const a = rng() * TAU, v = speed * (.3 + rng());
        particles.push({ x, y, z, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vz: 30 + rng() * 60, life: .3 + rng() * .7, max: 1, color, size: 1 + rng() * 3 });
      }
    },
    skid(x, y, angle) { if (skids.length > 600) skids.shift(); skids.push({ x, y, angle, life: 18 }); },
    update(dt) {
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]; p.life -= dt;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        p.x += p.vx * dt; p.y += p.vy * dt; p.z = Math.max(0, p.z + p.vz * dt); p.vz -= dt * 160;
      }
      for (let i = skids.length - 1; i >= 0; i--) if ((skids[i].life -= dt) < 0) skids.splice(i, 1);
    },
  };
}
