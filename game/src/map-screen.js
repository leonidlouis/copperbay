// The pause atlas uses actual city geometry, story contacts and saved progression.
import { ROAD_CENTERS, PLACES, DISTRICTS } from './city.js';
import { STORY, missionTarget } from './missions.js';
import { STREET_RACE, RACE_ROUTE } from './activities.js';
import { reputation } from './progression.js';
export function drawMapScreen(p, state) {
  const { ctx, text, circle } = p, gold = '#ffd080', mint = '#87e6c6';
  const box = (x, y, w, h, fill) => { ctx.fillStyle = fill; ctx.beginPath(); ctx.roundRect(x, y, w, h, 8); ctx.fill(); };
  ctx.fillStyle = '#12364255'; ctx.fillRect(0, 0, 1280, 800);
  box(56, 55, 1168, 690, '#142f3ff5');
  text('COPPER BAY', 85, 106, 33, '#fff0d5', '900'); text('CITY ATLAS', 344, 106, 25, gold, '900');
  text('M / ESC  RETURN', 1191, 104, 13, mint, '900', 'right');
  const ox = 141, oy = 155, scale = .121;
  const map = (x, y) => ({ x: ox + x * scale, y: oy + y * scale });
  box(80, 135, 690, 536, '#287c83');
  ctx.save(); ctx.beginPath(); ctx.rect(80, 135, 690, 536); ctx.clip();
  const area = (x, y, w, h, color) => { const q = map(x, y); ctx.fillStyle = color; ctx.fillRect(q.x, q.y, w * scale, h * scale); };
  for (let i = 0; i < 20; i++) { ctx.strokeStyle = '#75b9ac33'; ctx.beginPath(); ctx.moveTo(82, 180 + i * 27); ctx.lineTo(128, 166 + i * 27); ctx.stroke(); }
  area(190, 190, 3790, 3790, '#75978b'); area(-170, 690, 360, 1850, '#efd2a1');
  area(135, 650, 100, 1950, '#dba785'); area(-130, 2750, 320, 740, '#b9ac91');
  for (const b of state.city.buildings) area(b.x, b.y, b.w, b.d, b.variant === 'villa' ? '#b4c395' : '#c2bba0');
  for (const park of state.city.parks) area(park.x, park.y, park.w, park.d, '#5b997c');
  ctx.lineWidth = 150 * scale; ctx.strokeStyle = '#b1bba3'; ctx.beginPath();
  for (const v of ROAD_CENTERS) { const a = map(v, 190), b = map(v, 3970), c = map(190, v), d = map(3970, v); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.moveTo(c.x, c.y); ctx.lineTo(d.x, d.y); } ctx.stroke();
  ctx.lineWidth = 100 * scale; ctx.strokeStyle = '#476d6d'; ctx.stroke();
  const route = [STREET_RACE, ...RACE_ROUTE]; ctx.strokeStyle = '#c5a3e8'; ctx.lineWidth = 3; ctx.setLineDash([6, 5]); ctx.beginPath();
  route.forEach((v, i) => { const q = map(v.x, v.y); i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); }); ctx.stroke(); ctx.setLineDash([]);
  const districtLabel = (x, y, title, color) => { const q = map(x, y), w = ctx.measureText(title).width + 18; box(q.x - w / 2, q.y - 15, w, 23, '#183a43dd'); text(title, q.x, q.y + 1, 12, color, '900', 'center'); };
  districtLabel(1050, 520, 'SAFFRON STRIP', '#ffb29f'); districtLabel(2830, 620, 'VERDIGRIS HILLS', '#d4e8ac');
  districtLabel(2310, 2500, 'CROWN QUARTER', gold); districtLabel(1900, 3680, 'PORT MERIDIAN', mint);
  ctx.save(); ctx.translate(120, 400); ctx.rotate(-Math.PI / 2); text('SOLARIS BEACH', 0, 0, 15, '#f9e7bb', '900', 'center'); ctx.restore();
  const marker = (x, y, icon, color, r = 12) => { const q = map(x, y); circle(q.x + 1, q.y + 2, r + 2, '#15394488'); circle(q.x, q.y, r, color); text(icon, q.x, q.y + 4, 12, '#193d47', '900', 'center'); };
  STORY.forEach((s, i) => marker(s.start.x + (i === 5 ? 150 : 0), s.start.y + (i === 2 ? 170 : 0), i < state.stats.missions ? '✓' : String(i + 1), i < state.stats.missions ? '#8ed8b5' : gold));
  for (const [key, place] of Object.entries(PLACES)) if (!['radio', 'dock'].includes(key)) marker(place.x, place.y + (key === 'home' ? 180 : 0), place.icon, mint, 9);
  marker(STREET_RACE.x, STREET_RACE.y, '⚑', '#d3b7f5');
  const target = missionTarget(state), player = map(state.player.x, state.player.y);
  if (target) {
    const q = map(target.x, target.y); ctx.strokeStyle = gold; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(player.x, player.y); ctx.lineTo(q.x, player.y); ctx.lineTo(q.x, q.y); ctx.stroke();
    circle(q.x, q.y, 16, '#ffd08033');
  }
  circle(player.x, player.y, 9, '#fff6da'); text('▲', player.x, player.y + 5, 15, '#24696b', '900', 'center');
  text('N ↑', 733, 165, 18, '#f7e8c8', '900', 'right');
  ctx.restore();
  text('01—06  STORY', 94, 700, 12, gold, '900'); text('+  SUPPLY', 251, 700, 12, mint, '900'); text('G  CUSTOMS', 386, 700, 12, mint, '900'); text('⚑  STREET RACE', 547, 700, 12, '#d3b7f5', '900');
  const rep = reputation(state), x = 799;
  text('THE MERIDIAN FILES', x, 161, 12, gold, '900');
  text(`CHAPTER ${Math.min(6, state.mission.index + 1)} / 6`, x, 195, 28, '#fff0d5', '900');
  text(STORY[Math.min(5, state.mission.index)].name, x, 224, 16, gold, '900');
  text('$' + state.player.money.toLocaleString('en-US'), 1190, 267, 31, mint, '900', 'right');
  text(rep.name, x, 266, 21, '#fff0d5', '900');
  text(`${rep.total} REP  /  ${rep.next}`, x, 293, 12, '#b0c6c3', '800');
  box(x, 308, 390, 7, '#385565'); box(x, 308, 390 * Math.min(1, rep.total / rep.next), 7, gold);
  const skills = [['DRIVING', Math.min(5, 1 + Math.floor(state.stats.distance / 5000))], ['COMBAT', Math.min(5, 1 + Math.floor(state.stats.takedowns / 5))]];
  skills.forEach(([name, level], i) => { text(name, x, 353 + i * 32, 11, '#b0c6c3', '900'); for (let j = 0; j < 5; j++) box(x + 175 + j * 42, 341 + i * 32, 32, 10, j < level ? mint : '#385565'); });
  text('YOUR GARAGE & ARSENAL', x, 426, 12, gold, '900');
  text('✓  Cavell XR  ·  Pistol', x, 456, 17, '#fff0d5', '800');
  text(state.player.shotgun ? '✓  Scattergun unlocked' : '○  Scattergun · Night Owl Supply', x, 485, 16, state.player.shotgun ? mint : '#b0c6c3');
  text(`${state.progression.turbo ? '✓' : '○'}  Stage II engine  /  ${state.progression.chassis ? 'Armored chassis' : 'Stock chassis'}`, x, 514, 14, mint);
  box(x, 542, 390, 123, '#243e50'); text('⚑  SOLARIS SPRINT', x + 16, 573, 21, '#d3b7f5', '900');
  text('Coastal street race  ·  $900 prize', x + 16, 600, 15, '#fff0d5');
  text(`${state.progression.races} races  /  BEST ${state.progression.bestRace ? state.progression.bestRace.toFixed(1) + 's' : '—'}  /  +250 REP`, x + 16, 624, 12, '#b0c6c3');
  text('Drive to the flag. Press R to race.', x + 16, 648, 12, mint);
  text(`${state.stats.missions}/6 JOBS   ·   ${state.stats.carsStolen} CARS STOLEN   ·   ${state.stats.takedowns} TAKEDOWNS`, x, 701, 11, '#b0c6c3', '800');
}
