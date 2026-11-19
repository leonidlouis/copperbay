import { createPainter } from './painter.js';
import { drawCityGround, drawBuilding, drawPalm, drawLamp, drawStreetProp } from './city-art.js';
import { drawVehicle, drawPerson, drawMissionMarker } from './actors-art.js';
import { drawHarborCrane, drawRadioMast, drawShippingContainer, drawHarborBoat } from './landmarks.js';
import { createHUD } from './hud.js';
import { createPerspectiveRenderer } from './render3d.js';
import { missionTarget } from './missions.js';
import { PLACES } from './city.js';
import { clamp, hash } from './math.js';
export function createRenderer(canvas) {
  const p = createPainter(canvas, true), hud = createHUD(p), { ctx } = p;
  function resize() { canvas.width = 1280; canvas.height = 800; }
  resize(); window.addEventListener('resize', resize);
  const perspective = createPerspectiveRenderer(p);
  let lastState;
  let groundCache, cacheBand = -1;
  const sprites = new Map();
  function scenery(draw, object, state, kind) {
    const center = kind === 'building' ? { x: object.x + object.w / 2, y: object.y + object.d / 2 } : object;
    const key = kind + ':' + object.x + ':' + object.y;
    let sprite = sprites.get(key);
    if (!sprite) {
      const w = kind === 'building' ? 640 : 160, h = kind === 'building' ? 500 : 180;
      const anchor = kind === 'building' ? 300 : 130;
      const image = document.createElement('canvas'); image.width = w; image.height = h;
      const brush = createPainter(image, true); brush.view.x = center.x; brush.view.y = center.y;
      brush.view.shakeX = w / 2 - 640; brush.view.shakeY = anchor - 415;
      draw(brush, object, state);
      sprite = { image, w, h, anchor }; sprites.set(key, sprite);
    }
    const q = p.project(center.x, center.y); const z = p.view.zoom;
    ctx.drawImage(sprite.image, q.x - sprite.w * z / 2, q.y - sprite.anchor * z, sprite.w * z, sprite.h * z);
  }
  function cachedGround(state) {
    const band = Math.round(state.night * 4);
    if (band !== cacheBand) { cacheBand = band; groundCache = null; sprites.clear(); }
    if (!groundCache) {
      const image = document.createElement('canvas'); image.width = 7168; image.height = 4096;
      const brush = createPainter(image); brush.view.x = 2000; brush.view.y = 2000;
      brush.view.shakeX = 3584 - 640; brush.view.shakeY = 2048 - 415; brush.visible = () => true;
      brush.ctx.fillStyle = state.night > .5 ? '#173645' : '#39727a'; brush.ctx.fillRect(0, 0, 7168, 4096);
      drawCityGround(brush, state); groundCache = image;
    }
    const z = p.view.zoom;
    const sx = 3584 + (p.view.x - p.view.y) * .86 - (640 + p.view.shakeX) / z;
    const sy = 2048 + (p.view.x + p.view.y - 4000) * .48 - (415 + p.view.shakeY) / z;
    ctx.fillStyle = state.night > .5 ? '#173645' : '#39727a'; ctx.fillRect(0, 0, 1280, 800);
    ctx.drawImage(groundCache, sx, sy, 1280 / z, 800 / z, 0, 0, 1280, 800);
    for (const s of state.effects.skids) {
      if (!p.visible(s.x, s.y, 20)) continue;
      ctx.globalAlpha = Math.min(.6, s.life / 12);
      const vx = Math.cos(s.angle), vy = Math.sin(s.angle);
      for (const side of [-11, 11]) p.line(s.x - vy * side, s.y + vx * side, s.x - vy * side - vx * 12, s.y + vx * side - vy * 12, '#0a1d2b', 3);
      ctx.globalAlpha = 1;
    }
  }
  function world(state) {
    state.night = clamp((Math.abs(state.time - 12) - 4) / 5, 0, 1);
    p.view.x = state.camera.x; p.view.y = state.camera.y; p.view.zoom = state.camera.zoom;
    p.view.shakeX = Math.sin(state.elapsed * 83) * state.shake; p.view.shakeY = Math.cos(state.elapsed * 71) * state.shake * .6;
    cachedGround(state);
    // Painted street names and directional chevrons belong to the world plane.
    for (const [x, y, name] of [[1630, 1735, 'MERIDIAN AVE'], [800, 1280, 'SAFFRON BLVD'], [800, 3200, 'PIER 09'], [3200, 800, 'RADIO HILL']]) {
      if (!p.visible(x, y, 100)) continue;
      const q = p.project(x, y, 1); ctx.save(); ctx.translate(q.x, q.y); ctx.transform(.86 * p.view.zoom, .48 * p.view.zoom, -.43 * p.view.zoom, .24 * p.view.zoom, 0, 0); p.text(name, 0, 0, 20, '#bacab25c', '900', 'center'); ctx.restore();
    }
    const items = [];
    for (const object of state.city.landmarks) if (p.visible(object.x, object.y, 300)) items.push({ depth: object.x + object.y, draw: () => object.type === 'boat' ? drawHarborBoat(p, object) : object.type === 'crane' ? drawHarborCrane(p, object) : object.type === 'radio' ? drawRadioMast(p, object, state) : drawShippingContainer(p, object) });
    for (const b of state.city.buildings) if (p.visible(b.x + b.w / 2, b.y + b.d / 2, 350)) items.push({ depth: b.x + b.y + (b.w + b.d) / 2, draw: () => scenery(drawBuilding, b, state, 'building') });
    for (const t of state.city.palms) if (p.visible(t.x, t.y, 100)) items.push({ depth: t.x + t.y, draw: () => scenery(drawPalm, t, state, 'palm') });
    for (const lamp of state.city.lamps) if (p.visible(lamp.x, lamp.y, 100)) items.push({ depth: lamp.x + lamp.y, draw: () => scenery(drawLamp, lamp, state, 'lamp') });
    for (const prop of state.city.props) if (p.visible(prop.x, prop.y, 60)) items.push({ depth: prop.x + prop.y, draw: () => drawStreetProp(p, prop, state) });
    for (const car of state.cars) if (p.visible(car.x, car.y, 120)) items.push({ depth: car.x + car.y, draw: () => drawVehicle(p, car, state) });
    for (const ped of state.peds) if (p.visible(ped.x, ped.y, 50)) items.push({ depth: ped.x + ped.y, draw: () => drawPerson(p, ped, state) });
    if (!state.player.car) items.push({ depth: state.player.x + state.player.y, draw: () => drawPerson(p, state.player, state, true) });
    items.sort((a, b) => a.depth - b.depth); for (const item of items) item.draw();
    for (const point of state.roadblocks) {
      for (let i = -1; i <= 1; i++) {
        p.prism(point.x + i * 50, point.y + 150, 30, 7, 13, '#dbac6b', '#c18c62', '#865f55');
        const q = p.project(point.x + i * 50 + 15, point.y + 153, 21); p.glow(q.x, q.y, 13, '#ffad69', .5); p.circle(q.x, q.y, 3, '#ffd18c');
      }
    }
    const target = missionTarget(state);
    if (target && p.visible(target.x, target.y, 60)) drawMissionMarker(p, target, state, state.mission.active ? '◆' : 'M');
    for (const [key, place] of Object.entries(PLACES)) {
      if (!p.visible(place.x, place.y, 40)) continue;
      const q = p.project(place.x, place.y, 48);
      if (!target || Math.hypot(target.x - place.x, target.y - place.y) > 140) { p.circle(q.x, q.y, 10, '#173746e0'); p.text(place.icon, q.x, q.y + 5, 14, '#91e6c9', '900', 'center'); }
    }
    for (const pickup of state.pickups) {
      const q = p.project(pickup.x, pickup.y, 12 + Math.sin(state.elapsed * 3) * 3); p.glow(q.x, q.y, 20, '#7df6c5', .4); p.text(pickup.kind === 'cash' ? '$' : pickup.kind === 'weapon' ? 'W' : '+', q.x, q.y, 17, '#a0f2c7', '900', 'center');
    }
    for (const b of state.bullets) p.line(b.x, b.y, b.x - Math.cos(b.angle) * 25, b.y - Math.sin(b.angle) * 25, '#fff1bd', 2.2, 16);
    for (const particle of state.effects.particles) {
      const q = p.project(particle.x, particle.y, particle.z); ctx.globalAlpha = Math.min(1, particle.life * 2); p.circle(q.x, q.y, particle.size * p.view.zoom, particle.color); ctx.globalAlpha = 1;
    }
    // Restrained camera vignetting preserves the bright pastel city and luminous streets.
    const vignette = ctx.createRadialGradient(640, 380, 270, 640, 380, 830); vignette.addColorStop(0, '#102e3c00'); vignette.addColorStop(1, '#0d233962'); ctx.fillStyle = vignette; ctx.fillRect(0, 0, 1280, 800);
    if (!state.player.car && state.screen === 'play' && !state.mission.briefing) {
      const aim = state.pointer || { x: 700, y: 400 }; ctx.strokeStyle = '#fff4d8b0'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(aim.x, aim.y, 6, 0, Math.PI * 2); ctx.moveTo(aim.x - 10, aim.y); ctx.lineTo(aim.x - 4, aim.y); ctx.moveTo(aim.x + 4, aim.y); ctx.lineTo(aim.x + 10, aim.y); ctx.stroke();
    }
  }
  return {
    buttons: hud.buttons,
    unproject(x, y) { return perspective && lastState?.viewMode !== 'iso' ? perspective.aim(x, y) : p.unproject(x,y); },
    draw(state, hasSave, volume) { ctx.setTransform(1, 0, 0, 1, 0, 0); lastState = state; perspective?.setVisible(!state.mapOpen && (state.viewMode !== 'iso' || state.garageOpen || state.screen === 'title')); if(state.mapOpen){hud.draw(state,hasSave,volume);return;} if (perspective && (state.viewMode !== 'iso' || state.garageOpen || state.screen === 'title')) perspective.draw(state); else world(state); hud.draw(state, hasSave, volume); },
  };
}
