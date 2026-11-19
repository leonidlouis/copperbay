import { buildCityGeometry } from './city-geometry.js';
import { buildActorGeometry } from './actor-geometry.js';
import { perspectiveCamera, projectPerspective, aimPerspective } from './camera.js';
import { missionTarget } from './missions.js';
import { distance } from './math.js';
import { createPainter } from './painter.js';
const VERTEX = `#version 300 es
precision highp float;
in vec3 position; in vec3 normal; in vec3 color; in float emission;
uniform vec3 eye, forward, right, up; uniform float shift;
out vec3 vColor; out float vDepth;
void main(){ vec3 p=position-eye; float d=dot(p,forward);
 gl_Position=vec4(dot(p,right)*1.375+shift*d,dot(p,up)*2.2,1.00067*d-2.00067,d);
 float light=max(0.,dot(normal,normalize(vec3(-.45,-.65,1.))));
 vColor=mix(color*(vec3(.65,.73,.73)+light*vec3(.44,.35,.23)),color,emission); vDepth=d;
}`;
const FRAGMENT = `#version 300 es
precision highp float;
in vec3 vColor; in float vDepth; out vec4 result;
void main(){ float fog=smoothstep(240.,2450.,vDepth); result=vec4(mix(vColor,vec3(.80,.83,.72),fog*.88),1.); }
`;
// Spatial batches keep distant and off-screen geometry out of the vertex pipeline.
function cityBatches(mesh) {
  const cells=new Map(),data=mesh.data;
  for(let i=0;i<data.length;i+=30) {
    const xs=[data[i],data[i+10],data[i+20]],ys=[data[i+1],data[i+11],data[i+21]];
    const broad=Math.max(...xs)-Math.min(...xs)>480||Math.max(...ys)-Math.min(...ys)>480;
    const x=Math.floor((xs[0]+xs[1]+xs[2])/1440),y=Math.floor((ys[0]+ys[1]+ys[2])/1440),key=broad?'ground':x+','+y;
    if(!cells.has(key))cells.set(key,{x:x*480+240,y:y*480+240,broad,data:[]});
    const cell=cells.get(key);for(let j=0;j<30;j++)cell.data.push(data[i+j]);
  }
  return [...cells.values()];
}
export function createPerspectiveRenderer(p) {
  const surface = document.createElement('canvas'); surface.width = 768; surface.height = 480;
  const gl = surface.getContext('webgl2', { alpha: true, antialias: new URLSearchParams(location.search).has('shot'), preserveDrawingBuffer: false });
  if (!gl) return null;
  const skySurface=document.createElement('canvas');skySurface.width=1280;skySurface.height=800;
  const skyPainter=createPainter(skySurface);
  for(const [layer,z] of [[skySurface,0],[surface,1]]) { Object.assign(layer.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'none',zIndex:String(z)}); layer.setAttribute('aria-hidden','true'); }
  p.ctx.canvas.before(skySurface,surface);
  function setVisible(show) { surface.style.display=skySurface.style.display=show?'block':'none'; }
  function compile(type, source) { const s = gl.createShader(type); gl.shaderSource(s, source); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
  const program = gl.createProgram(); gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX)); gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT)); gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  gl.useProgram(program); gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
  const uniforms = Object.fromEntries(['eye','forward','right','up','shift'].map(k => [k, gl.getUniformLocation(program, k)]));
  const attributes = ['position','normal','color','emission'].map(k => gl.getAttribLocation(program,k));
  const actorBuffer = gl.createBuffer(), batches=[]; let camera;
  function upload(buffer, mesh, usage) { gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.data), usage); return mesh.data.length / 10; }
  function drawBuffer(buffer, length) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    attributes.forEach((a, i) => { gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, i === 3 ? 1 : 3, gl.FLOAT, false, 40, i * 12); });
    gl.drawArrays(gl.TRIANGLES, 0, length);
  }
  function sky(state) {
    const { ctx } = skyPainter, g = ctx.createLinearGradient(0, 0, 0, 610);
    g.addColorStop(0, '#459ab7'); g.addColorStop(.42, '#98cdbf'); g.addColorStop(.68, '#f9dfab'); g.addColorStop(1, '#f5d0a2'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1280, 800);
    const sun = state.screen === 'title' ? {x:1080,y:147,d:1000} : projectPerspective(camera, camera.eye[0] - 1900, camera.eye[1] - 10000, camera.eye[2] + 1700);
    if (sun.d > 0) { skyPainter.glow(sun.x, sun.y, 170, '#ffe2a2', .32); skyPainter.circle(sun.x, sun.y, 40, '#fff0b9'); skyPainter.circle(sun.x, sun.y, 36, '#fff1bd'); }
    ctx.fillStyle = '#fff4cc42';
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(160 + i * 225, 100 + (i % 3) * 42, 130 + i * 11, 3 + i % 3, -.03, 0, Math.PI * 2); ctx.fill(); }
    const haze = ctx.createLinearGradient(0, 275, 0, 450); haze.addColorStop(0, '#ffebc000'); haze.addColorStop(1, '#ffebc065'); ctx.fillStyle = haze; ctx.fillRect(0, 275, 1280, 175);
  }
  function labels(state) {
    const { ctx } = p;
    for (const b of state.city.buildings) {
      const q = projectPerspective(camera, b.x - 1, b.y + b.d * .45, 21);
      if (q.d < 100 || q.d > 650 || q.x < 10 || q.x > 1250 || q.y < 220 || q.y > 600) continue;
      const name = Math.hypot(b.x - 427, b.y - 3100) < 250 ? 'GHOST CUSTOMS' : b.sign;
      const size = b.id === 99 ? 17 : Math.max(9, Math.min(16, 1700 / q.d)), w = name.length * size * .65 + 12;
      ctx.fillStyle = '#143e4de8'; ctx.fillRect(q.x - w / 2, q.y - size, w, size + 6); p.text(name, q.x, q.y, size, b.neon, '800', 'center');
    }
    for (const a of state.peds) if ((a.enemy || a.police) && a.hp > 0) {
      const q = projectPerspective(camera, a.x, a.y, 45); if (q.d < 50 || q.d > 450 || q.x < 10 || q.x > 1270) continue;
      const w = a.enemy ? 85 : 43; ctx.fillStyle = '#153f4ee0'; ctx.fillRect(q.x - w / 2, q.y - 14, w, 17); p.text(a.enemy ? 'VOSS SECURITY' : 'CBPD', q.x, q.y - 2, 9, a.enemy ? '#ffba9b' : '#c1e9ef', '800', 'center');
      ctx.fillStyle = a.enemy ? '#fa9b7f' : '#9be0e4'; ctx.fillRect(q.x - 21, q.y + 6, 42 * Math.min(1, a.hp / 100), 2);
    }
    if (state.helicopter && state.heat >= 3) {
      const h = state.helicopter, q = projectPerspective(camera, h.x, h.y, h.z + 34);
      if (q.d > 30 && q.x > 0 && q.x < 1280) { ctx.fillStyle = '#153e4cdd'; ctx.fillRect(q.x - 65, q.y - 13, 130, 17); p.text('AIR 01  /  TRACKING', q.x, q.y - 1, 10, '#fff0cb', '800', 'center'); }
    }
    const target = missionTarget(state);
    if (target) {
      const q = projectPerspective(camera, target.x, target.y, 48);
      if (q.d > 40 && q.x > 300 && q.x < 995 && q.y > 180 && q.y < 630) {
        p.text('◆', q.x, q.y, 35, '#ffce7c', '900', 'center'); p.text(Math.round(distance(state.player, target)) + ' m', q.x, q.y + 21, 12, '#fff0cc', '800', 'center');
      }
    }
    if (!state.player.car && state.screen === 'play' && !state.mapOpen && !state.garageOpen) {
      const a = state.pointer || { x: 640, y: 397 }; ctx.strokeStyle = '#fff7d8'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(a.x, a.y, 5, 0, Math.PI * 2); for (let i = -1; i <= 1; i += 2) { ctx.moveTo(a.x + i * 10, a.y); ctx.lineTo(a.x + i * 15, a.y); ctx.moveTo(a.x, a.y + i * 10); ctx.lineTo(a.x, a.y + i * 15); } ctx.stroke();
    }
  }
  return {
    setVisible,
    aim(x, y) { return camera ? aimPerspective(camera, x, y) : null; },
    draw(state) {
      const width = state.photograph ? 1280 : 768, height = width * .625;
      if(surface.width !== width){surface.width=width;surface.height=height;}
      p.ctx.clearRect(0,0,1280,800);
      camera = perspectiveCamera(state); sky(state);
      gl.viewport(0, 0, surface.width, surface.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); gl.useProgram(program);
      for (const k of ['eye','forward','right','up']) gl.uniform3fv(uniforms[k], camera[k]);
      gl.uniform1f(uniforms.shift, camera.shift);
      if (!batches.length) for (const cell of cityBatches(buildCityGeometry(state.city))) { const buffer=gl.createBuffer(),count=upload(buffer,cell,gl.STATIC_DRAW); batches.push({x:cell.x,y:cell.y,broad:cell.broad,buffer,count}); }
      for (const cell of batches) {
        const x=cell.x-camera.eye[0],y=cell.y-camera.eye[1],d=x*camera.forward[0]+y*camera.forward[1],side=x*camera.right[0]+y*camera.right[1];
        if(cell.broad||(d>-360&&d<2300&&Math.abs(side)<Math.max(0,d)*.76+360)) drawBuffer(cell.buffer,cell.count);
      }
      const actors = upload(actorBuffer, buildActorGeometry(state,camera), gl.STREAM_DRAW); drawBuffer(actorBuffer, actors);
      labels(state);
      const vignette = p.ctx.createRadialGradient(640, 360, 350, 640, 400, 850); vignette.addColorStop(0, '#123b4800'); vignette.addColorStop(1, '#123b4828'); p.ctx.fillStyle = vignette; p.ctx.fillRect(0, 0, 1280, 800);
    },
  };
}
