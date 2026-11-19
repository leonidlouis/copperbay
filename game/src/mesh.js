// Tiny colored-triangle mesh builder. All geometry is authored in world coordinates.
const colors = new Map();
export function rgb(hex) {
  if (!colors.has(hex)) { const n = parseInt(hex.slice(1), 16); colors.set(hex, [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]); }
  return colors.get(hex);
}
export function createMesh() {
  const data = []; let origin = [0, 0, 0], cs = 1, sn = 0, scale = 1;
  function transform(x = 0, y = 0, z = 0, angle = 0, size = 1) { scale = size; origin = [x, y, z]; cs = Math.cos(angle) * scale; sn = Math.sin(angle) * scale; }
  function point(v) { return [origin[0] + cs * v[0] - sn * v[1], origin[1] + sn * v[0] + cs * v[1], origin[2] + v[2] * scale]; }
  function tri(a, b, c, color, emission = 0) {
    a = point(a); b = point(b); c = point(c);
    const u = b.map((n, i) => n - a[i]), v = c.map((n, i) => n - a[i]);
    const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    const l = Math.hypot(...n) || 1, col = rgb(color);
    for (const p of [a, b, c]) data.push(...p, ...n.map(x => x / l), ...col, emission);
  }
  function quad(a, b, c, d, color, emission = 0) { tri(a, b, c, color, emission); tri(a, c, d, color, emission); }
  function box(x, y, z, w, d, h, color, top = color) {
    const a = [x, y, z], b = [x + w, y, z], c = [x + w, y + d, z], e = [x, y + d, z];
    const A = [x, y, z + h], B = [x + w, y, z + h], C = [x + w, y + d, z + h], E = [x, y + d, z + h];
    quad(a, b, B, A, color); quad(b, c, C, B, color); quad(c, e, E, C, color); quad(e, a, A, E, color); quad(A, B, C, E, top);
  }
  function flat(x, y, w, d, z, color, emission = 0) { quad([x, y, z], [x + w, y, z], [x + w, y + d, z], [x, y + d, z], color, emission); }
  function beam(a, b, radius, color, sides = 6) {
    const dir = b.map((v, i) => v - a[i]), l = Math.hypot(...dir), u = Math.abs(dir[2]) > l * .9 ? [1, 0, 0] : [-dir[1] / Math.hypot(dir[0], dir[1]), dir[0] / Math.hypot(dir[0], dir[1]), 0];
    const v = [dir[1] * u[2] - dir[2] * u[1], dir[2] * u[0] - dir[0] * u[2], dir[0] * u[1] - dir[1] * u[0]].map(n => n / l);
    const ring = (p, i) => p.map((n, k) => n + radius * (u[k] * Math.cos(i * Math.PI * 2 / sides) + v[k] * Math.sin(i * Math.PI * 2 / sides)));
    for (let i = 0; i < sides; i++) { quad(ring(a, i), ring(a, i + 1), ring(b, i + 1), ring(b, i), color); tri(b, ring(b, i), ring(b, i + 1), color); tri(a, ring(a,i+1), ring(a,i), color); }
  }
  return { data, transform, tri, quad, box, flat, beam };
}
