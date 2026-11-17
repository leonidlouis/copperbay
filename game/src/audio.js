// Synthesized coastal electro score, engine, gunfire, impact and two-tone police sirens.
export function createAudio() {
  let ctx, master, engine, engineGain, clock = 0, beat = 0, volume = .32, rotorClock = 0;
  function unlock() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = volume; master.connect(ctx.destination);
      engine = ctx.createOscillator(); engine.type = 'sawtooth';
      const filter = ctx.createBiquadFilter(); filter.frequency.value = 240;
      engineGain = ctx.createGain(); engineGain.gain.value = 0;
      engine.connect(filter); filter.connect(engineGain); engineGain.connect(master); engine.start();
    }
    if (ctx.state === 'suspended') ctx.resume();
  }
  function tone(freq, duration, level = .2, type = 'sine', end = freq) {
    if (!ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, ctx.currentTime); o.frequency.exponentialRampToValueAtTime(Math.max(20, end), ctx.currentTime + duration);
    g.gain.setValueAtTime(level, ctx.currentTime); g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + duration);
    o.connect(g); g.connect(master); o.start(); o.stop(ctx.currentTime + duration);
  }
  function sound(name) {
    if (name === 'gun') { tone(115, .13, .5, 'sawtooth', 25); tone(1800, .035, .14, 'square', 90); }
    if (name === 'hit') tone(70, .2, .4, 'triangle', 28);
    if (name === 'cash') { tone(660, .18, .2); setTimeout(() => tone(990, .25, .15), 100); }
    if (name === 'boom') { tone(45, .8, .8, 'sawtooth', 20); tone(180, .35, .3, 'square', 20); }
    if (name === 'click') tone(520, .08, .1, 'sine', 780);
  }
  return {
    unlock, sound,
    setVolume(v) { volume = v; if (master) master.gain.value = v; },
    update(dt, state) {
      if (!ctx) return;
      engineGain.gain.setTargetAtTime(state.player.car && state.screen === 'play' ? .07 : 0, ctx.currentTime, .1);
      engine.frequency.setTargetAtTime(35 + Math.abs(state.player.car?.speed || 0) * .4, ctx.currentTime, .1);
      rotorClock += dt;
      if (rotorClock >= .13) {
        rotorClock %= .13;
        const air = state.air;
        if (air && state.screen === 'play' && !state.mapOpen && !state.garageOpen) {
          const d = Math.hypot(air.x - state.player.x, air.y - state.player.y);
          if (d < 810) tone(66, .12, .085 * (1 - d / 810), 'triangle', 38);
        }
      }
      clock += dt;
      if (clock > .3) {
        clock = 0; beat++;
        if (state.screen === 'play' || state.screen === 'title') {
          tone([55, 55, 65.41, 49][Math.floor(beat / 8) % 4], .24, .12, 'triangle');
          if (beat % 2 === 0) tone([220, 261.63, 329.63, 392, 329.63, 261.63, 196, 164.81][beat / 2 % 8], .45, .025, 'sine');
          if (beat % 4 === 0) tone(110, .12, .12, 'sine', 30);
          if (state.heat > 0 && state.cars.some(c => c.police && !c.wreck && Math.hypot(c.x - state.player.x, c.y - state.player.y) < 550)) tone(beat % 2 ? 620 : 840, .27, .035, 'sine');
        }
      }
    },
  };
}
