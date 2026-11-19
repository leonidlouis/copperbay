export const CREAM = '#fff1d7', MUTED = '#aec9c8', GOLD = '#ffd38a', MINT = '#85e6c6', RED = '#ff9c8e';
export function createUI(p, buttons) {
  const { ctx, text } = p;
  function panel(x, y, w, h, alpha = .94) {
    ctx.fillStyle = `rgba(12,39,50,${alpha})`; ctx.beginPath(); ctx.roundRect(x, y, w, h, 7); ctx.fill();
    ctx.strokeStyle = '#c8e6d82e'; ctx.lineWidth = 1; ctx.stroke();
  }
  function label(t, x, y, color = MUTED, size = 10) { text(t, x, y, size, color, '800'); }
  function bar(x, y, w, value, color = MINT, h = 4) { ctx.fillStyle = '#42606a'; ctx.fillRect(x, y, w, h); ctx.fillStyle = color; ctx.fillRect(x, y, w * Math.max(0, Math.min(1, value)), h); }
  function wrap(t, x, y, width, size = 20, color = CREAM, lineHeight = 25) {
    ctx.font = `700 ${size}px Arial`; let line = '';
    for (const word of t.split(' ')) { if (ctx.measureText(line + word).width > width && line) { text(line.trim(), x, y, size, color); line = ''; y += lineHeight; } line += word + ' '; }
    text(line.trim(), x, y, size, color); return y;
  }
  function button(id, title, sub, x, y, w = 330, accent = false, disabled = false) {
    ctx.fillStyle = accent ? GOLD : '#244b57'; ctx.beginPath(); ctx.roundRect(x, y, w, 56, 5); ctx.fill();
    ctx.strokeStyle = accent ? '#ffe4ac' : '#91b6b54a'; ctx.stroke();
    text(title, x + 17, y + 25, Math.min(18,(w-30)/(title.length*.61)), accent ? '#173e49' : disabled ? '#6d9097' : CREAM, '900'); label(sub, x + 18, y + 43, accent ? '#41606a' : MUTED, 9);
    if (!disabled) buttons.push({ id, x, y, w, h: 56 });
  }
  return { ...p, buttons, panel, label, bar, wrap, button };
}
