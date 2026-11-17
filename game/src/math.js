// Small deterministic utilities shared by the simulation and procedural city.
export const TAU = Math.PI * 2;
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const angleDelta = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
export const lerp = (a, b, t) => a + (b - a) * t;
export function randomGenerator(seed = 61994) {
  let n = seed >>> 0;
  return () => { n = (Math.imul(n, 1664525) + 1013904223) >>> 0; return n / 4294967296; };
}
export function hash(x, y) { return Math.abs(Math.sin(x * 127.1 + y * 311.7) * 43758.5453) % 1; }
export function inside(x, y, b, pad = 0) {
  return x > b.x - pad && x < b.x + b.w + pad && y > b.y - pad && y < b.y + b.d + pad;
}
