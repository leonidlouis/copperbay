import { coastObjects } from './seaside.js';
import { hash, inside, randomGenerator } from './math.js';
export const CITY_SIZE = 4000;
export const ROAD_GAP = 480;
export const ROAD_START = 320;
export const ROAD_WIDTH = 150;
export const ROAD_CENTERS = Array.from({ length: 8 }, (_, i) => ROAD_START + i * ROAD_GAP);
export const DISTRICTS = [
  { name: 'PORT MERIDIAN', tag: 'THE DOCKS', x: 800, y: 3200, color: '#71e3cc' },
  { name: 'CROWN QUARTER', tag: 'DOWNTOWN', x: 2250, y: 2100, color: '#ffc975' },
  { name: 'SAFFRON STRIP', tag: 'NIGHTLIFE', x: 1100, y: 1100, color: '#fc8ba7' },
  { name: 'VERDIGRIS HILLS', tag: 'THE HILLS', x: 3100, y: 650, color: '#aed7a0' },
];
export const PLACES = {
  home: { x: 855, y: 790, name: 'MARA’S GARAGE', icon: 'H' },
  shop: { x: 1675, y: 1540, name: 'NIGHT OWL SUPPLY', icon: '+' },
  dock: { x: 820, y: 3225, name: 'PIER 09', icon: 'D' },
  radio: { x: 3220, y: 835, name: 'FREE BAY RADIO', icon: 'R' },
  clinic: { x: 2525, y: 2250, name: 'BAY CLINIC', icon: '+' },
  garage: { x: 380, y: 3220, name: 'GHOST CUSTOMS', icon: 'G' },
};
export function districtAt(x, y) {
  if (x < 650 && y > 650 && y < 2600) return { name: 'SOLARIS BEACH', tag: 'OCEAN DRIVE' };
  if (y > 2760) return DISTRICTS[0];
  if (x > 2640 && y < 1500) return DISTRICTS[3];
  if (y < 1500) return DISTRICTS[2];
  return DISTRICTS[1];
}
export function roadDistance(v) { return Math.min(...ROAD_CENTERS.map(c => Math.abs(v - c))); }
export function onRoad(x, y) { return roadDistance(x) < 75 || roadDistance(y) < 75; }
export function createCity() {
  const rng = randomGenerator(8675309);
  const buildings = [], palms = [], lamps = [], props = [], parks = [];
  const seaside = coastObjects();
  for (let y = 700; y < 2600; y += 110) palms.push({ x: 225, y });
  const landmarks = [{ x: 255, y: 2950, type: 'crane' }, { x: 255, y: 3470, type: 'crane' }, { x: 3294, y: 875, type: 'radio' }];
  for (let i = 0; i < 16; i++) landmarks.push({ x: -90 + (i % 2) * 130, y: 2790 + Math.floor(i / 2) * 81, type: 'container', w: 100, d: 39, color: ['#ba756b', '#609a9a', '#c6a470'][i % 3] });
  const signs = ['SOLARIS', 'BAY FM 88.4', 'COPPER CLUB', 'MOTEL', 'PALOMA', 'OPEN LATE', 'NIGHT OWL', 'CROWN BANK', 'ARCADE', 'GOLDEN HOUR', 'VINYL', 'ORBIT'];
  const colors = ['#d9a58d', '#c58782', '#d5b49b', '#829e9f', '#e6ba9a', '#ad9db0', '#799a97'];
  for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) {
    const x = 320 + i * 480 + 100, y = 320 + j * 480 + 100;
    if ((i === 4 && j === 1) || (i === 1 && j === 4) || (i === 5 && j === 5)) {
      parks.push({ x, y, w: 280, d: 280 });
      for (let k = 0; k < 16; k++) palms.push({ x: x + 25 + rng() * 230, y: y + 25 + rng() * 230, park: true });
      continue;
    }
    const split = rng() > .32;
    const count = split ? 2 : 1;
    for (let k = 0; k < count; k++) {
      const w = split ? 112 + rng() * 15 : 258;
      const d = 210 + rng() * 42;
      const bx = x + k * 148 + 7, by = y + 12 + rng() * 22;
      let h = 30 + rng() * 48;
      if (i >= 3 && i <= 5 && j >= 2 && j <= 4) h += rng() * 85;
      if (j >= 5) h = 28 + rng() * 20;
      if (i >= 5 && j < 3) h = 25 + rng() * 20;
      buildings.push({ x: bx, y: by, w, d, h, variant: j >= 5 ? 'warehouse' : i >= 5 && j < 3 ? 'villa' : j < 2 ? 'strip' : 'urban', color: colors[Math.floor(rng() * colors.length)], roof: rng() > .45 ? '#b4bfa8' : '#e2b092', sign: signs[(i * 3 + j + k * 5) % signs.length], neon: ['#70efdb', '#ff8a9e', '#ffc86a'][(i + j + k) % 3], id: buildings.length, floors: Math.max(1, Math.floor(h / 23)) });
    }
    for (let k = 0; k < 3; k++) {
      palms.push({ x: x + k * 100 + 24, y: y - 12 });
      palms.push({ x: x - 12, y: y + k * 100 + 28 });
    }
    props.push({ x: x + 140, y: y + 270, type: 'table' });
  }
  const customs = buildings.reduce((a, b) => Math.hypot(a.x - 380, a.y - 3220) < Math.hypot(b.x - 380, b.y - 3220) ? a : b);
  customs.sign = 'GHOST CUSTOMS'; customs.neon = '#87e9c9'; customs.customs = true;
  for (const x of ROAD_CENTERS) for (const y of ROAD_CENTERS) {
    lamps.push({ x: x + 87, y: y + 88 });
    lamps.push({ x: x - 87, y: y - 88 });
    props.push({ x: x + 91, y: y - 84, type: 'signal' });
  }
  return {
    buildings, palms, lamps, props, parks, landmarks, seaside,
    blocked(x, y, radius = 8) {
      const shore = y > 700 && y < 2530 ? -145 : y > 2750 && y < 3490 ? -125 : 205;
      if (x < shore || y < 205 || x > 3930 || y > 3930) return true;
      return buildings.some(b => inside(x, y, b, radius)) || landmarks.some(b => b.type === 'container' && inside(x, y, b, radius));
    },
    water(x, y) { return x < (y > 700 && y < 2530 ? -165 : y > 2750 && y < 3490 ? -130 : 160) || y > 3960; },
  };
}
