import { hash, inside, randomGenerator } from './math.js';
export const CITY_SIZE = 4000;
export const ROAD_GAP = 480;
export const ROAD_START = 320;
export const ROAD_WIDTH = 150;
export const BEACH_EDGE = -48;
export const ROAD_CENTERS = Array.from({ length: 8 }, (_, i) => ROAD_START + i * ROAD_GAP);
export const DISTRICTS = [
  { name: 'PORT MERIDIAN', tag: 'THE DOCKS', x: 800, y: 3200, color: '#71e3cc' },
  { name: 'CROWN QUARTER', tag: 'DOWNTOWN', x: 2250, y: 2100, color: '#ffc975' },
  { name: 'SAFFRON STRIP', tag: 'NIGHTLIFE', x: 1100, y: 1100, color: '#fc8ba7' },
  { name: 'VERDIGRIS HILLS', tag: 'THE HILLS', x: 3100, y: 650, color: '#aed7a0' },
  { name: 'PALOMA BEACH', tag: 'THE WATERFRONT', x: 365, y: 1400, color: '#f1a581' },
];
export const PLACES = {
  home: { x: 855, y: 790, name: 'MARA’S GARAGE', icon: 'H' },
  shop: { x: 1675, y: 1540, name: 'NIGHT OWL SUPPLY', icon: '+' },
  dock: { x: 820, y: 3225, name: 'PIER 09', icon: 'D' },
  radio: { x: 3220, y: 835, name: 'FREE BAY RADIO', icon: 'R' },
  clinic: { x: 2525, y: 2250, name: 'BAY CLINIC', icon: '+' },
  garage: { x: 430, y: 3180, name: 'GHOST CUSTOMS', icon: 'G' },
};
export function districtAt(x, y) {
  if (y > 2760) return DISTRICTS[0];
  if (x < 800 && y < 2440) return DISTRICTS[4];
  if (x > 2640 && y < 1500) return DISTRICTS[3];
  if (y < 1500) return DISTRICTS[2];
  return DISTRICTS[1];
}
export function roadDistance(v) { return Math.min(...ROAD_CENTERS.map(c => Math.abs(v - c))); }
export function onRoad(x, y) { return roadDistance(x) < 75 || roadDistance(y) < 75; }
export function createCity() {
  const rng = randomGenerator(8675309);
  const buildings = [], palms = [], lamps = [], props = [], parks = [];
  const landmarks = [{ x: 255, y: 2950, type: 'crane' }, { x: 255, y: 3470, type: 'crane' }, { x: 3294, y: 875, type: 'radio' }];
  for (let i = 0; i < 16; i++) landmarks.push({ x: 25 + (i % 2) * 111, y: 2800 + Math.floor(i / 2) * 82, type: 'container', color: ['#cb7156', '#559e99', '#d5a35b'][i % 3] });
  for (let y = 350; y < 2420; y += 128) {
    palms.push({ x: 200 + (y % 3) * 10, y, coastal: true });
    if (y % 5 !== 0) props.push({ x: 45 + (y % 4) * 17, y: y + 47, type: 'parasol' });
  }
  for (let y = 500; y < 2330; y += 289) props.push({ x: -215 - (y % 7) * 37, y: y + 10, type: 'sailboat' });
  props.push({ x: 130, y: 885, type: 'lifeguard' }, { x: 128, y: 1690, type: 'lifeguard' }, { x: -141, y: 1272, type: 'sailboat' });
  const signs = ['SOLARIS', 'BAY FM 88.4', 'COPPER CLUB', 'MOTEL', 'PALOMA', 'OPEN LATE', 'NIGHT OWL', 'CROWN BANK', 'ARCADE', 'GOLDEN HOUR', 'VINYL', 'ORBIT'];
  const colors = ['#dfad89', '#d98d7f', '#e8c5a0', '#8fb2aa', '#f0c29a', '#c5a9b6', '#87aaa1'];
  for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) {
    const x = 320 + i * 480 + 100, y = 320 + j * 480 + 100;
    if ((i === 0 && j === 1) || (i === 4 && j === 1) || (i === 1 && j === 4) || (i === 5 && j === 5)) {
      parks.push({ x, y, w: 280, d: 280, plaza: i === 0 });
      for (let k = 0; k < 16; k++) {
        const px = x + 25 + rng() * 230, py = y + 25 + rng() * 230;
        if (i !== 0) palms.push({ x: px, y: py, park: true });
      }
      if (i === 0) {
        palms.push({ x: x + 34, y: y + 38, coastal: true }, { x: x + 37, y: y + 242, park: true });
        palms.push({ x: x + 245, y: y + 36, park: true }, { x: x + 245, y: y + 239, park: true });
      }
      continue;
    }
    const split = rng() > .32;
    const count = split ? 2 : 1;
    for (let k = 0; k < count; k++) {
      const w = split ? 112 + rng() * 15 : 258;
      const d = (i === 0 && j < 4 ? 180 : 210) + rng() * 42;
      const bx = x + k * 148 + 7, by = y + 12 + rng() * 22;
      let h = 30 + rng() * 48;
      if (i >= 3 && i <= 5 && j >= 2 && j <= 4) h += rng() * 85;
      if (j >= 5) h = 28 + rng() * 20;
      if (i >= 5 && j < 3) h = 25 + rng() * 20;
      const coastal = i === 0 && j < 4;
      if (coastal) h = 52 + j * 16 + k * 34;
      const color = colors[Math.floor(rng() * colors.length)], roof = rng() > .45 ? '#97a5a0' : '#d6a38b';
      const sign = i === 0 && j === 6 && k === 0 ? 'GHOST CUSTOMS' : coastal ? ['HOTEL PALOMA', '', 'CASA SOL', 'THE SURFLINE'][j] : signs[(i * 3 + j + k * 5) % signs.length];
      buildings.push({ x: bx, y: by, w, d, h, variant: coastal ? 'deco' : j >= 5 ? 'warehouse' : i >= 5 && j < 3 ? 'villa' : j < 2 ? 'strip' : 'urban', color: coastal ? ['#f1c591', '#82b9b2', '#e7a288'][j % 3] : color, roof, sign, neon: ['#70efdb', '#ff8a9e', '#ffc86a'][(i + j + k) % 3], id: buildings.length, floors: Math.max(1, Math.floor(h / 23)) });
    }
    for (let k = 0; k < 3; k++) {
      palms.push({ x: x + k * 100 + 24, y: y - 12 });
      palms.push({ x: x - 12, y: y + k * 100 + 28 });
    }
    props.push({ x: x + 140, y: y + 270, type: 'table' });
  }
  for (const x of ROAD_CENTERS) for (const y of ROAD_CENTERS) {
    lamps.push({ x: x + 87, y: y + 88 });
    lamps.push({ x: x - 87, y: y - 88 });
    props.push({ x: x + 91, y: y - 84, type: 'signal' });
  }
  buildings.push({
    x: 424, y: 916, w: 76, d: 101, h: 84, floors: 3,
    variant: 'deco', color: '#efba99', roof: '#e7cbb2', neon: '#8be5cf',
    sign: 'PALOMA SOCIAL', id: buildings.length,
  });
  return {
    buildings, palms, lamps, props, parks, landmarks,
    blocked(x, y, radius = 8, vehicle = false) {
      const onBeach = y >= 245 && y < 2470;
      if (x < (onBeach ? (vehicle ? 190 : BEACH_EDGE + 27) : 205) || y < 205 || x > 3930 || y > 3930) return true;
      return buildings.some(b => inside(x, y, b, radius));
    },
    water(x, y) { return x < (y >= 245 && y < 2470 ? BEACH_EDGE : 160) || y > 3960; },
  };
}
