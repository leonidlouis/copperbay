export function createInput(canvas) {
  const held = new Set(), pressed = new Set();
  const pointer = { x: 640, y: 400, down: false, clicked: false };
  window.addEventListener('keydown', e => {
    if (!e.repeat) pressed.add(e.code);
    held.add(e.code);
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', e => held.delete(e.code));
  window.addEventListener('blur', () => { held.clear(); pointer.down = false; });
  canvas.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect(); pointer.x = (e.clientX - r.left) * 1280 / r.width; pointer.y = (e.clientY - r.top) * 800 / r.height;
  });
  canvas.addEventListener('pointerdown', e => { pointer.down = true; pointer.clicked = true; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointerup', () => { pointer.down = false; });
  canvas.addEventListener('contextmenu', e => e.preventDefault());
  return { held, pointer, key: code => held.has(code), take: code => { const v = pressed.has(code); pressed.delete(code); return v; }, clear() { pressed.clear(); pointer.clicked = false; } };
}
