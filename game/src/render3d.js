import { limb, ellipsoid } from './mesh-primitives.js';
import { createGeometry3D } from './geometry3d.js';
import { createPerspectiveCamera } from './camera.js';
import { ROAD_CENTERS, PLACES } from './city.js';
import { VEHICLE_TYPES } from './vehicles.js';
import { missionTarget } from './missions.js';
import { clamp, hash } from './math.js';
import { drawCar3D, drawPerson3D, drawHelicopter3D } from './models3d.js';
// A clipped, depth-sorted polygon renderer. All geometry comes from the playable city.
export function createWorld3D(ctx) {
  const apiContext=ctx, geometry = createGeometry3D();
  let camera, staticMode=false, staticReady=false, faces = [], labels = [], fogCache = new Map();
  const colorRGB = color => { const h = color.replace('#', ''); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  function fog(color, depth) {
    if (!color.startsWith('#') || color.length !== 7) return color;
    const band = Math.floor(clamp((depth - 220) / 2600, 0, .87) * 24), key = color + band;
    if (fogCache.has(key)) return fogCache.get(key);
    const c = colorRGB(color), t = band / 24;
    const out = `rgb(${c.map((v, i) => Math.round(v * (1 - t) + [244, 199, 155][i] * t)).join(',')})`;
    fogCache.set(key, out); return out;
  }
  function face(vertices, color, bias = 0) {
    if (geometry) { geometry.polygon(vertices,color); return; }
    let poly = vertices.map(camera.cameraPoint);
    const near = 8, clipped = [];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length], ain = a[2] >= near, bin = b[2] >= near;
      if (ain) clipped.push(a);
      if (ain !== bin) { const t = (near - a[2]) / (b[2] - a[2]); clipped.push(a.map((v, j) => v + (b[j] - v) * t)); }
    }
    if (clipped.length < 3) return;
    const points = clipped.map(v => [640 + v[0] * 820 / v[2], 360 - v[1] * 820 / v[2]]);
    if (points.every(p => p[0] < -80) || points.every(p => p[0] > 1360) || points.every(p => p[1] < -100) || points.every(p => p[1] > 900)) return;
    const depth = clipped.reduce((s, p) => s + p[2], 0) / clipped.length;
    if (depth > 4200) return;
    if (geometry) geometry.polygon(vertices,color);
    else faces.push({ points, color: fog(color, depth), depth: depth + bias });
  }
  function rect(x, y, w, d, color, z = 0, bias = 0) { face([[x,y,z],[x+w,y,z],[x+w,y+d,z],[x,y+d,z]], color, bias); }
  function box(x, y, w, d, h, color, z = 0, angle = 0, roof = null) {
    const cs = Math.cos(angle), sn = Math.sin(angle);
    const v = (a, b, c) => [x + a * cs - b * sn, y + a * sn + b * cs, z + c];
    const a=v(-w/2,-d/2,0), b=v(w/2,-d/2,0), c=v(w/2,d/2,0), e=v(-w/2,d/2,0);
    const A=v(-w/2,-d/2,h), B=v(w/2,-d/2,h), C=v(w/2,d/2,h), E=v(-w/2,d/2,h);
    const rgb = colorRGB(color), shade = f => '#'+rgb.map(n=>Math.round(clamp(n*f,0,255)).toString(16).padStart(2,'0')).join('');
    face([a,b,B,A],shade(.84)); face([b,c,C,B],shade(.70)); face([c,e,E,C],shade(.97)); face([e,a,A,E],shade(1.10)); face([A,B,C,E],roof || shade(1.18));
  }
  function line(a, b, width, color) {
    const dx=b[0]-a[0], dy=b[1]-a[1], len=Math.hypot(dx,dy)||1, ox=-dy/len*width/2, oy=dx/len*width/2;
    face([[a[0]+ox,a[1]+oy,a[2]],[b[0]+ox,b[1]+oy,b[2]],[b[0]-ox,b[1]-oy,b[2]],[a[0]-ox,a[1]-oy,a[2]]],color,-.1);
  }
  function text3d(value, x,y,z,size,color='#fff3cf', bg=null) {
    const q=camera.project(x,y,z);
    if(q.depth>20 && q.depth<2100 && q.x>-200 && q.x<1480 && q.y>0 && q.y<800) labels.push({value,q,size:clamp(size*q.scale,8,45),color,bg});
  }
  const api = { face, rect, box, line, text3d, project:(...a)=>camera.project(...a) };
  function sky(state) {
    const ctx=geometry?.skyContext || apiContext;
    const g=ctx.createLinearGradient(0,0,0,620); g.addColorStop(0,'#4bafc9'); g.addColorStop(.42,'#a5d1d0'); g.addColorStop(.66,'#ffd69d'); g.addColorStop(1,'#eaa07b'); ctx.fillStyle=g; ctx.fillRect(0,0,1280,800);
    const sunX=state.screen==='title'?820:540, sunY=174;
    const glow=ctx.createRadialGradient(sunX,sunY,12,sunX,sunY,230); glow.addColorStop(0,'#fff7cfa0');glow.addColorStop(.3,'#ffe7ad50');glow.addColorStop(1,'#ffe5b000');ctx.fillStyle=glow;ctx.fillRect(0,0,1280,480);
    ctx.fillStyle='#fff1c4';ctx.beginPath();ctx.arc(sunX,sunY,36,0,Math.PI*2);ctx.fill();
    // Long, warm cirrus bands keep the horizon open and bright.
    ctx.fillStyle='#fff1da52';for(let i=0;i<9;i++){ctx.beginPath();ctx.ellipse((i*271+80)%1400,92+(i%4)*37,100+i*6,3+(i%3)*2,-.04,0,Math.PI*2);ctx.fill();}
    ctx.fillStyle='#6eafae'; ctx.fillRect(0,278,1280,522);
    const sea=ctx.createLinearGradient(0,280,0,800);sea.addColorStop(0,'#8bbdb8');sea.addColorStop(.45,'#3dafa9');sea.addColorStop(1,'#167c88');ctx.fillStyle=sea;ctx.fillRect(0,285,1280,515);
    ctx.fillStyle='#ffe5a95a';for(let i=0;i<32;i++){const y=310+i*i*.37;ctx.fillRect(175-i*5+Math.sin(i*3)*30,y,100+i*9,1+i*.065);}
  }
  function ground(state) {
    // Tiled ground avoids painter ordering artifacts where a street crosses a block.
    for(let x=190;x<4000;x+=120)for(let y=190;y<4000;y+=120){
      const q=camera.project(x+60,y+60);if(!staticMode&&(q.depth<-150||q.depth>3500))continue;
      rect(x,y,120,120,'#b8b79a',0,6);
    }
    for(const r of ROAD_CENTERS){
      for(let a=190;a<4000;a+=60){
        rect(r-90,a,180,60,'#e4cfac',.12);rect(a,r-90,60,180,'#e4cfac',.12);
        rect(r-75,a,150,60,'#56646a',.3,-.2);rect(a,r-75,60,150,'#56646a',.3,-.2);
        rect(r-2,a,1,60,'#e6bd76',.5,-.5);rect(r+2,a,1,60,'#e6bd76',.5,-.5);
        rect(a,r-2,60,1,'#e6bd76',.5,-.5);rect(a,r+2,60,1,'#e6bd76',.5,-.5);
        if(a%120===10){rect(r-39,a,1.2,24,'#d7d4ba',.6,-1);rect(r+38,a,1.2,24,'#d7d4ba',.6,-1);rect(a,r-39,24,1.2,'#d7d4ba',.6,-1);rect(a,r+38,24,1.2,'#d7d4ba',.6,-1);}
      }
    }
    for(const x of ROAD_CENTERS)for(const y of ROAD_CENTERS){
      rect(x-75,y-75,150,150,'#56646a',.8,-2);
      for(let i=-5;i<=5;i++){
        rect(x+i*11-3,y-69,6,18,'#e9dfc6',1,-3);rect(x+i*11-3,y+52,6,18,'#e9dfc6',1,-3);
        rect(x-69,y+i*11-3,18,6,'#e9dfc6',1,-3);rect(x+52,y+i*11-3,18,6,'#e9dfc6',1,-3);
      }
    }
    // Promenade, seawall and the palm-lined edge of the same west-coast road.
    for(let y=190;y<4000;y+=60){rect(162,y,80,60,'#e9d7b4',.6);box(163,y+30,5,60,8,'#e6c99e');box(173,y,2,2,18,'#faf1d1');line([173,y,18],[173,y+60,18],1.6,'#eff1d6');}
    for(const [x,y] of [[-80,1550],[15,1990],[-220,2290]]){
      ellipsoid(api,x,y,2,9,26,7,'#e3e3cc',10,5);box(x,y,1,1,64,'#d2cfb4',5);
      face([[x,y,66],[x,y+23,12],[x,y,12]],'#fff0cd');face([[x,y-2,63],[x,y-23,12],[x,y-2,12]],'#ebd3aa');
    }
    for(const park of state.city.parks){rect(park.x,park.y,park.w,park.d,'#82a77c',1);rect(park.x+65,park.y+65,150,150,'#dfd1b0',1.1);for(let i=0;i<6;i++){rect(park.x+65+i*25,park.y+65,.6,150,'#c9bea1',1.15);rect(park.x+65,park.y+65+i*25,150,.6,'#c9bea1',1.15);}rect(park.x+125,park.y,18,park.d,'#e5c9a4',1.3);box(park.x+140,park.y+140,68,68,8,'#d9d2ae');rect(park.x+112,park.y+112,56,56,'#61bdbb',9);box(park.x+140,park.y+140,8,8,8,'#e2d0a8',9);box(park.x+140,park.y+140,1,1,20,'#c0e6cf',17);}

  }
  function building(b) {
    const q=camera.project(b.x+b.w/2,b.y+b.d/2,0); if(!staticMode&&(q.depth<-200||q.depth>3700))return;
    const h=b.h;
    // The long afternoon shadow is actual ground geometry.
    face([[b.x,b.y,1.6],[b.x+b.w,b.y,1.6],[b.x+b.w+ h*.65,b.y+h*.4,1.6],[b.x+h*.65,b.y+b.d+h*.4,1.6],[b.x,b.y+b.d,1.6]],'#000001',1);
    box(b.x+b.w/2,b.y+b.d/2,b.w,b.d,h,b.color,0,0,b.roof);
    box(b.x+b.w/2,b.y+b.d/2,b.w+5,b.d+5,4,'#ead5b2',h);
    if(b.sign==='GHOST CUSTOMS'){
      for(let i=0;i<2;i++){const x=b.x+12+i*55,y=b.y+b.d+.5;face([[x,y,0],[x+43,y,0],[x+43,y,29],[x,y,29]],'#244f58');for(let z=3;z<29;z+=4)face([[x,y+.1,z],[x+43,y+.1,z],[x+43,y+.1,z+.7],[x,y+.1,z+.7]],'#628a8a');}
      box(b.x+b.w/2,b.y+b.d+1,b.w,2,10,'#214e58',31);
    }
    if(staticMode||q.depth<1400){
      const space=24, rows=Math.floor((h-18)/space);
      for(let f=0;f<rows;f++)for(let u=12;u<b.w-10;u+=26){const z=19+f*space, col=hash(b.id*117+u,f*27)>.57?'#fbe2a1':'#668e98';
        face([[b.x+u,b.y-.25,z],[b.x+u+13,b.y-.25,z],[b.x+u+13,b.y-.25,z+12],[b.x+u,b.y-.25,z+12]],col,-1);
        face([[b.x+u,b.y+b.d+.25,z],[b.x+u+13,b.y+b.d+.25,z],[b.x+u+13,b.y+b.d+.25,z+12],[b.x+u,b.y+b.d+.25,z+12]],col,-1);
      }
      for(let f=0;f<rows;f++)for(let u=12;u<b.d-10;u+=27){const z=19+f*space,col=(f+Math.floor(u/27))%3?'#6a949b':'#f5dca0';
        for(const x of [b.x-.3,b.x+b.w+.3])face([[x,b.y+u,z],[x,b.y+u+13,z],[x,b.y+u+13,z+12],[x,b.y+u,z+12]],col,-1);
      }
      if(h>90){box(b.x+b.w*.4,b.y+b.d*.6,22,35,12,'#a4bab1',h+4);box(b.x+b.w*.7,b.y+b.d*.4,18,18,9,'#8ba5a5',h+4);}
      if(staticMode||q.depth<1050){
        box(b.x+b.w/2,b.y-3,b.w*.85,4,17,'#28576a',12);

        for(let i=0;i<b.w/22;i++)box(b.x+i*22+11,b.y-8,21,18,2,i%2?'#f4d6a2':b.neon,10);
      }
    }
  }
  function palm(t, index, state) {
    const q=camera.project(t.x,t.y);if(!staticMode&&(q.depth<0||q.depth>2300))return;
    const h=t.park?68:72+(index%4)*6;
    limb(api,[t.x,t.y,0],[t.x+3,t.y,h],2.5,'#b99c72',7,1.4);
    for(let k=0;k<10;k++){
      const a=k*Math.PI/5+index,dx=Math.cos(a),dy=Math.sin(a),x=t.x+3,y=t.y;
      const mid=[x+dx*14,y+dy*14,h+4],tip=[x+dx*30,y+dy*30,h-12];
      const col=k%2?'#4b8767':'#74a475';
      face([[x,y,h],[mid[0]-dy*3.4,mid[1]+dx*3.4,mid[2]],tip,[mid[0]+dy*2.7,mid[1]-dx*2.7,mid[2]-1]],col);
      line([x,y,h],mid,.55,'#9db07a');line(mid,tip,.3,'#7a9e6a');
    }
    line([t.x,t.y,1],[t.x-35,t.y+25,1],5,'#9fa58a');
  }
  function landmarks(state){
    for(const l of state.city.landmarks){const q=camera.project(l.x,l.y);if(!staticMode&&(q.depth<0||q.depth>2500))continue;
      if(l.type==='container')box(l.x,l.y,90,38,36,l.color);
      if(l.type==='crane'){for(const dx of [-30,30])box(l.x+dx,l.y,6,6,220,'#dba760');box(l.x,l.y,8,90,7,'#e8ba6d',215);box(l.x+100,l.y,280,8,8,'#e9bb6b',225);line([l.x+220,l.y,225],[l.x+220,l.y,90],1.4,'#344e58');}
      if(l.type==='radio'){box(l.x,l.y,7,7,240,'#d7bf9a');for(let z=35;z<240;z+=40)box(l.x,l.y,40,3,2,'#eee3bc',z);}
    }
  }
  function draw(state) {
    const frameStarted=performance.now();
    camera=createPerspectiveCamera(state); faces=[];labels=[]; geometry?.begin(camera,!!state.photography); sky(state);
    if (!geometry || !staticReady) {
    staticMode=!!geometry; geometry?.beginStatic(); ground(state);
    for(const b of state.city.buildings)building(b);
    state.city.palms.forEach((t,i)=>palm(t,i,state));
    for(let y=300;y<3900;y+=130)palm({x:222,y},y,state);
    for(const lamp of state.city.lamps){const q=camera.project(lamp.x,lamp.y);if(!staticMode&&(q.depth<0||q.depth>1200))continue;box(lamp.x,lamp.y,1.4,1.4,67,'#58696a');box(lamp.x-6,lamp.y,15,4,2,'#fff2b7',67);}
    for(const prop of state.city.props)if(prop.type==='signal'){const q=camera.project(prop.x,prop.y);if(!staticMode&&(q.depth<0||q.depth>1200))continue;box(prop.x,prop.y,2,2,48,'#546b68');box(prop.x,prop.y,5,4,13,'#344f55',42);box(prop.x,prop.y-2.2,2.5,.5,3,'#8de2bc',45);}
    landmarks(state);
    geometry?.endStatic(); staticMode=false; staticReady=true;
    }
    for(const b of state.city.buildings){const q=camera.project(b.x+b.w/2,b.y+b.d/2);if(q.depth>60&&q.depth<730&&q.x>-50&&q.x<1330)text3d(b.sign,b.x+b.w/2,camera.y>b.y+b.d/2?b.y+b.d+2:b.y-2,35,7,b.neon,'#153e50');}
    for(const s of state.effects.skids){const vx=Math.cos(s.angle),vy=Math.sin(s.angle);for(const side of [-11,11])line([s.x-vy*side,s.y+vx*side,1.3],[s.x-vy*side-vx*16,s.y+vx*side-vy*16,1.3],2,'#344950');}
    for(const car of state.cars){const q=camera.project(car.x,car.y);if(q.depth>0&&q.depth<2500&&q.x>-240&&q.x<1520&&q.y>-200&&q.y<1000)drawCar3D(api,car,state);}
    for(const ped of state.peds){const q=camera.project(ped.x,ped.y);if(q.depth>0&&q.depth<1250&&q.x>-120&&q.x<1400&&q.y>-150&&q.y<950)drawPerson3D(api,ped,state,false);}
    if(!state.player.car)drawPerson3D(api,state.player,state,true);
    if(state.heat>=3)drawHelicopter3D(api,state);
    for(const block of state.roadblocks)for(let i=-1;i<=1;i++)box(block.x+i*45,block.y+150,30,8,13,'#e5bb73');
    const target=state.screen==='title'?null:missionTarget(state);
    if(target){const d=Math.hypot(state.player.x-target.x,state.player.y-target.y),q=camera.project(target.x,target.y,30);if(q.depth>80){if(d>250)box(target.x,target.y,4,4,75,'#ffe29b');text3d('◆  '+Math.round(d)+' m',target.x,target.y,d>250?88:24,d>250?6:3,'#ffe1a0','#1a424e');}}
    for(const item of state.pickups){const q=camera.project(item.x,item.y);if(q.depth>0&&q.depth<650){box(item.x,item.y,8,5,3,'#508977',1,Math.PI/4);box(item.x,item.y,3,6,1,'#b7e7be',4,Math.PI/4);text3d(item.kind==='cash'?'$'+item.value:'+'+item.value+' AMMO',item.x,item.y,16,3,'#a4ffcf','#234f4d');}}
    for(const b of state.bullets)line([b.x,b.y,23],[b.x-Math.cos(b.angle)*42,b.y-Math.sin(b.angle)*42,23],.75,'#fff3ae');
    for(const pt of state.effects.particles){const q=camera.project(pt.x,pt.y,pt.z);if(q.depth>10&&q.depth<1400)box(pt.x,pt.y,pt.size,pt.size,pt.size,pt.color.length===7?pt.color:'#ffe1a1',pt.z);}
    state.renderStats=geometry?.finish(ctx);
    faces.sort((a,b)=>b.depth-a.depth);
    for(const f of faces){ctx.beginPath();f.points.forEach((v,i)=>i?ctx.lineTo(...v):ctx.moveTo(...v));ctx.closePath();ctx.fillStyle=f.color;ctx.fill();}
    for(const l of labels){ctx.font=`800 ${l.size}px Arial`;ctx.textAlign='center';if(l.bg){const w=ctx.measureText(l.value).width+12;ctx.fillStyle=l.bg;ctx.fillRect(l.q.x-w/2,l.q.y-l.size,w,l.size*1.35);}ctx.fillStyle=l.color;ctx.fillText(l.value,l.q.x,l.q.y);}
    const light=ctx.createLinearGradient(0,0,1280,800);light.addColorStop(0,'#ffd9a016');light.addColorStop(.5,'#f7ca8e00');light.addColorStop(1,'#16485710');ctx.fillStyle=light;ctx.fillRect(0,0,1280,800);
    if(state.renderStats)state.renderStats.cpuMs=performance.now()-frameStarted;
    return camera;
  }
  return {draw,setVisible:visible=>geometry?.setVisible(visible),unproject:(x,y)=>camera?.unproject(x,y)};
}
